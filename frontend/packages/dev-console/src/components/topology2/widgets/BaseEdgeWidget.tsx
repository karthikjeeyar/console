import * as React from 'react';
import * as classNames from 'classnames';
import Layer from '@console/topology/src/layers/Layer';
import { EdgeEntity } from '@console/topology/src/types';
import { WithRemoveConnectorProps } from '@console/topology/src/behavior/withRemoveConnector';
import widget from '@console/topology/src/widget';
import useHover from '@console/topology/src/utils/useHover';
import './BaseEdgeWidget.scss';

type EdgeWidgetProps = {
  entity: EdgeEntity;
  dragging?: boolean;
  className?: string;
} & WithRemoveConnectorProps;

const BaseEdgeWidget: React.FC<EdgeWidgetProps> = ({
  entity,
  dragging,
  onShowRemoveConnector,
  onHideRemoveConnector,
  children,
  className,
}) => {
  const [hover, hoverRef] = useHover();
  const startPoint = entity.getStartPoint();
  const endPoint = entity.getEndPoint();

  React.useLayoutEffect(() => {
    if (hover && !dragging) {
      onShowRemoveConnector && onShowRemoveConnector();
    } else {
      onHideRemoveConnector && onHideRemoveConnector();
    }
  }, [hover, dragging, onShowRemoveConnector, onHideRemoveConnector]);

  return (
    <Layer id={dragging || hover ? 'top' : undefined}>
      <g
        ref={hoverRef}
        data-test-id="edge-handler"
        className={classNames(className, 'odc2-base-edge', {
          'is-highlight': dragging,
          'is-hover': hover,
        })}
      >
        <line
          x1={startPoint.x}
          y1={startPoint.y}
          x2={endPoint.x}
          y2={endPoint.y}
          strokeWidth={10}
          stroke="transparent"
        />
        <line
          className="odc2-base-edge__link"
          x1={startPoint.x}
          y1={startPoint.y}
          x2={endPoint.x}
          y2={endPoint.y}
        />
        {children}
      </g>
    </Layer>
  );
};

export default widget(BaseEdgeWidget);
