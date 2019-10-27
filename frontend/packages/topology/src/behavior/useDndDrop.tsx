import * as React from 'react';
import * as d3 from 'd3';
import { observer } from 'mobx-react';
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import { pointInSvgPath } from 'point-in-svg-path';
import EntityContext from '../utils/EntityContext';
import Point from '../geom/Point';
import { ElementEntity } from '../types';
import {
  ConnectDropTarget,
  DropTargetSpec,
  DropTargetMonitor,
  Identifier,
  DragEvent,
} from './dnd-types';
import { useDndManager } from './useDndManager';

const EMPTY_PROPS = Object.freeze({});

export const useDndDrop = <
  DragObject,
  DropResult = ElementEntity,
  CollectedProps extends {} = {},
  Props extends {} = {}
>(
  spec: DropTargetSpec<DragObject, DropResult, CollectedProps, Props>,
  props?: Props,
): [CollectedProps, ConnectDropTarget] => {
  const specRef = React.useRef(spec);
  specRef.current = spec;

  const propsRef = React.useRef(props != null ? props : (EMPTY_PROPS as Props));
  propsRef.current = props != null ? props : (EMPTY_PROPS as Props);

  const dndManager = useDndManager();

  const nodeRef = React.useRef<SVGElement | null>(null);
  const idRef = React.useRef<string>();

  const monitor = React.useMemo((): DropTargetMonitor => {
    const targetMonitor: DropTargetMonitor = {
      getHandlerId: (): string | undefined => {
        return idRef.current;
      },
      receiveHandlerId: (sourceId: string | undefined): void => {
        idRef.current = sourceId;
      },
      canDrop: (): boolean => {
        return dndManager.canDropOnTarget(idRef.current);
      },
      isDragging: (): boolean => {
        return dndManager.isDragging();
      },
      isOver(options?: { shallow?: boolean }): boolean {
        return dndManager.isOverTarget(idRef.current, options);
      },
      getItemType: (): Identifier | undefined => {
        return dndManager.getItemType();
      },
      getItem: (): any => {
        return dndManager.getItem();
      },
      getDropResult: (): any => {
        return dndManager.getDropResult();
      },
      didDrop: (): boolean => {
        return dndManager.didDrop();
      },
      getDragEvent: (): DragEvent | undefined => {
        return dndManager.getDragEvent();
      },
      getOperation: (): string => {
        return dndManager.getOperation();
      },
    };
    return targetMonitor;
  }, [dndManager]);

  const entity = React.useContext(EntityContext);
  const entityRef = React.useRef(entity);
  entityRef.current = entity;

  React.useEffect(() => {
    const [targetId, unregister] = dndManager.registerTarget({
      type: spec.accept,
      hitTest: (x: number, y: number): boolean => {
        if (specRef.current.hitTest) {
          return specRef.current.hitTest(x, y, propsRef.current);
        }
        if (nodeRef.current) {
          if (!(nodeRef.current instanceof SVGGraphicsElement)) {
            return false;
          }
          // perform a fast bounds check
          const { left, right, top, bottom } = nodeRef.current.getBBox();
          if (x < left || x > right || y < top || y > bottom) {
            return false;
          }

          // translate to this entity's coordinates
          // assumes the node is not within an svg element containing another transform
          const point = Point.singleUse(x, y);
          entityRef.current.translateFromAbsolute(point);

          if (nodeRef.current instanceof SVGPathElement) {
            const d = nodeRef.current.getAttribute('d');
            return pointInSvgPath(d, point.x, point.y);
          }
          if (nodeRef.current instanceof SVGCircleElement) {
            const { cx, cy, r } = nodeRef.current;
            return (
              Math.sqrt((point.x - cx.animVal.value) ** 2 + (point.y - cy.animVal.value) ** 2) <
              r.animVal.value
            );
          }
          if (nodeRef.current instanceof SVGEllipseElement) {
            const { cx, cy, rx, ry } = nodeRef.current;
            return (
              (point.x - cx.animVal.value) ** 2 / rx.animVal.value ** 2 +
                (point.y - cy.animVal.value) ** 2 / ry.animVal.value ** 2 <=
              1
            );
          }
          if (nodeRef.current instanceof SVGPolygonElement) {
            const arr = (nodeRef.current.getAttribute('points') || '')
              .replace(/,/g, ' ')
              .split(' ')
              .map((s) => +s);
            const points: [number, number][] = [];
            for (let i = 0; i < arr.length; i += 2) {
              points.push(arr.slice(i, i + 2) as [number, number]);
            }
            return d3.polygonContains(points, [point.x, point.y]);
          }
          // TODO support round rect

          // already passed the bbox test
          return true;
        }
        return false;
      },
      hover: (): void =>
        specRef.current.hover &&
        specRef.current.hover(monitor.getItem(), monitor, propsRef.current),
      canDrop: (): boolean =>
        typeof specRef.current.canDrop === 'boolean'
          ? specRef.current.canDrop
          : typeof specRef.current.canDrop === 'function'
          ? specRef.current.canDrop(monitor.getItem(), monitor, propsRef.current)
          : true,
      drop: () =>
        specRef.current.drop
          ? specRef.current.drop(monitor.getItem(), monitor, propsRef.current)
          : !monitor.didDrop()
          ? entityRef.current
          : undefined,
    });
    monitor.receiveHandlerId(targetId);
    return unregister;
  }, [spec.accept, dndManager, monitor]);

  return [
    spec.collect
      ? spec.collect(monitor, props != null ? props : (EMPTY_PROPS as Props))
      : (({} as any) as CollectedProps),
    nodeRef as any,
  ];
};

export type WithDndDropProps = {
  dndDropRef: ConnectDropTarget;
};

export const withDndDrop = <
  DragObject,
  DropResult = ElementEntity,
  CollectedProps extends {} = {},
  Props extends {} = {}
>(
  spec: DropTargetSpec<DragObject, DropResult, CollectedProps, Props>,
) => <P extends WithDndDropProps & CollectedProps & Props>(
  WrappedComponent: React.ComponentType<P>,
) => {
  const Component: React.FC<Omit<P, keyof WithDndDropProps & CollectedProps>> = (props) => {
    // TODO why is props giving an error but not in useDndDrag
    const [dndDropProps, dndDropRef] = useDndDrop(spec, props as any);
    return <WrappedComponent {...props as any} {...dndDropProps} dndDropRef={dndDropRef} />;
  };
  return observer(Component);
};
