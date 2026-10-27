/**
 * CDP 网络抓包：访问目标页，收集所有 XHR/fetch JSON 响应体
 * 用法：node cdp-net.mjs <url> <outFile> [waitMs]
 */
import fs from 'node:fs';

const [, , url, outFile, waitMs = '6000'] = process.argv;
const ENDPOINT = 'http://127.0.0.1:9222';

const res = await fetch(`${ENDPOINT}/json/new?${encodeURIComponent(url)}`, { method: 'PUT' });
const target = await res.json();
const ws = new WebSocket(target.webSocketDebuggerUrl);

let id = 0;
const pending = new Map();
const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const msgId = ++id;
    pending.set(msgId, { resolve, reject });
    ws.send(JSON.stringify({ id: msgId, method, params }));
  });

await new Promise((r) => ws.addEventListener('open', r, { once: true }));

const responses = new Map(); // requestId -> { url, type, mime, status }
const bodies = [];

ws.addEventListener('message', (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result);
    return;
  }
  if (msg.method === 'Network.responseReceived') {
    const r = msg.params.response;
    responses.set(msg.params.requestId, {
      url: r.url,
      type: msg.params.type,
      mime: r.mimeType,
      status: r.status,
    });
  }
  if (msg.method === 'Network.loadingFinished') {
    const info = responses.get(msg.params.requestId);
    if (!info) return;
    if (!/json|javascript|text\/plain/.test(info.mime) || info.status !== 200) return;
    if (/\.(js|css|png|jpg|webp|svg|woff|ico)(\?|$)/.test(info.url)) return;
    send('Network.getResponseBody', { requestId: msg.params.requestId })
      .then((rb) => {
        bodies.push({ ...info, size: rb.body?.length || 0, body: rb.base64Encoded ? '(b64)' : rb.body });
      })
      .catch(() => {});
  }
});

await send('Network.enable');
await send('Page.enable');
await send('Page.navigate', { url });
await new Promise((r) => setTimeout(r, parseInt(waitMs, 10)));

fs.writeFileSync(outFile, JSON.stringify(bodies, null, 1));
console.log('captured', bodies.length, 'responses');
bodies.forEach((b) => console.log(' ', b.type, b.status, b.mime, b.url.slice(0, 120), b.size));
ws.close();
process.exit(0);
