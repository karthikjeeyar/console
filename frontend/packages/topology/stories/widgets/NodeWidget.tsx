import * as React from 'react';
import { useAnchor } from '../../src/behavior/useAnchor';
import EllipseAnchor from '../../src/anchors/EllipseAnchor';
import { WithDragNodeProps } from '../../src/behavior/useDragNode';
import { WithSelectionProps } from '../../src/behavior/useSelection';
import { NodeEntity } from '../../src/types';
import widget from '../../src/widget';
import { WithDndDragProps } from '../../src/behavior/useDndDrag';

type NodeWidgetProps = {
  entity: NodeEntity;
} & WithSelectionProps &
  WithDragNodeProps &
  WithDndDragProps;

const NodeWidget: React.FC<NodeWidgetProps> = ({
  entity,
  selected,
  onSelect,
  dragNodeRef,
  dndDragRef,
}) => {
  useAnchor(React.useCallback(() => new EllipseAnchor(), []));
  const { width, height } = entity.getBounds();
  return (
    <ellipse
      ref={dragNodeRef || dndDragRef}
      onClick={onSelect}
      cx={0}
      cy={0}
      rx={Math.max(0, width / 2 - 1)}
      ry={Math.max(0, height / 2 - 1)}
      fill={selected ? 'blue' : 'grey'}
      strokeWidth="1"
      stroke="#333333"
    />
  );
};

export default widget(NodeWidget);
