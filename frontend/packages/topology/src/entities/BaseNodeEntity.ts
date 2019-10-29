import { observable, computed } from 'mobx';
import {
  NodeEntity,
  Anchor,
  Node,
  ModelKind,
  isNodeEntity,
  AnchorEnd,
  GroupStyle,
  NodeShape,
  EdgeEntity,
} from '../types';
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

  @observable
  private shape: NodeShape = NodeShape.circle;

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

    if (!rect) {
      rect = new Rect();
    }

    const { padding } = this.getStyle<GroupStyle>();
    return padding ? rect.expand(padding, padding) : rect;
  }

  @computed
  private get sourceEdges(): EdgeEntity[] {
    return this.getGraph()
      .getEdges()
      .filter((e) => e.getSource() === this);
  }

  @computed
  private get targetEdges(): EdgeEntity[] {
    return this.getGraph()
      .getEdges()
      .filter((e) => e.getTarget() === this);
  }

  get kind(): ModelKind {
    return ModelKind.node;
  }

  getBounds(): Rect {
    return this.group ? this.groupBounds : this.bounds;
  }

  setBounds(bounds: Rect): void {
    if (!this.bounds.equals(bounds)) {
      this.bounds = bounds;
    }
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

  getNodeShape(): NodeShape {
    return this.shape;
  }

  setNodeShape(shape: NodeShape): void {
    this.shape = shape;
  }

  getSourceEdges(): EdgeEntity[] {
    return this.sourceEdges;
  }

  getTargetEdges(): EdgeEntity[] {
    return this.targetEdges;
  }

  setModel(model: E): void {
    super.setModel(model);
    const bounds = this.getBounds();
    let r: Rect | undefined;

    // update width and height before position
    if ('width' in model && model.width != null) {
      if (!r) {
        r = bounds.clone();
      }
      r.width = model.width;
    }
    if ('height' in model && model.height != null) {
      if (!r) {
        r = bounds.clone();
      }
      r.height = model.height;
    }
    if ('x' in model && model.x != null) {
      if (!r) {
        r = bounds.clone();
      }
      r.x = model.x;
    }
    if ('y' in model && model.y != null) {
      if (!r) {
        r = bounds.clone();
      }
      r.y = model.y;
    }

    if (r) {
      this.setBounds(r);
    }
    if ('group' in model) {
      this.group = !!model.group;
    }
    if ('shape' in model) {
      this.shape = model.shape || NodeShape.circle;
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
