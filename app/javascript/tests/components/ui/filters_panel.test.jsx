import React from 'react';
import { shallow } from 'enzyme';
import Async from 'react-select/async';
import FiltersPanel from 'components/ui/filters_panel';
import TimelineInput from 'components/ui/timeline_input';

const factory = props => shallow(<FiltersPanel {...Object.assign({ handleFiltersChange: () => null, tagsPath: '/tags' }, props)} />);

const sharedExamples = {
  hasFiltersHeader: panel => {
    expect(panel.hasClass('has-filters')).toBe(true);
    expect(panel.find('.filters-panel-header a').exists()).toBe(true);
  },
  hasNoFiltersHeader: panel => {
    expect(panel.hasClass('has-filters')).toBe(false);
    expect(panel.find('.filters-panel-header a').exists()).toBe(false);
  },
};

describe('<FiltersPanel />', () => {
  let tagsReturn;
  global.$ = { ajax: () => ({ done: f => f({ tags: tagsReturn }) }) };
  beforeEach(() => tagsReturn = [{ id: 100, name: 'Tag', slug: 'tag' }]);

  test('mounts closed when no initial filters', () => {
    const panel = factory();
    expect(panel.hasClass('open')).toBe(false);
    sharedExamples.hasNoFiltersHeader(panel);
  });

  test('mounts open when initial filters', () => {
    const panel = factory({ filters: { starts: 500 } });
    expect(panel.hasClass('open')).toBe(true);
    sharedExamples.hasFiltersHeader(panel);
  });

  test('loads tags to state when initial tags filters', () => {
    const panel = factory({ filters: { tagsInclude: [100] } });
    expect(panel.state().tags).toBe(tagsReturn);
  });

  test('opens and inputs filter values', () => {
    let filtersOutput;
    const panel = factory({ handleFiltersChange: filters => filtersOutput = filters });

    // open closed panel
    panel.find('.filters-panel-header').simulate('click');
    expect(panel.hasClass('open')).toBe(true);

    // enter a value
    const startsInput = panel.find(TimelineInput).first();
    startsInput.prop('onChange')(200);
    expect(filtersOutput).toBeFalsy();
    expect(panel.state().filters).toEqual({ starts: 200 });
    sharedExamples.hasFiltersHeader(panel);

    // blur the field and propagate change to parent
    startsInput.simulate('blur');
    expect(filtersOutput).toEqual({ starts: 200 });

    // enters remaining filters
    const endsInput = panel.find(TimelineInput).last();
    endsInput.prop('onChange')(500);
    endsInput.simulate('blur');
    const withinCheckbox = panel.find('.labeled-checkbox').first();
    expect(withinCheckbox.find('span').last().text()).toBe('Overlaps Range');
    withinCheckbox.simulate('click');
    expect(panel.find('.labeled-checkbox').first().find('span').last().text()).toBe('Within Range');
    expect(panel.state().filters).toEqual({ starts: 200, ends: 500, within: true });
    expect(filtersOutput).toEqual({ starts: 200, ends: 500, within: true });
  });

  test('removes key for a falsy value', () => {
    let filtersOutput = { starts: 200 };
    const panel = factory({ filters: filtersOutput,
                            handleFiltersChange: filters => filtersOutput = filters });

    const startsInput = panel.find(TimelineInput).first();
    startsInput.prop('onChange')(null);
    startsInput.simulate('blur');

    expect(filtersOutput).toEqual({});
  });

  test('clears filters', () => {
    let filtersOutput = { starts: 100, ends: 200, within: true  };
    const panel = factory({ filters: filtersOutput,
                            handleFiltersChange: filters => filtersOutput = filters });

    panel.find('.filters-panel-header a').simulate('click', { preventDefault: () => null,
                                                              stopPropagation: () => null });

    sharedExamples.hasNoFiltersHeader(panel);
    expect(panel.state().filters).toEqual({});
    expect(filtersOutput).toEqual({});
  });

  test('handles clears filters without an explicit click event', () => {
    let filtersOutput = { starts: 100  };
    const panel = factory({ filters: filtersOutput });

    panel.find('.filters-panel-header a').simulate('click');
    sharedExamples.hasNoFiltersHeader(panel);
  });

  test('clears tag filter on remove click', () => {
    tagsReturn.push({ id: 200, name: 'Tag2', slug: 'tag2' });
    let filtersOutput = { tagsExclude: [200], tagsInclude: [100] };
    const panel = factory({ filters: filtersOutput,
                            handleFiltersChange: filters => filtersOutput = filters });
    panel.find('.filters-panel-content .badge-secondary a').simulate('click', { preventDefault: () => null });
    panel.find('.filters-panel-content .badge-dark a').simulate('click', { preventDefault: () => null });

    expect(panel.state().filters).toEqual({ tagsExclude: [],  tagsInclude: [] });
    expect(filtersOutput).toEqual({ tagsExclude: [], tagsInclude: [] });
  });

  test('searches for tag as a filter, exluding existing filters', () => {
    let filtersOutput, options;
    const tag2 = { id: 200, name: 'Tag2', slug: 'tag2' };
    const panel = factory({ filters: { tagsInclude: [100] },
                            handleFiltersChange: filters => filtersOutput = filters });
    tagsReturn = tagsReturn.slice(0).concat(tag2);
    panel.find(Async).first().prop('loadOptions')('tag', o => options = o);

    expect(options).toEqual([{ label: tag2.name, value: tag2 }]);
  });

  test('short circuit to empty options with empty search', () => {
    const panel = factory();
    let options;
    panel.find(Async).first().prop('loadOptions')('', o => options = o);

    expect(options).toEqual([]);
  });

  test('adds tag filter on selection', () => {
    let filtersOutput;
    const tag = { id: 100, name: 'Tag', slug: 'tag' };
    const tag2 = { id: 200, name: 'Tag2', slug: 'tag2' };
    const panel = factory({ handleFiltersChange: filters => filtersOutput = filters });
    panel.find(Async).first().prop('onChange')({ value: tag });
    panel.find('.tags-filters').find('.labeled-checkbox').first().simulate('click');
    panel.find(Async).first().prop('onChange')({ value: tag2 });

    expect(panel.state().tags).toEqual([tag, tag2]);
    expect(panel.state().filters).toEqual({ tagsExclude: [tag2.id], tagsInclude: [tag.id] });
    expect(filtersOutput).toEqual({ tagsExclude: [tag2.id], tagsInclude: [tag.id] });
  });

  test('tags checkboxes are toggle-able', () => {
    let filtersOutput;
    const panel = factory({ handleFiltersChange: filters => filtersOutput = filters });
    const tagsFilters = panel.find('.tags-filters');
    tagsFilters.find('.labeled-checkbox').first().simulate('click');
    tagsFilters.find('.labeled-checkbox').last().simulate('click');

    expect(panel.state().exclude).toBe(true);
    expect(panel.state().filters).toEqual({ tagsAnd: true });
    expect(filtersOutput).toEqual({ tagsAnd: true });
  });

  test('renders included and excluded tag filters', () => {
    tagsReturn.push({ id: 200, name: 'Tag2', slug: 'tag2' });
    const tagFilters = factory({ filters: { tagsExclude: [200], tagsInclude: [100] } })
                         .find('.tags-filters');

    expect(tagFilters.find('.badge-secondary').length).toBe(1);
    expect(tagFilters.find('.badge-dark').length).toBe(1);
  });
});
