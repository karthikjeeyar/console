import * as React from 'react';
import { Edge, Model, Node, NodeEntity } from '@console/topology/src/types';
import { confirmModal, errorModal } from '@console/internal/components/modals';
import { TopologyDataModel } from '../topology/topology-types';
import {
  createTopologyResourceConnection,
  updateTopologyResourceApplication,
} from '../topology/topology-utils';

const topologyModelFromDataModel = (dataModel: TopologyDataModel): Model => {
  const nodes: Node[] = dataModel.graph.nodes.map((d) => {
    return {
      width: 144,
      height: 144,
      id: d.id,
      type: d.type,
      label: dataModel.topology[d.id].name,
      data: dataModel.topology[d.id],
    };
  });

  const groupNodes: Node[] = dataModel.graph.groups.map((d) => {
    return {
      id: d.id,
      group: true,
      type: 'group',
      data: dataModel.topology[d.id],
      children: d.nodes,
      label: d.name,
    };
  });

  // create links from data
  const edges = dataModel.graph.edges.map(
    (d): Edge => ({
      data: d,
      source: d.source,
      target: d.target,
      id: `${d.source}_${d.target}`,
      type: 'edge',
    }),
  );

  // create topology model
  const model: Model = {
    nodes: [...nodes, ...groupNodes],
    edges,
  };

  return model;
};

const moveNodeToGroup = (node: NodeEntity, targetGroup: NodeEntity) => {
  const sourceGroup =
    node.getParent() !== node.getGraph() ? (node.getParent() as NodeEntity) : undefined;
  if (sourceGroup === targetGroup) {
    return;
  }

  const onComplete = () => {
    node.getGraph().layout();
  };

  if (sourceGroup) {
    const title = targetGroup ? 'Move Component Node' : 'Remove Component Node from Application';
    const message = (
      <React.Fragment>
        Are you sure you want to {targetGroup ? 'move' : 'remove'}{' '}
        <strong>{node.getLabel()}</strong> from {sourceGroup.getLabel()}
        {targetGroup ? ` to ${targetGroup.getLabel()}` : ''}?
      </React.Fragment>
    );
    const btnText = targetGroup ? 'Move' : 'Remove';

    confirmModal({
      title,
      message,
      btnText,
      executeFn: () => {
        return updateTopologyResourceApplication(
          node.getData(),
          targetGroup ? targetGroup.getLabel() : null,
        )
          .then(onComplete)
          .catch((err) => {
            const error = err.message;
            errorModal({ error });
          });
      },
    });
    return;
  }

  updateTopologyResourceApplication(node.getData(), targetGroup.getLabel())
    .then(onComplete)
    .catch((err) => {
      const error = err.message;
      errorModal({ error });
    });
};

const createConnection = (
  sourceNode: NodeEntity,
  targetNode: NodeEntity,
  replaceTargetNode: NodeEntity = null,
): Promise<any> => {
  return createTopologyResourceConnection(
    sourceNode.getData(),
    targetNode.getData(),
    replaceTargetNode ? replaceTargetNode.getData() : null,
  );
};

export { topologyModelFromDataModel, moveNodeToGroup, createConnection };
