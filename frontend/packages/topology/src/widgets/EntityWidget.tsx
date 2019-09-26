import * as React from 'react';
import { ElementEntity } from '../types';

type EntityWidgetProps = {
  entity: ElementEntity;
};

const EntityWidget: React.FC<EntityWidgetProps> = ({ entity }) => {
  const Component = entity.getController().getWidget(entity);
  return <Component entity={entity} />;
};

export default EntityWidget;
