import * as React from 'react';
import { SelectionHandlerProps } from '../handlers/SelectionHandler';
import { NodeEntity } from '../types';
import widget from './widget';

type NodeWidgetProps = {
  entity: NodeEntity;
} & SelectionHandlerProps;

const NodeWidget: React.FC<NodeWidgetProps> = ({ entity, selected, onSelect }) => {
  const { width, height } = entity.getBoundingBox();
  return (
    <ellipse
      onClick={onSelect}
      cx={0}
      cy={0}
      rx={width / 2}
      ry={height / 2}
      fill={selected ? 'blue' : 'grey'}
    />
  );
};

export default widget(NodeWidget);
