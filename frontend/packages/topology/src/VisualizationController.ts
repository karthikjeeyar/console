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
  Graph,
  Node,
  Edge,
  Element,
  isEdgeEntity,
  isNodeEntity,
  Model,
  State,
  InteractionHandlerFactory,
} from './types';
import DefaultEntityFactory from './entities/DefaultEntityFactory';

export default class VisualizationController implements Controller {
  @observable.shallow
  entities: { [id: string]: ElementEntity } = {};

  @observable.ref
  private graph: GraphEntity | undefined;

  private widgetFactories: WidgetFactory[] = [];

  private entityFactories: EntityFactory[] = [new DefaultEntityFactory()];

  private interactionHandlerFactories: InteractionHandlerFactory[] = [];

  @observable.shallow
  private state = {};

  getState<S = any>(): S {
    return this.state as S;
  }

  setState(state: State): void {
    if (state) {
      _.assign(this.state, state);
    }
  }

  fromModel(model: Model): void {
    // create entities
    if (model.graph) {
      this.graph = this.createGraphEntity(model.graph);
    }
    model.nodes && model.nodes.forEach((n) => this.createNodeEntity(n));
    model.edges && model.edges.forEach((e) => this.createEdgeEntity(e));

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
      const widget = factory.getWidget(entity);
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

  private createGraphEntity(element: Graph): GraphEntity {
    for (const factory of this.entityFactories) {
      const entity = factory.createGraphEntity(element.type);
      if (entity) {
        this.initEntity(entity, element);
        return entity;
      }
    }
    throw new Error(`Could not graph entity for: ${JSON.stringify(element)}`);
  }

  private createNodeEntity(element: Node): NodeEntity {
    for (const factory of this.entityFactories.reverse()) {
      const entity = factory.createNodeEntity(element.type);
      if (entity) {
        this.initEntity(entity, element);
        return entity;
      }
    }
    throw new Error(`Could not node entity for: ${JSON.stringify(element)}`);
  }

  private createEdgeEntity(element: Edge): EdgeEntity {
    for (const factory of this.entityFactories.reverse()) {
      const entity = factory.createEdgeEntity(element.type);
      if (entity) {
        this.initEntity(entity, element);
        return entity;
      }
    }
    throw new Error(`Could not graph entity for: ${JSON.stringify(element)}`);
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
      const handlers = f.getInteractionHandlers(entity);
      if (handlers) {
        handlers.forEach((h) => entity.installInteractionHandler(h));
      }
    });
  }
}
