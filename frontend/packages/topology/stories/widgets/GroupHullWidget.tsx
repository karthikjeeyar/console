import * as React from 'react';
import { polygonHull } from 'd3-polygon';
import * as _ from 'lodash';
import { hullPath } from '@console/dev-console/src/utils/svg-utils';
import { WithGroupDragProps } from '../../src/behavior/useGroupDrag';
import { WithSelectionProps } from '../../src/behavior/useSelection';
import Layer from '../../src/layers/Layer';
import { NodeEntity, PointTuple } from '../../src/types';
import widget from '../../src/widget';

type GroupHullWidgetProps = {
  entity: NodeEntity;
} & WithSelectionProps &
  WithGroupDragProps;

type PointWithSize = PointTuple | [number, number, number];

const hullPadding = (point: PointWithSize) => (point[2] || 0) + 10;

const GroupHullWidget: React.FC<GroupHullWidgetProps> = ({
  entity,
  selected,
  onSelect,
  dragRef,
}) => {
  const children = entity.getChildren();
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
  const containerPath = hullPath(hullPoints, hullPadding);
  return (
    <Layer id="groups">
      <path
        ref={dragRef}
        onClick={onSelect}
        d={containerPath}
        fill="#ededed"
        strokeWidth={2}
        stroke={selected ? 'blue' : '#cdcdcd'}
      />
    </Layer>
  );
};

export default widget(GroupHullWidget);
