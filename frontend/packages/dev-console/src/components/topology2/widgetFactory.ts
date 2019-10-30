import { ElementEntity, ModelKind, NodeEntity, WidgetFactory } from '@console/topology/src/types';
import { ComponentType } from 'react';
import { withPanZoom } from '@console/topology/src/behavior/usePanZoom';
import { withDragNode } from '@console/topology/src/behavior/useDragNode';
import { withTargetDrag } from '@console/topology/src/behavior/useReconnect';
import { withSelection } from '@console/topology/src/behavior/useSelection';
import { withDndDrop } from '@console/topology/src/behavior/useDndDrop';
import { withCreateConnector } from '@console/topology/src/behavior/withCreateConnector';
import { withRemoveConnector } from '@console/topology/src/behavior/withRemoveConnector';
import { withContextMenu } from '@console/topology/src/behavior/withContextMenu';
import GroupHullWidget from './widgets/GroupHullWidget';
import ConnectsToWidget from './widgets/ConnectsToWidget';
import EventSourceWidget from './widgets/EventSourceWidget';
import EventSourceLinkWidget from './widgets/EventSourceLinkWidget';
import WorkloadNodeWidget from './widgets/WorkloadNodeWidget';
import GraphWidget from './widgets/GraphWidget';
import { workloadContextMenu, groupContextMenu } from './nodeContextMenu';
import {
  graphWorkloadDropTargetSpec,
  nodeDragSourceSpec,
  nodeDropTargetSpec,
  groupWorkoadDropTargetSpec,
  edgeDragSourceSpec,
  createConnectorCallback,
  removeConnectorCallback,
} from './widgetUtils';
import './ContextMenu.scss';
import {
  TYPE_EVENT_SOURCE,
  TYPE_WORKLOAD,
  TYPE_CONNECTS_TO,
  TYPE_APPLICATION_GROUP,
  TYPE_EVENT_SOURCE_LINK,
  TYPE_KNATIVE_SERVICE,
  TYPE_REVISION_TRAFFIC,
  TYPE_KNATIVE_REVISION,
} from './consts';
import KnativeServiceWidget from './widgets/KnativeServiceWidget';
import TrafficLinkWidget from './widgets/TrafficLinkWidget';

type NodeEntityProps = {
  entity: NodeEntity;
};

const widgetFactory: WidgetFactory = (
  kind,
  type,
): ComponentType<{ entity: ElementEntity }> | undefined => {
  switch (type) {
    case TYPE_APPLICATION_GROUP:
      return withDndDrop(groupWorkoadDropTargetSpec)(
        withDragNode()(
          withSelection(false, true)(
            withContextMenu(
              groupContextMenu,
              document.getElementById('modal-container'),
              'odc-topology-context-menu',
            )(GroupHullWidget),
          ),
        ),
      );
    case TYPE_KNATIVE_SERVICE:
      return withDragNode(nodeDragSourceSpec(type))(
        withSelection(false, true)(
          withContextMenu(
            workloadContextMenu,
            document.getElementById('modal-container'),
            'odc-topology-context-menu',
          )(KnativeServiceWidget),
        ),
      );
    case TYPE_EVENT_SOURCE:
      return withSelection(false, true)(
        withContextMenu(
          workloadContextMenu,
          document.getElementById('modal-container'),
          'odc-topology-context-menu',
        )(EventSourceWidget),
      );
    case TYPE_REVISION_TRAFFIC:
      return TrafficLinkWidget;
    case TYPE_WORKLOAD:
      return withCreateConnector(createConnectorCallback)(
        withDndDrop<
          any,
          any,
          { droppable?: boolean; hover?: boolean; canDrop?: boolean },
          NodeEntityProps
        >(nodeDropTargetSpec)(
          withDragNode(nodeDragSourceSpec(type))(
            withSelection(false, true)(
              withContextMenu(
                workloadContextMenu,
                document.getElementById('modal-container'),
                'odc-topology-context-menu',
              )(WorkloadNodeWidget),
            ),
          ),
        ),
      );
    case TYPE_KNATIVE_REVISION:
      return withCreateConnector(createConnectorCallback)(
        withDndDrop<
          any,
          any,
          { droppable?: boolean; hover?: boolean; canDrop?: boolean },
          NodeEntityProps
        >(nodeDropTargetSpec)(
          withDragNode(nodeDragSourceSpec(type))(
            withSelection(false, true)(
              withContextMenu(
                workloadContextMenu,
                document.getElementById('modal-container'),
                'odc-topology-context-menu',
              )(WorkloadNodeWidget),
            ),
          ),
        ),
      );
    case TYPE_EVENT_SOURCE_LINK:
      return EventSourceLinkWidget;
    case TYPE_CONNECTS_TO:
      return withTargetDrag(edgeDragSourceSpec)(
        withRemoveConnector(removeConnectorCallback)(ConnectsToWidget),
      );
    default:
      switch (kind) {
        case ModelKind.graph:
          return withDndDrop(graphWorkloadDropTargetSpec)(
            withPanZoom()(withSelection(false, true)(GraphWidget)),
          );
        default:
          return undefined;
      }
  }
};

export default widgetFactory;
