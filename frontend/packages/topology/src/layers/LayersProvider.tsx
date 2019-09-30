import * as React from 'react';
import LayersContext from './LayersContext';

export const DEFAULT_LAYER = 'default';
type LayersProviderProps = {
  tag?: 'string';
  layers?: string[];
  children?: React.ReactNode;
};

type State = { [id: string]: Element };

export default class LayersProvider extends React.Component<LayersProviderProps, State> {
  constructor(props: LayersProviderProps) {
    super(props);
    this.state = {};
  }

  private setDomLayers = (node: Element, id: string) => {
    if (node && this.state[id] !== node) {
      this.setState((state) => ({ ...state, [id]: node }));
    }
  };

  render() {
    const { tag = 'g', layers, children } = this.props;
    if (layers && !layers.includes(DEFAULT_LAYER)) {
      throw new Error('Missing default layer.');
    }
    const layerIds = layers || [DEFAULT_LAYER];
    return (
      <LayersContext.Provider
        value={{
          getLayerNode: (id) => {
            if (this.state[id]) {
              return this.state[id];
            }
            throw new Error(`Unknown layer ${id}`);
          },
        }}
      >
        {layerIds.map((id) =>
          React.createElement(
            tag,
            {
              key: id,
              'data-layer-id': id,
              ref: (r: any) => this.setDomLayers(r, id),
            },
            id === DEFAULT_LAYER && this.state[id] ? children : undefined,
          ),
        )}
      </LayersContext.Provider>
    );
  }
}
