(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const key = (k) =>
    document.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));
  location.hash = '#/course/daily/greet';
  await sleep(500);
  // 第一句 "Nice to meet you." 只打前两个词，停在第三个词
  for (const w of ['Nice', 'to']) {
    for (const ch of w) key(ch);
    key(' ');
    await sleep(40);
  }
  key('m');
  await sleep(80);
  return {
    done: document.querySelectorAll('.wb[style*="background"]').length - document.querySelectorAll('.wb.pending').length,
    pending: document.querySelectorAll('.wb.pending').length,
    current: document.querySelectorAll('.wb.current').length,
    caret: !!document.querySelector('.caret'),
  };
})();
