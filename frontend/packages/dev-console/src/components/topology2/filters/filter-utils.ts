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

export type TopologyFilters = {
  display: DisplayFilters;
  searchQuery: SearchFilter;
};

export type SearchFilter = string;

export type DisplayFilters = {
  podCount: boolean;
  setTraffic: boolean;
  eventSources: boolean;
  knativeServices: boolean;
  appGrouping: boolean;
  operatorGrouping: boolean;
};
