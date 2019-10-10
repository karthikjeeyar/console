import { Layout, LayoutFactory } from '../../src/types';
import ForceLayout from '../../src/layouts/ForceLayout';
import ColaLayout from '../../src/layouts/ColaLayout';
import DagreLayout from '../../src/layouts/DagreLayout';

const defaultLayoutFactory: LayoutFactory = (type: string): Layout | undefined => {
  switch (type) {
    case 'cola':
      return new ColaLayout();
    case 'dagre':
      return new DagreLayout();
    case 'force':
      return new ForceLayout();
    default:
      return undefined;
  }
};

export default defaultLayoutFactory;
