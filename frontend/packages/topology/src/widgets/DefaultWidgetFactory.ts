import { ComponentType } from 'react';
import { ElementEntity, WidgetFactory } from '../types';
import GraphWidget from './GraphWidget';
import NodeWidget from './NodeWidget';
import EdgeWidget from './EdgeWidget';

const defaultWidgetFactory: WidgetFactory = (
  entity: ElementEntity,
): ComponentType<{ entity: ElementEntity }> | undefined => {
  switch (entity.kind) {
    case 'graph':
      return GraphWidget;
    case 'node':
      return NodeWidget;
    case 'edge':
      return EdgeWidget;
    default:
      return undefined;
  }
};

export default defaultWidgetFactory;
