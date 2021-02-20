import PropTypes from 'prop-types';
import React from 'react';
import MapPoint from './map_point';
import 'styles/ui/map';

export const mappableLocations = locations => locations.filter(({ coordinateX, coordinateY }) => typeof coordinateX === 'number' && typeof coordinateY === 'number');

export default class Map extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      bounds: this.initialBounds(),
    };
  };

  handleGrabMap = ({ clientX, clientY }) => {
    const { bounds: { e, n, s, w } } = this.state;
    clearInterval(this.moveInterval);
    this.setState({ grabAnchor: { clientX, clientY,
                                  height: Math.abs(n - s),
                                  width: Math.abs(e - w),
                                  x: (e + w)/2.0, y: (n + s)/2.0 } });
    document.addEventListener('mousemove', this.handleMouseMove);
  };
  handleMouseMove = ({ clientX, clientY }) => this.setState(({ grabAnchor, grabAnchor: { height, width, x, y } }) => {
    const deltaX = width*(grabAnchor.clientX - clientX)/this.map.clientWidth;
    const deltaY = -1.0*height*(grabAnchor.clientY - clientY)/this.map.clientHeight;

    return { bounds: { e: x + deltaX + width/2.0, n: y + deltaY + height/2.0, s: y + deltaY - height/2.0, w: x + deltaX - width/2.0 } };
  });
  handleReleaseMap = () => {
    this.setState({ grabAnchor: null });
    document.removeEventListener('mousemove', this.handleMouseMove);
  };
  handleZoomIn = e => { e.preventDefault(); this.zoomBounds(b => b*0.1); };
  handleZoomOut = e => { e.preventDefault(); this.zoomBounds(b => b*10); };

  centerTo = (x, y) => this.setState({ target: { x, y } }, () => this.moveInterval = setInterval(this.moveBounds));

  // find the bounds of the map according to the mapped items, and slightly extend edges
  initialBounds = () => {
    const bounds = mappableLocations(this.props.locations).reduce((bounds, { coordinateX, coordinateY }) => {
      const { e, n, s, w } = bounds;

      (typeof e !== 'number' || coordinateX > e) && Object.assign(bounds, { e: coordinateX });
      (typeof n !== 'number' || coordinateY > n) && Object.assign(bounds, { n: coordinateY });
      (typeof s !== 'number' || coordinateY < s) && Object.assign(bounds, { s: coordinateY });
      (typeof w !== 'number' || coordinateX < w) && Object.assign(bounds, { w: coordinateX });

      return bounds;
    }, {});
    const buffer = parseFloat(`1e${Math.max(...Object.values(bounds).map(b => Math.ceil(Math.abs(b)))).toString().length - 3}`);
    bounds.e += buffer*1.33;
    bounds.n += buffer;
    bounds.s -= buffer;
    bounds.w -= buffer*1.33;

    return bounds;
  };

  moveBounds = () => this.setState(({ bounds: { e, n, s, w }, target: { x, y } }) => {
    const centerX = (w + e)/2, centerY = (n + s)/2;
    const deltaX = (x - centerX)/25, deltaY = (y - centerY)/25;
    const bounds = { e: e + deltaX, n: n + deltaY, s: s + deltaY, w: w + deltaX };
    const update = { bounds };
    // near is considered with 10% of the map center
    const nearX = Math.abs(((x - bounds.w)/(bounds.e - x)) - 1) < 0.1;
    const nearY = Math.abs(((y - bounds.s)/(bounds.n - y)) - 1) < 0.1;
    if (nearX && nearY) {
      update.target = null;
      clearInterval(this.moveInterval);
    }

    return update;
  });

  zoomBounds = f => this.setState(({ bounds: { e, n, s, w } }) => {
    const fX = typeof f === 'function' ? f : f.x;
    const fY = typeof f === 'function' ? f : f.y;
    const x = (e + w)/2.0;
    const y = (n + s)/2.0;
    const deltaX = fX(Math.abs((e - w)/2.0));
    const deltaY = fY(Math.abs((n - s)/2.0));

    return { bounds: { e: x + deltaX, n: y + deltaY, s: y - deltaY, w: x - deltaX } };
  });

  // recursively render hierarchy of locations currently loaded
  renderMapLegend() {
    const locations = mappableLocations(this.props.locations);

    // build list of locations under a parent id,
    // or to a top level list (parentId === null) if the parent is not loaded or mapped
    const renderLocationList = parentId => (
      <ul key={`location-list-${parentId}`}>
        { locations.filter(({ parent }) => ((parent && parent.id) === parentId) ||
                                            (!parentId && !locations.some(({ id }) => id === (parent && parent.id))))
                   .map(({ coordinateX, coordinateY,
                           id, name }) => <li className={`legend-location-${id}`} key={`location-${id}`}>
                                            <a href='#' onClick={e => { e.preventDefault(); this.centerTo(coordinateX, coordinateY); }}>{name}</a>
                                            {renderLocationList(id)}
                                          </li>) }
      </ul>
    );

    return renderLocationList(null);
  };

  render() {
    const { className, locations } = this.props;
    const { bounds: { e, n, s, w }, grabAnchor } = this.state;
    const mapLocations = mappableLocations(locations);

    // calculate map data for each mappable location
    const numberMapped = locations => (locations || []).filter(({ id }) => mapLocations.findIndex(l => l.id === id) !== -1).length;
    const mappedLocations = mapLocations.map(({ ancestors, contains, coordinateX, coordinateY, id, name }) => ({
      id,
      isArea: !!numberMapped(contains),
      name,
      position: {
        left: `${(w - coordinateX)/(w - e)*100.0}%`,
        top: `${(n - coordinateY)/(n - s)*100.0}%`,
      },
      tier: numberMapped(ancestors),
    }));
    const deepestTier = Math.max(...mappedLocations.map(({ tier }) => tier));

    // create correct aspect ratio for map according to bounds w padding top trick
    const paddingTop = `${Math.abs((n - s)/(w - e))*100.0}%`;
    return (
      <div className={`map-container mb-3 ${className}`}>
        <div className='row'>
          <div className='col-lg-9'>
            <div className={`map overflow-hidden position-relative ${grabAnchor ? 'grabbed' : ''}`}
                 onMouseDown={this.handleGrabMap}
                 onMouseUp={this.handleReleaseMap}
                 onMouseLeave={this.handleReleaseMap}
                 ref={map => this.map = map}
                 style={{ paddingTop }}>
              <div className='position-absolute p-1 small text-dark-cerulean' style={{ right: 0, top: '50%' }}>{e.toPrecision(6)}</div>
              <div className='position-absolute p-1 small text-center text-dark-cerulean' style={{ left: '50%', top: 0, marginLeft: -50, width: 100 }}>{n.toPrecision(6)}</div>
              <div className='position-absolute p-1 small text-center text-dark-cerulean' style={{ left: '50%', bottom: 0, marginLeft: -50, width: 100 }}>{s.toPrecision(6)}</div>
              <div className='position-absolute p-1 small text-dark-cerulean' style={{ left: 0, top: '50%' }}>{w.toPrecision(6)}</div>
              {mappedLocations.map(l => <MapPoint deepestTier={deepestTier} key={`location-${l.id}`} {...l} />)}
              <div className='map-controls position-absolute'>
                <a href='#' className='map-zoom-in' onClick={this.handleZoomIn} />
                <a href='#' className='map-zoom-out' onClick={this.handleZoomOut} />
              </div>
            </div>
          </div>
          <div className='col-lg-3 map-legend mt-3 mt-lg-0 small'>{this.renderMapLegend()}</div>
        </div>
      </div>
    );
  };
};

Map.defaultProps = {
  className: '',
};

Map.propTypes = {
  className: PropTypes.string,
  locations: PropTypes.array.isRequired,
};
