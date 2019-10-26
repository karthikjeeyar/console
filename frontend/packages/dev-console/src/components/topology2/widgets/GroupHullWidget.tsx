import * as React from 'react';
import { polygonHull } from 'd3-polygon';
import * as _ from 'lodash';
import { createSvgIdUrl, hullPath, Point } from '@console/dev-console/src/utils/svg-utils';
import { WithDragNodeProps } from '@console/topology/src/behavior/useDragNode';
import { WithSelectionProps } from '@console/topology/src/behavior/useSelection';
import Layer from '@console/topology/src/layers/Layer';
import { NodeEntity, PointTuple, NodeShape, GroupStyle } from '@console/topology/src/types';
import widget from '@console/topology/src/widget';
import { WithDndDragProps } from '@console/topology/src/behavior/useDndDrag';
import { WithDndDropProps } from '@console/topology/src/behavior/useDndDrop';
import { WithContextMenuProps } from '@console/topology/src/behavior/withContextMenu';
import useCombineRefs from '@console/topology/src/utils/useCombineRefs';
import useHover from '@console/topology/src/behavior/useHover';
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
  WithDndDropProps &
  WithContextMenuProps;

const FILTER_ID = 'DefaultGroupShadowFilterId';
const FILTER_ID_HOVER = 'DefaultGroupDropShadowFilterId--hover';

type PointWithSize = PointTuple | [number, number, number];

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
  onContextMenu,
}) => {
  const [groupHoverRef, groupHover] = useHover();
  const [lowPoint, setLowPoint] = React.useState<[number, number]>([0, 0]);
  const pathRef = React.useRef<string | null>(null);
  const refs = useCombineRefs<SVGPathElement>(dragNodeRef, dndDragRef, dndDropRef);

  // cast to number and coerce
  const padding = +(entity.getStyle<GroupStyle>().padding as number);
  const hullPadding = (point: PointWithSize) => (point[2] || 0) + padding;

  if (!droppable || !pathRef.current) {
    const children = entity.getNodes();
    if (children.length === 0) {
      return null;
    }
    const points: PointWithSize[] = [];
    _.forEach(children, (c) => {
      if (c.getNodeShape() === NodeShape.circle) {
        const { width, height } = c.getBounds();
        const { x, y } = c.getBounds().getCenter();
        const radius = Math.max(width, height) / 2;
        points.push([x, y, radius] as PointWithSize);
      } else {
        // add all 4 corners
        const { width, height, x, y } = c.getBounds();
        points.push([x, y, 0] as PointWithSize);
        points.push([x + width, y, 0] as PointWithSize);
        points.push([x, y + height, 0] as PointWithSize);
        points.push([x + width, y + height, 0] as PointWithSize);
      }
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
        <g ref={groupHoverRef} onContextMenu={onContextMenu}>
          <path
            ref={refs}
            filter={groupHover ? createSvgIdUrl(FILTER_ID_HOVER) : createSvgIdUrl(FILTER_ID)}
            className={pathClasses}
            onClick={onSelect}
            d={pathRef.current}
          />
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
      </g>
    </Layer>
  );
};

export default widget(GroupHullWidget);
