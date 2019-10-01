import * as React from 'react';
import Visualization from '../src/Visualization';
import VisualizationWidget from '../src/VisualizationWidget';
import { Model } from '../src/types';
import defaultWidgetFactory from './widgets/defaultWidgetFactory';

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
        x: 50,
        y: 50,
        width: 20,
        height: 20,
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
    ],
    edges: [
      {
        id: 'e1',
        type: 'edge',
        source: 'n1',
        target: 'n2',
        bendpoints: [[50, 30], [110, 10]],
      },
    ],
  };
  vis.fromModel(model);
  vis.registerWidgetFactory(defaultWidgetFactory);
  return <VisualizationWidget visualization={vis} />;
};

const groupStory = (groupType: string) => {
  const vis = new Visualization();
  const model: Model = {
    graph: {
      id: 'g1',
      type: 'graph',
      children: ['gr1'],
    },
    nodes: [
      {
        id: 'gr1',
        type: groupType,
        children: ['n1', 'n2', 'n3'],
      },
      {
        id: 'n1',
        type: 'node',
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
    ],
  };
  vis.fromModel(model);
  vis.registerWidgetFactory(defaultWidgetFactory);
  return <VisualizationWidget visualization={vis} />;
};

export const group = () => groupStory('group');
export const groupHull = () => groupStory('group-hull');
