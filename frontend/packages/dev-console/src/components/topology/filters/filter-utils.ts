import { RootState } from '@console/internal/redux';

export enum ShowFiltersKeyValue {
  podCount = 'Pod Count',
  setTraffic = 'Set Traffic',
  eventSources = 'Event Sources',
}

export enum ExpandFiltersKeyValue {
  knativeServices = 'Knative Services',
  appGrouping = 'Application Groupings',
  operatorGrouping = 'Operator Groupings',
}

export const getTopologyFilters = ({
  plugins: {
    devconsole: { topology },
  },
}: RootState): any => topology.get('filters');

export type TopologyFilters = {
  display: DisplayFilters;
  searchQuery: SearchQuery;
};

export type SearchQuery = string;

export type DisplayFilters = {
  podCount: boolean;
  setTraffic: boolean;
  eventSources: boolean;
  knativeServices: boolean;
  appGrouping: boolean;
  operatorGrouping: boolean;
};
