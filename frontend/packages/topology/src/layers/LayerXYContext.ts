import { createContext } from 'react';

type LayersXYContextProps = {
  x?: number;
  y?: number;
};

// TODO this is a decent first cut however nested nodes that portal to a new layer may
// be in the wrong coordinate system due to missing parent transforms.
// Need an entity to consist of a computed bbox such that we can use it instead of just the
// x,y of the parent node.
const LayerXYContext = createContext<LayersXYContextProps>({ x: 0, y: 0 });

export default LayerXYContext;
