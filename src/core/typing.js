/**
 * 打字判定引擎
 * ---------------------------------------------------------------------------
 * 逐词输入：字母累积成 buffer，空格/回车提交当前词。
 * 判定维度（决定 Perfect / Great / 普通）：
 *   - 是否首答正确（提交错过 = 失格）
 *   - 是否按过退格
 *   - 是否用过提示
 */

const norm = (str) =>
  String(str)
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[.,!?;:"“”]/g, '')
    .trim();

export function createTypingEngine(sentence, hooks = {}) {
  const words = sentence.w.map((w) => ({
    ...w,
    status: 'pending', // pending | current | done | error
    typed: '',
  }));

  const state = {
    words,
    cursor: 0,
    buffer: '',
    backspaced: false,
    hinted: false,
    wrongCount: 0,
    finished: false,
    outcome: null,
    startedAt: performance.now(),
  };

  let errorTimer = 0;

  const emit = () => hooks.onChange?.(state);

  function setCursor(index) {
    state.cursor = index;
    state.words.forEach((w, i) => {
      if (w.status === 'done') return;
      w.status = i === index ? 'current' : i < index ? 'done' : 'pending';
    });
  }

  function finish(outcome) {
    if (state.finished) return;
    state.finished = true;
    state.outcome = outcome;
    state.words.forEach((w) => {
      if (w.status !== 'done') {
        w.status = 'done';
        w.typed = w.t;
      }
    });
    emit();
    hooks.onFinish?.(outcome, state);
  }

  function commit() {
    const target = state.words[state.cursor];
    if (!target) return;
    const attempt = state.buffer;
    if (!attempt) return;

    if (norm(attempt) === norm(target.t)) {
      target.status = 'done';
      target.typed = target.t;
      state.buffer = '';
      const next = state.cursor + 1;
      hooks.onWordCorrect?.(target, next);
      if (next >= state.words.length) {
        setCursor(next);
        finish(classify());
      } else {
        setCursor(next);
        emit();
      }
      return;
    }

    // 答错
    state.wrongCount += 1;
    target.status = 'error';
    target.typed = attempt;
    emit();
    hooks.onWrong?.(target, attempt);

    clearTimeout(errorTimer);
    errorTimer = setTimeout(() => {
      target.status = state.cursor === state.words.indexOf(target) ? 'current' : 'pending';
      target.typed = '';
      state.buffer = '';
      emit();
    }, 420);
  }

  function classify() {
    if (state.hinted) return 'ok';
    if (state.wrongCount > 0) return 'ok';
    if (state.backspaced) return 'great';
    return 'perfect';
  }

  /** 处理一个可打印字符 */
  function typeChar(ch) {
    if (state.finished) return;
    if (!/^[a-zA-Z'’\- ]$/.test(ch)) return;
    if (ch === ' ') {
      commit();
      return;
    }
    if (state.buffer.length >= 24) return;
    state.buffer += ch;
    emit();
  }

  function backspace() {
    if (state.finished) return;
    if (state.buffer.length) {
      state.buffer = state.buffer.slice(0, -1);
      state.backspaced = true;
      emit();
      return;
    }
    // buffer 已空 → 回退到上一个词重打
    if (state.cursor > 0) {
      const prev = state.cursor - 1;
      state.words[prev].status = 'current';
      state.words[prev].typed = '';
      state.cursor = prev;
      state.backspaced = true;
      emit();
    }
  }

  function enter() {
    if (state.finished) return;
    if (state.buffer) {
      commit();
      return;
    }
    // 空 buffer 且全部完成时回车 = 交卷
    if (state.cursor >= state.words.length) finish(classify());
  }

  /** 提示：逐字母揭示当前词 */
  function hint() {
    if (state.finished) return;
    const target = state.words[state.cursor];
    if (!target) return;
    const expected = target.t;
    const nextLen = Math.min(state.buffer.length + 1, expected.length);
    state.buffer = expected.slice(0, nextLen);
    state.hinted = true;
    emit();
    hooks.onHint?.(target, state.buffer);
  }

  /** 直接看答案（等同跳过） */
  function reveal() {
    if (state.finished) return;
    state.hinted = true;
    finish('fail');
  }

  setCursor(0);
  emit();

  return {
    state,
    typeChar,
    backspace,
    enter,
    hint,
    reveal,
    /** 当前应输入的词 */
    get target() {
      return state.words[state.cursor] || null;
    },
    elapsed() {
      return (performance.now() - state.startedAt) / 1000;
    },
    destroy() {
      clearTimeout(errorTimer);
    },
  };
}
