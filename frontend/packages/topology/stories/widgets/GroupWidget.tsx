import * as React from 'react';
import useCombineRefs from '../../src/utils/useCombineRefs';
import { WithDragNodeProps } from '../../src/behavior/useDragNode';
import { WithSelectionProps } from '../../src/behavior/useSelection';
import { NodeEntity } from '../../src/types';
import Rect from '../../src/geom/Rect';
import Layer from '../../src/layers/Layer';
import widget from '../../src/widget';
import { WithDndDropProps } from '../../src/behavior/useDndDrop';
import { WithDndDragProps } from '../../src/behavior/useDndDrag';

type GroupWidgetProps = {
  entity: NodeEntity;
  droppable?: boolean;
  hover?: boolean;
  canDrop?: boolean;
} & WithSelectionProps &
  WithDragNodeProps &
  WithDndDragProps &
  WithDndDropProps;

const GroupWidget: React.FC<GroupWidgetProps> = ({
  entity,
  selected,
  onSelect,
  dragNodeRef,
  dndDragRef,
  dndDropRef,
  droppable,
  hover,
  canDrop,
}) => {
  const boxRef = React.useRef<Rect | null>(null);
  const refs = useCombineRefs<SVGRectElement>(dragNodeRef, dndDragRef, dndDropRef);

  if (!droppable || !boxRef.current) {
    // change the box only when not dragging
    boxRef.current = entity
      .getBounds()
      .clone()
      .expand(10, 10);
  }

  return (
    <Layer id="groups">
      <rect
        ref={refs}
        onClick={onSelect}
        x={boxRef.current.x}
        y={boxRef.current.y}
        width={boxRef.current.width}
        height={boxRef.current.height}
        fill={canDrop && hover ? 'lightgreen' : canDrop && droppable ? 'lightblue' : '#ededed'}
        strokeWidth={2}
        stroke={selected ? 'blue' : '#cdcdcd'}
      />
    </Layer>
  );
};

export default widget(GroupWidget);
