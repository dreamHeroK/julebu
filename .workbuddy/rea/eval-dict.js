(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const key = (k) =>
    document.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));
  location.hash = '#/course/daily/life';
  await sleep(600);
  document.querySelector('.mode-btn').click();
  await sleep(300);
  for (const w of ['I', 'like', 'to', 'eat']) {
    for (const ch of w) key(ch);
    key(' ');
    await sleep(40);
  }
  await sleep(150);
  return {
    mode: document.querySelector('.mode-btn')?.textContent,
    zh: document.querySelector('.zh-line')?.textContent,
    metas: document.querySelectorAll('.cell .meta').length,
    ipas: document.querySelectorAll('.cell .ipa').length,
    done: document.querySelectorAll('.wb').length,
  };
})();
