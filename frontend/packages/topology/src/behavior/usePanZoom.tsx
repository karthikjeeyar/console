import * as React from 'react';
import * as d3 from 'd3';
import { observer } from 'mobx-react';
import { GraphEntity, EventListener } from '../types';

export type PanZoomTransform = {
  x: number;
  y: number;
  k: number;
};

const ZOOM_EXTENT: [number, number] = [0.25, 4];

export const PAN_ZOOM_EVENT = 'pan-zoom';

export type PanZoomEventListener = EventListener<[PanZoomTransform]>;

type PanZoomTransformState = {
  panZoomTransform: PanZoomTransform;
};

type PanZoomRef = (node: SVGElement | null) => void;

export const usePanZoom = (
  entity: GraphEntity,
  zoomExtent: [number, number] = ZOOM_EXTENT,
  controlled: boolean = false,
): [PanZoomTransform | undefined, PanZoomRef] => {
  const refCallback = React.useCallback(
    (node: SVGElement | null) => {
      if (node) {
        // TODO fix any type
        const $svg = d3.select(node.ownerSVGElement) as any;
        const zoom = d3
          .zoom()
          .scaleExtent(zoomExtent)
          .on('zoom', () => {
            if (!controlled) {
              entity.getController().getState<PanZoomTransformState>().panZoomTransform =
                d3.event.transform;
            }
            entity.getController().fireEvent(PAN_ZOOM_EVENT, d3.event.transform);
          });
        zoom($svg);
      }
    },
    [controlled, entity, zoomExtent],
  );

  return [entity.getController().getState<PanZoomTransformState>().panZoomTransform, refCallback];
};

export type WithPanZoomProps = {
  panZoomRef: PanZoomRef;
  panZoomTransform: PanZoomTransform;
};

type EntityProps = {
  entity: GraphEntity;
};

export const withPanZoom = (
  controlled: boolean = false,
  zoomExtent: [number, number] = ZOOM_EXTENT,
) => <P extends WithPanZoomProps>(WrappedComponent: React.ComponentType<P>) => {
  const Component: React.FC<Omit<P, keyof WithPanZoomProps> & EntityProps> = (props) => {
    const [panZoomTransform, panZoomRef] = usePanZoom(props.entity, zoomExtent, controlled);
    return (
      <WrappedComponent
        {...props as any}
        panZoomRef={panZoomRef}
        panZoomTransform={panZoomTransform}
      />
    );
  };
  return observer(Component);
};
