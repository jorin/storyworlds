import React from 'react';
import { shallow } from 'enzyme';
import Async from 'react-select/async';
import TagsEditor from 'components/ui/tags_editor';

const factory = props => shallow(<TagsEditor {...Object.assign({ handleUpdateTaggings: () => null,
                                                                 tagsPath: '/world/abc/tags' },
                                                               props)} />);

const appleTagMatches = [{ name: 'Apple', slug: 'apple' }, { name: 'Pineapple', slug: 'pineapple' }]
const appleTagMatchOptions = appleTagMatches.map(t => ({ label: t.name, value: t }));
global.$ = { ajax: params => ({ done: callback => callback({ tags: { '': 'BAD CALL',
                                                                     apple: appleTagMatches }[params.data.search] || [] }) }) };

describe('<TagsEditor />', ()=> {
  test('renders side-by-side input and badges by default', () => {
    const editor = factory();

    expect(editor.children('.row').children('.col-md-4').exists()).toBe(true);
    expect(editor.children('.row').children('.col-md-8').exists()).toBe(true);
  });

  test('renders stacked input and badges by prop', () => {
    const editor = factory({ stacked: true });

    expect(editor.children('.row').children('.col-12').length).toBe(2);
  });

  test('renders non-destroyed taggings as badges', () => {
    const taggings = [{ _destroy: true, tag: { name: 'Apple', slug: 'apple' } },
                      { tag: { name: 'Banana', slug: 'banana' } }];
    const badges = factory({ taggings }).find('.badge');

    expect(badges.length).toBe(1);
    expect(badges.first().text()).toBe('Banana | ×');
  });

  test('marks removed tag as destroyed to parent when persisted', () => {
    const tagging = { id: 100, tag: { name: 'Apple', slug: 'apple' } };
    let taggings = [tagging];
    factory({ handleUpdateTaggings: t => taggings = t, taggings })
      .find('.badge a').simulate('click', { preventDefault: () => null });

    expect(taggings).toEqual([Object.assign({ _destroy: true }, tagging)]);
  });

  test('removes tag to parent when not persisted', () => {
    const tagging = { tag: { name: 'Apple', slug: 'apple' } };
    let taggings = [tagging];
    factory({ handleUpdateTaggings: t => taggings = t, taggings })
      .find('.badge a').simulate('click', { preventDefault: () => null });

    expect(taggings).toEqual([]);
  });

  test('loads matching options without add new when existing exact match', () => {
    const editor = factory();
    let options;
    editor.find(Async).first().prop('loadOptions')('apple', o => options = o);

    expect(options).toEqual(appleTagMatchOptions);
  });

  test('loads with add new when new already added', () => {
    const editor = factory();
    let options;
    editor.find(Async).first().prop('loadOptions')('Cranapple', o => options = o);

    expect(options).toEqual([{ label: 'Add tag \'Cranapple\'', value: { name: 'Cranapple', slug: 'cranapple' } }]);
  });

  test('loads without add new when new already added', () => {
    const editor = factory({ taggings: [{ tag: { name: 'Cranapple', slug: 'cranapple' } }] });
    let options;
    editor.find(Async).first().prop('loadOptions')('Cranapple', o => options = o);

    expect(options).toEqual([]);
  });

  test('exclude an existing matching tag from options', () => {
    const editor = factory({ taggings: [{ tag: { name: 'Apple', slug: 'apple' } }] });
    let options;
    editor.find(Async).first().prop('loadOptions')('apple', o => options = o);

    expect(options).toEqual(appleTagMatchOptions.filter(({ label }) => label !== 'Apple'));
  });

  test('include an existing matching tag in options when it has been marked destroyed', () => {
    const editor = factory({ taggings: [{ _destroy: true, tag: { name: 'Apple', slug: 'apple' } }] });
    let options;
    editor.find(Async).first().prop('loadOptions')('apple', o => options = o);

    expect(options).toEqual(appleTagMatchOptions);
  });

  test('include an existing matching tag in options when it has been marked destroyed', () => {
    const editor = factory({ taggings: [{ _destroy: true, tag: { name: 'Apple', slug: 'apple' } }] });
    let options;
    editor.find(Async).first().prop('loadOptions')('apple', o => options = o);

    expect(options).toEqual(appleTagMatchOptions);
  });

  test('short circuit to empty options with empty search', () => {
    const editor = factory();
    let options;
    editor.find(Async).first().prop('loadOptions')('', o => options = o);

    expect(options).toEqual([]);
  });

  test('add a new tag on selection', () => {
    const tag = { name: 'Apple', slug: 'apple' };
    let taggings = [];
    factory({ handleUpdateTaggings: t => taggings = t, taggings })
      .find(Async).first().prop('onChange')({ value: tag });

    expect(taggings).toEqual([{ tag }]);
  });

  test('undestroy a destroyed tag on selection', () => {
    const tag = { name: 'Apple', slug: 'apple' };
    let taggings = [{ _destroy: true, tag }];
    factory({ handleUpdateTaggings: t => taggings = t, taggings })
      .find(Async).first().prop('onChange')({ value: tag });

    expect(taggings).toEqual([{ _destroy: false, tag }]);
  });
});
