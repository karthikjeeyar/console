import * as React from 'react';
import * as classNames from 'classnames';
import { NodeEntity } from '@console/topology/src/types';
import { WithCreateConnectorProps } from '@console/topology/src/behavior/withCreateConnector';
import { WithDragNodeProps } from '@console/topology/src/behavior/useDragNode';
import { WithSelectionProps } from '@console/topology/src/behavior/useSelection';
import { useAnchor } from '@console/topology/src/behavior/useAnchor';
import EllipseAnchor from '@console/topology/src/anchors/EllipseAnchor';
import { WithDndDropProps } from '@console/topology/src/behavior/useDndDrop';
import { WithContextMenuProps } from '@console/topology/src/behavior/withContextMenu';
import useCombineRefs from '@console/topology/src/utils/useCombineRefs';
import useHover from '@console/topology/src/utils/useHover';
import SvgBoxedText from '../../svg/SvgBoxedText';
import NodeShadows, { NODE_SHADOW_FILTER_HOVER_URL, NODE_SHADOW_FILTER_URL } from './NodeShadows';

import './BaseNodeWidget.scss';

export type BaseNodeProps = {
  outerRadius: number;
  innerRadius?: number;
  icon?: string;
  kind?: string;
  children?: React.ReactNode;
  attachments?: React.ReactNode;
  entity: NodeEntity;
  droppable?: boolean;
  dragging?: boolean;
  highlight?: boolean;
  canDrop?: boolean;
} & WithSelectionProps &
  WithDragNodeProps &
  WithDndDropProps &
  WithContextMenuProps &
  WithCreateConnectorProps;

const BaseNodeWidget: React.FC<BaseNodeProps> = ({
  outerRadius,
  innerRadius,
  icon,
  kind,
  entity,
  selected,
  onSelect,
  children,
  attachments,
  dragNodeRef,
  dndDropRef,
  canDrop,
  dragging,
  highlight,
  onHideCreateConnector,
  onShowCreateConnector,
  onContextMenu,
}) => {
  const [hover, hoverRef] = useHover();
  useAnchor(EllipseAnchor);
  const cx = entity.getBounds().width / 2;
  const cy = entity.getBounds().height / 2;

  const contentsClasses = classNames('odc-base-node__contents', {
    'is-highlight': canDrop || highlight,
    'is-dragging': dragging,
  });
  const refs = useCombineRefs<SVGEllipseElement>(hoverRef, dragNodeRef);

  React.useLayoutEffect(() => {
    if (hover) {
      onShowCreateConnector();
    } else {
      onHideCreateConnector();
    }
  }, [hover, onShowCreateConnector, onHideCreateConnector]);

  return (
    <g className="odc-base-node">
      <NodeShadows />
      <g
        data-test-id="base-node-handler"
        onClick={onSelect}
        onContextMenu={onContextMenu}
        ref={refs}
      >
        <circle
          className={classNames('odc-base-node__bg', { 'is-highlight': canDrop })}
          ref={dndDropRef}
          cx={cx}
          cy={cy}
          r={outerRadius}
          filter={hover || dragging ? NODE_SHADOW_FILTER_HOVER_URL : NODE_SHADOW_FILTER_URL}
        />
        <g className={contentsClasses}>
          <image
            x={cx - innerRadius}
            y={cy - innerRadius}
            width={innerRadius * 2}
            height={innerRadius * 2}
            xlinkHref={icon}
          />
          {(kind || entity.getLabel()) && (
            <SvgBoxedText
              className="odc-base-node__label"
              x={cx}
              y={cy + outerRadius + 20}
              paddingX={8}
              paddingY={4}
              kind={kind}
              truncate={16}
            >
              {entity.getLabel()}
            </SvgBoxedText>
          )}
          {selected && (
            <circle className="odc-base-node__selection" cx={cx} cy={cy} r={outerRadius + 1} />
          )}
          {children}
        </g>
      </g>
      <g className={contentsClasses}>{attachments}</g>
    </g>
  );
};

export default BaseNodeWidget;
