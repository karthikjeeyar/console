import * as React from 'react';
import { createPortal } from 'react-dom';
import LayersContext from './LayersContext';
import LayerContainer from './LayerContainer';

type LayerProps = {
  id: string | null;
  children: React.ReactNode;
};

// TODO creating a portal doesn't let children re-render their order
const Layer: React.FC<LayerProps> = ({ id, children }) => (
  <LayersContext.Consumer>
    {(getLayerNode) => {
      const layerNode = id ? getLayerNode(id) : null;
      return layerNode
        ? createPortal(<LayerContainer>{children}</LayerContainer>, layerNode)
        : children;
    }}
  </LayersContext.Consumer>
);

export default Layer;
