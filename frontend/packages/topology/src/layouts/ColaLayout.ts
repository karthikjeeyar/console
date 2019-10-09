import * as _ from 'lodash';
import * as webcola from 'webcola';
import * as d3 from 'd3';
import { action } from 'mobx';
import { EdgeEntity, Layout, NodeEntity } from '../types';
import { leafNodeEntities } from '../utils/leafNodeEntities';

class ColaNode implements webcola.Node {
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

class ColaLink implements webcola.Link<ColaNode | number> {
  private edge: EdgeEntity;

  private colaSource: ColaNode;

  private colaTarget: ColaNode;

  constructor(edge: EdgeEntity) {
    this.edge = edge;
  }

  get entity(): EdgeEntity {
    return this.edge;
  }

  get source(): ColaNode | number {
    return this.colaSource || parseInt(this.edge.getSource().getId(), 10);
  }

  set source(node: ColaNode | number) {
    if (node instanceof ColaNode) {
      this.colaSource = node;
    }
  }

  get target(): ColaNode | number {
    return this.colaTarget || parseInt(this.edge.getTarget().getId(), 10);
  }

  set target(node: ColaNode | number) {
    if (node instanceof ColaNode) {
      this.colaTarget = node;
    }
  }

  get id(): string {
    return this.edge.getId();
  }
}

class ColaGroup implements webcola.Group {
  public bounds?: webcola.Rectangle;

  public leaves?: ColaNode[];

  public groups?: ColaGroup[];

  public padding: 200;

  constructor(children: NodeEntity[] | undefined, allNodes: ColaNode[]) {
    this.leaves = _.reduce(
      children,
      (nodes: ColaNode[], nodeEntity: NodeEntity) => {
        const nextChild: ColaNode | undefined = allNodes.find(
          (nextNode: ColaNode) => nextNode.id === nodeEntity.getId(),
        );
        if (nextChild) {
          nodes.push(nextChild);
        }
        return nodes;
      },
      [],
    );
  }
}

export default class ColaLayout implements Layout {
  layout = (nodeEntities: NodeEntity[], edgeEntities: EdgeEntity[]) => {
    const nodes: ColaNode[] = leafNodeEntities(nodeEntities).map(
      (e: NodeEntity) => new ColaNode(e),
    );
    const groups: ColaGroup[] = nodeEntities
      .filter((e) => e.getType() === 'group-hull')
      .map((group: NodeEntity) => new ColaGroup(group.getNodes(), nodes));
    const edges: ColaLink[] = edgeEntities.map((e: EdgeEntity) => {
      const edge: ColaLink = new ColaLink(e);
      edge.source = _.find(nodes, { id: edge.entity.getSource().getId() }) || 0;
      edge.target = _.find(nodes, { id: edge.entity.getTarget().getId() }) || 0;
      return edge;
    });

    let tickCount = 0;
    const d3cola = webcola.d3adaptor(d3).linkDistance(30);
    d3cola
      .size([1000, 400])
      .nodes(nodes)
      .links(edges)
      .groups(groups)
      .linkDistance((link: ColaLink) =>
        (link.source as ColaNode).entity.getParent() !==
        (link.target as ColaNode).entity.getParent()
          ? 200
          : 50,
      )
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
