import { action } from 'mobx';
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
import { DragEvent, DragSourceMonitor } from '@console/topology/src/behavior/dnd-types';
import { withSelection } from '@console/topology/src/behavior/useSelection';
import BaseNodeWidget from './widgets/BaseNodeWidget';
import EdgeWidget from './widgets/EdgeWidget';
import GroupHullWidget from './widgets/GroupHullWidget';
import WorkloadNodeWidget from './widgets/WorkloadNodeWidget';

type EdgeEntityProps = {
  entity: EdgeEntity;
};

const widgetFactory: WidgetFactory = (
  entity: ElementEntity,
): ComponentType<{ entity: ElementEntity }> | undefined => {
  switch (entity.getType()) {
    case 'group':
      return withDragNode()(withSelection()(GroupHullWidget));
    case 'workload':
      return withDragNode()(withSelection()(WorkloadNodeWidget));
    default:
      switch (entity.kind) {
        case ModelKind.graph:
          return withPanZoom()(GraphWidget);
        case ModelKind.node:
          return withDragNode()(withSelection()(BaseNodeWidget));
        case ModelKind.edge:
          return withTargetDrag<any, NodeEntity, { dragging?: boolean }, EdgeEntityProps>({
            item: { type: 'test' },
            begin: action((monitor: DragSourceMonitor, props: EdgeEntityProps) => {
              props.entity.raise();
              return props.entity;
            }),
            drag: action((event: DragEvent, monitor: DragSourceMonitor, props: EdgeEntityProps) => {
              props.entity.setEndPoint(event.x, event.y);
            }),
            end: action(
              (dropResult: NodeEntity, monitor: DragSourceMonitor, props: EdgeEntityProps) => {
                if (monitor.didDrop() && dropResult && props) {
                  props.entity.setTarget(dropResult);
                }
                props.entity.setEndPoint();
              },
            ),
            collect: (monitor) => ({
              dragging: monitor.isDragging(),
            }),
          })(EdgeWidget);
        default:
          return undefined;
      }
  }
};

export default widgetFactory;
