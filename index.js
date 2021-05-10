const chromium = require('chrome-aws-lambda');

const screenshots = require('./screenshots');
const navigateToCustomChart = require('./navigateToCustomChart');
const removeChild = require('./removeChild');
const validateQueryStringParameters = require('./validateQueryStringParameters');
const removeUnwantedCards = require('./removeUnwantedCards.js');

module.exports.handler = async (event, context, callback) => {
  if (!event.queryStringParameters) {
    return callback(undefined, 'No target');
  }

  const {
    type: _type,
    screen: chosenScreenshot,
    custom: customChartName,
    hoverIndex,
    hideLegend,
  } = event?.queryStringParameters || {
    type: '',
    screen: '',
    custom: '',
    hoverIndex: '',
    hideLegend: '',
  };
  const type = _type.toUpperCase();

  const error = validateQueryStringParameters(
    type,
    chosenScreenshot,
    customChartName,
    hoverIndex
  );
  if (error instanceof Error) {
    console.log('ERROR msg: ', error.message);
    return callback(undefined, error.message);
  }

  const {
    viewport,
    getSelector,
    getUrl,
    selectorsToRemove,
  } = screenshots.OPTIONS[type];
  const possibleScreenshots = screenshots.SCREENSHOTS[type];
  const screenshot = possibleScreenshots[chosenScreenshot];

  const url = getUrl(screenshot.name);
  const selector = getSelector(screenshot.name);

  let result = null;
  let browser = null;

  try {
    browser = await chromium.puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: event.headless || chromium.headless,
      ignoreHTTPSErrors: true,
    });
    console.log('Browser launched');

    const page = await browser.newPage();
    console.log('Made Page');

    await page.setViewport(viewport);
    console.log('Set viewport');

    await page.goto(url, { waitUntil: 'networkidle0' });
    console.log('Went to ', url);

    const element = await page.$(selector);
    if (!element) {
      return callback(undefined, "Wrong selector or it's not visible");
    }

    // multicard
    if (screenshot.include) {
      const error = await removeUnwantedCards({
        page,
        screenshots,
        screenshot,
        selector,
        viewport,
      });
      if (error instanceof Error) {
        console.log('Has ERROR');
        return callback(undefined, error.message);
      }
    }

    if (customChartName) {
      const error = await navigateToCustomChart({
        page,
        element,
        screenshot,
        chosenScreenshot,
        customChartName,
        hoverIndex,
      });
      if (error instanceof Error) {
        console.log('Has ERROR');
        return callback(undefined, error.message);
      }
    }

    if (!!hideLegend) {
      console.log('Legend will be removed!');
      for (const selectorToRemove of selectorsToRemove) {
        const error = await removeChild(page, selectorToRemove);
        if (error instanceof Error) {
          console.log('Has ERROR');
          return callback(undefined, error.message);
        }
      }
      console.log('Legend removed!');
    }

    await page.waitForTimeout(500);
    image = await element.screenshot({ type: 'png', encoding: 'base64' });
    console.log('Made screenshot');

    result = {
      headers: {
        'Content-Type': 'image/png',
      },

      body: image,
      isBase64Encoded: true,
    };
  } catch (error) {
    return callback(error);
  } finally {
    if (browser !== null) {
      let pages = await browser.pages();
      await Promise.all(pages.map(page => page.close()));
      console.log('All pages closed');
      await browser.close();
      console.log('Browser closed');
    }
  }
  return callback(null, result);
};
