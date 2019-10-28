import * as React from 'react';
import { useSize } from '@console/topology/src/utils/useSize';
import { createSvgIdUrl } from '../../utils/svg-utils';
import SvgResourceIcon from '../topology/shapes/ResourceIcon';
import SvgDropShadowFilter from './SvgDropShadowFilter';

export interface SvgBoxedTextProps {
  children?: string;
  className?: string;
  paddingX?: number;
  paddingY?: number;
  x?: number;
  y?: number;
  cornerRadius?: number;
  kind?: string;
  innerRef?: React.Ref<SVGGElement>;
  // TODO remove with 2.0
  onMouseEnter?: React.MouseEventHandler<SVGGElement>;
  onMouseLeave?: React.MouseEventHandler<SVGGElement>;
}

const FILTER_ID = 'SvgBoxedTextDropShadowFilterId';

/**
 * Renders a `<text>` component with a `<rect>` box behind.
 */
const SvgBoxedText: React.FC<SvgBoxedTextProps> = ({
  children,
  className,
  paddingX = 0,
  paddingY = 0,
  cornerRadius = 4,
  x = 0,
  y = 0,
  kind,
  onMouseEnter,
  onMouseLeave,
  innerRef,
  ...other
}) => {
  const [textSize, textRef] = useSize([children, className]);
  const [iconSize, iconRef] = useSize([kind]);
  const iconSpace = kind && iconSize ? iconSize.width + paddingX : 0;

  return (
    <g ref={innerRef} className={className}>
      <SvgDropShadowFilter id={FILTER_ID} />
      {textSize && (
        <rect
          filter={createSvgIdUrl(FILTER_ID)}
          x={x - paddingX - textSize.width / 2 - iconSpace / 2}
          width={textSize.width + paddingX * 2 + iconSpace}
          y={y - paddingY - textSize.height / 2}
          height={textSize.height + paddingY * 2}
          rx={cornerRadius}
          ry={cornerRadius}
        />
      )}
      {textSize && kind && (
        <SvgResourceIcon
          ref={iconRef}
          x={x - textSize.width / 2 - paddingX / 2}
          y={y}
          kind={kind}
        />
      )}
      <text
        ref={textRef}
        {...other}
        x={x + iconSpace / 2}
        y={y}
        textAnchor="middle"
        dy="0.35em"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {children}
      </text>
    </g>
  );
};

export default SvgBoxedText;
