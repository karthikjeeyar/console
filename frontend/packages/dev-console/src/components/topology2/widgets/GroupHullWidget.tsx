import * as React from 'react';
import { polygonHull } from 'd3-polygon';
import * as _ from 'lodash';
import { createSvgIdUrl, hullPath, Point } from '@console/dev-console/src/utils/svg-utils';
import { WithDragNodeProps } from '@console/topology/src/behavior/useDragNode';
import { WithSelectionProps } from '@console/topology/src/behavior/useSelection';
import Layer from '@console/topology/src/layers/Layer';
import { NodeEntity, PointTuple } from '@console/topology/src/types';
import widget from '@console/topology/src/widget';
import { WithDndDragProps } from '@console/topology/src/behavior/useDndDrag';
import { WithDndDropProps } from '@console/topology/src/behavior/useDndDrop';
import useCombineRefs from '@console/topology/src/utils/useCombineRefs';
import '../../topology/shapes/DefaultGroup.scss';
import * as classNames from 'classnames';
import SvgDropShadowFilter from '../../svg/SvgDropShadowFilter';
import SvgBoxedText from '../../svg/SvgBoxedText';

type GroupHullWidgetProps = {
  entity: NodeEntity;
  droppable?: boolean;
  hover?: boolean;
  canDrop?: boolean;
} & WithSelectionProps &
  WithDragNodeProps &
  WithDndDragProps &
  WithDndDropProps;

const FILTER_ID = 'DefaultGroupShadowFilterId';
const FILTER_ID_HOVER = 'DefaultGroupDropShadowFilterId--hover';

type PointWithSize = PointTuple | [number, number, number];

const hullPadding = (point: PointWithSize) => (point[2] || 0) + 40;

// Return the point whose Y is the largest value.
function findLowestPoint<P extends Point>(points: P[]): P {
  let lowestPoint = points[0];

  _.forEach(points, (p) => {
    if (p[1] > lowestPoint[1]) {
      lowestPoint = p;
    }
  });

  return _.clone(lowestPoint);
}

const GroupHullWidget: React.FC<GroupHullWidgetProps> = ({
  entity,
  selected,
  onSelect,
  dragNodeRef,
  dndDragRef,
  dndDropRef,
  droppable,
  canDrop,
}) => {
  const [groupHover, setGroupHover] = React.useState<boolean>(false);
  const [lowPoint, setLowPoint] = React.useState<[number, number]>([0, 0]);
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

    // Find the lowest point of the set in order to place the group label.
    const lowestPoint = findLowestPoint(hullPoints);
    if (lowestPoint[0] !== lowPoint[0] || lowestPoint[1] !== lowPoint[1]) {
      setLowPoint(findLowestPoint(hullPoints));
    }
  }

  const pathClasses = classNames('odc-default-group', {
    'is-highlight': canDrop,
    'is-selected': selected,
    'is-hover': groupHover,
  });

  return (
    <Layer id="groups">
      <g>
        <SvgDropShadowFilter id={FILTER_ID} />
        <SvgDropShadowFilter id={FILTER_ID_HOVER} dy={3} stdDeviation={7} floodOpacity={0.24} />
        <g
          onMouseEnter={() => setGroupHover(true)}
          onMouseLeave={() => setGroupHover(false)}
          filter={groupHover ? createSvgIdUrl(FILTER_ID_HOVER) : createSvgIdUrl(FILTER_ID)}
        >
          <path
            ref={refs}
            className={pathClasses}
            onClick={onSelect}
            d={pathRef.current}
            onMouseEnter={() => setGroupHover(true)}
            onMouseLeave={() => setGroupHover(false)}
          />
        </g>
        <SvgBoxedText
          className="odc-default-group__label"
          x={lowPoint[0]}
          y={lowPoint[1] + hullPadding(lowPoint) + 30}
          paddingX={20}
          paddingY={5}
        >
          {entity.getLabel()}
        </SvgBoxedText>
      </g>
    </Layer>
  );
};

export default widget(GroupHullWidget);
