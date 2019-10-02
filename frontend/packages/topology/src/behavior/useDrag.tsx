import * as React from 'react';
import * as d3 from 'd3';
import { action } from 'mobx';
import { NodeEntity } from '../types';

type DragRef = (node: SVGElement | null) => void;

export const useDrag = (entity: NodeEntity): DragRef => {
  const refCallback = React.useCallback(
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
                  .select(`[data-id="${entity.getParent().getId()}"]`)
                  .node() as any,
            )
            .on(
              'drag',
              action(() => {
                const { dx, dy } = d3.event;
                entity.getBoundingBox().translate(dx, dy);
              }),
            ),
        );
      }
    },
    [entity],
  );

  return refCallback;
};

export type WithDragProps = {
  dragRef: DragRef;
};

type EntityProps = {
  entity: NodeEntity;
};

export const withDrag = <P extends WithDragProps>(WrappedComponent: React.ComponentType<P>) => {
  const Component: React.FC<Omit<P, keyof WithDragProps> & EntityProps> = (props) => {
    const dragRef = useDrag(props.entity);
    return <WrappedComponent {...props as any} dragRef={dragRef} />;
  };
  return Component;
};
