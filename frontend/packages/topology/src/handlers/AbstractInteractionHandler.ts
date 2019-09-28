import { InteractionHandler, ElementEntity } from '../types';

export default abstract class AbstractInteractionHandler<
  S = {},
  E extends ElementEntity = ElementEntity
> implements InteractionHandler {
  private owner: E;

  protected getOwner(): E {
    return this.owner;
  }

  protected getState(): S {
    return this.getOwner()
      .getController()
      .getState<S>();
  }

  setOwner(owner: E) {
    this.owner = owner;
  }

  getProps(): {} | undefined {
    return undefined;
  }

  fireEvent(type: string, ...args: any): void {
    this.getOwner()
      .getController()
      .fireEvent(type, ...args);
  }

  activate(): void {
    // do nothing
  }

  deactivate(): void {
    // do nothing
  }
}
