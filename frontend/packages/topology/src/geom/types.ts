export interface Translatable {
  translate(dx: number, dy: number): Translatable;
  scale(s: number): Translatable;
}
