import * as React from 'react';
import cx from 'classnames';
import { TooltipPosition, Tooltip } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import { NodeEntity, AnchorEnd } from '@console/topology/src/types';
import widget from '@console/topology/src/widget';
import { WithSelectionProps } from '@console/topology/src/behavior/useSelection';
import { WithContextMenuProps } from '@console/topology/src/behavior/withContextMenu';
import RectAnchor from '@console/topology/src/anchors/RectAnchor';
import { useAnchor } from '@console/topology/src/behavior/useAnchor';
import { WithDragNodeProps } from '@console/topology/src/behavior/useDragNode';
import Layer from '@console/topology/src/layers/Layer';
import { useSvgAnchor } from '@console/topology/src/behavior/useSvgAnchor';
import SvgBoxedText from '../../svg/SvgBoxedText';
import Decorator from '../../topology/shapes/Decorator';

import './KnativeServiceWidget.scss';

export type EventSourceWidgetProps = {
  entity: NodeEntity;
  dragging: boolean;
  regrouping: boolean;
} & WithSelectionProps &
  WithDragNodeProps &
  WithContextMenuProps;

const KnativeServiceWidget: React.FC<EventSourceWidgetProps> = ({
  entity,
  selected,
  onSelect,
  onContextMenu,
  dragNodeRef,
  dragging,
  regrouping,
}) => {
  const trafficAnchor = useSvgAnchor(AnchorEnd.source, 'revision-traffic');
  useAnchor(RectAnchor);
  const { x, y, width, height } = entity.getBounds();
  const { data } = entity.getData();

  return (
    <g onClick={onSelect} onContextMenu={onContextMenu}>
      <Layer id={dragging && regrouping ? undefined : 'groups2'}>
        <rect
          ref={dragNodeRef}
          className={cx('odc-knative-service', {
            'is-selected': selected,
            'is-dragging': dragging,
          })}
          x={x}
          y={y}
          width={width}
          height={height}
          rx="5"
          ry="5"
        />
      </Layer>
      {data.url ? (
        <Tooltip key="route" content="Open URL" position={TooltipPosition.right}>
          <Decorator
            circleRef={trafficAnchor}
            x={x + width}
            y={y}
            radius={13}
            href={data.url}
            external
          >
            <g transform="translate(-6.5, -6.5)">
              <ExternalLinkAltIcon style={{ fontSize: 13 }} alt="Open URL" />
            </g>
          </Decorator>
        </Tooltip>
      ) : (
        <circle ref={trafficAnchor} cx={width} cy={0} r={0} fill="none" />
      )}
      {(data.kind || entity.getLabel()) && (
        <SvgBoxedText
          className="odc-base-node__label"
          x={x + width / 2}
          y={y + height + 20}
          paddingX={8}
          paddingY={4}
          kind={data.kind}
          truncate={16}
        >
          {entity.getLabel()}
        </SvgBoxedText>
      )}
    </g>
  );
};

export default widget(KnativeServiceWidget);
