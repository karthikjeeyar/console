import { Layout, LayoutFactory } from '../types';
import ForceLayout from './ForceLayout';
import ColaLayout from './ColaLayout';
import DagreLayout from './DagreLayout';

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
