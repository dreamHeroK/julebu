/**
 * 极简 CDP 驱动：打开页面 → 执行一段脚本（模拟键盘）→ 截图
 * 用法：node cdp.mjs <url> <evalFile|-> <outPng>
 */
import fs from 'node:fs';

const [, , url, evalFile, outPng] = process.argv;
const ENDPOINT = 'http://127.0.0.1:9222';

const newTab = async () => {
  const res = await fetch(`${ENDPOINT}/json/new?about:blank`, { method: 'PUT' });
  return res.json();
};

const target = await newTab();
const ws = new WebSocket(target.webSocketDebuggerUrl);

let id = 0;
const pending = new Map();
const errors = [];

const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const msgId = ++id;
    pending.set(msgId, { resolve, reject });
    ws.send(JSON.stringify({ id: msgId, method, params }));
  });

await new Promise((r) => ws.addEventListener('open', r, { once: true }));

ws.addEventListener('message', (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result);
    return;
  }
  if (msg.method === 'Runtime.exceptionThrown') {
    const d = msg.params.exceptionDetails;
    errors.push(`${d.text} ${d.exception?.description || ''}`.slice(0, 400));
  }
  if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
    errors.push(msg.params.args.map((a) => a.value ?? a.description).join(' ').slice(0, 400));
  }
});

await send('Runtime.enable');
await send('Page.enable');
await send('Network.enable');
await send('Network.setCacheDisabled', { cacheDisabled: true });
await send('Page.navigate', { url });
await send('Emulation.setDeviceMetricsOverride', {
  width: 1440,
  height: 900,
  deviceScaleFactor: 1,
  mobile: false,
});
await new Promise((r) => setTimeout(r, 1400));

if (evalFile && evalFile !== '-') {
  const expression = fs.readFileSync(evalFile, 'utf8');
  try {
    const r = await send('Runtime.evaluate', {
      expression,
      awaitPromise: true,
      returnByValue: true,
    });
    console.log('eval →', JSON.stringify(r.result?.value ?? r.result?.description ?? null).slice(0, 400));
    if (r.exceptionDetails) errors.push('EVAL: ' + (r.exceptionDetails.exception?.description || r.exceptionDetails.text));
  } catch (e) {
    errors.push('EVAL FAIL: ' + e.message);
  }
}

await new Promise((r) => setTimeout(r, 500));

const shot = await send('Page.captureScreenshot', { format: 'png' });
fs.writeFileSync(outPng, Buffer.from(shot.data, 'base64'));

console.log('errors:', errors.length);
errors.forEach((e) => console.log('  ✗', e));
console.log('saved:', outPng);
ws.close();
process.exit(0);
