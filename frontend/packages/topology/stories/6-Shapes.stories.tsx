import * as React from 'react';
import Visualization from '../src/Visualization';
import VisualizationWidget from '../src/VisualizationWidget';
import { Model, isNodeEntity, ModelKind } from '../src/types';
import GraphWidget from '../src/widgets/GraphWidget';
import { withPanZoom } from '../src/behavior/usePanZoom';
import { withDragNode } from '../src/behavior/useDragNode';
import defaultWidgetFactory from './widgets/defaultWidgetFactory';
import shapesWidgetFactory from './widgets/shapesWidgetFactory';
import NodeWidget from './widgets/NodeWidget';

export default {
  title: 'Shapes',
};

export const shapes = () => {
  const vis = new Visualization();
  const model: Model = {
    graph: {
      id: 'g1',
      type: 'graph',
      x: 25,
      y: 25,
    },
    nodes: [
      {
        id: 'gr1',
        type: 'group-hull',
        group: true,
        children: ['n2', 'n3'],
        style: {
          padding: 10,
        },
      },
      {
        id: 'gr2',
        type: 'group-hull',
        group: true,
        children: ['n4', 'n5'],
        style: {
          padding: 10,
        },
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
    if (isNodeEntity(entity) && entity.getType() === 'node-drag') {
      return withDragNode()(NodeWidget);
    }
    return undefined;
  });
  return <VisualizationWidget visualization={vis} />;
};
