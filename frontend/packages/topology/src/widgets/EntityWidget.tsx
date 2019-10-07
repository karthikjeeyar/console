import * as React from 'react';
import EntityContext from '../utils/EntityContext';
import { ElementEntity, isNodeEntity, isGraphEntity } from '../types';
import widget from '../widget';

type EntityWidgetProps = {
  entity: ElementEntity;
};

// in a separate widget component so that changes to interaction handlers do not re-render children
const EntityComponent: React.FC<EntityWidgetProps> = widget(({ entity }) => {
  const Component = entity.getController().getWidget(entity);
  return (
    <EntityContext.Provider value={entity}>
      <Component {...entity.getState()} entity={entity} />
    </EntityContext.Provider>
  );
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
    const { x, y } = entity.getPosition();
    return (
      <g {...commonProps} transform={`translate(${x}, ${y})`}>
        {<EntityComponent entity={entity} />}
        {<EntityChildren entity={entity} />}
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
