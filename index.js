const chromium = require('chrome-aws-lambda');
const screenshots = require('./screenshots');

exports.handler = async (event, context, callback) => {
  if (!event.queryStringParameters) {
    return callback(undefined, 'No target');
  }

  const { type: _type, screen: chosenScreenshot } = event.queryStringParameters;
  const type = _type.toUpperCase();

  if (!type || !chosenScreenshot) {
    return callback(
      undefined,
      `Missing query parameters: type = ${type}, screen = ${chosenScreenshot}`
    );
  }

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

    const formData = new FormData();
    formData.append('file1', image);

    result = {
      statusCode: 200,
      headers: {
        // 'Content-Type': 'image/png',
        'Content-Disposition': `form-data; name="file1"; filename="${filename}"`,
      },
      // body: image.toString('base64'),
      // isBase64Encoded: true,
      body: formData,
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
