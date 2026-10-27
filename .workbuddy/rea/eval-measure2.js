(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const key = (k) =>
    document.activeElement.dispatchEvent(
      new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true })
    );
  location.hash = '#/';
  await sleep(400);
  [...document.querySelectorAll('.course-card')].find((c) => c.textContent.includes('我的家庭')).click();
  await sleep(700);
  for (const w of ['There', 'are', 'four', 'people', 'in', 'my', 'family']) {
    for (const ch of w) key(ch);
    key(' ');
    await sleep(30);
  }
  await sleep(250);
  key('Enter');
  await sleep(400);
  const ins = [...document.querySelectorAll('.wb-input')];
  const words = document.querySelector('.words');
  return {
    count: ins.length,
    widths: ins.map((i) => Math.round(i.getBoundingClientRect().width)),
    fonts: [...new Set(ins.map((i) => getComputedStyle(i).fontSize))],
    total: ins.reduce((s, i) => s + i.getBoundingClientRect().width, 0) + 8 * (ins.length - 1),
    wordsW: words.getBoundingClientRect().width,
    wordsClient: words.clientWidth,
  };
})();
