(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const key = (k) =>
    document.activeElement.dispatchEvent(
      new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true })
    );
  location.hash = '#/';
  await sleep(400);
  const c0 = {
    stages: document.querySelectorAll('.stage').length,
    hintBars: document.querySelectorAll('.hint-bar').length,
  };
  [...document.querySelectorAll('.course-card')]
    .find((c) => c.textContent.includes('课堂用语'))
    .click();
  await sleep(800);
  const c1 = {
    stages: document.querySelectorAll('.stage').length,
    hintBars: document.querySelectorAll('.hint-bar').length,
    inputs: document.querySelectorAll('.wb-input').length,
  };
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
  const ins = [...document.querySelectorAll('.wb-input')];
  const c2 = {
    inputs: ins.length,
    focusIdx: ins.indexOf(document.activeElement),
    hint: document.querySelector('.hint-bar')?.textContent.replace(/\s+/g, ' '),
    nextBtnDisplay: document.querySelector('.hint-bar button')?.style.display,
    stages: document.querySelectorAll('.stage').length,
  };
  // 点「下一题」
  const btn = [...document.querySelectorAll('.hint-bar button')].find((b) => b.textContent.includes('下一题'));
  btn?.click();
  await sleep(700);
  return { c0, c1, c2, panel: document.querySelectorAll('.result-backdrop').length, hasBtn: !!btn };
})();
