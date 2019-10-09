import Point from '../geom/Point';
import AbstractAnchor from './AbstractAnchor';
import { getRectAnchorPoint } from './AnchorUtils';

export default class RectAnchor extends AbstractAnchor {
  getLocation(reference: Point): Point {
    const r = this.getOwner().getBounds();
    const center = r.getCenter();
    if (r.isEmpty()) {
      return center;
    }

    return getRectAnchorPoint(center, r.width, r.height, reference);
  }
}
