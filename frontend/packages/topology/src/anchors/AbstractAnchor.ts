import Point from '../geom/Point';
import { Anchor, NodeEntity } from '../types';

export default abstract class AbstractAnchor implements Anchor {
  private owner: NodeEntity;

  constructor(owner: NodeEntity) {
    this.owner = owner;
  }

  getOwner(): NodeEntity {
    return this.owner;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getLocation(reference: Point): Point {
    throw new Error('Not implemented.');
  }

  getReferencePoint(): Point {
    return this.owner.getBoundingBox().getCenter();
  }
}
