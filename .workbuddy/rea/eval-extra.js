(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  location.hash = '#/';
  await sleep(600);
  const packs = [...document.querySelectorAll('.pack-title')].map((n) => n.textContent);
  const total = document.body.textContent.match(/共 (\d+) 句/)?.[1];

  // 进旅行课程打第一句：Where is the check-in counter?
  location.hash = '#/course/travel/airport';
  await sleep(700);
  const key = (k) =>
    document.activeElement.dispatchEvent(
      new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true })
    );
  const words1 = ['Where', 'is', 'the', 'check-in', 'counter'];
  for (const w of words1) {
    for (const ch of w) key(ch);
    key(' ');
    await sleep(40);
  }
  await sleep(200);
  const q1 = {
    title: document.querySelector('.pbar-title')?.textContent.replace(/\s+/g, ' '),
    score: document.querySelector('.score-val')?.textContent,
    allDone: [...document.querySelectorAll('.wb-input')].every((i) => i.classList.contains('done')),
  };
  key('Enter');
  await sleep(300);
  const q2 = document.querySelector('.pbar-title')?.textContent.replace(/\s+/g, ' ');

  // 面试课打一句
  location.hash = '#/course/work/interview';
  await sleep(600);
  for (const w of ['I', 'have', 'three', 'years', 'of', 'experience', 'in', 'marketing']) {
    for (const ch of w) key(ch);
    key(' ');
    await sleep(30);
  }
  await sleep(200);
  const q3 = {
    score: document.querySelector('.score-val')?.textContent,
    allDone: [...document.querySelectorAll('.wb-input')].every((i) => i.classList.contains('done')),
  };

  // SRS 收录
  const st = JSON.parse(localStorage.getItem('julebu.app.v1') || '{}');
  const keys = Object.keys(st.srs || {});
  return {
    packs,
    total,
    q1,
    q2,
    q3,
    srsNew: keys.filter((k) => k.startsWith('travel/') || k.startsWith('work/')),
    srsTotal: keys.length,
  };
})();
