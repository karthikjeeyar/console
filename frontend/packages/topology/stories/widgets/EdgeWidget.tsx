import * as React from 'react';
import Layer from '../../src/layers/Layer';
import { WithSourceDragProps, WithTargetDragProps } from '../../src/behavior/useReconnect';
import Point from '../../src/geom/Point';
import { EdgeEntity } from '../../src/types';
import widget from '../../src/widget';
import { useBendpoint } from '../../src/behavior/useBendpoint';
import ConnectorArrow from '../../src/arrows/ConnectorArrow';
import { WithRemoveConnectorProps } from '../../src/behavior/withRemoveConnector';

type EdgeWidgetProps = {
  entity: EdgeEntity;
  dragging?: boolean;
} & WithSourceDragProps &
  WithTargetDragProps &
  WithRemoveConnectorProps;

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
  onShowRemoveConnector,
  onHideRemoveConnector,
}) => {
  const startPoint = entity.getStartPoint();
  const endPoint = entity.getEndPoint();
  const bendpoints = entity.getBendpoints();
  const d = `M${startPoint.x} ${startPoint.y} ${bendpoints
    .map((b: Point) => `L${b.x} ${b.y} `)
    .join('')}L${endPoint.x} ${endPoint.y}`;

  return (
    <>
      <Layer id={dragging ? 'top' : undefined}>
        <path
          strokeWidth={1}
          stroke={(entity.getData() && entity.getData().color) || 'red'}
          d={d}
          fill="none"
          onMouseEnter={onShowRemoveConnector}
          onMouseLeave={onHideRemoveConnector}
        />
        {sourceDragRef && (
          <circle ref={sourceDragRef} r={8} cx={startPoint.x} cy={startPoint.y} fillOpacity={0} />
        )}
        <ConnectorArrow dragRef={targetDragRef} edge={entity} />
      </Layer>
      {bendpoints && bendpoints.map((p, i) => <Bendpoint point={p} key={i.toString()} />)}
    </>
  );
};

export default widget(EdgeWidget);
