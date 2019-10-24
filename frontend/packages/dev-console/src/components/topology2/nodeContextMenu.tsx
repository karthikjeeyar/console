import * as React from 'react';
import { ContextMenuItem } from '@console/topology/src/contextmenu/ContextMenu';
import { ElementEntity, NodeEntity } from '@console/topology/src/types';
import { history, KebabItem, KebabOption } from '@console/internal/components/utils';
import { workloadActions } from '../topology/actions/workloadActions';
import { groupActions } from '../topology/actions/groupActions';
import { TopologyApplicationObject } from '../topology/topology-types';

const onKebabOptionClick = (option: KebabOption) => {
  if (option.callback) {
    option.callback();
  }
  if (option.href) {
    history.push(option.href);
  }
};

const workloadContextMenu = (entity: NodeEntity) => {
  const actions = workloadActions(entity.getData());
  return actions
    .filter((o) => !o.hidden)
    .map((action: KebabOption) => (
      <ContextMenuItem key={action.label} onClick={() => onKebabOptionClick(action)}>
        <KebabItem option={action} onClick={null} />
      </ContextMenuItem>
    ));
};

const groupContextMenu = (entity: NodeEntity) => {
  const applicationData: TopologyApplicationObject = {
    id: entity.getId(),
    name: entity.getLabel(),
    resources: entity.getChildren().map((node: ElementEntity) => node.getData()),
  };

  const actions = groupActions(applicationData);
  return actions
    .filter((o) => !o.hidden)
    .map((action: KebabOption) => (
      <ContextMenuItem key={action.label} onClick={() => onKebabOptionClick(action)}>
        <KebabItem option={action} onClick={null} />
      </ContextMenuItem>
    ));
};

export { workloadContextMenu, groupContextMenu };
