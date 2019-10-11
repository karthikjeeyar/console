import * as React from 'react';
import SvgArrowMarker from '@console/dev-console/src/components/topology/shapes/SvgArrowMarker';
import { createSvgIdUrl } from '@console/dev-console/src/utils/svg-utils';
import Point from '../geom/Point';

import './DefaultCreateConnectorWidget.scss';

const TARGET_ARROW_MARKER_ID = 'DefaultCreateConnectorWidgetArrowMarker';

type DefaultCreateConnectorWidgetProps = {
  startPoint: Point;
  endPoint: Point;
};

const DefaultCreateConnectorWidget: React.FC<DefaultCreateConnectorWidgetProps> = ({
  startPoint,
  endPoint,
}) => (
  <>
    <SvgArrowMarker
      id={TARGET_ARROW_MARKER_ID}
      nodeSize={-5}
      markerSize={12}
      className="topology-default-create-connector-widget__marker"
    />
    <line
      strokeWidth="2px"
      strokeDasharray="5px, 5px"
      stroke="var(--pf-global--active-color--400)"
      x1={startPoint.x}
      y1={startPoint.y}
      x2={endPoint.x}
      y2={endPoint.y}
      markerEnd={createSvgIdUrl(TARGET_ARROW_MARKER_ID)}
    />
  </>
);

export default DefaultCreateConnectorWidget;
