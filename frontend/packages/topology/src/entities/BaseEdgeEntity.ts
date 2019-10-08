// import { computed } from 'mobx';
import { observable } from 'mobx';
import Point from '../geom/Point';
import { EdgeEntity, NodeEntity, Edge, ModelKind } from '../types';
import BaseElementEntity from './BaseElementEntity';

export default class BaseEdgeEntity<E extends Edge = Edge, D = any> extends BaseElementEntity<E, D>
  implements EdgeEntity<E, D> {
  @observable
  private source: string;

  @observable
  private target: string;

  @observable.shallow
  private bendpoints: Point[];

  @observable.ref
  private startPoint?: Point;

  @observable.ref
  private endPoint?: Point;

  get kind(): ModelKind {
    return ModelKind.edge;
  }

  // @computed (switch to getter)
  getSource(): NodeEntity {
    return this.getController().getNodeById(this.source);
  }

  setSource(source: NodeEntity) {
    this.source = source.getId();
  }

  // @computed (switch to getter)
  getTarget(): NodeEntity {
    return this.getController().getNodeById(this.target);
  }

  setTarget(target: NodeEntity) {
    this.target = target.getId();
  }

  getBendpoints(): Point[] {
    return this.bendpoints || [];
  }

  setBendpoints(points: Point[]) {
    this.bendpoints = points;
  }

  // @computed (switch to getter)
  getStartPoint(): Point {
    if (this.startPoint) {
      return this.startPoint;
    }
    const bendpoints = this.getBendpoints();
    let referencePoint: Point;
    if (bendpoints && bendpoints.length > 0) {
      [referencePoint] = bendpoints;
    } else if (this.endPoint) {
      referencePoint = this.endPoint;
    } else {
      const target = this.getTarget();
      if (target) {
        referencePoint = target.getAnchor().getReferencePoint();
      } else {
        throw new Error('Cannot compute start point. Missing target.');
      }
    }
    const source = this.getSource();
    if (!source) {
      throw new Error('Cannot compute start point. Missing source.');
    }
    return source.getAnchor().getLocation(referencePoint);
  }

  setStartPoint(x?: number, y?: number): void {
    if (x == null || y == null) {
      this.startPoint = undefined;
    } else if (this.startPoint) {
      this.startPoint.setLocation(x, y);
    } else {
      this.startPoint = new Point(x, y);
    }
  }

  // @computed (switch to getter)
  getEndPoint(): Point {
    if (this.endPoint) {
      return this.endPoint;
    }
    const bendpoints = this.getBendpoints();
    let referencePoint: Point;
    if (bendpoints && bendpoints.length > 0) {
      referencePoint = bendpoints[bendpoints.length - 1];
    } else if (this.startPoint) {
      referencePoint = this.startPoint;
    } else {
      const source = this.getSource();
      if (source) {
        referencePoint = source.getAnchor().getReferencePoint();
      } else {
        throw new Error('Cannot compute end point. Missing source.');
      }
    }
    const target = this.getTarget();
    if (!target) {
      throw new Error('Cannot compute end point. Missing target.');
    }
    return target.getAnchor().getLocation(referencePoint);
  }

  setEndPoint(x?: number, y?: number): void {
    if (x == null || y == null) {
      this.endPoint = undefined;
    } else if (this.endPoint) {
      this.endPoint.setLocation(x, y);
    } else {
      this.endPoint = new Point(x, y);
    }
  }

  setModel(model: E): void {
    super.setModel(model);
    if (model.source) {
      this.source = model.source;
    }
    if (model.target) {
      this.target = model.target;
    }
    if ('bendpoints' in model) {
      this.bendpoints = model.bendpoints ? model.bendpoints.map((b) => new Point(b[0], b[1])) : [];
    }
  }
}
