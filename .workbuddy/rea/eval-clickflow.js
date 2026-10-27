(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const key = (k) =>
    document.activeElement.dispatchEvent(
      new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true })
    );

  location.hash = '#/';
  await sleep(600);
  // 点进「课堂用语」课程卡片
  const card = [...document.querySelectorAll('.course-card')].find((c) =>
    c.textContent.includes('课堂用语')
  );
  card.click();
  await sleep(700);

  const plan = [
    ['May', 'I', 'come', 'in'],
    ['Open', 'your', 'books', 'to', 'page', 'ten'],
    ["I", "don't", 'understand', 'this', 'word'],
    ['Can', 'you', 'say', 'that', 'again', 'please'],
    ["Let's", 'read', 'the', 'text', 'together'],
  ];
  const perRound = [];
  for (let i = 0; i < plan.length; i++) {
    for (const w of plan[i]) {
      for (const ch of w) key(ch);
      key(' ');
      await sleep(30);
    }
    await sleep(160);
    perRound.push({
      t: document.querySelector('.pbar-title')?.textContent.replace(/\s+/g, ' '),
      s: document.querySelector('.score-val')?.textContent,
    });
    if (i < plan.length - 1) {
      key('Enter');
      await sleep(320);
    }
  }

  // 最后一句按 Enter 结算
  key('Enter');
  await sleep(900);
  return {
    perRound,
    panel: document.querySelectorAll('.result-backdrop').length,
    grade: document.querySelector('.r-grade, .grade')?.textContent?.trim(),
    score: document.querySelector('.r-score, .result .score')?.textContent?.trim(),
  };
})();
