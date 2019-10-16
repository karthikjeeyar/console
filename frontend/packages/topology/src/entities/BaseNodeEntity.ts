import { observable, computed } from 'mobx';
import { NodeEntity, Anchor, Node, ModelKind, isNodeEntity, AnchorEnd } from '../types';
import CenterAnchor from '../anchors/CenterAnchor';
import Rect from '../geom/Rect';
import { Translatable } from '../geom/types';
import BaseElementEntity from './BaseElementEntity';

const createAnchorKey = (end: AnchorEnd = AnchorEnd.both, type: string = ''): string =>
  `${end}:${type}`;

export default class BaseNodeEntity<E extends Node = Node, D = any> extends BaseElementEntity<E, D>
  implements NodeEntity<E, D> {
  @observable.shallow
  private anchors: { [type: string]: Anchor } = {
    [createAnchorKey()]: new CenterAnchor(this),
  };

  @observable.ref
  private bounds: Rect = new Rect();

  @computed
  private get nodes(): NodeEntity[] {
    return this.getChildren().filter(isNodeEntity);
  }

  @observable
  private group = false;

  @computed
  private get groupBounds(): Rect {
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

    return rect || new Rect();
  }

  get kind(): ModelKind {
    return ModelKind.node;
  }

  getBounds(): Rect {
    return this.group ? this.groupBounds : this.bounds;
  }

  setBounds(bounds: Rect): void {
    this.bounds.setBounds(bounds.x, bounds.y, bounds.width, bounds.height);
  }

  getAnchor(end?: AnchorEnd, type?: string): Anchor {
    let anchor = this.anchors[createAnchorKey(end, type)];
    if (!anchor && type) {
      anchor = this.anchors[createAnchorKey(end)];
    }
    if (!anchor && (end === AnchorEnd.source || end === AnchorEnd.target)) {
      anchor = this.anchors[createAnchorKey(AnchorEnd.both, type)];
      if (!anchor && type) {
        anchor = this.anchors[createAnchorKey(AnchorEnd.both)];
      }
    }
    return anchor;
  }

  setAnchor(anchor: Anchor, end?: AnchorEnd, type?: string): void {
    const key = createAnchorKey(end, type);
    if (anchor) {
      this.anchors[key] = anchor;
    } else {
      delete this.anchors[key];
    }
  }

  getNodes(): NodeEntity[] {
    return this.nodes;
  }

  isGroup(): boolean {
    return this.group;
  }

  setModel(model: E): void {
    super.setModel(model);
    const bounds = this.getBounds();
    // update width and height before position
    if ('width' in model && model.width != null) {
      bounds.width = model.width;
    }
    if ('height' in model && model.height != null) {
      bounds.height = model.height;
    }
    if ('x' in model && model.x != null) {
      bounds.x = model.x;
    }
    if ('y' in model && model.y != null) {
      bounds.y = model.y;
    }
    if ('group' in model) {
      this.group = !!model.group;
    }
  }

  translateToParent(t: Translatable): void {
    if (!this.group) {
      const { x, y } = this.getBounds();
      t.translate(x, y);
    }
  }

  translateFromParent(t: Translatable): void {
    if (!this.group) {
      const { x, y } = this.getBounds();
      t.translate(-x, -y);
    }
  }
}
