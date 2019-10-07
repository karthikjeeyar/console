import Point from '../geom/Point';
import AbstractAnchor from './AbstractAnchor';

export default class RectAnchor extends AbstractAnchor {
  getLocation(reference: Point): Point {
    const r = this.getOwner().getBoundingBox();
    const center = r.getCenter();
    if (r.isEmpty()) {
      return center;
    }

    let dx = reference.x - center.x;
    let dy = reference.y - center.y;

    if (dx === 0 || dy === 0) {
      return center;
    }

    const scale = 0.5 / Math.max(Math.abs(dx) / r.width, Math.abs(dy) / r.height);

    dx *= scale;
    dy *= scale;

    center.translate(dx, dy);
    return center;
  }
}
