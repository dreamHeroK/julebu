/**
 * 核心逻辑测试（不依赖浏览器）
 * 运行：node test/engine.test.mjs
 */
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  comboMultiplier,
  comboLabel,
  sentenceScore,
  gradeOf,
  fmtNum,
  fmtDuration,
} from '../src/core/scoring.js';
import { INTERVALS, newItem, advance, isDue, mastery, dueLabel, pickDue } from '../src/core/srs.js';
import { createTypingEngine } from '../src/core/typing.js';
import { getSentence, PACKS, ALL_COURSES, TOTAL_SENTENCES } from '../src/data/courses.js';

/* ---------------------------------- 计分 --------------------------------- */

test('连击加成档位对齐官方文档', () => {
  const cases = [
    [0, 1.0], [1, 1.0], [2, 1.0],
    [3, 1.1], [4, 1.1],
    [5, 1.2], [6, 1.2],
    [7, 1.3], [9, 1.3],
    [10, 1.5], [14, 1.5],
    [15, 1.8], [19, 1.8],
    [20, 2.0], [50, 2.0],
  ];
  for (const [combo, mult] of cases) {
    assert.equal(comboMultiplier(combo), mult, `combo=${combo}`);
  }
  assert.equal(comboLabel(20), '翻倍');
  assert.equal(comboLabel(3), '+10%');
  assert.equal(comboLabel(1), '');
});

test('单句得分 = 词数 × 100 × 质量 × 连击系数', () => {
  assert.equal(sentenceScore(6, 'perfect', 0), 600);
  assert.equal(sentenceScore(6, 'perfect', 13), 900); // 1.5x
  assert.equal(sentenceScore(6, 'great', 0), 540); // 0.9
  assert.equal(sentenceScore(6, 'ok', 20), 600); // 0.5 × 2.0
  assert.equal(sentenceScore(6, 'fail', 20), 0);
});

test('评级阈值', () => {
  assert.equal(gradeOf({ total: 10, firstTry: 10, correct: 10 }), 'SSS');
  assert.equal(gradeOf({ total: 10, firstTry: 9, correct: 10 }), 'SS'); // 90% 首答
  assert.equal(gradeOf({ total: 10, firstTry: 7, correct: 10 }), 'S');
  assert.equal(gradeOf({ total: 10, firstTry: 5, correct: 9 }), 'A');
  assert.equal(gradeOf({ total: 10, firstTry: 2, correct: 6 }), 'B');
  assert.equal(gradeOf({ total: 10, firstTry: 0, correct: 2 }), 'C');
});

test('格式化', () => {
  assert.equal(fmtNum(17310), '17,310');
  assert.equal(fmtDuration(27), '00:27');
  assert.equal(fmtDuration(583), '09:43');
  assert.equal(fmtDuration(3725), '01:02:05');
});

/* ----------------------------------- SRS --------------------------------- */

test('SRS：答得越好间隔跳得越快，到顶即毕业', () => {
  let it = newItem('k', 0);
  assert.equal(it.level, 0);
  assert.equal(dueLabel(it, 0), '现在该复习');

  it = advance(it, 'perfect', 0);
  assert.equal(it.level, 2);
  assert.equal(it.due, INTERVALS[2] * 864e5);

  it = advance(it, 'perfect', 0); // level 4
  it = advance(it, 'great', 0); // level 5
  assert.equal(it.level, 5);

  // 一路 perfect 直到超过最大档
  for (let i = 0; i < 5; i++) it = advance(it, 'perfect', 0);
  assert.equal(it.graduated, true);
  assert.equal(it.level, INTERVALS.length - 1);
  assert.equal(mastery(it), 100);
  assert.equal(isDue(it, Date.now() + 1e9), false); // 已毕业 → 不再进复习队列
});

test('SRS：答错回退并很快重现，毕业后答错会复活', () => {
  let it = { ...newItem('k', 0), level: 6, graduated: true, lapses: 0 };
  it = advance(it, 'fail', 1000);
  assert.equal(it.level, 0);
  assert.equal(it.graduated, false);
  assert.equal(it.lapses, 1);
  assert.equal(it.due, 1000 + 10 * 60 * 1000);
});

test('SRS：答对但用了提示只原地重复', () => {
  let it = { ...newItem('k', 0), level: 4 };
  it = advance(it, 'ok', 0);
  assert.equal(it.level, 4);
  assert.equal(it.due, INTERVALS[4] * 864e5);
});

test('复习队列：只取到期项，按到期时间优先', () => {
  const now = 10 * 864e5;
  const pool = {
    a: { ...newItem('a', 0), due: now - 1000 },
    b: { ...newItem('b', 0), due: now + 864e5 },
    c: { ...newItem('c', 0), due: now - 5000, lapses: 2 },
  };
  const picked = pickDue(pool, 10, now).map((x) => x.key);
  assert.deepEqual(picked.sort(), ['a', 'c']);
  assert.equal(pickDue(pool, 1, now).length, 1);
});

/* --------------------------------- 打字引擎 ------------------------------- */

function typeAll(engine, sentence) {
  sentence.w.forEach((w) => {
    for (const ch of w.t) engine.typeChar(ch);
    engine.typeChar(' ');
  });
}

const FIXTURE = getSentence('daily/greet#0'); // "Nice to meet you."

test('首答正确且无退格 → perfect', () => {
  let outcome = null;
  const engine = createTypingEngine(FIXTURE, { onFinish: (o) => (outcome = o) });
  typeAll(engine, FIXTURE);
  assert.equal(outcome, 'perfect');
  assert.equal(engine.state.finished, true);
  assert.ok(engine.state.words.every((w) => w.status === 'done'));
});

test('打错一个字母后修正 → ok（不再算首答正确）', () => {
  let outcome = null;
  const engine = createTypingEngine(FIXTURE, { onFinish: (o) => (outcome = o) });
  engine.typeChar('n');
  engine.typeChar('x'); // 打错
  engine.typeChar(' ');
  assert.equal(engine.state.wrongCount, 1);
  // 清空重打
  engine.state.buffer = '';
  typeAll(engine, FIXTURE);
  assert.equal(outcome, 'ok');
});

test('用过退格 → great，连击不断但分数打折', () => {
  let outcome = null;
  const engine = createTypingEngine(FIXTURE, { onFinish: (o) => (outcome = o) });
  engine.typeChar('n');
  engine.typeChar('i');
  engine.typeChar('c');
  engine.typeChar('e');
  engine.typeChar('x');
  engine.backspace();
  engine.typeChar(' ');
  typeAll({ ...engine, state: engine.state }, { w: FIXTURE.w.slice(1) });
  assert.equal(outcome, 'great');
  assert.equal(engine.state.backspaced, true);
});

test('用提示 → ok，且提示会逐字母揭示', () => {
  let outcome = null;
  const engine = createTypingEngine(FIXTURE, { onFinish: (o) => (outcome = o) });
  engine.hint();
  assert.equal(engine.state.buffer, 'N'); // 首字母（保留原始大小写）
  engine.hint();
  assert.equal(engine.state.buffer, 'Ni');
  engine.hint();
  engine.hint();
  assert.equal(engine.state.buffer, 'Nice');
  engine.typeChar(' ');
  for (const w of FIXTURE.w.slice(1)) {
    for (const ch of w.t) engine.typeChar(ch);
    engine.typeChar(' ');
  }
  assert.equal(outcome, 'ok');
});

test('看答案 = 跳过，outcome 为 fail', () => {
  let outcome = null;
  const engine = createTypingEngine(FIXTURE, { onFinish: (o) => (outcome = o) });
  engine.typeChar('N');
  engine.reveal();
  assert.equal(outcome, 'fail');
  assert.ok(engine.state.words.every((w) => w.status === 'done'));
});

test('大小写与标点不敏感', () => {
  let outcome = null;
  const engine = createTypingEngine(FIXTURE, { onFinish: (o) => (outcome = o) });
  for (const ch of 'nice') engine.typeChar(ch);
  engine.typeChar(' ');
  assert.equal(engine.state.words[0].status, 'done');
  assert.equal(outcome, null);
});

/* --------------------------------- 内容完整性 ----------------------------- */

test('课程数据完整：每句都有音标/词性/释义，词表能拼回原句', () => {
  assert.ok(TOTAL_SENTENCES >= 20, `句子总数 ${TOTAL_SENTENCES}`);
  assert.equal(ALL_COURSES.length, PACKS.reduce((s, p) => s + p.courses.length, 0));

  const seen = new Set();
  for (const s of PACKS.flatMap((p) => p.courses.flatMap((c) => c.sentences))) {
    assert.ok(!seen.has(s.en), `重复句子：${s.en}`);
    seen.add(s.en);

    assert.ok(s.zh && s.zh.length > 0, `缺中文：${s.en}`);
    for (const w of s.w) {
      assert.ok(w.t && w.ipa && w.pos && w.cn, `词条信息不全：${s.en} / ${w.t}`);
      assert.ok(w.ipa.startsWith('/') && w.ipa.endsWith('/'), `音标格式：${w.ipa}`);
      assert.equal(typeof w.chunk, 'number', `语块编号：${w.t}`);
    }

    // 词表拼回去应该等于原句（去掉句末标点后比较）
    const rebuilt = s.w.map((w) => w.t).join(' ');
    const norm = (x) => x.toLowerCase().replace(/[.,!?;:]/g, '').trim();
    assert.equal(norm(rebuilt), norm(s.en), `词表与句子不一致：${s.en} ≠ ${rebuilt}`);

    // 语块编号必须连续递增，且相邻同号才合并
    let last = -1;
    for (const w of s.w) {
      assert.ok(w.chunk >= last, `语块编号乱序：${s.en}`);
      last = w.chunk;
    }
  }
});

test('getCourse / courseSentences 可正常反查', async () => {
  const { getCourse, courseSentences } = await import('../src/data/courses.js');
  const c = getCourse('daily', 'greet');
  assert.ok(c);
  const list = courseSentences(c);
  assert.equal(list.length, 5);
  assert.equal(list[0].key, 'daily/greet#0');
  assert.equal(getSentence('daily/greet#0').en, 'Nice to meet you.');
  assert.equal(getCourse('nope', 'nope'), null);
});

test('课程包结构完整：id/标题/标签/简介齐全，包 id 与课程 id 不重复', () => {
  const packIds = new Set();
  const courseIds = new Set();
  for (const p of PACKS) {
    assert.ok(p.id && p.title && p.tag && p.desc, `课程包字段缺失：${p.id || p.title}`);
    assert.ok(!packIds.has(p.id), `重复的包 id：${p.id}`);
    packIds.add(p.id);
    assert.ok(p.courses.length > 0, `空课程包：${p.id}`);
    for (const c of p.courses) {
      assert.ok(c.id && c.name, `课程字段缺失：${p.id}`);
      const key = `${p.id}/${c.id}`;
      assert.ok(!courseIds.has(key), `重复的课程 id：${key}`);
      courseIds.add(key);
      assert.ok(c.sentences.length > 0, `空课程：${key}`);
      assert.ok(c.sentences.every((s) => s.w.length >= 2), `句子过短：${key}`);
    }
  }
  assert.ok(PACKS.length >= 8, `课程包数量 ${PACKS.length}`);
  assert.ok(courseIds.size >= 20, `课程数量 ${courseIds.size}`);
});

test('nextCourse：先未练过的课，再未到 SSS 的课，全 SSS 回到第一课', async () => {
  const { nextCourse } = await import('../src/views/home.js');
  const { recordCourseResult, resetAll } = await import('../src/store.js');
  const pack = PACKS.find((p) => p.id === 'dev');
  const [c0, c1] = pack.courses;
  resetAll();
  assert.equal(nextCourse(pack).id, c0.id);
  recordCourseResult('dev', c0.id, { grade: 'A', score: 1, seconds: 1, sentences: 1 });
  assert.equal(nextCourse(pack).id, c1.id);
  for (const c of pack.courses.slice(1)) {
    recordCourseResult('dev', c.id, { grade: 'SSS', score: 1, seconds: 1, sentences: 1 });
  }
  assert.equal(nextCourse(pack).id, c0.id, '全部练过，回到唯一没 SSS 的第一课');
  recordCourseResult('dev', c0.id, { grade: 'SSS', score: 1, seconds: 1, sentences: 1 });
  assert.equal(nextCourse(pack).id, c0.id);
  resetAll();
});

test('词典写法：语块字符串自动查词，支持覆盖，缺词/不一致直接报错', async () => {
  const { s } = await import('../src/data/lexicon.js');
  const a = s('Nice to meet you.', '很高兴认识你。', 'Nice to | meet | you');
  assert.deepEqual(a.w.map((w) => [w.t, w.chunk]), [['Nice', 0], ['to', 0], ['meet', 1], ['you', 2]]);
  assert.ok(a.w.every((w) => w.ipa && w.pos && w.cn));

  const b = s('I want to book a room.', '我想订个房间。', 'I want | to book | a room', { book: ['/bʊk/', '动词', '预订'] });
  assert.equal(b.w[3].cn, '预订');

  assert.throws(() => s('Zyxq is here.', '', 'Zyxq | is here'), /词典缺词「Zyxq」/);
  assert.throws(() => s('Nice to meet you.', '', 'Nice to | you'), /语块与句子不一致/);
});

test('首页分组：每个课程包恰好出现一次', async () => {
  const { groupPacks } = await import('../src/views/home.js');
  const ids = groupPacks().flatMap(([, packs]) => packs.map((p) => p.id));
  assert.deepEqual([...ids].sort(), PACKS.map((p) => p.id).sort());
});
