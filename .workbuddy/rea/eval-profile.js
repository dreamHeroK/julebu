(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  location.hash = '#/profile';
  await sleep(400);
  return {
    kpis: [...document.querySelectorAll('.kpi .v')].map((n) => n.textContent),
    rows: document.querySelectorAll('.list-row').length,
  };
})();
