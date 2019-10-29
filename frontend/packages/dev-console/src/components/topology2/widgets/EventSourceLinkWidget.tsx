import * as React from 'react';
import { EdgeEntity } from '@console/topology/src/types';
import widget from '@console/topology/src/widget';
import EdgeWidget from './BaseEdgeWidget';
import './EventSourceLinkWidget.scss';

type ConnectsToWidgetProps = {
  entity: EdgeEntity;
};

const ConnectsToWidget: React.FC<ConnectsToWidgetProps> = ({ entity }) => {
  const markerPoint = entity.getEndPoint();
  return (
    <EdgeWidget className="odc-event-source-link" entity={entity}>
      <circle
        className="odc-event-source-link__marker"
        cx={markerPoint.x}
        cy={markerPoint.y}
        r={6}
      />
    </EdgeWidget>
  );
};

export default widget(ConnectsToWidget);
