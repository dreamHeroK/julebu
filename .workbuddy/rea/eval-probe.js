(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const key = (k) =>
    document.activeElement.dispatchEvent(
      new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true })
    );
  const snap = (tag) => ({
    tag,
    title: document.querySelector('.pbar-title')?.textContent.replace(/\s+/g, ' '),
    panel: document.querySelectorAll('.result-backdrop').length,
    bodyTail: document.body.textContent.trim().slice(-30),
  });

  location.hash = '#/';
  await sleep(500);
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
      await sleep(28);
    }
    await sleep(200);
    if (i < plan.length - 1) {
      key('Enter');
      await sleep(300);
    }
  }
  const a = snap('after-typing');
  // 方式 1：document 上派发 Enter
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
  await sleep(600);
  const b = snap('doc-enter');
  // 方式 2：点击舞台
  document.querySelector('.stage')?.click();
  await sleep(600);
  const c = snap('click');
  // 方式 3：点「下一题」按钮
  document.querySelector('.hint-bar button')?.click();
  await sleep(700);
  const d = snap('next-btn');
  return { a, b, c, d, hash: location.hash };
})();
