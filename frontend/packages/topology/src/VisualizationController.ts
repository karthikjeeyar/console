import { ComponentType } from 'react';
import { observable } from 'mobx';
import * as _ from 'lodash';
import {
  Controller,
  GraphEntity,
  EdgeEntity,
  NodeEntity,
  WidgetFactory,
  ElementEntity,
  EntityFactory,
  Element,
  isEdgeEntity,
  isNodeEntity,
  Model,
  InteractionHandlerFactory,
  EventListener,
  ModelKind,
} from './types';
import defaultEntityFactory from './entities/defaultEntityFactory';
import Stateful from './utils/Stateful';

export default class VisualizationController extends Stateful implements Controller {
  @observable.shallow
  entities: { [id: string]: ElementEntity } = {};

  @observable.ref
  private graph: GraphEntity | undefined;

  private widgetFactories: WidgetFactory[] = [];

  private entityFactories: EntityFactory[] = [defaultEntityFactory];

  private interactionHandlerFactories: InteractionHandlerFactory[] = [];

  private eventListeners: { [type: string]: EventListener[] } = {};

  private readonly store = {};

  getStore<S = {}>(): S {
    return this.store as S;
  }

  fromModel(model: Model): void {
    // create entities
    if (model.graph) {
      this.graph = this.createEntity<GraphEntity>(ModelKind.graph, model.graph);
    }
    model.nodes && model.nodes.forEach((n) => this.createEntity<NodeEntity>(ModelKind.node, n));
    model.edges && model.edges.forEach((e) => this.createEntity<EdgeEntity>(ModelKind.edge, e));

    // merge data
    if (model.graph && this.graph) {
      this.graph.setModel(model.graph);
    }
    if (model.nodes) {
      model.nodes.forEach((n) => this.entities[n.id].setModel(n));
    }
    if (model.edges) {
      model.edges.forEach((e) => this.entities[e.id].setModel(e));
    }

    // remove all stale entities
    _.forIn(this.entities, (entity) => {
      if (entity.isDetached()) {
        this.removeEntity(entity);
      }
    });

    // TODO where to activate the graph?
    if (this.graph) {
      this.graph.activate();
    }
  }

  getGraph(): GraphEntity {
    if (!this.graph) {
      throw new Error('Graph has not been set.');
    }
    return this.graph;
  }

  setGraph(graph: GraphEntity) {
    if (this.graph) {
      this.graph.setController(undefined);
    }
    this.graph = graph;
    graph.setController(this);
  }

  getEntities(): ElementEntity[] {
    // TODO make efficient
    return _.values(this.entities);
  }

  addEntity(entity: ElementEntity): void {
    if (this.entities[entity.getId()]) {
      throw new Error(`Duplicate entity for ID '${entity.getId()}`);
    }
    entity.setController(this);
    this.entities[entity.getId()] = entity;
  }

  removeEntity(entity: ElementEntity): void {
    delete this.entities[entity.getId()];
  }

  getEntityById(id: string): ElementEntity {
    return this.entities[id];
  }

  getNodeById(id: string): NodeEntity {
    const node = this.entities[id];
    if (node && !isNodeEntity(node)) {
      throw new Error(`No node found with ID '${id}'.`);
    }
    return node;
  }

  getEdgeById(id: string): EdgeEntity {
    const edge = this.entities[id];
    if (edge && !isEdgeEntity(edge)) {
      throw new Error(`No edge found with ID '${id}'.`);
    }
    return edge;
  }

  getWidget(entity: ElementEntity): ComponentType<{ entity: ElementEntity }> {
    for (const factory of this.widgetFactories) {
      const widget = factory(entity);
      if (widget) {
        return widget;
      }
    }
    throw new Error(`Could not find widget for ${entity.kind}): ${entity.getId()}`);
  }

  registerWidgetFactory(factory: WidgetFactory) {
    this.widgetFactories.push(factory);
  }

  registerEntityFactory(factory: EntityFactory): void {
    this.entityFactories.push(factory);
  }

  registerInteractionHandlerFactory(factory: InteractionHandlerFactory): void {
    this.interactionHandlerFactories.push(factory);
  }

  addEventListener<L extends EventListener = EventListener>(type: string, listener: L): void {
    if (!this.eventListeners[type]) {
      this.eventListeners[type] = [listener];
    } else {
      this.eventListeners[type].push(listener);
    }
  }

  removeEventListener(type: string, listener: EventListener): void {
    if (!this.eventListeners[type]) {
      return;
    }
    const listeners = this.eventListeners[type];
    const l = [];
    for (let i = 0, { length } = listeners; i < length; i++) {
      if (listeners[i] !== listener) {
        l.push(listeners[i]);
      }
    }
    if (l.length) {
      this.eventListeners[type] = l;
    } else {
      delete this.eventListeners[type];
    }
  }

  fireEvent(type: string, ...args: any): void {
    const listeners = this.eventListeners[type];
    if (listeners) {
      for (let i = 0, { length } = listeners; i < length; i++) {
        listeners[i](...args);
      }
    }
  }

  private createEntity<E extends ElementEntity>(kind: ModelKind, element: Element): E {
    for (const factory of this.entityFactories) {
      const entity = factory(kind, element.type);
      if (entity) {
        this.initEntity(entity, element);
        // cast to return type
        return entity as E;
      }
    }
    throw new Error(`Could not create entity for: ${JSON.stringify(element)}`);
  }

  private initEntity(entity: ElementEntity, model: Element): void {
    // set require fields
    entity.setId(model.id);
    entity.setType(model.type);
    entity.setController(this);
    this.addEntity(entity);
    this.installInteractionHandlers(entity);
  }

  private installInteractionHandlers(entity: ElementEntity): void {
    this.interactionHandlerFactories.forEach((f) => {
      const handlers = f(entity);
      if (handlers) {
        handlers.forEach((h) => entity.installInteractionHandler(h));
      }
    });
  }
}
