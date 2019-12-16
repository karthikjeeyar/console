import * as React from 'react';
import { shallow } from 'enzyme';
import { SelectOption, Select, SelectGroup } from '@patternfly/react-core';
import FilterDropdown from '../FilterDropdown';
import { DisplayFilters } from '../filter-utils';

describe(FilterDropdown.displayName, () => {
  let dropdownFilter: DisplayFilters;
  let onChange: () => void;
  beforeEach(() => {
    dropdownFilter = {
      podCount: true,
      setTraffic: true,
      eventSources: true,
      knativeServices: true,
      appGrouping: true,
      operatorGrouping: true,
    };
    onChange = jasmine.createSpy();
  });

  it('should exists', () => {
    const wrapper = shallow(<FilterDropdown filters={dropdownFilter} onChange={onChange} />);
    expect(wrapper.exists()).toBeTruthy();
  });

  it('should call onChange when clicked on a items', () => {
    const wrapper = shallow(<FilterDropdown filters={dropdownFilter} onChange={onChange} />);
    wrapper
      .find(SelectOption)
      .first()
      .simulate('click', { target: { checked: true } });
    expect(onChange).toHaveBeenCalled();
  });

  it('should have 6 filters in total', () => {
    const wrapper = shallow(<FilterDropdown filters={dropdownFilter} onChange={onChange} />);
    expect(wrapper.find(SelectOption)).toHaveLength(6);
  });

  it('should change number of selected filters on click', () => {
    dropdownFilter.podCount = false;
    const wrapper = shallow(<FilterDropdown filters={dropdownFilter} onChange={onChange} />);
    expect(wrapper.find(Select).prop('selections')).toHaveLength(5);
    wrapper
      .find(SelectGroup)
      .first()
      .childAt(2)
      .simulate('click', { target: { checked: false } });
    expect(wrapper.find(Select).prop('selections')).toHaveLength(4);
  });
});
