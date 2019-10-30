import * as React from 'react';
import EntityContext from '../utils/EntityContext';
import { ElementEntity, isGraphEntity, isEdgeEntity, isNodeEntity } from '../types';
import widget from '../widget';

type EntityWidgetProps = {
  entity: ElementEntity;
};

// in a separate widget component so that changes to interaction handlers do not re-render children
const EntityComponent: React.FC<EntityWidgetProps> = widget(({ entity }) => {
  const Component = React.useMemo(
    () => entity.getController().getWidget(entity.kind, entity.getType()),
    [entity],
  );
  if (!entity.isVisible()) {
    return null;
  }
  if (isEdgeEntity(entity)) {
    const source = entity.getSource();
    const target = entity.getTarget();
    if ((source && !source.isVisible()) || (target && !target.isVisible())) {
      return null;
    }
  }
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
  const commonProps = {
    [`data-id`]: entity.getId(),
    [`data-kind`]: entity.kind,
    [`data-type`]: entity.getType(),
  };
  if (isGraphEntity(entity)) {
    return (
      <g {...commonProps}>
        <EntityComponent entity={entity} />
      </g>
    );
  }
  if (isNodeEntity(entity) && !entity.isGroup()) {
    const { x, y } = entity.getBounds();
    return (
      <g {...commonProps} transform={`translate(${x}, ${y})`}>
        <EntityComponent entity={entity} />
        <EntityChildren entity={entity} />
      </g>
    );
  }
  return (
    <g {...commonProps}>
      <EntityComponent entity={entity} />
      <EntityChildren entity={entity} />
    </g>
  );
});

export default EntityWidget;
