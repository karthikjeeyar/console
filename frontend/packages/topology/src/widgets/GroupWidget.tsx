import * as React from 'react';
import { SelectionHandlerProps } from '../handlers/SelectionHandler';
import { NodeEntity } from '../types';
import Rect from '../geom/Rect';
import Layer from '../layers/Layer';
import widget from './widget';

type GroupWidgetProps = {
  entity: NodeEntity;
} & SelectionHandlerProps;

const GroupWidget: React.FC<GroupWidgetProps> = ({ entity, selected, onSelect }) => {
  const children = entity.getChildren();
  if (children.length === 0) {
    return null;
  }
  const box: Rect = children[0].getBoundingBox().clone();
  for (let i = 1, l = children.length; i < l; i++) {
    box.union(children[i].getBoundingBox());
  }
  // add padding
  box.expand(10, 10);
  return (
    <Layer id="groups">
      <rect
        onClick={onSelect}
        x={box.x}
        y={box.y}
        width={box.width}
        height={box.height}
        fill="#ededed"
        strokeWidth={2}
        stroke={selected ? 'blue' : '#cdcdcd'}
      />
    </Layer>
  );
};

export default widget(GroupWidget);
