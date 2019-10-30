import { ComponentType } from 'react';
import { ElementEntity, WidgetFactory } from '../../src/types';
import NodeWidget from './NodeWidget';
import NodeRectWidget from './NodeRectWidget';
import NodePathWidget from './NodePathWidget';
import NodePolygonWidget from './NodePolygonWidget';

const shapesWidgetFactory: WidgetFactory = (
  kind,
  type,
): ComponentType<{ entity: ElementEntity }> | undefined => {
  switch (type) {
    case 'node-rect':
      return NodeRectWidget;
    case 'node-ellipse':
      return NodeWidget;
    case 'node-path':
      return NodePathWidget;
    case 'node-polygon':
      return NodePolygonWidget;
    default:
      return undefined;
  }
};

export default shapesWidgetFactory;
