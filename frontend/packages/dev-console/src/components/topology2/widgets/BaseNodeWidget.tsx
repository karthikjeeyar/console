import * as React from 'react';
import * as classNames from 'classnames';
import { NodeEntity } from '@console/topology/src/types';
import { WithCreateConnectorProps } from '@console/topology/src/behavior/withCreateConnector';
import { WithDragNodeProps } from '@console/topology/src/behavior/useDragNode';
import { WithSelectionProps } from '@console/topology/src/behavior/useSelection';
import { useSvgAnchor } from '@console/topology/src/behavior/useSvgAnchor';
import { WithDndDragProps } from '@console/topology/src/behavior/useDndDrag';
import { WithDndDropProps } from '@console/topology/src/behavior/useDndDrop';
import { WithContextMenuProps } from '@console/topology/src/behavior/withContextMenu';
import useCombineRefs from '@console/topology/src/utils/useCombineRefs';
import SvgBoxedText from '../../svg/SvgBoxedText';
import { createSvgIdUrl } from '../../../utils/svg-utils';
import SvgDropShadowFilter from '../../svg/SvgDropShadowFilter';
import '../../topology/shapes/BaseNode.scss';

export interface State {
  hover?: boolean;
  labelHover?: boolean;
}

export type BaseNodeProps = {
  outerRadius: number;
  innerRadius?: number;
  icon?: string;
  kind?: string;
  children?: React.ReactNode;
  attachments?: React.ReactNode;
  entity: NodeEntity;
  droppable?: boolean;
  hover?: boolean;
  canDrop?: boolean;
} & WithSelectionProps &
  WithDragNodeProps &
  WithDndDragProps &
  WithDndDropProps &
  WithContextMenuProps &
  WithCreateConnectorProps;

const FILTER_ID = 'BaseNodeDropShadowFilterId';
const FILTER_ID_HOVER = 'BaseNodeDropShadowFilterId--hover';

const MAX_LABEL_LENGTH = 16;

const truncateEnd = (text: string = ''): string => {
  if (text.length <= MAX_LABEL_LENGTH) {
    return text;
  }
  return `${text.substr(0, MAX_LABEL_LENGTH - 1)}…`;
};

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
  dndDragRef,
  dndDropRef,
  canDrop,
  onHideCreateConnector,
  onShowCreateConnector,
  onContextMenu,
}) => {
  const [hover, setHover] = React.useState();
  const [hoverTimer, setHoverTimer] = React.useState();
  const [labelHover, setLabelHover] = React.useState(false);
  const svgAnchorRef = useSvgAnchor();
  const cx = entity.getBounds().width / 2;
  const cy = entity.getBounds().height / 2;

  const onLabelEnter = () => {
    if (!hoverTimer) {
      setHoverTimer(
        setTimeout(() => {
          setLabelHover(true);
        }, 200),
      );
    }
  };

  const onLabelLeave = () => {
    setLabelHover(false);

    if (hoverTimer) {
      clearTimeout(hoverTimer);
      setHoverTimer(null);
    }
  };

  const contentsClasses = classNames('odc-base-node__contents');
  const nodeRefs = useCombineRefs<SVGCircleElement>(
    svgAnchorRef,
    dndDropRef,
    dragNodeRef,
    dndDragRef,
  );

  const onHoverChange = (hoverStatus: boolean) => {
    setHover(hoverStatus);
    if (hoverStatus) {
      onShowCreateConnector();
    } else {
      onHideCreateConnector();
    }
  };

  return (
    <g className="odc-base-node">
      <g
        data-test-id="base-node-handler"
        onClick={onSelect}
        onMouseEnter={() => onHoverChange(true)}
        onMouseLeave={() => onHoverChange(false)}
        onContextMenu={onContextMenu}
      >
        <SvgDropShadowFilter id={FILTER_ID} />
        <SvgDropShadowFilter id={FILTER_ID_HOVER} dy={3} stdDeviation={7} floodOpacity={0.24} />
        <circle
          className={classNames('odc-base-node__bg', { 'is-highlight': canDrop })}
          cx={cx}
          cy={cy}
          r={outerRadius}
          filter={hover ? createSvgIdUrl(FILTER_ID_HOVER) : createSvgIdUrl(FILTER_ID)}
        />
        <g className={contentsClasses}>
          <image
            x={cx - innerRadius}
            y={cy - innerRadius}
            width={innerRadius * 2}
            height={innerRadius * 2}
            xlinkHref={icon}
          />
          {entity.getLabel() != null && (
            <SvgBoxedText
              className="odc-base-node__label"
              x={cx}
              y={cy + outerRadius + 20}
              paddingX={8}
              paddingY={4}
              kind={kind}
              onMouseEnter={onLabelEnter}
              onMouseLeave={onLabelLeave}
            >
              {labelHover ? entity.getLabel() : truncateEnd(entity.getLabel())}
            </SvgBoxedText>
          )}
          {selected && (
            <circle
              className="odc-base-node__selection"
              cx={cx}
              cy={cy}
              r={outerRadius + 1}
              strokeWidth={2}
            />
          )}
          {children}
        </g>
      </g>
      <circle ref={nodeRefs} cx={cx} cy={cy} r={outerRadius} fillOpacity={0} />
      <g className={contentsClasses}>{attachments}</g>
    </g>
  );
};

export default BaseNodeWidget;
