import * as React from 'react';
import { Select, SelectVariant, SelectOption, SelectGroup } from '@patternfly/react-core';
import { ShowFiltersKeyValue, ExpandFiltersKeyValue, DisplayFilters } from './filter-utils';
import './FilterDropdown.scss';

type FilterDropdownProps = {
  filters: DisplayFilters;
  onChange: (filter: DisplayFilters) => void;
};

const FilterDropdown: React.FC<FilterDropdownProps> = ({ filters, onChange }) => {
  const [isOpen, setIsOpen] = React.useState();
  const [selected, setSelected] = React.useState<string[]>(
    Object.keys(filters)
      .filter((key) => filters[key])
      .map((key) => ShowFiltersKeyValue[key] || ExpandFiltersKeyValue[key]),
  );

  const onToggle = (open: boolean): void => setIsOpen(open);
  const onOptionClick = (e: React.MouseEvent, key: string, value: string): void => {
    filters[key] = (e.target as HTMLInputElement).checked;
    onChange(filters);
    if (selected.includes(value)) {
      setSelected(selected.filter((item) => item !== value));
    } else {
      setSelected([...selected, value]);
    }
  };

  const showOptions = (
    <SelectGroup label="Show">
      {Object.keys(ShowFiltersKeyValue).map((key) => (
        <SelectOption
          key={key}
          value={ShowFiltersKeyValue[key]}
          onClick={(e: React.MouseEvent) => onOptionClick(e, key, ShowFiltersKeyValue[key])}
        />
      ))}
    </SelectGroup>
  );
  const expandOptions = (
    <SelectGroup label="Expand">
      {Object.keys(ExpandFiltersKeyValue).map((key) => (
        <SelectOption
          key={key}
          value={ExpandFiltersKeyValue[key]}
          onClick={(e: React.MouseEvent) => onOptionClick(e, key, ExpandFiltersKeyValue[key])}
        />
      ))}
    </SelectGroup>
  );

  return (
    <Select
      className="odc-filter-dropdown__select"
      variant={SelectVariant.checkbox}
      onToggle={onToggle}
      selections={selected}
      isExpanded={isOpen}
      placeholderText="Display"
      isGrouped
    >
      {showOptions}
      {expandOptions}
    </Select>
  );
};

export default FilterDropdown;
