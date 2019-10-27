import {
  EdgeEntity,
  ElementEntity,
  ModelKind,
  NodeEntity,
  WidgetFactory,
} from '@console/topology/src/types';
import { ComponentType } from 'react';
import GraphWidget from '@console/topology/src/widgets/GraphWidget';
import { withPanZoom } from '@console/topology/src/behavior/usePanZoom';
import { withDragNode } from '@console/topology/src/behavior/useDragNode';
import { withTargetDrag } from '@console/topology/src/behavior/useReconnect';
import { withSelection } from '@console/topology/src/behavior/useSelection';
import { withDndDrop } from '@console/topology/src/behavior/useDndDrop';
import { withCreateConnector } from '@console/topology/src/behavior/withCreateConnector';
import { withRemoveConnector } from '@console/topology/src/behavior/withRemoveConnector';
import { withContextMenu } from '@console/topology/src/behavior/withContextMenu';
import BaseNodeWidget from './widgets/BaseNodeWidget';
import EdgeWidget from './widgets/BaseEdgeWidget';
import GroupHullWidget from './widgets/GroupHullWidget';
import ConnectsToWidget from './widgets/ConnectsToWidget';
import WorkloadNodeWidget from './widgets/WorkloadNodeWidget';
import { workloadContextMenu, groupContextMenu } from './nodeContextMenu';
import {
  graphWorkloadDropTargetSpec,
  nodeDragSourceSpec,
  workloadDragSourceSpec,
  workloadDropTargetSpec,
  groupWorkoadDropTargetSpec,
  edgeDragSourceSpec,
  createConnectorCallback,
  removeConnectorCallback,
} from './widgetUtils';
import './ContextMenu.scss';
import { TYPE_WORKLOAD, TYPE_CONNECTS_TO, TYPE_APPLICATION_GROUP } from './consts';

type NodeEntityProps = {
  entity: NodeEntity;
};

type EdgeEntityProps = {
  entity: EdgeEntity;
};

const widgetFactory: WidgetFactory = (
  kind,
  type,
): ComponentType<{ entity: ElementEntity }> | undefined => {
  switch (type) {
    case TYPE_APPLICATION_GROUP:
      return withDndDrop<any, any, any, NodeEntityProps>(groupWorkoadDropTargetSpec)(
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
    case TYPE_WORKLOAD:
      return withCreateConnector(createConnectorCallback)(
        withDndDrop<
          any,
          any,
          { droppable?: boolean; hover?: boolean; canDrop?: boolean },
          NodeEntityProps
        >(workloadDropTargetSpec)(
          withDragNode<any, NodeEntity, any, NodeEntityProps>(workloadDragSourceSpec(type))(
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
    case TYPE_CONNECTS_TO:
      return withTargetDrag<any, NodeEntity, { dragging?: boolean }, EdgeEntityProps>(
        edgeDragSourceSpec,
      )(withRemoveConnector(removeConnectorCallback)(ConnectsToWidget));
    default:
      switch (kind) {
        case ModelKind.graph:
          return withDndDrop<any, any, any, NodeEntityProps>(graphWorkloadDropTargetSpec)(
            withPanZoom()(withSelection(false, true)(GraphWidget)),
          );
        case ModelKind.node:
          return withDragNode<any, NodeEntity, any, NodeEntityProps>(nodeDragSourceSpec(type))(
            withSelection(false, true)(BaseNodeWidget),
          );
        case ModelKind.edge:
          return EdgeWidget;
        default:
          return undefined;
      }
  }
};

export default widgetFactory;
