import * as React from 'react';
import { GraphEntity } from '../types';
import { WithPanZoomProps } from '../behavior/usePanZoom';
import LayersProvider from '../layers/LayersProvider';
import { DEFAULT_LAYER } from '../layers/LayersContext';
import widget from '../widget';
import { WithDndDropProps } from '../behavior/useDndDrop';
import { WithSelectionProps } from '../behavior/useSelection';
import useCombineRefs from '../utils/useCombineRefs';
import EntityWidget from './EntityWidget';

type EntityProps = {
  entity: GraphEntity;
};

type GraphWidgetProps = EntityProps & WithPanZoomProps & WithDndDropProps & WithSelectionProps;

// This inner Component will prevent the re-rendering of all children when the transform changes
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

// This inner Component will prevent re-rendering layers when the transform changes
const Inner: React.FC<EntityProps> = React.memo(({ entity }) => (
  <LayersProvider layers={['bottom', 'groups', DEFAULT_LAYER, 'top']}>
    <EntityChildren entity={entity} />
  </LayersProvider>
));

const GraphWidget: React.FC<GraphWidgetProps> = ({ entity, panZoomRef, dndDropRef, onSelect }) => {
  const layout = entity.getLayout();
  const refs = useCombineRefs<SVGPathElement>(panZoomRef, dndDropRef);
  React.useEffect(() => {
    entity.layout();
    // Only re-run if the layout changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layout]);

  const bounds = entity.getBounds();
  return (
    <>
      <rect
        x={0}
        y={0}
        width={bounds.width}
        height={bounds.height}
        fillOpacity={0}
        onClick={onSelect}
      />
      <g ref={refs} transform={`translate(${bounds.x}, ${bounds.y}) scale(${entity.getScale()})`}>
        <Inner entity={entity} />
      </g>
    </>
  );
};

export default widget(GraphWidget);
