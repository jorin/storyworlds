import Cookies from 'js-cookie';
import FiltersService from 'services/filters_service';
jest.mock('js-cookie');

describe('asParams', () => {
  test('converts non-object to empty', () => expect(FiltersService.asParams()).toEqual({}));
  test('converts modifiers only to empty', () => expect(FiltersService.asParams({ within: true })).toEqual({}));
  test('prepends keys with filter_', () => expect(FiltersService.asParams({ starts: 200, within: true }))
                                             .toEqual({ filter_starts: 200, filter_within: true }));
});

describe('equal', () => {
  test('empty and falsy are equal',
       () => expect(FiltersService.equal({}, null)).toBe(true));
  test('empty and inapplicable are equal',
       () => expect(FiltersService.equal({}, { within: true })).toBe(true));
  test('different keys are inequal',
       () => expect(FiltersService.equal({ starts: 100, ends: 200 }, { starts: 100 })).toBe(false));
  test('same keys, different values are inequal',
       () => expect(FiltersService.equal({ starts: 100, ends: 200 }, { starts: 100, ends: 300 })).toBe(false));
  test('same keys, same values are equal',
       () => expect(FiltersService.equal({ starts: 100, ends: 200 }, { starts: 100, ends: 200 })).toBe(true));
});

describe('hasFilters', () => {
  test('falsy filters is false', () => expect(FiltersService.hasFilters(null)).toBe(false));
  test('empty filters is false', () => expect(FiltersService.hasFilters({})).toBe(false));
  test('empty tagsInclude filter is false', () => expect(FiltersService.hasFilters({ tagsInclude: [] })).toBe(false));
  test('empty tagsExclude filter is false', () => expect(FiltersService.hasFilters({ tagsExclude: undefined })).toBe(false));
  test('inapplicable tagsAnd filter is false', () => expect(FiltersService.hasFilters({ tagsAnd: true })).toBe(false));
  test('inapplicable within filter is false', () => expect(FiltersService.hasFilters({ within: true })).toBe(false));
  test('applicable filters is true', () => expect(FiltersService.hasFilters({ starts: 100, within: true })).toBe(true));
});

describe('retrieve', () => {
  test('retrieves filters from cookie', () => {
    const cookieReturn = 'Retrieved cookie'
    Cookies.getJSON = () => cookieReturn;
    expect(FiltersService.retrieve()).toBe(cookieReturn);
  });
});

describe('store', () => {
  test('saves filters to cookie', () => {
    let cookieSave;
    Cookies.set = (_cookieName, value, _opts) => cookieSave = value;
    const filters = { starts: 100, ends: 500 };
    FiltersService.store(filters);
    expect(cookieSave).toEqual(cookieSave);
  });
});
