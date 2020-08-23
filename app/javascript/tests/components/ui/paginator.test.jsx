import Paginator from 'components/ui/paginator';
import React from 'react';
import { shallow } from 'enzyme';

const factory = props => shallow(<Paginator {...Object.assign({ handlePage: () => null,
                                                                loadedCount: 5,
                                                                total: 20 }, props)} />);

describe('<Paginator />', () => {
  test('renders nothing if no items', () => expect(factory({ total: 0 }).html()).toBeFalsy());
  test('renders nothing if all items loaded', () => expect(factory({ total: 5 }).html()).toBeFalsy());
  test('applies className prop to root node', () => expect(factory({ className: 'apple' }).hasClass('apple')).toBe(true));

  test('load page click triggers handlePage prop', () => {
    let didPage = false;
    factory({ handlePage: () => didPage = true })
      .find('a')
      .simulate('click', { preventDefault: () => null });
    expect(didPage).toBe(true);
  });

  test('select page size triggers handlePerPageChange', () => {
    let perPage;
    factory({ handlePerPageChange: p => perPage = p })
      .find('.per-page-select')
      .simulate('change', { value: 10 });
    expect(perPage).toBe(10);
  });

  test('manual entry of page size triggers handlePerPageChange', () => {
    let perPage;
    factory({ handlePerPageChange: p => perPage = p })
      .find('.per-page-select')
      .prop('onInputChange')('25');
    expect(perPage).toBe(25);
  });
});
