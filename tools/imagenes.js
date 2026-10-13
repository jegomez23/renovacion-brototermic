#!/usr/bin/env node
// Procesa imágenes con el Chrome instalado (canvas), sin dependencias: recorta, tapa zonas, reduce y exporta en WebP
// y JPG. Las recetas están en tools/datos/imagenes.json, para que cualquier imagen derivada se pueda rehacer igual.
//
//   node tools/imagenes.js                 → procesa todas las recetas
//   node tools/imagenes.js portada-nivel   → solo las que contienen ese texto en «salida»
//
// Receta: { entrada, salida (ruta sin extensión, con {ancho}), recorte: {x,y,w,h}, placas: [{x,y,w,h,r,color}], gris: true,
//           anchos: [480, 910], formatos: ["webp","jpg"], calidad: 0.82 }
// Reglas (AGENTS.md §5): nunca amplía (un ancho mayor que el recorte se omite); «placas» solo tapa con un color liso
// (textos o rótulos que no se pueden publicar); no toca forma ni color del producto.
'use strict';
const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const RAIZ = path.join(__dirname, '..');
const recetas = JSON.parse(fs.readFileSync(path.join(__dirname, 'datos', 'imagenes.json'), 'utf8'))
  .filter(r => !process.argv[2] || r.salida.includes(process.argv[2]));
const CHROME = process.env.CHROME || ['C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', '/usr/bin/google-chrome', '/usr/bin/chromium'].find(p => fs.existsSync(p));
const PUERTO = 9533;
const espera = ms => new Promise(r => setTimeout(r, ms));
const MIME = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' };

// Se ejecuta DENTRO de Chrome: devuelve { ancho: { formato: dataURL } }
const PROCESAR = `async (src, r) => {
  const img = new Image(); img.src = src; await img.decode();
  const rc = r.recorte || { x: 0, y: 0, w: img.naturalWidth, h: img.naturalHeight };
  const base = document.createElement('canvas'); base.width = rc.w; base.height = rc.h;
  const b = base.getContext('2d');
  b.drawImage(img, rc.x, rc.y, rc.w, rc.h, 0, 0, rc.w, rc.h);
  for (const p of r.placas || []) { b.fillStyle = p.color; b.beginPath(); b.roundRect(p.x - rc.x, p.y - rc.y, p.w, p.h, p.r || 0); b.fill(); }
  const salida = {};
  for (const ancho of r.anchos) {
    if (ancho > rc.w) continue;
    const c = document.createElement('canvas'); c.width = ancho; c.height = Math.round(rc.h * ancho / rc.w);
    const x = c.getContext('2d'); x.imageSmoothingQuality = 'high';
    if (r.fondo) { x.fillStyle = r.fondo; x.fillRect(0, 0, c.width, c.height); }
    if (r.gris) x.filter = 'grayscale(1)';
    x.drawImage(base, 0, 0, c.width, c.height);
    salida[ancho] = { alto: c.height };
    for (const f of r.formatos) salida[ancho][f] = c.toDataURL(f === 'jpg' ? 'image/jpeg' : 'image/' + f, r.calidad || 0.82);
  }
  return salida;
}`;

(async () => {
  if (!CHROME) throw new Error('No encuentro Chrome (variable CHROME)');
  const perfil = fs.mkdtempSync(path.join(os.tmpdir(), 'chrome-imagenes-'));
  const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${PUERTO}`, `--user-data-dir=${perfil}`, '--no-first-run', 'about:blank'], { stdio: 'ignore' });
  try {
    let pagina;
    for (let i = 0; i < 50 && !pagina; i++) { await espera(200); try { pagina = (await (await fetch(`http://127.0.0.1:${PUERTO}/json/list`)).json()).find(t => t.type === 'page'); } catch {} }
    if (!pagina) throw new Error('Chrome no responde');
    const ws = new WebSocket(pagina.webSocketDebuggerUrl);
    await new Promise(ok => { ws.onopen = ok; });
    let id = 0; const pend = new Map();
    ws.onmessage = ({ data }) => { const m = JSON.parse(data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); } };
    const env = (method, params) => new Promise(ok => { pend.set(++id, ok); ws.send(JSON.stringify({ id, method, params })); });
    for (const r of recetas) {
      const entrada = path.join(RAIZ, r.entrada);
      const src = `data:${MIME[path.extname(entrada).toLowerCase()]};base64,${fs.readFileSync(entrada).toString('base64')}`;
      const res = await env('Runtime.evaluate', { expression: `(${PROCESAR})(${JSON.stringify(src)}, ${JSON.stringify(r)})`, awaitPromise: true, returnByValue: true });
      if (res.result?.exceptionDetails) throw new Error(`${r.entrada}: ${res.result.exceptionDetails.exception?.description}`);
      for (const [ancho, formatos] of Object.entries(res.result.result.value)) {
        for (const [f, url] of Object.entries(formatos)) {
          if (f === 'alto') continue;
          const destino = path.join(RAIZ, `${r.salida.replace('{ancho}', ancho)}.${f}`);
          fs.mkdirSync(path.dirname(destino), { recursive: true });
          fs.writeFileSync(destino, Buffer.from(url.split(',')[1], 'base64'));
          console.log(`${path.relative(RAIZ, destino)}  ${ancho}×${formatos.alto}  ${Math.round(fs.statSync(destino).size / 1024)} KB`);
        }
      }
    }
    ws.close();
  } finally { chrome.kill(); }
})().catch(e => { console.error(e.message); process.exitCode = 1; });
