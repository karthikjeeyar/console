import * as React from 'react';
import { observer } from 'mobx-react';
import EntityContext from '../utils/EntityContext';
import { EventListener, isNodeEntity, NodeEntity } from '../types';
import { useDndDrag, WithDndDragProps, Modifiers } from './useDndDrag';
import { DragSourceSpec, DragEvent, ConnectDragSource, DragObjectWithType } from './dnd-types';

export const DRAG_NODE_EVENT = 'drag_node';
export const DRAG_NODE_START_EVENT = `${DRAG_NODE_EVENT}_start`;
export const DRAG_NODE_END_EVENT = `${DRAG_NODE_EVENT}_end`;

export type DragNodeEventListener = EventListener<[NodeEntity, DragEvent, string]>;

export const DRAG_MOVE_OPERATION = 'move.useDragNode';

const defaultOperation = {
  [Modifiers.DEFAULT]: DRAG_MOVE_OPERATION,
};

export const useDragNode = <
  DragObject extends DragObjectWithType = DragObjectWithType,
  DropResult = any,
  CollectedProps extends {} = {},
  Props extends {} = {}
>(
  spec?: Omit<DragSourceSpec<DragObject, DropResult, CollectedProps, Props>, 'item'> & {
    item?: DragObject;
  },
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
          if (
            spec &&
            typeof spec.operation === 'object' &&
            Object.keys(spec.operation).length > 0
          ) {
            return {
              ...defaultOperation,
              ...spec.operation,
            };
          }
          return defaultOperation;
        })(),
        begin: (monitor, p) => {
          entityRef.current.raise();
          if (entityRef.current.isGroup()) {
            entityRef.current.getChildren().forEach((c) => {
              c.raise();
            });
          }

          const result = spec && spec.begin && spec.begin(monitor, p);

          entityRef.current
            .getController()
            .fireEvent(
              DRAG_NODE_START_EVENT,
              entityRef.current,
              monitor.getDragEvent(),
              monitor.getOperation(),
            );

          return result || entityRef.current;
        },
        drag: (event, monitor, p) => {
          const { dx, dy } = event;
          let moveEntity = true;
          if (entityRef.current.isGroup()) {
            const nodeChildren = entityRef.current.getChildren().filter(isNodeEntity);
            if (nodeChildren.length) {
              moveEntity = false;
              nodeChildren.forEach((c) => {
                c.setBounds(
                  c
                    .getBounds()
                    .clone()
                    .translate(dx, dy),
                );
              });
            }
          }
          if (moveEntity) {
            entityRef.current.setBounds(
              entityRef.current
                .getBounds()
                .clone()
                .translate(dx, dy),
            );
          }

          spec && spec.drag && spec.drag(event, monitor, p);

          entityRef.current
            .getController()
            .fireEvent(DRAG_NODE_EVENT, entityRef.current, event, monitor.getOperation());
        },
        canDrag: spec ? spec.canDrag : undefined,
        end: (dropResult, monitor, p) => {
          entityRef.current
            .getController()
            .fireEvent(
              DRAG_NODE_END_EVENT,
              entityRef.current,
              monitor.getDragEvent(),
              monitor.getOperation(),
            );
          spec && spec.end && spec.end(dropResult, monitor, p);
        },
        collect: spec ? spec.collect : undefined,
        canCancel: spec ? spec.canCancel : undefined,
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
  DragObject extends DragObjectWithType = DragObjectWithType,
  DropResult = any,
  CollectedProps extends {} = {},
  Props extends {} = {}
>(
  spec?: Omit<DragSourceSpec<DragObject, DropResult, CollectedProps, Props>, 'item'> & {
    item?: DragObject;
  },
) => <P extends WithDragNodeProps & CollectedProps & Props>(
  WrappedComponent: React.ComponentType<P>,
) => {
  const Component: React.FC<Omit<P, keyof WithDragNodeProps>> = (props) => {
    // TODO fix cast to any
    const [dragNodeProps, dragNodeRef] = useDragNode(spec, props as any);
    return <WrappedComponent {...props as any} dragNodeRef={dragNodeRef} {...dragNodeProps} />;
  };
  return observer(Component);
};
