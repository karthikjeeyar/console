import Point from '../geom/Point';
import AbstractAnchor from './AbstractAnchor';
import { getEllipseAnchorPoint } from './svgAnchorUtils';

export default class EllipseAnchor extends AbstractAnchor {
  getLocation(reference: Point): Point {
    const r = this.getOwner().getBounds();
    if (r.isEmpty()) {
      return r.getCenter();
    }

    return getEllipseAnchorPoint(r.getCenter(), r.width, r.height, reference);
  }
}
