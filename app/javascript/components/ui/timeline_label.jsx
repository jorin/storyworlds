import PropTypes from 'prop-types';
import React from 'react';
import FormatService from 'services/format_service';

const TimelineLabel = ({ ends, starts, timelineUnits }) => {
  window.FormatService =FormatService;
  return (typeof starts === 'number' ||
          typeof ends === 'number') && (
    <div>
      <div>{FormatService.timelineValueToDisplay(starts, timelineUnits)}</div>
      <div>↓</div>
      <div>{FormatService.timelineValueToDisplay(ends, timelineUnits)}</div>
    </div>
  );
};

export default TimelineLabel;

TimelineLabel.propTypes = {
  ends: PropTypes.number,
  starts: PropTypes.number,
  timelineUnits: PropTypes.string
};
