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

  const buttons = await getButtons(element);
  // for (let [key, value] of Object.entries(buttons)) {
  //   console.log(key, value.length);
  // }

  const evaluteFunc = el => {
    if (el.textContent) {
      return el.textContent;
    }
    return el.nodeName;
  };

  let returnedElement;
  for (item of stepsToReproduce) {
    const [what, which, func, options] = item;

    const performOnElement = async () => {
      const index = which instanceof Function ? which(hoverIndex) : which;
      const button = buttons[what][index];

      let text;
      if (!options?.skipContent) {
        text = await page.evaluate(evaluteFunc, button);
      }
      let result;
      if (button) {
        result = await func(button);
      }
      text && console.log(`Button "${text}" clicked`);
      return result;
    };

    const preformOnArrayOfElements = async () => {
      const series = buttons[what];
      const index = which instanceof Function ? which(hoverIndex) : which;

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
