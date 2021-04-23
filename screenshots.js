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

MULTICARD = {
  LAB: {
    name: 'LAB',
    getSelector: type => `.cardtype-${type} > .hp-card`,
    include: [CARD.testsToday, CARD.testsTodayHAT, CARD.casesActive],
  },
  HOS: {
    name: 'HOS',
    getSelector: type => `.cardtype-${type} > .hp-card`,
    include: [CARD.hospitalizedCurrent, CARD.icuCurrent, CARD.deceasedToDate],
  },
  ALL: {
    name: 'ALL_CARDS',
    getSelector: type => `.cardtype-${type} > .hp-card`,
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
  },
  MULTICARD: {
    viewport: { width: 1000, height: 800 },
    getSelector: () => `.cards-wrapper`,
    getUrl: () => CARD_BASE_URL,
  },
};

module.exports = { OPTIONS, SCREENSHOTS: { CARD, CHART, MULTICARD } };
