import * as _ from 'lodash';
import { K8sResourceKind, apiVersionForModel, K8sKind } from '@console/internal/module/k8s';
import {
  TransformResourceData,
  OverviewItem,
  isKnativeServing,
  getResourcePausedAlert,
  getBuildAlerts,
  getOwnedResources,
} from '@console/shared';
import { getImageForIconClass } from '@console/internal/components/catalog/catalog-item-icon';
import {
  Node,
  Edge,
  Group,
  TopologyDataResources,
  TopologyDataModel,
  TopologyDataObject,
} from '@console/dev-console/src/components/topology/topology-types';
import {
  getEditURL,
  getTopologyGroupItems,
  getRoutesUrl,
} from '@console/dev-console/src/components/topology/topology-utils';
import {
  ServiceModel as KnServiceModel,
  RevisionModel,
  EventSourceCronJobModel,
} from '@console/knative-plugin';
import { DeploymentModel } from '@console/internal/models';
import { KnativeItem } from './get-knative-resources';

export enum nodeType {
  EventSource = 'eventsource',
  KnService = 'knservice',
  Revision = 'revision',
}

/**
 * Forms data with respective revisions, configurations, routes based on kntaive service
 */
export const getKnativeServiceData = (
  resource: K8sResourceKind,
  resources: TopologyDataResources,
): KnativeItem => {
  const configurations = getOwnedResources(resource, resources.configurations.data);
  const ksroutes = getOwnedResources(resource, resources.ksroutes.data);
  const revisions = getOwnedResources(configurations[0], resources.revisions.data);
  const knativedata = { configurations, revisions, ksroutes };
  return knativedata;
};

/**
 * Rollup data for deployments for revisions/ event sources
 */
const createKnativeDeploymentItems = (
  resource: K8sResourceKind,
  resources: TopologyDataResources,
  ResModel: K8sKind,
  utils?: Function[],
): OverviewItem => {
  const obj: K8sResourceKind = {
    ...resource,
    apiVersion: apiVersionForModel(ResModel),
    kind: ResModel.kind,
  };
  const transformResourceData = new TransformResourceData(resources, utils);
  const associatedDeployment = getOwnedResources(resource, resources.deployments.data);
  const depRes =
    associatedDeployment && associatedDeployment.length ? associatedDeployment[0] : resource;
  const depObj: K8sResourceKind = {
    ...depRes,
    apiVersion: apiVersionForModel(DeploymentModel),
    kind: DeploymentModel.kind,
  };
  const replicaSets = transformResourceData.getReplicaSetsForResource(depObj);
  const [current, previous] = replicaSets;
  const isRollingOut = !!current && !!previous;
  const buildConfigs = transformResourceData.getBuildConfigsForResource(depObj);
  const services = transformResourceData.getServicesForResource(depObj);
  const routes = transformResourceData.getRoutesForServices(services);
  const alerts = {
    ...getResourcePausedAlert(depObj),
    ...getBuildAlerts(buildConfigs),
  };
  const overviewItems = {
    obj,
    alerts,
    buildConfigs,
    current,
    isRollingOut,
    previous,
    pods: [..._.get(current, 'pods', []), ..._.get(previous, 'pods', [])],
    routes,
    services,
  };

  if (utils) {
    return utils.reduce((acc, element) => {
      return { ...acc, ...element(depObj, resources) };
    }, overviewItems);
  }
  return overviewItems;
};

/**
 * create all data that need to be shown on a topology data
 */
export const createTopologyRevNodeData = (
  dc: OverviewItem,
  cheURL?: string,
  type?: string,
): TopologyDataObject => {
  const { obj: deploymentConfig, current, previous, isRollingOut, buildConfigs } = dc;
  const dcUID = _.get(deploymentConfig, 'metadata.uid');
  const deploymentsLabels = _.get(deploymentConfig, 'metadata.labels', {});
  const deploymentsAnnotations = _.get(deploymentConfig, 'metadata.annotations', {});
  return {
    id: dcUID,
    name:
      _.get(deploymentConfig, 'metadata.name') || deploymentsLabels['app.kubernetes.io/instance'],
    type: type || 'workload',
    resources: { ...dc },
    pods: dc.pods,
    data: {
      url: getRoutesUrl(dc.routes, _.get(dc, ['ksroutes'])),
      kind: deploymentConfig.kind,
      editUrl:
        deploymentsAnnotations['app.openshift.io/edit-url'] ||
        getEditURL(deploymentsAnnotations['app.openshift.io/vcs-uri'], cheURL),
      builderImage:
        getImageForIconClass(`icon-${deploymentsLabels['app.openshift.io/runtime']}`) ||
        getImageForIconClass(`icon-${deploymentsLabels['app.kubernetes.io/name']}`) ||
        getImageForIconClass(`icon-openshift`),
      isKnativeResource: isKnativeServing(deploymentConfig, 'metadata.labels'),
      build: _.get(buildConfigs[0], 'builds[0]'),
      donutStatus: {
        pods: dc.pods,
        current,
        previous,
        isRollingOut,
        dc: deploymentConfig,
      },
    },
  };
};

/**
 * Form Node data for revisions/event/service sources
 */
export const getKnativeTopologyNodeItem = (
  resource: K8sResourceKind,
  type: string,
  resources?: TopologyDataResources,
): Node => {
  const uid = _.get(resource, ['metadata', 'uid']);
  const name = _.get(resource, ['metadata', 'name']);
  const label = _.get(resource, ['metadata', 'labels', 'app.openshift.io/instance']);
  const children = [];
  if (type === 'knservice' && resources && resources.configurations) {
    const configurations = getOwnedResources(resource, resources.configurations.data);
    const configUidData = _.get(configurations[0], ['metadata', 'uid']);
    const ChildData = _.filter(resources.revisions.data, {
      metadata: { ownerReferences: [{ uid: configUidData }] },
    });
    _.forEach(ChildData, (c) => {
      children.push(_.get(c, ['metadata', 'uid']));
    });
  }
  return {
    id: uid,
    type,
    name: label || name,
    ...(children.length && { children }),
  };
};

/**
 * Form Edge data for event sources
 */
export const getEventTopologyEdgeItems = (resource: K8sResourceKind, { data }): Edge[] => {
  const uid = _.get(resource, ['metadata', 'uid']);
  const sinkSvc = _.get(resource, ['spec', 'sink'], {});
  const edges = [];
  if (sinkSvc.kind === 'Service') {
    _.forEach(data, (res) => {
      const resname = _.get(res, ['metadata', 'name']);
      const resUid = _.get(res, ['metadata', 'uid']);
      if (resname === sinkSvc.name) {
        edges.push({
          id: `${uid}_${resUid}`,
          type: 'connects-to-src',
          source: uid,
          target: resUid,
        });
      }
    });
  }
  return edges;
};

/**
 * Form Edge data for service sources with traffic data
 */
export const getTrafficTopologyEdgeItems = (resource: K8sResourceKind, { data }): Edge[] => {
  const uid = _.get(resource, ['metadata', 'uid']);
  const trafficSvc = _.get(resource, ['status', 'traffic'], []);
  const edges = [];
  _.forEach(trafficSvc, (res) => {
    const resname = _.get(res, ['revisionName']);
    const trafficPercent = _.get(res, ['percent']);
    const revisionObj = _.find(data, (rev) => {
      const revname = _.get(rev, ['metadata', 'name']);
      return revname === resname;
    });
    const resUid = _.get(revisionObj, ['metadata', 'uid'], null);
    if (resUid) {
      edges.push({
        id: `${uid}_${resUid}`,
        type: 'connects-to-traffic',
        source: uid,
        target: resUid,
        data: { percent: trafficPercent },
      });
    }
  });
  return edges;
};

/**
 * Form topology data for knative
 */
const createTopologyKnativeData = (configData: OverviewItem, type: string, cheURL?: string) => {
  const { obj: config } = configData;
  const uid = _.get(config, 'metadata.uid');
  const deploymentsLabels = _.get(config, 'metadata.labels', {});
  const deploymentsAnnotations = _.get(config, 'metadata.annotations', {});
  return {
    id: uid,
    name: _.get(config, 'metadata.name') || deploymentsLabels['app.kubernetes.io/instance'],
    type,
    resources: { ...configData },
    data: {
      kind: config.kind,
      editUrl:
        deploymentsAnnotations['app.openshift.io/edit-url'] ||
        getEditURL(deploymentsAnnotations['app.openshift.io/vcs-uri'], cheURL),
      builderImage:
        getImageForIconClass(`icon-${deploymentsLabels['app.openshift.io/runtime']}`) ||
        getImageForIconClass(`icon-${deploymentsLabels['app.kubernetes.io/name']}`) ||
        getImageForIconClass(`icon-openshift`),
      isKnativeResource: isKnativeServing(config, 'metadata.labels'),
    },
  };
};

/**
 * Form Group data for service sources
 */
export const getTopologyServiceGroupItems = (
  resource: K8sResourceKind,
  groups: Group[],
): Group[] => {
  const labels = _.get(resource, ['spec', 'template', 'metadata', 'labels'], []);
  const uid = _.get(resource, ['metadata', 'uid']);
  _.forEach(labels, (label, key) => {
    if (key !== 'app.kubernetes.io/part-of') {
      return;
    }
    // find and add the groups
    const groupExists = _.some(groups, {
      name: label,
    });
    if (!groupExists) {
      groups.push({
        id: `group:${label}`,
        name: label,
        nodes: [uid],
      });
    } else {
      const gIndex = _.findIndex(groups, { name: label });
      groups[gIndex].nodes.push(uid);
    }
  });
  return groups;
};

/**
 * Filter Knative resources based on part-of label
 */
export const filterKnativeBasedOnActiveApplication = (
  data: K8sResourceKind[],
  application: string,
): K8sResourceKind[] => {
  const PART_OF = 'app.kubernetes.io/part-of';
  if (!application) {
    return data;
  }
  return data.filter((d) => {
    return (
      _.get(d, ['metadata', 'labels', PART_OF]) === application ||
      _.get(d, ['spec', 'template', 'metadata', 'labels', PART_OF]) === application
    );
  });
};

let groupsData = [];
export const tranformKnNodeData = (
  knResourcesData: K8sResourceKind[],
  type: string,
  topologyGraphAndNodeData: TopologyDataModel,
  resources: TopologyDataResources,
  utils?: Function[],
  cheURL?: string,
  application?: string,
) => {
  let nodesData = [];
  let edgesData = [];
  const dataToShowOnNodes = {};
  const resourceData = filterKnativeBasedOnActiveApplication(knResourcesData, application);
  _.forEach(resourceData, (res) => {
    const uid = _.get(res, ['metadata', 'uid']);
    if (!_.some(topologyGraphAndNodeData.graph.nodes, { id: uid })) {
      nodesData = [...nodesData, getKnativeTopologyNodeItem(res, type, resources)];
      switch (type) {
        case nodeType.EventSource: {
          const item = createKnativeDeploymentItems(res, resources, EventSourceCronJobModel, utils);
          const { obj: knServiceData } = item;
          const uidRes = _.get(knServiceData, ['metadata', 'uid']);
          dataToShowOnNodes[uidRes] = createTopologyKnativeData(item, type, cheURL);
          edgesData = [...edgesData, ...getEventTopologyEdgeItems(res, resources.ksservices)];
          groupsData = [...getTopologyGroupItems(res, topologyGraphAndNodeData.graph.groups)];
          break;
        }
        case nodeType.Revision: {
          const item = createKnativeDeploymentItems(res, resources, RevisionModel, utils);
          const { obj: knServiceData } = item;
          const uidRes = _.get(knServiceData, ['metadata', 'uid']);
          dataToShowOnNodes[uidRes] = createTopologyRevNodeData(item, cheURL, type);
          groupsData = [...getTopologyGroupItems(res, topologyGraphAndNodeData.graph.groups)];
          break;
        }
        case nodeType.KnService: {
          const item = createKnativeDeploymentItems(res, resources, KnServiceModel);
          const { obj: knServiceData } = item;
          const uidRes = _.get(knServiceData, ['metadata', 'uid']);
          dataToShowOnNodes[uidRes] = createTopologyKnativeData(item, type, cheURL);
          edgesData = [...edgesData, ...getTrafficTopologyEdgeItems(res, resources.revisions)];
          groupsData = [
            ...getTopologyServiceGroupItems(res, topologyGraphAndNodeData.graph.groups),
          ];
          break;
        }
        default:
          break;
      }
    }
  });

  return { nodesData, edgesData, dataToShowOnNodes, groupsData };
};
