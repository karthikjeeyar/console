import * as React from 'react';
import * as fuzzy from 'fuzzysearch';
import { toLower } from 'lodash';

const useFilter = (filters: any, resource: any) => {
  const [filtered, setFiltered] = React.useState(false);
  const fuzzyCaseInsensitive = (a: string, b: string): boolean => fuzzy(toLower(a), toLower(b));
  React.useEffect(() => {
    setFiltered(fuzzyCaseInsensitive(filters.searchQuery, resource.metadata.name));
  }, [filters.searchQuery, resource]);

  return filtered;
};

export default useFilter;
