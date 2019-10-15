import * as React from 'react';
import * as _ from 'lodash';
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore-next-line
import ReactMeasure from 'react-measure';
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

type Dimensions = {
  width: number;
  height: number;
};

const layoutGraph = (entity: GraphEntity, dimensions: Dimensions | null) => {
  if (dimensions) {
    entity.getBounds().setSize(dimensions.width, dimensions.height);
    entity.layout();
  }
};

const GraphWidget: React.FC<GraphWidgetProps> = ({ entity, panZoomRef }) => {
  const [dimensions, setDimensions] = React.useState<Dimensions | null>(null);
  const layout = entity.getLayout();

  React.useEffect(() => {
    layoutGraph(entity, dimensions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entity, layout]);

  const setGraphDimensions = React.useCallback(
    (contentRect) => {
      const newDimensions: Dimensions = {
        width: contentRect.client.width,
        height: contentRect.client.height,
      };
      if (!dimensions) {
        layoutGraph(entity, newDimensions);
      }
      setDimensions(newDimensions);
    },
    [dimensions, entity],
  );

  const onMeasure = _.debounce(setGraphDimensions, 100);

  const scale = entity.getScale();
  const bounds = entity.getBounds();
  const xBounds = bounds.x;
  const yBounds = bounds.y;

  const renderMeasure = ({ measureRef }: any) => {
    return (
      <svg
        style={{ width: '100%', height: '100%', flexGrow: 1, flexShrink: 1 }}
        onContextMenu={stopEvent}
        ref={measureRef}
      >
        <SvgDefsProvider>
          <g
            ref={panZoomRef}
            transform={`translate(${xBounds}, ${yBounds}) scale(${scale})`}
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

  return (
    <ReactMeasure client onResize={onMeasure}>
      {renderMeasure}
    </ReactMeasure>
  );
};

export default widget(GraphWidget);
