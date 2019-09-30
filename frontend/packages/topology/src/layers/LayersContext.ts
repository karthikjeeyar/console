import { createContext } from 'react';

type LayersContextProps = {
  getLayerNode: (id: string) => Element;
};

const LayersContext = createContext<LayersContextProps>(undefined as any);

export default LayersContext;
