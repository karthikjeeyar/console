import * as React from 'react';
import * as _ from 'lodash';
import { DeploymentConfigModel, DeploymentModel } from '@console/internal/models';
import {
  K8sResourceKind,
  K8sKind,
  SelfSubjectAccessReviewKind,
} from '@console/internal/module/k8s';
import { PodRCData, PodRingResources, PodRingData, ExtPodKind } from '../types';
import { TransformResourceData } from './resource-utils';
import { checkPodEditAccess } from './pod-utils';

type PodRingLabelType = {
  subTitle: string;
  title: string;
};

const applyPods = (podsData: PodRingData, dc: PodRCData) => {
  const {
    pods,
    current,
    previous,
    isRollingOut,
    obj: {
      metadata: { uid },
    },
  } = dc;
  podsData[uid] = {
    pods,
    current,
    previous,
    isRollingOut,
  };
  return podsData;
};

export const podRingLabel = (obj: K8sResourceKind, canScale: boolean): PodRingLabelType => {
  const {
    spec: { replicas },
    status: { availableReplicas },
  } = obj;

  const pluralize = replicas > 1 || replicas === 0 ? 'pods' : 'pod';
  const knativeSubtitle = canScale ? '' : 'to 0';
  const scalingSubtitle = !replicas ? knativeSubtitle : `scaling to ${replicas}`;

  return {
    title: availableReplicas || (canScale ? 'Scaled to 0' : 'Autoscaled'),
    subTitle: replicas !== availableReplicas ? scalingSubtitle : pluralize,
  };
};

export const usePodScalingAccessStatus = (
  obj: K8sResourceKind,
  resourceKind: K8sKind,
  pods: ExtPodKind[],
  enableScaling?: boolean,
  impersonate?,
) => {
  const [editable, setEditable] = React.useState(false);
  React.useEffect(() => {
    checkPodEditAccess(obj, resourceKind, impersonate)
      .then((resp: SelfSubjectAccessReviewKind) => setEditable(resp.status.allowed))
      .catch((error) => {
        throw error;
      });
  }, [pods, obj, resourceKind, impersonate]);

  const isKnativeRevision = obj.kind === 'Revision';
  const isScalingAllowed = !isKnativeRevision && editable && enableScaling;
  return isScalingAllowed;
};

export const transformPodRingData = (resources: PodRingResources, kind: string): PodRingData => {
  const deploymentKinds = {
    [DeploymentModel.kind]: 'deployments',
    [DeploymentConfigModel.kind]: 'deploymentConfigs',
  };

  const targetDeployment = deploymentKinds[kind];
  const transformResourceData = new TransformResourceData(resources);

  if (!targetDeployment) {
    throw new Error(`Invalid target deployment resource: (${targetDeployment})`);
  }
  if (_.isEmpty(resources[targetDeployment].data)) {
    return {};
  }

  const podsData: PodRingData = {};
  const resourceData = resources[targetDeployment].data;

  if (kind === DeploymentConfigModel.kind) {
    return transformResourceData
      .getPodsForDeploymentConfigs(resourceData)
      .reduce(applyPods, podsData);
  }

  if (kind === DeploymentModel.kind) {
    return transformResourceData.getPodsForDeployments(resourceData).reduce(applyPods, podsData);
  }
  return podsData;
};
