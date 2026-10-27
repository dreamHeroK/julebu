(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const key = (k) =>
    document.activeElement.dispatchEvent(
      new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true })
    );
  location.hash = '#/';
  await sleep(400);
  [...document.querySelectorAll('.course-card')].find((c) => c.textContent.includes('酒店入住')).click();
  await sleep(700);
  // 切听写
  document.querySelector('.mode-btn').click();
  await sleep(400);
  for (const w of ['I', 'have', 'a', 'reservation']) {
    for (const ch of w) key(ch);
    key(' ');
    await sleep(40);
  }
  for (const ch of 'und') key(ch);
  await sleep(150);
  const ins = [...document.querySelectorAll('.wb-input')];
  return {
    mode: document.querySelector('.mode-btn')?.textContent,
    zh: document.querySelector('.zh-line')?.textContent,
    metas: document.querySelectorAll('.cell .meta').length,
    vals: ins.map((i) => i.value),
    focus: ins.indexOf(document.activeElement),
    score: document.querySelector('.score-val')?.textContent,
  };
})();
