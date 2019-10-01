import * as React from 'react';
import Visualization from '../src/Visualization';
import VisualizationWidget from '../src/VisualizationWidget';
import { Model, ModelKind } from '../src/types';
import { withReconnect } from '../src/behavior/useReconnect';
import defaultWidgetFactory from './widgets/defaultWidgetFactory';
import EdgeWidget from './widgets/EdgeWidget';

export default {
  title: 'Connector',
};

export const reconnect = () => {
  const vis = new Visualization();
  vis.registerWidgetFactory(defaultWidgetFactory);
  vis.registerWidgetFactory((entity) => {
    if (entity.kind === ModelKind.edge) {
      return withReconnect(EdgeWidget);
    }
    return undefined;
  });
  const model: Model = {
    graph: {
      id: 'g1',
      type: 'graph',
      children: ['n1', 'n2', 'n3'],
      edges: ['e1', 'e2'],
    },
    nodes: [
      {
        id: 'n1',
        type: 'node',
        x: 20,
        y: 20,
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
