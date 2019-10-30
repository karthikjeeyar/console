import * as _ from 'lodash';
import { ElementEntity, NodeEntity, isNodeEntity } from '../types';

const groupNodeEntities = (nodes: ElementEntity[]): NodeEntity[] => {
  if (!_.size(nodes)) {
    return [];
  }
  const groupNodes: NodeEntity[] = [];
  _.forEach(nodes, (nextNode) => {
    if (isNodeEntity(nextNode) && nextNode.isGroup()) {
      groupNodes.push(nextNode);
      groupNodes.push(...groupNodeEntities(nextNode.getChildren()));
    }
  });
  return groupNodes;
};

export { groupNodeEntities };
