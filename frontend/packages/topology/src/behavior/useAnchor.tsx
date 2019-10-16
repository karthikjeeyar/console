import * as React from 'react';
import { action } from 'mobx';
import { observer } from 'mobx-react';
import { isNodeEntity, Anchor, NodeEntity, AnchorEnd } from '../types';
import EntityContext from '../utils/EntityContext';

export const useAnchor = (
  anchorCallback: (entity: NodeEntity) => Anchor | undefined,
  end: AnchorEnd = AnchorEnd.both,
  type?: string,
): void => {
  const entity = React.useContext(EntityContext);
  if (!isNodeEntity(entity)) {
    throw new Error('useAnchor must be used within the scope of a NodeEntity');
  }
  React.useLayoutEffect(() => {
    action(() => {
      const anchor = anchorCallback(entity);
      if (anchor) {
        entity.setAnchor(anchor, end, type);
      }
    })();
  }, [anchorCallback, entity, end, type]);
};

export const withAnchor = <P extends {} = {}>(anchor: Anchor, end?: AnchorEnd, type?: string) => (
  WrappedComponent: React.ComponentType<P>,
) => {
  const Component: React.FC<P> = (props) => {
    useAnchor(React.useCallback(() => anchor, []), end, type);
    return <WrappedComponent {...props} />;
  };
  return observer(Component);
};
