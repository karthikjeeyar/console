import * as React from 'react';
import SvgDropShadowFilter from '../../svg/SvgDropShadowFilter';
import { createSvgIdUrl } from '../../../utils/svg-utils';

const FILTER_ID = 'NodeShadowsFilterId';
const FILTER_ID_HOVER = 'NodeShadowsFilterId--hover';

export const NODE_SHADOW_FILTER_URL = createSvgIdUrl(FILTER_ID);
export const NODE_SHADOW_FILTER_HOVER_URL = createSvgIdUrl(FILTER_ID_HOVER);

const NodeShadows: React.FC = () => (
  <>
    <SvgDropShadowFilter id={FILTER_ID} />
    <SvgDropShadowFilter id={FILTER_ID_HOVER} dy={3} stdDeviation={7} floodOpacity={0.24} />
  </>
);

export default NodeShadows;
