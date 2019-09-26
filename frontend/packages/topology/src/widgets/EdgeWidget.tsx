import * as React from 'react';
import { EdgeEntity } from '../types';
import widget from './widget';

type EdgeWidgetProps = {
  entity: EdgeEntity;
};

const EdgeWidget: React.FC<EdgeWidgetProps> = ({ entity }) => {
  const startPoint = entity.getStartPoint();
  const endPoint = entity.getEndPoint();
  return (
    <line
      strokeWidth={1}
      stroke="red"
      x1={startPoint.x}
      y1={startPoint.y}
      x2={endPoint.x}
      y2={endPoint.y}
    />
  );
};

export default widget(EdgeWidget);
