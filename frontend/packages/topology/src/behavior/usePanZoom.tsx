import * as React from 'react';
import * as d3 from 'd3';
import { observer } from 'mobx-react';
import { action, autorun } from 'mobx';
import EntityContext from '../utils/EntityContext';
import useCallbackRef from '../utils/useCallbackRef';
import { isGraphEntity } from '../types';

export type PanZoomTransform = {
  x: number;
  y: number;
  k: number;
};

const ZOOM_EXTENT: [number, number] = [0.25, 4];

export type PanZoomRef = (node: SVGGElement | null) => void;

export const usePanZoom = (zoomExtent: [number, number] = ZOOM_EXTENT): PanZoomRef => {
  const entity = React.useContext(EntityContext);
  if (!isGraphEntity(entity)) {
    throw new Error('usePanZoom must be used within the scope of a GraphEntity');
  }
  const entityRef = React.useRef(entity);
  entityRef.current = entity;

  const refCallback = useCallbackRef<PanZoomRef>(
    React.useCallback(
      (node: SVGGElement | null) => {
        if (node) {
          // TODO fix any type
          const $svg = d3.select(node.ownerSVGElement) as any;
          const zoom = d3
            .zoom()
            .scaleExtent(zoomExtent)
            .on(
              'zoom',
              action(() => {
                entityRef.current
                  .getBounds()
                  .setLocation(d3.event.transform.x, d3.event.transform.y);
                entityRef.current.setScale(d3.event.transform.k);
              }),
            );
          zoom($svg);

          // FIXME this is kinda hacky
          autorun(() => {
            const scale = entityRef.current.getScale();

            // update the min scaling value such that the user can zoom out to the new scale in case
            // it is smaller than the default zoom out scale
            zoom.scaleExtent([Math.min(scale, zoomExtent[0]), zoomExtent[1]]);
            const b = entityRef.current.getBounds();

            // update d3 zoom data directly
            // eslint-disable-next-line no-underscore-dangle
            Object.assign($svg.node().__zoom, {
              k: scale,
              x: b.x,
              y: b.y,
            });
          });

          // disable double click zoom
          // $svg.on('dblclick.zoom', null);
        }
        return () => {
          if (node) {
            // remove all zoom listeners
            d3.select(node.ownerSVGElement).on('.zoom', null);
          }
        };
      },
      [zoomExtent],
    ),
  );

  return refCallback;
};

export type WithPanZoomProps = {
  panZoomRef: PanZoomRef;
};

export const withPanZoom = (zoomExtent: [number, number] = ZOOM_EXTENT) => <
  P extends WithPanZoomProps
>(
  WrappedComponent: React.ComponentType<P>,
) => {
  const Component: React.FC<Omit<P, keyof WithPanZoomProps>> = (props) => {
    const panZoomRef = usePanZoom(zoomExtent);
    return <WrappedComponent {...props as any} panZoomRef={panZoomRef} />;
  };
  return observer(Component);
};
