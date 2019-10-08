import * as React from 'react';
import { action } from 'mobx';
import { observer } from 'mobx-react';
import { useComputed } from 'mobx-react-lite';
import { EventListener, ElementEntity } from '../types';

export const SELECTION_EVENT = 'selection';

export type SelectionEventListener = EventListener<[string[]]>;

type SelectionHandlerState = {
  selectedIds?: string[];
};

export type OnSelect = (e: React.MouseEvent) => void;

export const useSelection = (
  entity: ElementEntity,
  multi: boolean = false,
  controlled: boolean = false,
): [boolean, OnSelect] => {
  const selected = useComputed(() => {
    const { selectedIds } = entity.getController().getState<SelectionHandlerState>();
    return !!selectedIds && selectedIds.includes(entity.getId());
  });
  const onSelect = React.useCallback(
    action(
      (e: React.MouseEvent): void => {
        const id = entity.getId();
        const state = entity.getController().getState<SelectionHandlerState>();
        const idx = state.selectedIds ? state.selectedIds.indexOf(id) : -1;
        let selectedIds: string[];
        let raise = false;
        if (multi && (e.ctrlKey || e.metaKey)) {
          if (!state.selectedIds) {
            raise = true;
            selectedIds = [id];
          } else {
            selectedIds = [...state.selectedIds];
            if (idx === -1) {
              raise = true;
              selectedIds.push(id);
            } else {
              selectedIds.splice(idx, 1);
            }
          }
        } else if (idx === -1 || multi) {
          raise = true;
          selectedIds = [id];
        } else {
          selectedIds = [];
        }
        if (!controlled) {
          state.selectedIds = selectedIds;
        }
        entity.getController().fireEvent(SELECTION_EVENT, selectedIds);
        if (raise) {
          entity.raise();
        }
      },
    ),
    [controlled, entity, multi],
  );
  return [selected, onSelect];
};

export type WithSelectionProps = {
  selected: boolean;
  onSelect: OnSelect;
};

type EntityProps = {
  entity: ElementEntity;
};

export const withSelection = (multi: boolean = false, controlled: boolean = false) => <
  P extends WithSelectionProps
>(
  WrappedComponent: React.ComponentType<P>,
) => {
  const Component: React.FC<Omit<P, keyof WithSelectionProps> & EntityProps> = (props) => {
    const [selected, onSelect] = useSelection(props.entity, multi, controlled);
    return <WrappedComponent {...props as any} selected={selected} onSelect={onSelect} />;
  };
  return observer(Component);
};
