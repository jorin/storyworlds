import MapPoint from 'components/ui/map_point';
import React from 'react';
import { mount, shallow } from 'enzyme';

describe('<MapPoint />', () => {
  test('applies styles for pin', () => {
    const name = 'Map Location';
    const mapPoint = shallow(<MapPoint deepestTier={4} name={name} tier={3} />);
    const mapPin = mapPoint.find('.map-point');

    expect(mapPin.prop('style')).toHaveProperty('fontSize', '0.875rem');
    expect(mapPin.prop('style')).toHaveProperty('marginTop', '-0.25rem');
    expect(mapPin.prop('style')).toHaveProperty('opacity', 0.625);
    expect(mapPin.hasClass('map-pin')).toBe(true);
    expect(mapPin.text()).toBe(name);
  });

  test('applies styles for area', () => {
    const name = 'Map Area';
    const mapPoint = shallow(<MapPoint deepestTier={4} isArea name={name} tier={0} />);
    const mapArea = mapPoint.find('.map-point');

    expect(mapArea.prop('style')).toHaveProperty('fontSize', '1.25rem');
    expect(mapArea.prop('style')).toHaveProperty('marginTop', '-1rem');
    expect(mapArea.prop('style')).toHaveProperty('opacity', 1);
    expect(mapArea.hasClass('map-pin')).toBe(false);
    expect(mapArea.text()).toBe(name);
  });

  test('formats name', () => {
    document.body.innerHTML = '<div id="#map"></div>';
    const name = 'Mapped';
    const mapName = mount(<MapPoint name={name} tier={0} />, { attachTo: document.querySelector('#map') }).find('.map-name');

    expect(mapName.prop('style')).toHaveProperty('marginLeft', -1*(mapName.getDOMNode().clientWidth/2.0));
  });
});
