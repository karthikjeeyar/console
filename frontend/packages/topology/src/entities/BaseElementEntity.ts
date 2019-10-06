import { observable } from 'mobx';
import * as _ from 'lodash';
import {
  Element,
  GraphEntity,
  ElementEntity,
  isGraphEntity,
  Controller,
  InteractionHandler,
  ModelKind,
  isNodeEntity,
} from '../types';
import Stateful from '../utils/Stateful';

export default abstract class BaseElementEntity<E extends Element = Element, D = any>
  extends Stateful
  implements ElementEntity<E, D> {
  private id: string;

  private type: string;

  @observable
  private data: D | undefined;

  @observable.ref
  private parent: ElementEntity;

  @observable
  private visible: boolean = true;

  @observable.shallow
  private children: string[];

  @observable.ref
  private controller: Controller;

  @observable.shallow
  private interactionHandlers: InteractionHandler[];

  private active = false;

  isActive(): boolean {
    return this.active;
  }

  activate(): void {
    if (!this.active) {
      this.active = true;
      this.getInteractionHandlers().forEach((h) => h.activate());
      this.getChildren().forEach((c) => c.activate());
    }
  }

  deactivate(): void {
    if (this.active) {
      this.active = false;
      this.getChildren().forEach((c) => c.deactivate());
      this.getInteractionHandlers().forEach((h) => h.deactivate());
    }
  }

  get kind(): ModelKind {
    throw new Error('Not implemented');
  }

  installInteractionHandler(handler: InteractionHandler): void {
    if (!this.interactionHandlers) {
      this.interactionHandlers = [];
    }
    this.interactionHandlers.push(handler);
    handler.setOwner(this);
  }

  getInteractionHandlers(): InteractionHandler[] {
    return this.interactionHandlers || [];
  }

  getController(): Controller {
    if (!this.controller) {
      throw new Error(`Element with ID '${this.getId()}' has no controller.`);
    }
    return this.controller;
  }

  setController(controller: Controller): void {
    this.controller = controller;
  }

  getGraph(): GraphEntity {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let p: ElementEntity = this;
    while (!isGraphEntity(p)) {
      p = p.getParent();
    }
    return p;
  }

  isDetached(): boolean {
    return !this.parent;
  }

  getParent(): ElementEntity {
    if (!this.parent) {
      throw new Error(`Element with ID '${this.getId()}' has no parent.`);
    }
    return this.parent;
  }

  setParent(parent: ElementEntity): void {
    if (this.parent !== parent) {
      if (this.parent) {
        this.deactivate();
        this.remove();
      }
      this.parent = parent;
      if (parent && parent.isActive()) {
        this.activate();
      }
    }
  }

  getId(): string {
    return this.id;
  }

  setId(id: string): void {
    this.id = id;
  }

  getType(): string {
    return this.type;
  }

  setType(type: string): void {
    this.type = type;
  }

  setVisible(visible: boolean): void {
    this.visible = visible;
  }

  isVisible(): boolean {
    return this.visible;
  }

  getData(): D | undefined {
    return this.data;
  }

  setData(data: D | undefined): void {
    this.data = data;
  }

  // @computed (switch to getter)
  getChildren(): ElementEntity[] {
    if (this.children) {
      const controller = this.getGraph().getController();
      return this.children.map((id) => controller.getEntityById(id));
    }
    return [];
  }

  appendChild(child: ElementEntity) {
    if (!this.children) {
      this.children = [child.getId()];
      child.setParent(this);
    } else {
      const idx = this.children.indexOf(child.getId());
      this.children.push(child.getId());
      if (idx !== -1) {
        this.children.splice(idx, 1);
      } else {
        child.setParent(this);
      }
    }
  }

  removeChild(child: ElementEntity) {
    if (this.children) {
      const idx = this.children.indexOf(child.getId());
      if (idx !== -1) {
        this.children.splice(idx, 1);
        child.setParent(undefined);
      }
    }
  }

  remove(): void {
    this.getParent().removeChild(this);
  }

  setModel(model: E): void {
    if ('visible' in model) {
      this.setVisible(!!model.visible);
    }
    if (Array.isArray(model.children)) {
      const controller = this.getController();

      // remove all unknown nodes
      _.difference(this.children, model.children).forEach((id) =>
        controller.getEntityById(id).remove(),
      );

      const toadd = _.difference(model.children, this.children);
      if (this.children) {
        this.children.unshift(...toadd);
      } else {
        this.children = toadd;
      }

      // ensure parent references are set
      toadd.forEach((id) => controller.getEntityById(id).setParent(this));
    }
    if ('data' in model) {
      this.data = model.data;
    }
  }

  // // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // protected setModelChildren(children: string[] | undefined, model: E): void {
  //   if (Array.isArray(children)) {
  //     const controller = this.getController();

  //     // remove all unknown nodes
  //     _.difference(this.children, children).forEach((id) => controller.getEntityById(id).remove());

  //     const toadd = _.difference(children, this.children);
  //     this.children.unshift(...toadd);

  //     // ensure parent references are set
  //     toadd.forEach((id) => controller.getEntityById(id).setParent(this));
  //   }
  // }

  raise() {
    if (this.parent) {
      this.parent.appendChild(this);
      if (isNodeEntity(this.parent)) {
        this.parent.raise();
      }
    }
  }
}
