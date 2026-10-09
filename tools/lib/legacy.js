// Lectura compartida de /legacy y de los CSV del plan (la usan importar-legacy.js y auditoria-seo.js).
// Así el importador y el auditor «leen» la web antigua exactamente igual.
// Sin dependencias: solo módulos nativos de Node.
'use strict';
const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..', '..');
const LEGACY_COM = path.join(RAIZ, 'legacy', 'com', 'brototermic.com');
const LEGACY_ES = path.join(RAIZ, 'legacy', 'es', 'www.brototermic.es');
const HOST = 'https://brototermic.com';

// ---------- CSV (comillas dobles, "" escapadas, saltos de línea dentro de campo) ----------
function leerCsv(ruta) {
  const t = fs.readFileSync(path.isAbsolute(ruta) ? ruta : path.join(RAIZ, ruta), 'utf8').replace(/^﻿/, '');
  const filas = [];
  let fila = [], campo = '', q = false;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (q) { if (c === '"' && t[i + 1] === '"') { campo += '"'; i++; } else if (c === '"') q = false; else campo += c; }
    else if (c === '"') q = true;
    else if (c === ',') { fila.push(campo); campo = ''; }
    else if (c === '\n') { fila.push(campo.replace(/\r$/, '')); filas.push(fila); fila = []; campo = ''; }
    else campo += c;
  }
  if (campo || fila.length) { fila.push(campo.replace(/\r$/, '')); filas.push(fila); }
  const [cab, ...resto] = filas;
  return resto.filter(f => f.length > 1).map(f => Object.fromEntries(cab.map((k, i) => [k, f[i] ?? ''])));
}

// ---------- HTML ----------
const ENTIDADES = { nbsp: ' ', amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", ordm: 'º', ordf: 'ª', deg: '°', frac14: '¼', frac12: '½', frac34: '¾', reg: '®', copy: '©', euro: '€', iexcl: '¡', iquest: '¿', laquo: '«', raquo: '»', middot: '·', micro: 'µ', plusmn: '±', sup2: '²', sup3: '³', times: '×' };
const decodificar = s => s
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
  .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
  .replace(/&([a-z0-9]+);/gi, (m, e) => ENTIDADES[e] ?? ENTIDADES[e.toLowerCase()] ?? m);

const sinComentarios = h => h.replace(/<!--[\s\S]*?-->/g, '').replace(/<script\b[\s\S]*?<\/script>/gi, '').replace(/<style\b[\s\S]*?<\/style>/gi, '');

// Texto plano: las etiquetas de bloque y los <br> cortan frase (marca \n)
const BLOQUE = /<\/?(p|div|br|li|ul|ol|h[1-6]|article|section|figure|table|tr|td|th|caption|header|footer|nav|aside|main|details|summary|address)\b[^>]*>/gi;
const textoPlano = html => decodificar(sinComentarios(html).replace(BLOQUE, '\n').replace(/<[^>]+>/g, ' '))
  .replace(/[ \t ]+/g, ' ').replace(/ *\n */g, '\n').replace(/\n+/g, '\n').trim();

// Área de contenido de una página de /legacy: de <section id="content"> al <footer> (sin cabecera, menú ni pie)
function areaContenido(html) {
  const i = html.indexOf('id="content"');
  if (i === -1) return '';
  const f = html.indexOf('<footer', i);
  return sinComentarios(html.slice(html.indexOf('>', i) + 1, f === -1 ? undefined : f));
}

// Productos de una página de categoría: cada <article> con su nombre en div.txt-1 (o h2-h4)
// Cada producto va de un <article> al siguiente: hay páginas con un </article> mal colocado
// (resistencias-tipo-cartucho) y con <article>…</article> se fusionarían dos productos.
function segmentosArticle(area) {
  const partes = area.split(/<article\b[^>]*>/i).slice(1);
  return partes.map((p, i) => {
    const cierre = p.search(/<\/article>/i);
    let s = cierre === -1 ? p : p.slice(0, cierre);
    if (i === partes.length - 1 && cierre === -1) s = s.replace(/<\/div>[\s\S]*$/, ''); // último sin cierre
    return s;
  });
}
// Lo que hay fuera de los productos (introducciones, tablas, PDF): se conserva en «cuerpo»
function fueraDeArticles(area) {
  return area.replace(/<article\b[^>]*>[\s\S]*?(?=<article\b|<\/article>|$)/gi, '').replace(/<\/article>/gi, '');
}

function productosLegacy(html) {
  return segmentosArticle(areaContenido(html)).map(interior => {
    const nombreHtml = (interior.match(/<div class="txt-1[^"]*">([\s\S]*?)<\/div>/i) || interior.match(/<h[2-4][^>]*>([\s\S]*?)<\/h[2-4]>/i) || [])[1] || '';
    return {
      nombre: textoPlano(nombreHtml).replace(/\s+/g, ' '),
      interior,
      imagenes: srcImagenes(interior),
      pdfs: hrefs(interior).filter(h => /\.pdf$/i.test(h.split(/[?#]/)[0])),
    };
  });
}

const srcImagenes = html => [...html.matchAll(/<img\b[^>]*\ssrc="([^"]+)"/gi)].map(m => m[1].trim());
const hrefs = html => [...html.matchAll(/<a\b[^>]*\shref="([^"]*)"/gi)].map(m => m[1].trim());

// ---------- Normalización para comparar textos antiguos y nuevos ----------
// minúsculas, sin tildes, sin guiones («IP-44» = «IP44»), número y unidad separados («1500mm» = «1500 mm»)
function normalizar(s) {
  return decodificar(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/ñ/g, 'n')
    .replace(/(\p{L})-(\p{L}|\d)|(\d)-(\p{L})/gu, (m, a, b, c, d) => (a ? a + b : c + d))
    .replace(/(\d)(\p{L})/gu, '$1 $2').replace(/(\p{L})(\d)/gu, '$1 $2')
    .replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
}
const VACIAS = new Set(['de', 'del', 'el', 'la', 'los', 'las', 'y', 'e', 'o', 'u', 'en', 'para', 'por', 'a', 'al', 'con', 'un', 'una', 'que', 'se', 'su', 'sus']);
const tokens = s => normalizar(s).split(' ').filter(Boolean);

function distancia(a, b) {
  if (Math.abs(a.length - b.length) > 1) return 2;
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) {
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  }
  return d[a.length][b.length];
}
// Dos palabras «coinciden» si son iguales, si solo difieren en una letra (erratas: «Reistencias») o en el plural
const coincide = (a, b) => a === b || (a.length >= 5 && b.length >= 5 && distancia(a, b) <= 1) ||
  (a.length >= 4 && (a + 's' === b || b + 's' === a || a + 'es' === b || b + 'es' === a));

// ---------- Erratas de docs/plan-contenido.md §3 (las ÚNICAS correcciones permitidas en textos de /legacy) ----------
// Se leen de la tabla del documento: así hay una sola lista. Solo se aplican las filas «mecánicas»
// (texto exacto → texto exacto); las que llevan «…», «/» o notas entre paréntesis se corrigen a mano.
function erratas() {
  const t = fs.readFileSync(path.join(RAIZ, 'docs', 'plan-contenido.md'), 'utf8').replace(/\r\n/g, '\n');
  const seccion = t.slice(t.indexOf('## 3. Erratas'), t.indexOf('## 4.'));
  const lista = [];
  for (const linea of seccion.split('\n')) {
    const c = linea.split('|').map(x => x.trim());
    if (c.length !== 5 || !c[1] || /^(Archivo|---)/.test(c[1])) continue;
    const [, archivo, de, a] = c;
    if (/[…(]|\s\/\s/.test(de + a) || de.includes('(')) continue;
    lista.push({ archivo: archivo.replace(/\s.*$/, ''), de: de.replace(/ \(doble espacio\)/, ''), a });
  }
  for (const [archivo, pares] of Object.entries(ERRATAS_MANUALES)) for (const [de, a] of pares) lista.push({ archivo, de, a });
  return lista;
}
// Filas de la misma tabla que no son «texto exacto → texto exacto» (llevan «…», «/» o notas), traducidas a
// sustituciones exactas comprobadas contra /legacy. Son erratas LISTADAS en el plan: no se añade ninguna más.
const ERRATAS_MANUALES = {
  'resistencias-tipo-cartucho.html': [['Nikel-Cromo', 'níquel-cromo'], ['Niquel-Cromo', 'níquel-cromo'], ['Oxido de magnesio', 'Óxido de magnesio'], ['granulometria', 'granulometría']],
  'controldenivel-sensores-capacitivos.html': [['Distancia actuación: 4…12mmm', 'Distancia de actuación: 4…12 mm']],
  'controltemperatura-equipos-de-medicion.html': [['incluído', 'incluido']],
  'controltemperatura-sondastemperatura.html': [['Termorresistencia  mineral', 'Termorresistencia mineral']],
};
// Aplica las erratas de una página (archivo = «resistencias-inmersion.html») a un texto
function corregirErratas(texto, archivo, lista = erratas()) {
  let s = texto;
  for (const e of lista) if (e.archivo === archivo) s = s.split(e.de).join(e.a);
  return s;
}

// ---------- Rutas ----------
// URL pública → archivo de /legacy (o null)
function archivoLegacy(url) {
  const u = new URL(url);
  const base = /brototermic\.es$/.test(u.hostname) ? LEGACY_ES : LEGACY_COM;
  let ruta = decodeURIComponent(u.pathname);
  if (ruta.endsWith('/')) ruta += 'index.html';
  const archivo = path.join(base, ruta);
  return fs.existsSync(archivo) ? archivo : null;
}

module.exports = {
  RAIZ, LEGACY_COM, LEGACY_ES, HOST,
  leerCsv, decodificar, sinComentarios, textoPlano, areaContenido, productosLegacy, segmentosArticle, fueraDeArticles, srcImagenes, hrefs,
  normalizar, tokens, VACIAS, coincide, archivoLegacy, erratas, corregirErratas,
};
