import { observable } from 'mobx';
import Rect from '../geom/Rect';
import { NodeEntity, Anchor, Node } from '../types';
import EllipseAnchor from '../anchors/EllipseAnchor';
import BaseElementEntity from './BaseElementEntity';

export default class BaseNodeEntity<E extends Node = Node, D = any> extends BaseElementEntity<E, D>
  implements NodeEntity<E, D> {
  @observable
  private bbox: Rect = new Rect();

  @observable.ref
  private anchor: Anchor = new EllipseAnchor(this);

  getBoundingBox(): Rect {
    return this.bbox;
  }

  getAnchor(): Anchor {
    return this.anchor;
  }

  setModel(model: E): void {
    super.setModel(model);
    if (model.dimensions) {
      this.bbox.setSize(model.dimensions[0], model.dimensions[1]);
    }
    // update position after resizing
    if (model.position) {
      this.bbox.setCenter(model.position[0], model.position[1]);
    }
  }
}
