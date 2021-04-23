const puppeteer = require('puppeteer');
const fs = require('fs');

const screenshots = require('./screenshots');
const navigateToCustomChart = require('./navigateToCustomChart');

const run = async (
  params = { type: '', screen: '', custom: '' },
  headless = true
) => {
  let browser, image;
  const type = params.type.toUpperCase();
  const chosenScreenshot = params.screen;
  const customChartName = params.custom;

  if (!Object.keys(screenshots.SCREENSHOTS).includes(type)) {
    throw new Error(`Invalid type: ${type}`);
  }

  const options = screenshots.OPTIONS[type];

  const { viewport, getSelector, getUrl, selectorToRemove } = options;
  const possibleScreenshots = screenshots.SCREENSHOTS[type];

  if (
    !possibleScreenshots ||
    !Object.keys(possibleScreenshots).includes(chosenScreenshot)
  ) {
    throw new Error(`Invalid chosen screenshot: ${chosenScreenshot}`);
  }

  const screenshot = possibleScreenshots[chosenScreenshot];

  const url = getUrl(screenshot.name);
  const selector = getSelector(screenshot.name);

  try {
    const browser = await puppeteer.launch({
      headless,
      ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();
    console.log('Made Page');

    await page.setViewport(viewport);
    console.log('Set viewport');

    await page.goto(url, { waitUntil: 'networkidle0' });
    console.log('Went to ', url);

    if (selectorToRemove) {
      await page.evaluate(sel => {
        const elements = document.querySelectorAll(sel);
        for (let i = 0; i < elements.length; i++) {
          elements[i].parentNode.removeChild(elements[i]);
        }
      }, selectorToRemove);
      console.log('Selector removed');
    }

    const element = await page.$(selector);
    if (!element) {
      return { message: "Wrong selector or it's not visible" };
    }

    if (customChartName) {
      await navigateToCustomChart({
        page,
        element,
        screenshot,
        chosenScreenshot,
        customChartName,
      });
    }

    image = await element.screenshot({ type: 'png' });
    console.log('Made screenshot');

    const chartName = customChartName
      ? chosenScreenshot + '_' + customChartName
      : chosenScreenshot;

    const filename = `${new Date()
      .toISOString()
      .slice(0, 10)}---${chartName}.png`;
    console.log('Filename is ', filename);

    fs.writeFileSync(`images/${filename}`, image);
  } catch (error) {
    throw new Error(error);
  } finally {
    browser && (await browser.close());
    console.log('Browser closed');
  }
  return image;
};

(async () =>
  await run({ type: 'chart', screen: 'Map', custom: 'weeklyGrowth' }, false))();
