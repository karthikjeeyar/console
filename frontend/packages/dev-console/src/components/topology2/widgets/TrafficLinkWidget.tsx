import * as React from 'react';
import { EdgeEntity } from '@console/topology/src/types';
import widget from '@console/topology/src/widget';
import ConnectorArrow from '@console/topology/src/arrows/ConnectorArrow';
import BaseEdgeWidget from './BaseEdgeWidget';

import './TrafficLinkWidget.scss';

type TrafficLinkWidgetProps = {
  entity: EdgeEntity;
};

const TrafficLinkWidget: React.FC<TrafficLinkWidgetProps> = ({ entity }) => {
  const { percent } = entity.getData().data;
  let text = null;
  if (percent != null) {
    const startPoint = entity.getStartPoint();
    const endPoint = entity.getEndPoint();
    text = (
      <text
        className="odc-traffic-link__text"
        x={(endPoint.x + startPoint.x) / 2}
        y={(endPoint.y + startPoint.y) / 2}
        textAnchor="middle"
      >
        {percent}%
      </text>
    );
  }
  return (
    <BaseEdgeWidget entity={entity} className="odc-traffic-link">
      <ConnectorArrow edge={entity} />
      {text}
    </BaseEdgeWidget>
  );
};

export default widget(TrafficLinkWidget);
