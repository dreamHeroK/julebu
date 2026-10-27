(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  location.hash = '#/course/daily/greet';
  await sleep(700);

  const ins = () => [...document.querySelectorAll('.wb-input')];
  const focusIdx = () => ins().indexOf(document.activeElement);
  const key = (k) =>
    document.activeElement.dispatchEvent(
      new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true })
    );

  const t0 = { count: ins().length, focus0: focusIdx(), zh: document.querySelector('.zh-line').textContent };

  for (const ch of 'Nice') key(ch);
  key(' ');
  await sleep(80);
  const t1 = {
    focus1: focusIdx(),
    firstDone: ins()[0].classList.contains('done'),
    val0: ins()[0].value,
    readOnly0: ins()[0].readOnly,
  };

  for (const ch of 'ot') key(ch);
  key(' ');
  await sleep(100);
  const t2 = { err: ins()[1].classList.contains('error'), val1: ins()[1].value, focus2: focusIdx() };
  await sleep(520);
  const t3 = { val1After: ins()[1].value, errCleared: !ins()[1].classList.contains('error') };

  for (const w of ['to', 'meet', 'you']) {
    for (const ch of w) key(ch);
    key(' ');
    await sleep(50);
  }
  await sleep(180);
  const t4 = {
    allDone: ins().every((i) => i.classList.contains('done')),
    score: document.querySelector('.score-val').textContent,
  };

  key('Enter');
  await sleep(350);
  const t5 = {
    title: document.querySelector('.pbar-title').textContent.replace(/\s+/g, ' '),
    zh: document.querySelector('.zh-line').textContent,
    vals: ins().map((i) => i.value),
    doneCount: ins().filter((i) => i.classList.contains('done')).length,
    focus: focusIdx(),
  };

  return { t0, t1, t2, t3, t4, t5 };
})();
