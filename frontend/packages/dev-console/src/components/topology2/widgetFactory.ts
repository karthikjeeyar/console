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
import BaseNodeWidget from './widgets/BaseNodeWidget';
import EdgeWidget from './widgets/EdgeWidget';
import GroupHullWidget from './widgets/GroupHullWidget';
import WorkloadNodeWidget from './widgets/WorkloadNodeWidget';
import {
  graphWorkloadDropTargetSpec,
  nodeDragSourceSpec,
  workloadDragSourceSpec,
  workloadDropTargetSpec,
  groupWorkoadDropTargetSpec,
  edgeDragSourceSpec,
} from './widgetUtils';

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
        withDragNode()(withSelection()(GroupHullWidget)),
      );
    case 'workload':
      return withDndDrop<
        any,
        any,
        { droppable?: boolean; hover?: boolean; canDrop?: boolean },
        NodeEntityProps
      >(workloadDropTargetSpec)(
        withDragNode<any, NodeEntity, any, NodeEntityProps>(workloadDragSourceSpec(entity))(
          withSelection()(WorkloadNodeWidget),
        ),
      );
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
          return withTargetDrag<any, NodeEntity, { dragging?: boolean }, EdgeEntityProps>(
            edgeDragSourceSpec,
          )(EdgeWidget);
        default:
          return undefined;
      }
  }
};

export default widgetFactory;
