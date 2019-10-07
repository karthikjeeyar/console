// TODO create reusable layout classes
import * as d3 from 'd3';
import * as _ from 'lodash';
import { action } from 'mobx';
import { EdgeEntity, isEdgeEntity, isNodeEntity, NodeEntity } from '../../src/types';
import Visualization from '../../src/Visualization';

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
    return this.xx || this.node.getPosition().x;
  }

  set x(x: number) {
    this.xx = x;
  }

  get y(): number {
    return this.yy || this.node.getPosition().y;
  }

  set y(y: number) {
    this.yy = y;
  }

  setPosition(x: number, y: number) {
    this.node.setPosition(x, y);
  }

  update() {
    if (this.xx != null && this.yy != null) {
      this.node.setPosition(this.xx, this.yy);
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

export const ForceLayout = (vis: Visualization) => {
  const entities = vis.getEntities();

  const nodes: D3Node[] = entities
    .filter((e) => isNodeEntity(e) && e.getType() === 'node')
    .map((e: NodeEntity) => new D3Node(e));
  const edges: D3Link[] = entities
    .filter((e) => isEdgeEntity(e))
    .map((e: EdgeEntity) => new D3Link(e));

  // force center
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
    .force('center', d3.forceCenter(cx, cy))
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
