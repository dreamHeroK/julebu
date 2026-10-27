(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  location.hash = '#/course/daily/greet';
  await sleep(700);
  const key = (k) =>
    document.activeElement.dispatchEvent(
      new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true })
    );
  for (const ch of 'noce') key(ch);
  key(' ');
  await sleep(90);
  const ins = [...document.querySelectorAll('.wb-input')];
  return {
    err: ins[0].classList.contains('error'),
    val: ins[0].value,
    bg: getComputedStyle(ins[0]).backgroundColor,
  };
})();
