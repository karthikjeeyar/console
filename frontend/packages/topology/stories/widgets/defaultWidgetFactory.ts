import { ComponentType } from 'react';
import { ElementEntity, WidgetFactory, ModelKind } from '../../src/types';
import GraphWidget from '../../src/widgets/GraphWidget';
import NodeWidget from './NodeWidget';
import EdgeWidget from './EdgeWidget';
import MultiEdgeWidget from './MultiEdgeWidget';
import GroupWidget from './GroupWidget';
import GroupHullWidget from './GroupHullWidget';

const defaultWidgetFactory: WidgetFactory = (
  kind: ModelKind,
  type: string,
): ComponentType<{ entity: ElementEntity }> | undefined => {
  switch (type) {
    case 'multi-edge':
      return MultiEdgeWidget;
    case 'group':
      return GroupWidget;
    case 'group-hull':
      return GroupHullWidget;
    default:
      switch (kind) {
        case ModelKind.graph:
          return GraphWidget;
        case ModelKind.node:
          return NodeWidget;
        case ModelKind.edge:
          return EdgeWidget;
        default:
          return undefined;
      }
  }
};

export default defaultWidgetFactory;
