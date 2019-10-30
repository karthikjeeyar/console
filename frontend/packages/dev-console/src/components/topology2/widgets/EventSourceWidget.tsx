import * as React from 'react';
import { NodeEntity } from '@console/topology/src/types';
import widget from '@console/topology/src/widget';
import useHover from '@console/topology/src/utils/useHover';
import { WithSelectionProps } from '@console/topology/src/behavior/useSelection';
import { WithContextMenuProps } from '@console/topology/src/behavior/withContextMenu';
import { useSvgAnchor } from '@console/topology/src/behavior/useSvgAnchor';
import NodeShadows, { NODE_SHADOW_FILTER_HOVER_URL, NODE_SHADOW_FILTER_URL } from './NodeShadows';

import './EventSourceWidget.scss';

export type EventSourceWidgetProps = {
  entity: NodeEntity;
} & WithSelectionProps &
  WithContextMenuProps;

const EventSourceWidget: React.FC<EventSourceWidgetProps> = ({
  entity,
  selected,
  onSelect,
  onContextMenu,
}) => {
  const svgAnchorRef = useSvgAnchor();
  const [hover, hoverRef] = useHover();
  const { width, height } = entity.getBounds();
  const size = Math.min(width, height);

  return (
    <g onClick={onSelect} onContextMenu={onContextMenu} ref={hoverRef}>
      <NodeShadows />
      <polygon
        className="odc-event-source"
        ref={svgAnchorRef}
        filter={hover ? NODE_SHADOW_FILTER_HOVER_URL : NODE_SHADOW_FILTER_URL}
        points={`${width / 2}, ${(height - size) / 2} ${width - (width - size) / 2},${height /
          2} ${width / 2},${height - (height - size) / 2} ${(width - size) / 2},${height / 2}`}
      />

      {selected && (
        <polygon
          className="odc-event-source__selection"
          points={`${width / 2}, ${(height - size) / 2 - 2} ${width -
            (width - size) / 2 +
            2},${height / 2} ${width / 2},${height - (height - size) / 2 + 2} ${(width - size) / 2 -
            2},${height / 2}`}
        />
      )}
      <image
        x={width * 0.25}
        y={height * 0.25}
        width={size * 0.5}
        height={size * 0.5}
        // TODO replace with icon based on data
        xlinkHref="static/assets/openshift.svg"
      />
    </g>
  );
};

export default widget(EventSourceWidget);
