import * as React from 'react';
import { polygonHull } from 'd3-polygon';
import * as _ from 'lodash';
import { hullPath } from '@console/dev-console/src/utils/svg-utils';
import { WithDragGroupProps } from '../../src/behavior/useDragGroup';
import { WithSelectionProps } from '../../src/behavior/useSelection';
import Layer from '../../src/layers/Layer';
import { NodeEntity, PointTuple } from '../../src/types';
import widget from '../../src/widget';
import { WithDndDragProps } from '../../src/behavior/useDndDrag';
import { WithDndDropProps } from '../../src/behavior/useDndDrop';

type GroupHullWidgetProps = {
  entity: NodeEntity;
  droppable: boolean;
  hover: boolean;
} & WithSelectionProps &
  WithDragGroupProps &
  WithDndDragProps &
  WithDndDropProps;

type PointWithSize = PointTuple | [number, number, number];

const hullPadding = (point: PointWithSize) => (point[2] || 0) + 10;

const GroupHullWidget: React.FC<GroupHullWidgetProps> = ({
  entity,
  selected,
  onSelect,
  dragGroupRef,
  dndDropRef,
  hover,
  droppable,
}) => {
  const pathRef = React.useRef<string | null>(null);

  if (!droppable || !pathRef.current) {
    const children = entity.getNodes();
    if (children.length === 0) {
      return null;
    }
    const points: PointWithSize[] = new Array(children.length);
    _.forEach(children, (c, i) => {
      const { width, height } = c.getBoundingBox();
      const { x, y } = c.getBoundingBox().getCenter();
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
        ref={dragGroupRef || dndDropRef}
        onClick={onSelect}
        d={pathRef.current}
        fill={hover ? 'lightgreen' : droppable ? 'lightblue' : '#ededed'}
        strokeWidth={2}
        stroke={selected ? 'blue' : '#cdcdcd'}
      />
    </Layer>
  );
};

export default widget(GroupHullWidget);
