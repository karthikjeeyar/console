import * as React from 'react';
import { observer } from 'mobx-react';
import EntityContext from '../utils/EntityContext';
import { isNodeEntity } from '../types';

type LayerContainerProps = {
  children: React.ReactNode;
};

const LayerContainer: React.RefForwardingComponent<SVGGElement, LayerContainerProps> = (
  { children },
  ref,
) => {
  // accumulate parent positions
  let p = React.useContext(EntityContext);
  let x = 0;
  let y = 0;
  while (isNodeEntity(p)) {
    if (!p.isGroup()) {
      const { x: px, y: py } = p.getBounds();
      x += px;
      y += py;
    }
    p = p.getParent();
  }
  return (
    <g ref={ref} transform={`translate(${x}, ${y})`}>
      {children}
    </g>
  );
};

export default observer(React.forwardRef(LayerContainer));
