import * as React from 'react';
import * as _ from 'lodash';
import { NodeEntity } from '../../src/types';
import widget from '../../src/widget';
import { useSvgAnchor } from '../../src/behavior/useSvgAnchor';
import { WithDragNodeProps } from '../../src/behavior/useDragNode';
import { WithSelectionProps } from '../../src/behavior/useSelection';
import { WithDndDragProps } from '../../src/behavior/useDndDrag';
import { WithDndDropProps } from '../../src/behavior/useDndDrop';
import { combineRefs } from '../../src/utils/combineRefs';
import Point from '../../src/geom/Point';

type NodePolygonWidgetProps = {
  entity: NodeEntity;
  droppable?: boolean;
  hover?: boolean;
  canDrop?: boolean;
} & WithSelectionProps &
  WithDragNodeProps &
  WithDndDragProps &
  WithDndDropProps;

const NodePolygonWidget: React.FC<NodePolygonWidgetProps> = ({
  entity,
  selected,
  onSelect,
  dragNodeRef,
  dndDragRef,
  droppable,
  hover,
  canDrop,
  dndDropRef,
}) => {
  const anchorRef = useSvgAnchor();
  const { width, height } = entity.getBounds();

  const points: Point[] = [
    new Point(width / 2, 0),
    new Point(width - width / 8, height),
    new Point(0, height / 3),
    new Point(width, height / 3),
    new Point(width / 8, height),
  ];

  const p: string = _.reduce(
    points,
    (result: string, nextPoint: Point) => {
      return `${result}${nextPoint.x},${nextPoint.y} `;
    },
    '',
  );

  return (
    <polygon
      ref={combineRefs([dragNodeRef, dndDragRef, dndDropRef, anchorRef])}
      onClick={onSelect}
      points={p}
      fill={
        canDrop && hover
          ? 'lightgreen'
          : canDrop && droppable
          ? 'lightblue'
          : selected
          ? 'blue'
          : 'grey'
      }
      strokeWidth={1}
      stroke="#333333"
    />
  );
};

export default widget(NodePolygonWidget);
