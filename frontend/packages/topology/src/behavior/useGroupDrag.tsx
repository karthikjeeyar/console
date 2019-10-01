import * as React from 'react';
import * as d3 from 'd3';
import { action } from 'mobx';
import { NodeEntity } from '../types';

type DragRef = (node: SVGElement | null) => void;

export const useGroupDrag = (entity: NodeEntity): DragRef => {
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
                  .select(`[data-id=${entity.getParent().getId()}]`)
                  .node() as any,
            )
            .on(
              'drag',
              action(() => {
                const { dx, dy } = d3.event;
                entity.getChildren().forEach((c) => {
                  c.getBoundingBox().translate(dx, dy);
                });
              }),
            ),
        );
      }
    },
    [entity],
  );

  return refCallback;
};

export type WithGroupDragProps = {
  dragRef: DragRef;
};

type EntityProps = {
  entity: NodeEntity;
};

export const withGroupDrag = <P extends WithGroupDragProps>(
  WrappedComponent: React.ComponentType<P>,
) => {
  const Component: React.FC<Omit<P, keyof WithGroupDragProps> & EntityProps> = (props) => {
    const dragRef = useGroupDrag(props.entity);
    return <WrappedComponent {...props as any} dragRef={dragRef} />;
  };
  return Component;
};
