import { observable } from 'mobx';
import Rect from '../geom/Rect';
import { NodeEntity, Anchor, Node } from '../types';
import EllipseAnchor from '../anchors/EllipseAnchor';
import Point from '../geom/Point';
import BaseElementEntity from './BaseElementEntity';

export default class BaseNodeEntity<E extends Node = Node, D = any> extends BaseElementEntity<E, D>
  implements NodeEntity<E, D> {
  @observable.ref
  private bbox: Rect = observable(new Rect());

  @observable.ref
  private anchor: Anchor = new EllipseAnchor(this);

  getPosition(): Point {
    // TODO make efficient
    return this.bbox.getCenter();
  }

  setPosition({ x, y }: Point): void {
    this.bbox.setCenter(x, y);
  }

  getBoundingBox(): Rect {
    return this.bbox;
  }

  setBoundingBox(bbox: Rect): void {
    this.bbox.setBounds(bbox.x, bbox.y, bbox.width, bbox.height);
  }

  getAnchor(): Anchor {
    return this.anchor;
  }

  setModel(model: E): void {
    super.setModel(model);
    if ('x' in model && model.x != null) {
      this.bbox.x = model.x;
    }
    if ('y' in model && model.y != null) {
      this.bbox.y = model.y;
    }
    if ('width' in model && model.width != null) {
      this.bbox.width = model.width;
    }
    if ('height' in model && model.height != null) {
      this.bbox.height = model.height;
    }
  }
}
