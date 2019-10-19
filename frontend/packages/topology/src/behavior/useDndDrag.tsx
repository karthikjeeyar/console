import * as React from 'react';
import * as d3 from 'd3';
import { action } from 'mobx';
import { observer } from 'mobx-react';
import EntityContext from '../utils/EntityContext';
import useCallbackRef from '../utils/useCallbackRef';
import {
  DragSourceSpec,
  ConnectDragSource,
  DragObjectWithType,
  DragSourceMonitor,
  Identifier,
  DragEvent,
  DragSpecOperation,
} from './dnd-types';
import { useDndManager } from './useDndManager';

export const Modifiers = {
  NONE: 0,
  ALT: 0x01,
  CTRL: 0x02,
  META: 0x04,
  SHIFT: 0x08,
};

const getModifiers = (event: MouseEvent | TouchEvent | KeyboardEvent): number => {
  let modifiers = Modifiers.NONE;
  if (event.altKey) {
    // eslint-disable-next-line no-bitwise
    modifiers |= Modifiers.ALT;
  }
  if (event.ctrlKey) {
    // eslint-disable-next-line no-bitwise
    modifiers |= Modifiers.CTRL;
  }
  if (event.metaKey) {
    // eslint-disable-next-line no-bitwise
    modifiers |= Modifiers.META;
  }
  if (event.shiftKey) {
    // eslint-disable-next-line no-bitwise
    modifiers |= Modifiers.SHIFT;
  }
  return modifiers;
};

const getOperation = (operation: DragSpecOperation | undefined): string => {
  if (typeof operation === 'string') {
    return operation;
  }
  return (
    (operation && operation[getModifiers((d3.event && d3.event.sourceEvent) || d3.event)]) || ''
  );
};

export const useDndDrag = <
  DragObject extends DragObjectWithType,
  DropResult,
  CollectedProps,
  Props = {}
>(
  spec: DragSourceSpec<DragObject, DropResult, CollectedProps>,
  props?: Props,
): [CollectedProps, ConnectDragSource] => {
  const specRef = React.useRef(spec);
  specRef.current = spec;

  const propsRef = React.useRef(props);
  propsRef.current = props;

  const dndManager = useDndManager();

  const entity = React.useContext(EntityContext);
  const entityRef = React.useRef(entity);
  entityRef.current = entity;

  const idRef = React.useRef<string>();

  // source monitor
  const monitor = React.useMemo(() => {
    const sourceMonitor: DragSourceMonitor = {
      getHandlerId: (): string | undefined => {
        return idRef.current;
      },
      receiveHandlerId: (sourceId: string | undefined): void => {
        idRef.current = sourceId;
      },
      canDrag: (): boolean => {
        return dndManager.canDragSource(idRef.current);
      },
      isDragging: (): boolean => {
        return dndManager.isDraggingSource(idRef.current);
      },
      getItemType: (): Identifier | undefined => {
        return dndManager.getItemType();
      },
      getItem: (): any => {
        return dndManager.getItem();
      },
      getDropResult: (): any => {
        return dndManager.getDropResult();
      },
      didDrop: (): boolean => {
        return dndManager.didDrop();
      },
      getDragEvent: (): DragEvent | undefined => {
        return dndManager.getDragEvent();
      },
      getOperation: (): string => {
        return dndManager.getOperation();
      },
    };
    return sourceMonitor;
  }, [dndManager]);

  const refCallback = useCallbackRef(
    React.useCallback(
      (node: SVGElement | null) => {
        if (node) {
          d3.select(node).call(
            d3
              .drag()
              .container(
                // TODO bridge the gap between scene tree and dom tree
                () =>
                  d3
                    .select(node.ownerSVGElement)
                    .select(
                      `[data-id="${entityRef.current
                        .getController()
                        .getGraph()
                        .getId()}"]`,
                    )
                    .node() as any,
              )
              .on('start', function() {
                const updateOperation = () => {
                  const { operation } = specRef.current;
                  if (operation) {
                    const op = getOperation(operation);
                    if (dndManager.getOperation() !== op) {
                      // restart the drag with the new operation
                      const event = { ...(dndManager.getDragEvent() as DragEvent) };
                      const sourceId = dndManager.getSourceId() as string;
                      dndManager.cancel();
                      dndManager.endDrag();
                      dndManager.beginDrag(
                        sourceId,
                        op,
                        event.initialX,
                        event.initialY,
                        event.initialPageX,
                        event.initialPageY,
                      );
                      dndManager.drag(event.x, event.y, event.pageX, event.pageY);
                    }
                  }
                };
                d3.select(node.ownerDocument)
                  .on(
                    'keydown.useDndDrag',
                    action(() => {
                      const e = d3.event as KeyboardEvent;
                      if (e.key === 'Escape') {
                        d3.select(d3.event.view).on('.drag', null);
                        d3.select(node.ownerDocument).on('.useDndDrag', null);
                        dndManager.cancel();
                        dndManager.endDrag();
                      } else {
                        updateOperation();
                      }
                    }),
                  )
                  .on('keyup.useDndDrag', action(updateOperation));
              })
              .on(
                'drag',
                action(() => {
                  const { pageX, pageY } = d3.event.sourceEvent;
                  if (!dndManager.isDragging()) {
                    if (idRef.current) {
                      dndManager.beginDrag(
                        idRef.current,
                        getOperation(spec.operation),
                        d3.event.x,
                        d3.event.y,
                        pageX,
                        pageY,
                      );
                    }
                  } else {
                    dndManager.drag(d3.event.x, d3.event.y, pageX, pageY);
                  }
                }),
              )
              .on(
                'end',
                action(() => {
                  d3.select(node.ownerDocument).on('.useDndDrag', null);
                  dndManager.drop();
                  dndManager.endDrag();
                }),
              )
              .filter(() => dndManager.canDragSource(idRef.current)),
          );
        }
        return () => {
          node && d3.select(node).on('mousedown.drag', null);
        };
      },
      [dndManager, spec.operation],
    ),
  );

  React.useEffect(() => {
    const [sourceId, unregister] = dndManager.registerSource({
      type: spec.item.type,
      canDrag: (): boolean =>
        typeof specRef.current.canDrag === 'boolean'
          ? specRef.current.canDrag
          : typeof specRef.current.canDrag === 'function'
          ? specRef.current.canDrag(monitor, propsRef.current)
          : true,
      beginDrag: (): any =>
        specRef.current.begin && specRef.current.begin(monitor, propsRef.current),

      drag: (): void => {
        if (specRef.current.drag) {
          const event = monitor.getDragEvent();
          if (event) {
            specRef.current.drag(event, monitor, propsRef.current);
          }
        }
      },
      endDrag: (): void =>
        specRef.current.end &&
        specRef.current.end(monitor.getDropResult(), monitor, propsRef.current),
    });
    monitor.receiveHandlerId(sourceId);
    return unregister;
  }, [spec.item.type, dndManager, monitor]);

  return [spec.collect ? spec.collect(monitor) : (({} as any) as CollectedProps), refCallback];
};

export type WithDndDragProps = {
  dndDragRef: ConnectDragSource;
};

export const withDndDrag = <
  DragObject extends DragObjectWithType,
  DropResult,
  CollectedProps,
  Props = {}
>(
  spec: DragSourceSpec<DragObject, DropResult, CollectedProps, Props>,
) => <P extends WithDndDragProps & CollectedProps & Props>(
  WrappedComponent: React.ComponentType<P>,
) => {
  const Component: React.FC<Omit<P, keyof WithDndDragProps & CollectedProps>> = (props) => {
    const [dndDragProps, dndDragRef] = useDndDrag(spec, props);
    return <WrappedComponent {...props as any} dndDragRef={dndDragRef} {...dndDragProps} />;
  };
  return observer(Component);
};
