import { computed, observable } from 'mobx';
import {
  GraphEntity,
  EdgeEntity,
  NodeEntity,
  Graph,
  ModelKind,
  isNodeEntity,
  isEdgeEntity,
} from '../types';
import BaseElementEntity from './BaseElementEntity';

export default class BaseGraphEntity<E extends Graph = Graph, D = any>
  extends BaseElementEntity<E, D>
  implements GraphEntity<E, D> {
  @observable
  private scale: number = 1;

  @computed
  private get edges(): EdgeEntity[] {
    return this.getChildren().filter(isEdgeEntity);
  }

  @computed
  private get nodes(): NodeEntity[] {
    return this.getChildren().filter(isNodeEntity);
  }

  get kind(): ModelKind {
    return ModelKind.graph;
  }

  getNodes(): NodeEntity[] {
    return this.nodes;
  }

  getEdges(): EdgeEntity[] {
    return this.edges;
  }

  getScale(): number {
    return this.scale;
  }

  setScale(scale: number): void {
    this.scale = scale;
  }

  setModel(model: E): void {
    super.setModel(model);
    if ('scale' in model && typeof model.scale === 'number') {
      this.scale = +model.scale;
    }
  }
}
