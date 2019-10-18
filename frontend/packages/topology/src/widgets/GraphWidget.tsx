import * as React from 'react';
import * as _ from 'lodash';
import { action } from 'mobx';
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

const TransformGroup: React.FC<EntityProps & WithPanZoomProps> = widget(
  ({ entity, panZoomRef }) => {
    const bounds = entity.getBounds();
    return (
      <g
        ref={panZoomRef}
        transform={`translate(${bounds.x}, ${bounds.y}) scale(${entity.getScale()})`}
        data-id={entity.getId()}
        data-kind={entity.kind}
        data-type={entity.getType()}
      >
        <Inner entity={entity} />
      </g>
    );
  },
);

function stopEvent(e: React.MouseEvent): void {
  e.preventDefault();
  e.stopPropagation();
}

const GraphWidget: React.FC<GraphWidgetProps> = ({ entity, panZoomRef }) => {
  const layout = entity.getLayout();
  React.useEffect(() => {
    entity.layout();
    // Only re-run if the layout changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layout]);

  const onMeasure = React.useMemo(
    () =>
      _.debounce<any>(
        action((contentRect: { client: { width: number; height: number } }) => {
          entity.setBounds(
            entity
              .getBounds()
              .clone()
              .setSize(contentRect.client.width, contentRect.client.height),
          );
        }),
        100,
        { leading: true, trailing: true },
      ),
    [entity],
  );

  // dispose of onMesure
  React.useEffect(() => () => onMeasure.cancel(), [onMeasure]);

  const renderMeasure = ({ measureRef }: { measureRef: React.LegacyRef<any> }) => (
    // render an outer div because react-measure doesn't seem to fire events properly on svg resize
    <div
      style={{
        width: '100%',
        height: '100%',
        flexGrow: 1,
        flexShrink: 1,
        overflow: 'hidden',
        position: 'relative',
      }}
      ref={measureRef}
    >
      <svg
        style={{
          width: '100%',
          height: '100%',
        }}
        onContextMenu={stopEvent}
      >
        <SvgDefsProvider>
          <TransformGroup entity={entity} panZoomRef={panZoomRef} />
        </SvgDefsProvider>
      </svg>
    </div>
  );

  return (
    <ReactMeasure client onResize={onMeasure}>
      {renderMeasure}
    </ReactMeasure>
  );
};

export default widget(GraphWidget);
