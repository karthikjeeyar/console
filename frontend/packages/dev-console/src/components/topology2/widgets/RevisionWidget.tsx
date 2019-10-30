import * as React from 'react';
import { useAnchor } from '@console/topology/src/behavior/useAnchor';
import { AnchorEnd, Anchor } from '@console/topology/src/types';
import SVGAnchor from '@console/topology/src/anchors/SVGAnchor';
import EllipseAnchor from '@console/topology/src/anchors/EllipseAnchor';
import widget from '@console/topology/src/widget';
import WorkloadNodeWidget from './WorkloadNodeWidget';

const RevisionWidget: React.FC<React.ComponentProps<typeof WorkloadNodeWidget>> = (props) => {
  const [trafficAnchor, setTrafficAnchor] = React.useState<Anchor>(new EllipseAnchor(props.entity));
  const urlAnchorRefCallback = React.useCallback(
    (node): void => {
      if (node) {
        const anchor = new SVGAnchor(props.entity);
        anchor.setSVGElement(node);
        setTrafficAnchor(anchor);
      } else {
        setTrafficAnchor(new EllipseAnchor(props.entity));
      }
    },
    [props.entity],
  );
  useAnchor(
    React.useCallback(() => trafficAnchor, [trafficAnchor]),
    AnchorEnd.target,
    'revision-traffic',
  );
  return <WorkloadNodeWidget {...props} urlAnchorRef={urlAnchorRefCallback} />;
};

export default widget(RevisionWidget);
