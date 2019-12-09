import * as React from 'react';
import { connect, Dispatch } from 'react-redux';
import { Toolbar, ToolbarGroup, ToolbarItem } from '@patternfly/react-core';
import { RootState } from '@console/internal/redux';
import { getTopologyFilters } from '@console/internal/reducers/ui';
import { setTopologyFilters } from '@console/internal/actions/ui';
import { TextFilter } from '@console/internal/components/factory';
import FilterDropdown from './FilterDropdown';
import { TopologyFilters, DisplayFilters } from './filter-utils';
import './TopologyFilterBar.scss';

type StateProps = {
  filters: TopologyFilters;
};

type DispatchProps = {
  onFilterChange: (filter: TopologyFilters) => void;
};

type TopologyFilterBarProps = StateProps & DispatchProps;

const TopologyFilterBar: React.FC<TopologyFilterBarProps> = ({ filters, onFilterChange }) => {
  const { display, searchQuery } = filters;
  const onDisplayFilterChange = (displayFilters: DisplayFilters) =>
    onFilterChange({ display: displayFilters, searchQuery });

  const onSearchFilterChange = (e: React.KeyboardEvent) =>
    onFilterChange({
      display,
      searchQuery: (e.target as HTMLInputElement).value,
    });
  return (
    <Toolbar className="co-namespace-bar odc-toplogy-filter-bar">
      <ToolbarGroup className="odc-toplogy-filter-bar__dropdown">
        <ToolbarItem>
          <FilterDropdown filters={filters.display} onChange={onDisplayFilterChange} />
        </ToolbarItem>
      </ToolbarGroup>
      <ToolbarGroup className="odc-toplogy-filter-bar__search">
        <ToolbarItem>
          <TextFilter label="name" value={filters.searchQuery} onChange={onSearchFilterChange} />
        </ToolbarItem>
      </ToolbarGroup>
    </Toolbar>
  );
};

const mapStateToProps = (state: RootState): StateProps => ({
  filters: getTopologyFilters(state),
});

const dispatchToProps = (dispatch: Dispatch): DispatchProps => ({
  onFilterChange: (filters: TopologyFilters) => {
    dispatch(setTopologyFilters(filters));
  },
});

export default connect(
  mapStateToProps,
  dispatchToProps,
)(TopologyFilterBar);
