exports.setMulticardHeight = async (page, viewport) => {
  const statsPageContainer = await page.$('.stats-page');
  await statsPageContainer.evaluate(el => {
    el.style.marginTop = '0';
  });

  const nav = await page.$('.navbar-container');
  const navBB = await nav.boundingBox();
  const { height: navHeight } = navBB;

  await page.$eval('.time-stamp', el => {
    el.style.margin = '0';
    return;
  });
  const ts = await page.$('.time-stamp');
  const tsBB = await ts.boundingBox();
  const { height: tsHeight } = tsBB;

  const cwMargin = await page.$eval('.cards-wrapper', el => {
    el.style.margin = '12px 0px';
    return el.style.margin;
  });
  const cw = await page.$('.cards-wrapper');
  const cwBB = await cw.boundingBox();
  const { height: cwHeight } = cwBB;

  await page.$eval('div.content-wrapper', el => {
    el.style.lineHeight = 1;
    return;
  });

  await page.$eval('div.copy', el => {
    el.style.margin = '0px';
    return;
  });

  await page.$eval('footer', el => {
    el.style.minHeight = '46px';
    el.style.height = '46px';
    return;
  });
  const footer = await page.$('footer');
  const footerBB = await footer.boundingBox();
  const { height: footerHeight } = footerBB;

  const marginHeight = +cwMargin.split(' ')?.[0]?.replace('px', '') * 2;
  const newHeight = Math.round(
    navHeight + tsHeight + cwHeight + footerHeight + marginHeight
  );

  await page.setViewport({ width: viewport.width, height: newHeight });
  console.log(`Adjust viewport height: ${newHeight}`);
};
