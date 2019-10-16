import * as _ from 'lodash';
import { ElementEntity, NodeEntity } from '../types';

const groupNodeEntities = (nodes: ElementEntity[]): NodeEntity[] => {
  if (!_.size(nodes)) {
    return [];
  }
  const groupNodes: NodeEntity[] = [];
  _.forEach(nodes, (nextNode: NodeEntity) => {
    if (nextNode.isGroup()) {
      groupNodes.push(nextNode);
      groupNodes.push(...groupNodeEntities(nextNode.getChildren()));
    }
  });
  return groupNodes;
};

export { groupNodeEntities };
