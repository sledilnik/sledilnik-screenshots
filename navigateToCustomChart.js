const { getButtons } = require('./screenshots').OPTIONS.CHART;

module.exports = async ({
  page,
  element,
  screenshot,
  customChartName,
  chosenScreenshot,
  hoverIndex,
}) => {
  const stepsToReproduce = screenshot.customChart[customChartName];
  if (!stepsToReproduce) {
    return new Error(
      `No custom ${customChartName} chart for chart: ${chosenScreenshot}`
    );
  }

  const evaluteFunc = el => {
    if (el.textContent) {
      return el.textContent;
    }
    return el.nodeName;
  };

  let returnedElement;
  for (item of stepsToReproduce) {
    const buttons = await getButtons(element);
    const [what, which, func, options] = item;

    const performOnElement = async () => {
      const index = which instanceof Function ? which(hoverIndex) : which;
      const series = buttons[what];
      if (!series) {
        throw new Error(`No series for: ${what}`);
      }
      console.log(`Series length: ${series.length}. Index: ${index}`);

      const button = series[index];

      let text;
      if (!options?.skipContent) {
        text = await page.evaluate(evaluteFunc, button);
      }
      let result;
      const funcArgs = options?.funcArgs || [];
      if (button) {
        result = await func(button, ...funcArgs);
      }
      text && console.log(`Button "${text}" clicked`);
      await page.waitForTimeout(500);
      return result;
    };

    const preformOnArrayOfElements = async () => {
      const series = buttons[what];
      const index = which instanceof Function ? which(hoverIndex) : which;

      console.log(`Series length: ${series.length}. Index: ${index}`);

      let result;
      if (series) {
        result = await func(series, index, options);
        if (!options?.skipContent) {
          text = await page.evaluate(evaluteFunc, result);
        }
        text && console.log(`Button "${text}" clicked`);
      }
      return result;
    };

    !options?.loop && (returnedElement = await performOnElement());
    options?.loop && (returnedElement = await preformOnArrayOfElements());
  }
};
