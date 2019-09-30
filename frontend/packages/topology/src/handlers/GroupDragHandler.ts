import * as d3 from 'd3';
import { action } from 'mobx';
import { NodeEntity } from '../types';
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
        d3.drag().on(
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
