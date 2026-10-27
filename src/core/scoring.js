/**
 * 计分与评级
 * 规则完全对齐 julebu.co 官方文档：
 *   连击 3+ +10%，5+ +20%，7+ +30%，10+ +50%，15+ +80%，20+ 翻倍
 *   Perfect = 首答正确且无退格、无提示；Great = 首答正确但按过退格
 *   提示 / 跳过 / 首答错误 都会中断连击
 *   结算评级 C → B → A → S → SS → SSS
 */

/** 连击加成档位，从高到低匹配 */
export const COMBO_TIERS = [
  { min: 20, mult: 2.0, label: '翻倍' },
  { min: 15, mult: 1.8, label: '+80%' },
  { min: 10, mult: 1.5, label: '+50%' },
  { min: 7, mult: 1.3, label: '+30%' },
  { min: 5, mult: 1.2, label: '+20%' },
  { min: 3, mult: 1.1, label: '+10%' },
  { min: 0, mult: 1.0, label: '' },
];

export function comboMultiplier(combo) {
  for (const t of COMBO_TIERS) {
    if (combo >= t.min) return t.mult;
  }
  return 1;
}

export function comboLabel(combo) {
  for (const t of COMBO_TIERS) {
    if (combo >= t.min) return t.label;
  }
  return '';
}

/** 每条句子的基础分：按词数计，长句自然更值钱 */
export function baseScore(wordCount) {
  return wordCount * 100;
}

/** 作答质量系数 */
export const QUALITY = {
  perfect: 1.0,
  great: 0.9,
  ok: 0.5, // 答对了但用过提示 / 首答错过
  fail: 0,
};

/**
 * 计算单句得分
 * @param {number} wordCount 词数
 * @param {'perfect'|'great'|'ok'|'fail'} quality
 * @param {number} combo 本题结算后的连击数
 */
export function sentenceScore(wordCount, quality, combo) {
  const q = QUALITY[quality] ?? 0;
  if (!q) return 0;
  return Math.round(baseScore(wordCount) * q * comboMultiplier(combo));
}

/**
 * 会话评级
 * @param {{total:number, firstTry:number, correct:number}} s
 */
export function gradeOf({ total, firstTry, correct }) {
  if (!total) return 'C';
  const ft = firstTry / total;
  const acc = correct / total;
  if (ft >= 0.95 && acc >= 0.98) return 'SSS';
  if (ft >= 0.85) return 'SS';
  if (ft >= 0.7) return 'S';
  if (acc >= 0.8) return 'A';
  if (acc >= 0.5) return 'B';
  return 'C';
}

export const GRADE_RANK = { C: 1, B: 2, A: 3, S: 4, SS: 5, SSS: 6 };

export function betterGrade(a, b) {
  return (GRADE_RANK[a] || 0) >= (GRADE_RANK[b] || 0) ? a : b;
}

/** 千分位 */
export function fmtNum(n) {
  return Math.round(n).toLocaleString('en-US');
}

/** 秒 → mm:ss / hh:mm:ss */
export function fmtDuration(sec) {
  const s = Math.max(0, Math.floor(sec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  const pad = (v) => String(v).padStart(2, '0');
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(ss)}` : `${pad(m)}:${pad(ss)}`;
}
