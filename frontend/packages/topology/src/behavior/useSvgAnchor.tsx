import * as React from 'react';
import { action } from 'mobx';
import { isNodeEntity, NodeEntity } from '../types';
import EntityContext from '../utils/EntityContext';
import SVGAnchor from '../anchors/SVGAnchor';

export const useSvgAnchor = (
  anchorCallback: (entity: NodeEntity) => SVGAnchor,
): ((svg: SVGElement | null) => void) => {
  const entity = React.useContext(EntityContext);
  let svgElement: SVGElement | null = null;

  if (!isNodeEntity(entity)) {
    throw new Error('useAnchor must be used within the scope of a NodeEntity');
  }

  React.useEffect(() => {
    action(() => {
      const anchor: SVGAnchor = anchorCallback(entity);
      if (svgElement) {
        anchor.setSVG(svgElement);
      }
      entity.setAnchor(anchor);
    })();
  }, [anchorCallback, entity, svgElement]);

  const setAnchorSvgRef = (svg: SVGElement | null): void => {
    svgElement = svg;
  };

  return setAnchorSvgRef;
};

export const withSvgAnchor = <P extends {} = {}>(anchor: SVGAnchor) => (
  WrappedComponent: React.ComponentType<P>,
) => {
  const Component: React.FC<P> = (props) => {
    const svgRef = useSvgAnchor(React.useCallback(() => anchor, []));
    return <WrappedComponent {...props} ref={svgRef} />;
  };
  return Component;
};
