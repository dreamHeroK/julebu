(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  location.hash = '#/';
  await sleep(500);
  const packs = [...document.querySelectorAll('.pack')].map((p) => ({
    title: p.querySelector('.pack-title')?.textContent.trim(),
    tag: p.querySelector('.tag')?.textContent.trim(),
    courses: p.querySelectorAll('.course-card').length,
  }));
  window.scrollTo(0, 900);
  await sleep(300);
  return packs;
})();
