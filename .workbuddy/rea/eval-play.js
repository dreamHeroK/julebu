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

  const SENT = ['Nice to meet you', 'I am a student from China', 'How are you doing today'];
  for (let i = 0; i < SENT.length; i++) {
    for (const w of SENT[i].split(' ')) typeWord(w);
    await sleep(80);
    if (i < SENT.length - 1) {
      key('Enter');
      await sleep(150);
    }
  }
  await sleep(120);

  return {
    doneWords: document.querySelectorAll('.wb.done').length,
    comboPops: document.querySelectorAll('.combo-pop').length,
    comboText: document.querySelector('.combo-pop')?.textContent || null,
    score: document.querySelector('.score-val')?.textContent,
    progress: document.querySelector('.progress-fill')?.style.width,
  };
})();
