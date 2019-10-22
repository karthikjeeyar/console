import * as React from 'react';
import Layer from '@console/topology/src/layers/Layer';
import {
  WithSourceDragProps,
  WithTargetDragProps,
} from '@console/topology/src/behavior/useReconnect';
import Point from '@console/topology/src/geom/Point';
import { EdgeEntity } from '@console/topology/src/types';
import widget from '@console/topology/src/widget';
import { useBendpoint } from '@console/topology/src/behavior/useBendpoint';
import ConnectorArrow from '@console/topology/src/arrows/ConnectorArrow';
import * as classNames from 'classnames';
import { boundingBoxForLine } from '../../../utils/svg-utils';

type EdgeWidgetProps = {
  entity: EdgeEntity;
  dragging?: boolean;
} & WithSourceDragProps &
  WithTargetDragProps;

type BendpointProps = {
  point: Point;
};

const getBoundingPathForLine = (startPoint: Point, endPoint: Point): string => {
  const bbox = boundingBoxForLine([startPoint.x, startPoint.y], [endPoint.x, endPoint.y], 3);
  return `M${bbox[0][0]} ${bbox[0][1]} L${bbox[1][0]} ${bbox[1][1]} L${bbox[2][0]} ${bbox[2][1]} L${
    bbox[3][0]
  } ${bbox[3][1]} Z`;
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
  const [hover, setHover] = React.useState<boolean>(false);
  const startPoint = entity.getStartPoint();
  const endPoint = entity.getEndPoint();
  const bendpoints = entity.getBendpoints();

  const d = `M${startPoint.x} ${startPoint.y} ${bendpoints
    .map((b: Point) => `L${b.x} ${b.y} `)
    .join('')}L${endPoint.x} ${endPoint.y}`;

  let hoverPaths = [];
  if (bendpoints.length > 0) {
    hoverPaths = [];
    hoverPaths.push(getBoundingPathForLine(startPoint, bendpoints[0]));
    for (let i = 1; i < bendpoints.length - 1; i++) {
      hoverPaths.push(getBoundingPathForLine(bendpoints[i - 1], bendpoints[i]));
    }
    hoverPaths.push(getBoundingPathForLine(bendpoints[bendpoints.length - 1], endPoint));
  } else {
    hoverPaths.push(getBoundingPathForLine(startPoint, endPoint));
  }

  return (
    <>
      <Layer id={dragging || hover ? 'top' : undefined}>
        <g
          data-test-id="connects-to-handler"
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
        >
          {hoverPaths &&
            hoverPaths.map((path: string, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <path key={`hover-path-${index}`} d={path} fillOpacity={0} />
            ))}
          <path
            className={classNames('odc-base-edge', {
              'is-highlight': dragging,
              'is-hover': hover,
            })}
            d={d}
            fill="none"
          />
          {sourceDragRef && (
            <circle ref={sourceDragRef} r={8} cx={startPoint.x} cy={startPoint.y} fillOpacity={0} />
          )}
          <ConnectorArrow
            dragRef={targetDragRef}
            edge={entity}
            className={classNames('odc-connects-to', {
              'odc-connects-to__hover-arrow': hover,
            })}
          />
        </g>
      </Layer>
      {bendpoints && bendpoints.map((p, i) => <Bendpoint point={p} key={i.toString()} />)}
    </>
  );
};

export default widget(EdgeWidget);
