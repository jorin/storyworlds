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
};

export default FormatService;
