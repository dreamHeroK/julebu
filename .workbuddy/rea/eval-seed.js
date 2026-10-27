(() => {
  const now = Date.now();
  const D = 864e5;
  const item = (key, level, dueOffsetMs, extra = {}) => ({
    key,
    level,
    due: now + dueOffsetMs,
    reps: level + 2,
    lapses: 0,
    graduated: false,
    lastOutcome: 'perfect',
    lastAt: now - 3 * D,
    addedAt: now - 20 * D,
    ...extra,
  });

  const srs = {};
  [
    ['daily/greet#0', 1, -2 * D],
    ['daily/greet#1', 2, -3600e3, { lapses: 1 }],
    ['daily/greet#2', 3, -600e3],
    ['daily/life#0', 0, -30e3],
    ['daily/life#2', 4, -3 * D],
    ['grammar/there-be#0', 2, -5 * D],
    ['grammar/there-be#2', 3, -20 * D],
    ['grammar/tense#1', 2, -4 * D],
    ['ielts/people#0', 1, -8 * D],
    ['ielts/people#2', 3, -9 * D],
  ].forEach(([k, lvl, off, extra]) => {
    srs[k] = item(k, lvl, off, extra);
  });

  // 已毕业
  srs['daily/greet#4'] = {
    ...item('daily/greet#4', 8, 120 * D),
    graduated: true,
    reps: 14,
  };
  // 未来才到期
  srs['daily/life#1'] = item('daily/life#1', 5, 20 * D);
  srs['daily/life#3'] = item('daily/life#3', 4, 9 * D);

  localStorage.setItem(
    'julebu.app.v1',
    JSON.stringify({
      progress: {
        'daily/greet': { best: 'SSS', lastGrade: 'SSS', lastScore: 17310, plays: 6, lastAt: now },
        'daily/life': { best: 'S', lastGrade: 'A', lastScore: 8420, plays: 3, lastAt: now - D },
        'grammar/there-be': { best: 'A', lastGrade: 'A', lastScore: 5210, plays: 2, lastAt: now - 3 * D },
        'grammar/tense': { best: 'B', lastGrade: 'B', lastScore: 3180, plays: 1, lastAt: now - 5 * D },
        'ielts/people': { best: 'SS', lastGrade: 'SS', lastScore: 12900, plays: 4, lastAt: now - 2 * D },
      },
      srs,
      settings: { sound: true, comboAnim: true, rate: 1, showIpa: true },
      totals: { sessions: 16, sentences: 84, correct: 74, seconds: 1830, words: 512 },
    })
  );
  return { seeded: Object.keys(srs).length };
})();
