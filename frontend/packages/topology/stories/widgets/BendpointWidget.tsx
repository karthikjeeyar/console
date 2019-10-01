import * as React from 'react';
import Point from '../../src/geom/Point';
import { EdgeEntity } from '../../src/types';
import widget from '../../src/widget';

type BendpointWidgetProps = {
  entity: EdgeEntity;
  point: Point;
};

const BendpointWidget: React.FC<BendpointWidgetProps> = ({ point }) => {
  const { x, y } = point;
  return <circle cx={x} cy={y} r={3} fill="blue" opacity={0.5} />;
};

export default widget(BendpointWidget);
