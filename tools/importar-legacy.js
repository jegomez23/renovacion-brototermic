#!/usr/bin/env node
// Importa páginas de categoría de /legacy y escribe el BORRADOR de su JSON (docs/datos.md, apartado 3).
//
//   node tools/importar-legacy.js <archivo-sin-.html> [--forzar]
//   node tools/importar-legacy.js --todas [--forzar]      (todas las categorías de familias.json que aún no tienen JSON)
//
// Reglas (AGENTS.md §4 y principios SEO):
// - Extracción LITERAL: el texto de producto no se reescribe. Solo se aplican las erratas listadas en
//   docs/plan-contenido.md §3 (tabla, más las filas no mecánicas traducidas abajo) y las tildes de «Todas las páginas».
// - Todo lo que hay fuera de los productos (introducciones, tablas, enlaces a PDF) se conserva en «cuerpo»,
//   y sus imágenes en «imagenesCuerpo». Mover un bloque está permitido; borrarlo no.
// - title, meta y h1 salen de docs/plan-paginas.csv; el alt propuesto, de docs/plan-imagenes.csv.
// - Copia a /images las imágenes que usa la página, con su nombre exacto (también con ñ o mayúsculas).
// - No inventa nada: si no detecta un dato (modelo, pdf), lo deja en null. Marca «_borrador»: true.
// - No sobrescribe un JSON existente (puede estar revisado) salvo con --forzar.
// Sin dependencias: solo módulos nativos de Node.
'use strict';
const fs = require('fs');
const path = require('path');
const L = require('./lib/legacy');

const args = process.argv.slice(2);
const FORZAR = args.includes('--forzar');

// «Todas las páginas»: tildes que faltan en texto visible (solo en texto, nunca en rutas ni atributos)
const TILDES = { inmersion: 'inmersión', deposito: 'depósito', depositos: 'depósitos', bidon: 'bidón', estandar: 'estándar', modulo: 'módulo', tuberias: 'tuberías', tuberia: 'tubería', solido: 'sólido', solidos: 'sólidos', presion: 'presión', medicion: 'medición', calefaccion: 'calefacción' };
const conTildes = s => s.replace(/\b(inmersion|depositos?|bidon|estandar|modulo|tuberias?|solidos?|presion|medicion|calefaccion)\b/gi, m => {
  const t = TILDES[m.toLowerCase()];
  return m === m.toUpperCase() ? t.toUpperCase() : m[0] === m[0].toUpperCase() ? t[0].toUpperCase() + t.slice(1) : t;
});

// ---------- Limpieza de HTML ----------
const PERMITIDAS = new Set(['p', 'strong', 'em', 'br', 'a', 'ul', 'ol', 'li', 'sup', 'sub', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'caption']);
const EN_LINEA = new Set(['strong', 'em', 'sup', 'sub']);
const escapar = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Enlace antiguo → ruta absoluta nueva («docs/x.pdf» → «/docs/x.pdf», codificada). «#» o vacío → null
function rutaEnlace(href) {
  if (!href || href === '#' || /^javascript:/i.test(href)) return null;
  if (/^(mailto|tel):/i.test(href)) return href;
  const u = new URL(href, `${L.HOST}/`);
  if (!/(^|\.)brototermic\.(com|es)$/.test(u.hostname)) return href;
  return encodeURI(decodeURI(u.pathname.replace(/(^|\/)index\.html$/, '$1')));
}

// Deja solo las etiquetas permitidas (datos.md), sin atributos salvo href; los enlaces vacíos o a «#» se desenvuelven
function limpiarHtml(html) {
  // Enlaces que solo envuelven una imagen (iconos de PDF, «#»): fuera; la imagen se trata aparte
  html = html.replace(/<a\b[^>]*>\s*(<img\b[^>]*>\s*)+<\/a>/gi, '');
  const salida = [];
  const pilaA = [];
  const abiertas = {};
  // Solo es etiqueta lo que empieza por «<letra» o «</letra»: un «<3*10…» suelto de /legacy es TEXTO
  for (const p of html.split(/(<\/?[a-z][^>]*>)/i)) {
    const m = p.match(/^<(\/?)([a-z][a-z0-9]*)([^>]*)>$/i);
    if (!m) { if (!/^<\/?[a-z]/i.test(p)) salida.push(escapar(conTildes(L.decodificar(p).replace(/[ \t\r\n ]+/g, ' ')))); continue; }
    const [, cierre, nombre, attrs] = m;
    let n = nombre.toLowerCase();
    if (n === 'b') n = 'strong';
    if (n === 'i') n = 'em';
    if (n === 'a') {
      if (!cierre) {
        const destino = rutaEnlace((attrs.match(/href\s*=\s*"([^"]*)"/i) || [])[1]);
        pilaA.push(Boolean(destino));
        if (destino) salida.push(`<a href="${destino}">`);
      } else if (pilaA.pop()) salida.push('</a>');
      continue;
    }
    if (n === 'div' || n === 'figure') { salida.push('<br>'); continue; } // un bloque corta la línea
    if (!PERMITIDAS.has(n)) continue;
    // Etiquetas en línea equilibradas: /legacy tiene «</strong>» sin apertura (resistencias-infrarrojos)
    if (EN_LINEA.has(n)) {
      if (cierre) { if (!abiertas[n]) continue; abiertas[n]--; }
      else abiertas[n] = (abiertas[n] || 0) + 1;
    }
    salida.push(n === 'br' ? '<br>' : `<${cierre}${n}>`);
  }
  for (const [n, k] of Object.entries(abiertas)) for (let i = 0; i < k; i++) salida.push(`</${n}>`);
  // Enlaces que se han quedado sin texto (envolvían un icono): fuera. El mismo destino sigue enlazado con texto
  return salida.join('').replace(/<a href="[^"]*">\s*<\/a>/g, ' ').replace(/<br>\s+/g, '<br>');
}

// Envuelve en <p> el texto suelto y parte párrafos en los dobles <br>
function aParrafos(html) {
  const bloques = [];
  let actual = '';
  const cerrar = () => {
    const t = actual.replace(/^(\s|<br>)+|(\s|<br>)+$/g, '').replace(/(<br>\s*){2,}/g, '\n\n');
    for (const parte of t.split('\n\n')) {
      const limpio = parte.replace(/^(\s|<br>)+|(\s|<br>)+$/g, '').trim();
      if (limpio.replace(/<[^>]+>/g, '').trim()) bloques.push(`<p>${limpio}</p>`);
    }
    actual = '';
  };
  for (const trozo of html.split(/(<(?:p|ul|ol|table)>[\s\S]*?<\/(?:p|ul|ol|table)>)/)) {
    if (/^<(p|ul|ol|table)>/.test(trozo)) {
      cerrar();
      if (trozo.startsWith('<p>')) { actual = trozo.slice(3, -4); cerrar(); }
      else if (trozo.replace(/<[^>]+>/g, '').trim()) bloques.push(trozo.replace(/\s*<br>\s*/g, ' ').replace(/>\s+</g, '><'));
    } else actual += trozo;
  }
  cerrar();
  return bloques.join('').replace(/\s+<\/p>/g, '</p>').replace(/<p>\s+/g, '<p>').replace(/ {2,}/g, ' ');
}

// ---------- Importación de una página ----------
const plan = new Map(L.leerCsv('docs/plan-paginas.csv').map(f => [f.archivo, f]));
const imagenesPlan = new Map(L.leerCsv('docs/plan-imagenes.csv').map(f => [f.archivo, f]));
const listaErratas = L.erratas();

// Enlaces cruzados de docs/arquitectura.md §4 («Enlaces cruzados entre categorías»)
function relacionadasDe(archivo) {
  const t = fs.readFileSync(path.join(L.RAIZ, 'docs', 'arquitectura.md'), 'utf8');
  const seccion = t.slice(t.indexOf('### Enlaces cruzados entre categorías'), t.indexOf('### Enlace de presupuesto por producto'));
  const destinos = [];
  for (const linea of seccion.split(/\r?\n/)) {
    const c = linea.split('|').map(x => x.trim());
    if (c.length < 4) continue;
    const desde = (c[1].match(/`([^`]+)`/) || [])[1];
    if (!desde || !(desde === archivo || (desde.endsWith('*') && archivo.startsWith(desde.slice(0, -1))))) continue;
    for (const m of c[2].matchAll(/`([^`]+)`/g)) if (m[1] !== archivo) destinos.push(m[1]);
  }
  return [...new Set(destinos)];
}

function importar(archivo) {
  const destino = path.join(L.RAIZ, 'data', 'categorias', `${archivo}.json`);
  if (fs.existsSync(destino) && !FORZAR) return { archivo, saltado: true };
  const rutaLegacy = path.join(L.LEGACY_COM, `${archivo}.html`);
  if (!fs.existsSync(rutaLegacy)) throw new Error(`No existe ${path.relative(L.RAIZ, rutaLegacy)}`);
  const avisos = [];

  // Erratas listadas: primero las mecánicas de la tabla del plan y luego las manuales
  const html = L.corregirErratas(fs.readFileSync(rutaLegacy, 'utf8'), `${archivo}.html`, listaErratas);

  const area = L.areaContenido(html);
  const nombreImg = src => decodeURIComponent(path.basename(src.trim())).replace(/\.(jpe?g|png|gif)$/i, '');
  const esIcono = src => /Pdf_icon/i.test(src);
  const altDe = n => (['.jpg', '.png', '.gif'].map(e => imagenesPlan.get(`/images/${n}${e}`)).find(Boolean) || {}).alt_nuevo_propuesto || null;
  const imagenesCopiar = new Set();

  const productos = L.segmentosArticle(area).map(interior => {
    const nombreHtml = (interior.match(/<div class="txt-1[^"]*">([\s\S]*?)<\/div>/i) || [])[1] || '';
    const nombre = conTildes(L.textoPlano(nombreHtml).replace(/\s+/g, ' ').trim());
    const sinNombre = interior.replace(/<div class="txt-1[^"]*">[\s\S]*?<\/div>/i, '');
    const imagenes = L.srcImagenes(sinNombre).filter(s => !esIcono(s)).map(nombreImg);
    imagenes.forEach(i => imagenesCopiar.add(i));
    const pdfs = L.hrefs(sinNombre).filter(h => /\.pdf$/i.test(h)).map(rutaEnlace);
    // Las listas <ul> de un producto son sus especificaciones (texto literal, con su numeración si la tiene)
    const specs = [...sinNombre.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)].map(m => conTildes(L.textoPlano(m[1]).replace(/\s+/g, ' ').trim())).filter(Boolean);
    const texto = aParrafos(limpiarHtml(sinNombre.replace(/<ul\b[\s\S]*?<\/ul>/gi, '').replace(/<img\b[^>]*>/gi, '')));
    const modelo = (nombre.match(/^Modelos?\s+([A-Z0-9][A-Z0-9 ,.\/-]*)$/) || [])[1] || null;
    if (!nombre) avisos.push('Un producto sin nombre: revisar a mano.');
    return {
      nombre,
      modelo,
      texto,
      specs,
      img: imagenes[0] || null,
      alt: imagenes[0] ? altDe(imagenes[0]) : null,
      ...(imagenes.length > 1 ? { imgExtra: imagenes.slice(1).map(i => ({ img: i, alt: altDe(i) })) } : {}),
      pdf: pdfs[0] ? decodeURI(pdfs[0]) : null,
    };
  });

  // Fuera de los productos: introducción, tablas, enlaces a PDF e imágenes (sin el H1, que pone la plantilla)
  const fuera = L.fueraDeArticles(area).replace(/<h1\b[\s\S]*?<\/h1>/i, '');
  const imagenesCuerpo = L.srcImagenes(fuera).filter(s => !esIcono(s)).map(nombreImg);
  imagenesCuerpo.forEach(i => imagenesCopiar.add(i));
  const cuerpo = aParrafos(limpiarHtml(fuera.replace(/<img\b[^>]*>/gi, ''))) || null;

  const p = plan.get(`${archivo}.html`);
  if (!p) avisos.push(`${archivo}.html no está en plan-paginas.csv: title, meta y h1 quedan vacíos.`);
  const json = {
    title: p ? p.title_nuevo_propuesto : '',
    meta: p ? p.meta_nueva_propuesta : '',
    h1: p ? p.h1_propuesto : '',
    intro: '',
    cuerpo,
    ...(imagenesCuerpo.length ? { imagenesCuerpo: imagenesCuerpo.map(i => ({ img: i, alt: altDe(i) })) } : {}),
    documentos: [],
    relacionadas: relacionadasDe(archivo),
    productos,
    _borrador: true,
  };

  // Imágenes: copia exacta a /images (el nombre de archivo es una URL indexada: no se toca)
  for (const img of imagenesCopiar) {
    const origen = ['.jpg', '.png', '.gif'].map(e => path.join(L.LEGACY_COM, 'images', img + e)).find(fs.existsSync);
    if (!origen) { avisos.push(`No encuentro la imagen ${img} en /legacy`); continue; }
    const dest = path.join(L.RAIZ, 'images', path.basename(origen));
    if (!fs.existsSync(dest)) fs.copyFileSync(origen, dest);
  }
  for (const pr of productos) if (pr.img && !pr.alt) avisos.push(`Sin alt propuesto en plan-imagenes.csv: ${pr.img}`);
  if (p && p.num_productos !== '' && Number(p.num_productos) !== productos.length) avisos.push(`plan-paginas.csv dice ${p.num_productos} productos y se han importado ${productos.length}.`);

  fs.mkdirSync(path.dirname(destino), { recursive: true });
  fs.writeFileSync(destino, JSON.stringify(json, null, 2) + '\n');
  return { archivo, productos: productos.length, cuerpo: Boolean(cuerpo), imagenes: imagenesCopiar.size, avisos };
}

// ---------- CLI ----------
let archivos;
if (args.includes('--todas')) {
  const familias = JSON.parse(fs.readFileSync(path.join(L.RAIZ, 'data', 'familias.json'), 'utf8'));
  archivos = familias.flatMap(f => (f.tipo === 'familia' ? f.categorias.map(c => c.archivo) : [f.archivo]));
} else {
  archivos = args.filter(a => !a.startsWith('--'));
}
if (!archivos.length) {
  console.error('Uso: node tools/importar-legacy.js <archivo-sin-.html> | --todas [--forzar]');
  process.exit(1);
}
for (const a of archivos) {
  const r = importar(a);
  if (r.saltado) { console.log(`${a}: ya existe (no se toca; --forzar para reimportar)`); continue; }
  console.log(`${a}: ${r.productos} productos${r.cuerpo ? ' + cuerpo' : ''}, ${r.imagenes} imágenes (borrador)`);
  r.avisos.forEach(x => console.log(`  AVISO  ${x}`));
}
