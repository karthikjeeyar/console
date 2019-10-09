import * as React from 'react';
import { action } from 'mobx';
import { observer } from 'mobx-react';
import EntityContext from '../utils/EntityContext';
import { useDndDrag, WithDndDragProps } from './useDndDrag';
import {
  DragSourceSpec,
  DragEvent,
  ConnectDragSource,
  DragObjectWithType,
  DragSourceMonitor,
} from './dnd-types';

export const useDragGroup = <DropResult, CollectedProps, Props = {}>(
  spec?: Omit<DragSourceSpec<DragObjectWithType, DropResult, CollectedProps>, 'type'>,
  props?: Props,
): [CollectedProps, ConnectDragSource] => {
  const entity = React.useContext(EntityContext);
  const entityRef = React.useRef(entity);
  entityRef.current = entity;
  return useDndDrag(
    React.useMemo(() => {
      const sourceSpec: DragSourceSpec<any, any, any, Props> = {
        item: { type: '#useDragGroup#' },
        begin: action((monitor: DragSourceMonitor, p: Props) => {
          entityRef.current.raise();
          return spec && spec.begin ? spec.begin(monitor, p) : undefined;
        }),
        drag: action((event: DragEvent, monitor: DragSourceMonitor, p: Props) => {
          const { dx, dy } = event;
          entityRef.current.getChildren().forEach((c) => {
            c.getBounds().translate(dx, dy);
          });
          spec && spec.drag && spec.drag(event, monitor, p);
        }),
        canDrag: spec ? spec.canDrag : undefined,
        end: spec ? spec.end : undefined,
        collect: spec ? spec.collect : undefined,
      };
      return sourceSpec;
    }, [spec]),
    props,
  );
};

export type WithDragGroupProps = {
  dragGroupRef: WithDndDragProps['dndDragRef'];
};

export const withDragGroup = <DropResult, CollectedProps, Props = {}>(
  spec?: Omit<DragSourceSpec<DragObjectWithType, DropResult, CollectedProps, Props>, 'type'>,
) => <P extends WithDragGroupProps & CollectedProps & Props>(
  WrappedComponent: React.ComponentType<P>,
) => {
  const Component: React.FC<Omit<P, keyof WithDragGroupProps>> = (props) => {
    const [dragGroupProps, dragGroupRef] = useDragGroup(spec, props);
    return <WrappedComponent {...props as any} dragGroupRef={dragGroupRef} {...dragGroupProps} />;
  };
  return observer(Component);
};
