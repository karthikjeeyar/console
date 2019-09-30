import { EntityFactory, ElementEntity, ModelKind } from '../types';
import BaseEdgeEntity from './BaseEdgeEntity';
import BaseGraphEntity from './BaseGraphEntity';
import BaseNodeEntity from './BaseNodeEntity';

const defaultEntityFactory: EntityFactory = (kind: ModelKind): ElementEntity | undefined => {
  switch (kind) {
    case ModelKind.graph:
      return new BaseGraphEntity();
    case ModelKind.node:
      return new BaseNodeEntity();
    case ModelKind.edge:
      return new BaseEdgeEntity();
    default:
      return undefined;
  }
};

export default defaultEntityFactory;
