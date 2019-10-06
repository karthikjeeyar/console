import * as dagre from 'dagre';
import * as _ from 'lodash';
import Visualization from '../../src/Visualization';
import { EdgeEntity, ElementEntity, isEdgeEntity, isNodeEntity, NodeEntity } from '../../src/types';
import Point from '../../src/geom/Point';

class DagreNode {
  private node: NodeEntity;

  constructor(node: NodeEntity) {
    this.node = node;
  }

  getId(): string {
    return this.node.getId();
  }

  getData(): any {
    return this.node.getData();
  }

  get entity(): NodeEntity {
    return this.node;
  }

  get x(): number {
    return this.node.getPosition().x;
  }

  set x(value: number) {
    this.node.setPosition(value, this.node.getPosition().y);
  }

  get y(): number {
    return this.node.getPosition().y;
  }

  set y(value: number) {
    this.node.setPosition(this.node.getPosition().x, value);
  }
}

class DagreEdge {
  public points: any[];

  private edge: EdgeEntity;

  constructor(edge: EdgeEntity) {
    this.edge = edge;
  }

  get entity(): EdgeEntity {
    return this.edge;
  }

  get source(): string {
    return this.edge.getSource().getId();
  }

  get target(): string {
    return this.edge.getTarget().getId();
  }
}

export const DagreLayout = (vis: Visualization) => {
  const entities = vis.getEntities();

  const nodes: DagreNode[] = entities
    .filter((e) => isNodeEntity(e) && e.getType() === 'node')
    .map((node: ElementEntity) => new DagreNode(node as NodeEntity));
  const edges: DagreEdge[] = entities
    .filter((e) => isEdgeEntity(e))
    .map((node: ElementEntity) => new DagreEdge(node as EdgeEntity));

  const graph = new dagre.graphlib.Graph({ compound: true });
  graph.setGraph({
    marginx: 0,
    marginy: 0,
    nodesep: 50,
    ranker: 'tight-tree',
  });

  _.forEach(nodes, (node) => {
    graph.setNode(node.getId(), node);
    graph.setParent(node.getId(), node.getData().group);
  });

  _.forEach(edges, (dagreEdge: DagreEdge) => {
    graph.setEdge(dagreEdge.source, dagreEdge.target, dagreEdge);
  });

  dagre.layout(graph);

  _.forEach(edges, (edge: DagreEdge) => {
    if (edge.points && edge.points.length > 2) {
      edge.entity.setBendpoints(
        edge.points.slice(1, -1).map((point: any) => new Point(point.x, point.y)),
      );
    }
  });
};
