// Prueba de carga de datos tolerante + círculos de color (Edge headless + CDP, catálogo simulado).
// Uso: node .tmp/cdp_datos_test.mjs
import { spawn } from 'node:child_process';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const HTTP_PORT = 8767, CDP_PORT = 9335;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const results = []; let fails = 0;
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const check = (name, cond, extra) => { if (!cond) fails++; results.push(`${cond ? 'OK  ' : 'FAIL'} ${name}${cond && !extra ? '' : '  → ' + JSON.stringify(extra)}`); };

// ── 1) Unit: helpers extraídos de las páginas reales ──
for (const page of ['index.html', 'tienda.html']) {
  const html = readFileSync(join(ROOT, page), 'utf8');
  const m = html.match(/\/\/ ─── Normalización[\s\S]*?const coloresDe[^\n]*\n/);
  if (!m) { check(`${page}: helpers presentes`, false); continue; }
  const { parseColores, parseTalles, parseImagenes, coloresDe } = new Function(m[0] + '; return {parseColores,parseTalles,parseImagenes,coloresDe};')();
  const t = `[${page}] `;
  check(t + 'colores con comas y espacios', same(parseColores('Rojo, Negro,  Blanco '), ['Rojo', 'Negro', 'Blanco']), parseColores('Rojo, Negro,  Blanco '));
  check(t + 'colores: vacíos/duplicados fuera', same(parseColores('Rojo,, rojo ,'), ['Rojo']));
  check(t + 'color simple y nulo', same(parseColores('Verde agua'), ['Verde agua']) && same(parseColores(null), []));
  check(t + 'talles por espacios "S M L"', same(parseTalles('S M L'), ['S', 'M', 'L']));
  check(t + 'talles coma+salto de línea', same(parseTalles('XS,S\nM, L'), ['XS', 'S', 'M', 'L']), parseTalles('XS,S\nM, L'));
  check(t + 'talles numéricos "28 30 32"', same(parseTalles('28 30 32'), ['28', '30', '32']));
  check(t + 'talle libre "Único"', same(parseTalles('Único'), ['Único']));
  check(t + 'talle libre "Talla 6" queda entero', same(parseTalles('Talla 6'), ['Talla 6']), parseTalles('Talla 6'));
  check(t + 'talle libre "Talla única" entero', same(parseTalles('Talla única'), ['Talla única']));
  check(t + 'talles array y vacíos', same(parseTalles(['S', ' ', 'M']), ['S', 'M']) && same(parseTalles(''), []) && same(parseTalles(null), []));
  check(t + 'imagenes: coma/salto, solo http', same(parseImagenes('x\nhttps://a.com/1, http://b.com/2 ,ftp://c'), ['https://a.com/1', 'http://b.com/2']), parseImagenes('x\nhttps://a.com/1, http://b.com/2 ,ftp://c'));
  check(t + 'imagenes: array y vacío', same(parseImagenes(['https://a', 'nope']), ['https://a']) && same(parseImagenes([]), []) && same(parseImagenes(null), []));
  check(t + 'coloresDe une variantes sin repetir', same(coloresDe({ variantes: [{ color: 'Rojo, Negro' }, { color: 'negro, Azul' }] }), ['Rojo', 'Negro', 'Azul']));
}

// ── 2) E2E con catálogo simulado ──
const CAT = {
  contenidoVisual: {}, novedades: [],
  productos: [
    { id: 'AN-901', nombre: 'Camiseta Multi', categoria: 'Blusas', precio: 50000, nuevo: true, variantes: [{ color: 'Rojo, Negro,  Blanco ', talles: 'S M L', stock: 5, imagenes: 'notaurl\nhttps://example.com/a.jpg, https://example.com/b.jpg' }] },
    { id: 'AN-902', nombre: 'Vestido Raro', categoria: 'Vestidos', precio: 90000, nuevo: true, variantes: [{ color: 'Celeste, Verde agua, Zafiro raro, Zeta, ROJO', talles: ['Talla 6'], stock: 2, imagenes: [] }] },
    { id: 'AN-903', nombre: 'Unico', categoria: 'Bodys', precio: 40000, nuevo: true, variantes: [{ color: 'Lila', talles: ['Único'], stock: 1, imagenes: [] }] },
    { id: 'AN-904', nombre: 'Comas', categoria: 'Jeans', precio: 70000, nuevo: true, variantes: [{ color: 'Azul', talles: 'XS,S\nM, L', stock: 1, imagenes: [] }] },
  ],
};
const server = spawn('python', ['-m', 'http.server', String(HTTP_PORT), '--bind', '127.0.0.1', '--directory', ROOT], { stdio: 'ignore' });
const edge = spawn(EDGE, ['--headless=new', `--remote-debugging-port=${CDP_PORT}`, `--user-data-dir=${mkdtempSync(join(tmpdir(), 'edge-dat-'))}`, '--no-first-run', '--disable-gpu', '--window-size=1400,1000', 'about:blank'], { stdio: 'ignore' });
const cleanup = () => { try { edge.kill(); } catch {} try { server.kill(); } catch {} };
process.on('exit', cleanup);
let wsUrl;
for (let i = 0; i < 60 && !wsUrl; i++) { try { wsUrl = (await (await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`)).json()).find(t => t.type === 'page')?.webSocketDebuggerUrl; } catch {} await sleep(500); }
const ws = new WebSocket(wsUrl); await new Promise(r => (ws.onopen = r));
let id = 0; const pending = new Map(); const errors = [];
ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); return; }
  if (m.method === 'Runtime.exceptionThrown') errors.push('EXC ' + (m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text));
  if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errors.push('console.error ' + m.params.args.map(a => a.value ?? a.description).join(' ')); };
const send = (method, params = {}) => new Promise(r => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async x => { const r = await send('Runtime.evaluate', { expression: x, awaitPromise: true, returnByValue: true }); if (r.result.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails.exception?.description || r.result.exceptionDetails)); return r.result.result.value; };
await send('Runtime.enable'); await send('Page.enable');
await send('Page.addScriptToEvaluateOnNewDocument', { source: `
  const CAT = ${JSON.stringify(CAT)};
  const _f = window.fetch.bind(window);
  window.fetch = (u, o) => String(u).includes('catalogo.json') ? Promise.resolve(new Response(JSON.stringify(CAT), { headers: { 'content-type': 'application/json' } })) : _f(u, o);
  window.__opened = []; window.open = u => { window.__opened.push(String(u)); return null; };
  try { localStorage.removeItem('anlu_seleccion'); } catch {}` });

const LIB = `window.__t = {
  sleep: ms => new Promise(r => setTimeout(r, ms)),
  cards: () => [...document.querySelectorAll('article')],
  btn: (root, text) => [...root.querySelectorAll('button')].find(b => b.textContent.trim() === text),
  async abrir(i, texto) { this.btn(this.cards()[i], texto || 'Seleccionar').click(); await this.sleep(250); },
  colorBtns: () => [...document.querySelectorAll('button[title]')].filter(b => b.getAttribute('title') === b.getAttribute('aria-label')),
  colors() { return this.colorBtns().map(b => b.getAttribute('aria-label')); },
  sizeBtns() { const lab = [...document.querySelectorAll('span')].find(s => s.textContent.trim() === 'Talla'); return lab ? [...lab.nextElementSibling.querySelectorAll('button')] : []; },
  sizes() { return this.sizeBtns().map(b => b.textContent.trim()); },
  sizeSelected() { return this.sizeBtns().map(b => getComputedStyle(b).backgroundColor === 'rgb(125, 91, 166)'); },
  swatches() { return this.colorBtns().map(b => { const s = b.firstElementChild, cs = getComputedStyle(s); return { c: b.getAttribute('aria-label'), bg: cs.backgroundColor, shadow: cs.boxShadow, text: s.textContent }; }); },
  confirmOk: () => [...document.querySelectorAll('button')].some(b => b.textContent.trim() === 'Confirmar selección'),
  async pick(sz, col) { if (sz) this.sizeBtns().find(b => b.textContent.trim() === sz).click(); await this.sleep(80); if (col) this.colorBtns().find(b => b.getAttribute('aria-label') === col).click(); await this.sleep(80); },
  async confirmar() { [...document.querySelectorAll('button')].find(b => b.textContent.trim() === 'Confirmar selección').click(); await this.sleep(300); },
  items: () => window.AnluStoreDesignSystem_2c1944.selection.getItems().map(i => ({ id: i.id, color: i.color, size: i.size })),
  msg: () => window.AnluStoreDesignSystem_2c1944.selection.message(),
  img: i => { const im = this.cards ? [...window.__t.cards()[i].querySelectorAll('img')].map(x => x.src) : []; return im; },
};`;
async function load(page) {
  await send('Page.navigate', { url: `http://127.0.0.1:${HTTP_PORT}/${page}` });
  for (let i = 0; i < 80; i++) { await sleep(500); try { if (await ev(`document.querySelectorAll('article').length >= 4 && !!window.AnluStoreDesignSystem_2c1944?.selection`)) break; } catch {} }
  await ev(LIB); await sleep(600);
}
const BLANK = 'rgba(0, 0, 0, 0)';
try {
  await load('tienda.html');
  // Camiseta Multi: 3 colores elegibles, talles por espacios, nada preseleccionado
  await ev(`__t.abrir(0)`);
  check('T1 colores separados', same(await ev('__t.colors()'), ['Rojo', 'Negro', 'Blanco']), await ev('__t.colors()'));
  check('T1 talles S M L', same(await ev('__t.sizes()'), ['S', 'M', 'L']), await ev('__t.sizes()'));
  check('T1 con varios talles no hay ninguno preelegido', !(await ev('__t.sizeSelected()')).some(Boolean));
  const sw = await ev('__t.swatches()');
  const blanco = sw.find(s => s.c === 'Blanco'), rojo = sw.find(s => s.c === 'Rojo');
  check('T1 Blanco: círculo blanco CON borde visible', blanco.bg === 'rgb(255, 255, 255)' && /0\.35/.test(blanco.shadow), blanco);
  check('T1 colores se distinguen entre sí', new Set(sw.map(s => s.bg)).size === 3, sw.map(s => s.bg));
  await ev(`__t.pick('L', 'Negro')`); await ev('__t.confirmar()');
  check('T1 store guarda solo el color elegido', same(await ev('__t.items()'), [{ id: 'AN-901', color: 'Negro', size: 'L' }]), await ev('__t.items()'));
  const m = await ev('__t.msg()');
  check('T1 mensaje "Finalizar": color puntual, no la lista', /Color Negro/.test(m) && !/Rojo|Blanco/.test(m), m);
  await ev(`__t.abrir(0, 'Comprar')`);
  const op = decodeURIComponent((await ev('__opened')).at(-1) || '');
  check('T2 mensaje "Comprar": color puntual, no la lista', /talla L, color Negro/.test(op) && !/Rojo|Blanco/.test(op) && /wa\.me\/573126045120/.test(op), op);
  check('T6 imagen: primer link http válido', (await ev(`[...__t.cards()[0].querySelectorAll('img')].map(i => i.src)`)).includes('https://example.com/a.jpg'), await ev(`[...__t.cards()[0].querySelectorAll('img')].map(i => i.src)`));

  // Vestido Raro: un solo talle libre ya elegido + colores conocidos/desconocidos
  await ev(`__t.abrir(1)`);
  check('T3 colores', same(await ev('__t.colors()'), ['Celeste', 'Verde agua', 'Zafiro raro', 'Zeta', 'ROJO']), await ev('__t.colors()'));
  check('T3 un solo talle "Talla 6" entero', same(await ev('__t.sizes()'), ['Talla 6']), await ev('__t.sizes()'));
  check('T3 talle único ya elegido', same(await ev('__t.sizeSelected()'), [true]));
  const s3 = await ev('__t.swatches()'); const g = n => s3.find(s => s.c === n);
  check('T6 Celeste ya no queda blanco', g('Celeste').bg === 'rgb(158, 216, 240)', g('Celeste'));
  check('T6 Verde agua reconocido', g('Verde agua').bg === 'rgb(143, 217, 200)', g('Verde agua'));
  check('T6 "ROJO" (mayúsculas) reconocido', g('ROJO').bg === 'rgb(211, 47, 47)', g('ROJO'));
  const z1 = g('Zafiro raro'), z2 = g('Zeta');
  check('T6 desconocido: borde visible + inicial, no blanco', z1.bg !== BLANK && z1.bg !== 'rgb(255, 255, 255)' && /125, 91, 166/.test(z1.shadow) && z1.text === 'ZA', z1);
  check('T6 dos desconocidos con misma inicial se distinguen', z2.text === 'ZE' && z1.text !== z2.text, [z1.text, z2.text]);
  check('T3 sin elegir color todavía no se puede confirmar', !(await ev('__t.confirmOk()')));
  await ev(`__t.pick(null, 'Celeste')`);
  check('T3 con solo elegir color ya se puede confirmar', await ev('__t.confirmOk()'));
  await ev('__t.confirmar()');
  check('T3 store: Talla 6 + Celeste', same((await ev('__t.items()')).at(-1), { id: 'AN-902', color: 'Celeste', size: 'Talla 6' }), await ev('__t.items()'));

  await ev(`__t.abrir(2)`);
  check('T4 "Único" una sola opción, ya elegida', same(await ev('__t.sizes()'), ['Único']) && same(await ev('__t.sizeSelected()'), [true]), [await ev('__t.sizes()'), await ev('__t.sizeSelected()')]);
  check('T4 Lila con color', (await ev('__t.swatches()'))[0].bg === 'rgb(196, 181, 253)');
  await ev(`document.querySelector('button[aria-label="Cerrar"]').click()`); await sleep(200);
  await ev(`__t.abrir(3)`);
  check('T5 talles coma + salto de línea', same(await ev('__t.sizes()'), ['XS', 'S', 'M', 'L']), await ev('__t.sizes()'));

  // index.html con el mismo catálogo
  await load('index.html');
  await ev(`__t.abrir(0)`);
  check('IDX colores separados', same(await ev('__t.colors()'), ['Rojo', 'Negro', 'Blanco']), await ev('__t.colors()'));
  check('IDX talles', same(await ev('__t.sizes()'), ['S', 'M', 'L']), await ev('__t.sizes()'));
  check('IDX imagen http válida', (await ev(`[...__t.cards()[0].querySelectorAll('img')].map(i => i.src)`)).includes('https://example.com/a.jpg'));
} catch (e) { fails++; results.push('EXCEPCIÓN del test: ' + e.message); }
console.log(results.join('\n'));
console.log('\nErrores de consola/excepciones:', errors.length ? '\n' + [...new Set(errors)].join('\n') : 'ninguno');
console.log(fails ? `\n${fails} FALLO(S)` : '\nTODO OK');
cleanup(); process.exit(fails ? 1 : 0);
