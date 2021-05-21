const path = require('path');
const { writeFileSync, existsSync, mkdirSync } = require('fs');
const { handler } = require('.');

const runTest = (
  query = { type: '', screen: '', custom: '', hoverIndex: '', hideLegend },
  options = {
    filePath: 'images/screenshot.png',
    headless: true,
  }
) => {
  const { type, screen, custom, hoverIndex, hideLegend, dateFrom, dateTo } =
    query;

  const event = {
    queryStringParameters: {
      type: type.toUpperCase(),
      screen,
      custom,
      hoverIndex,
      hideLegend,
      dateFrom,
      dateTo,
    },
    headless: options.headless,
  };

  const ensureDirectoryExistence = filePath => {
    var dirname = path.dirname(filePath);
    if (existsSync(dirname)) {
      return true;
    }
    ensureDirectoryExistence(dirname);
    mkdirSync(dirname);
  };

  const callback = (error, result) => {
    if (error) {
      console.log(error);
      return error;
    }
    const base64Data = result.body;
    if (!base64Data) {
      return new Error(result);
    }

    ensureDirectoryExistence(filePath);
    try {
      writeFileSync(`${filePath}`, base64Data, 'base64');
    } catch (error) {
      console.log(error);
    }
    console.log(`File saved to: ${filePath}`);
  };

  (async () => await handler(event, null, callback))();
};

// type = "card" || "chart" || "multicard"
// screen -> see screenshots.js CARD || CHART || MULTICARD properties
// custom -> see CHART[name].customChart

const query = {
  type: 'chart',
  screen: 'Cases',
  custom: 'cases_DateRange_Active_Hospitalized_Deceased_Tooltip',
  hoverIndex: '118',
  hideLegend: 'false',
  dateFrom: '01. 01. 2021',
  dateTo: '30. 04. 2021',
};

const dateTime = new Date();
const time = dateTime.toISOString().slice(11, 19).split(':').join('_');
const date = dateTime.toISOString().slice(0, 10);
let filename = query.custom ? `${query.screen}_${query.custom}` : query.screen;
filename = query.hoverIndex ? `${filename}_${query.hoverIndex}` : filename;
filename += `_${time}.png`;

const defaultFolder = 'images';
const filePath = path.resolve(
  defaultFolder,
  date,
  query.type.toLocaleLowerCase(),
  filename
);

const headless = true; // puppeteer launch browser mode
const options = {
  filePath,
  headless,
};

runTest(query, options);
