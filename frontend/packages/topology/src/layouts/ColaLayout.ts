import * as _ from 'lodash';
import * as webcola from 'webcola';
import * as d3 from 'd3';
import { action } from 'mobx';
import { EdgeEntity, ElementEntity, GraphEntity, Layout, NodeEntity } from '../types';
import { leafNodeEntities } from '../utils/leafNodeEntities';
import { groupNodeEntities } from '../utils/groupNodeEntities';
import BaseEdgeEntity from '../entities/BaseEdgeEntity';

class ColaNode implements webcola.Node {
  private node: NodeEntity;

  private nodeIndexx: number;

  private xx?: number;

  private yy?: number;

  constructor(node: NodeEntity, index: number) {
    this.node = node;
    this.nodeIndexx = index;
  }

  get entity(): NodeEntity {
    return this.node;
  }

  set nodeIndex(newIndex: number) {
    this.nodeIndexx = newIndex;
  }

  get nodeIndex(): number {
    return this.nodeIndexx;
  }

  get id(): string {
    return this.node.getId();
  }

  get x(): number {
    return this.xx || this.node.getBounds().getCenter().x;
  }

  set x(x: number) {
    this.xx = x;
  }

  get y(): number {
    return this.yy || this.node.getBounds().getCenter().y;
  }

  set y(y: number) {
    this.yy = y;
  }

  setPosition(x: number, y: number) {
    this.node.getBounds().setCenter(x, y);
  }

  update() {
    if (this.xx != null && this.yy != null) {
      this.node.getBounds().setCenter(this.xx, this.yy);
    }
    this.xx = undefined;
    this.yy = undefined;
  }

  getRadius(): number {
    const { width, height } = this.node.getBounds();
    return Math.max(width, height) / 2;
  }
}

class ColaLink implements webcola.Link<ColaNode | number> {
  private edge: EdgeEntity;

  private sourceIndex: number;

  private targetIndex: number;

  constructor(edge: EdgeEntity, sourceIndex: number, targetIndex: number) {
    this.edge = edge;
    this.sourceIndex = sourceIndex;
    this.targetIndex = targetIndex;
  }

  get entity(): EdgeEntity {
    return this.edge;
  }

  get source(): number {
    return this.sourceIndex;
  }

  set source(node: number) {
    this.sourceIndex = node;
  }

  get target(): number {
    return this.targetIndex;
  }

  set target(node: number) {
    this.targetIndex = node;
  }

  get id(): string {
    return this.edge.getId();
  }
}

const getNodeIndex = (nodes: ColaNode[], id: string): number => {
  const node = _.find(nodes, { id });
  return node ? node.nodeIndex : -1;
};

export default class ColaLayout implements Layout {
  private graph: GraphEntity;

  constructor(graph: GraphEntity) {
    this.graph = graph;
  }

  destroy(): void {}

  layout = () => {
    const nodes: ColaNode[] = leafNodeEntities(this.graph.getNodes()).map(
      (e: NodeEntity, index) => new ColaNode(e, index),
    );
    const groups: ElementEntity[] = groupNodeEntities(this.graph.getNodes());
    const edges: ColaLink[] = this.graph.getEdges().map((e: EdgeEntity) => {
      e.setBendpoints([]);
      const edge: ColaLink = new ColaLink(
        e,
        getNodeIndex(nodes, e.getSource().getId()),
        getNodeIndex(nodes, e.getTarget().getId()),
      );
      return edge;
    });

    // Create faux edges for the grouped nodes to form group clusters
    groups.forEach((group: NodeEntity) => {
      const groupNodes = group.getNodes().filter((node: NodeEntity) => !_.size(node.getNodes()));
      for (let i = 0; i < groupNodes.length; i++) {
        for (let j = i + 1; j < groupNodes.length; j++) {
          const fauxEdge = new BaseEdgeEntity();
          fauxEdge.setSource(groupNodes[i]);
          fauxEdge.setTarget(groupNodes[j]);
          fauxEdge.setController(groupNodes[i].getController());
          const fauxLink: ColaLink = new ColaLink(
            fauxEdge,
            getNodeIndex(nodes, groupNodes[i].getId()),
            getNodeIndex(nodes, groupNodes[j].getId()),
          );
          edges.push(fauxLink);
        }
      }
    });

    // force center
    const cx = this.graph.getBounds().width / 2;
    const cy = this.graph.getBounds().height / 2;

    _.forEach(nodes, (node: ColaNode) => {
      node.setPosition(cx, cy);
    });

    let tickCount = 0;
    const d3cola = webcola.d3adaptor(d3).linkDistance(30);
    d3cola
      .size([1000, 400])
      .nodes(nodes)
      .links(edges)
      .linkDistance((link: ColaLink) => {
        const source = _.find(nodes, (node: ColaNode) => node.nodeIndex === link.source);
        const target = _.find(nodes, (node: ColaNode) => node.nodeIndex === link.target);
        if (!source || !target) {
          return 50;
        }

        return source.entity.getParent() !== target.entity.getParent() ? 100 : 50;
      })
      .on('tick', () => {
        // speed up the simulation
        if (++tickCount % 10 === 0) {
          action(() => nodes.forEach((d) => d.update()))();
        }
      })
      .on(
        'end',
        action(() => {
          nodes.forEach((d) => d.update());
        }),
      )
      .start(20, 0, 10);
  };
}
