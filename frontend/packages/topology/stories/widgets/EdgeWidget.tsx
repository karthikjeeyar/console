import * as React from 'react';
import { createSvgIdUrl } from '@console/dev-console/src/utils/svg-utils';
import SvgArrowMarker from '@console/dev-console/src/components/topology/shapes/SvgArrowMarker';
import Layer from '../../src/layers/Layer';
import { WithSourceDragProps, WithTargetDragProps } from '../../src/behavior/useReconnect';
import Point from '../../src/geom/Point';
import { EdgeEntity } from '../../src/types';
import widget from '../../src/widget';

type EdgeWidgetProps = {
  entity: EdgeEntity;
  dragging?: boolean;
} & WithSourceDragProps &
  WithTargetDragProps;

const TARGET_ARROW_MARKER_ID = 'defaultTargetArrow';

const EdgeWidget: React.FC<EdgeWidgetProps> = ({
  entity,
  sourceDragRef,
  targetDragRef,
  dragging,
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
      <Layer id={dragging ? 'top' : null}>
        <path
          strokeWidth={1}
          stroke="red"
          d={d}
          fill="none"
          markerEnd={createSvgIdUrl(TARGET_ARROW_MARKER_ID)}
        />
      </Layer>
      {sourceDragRef && (
        <circle ref={sourceDragRef} r={15} cx={startPoint.x} cy={startPoint.y} fillOpacity={0} />
      )}
      {targetDragRef && (
        <circle ref={targetDragRef} r={15} cx={endPoint.x} cy={endPoint.y} fillOpacity={0} />
      )}
    </>
  );
};

export default widget(EdgeWidget);
