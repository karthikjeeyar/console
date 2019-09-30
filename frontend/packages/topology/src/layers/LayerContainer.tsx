import * as React from 'react';
import LayerXYContext from './LayerXYContext';

const LayerContainer: React.FC = ({ children }) => (
  <LayerXYContext.Consumer>
    {({ x, y }) => <g transform={`translate(${x}, ${y})`}>{children}</g>}
  </LayerXYContext.Consumer>
);

export default LayerContainer;
