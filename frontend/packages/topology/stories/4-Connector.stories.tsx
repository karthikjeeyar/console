import * as React from 'react';
import { action } from 'mobx';
import Visualization from '../src/Visualization';
import VisualizationWidget from '../src/VisualizationWidget';
import { Model, ModelKind, EdgeEntity, NodeEntity } from '../src/types';
import { withTargetDrag, withSourceDrag } from '../src/behavior/useReconnect';
import { DragSourceMonitor, DragEvent } from '../src/behavior/dnd-types';
import { withDndDrop } from '../src/behavior/useDndDrop';
import { withPanZoom } from '../src/behavior/usePanZoom';
import GraphWidget from '../src/widgets/GraphWidget';
import defaultWidgetFactory from './widgets/defaultWidgetFactory';
import EdgeWidget from './widgets/EdgeWidget';
import NodeWidget from './widgets/NodeWidget';

export default {
  title: 'Connector',
};

type EntityProps = {
  entity: EdgeEntity;
};

export const reconnect = () => {
  const vis = new Visualization();
  vis.registerWidgetFactory(defaultWidgetFactory);
  vis.registerWidgetFactory((entity) => {
    if (entity.kind === ModelKind.graph) {
      return withPanZoom()(GraphWidget);
    }
    if (entity.kind === ModelKind.node) {
      return withDndDrop<any, any, any, EntityProps>({
        accept: 'test',
        canDrop: (item, monitor, props) => {
          return !props || (item.getSource() !== props.entity && item.getTarget() !== props.entity);
        },
        collect: (monitor) => ({
          droppable: monitor.isDragging(),
          hover: monitor.isOver(),
          canDrop: monitor.canDrop(),
        }),
      })(NodeWidget);
    }
    if (entity.kind === ModelKind.edge) {
      return withSourceDrag<any, NodeEntity, any, EntityProps>({
        item: { type: 'test' },
        begin: action((monitor: DragSourceMonitor, props: EntityProps) => {
          props.entity.raise();
          return props.entity;
        }),
        drag: action((event: DragEvent, monitor: DragSourceMonitor, props: EntityProps) => {
          props.entity.setStartPoint(event.x, event.y);
        }),
        end: action((dropResult: NodeEntity, monitor: DragSourceMonitor, props: EntityProps) => {
          if (monitor.didDrop() && dropResult && props) {
            props.entity.setSource(dropResult);
          }
          props.entity.setStartPoint();
        }),
      })(
        withTargetDrag<any, NodeEntity, any, EntityProps>({
          item: { type: 'test' },
          begin: action((monitor: DragSourceMonitor, props: EntityProps) => {
            props.entity.raise();
            return props.entity;
          }),
          drag: action((event: DragEvent, monitor: DragSourceMonitor, props: EntityProps) => {
            props.entity.setEndPoint(event.x, event.y);
          }),
          end: action((dropResult: NodeEntity, monitor: DragSourceMonitor, props: EntityProps) => {
            if (monitor.didDrop() && dropResult && props) {
              props.entity.setTarget(dropResult);
            }
            props.entity.setEndPoint();
          }),
          collect: (monitor) => ({
            dragging: monitor.isDragging(),
          }),
        })(EdgeWidget),
      );
    }
    return undefined;
  });
  const model: Model = {
    graph: {
      id: 'g1',
      type: 'graph',
      children: ['n1', 'n2', 'n3', 'e1', 'e2'],
    },
    nodes: [
      {
        id: 'n1',
        type: 'node',
        x: 20,
        y: 150,
        width: 20,
        height: 20,
      },
      {
        id: 'n2',
        type: 'node',
        x: 200,
        y: 50,
        width: 100,
        height: 30,
      },
      {
        id: 'n3',
        type: 'node',
        x: 200,
        y: 300,
        width: 30,
        height: 30,
      },
    ],
    edges: [
      {
        id: 'e1',
        type: 'edge',
        source: 'n1',
        target: 'n2',
        bendpoints: [[50, 30], [110, 10]],
      },
      {
        id: 'e2',
        type: 'edge',
        source: 'n1',
        target: 'n3',
      },
    ],
  };
  vis.fromModel(model);
  return <VisualizationWidget visualization={vis} />;
};
