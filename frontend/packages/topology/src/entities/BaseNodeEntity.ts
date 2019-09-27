import { observable } from 'mobx';
import Rect from '../geom/Rect';
import { NodeEntity, Anchor, Node } from '../types';
import EllipseAnchor from '../anchors/EllipseAnchor';
import Point from '../geom/Point';
import Dimensions from '../geom/Dimensions';
import BaseElementEntity from './BaseElementEntity';

export default class BaseNodeEntity<E extends Node = Node, D = any> extends BaseElementEntity<E, D>
  implements NodeEntity<E, D> {
  @observable
  private position: Point = new Point();

  @observable
  private dimensions: Dimensions = new Dimensions();

  @observable
  private bbox: Rect;

  @observable.ref
  private anchor: Anchor = new EllipseAnchor(this);

  getPosition(): Point {
    return this.position;
  }

  setPosition(position: Point): void {
    this.position = position;
  }

  getDimensions(): Dimensions {
    return this.dimensions;
  }

  setDimensions(dimensions: Dimensions): void {
    this.dimensions = dimensions;
  }

  getBoundingBox(): Rect {
    if (this.bbox) {
      return this.bbox;
    }
    const bbox = new Rect(0, 0, this.dimensions.width, this.dimensions.height);
    bbox.setCenter(this.position.x, this.position.y);
    return bbox;
  }

  setBoundingBox(bbox: Rect): void {
    this.bbox = bbox;
  }

  getAnchor(): Anchor {
    return this.anchor;
  }

  setModel(model: E): void {
    super.setModel(model);
    if (model.position) {
      this.position.setLocation(model.position[0], model.position[1]);
    }
    if (model.dimensions) {
      this.dimensions.setSize(model.dimensions[0], model.dimensions[1]);
    }
  }
}
