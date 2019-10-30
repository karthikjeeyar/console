import * as React from 'react';
import { ResourceOverviewPage } from '@console/internal/components/overview/resource-overview-page';
import { TopologyDataObject } from './topology-types';

export type TopologyResourcePanelProps = {
  item: TopologyDataObject;
};

const TopologyResourcePanel: React.FC<TopologyResourcePanelProps> = ({ item }) => {
  const resourceItemToShowOnSideBar = item && item.resources;
<<<<<<< HEAD
  return (
    resourceItemToShowOnSideBar && (
      <ResourceOverviewPage
        item={resourceItemToShowOnSideBar}
        kind={resourceItemToShowOnSideBar.obj.kind}
      />
    )
  );
=======
  if (_.get(item, 'data.isKnativeResource', false)) {
    return <KnativeOverviewPage item={item.resources} />;
  } else {
    return (
      resourceItemToShowOnSideBar && (
        <ResourceOverviewPage
          item={resourceItemToShowOnSideBar}
          kind={resourceItemToShowOnSideBar.obj.kind}
        />
      )
    );
  }
>>>>>>> a7748770a... add sidebar support
};

export default TopologyResourcePanel;
