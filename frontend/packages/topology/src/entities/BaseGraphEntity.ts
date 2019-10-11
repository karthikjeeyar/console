import { computed, observable } from 'mobx';
import {
  GraphEntity,
  EdgeEntity,
  NodeEntity,
  Graph,
  ModelKind,
  isNodeEntity,
  isEdgeEntity,
  Layout,
} from '../types';
import BaseElementEntity from './BaseElementEntity';

export default class BaseGraphEntity<E extends Graph = Graph, D = any>
  extends BaseElementEntity<E, D>
  implements GraphEntity<E, D> {
  @observable
  private scale: number = 1;

  @observable
  private layoutType: string | undefined;

  isDetached(): boolean {
    return !this.getController();
  }

  @computed
  private get graphLayout(): Layout | undefined {
    return this.layoutType ? this.getController().getLayout(this.layoutType) : undefined;
  }

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

  getLayout(): string | undefined {
    return this.layoutType;
  }

  setLayout(layout: string): void {
    this.layoutType = layout;
  }

  layout(): void {
    const layout = this.graphLayout;
    if (layout) {
      layout.layout(this.nodes, this.edges);
    }
  }

  getScale(): number {
    return this.scale;
  }

  setScale(scale: number): void {
    this.scale = scale;
  }

  setModel(model: E): void {
    super.setModel(model);

    if ('layout' in model) {
      this.layoutType = model.layout;
    }
    if ('scale' in model && typeof model.scale === 'number') {
      this.scale = +model.scale;
    }
    const bounds = this.getBounds();
    if ('x' in model && model.x != null) {
      bounds.x = model.x;
    }
    if ('y' in model && model.y != null) {
      bounds.y = model.y;
    }
  }

  translateToAbsolute(): void {
    // do nothing
  }

  translateFromAbsolute(): void {
    // do nothing
  }
}
