import * as React from 'react';
import { vecSum, vecScale, unitNormal } from '@console/dev-console/src/utils/svg-utils';
import { EdgeEntity } from '../../src/types';
import widget from '../../src/widget';

type MultiEdgeWidgetProps = {
  entity: EdgeEntity;
  dragging?: boolean;
};

// TODO create utiles to support this
const MultiEdgeWidget: React.FC<MultiEdgeWidgetProps> = ({ entity }) => {
  let idx = 0;
  let sum = 0;
  entity
    .getController()
    .getGraph()
    .getEdges()
    .forEach((e) => {
      if (e === entity) {
        idx = sum;
        sum++;
      } else if (e.getSource() === entity.getSource() && e.getTarget() === entity.getTarget()) {
        sum++;
      }
    });
  let d: string;
  const startPoint = entity.getStartPoint();
  const endPoint = entity.getEndPoint();
  if (idx === sum - 1 && sum % 2 === 1) {
    d = `M${startPoint.x} ${startPoint.y} L${endPoint.x} ${endPoint.y}`;
  } else {
    const pm = vecSum(
      [
        startPoint.x + (endPoint.x - startPoint.x) / 2,
        startPoint.y + (endPoint.y - startPoint.y) / 2,
      ],
      vecScale(
        (idx % 2 === 1 ? 25 : -25) * Math.ceil((idx + 1) / 2),
        unitNormal([startPoint.x, startPoint.y], [endPoint.x, endPoint.y]),
      ),
    );
    d = `M${startPoint.x} ${startPoint.y} Q${pm[0]} ${pm[1]} ${endPoint.x} ${endPoint.y}`;
  }

  return <path strokeWidth={2} stroke="#8d8d8d" d={d} fill="none" />;
};

export default widget(MultiEdgeWidget);
