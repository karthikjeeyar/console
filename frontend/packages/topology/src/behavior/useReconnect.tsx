import * as React from 'react';
import * as d3 from 'd3';
import { action } from 'mobx';
import { observer } from 'mobx-react';
import { EdgeEntity } from '../types';

export type ConnectorRef = (node: SVGElement | null) => void;

const connectorRef = (entity: EdgeEntity, node: SVGElement | null, isSource: boolean): void => {
  if (node) {
    d3.select(node).call(
      d3
        .drag()
        .on(
          'drag',
          action(() => {
            const { x, y } = d3.event;
            if (isSource) {
              entity.setStartPoint(x, y);
            } else {
              entity.setEndPoint(x, y);
            }
          }),
        )
        .on(
          'end',
          action(() => {
            // TODO
            // for now just resetting the point
            if (isSource) {
              entity.setStartPoint();
            } else {
              entity.setEndPoint();
            }
          }),
        ),
    );
  }
};

export const useReconnect = (entity: EdgeEntity): [ConnectorRef, ConnectorRef] => {
  const sourceConnectorRef = React.useCallback(
    (node: SVGElement | null): void => {
      connectorRef(entity, node, true);
    },
    [entity],
  );

  const targetConnectorRef = React.useCallback(
    (node: SVGElement | null): void => {
      connectorRef(entity, node, false);
    },
    [entity],
  );
  return [sourceConnectorRef, targetConnectorRef];
};

export type WithReconnectProps = {
  sourceConnectorRef: ConnectorRef;
  targetConnectorRef: ConnectorRef;
};

type EntityProps = {
  entity: EdgeEntity;
};

export const withReconnect = <P extends WithReconnectProps>(
  WrappedComponent: React.ComponentType<P>,
) => {
  const Component: React.FC<Omit<P, keyof WithReconnectProps> & EntityProps> = (props) => {
    const [sourceConnectorRef, targetConnectorRef] = useReconnect(props.entity);
    return (
      <WrappedComponent
        {...props as any}
        sourceConnectorRef={sourceConnectorRef}
        targetConnectorRef={targetConnectorRef}
      />
    );
  };
  return observer(Component);
};
