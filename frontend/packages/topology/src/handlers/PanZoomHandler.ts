import * as d3 from 'd3';
import { GraphEntity, EventListener } from '../types';
import AbstractInteractionHandler from './AbstractInteractionHandler';

export type PanZoomTransform = {
  x: number;
  y: number;
  k: number;
};

export const PAN_ZOOM_EVENT = 'pan-zoom';

export type PanZoomEventListener = EventListener<[PanZoomTransform]>;

type PanZoomTransformState = {
  panZoomTransform: PanZoomTransform;
};

export type PanZoomHandlerProps = {
  panZoomRef: (node: SVGGElement) => void;
  panZoomTransform: PanZoomTransform;
};

const ZOOM_EXTENT: [number, number] = [0.25, 4];

export default class PanZoomHandler extends AbstractInteractionHandler<
  PanZoomHandlerProps,
  PanZoomTransformState,
  GraphEntity
> {
  private controlled: boolean;

  private extent: [number, number];

  private panZoomRef = (node: SVGGElement): void => {
    if (node) {
      const $svg = d3.select(node.ownerSVGElement) as any;
      const zoom = d3
        .zoom()
        .scaleExtent(this.extent)
        .on('zoom', () => {
          if (!this.controlled) {
            this.getState().panZoomTransform = d3.event.transform;
          }
          this.fireEvent(PAN_ZOOM_EVENT, d3.event.transform);
        });
      zoom($svg);
    }
  };

  constructor(controlled: boolean = false, extent: [number, number] = ZOOM_EXTENT) {
    super();
    this.controlled = controlled;
    this.extent = extent;
  }

  getProps(): PanZoomHandlerProps {
    return {
      panZoomRef: this.panZoomRef,
      panZoomTransform: this.getState().panZoomTransform,
    };
  }
}
