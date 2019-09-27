import * as React from 'react';
import { ElementEntity, isNodeEntity } from '../types';
import widget from './widget';

type EntityWidgetProps = {
  entity: ElementEntity;
};

const EntityWidget: React.FC<EntityWidgetProps> = ({ entity }) => {
  const props = entity.getInteractionHandlers().reduce((a, v) => ({ ...v.getProps() }), {});
  const Component = entity.getController().getWidget(entity);
  let result = (
    <Component {...props} entity={entity}>
      {entity.getChildren().map((c) => (
        <EntityWidget key={c.getId()} entity={c} />
      ))}
    </Component>
  );
  if (isNodeEntity(entity)) {
    const { x, y } = entity.getPosition();
    result = <g transform={`translate(${x}, ${y})`}>{result}</g>;
  }
  return result;
};

export default widget(EntityWidget);
