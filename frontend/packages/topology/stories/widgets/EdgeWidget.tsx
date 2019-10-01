import * as React from 'react';
import { createSvgIdUrl } from '@console/dev-console/src/utils/svg-utils';
import SvgArrowMarker from '@console/dev-console/src/components/topology/shapes/SvgArrowMarker';
import { WithReconnectProps } from '../../src/behavior/useReconnect';
import Point from '../../src/geom/Point';
import { EdgeEntity } from '../../src/types';
import widget from '../../src/widget';

type EdgeWidgetProps = {
  entity: EdgeEntity;
} & WithReconnectProps;

const TARGET_ARROW_MARKER_ID = 'defaultTargetArrow';

const EdgeWidget: React.FC<EdgeWidgetProps> = ({
  entity,
  sourceConnectorRef,
  targetConnectorRef,
}) => {
  const startPoint = entity.getStartPoint();
  const endPoint = entity.getEndPoint();
  const d = `M${startPoint.x} ${startPoint.y} ${entity
    .getBendpoints()
    .map((b: Point) => `L${b.x} ${b.y} `)
    .join('')}L${endPoint.x} ${endPoint.y}`;
  return (
    <>
      <SvgArrowMarker id={TARGET_ARROW_MARKER_ID} nodeSize={0} markerSize={7} />
      <path
        strokeWidth={1}
        stroke="red"
        d={d}
        fill="none"
        markerEnd={createSvgIdUrl(TARGET_ARROW_MARKER_ID)}
      />
      {sourceConnectorRef && (
        <circle
          ref={sourceConnectorRef}
          r={15}
          cx={startPoint.x}
          cy={startPoint.y}
          fillOpacity={0}
        />
      )}
      {targetConnectorRef && (
        <circle ref={targetConnectorRef} r={15} cx={endPoint.x} cy={endPoint.y} fillOpacity={0} />
      )}
    </>
  );
};

export default widget(EdgeWidget);
