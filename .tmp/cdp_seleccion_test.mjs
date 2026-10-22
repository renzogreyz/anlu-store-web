// Prueba E2E de selección por id sobre tienda.html real (Edge headless + CDP).
// Uso: node .tmp/cdp_seleccion_test.mjs
import { spawn } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const HTTP_PORT = 8765, CDP_PORT = 9333;
const URL = `http://127.0.0.1:${HTTP_PORT}/tienda.html`;
const sleep = ms => new Promise(r => setTimeout(r, ms));

const server = spawn('python', ['-m', 'http.server', String(HTTP_PORT), '--bind', '127.0.0.1', '--directory', ROOT], { stdio: 'ignore' });
const edge = spawn(EDGE, ['--headless=new', `--remote-debugging-port=${CDP_PORT}`, `--user-data-dir=${mkdtempSync(join(tmpdir(), 'edge-test-'))}`,
  '--no-first-run', '--disable-gpu', '--window-size=1400,1000', 'about:blank'], { stdio: 'ignore' });
const cleanup = () => { try { edge.kill(); } catch {} try { server.kill(); } catch {} };
process.on('exit', cleanup);

async function getWs() {
  for (let i = 0; i < 60; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`)).json();
      const page = list.find(t => t.type === 'page');
      if (page) return page.webSocketDebuggerUrl;
    } catch {}
    await sleep(500);
  }
  throw new Error('Edge no levantó');
}

const ws = new WebSocket(await getWs());
await new Promise(r => (ws.onopen = r));
let id = 0; const pending = new Map(); const errors = [];
ws.onmessage = ev => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); return; }
  if (m.method === 'Runtime.exceptionThrown') errors.push('EXC: ' + (m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text));
  if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errors.push('console.error: ' + m.params.args.map(a => a.value ?? a.description).join(' '));
};
const send = (method, params = {}) => new Promise(r => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async expr => {
  const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
  if (r.result.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails));
  return r.result.result.value;
};
await send('Runtime.enable'); await send('Page.enable');

// ── helpers que corren dentro de la página ──
const PAGE_LIB = `
window.__t = {
  sleep: ms => new Promise(r => setTimeout(r, ms)),
  cards: () => [...document.querySelectorAll('article')],
  label: a => [...a.querySelectorAll('button')].map(b => b.textContent.trim()).find(t => /^Seleccionad?a?r?$/.test(t) || t === 'Seleccionada' || t === 'Seleccionar'),
  labels() { return this.cards().map(a => this.label(a)); },
  items: () => window.AnluStoreDesignSystem_2c1944.selection.getItems().map(i => ({ id: i.id, name: i.name, color: i.color, size: i.size })),
  btn: (root, text) => [...root.querySelectorAll('button')].find(b => b.textContent.trim() === text),
  async seleccionar(idx, size, color) {
    const a = this.cards()[idx];
    this.btn(a, 'Seleccionar').click(); await this.sleep(200);
    if (!document.body.innerText.toLowerCase().includes('elige talla y color')) return; // la card recuerda la última talla/color: no abre modal
    const all = [...document.querySelectorAll('button')];
    all.find(b => b.textContent.trim() === size && !a.contains(b)).click(); await this.sleep(100);
    document.querySelector('button[aria-label="' + color + '"]').click(); await this.sleep(100);
    [...document.querySelectorAll('button')].find(b => b.textContent.trim() === 'Confirmar selección').click(); await this.sleep(300);
  },
  async deseleccionar(idx) { this.btn(this.cards()[idx], 'Seleccionada').click(); await this.sleep(300); },
  async abrirDrawer() { [...document.querySelectorAll('button')].find(b => b.textContent.includes('Finalizar compra (')).click(); await this.sleep(300); },
  drawerRows() { return [...document.querySelectorAll('button[aria-label^="Quitar "]')].map(b => b.parentElement.innerText.replace(/\\s+/g, ' ').trim()); },
  async quitarDrawer(i) { document.querySelectorAll('button[aria-label^="Quitar "]')[i].click(); await this.sleep(300); },
  wa: () => { const a = [...document.querySelectorAll('a')].find(x => /wa\\.me/.test(x.href) && /Enviar pedido/.test(x.textContent)); return a ? { href: a.href.split('?')[0], text: decodeURIComponent(a.href.split('text=')[1] || '') } : null; },
  ls: () => localStorage.getItem('anlu_seleccion'),
};`;
async function load(preSeed) {
  await send('Page.navigate', { url: URL });
  for (let i = 0; i < 60; i++) { await sleep(500); if (await ev('document.readyState') === 'complete') break; }
  if (preSeed !== undefined) { await ev(`localStorage.setItem('anlu_seleccion', ${JSON.stringify(preSeed)})`); await send('Page.reload'); await sleep(1500); }
  for (let i = 0; i < 80; i++) { await sleep(500); if (await ev(`document.querySelectorAll('article').length >= 4 && !!window.AnluStoreDesignSystem_2c1944 && !!window.AnluStoreDesignSystem_2c1944.selection`)) break; }
  await ev(PAGE_LIB); await sleep(800);
}
const results = []; let fails = 0;
const check = (name, cond, extra) => { if (!cond) fails++; results.push(`${cond ? 'OK  ' : 'FAIL'} ${name}${extra ? '  → ' + JSON.stringify(extra) : ''}`); };
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

try {
  // 0) selección vieja sin id en localStorage → se ignora sin romper
  const legacy = JSON.stringify([{ name: 'Blusa baby elisas', price: '$1', size: 'M', color: 'Coral' }]);
  await load(legacy);
  check('0. legacy sin id ignorada (store vacío)', same(await ev('__t.items()'), []), await ev('__t.items()'));
  check('0. no aparece barra "Finalizar compra"', await ev(`![...document.querySelectorAll('button')].some(b => b.textContent.includes('Finalizar compra ('))`));
  check('0. cards renderizadas (4)', (await ev('__t.cards().length')) === 4);

  // 5a) solo Coral (AN-002 = índice 1)
  await ev(`localStorage.removeItem('anlu_seleccion')`); await load();
  await ev(`__t.seleccionar(1, 'M', 'Coral')`);
  let L = await ev('__t.labels()');
  check('5a. solo Coral queda marcada', same(L, ['Seleccionar', 'Seleccionada', 'Seleccionar', 'Seleccionar']), L);
  check('5a. store = AN-002 M Coral', same(await ev('__t.items()'), [{ id: 'AN-002', name: 'Blusa baby elisas', color: 'Coral', size: 'M' }]), await ev('__t.items()'));
  check('5a. localStorage guarda id', /"id":"AN-002"/.test(await ev('__t.ls()')), await ev('__t.ls()'));

  // 5b) + Celeste (AN-003 = índice 2) con otra talla
  await ev(`__t.seleccionar(2, 'L', 'Celeste')`);
  L = await ev('__t.labels()');
  check('5b. ambas marcadas', same(L, ['Seleccionar', 'Seleccionada', 'Seleccionada', 'Seleccionar']), L);
  check('5b. store = 2 ítems separados', same((await ev('__t.items()')).map(i => `${i.id}/${i.color}/${i.size}`), ['AN-002/Coral/M', 'AN-003/Celeste/L']), await ev('__t.items()'));

  // 4) Finalizar compra: cada prenda por separado, con talla/color, y mensaje WhatsApp
  await ev('__t.abrirDrawer()');
  const rows = await ev('__t.drawerRows()');
  check('4. drawer lista 2 filas', rows.length === 2, rows);
  check('4. fila 1 Coral/Talla M', /Talla M/.test(rows[0]) && /Coral/.test(rows[0]), rows[0]);
  check('4. fila 2 Celeste/Talla L', /Talla L/.test(rows[1]) && /Celeste/.test(rows[1]), rows[1]);
  const wa = await ev('__t.wa()');
  check('4. wa.me usa 573126045120', wa && wa.href === 'https://wa.me/573126045120', wa && wa.href);
  check('4. mensaje lista las dos prendas', wa && /Talla M — Color Coral/.test(wa.text) && /Talla L — Color Celeste/.test(wa.text), wa && wa.text);

  // 4) quitar una (Celeste, fila 2) no quita la otra
  await ev('__t.quitarDrawer(1)');
  check('4. quitar Celeste deja solo Coral', same((await ev('__t.items()')).map(i => i.id), ['AN-002']), await ev('__t.items()'));
  L = await ev('__t.labels()');
  check('4. cards: Coral marcada, Celeste libre', same(L, ['Seleccionar', 'Seleccionada', 'Seleccionar', 'Seleccionar']), L);

  // 5c) volver a marcar Celeste y deseleccionar Coral desde la card → Celeste sigue
  await ev(`__t.seleccionar(2, 'S', 'Celeste')`);
  await ev('__t.deseleccionar(1)');
  L = await ev('__t.labels()');
  check('5c. deseleccionar Coral deja Celeste marcada', same(L, ['Seleccionar', 'Seleccionar', 'Seleccionada', 'Seleccionar']), L);
  check('5c. store = solo AN-003', same((await ev('__t.items()')).map(i => i.id), ['AN-003']), await ev('__t.items()'));

  // persistencia con ambas, tras recarga
  await ev(`__t.seleccionar(1, 'L', 'Coral')`);
  await load();
  L = await ev('__t.labels()');
  check('persistencia: tras recargar siguen ambas marcadas', same(L, ['Seleccionar', 'Seleccionada', 'Seleccionada', 'Seleccionar']), L);
} catch (e) { fails++; results.push('EXCEPCIÓN del test: ' + e.message); }

console.log(results.join('\n'));
console.log('\nErrores de consola/excepciones:', errors.length ? '\n' + [...new Set(errors)].join('\n') : 'ninguno');
console.log(fails ? `\n${fails} FALLO(S)` : '\nTODO OK');
cleanup(); process.exit(fails ? 1 : 0);
