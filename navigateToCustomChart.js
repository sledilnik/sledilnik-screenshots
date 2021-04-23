module.exports = async ({
  page,
  element,
  screenshot,
  customChartName,
  chosenScreenshot,
}) => {
  const stepsToReproduce = screenshot.customChart[customChartName];
  if (!stepsToReproduce) {
    return new Error(
      `No custom ${customChartName} chart for chart: ${chosenScreenshot}`
    );
  }
  const buttons = {
    interval: await element.$$(
      '.chart-data-interval-selector > .chart-display-property-selector__item'
    ),
    display: await element.$$(
      '.chart-display-property-selector > .chart-display-property-selector__item'
    ),
  };

  for (item of stepsToReproduce) {
    const [what, which, func] = item;
    const button = buttons[what][which];
    const text = await page.evaluate(el => el.textContent, button);
    await func(button);
    console.log(`Button "${text}" clicked`);
  }
};
