(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  location.hash = '#/course/exam/writing';
  await sleep(700);
  const key = (k) =>
    document.activeElement.dispatchEvent(
      new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true })
    );
  for (const w of ['Nowadays', 'more', 'and', 'more', 'people', 'prefer', 'to', 'work', 'from']) {
    for (const ch of w) key(ch);
    key(' ');
    await sleep(30);
  }
  for (const ch of 'home') key(ch);
  await sleep(150);
  const rows = new Set([...document.querySelectorAll('.cell')].map((c) => c.getBoundingClientRect().top)).size;
  return { rows, words: document.querySelectorAll('.wb-input').length };
})();
