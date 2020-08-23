import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';

const MapPoint = ({ deepestTier, id, isArea, name, position, tier }) => {
  const [nameDiv, setNameDiv] = useState(null);
  const [nameWidth, setNameWidth] = useState(0);

  useEffect(() => {
    nameDiv && setNameWidth(nameDiv.offsetWidth);
  }, [nameDiv]);

  const tierFactor = deepestTier - tier;
  const style = Object.assign({
    fontSize: `${(1 - deepestTier*0.0625) + (tierFactor*0.125)}rem`,
    marginTop: `${-0.25*tierFactor}rem`,
    opacity: 1 - 0.5*(tier/(deepestTier || 1)),
  }, position);

  return (
    <div className={`map-point position-absolute ${isArea ? '' : 'map-pin'}`} style={style}>
      <div className='map-name position-absolute text-nowrap' ref={setNameDiv} style={{ marginLeft: (nameWidth)/-2.0 }}>{name}</div>
    </div>
  );
};

export default MapPoint;
