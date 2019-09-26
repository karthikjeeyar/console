import * as React from 'react';
import { SelectionHandlerProps } from '../handlers/SelectionHandler';
import { NodeEntity } from '../types';
import widget from './widget';

type NodeWidgetProps = {
  entity: NodeEntity;
} & SelectionHandlerProps;

const NodeWidget: React.FC<NodeWidgetProps> = ({ entity, selected, onSelect }) => {
  const bbox = entity.getBoundingBox();
  const position = bbox.getCenter();
  return (
    <g transform={`translate(${position.x}, ${position.y})`} onClick={onSelect}>
      <ellipse
        cx={0}
        cy={0}
        rx={bbox.width / 2}
        ry={bbox.height / 2}
        fill={selected ? 'blue' : 'black'}
      />
    </g>
  );
};

export default widget(NodeWidget);
