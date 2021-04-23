module.exports = async (page, selectorToRemove) => {
  try {
    await page.evaluate(sel => {
      const elements = document.querySelectorAll(sel);
      for (let el of elements) {
        el.parentNode.removeChild(el);
      }
    }, selectorToRemove);
  } catch (error) {
    return error;
  }
};
