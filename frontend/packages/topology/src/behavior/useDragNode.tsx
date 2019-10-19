import * as React from 'react';
import { action } from 'mobx';
import { observer } from 'mobx-react';
import EntityContext from '../utils/EntityContext';
import { EventListener, isNodeEntity, NodeEntity } from '../types';
import { useDndDrag, WithDndDragProps, Modifiers } from './useDndDrag';
import {
  DragSourceSpec,
  DragEvent,
  ConnectDragSource,
  DragObjectWithType,
  DragSourceMonitor,
} from './dnd-types';

export const DRAG_NODE_EVENT = 'drag_node';
export const DRAG_NODE_START_EVENT = `${DRAG_NODE_EVENT}_start`;
export const DRAG_NODE_END_EVENT = `${DRAG_NODE_EVENT}_end`;

export type DragNodeEventListener = EventListener<[NodeEntity, DragEvent]>;

export const DRAG_MOVE_OPERATION = 'move.useDragNode';

const defaultOperation = {
  [Modifiers.NONE]: DRAG_MOVE_OPERATION,
};

export const useDragNode = <
  DragObject extends DragObjectWithType,
  DropResult,
  CollectedProps,
  Props = {}
>(
  spec?: DragSourceSpec<DragObjectWithType, DropResult, CollectedProps>,
  props?: Props,
): [CollectedProps, ConnectDragSource] => {
  const entity = React.useContext(EntityContext);
  if (!isNodeEntity(entity)) {
    throw new Error('useDragNode must be used within the scope of a NodeEntity');
  }
  const entityRef = React.useRef(entity);
  entityRef.current = entity;

  return useDndDrag(
    React.useMemo(() => {
      const sourceSpec: DragSourceSpec<any, any, any, Props> = {
        item: (spec && spec.item) || { type: '#useDragNode#' },
        operation: (() => {
          if (spec && typeof spec.operation === 'object') {
            return {
              ...defaultOperation,
              ...spec.operation,
            };
          }
          return defaultOperation;
        })(),
        begin: action((monitor: DragSourceMonitor, p: Props) => {
          entityRef.current.raise();
          if (entityRef.current.isGroup()) {
            entityRef.current.getChildren().forEach((c) => {
              c.raise();
            });
          }

          const result = spec && spec.begin && spec.begin(monitor, p);

          if (monitor.getOperation() === DRAG_MOVE_OPERATION) {
            entityRef.current
              .getController()
              .fireEvent(DRAG_NODE_START_EVENT, entityRef.current, monitor.getDragEvent());
          }

          return result || entityRef.current;
        }),
        drag: action((event: DragEvent, monitor: DragSourceMonitor, p: Props) => {
          const { dx, dy } = event;
          if (entityRef.current.isGroup()) {
            entityRef.current.getChildren().forEach((c) => {
              if (isNodeEntity(c)) {
                c.setBounds(
                  c
                    .getBounds()
                    .clone()
                    .translate(dx, dy),
                );
              }
            });
          } else {
            entityRef.current.setBounds(
              entityRef.current
                .getBounds()
                .clone()
                .translate(dx, dy),
            );
          }

          spec && spec.drag && spec.drag(event, monitor, p);

          if (monitor.getOperation() === DRAG_MOVE_OPERATION) {
            entityRef.current
              .getController()
              .fireEvent(DRAG_NODE_START_EVENT, entityRef.current, event);
          }
        }),
        canDrag: spec ? spec.canDrag : undefined,
        end: action((dropResult: any, monitor: DragSourceMonitor, p: Props) => {
          if (monitor.getOperation() === DRAG_MOVE_OPERATION) {
            entityRef.current
              .getController()
              .fireEvent(DRAG_NODE_END_EVENT, entityRef.current, monitor.getDragEvent());
          }
          spec && spec.end && spec.end(dropResult, monitor, p);
        }),
        collect: spec ? spec.collect : undefined,
      };
      return sourceSpec;
    }, [spec]),
    props,
  );
};

export type WithDragNodeProps = {
  dragNodeRef: WithDndDragProps['dndDragRef'];
};

export const withDragNode = <
  DragObject extends DragObjectWithType,
  DropResult,
  CollectedProps,
  Props = {}
>(
  spec?: DragSourceSpec<DragObjectWithType, DropResult, CollectedProps, Props>,
) => <P extends WithDragNodeProps & CollectedProps & Props>(
  WrappedComponent: React.ComponentType<P>,
) => {
  const Component: React.FC<Omit<P, keyof WithDragNodeProps>> = (props) => {
    const [dragNodeProps, dragNodeRef] = useDragNode(spec, props);
    return <WrappedComponent {...props as any} dragNodeRef={dragNodeRef} {...dragNodeProps} />;
  };
  return observer(Component);
};
