import * as React from 'react';
import * as _ from 'lodash';
import { Edge, Model, ModelKind, Node } from '../src/types';
import Visualization from '../src/Visualization';
import { withPanZoom } from '../src/behavior/usePanZoom';
import GraphWidget from '../src/widgets/GraphWidget';
import { withDragGroup } from '../src/behavior/useDragGroup';
import { withDragNode } from '../src/behavior/useDragNode';
import VisualizationWidget from '../src/VisualizationWidget';
import { ColaLayout } from './layouts/colaLayout';
import { DagreLayout } from './layouts/dagreLayout';
import { ForceLayout } from './layouts/forceLayout';
import data from './data/miserables';
import defaultWidgetFactory from './widgets/defaultWidgetFactory';
import GroupHullWidget from './widgets/GroupHullWidget';
import GroupWidget from './widgets/GroupWidget';
import NodeWidget from './widgets/NodeWidget';

export default {
  title: 'Layout',
};

const getModel = (): Model => {
  // create nodes from data
  const nodes: Node[] = data.nodes.map((d) => {
    // randomize size somewhat
    const width = 10 + d.id.length;
    const height = 10 + d.id.length;
    return {
      id: d.id,
      type: 'node',
      width,
      height,
      x: 0,
      y: 0,
      data: d,
    };
  });

  // create groups from data
  const groupNodes: Node[] = _.map(_.groupBy(nodes, (n) => n.data.group), (v, k) => ({
    type: 'group-hull',
    id: k,
    children: v.map((n: Node) => n.id),
    label: `group-${k}`,
  }));

  // create links from data
  const edges = data.links.map(
    (d): Edge => ({
      data: d,
      source: d.source,
      target: d.target,
      id: `${d.source}_${d.target}`,
      type: 'edge',
    }),
  );

  // create topology model
  const model: Model = {
    graph: {
      id: 'g1',
      type: 'graph',
      children: groupNodes.map((n) => n.id).concat(edges.map((e) => e.id)),
    },
    nodes: [...nodes, ...groupNodes],
    edges,
  };

  return model;
};

const getVisualization = (model: Model): Visualization => {
  const vis = new Visualization();

  vis.registerWidgetFactory(defaultWidgetFactory);

  // support pan zoom and drag
  vis.registerWidgetFactory((entity) => {
    if (entity.kind === ModelKind.graph) {
      return withPanZoom()(GraphWidget);
    }
    if (entity.getType() === 'group-hull') {
      return withDragGroup(GroupHullWidget);
    }
    if (entity.getType() === 'group') {
      return withDragGroup(GroupWidget);
    }
    if (entity.kind === ModelKind.node) {
      return withDragNode(NodeWidget);
    }
    return undefined;
  });
  vis.fromModel(model);

  return vis;
};

export const Force = () => {
  const vis: Visualization = getVisualization(getModel());
  ForceLayout(vis);
  return <VisualizationWidget visualization={vis} />;
};

export const Dagre = () => {
  const vis: Visualization = getVisualization(getModel());
  DagreLayout(vis);
  return <VisualizationWidget visualization={vis} />;
};

export const Cola = () => {
  const vis: Visualization = getVisualization(getModel());
  ColaLayout(vis);
  return <VisualizationWidget visualization={vis} />;
};
