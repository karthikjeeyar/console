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
  createConnectorSpec,
  removeConnectorSpec,
} from './widgetUtils';
import './ContextMenu.scss';

type NodeEntityProps = {
  entity: NodeEntity;
};

type EdgeEntityProps = {
  entity: EdgeEntity;
};

const widgetFactory: WidgetFactory = (
  entity: ElementEntity,
): ComponentType<{ entity: ElementEntity }> | undefined => {
  switch (entity.getType()) {
    case 'group':
      return withDndDrop<any, any, any, NodeEntityProps>(groupWorkoadDropTargetSpec)(
        withDragNode()(
          withSelection()(
            withContextMenu(
              groupContextMenu,
              document.getElementById('modal-container'),
              'odc-topology-context-menu',
            )(GroupHullWidget),
          ),
        ),
      );
    case 'workload':
      return withCreateConnector(createConnectorSpec)(
        withDndDrop<
          any,
          any,
          { droppable?: boolean; hover?: boolean; canDrop?: boolean },
          NodeEntityProps
        >(workloadDropTargetSpec)(
          withDragNode<any, NodeEntity, any, NodeEntityProps>(workloadDragSourceSpec(entity))(
            withSelection()(
              withContextMenu(
                workloadContextMenu,
                document.getElementById('modal-container'),
                'odc-topology-context-menu',
              )(WorkloadNodeWidget),
            ),
          ),
        ),
      );
    case 'connects-to':
      return withTargetDrag<any, NodeEntity, { dragging?: boolean }, EdgeEntityProps>(
        edgeDragSourceSpec,
      )(withRemoveConnector(removeConnectorSpec)(ConnectsToWidget));
    default:
      switch (entity.kind) {
        case ModelKind.graph:
          return withDndDrop<any, any, any, NodeEntityProps>(graphWorkloadDropTargetSpec)(
            withPanZoom()(GraphWidget),
          );
        case ModelKind.node:
          return withDragNode<any, NodeEntity, any, NodeEntityProps>(nodeDragSourceSpec(entity))(
            withSelection()(BaseNodeWidget),
          );
        case ModelKind.edge:
          return EdgeWidget;
        default:
          return undefined;
      }
  }
};

export default widgetFactory;
