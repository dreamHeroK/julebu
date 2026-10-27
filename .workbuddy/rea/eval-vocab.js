(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  location.hash = '#/';
  await sleep(500);
  const packs = [...document.querySelectorAll('.pack-title')].map((n) => n.textContent);
  const cards = [...document.querySelectorAll('.course-card')].filter(
    (c) => c.textContent.includes('食物') || c.textContent.includes('动物') || c.textContent.includes('情绪')
  ).length;

  location.hash = '#/course/vocabulary/vocab-food';
  await sleep(700);
  const key = (k) =>
    document.activeElement.dispatchEvent(
      new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true })
    );
  for (const w of ['I', 'ordered']) {
    for (const ch of w) key(ch);
    key(' ');
    await sleep(50);
  }
  for (const ch of 'fried') key(ch);
  await sleep(100);
  const ins = [...document.querySelectorAll('.wb-input')];
  return {
    packs,
    vocabCards: cards,
    title: document.querySelector('.pbar-title')?.textContent.replace(/\s+/g, ' '),
    zh: document.querySelector('.zh-line')?.textContent,
    vals: ins.map((i) => i.value),
    focus: ins.indexOf(document.activeElement),
  };
})();
