const { OPTIONS, SCREENSHOTS } = require('./screenshots');

// todo validate hover index if it's possible
module.exports = (type = '', screen = '', custom = '', hoverIndex = '') => {
  const upperCaseType = type.toUpperCase();
  const options = OPTIONS[upperCaseType];
  const screenshots = SCREENSHOTS[upperCaseType];

  if (!options) {
    return new Error(
      `Missing options for type: ${type}. Possible: ${Object.keys(OPTIONS)}`
    );
  }

  if (!screenshots) {
    return new Error(
      `Missing screenshots for type: ${type}. Possible: ${Object.keys(
        SCREENSHOTS
      )}`
    );
  }
  console.log(`Query param "type": ${type} is OK!`);

  const screenshot = screenshots[screen];
  if (!screenshot) {
    return new Error(
      `Missing screenshot for screen: ${screen}. Possible: ${Object.keys(
        screenshots
      )}`
    );
  }
  console.log(`Query param "screen": ${screen} is OK!`);

  if (upperCaseType === 'CHART' && custom) {
    const { customChart } = screenshot;
    if (!customChart) {
      const chartsWithCustomCharts = Object.values(SCREENSHOTS.CHART)
        .filter(item => item.customChart)
        .map(item => item.name);
      return new Error(
        `No custom chart for screen: ${screen}; Possible: ${chartsWithCustomCharts}`
      );
    }

    const stepsToReproduce = customChart[custom];
    if (!stepsToReproduce) {
      return new Error(
        `Missing custom chart: ${custom} for screen: ${screen}. Possible: ${Object.keys(
          customChart
        )}`
      );
    }
    console.log(`Query param "custom": ${custom} is OK!`);
  }
  if (upperCaseType !== 'CHART' && custom) {
    return new Error('Only CHART has custom property!');
  }

  return null;
};
