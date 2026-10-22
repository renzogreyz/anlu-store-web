// Chequeo rápido de index.html: imágenes hero/esencia, ProductCards y errores de consola (Edge headless + CDP).
import { spawn } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const server = spawn('python', ['-m', 'http.server', '8766', '--bind', '127.0.0.1', '--directory', ROOT], { stdio: 'ignore' });
const edge = spawn(EDGE, ['--headless=new', '--remote-debugging-port=9334', `--user-data-dir=${mkdtempSync(join(tmpdir(), 'edge-idx-'))}`, '--no-first-run', '--disable-gpu', 'about:blank'], { stdio: 'ignore' });
const done = code => { try { edge.kill(); server.kill(); } catch {} process.exit(code); };

let wsUrl;
for (let i = 0; i < 60 && !wsUrl; i++) { try { wsUrl = (await (await fetch('http://127.0.0.1:9334/json/list')).json()).find(t => t.type === 'page')?.webSocketDebuggerUrl; } catch {} await sleep(500); }
const ws = new WebSocket(wsUrl); await new Promise(r => (ws.onopen = r));
let id = 0; const pending = new Map(); const errors = [];
ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
  if (m.method === 'Runtime.exceptionThrown') errors.push('EXC ' + (m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text));
  if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errors.push('console.error ' + m.params.args.map(a => a.value ?? a.description).join(' ')); };
const send = (method, params = {}) => new Promise(r => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async x => (await send('Runtime.evaluate', { expression: x, awaitPromise: true, returnByValue: true })).result.result.value;
await send('Runtime.enable'); await send('Page.enable');
await send('Page.navigate', { url: 'http://127.0.0.1:8766/index.html' });
await sleep(9000);
const out = await ev(`(() => {
  const imgs = alt => [...document.querySelectorAll('img[alt="' + alt + '"]')].map(i => i.src.slice(0, 60));
  return {
    hero: [...document.querySelectorAll('img')].filter(i => /Look Anlu|Detalle Anlu/.test(i.alt)).length,
    esencia: [...document.querySelectorAll('img')].filter(i => /Etiqueta Anlu|Percheros Anlu|Vestido espalda Anlu/.test(i.alt)).length,
    cards: document.querySelectorAll('article').length,
    ns: Object.keys(window.AnluStoreDesignSystem_2c1944 || {}).includes('selection'),
    dsErrors: (window.AnluStoreDesignSystem_2c1944 || {}).__errors,
  };
})()`);
console.log(JSON.stringify(out));
console.log('Errores:', errors.length ? [...new Set(errors)].join('\n') : 'ninguno');
done(0);
