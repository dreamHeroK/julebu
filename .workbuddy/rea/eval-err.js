(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  location.hash = '#/course/daily/greet';
  await sleep(600);
  const input = document.querySelector('.type-input');
  const key = (k) => input.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));
  for (const ch of 'noce') key(ch);
  key(' ');
  await sleep(80);
  return {
    errInput: input.classList.contains('err'),
    errWord: document.querySelector('.wb.error')?.textContent,
    borderColor: getComputedStyle(input).borderColor,
  };
})();
