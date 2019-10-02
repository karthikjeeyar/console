import * as React from 'react';
import * as d3 from 'd3';
import * as dagre from 'dagre';
import * as _ from 'lodash';
import { action } from 'mobx';
import Visualization from '../src/Visualization';
import VisualizationWidget from '../src/VisualizationWidget';
import {
  Model,
  NodeEntity,
  EdgeEntity,
  isEdgeEntity,
  isNodeEntity,
  ModelKind,
  Node,
  Edge,
} from '../src/types';
import { withGroupDrag } from '../src/behavior/useGroupDrag';
import { withPanZoom } from '../src/behavior/usePanZoom';
import { withDrag } from '../src/behavior/useDrag';
import GraphWidget from '../src/widgets/GraphWidget';
import defaultWidgetFactory from './widgets/defaultWidgetFactory';
import data from './data/miserables';
import NodeWidget from './widgets/NodeWidget';
import GroupHullWidget from './widgets/GroupHullWidget';

export default {
  title: 'Layout',
};

// TODO create reusable layout classes

class D3Node implements d3.SimulationNodeDatum {
  private node: NodeEntity;

  private xx?: number;

  private yy?: number;

  constructor(node: NodeEntity) {
    this.node = node;
  }

  get entity(): NodeEntity {
    return this.node;
  }

  get id(): string {
    return this.node.getId();
  }

  get x(): number {
    return this.xx || this.node.getBoundingBox().x;
  }

  set x(x: number) {
    this.xx = x;
  }

  get y(): number {
    return this.yy || this.node.getBoundingBox().y;
  }

  set y(y: number) {
    this.yy = y;
  }

  update() {
    if (this.xx != null && this.yy != null) {
      this.node.getBoundingBox().setLocation(this.xx, this.yy);
    }
    this.xx = undefined;
    this.yy = undefined;
  }

  getRadius(): number {
    const { width, height } = this.node.getBoundingBox();
    return Math.max(width, height) / 2;
  }
}

class D3Link implements d3.SimulationLinkDatum<D3Node> {
  private edge: EdgeEntity;

  private d3Source: D3Node;

  private d3Target: D3Node;

  constructor(edge: EdgeEntity) {
    this.edge = edge;
  }

  get source(): D3Node | string {
    return this.d3Source || this.edge.getSource().getId();
  }

  set source(node: D3Node | string) {
    if (node instanceof D3Node) {
      this.d3Source = node;
    }
  }

  get target(): D3Node | string {
    return this.d3Target || this.edge.getTarget().getId();
  }

  set target(node: D3Node | string) {
    if (node instanceof D3Node) {
      this.d3Target = node;
    }
  }

  get id(): string {
    return this.edge.getId();
  }
}

export const force = () => {
  const vis = new Visualization();

  // force center
  const bodyRect = document.body.getBoundingClientRect();
  const cx = bodyRect.width / 2;
  const cy = bodyRect.height / 2;

  // create nodes from data
  const nodes: Node[] = data.nodes.map((d) => ({
    id: d.id,
    type: 'node',
    // randomize size somewhat
    width: 10 + d.id.length,
    height: 10 + d.id.length,
    // init to center
    x: cx,
    y: cy,
    data: d,
  }));
  // create groups from data
  const groupNodes: Node[] = _.map(_.groupBy(nodes, (n) => n.data.group), (v, k) => ({
    type: 'group-hull',
    id: `group-${k}`,
    children: v.map((n: Node) => n.id),
  }));
  // create links from data
  const edges = data.links.map((d) => ({
    data: d,
    ...d,
    id: `${d.source}_${d.target}`,
    type: 'edge',
  }));

  // create topology model
  const model: Model = {
    graph: {
      id: 'g1',
      type: 'graph',
      children: groupNodes.map((n) => n.id),
      edges: edges.map((e) => e.id),
    },
    nodes: [...nodes, ...groupNodes],
    edges,
  };

  vis.registerWidgetFactory(defaultWidgetFactory);

  // support pan zoom and drag
  vis.registerWidgetFactory((entity) => {
    if (entity.kind === ModelKind.graph) {
      return withPanZoom()(GraphWidget);
    }
    if (entity.getType() === 'group-hull') {
      return withGroupDrag(GroupHullWidget);
    }
    if (entity.kind === ModelKind.node) {
      return withDrag(NodeWidget);
    }
    return undefined;
  });
  vis.fromModel(model);

  const entities = vis.getEntities();
  // create d3 nodes
  const d3nodes = vis
    .getEntities()
    .filter((e) => isNodeEntity(e) && e.getType() === 'node')
    .map((e: NodeEntity) => new D3Node(e));
  // create d3 links
  const d3links = entities.filter((e) => isEdgeEntity(e)).map((e: EdgeEntity) => new D3Link(e));

  // create force simulation
  const simulation = d3
    .forceSimulation<D3Node>()
    .force('collide', d3.forceCollide<D3Node>().radius((d) => d.getRadius() + 5))
    .force('charge', d3.forceManyBody())
    .force('center', d3.forceCenter(cx, cy))
    .nodes(d3nodes)
    .force(
      'link',
      d3
        .forceLink<D3Node, D3Link>(d3links)
        .id((e) => e.id)
        .distance((d) =>
          (d.source as D3Node).entity.getParent() !== (d.target as D3Node).entity.getParent()
            ? 200
            : 50,
        ),
    )
    .on(
      'tick',
      action(() => {
        // speed up the simulation
        for (let i = 0; i < 10; i++) {
          simulation.tick();
        }
        d3nodes.forEach((d) => d.update());
      }),
    )
    .restart();
  return <VisualizationWidget visualization={vis} />;
};

export const Dagre = () => {
  const vis = new Visualization();
  const graph = new dagre.graphlib.Graph({ compound: true });
  graph.setGraph({
    marginx: 0,
    marginy: 0,
    nodesep: 50,
    ranker: 'tight-tree',
  });

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

  _.forEach(nodes, (node) => {
    graph.setNode(node.id, node);
    graph.setParent(node.id, node.data.group);
  });

  // create links from data
  const edges = data.links.map((d) => ({
    data: d,
    ...d,
    id: `${d.source}_${d.target}`,
    type: 'edge',
    label: '',
  }));

  _.forEach(edges, (edge) => {
    graph.setEdge(edge.data.source, edge.data.target, edge);
  });

  dagre.layout(graph);

  _.forEach(edges, (edge: Edge) => {
    if (edge.points && edge.points.length > 2) {
      edge.bendpoints = edge.points.slice(1, -1).map((point: any) => [point.x, point.y]);
    }
  });

  // create topology model
  const model: Model = {
    graph: {
      id: 'g1',
      type: 'graph',
      children: groupNodes.map((n) => n.id),
      edges: edges.map((e) => e.id),
    },
    nodes: [...nodes, ...groupNodes],
    edges,
  };

  vis.registerWidgetFactory(defaultWidgetFactory);
  // support pan zoom and drag
  vis.registerWidgetFactory((entity) => {
    if (entity.kind === ModelKind.graph) {
      return withPanZoom(false, [0.1, 5])(GraphWidget);
    }
    if (entity.getType() === 'group-hull') {
      return withGroupDrag(GroupHullWidget);
    }
    if (entity.kind === ModelKind.node) {
      return withDrag(NodeWidget);
    }
    return undefined;
  });

  vis.fromModel(model);

  return <VisualizationWidget visualization={vis} />;
};
