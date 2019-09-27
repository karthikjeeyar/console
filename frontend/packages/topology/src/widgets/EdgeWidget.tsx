import * as React from 'react';
import { createSvgIdUrl } from '@console/dev-console/src/utils/svg-utils';
import SvgArrowMarker from '@console/dev-console/src/components/topology/shapes/SvgArrowMarker';
import { EdgeEntity } from '../types';
import widget from './widget';

type EdgeWidgetProps = {
  entity: EdgeEntity;
};

const TARGET_ARROW_MARKER_ID = 'defaultTargetArrow';

const EdgeWidget: React.FC<EdgeWidgetProps> = ({ entity }) => {
  const startPoint = entity.getStartPoint();
  const endPoint = entity.getEndPoint();
  const d = `M${startPoint.x} ${startPoint.y} ${entity
    .getBendpoints()
    .map((b) => `L${b.x} ${b.y} `)
    .join('')}L${endPoint.x} ${endPoint.y}`;
  return (
    <>
      <SvgArrowMarker id={TARGET_ARROW_MARKER_ID} nodeSize={0} markerSize={12} />
      <path
        strokeWidth={1}
        stroke="red"
        d={d}
        fill="none"
        markerEnd={createSvgIdUrl(TARGET_ARROW_MARKER_ID)}
      />
    </>
  );
};

export default widget(EdgeWidget);
