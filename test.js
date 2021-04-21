const screenshots = require('./screenshots');
const puppeteer = require('puppeteer');
const fs = require('fs');

const run = async () => {
  let browser, image;
  const type = 'CHART';
  const chosenScreenshot = 'IcuPatients';

  if (!Object.keys(screenshots).includes(type)) {
    throw new Error(`Invalid type: ${type}`);
  }

  const options = screenshots.OPTIONS[type];

  const { viewport, getSelector, getUrl, selectorToRemove } = options;
  const possibleScreenshots = screenshots[type];

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
      headless: true,
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

    image = await element.screenshot({ type: 'png' });
    console.log('Made screenshot');

    const filename = `${new Date()
      .toISOString()
      .slice(0, 10)}---${chosenScreenshot}.png`;
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

(async () => await run())();
