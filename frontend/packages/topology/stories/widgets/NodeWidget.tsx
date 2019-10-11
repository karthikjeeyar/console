import * as React from 'react';
import { WithCreateConnectorProps } from '../../src/behavior/withCreateConnector';
import { NodeEntity } from '../../src/types';
import widget from '../../src/widget';
import { useSvgAnchor } from '../../src/behavior/useSvgAnchor';
import { WithDragNodeProps } from '../../src/behavior/useDragNode';
import { WithSelectionProps } from '../../src/behavior/useSelection';
import { WithDndDragProps } from '../../src/behavior/useDndDrag';
import { WithDndDropProps } from '../../src/behavior/useDndDrop';
import useCombineRefs from '../../src/utils/useCombineRefs';
import { WithContextMenuProps } from '../../src/behavior/withContextMenu';

type NodeWidgetProps = {
  entity: NodeEntity;
  droppable?: boolean;
  hover?: boolean;
  canDrop?: boolean;
} & WithSelectionProps &
  WithDragNodeProps &
  WithDndDragProps &
  WithDndDropProps &
  WithContextMenuProps &
  WithCreateConnectorProps;

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
  onContextMenu,
  onHideCreateConnector,
  onShowCreateConnector,
}) => {
  const anchorRef = useSvgAnchor();
  const refs = useCombineRefs<SVGEllipseElement>(dragNodeRef, dndDragRef, dndDropRef, anchorRef);
  const { width, height } = entity.getBounds();

  return (
    <ellipse
      onMouseEnter={onShowCreateConnector}
      onMouseLeave={onHideCreateConnector}
      ref={refs}
      onContextMenu={onContextMenu}
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
