import * as React from 'react';
import { action } from 'mobx';
import Visualization from '../src/Visualization';
import VisualizationWidget from '../src/VisualizationWidget';
import { Model, isNodeEntity, NodeEntity, ModelKind } from '../src/types';
import { withDndDrag } from '../src/behavior/useDndDrag';
import { withDndDrop } from '../src/behavior/useDndDrop';
import GraphWidget from '../src/widgets/GraphWidget';
import { withPanZoom } from '../src/behavior/usePanZoom';
import { DragSourceMonitor, DragEvent } from '../src/behavior/dnd-types';
import defaultWidgetFactory from './widgets/defaultWidgetFactory';
import shapesWidgetFactory from './widgets/shapesWidgetFactory';
import NodeWidget from './widgets/NodeWidget';
import GroupHullWidget from './widgets/GroupHullWidget';

export default {
  title: 'Shapes',
};

type EntityProps = {
  entity: NodeEntity;
};

export const shapes = () => {
  const vis = new Visualization();
  const model: Model = {
    graph: {
      id: 'g1',
      type: 'graph',
      children: ['n1', 'n6', 'gr1', 'gr2', 'e1', 'e2', 'e3', 'e4', 'e5'],
    },
    nodes: [
      {
        id: 'gr1',
        type: 'group-drop',
        children: ['n2', 'n3'],
      },
      {
        id: 'gr2',
        type: 'group-drop',
        children: ['n4', 'n5'],
      },
      {
        id: 'n1',
        type: 'node-drag',
        x: 50,
        y: 50,
        width: 30,
        height: 30,
      },
      {
        id: 'n2',
        type: 'node-rect',
        x: 200,
        y: 20,
        width: 30,
        height: 50,
      },
      {
        id: 'n3',
        type: 'node-ellipse',
        x: 150,
        y: 100,
        width: 50,
        height: 30,
      },
      {
        id: 'n4',
        type: 'node-path',
        x: 300,
        y: 250,
        width: 30,
        height: 30,
      },
      {
        id: 'n5',
        type: 'node-polygon',
        x: 350,
        y: 370,
        width: 65,
        height: 65,
      },
      {
        id: 'n6',
        type: 'node-rect',
        x: 300,
        y: 200,
        width: 60,
        height: 20,
      },
    ],
    edges: [
      {
        id: 'e1',
        type: 'edge',
        source: 'n1',
        target: 'n2',
      },
      {
        id: 'e2',
        type: 'edge',
        source: 'n1',
        target: 'n3',
      },
      {
        id: 'e3',
        type: 'edge',
        source: 'n1',
        target: 'n4',
      },
      {
        id: 'e4',
        type: 'edge',
        source: 'n1',
        target: 'n5',
      },
      {
        id: 'e5',
        type: 'edge',
        source: 'n1',
        target: 'n6',
      },
    ],
  };
  vis.fromModel(model);
  vis.registerWidgetFactory(defaultWidgetFactory);
  vis.registerWidgetFactory(shapesWidgetFactory);
  // support pan zoom and drag
  vis.registerWidgetFactory((entity) => {
    if (entity.kind === ModelKind.graph) {
      return withPanZoom()(GraphWidget);
    }
    if (isNodeEntity(entity) && entity.getType() === 'group-drop') {
      return withDndDrop<any, any, any, EntityProps>({
        accept: 'test',
        canDrop: (item, monitor, props) => {
          return !!props && item.getParent() !== props.entity;
        },
        collect: (monitor) => ({
          droppable: monitor.isDragging(),
          hover: monitor.isOver(),
          canDrop: monitor.canDrop(),
        }),
      })(GroupHullWidget);
    }
    if (isNodeEntity(entity) && entity.getType() === 'node-drag') {
      return withDndDrag<any, NodeEntity, any, EntityProps>({
        item: { type: 'test' },
        begin: action((monitor: DragSourceMonitor, props: EntityProps) => {
          props.entity.raise();
          return props.entity;
        }),
        drag: action((event: DragEvent, monitor: DragSourceMonitor, props: EntityProps) => {
          props.entity.getBounds().translate(event.dx, event.dy);
        }),
        end: action((dropResult: NodeEntity, monitor: DragSourceMonitor, props: EntityProps) => {
          if (monitor.didDrop() && dropResult && props) {
            dropResult.appendChild(props.entity);
          }
        }),
      })(NodeWidget);
    }
    return undefined;
  });
  return <VisualizationWidget visualization={vis} />;
};
