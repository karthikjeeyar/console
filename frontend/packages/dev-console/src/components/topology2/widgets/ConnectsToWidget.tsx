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
import './ConnectsToWidget.scss';

type ConnectsToWidgetProps = {
  entity: EdgeEntity;
  dragging?: boolean;
} & WithSourceDragProps &
  WithTargetDragProps &
  WithRemoveConnectorProps;

const ConnectsToWidget: React.FC<ConnectsToWidgetProps> = ({
  entity,
  targetDragRef,
  children,
  ...others
}) => (
  <BaseEdgeWidget entity={entity} {...others}>
    <ConnectorArrow dragRef={targetDragRef} edge={entity} className="odc2-connects-to" />
    {children}
  </BaseEdgeWidget>
);

export default widget(ConnectsToWidget);
