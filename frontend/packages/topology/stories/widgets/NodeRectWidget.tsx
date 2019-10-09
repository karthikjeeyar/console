import * as React from 'react';
import { NodeEntity } from '../../src/types';
import widget from '../../src/widget';
import { useSvgAnchor } from '../../src/behavior/useSvgAnchor';
import { WithDragNodeProps } from '../../src/behavior/useDragNode';
import { WithSelectionProps } from '../../src/behavior/useSelection';
import { WithDndDragProps } from '../../src/behavior/useDndDrag';
import { WithDndDropProps } from '../../src/behavior/useDndDrop';
import { combineRefs } from '../../src/utils/combineRefs';

type NodeRectWidgetProps = {
  entity: NodeEntity;
  droppable?: boolean;
  hover?: boolean;
  canDrop?: boolean;
} & WithSelectionProps &
  WithDragNodeProps &
  WithDndDragProps &
  WithDndDropProps;

const NodeRectWidget: React.FC<NodeRectWidgetProps> = ({
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
  const anchorRef = useSvgAnchor();
  const { width, height } = entity.getBounds();

  return (
    <rect
      ref={combineRefs([dragNodeRef, dndDragRef, dndDropRef, anchorRef])}
      onClick={onSelect}
      x={0}
      y={0}
      width={Math.max(0, width)}
      height={Math.max(0, height)}
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

export default widget(NodeRectWidget);
