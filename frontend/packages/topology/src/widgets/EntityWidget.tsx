import * as React from 'react';
import LayerXYContext from '../layers/LayerXYContext';
import { ElementEntity, isNodeEntity, isGraphEntity } from '../types';
import widget from '../widget';

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

const EntityChildren: React.FC<EntityWidgetProps> = widget(({ entity }) => {
  return (
    <>
      {entity.getChildren().map((c) => (
        <EntityWidget key={c.getId()} entity={c} />
      ))}
    </>
  );
});

const EntityWidget: React.FC<EntityWidgetProps> = widget(({ entity }) => {
  if (isGraphEntity(entity)) {
    return <EntityComponent entity={entity} />;
  }
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
          {<EntityComponent entity={entity} />}
          {<EntityChildren entity={entity} />}
        </LayerXYContext.Provider>
      </g>
    );
  }
  return (
    <g {...commonProps}>
      {<EntityComponent entity={entity} />}
      {<EntityChildren entity={entity} />}
    </g>
  );
});

export default EntityWidget;
