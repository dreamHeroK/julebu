(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  location.hash = '#/profile';
  await sleep(400);
  const st = JSON.parse(localStorage.getItem('julebu.app.v1') || '{}');
  const keys = Object.keys(st.srs || {});
  return {
    srsCount: keys.length,
    vocabKeys: keys.filter((k) => k.includes('vocabulary')),
    sample: st.srs?.[keys.find((k) => k.includes('vocabulary')) || ''],
  };
})();
