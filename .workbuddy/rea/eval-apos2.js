(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const key = (k) =>
    document.activeElement.dispatchEvent(
      new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true })
    );
  const typeSentence = async (words) => {
    for (const w of words) {
      for (const ch of w) key(ch);
      key(' ');
      await sleep(35);
    }
    await sleep(200);
  };
  const title = () => document.querySelector('.pbar-title')?.textContent.replace(/\s+/g, ' ');

  // 课堂用语 5 句（含 don't / Let's）
  location.hash = '#/course/kids/classroom';
  await sleep(700);
  const plan1 = [
    ['May', 'I', 'come', 'in'],
    ['Open', 'your', 'books', 'to', 'page', 'ten'],
    ["I", "don't", 'understand', 'this', 'word'],
    ['Can', 'you', 'say', 'that', 'again', 'please'],
    ["Let's", 'read', 'the', 'text', 'together'],
  ];
  const rounds = [];
  for (let i = 0; i < plan1.length; i++) {
    await typeSentence(plan1[i]);
    const ins = [...document.querySelectorAll('.wb-input')];
    rounds.push({
      title: title(),
      allDone: ins.every((x) => x.classList.contains('done')),
      vals: ins.map((x) => x.value),
      score: document.querySelector('.score-val')?.textContent,
    });
    if (i < plan1.length - 1) {
      key('Enter');
      await sleep(350);
    }
  }
  const beforeSubmit = title();
  key('Enter');
  await sleep(500);
  const hasResult = !!document.querySelector('.result-backdrop');

  const last = rounds[rounds.length - 1];
  return {
    ok: rounds.every((r) => r.allDone),
    s5: { title: last.title, vals: last.vals, score: last.score },
    beforeSubmit,
    hasResult,
    grade: document.querySelector('.grade')?.textContent,
    maxCombo: document.querySelector('.rc-val')?.textContent,
  };
})();
