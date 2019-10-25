import * as React from 'react';
import { observer } from 'mobx-react';
import { EdgeEntity } from '../types';
import DefaultCreateConnectorWidget from '../widgets/DefaultRemoveConnectorWidget';

type EntityProps = {
  entity: EdgeEntity;
};

export type WithRemoveConnectorProps = {
  onShowRemoveConnector?: () => void;
  onHideRemoveConnector?: () => void;
};

type RemoveRenderer = (
  edge: EdgeEntity,
  onRemove: (edge: EdgeEntity) => void,
  size?: number,
) => React.ReactElement;

const defaultRenderRemove: RemoveRenderer = (
  edge: EdgeEntity,
  onRemove: (edge: EdgeEntity) => void,
) => {
  const removeEntity = () => {
    onRemove(edge);
  };

  return (
    <DefaultCreateConnectorWidget
      startPoint={edge.getStartPoint()}
      endPoint={edge.getEndPoint()}
      onRemove={removeEntity}
    />
  );
};

export const WithRemoveConnector = <P extends WithRemoveConnectorProps & EntityProps>(
  onRemove: (edge: EdgeEntity) => void,
  renderRemove: RemoveRenderer = defaultRenderRemove,
) => (WrappedComponent: React.ComponentType<P>) => {
  const Component: React.FC<Omit<P, keyof WithRemoveConnectorProps>> = (props) => {
    const [show, setShow] = React.useState(false);
    const onShowRemoveConnector = React.useCallback(() => setShow(true), []);
    const onHideRemoveConnector = React.useCallback(() => setShow(false), []);

    return (
      <WrappedComponent
        {...props as any}
        onShowRemoveConnector={onShowRemoveConnector}
        onHideRemoveConnector={onHideRemoveConnector}
      >
        {show && renderRemove(props.entity, onRemove)}
      </WrappedComponent>
    );
  };
  return observer(Component);
};
