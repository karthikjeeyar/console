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
} from './dnd-types';
import { useDndManager } from './useDndManager';

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
  const dndManagerRef = React.useRef(dndManager);
  dndManagerRef.current = dndManager;

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
        return dndManagerRef.current.canDragSource(idRef.current);
      },
      isDragging: (): boolean => {
        return dndManagerRef.current.isDraggingSource(idRef.current);
      },
      getItemType: (): Identifier | undefined => {
        return dndManagerRef.current.getItemType();
      },
      getItem: (): any => {
        return dndManagerRef.current.getItem();
      },
      getDropResult: (): any => {
        return dndManagerRef.current.getDropResult();
      },
      didDrop: (): boolean => {
        return dndManagerRef.current.didDrop();
      },
      getDragEvent: (): DragEvent | undefined => {
        return dndManagerRef.current.getDragEvent();
      },
    };
    return sourceMonitor;
  }, []);
  const monitorRef = React.useRef(monitor);
  monitorRef.current = monitor;

  const refCallback = useCallbackRef(
    React.useCallback((node: SVGElement | null) => {
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
              d3.select(node.ownerDocument).on('keydown.useDndDrag', () => {
                const e = d3.event as KeyboardEvent;
                if (e.key === 'Escape') {
                  d3.select(d3.event.view).on('.drag', null);
                  d3.select(node.ownerDocument).on('.useDndDrag', null);
                  dndManagerRef.current.cancel();
                  dndManagerRef.current.endDrag();
                }
              });
            })
            .on(
              'drag',
              action(() => {
                const { pageX, pageY } = d3.event.sourceEvent;
                if (!dndManagerRef.current.isDragging()) {
                  if (idRef.current) {
                    dndManagerRef.current.beginDrag(
                      idRef.current,
                      d3.event.x,
                      d3.event.y,
                      pageX,
                      pageY,
                    );
                  }
                } else {
                  dndManagerRef.current.drag(d3.event.x, d3.event.y, pageX, pageY);
                }
              }),
            )
            .on(
              'end',
              action(() => {
                dndManagerRef.current.drop();
                dndManagerRef.current.endDrag();
              }),
            )
            .filter(() => dndManagerRef.current.canDragSource(idRef.current)),
        );
      }
      return () => {
        node && d3.select(node).on('mousedown.drag', null);
      };
    }, []),
  );

  React.useEffect(() => {
    const [sourceId, unregister] = dndManager.registerSource({
      type: spec.item.type,
      canDrag: (): boolean =>
        typeof specRef.current.canDrag === 'boolean'
          ? specRef.current.canDrag
          : typeof specRef.current.canDrag === 'function'
          ? specRef.current.canDrag(monitorRef.current, propsRef.current)
          : true,
      beginDrag: (): any =>
        specRef.current.begin && specRef.current.begin(monitorRef.current, propsRef.current),

      drag: (): void => {
        if (specRef.current.drag) {
          const event = monitorRef.current.getDragEvent();
          if (event) {
            specRef.current.drag(event, monitorRef.current, propsRef.current);
          }
        }
      },
      endDrag: (): void =>
        specRef.current.end &&
        specRef.current.end(
          monitorRef.current.getDropResult(),
          monitorRef.current,
          propsRef.current,
        ),
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
