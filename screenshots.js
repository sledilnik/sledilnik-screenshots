const path = require('path');

CHART_BASE_URL = 'https://covid-19.sledilnik.org/embed.html#/chart/';
CARD_BASE_URL = 'https://covid-19.sledilnik.org/';

CHART = {
  IcuPatients: {
    name: 'IcuPatients',
  },
  Patients: {
    name: 'Patients',
  },
  MetricsComparison: {
    name: 'MetricsComparison',
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
      weeklyGrowth: [
        ['display', 0, async elementHandle => await elementHandle.click()],
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
  },
};

module.exports = { OPTIONS, SCREENSHOTS: { CARD, CHART } };
