import * as React from 'react';
import { ElementEntity, isNodeEntity, isGraphEntity } from '../types';
import widget from './widget';

type EntityWidgetProps = {
  entity: ElementEntity;
};

// in a separate widget component so that changes to interaction handlers do not re-render children
const EntityComponent: React.FC<EntityWidgetProps> = widget(({ entity }) => {
  const props = {
    ...entity.getInteractionHandlers().reduce((a, v) => ({ ...v.getProps() }), {}),
    ...entity.getState(),
  };
  const Component = entity.getController().getWidget(entity);
  return <Component {...props} entity={entity} />;
});

const EntityWidget: React.FC<EntityWidgetProps> = widget(({ entity }) => {
  const component = <EntityComponent entity={entity} />;
  if (isGraphEntity(entity)) {
    return component;
  }
  const children = entity.getChildren().map((c) => <EntityWidget key={c.getId()} entity={c} />);
  const commonProps = { [`data-${entity.kind}-id`]: entity.getId() };
  if (isNodeEntity(entity)) {
    const { x, y } = entity.getPosition();
    return (
      <g {...commonProps} transform={`translate(${x}, ${y})`}>
        {component}
        {children}
      </g>
    );
  }
  return (
    <g {...commonProps}>
      {component}
      {children}
    </g>
  );
});

export default EntityWidget;
