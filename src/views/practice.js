/**
 * 练习界面 —— 核心玩法
 * 逐词打字 → Perfect/Great 判定 → 连击加成 → 结算评级
 */

import { h, clear, toast } from '../dom.js';
import { createTypingEngine } from '../core/typing.js';
import {
  sentenceScore,
  gradeOf,
  fmtNum,
  fmtDuration,
  comboMultiplier,
  comboLabel,
} from '../core/scoring.js';
import { speak } from '../core/speech.js';
import * as sfx from '../core/sfx.js';
import { touchSentence, recordCourseResult, getState } from '../store.js';
import { QUOTES, PACKS } from '../data/courses.js';

const PALETTE = 8;

function chunkClasses(i, words) {
  const cur = words[i].chunk;
  const prev = i > 0 ? words[i - 1].chunk : null;
  const next = i < words.length - 1 ? words[i + 1].chunk : null;
  const start = prev === null || prev !== cur;
  const end = next === null || next !== cur;
  if (start && end) return 'chunk-start chunk-end';
  if (start) return 'chunk-start';
  if (end) return 'chunk-end';
  return 'chunk-mid';
}

export function mountPractice(root, opts) {
  const { sentences, title, packId = null, courseId = null, onExit } = opts;

  let idx = 0;
  let score = 0;
  let combo = 0;
  let maxCombo = 0;
  let records = [];
  let awaitingNext = false;
  let resultOpen = false;
  let sentenceSpeaks = 0;
  let mode = opts.mode || 'cn2en'; // cn2en | dictation
  let engine = null;
  let startedAt = Date.now();
  let totalMs = 0;
  let wordItems = []; // [{ inp, cell }] 每词一个输入框

  /* ---------------- 骨架 ---------------- */
  const scoreEl = h('span', { class: 'score-val' }, '0');
  const timerEl = h('span', { class: 'timer' }, '00:00');
  const titleEl = h('div', { class: 'pbar-title' });
  const fillEl = h('div', { class: 'progress-fill', style: { width: '0%' } });
  const comboLayer = h('div', { class: 'combo-layer' });
  const wordsEl = h('div', { class: 'words' });
  const zhEl = h('div', { class: 'zh-line' });
  const nextBtn = h('button', { class: 'btn btn-primary btn-sm', onclick: () => next(), style: { display: 'none' } }, '下一题 →');
  const modeBtn = h('button', { class: 'mode-btn', onclick: () => switchMode() }, '');

  const hintBar = h('footer', { class: 'khint' });

  const stage = h('main', { class: 'stage' }, [
    comboLayer,
    h('div', { class: 'sentence-wrap' }, [wordsEl, zhEl]),
  ]);

  const view = h('div', { class: 'practice' }, [
    h('header', { class: 'pbar' }, [
      h('button', { class: 'icon-btn', title: '退出练习 (Esc)', onclick: () => exit() }, '✕'),
      titleEl,
      h('div', { class: 'pbar-right' }, [modeBtn, scoreEl, timerEl]),
    ]),
    h('div', { class: 'progress-track' }, [fillEl]),
    stage,
    hintBar,
  ]);

  root.appendChild(view);

  /* ---------------- 计时 ---------------- */
  const timerId = setInterval(() => {
    if (resultOpen) return;
    timerEl.textContent = fmtDuration((Date.now() - startedAt) / 1000);
  }, 250);

  /* ---------------- 提示栏 ---------------- */
  function renderHints() {
    clear(hintBar);
    hintBar.append(
      h('span', {}, [h('kbd', {}, "Ctrl+'"), ' 播放发音']),
      h('span', {}, [h('kbd', {}, 'Tab'), ' 提示']),
      awaitingNext
        ? h('span', {}, [h('kbd', {}, 'Enter'), ' 下一题'])
        : h('span', {}, [h('kbd', {}, 'Backspace'), ' 退格']),
      h('span', {}, [h('kbd', {}, 'Esc'), ' 退出'])
    );
    if (awaitingNext) {
      nextBtn.style.display = '';
      hintBar.appendChild(nextBtn);
    } else {
      nextBtn.style.display = 'none';
    }
  }

  /* ---------------- 句子渲染：每个单词一个输入框 ---------------- */
  function buildWordCells(sent) {
    clear(wordsEl);
    const dictation = mode === 'dictation';
    const showIpa = !dictation && getState().settings.showIpa !== false;

    wordItems = sent.w.map((w, i) => {
      const inp = h('input', {
        class: `wb wb-input ${chunkClasses(i, sent.w)}`,
        type: 'text',
        inputmode: 'latin',
        autocomplete: 'off',
        autocapitalize: 'off',
        autocorrect: 'off',
        spellcheck: 'false',
      });
      inp.addEventListener('keydown', onWordKey);

      const meta = dictation
        ? null
        : h('div', { class: 'meta' }, [
            h('span', { class: 'pos' }, w.pos),
            h('span', { class: 'cn' }, w.cn),
          ]);

      const cell = h('div', { class: 'cell' }, [
        showIpa ? h('div', { class: 'ipa' }, w.ipa) : null,
        inp,
        meta,
      ]);
      wordsEl.appendChild(cell);
      return { inp, cell, text: w.t };
    });

    sizeInputs();
  }

  /**
   * 词块尺寸：canvas 实测文字宽度定宽 + 长句自动微缩字号。
   * 目标是一行放下，放不下才折行（折行时避免只剩一个词的孤行）。
   */
  function sizeInputs() {
    if (!wordItems.length) return;
    const first = wordItems[0].inp;
    const cs = getComputedStyle(first);
    const base = parseFloat(cs.fontSize) || 32;
    const family = cs.fontFamily;
    const weight = cs.fontWeight;
    const gap = 8;
    const containerW = wordsEl.clientWidth || 1160;
    // 留 6px 安全边距：宽度是整数像素，取整后容易差 1px 就折行
    const avail = containerW - gap * (wordItems.length - 1) - 6;
    const ctx = sizeInputs._ctx || (sizeInputs._ctx = document.createElement('canvas').getContext('2d'));

    const measureAt = (fs) => {
      ctx.font = `${weight} ${fs}px ${family}`;
      const k = fs / base;
      const pad = 26 * k + 8; // 左右内边距 + 呼吸空间
      return wordItems.map((it) => Math.max(30 * k, Math.ceil(ctx.measureText(it.text).width) + pad));
    };

    let fs = base;
    let widths = measureAt(fs);
    // 反复收敛：每次按「超出比例」缩一点，最多 6 轮，下限 68%
    for (let i = 0; i < 6; i++) {
      const sum = widths.reduce((a, b) => a + b, 0);
      if (sum <= avail) break;
      const target = Math.max(base * 0.68, fs * (avail / sum) * 0.99);
      if (target >= fs) break;
      fs = target;
      widths = measureAt(fs);
    }

    const k = fs / base;
    wordItems.forEach((item, i) => {
      item.inp.style.fontSize = `${fs.toFixed(1)}px`;
      item.inp.style.padding = `0 ${Math.round(13 * k)}px`;
      item.inp.style.width = `${Math.floor(widths[i])}px`;
    });
  }

  let resizeTimer = 0;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(sizeInputs, 120);
  });

  function renderWords() {
    if (!engine) return;
    const { words, cursor, finished } = engine.state;

    words.forEach((w, i) => {
      const item = wordItems[i];
      if (!item) return;
      const { inp, cell } = item;
      const isDone = w.status === 'done';
      const isCur = !finished && i === cursor;

      inp.classList.toggle('done', isDone);
      inp.classList.toggle('error', w.status === 'error');
      inp.classList.toggle('current', isCur && w.status !== 'error');
      inp.classList.toggle('pending', !isDone && w.status !== 'error' && !isCur);
      cell.classList.toggle('done', isDone);

      inp.readOnly = isDone || finished;
      const want = isDone ? w.t : w.status === 'error' ? w.typed : isCur ? engine.state.buffer : '';
      if (inp.value !== want) inp.value = want;
    });

    if (resultOpen) return;
    // 焦点跟着当前词走：切题自动落到第一个词，答对自动跳下一个
    const target = finished ? wordItems[words.length - 1] : wordItems[cursor];
    const ae = document.activeElement;
    const canSteal = !ae || ae === document.body || ae.classList?.contains('wb-input');
    if (target && canSteal && ae !== target.inp) target.inp.focus();
  }

  /* ---------------- 单词输入框键盘 ---------------- */
  function onWordKey(e) {
    if (resultOpen) return;
    if (awaitingNext) {
      if (e.key === 'Enter') {
        e.preventDefault();
        // 关键：不能冒泡到 document。否则同一个 Enter 会先开结算层，
        // 又被全局 handler 的「结算层里按 Enter = 重开」逻辑立刻关掉。
        e.stopPropagation();
        next();
      }
      return;
    }
    if (e.key === ' ') {
      e.preventDefault();
      engine?.typeChar(' ');
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      engine?.enter();
      return;
    }
    if (e.key === 'Backspace') {
      e.preventDefault();
      engine?.backspace();
      sfx.tick();
      return;
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      engine?.hint();
      return;
    }
    if (e.key.length === 1) {
      if (!/[a-zA-Z'’\-]/.test(e.key)) {
        e.preventDefault();
        return;
      }
      e.preventDefault();
      engine?.typeChar(e.key);
      sfx.tick();
    }
  }

  /* ---------------- 载入一句 ---------------- */
  function loadSentence() {
    // 关键：先置空再销毁。否则新引擎初始化时的 emit 会拿旧引擎状态渲染，
    // 出现"词块还是上一句、中文已是下一句"的串题现象。
    if (engine) {
      engine.destroy();
      engine = null;
    }
    const sent = sentences[idx];
    sentenceSpeaks = 0;
    awaitingNext = false;
    titleEl.innerHTML = `${title} <span class="dim">(${idx + 1}/${sentences.length})</span>`;
    fillEl.style.width = `${(idx / sentences.length) * 100}%`;
    zhEl.textContent = mode === 'dictation' ? '听发音，把整句打出来' : sent.zh;
    zhEl.style.opacity = mode === 'dictation' ? '0.45' : '1';
    modeBtn.textContent = mode === 'dictation' ? '听写' : '中译英';
    modeBtn.title = '点击切换：中译英 / 听写';
    renderHints();
    buildWordCells(sent);

    engine = createTypingEngine(sent, {
      onChange: renderWords,
      onWordCorrect: () => sfx.wordOk(),
      onWrong: () => sfx.wrong(),
      onFinish: (outcome) => handleFinish(outcome, sent),
    });

    renderWords(); // 引擎就绪后再首次绘制，光标自动落到第一个词

    if (mode === 'dictation') {
      setTimeout(() => {
        if (engine && !engine.state.finished) doSpeak();
      }, 320);
    }
  }

  /* ---------------- 模式切换 ---------------- */
  function switchMode() {
    mode = mode === 'cn2en' ? 'dictation' : 'cn2en';
    if (mode === 'dictation') {
      zhEl.textContent = '听发音，把整句打出来';
      zhEl.style.opacity = '0.45';
      doSpeak();
    } else {
      zhEl.textContent = sentences[idx].zh;
      zhEl.style.opacity = '1';
    }
    modeBtn.textContent = mode === 'dictation' ? '听写' : '中译英';
    buildWordCells(sentences[idx]);
    renderWords();
  }

  /* ---------------- 连击弹窗 ---------------- */
  function showCombo(kind) {
    if (!getState().settings.comboAnim) return;
    const label = kind === 'perfect' ? 'Perfect' : 'Great';
    const pop = h(
      'div',
      { class: 'combo-pop' + (kind === 'perfect' ? '' : ' great') },
      `${label} × ${combo}`
    );
    comboLayer.appendChild(pop);
    sfx.combo(combo);
    setTimeout(() => pop.remove(), 1220);
  }

  /* ---------------- 单句结算 ---------------- */
  function handleFinish(outcome, sent) {
    const n = sent.w.length;
    const ms = engine.elapsed() * 1000;
    totalMs += ms;

    const good = outcome === 'perfect' || outcome === 'great';
    combo = good ? combo + 1 : 0;
    maxCombo = Math.max(maxCombo, combo);

    const pts = sentenceScore(n, outcome, combo);
    score += pts;

    records.push({
      key: sent.key,
      outcome,
      words: n,
      ms,
      pts,
      speaks: sentenceSpeaks,
    });

    touchSentence(sent.key, outcome, n);

    scoreEl.textContent = fmtNum(score);
    scoreEl.classList.add('bump');
    setTimeout(() => scoreEl.classList.remove('bump'), 140);

    if (good) {
      sfx.sentenceOk();
      if (combo >= 3) showCombo(outcome);
    }

    awaitingNext = true;
    fillEl.style.width = `${((idx + 1) / sentences.length) * 100}%`;
    renderHints();
  }

  /* ---------------- 下一题 ---------------- */
  function next() {
    if (!awaitingNext) return;
    if (idx + 1 >= sentences.length) {
      showResult();
      return;
    }
    idx += 1;
    loadSentence();
  }

  /* ---------------- 操作 ---------------- */
  function navigate(hash) {
    cleanup();
    location.hash = hash;
  }

  function doSpeak() {
    const sent = sentences[idx];
    if (!sent) return;
    sentenceSpeaks += 1;
    speak(sent.en);
  }

  function skip() {
    if (!engine || engine.state.finished) return;
    engine.reveal();
  }

  function exit() {
    if (resultOpen) return;
    if (records.length && !confirm('还有内容没练完，确定要退出吗？（已练的会保存）')) return;
    cleanup();
    onExit?.();
  }

  /* ---------------- 结算面板 ---------------- */
  function showResult() {
    if (resultOpen) return; // 防止舞台点击 / Enter 重复触发叠出多层结算
    resultOpen = true;
    sfx.result();

    const total = records.length;
    const perfect = records.filter((r) => r.outcome === 'perfect').length;
    const great = records.filter((r) => r.outcome === 'great').length;
    const skipped = records.filter((r) => r.outcome === 'fail').length;
    const firstTry = perfect + great;
    const correct = total - skipped;
    const grade = gradeOf({ total, firstTry, correct });
    const seconds = Math.round(totalMs / 1000);
    const avgSec = total ? totalMs / total / 1000 : 0;

    if (packId && courseId) {
      recordCourseResult(packId, courseId, {
        grade,
        score,
        seconds,
        sentences: total,
      });
    }

    const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];

    const pct = (v) => Math.round(v * 100);

    const gauge = (value, cap, text, color = 'var(--green)') => {
      const deg = Math.max(0, Math.min(1, value)) * 360;
      return h('div', { class: 'gauge' }, [
        h('div', {
          class: 'gauge-ring',
          style: {
            background: `conic-gradient(${color} ${deg}deg, #232329 ${deg}deg)`,
          },
        }, [h('span', { class: 'val' }, text)]),
        h('span', { class: 'cap' }, cap),
      ]);
    };

    const course = packId && courseId ? findCourse(packId, courseId) : null;
    const navBtns = [];

    if (course) {
      const pack = PACKS.find((p) => p.id === packId);
      const i = pack.courses.findIndex((c) => c.id === courseId);
      const prev = pack.courses[i - 1];
      const nxt = pack.courses[i + 1];
      if (prev) {
        navBtns.push(
          h('button', {
            class: 'btn btn-ghost btn-sm',
            onclick: () => navigate(`#/course/${packId}/${prev.id}`),
          }, `‹ ${prev.name}`)
        );
      }
      if (nxt) {
        navBtns.push(
          h('button', {
            class: 'btn btn-primary btn-sm',
            onclick: () => navigate(`#/course/${packId}/${nxt.id}`),
          }, `${nxt.name} ›`)
        );
      }
    }

    const overlay = h('div', { class: 'result-backdrop' }, [
      h('div', { class: 'result' }, [
        h('div', { class: 'r-head' }, [
          h('span', { class: 't' }, '练习结算'),
          h('div', { class: 'links' }, [
            h('button', { onclick: () => navigate('#/') }, '回到首页'),
            h('button', { onclick: () => navigate('#/') }, '课程列表'),
            h('button', { onclick: () => navigate('#/profile') }, '学习分析'),
          ]),
        ]),
        h('div', { class: 'r-hero' }, [
          h('div', { class: 'r-grade' }, grade),
          h('div', { class: 'r-score' }, fmtNum(score)),
          h('div', { class: 'r-counts' }, [
            h('div', {}, [h('div', { class: 'n' }, perfect), h('div', { class: 'k' }, '完美')]),
            h('div', {}, [h('div', { class: 'n' }, great), h('div', { class: 'k' }, '很好')]),
            h('div', {}, [h('div', { class: 'n' }, skipped), h('div', { class: 'k' }, '跳过')]),
          ]),
        ]),
        h('div', { class: 'r-stats' }, [
          h('div', {}, [
            h('div', { class: 'k' }, '练习时长'),
            h('div', { class: 'v' }, `${seconds}秒`),
          ]),
          h('div', {}, [
            h('div', { class: 'k' }, '答题数'),
            h('div', { class: 'v' }, total),
          ]),
          h('div', {}, [
            h('div', { class: 'k' }, '最大连击'),
            h('div', { class: 'v' }, maxCombo),
          ]),
        ]),
        h('div', { class: 'r-analysis' }, [
          h('div', { class: 'label' }, '数据分析'),
          h('div', { class: 'gauges' }, [
            gauge(total ? firstTry / total : 0, '一次命中率', pct(total ? firstTry / total : 0) + '%'),
            gauge(total ? correct / total : 0, '正确率', pct(total ? correct / total : 0) + '%'),
            gauge(total ? skipped / total : 0, '查看答案', pct(total ? skipped / total : 0) + '%'),
            gauge(
              total ? records.reduce((s, r) => s + r.speaks, 0) / total : 0,
              '重听次数',
              records.reduce((s, r) => s + r.speaks, 0) + ' 次'
            ),
            gauge(Math.min(1, avgSec / 12), '平均用时', `${avgSec.toFixed(1)}秒`, 'var(--purple)'),
          ]),
        ]),
        h('div', { class: 'r-quote' }, [
          h('div', { class: 'tag' }, '今日金句'),
          h('div', { class: 'en' }, `"${quote.en}"`),
          h('div', { class: 'cn' }, quote.cn),
          h('button', { class: 'spk', title: '朗读', onclick: () => speak(quote.en) }, '🔊'),
        ]),
        h('div', { class: 'r-foot' }, [
          h('button', {
            class: 'btn btn-primary btn-sm',
            onclick: () => {
              const text = `我在句乐场练完《${title}》拿到 ${grade}！${fmtNum(score)} 分，最大连击 ${maxCombo} 🔥`;
              if (navigator.clipboard) {
                navigator.clipboard.writeText(text).then(
                  () => toast('战绩已复制，去炫耀吧'),
                  () => toast(text)
                );
              } else {
                toast(text);
              }
            },
          }, '炫耀战绩'),
          h('span', { class: 'spacer' }),
          ...navBtns,
          h('button', {
            class: 'btn btn-ghost btn-sm',
            onclick: () => {
              overlay.remove();
              restart();
            },
          }, '↻ 再来一次'),
          h('button', {
            class: 'btn btn-ghost btn-sm',
            onclick: () => navigate('#/'),
          }, '完成'),
        ]),
      ]),
    ]);

    document.body.appendChild(overlay);
    overlay.dataset.result = '1';
  }

  function restart() {
    resultOpen = false;
    idx = 0;
    score = 0;
    combo = 0;
    maxCombo = 0;
    records = [];
    totalMs = 0;
    startedAt = Date.now();
    scoreEl.textContent = '0';
    const el = document.querySelector('.result-backdrop');
    if (el) el.remove();
    fillEl.style.width = '0%';
    loadSentence();
  }

  /* ---------------- 键盘 ---------------- */
  function onKeyDown(e) {
    if (resultOpen) {
      if (e.key === 'Enter') {
        e.preventDefault();
        document.querySelector('.result-backdrop')?.remove();
        restart();
      }
      return;
    }

    // 词输入框聚焦时，字符/退格/回车由输入框自己处理，全局只管快捷键
    const fromInput = !!e.target?.classList?.contains('wb-input');

    if (e.ctrlKey || e.metaKey) {
      if (e.key === "'") {
        e.preventDefault();
        doSpeak();
        return;
      }
      if (e.key.toLowerCase() === 'h') {
        e.preventDefault();
        engine?.hint();
        return;
      }
      if (e.key.toLowerCase() === 'm') {
        e.preventDefault();
        skip();
        return;
      }
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      exit();
      return;
    }
    if (fromInput) return; // 其余按键交给输入框 handler

    if (e.key === 'Backspace') {
      e.preventDefault();
      if (awaitingNext) return;
      engine?.backspace();
      sfx.tick();
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (awaitingNext) next();
      else engine?.enter();
      return;
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      if (!awaitingNext) engine?.hint();
      return;
    }
    if (e.key.length === 1 && !awaitingNext) {
      if (!/[a-zA-Z'’\- ]/.test(e.key)) return;
      e.preventDefault();
      engine?.typeChar(e.key);
      if (e.key !== ' ') sfx.tick();
    }
  }

  document.addEventListener('keydown', onKeyDown);
  stage.addEventListener('click', () => {
    if (awaitingNext) next();
  });

  /* ---------------- 清理 ---------------- */
  function cleanup() {
    clearInterval(timerId);
    engine?.destroy();
    document.removeEventListener('keydown', onKeyDown);
    document.querySelector('.result-backdrop')?.remove();
    view.remove();
  }

  loadSentence();
  return { cleanup };
}

/* ---------------- 路由工具 ---------------- */
function findCourse(packId, courseId) {
  const p = PACKS.find((x) => x.id === packId);
  return p?.courses.find((c) => c.id === courseId) || null;
}
