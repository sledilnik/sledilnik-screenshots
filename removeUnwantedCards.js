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
    const [error, removedSelector] = await removeChild(page, _selectorToRemove);
    if (error instanceof Error) {
      console.log('Has ERROR');
      return error;
    }

    const [key, value] = Object.entries(removedSelector)[0];

    value === null &&
      console.log(`Could not remove elements with selector: ${key}!`);

    value !== null &&
      console.log(
        `${
          value.lengthBefore - value.lengthAfter
        } element(s) with selector: ${key} removed!`
      );
  }

  await page.evaluate(sel => {
    const el = document.querySelector(sel);
    el.style['margin'] = '0 0 0 0';
    el.style.padding = '16px 16px 16px 16px';
  }, selector);

  return;
};
