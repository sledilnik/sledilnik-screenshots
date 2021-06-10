const { getButtons } = require('./screenshots').OPTIONS.CHART;

module.exports = async ({
  page,
  element,
  screenshot,
  customChartName,
  chosenScreenshot,
  hoverIndex,
  dateFrom,
  dateTo,
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
    const [what, which, func, options = {}] = item;

    const performOnElement = async () => {
      const index = which instanceof Function ? which(hoverIndex) : which;
      const series = buttons[what];
      if (!series) {
        throw new Error(`No series for: ${what}`);
      }

      if (series.length - 1 < index) {
        throw new Error(
          `Index ${index} is out of range! Max index: ${series.length - 1}`
        );
      }

      console.log(`Series length: ${series.length}. Index: ${index}`);

      const button = series[index];

      let result;

      // if arguments values are known
      const funcArgs = options?.funcArgs || [];
      if (button && !options?.value) {
        result = await func(button, ...funcArgs);
      }

      // if arguments values are dynamic, at the moment only for date range
      if (button && options?.value) {
        type = { dateFrom, dateTo };
        const value = type[options.value];
        result = await func(button, value, page);
      }

      let text;
      if (!options?.skipContent) {
        text = await page.evaluate(evaluteFunc, result ?? button);
      }

      text && console.log(`Button "${text}" clicked`);
      await page.waitForTimeout(500);
      return result;
    };

    const preformOnArrayOfElements = async () => {
      const series = buttons[what];
      const index = which instanceof Function ? which(hoverIndex) : which;

      console.log(`Loop: Series [${what}] length: ${series.length}.`);

      options.dateFrom = dateFrom;
      options.dateTo = dateTo;

      let button;
      if (series) {
        const [button, buttonsSeries] = await func(
          series,
          index,
          options,
          page
        );

        console.log(
          `Series [${options.selector}] length: ${buttonsSeries.length}. Index: ${index}`
        );
        if (!options?.skipContent) {
          text = await page.evaluate(evaluteFunc, button);
        }
        text && console.log(`Button "${text}" clicked`);
      }
      return button;
    };

    const preformOnLineChart = async () => {
      const index = which instanceof Function ? which(hoverIndex) : which;
      const button = await func(index, options, page);
      console.log(`Button [${button}] clicked!`);
    };

    const FuncDict = {
      default: performOnElement,
      loop: preformOnArrayOfElements,
      line: preformOnLineChart,
    };

    const performFunc = options.type
      ? FuncDict[options.type]
      : FuncDict.default;

    returnedElement = await performFunc();
  }
};
