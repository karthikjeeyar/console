import { observable } from 'mobx';
import * as _ from 'lodash';
import Rect from '../geom/Rect';
import {
  Element,
  GraphEntity,
  ElementEntity,
  isGraphEntity,
  Controller,
  ModelKind,
} from '../types';
import Stateful from '../utils/Stateful';
import { Translatable } from '../geom/types';

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

  @observable.ref
  private bounds: Rect = observable(new Rect());

  abstract get kind(): ModelKind;

  getBounds(): Rect {
    return this.bounds;
  }

  setBounds(bounds: Rect): void {
    this.bounds.setBounds(bounds.x, bounds.y, bounds.width, bounds.height);
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
        this.remove();
      }
      this.parent = parent;
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

  raise() {
    const { parent } = this;
    if (parent) {
      parent.appendChild(this);
      parent.raise();
    }
  }

  translateToAbsolute(t: Translatable): void {
    const { x, y } = this.getBounds();
    t.translate(x, y);
    const { parent } = this;
    if (parent) {
      parent.translateToAbsolute(t);
    }
  }

  translateFromAbsolute(t: Translatable): void {
    const { parent } = this;
    if (parent) {
      parent.translateFromAbsolute(t);
    }
    const { x, y } = this.getBounds();
    t.translate(-x, -y);
  }
}
