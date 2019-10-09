import * as React from 'react';
import { NodeEntity } from '../../src/types';
import widget from '../../src/widget';
import { useSvgAnchor } from '../../src/behavior/useSvgAnchor';
import { WithDragNodeProps } from '../../src/behavior/useDragNode';
import { WithSelectionProps } from '../../src/behavior/useSelection';
import { WithDndDragProps } from '../../src/behavior/useDndDrag';
import { WithDndDropProps } from '../../src/behavior/useDndDrop';
import SVGAnchor from '../../src/anchors/SVGAnchor';
import { combineRefs } from '../../src/utils/combineRefs';

type NodeWidgetProps = {
  entity: NodeEntity;
  droppable?: boolean;
  hover?: boolean;
  canDrop?: boolean;
} & WithSelectionProps &
  WithDragNodeProps &
  WithDndDragProps &
  WithDndDropProps;

const NodeWidget: React.FC<NodeWidgetProps> = ({
  entity,
  selected,
  onSelect,
  dragNodeRef,
  dndDragRef,
  droppable,
  hover,
  canDrop,
  dndDropRef,
}) => {
  const anchorRef: ((svg: SVGElement | null) => void) | null = useSvgAnchor(
    React.useCallback(() => new SVGAnchor(), []),
  );
  const { width, height } = entity.getBounds();

  return (
    <ellipse
      ref={combineRefs([dragNodeRef, dndDragRef, dndDropRef, anchorRef])}
      onClick={onSelect}
      cx={width / 2}
      cy={height / 2}
      rx={Math.max(0, width / 2 - 1)}
      ry={Math.max(0, height / 2 - 1)}
      fill={
        canDrop && hover
          ? 'lightgreen'
          : canDrop && droppable
          ? 'lightblue'
          : selected
          ? 'blue'
          : 'grey'
      }
      strokeWidth={1}
      stroke="#333333"
    />
  );
};

export default widget(NodeWidget);
