(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const key = (k) =>
    document.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));
  const typeWord = (w) => {
    for (const ch of w) key(ch);
    key(' ');
  };

  location.hash = '#/course/daily/greet';
  await sleep(500);

  const SENT = [
    'Nice to meet you',
    'I am a student from China',
    'How are you doing today',
    'I am fine thank you',
    'See you tomorrow morning',
  ];

  for (let i = 0; i < SENT.length; i++) {
    for (const w of SENT[i].split(' ')) typeWord(w);
    await sleep(60);
    key('Enter');
    await sleep(140);
  }
  await sleep(400);

  return {
    resultOpen: !!document.querySelector('.result-backdrop'),
    grade: document.querySelector('.r-grade')?.textContent,
    score: document.querySelector('.r-score')?.textContent,
    counts: [...document.querySelectorAll('.r-counts .n')].map((n) => n.textContent),
    stats: [...document.querySelectorAll('.r-stats .v')].map((n) => n.textContent),
    gauges: [...document.querySelectorAll('.gauge .val')].map((n) => n.textContent),
  };
})();
