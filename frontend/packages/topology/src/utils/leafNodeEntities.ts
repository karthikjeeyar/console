import * as _ from 'lodash';
import { ElementEntity, isNodeEntity, NodeEntity } from '../types';

const leafNodeEntities = (nodeEntities: NodeEntity | NodeEntity[] | null): NodeEntity[] => {
  const nodes: NodeEntity[] = [];

  if (!nodeEntities) {
    return nodes;
  }

  if (Array.isArray(nodeEntities)) {
    _.forEach(nodeEntities, (nodeEntity: NodeEntity) => {
      nodes.push(...leafNodeEntities(nodeEntity));
    });
    return nodes;
  }

  const children: ElementEntity[] = nodeEntities.getChildren();
  if (_.size(children)) {
    const leafNodes: NodeEntity[] = [];
    _.forEach(children.filter((e) => isNodeEntity(e)), (entity: NodeEntity) => {
      leafNodes.push(...leafNodeEntities(entity));
    });
    return leafNodes;
  }

  return [nodeEntities];
};

export { leafNodeEntities };
