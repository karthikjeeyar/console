import Point from '../geom/Point';
import { Anchor, NodeEntity } from '../types';

export default abstract class AbstractAnchor<E extends NodeEntity = NodeEntity>
  implements Anchor<E> {
  private owner: NodeEntity;

  constructor(owner: NodeEntity) {
    this.owner = owner;
  }

  protected getOwner(): NodeEntity {
    return this.owner;
  }

  abstract getLocation(reference: Point): Point;

  getReferencePoint(): Point {
    return this.owner.getBounds().getCenter();
  }
}
