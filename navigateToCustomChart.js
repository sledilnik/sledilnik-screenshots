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

  const evaluteFunc = el => {
    if (el.textContent) {
      return el.textContent;
    }
    return el.nodeName;
  };

  for (item of stepsToReproduce) {
    const [what, which, func, skipContent] = item;
    const index = which instanceof Function ? which(hoverIndex) : which;
    const button = buttons[what][index];

    let text;
    if (!skipContent) {
      text = await page.evaluate(evaluteFunc, button);
    }
    button && (await func(button));
    text && console.log(`Button "${text}" clicked`);
  }
};
