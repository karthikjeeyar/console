import * as React from 'react';
import Visualization from '../src/Visualization';
import defaultWidgetFactory from '../src/widgets/defaultWidgetFactory';
import VisualizationWidget from '../src/VisualizationWidget';
import { Model } from '../src/types';

export default {
  title: 'Basic',
};

export const singleNode = () => {
  const vis = new Visualization();
  const model: Model = {
    graph: {
      id: 'g1',
      type: 'graph',
      children: ['n1'],
    },
    nodes: [
      {
        id: 'n1',
        type: 'node',
        position: [50, 50],
        dimensions: [20, 20],
      },
    ],
  };
  vis.fromModel(model);
  vis.registerWidgetFactory(defaultWidgetFactory);
  return <VisualizationWidget visualization={vis} />;
};

export const singleEdge = () => {
  const vis = new Visualization();
  const model: Model = {
    graph: {
      id: 'g1',
      type: 'graph',
      children: ['n1', 'n2'],
      edges: ['e1'],
    },
    nodes: [
      {
        id: 'n1',
        type: 'node',
        position: [10, 10],
        dimensions: [20, 20],
      },
      {
        id: 'n2',
        type: 'node',
        position: [200, 50],
        dimensions: [100, 30],
      },
    ],
    edges: [
      {
        id: 'e1',
        type: 'edge',
        source: 'n1',
        target: 'n2',
      },
    ],
  };
  vis.fromModel(model);
  vis.registerWidgetFactory(defaultWidgetFactory);
  return <VisualizationWidget visualization={vis} />;
};
