exports.setMulticardHeight = async (page, viewport) => {
  const statsPageContainer = await page.$('.stats-page');
  await statsPageContainer.evaluate(el => {
    el.style.marginTop = '0';
  });

  const nav = await page.$eval('.navbar-container', el => ({
    height: el.clientHeight,
    margin: el.style.margin,
  }));
  const { height: navHeight, margin: navMargin } = nav;

  const ts = await page.$eval('.time-stamp', el => {
    el.style.margin = '0';
    return { height: el.clientHeight, margin: el.style.margin };
  });
  const { height: tsHeight, margin: tsMargin } = ts;

  const cw = await page.$eval('.cards-wrapper', el => {
    el.style.margin = '12px 0';
    return { height: el.clientHeight, margin: el.style.margin };
  });
  const { height: cwHeight, margin: cwMargin } = cw;

  const footer = await page.$eval('footer', el => ({
    height: el.clientHeight,
    margin: el.style.margin,
  }));
  const { height: footerHeight, margin: footerMargin } = footer;

  const marginTop = +cwMargin.split(' ')?.[0]?.replace('px', '') * 2;
  const newHeight = navHeight + tsHeight + cwHeight + footerHeight + marginTop;

  await page.setViewport({ width: viewport.width, height: newHeight });
  console.log(`Adjust viewport height: ${newHeight}`);
};
