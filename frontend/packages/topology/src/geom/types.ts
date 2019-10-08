export interface Translatable {
  translate<T extends Translatable>(dx: number, dy: number): Translatable;
  scale<T extends Translatable>(s: number): Translatable;
}
