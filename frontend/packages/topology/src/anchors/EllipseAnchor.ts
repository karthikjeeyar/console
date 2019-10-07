import Point from '../geom/Point';
import AbstractAnchor from './AbstractAnchor';

export default class EllipseAnchor extends AbstractAnchor {
  getLocation(reference: Point): Point {
    const r = this.getOwner().getBounds();
    if (r.isEmpty()) {
      return r.getCenter();
    }
    const ref = r
      .getCenter()
      .negate()
      .translate(reference.x, reference.y);
    if (ref.x === 0) {
      return new Point(reference.x, ref.y > 0 ? r.bottom() : r.y);
    }
    if (ref.y === 0) {
      return new Point(ref.x > 0 ? r.right() : r.x, reference.y);
    }
    const dx = ref.x > 0 ? 0.5 : -0.5;
    const dy = ref.y > 0 ? 0.5 : -0.5;
    let k = (ref.y * r.width) / (ref.x * r.height);
    k *= k;
    return r
      .getCenter()
      .translate((r.width * dx) / Math.sqrt(1 + k), (r.height * dy) / Math.sqrt(1 + 1 / k));
  }
}
