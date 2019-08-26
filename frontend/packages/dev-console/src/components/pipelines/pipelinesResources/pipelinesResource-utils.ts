import * as _ from 'lodash';
import { k8sCreate, K8sResourceKind } from '@console/internal/module/k8s';
import { PipelineResourceModel } from '../../../models';

// TODO add interface amd check for values

const getRandomChars = (digit = 6): string => {
  return Math.random()
    .toString(36)
    .replace(/[^a-z0-9]+/g, '')
    .substr(1, digit);
};
export const createPipelinesResource = (
  values: any,
  namespace: string,
): Promise<K8sResourceKind> => {
  const resourceName = `${values.type}-${getRandomChars(6)}`;
  const pipelineResource: K8sResourceKind = {
    apiVersion: 'tekton.dev/v1alpha1',
    kind: 'PipelineResource',
    metadata: {
      name: resourceName,
      namespace,
    },
    spec: {
      type: values.type,
      params: _.map(values.param, (value, name) => ({ name, value })),
    },
  };

  return k8sCreate(PipelineResourceModel, pipelineResource);
};
