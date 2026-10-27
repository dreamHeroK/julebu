/**
 * 本地持久化（localStorage）
 * 保存：课程最佳评级、每句的 SRS 状态、设置、累计统计
 */

import { advance, newItem, mastery, isDue } from './core/srs.js';
import { betterGrade } from './core/scoring.js';

const KEY = 'julebu.app.v1';

const DEFAULTS = {
  progress: {}, // `${packId}/${courseId}` → { best, lastScore, plays, lastAt }
  srs: {}, // sentenceKey → srs item
  settings: { sound: true, comboAnim: true, rate: 1, showIpa: true, wordHints: false },
  totals: { sessions: 0, sentences: 0, correct: 0, seconds: 0, words: 0 },
};

function clone(o) {
  return JSON.parse(JSON.stringify(o));
}

let state = clone(DEFAULTS);

export function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      state = {
        ...clone(DEFAULTS),
        ...parsed,
        settings: { ...DEFAULTS.settings, ...(parsed.settings || {}) },
        totals: { ...DEFAULTS.totals, ...(parsed.totals || {}) },
        progress: parsed.progress || {},
        srs: parsed.srs || {},
      };
    }
  } catch (e) {
    console.warn('[store] 读取本地数据失败，使用默认状态', e);
  }
  return state;
}

export function getState() {
  return state;
}

let saveTimer = 0;
export function save() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('[store] 写入失败', e);
    }
  }, 60);
}

export function updateSettings(patch) {
  state.settings = { ...state.settings, ...patch };
  save();
}

/* ------------------------------------------------------------------ */
/* 课程进度                                                            */
/* ------------------------------------------------------------------ */

export function courseProgress(packId, courseId) {
  return state.progress[`${packId}/${courseId}`] || null;
}

export function recordCourseResult(packId, courseId, { grade, score, seconds, sentences }) {
  const k = `${packId}/${courseId}`;
  const prev = state.progress[k] || { best: null, lastScore: 0, plays: 0, lastAt: 0 };
  state.progress[k] = {
    best: prev.best ? betterGrade(prev.best, grade) : grade,
    lastGrade: grade,
    lastScore: Math.max(prev.lastScore || 0, score),
    plays: (prev.plays || 0) + 1,
    lastAt: Date.now(),
  };
  state.totals.sessions += 1;
  state.totals.sentences += sentences;
  state.totals.seconds += seconds;
  save();
}

/* ------------------------------------------------------------------ */
/* 复习池                                                              */
/* ------------------------------------------------------------------ */

export function touchSentence(sentenceKey, outcome, wordCount = 0) {
  const prev = state.srs[sentenceKey] || newItem(sentenceKey);
  state.srs[sentenceKey] = advance(prev, outcome);
  state.totals.words += wordCount;
  if (outcome === 'perfect' || outcome === 'great' || outcome === 'ok') {
    state.totals.correct += 1;
  }
  save();
}

export function getSrsItem(sentenceKey) {
  return state.srs[sentenceKey] || null;
}

export function srsPool() {
  return state.srs;
}

/** 学习档案用的汇总 */
export function overview() {
  const items = Object.values(state.srs);
  const total = items.length;
  const due = items.filter((it) => isDue(it)).length;
  const graduated = items.filter((it) => it.graduated).length;
  const avg = total
    ? Math.round(items.reduce((sum, it) => sum + mastery(it), 0) / total)
    : 0;
  const grades = Object.values(state.progress).map((p) => p.best).filter(Boolean);
  const bestCount = grades.filter((g) => g === 'SSS').length;

  return {
    tracked: total,
    due,
    graduated,
    avgMastery: avg,
    coursesStarted: Object.keys(state.progress).length,
    bestCount,
    sessions: state.totals.sessions,
    sentences: state.totals.sentences,
    seconds: state.totals.seconds,
  };
}

export function resetAll() {
  state = clone(DEFAULTS);
  try {
    localStorage.removeItem(KEY);
  } catch (e) {
    /* ignore */
  }
}
