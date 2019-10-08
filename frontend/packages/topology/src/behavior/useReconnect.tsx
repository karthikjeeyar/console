import * as React from 'react';
import { observer } from 'mobx-react';
import { useDndDrag } from './useDndDrag';
import { ConnectDragSource, DragObjectWithType, DragSourceSpec } from './dnd-types';

export type WithSourceDragProps = {
  sourceDragRef: ConnectDragSource;
};

export const withSourceDrag = <
  DragObject extends DragObjectWithType,
  DropResult,
  CollectedProps,
  Props = {}
>(
  spec: DragSourceSpec<DragObject, DropResult, CollectedProps, Props>,
) => <P extends WithSourceDragProps & CollectedProps & Props>(
  WrappedComponent: React.ComponentType<P>,
) => {
  const Component: React.FC<Omit<P, keyof WithSourceDragProps & CollectedProps>> = (props) => {
    const [dndDragProps, dndDragRef] = useDndDrag(spec, props);
    return <WrappedComponent {...props as any} sourceDragRef={dndDragRef} {...dndDragProps} />;
  };
  return observer(Component);
};

export type WithTargetDragProps = {
  targetDragRef: ConnectDragSource;
};

export const withTargetDrag = <
  DragObject extends DragObjectWithType,
  DropResult,
  CollectedProps,
  Props = {}
>(
  spec: DragSourceSpec<DragObject, DropResult, CollectedProps, Props>,
) => <P extends WithSourceDragProps & CollectedProps & Props>(
  WrappedComponent: React.ComponentType<P>,
) => {
  const Component: React.FC<Omit<P, keyof WithSourceDragProps & CollectedProps>> = (props) => {
    const [dndDragProps, dndDragRef] = useDndDrag(spec, props);
    return <WrappedComponent {...props as any} targetDragRef={dndDragRef} {...dndDragProps} />;
  };
  return observer(Component);
};
