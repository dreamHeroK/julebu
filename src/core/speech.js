/**
 * 发音：走浏览器内置 Web Speech API，无需任何 TTS 服务
 */

let voice = null;
let rate = 1;

function pickVoice() {
  if (!('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  // 优先美音女声，其次任意 en-*
  return (
    voices.find((v) => /en-US/i.test(v.lang) && /female|Samantha|Zira|Google US/i.test(v.name)) ||
    voices.find((v) => /en-US/i.test(v.lang)) ||
    voices.find((v) => /^en/i.test(v.lang)) ||
    null
  );
}

export function initSpeech() {
  if (!('speechSynthesis' in window)) return;
  voice = pickVoice();
  window.speechSynthesis.onvoiceschanged = () => {
    voice = pickVoice();
  };
}

export function setRate(r) {
  rate = Math.max(0.5, Math.min(2, Number(r) || 1));
}

export function speak(text) {
  if (!('speechSynthesis' in window) || !text) return false;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-US';
  u.rate = rate;
  u.pitch = 1;
  if (voice) u.voice = voice;
  window.speechSynthesis.speak(u);
  return true;
}

export function stopSpeak() {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
}
