import * as d3 from 'd3';
import * as _ from 'lodash';
import { action } from 'mobx';
import { EdgeEntity, ElementEntity, GraphEntity, Layout, NodeEntity } from '../types';
import { leafNodeEntities } from '../utils/leafNodeEntities';
import { groupNodeEntities } from '../utils/groupNodeEntities';
import BaseEdgeEntity from '../entities/BaseEdgeEntity';
import {
  DRAG_NODE_START_EVENT,
  DRAG_NODE_END_EVENT,
  DragNodeEventListener,
} from '../behavior/useDragNode';

class D3Node implements d3.SimulationNodeDatum {
  private node: NodeEntity;

  private xx?: number;

  private yy?: number;

  private isFixed: boolean = false;

  constructor(node: NodeEntity) {
    this.node = node;
  }

  get entity(): NodeEntity {
    return this.node;
  }

  get id(): string {
    return this.node.getId();
  }

  set fixed(fixed: boolean) {
    this.isFixed = fixed;
  }

  get fixed(): boolean {
    return this.isFixed;
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

  get fx(): number | undefined {
    return this.isFixed ? this.node.getBounds().getCenter().x : undefined;
  }

  get fy(): number | undefined {
    return this.isFixed ? this.node.getBounds().getCenter().y : undefined;
  }

  setPosition(x: number, y: number) {
    this.node.setBounds(
      this.node
        .getBounds()
        .clone()
        .setCenter(x, y),
    );
  }

  update() {
    if (this.xx != null && this.yy != null) {
      this.node.setBounds(
        this.node
          .getBounds()
          .clone()
          .setCenter(this.xx, this.yy),
      );
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
  private graph: GraphEntity;

  private simulation: d3.Simulation<D3Node, undefined>;

  constructor(graph: GraphEntity) {
    this.graph = graph;
    graph
      .getController()
      .addEventListener<DragNodeEventListener>(DRAG_NODE_START_EVENT, this.handleDragStart)
      .addEventListener<DragNodeEventListener>(DRAG_NODE_END_EVENT, this.handleDragEnd);
  }

  destroy(): void {
    this.graph
      .getController()
      .removeEventListener(DRAG_NODE_START_EVENT, this.handleDragStart)
      .removeEventListener(DRAG_NODE_END_EVENT, this.handleDragEnd);
  }

  getGroupNodes = (group: NodeEntity): D3Node[] => {
    return leafNodeEntities(group).reduce((nodes: D3Node[], nextNode: NodeEntity) => {
      const d3Node = this.simulation.nodes().find((node: D3Node) => node.id === nextNode.getId());
      if (d3Node) {
        nodes.push(d3Node);
      }
      return nodes;
    }, []);
  };

  handleDragStart = (entity: NodeEntity) => {
    const id = entity.getId();
    let found = false;
    const dragNode: D3Node | undefined = this.simulation
      .nodes()
      .find((node: D3Node) => node.id === id);
    if (dragNode) {
      dragNode.fixed = true;
      found = true;
    }
    if (!found) {
      const dragGroup: NodeEntity | undefined = groupNodeEntities(this.graph.getNodes()).find(
        (group: NodeEntity) => group.getId() === id,
      );
      if (dragGroup) {
        const groupNodes = this.getGroupNodes(dragGroup);
        groupNodes.forEach((node: D3Node) => {
          node.fixed = true;
        });
        found = true;
      }
    }
    if (found) {
      this.simulation.alphaTarget(0.1).restart();
    }
  };

  handleDragEnd = (entity: NodeEntity) => {
    const id = entity.getId();
    this.simulation.alphaTarget(0);
    const dragNode: D3Node | undefined = this.simulation
      .nodes()
      .find((node: D3Node) => node.id === id);
    if (dragNode) {
      dragNode.fixed = false;
    } else {
      const dragGroup: NodeEntity | undefined = groupNodeEntities(this.graph.getNodes()).find(
        (group: NodeEntity) => group.getId() === id,
      );
      if (dragGroup) {
        const groupNodes = this.getGroupNodes(dragGroup);
        groupNodes.forEach((node: D3Node) => {
          node.fixed = false;
        });
      }
    }
  };

  layout = () => {
    const groups: ElementEntity[] = groupNodeEntities(this.graph.getNodes());
    const nodes: D3Node[] = leafNodeEntities(this.graph.getNodes()).map(
      (e: NodeEntity) => new D3Node(e),
    );
    const edges: D3Link[] = this.graph.getEdges().map((e: EdgeEntity) => {
      e.setBendpoints([]);
      return new D3Link(e);
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
          edges.push(new D3Link(fauxEdge));
        }
      }
    });

    // force center
    const cx = this.graph.getBounds().width / 2;
    const cy = this.graph.getBounds().height / 2;

    _.forEach(nodes, (node: D3Node) => {
      node.setPosition(cx, cy);
    });

    // create force simulation
    this.simulation = d3
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
              ? 100
              : 50,
          ),
      )
      .on(
        'tick',
        action(() => {
          // speed up the simulation
          for (let i = 0; i < 10; i++) {
            this.simulation.tick();
          }
          nodes.forEach((d) => d.update());
        }),
      )
      .restart();
  };
}
