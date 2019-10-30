import { Translatable } from './types';
import Point from './Point';

export default class Rect implements Translatable {
  static readonly EMPTY = new Rect();

  width: number = 0;

  height: number = 0;

  x: number = 0;

  y: number = 0;

  private static SINGLETON = new Rect();

  static singleUse(x: number = 0, y: number = 0, width: number = 0, height: number = 0) {
    Rect.SINGLETON.x = x;
    Rect.SINGLETON.y = y;
    Rect.SINGLETON.width = width;
    Rect.SINGLETON.height = height;
    return Rect.SINGLETON;
  }

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

  scale(scaleX: number, scaleY?: number): Rect {
    const sy = scaleY != null ? scaleY : scaleX;
    const xx = this.x;
    const yy = this.y;
    this.x *= scaleX;
    this.y *= sy;
    this.width = (xx + this.width) * scaleX - this.x;
    this.height = (yy + this.height) * sy - this.y;
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

  union({ x, y, width, height }: Rect): Rect {
    const right = Math.max(this.x + this.width, x + width);
    const bottom = Math.max(this.y + this.height, y + height);
    this.x = Math.min(this.x, x);
    this.y = Math.min(this.y, y);
    this.width = right - this.x;
    this.height = bottom - this.y;
    return this;
  }

  expand(h: number, v: number): Rect {
    this.x -= h;
    this.width += h * 2;
    this.y -= v;
    this.height += v * 2;
    return this;
  }

  setBounds(x: number, y: number, width: number, height: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    return this;
  }

  clone(): Rect {
    return Rect.fromRect(this);
  }

  equals(r: Rect) {
    return r.x === this.x && r.y === this.y && r.width === this.width && r.height === this.height;
  }
}
