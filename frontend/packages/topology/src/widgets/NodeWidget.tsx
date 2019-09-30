import * as React from 'react';
import { DragHandlerProps } from '../handlers/DragHandler';
import { SelectionHandlerProps } from '../handlers/SelectionHandler';
import { NodeEntity } from '../types';
import widget from './widget';

type NodeWidgetProps = {
  entity: NodeEntity;
} & SelectionHandlerProps &
  DragHandlerProps;

const NodeWidget: React.FC<NodeWidgetProps> = ({ entity, selected, onSelect, dragRef }) => {
  const { width, height } = entity.getBoundingBox();
  return (
    <ellipse
      ref={dragRef}
      onClick={onSelect}
      cx={0}
      cy={0}
      rx={width / 2 - 1}
      ry={height / 2 - 1}
      fill={selected ? 'blue' : 'grey'}
      strokeWidth="1"
      stroke="#333333"
    />
  );
};

export default widget(NodeWidget);
