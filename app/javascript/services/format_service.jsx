import moment from 'moment';
import { STANDARD_TIMELINE_DISPLAY_FORMAT, STANDARD_TIMELINE_PARSE_FORMAT } from 'constants/timeline';

const MINUTES_PER_DAY = 24 * 60;

const FormatService = {
  slugify: str => {
    if (!str) { return; }

    return str.replace(/[^\w\s\-]+/g, '')
              .trim()
              .replace(/\s+/g, '-')
              .replace(/_+/g, '_')
              .replace(/\-+/g, '-')
              .replace(/^(_|\-)+/g, '')
              .replace(/(_|\-)+$/g, '')
              .toLowerCase();
  },

  sortByTimeline: (a, b) => {
    const aHasStart = typeof a.starts === 'number';
    const bHasStart = typeof b.starts === 'number';
    const aHasEnd = typeof a.ends === 'number';
    const bHasEnd = typeof b.ends === 'number';

    if (aHasStart && bHasStart) { return a.starts > b.starts ? 1 : -1; }
    else if (aHasStart && !bHasStart) { return 1; }
    else if (!aHasStart && bHasStart) { return -1; }
    else if (aHasEnd && !bHasEnd) { return 1; }
    else if (!aHasEnd && bHasEnd) { return -1; }
    else { return a.ends > b.ends ? 1 : -1; }
  },

  timelineEntryToValue: (entry, timelineUnits) => {
    if (!entry) { return; }

    const conversion = FormatService._timelineConversion(timelineUnits);

    if (conversion) {
      const { daysInMonth, monthsInYear } = conversion;
      let value = 0;
      const dateTime = entry.replace(/\s+/g, ' ').trim().split(' ');
      const date = dateTime[0].split('/');

      // add value from date entry
      const month = parseInt(date[0], 10);
      if (!isNaN(month)) { value += ((month-1)*daysInMonth*MINUTES_PER_DAY); }
      const day = date[1] && parseInt(date[1], 10);
      if (!isNaN(day)) { value += ((day-1)*MINUTES_PER_DAY); }
      const year = date[2] && parseInt(date[2], 10);
      if (!isNaN(year)) { value += (year*monthsInYear*daysInMonth*MINUTES_PER_DAY); }

      // add value from time entry
      const time = dateTime[1] && dateTime[1].split(':');
      if (time) {
        const hour = parseInt(time[0], 10);
        if (!isNaN(hour)) {
          const isPost = entry.toLowerCase().indexOf('p') !== -1;
          // 12 is actually 0
          value += ((hour === 12 ? 0 : hour) + (isPost ? 12 : 0))*60;
        }
        const minute = time[1] && parseInt(time[1]);
        if (!isNaN(minute)) { value += minute; }
      }

      return value;
    } else { return moment(entry, STANDARD_TIMELINE_PARSE_FORMAT).unix(); }
  },

  timelineValueToDisplay: (timestamp, timelineUnits) => {
    if (typeof timestamp !== 'number') { return ''; }

    const conversion = FormatService._timelineConversion(timelineUnits);

    if (conversion) {
      const { year, month, day, hour, minute, meridian } = FormatService._timelineConvertToSplits(timestamp, conversion);

      return `year ${year} ${month}/${day} ${hour}:${ minute < 10 ? '0' : '' }${minute}${meridian}`;
    } else { return moment.unix(timestamp).format(STANDARD_TIMELINE_DISPLAY_FORMAT); }
  },

  timelineValueToEntry: (timestamp, timelineUnits) => {
    const conversion = FormatService._timelineConversion(timelineUnits);

    if (conversion) {
      const { year, month, day, hour, minute, meridian } = FormatService._timelineConvertToSplits(timestamp, conversion);

      return `${month}/${day}/${year} ${hour}:${ minute < 10 ? '0' : '' }${minute} ${meridian}`;
    } else { return moment.unix(timestamp).format(STANDARD_TIMELINE_PARSE_FORMAT); }
  },

  _timelineConversion: timelineUnits => {
    if (typeof timelineUnits !== 'string') { return; }

    const conversion = timelineUnits.split(':');
    return conversion.length === 2 && { monthsInYear: conversion[0], daysInMonth: conversion[1] };
  },

  _timelineConvertToSplits: (minute, { daysInMonth, monthsInYear }) => {
    const isNegative = minute < 0;

    const yearConversion = monthsInYear*daysInMonth*MINUTES_PER_DAY;
    const yearOffset = isNegative && (Math.floor((-1*minute)/yearConversion) + 1);
    if (isNegative) { minute += (yearOffset*yearConversion); }
    const year = Math.floor(minute/yearConversion);
    minute -= (year*yearConversion);

    const monthConversion = daysInMonth*MINUTES_PER_DAY;
    const month = Math.floor(minute/monthConversion);
    minute -= (month*monthConversion);

    const day = Math.floor(minute/MINUTES_PER_DAY);
    minute -= day*MINUTES_PER_DAY;

    let hour = Math.floor(minute/60);
    minute -= (hour*60);

    const meridian = hour > 11 ? 'pm' : 'am';
    if (hour > 11) { hour -= 12; }
    if (!hour) { hour = 12; }

    return { year: isNegative ? -1*yearOffset : year, month: month + 1, day: day + 1, hour, minute, meridian };
  },
};

window.moment = moment;
window.fs = FormatService;
export default FormatService;
