#!/usr/bin/env node
// Vista para revisar los borradores (C-01) en una tarde: una sola página HTML local con las 51 piezas.
//
//   node tools/revision-borradores.js            → tools/salida/revision-borradores.html (ábrelo en el navegador)
//
// Para cada pieza (intro y meta de las categorías y familias; texto completo de /content), frase a frase:
//   - al lado, el fragmento de /legacy (o de los catálogos PDF) que más se le parece, con el archivo de origen y el %
//     de palabras de la frase que están en ese fragmento;
//   - en ROJO, las frases sin un origen claro (< 50 %); en ÁMBAR, las de origen parcial (< 75 %), las que tienen
//     palabras que no aparecen en ningún sitio de /legacy ni de los PDF, o afirmaciones sensibles (stock, plazos,
//     certificaciones, normas, superlativos…); en verde, el resto.
//   - las palabras sin origen van subrayadas en rojo y las sensibles, en ámbar.
// Cada pieza tiene «Aprobada» y una nota, que se guardan en el navegador (localStorage). «Exportar» da la lista que
// lee tools/aprobar-borradores.js para quitar las marcas de borrador. La decisión es siempre de la persona: la
// herramienta solo acerca la evidencia. No se publica (tools/salida/ está en .gitignore).
//
// Texto de los PDF: tools/datos/catalogos-pdf.txt (extraído el 2026-10-12; solo sirve para BUSCAR). Los PDF de
// termopares, cañas pirométricas e IoT son imágenes escaneadas: lo que venga de ellos hay que mirarlo en el PDF.
// Sin dependencias: solo módulos nativos de Node.
'use strict';
const fs = require('fs');
const path = require('path');
const L = require('./lib/legacy');

const RAIZ = L.RAIZ;
const SALIDA = path.join(RAIZ, 'tools', 'salida', 'revision-borradores.html');

// ---------- Corpus: frases de /legacy (área de contenido de cada página) y de los catálogos PDF ----------
// minimo: las frases nuevas cortas («Calidad») no se analizan; en /legacy se guardan todas (los nombres de producto
// como «PNEA-DNEA» u «Horno Mic» son líneas cortas y son justo el origen de los modelos)
const separarFrases = (texto, minimo = 12) => texto.split('\n')
  .flatMap(l => l.split(/(?<=[.!?;:])\s+(?=[¿¡«"(]?[A-ZÁÉÍÓÚÑ0-9])/))
  .map(f => f.replace(/\s+/g, ' ').trim())
  .filter(f => f.length >= minimo);
const palabras = s => L.tokens(s).filter(t => (t.length >= 3 || /\d/.test(t)) && !L.VACIAS.has(t));
// En /legacy, «PNEA-DNEA» se normaliza como una sola palabra: se guardan también las partes separadas por guion
const tokensCorpus = frase => new Set([...palabras(frase), ...palabras(frase.replace(/-/g, ' '))]);

function paginasLegacy() {
  const lista = [];
  (function recorrer(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) recorrer(p);
      else if (/\.html?$/.test(e.name)) lista.push(p);
    }
  })(path.join(RAIZ, 'legacy'));
  return lista;
}
const corpus = [];      // { origen, frase, tokens:Set }
const vocabulario = new Set();
for (const archivo of paginasLegacy()) {
  const html = fs.readFileSync(archivo, 'utf8');
  const area = L.areaContenido(html) || html.replace(/^[\s\S]*?<body\b/i, '');
  const origen = path.relative(RAIZ, archivo).replace(/\\/g, '/').replace(/^legacy\/(com|es)\//, '');
  for (const frase of separarFrases(L.textoPlano(area), 3)) {
    const t = tokensCorpus(frase);
    if (!t.size) continue;
    corpus.push({ origen, frase, tokens: t });
    for (const x of t) vocabulario.add(x);
  }
}
const rutaPdf = path.join(RAIZ, 'tools', 'datos', 'catalogos-pdf.txt');
if (fs.existsSync(rutaPdf)) {
  let actual = null;
  for (const linea of fs.readFileSync(rutaPdf, 'utf8').split('\n')) {
    if (linea.startsWith('@@@ ')) { actual = linea.slice(4).trim(); continue; }
    if (!actual) continue;
    // El texto de los PDF no tiene puntuación fiable: trozos de ~30 palabras que se solapan a la mitad
    const p = linea.split(/\s+/).filter(Boolean);
    for (let i = 0; i < p.length; i += 15) {
      const frase = p.slice(i, i + 30).join(' ');
      const t = tokensCorpus(frase);
      if (t.size < 3) continue;
      corpus.push({ origen: actual, frase, tokens: t, pdf: true });
      for (const x of t) vocabulario.add(x);
    }
  }
}

// ---------- Piezas en borrador ----------
const piezas = [];
for (const f of fs.readdirSync(path.join(RAIZ, 'data', 'categorias')).filter(x => x.endsWith('.json')).sort()) {
  const j = JSON.parse(fs.readFileSync(path.join(RAIZ, 'data', 'categorias', f), 'utf8'));
  if (!j._borrador) continue;
  const base = f.replace(/\.json$/, '');
  piezas.push({ id: `data/categorias/${f}`, tipo: 'Categoría', titulo: j.h1, ruta: `/${base}.html`,
    primarios: [`brototermic.com/${base}.html`], partes: [['Meta', j.meta], ['Intro', j.intro]] });
}
const familias = JSON.parse(fs.readFileSync(path.join(RAIZ, 'data', 'familias.json'), 'utf8'));
for (const fam of familias.filter(x => x._borrador)) {
  piezas.push({ id: `data/familias.json#${fam.id}`, tipo: 'Familia', titulo: fam.h1, ruta: `/${fam.archivo}.html`,
    primarios: (fam.categorias || []).map(c => `brototermic.com/${c.archivo}.html`), partes: [['Meta', fam.meta], ['Intro', fam.intro]] });
}
const LEGACY_DE_CONTENT = {
  inicio: ['brototermic.com/index.html'], empresa: ['brototermic.com/empresa.html'],
  'fabricaciones-a-medida': ['brototermic.com/fabricaciones-a-medida.html'], 'nuevos-productos': ['brototermic.com/nuevos-productos.html'],
  contacto: ['brototermic.com/contacto/contacto.html'], oviedo: ['brototermic.com/oviedo/index.html', 'www.brototermic.es/index.html'],
  privacidad: ['brototermic.com/privacidad.html'], cookies: ['brototermic.com/cookies.html'],
};
for (const f of fs.readdirSync(path.join(RAIZ, 'content')).filter(x => x.endsWith('.html')).sort()) {
  const texto = fs.readFileSync(path.join(RAIZ, 'content', f), 'utf8');
  const cabecera = (texto.match(/^<!--([\s\S]*?)-->/) || [])[1] || '';
  if (!/^\s*borrador:\s*si\s*$/m.test(cabecera)) continue;
  const meta = Object.fromEntries([...cabecera.matchAll(/^\s*(\w+):\s*(.+)$/gm)].map(m => [m[1], m[2].trim()]));
  const base = f.replace(/\.html$/, '');
  const ruta = base === 'inicio' ? '/' : base === 'oviedo' ? '/oviedo/' : base === 'contacto' ? '/contacto/contacto.html' : `/${base}.html`;
  piezas.push({ id: `content/${f}`, tipo: 'Texto de /content', titulo: meta.h1 || base, ruta,
    primarios: LEGACY_DE_CONTENT[base] || [], partes: [['Meta', meta.meta], ['Texto', texto.replace(/^<!--[\s\S]*?-->/, '')]] });
}

// ---------- Análisis frase a frase ----------
// Afirmaciones que AGENTS.md §4 prohíbe inventar: se marcan siempre, aunque tengan origen, para mirarlas con cuidado
// («fabricación a medida» no se marca: está en todas las intros por plantilla y /legacy la respalda en general)
const SENSIBLES = /\b(stock|plazos?|entregas?|inmediat\w*|urgen\w*|certific\w*|homolog\w*|normas?|normativa\w*|directiva\w*|iso|en ?\d{3,}|iec ?\d+|atex|garantia\w*|lider\w*|mejor\w*|excelen\w*|experiencia|anos|asesor\w*|instalacion\w*|montaje|reparacion\w*|servicio tecnico)\b/;
// Una palabra «está» en un vocabulario si está tal cual o, si tiene 6 letras o más, si hay otra con su misma raíz
// de 5 letras («controlan» ↔ «controlador», «detectan» ↔ «detección»): el texto nuevo conjuga distinto que el antiguo.
// Las cifras y los modelos (con dígitos) solo cuentan si están tal cual.
const raices = new WeakMap();
function conocida(x, vocab) {
  if (vocab.has(x)) return true;
  if (x.length < 6 || /\d/.test(x)) return false;
  if (!raices.has(vocab)) raices.set(vocab, new Set([...vocab].filter(w => w.length >= 5 && !/\d/.test(w)).map(w => w.slice(0, 5))));
  return raices.get(vocab).has(x.slice(0, 5));
}

// Vocabulario de las páginas antiguas de una pieza (su página o, en una familia, las de sus categorías)
const cacheVocab = new Map();
function vocabularioDe(primarios) {
  const clave = primarios.join('|');
  if (!cacheVocab.has(clave)) {
    const v = new Set();
    for (const c of corpus) if (primarios.some(p => c.origen.endsWith(p))) for (const x of c.tokens) v.add(x);
    cacheVocab.set(clave, v);
  }
  return cacheVocab.get(clave);
}
// Palabras de las plantillas de intro (prompt estándar de plan-contenido.md): no son afirmaciones sobre el producto
const DE_PLANTILLA = new Set(palabras(`En esta página tienes encontrarás puedes pídenos pide pedir presupuesto envíanos tu plano muestra foto
  adjuntar adjunta consulta consúltanos llámanos llamarnos escríbenos escribirnos cuéntanos indícanos solicita formulario página familia
  categoría modelo modelos te tu tus nuestra nuestro nuestros nuestras también cada si cualquier necesitas necesites buscas quieres
  prefieres encaja ninguno volver estudiaremos preparamos cuántos cuántas PDF
  945 22 33 31 · 629 462 642 · info@brototermic.com · brototermic@brototermic.com · Vitoria-Gasteiz Oviedo`));

// Estado de una frase:
//   rojo  = tiene palabras que no están en ningún sitio de /legacy ni de los PDF, o menos de la mitad de sus palabras
//           están en su página antigua y tampoco hay un fragmento que la cubra a medias;
//   ámbar = afirmación sensible, menos del 80 % de sus palabras en su página antigua o fragmento más parecido < 75 %;
//   verde = el resto.
function analizar(frase, primarios) {
  const t = palabras(frase);
  if (!t.length) return null;
  let mejor = null;
  for (const c of corpus) {
    let n = 0;
    for (const x of t) if (c.tokens.has(x)) n++;
    const bonus = primarios.some(p => c.origen.endsWith(p)) ? 0.04 : 0;
    const puntos = n / t.length + bonus;
    if (!mejor || puntos > mejor.puntos) mejor = { ...c, puntos, cobertura: n / t.length };
  }
  const propias = t.filter(x => !DE_PLANTILLA.has(x));
  const vocabPagina = vocabularioDe(primarios);
  const enPagina = propias.length ? propias.filter(x => conocida(x, vocabPagina)).length / propias.length : 1;
  const fueraDePagina = [...new Set(propias.filter(x => conocida(x, vocabulario) && !conocida(x, vocabPagina)))];
  const sinOrigen = [...new Set(propias.filter(x => !conocida(x, vocabulario)))];
  const sensibles = [...new Set((L.normalizar(frase).match(new RegExp(SENSIBLES.source, 'g')) || []))];
  const cob = mejor ? mejor.cobertura : 0;
  const soloPlantilla = !propias.length && !sensibles.length;
  const estado = soloPlantilla ? 'verde' : sinOrigen.length || (enPagina < 0.5 && cob < 0.5) ? 'rojo'
    : (sensibles.length || enPagina < 0.8 || cob < 0.75) ? 'ambar' : 'verde';
  return { frase, mejor, cobertura: cob, enPagina, fueraDePagina, sinOrigen, sensibles, estado };
}

const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
// Pinta la frase con las palabras sin origen (rojo) y sensibles (ámbar) subrayadas
function resaltar(frase, { sinOrigen, fueraDePagina }) {
  return frase.split(/(\s+)/).map(w => {
    const n = L.normalizar(w);
    const partes = n ? n.split(' ') : [];
    if (partes.some(x => sinOrigen.includes(x))) return `<mark class="no">${esc(w)}</mark>`;
    if (n && SENSIBLES.test(n)) return `<mark class="se">${esc(w)}</mark>`;
    if (partes.some(x => fueraDePagina.includes(x))) return `<mark class="fu" title="No está en su página antigua (sí en otras de /legacy o en los PDF)">${esc(w)}</mark>`;
    return esc(w);
  }).join('');
}
function resaltarOrigen(frase, tokensFrase) {
  return frase.split(/(\s+)/).map(w => (L.normalizar(w).split(' ').some(x => tokensFrase.has(x)) ? `<b>${esc(w)}</b>` : esc(w))).join('');
}

let total = { rojo: 0, ambar: 0, verde: 0 };
const bloques = piezas.map((p, i) => {
  const filas = [];
  const cuenta = { rojo: 0, ambar: 0, verde: 0 };
  for (const [nombre, html] of p.partes) {
    if (!html) continue;
    for (const frase of separarFrases(L.textoPlano(html))) {
      const r = analizar(frase, p.primarios);
      if (!r) continue;
      cuenta[r.estado]++;
      const origen = r.mejor
        ? `<div class="or">${resaltarOrigen(r.mejor.frase.length > 320 ? `${r.mejor.frase.slice(0, 320)}…` : r.mejor.frase, new Set(palabras(frase)))}</div>
           <div class="ar">${esc(r.mejor.origen)}${r.mejor.pdf ? ' (PDF)' : ''}${p.primarios.some(x => r.mejor.origen.endsWith(x)) ? ' · <em>su página antigua</em>' : ''}</div>`
        : '—';
      filas.push(`<tr class="${r.estado}"><td class="pa">${esc(nombre)}</td><td>${resaltar(frase, r)}${
        r.sinOrigen.length ? `<div class="nota-no">Sin origen en /legacy ni en los PDF: ${esc(r.sinOrigen.join(', '))}</div>` : ''}</td>
        <td>${origen}</td><td class="pc" title="Palabras de la frase que están en su página antigua · en el fragmento de al lado">${Math.round(r.enPagina * 100)} %<br><small>${Math.round(r.cobertura * 100)} %</small></td></tr>`);
    }
  }
  for (const k of Object.keys(total)) total[k] += cuenta[k];
  const clave = esc(p.id);
  return `<section class="pieza" id="p${i}" data-id="${clave}" data-rojo="${cuenta.rojo}" data-ambar="${cuenta.ambar}">
  <h2><span class="n">${i + 1}</span> ${esc(p.titulo)} <small>${esc(p.tipo)} · <code>${clave}</code></small></h2>
  <p class="acciones"><a href="http://localhost:8000${esc(p.ruta)}" target="_blank" rel="noopener">Ver la página (npm run dev)</a>
    · Página antigua: ${p.primarios.length ? p.primarios.map(x => `<code>${esc(x)}</code>`).join(', ') : '—'}
    · <span class="c rojo">${cuenta.rojo} sin origen</span> <span class="c ambar">${cuenta.ambar} revisar</span> <span class="c verde">${cuenta.verde} con origen</span></p>
  <table><thead><tr><th></th><th>Frase nueva</th><th>Origen más parecido (en negrita, las palabras que coinciden)</th><th title="Página antigua · fragmento">% pág.<br>% frag.</th></tr></thead>
  <tbody>${filas.join('\n')}</tbody></table>
  <div class="decision"><label><input type="checkbox" class="ok"> <strong>Aprobada</strong> (el texto es correcto y cada afirmación tiene origen)</label>
    <label>Nota: <input type="text" class="nota" placeholder="qué hay que cambiar, o quién la ha revisado"></label></div>
</section>`;
});

const indice = piezas.map((p, i) => `<li><a href="#p${i}">${esc(p.titulo)}</a> <span class="est" data-i="${i}"></span></li>`).join('');
const html = `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Revisión de borradores · BROTOTERMIC</title>
<style>
body{font:15px/1.5 system-ui,sans-serif;color:#404751;margin:0;background:#f1f1f1}
header{background:#1d356c;color:#fff;padding:16px 24px;position:sticky;top:0;z-index:2}
header h1{margin:0 0 4px;font-size:20px} header p{margin:0}
header button{font:inherit;margin-left:8px;padding:6px 12px;border:0;border-radius:4px;background:#fff;color:#004c9a;cursor:pointer}
main{display:grid;grid-template-columns:260px 1fr;gap:24px;padding:24px}
nav ol{margin:0;padding-left:22px;position:sticky;top:96px;max-height:80vh;overflow:auto;font-size:13px}
nav .est.hecho::after{content:" ✔";color:#1a7f37} nav .est.nota::after{content:" ✎";color:#9a6700}
.pieza{background:#fff;border-radius:8px;padding:16px 20px;margin-bottom:24px;box-shadow:0 1px 3px #0002}
.pieza.hecha{outline:3px solid #1a7f37}
h2{margin:0 0 6px;font-size:18px;color:#1d356c} h2 small{font-weight:400;color:#5e5e5e;font-size:13px}
.n{display:inline-block;min-width:28px;text-align:center;background:#004c9a;color:#fff;border-radius:4px;margin-right:6px}
.acciones{font-size:13px;margin:0 0 10px}
table{width:100%;border-collapse:collapse;font-size:14px} th{text-align:left;font-size:12px;color:#5e5e5e;border-bottom:2px solid #dadada}
td{vertical-align:top;padding:8px;border-bottom:1px solid #eee} td:first-child{border-left:6px solid transparent}
tr.rojo td:first-child{border-left-color:#cf222e} tr.ambar td:first-child{border-left-color:#d4a72c} tr.verde td:first-child{border-left-color:#2da44e}
tr.rojo td:nth-child(2){background:#ffebe9} tr.ambar td:nth-child(2){background:#fff8c5}
.pa{font-size:12px;color:#5e5e5e;width:44px} .pc{width:44px;text-align:right;font-variant-numeric:tabular-nums}
td:nth-child(3){width:42%;color:#5e5e5e;font-size:13px} .ar{font-size:12px;margin-top:4px;color:#004c9a}
mark.no{background:none;text-decoration:underline wavy #cf222e;color:#a40e26;font-weight:600} mark.se{background:#fff1b8}
mark.fu{background:none;text-decoration:underline dotted #5e5e5e}
.nota-no{font-size:12px;color:#a40e26;margin-top:4px}
.c{font-size:12px;padding:1px 6px;border-radius:10px;margin-left:4px} .c.rojo{background:#ffebe9} .c.ambar{background:#fff8c5} .c.verde{background:#dafbe1}
.decision{display:flex;flex-wrap:wrap;gap:16px;align-items:center;margin-top:12px;padding-top:12px;border-top:1px solid #dadada}
.decision input[type=text]{width:420px;max-width:100%;font:inherit;padding:4px 8px}
#exportar{display:none;position:fixed;inset:10% 15%;background:#fff;padding:20px;box-shadow:0 8px 40px #0006;z-index:3;border-radius:8px}
#exportar textarea{width:100%;height:70%;font:13px monospace}
.leyenda span[style]{padding:0 6px;border-radius:3px;color:#404751}
</style></head><body>
<header><h1>Revisión de borradores: ${piezas.length} piezas</h1>
<p class="leyenda">Frases: <span style="background:#ffebe9">${total.rojo} sin origen claro</span> · <span style="background:#fff8c5">${total.ambar} para revisar</span> · ${total.verde} con origen.
Subrayado rojo: palabra que no está en /legacy ni en los PDF. Fondo ámbar: afirmación sensible (stock, plazos, certificaciones, normas…). Subrayado de puntos: no está en su página antigua (sí en otra).
<span id="progreso"></span> <button id="btn-exportar" type="button">Exportar aprobadas y notas</button></p></header>
<main><nav><ol>${indice}</ol></nav><div>${bloques.join('\n')}</div></main>
<div id="exportar"><p><strong>Copia este texto en un archivo</strong> (por ejemplo, <code>aprobadas.txt</code>) y ejecuta
<code>node tools/aprobar-borradores.js aprobadas.txt</code>. Solo se quitan las marcas de las piezas con «APROBADA».</p>
<textarea readonly></textarea><p><button type="button" id="cerrar">Cerrar</button></p></div>
<script>
(function () {
  var CLAVE = 'brototermic-revision-borradores';
  var datos = JSON.parse(localStorage.getItem(CLAVE) || '{}');
  var piezas = Array.prototype.slice.call(document.querySelectorAll('.pieza'));
  function guardar() { localStorage.setItem(CLAVE, JSON.stringify(datos)); pintar(); }
  function pintar() {
    var hechas = 0;
    piezas.forEach(function (p, i) {
      var d = datos[p.dataset.id] || {};
      p.classList.toggle('hecha', !!d.ok);
      var est = document.querySelector('.est[data-i="' + i + '"]');
      est.className = 'est' + (d.ok ? ' hecho' : d.nota ? ' nota' : '');
      if (d.ok) hechas++;
    });
    document.getElementById('progreso').textContent = hechas + ' de ' + piezas.length + ' aprobadas.';
  }
  piezas.forEach(function (p) {
    var d = datos[p.dataset.id] || {};
    var ok = p.querySelector('.ok'), nota = p.querySelector('.nota');
    ok.checked = !!d.ok; nota.value = d.nota || '';
    ok.addEventListener('change', function () { datos[p.dataset.id] = { ok: ok.checked, nota: nota.value }; guardar(); });
    nota.addEventListener('input', function () { datos[p.dataset.id] = { ok: ok.checked, nota: nota.value }; guardar(); });
  });
  document.getElementById('btn-exportar').addEventListener('click', function () {
    var lineas = piezas.map(function (p) {
      var d = datos[p.dataset.id] || {};
      return (d.ok ? 'APROBADA' : 'PENDIENTE') + '\\t' + p.dataset.id + (d.nota ? '\\t' + d.nota.replace(/\\s+/g, ' ') : '');
    });
    var caja = document.getElementById('exportar');
    caja.querySelector('textarea').value = lineas.join('\\n') + '\\n';
    caja.style.display = 'block';
  });
  document.getElementById('cerrar').addEventListener('click', function () { document.getElementById('exportar').style.display = 'none'; });
  pintar();
})();
</script></body></html>`;

fs.mkdirSync(path.dirname(SALIDA), { recursive: true });
fs.writeFileSync(SALIDA, html);
console.log(`${piezas.length} piezas en borrador · frases: ${total.rojo} sin origen claro, ${total.ambar} para revisar, ${total.verde} con origen`);
console.log(`→ ${path.relative(RAIZ, SALIDA)} (ábrelo en el navegador; las marcas se guardan en el propio navegador)`);
