(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const key = (k) =>
    document.activeElement.dispatchEvent(
      new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true })
    );
  location.hash = '#/course/kids/classroom';
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
      await sleep(30);
    }
    await sleep(150);
    if (i < plan.length - 1) {
      key('Enter');
      await sleep(320);
    }
  }
  const stateAfterLast = {
    active: document.activeElement?.className,
    hintText: document.querySelector('.hint-bar')?.textContent?.slice(0, 40),
  };
  key('Enter');
  await sleep(900);
  return {
    stateAfterLast,
    backdrops: document.querySelectorAll('.result-backdrop').length,
    hasText: document.body.textContent.includes('练习结算'),
    score: document.querySelector('.score-val')?.textContent,
  };
})();
