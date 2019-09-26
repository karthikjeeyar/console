import Point from './Point';

export default class Rect {
  width: number = 0;

  height: number = 0;

  x: number = 0;

  y: number = 0;

  static fromRect(rect: Rect): Rect {
    return new Rect(rect.x, rect.y, rect.width, rect.height);
  }

  constructor(x: number = 0, y: number = 0, width: number = 0, height: number = 0) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  isEmpty(): boolean {
    return this.width <= 0 || this.height <= 0;
  }

  getLocation(): Point {
    return new Point(this.x, this.y);
  }

  setLocation(x: number, y: number): Rect {
    this.x = x;
    this.y = y;
    return this;
  }

  setSize(w: number, h: number): Rect {
    this.width = w;
    this.height = h;
    return this;
  }

  getCenter(): Point {
    return new Point(this.x + this.width / 2, this.y + this.height / 2);
  }

  setCenter(x: number, y: number): Rect {
    this.x = x - this.width / 2;
    this.y = y - this.height / 2;
    return this;
  }

  translate(dx: number, dy: number): Rect {
    this.x += dx;
    this.y += dy;
    return this;
  }

  resize(dw: number, dh: number): Rect {
    this.width += dw;
    this.height += dh;
    return this;
  }

  bottom(): number {
    return this.y + this.height;
  }

  right(): number {
    return this.x + this.width;
  }

  clone(): Rect {
    return Rect.fromRect(this);
  }
}
