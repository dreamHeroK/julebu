(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  location.hash = '#/course/daily/greet';
  await sleep(600);

  const input = document.querySelector('.type-input');
  const area = document.querySelector('.type-area');
  const focus1 = document.activeElement === input;
  const visible1 = area.style.display !== 'none';
  const ph1 = input.placeholder;

  const key = (k, el = input) =>
    el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));

  // 打错第一个词再提交 → 应标红
  for (const ch of 'noce') key(ch);
  key(' ');
  await sleep(120);
  const errOnInput = input.classList.contains('err');
  const errWord = !!document.querySelector('.wb.error');
  const errWordText = document.querySelector('.wb.error')?.textContent;
  await sleep(600);
  const errCleared = !input.classList.contains('err') && !document.querySelector('.wb.error');

  // 打对第一个词
  for (const ch of 'Nice') key(ch);
  await sleep(60);
  const inputValMid = input.value;
  key(' ');
  await sleep(80);
  const doneBg = getComputedStyle(document.querySelector('.wb.done')).backgroundColor;

  // 完成整句看输入框是否隐藏
  for (const w of ['to', 'meet', 'you']) {
    for (const ch of w) key(ch);
    key(' ');
    await sleep(30);
  }
  await sleep(200);
  const hiddenAfter = area.style.display === 'none';
  const score = document.querySelector('.score-val')?.textContent;

  return { focus1, visible1, ph1, errOnInput, errWord, errWordText, errCleared, inputValMid, doneBg, hiddenAfter, score };
})();
