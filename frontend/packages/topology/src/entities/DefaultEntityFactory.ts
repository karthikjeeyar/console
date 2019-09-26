import { EntityFactory, ElementEntity } from '../types';
import BaseEdgeEntity from './BaseEdgeEntity';
import BaseGraphEntity from './BaseGraphEntity';
import BaseNodeEntity from './BaseNodeEntity';

const defaultEntityFactory: EntityFactory = (type: string): ElementEntity | undefined => {
  switch (type) {
    case 'graph':
      return new BaseGraphEntity();
    case 'node':
      return new BaseNodeEntity();
    case 'edge':
      return new BaseEdgeEntity();
    default:
      return undefined;
  }
};

export default defaultEntityFactory;
