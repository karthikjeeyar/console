import * as d3 from 'd3';
import { action } from 'mobx';
import { NodeEntity } from '../types';
import AbstractInteractionHandler from './AbstractInteractionHandler';

export type DragHandlerProps = {
  dragRef: (node: SVGElement | null) => void;
};

export default class DragHandler extends AbstractInteractionHandler<
  DragHandlerProps,
  {},
  NodeEntity
> {
  private dragRef = (node: SVGElement | null): void => {
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
                  `[data-id=${this.getOwner()
                    .getParent()
                    .getId()}]`,
                )
                .node() as any,
          )
          .on(
            'drag',
            action(() => {
              const { dx, dy } = d3.event;
              this.getOwner()
                .getBoundingBox()
                .translate(dx, dy);
            }),
          ),
      );
    }
  };

  getProps(): DragHandlerProps {
    return {
      dragRef: this.dragRef,
    };
  }
}
