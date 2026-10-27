(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const key = (k) =>
    document.activeElement.dispatchEvent(
      new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true })
    );
  location.hash = '#/';
  await sleep(400);
  [...document.querySelectorAll('.course-card')]
    .find((c) => c.textContent.includes('课堂用语'))
    .click();
  await sleep(700);
  const plan = [
    ['May', 'I', 'come', 'in'],
    ['Open', 'your', 'books', 'to', 'page', 'ten'],
    ["I", "don't", 'understand', 'this', 'word'],
    ['Can', 'you', 'say', 'that', 'again', 'please'],
    ["Let's", 'read', 'the', 'text', 'together'],
  ];
  for (let i = 0; i < plan.length; i++) {
    for (const w of plan[i]) {
      for (const ch of w) key(ch);
      key(' ');
      await sleep(25);
    }
    await sleep(200);
    if (i < plan.length - 1) {
      key('Enter');
      await sleep(260);
    }
  }
  const before = { dbg: window.__dbg?.(), lastKey: window.__lastKey };
  const ins = [...document.querySelectorAll('.wb-input')];
  ins[ins.length - 1].dispatchEvent(
    new KeyboardEvent('keydown', { key: 'Enter', keyCode: 13, bubbles: true, cancelable: true })
  );
  await sleep(500);
  const after = { dbg: window.__dbg?.(), lastKey: window.__lastKey };
  const panel = document.querySelectorAll('.result-backdrop').length;
  // 如果没弹，点 next 按钮
  const btn = [...document.querySelectorAll('.khint button')].find((b) => b.textContent.includes('下一题'));
  btn?.click();
  await sleep(600);
  return { before, after, panelAfterEnter: panel, hasNextBtn: !!btn, panelAfterBtn: document.querySelectorAll('.result-backdrop').length };
})();
