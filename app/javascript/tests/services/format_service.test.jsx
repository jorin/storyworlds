import FormatService from 'services/format_service';

describe('slugify', () => {
  test('exits if not string', () => expect(FormatService.slugify(null)).toBeFalsy());
  test('doesn\'t transform existing slug', () => expect(FormatService.slugify('a-slug')).toBe('a-slug'));
  test('converts spaces to dashes', () => expect(FormatService.slugify('bee tag cee')).toBe('bee-tag-cee'));
  test('trims leading and trailing underscores', () => expect(FormatService.slugify('___dog-ear____')).toBe('dog-ear'));
  test('trims leading and trailing dashes', () => expect(FormatService.slugify('-----dog-ear--')).toBe('dog-ear'));
  test('trims spaces', () => expect(FormatService.slugify('   food going   here   ')).toBe('food-going-here'));
  test('collapses multiple spaces, dashes, underscores', () => expect(FormatService.slugify('indigo -  juniper---koala___melon_orange - pear')).toBe('indigo-juniper-koala_melon_orange-pear'));
  test('lowercases', () => expect(FormatService.slugify('Quite REGAL-SandwicH')).toBe('quite-regal-sandwich'));
});

describe('sortByTimeline', () => {
  const t1 = {}, t2 = { ends: 250 }, t3 = { ends: 300 }, t4 = { starts: 150 }, t5 = { starts: 200, ends: 250 },
        t6 = { starts: 250 }, t7 = { starts: 300, ends: 350 }, t8 = { starts: 320, ends: 340 };
  
  test('sorts timeline for disordered objects',
       () => expect([t3, t8, t2, t6, t1, t4, t7, t5]
                    .sort(FormatService.sortByTimeline))
               .toEqual([t1, t2, t3, t4, t5, t6, t7, t8]));
  
  test('sorts timeline to same order for ordered objects',
       () => expect([t1, t2, t3, t4, t5, t6, t7, t8]
                    .sort(FormatService.sortByTimeline))
               .toEqual([t1, t2, t3, t4, t5, t6, t7, t8]));
});

describe('timelineEntryToValue', () => {
  test('no entry', () => expect(FormatService.timelineEntryToValue(null)).toBeFalsy());

  test('parses via moment when no custom timeline',
       () => expect(FormatService.timelineEntryToValue('6/15/1974 7:04am')).toBe(140529840));

  const timelineUnits = '18:20';
  test('converts to custom timeline timestamp',
       () => expect(FormatService.timelineEntryToValue('15/12/290 3:33p', timelineUnits))
               .toBe(150755973));
  test('converts to custom timeline timestamp when negative year',
       () => expect(FormatService.timelineEntryToValue('1/5/-100 11:02pm', timelineUnits))
               .toBe(-51832858));
});

describe('timelineValueToDisplay', () => {
  test('no value', () => expect(FormatService.timelineValueToDisplay(null)).toBeFalsy());
  test('parses timestamp to display format',
       () => expect(FormatService.timelineValueToDisplay(223065120)).toBe('Jan 25 1977 12:32pm'));

  const timelineUnits = '19:19';
  test('converts custom timestamp to display',
       () => expect(FormatService.timelineValueToDisplay(2000001, timelineUnits)).toBe('year 3 17/2 9:21pm'));
  test('converts negative custom timestamp to display',
       () => expect(FormatService.timelineValueToDisplay(-4523336789, timelineUnits)).toBe('year -8702 12/7 9:31pm'));
});

describe('timelineValueToEntry', () => {
  test('parses timestamp to entry format',
       () => expect(FormatService.timelineValueToEntry(223065120)).toBe('01/25/1977 12:32 pm'));

  const timelineUnits = '19:19';
  test('converts custom timestamp to entry',
       () => expect(FormatService.timelineValueToEntry(2000001, timelineUnits)).toBe('17/2/3 9:21 pm'));
  test('converts negative custom timestamp to entry',
       () => expect(FormatService.timelineValueToEntry(-4523336789, timelineUnits)).toBe('12/7/-8702 9:31 pm'));
});
