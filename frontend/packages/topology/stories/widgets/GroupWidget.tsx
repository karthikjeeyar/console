import * as React from 'react';
import { WithDragGroupProps } from '../../src/behavior/useDragGroup';
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
} & WithSelectionProps &
  WithDragGroupProps &
  WithDndDragProps &
  WithDndDropProps;

const GroupWidget: React.FC<GroupWidgetProps> = ({
  entity,
  selected,
  onSelect,
  dragGroupRef,
  dndDragRef,
  dndDropRef,
  droppable,
  hover,
}) => {
  const boxRef = React.useRef<Rect | null>(null);

  if (!droppable || !boxRef.current) {
    const children = entity.getNodes();
    if (children.length === 0) {
      return null;
    }
    const box: Rect = children[0].getBounds().clone();
    for (let i = 1, l = children.length; i < l; i++) {
      box.union(children[i].getBounds());
    }
    // add padding
    box.expand(10, 10);

    // change the box only when not dragging
    boxRef.current = box;
  }

  return (
    <Layer id="groups">
      <rect
        ref={dragGroupRef || dndDragRef || dndDropRef}
        onClick={onSelect}
        x={boxRef.current.x}
        y={boxRef.current.y}
        width={boxRef.current.width}
        height={boxRef.current.height}
        fill={hover ? 'lightgreen' : droppable ? 'lightblue' : '#ededed'}
        strokeWidth={2}
        stroke={selected ? 'blue' : '#cdcdcd'}
      />
    </Layer>
  );
};

export default widget(GroupWidget);
