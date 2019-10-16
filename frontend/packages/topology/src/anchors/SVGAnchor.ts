import { observable } from 'mobx';
import Point from '../geom/Point';
import Rect from '../geom/Rect';
import AbstractAnchor from './AbstractAnchor';
import {
  getEllipseAnchorPoint,
  getPathAnchorPoint,
  getPolygonAnchorPoint,
  getRectAnchorPoint,
} from './svgAnchorUtils';

export default class SVGAnchor extends AbstractAnchor {
  @observable.ref
  private svgElement: SVGElement;

  setSVGElement(svgElement: SVGElement) {
    this.svgElement = svgElement;
  }

  getCircleLocation(circle: SVGCircleElement, reference: Point): Point {
    const bounds: Rect = this.getOwner().getBounds();
    const center: Point = new Point(circle.cx.baseVal.value, circle.cy.baseVal.value).translate(
      bounds.x,
      bounds.y,
    );
    const radius = circle.r.baseVal.value * 2;

    // TODO use an circle algo
    return getEllipseAnchorPoint(center, radius, radius, reference);
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
    if (this.svgElement instanceof SVGCircleElement) {
      return this.getCircleLocation(this.svgElement, reference);
    }

    if (this.svgElement instanceof SVGEllipseElement) {
      return this.getEllipseLocation(this.svgElement, reference);
    }

    if (this.svgElement instanceof SVGRectElement) {
      return this.getRectLocation(this.svgElement, reference);
    }

    if (this.svgElement instanceof SVGPathElement) {
      return this.getPathLocation(this.svgElement, reference);
    }

    if (this.svgElement instanceof SVGPolygonElement) {
      return this.getPolygonLocation(this.svgElement, reference);
    }

    return this.getOwner()
      .getBounds()
      .getCenter();
  }
}
