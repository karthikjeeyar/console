import { ComponentType } from 'react';
import { ElementEntity } from '../types';
import GraphWidget from './GraphWidget';
import NodeWidget from './NodeWidget';
import EdgeWidget from './EdgeWidget';

export default class DefaultWidgetFactory {
  getWidget(entity: ElementEntity): ComponentType<{ entity: ElementEntity }> | undefined {
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
  }
}
