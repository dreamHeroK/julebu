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
  // 第 1 句打完进第 2 句（11 词）
  for (const w of ['There', 'are', 'four', 'people', 'in', 'my', 'family']) {
    for (const ch of w) key(ch);
    key(' ');
    await sleep(30);
  }
  await sleep(250);
  key('Enter');
  await sleep(400);
  for (const w of ['My', 'father', 'is', 'a', 'doctor', 'and']) {
    for (const ch of w) key(ch);
    key(' ');
    await sleep(30);
  }
  for (const ch of 'my') key(ch);
  await sleep(200);
  const tops = [...document.querySelectorAll('.cell')].map((c) => Math.round(c.getBoundingClientRect().top));
  return {
    title: document.querySelector('.pbar-title')?.textContent.replace(/\s+/g, ' '),
    rows: [...new Set(tops)].length,
    perRow: tops.reduce((m, t) => ((m[t] = (m[t] || 0) + 1), m), {}),
    width: getComputedStyle(document.querySelector('.words')).width,
  };
})();
