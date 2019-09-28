import * as React from 'react';
import { action } from '@storybook/addon-actions';
import Visualization from '../src/Visualization';
import defaultWidgetFactory from '../src/widgets/defaultWidgetFactory';
import VisualizationWidget from '../src/VisualizationWidget';
import { Model, ModelKind, Node } from '../src/types';
import SelectionHandler, {
  SELECTION_EVENT,
  SelectionEventListener,
} from '../src/handlers/SelectionHandler';

export default {
  title: 'Selection',
};

const create2NodeModel = (): Model => ({
  graph: {
    id: 'g1',
    type: 'graph',
    children: ['gr1'],
  },
  nodes: [
    {
      id: 'gr1',
      type: 'group',
      children: ['n1', 'n2'],
    },
    {
      id: 'n1',
      type: 'node',
      x: 30,
      y: 30,
      width: 20,
      height: 20,
    },
    {
      id: 'n2',
      type: 'node',
      x: 100,
      y: 30,
      width: 20,
      height: 20,
    },
  ],
});

export const uncontrolled: React.FC = () => {
  const vis = new Visualization();
  vis.registerWidgetFactory(defaultWidgetFactory);
  vis.registerInteractionHandlerFactory((entity) => {
    if (entity.kind === 'node') {
      return [new SelectionHandler()];
    }
    return undefined;
  });
  vis.fromModel(create2NodeModel());
  vis.addEventListener<SelectionEventListener>(SELECTION_EVENT, (id) => {
    action(`Selection event`)(id);
  });
  return <VisualizationWidget visualization={vis} />;
};

export const controlled = () => {
  const vis = new Visualization();
  vis.registerWidgetFactory(defaultWidgetFactory);
  vis.registerInteractionHandlerFactory((entity) => {
    if (entity.kind === ModelKind.node) {
      return [new SelectionHandler(true)];
    }
    return undefined;
  });
  vis.fromModel(create2NodeModel());
  const Component = () => {
    const [selectedIds, setSelectedIds] = React.useState<string[]>();
    React.useEffect(() => {
      vis.addEventListener<SelectionEventListener>(SELECTION_EVENT, (ids) => {
        action(`Selection event`)(ids);
        setSelectedIds(ids);
      });
    }, []);
    return <VisualizationWidget visualization={vis} state={{ selectedIds }} />;
  };
  return <Component />;
};

export const multiSelect: React.FC = () => {
  const vis = new Visualization();
  vis.registerWidgetFactory(defaultWidgetFactory);
  vis.registerInteractionHandlerFactory((entity) => {
    if (entity.kind === 'node') {
      return [new SelectionHandler(false, true)];
    }
    return undefined;
  });
  vis.fromModel(create2NodeModel());
  vis.addEventListener<SelectionEventListener>(SELECTION_EVENT, (id) => {
    action(`Selection event`)(id);
  });
  return <VisualizationWidget visualization={vis} />;
};

export const performance = () => {
  const vis = new Visualization();
  vis.registerWidgetFactory(defaultWidgetFactory);
  vis.registerInteractionHandlerFactory((entity) => {
    if (entity.kind === ModelKind.node) {
      return [new SelectionHandler()];
    }
    return undefined;
  });
  const model: Model = {
    graph: {
      id: 'g1',
      type: 'graph',
      children: [],
    },
    nodes: [],
  };
  for (let i = 1; i <= 100; i++) {
    for (let j = 1; j <= 100; j++) {
      const node: Node = {
        id: `${i}-${j}`,
        type: 'node',
        x: j * 20,
        y: i * 20,
        width: 10,
        height: 10,
      };
      model.graph && model.graph.children && model.graph.children.push(node.id);
      model.nodes && model.nodes.push(node);
    }
  }
  vis.fromModel(model);
  return <VisualizationWidget visualization={vis} />;
};
