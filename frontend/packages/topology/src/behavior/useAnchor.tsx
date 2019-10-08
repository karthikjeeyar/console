import * as React from 'react';
import { action } from 'mobx';
import { observer } from 'mobx-react';
import { isNodeEntity, Anchor, NodeEntity } from '../types';
import EntityContext from '../utils/EntityContext';

export const useAnchor = (anchorCallback: (entity: NodeEntity) => Anchor): void => {
  const entity = React.useContext(EntityContext);
  if (!isNodeEntity(entity)) {
    throw new Error('useAnchor must be used within the scope of a NodeEntity');
  }
  React.useEffect(() => {
    action(() => entity.setAnchor(anchorCallback(entity)))();
  }, [anchorCallback, entity]);
};

export const withAnchor = <P extends {} = {}>(anchor: Anchor) => (
  WrappedComponent: React.ComponentType<P>,
) => {
  const Component: React.FC<P> = (props) => {
    useAnchor(React.useCallback(() => anchor, []));
    return <WrappedComponent {...props} />;
  };
  return observer(Component);
};
