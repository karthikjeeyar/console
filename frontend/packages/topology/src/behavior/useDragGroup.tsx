import * as React from 'react';
import { action } from 'mobx';
import { isNodeEntity, NodeEntity } from '../types';
import EntityContext from '../utils/EntityContext';
import { useDndDrag } from './useDndDrag';
import { DragSourceSpec, DragSourceMonitor, DragEvent } from './dnd-types';

export type DragRef = (node: SVGElement | null) => void;

type EntityProps = {
  entity: NodeEntity;
};

const spec: DragSourceSpec<any, any, any> = {
  item: { type: '#useDragGroup#' },
  drag: action((event: DragEvent, monitor: DragSourceMonitor, props: EntityProps) => {
    const { dx, dy } = event;
    props.entity.getChildren().forEach((c) => {
      c.getBoundingBox().translate(dx, dy);
    });
  }),
};

export const useDragGroup = (): DragRef => {
  const entity = React.useContext(EntityContext);
  if (!isNodeEntity(entity)) {
    throw new Error('useDragGroup must be used within the scope of a NodeEntity');
  }
  const [, refCallback] = useDndDrag(spec, { entity });
  return refCallback;
};

export type WithDragGroupProps = {
  dragGroupRef: DragRef;
};

export const withDragGroup = <P extends WithDragGroupProps>(
  WrappedComponent: React.ComponentType<P>,
) => {
  const Component: React.FC<Omit<P, keyof WithDragGroupProps>> = (props) => {
    const dragGroupRef = useDragGroup();
    return <WrappedComponent {...props as any} dragGroupRef={dragGroupRef} />;
  };
  return Component;
};
