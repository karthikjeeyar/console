import * as React from 'react';
import * as d3 from 'd3';
import { observer } from 'mobx-react';
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import { pointInSvgPath } from 'point-in-svg-path';
import EntityContext from '../utils/EntityContext';
import {
  ConnectDropTarget,
  DragObjectWithType,
  DropTargetSpec,
  DropTargetMonitor,
  Identifier,
  DragEvent,
} from './dnd-types';
import { useDndManager } from './useDndManager';

export const useDndDrop = <
  DragObject extends DragObjectWithType,
  DropResult,
  CollectedProps,
  Props = {}
>(
  spec: DropTargetSpec<DragObject, DropResult, CollectedProps, Props>,
  props?: Props,
): [CollectedProps, ConnectDropTarget] => {
  const specRef = React.useRef(spec);
  specRef.current = spec;

  const propsRef = React.useRef(props);
  propsRef.current = props;

  const dndManager = useDndManager();
  const dndManagerRef = React.useRef(dndManager);
  dndManagerRef.current = dndManager;

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
        return dndManagerRef.current.canDropOnTarget(idRef.current);
      },
      isDragging: (): boolean => {
        return dndManagerRef.current.isDragging();
      },
      isOver(options?: { shallow?: boolean }): boolean {
        return dndManagerRef.current.isOverTarget(idRef.current, options);
      },
      getItemType: (): Identifier | undefined => {
        return dndManagerRef.current.getItemType();
      },
      getItem: (): any => {
        return dndManagerRef.current.getItem();
      },
      getDropResult: (): any => {
        return dndManagerRef.current.getDropResult();
      },
      didDrop: (): boolean => {
        return dndManagerRef.current.didDrop();
      },
      getDragEvent: (): DragEvent | undefined => {
        return dndManagerRef.current.getDragEvent();
      },
    };
    return targetMonitor;
  }, []);
  const monitorRef = React.useRef(monitor);
  monitorRef.current = monitor;

  const entity = React.useContext(EntityContext);
  const entityRef = React.useRef(entity);
  entityRef.current = entity;

  React.useEffect(() => {
    const [targetId, unregister] = dndManager.registerTarget({
      type: spec.accept,
      getBoundingBox: (): any => {
        if (nodeRef.current) {
          const rect = nodeRef.current.getBoundingClientRect();
          return { x0: rect.left, x1: rect.right, y0: rect.top, y1: rect.bottom };
        }
        return null;
      },
      hitTest: (x: number, y: number): boolean => {
        if (specRef.current.hitTest) {
          return specRef.current.hitTest(x, y);
        }
        if (nodeRef.current) {
          if (nodeRef.current instanceof SVGPathElement) {
            const d = nodeRef.current.getAttribute('d');
            return pointInSvgPath(d, x, y);
          }
          if (nodeRef.current instanceof SVGCircleElement) {
            const cx = +(nodeRef.current.getAttribute('cx') || 0);
            const cy = +(nodeRef.current.getAttribute('cy') || 0);
            const r = +(nodeRef.current.getAttribute('r') || 0);
            return Math.sqrt((x - cx) ** 2 + (y - cy) ** 2) < r;
          }
          if (nodeRef.current instanceof SVGEllipseElement) {
            const cx = +(nodeRef.current.getAttribute('cx') || 0);
            const cy = +(nodeRef.current.getAttribute('cy') || 0);
            const rx = +(nodeRef.current.getAttribute('rx') || 0);
            const ry = +(nodeRef.current.getAttribute('ry') || 0);
            return (x - cx) ** 2 / rx ** 2 + (y - cy) ** 2 / ry ** 2 <= 1;
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
            return d3.polygonContains(points, [x, y]);
          }
          // TODO support round rect
          const rect = nodeRef.current.getBoundingClientRect();
          return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
        }
        return false;
      },
      hover: (): void =>
        specRef.current.hover &&
        specRef.current.hover(monitorRef.current.getItem(), monitorRef.current, propsRef.current),
      canDrop: (): boolean =>
        typeof specRef.current.canDrop === 'boolean'
          ? specRef.current.canDrop
          : typeof specRef.current.canDrop === 'function'
          ? specRef.current.canDrop(monitorRef.current.getItem(), monitor, props)
          : true,
      drop: () =>
        specRef.current.drop
          ? specRef.current.drop(monitorRef.current.getItem(), monitorRef.current, propsRef.current)
          : !monitorRef.current.didDrop()
          ? entityRef.current
          : undefined,
    });
    monitor.receiveHandlerId(targetId);
    return unregister;
  }, [spec.accept, dndManager, monitor, props]);

  return [spec.collect ? spec.collect(monitor) : (({} as any) as CollectedProps), nodeRef as any];
};

export type WithDndDropProps = {
  dndDropRef: ConnectDropTarget;
};

export const withDndDrop = <
  DragObject extends DragObjectWithType,
  DropResult,
  CollectedProps,
  Props = {}
>(
  spec: DropTargetSpec<DragObject, DropResult, CollectedProps, Props>,
) => <P extends WithDndDropProps & CollectedProps & Props>(
  WrappedComponent: React.ComponentType<P>,
) => {
  const Component: React.FC<Omit<P, keyof WithDndDropProps & CollectedProps>> = observer(
    (props) => {
      // TODO why is props giving an error but not in useDndDrag
      const [dndDropProps, dndDropRef] = useDndDrop(spec, props as any);
      return <WrappedComponent {...props as any} dndDropRef={dndDropRef} {...dndDropProps} />;
    },
  );
  return Component;
};
