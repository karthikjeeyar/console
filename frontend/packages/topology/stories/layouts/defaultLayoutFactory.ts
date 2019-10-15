import { GraphEntity, Layout, LayoutFactory } from '../../src/types';
import ForceLayout from '../../src/layouts/ForceLayout';
import ColaLayout from '../../src/layouts/ColaLayout';
import DagreLayout from '../../src/layouts/DagreLayout';

const defaultLayoutFactory: LayoutFactory = (
  type: string,
  graph: GraphEntity,
): Layout | undefined => {
  switch (type) {
    case 'Cola':
      return new ColaLayout(graph);
    case 'Dagre':
      return new DagreLayout(graph);
    case 'Force':
      return new ForceLayout(graph);
    default:
      return undefined;
  }
};

export default defaultLayoutFactory;
