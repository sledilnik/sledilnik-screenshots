const path = require('path');

CHART_BASE_URL = 'https://covid-19.sledilnik.org/embed.html#/chart/';
CARD_BASE_URL = 'https://covid-19.sledilnik.org/';

const elementHandleClick = async elementHandle => {
  await elementHandle.click();
};
const castToNumber = index => +index;

const loopAndShowTooltip = async (series, index, options) => {
  const selectorsArray = await Promise.all(
    series.map(async item => await item.$$(options.selector))
  );
  const filtered = selectorsArray.filter(item => item.length > options.length);

  if (filtered.length === 0) {
    throw new Error(
      `No filtered array. [series] length: ${
        series.length
      }, [index]: ${index}, [options]: ${options.toString()}`
    );
  }

  const buttons = filtered[0];
  if (buttons.length - 1 < index) {
    throw new Error(
      `Can not find index; array length: ${buttons.length}, [index]: ${index}`
    );
  }

  await elementHandleClick(buttons[index]);
  return buttons[index];
};

CHART = {
  IcuPatients: {
    name: 'IcuPatients',
    customChart: {
      twoMonthsTooltip: [
        ['highchartsSeries0Rect', castToNumber, elementHandleClick],
      ],
    },
  },
  Patients: {
    name: 'Patients',
    customChart: {
      twoMonthsTooltip: [
        ['highchartsSeries0Rect', castToNumber, elementHandleClick],
      ],
    },
  },
  MetricsComparison: {
    name: 'MetricsComparison',
  },
  DailyComparison: {
    name: 'DailyComparison',
    customChart: {
      casesConfirmedTooltip: [
        ['highchartsSeriesRect', castToNumber, elementHandleClick],
      ],
      casesActiveTooltip: [
        ['metrics', 1, elementHandleClick],
        ['highchartsSeriesRect', castToNumber, elementHandleClick],
      ],
      performedPCRTooltip: [
        ['metrics', 2, elementHandleClick],
        ['highchartsSeriesRect', castToNumber, elementHandleClick],
      ],
      sharePCRTooltip: [
        ['metrics', 3, elementHandleClick],
        ['highchartsSeriesRect', castToNumber, elementHandleClick],
      ],
    },
  },
  EuropeMap: {
    name: 'EuropeMap',
  },
  WorldMap: {
    name: 'WorldMap',
  },
  CarePatients: {
    name: 'CarePatients',
  },
  Ratios: {
    name: 'Ratios',
  },
  Tests: {
    name: 'Tests',
  },
  HCenters: {
    name: 'HCenters',
  },
  Cases: {
    name: 'Cases',
  },
  Spread: {
    name: 'Spread',
  },
  Infections: {
    name: 'Infections',
  },
  Regions: {
    name: 'Regions',
  },
  RegionMap: {
    name: 'RegionMap',
  },
  Map: {
    name: 'Map',
    customChart: {
      weeklyGrowth: [['display', 0, elementHandleClick]],
      absolute1Day: [
        ['display', 1, elementHandleClick],
        ['interval', 0, elementHandleClick],
      ],
      distribution1Day: [
        ['display', 3, elementHandleClick],
        ['interval', 0, elementHandleClick],
      ],
    },
  },
  Municipalities: {
    name: 'Municipalities',
  },
  SchoolStatus: {
    name: 'SchoolStatus',
  },
  AgeGroups: {
    name: 'AgeGroups',
  },
  AgeGroupsTimeline: {
    name: 'AgeGroupsTimeline',
    customChart: {
      twoMonthsNewCasesTooltip: [
        [
          'highchartsSeries',
          castToNumber,
          loopAndShowTooltip,
          {
            loop: true,
            length: 60,
            selector: 'rect',
            exit: true,
            func: elementHandleClick,
          },
        ],
      ],
    },
  },
};

CARD = {
  testsToday: { name: 'testsToday' },
  testsTodayHAT: { name: 'testsTodayHAT' },
  casesActive: { name: 'casesActive' },
  casesAvg7Days: { name: 'casesAvg7Days' },
  hospitalizedCurrent: { name: 'hospitalizedCurrent' },
  icuCurrent: { name: 'icuCurrent' },
  deceasedToDate: { name: 'deceasedToDate' },
  vaccinationSummary: { name: 'vaccinationSummary' },
};

MULTICARD = {
  LAB: {
    name: 'LAB',
    getSelector: type => `.cardtype-${type}`,
    include: [CARD.testsToday, CARD.testsTodayHAT, CARD.casesActive],
  },
  HOS: {
    name: 'HOS',
    getSelector: type => `.cardtype-${type}`,
    include: [CARD.hospitalizedCurrent, CARD.icuCurrent, CARD.deceasedToDate],
  },
  ALL: {
    name: 'ALL_CARDS',
    getSelector: type => `.cardtype-${type}`,
    include: Object.values(CARD),
  },
};

OPTIONS = {
  CARD: {
    viewport: { width: 325, height: 800 },
    getSelector: type => `.cardtype-${type} > .hp-card`,
    getUrl: () => CARD_BASE_URL,
  },
  CHART: {
    viewport: { width: 1200, height: 800 },
    getSelector: () => '.visualization.container.embeded > section',
    getUrl: type => `${CHART_BASE_URL}${type}`,
    selectorToRemove: '.metrics-selectors',
    getButtons: async element => ({
      interval: await element.$$(
        '.chart-data-interval-selector > .chart-display-property-selector__item'
      ),
      display: await element.$$(
        '.chart-display-property-selector > .chart-display-property-selector__item'
      ),
      highchartsSeries0Rect: await element.$$(
        '.highcharts-root > g.highcharts-series-group > .highcharts-series-0 > rect'
      ),
      metrics: await element.$$('.metrics-selectors > .metric-selector'),
      highchartsSeriesRect: await element.$$(
        '.highcharts-root > g.highcharts-series-group > .highcharts-series > rect'
      ),
      highchartsSeriesGroup: await element.$$(
        '.highcharts-root > g.highcharts-series-group'
      ),
      highchartsSeries: await element.$$(
        '.highcharts-root > g.highcharts-series-group g.highcharts-series'
      ),
      highchartsSeriesColumn: await element.$$(
        '.highcharts-root > g.highcharts-series-group .highcharts-column-series'
      ),
    }),
  },
  MULTICARD: {
    viewport: { width: 1000, height: 800 },
    getSelector: () => `.cards-wrapper`,
    getUrl: () => CARD_BASE_URL,
  },
};

module.exports = { OPTIONS, SCREENSHOTS: { CARD, CHART, MULTICARD } };
