(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  location.hash = '#/course/vocabulary/vocab-food';
  await sleep(700);
  const key = (k) =>
    document.activeElement.dispatchEvent(
      new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true })
    );
  for (const w of ['I', 'ordered', 'fried', 'chicken', 'for', 'dinner']) {
    for (const ch of w) key(ch);
    key(' ');
    await sleep(40);
  }
  await sleep(200);
  const afterQ1 = {
    score: document.querySelector('.score-val')?.textContent,
    allDone: [...document.querySelectorAll('.wb-input')].every((i) => i.classList.contains('done')),
  };
  key('Enter');
  await sleep(300);
  const q2 = document.querySelector('.pbar-title')?.textContent.replace(/\s+/g, ' ');

  location.hash = '#/review';
  await sleep(500);
  const review = {
    due: document.querySelector('.review-hero .big')?.textContent,
    hasVocab: [...document.querySelectorAll('.list-row')].some((r) => r.textContent.includes('fried chicken')),
  };
  return { afterQ1, q2, review };
})();
