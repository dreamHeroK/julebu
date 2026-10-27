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
      await sleep(30);
    }
    await sleep(150);
  };

  // Let's read the text together.
  location.hash = '#/course/kids/classroom';
  await sleep(700);
  for (let i = 0; i < 4; i++) {
    key('Enter');
    await sleep(250);
  }
  const title1 = document.querySelector('.pbar-title')?.textContent.replace(/\s+/g, ' ');
  await typeSentence(["Let's", 'read', 'the', 'text', 'together']);
  const r1 = {
    title: title1,
    score: document.querySelector('.score-val')?.textContent,
    allDone: [...document.querySelectorAll('.wb-input')].every((i) => i.classList.contains('done')),
  };

  // grandparents' 句
  location.hash = '#/course/kids/family';
  await sleep(600);
  for (let i = 0; i < 4; i++) {
    key('Enter');
    await sleep(250);
  }
  await typeSentence(['We', 'often', 'have', 'dinner', 'at', 'my', "grandparents'", 'home']);
  const inputs = [...document.querySelectorAll('.wb-input')];
  const r2 = {
    score: document.querySelector('.score-val')?.textContent,
    vals: inputs.map((i) => i.value),
    allDone: inputs.every((i) => i.classList.contains('done')),
  };

  key('Enter');
  await sleep(400);
  const panel = document.querySelector('.result-panel, .result-card, .result');
  return { r1, r2, resultShown: !!panel, grade: document.querySelector('.grade')?.textContent };
})();
