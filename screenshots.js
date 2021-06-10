const path = require('path');

CHART_BASE_URL = 'https://covid-19.sledilnik.org/embed.html#/chart/';
CARD_BASE_URL = 'https://covid-19.sledilnik.org/';

const WaitBeforeScreenshot = {
  default: 500,
  Map_distribution1Day: 1500,
  Map_distribution1DayTooltip: 1500,
  Map_distribution7Days: 1500,
  Map_distribution7DaysTooltip: 1500,
};

const getDaysDifference = (dateFrom, dateTo) => {
  const df = dateFrom.split('.').map(item => +item);
  const dt = dateTo.split('.').map(item => +item);

  const date1 = new Date(Date.UTC(df[2], df[1] - 1, df[0]));
  const date2 = new Date(Date.UTC(dt[2], dt[1] - 1, dt[0]));

  const timeDifference = date2.getTime() - date1.getTime();

  const daysDifference = Math.round(timeDifference / (1000 * 3600 * 24));
  return daysDifference;
};

const elementHandleClick = async elementHandle => {
  await elementHandle.click();
  console.log('Clicked!');
  return elementHandle;
};

const elementHandleHover = async elementHandle => {
  await elementHandle.hover();
  console.log('Hovered!');
  return elementHandle;
};

const elementHandleSelect = async (elementHandle, value) => {
  await elementHandle.select(value);
  console.log('Select value set!');
  return elementHandle;
};

const elementHandleSetValue = async (elementHandle, value, page) => {
  await elementHandle.click();
  await page.keyboard.down('Control');
  await page.keyboard.press('A');
  await page.keyboard.up('Control');
  await page.keyboard.press('Backspace');
  await elementHandle.click();
  await elementHandle.type(value, { delay: 100 });
  console.log(`Element type value: ${value}`);
  await page.keyboard.press('Tab');
  return elementHandle;
};

const castToNumber = index => +index;

// {type: 'loop'}
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

const loopAndShowTooltip = async (series, index, options, page) => {
  const selectorsArray = await Promise.all(
    series.map(async item => await item.$$(options.selector))
  );
  const filtered = selectorsArray.filter(item => {
    return item.length >= options.length(options.dateFrom, options.dateTo);
  });

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
      `Index ${index} is out of range! Max index: ${buttons.length - 1}`
    );
  }

  const sortByAttributeX = async (elementHandlesSeries, index) => {
    const elementHandlesSeriesWithXAttr = await Promise.all(
      elementHandlesSeries.map(async item => {
        x = await page.evaluate(el => el.getAttribute('x'), item);
        return [item, x];
      })
    );
    elementHandlesSeriesWithXAttr.sort((a, b) => a[1] - b[1]);
    return elementHandlesSeriesWithXAttr[index][0];
  };

  const button = options.sort
    ? await sortByAttributeX(buttons, index)
    : buttons[index];

  const func = options.func ?? elementHandleClick;

  func.name === 'elementHandleHover' && (await button.hover());
  func.name === 'elementHandleClick' && (await button.click());
  return [button, buttons];
};

const mapMunicipalitiesTooltip = [
  'highchartsSeriesGFirstChild',
  value => value,
  findByNameShowTooltip,
  {
    getSelector: name => `.highcharts-name-${name}`,
    exit: true,
    func: elementHandleClick,
    type: 'loop',
  },
];

const filterSelectValue = value => [
  'filterSelect',
  0,
  elementHandleSelect,
  { funcArgs: [value] },
];

const lineChartTooltip = async (index, options, page) => {
  const convertedIndex = isNaN(index) ? null : index;
  console.log(
    `Try to show line chart tooltip with index: ${convertedIndex} on series with index: ${options?.seriesIndex}`
  );
  const data = await page.evaluate(
    (index, options) => {
      const { charts } = Highcharts;
      const { series } = charts[options.chartsIndex ?? 0];
      const { points } = series[options.seriesIndex ?? 0];
      const i = index ?? points.length - 1;
      const point = points[i];
      point.onMouseOver();

      const result = {
        button: point.key,
        c: charts.length,
        s: series.length,
        p: points.length,
        i,
      };

      return Promise.resolve(result);
    },
    convertedIndex,
    options
  );
  console.log(`Charts length: ${data.c}`);
  console.log(`Series length: ${data.s}`);
  console.log(`Points length: ${data.p}`);
  console.log(`Tooltip for point with index: ${data.i}`);
  return data.button;
};

CHART = {
  MetricsComparison: {
    name: 'MetricsComparison',
    customChart: {
      casesConfirmed7DaysAvgFourMonths: [
        ['metrics', 11, elementHandleClick],
        ['metrics', 1, elementHandleClick],
        ['range', 1, elementHandleClick],
      ],
      casesConfirmed7DaysAvgFourMonthsTooltip: [
        ['metrics', 11, elementHandleClick],
        ['metrics', 1, elementHandleClick],
        ['range', 1, elementHandleClick],
        [
          null,
          castToNumber,
          lineChartTooltip,
          {
            type: 'line',
            chartsIndex: 0,
            seriesIndex: 0,
          },
        ],
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
        ['interval', 0, elementHandleClick],
        ['display', 3, elementHandleClick],
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
            length: () => 60, // todo calc because of february && july, august
            selector: 'rect',
            exit: true,
            func: elementHandleClick,
            type: 'loop',
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
    customChart: {
      cases_TwoMonths_Active_Hospitalized_Deceased: [
        ['highchartsLegendItemRect', 2, elementHandleClick],
        ['highchartsLegendItemRect', 3, elementHandleClick],
        ['highchartsLegendItemRect', 4, elementHandleClick],
        ['highchartsLegendItemRect', 6, elementHandleClick],
        ['highchartsLegendItemRect', 7, elementHandleClick],
      ],
      cases_TwoMonths_Active_Hospitalized_Deceased_Tooltip: [
        ['highchartsLegendItemRect', 2, elementHandleClick],
        ['highchartsLegendItemRect', 3, elementHandleClick],
        ['highchartsLegendItemRect', 4, elementHandleClick],
        ['highchartsLegendItemRect', 6, elementHandleClick],
        ['highchartsLegendItemRect', 7, elementHandleClick],
        ['highchartsSeriesRect', castToNumber, elementHandleClick],
      ],
      cases_DateRange_Active_Hospitalized_Deceased_Tooltip: [
        ['rangeDateInput', 0, elementHandleSetValue, { value: 'dateFrom' }],
        ['rangeDateInput', 1, elementHandleSetValue, { value: 'dateTo' }],
        ['highchartsLegendItemRect', 2, elementHandleClick],
        ['highchartsLegendItemRect', 3, elementHandleClick],
        ['highchartsLegendItemRect', 4, elementHandleClick],
        ['highchartsLegendItemRect', 6, elementHandleClick],
        ['highchartsLegendItemRect', 7, elementHandleClick],
        [
          'highchartsSeries',
          castToNumber,
          loopAndShowTooltip,
          {
            length: getDaysDifference,
            selector: 'rect',
            exit: true,
            func: elementHandleHover,
            type: 'loop',
            sort: true,
          },
        ],
      ],
    },
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
      highchartsLegendItemRect: await element.$$(
        '.highcharts-legend .highcharts-legend-item rect'
      ),
      rangeDateInput: await element.$$(
        '.highcharts-range-input > text > tspan'
      ),
      root: await element.$$('.highcharts-root'),
    }),
  },
  MULTICARD: {
    viewport: { width: 1000, height: 800 },
    getSelector: () => `.cards-wrapper`,
    getUrl: () => CARD_BASE_URL,
    selectorsToRemove: [],
  },
};

module.exports = {
  OPTIONS,
  SCREENSHOTS: { CARD, CHART, MULTICARD },
  WaitBeforeScreenshot,
};
