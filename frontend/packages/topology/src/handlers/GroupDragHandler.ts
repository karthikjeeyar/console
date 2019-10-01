import * as d3 from 'd3';
import { action } from 'mobx';
import { NodeEntity, isGraphEntity } from '../types';
import AbstractInteractionHandler from './AbstractInteractionHandler';

export type GroupDragHandlerProps = {
  dragRef: (node: SVGElement | null) => void;
};

export default class GroupDragHandler extends AbstractInteractionHandler<
  GroupDragHandlerProps,
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
              isGraphEntity(this.getOwner().getParent())
                ? node.parentNode
                : (d3
                    .select(node.ownerSVGElement)
                    .select(
                      `[data-id=${this.getOwner()
                        .getParent()
                        .getId()}]`,
                    )
                    .node() as any),
          )
          .on(
            'drag',
            action(() => {
              const { dx, dy } = d3.event;
              this.getOwner()
                .getChildren()
                .forEach((c) => {
                  c.getBoundingBox().translate(dx, dy);
                });
            }),
          ),
      );
    }
  };

  getProps(): GroupDragHandlerProps {
    return {
      dragRef: this.dragRef,
    };
  }
}
