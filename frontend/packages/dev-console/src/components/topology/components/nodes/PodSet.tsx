import * as React from 'react';
import { get } from 'lodash';
import {
  PodStatus,
  calculateRadius,
  getPodData,
  podRingLabel,
  usePodScalingAccessStatus,
} from '@console/shared';
import { modelFor, referenceFor } from '@console/internal/module/k8s';
import { ChartLabel } from '@patternfly/react-charts';
import { DonutStatusData } from '../../topology-types';
import './PodSet.scss';

interface PodSetProps {
  size: number;
  data: DonutStatusData;
  showPodCount?: boolean;
  x?: number;
  y?: number;
}

interface InnerPodStatusRadius {
  innerPodStatusOuterRadius: number;
  innerPodStatusInnerRadius: number;
}

const calculateInnerPodStatusRadius = (
  outerPodStatusInnerRadius: number,
  outerPodStatusWidth: number,
): InnerPodStatusRadius => {
  const innerPodStatusWidth = outerPodStatusWidth * 0.6;
  const spaceBwOuterAndInnerPodStatus = 3;
  const innerPodStatusOuterRadius = outerPodStatusInnerRadius - spaceBwOuterAndInnerPodStatus;
  const innerPodStatusInnerRadius = innerPodStatusOuterRadius - innerPodStatusWidth;

  return { innerPodStatusOuterRadius, innerPodStatusInnerRadius };
};

const PodSet: React.FC<PodSetProps> = ({ size, data, x = 0, y = 0, showPodCount }) => {
  const { podStatusOuterRadius, podStatusInnerRadius, podStatusStrokeWidth } = calculateRadius(
    size,
  );
  const { innerPodStatusOuterRadius, innerPodStatusInnerRadius } = calculateInnerPodStatusRadius(
    podStatusInnerRadius,
    podStatusStrokeWidth,
  );
  const { inProgressDeploymentData, completedDeploymentData } = getPodData(
    data.dc,
    data.pods,
    data.current,
    data.previous,
    data.isRollingOut,
  );
  const accessAllowed = usePodScalingAccessStatus(
    data.dc,
    modelFor(referenceFor(data.dc)),
    get(data, ['current', 'pods'], []),
    true,
  );
  const obj = get(data, ['current', 'obj'], null) || data.dc;
  const { title, subTitle } = podRingLabel(obj, accessAllowed);
  return (
    <>
      <PodStatus
        key={inProgressDeploymentData ? 'deploy' : 'notDeploy'}
        x={x - size / 2}
        y={y - size / 2}
        innerRadius={podStatusInnerRadius}
        outerRadius={podStatusOuterRadius}
        data={completedDeploymentData}
        size={size}
        subTitle={showPodCount && subTitle}
        {...showPodCount &&
          !accessAllowed && {
            subTitleComponent: <ChartLabel className="odc-pod-status__chart-label" />,
          }}
        title={showPodCount && title}
        {...showPodCount &&
          !obj.status.availableReplicas && {
            titleComponent: <ChartLabel className="odc-pod-status__chart-label" />,
          }}
      />
      {inProgressDeploymentData && (
        <PodStatus
          x={x - size / 2}
          y={y - size / 2}
          innerRadius={innerPodStatusInnerRadius}
          outerRadius={innerPodStatusOuterRadius}
          data={inProgressDeploymentData}
          size={size}
        />
      )}
    </>
  );
};

export default PodSet;
