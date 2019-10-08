import * as React from 'react';
import { observer } from 'mobx-react';
import ControllerContext from './utils/ControllerContext';
import Visualization from './Visualization';
import EntityWidget from './widgets/EntityWidget';
import { State } from './types';

interface VisualizationWidgetProps {
  visualization: Visualization;
  state?: State;
}

const VisualizationWidget: React.FC<VisualizationWidgetProps> = ({ visualization, state }) => {
  React.useEffect(() => {
    state && visualization.setState(state);
  }, [visualization, state]);
  return (
    <ControllerContext.Provider value={visualization.getController()}>
      <EntityWidget entity={visualization.getRoot()} />
    </ControllerContext.Provider>
  );
};

export default observer(VisualizationWidget);
