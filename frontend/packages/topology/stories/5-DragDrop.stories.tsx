import * as React from 'react';
import { action } from 'mobx';
import Visualization from '../src/Visualization';
import VisualizationWidget from '../src/VisualizationWidget';
import { Model, isNodeEntity, NodeEntity } from '../src/types';
import { withDndDrag } from '../src/behavior/useDndDrag';
import { withDndDrop } from '../src/behavior/useDndDrop';
import { DragSourceMonitor, DragEvent } from '../src/behavior/dnd-types';
import defaultWidgetFactory from './widgets/defaultWidgetFactory';
import NodeWidget from './widgets/NodeWidget';
import GroupHullWidget from './widgets/GroupHullWidget';

export default {
  title: 'Drag and Drop',
};

type EntityProps = {
  entity: NodeEntity;
};

export const dnd = () => {
  const vis = new Visualization();
  const model: Model = {
    graph: {
      id: 'g1',
      type: 'graph',
      children: ['n1', 'gr1', 'gr2'],
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
        type: 'node',
        x: 200,
        y: 20,
        width: 10,
        height: 10,
      },
      {
        id: 'n3',
        type: 'node',
        x: 150,
        y: 100,
        width: 20,
        height: 20,
      },
      {
        id: 'n4',
        type: 'node',
        x: 300,
        y: 250,
        width: 30,
        height: 30,
      },
      {
        id: 'n5',
        type: 'node',
        x: 350,
        y: 370,
        width: 15,
        height: 15,
      },
    ],
  };
  vis.fromModel(model);
  vis.registerWidgetFactory(defaultWidgetFactory);
  // support pan zoom and drag
  vis.registerWidgetFactory((entity) => {
    if (isNodeEntity(entity) && entity.getType() === 'group-drop') {
      return withDndDrop<any, any, any, EntityProps>({
        accept: 'test',
        collect: (monitor) => ({
          droppable: monitor.isDragging(),
          hover: monitor.isOver(),
        }),
      })(GroupHullWidget);
    }
    if (isNodeEntity(entity) && entity.getType() === 'node-drag') {
      return withDndDrag<any, NodeEntity, any, EntityProps>({
        item: { type: 'test' },
        begin: action((monitor: DragSourceMonitor, props: EntityProps) => {
          props.entity.raise();
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
