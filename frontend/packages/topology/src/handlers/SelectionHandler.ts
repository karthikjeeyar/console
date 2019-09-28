import { computed } from 'mobx';
import { MouseEvent } from 'react';
import { EventListener } from '../types';
import AbstractInteractionHandler from './AbstractInteractionHandler';

export const SELECTION_EVENT = 'selection';

export type SelectionEventListener = EventListener<[string[]]>;

type SelectionHandlerState = {
  selectedIds?: string[];
};

export type SelectionHandlerProps = {
  selected: boolean;
  onSelect: () => void;
};

export default class SelectionHandler extends AbstractInteractionHandler<SelectionHandlerState> {
  private controlled: boolean;

  private multi: boolean;

  constructor(controlled: boolean = false, multi: boolean = false) {
    super();
    this.controlled = controlled;
    this.multi = multi;
  }

  @computed
  private get selected(): boolean {
    const { selectedIds } = this.getState();
    return !!selectedIds && selectedIds.includes(this.getOwner().getId());
  }

  private onSelect = (e: MouseEvent) => {
    const id = this.getOwner().getId();
    const state = this.getState();
    const idx = state.selectedIds ? state.selectedIds.indexOf(id) : -1;
    let selectedIds: string[];
    if (this.multi && (e.ctrlKey || e.metaKey)) {
      if (!state.selectedIds) {
        selectedIds = [id];
      } else {
        selectedIds = [...state.selectedIds];
        if (idx === -1) {
          selectedIds.push(id);
        } else {
          selectedIds.splice(idx, 1);
        }
      }
    } else if (idx === -1 || this.multi) {
      selectedIds = [id];
    } else {
      selectedIds = [];
    }
    if (!this.controlled) {
      state.selectedIds = selectedIds;
    }
    this.fireEvent(SELECTION_EVENT, selectedIds);
  };

  getProps(): {} | undefined {
    return {
      selected: this.selected,
      onSelect: this.onSelect,
    };
  }
}
