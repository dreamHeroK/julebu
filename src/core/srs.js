/**
 * 间隔重复（SRS）
 * 对齐官方文档的说法：
 *   首答正确且无修改 → 间隔拉长
 *   答对但有修改     → 间隔适当拉长
 *   用提示 / 首答错   → 间隔缩短
 *   跳过 / 直接看答案 → 很快再次推荐
 *   间隔拉到最长（半年）→ 毕业，不再推荐；若毕业后又答错则复活
 */

/** 复习间隔（天）。最后一级 = 毕业阈值 */
export const INTERVALS = [1, 2, 4, 7, 15, 30, 60, 120, 180];

const MIN = 60 * 1000;
const DAY = 24 * 60 * MIN;

export function newItem(key, now = Date.now()) {
  return {
    key,
    level: 0,
    due: now,
    reps: 0,
    lapses: 0,
    graduated: false,
    lastOutcome: null,
    lastAt: 0,
    addedAt: now,
  };
}

/**
 * 根据一次作答结果推进记忆状态
 * @param {object} item
 * @param {'perfect'|'great'|'ok'|'fail'} outcome
 */
export function advance(item, outcome, now = Date.now()) {
  const next = { ...item, reps: item.reps + 1, lastOutcome: outcome, lastAt: now };
  let level = item.level;

  switch (outcome) {
    case 'perfect':
      level = level + 2;
      break;
    case 'great':
      level = level + 1;
      break;
    case 'ok':
      // 答对了但过程不顺：原地重复同一档间隔
      level = Math.max(0, level);
      break;
    case 'fail':
    default:
      level = 0;
      next.lapses = item.lapses + 1;
      next.graduated = false; // 已毕业的会「复活」
      break;
  }

  const maxLevel = INTERVALS.length - 1;
  if (level > maxLevel) {
    next.graduated = true;
    next.level = maxLevel;
    next.due = now + INTERVALS[maxLevel] * DAY;
    return next;
  }

  next.level = level;
  next.graduated = false;

  if (outcome === 'fail') {
    next.due = now + 10 * MIN; // 基本没记住 → 10 分钟后又能练到
  } else if (outcome === 'ok') {
    next.due = now + Math.max(INTERVALS[level], 1) * DAY;
  } else {
    next.due = now + INTERVALS[level] * DAY;
  }
  return next;
}

export function isDue(item, now = Date.now()) {
  return !item.graduated && item.due <= now;
}

/** 掌握度百分比（0-100），按当前所处间隔档位估算 */
export function mastery(item) {
  if (!item) return 0;
  if (item.graduated) return 100;
  return Math.round((item.level / (INTERVALS.length - 1)) * 100);
}

/** 距离下次复习的人类可读文案 */
export function dueLabel(item, now = Date.now()) {
  if (item.graduated) return '已毕业';
  const d = item.due - now;
  if (d <= 0) return '现在该复习';
  const min = Math.round(d / MIN);
  if (min < 60) return `${min} 分钟后`;
  const h = Math.round(min / 60);
  if (h < 24) return `${h} 小时后`;
  return `${Math.round(h / 24)} 天后`;
}

/**
 * 从复习池里挑出今日推荐
 * @param {Record<string, object>} pool
 * @param {number} limit
 */
export function pickDue(pool, limit = 10, now = Date.now()) {
  return Object.values(pool)
    .filter((it) => isDue(it, now))
    .sort((a, b) => {
      // 越早到期越优先；答错过的提前
      const la = a.lapses * 6e5;
      const lb = b.lapses * 6e5;
      return a.due - la - (b.due - lb);
    })
    .slice(0, limit);
}
