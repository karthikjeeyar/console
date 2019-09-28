import * as React from 'react';
import Visualization from '../src/Visualization';
import defaultWidgetFactory from '../src/widgets/defaultWidgetFactory';
import VisualizationWidget from '../src/VisualizationWidget';
import { Model, ModelKind } from '../src/types';
import PanZoomHandler, {
  PanZoomEventListener,
  PAN_ZOOM_EVENT,
  PanZoomTransform,
} from '../src/handlers/PanZoomHandler';

export default {
  title: 'Pan Zoom',
};

const model: Model = {
  graph: {
    id: 'g1',
    type: 'graph',
    children: ['gr1'],
  },
  nodes: [
    {
      id: 'gr1',
      type: 'group-hull',
      children: ['n1', 'n2'],
    },
    {
      id: 'n1',
      type: 'node',
      x: 200,
      y: 200,
      width: 50,
      height: 50,
    },
    {
      id: 'n2',
      type: 'node',
      x: 300,
      y: 300,
      width: 100,
      height: 100,
    },
  ],
};

export const uncontrolled: React.FC = () => {
  const vis = new Visualization();
  vis.registerWidgetFactory(defaultWidgetFactory);
  vis.registerInteractionHandlerFactory((entity) => {
    if (entity.kind === ModelKind.graph) {
      return [new PanZoomHandler()];
    }
    return undefined;
  });
  vis.fromModel(model);
  vis.addEventListener<PanZoomEventListener>(PAN_ZOOM_EVENT, (transform) => {
    // logging to action panel is too laggy therefore log to console
    // eslint-disable-next-line no-console
    console.log(`Pan zoom event`, transform);
  });
  return <VisualizationWidget visualization={vis} />;
};

export const controlled: React.FC = () => {
  const vis = new Visualization();
  vis.registerWidgetFactory(defaultWidgetFactory);
  vis.registerInteractionHandlerFactory((entity) => {
    if (entity.kind === ModelKind.graph) {
      return [new PanZoomHandler(true)];
    }
    return undefined;
  });
  vis.fromModel(model);
  const Component = () => {
    const [panZoomTransform, setZoomTransform] = React.useState<PanZoomTransform>();
    React.useEffect(() => {
      vis.addEventListener<PanZoomEventListener>(PAN_ZOOM_EVENT, (transform) => {
        setZoomTransform(transform);
        // logging to action panel is too laggy
        console.log(`Pan zoom event`, transform);
      });
    }, []);
    return <VisualizationWidget visualization={vis} state={{ panZoomTransform }} />;
  };
  return <Component />;
};
