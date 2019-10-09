import * as d3 from 'd3';
import * as _ from 'lodash';
import { action } from 'mobx';
import { EdgeEntity, Layout, NodeEntity } from '../types';
import { leafNodeEntities } from '../utils/leafNodeEntities';

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

export default class ForceLayout implements Layout {
  layout = (nodeEntities: NodeEntity[], edgeEntities: EdgeEntity[]) => {
    // Get all the leaf nodes and crate the D3 nodes from them
    const nodes: D3Node[] = leafNodeEntities(nodeEntities).map((e: NodeEntity) => new D3Node(e));
    const edges: D3Link[] = edgeEntities.map((e: EdgeEntity) => new D3Link(e));

    // force center
    // TODO: Use bounding component size rather than document.body
    const bodyRect = document.body.getBoundingClientRect();
    const cx = bodyRect.width / 2;
    const cy = bodyRect.height / 2;

    _.forEach(nodes, (node: D3Node) => {
      node.setPosition(cx, cy);
    });

    // create force simulation
    const simulation = d3
      .forceSimulation<D3Node>()
      .force('collide', d3.forceCollide<D3Node>().radius((d) => d.getRadius() + 5))
      .force('charge', d3.forceManyBody())
      .nodes(nodes)
      .force(
        'link',
        d3
          .forceLink<D3Node, D3Link>(edges)
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
          nodes.forEach((d) => d.update());
        }),
      )
      .restart();
  };
}
