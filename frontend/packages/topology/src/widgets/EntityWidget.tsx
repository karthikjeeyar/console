import * as React from 'react';
import { ElementEntity } from '../types';
import widget from './widget';

type EntityWidgetProps = {
  entity: ElementEntity;
};

const EntityWidget: React.FC<EntityWidgetProps> = ({ entity }) => {
  const props = entity.getInteractionHandlers().reduce((a, v) => ({ ...v.getProps() }), {});
  const Component = entity.getController().getWidget(entity);
  return <Component {...props} entity={entity} />;
};

export default widget(EntityWidget);
