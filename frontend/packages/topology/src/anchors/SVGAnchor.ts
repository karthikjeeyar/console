import Point from '../geom/Point';
import Rect from '../geom/Rect';
import AbstractAnchor from './AbstractAnchor';
import {
  getEllipseAnchorPoint,
  getPathAnchorPoint,
  getPolygonAnchorPoint,
  getRectAnchorPoint,
} from './AnchorUtils';

export default class SVGAnchor extends AbstractAnchor {
  private svg: SVGElement;

  setSVG(svg: SVGElement) {
    this.svg = svg;
  }

  getEllipseLocation(ellipse: SVGEllipseElement, reference: Point): Point {
    const bounds: Rect = this.getOwner().getBounds();
    const center: Point = new Point(ellipse.cx.baseVal.value, ellipse.cy.baseVal.value).translate(
      bounds.x,
      bounds.y,
    );
    const width = ellipse.rx.baseVal.value * 2;
    const height = ellipse.ry.baseVal.value * 2;

    return getEllipseAnchorPoint(center, width, height, reference);
  }

  getRectLocation(rect: SVGRectElement, reference: Point): Point {
    const bounds: Rect = this.getOwner().getBounds();
    const width = rect.width.baseVal.value;
    const height = rect.height.baseVal.value;

    const center: Point = new Point(
      rect.x.baseVal.value + width / 2,
      rect.y.baseVal.value + height / 2,
    ).translate(bounds.x, bounds.y);

    return getRectAnchorPoint(center, width, height, reference);
  }

  getPathLocation(path: SVGPathElement, reference: Point): Point {
    const bounds: Rect = this.getOwner().getBounds();
    const translatedRef = reference.clone().translate(-bounds.x, -bounds.y);
    const anchorPoint = getPathAnchorPoint(path, translatedRef);

    return anchorPoint.translate(bounds.x, bounds.y);
  }

  getPolygonLocation(polygon: SVGPolygonElement, reference: Point): Point {
    const bounds: Rect = this.getOwner().getBounds();
    const translatedRef = reference.clone().translate(-bounds.x, -bounds.y);
    const anchorPoint = getPolygonAnchorPoint(polygon, translatedRef);

    return anchorPoint.translate(bounds.x, bounds.y);
  }

  getLocation(reference: Point): Point {
    if (this.svg instanceof SVGEllipseElement) {
      return this.getEllipseLocation(this.svg as SVGEllipseElement, reference);
    }

    if (this.svg instanceof SVGRectElement) {
      return this.getRectLocation(this.svg as SVGRectElement, reference);
    }

    if (this.svg instanceof SVGPathElement) {
      return this.getPathLocation(this.svg as SVGPathElement, reference);
    }

    if (this.svg instanceof SVGPolygonElement) {
      return this.getPolygonLocation(this.svg as SVGPolygonElement, reference);
    }

    return this.getOwner()
      .getBounds()
      .getCenter();
  }
}
