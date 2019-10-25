import { GraphEntity, Layout, LayoutFactory } from '@console/topology/src/types';
import ForceLayout from '@console/topology/src/layouts/ForceLayout';

const layoutFactory: LayoutFactory = (type: string, graph: GraphEntity): Layout | undefined => {
  switch (type) {
    case 'Force':
      return new ForceLayout(graph, {
        linkDistance: 80,
        collideDistance: 30,
        chargeStrength: -50,
      });
    default:
      return undefined;
  }
};

export default layoutFactory;
