import * as React from 'react';
import { action } from '@storybook/addon-actions';
import Visualization from '../src/Visualization';
import defaultWidgetFactory from '../src/widgets/defaultWidgetFactory';
import VisualizationWidget from '../src/VisualizationWidget';
import { Model } from '../src/types';
import SelectionHandler, {
  SELECTION_EVENT,
  SelectionEventListener,
} from '../src/handlers/SelectionHandler';

export default {
  title: 'Selection',
};

const model: Model = {
  graph: {
    id: 'g1',
    type: 'graph',
    children: ['n1', 'n2'],
  },
  nodes: [
    {
      id: 'n1',
      type: 'node',
      position: [10, 10],
      dimensions: [20, 20],
    },
    {
      id: 'n2',
      type: 'node',
      position: [100, 10],
      dimensions: [20, 20],
    },
  ],
};

export const uncontrolled: React.FC = () => {
  const vis = new Visualization();
  vis.registerWidgetFactory(defaultWidgetFactory);
  vis.registerInteractionHandlerFactory((entity) => {
    if (entity.kind === 'node') {
      return [new SelectionHandler()];
    }
    return undefined;
  });
  vis.fromModel(model);
  vis.addEventListener<SelectionEventListener>(SELECTION_EVENT, (id) => {
    action(`Selection event`)(id);
  });
  return <VisualizationWidget visualization={vis} />;
};

export const controlled = () => {
  const vis = new Visualization();
  vis.registerWidgetFactory(defaultWidgetFactory);
  vis.registerInteractionHandlerFactory((entity) => {
    if (entity.kind === 'node') {
      return [new SelectionHandler(true)];
    }
    return undefined;
  });
  vis.fromModel(model);
  const Component = () => {
    const [selectedId, setSelectedId] = React.useState<string>();
    React.useEffect(() => {
      vis.addEventListener<SelectionEventListener>(SELECTION_EVENT, (id) => {
        action(`Selection event`)(id);
        setSelectedId(id);
      });
    }, []);
    return <VisualizationWidget visualization={vis} state={{ selectedId }} />;
  };
  return <Component />;
};
