import * as React from 'react';
import BaseGraphWidget from '@console/topology/src/widgets/GraphWidget';

type GraphWidgetProps = React.ComponentProps<typeof BaseGraphWidget> & {
  dragEditInProgress?: boolean;
};

const DRAG_ACTIVE_CLASS = 'odc2-m-drag-active';

const GraphWidget: React.FC<GraphWidgetProps> = (props) => {
  React.useEffect(() => {
    if (props.dragEditInProgress) {
      document.body.classList.add(DRAG_ACTIVE_CLASS);
    } else {
      document.body.classList.remove(DRAG_ACTIVE_CLASS);
    }
  }, [props.dragEditInProgress]);
  return <BaseGraphWidget {...props} />;
};

export default GraphWidget;
