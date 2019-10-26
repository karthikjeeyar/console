import * as React from 'react';
import { Status, calculateRadius } from '@console/shared';
import { NodeEntity } from '@console/topology/src/types';
import widget from '@console/topology/src/widget';
import { WithCreateConnectorProps } from '@console/topology/src/behavior/withCreateConnector';
import { WithDragNodeProps } from '@console/topology/src/behavior/useDragNode';
import { WithSelectionProps } from '@console/topology/src/behavior/useSelection';
import { WithDndDragProps } from '@console/topology/src/behavior/useDndDrag';
import { WithDndDropProps } from '@console/topology/src/behavior/useDndDrop';
import { WithContextMenuProps } from '@console/topology/src/behavior/withContextMenu';
import '../../topology/shapes/BaseNode.scss';
import { Tooltip, TooltipPosition } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import { Link } from 'react-router-dom';
import { resourcePathFromModel } from '@console/internal/components/utils';
import { BuildModel } from '@console/internal/models';
import Decorator from '../../topology/shapes/Decorator';
import { routeDecoratorIcon } from '../../import/render-utils';
import PodSet from '../../topology/shapes/PodSet';
import KnativeIcon from '../../topology/shapes/KnativeIcon';
import BaseNodeWidget from './BaseNodeWidget';

export type WorkloadNodeWidgetProps = {
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

const WorkloadNodeWidget: React.FC<WorkloadNodeWidgetProps> = ({
  icon,
  kind,
  entity,
  children,
  attachments,
  ...rest
}) => {
  const { width, height } = entity.getBounds();
  const workloadData = entity.getData().data;
  const size = Math.min(width, height);
  const { build, donutStatus } = workloadData;
  const { radius, decoratorRadius } = calculateRadius(size);
  const repoIcon = routeDecoratorIcon(workloadData.editUrl, decoratorRadius);
  const cx = width / 2;
  const cy = height / 2;

  return (
    <g>
      <BaseNodeWidget
        outerRadius={radius}
        innerRadius={donutStatus && donutStatus.isRollingOut ? radius * 0.45 : radius * 0.55}
        icon={workloadData.builderImage}
        kind={workloadData.kind}
        entity={entity}
        {...rest}
        attachments={[
          repoIcon && (
            <Tooltip key="edit" content="Edit Source Code" position={TooltipPosition.right}>
              <Decorator
                x={cx + radius - decoratorRadius * 0.7}
                y={cy + radius - decoratorRadius * 0.7}
                radius={decoratorRadius}
                href={workloadData.editUrl}
                external
              >
                <g transform={`translate(-${decoratorRadius / 2}, -${decoratorRadius / 2})`}>
                  {repoIcon}
                </g>
              </Decorator>
            </Tooltip>
          ),
          workloadData.url && (
            <Tooltip key="route" content="Open URL" position={TooltipPosition.right}>
              <Decorator
                x={cx + radius - decoratorRadius * 0.7}
                y={cy + -radius + decoratorRadius * 0.7}
                radius={decoratorRadius}
                href={workloadData.url}
                external
              >
                <g transform={`translate(-${decoratorRadius / 2}, -${decoratorRadius / 2})`}>
                  <ExternalLinkAltIcon style={{ fontSize: decoratorRadius }} alt="Open URL" />
                </g>
              </Decorator>
            </Tooltip>
          ),
          build && (
            <Tooltip
              key="build"
              content={`${build.metadata.name} ${build.status && build.status.phase}`}
              position={TooltipPosition.left}
            >
              <Link
                to={`${resourcePathFromModel(
                  BuildModel,
                  build.metadata.name,
                  build.metadata.namespace,
                )}/logs`}
                className="odc-decorator__link"
              >
                <Decorator
                  x={cx - radius + decoratorRadius * 0.7}
                  y={cy + radius - decoratorRadius * 0.7}
                  radius={decoratorRadius}
                >
                  <g transform={`translate(-${decoratorRadius / 2}, -${decoratorRadius / 2})`}>
                    <foreignObject
                      width={decoratorRadius}
                      height={decoratorRadius}
                      style={{ fontSize: decoratorRadius }}
                    >
                      <Status status={build.status.phase} iconOnly noTooltip />
                    </foreignObject>
                  </g>
                </Decorator>
              </Link>
            </Tooltip>
          ),
        ]}
      >
        <PodSet size={size} x={cx} y={cy} data={workloadData.donutStatus} />
        {workloadData.isKnativeResource && (
          <KnativeIcon
            x={cx - radius * 0.15}
            y={cy - radius * 0.65}
            width={radius * 0.39}
            height={radius * 0.31}
          />
        )}
      </BaseNodeWidget>
    </g>
  );
};

export default widget(WorkloadNodeWidget);
