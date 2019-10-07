import Point from '../geom/Point';
import { Anchor, NodeEntity } from '../types';

export default abstract class AbstractAnchor<E extends NodeEntity = NodeEntity>
  implements Anchor<E> {
  private owner: NodeEntity;

  constructor(owner?: NodeEntity) {
    if (owner) {
      this.owner = owner;
    }
  }

  setOwner(owner: E): void {
    this.owner = owner;
  }

  protected getOwner(): NodeEntity {
    return this.owner;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getLocation(reference: Point): Point {
    throw new Error('Not implemented.');
  }

  getReferencePoint(): Point {
    return this.owner.getBounds().getCenter();
  }
}
