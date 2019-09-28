export default class Point {
  static readonly EMPTY = new Point();

  x: number;

  y: number;

  static fromPoint(point: Point): Point {
    return new Point(point.x, point.y);
  }

  constructor(x: number = 0, y: number = 0) {
    this.x = x;
    this.y = y;
  }

  setLocation(x: number, y: number): Point {
    this.x = x;
    this.y = y;
    return this;
  }

  negate(): Point {
    this.x = -this.x;
    this.y = -this.y;
    return this;
  }

  translate(dx: number, dy: number): Point {
    this.x += dx;
    this.y += dy;
    return this;
  }

  clone(): Point {
    return Point.fromPoint(this);
  }
}
