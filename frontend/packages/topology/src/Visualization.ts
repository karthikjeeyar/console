import { ComponentType } from 'react';
import { action, observable } from 'mobx';
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
  EventListener,
  ModelKind,
  LayoutFactory,
  Layout,
  isGraphEntity,
} from './types';
import defaultEntityFactory from './entities/defaultEntityFactory';
import Stateful from './utils/Stateful';

export default class Visualization extends Stateful implements Controller {
  @observable.shallow
  entities: { [id: string]: ElementEntity } = {};

  @observable.ref
  private graph: GraphEntity | undefined;

  private layoutFactories: LayoutFactory[] = [];

  private widgetFactories: WidgetFactory[] = [];

  private entityFactories: EntityFactory[] = [defaultEntityFactory];

  private eventListeners: { [type: string]: EventListener[] } = {};

  @observable.shallow
  private readonly store = {};

  getStore<S = {}>(): S {
    return this.store as S;
  }

  @action
  fromModel(model: Model): void {
    // create entities
    if (model.graph) {
      this.graph = this.createEntity<GraphEntity>(ModelKind.graph, model.graph);
    }
    const validIds: string[] = [];

    model.nodes &&
      model.nodes.forEach((n) => {
        this.createEntity<NodeEntity>(ModelKind.node, n);
        validIds.push(n.id);
      });

    model.edges &&
      model.edges.forEach((n) => {
        this.createEntity<EdgeEntity>(ModelKind.edge, n);
        validIds.push(n.id);
      });

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
      if (!isGraphEntity(entity) && !validIds.includes(entity.getId())) {
        entity.remove();
        this.removeEntity(entity);
      }
    });

    if (this.graph) {
      this.parentOrphansToGraph(this.graph);
    }
  }

  getGraph(): GraphEntity {
    if (!this.graph) {
      throw new Error('Graph has not been set.');
    }
    return this.graph;
  }

  @action
  setGraph(graph: GraphEntity) {
    if (this.graph !== graph) {
      if (this.graph) {
        this.graph.setController(undefined);
      }
      this.graph = graph;
      graph.setController(this);
      // TODO clean up and populate registries
    }
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

  getEntityById(id: string): ElementEntity | undefined {
    return this.entities[id];
  }

  getNodeById(id: string): NodeEntity | undefined {
    const node = this.entities[id];
    if (node && isNodeEntity(node)) {
      return node;
    }
    return undefined;
  }

  getEdgeById(id: string): EdgeEntity | undefined {
    const edge = this.entities[id];
    if (edge && isEdgeEntity(edge)) {
      return edge;
    }
    return undefined;
  }

  getWidget(kind: ModelKind, type: string): ComponentType<{ entity: ElementEntity }> {
    for (const factory of this.widgetFactories) {
      const widget = factory(kind, type);
      if (widget) {
        return widget;
      }
    }
    throw new Error(`Could not find widget for: Kind '${kind}', Type '${type}'`);
  }

  registerLayoutFactory(factory: LayoutFactory) {
    this.layoutFactories.unshift(factory);
  }

  getLayout(type: string): Layout | undefined {
    for (const factory of this.layoutFactories) {
      const layout = factory(type, this.getGraph());
      if (layout) {
        return layout;
      }
    }
    throw new Error(`Could not find layout for type: ${type}`);
  }

  registerWidgetFactory(factory: WidgetFactory) {
    this.widgetFactories.unshift(factory);
  }

  registerEntityFactory(factory: EntityFactory): void {
    this.entityFactories.unshift(factory);
  }

  addEventListener<L extends EventListener = EventListener>(type: string, listener: L): Controller {
    if (!this.eventListeners[type]) {
      this.eventListeners[type] = [listener];
    } else {
      this.eventListeners[type].push(listener);
    }
    return this;
  }

  removeEventListener(type: string, listener: EventListener): Controller {
    if (!this.eventListeners[type]) {
      return this;
    }
    const listeners = this.eventListeners[type];
    const l: EventListener[] = [];
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
    return this;
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
    const existingEntity = this.entities[element.id];
    if (existingEntity) {
      return existingEntity as E;
    }
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
  }

  private parentOrphansToGraph(graph: GraphEntity): void {
    this.getEntities().forEach((entity: ElementEntity) => {
      if (entity !== this.graph && !entity.hasParent()) {
        graph.appendChild(entity);
      }
    });
  }
}
