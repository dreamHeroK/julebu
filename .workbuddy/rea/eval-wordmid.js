(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  location.hash = '#/course/daily/greet';
  await sleep(700);
  const key = (k) =>
    document.activeElement.dispatchEvent(
      new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true })
    );
  for (const w of ['Nice', 'to']) {
    for (const ch of w) key(ch);
    key(' ');
    await sleep(60);
  }
  for (const ch of 'mee') key(ch);
  await sleep(120);
  const ins = [...document.querySelectorAll('.wb-input')];
  return {
    vals: ins.map((i) => i.value),
    done: ins.filter((i) => i.classList.contains('done')).length,
    focus: ins.indexOf(document.activeElement),
  };
})();
