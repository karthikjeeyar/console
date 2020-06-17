import * as _ from 'lodash';
import { Node } from '@console/topology';
import { ServiceModel, addEventSource, addSubscription } from '@console/knative-plugin';
import { getDynamicChannelModelRefs } from '@console/knative-plugin/src/utils/fetch-dynamic-eventsources-utils';
import { referenceForModel } from '@console/internal/module/k8s';
import { addResourceMenu, addResourceMenuWithoutCatalog } from '../../../actions/add-resources';
import { GraphData } from '../topology-types';

export const graphActions = (graphData: GraphData, connectorSource?: Node) => {
  let resourceMenu = connectorSource ? addResourceMenuWithoutCatalog : addResourceMenu;
  const isKnativeService =
    connectorSource?.getData()?.data?.kind === referenceForModel(ServiceModel);
  if (isKnativeService && graphData.eventSourceEnabled) {
    resourceMenu = [...addResourceMenuWithoutCatalog, addEventSource];
  }
  if (getDynamicChannelModelRefs().includes(connectorSource?.getData()?.data?.kind)) {
    resourceMenu = [addSubscription];
  }
  return _.reduce(
    resourceMenu,
    (menuItems, menuItem) => {
      const item = menuItem(
        null,
        graphData.namespace,
        false,
        connectorSource?.getData()?.resources?.obj,
        graphData.createResourceAccess,
      );
      if (item) {
        menuItems.push(item);
      }
      return menuItems;
    },
    [],
  );
};
