import Cookies from 'js-cookie';

const FiltersService = {
  COOKIE: 'filters',
  asParams: filters => FiltersService.hasFilters(filters) ? Object.keys(filters).reduce((params, key) => Object.assign(params, { [`filter_${key}`]: filters[key] }), {}) : {},
  equal: (filtersA, filtersB) => {
    // are equal if both effectively don't have filters
    if (!FiltersService.hasFilters(filtersA) && !FiltersService.hasFilters(filtersB)) { return true; }

    // not equal if the keys of the filters are not the same
    if (Object.keys(filtersA || {}).sort().join('-') !== Object.keys(filtersB || {}).sort().join('-')) { return false; }

    return Object.keys(filtersA || {}).every(key => {
      const aVal = filtersA[key];
      const bVal = (filtersB || {})[key];

      // TODO: array comparison when adding array filters (or nested object?)
      return aVal === bVal;
    });
  },
  hasFilters: filters => {
    const relevantFilters = Object.assign({}, filters);
    // kill empty arrays
    ['tagsExclude', 'tagsInclude'].forEach(k => (!relevantFilters[k] ||
                                                 !relevantFilters[k].length) &&
                                                delete relevantFilters[k]);
    delete relevantFilters.tagsAnd;
    delete relevantFilters.within;
    return !!Object.keys(relevantFilters).length;
  },
  retrieve: () => Cookies.getJSON(FiltersService.COOKIE) || {},
  store: filters => Cookies.set(FiltersService.COOKIE, filters || {}, { path: '' }),
};

export default FiltersService;
