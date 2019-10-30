import * as React from 'react';
import { action, computed } from 'mobx';
import { observer } from 'mobx-react';
import { EventListener } from '../types';
import EntityContext from '../utils/EntityContext';

export const SELECTION_EVENT = 'selection';

export type SelectionEventListener = EventListener<[string[]]>;

type SelectionHandlerState = {
  selectedIds?: string[];
};

export type OnSelect = (e: React.MouseEvent) => void;

export const useSelection = (
  multi: boolean = false,
  controlled: boolean = false,
): [boolean, OnSelect] => {
  const entity = React.useContext(EntityContext);
  const entityRef = React.useRef(entity);
  entityRef.current = entity;

  const selected = React.useMemo(
    () =>
      computed(() => {
        const { selectedIds } = entity.getController().getState<SelectionHandlerState>();
        return !!selectedIds && selectedIds.includes(entity.getId());
      }),
    [entity],
  );

  const onSelect = React.useCallback(
    action(
      (e: React.MouseEvent): void => {
        e.stopPropagation();
        const id = entityRef.current.getId();
        const state = entityRef.current.getController().getState<SelectionHandlerState>();
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
        entityRef.current.getController().fireEvent(SELECTION_EVENT, selectedIds);
        if (raise) {
          entityRef.current.raise();
        }
      },
    ),
    [],
  );
  return [selected.get(), onSelect];
};

export type WithSelectionProps = {
  selected: boolean;
  onSelect: OnSelect;
};

export const withSelection = (multi: boolean = false, controlled: boolean = false) => <
  P extends WithSelectionProps
>(
  WrappedComponent: React.ComponentType<P>,
) => {
  const Component: React.FC<Omit<P, keyof WithSelectionProps>> = (props) => {
    const [selected, onSelect] = useSelection(multi, controlled);
    return <WrappedComponent {...props as any} selected={selected} onSelect={onSelect} />;
  };
  return observer(Component);
};
