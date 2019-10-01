import * as React from 'react';
import { WithDragProps } from '../../src/behavior/useDrag';
import { SelectionHandlerProps } from '../../src/behavior/useSelection';
import { NodeEntity } from '../../src/types';
import widget from '../../src/widget';

type NodeWidgetProps = {
  entity: NodeEntity;
} & SelectionHandlerProps &
  WithDragProps;

const NodeWidget: React.FC<NodeWidgetProps> = ({ entity, selected, onSelect, dragRef }) => {
  const { width, height } = entity.getBoundingBox();
  return (
    <ellipse
      ref={dragRef}
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
