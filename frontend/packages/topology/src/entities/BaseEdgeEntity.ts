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

  // TODO make readonly
  getBendpoints(): Point[] {
    return this.bendpoints || [];
  }

  // @computed (switch to getter)
  getStartPoint(): Point {
    const bendpoints = this.getBendpoints();
    let referencePoint: Point;
    if (bendpoints && bendpoints.length > 0) {
      [referencePoint] = bendpoints;
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

  // @computed (switch to getter)
  getEndPoint(): Point {
    const bendpoints = this.getBendpoints();
    let referencePoint: Point;
    if (bendpoints && bendpoints.length > 0) {
      referencePoint = bendpoints[bendpoints.length - 1];
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

  remove(): void {
    super.remove();
    const graph = this.getGraph();
    graph.removeEdge(this);
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
