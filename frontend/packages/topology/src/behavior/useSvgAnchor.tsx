import * as React from 'react';
import { action } from 'mobx';
import { isNodeEntity, AnchorEnd } from '../types';
import EntityContext from '../utils/EntityContext';
import SVGAnchor from '../anchors/SVGAnchor';

export type SvgAnchorRef = (node: SVGElement | null) => void;

export const useSvgAnchor = (
  end: AnchorEnd = AnchorEnd.both,
  type: string = '',
): ((node: SVGElement | null) => void) => {
  const entity = React.useContext(EntityContext);
  if (!isNodeEntity(entity)) {
    throw new Error('useAnchor must be used within the scope of a NodeEntity');
  }

  const setAnchorSvgRef = React.useCallback<SvgAnchorRef>(
    action((node: SVGElement | null) => {
      if (node) {
        const anchor = new SVGAnchor(entity);
        anchor.setSVGElement(node);
        entity.setAnchor(anchor, end, type);
      }
    }),
    [entity, type, end],
  );

  return setAnchorSvgRef;
};

export type WithSvgAnchorProps = {
  svgAnchorRef: SvgAnchorRef;
};

export const withSvgAnchor = (end?: AnchorEnd, type?: string) => <
  P extends WithSvgAnchorProps
>() => (WrappedComponent: React.ComponentType<P>) => {
  const Component: React.FC<Omit<P, keyof WithSvgAnchorProps>> = (props) => {
    const svgAnchorRef = useSvgAnchor(end, type);
    return <WrappedComponent {...props as any} svgAnchorRef={svgAnchorRef} />;
  };
  return Component;
};
