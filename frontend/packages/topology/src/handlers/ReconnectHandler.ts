import * as d3 from 'd3';
import { action } from 'mobx';
import { EdgeEntity } from '../types';
import AbstractInteractionHandler from './AbstractInteractionHandler';

export type ReconnectHandlerProps = {
  sourceConnectorRef: (node: SVGElement | null) => void;
  targetConnectorRef: (node: SVGElement | null) => void;
};

export default class ReconnectHandler extends AbstractInteractionHandler<
  ReconnectHandlerProps,
  {},
  EdgeEntity
> {
  private connectorRef(node: SVGElement | null, isSource: boolean): void {
    if (node) {
      d3.select(node).call(
        d3
          .drag()
          .on(
            'drag',
            action(() => {
              const { x, y } = d3.event;
              if (isSource) {
                this.getOwner().setStartPoint(x, y);
              } else {
                this.getOwner().setEndPoint(x, y);
              }
            }),
          )
          .on(
            'end',
            action(() => {
              // TODO
              // for now just resetting the point
              if (isSource) {
                this.getOwner().setStartPoint();
              } else {
                this.getOwner().setEndPoint();
              }
            }),
          ),
      );
    }
  }

  private sourceConnectorRef = (node: SVGElement | null): void => {
    this.connectorRef(node, true);
  };

  private targetConnectorRef = (node: SVGElement | null): void => {
    this.connectorRef(node, false);
  };

  getProps(): ReconnectHandlerProps {
    return {
      sourceConnectorRef: this.sourceConnectorRef,
      targetConnectorRef: this.targetConnectorRef,
    };
  }
}
