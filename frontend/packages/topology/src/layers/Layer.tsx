import * as React from 'react';
import { createPortal } from 'react-dom';
import LayersContext from './LayersContext';

type LayerProps = {
  id: string;
  children: React.ReactNode;
};

const Layer: React.FC<LayerProps> = ({ id, children }) => (
  <LayersContext.Consumer>
    {({ getLayerNode }) => {
      const layerNode = getLayerNode(id);
      return layerNode ? createPortal(children, layerNode) : children;
    }}
  </LayersContext.Consumer>
);

export default Layer;
