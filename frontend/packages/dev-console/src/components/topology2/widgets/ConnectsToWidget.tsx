import * as React from 'react';
import {
  WithSourceDragProps,
  WithTargetDragProps,
} from '@console/topology/src/behavior/useReconnect';
import { EdgeEntity } from '@console/topology/src/types';
import widget from '@console/topology/src/widget';
import ConnectorArrow from '@console/topology/src/arrows/ConnectorArrow';
import EdgeWidget from './BaseEdgeWidget';
import './ConnectsTo.scss';

type ConnectsToWidgetProps = {
  entity: EdgeEntity;
  dragging?: boolean;
} & WithSourceDragProps &
  WithTargetDragProps;

const ConnectsToWidget: React.FC<ConnectsToWidgetProps> = ({
  entity,
  targetDragRef,
  ...others
}) => (
  <EdgeWidget entity={entity} {...others}>
    <ConnectorArrow dragRef={targetDragRef} edge={entity} className="odc-connects-to" />
  </EdgeWidget>
);

export default widget(ConnectsToWidget);
