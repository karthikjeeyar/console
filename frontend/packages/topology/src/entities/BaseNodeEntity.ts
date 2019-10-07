import { observable, computed } from 'mobx';
import Rect from '../geom/Rect';
import { NodeEntity, Anchor, Node, ModelKind, isNodeEntity } from '../types';
import RectAnchor from '../anchors/RectAnchor';
import Point from '../geom/Point';
import BaseElementEntity from './BaseElementEntity';

export default class BaseNodeEntity<E extends Node = Node, D = any> extends BaseElementEntity<E, D>
  implements NodeEntity<E, D> {
  @observable.ref
  private bbox: Rect = observable(new Rect());

  @observable.ref
  private anchor: Anchor = new RectAnchor(this);

  @computed
  private get nodes(): NodeEntity[] {
    return this.getChildren().filter(isNodeEntity);
  }

  get kind(): ModelKind {
    return ModelKind.node;
  }

  getPosition(): Point {
    // TODO make efficient
    return this.bbox.getCenter();
  }

  setPosition(x: number, y: number): void {
    this.bbox.setCenter(x, y);
  }

  getBounds(): Rect {
    return this.bbox;
  }

  setBoundingBox(bbox: Rect): void {
    this.bbox.setBounds(bbox.x, bbox.y, bbox.width, bbox.height);
  }

  getAnchor(): Anchor {
    return this.anchor;
  }

  setAnchor(anchor: Anchor): void {
    anchor.setOwner(this);
    this.anchor = anchor;
  }

  getNodes(): NodeEntity[] {
    return this.nodes;
  }

  setModel(model: E): void {
    super.setModel(model);
    // update width and height before position
    if ('width' in model && model.width != null) {
      this.bbox.width = model.width;
    }
    if ('height' in model && model.height != null) {
      this.bbox.height = model.height;
    }
    let c;
    if ('x' in model && model.x != null) {
      if (!c) {
        c = this.bbox.getCenter();
      }
      c[0] = model.x;
    }
    if ('y' in model && model.y != null) {
      if (!c) {
        c = this.bbox.getCenter();
      }
      c[1] = model.y;
    }
    if (c) {
      this.bbox.setCenter(c[0], c[1]);
    }
  }
}
