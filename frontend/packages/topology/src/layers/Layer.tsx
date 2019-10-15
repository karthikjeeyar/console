import * as React from 'react';
import { observer } from 'mobx-react';
import { createPortal } from 'react-dom';
import EntityContext from '../utils/EntityContext';
import LayersContext from './LayersContext';
import LayerContainer from './LayerContainer';

type LayerProps = {
  id?: string;
  children: React.ReactNode;
  orderKey?: number;
};

type LayerDelegateProps = {
  id: string;
  children: React.ReactNode;
  orderKey?: number;
};

const ORDER_KEY = '__order__';

const compare = (a: ChildNode, b: ChildNode): number => {
  if (a === b) {
    return 0;
  }
  const ao = a[ORDER_KEY];
  const bo = b[ORDER_KEY];

  if (ao == null || bo == null) {
    return 0;
  }

  for (let i = 0; i < ao.length; i++) {
    if (ao[i] !== bo[i]) {
      return ao[i] - bo[i];
    }
  }
  return ao.length === bo.length ? 0 : ao.length - bo.length;
};

const LayerDelegate: React.FC<LayerDelegateProps> = observer(({ id, children, orderKey }) => {
  const getLayerNode = React.useContext(LayersContext);
  const layerNode = getLayerNode(id);

  const entity = React.useContext(EntityContext);
  const nodeRef = React.useRef<SVGGElement | null>(null);
  const order = id ? (orderKey != null ? orderKey : entity.getOrderKey()) : undefined;

  React.useEffect(() => {
    // TODO use bisection search
    if (nodeRef.current && layerNode != null) {
      nodeRef.current[ORDER_KEY] = order;
      const { childNodes } = layerNode;
      // childNodes is not an array, disable false positive
      // eslint-disable-next-line @typescript-eslint/prefer-for-of
      for (let i = 0; i < childNodes.length; i++) {
        const result = compare(nodeRef.current, childNodes[i]);
        if (result < 0) {
          layerNode.insertBefore(nodeRef.current, childNodes[i]);
          return;
        }
      }
      layerNode.appendChild(nodeRef.current);
    }
  }, [order, layerNode]);

  return createPortal(<LayerContainer ref={nodeRef}>{children}</LayerContainer>, layerNode);
});

const Layer: React.FC<LayerProps> = ({ id, children, orderKey }) => {
  return id ? (
    <LayerDelegate id={id} orderKey={orderKey}>
      {children}
    </LayerDelegate>
  ) : (
    <>{children}</>
  );
};

export default Layer;
