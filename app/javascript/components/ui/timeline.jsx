import PropTypes from 'prop-types';
import React from 'react';
import FormatService from 'services/format_service';

const SPAN_COLOR_COUNT = 10;

const Timeline = ({ height, hoverRenderer, onClick, spans }) => {
  const yieldTimeline = () => {
    const allStarts = spans.map(({ starts }) => starts)
                           .filter(s => typeof s === 'number');
    const allEnds = spans.map(({ ends }) => ends)
                         .filter(e => typeof e === 'number');
    let earliest = allStarts.length ? Math.min(...allStarts) : undefined;
    let latest = allEnds.length ? Math.max(...allEnds) : undefined;

    // arbitrarily set finite bounds if not set by a span
    if (earliest === undefined) { earliest = (latest || 0) - 100; }
    if (latest === undefined) { latest = earliest + 100; }

    // calculate scaling factor based on desired height
    const scaleBy = height ? height/(latest - earliest) : 1;

    // format into yield lines 
    const sortedSpans = spans.slice(0).sort(FormatService.sortByTimeline);
    const yields = [];
    sortedSpans.forEach((span, spanIndex) => {
      let { starts, ends } = span;
      if (typeof starts !== 'number') { starts = earliest; }
      if (typeof ends !== 'number') { ends = latest; }

      const y = yields.find(({ latestInYield }) => starts >= latestInYield);
      const className = `timeline-span-color-${spanIndex % SPAN_COLOR_COUNT}`;
      const height = (ends - starts)*scaleBy;
      if (y) {
        const marginTop = (starts - y.latestInYield)*scaleBy;
        y.spans.push({ span, className, height, marginTop });
        y.latestInYield = ends;
      }
      else {
        yields.push({ spans: [{ span,
                                className,
                                height,
                                marginTop: (starts - earliest)*scaleBy }],
                      latestInYield: ends });
      }
    });

    return yields.map(({ spans }) => spans);
  };

  const renderSpans = (spanColumn, index) => {
    return (
      <div className='timeline-column float-left' key={`timeline-column-${index}`}>
        { spanColumn.map(({ span, className, height, marginTop },
                         index) => <div className={`timeline-span small ${onClick ? 'clickable' : ''} ${className}`}
                                        key={`timeline-span-${index}`}
                                        onClick={e => onClick && onClick(span, e)}
                                        onMouseLeave={e => onClick && onClick(null)}
                                        style={{ height, marginTop }}>
                                     { hoverRenderer &&
                                         <div className='timeline-hover'>
                                          <div className='timeline-hover-content'>
                                            {hoverRenderer(span)}
                                          </div>
                                         </div> }
                                   </div>) }
      </div>
    );
  };

  return (
    <div className='timeline-container'>
      <div className='clearfix'>
        {yieldTimeline().map(renderSpans)}
      </div>
    </div>
  );
};

export default Timeline;

Timeline.propTypes = {
  height: PropTypes.number,
  hoverRenderer: PropTypes.func,
  onClick: PropTypes.func,
  spans: PropTypes.array.isRequired,
};
