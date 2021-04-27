const removeChild = require('./removeChild');

module.exports = async ({
  page,
  screenshots,
  screenshot,
  selector,
  viewport,
}) => {
  const selectorsIncluded = screenshot.include.map(item => {
    return item.name;
  });
  const selectorsToRemove = Object.keys(screenshots.SCREENSHOTS.CARD).filter(
    item => !selectorsIncluded.includes(item)
  );

  for (let cardName of selectorsToRemove) {
    const _selectorToRemove = screenshot.getSelector(cardName);
    const error = await removeChild(page, _selectorToRemove);
    if (error instanceof Error) {
      console.log('Has ERROR');
      return callback(undefined, error.message);
    }
    console.log(`Elements with selector: ${_selectorToRemove} removed`);
  }
  await page.evaluate(sel => {
    const el = document.querySelector(sel);
    el.style['margin'] = '0 0 0 0';
    el.style.padding = '16px 16px 16px 16px';
  }, selector);

  const maxWidth = 4 * 325;
  const newWidth = selectorsIncluded.length * 325;

  const width = maxWidth > newWidth ? newWidth : maxWidth;
  await page.setViewport({
    width,
    height: viewport.height,
  });
  console.log(`Viewport set to: width: ${width}, height: ${viewport.height}`);
};
