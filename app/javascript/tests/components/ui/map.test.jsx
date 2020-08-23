import Map from 'components/ui/map';
import React from 'react';
import { mount, shallow } from 'enzyme';
import MapPoint from 'components/ui/map_point';

const locations = [
  { coordinateX: -5, coordinateY: -8, id: 1, name: 'Apple' },
  { coordinateX: -2, coordinateY: 10, id: 2, name: 'Banana' },
  { coordinateX: 4, coordinateY: -6, id: 3, name: 'Cranberry' },
  { ancestors: [{ id: 6 }], coordinateX: 5, coordinateY: 5, id: 4, name: 'Dough', parent: { id: 6 } },
  { id: 5, name: 'Egg' },
  { contains: [{ id: 4 }], coordinateX: 6, coordinateY: 4, id: 6, name: 'French Fry' },
];
const factory = (props = { locations }) => shallow(<Map {...props} />);

const sharedExamples = {
  initialBounds: map => expect(map.state('bounds')).toEqual({ e: 6.133, n: 10.1, s: -8.1, w: -5.133 }),
};

describe('<Map />', () => {
  test('applies class to map', () => expect(factory({ className: 'added-class', locations }).find('.map-container')
                                                                                            .hasClass('added-class')).toBe(true));

  test('maps mappable locations', () => {
    const mapPoints = factory().find(MapPoint);

    expect(mapPoints.length).toBe(5);
    expect(mapPoints.map(p => p.prop('isArea')).filter(Boolean).length).toBe(1);
  });

  test('map bounds', () => {
    const map = factory();

    sharedExamples.initialBounds(map);
  });

  test('zooming', () => {
    const map = factory();

    map.find('.map-zoom-out').simulate('click', { preventDefault: () => null });
    expect(map.state('bounds')).toEqual({ e: 56.83, n: 92, s: -90, w: -55.83 });

    map.find('.map-zoom-in').simulate('click', { preventDefault: () => null });
    expect(map.state('bounds')).toEqual({ e: 6.133, n: 10.1, s: -8.1, w: -5.133 });
  });

  test('drag map', () => {
    const map = mount(<Map locations={locations} />);
    const mapArea = map.find('.map');
    const grabPoint = { clientX: 100, clientY: 100 };
    const movePoint = { clientX: 200, clientY: 166 };

    sharedExamples.initialBounds(map);

    mapArea.simulate('mouseDown', grabPoint);
    expect(map.state('grabAnchor')).toEqual(Object.assign({ height: 18.2, width: 11.266, x: 0.5, y: 1 }, grabPoint));

    map.instance().map = { clientHeight: 1000, clientWidth: 1000 };
    map.instance().handleMouseMove(movePoint);
    expect(map.state('bounds')).toEqual({ e: 5.0064, n: 11.3012, s: -6.8988, w: -6.2596 });

    mapArea.simulate('mouseUp');
    expect(map.state('grabAnchor')).toBeFalsy();
  });

  test('click legend', () => {
    const map = factory();
    
    map.find('.legend-location-1 > a').simulate('click', { preventDefault: () => null });
    expect(map.state('target')).toEqual({ x: -5, y: -8 });

    while (map.state('target')) { map.instance().moveBounds(); }
    const { e, n, s, w } = map.state('bounds');
    expect(e).toBeCloseTo(0.924, 2);
    expect(n).toBeCloseTo(1.576, 2);
    expect(s).toBeCloseTo(-16.62, 2);
    expect(w).toBeCloseTo(-10.34, 2);
  });
});
