import * as React from 'react';
import SvgDefsProvider from '@console/dev-console/src/components/svg/SvgDefsProvider';
import { GraphEntity } from '../types';
import { WithPanZoomProps } from '../behavior/usePanZoom';
import LayersProvider from '../layers/LayersProvider';
import { DEFAULT_LAYER } from '../layers/LayersContext';
import widget from '../widget';
import EntityWidget from './EntityWidget';

type EntityProps = {
  entity: GraphEntity;
};

type GraphWidgetProps = EntityProps & WithPanZoomProps;

// This inner Component will prevent the re-rendering of all children when the panZoomTransform changes
const EntityChildren: React.FC<EntityProps> = widget(({ entity }) => {
  return (
    <>
      {entity.getEdges().map((e) => (
        <EntityWidget key={e.getId()} entity={e} />
      ))}
      {entity.getNodes().map((e) => (
        <EntityWidget key={e.getId()} entity={e} />
      ))}
    </>
  );
});

// This inner Component will prevent re-rendering layers when the panZoomTransform changes
const Inner: React.FC<EntityProps> = React.memo(({ entity }) => (
  <LayersProvider layers={['bottom', 'groups', DEFAULT_LAYER, 'top']}>
    <EntityChildren entity={entity} />
  </LayersProvider>
));

function stopEvent(e: React.MouseEvent): void {
  e.preventDefault();
  e.stopPropagation();
}

const GraphWidget: React.FC<GraphWidgetProps> = ({ entity, panZoomRef }) => {
  React.useEffect(() => {
    entity.layout();
  }, [entity]);

  return (
    <svg
      style={{ width: '100%', height: '100%', flexGrow: 1, flexShrink: 1 }}
      onContextMenu={stopEvent}
    >
      <SvgDefsProvider>
        <g
          ref={panZoomRef}
          transform={`translate(${entity.getBounds().x}, ${
            entity.getBounds().y
          }) scale(${entity.getScale()})`}
          data-id={entity.getId()}
          data-kind={entity.kind}
          data-type={entity.getType()}
        >
          <Inner entity={entity} />
        </g>
      </SvgDefsProvider>
    </svg>
  );
};

export default widget(GraphWidget);
