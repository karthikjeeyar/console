import * as React from 'react';
import {
  WithSourceDragProps,
  WithTargetDragProps,
} from '@console/topology/src/behavior/useReconnect';
import { WithRemoveConnectorProps } from '@console/topology/src/behavior/withRemoveConnector';
import { EdgeEntity } from '@console/topology/src/types';
import widget from '@console/topology/src/widget';
import ConnectorArrow from '@console/topology/src/arrows/ConnectorArrow';
import BaseEdgeWidget from './BaseEdgeWidget';
import './ServiceBindingWidget.scss';

type ServiceBindingWidgetProps = {
  entity: EdgeEntity;
  dragging?: boolean;
} & WithSourceDragProps &
  WithTargetDragProps &
  WithRemoveConnectorProps;

const ServiceBindingWidget: React.FC<ServiceBindingWidgetProps> = ({
  entity,
  targetDragRef,
  children,
  ...others
}) => (
  <BaseEdgeWidget entity={entity} {...others} className="odc2-service-binding">
    <ConnectorArrow dragRef={targetDragRef} edge={entity} />
    {children}
  </BaseEdgeWidget>
);

export default widget(ServiceBindingWidget);
