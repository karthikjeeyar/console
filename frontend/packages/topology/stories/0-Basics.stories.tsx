import * as React from 'react';
import Visualization from '../src/Visualization';
import DefaultWidgetFactory from '../src/widgets/DefaultWidgetFactory';
import VisualizationWidget from '../src/VisualizationWidget';
import { Model, ElementEntity, InteractionHandler } from '../src/types';
import SelectionHandler from '../src/handlers/SelectionHandler';

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
  vis.registerWidgetFactory(new DefaultWidgetFactory());
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
  vis.registerWidgetFactory(new DefaultWidgetFactory());
  return <VisualizationWidget visualization={vis} />;
};

export const selection = () => {
  const vis = new Visualization();
  const model: Model = {
    graph: {
      id: 'g1',
      type: 'graph',
      children: ['n1', 'n2'],
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
        position: [100, 10],
        dimensions: [20, 20],
      },
    ],
  };
  vis.registerWidgetFactory(new DefaultWidgetFactory());
  vis.registerInteractionHandlerFactory({
    getInteractionHandlers(entity: ElementEntity): InteractionHandler[] | undefined {
      if (entity.kind === 'node') {
        return [new SelectionHandler()];
      }
      return undefined;
    },
  });
  vis.fromModel(model);
  return <VisualizationWidget visualization={vis} />;
};
