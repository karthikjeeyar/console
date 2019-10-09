import * as React from 'react';
import { action } from 'mobx';
import { isNodeEntity } from '../types';
import EntityContext from '../utils/EntityContext';
import SVGAnchor from '../anchors/SVGAnchor';
import { useAnchor } from './useAnchor';

export type SvgAnchorRef = (node: SVGElement | null) => void;

export const useSvgAnchor = (): ((node: SVGElement | null) => void) => {
  const entity = React.useContext(EntityContext);
  if (!isNodeEntity(entity)) {
    throw new Error('useAnchor must be used within the scope of a NodeEntity');
  }

  const entityRef = React.useRef(entity);
  entityRef.current = entity;

  useAnchor(
    React.useCallback(() => {
      if (!(entity.getAnchor() instanceof SVGAnchor)) {
        return new SVGAnchor();
      }
      return undefined;
    }, [entity]),
  );

  const setAnchorSvgRef = React.useCallback<SvgAnchorRef>(
    action((node: SVGElement | null) => {
      if (node) {
        const anchor = entity.getAnchor();
        if (anchor instanceof SVGAnchor) {
          anchor.setSVGElement(node);
        }
      }
    }),
    [],
  );

  return setAnchorSvgRef;
};

export type WithSvgAnchorProps = {
  svgAnchorRef: SvgAnchorRef;
};

export const withSvgAnchor = <P extends WithSvgAnchorProps>() => (
  WrappedComponent: React.ComponentType<P>,
) => {
  const Component: React.FC<Omit<P, keyof WithSvgAnchorProps>> = (props) => {
    const svgAnchorRef = useSvgAnchor();
    return <WrappedComponent {...props as any} svgAnchorRef={svgAnchorRef} />;
  };
  return Component;
};
