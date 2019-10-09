import * as React from 'react';
import { createSvgIdUrl } from '@console/dev-console/src/utils/svg-utils';
import SvgArrowMarker from '@console/dev-console/src/components/topology/shapes/SvgArrowMarker';
import Layer from '../../src/layers/Layer';
import { WithSourceDragProps, WithTargetDragProps } from '../../src/behavior/useReconnect';
import Point from '../../src/geom/Point';
import { EdgeEntity } from '../../src/types';
import widget from '../../src/widget';
import { useBendpoint } from '../../src/behavior/useBendpoint';

type EdgeWidgetProps = {
  entity: EdgeEntity;
  dragging?: boolean;
} & WithSourceDragProps &
  WithTargetDragProps;

const TARGET_ARROW_MARKER_ID = 'defaultTargetArrow';

type BendpointProps = {
  point: Point;
};

const Bendpoint: React.FC<BendpointProps> = widget(({ point }) => {
  const [hover, setHover] = React.useState(false);
  const [, ref] = useBendpoint(point);
  return (
    // eslint-disable-next-line jsx-a11y/mouse-events-have-key-events
    <circle
      ref={ref}
      cx={point.x}
      cy={point.y}
      r={5}
      fill="lightblue"
      fillOpacity={hover ? 0.8 : 0}
      onMouseOver={() => setHover(true)}
      onMouseOut={() => setHover(false)}
    />
  );
});

const EdgeWidget: React.FC<EdgeWidgetProps> = ({
  entity,
  sourceDragRef,
  targetDragRef,
  dragging,
}) => {
  const startPoint = entity.getStartPoint();
  const endPoint = entity.getEndPoint();
  const bendpoints = entity.getBendpoints();
  const d = `M${startPoint.x} ${startPoint.y} ${bendpoints
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
      {bendpoints && bendpoints.map((p, i) => <Bendpoint point={p} key={i.toString()} />)}
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
