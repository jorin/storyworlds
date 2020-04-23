import React from 'react';
import { shallow } from 'enzyme';
import FiltersPanel from 'components/ui/filters_panel';
import TimelineInput from 'components/ui/timeline_input';

const factory = props => shallow(<FiltersPanel {...Object.assign({ handleFiltersChange: () => null }, props)} />);

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
});
