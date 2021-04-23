const chromium = require('chrome-aws-lambda');
const screenshots = require('./screenshots');

const navigateToCustomChart = require('./navigateToCustomChart');
const removeChild = require('./removeChild');

const checkQueryParams = (type, chosenScreenshot) => {
  // must have query params
  if (!type || !chosenScreenshot) {
    return new Error(
      `Missing query parameters: type = ${type}, screen = ${chosenScreenshot}`
    );
  }

  // check if query param type is valid
  const screenshotsKeys = Object.keys(screenshots.SCREENSHOTS);
  if (!screenshotsKeys.includes(type)) {
    return new Error(
      `Invalid type: ${type}; Possible types: ${screenshotsKeys}`
    );
  }

  const possibleScreenshots = screenshots.SCREENSHOTS[type];

  // check if query param screen is valid
  if (
    !possibleScreenshots ||
    !Object.keys(possibleScreenshots).includes(chosenScreenshot)
  ) {
    return new Error(`Invalid chosen screenshot: ${chosenScreenshot}`);
  }
};

module.exports.handler = async (event, context, callback) => {
  if (!event.queryStringParameters) {
    return callback(undefined, 'No target');
  }

  const {
    type: _type,
    screen: chosenScreenshot,
    custom: customChartName,
  } = event.queryStringParameters;
  const type = _type.toUpperCase();

  const error = checkQueryParams(type, chosenScreenshot);
  if (error instanceof Error) {
    return callback(undefined, error.message);
  }

  const {
    viewport,
    getSelector,
    getUrl,
    selectorToRemove,
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
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });
    console.log('Browser launched');

    const page = await browser.newPage();
    console.log('Made Page');

    await page.setViewport(viewport);
    console.log('Set viewport');

    await page.goto(url, { waitUntil: 'networkidle0' });
    console.log('Went to ', url);

    if (selectorToRemove) {
      const error = await removeChild(page, selectorToRemove);
      if (error instanceof Error) {
        return callback(undefined, error.message);
      }
      console.log(`Elements with selector: ${selectorToRemove} removed`);
    }

    const element = await page.$(selector);
    if (!element) {
      return { message: "Wrong selector or it's not visible" };
    }

    if (screenshot.include) {
      const selectorsIncluded = screenshot.include.map(item => {
        return item.name;
      });
      const selectorsToRemove = Object.keys(
        screenshots.SCREENSHOTS.CARD
      ).filter(item => !selectorsIncluded.includes(item));

      for (let cardName of selectorsToRemove) {
        const _selectorToRemove = screenshot.getSelector(cardName);
        const error = await removeChild(page, selectorToRemove);
        if (error instanceof Error) {
          return callback(undefined, error.message);
        }
        console.log(`Elements with selector: ${_selectorToRemove} removed`);
      }
      await page.evaluate(sel => {
        const el = document.querySelector(sel);
        el.style['margin-bottom'] = 'no';
        console.log(el.style);
      }, selector);

      const maxWidth = 4 * 325;
      const newWidth = selectorsIncluded.length * 325;

      await page.setViewport({
        width: maxWidth > newWidth ? newWidth : maxWidth,
        height: viewport.height,
      });
    }

    if (customChartName) {
      const error = await navigateToCustomChart({
        page,
        element,
        screenshot,
        chosenScreenshot,
        customChartName,
      });
      if (error instanceof Error) {
        return callback(undefined, error.message);
      }
    }

    image = await element.screenshot({ type: 'png', encoding: 'base64' });
    console.log('Made screenshot');

    const chartName = customChartName
      ? screenshot.name + '_' + customChartName
      : screenshot.name;

    const filename = `${new Date()
      .toISOString()
      .slice(0, 10)}---${chartName}.png`;
    console.log('Filename is ', filename);

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
      await browser.close();
    }
  }

  return callback(null, result);
};
