const puppeteer = require('puppeteer');
const fs = require('fs');

const screenshots = require('./screenshots');
const navigateToCustomChart = require('./navigateToCustomChart');
const removeChild = require('./removeChild');

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

  const {
    viewport,
    getSelector,
    getUrl,
    selectorToRemove,
  } = screenshots.OPTIONS[type];
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
      const error = removeChild(page, selectorToRemove);
      if (error instanceof Error) {
        throw error;
      }
      console.log('Selector removed');
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
        const error = removeChild(page, _selectorToRemove);
        if (error instanceof Error) {
          throw error;
        }
        console.log(`Selector: ${_selectorToRemove} removed`);
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
      ? screenshot.name + '_' + customChartName
      : screenshot.name;

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

(async () => await run({ type: 'multicard', screen: 'ALL' }, false))();
