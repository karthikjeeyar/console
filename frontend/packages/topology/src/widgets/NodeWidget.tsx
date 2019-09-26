import * as React from 'react';
import { NodeEntity } from '../types';
import widget from './widget';

type NodeWidgetProps = {
  entity: NodeEntity;
};

const NodeWidget: React.FC<NodeWidgetProps> = ({ entity }) => {
  const bbox = entity.getBoundingBox();
  const position = bbox.getCenter();
  return (
    <g transform={`translate(${position.x}, ${position.y})`}>
      <ellipse cx={0} cy={0} rx={bbox.width / 2} ry={bbox.height / 2} />
    </g>
  );
};

export default widget(NodeWidget);
