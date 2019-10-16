import { computed, observable } from 'mobx';
import Rect from '../geom/Rect';
import Point from '../geom/Point';
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

  @observable.ref
  private bounds: Rect = new Rect();

  private currentLayout: Layout | undefined;

  isDetached(): boolean {
    return !this.getController();
  }

  @computed
  private get graphLayout(): Layout | undefined {
    return this.currentLayout;
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

  getBounds(): Rect {
    return this.bounds;
  }

  setBounds(bounds: Rect): void {
    this.bounds.setBounds(bounds.x, bounds.y, bounds.width, bounds.height);
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

  setLayout(layout: string | undefined): void {
    if (layout === this.layoutType) {
      return;
    }

    if (this.currentLayout) {
      this.currentLayout.destroy();
    }

    this.layoutType = layout;
    this.currentLayout = this.getController().getLayout(layout);
  }

  layout(): void {
    const layout = this.graphLayout;
    if (layout) {
      layout.layout();
    }
  }

  getScale(): number {
    return this.scale;
  }

  setScale(scale: number): void {
    this.scale = scale;
  }

  reset(): void {
    this.scale = 1;
    this.getBounds().setLocation(0, 0);
  }

  scaleBy(scale: number, location?: Point): void {
    const b = this.getBounds();
    let { x, y } = b;
    const c = location || b.getCenter().translate(-x, -y);
    x = (c.x - x) / this.scale;
    y = (c.y - y) / this.scale;
    this.scale *= scale;
    x = c.x - x * this.scale;
    y = c.y - y * this.scale;
    b.setLocation(x, y);
  }

  fit(padding = 0): void {
    let rect: Rect | undefined;
    this.getChildren().forEach((c) => {
      if (isNodeEntity(c)) {
        const b = c.getBounds();
        if (!rect) {
          rect = b.clone();
        } else {
          rect.union(b);
        }
      }
    });
    if (!rect) {
      return;
    }

    const { width, height } = rect;

    if (width === 0 || height === 0) {
      return;
    }

    const { width: fullWidth, height: fullHeight } = this.getBounds();
    const midX = rect.x + width / 2;
    const midY = rect.y + height / 2;

    // set the max scale to be the current zoom level or 1
    const maxScale = Math.max(this.getScale(), 1);

    // compute the scale
    const scale = Math.min(
      1 /
        Math.max(
          width / Math.max(1, fullWidth - padding),
          height / Math.max(1, fullHeight - padding),
        ),
      maxScale,
    );

    // translate to center
    const tx = fullWidth / 2 - midX * scale;
    const ty = fullHeight / 2 - midY * scale;

    // TODO should scale and bound be kept in a single geom Transform object instead of separately?
    this.setScale(scale);
    this.getBounds().setLocation(tx, ty);
  }

  setModel(model: E): void {
    super.setModel(model);

    if ('layout' in model) {
      this.setLayout(model.layout);
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
