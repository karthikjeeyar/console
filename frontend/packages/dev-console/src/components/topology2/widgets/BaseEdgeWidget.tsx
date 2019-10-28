import * as React from 'react';
import Layer from '@console/topology/src/layers/Layer';
import Point from '@console/topology/src/geom/Point';
import { EdgeEntity } from '@console/topology/src/types';
import { WithRemoveConnectorProps } from '@console/topology/src/behavior/withRemoveConnector';
import widget from '@console/topology/src/widget';
import useHover from '@console/topology/src/behavior/useHover';
import * as classNames from 'classnames';
import { boundingBoxForLine } from '../../../utils/svg-utils';
import './BaseEdge.scss';

type EdgeWidgetProps = {
  entity: EdgeEntity;
  dragging?: boolean;
} & WithRemoveConnectorProps;

const getBoundingPathForLine = (startPoint: Point, endPoint: Point): string => {
  const bbox = boundingBoxForLine([startPoint.x, startPoint.y], [endPoint.x, endPoint.y], 3);
  return `M${bbox[0][0]} ${bbox[0][1]} L${bbox[1][0]} ${bbox[1][1]} L${bbox[2][0]} ${bbox[2][1]} L${
    bbox[3][0]
  } ${bbox[3][1]} Z`;
};

const BaseEdgeWidget: React.FC<EdgeWidgetProps> = ({
  entity,
  dragging,
  onShowRemoveConnector,
  onHideRemoveConnector,
  children,
}) => {
  const [hover, hoverRef] = useHover();
  const startPoint = entity.getStartPoint();
  const endPoint = entity.getEndPoint();

  const d = `M${startPoint.x} ${startPoint.y} L${endPoint.x} ${endPoint.y}`;
  const hoverPath = getBoundingPathForLine(startPoint, endPoint);

  React.useEffect(() => {
    if (hover && !dragging) {
      onShowRemoveConnector && onShowRemoveConnector();
    } else {
      onHideRemoveConnector && onHideRemoveConnector();
    }
  }, [hover, dragging, onShowRemoveConnector, onHideRemoveConnector]);

  return (
    // <g onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
    <Layer id={dragging || hover ? 'top' : undefined}>
      <g
        ref={hoverRef}
        data-test-id="edge-handler"
        className={classNames('odc-base-edge', {
          'is-highlight': dragging,
          'is-hover': hover,
        })}
      >
        <path d={hoverPath} fillOpacity={0} strokeWidth={0} />
        <path className="odc-base-edge__path" d={d} fill="none" />
        {children}
      </g>
    </Layer>
    // </g>
  );
};

export default widget(BaseEdgeWidget);
