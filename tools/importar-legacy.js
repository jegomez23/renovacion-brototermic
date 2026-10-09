#!/usr/bin/env node
// Importa una página de categoría de /legacy y escribe el BORRADOR de su JSON (docs/datos.md, apartado 3).
//
// Uso:  node tools/importar-legacy.js <archivo-sin-.html> [--forzar]
//       node tools/importar-legacy.js resistencias-inmersion
//
// - Copia el texto LITERAL de cada producto (sin corregir erratas: eso lo hace la Persona B al revisar).
// - title, meta y h1 salen de docs/plan-paginas.csv; el alt propuesto, de docs/plan-imagenes.csv.
// - No inventa nada: si no detecta un dato (modelo, pdf), lo deja en null.
// - Marca el archivo con "_borrador": true. No sobrescribe un JSON existente salvo con --forzar.
// Sin dependencias: solo módulos nativos de Node.

'use strict';
const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..');
const LEGACY = path.join(RAIZ, 'legacy', 'com', 'brototermic.com');

const [archivo, opcion] = process.argv.slice(2);
if (!archivo) {
  console.error('Uso: node tools/importar-legacy.js <archivo-sin-.html> [--forzar]');
  process.exit(1);
}
const destino = path.join(RAIZ, 'data', 'categorias', `${archivo}.json`);
if (fs.existsSync(destino) && opcion !== '--forzar') {
  console.error(`Ya existe ${path.relative(RAIZ, destino)}. Puede tener cambios revisados: usa --forzar solo si quieres perderlos.`);
  process.exit(1);
}

// ---------- CSV (mismo lector que tools/validar-plan.js) ----------
function leerCsv(ruta) {
  const t = fs.readFileSync(ruta, 'utf8').replace(/^﻿/, '');
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
  if (campo || fila.length) { fila.push(campo); filas.push(fila); }
  const [cab, ...resto] = filas;
  return resto.filter(f => f.length > 1).map(f => Object.fromEntries(cab.map((k, i) => [k, f[i] ?? ''])));
}

// ---------- Limpieza de HTML ----------
const ENTIDADES = { nbsp: ' ', amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", ordm: 'º', deg: '°', frac14: '¼', frac12: '½', frac34: '¾', reg: '®', copy: '©', euro: '€' };
const decodificar = s => s
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
  .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
  .replace(/&([a-z0-9]+);/gi, (m, e) => ENTIDADES[e.toLowerCase()] ?? m);
const escapar = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const textoPlano = html => decodificar(html.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();

// Deja solo las etiquetas permitidas en «texto» (datos.md), sin atributos salvo href en <a>
const PERMITIDAS = new Set(['p', 'strong', 'em', 'br', 'a', 'ul', 'ol', 'li', 'sup', 'sub', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'caption']);
function limpiarHtml(html) {
  const partes = html.split(/(<[^>]+>)/);
  return partes.map(p => {
    const m = p.match(/^<(\/?)([a-z0-9]+)([^>]*)>$/i);
    if (!m) return p.startsWith('<') ? '' : escapar(decodificar(p).replace(/\s+/g, ' '));
    const [, cierre, nombre, attrs] = m;
    const n = nombre.toLowerCase();
    if (n === 'b') return `<${cierre}strong>`;
    if (n === 'i') return `<${cierre}em>`;
    if (!PERMITIDAS.has(n)) return '';
    if (n === 'br') return '<br>';
    if (n === 'a' && !cierre) {
      const href = (attrs.match(/href\s*=\s*"([^"]*)"/i) || [])[1];
      return href ? `<a href="${href}">` : '<a>';
    }
    return `<${cierre}${n}>`;
  }).join('')
    .replace(/\s*<br>\s*/g, '<br>')
    .replace(/(<br>)+(<\/p>)/g, '$2')
    .replace(/<p>\s+/g, '<p>').replace(/\s+<\/p>/g, '</p>')
    .replace(/<p><\/p>/g, '')
    .trim();
}

// ---------- Lectura de la página ----------
const rutaLegacy = path.join(LEGACY, `${archivo}.html`);
if (!fs.existsSync(rutaLegacy)) {
  console.error(`No existe ${path.relative(RAIZ, rutaLegacy)}`);
  process.exit(1);
}
const html = fs.readFileSync(rutaLegacy, 'utf8');
const inicio = html.indexOf('id="content"');
const fin = html.indexOf('<footer', inicio);
const contenido = html.slice(inicio, fin === -1 ? undefined : fin);

const plan = leerCsv(path.join(RAIZ, 'docs', 'plan-paginas.csv')).find(f => f.archivo === `${archivo}.html`);
if (!plan) console.warn(`AVISO  ${archivo}.html no está en plan-paginas.csv: title, meta y h1 quedan vacíos.`);
const alts = new Map(leerCsv(path.join(RAIZ, 'docs', 'plan-imagenes.csv')).map(f => [f.archivo, f.alt_nuevo_propuesto]));

const nombreImagen = src => path.basename(src.trim()).replace(/\.(jpe?g|png|gif)$/i, '');
const productos = [];
const avisos = [];

for (const m of contenido.matchAll(/<article\b[^>]*>([\s\S]*?)<\/article>/gi)) {
  const bloque = m[1];
  const nombreHtml = (bloque.match(/<div class="txt-1[^"]*">([\s\S]*?)<\/div>/i) || bloque.match(/<h[2-4][^>]*>([\s\S]*?)<\/h[2-4]>/i) || [])[1];
  const nombre = nombreHtml ? textoPlano(nombreHtml) : '';
  if (!nombre) { avisos.push('Un <article> sin nombre de producto: revisar a mano.'); continue; }

  const imagenes = [...bloque.matchAll(/<img\b[^>]*src="([^"]+)"/gi)].map(x => x[1]).filter(s => !/Pdf_icon/i.test(s));
  const img = imagenes[0] ? nombreImagen(imagenes[0]) : null;
  const altDe = n => alts.get(`/images/${n}.jpg`) || null;

  const pdfs = [...bloque.matchAll(/href="([^"]+\.pdf)"/gi)].map(x => '/' + x[1].replace(/^\/+/, ''));
  const parrafos = [...bloque.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)].map(x => `<p>${x[1]}</p>`).join('');
  const listas = [...bloque.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)].map(x => textoPlano(x[1])).filter(Boolean);

  // Modelo: solo si el nombre empieza por «Modelo(s)» (p. ej. «Modelos NA, OV, T»); si no, null
  const modelo = (nombre.match(/^Modelos?\s+([A-Z0-9][A-Z0-9 ,.\/-]*)$/) || [])[1] || null;

  productos.push({
    nombre,
    modelo,
    texto: limpiarHtml(parrafos),
    specs: listas,
    img,
    alt: img ? altDe(img) : null,
    ...(imagenes.length > 1 ? { imgExtra: imagenes.slice(1).map(s => ({ img: nombreImagen(s), alt: altDe(nombreImagen(s)) })) } : {}),
    pdf: pdfs[0] || null,
  });
}

const json = {
  title: plan ? plan.title_nuevo_propuesto : '',
  meta: plan ? plan.meta_nueva_propuesta : '',
  h1: plan ? plan.h1_propuesto : '',
  intro: '',
  cuerpo: null,
  documentos: [],
  relacionadas: [],
  productos,
  _borrador: true,
};

fs.mkdirSync(path.dirname(destino), { recursive: true });
fs.writeFileSync(destino, JSON.stringify(json, null, 2) + '\n');

console.log(`${path.relative(RAIZ, destino)}: ${productos.length} productos (borrador).`);
if (plan && plan.num_productos !== '' && Number(plan.num_productos) !== productos.length) {
  avisos.push(`plan-paginas.csv dice ${plan.num_productos} productos y se han importado ${productos.length}.`);
}
for (const p of productos) if (p.img && !p.alt) avisos.push(`Sin alt propuesto en plan-imagenes.csv: ${p.img}`);
for (const a of avisos) console.warn('AVISO  ' + a);
