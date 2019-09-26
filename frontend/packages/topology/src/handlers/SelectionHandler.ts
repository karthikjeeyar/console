import AbstractInteractionHandler from './AbstractInteractionHandler';

// TODO supprt multi selection in the future
export type SelectionHandlerState = {
  selectedId?: string;
};

export type SelectionHandlerProps = {
  selected: boolean;
  onSelect: () => void;
};

export default class SelectionHandler extends AbstractInteractionHandler<SelectionHandlerState> {
  getProps() {
    return {
      selected: this.getOwner().getId() === this.getState().selectedId,
      onSelect: () => {
        const id = this.getOwner().getId();
        const state = this.getState();
        const { selectedId } = state;
        // TODO emit event instead of controlling state here
        if (id === selectedId) {
          delete state.selectedId;
        } else {
          state.selectedId = id;
        }
      },
    };
  }
}
