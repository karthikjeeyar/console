import * as React from 'react';
import * as ReactDOM from 'react-dom';

type GetContainer = Element | null | undefined | (() => Element);

type PortalProps = {
  container?: GetContainer;
};

const getContainer = (container: GetContainer): Element | null | undefined =>
  typeof container === 'function' ? container() : container;

const Portal: React.FC<PortalProps> = ({ children, container }) => {
  const [containerNode, setContainerNode] = React.useState<Element | null>(null);

  React.useLayoutEffect(() => {
    setContainerNode(getContainer(container) || document.body);
  }, [container]);

  // TODO: Check container node
  return ReactDOM.createPortal(children, containerNode as Element);
};

export default Portal;
