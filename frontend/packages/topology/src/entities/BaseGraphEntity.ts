import { observable } from 'mobx';
import * as _ from 'lodash';
import { GraphEntity, EdgeEntity, NodeEntity, Graph } from '../types';
import BaseElementEntity from './BaseElementEntity';

export default class BaseGraphEntity<E extends Graph = Graph, D = any>
  extends BaseElementEntity<E, D>
  implements GraphEntity<E, D> {
  @observable
  private edges: string[];

  get kind() {
    return 'graph';
  }

  getNodes(): NodeEntity[] {
    return this.getChildren();
  }

  getEdges(): EdgeEntity[] {
    const controller = this.getController();
    return (this.edges || []).map((id) => controller.getEdgeById(id));
  }

  removeNode(node: NodeEntity): void {
    this.removeChild(node);
  }

  removeEdge(edge: EdgeEntity): void {
    if (this.edges) {
      const idx = this.edges.indexOf(edge.getId());
      if (idx !== -1) {
        this.edges.splice(idx, 1);
        edge.setParent(undefined);
      }
    }
  }

  setModel(model: E): void {
    super.setModel(model);
    if (Array.isArray(model.edges)) {
      const controller = this.getController();

      // remove all unknown edges
      _.difference(this.edges, model.edges).forEach((id) => controller.getEntityById(id).remove());

      this.edges = _.clone(model.edges);

      // ensure parent references are set
      this.edges.forEach((id) => controller.getEdgeById(id).setParent(this));
    }
  }
}
