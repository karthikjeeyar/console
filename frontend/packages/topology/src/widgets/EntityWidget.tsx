import * as React from 'react';
import LayerXYContext from '../layers/LayerXYContext';
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
  const commonProps = {
    [`data-id`]: entity.getId(),
    [`data-kind`]: entity.kind,
    [`data-type`]: entity.getType(),
  };
  if (isNodeEntity(entity)) {
    // accumulate all the parent node positions
    let { x, y } = entity.getPosition();
    let p = entity.getParent();
    while (isNodeEntity(p)) {
      const { x: px, y: py } = p.getPosition();
      x += px;
      y += py;
      p = p.getParent();
    }
    return (
      <g {...commonProps} transform={`translate(${x}, ${y})`}>
        <LayerXYContext.Provider value={{ x, y }}>
          {component}
          {children}
        </LayerXYContext.Provider>
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
