import * as _ from 'lodash';
import { ElementEntity, NodeEntity } from '../types';

const groupNodeEntities = (nodes: ElementEntity[]): ElementEntity[] => {
  if (!_.size(nodes)) {
    return [];
  }
  const groupNodes: ElementEntity[] = [];
  _.forEach(nodes, (nextNode: NodeEntity) => {
    if (nextNode.isGroup()) {
      groupNodes.push(nextNode);
      groupNodes.push(...groupNodeEntities(nextNode.getChildren()));
    }
  });
  return groupNodes;
};

export { groupNodeEntities };
