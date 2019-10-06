import * as React from 'react';
import { action } from 'mobx';
import { isNodeEntity, NodeEntity } from '../types';
import EntityContext from '../utils/EntityContext';
import { useDndDrag } from './useDndDrag';
import { DragSourceSpec, DragEvent, DragSourceMonitor } from './dnd-types';

export type DragRef = (node: SVGElement | null) => void;

type EntityProps = {
  entity: NodeEntity;
};

const spec: DragSourceSpec<any, any, any> = {
  item: { type: '#dragNode#' },
  begin: action((monitor: DragSourceMonitor, props: EntityProps) => {
    props.entity.raise();
  }),
  drag: action((event: DragEvent, monitor: DragSourceMonitor, props: EntityProps) => {
    const { dx, dy } = event;
    props.entity.getBoundingBox().translate(dx, dy);
  }),
};

export const useDragNode = (): DragRef => {
  const entity = React.useContext(EntityContext);
  if (!isNodeEntity(entity)) {
    throw new Error('useDragNode must be used within the scope of a NodeEntity');
  }
  const [, refCallback] = useDndDrag(spec, { entity });
  return refCallback;
};

export type WithDragNodeProps = {
  dragNodeRef: DragRef;
};

export const withDragNode = <P extends WithDragNodeProps>(
  WrappedComponent: React.ComponentType<P>,
) => {
  const Component: React.FC<Omit<P, keyof WithDragNodeProps>> = (props) => {
    const dragNodeRef = useDragNode();
    return <WrappedComponent {...props as any} dragNodeRef={dragNodeRef} />;
  };
  return Component;
};
