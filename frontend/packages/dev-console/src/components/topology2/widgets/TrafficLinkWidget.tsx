import * as React from 'react';
import { EdgeEntity } from '@console/topology/src/types';
import ConnectorArrow from '@console/topology/src/arrows/ConnectorArrow';
import BaseEdgeWidget from './BaseEdgeWidget';

import './TrafficLinkWidget.scss';

type TrafficLinkWidgetProps = {
  entity: EdgeEntity;
};

const TrafficLinkWidget: React.FC<TrafficLinkWidgetProps> = ({ entity }) => (
  <BaseEdgeWidget entity={entity} className="odc-traffic-link">
    <ConnectorArrow edge={entity} />
  </BaseEdgeWidget>
);

export default TrafficLinkWidget;
