import * as React from 'react';
import { EdgeEntity } from '../types';
import widget from './widget';

type EdgeWidgetProps = {
  entity: EdgeEntity;
};

const EdgeWidget: React.FC<EdgeWidgetProps> = ({ entity }) => {
  const startPoint = entity.getStartPoint();
  const endPoint = entity.getEndPoint();
  const d = `M${startPoint.x} ${startPoint.y} ${entity
    .getBendpoints()
    .map((b) => `L${b.x} ${b.y}`)} L${endPoint.x} ${endPoint.y}`;
  return <path strokeWidth={1} stroke="red" d={d} fill="none" />;
};

export default widget(EdgeWidget);
