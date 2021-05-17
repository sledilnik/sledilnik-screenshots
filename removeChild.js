module.exports = async (page, selectorToRemove) => {
  try {
    let elements = await page.$$(selectorToRemove);
    const lengthBefore = elements.length;

    if (lengthBefore === 0) {
      console.warn(`Found no element with selector: ${selectorToRemove}`);
      return [null, { [selectorToRemove]: null }];
    }

    console.log(
      `${elements.length} element(s) with selector: ${selectorToRemove} will be removed.`
    );

    if (lengthBefore > 0) {
      await page.evaluate(sel => {
        const elements = document.querySelectorAll(sel);
        for (let el of elements) {
          el.parentNode.removeChild(el);
        }
      }, selectorToRemove);
    }

    elements = await page.$$(selectorToRemove);
    const lengthAfter = elements.length;
    const diff = lengthBefore - lengthAfter;
    diff !== lengthBefore &&
      console.warn(
        `Some elements with selector: ${selectorToRemove} has not been removed!`
      );
    console.log(
      `${lengthAfter} element(s) with selector: ${selectorToRemove} on page.`
    );
    return [null, { [selectorToRemove]: { lengthBefore, lengthAfter } }];
  } catch (error) {
    return error;
  }
};
