import { Edge, Model, Node } from '@console/topology/src/types';
import { TopologyDataModel } from '../topology/topology-types';

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

export { topologyModelFromDataModel };
