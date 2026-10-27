(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  location.hash = '#/profile';
  await sleep(500);
  const kpis = [...document.querySelectorAll('.kpi .v')].map((n) => n.textContent);
  const raw = JSON.parse(localStorage.getItem('julebu.state.v1') || '{}');
  const keys = Object.keys(raw.srs || {});
  return { kpis, hasVocabKey: keys.some((k) => k.includes('vocabulary')), srsCount: keys.length };
})();
