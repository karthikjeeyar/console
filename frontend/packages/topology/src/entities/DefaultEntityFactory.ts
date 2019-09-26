import { GraphEntity, Graph, NodeEntity, EdgeEntity, Node, Edge, EntityFactory } from '../types';
import BaseEdgeEntity from './BaseEdgeEntity';
import BaseGraphEntity from './BaseGraphEntity';
import BaseNodeEntity from './BaseNodeEntity';

export default class DefaultEntityFactory implements EntityFactory {
  createGraphEntity<E extends Graph>(type: string): GraphEntity<E> | undefined {
    return type === 'graph' ? new BaseGraphEntity() : undefined;
  }

  createNodeEntity<E extends Node>(type: string): NodeEntity<E> | undefined {
    return type === 'node' ? new BaseNodeEntity() : undefined;
  }

  createEdgeEntity<E extends Edge>(type: string): EdgeEntity<E> | undefined {
    return type === 'edge' ? new BaseEdgeEntity() : undefined;
  }
}
