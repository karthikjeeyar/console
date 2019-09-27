import { EventListener } from '../types';
import AbstractInteractionHandler from './AbstractInteractionHandler';

export const SELECTION_EVENT = 'selection';

export type SelectionEventListener = EventListener<[string]>;

// TODO supprt multi selection in the future
export type SelectionHandlerState = {
  selectedId?: string;
};

export type SelectionHandlerProps = {
  selected: boolean;
  onSelect: () => void;
};

export default class SelectionHandler extends AbstractInteractionHandler<SelectionHandlerState> {
  private controlled: boolean;

  constructor(controlled: boolean = false) {
    super();
    this.controlled = controlled;
  }

  getProps() {
    return {
      selected: this.getOwner().getId() === this.getState().selectedId,
      onSelect: () => {
        const id = this.getOwner().getId();
        const state = this.getState();
        const { selectedId } = state;
        if (id === selectedId) {
          if (!this.controlled) {
            delete state.selectedId;
          }
          this.getOwner()
            .getController()
            .fireEvent(SELECTION_EVENT, undefined);
        } else {
          if (!this.controlled) {
            state.selectedId = id;
          }
          this.getOwner()
            .getController()
            .fireEvent(SELECTION_EVENT, id);
        }
      },
    };
  }
}
