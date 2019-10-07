import * as React from 'react';
import { reaction } from 'mobx';
import Visualization from '../src/Visualization';
import VisualizationWidget from '../src/VisualizationWidget';
import { Model, ModelKind } from '../src/types';
import { withPanZoom } from '../src/behavior/usePanZoom';
import GraphWidget from '../src/widgets/GraphWidget';
import defaultWidgetFactory from './widgets/defaultWidgetFactory';

export default {
  title: 'Pan Zoom',
};

const model: Model = {
  graph: {
    id: 'g1',
    type: 'graph',
    children: ['gr1'],
  },
  nodes: [
    {
      id: 'gr1',
      type: 'group-hull',
      children: ['n1', 'n2'],
    },
    {
      id: 'n1',
      type: 'node',
      x: 200,
      y: 200,
      width: 50,
      height: 50,
    },
    {
      id: 'n2',
      type: 'node',
      x: 300,
      y: 300,
      width: 100,
      height: 100,
    },
  ],
};

export const panZoom: React.FC = () => {
  const vis = new Visualization();
  vis.registerWidgetFactory(defaultWidgetFactory);
  vis.registerWidgetFactory((entity) => {
    if (entity.kind === ModelKind.graph) {
      return withPanZoom()(GraphWidget);
    }
    return undefined;
  });
  vis.fromModel(model);
  reaction(
    () => ({
      x: vis.getRoot().getBounds().x,
      y: vis.getRoot().getBounds().y,
      k: vis.getRoot().getScale(),
    }),
    (transform) => {
      // logging to action panel is too laggy therefore log to console
      // eslint-disable-next-line no-console
      console.log(`Pan zoom event`, transform);
    },
  );
  return <VisualizationWidget visualization={vis} />;
};
