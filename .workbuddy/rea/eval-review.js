(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  location.hash = '#/review';
  await sleep(400);
  return {
    due: document.querySelector('.review-hero .big')?.textContent,
    rows: document.querySelectorAll('.list-row').length,
    empty: !!document.querySelector('.empty'),
  };
})();
