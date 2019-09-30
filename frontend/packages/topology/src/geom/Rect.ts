import { observable } from 'mobx';
import Point from './Point';

export default class Rect {
  static readonly EMPTY = new Rect();

  @observable
  width: number = 0;

  @observable
  height: number = 0;

  @observable
  x: number = 0;

  @observable
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
}
