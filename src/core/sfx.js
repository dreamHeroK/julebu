/**
 * 音效：全部用 WebAudio 实时合成，不依赖任何音频资源文件
 */

let ctx = null;
let enabled = true;

function ac() {
  if (!ctx) {
    const C = window.AudioContext || window.webkitAudioContext;
    if (!C) return null;
    ctx = new C();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

export function setSoundEnabled(v) {
  enabled = !!v;
}
export function isSoundEnabled() {
  return enabled;
}

function tone({ freq, dur = 0.12, type = 'sine', gain = 0.06, at = 0, slideTo = null }) {
  const c = ac();
  if (!c || !enabled) return;
  const t0 = c.currentTime + at;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

/** 打字按键反馈 */
export function tick() {
  tone({ freq: 1500, dur: 0.03, type: 'square', gain: 0.015 });
}

/** 一个词敲对 */
export function wordOk() {
  tone({ freq: 660, dur: 0.07, type: 'triangle', gain: 0.035 });
}

/** 整句完成 */
export function sentenceOk() {
  tone({ freq: 660, dur: 0.1, type: 'sine', gain: 0.05 });
  tone({ freq: 880, dur: 0.1, type: 'sine', gain: 0.05, at: 0.07 });
  tone({ freq: 1320, dur: 0.16, type: 'sine', gain: 0.045, at: 0.14 });
}

/** 敲错 */
export function wrong() {
  tone({ freq: 190, dur: 0.16, type: 'sawtooth', gain: 0.05, slideTo: 110 });
}

/** 连击弹窗音：音高随连击升高 */
export function combo(level) {
  const semis = Math.min(level, 12);
  const base = 523.25 * Math.pow(2, semis / 24);
  tone({ freq: base, dur: 0.09, type: 'sine', gain: 0.05 });
  tone({ freq: base * 1.5, dur: 0.12, type: 'sine', gain: 0.04, at: 0.055 });
}

/** 结算 */
export function result() {
  [523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
    tone({ freq: f, dur: 0.22, type: 'sine', gain: 0.045, at: i * 0.085 })
  );
}
