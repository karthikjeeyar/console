import * as React from 'react';
import { NodeEntity } from '../../src/types';
import widget from '../../src/widget';
import { useSvgAnchor } from '../../src/behavior/useSvgAnchor';
import { WithDragNodeProps } from '../../src/behavior/useDragNode';
import { WithSelectionProps } from '../../src/behavior/useSelection';
import { WithDndDragProps } from '../../src/behavior/useDndDrag';
import { WithDndDropProps } from '../../src/behavior/useDndDrop';
import useCombineRefs from '../../src/utils/useCombineRefs';

type NodePathWidgetProps = {
  entity: NodeEntity;
  droppable?: boolean;
  hover?: boolean;
  canDrop?: boolean;
} & WithSelectionProps &
  WithDragNodeProps &
  WithDndDragProps &
  WithDndDropProps;

const NodePathWidget: React.FC<NodePathWidgetProps> = ({
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
  const refs = useCombineRefs<SVGPathElement>(dragNodeRef, dndDragRef, dndDropRef, anchorRef);
  const { width, height } = entity.getBounds();

  return (
    <path
      ref={refs}
      onClick={onSelect}
      d={`M0 0 L${width / 2} ${height / 4} L${width} 0 L${width} ${height} L${width / 2} ${height -
        height / 4} L0 ${height} Z`}
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

export default widget(NodePathWidget);
