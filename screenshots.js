const path = require('path');

CHART_BASE_URL = 'https://covid-19.sledilnik.org/embed.html#/chart/';
CARD_BASE_URL = 'https://covid-19.sledilnik.org/';

const elementHandleClick = async elementHandle => {
  await elementHandle.click();
};

const elementHandleSelect = async (elementHandle, value) => {
  await elementHandle.select(value);
};

const castToNumber = index => +index;

const findByNameShowTooltip = async (series, name, options) => {
  if (!series) {
    throw new Error(`Argument [series] is: ${series}!`);
  }

  if (series.length === 0) {
    throw Error(`Argument [series] is empty Array!`);
  }

  const selector = options.getSelector(name);
  const button = await series[0].$(selector);
  if (button) {
    await button.click();
    return button;
  }

  throw new Error(`Element with selector: ${selector} doesn't exist!`);
};

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

const mapMunicipalitiesTooltip = [
  'highchartsSeriesGFirstChild',
  value => value,
  findByNameShowTooltip,
  {
    loop: true,
    getSelector: name => `.highcharts-name-${name}`,
    exit: true,
    func: elementHandleClick,
  },
];

const filterSelectValue = value => [
  'filterSelect',
  0,
  elementHandleSelect,
  { funcArgs: [value] },
];

CHART = {
  MetricsComparison: {
    name: 'MetricsComparison',
    customChart: {
      casesConfirmedFourMonths: [
        ['metrics', 11, elementHandleClick],
        ['metrics', 1, elementHandleClick],
        ['range', 1, elementHandleClick],
      ],
    },
  },
  DailyComparison: {
    name: 'DailyComparison',
    customChart: {
      casesConfirmed: [],
      casesConfirmedTooltip: [
        ['highchartsSeriesRect', castToNumber, elementHandleClick],
      ],
      casesActive: [['metrics', 1, elementHandleClick]],
      casesActiveTooltip: [
        ['metrics', 1, elementHandleClick],
        ['highchartsSeriesRect', castToNumber, elementHandleClick],
      ],
      performedPCR: [['metrics', 2, elementHandleClick]],
      performedPCRTooltip: [
        ['metrics', 2, elementHandleClick],
        ['highchartsSeriesRect', castToNumber, elementHandleClick],
      ],
      sharePCR: [['metrics', 3, elementHandleClick]],
      sharePCRTooltip: [
        ['metrics', 3, elementHandleClick],
        ['highchartsSeriesRect', castToNumber, elementHandleClick],
      ],
      testsHAT: [['metrics', 4, elementHandleClick]],
      testsHATTooltip: [
        ['metrics', 4, elementHandleClick],
        ['highchartsSeriesRect', castToNumber, elementHandleClick],
      ],
      vaccinesUsed: [['metrics', 5, elementHandleClick]],
      vaccinesUsedTooltip: [
        ['metrics', 5, elementHandleClick],
        ['highchartsSeriesRect', castToNumber, elementHandleClick],
      ],
      admittedHospitalsTooltip: [
        ['metrics', 6, elementHandleClick],
        ['highchartsSeriesRect', castToNumber, elementHandleClick],
      ],
      dischargedHospitalsTooltip: [
        ['metrics', 7, elementHandleClick],
        ['highchartsSeriesRect', castToNumber, elementHandleClick],
      ],
      admittedICUTooltip: [
        ['metrics', 8, elementHandleClick],
        ['highchartsSeriesRect', castToNumber, elementHandleClick],
      ],
      deceasedTooltip: [
        ['metrics', 9, elementHandleClick],
        ['highchartsSeriesRect', castToNumber, elementHandleClick],
      ],
    },
  },
  Tests: {
    name: 'Tests',
  },
  Vaccination: {
    name: 'Vaccination',
  },
  Regions100k: {
    name: 'Regions100k',
    customChart: {
      casesConfirmed7DayAvg: [filterSelectValue('ViewConfirmed')],
      casesConfirmedActive: [
        filterSelectValue('ViewConfirmed'),
        ['display', 1, elementHandleClick],
      ],
      casesConfirmedAll: [
        filterSelectValue('ViewConfirmed'),
        ['display', 2, elementHandleClick],
      ],
      vaccinated7DayAvg: [filterSelectValue('ViewVaccinated')],

      vaccinatedDose1: [
        filterSelectValue('ViewVaccinated'),
        ['display', 1, elementHandleClick],
      ],
      vaccinatedDose2: [
        filterSelectValue('ViewVaccinated'),
        ['display', 2, elementHandleClick],
      ],
      deceased: [filterSelectValue('ViewDeceased')],
    },
  },
  Map: {
    name: 'Map',
    customChart: {
      weeklyGrowth: [['display', 0, elementHandleClick]],
      weeklyGrowthTooltip: [
        ['display', 0, elementHandleClick],
        mapMunicipalitiesTooltip,
      ],
      absolute1Day: [
        ['display', 1, elementHandleClick],
        ['interval', 0, elementHandleClick],
      ],
      absolute1DayTooltip: [
        ['display', 1, elementHandleClick],
        ['interval', 0, elementHandleClick],
        mapMunicipalitiesTooltip,
      ],
      absolute7Days: [
        ['display', 1, elementHandleClick],
        ['interval', 1, elementHandleClick],
      ],
      absolute7DaysTooltip: [
        ['display', 1, elementHandleClick],
        ['interval', 1, elementHandleClick],
        mapMunicipalitiesTooltip,
      ],
      distribution1Day: [
        ['display', 3, elementHandleClick],
        ['interval', 0, elementHandleClick],
      ],
      distribution1DayTooltip: [
        ['display', 3, elementHandleClick],
        ['interval', 0, elementHandleClick],
        mapMunicipalitiesTooltip,
      ],
      distribution7Days: [
        ['display', 3, elementHandleClick],
        ['interval', 1, elementHandleClick],
      ],
      distribution7DaysTooltip: [
        ['display', 3, elementHandleClick],
        ['interval', 1, elementHandleClick],
        mapMunicipalitiesTooltip,
      ],
      populationShare1Day: [
        ['display', 2, elementHandleClick],
        ['interval', 0, elementHandleClick],
      ],
      populationShare1DayTooltip: [
        ['display', 2, elementHandleClick],
        ['interval', 0, elementHandleClick],
        mapMunicipalitiesTooltip,
      ],
      populationShare7Days: [
        ['display', 2, elementHandleClick],
        ['interval', 1, elementHandleClick],
      ],
      populationShare7DaysTooltip: [
        ['display', 2, elementHandleClick],
        ['interval', 1, elementHandleClick],
        mapMunicipalitiesTooltip,
      ],
      vaccinated1stPopulationShare: [filterSelectValue('Vaccinated1st')],
      vaccinated1stAbsolute: [
        filterSelectValue('Vaccinated1st'),
        ['display', 0, elementHandleClick],
      ],
      vaccinated1stPopulationShareTooltip: [
        filterSelectValue('Vaccinated1st'),
        mapMunicipalitiesTooltip,
      ],
      vaccinated1stAbsoluteTooltip: [
        filterSelectValue('Vaccinated1st'),
        ['display', 0, elementHandleClick],
        mapMunicipalitiesTooltip,
      ],
      vaccinated2ndPopulationShare: [filterSelectValue('Vaccinated2nd')],
      vaccinated2ndAbsolute: [
        filterSelectValue('Vaccinated2nd'),
        ['display', 0, elementHandleClick],
      ],
      vaccinated2ndPopulationShareTooltip: [
        filterSelectValue('Vaccinated2nd'),
        mapMunicipalitiesTooltip,
      ],
      vaccinated2ndAbsoluteTooltip: [
        filterSelectValue('Vaccinated2nd'),
        ['display', 0, elementHandleClick],
        mapMunicipalitiesTooltip,
      ],
    },
  },
  Municipalities: {
    name: 'Municipalities',
    customChart: {
      gorenjskaSortByLast: [
        ['filterSelect', 0, elementHandleSelect, { funcArgs: ['kr'] }],
      ],
      goriskaSortByLast: [
        ['filterSelect', 0, elementHandleSelect, { funcArgs: ['ng'] }],
      ],
      jvSlovenijaSortByLast: [
        ['filterSelect', 0, elementHandleSelect, { funcArgs: ['nm'] }],
      ],
      koroskaSortByLast: [
        ['filterSelect', 0, elementHandleSelect, { funcArgs: ['sg'] }],
      ],
      obalnoKraskaSortByLast: [
        ['filterSelect', 0, elementHandleSelect, { funcArgs: ['kp'] }],
      ],
      osrednjeSlovenskaSortByLast: [
        ['filterSelect', 0, elementHandleSelect, { funcArgs: ['lj'] }],
      ],
      podravskaSortByLast: [
        ['filterSelect', 0, elementHandleSelect, { funcArgs: ['mb'] }],
      ],
      pomurskaSortByLast: [
        ['filterSelect', 0, elementHandleSelect, { funcArgs: ['ms'] }],
      ],
      posavskaSortByLast: [
        ['filterSelect', 0, elementHandleSelect, { funcArgs: ['kk'] }],
      ],
      primorskoNotranjskaSortByLast: [
        ['filterSelect', 0, elementHandleSelect, { funcArgs: ['po'] }],
      ],
      savinjskaSortByLast: [
        ['filterSelect', 0, elementHandleSelect, { funcArgs: ['ce'] }],
      ],
      zasavskaSortByLast: [
        ['filterSelect', 0, elementHandleSelect, { funcArgs: ['za'] }],
      ],
    },
  },
  Sewage: {
    name: 'Sewage',
  },
  Schools: {
    name: 'Schools',
    customChart: {
      activeAbsolutePupilsFourMonths: [['range', 1, elementHandleClick]],
    },
  },
  SchoolStatus: {
    name: 'SchoolStatus',
  },
  Patients: {
    name: 'Patients',
    customChart: {
      twoMonthsTooltip: [
        ['highchartsSeries0Rect', castToNumber, elementHandleClick],
      ],
    },
  },
  IcuPatients: {
    name: 'IcuPatients',
    customChart: {
      twoMonthsTooltip: [
        ['highchartsSeries0Rect', castToNumber, elementHandleClick],
      ],
    },
  },
  CarePatients: {
    name: 'CarePatients',
  },
  AgeGroupsTimeline: {
    name: 'AgeGroupsTimeline',
    customChart: {
      newCasesFourMonths: [['range', 1, elementHandleClick]],
      newCasesRelativeFourMonths: [
        ['range', 1, elementHandleClick],
        ['metrics', 1, elementHandleClick],
      ],
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
  WeeklyDemographics: {
    name: 'WeeklyDemographics',
  },
  AgeGroups: {
    name: 'AgeGroups',
  },
  MetricsCorrelation: {
    name: 'MetricsCorrelation',
  },
  Deceased: {
    name: 'Deceased',
  },
  ExcessDeaths: {
    name: 'ExcessDeaths',
  },
  Infections: {
    name: 'Infections',
  },
  HcCases: {
    name: 'HcCases',
  },
  EuropeMap: {
    name: 'EuropeMap',
  },
  Sources: {
    name: 'Sources',
  },
  Cases: {
    name: 'Cases',
  },
  RegionMap: {
    name: 'RegionMap',
  },
  Regions: {
    name: 'Regions',
  },
  PhaseDiagram: {
    name: 'PhaseDiagram',
  },
  Spread: {
    name: 'Spread',
  },
  // Not on Covid-19 Sledilnik
  WorldMap: {
    name: 'WorldMap',
  },
  Ratios: {
    name: 'Ratios',
  },
  HCenters: {
    name: 'HCenters',
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
    selectorsToRemove: [],
  },
  CHART: {
    viewport: { width: 1200, height: 800 },
    getSelector: () => '.visualization.container.embeded > section',
    getUrl: type => `${CHART_BASE_URL}${type}`,
    selectorsToRemove: ['.metrics-selectors', 'div.show-all'],
    getButtons: async element => ({
      filterSelect: await element.$$(
        '.chart-display-properties > .filters > select'
      ),
      filterSelectOptions: await element.$$(
        '.chart-display-properties > .filters > select > option'
      ),
      interval: await element.$$(
        '.chart-data-interval-selector > .chart-display-property-selector__item'
      ),
      display: await element.$$(
        '.chart-display-property-selector > .chart-display-property-selector__item'
      ),
      range: await element.$$('.highcharts-range-selector-buttons rect'),
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
      highchartsSeriesGFirstChildPath: await element.$$(
        '.highcharts-root > g.highcharts-series-group g.highcharts-series g:first-child path'
      ),
      highchartsSeriesGFirstChild: await element.$$(
        '.highcharts-root > g.highcharts-series-group g.highcharts-series g:first-child'
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
    selectorsToRemove: [],
  },
};

module.exports = { OPTIONS, SCREENSHOTS: { CARD, CHART, MULTICARD } };
