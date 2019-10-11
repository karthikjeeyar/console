import * as React from 'react';
import * as ReactDOM from 'react-dom';

type GetContainer = Element | null | undefined | (() => Element);

type PortalProps = {
  container?: GetContainer;
};

function getContainer(container: GetContainer): Element | null | undefined {
  return typeof container === 'function' ? container() : container;
}

const Portal: React.FC<PortalProps> = ({ children, container }) => {
  const [containerNode, setContainerNode] = React.useState<Element | null>(null);

  React.useLayoutEffect(() => {
    setContainerNode(getContainer(container) || document.body);
  }, [container]);

  return containerNode ? ReactDOM.createPortal(children, containerNode) : containerNode;
};

export default Portal;
