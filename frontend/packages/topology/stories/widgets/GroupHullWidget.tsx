import * as React from 'react';
import { polygonHull } from 'd3-polygon';
import * as _ from 'lodash';
import { hullPath } from '@console/dev-console/src/utils/svg-utils';
import { WithDragNodeProps } from '../../src/behavior/useDragNode';
import { WithSelectionProps } from '../../src/behavior/useSelection';
import Layer from '../../src/layers/Layer';
import { NodeEntity, PointTuple } from '../../src/types';
import widget from '../../src/widget';
import { WithDndDragProps } from '../../src/behavior/useDndDrag';
import { WithDndDropProps } from '../../src/behavior/useDndDrop';
import useCombineRefs from '../../src/utils/useCombineRefs';

type GroupHullWidgetProps = {
  entity: NodeEntity;
  droppable?: boolean;
  hover?: boolean;
  canDrop?: boolean;
} & WithSelectionProps &
  WithDragNodeProps &
  WithDndDragProps &
  WithDndDropProps;

type PointWithSize = PointTuple | [number, number, number];

const hullPadding = (point: PointWithSize) => (point[2] || 0) + 10;

const GroupHullWidget: React.FC<GroupHullWidgetProps> = ({
  entity,
  selected,
  onSelect,
  dragNodeRef,
  dndDragRef,
  dndDropRef,
  hover,
  droppable,
  canDrop,
}) => {
  const pathRef = React.useRef<string | null>(null);
  const refs = useCombineRefs<SVGPathElement>(dragNodeRef, dndDragRef, dndDropRef);

  if (!droppable || !pathRef.current) {
    const children = entity.getNodes();
    if (children.length === 0) {
      return null;
    }
    const points: PointWithSize[] = new Array(children.length);
    _.forEach(children, (c, i) => {
      const { width, height } = c.getBounds();
      const { x, y } = c.getBounds().getCenter();
      const size = Math.max(width, height);
      points[i] = [x, y, size / 2] as PointWithSize;
    });
    const hullPoints: PointTuple[] | null =
      points.length > 2 ? polygonHull(points as PointTuple[]) : (points as PointTuple[]);
    if (!hullPoints) {
      return null;
    }

    // change the box only when not dragging
    pathRef.current = hullPath(hullPoints, hullPadding);
  }

  return (
    <Layer id="groups">
      <path
        ref={refs}
        onClick={onSelect}
        d={pathRef.current}
        fill={canDrop && hover ? 'lightgreen' : canDrop && droppable ? 'lightblue' : '#ededed'}
        strokeWidth={2}
        stroke={selected ? 'blue' : '#cdcdcd'}
      />
    </Layer>
  );
};

export default widget(GroupHullWidget);
