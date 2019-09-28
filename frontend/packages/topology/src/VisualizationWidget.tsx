import * as React from 'react';
import { observer } from 'mobx-react';
import Visualization from './Visualization';
import EntityWidget from './widgets/EntityWidget';
import { State } from './types';

interface VisualizationWidgetProps {
  visualization: Visualization;
  state?: State;
}

// eslint-disable-next-line react/prefer-stateless-function
@observer
export default class VisualizationWidget extends React.Component<VisualizationWidgetProps> {
  constructor(props: VisualizationWidgetProps) {
    super(props);
    props.state && props.visualization.setState(props.state);
  }

  componentDidUpdate() {
    setTimeout(() => {
      this.props.state && this.props.visualization.setState(this.props.state);
    }, 0);
  }

  render() {
    const { visualization } = this.props;
    return <EntityWidget entity={visualization.getRoot()} />;
  }
}
