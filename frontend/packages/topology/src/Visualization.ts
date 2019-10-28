import { action } from 'mobx';
import {
  Controller,
  Model,
  GraphEntity,
  WidgetFactory,
  EntityFactory,
  State,
  EventListener,
  ElementEntity,
  LayoutFactory,
} from './types';
import VisualizationController from './VisualizationController';

export default class Visualization {
  private controller: Controller;

  constructor(controller?: Controller) {
    if (controller) {
      this.controller = controller;
    } else {
      this.controller = new VisualizationController();
    }
  }

  getController(): Controller {
    return this.controller;
  }

  @action
  fromModel(model: Model): void {
    this.controller.fromModel(model);
  }

  getGraph(): GraphEntity {
    return this.controller.getGraph();
  }

  getEntities(): ElementEntity[] {
    return this.controller.getEntities();
  }

  registerLayoutFactory(factory: LayoutFactory) {
    this.controller.registerLayoutFactory(factory);
  }

  registerWidgetFactory(factory: WidgetFactory) {
    this.controller.registerWidgetFactory(factory);
  }

  registerEntityFactory(factory: EntityFactory): void {
    this.controller.registerEntityFactory(factory);
  }

  addEventListener<L extends EventListener = EventListener>(type: string, listener: L): void {
    this.controller.addEventListener(type, listener);
  }

  removeEventListener(type: string, listener: EventListener): void {
    this.controller.removeEventListener(type, listener);
  }

  @action
  setState(state: State): void {
    this.controller.setState(state);
  }
}
