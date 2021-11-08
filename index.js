const chromium = require('chrome-aws-lambda');

const screenshots = require('./screenshots');
const navigateToCustomChart = require('./navigateToCustomChart');
const removeChild = require('./removeChild');
const validateQueryStringParameters = require('./validateQueryStringParameters');
const removeUnwantedCards = require('./removeUnwantedCards.js');
const { setMulticardHeight } = require('./setMulticardHeight');

const { WaitBeforeScreenshot } = screenshots;

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
    dateFrom,
    dateTo,
    immediateDownload = 'true',
  } = event?.queryStringParameters || {
    type: '',
    screen: '',
    custom: '',
    hoverIndex: '',
    hideLegend: '',
    dateFrom: '',
    dateTo: '',
    immediateDownload: '',
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

  const { viewport, getSelector, getUrl, selectorsToRemove } =
    screenshots.OPTIONS[type];
  const possibleScreenshots = screenshots.SCREENSHOTS[type];
  const screenshot = possibleScreenshots[chosenScreenshot];

  const _url = screenshot?.path ?? screenshot.name;
  const url = getUrl(_url);
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
      console.log(`No element with selector: ${selector}`);
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

      /**
       * calling setMulticardHeight() makes sense if elements with selectors are not present:
       * 'div.posts',
       * 'div.row',
       * 'div.float-nav-btn',
       * 'div.float-list',
       * 'div.overlay'.
       * See: ./screenshots.OPTIONS.MULTICARD.selectorsToRemove
       */
      setMulticardHeight(page, viewport);
    }

    if (customChartName) {
      const error = await navigateToCustomChart({
        page,
        element,
        screenshot,
        chosenScreenshot,
        customChartName,
        hoverIndex,
        dateFrom,
        dateTo,
      });
      if (error instanceof Error) {
        console.log('Has ERROR');
        return callback(undefined, error.message);
      }
    }

    const isChart = type === 'CHART';
    const isChartAndHideLegend = hideLegend == String(true) && isChart;

    if (isChartAndHideLegend || !isChart) {
      console.log(`Selectors for type: ${type} will be removed!`);
      const removedSelectors = [];
      for (const selectorToRemove of selectorsToRemove) {
        const [error, result] = await removeChild(page, selectorToRemove);
        if (error instanceof Error) {
          console.log('Has ERROR');
          return callback(undefined, error.message);
        }
        removedSelectors.push(result);
      }
      for (const selector of removedSelectors) {
        for (item of Object.entries(selector)) {
          const [key, value] = item;
          value === null && console.log(`No element for selector: ${key}`);
          if (value !== null) {
            console.log(
              `Selector: ${key}. Length before: ${value.lengthBefore}, length after: ${value.lengthAfter}`
            );
          }
        }
      }
      console.log(`Selectors for type: ${type} removed!`);
    }

    await page.waitForTimeout(1500);
    let image;
    image =
      type === 'MULTICARD'
        ? await page.screenshot({ type: 'png', encoding: 'base64' })
        : await element.screenshot({ type: 'png', encoding: 'base64' });

    console.log('Made screenshot');

    const filename = `${new Date().toISOString()}---${chosenScreenshot}.png`;
    console.log('Filename is ', filename);

    const download = {
      statusCode: 200,
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
      body: image.toString('base64'),
      isBase64Encoded: true,
    };

    immediateDownload === String(true) &&
      console.log('Immediate download request');

    result =
      immediateDownload === String(true)
        ? download
        : {
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
