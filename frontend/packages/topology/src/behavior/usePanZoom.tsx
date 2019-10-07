import * as React from 'react';
import * as d3 from 'd3';
import { observer } from 'mobx-react';
import { action } from 'mobx';
import useCallbackRef from '../utils/useCallbackRef';
import { GraphEntity } from '../types';

export type PanZoomTransform = {
  x: number;
  y: number;
  k: number;
};

const ZOOM_EXTENT: [number, number] = [0.25, 4];

export type PanZoomRef = (node: SVGElement | null) => void;

export const usePanZoom = (
  entity: GraphEntity,
  zoomExtent: [number, number] = ZOOM_EXTENT,
): PanZoomRef => {
  const refCallback = useCallbackRef(
    React.useCallback(
      (node: SVGElement | null) => {
        if (node) {
          // TODO fix any type
          const $svg = d3.select(node.ownerSVGElement) as any;
          const zoom = d3
            .zoom()
            .scaleExtent(zoomExtent)
            .on(
              'zoom',
              action(() => {
                entity.getBounds().setLocation(d3.event.transform.x, d3.event.transform.y);
                entity.setScale(d3.event.transform.k);
              }),
            );
          zoom($svg);
        }
        return () => {
          if (node) {
            // remove all zomo listeners
            d3.select(node.ownerSVGElement).on('.zoom', null);
          }
        };
      },
      [entity, zoomExtent],
    ),
  );

  return refCallback;
};

export type WithPanZoomProps = {
  panZoomRef: PanZoomRef;
  panZoomTransform: PanZoomTransform;
};

type EntityProps = {
  entity: GraphEntity;
};

export const withPanZoom = (zoomExtent: [number, number] = ZOOM_EXTENT) => <
  P extends WithPanZoomProps
>(
  WrappedComponent: React.ComponentType<P>,
) => {
  const Component: React.FC<Omit<P, keyof WithPanZoomProps> & EntityProps> = (props) => {
    const panZoomRef = usePanZoom(props.entity, zoomExtent);
    return <WrappedComponent {...props as any} panZoomRef={panZoomRef} />;
  };
  return observer(Component);
};
