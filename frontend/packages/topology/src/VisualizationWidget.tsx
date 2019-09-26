import * as React from 'react';
import Visualization from './Visualization';
import EntityWidget from './widgets/EntityWidget';

interface VisualizationWidgetProps {
  visualization: Visualization;
}

// eslint-disable-next-line react/prefer-stateless-function
export default class VisualizationWidget extends React.Component<VisualizationWidgetProps> {
  render() {
    const { visualization } = this.props;
    return <EntityWidget entity={visualization.getRoot()} />;
  }
}
