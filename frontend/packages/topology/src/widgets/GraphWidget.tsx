import * as React from 'react';
import SvgDefsProvider from '@console/dev-console/src/components/svg/SvgDefsProvider';
import { GraphEntity } from '../types';
import { PanZoomHandlerProps } from '../handlers/PanZoomHandler';
import widget from './widget';
import EntityWidget from './EntityWidget';

type EntityProps = {
  entity: GraphEntity;
};

type GraphWidgetProps = EntityProps & PanZoomHandlerProps;

// This inner Component will prevent the re-rendering of all children when the panZoomTransform changes
const EntityChildren: React.FC<EntityProps> = widget(({ entity }) => {
  return (
    <>
      {entity.getNodes().map((e) => (
        <EntityWidget key={e.getId()} entity={e} />
      ))}
      {entity.getEdges().map((e) => (
        <EntityWidget key={e.getId()} entity={e} />
      ))}
    </>
  );
});

const GraphWidget: React.FC<GraphWidgetProps> = ({ entity, panZoomRef, panZoomTransform }) => {
  return (
    <svg style={{ width: '100%', height: '100%', flexGrow: 1, flexShrink: 1 }}>
      <SvgDefsProvider>
        <g ref={panZoomRef} transform={panZoomTransform && panZoomTransform.toString()}>
          <EntityChildren entity={entity} />
        </g>
      </SvgDefsProvider>
    </svg>
  );
};

export default widget(GraphWidget);
