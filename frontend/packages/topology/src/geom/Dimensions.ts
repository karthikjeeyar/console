export default class Dimensions {
  width: number;

  height: number;

  static fromDimensions(dimensions: Dimensions): Dimensions {
    return new Dimensions(dimensions.width, dimensions.height);
  }

  constructor(width: number = 0, height: number = 0) {
    this.width = width;
    this.height = height;
  }

  setSize(width: number, height: number): Dimensions {
    this.width = width;
    this.height = height;
    return this;
  }

  clone(): Dimensions {
    return Dimensions.fromDimensions(this);
  }
}
