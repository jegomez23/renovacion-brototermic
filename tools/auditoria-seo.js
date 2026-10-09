#!/usr/bin/env node
// Auditor de paridad SEO: compara cada URL de la web antigua (/legacy) con la nueva (/dist).
//
//   node tools/auditoria-seo.js                     modo piloto: una página aún no generada es AVISO
//   node tools/auditoria-seo.js --modo=publicacion  una página no generada es ERROR
//
// Escribe docs/auditoria-seo.md. Sale con código 1 si hay algún ERROR.
// build.js lo ejecuta también: en modo publicación, cualquier ERROR detiene el build.
//
// Principio: ninguna URL indexada desaparece y la página nueva nunca tiene menos contenido que la antigua.
// Sin dependencias: solo módulos nativos de Node.
'use strict';
const fs = require('fs');
const path = require('path');
const L = require('./lib/legacy');

const DIST = path.join(L.RAIZ, 'dist');
const UMBRAL_COBERTURA = 95;   // % mínimo del texto antiguo presente en la página nueva
const UMBRAL_FRASE = 0.85;     // una frase cuenta como presente si coincide en ≥ 85 % de sus palabras, en orden
const EXCEPCIONES_VITORIA = new Set(['index.html']); // decisión del HITO-1 (docs/decisiones.md, D-003)
const NIVEL = { OK: 0, AVISO: 1, ERROR: 2 };
const peor = estados => estados.reduce((a, b) => (NIVEL[b] > NIVEL[a] ? b : a), 'OK');
const longitud = s => [...s].length;

// ---------- Datos del plan ----------
const plan = L.leerCsv('docs/plan-paginas.csv');
const planPorArchivo = new Map(plan.map(f => [f.archivo, f]));
const inventario = L.leerCsv('docs/inventario-urls.csv');
const redirecciones = L.leerCsv('docs/redirecciones.csv');
const imagenesPlan = new Map(L.leerCsv('docs/plan-imagenes.csv').map(f => [f.archivo, f]));

// ---------- Redirecciones: URL antigua → URL final (o null si da 404) ----------
function reglaPara(url) {
  const u = new URL(url);
  const host = u.hostname.replace(/^www\./, '');
  const ruta = decodeURIComponent(u.pathname);
  for (const r of redirecciones) {
    const m = r.origen.match(/^(\*|https?):\/\/(\(www\.\)|www\.)?([^/]+)(\/.*)$/);
    if (!m) continue;
    const [, protocolo, www, dominio, rutaRegla] = m;
    if (dominio !== host) continue;
    if (www === 'www.' && !u.hostname.startsWith('www.')) continue;
    if (protocolo !== '*' && protocolo !== u.protocol.slice(0, -1)) continue;
    if (rutaRegla === ruta || (rutaRegla.endsWith('/*') && ruta.startsWith(rutaRegla.slice(0, -1)))) {
      // Las reglas de protocolo y host (http → https, www → sin www) no cuentan como «equivalente»: solo canonizan
      if (rutaRegla.endsWith('/*') && r.destino.endsWith('/*')) return null;
      return r;
    }
  }
  return null;
}
// Forma canónica de un enlace interno antiguo: https, sin www, sin index.html y con las 301 aplicadas
function canonizar(urlAbs) {
  const u = new URL(urlAbs);
  if (!/(^|\.)brototermic\.(com|es)$/.test(u.hostname)) return null;
  const regla = reglaPara(u.href);
  if (regla) return regla.tipo === '301' ? regla.destino : null;
  if (/brototermic\.es$/.test(u.hostname)) return null;
  return `${L.HOST}${u.pathname.replace(/(^|\/)index\.html$/, '$1')}`;
}

// ---------- Lectura de la página nueva (/dist) ----------
const rutaPublica = archivo => '/' + archivo.replace(/(^|\/)index\.html$/, '$1');
function archivoDist(ruta) {
  const r = decodeURIComponent(ruta);
  return path.join(DIST, r.endsWith('/') ? `${r}index.html` : r);
}
function leerNueva(ruta) {
  const archivo = archivoDist(ruta);
  if (!fs.existsSync(archivo)) return null;
  const html = fs.readFileSync(archivo, 'utf8');
  const canonical = `${L.HOST}${ruta}`;
  const main = (html.match(/<main\b[\s\S]*<\/main>/i) || [''])[0];
  const absoluto = h => { try { return new URL(h.replace(/&amp;/g, '&'), canonical); } catch { return null; } };
  const enlaces = new Set(L.hrefs(html).map(absoluto).filter(Boolean).map(u => `${u.origin}${decodeURIComponent(u.pathname)}`));
  const imagenes = new Set([...html.matchAll(/\s(?:src|srcset)="([^"]+)"/g)].map(m => decodeURIComponent(m[1].split(/[?\s]/)[0])));
  return {
    html,
    title: L.decodificar((html.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || ''),
    meta: L.decodificar((html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || ''),
    canonical: (html.match(/<link rel="canonical" href="([^"]*)"/) || [])[1] || '',
    h1s: [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/g)].map(m => L.textoPlano(m[1])),
    h2s: [...main.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/g)].map(m => L.textoPlano(m[1])),
    textoMain: L.textoPlano(main),
    jsonld: [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m => m[1]),
    enlaces,
    imagenes,
  };
}

// ---------- Comparadores ----------
const palabrasClave = s => L.tokens(s.replace(/\[.*?\]/g, '')).filter(p => !L.VACIAS.has(p));
const contienePalabras = (texto, clave) => {
  const t = L.tokens(texto);
  return palabrasClave(clave).every(p => t.some(x => L.coincide(p, x)));
};
// Nombre antiguo presente si TODAS sus palabras (sin vacías) están en algún H2 nuevo (con tolerancia a erratas)
const nombreEn = (nombre, h2s) => h2s.some(h => {
  const t = L.tokens(h);
  return palabrasClave(nombre).every(p => t.some(x => L.coincide(p, x)));
});

// Cobertura de texto: subsecuencia común más larga (en orden) entre cada frase antigua y la página nueva
function lcs(a, b) {
  const fila = new Array(b.length + 1).fill(0);
  for (let i = 1; i <= a.length; i++) {
    let diag = 0;
    for (let j = 1; j <= b.length; j++) {
      const arriba = fila[j];
      fila[j] = L.coincide(a[i - 1], b[j - 1]) ? diag + 1 : Math.max(fila[j], fila[j - 1]);
      diag = arriba;
    }
  }
  return fila[b.length];
}
function cobertura(frasesAntiguas, textoNuevo) {
  const nuevo = L.tokens(textoNuevo);
  const posiciones = new Map();
  nuevo.forEach((t, i) => { if (!posiciones.has(t)) posiciones.set(t, []); posiciones.get(t).push(i); });
  let total = 0, presentes = 0;
  const faltan = [];
  for (const frase of frasesAntiguas) {
    const t = L.tokens(frase);
    if (t.length < 3) continue; // fragmentos mínimos (rótulos sueltos) no cuentan
    total += t.length;
    // Anclas: las palabras más raras de la frase en el texto nuevo; se compara una ventana alrededor de cada una
    const anclas = [...new Set(t)].filter(x => posiciones.has(x)).sort((a, b) => posiciones.get(a).length - posiciones.get(b).length).slice(0, 3);
    let mejor = 0;
    for (const a of anclas) {
      for (const p of posiciones.get(a).slice(0, 20)) {
        const ventana = nuevo.slice(Math.max(0, p - t.length * 2), p + t.length * 2);
        mejor = Math.max(mejor, lcs(t, ventana));
        if (mejor === t.length) break;
      }
      if (mejor === t.length) break;
    }
    const ratio = mejor / t.length;
    if (ratio >= UMBRAL_FRASE) presentes += t.length;
    else { presentes += mejor; faltan.push({ frase, ratio }); }
  }
  return { porcentaje: total ? (presentes / total) * 100 : 100, faltan, palabras: total };
}

// Frases del texto antiguo: área de contenido, sin el H1 (se audita aparte)
const frasesDe = area => L.textoPlano(area.replace(/<h1\b[\s\S]*?<\/h1>/i, ''))
  .split('\n').flatMap(l => l.split(/(?<=[.;:])\s+(?=[A-ZÁÉÍÓÚÑ0-9«"(-])/)).map(s => s.trim()).filter(Boolean);

// Referencias de modelo: siglas y códigos en mayúsculas con letras o cifras («GCB», «TPSP22», «IMN»)
const modelosDe = texto => [...new Set((texto.match(/\b(?=[A-Z0-9-]*[A-Z])[A-Z][A-Z0-9-]{1,}\b/g) || [])
  .filter(m => m.length >= 2 && !/^(BROTOTERMIC|S|L|SL)$/.test(m)))];

function validarJsonLd(bloques, esperado) {
  const problemas = [];
  if (bloques.length !== 1) problemas.push(`${bloques.length} bloques JSON-LD (debe haber 1)`);
  for (const b of bloques) {
    let j;
    try { j = JSON.parse(b); } catch (e) { problemas.push(`JSON mal formado: ${e.message}`); continue; }
    if (j['@context'] !== 'https://schema.org') problemas.push('falta @context https://schema.org');
    const grafo = j['@graph'] || [];
    const tipos = grafo.map(n => n['@type']);
    if (tipos.some(t => t === 'Product' || t === 'Offer')) problemas.push('contiene Product u Offer (prohibido: no hay precios)');
    for (const t of esperado) if (!tipos.includes(t)) problemas.push(`falta ${t}`);
    const migas = grafo.find(n => n['@type'] === 'BreadcrumbList');
    if (migas) migas.itemListElement.forEach((e, i) => {
      if (e.position !== i + 1 || !e.name || !/^https:\/\/brototermic\.com\//.test(e.item || '')) problemas.push(`miga ${i + 1} incompleta`);
    });
    const lista = grafo.find(n => n['@type'] === 'ItemList');
    if (lista && lista.numberOfItems !== lista.itemListElement.length) problemas.push('ItemList: numberOfItems no coincide');
  }
  return problemas;
}

// ---------- Auditoría de una página que se mantiene ----------
function auditarPagina(fila, ctx) {
  const url = fila.url;
  const ruta = new URL(url).pathname;
  const archivoPlan = ruta === '/' ? 'index.html' : ruta.slice(1).replace(/\/$/, '/index.html');
  const p = planPorArchivo.get(archivoPlan);
  const c = {};
  const detalles = [];
  const nueva = leerNueva(ruta);
  if (!nueva) {
    const estado = ctx.modo === 'publicacion' ? 'ERROR' : 'AVISO';
    return { url, tipo: p?.plantilla || 'página', estado, checks: { url: { estado, texto: 'pendiente: aún no se genera' } }, detalles: [] };
  }
  c.url = { estado: 'OK', texto: 'existe' };

  // Se aplican al texto antiguo las erratas de plan-contenido.md §3: son las únicas correcciones permitidas
  const legacyHtml = L.corregirErratas(fs.readFileSync(L.archivoLegacy(url), 'utf8'), archivoPlan);
  const area = L.areaContenido(legacyHtml);
  const kw = p?.keyword_principal || '';

  // Title: keyword antigua, «Vitoria» si la tenía, ≤ 60
  const probT = [];
  if (longitud(nueva.title) > 60) probT.push(`${longitud(nueva.title)} caracteres`);
  if (kw && !contienePalabras(nueva.title, kw)) probT.push(`sin la keyword «${kw.replace(/\s*\[.*\]/, '')}»`);
  if (/vitoria/i.test(fila.title) && !/vitoria/i.test(nueva.title) && !EXCEPCIONES_VITORIA.has(archivoPlan)) probT.push('ha perdido «Vitoria»');
  c.title = { estado: probT.length ? 'ERROR' : 'OK', texto: probT.length ? probT.join('; ') : `${longitud(nueva.title)} car.` };
  if (/\[POR VERIFICAR GSC\]/.test(kw)) { c.title.estado = peor([c.title.estado, 'AVISO']); detalles.push(`Keyword [POR VERIFICAR GSC]: «${kw}».`); }

  // Meta description: 140-155 y única
  const lm = longitud(nueva.meta);
  const repetida = (ctx.metas.get(nueva.meta) || 0) > 1;
  c.meta = { estado: lm >= 140 && lm <= 155 && !repetida ? 'OK' : 'ERROR', texto: `${lm} car.${repetida ? ', repetida' : ''}` };

  // H1: uno solo y con la keyword
  const probH = [];
  if (nueva.h1s.length !== 1) probH.push(`${nueva.h1s.length} H1`);
  else if (kw && !contienePalabras(nueva.h1s[0], kw)) probH.push('sin la keyword');
  c.h1 = { estado: probH.length ? 'ERROR' : 'OK', texto: probH.length ? probH.join('; ') : 'OK' };

  // Productos: todos los nombres antiguos en un H2 nuevo, y todas las referencias de modelo en el texto
  const antiguos = L.productosLegacy(legacyHtml);
  const faltanNombres = antiguos.filter(a => a.nombre && !nombreEn(a.nombre, nueva.h2s)).map(a => a.nombre);
  const modelos = modelosDe(L.textoPlano(area.replace(/<h1\b[\s\S]*?<\/h1>/i, '')));
  const textoNuevoRaw = nueva.textoMain;
  const faltanModelos = modelos.filter(m => !new RegExp(`(^|[^A-Za-z0-9])${m.replace(/[-]/g, '[- ]?')}([^A-Za-z0-9]|$)`, 'i').test(textoNuevoRaw.replace(/-/g, '')) &&
    !textoNuevoRaw.toUpperCase().replace(/[-\s]/g, '').includes(m.replace(/-/g, '')));
  c.productos = {
    estado: faltanNombres.length || faltanModelos.length ? 'ERROR' : 'OK',
    texto: `${antiguos.length - faltanNombres.length}/${antiguos.length}` + (modelos.length ? ` · modelos ${modelos.length - faltanModelos.length}/${modelos.length}` : ''),
  };
  faltanNombres.forEach(n => detalles.push(`Producto que falta: «${n}».`));
  faltanModelos.forEach(m => detalles.push(`Referencia de modelo que falta en el texto: «${m}».`));

  // Imágenes de contenido: misma ruta y nombre; las que se eliminan, justificadas en plan-imagenes.csv
  const imgsAntiguas = [...new Set(L.srcImagenes(area).map(s => '/' + decodeURIComponent(s.replace(/^\.?\//, ''))))];
  let justificadas = 0;
  const faltanImgs = [];
  for (const img of imgsAntiguas) {
    if (nueva.imagenes.has(img)) continue;
    const planImg = imagenesPlan.get(img);
    if (planImg && planImg.accion === 'ELIMINAR') { justificadas++; detalles.push(`Imagen eliminada (justificada): ${img} — ${planImg.notas}`); }
    else faltanImgs.push(img);
  }
  c.imagenes = { estado: faltanImgs.length ? 'ERROR' : 'OK', texto: `${imgsAntiguas.length - faltanImgs.length - justificadas}/${imgsAntiguas.length}${justificadas ? ` (+${justificadas} just.)` : ''}` };
  faltanImgs.forEach(i => detalles.push(`Imagen que ya no se usa: ${i}.`));

  // PDF: los mismos enlaces y el archivo existe en /dist con su nombre exacto
  const base = new URL(url);
  const pdfsAntiguos = [...new Set(L.hrefs(area).filter(h => /\.pdf$/i.test(h)).map(h => decodeURIComponent(new URL(h, base).pathname)))];
  const faltanPdf = pdfsAntiguos.filter(pdf => !nueva.enlaces.has(`${L.HOST}${pdf}`) || !fs.existsSync(path.join(DIST, pdf)));
  c.pdf = { estado: faltanPdf.length ? 'ERROR' : 'OK', texto: `${pdfsAntiguos.length - faltanPdf.length}/${pdfsAntiguos.length}` };
  faltanPdf.forEach(pdf => detalles.push(`PDF sin enlace o sin archivo en /dist: ${pdf}.`));

  // Enlaces internos de la página antigua (incluido su menú) → enlazados desde la nueva (incluido su menú)
  const destinos = new Set();
  for (const h of L.hrefs(L.sinComentarios(legacyHtml))) {
    if (!h || h.startsWith('#') || /^(mailto|tel|callto|javascript):/i.test(h)) continue;
    let abs; try { abs = new URL(h, base); } catch { continue; }
    if (/\.(jpe?g|png|gif|css|js|ico|pdf)$/i.test(abs.pathname)) continue;
    const c2 = canonizar(abs.href);
    if (c2 && c2 !== `${L.HOST}${ruta}`) destinos.add(c2);
  }
  const faltanEnlaces = [...destinos].filter(d => !nueva.enlaces.has(decodeURIComponent(d)));
  c.enlaces = { estado: faltanEnlaces.length ? 'ERROR' : 'OK', texto: `${destinos.size - faltanEnlaces.length}/${destinos.size}` };
  faltanEnlaces.forEach(d => detalles.push(`Enlace interno que se pierde: ${d}.`));

  // Cobertura del texto significativo antiguo (sin menú ni pie)
  const cob = cobertura(frasesDe(area), nueva.textoMain);
  c.texto = { estado: cob.porcentaje >= UMBRAL_COBERTURA ? 'OK' : 'ERROR', texto: `${cob.porcentaje.toFixed(1)} %`, valor: cob.porcentaje, palabras: cob.palabras };
  cob.faltan.forEach(f => detalles.push(`Frase antigua no encontrada (${Math.round(f.ratio * 100)} % de coincidencia): «${f.frase}»`));

  // Canonical, JSON-LD y sitemap
  const canon = `${L.HOST}${ruta}`;
  c.canonical = { estado: nueva.canonical === canon ? 'OK' : 'ERROR', texto: nueva.canonical === canon ? 'OK' : nueva.canonical || 'falta' };
  const esperado = ['Organization', 'BreadcrumbList', ...(p?.plantilla === 'categoria' && antiguos.length ? ['ItemList'] : [])];
  const probJ = validarJsonLd(nueva.jsonld, ruta === '/' ? ['Organization'] : esperado);
  c.jsonld = { estado: probJ.length ? 'ERROR' : 'OK', texto: probJ.length ? probJ.join('; ') : 'OK' };
  c.sitemap = { estado: ctx.sitemap.has(canon) ? 'OK' : 'ERROR', texto: ctx.sitemap.has(canon) ? 'OK' : 'falta' };

  return { url, tipo: p?.plantilla || 'página', estado: peor(Object.values(c).map(x => x.estado)), checks: c, detalles };
}

// ---------- Auditoría de una URL que se redirige ----------
function auditarRedireccion(fila) {
  const regla = reglaPara(fila.url);
  const detalles = [];
  let estado = 'OK', texto;
  if (!regla || regla.tipo !== '301') { estado = 'ERROR'; texto = 'sin regla 301'; }
  else if (regla.destino !== fila.destino_301.replace(/\s*\[.*\]\s*$/, '')) { estado = 'ERROR'; texto = `301 a ${regla.destino}, el inventario dice ${fila.destino_301}`; }
  else {
    texto = `301 → ${regla.destino}`;
    const ruta = decodeURIComponent(new URL(regla.destino).pathname);
    const enPlan = plan.some(f => rutaPublica(f.archivo) === ruta) || /\.pdf$/.test(ruta);
    if (!enPlan) { estado = 'ERROR'; detalles.push(`El destino ${regla.destino} no es ninguna URL del plan.`); }
    if (/POR VERIFICAR/.test(regla.motivo + fila.destino_301)) { estado = peor([estado, 'AVISO']); detalles.push(`Destino pendiente de confirmar: ${regla.motivo}`); }
  }
  return { url: fila.url, tipo: 'redirección', estado, checks: { url: { estado, texto } }, detalles };
}

// ---------- Auditoría de un archivo (PDF, sitemap, robots) ----------
function auditarArchivo(fila, ctx) {
  const ruta = decodeURIComponent(new URL(fila.url).pathname);
  const existe = fs.existsSync(path.join(DIST, ruta));
  const estado = existe ? 'OK' : (fila.estado === 'NUEVA' && ctx.modo !== 'publicacion' ? 'AVISO' : 'ERROR');
  return { url: fila.url, tipo: 'archivo', estado, checks: { url: { estado, texto: existe ? 'existe' : 'falta en /dist' } }, detalles: [] };
}

// ---------- Auditoría completa ----------
function auditar({ modo = 'piloto' } = {}) {
  const sitemapTxt = fs.existsSync(path.join(DIST, 'sitemap.xml')) ? fs.readFileSync(path.join(DIST, 'sitemap.xml'), 'utf8') : '';
  const sitemap = new Set([...sitemapTxt.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => L.decodificar(m[1])));
  // Metas de todas las páginas generadas, para detectar repetidas
  const metas = new Map();
  for (const f of plan) {
    const archivo = archivoDist(rutaPublica(f.archivo));
    if (!fs.existsSync(archivo)) continue;
    const m = L.decodificar((fs.readFileSync(archivo, 'utf8').match(/<meta name="description" content="([^"]*)"/) || [])[1] || '');
    metas.set(m, (metas.get(m) || 0) + 1);
  }
  const ctx = { modo, sitemap, metas };
  const filas = inventario.map(f => {
    const esPagina = /\.html$|\/$/.test(new URL(f.url).pathname);
    if (f.estado === 'REDIRIGIR') return auditarRedireccion(f);
    if (!esPagina) return auditarArchivo(f, ctx);
    if (f.estado === 'NUEVA') {
      const nueva = leerNueva(new URL(f.url).pathname);
      const estado = nueva ? 'OK' : modo === 'publicacion' ? 'ERROR' : 'AVISO';
      return { url: f.url, tipo: 'familia (nueva)', estado, checks: { url: { estado, texto: nueva ? 'existe' : 'pendiente' } }, detalles: [] };
    }
    return auditarPagina(f, ctx);
  });
  const resumen = { OK: 0, AVISO: 0, ERROR: 0 };
  filas.forEach(f => resumen[f.estado]++);
  return { filas, resumen, modo };
}

// ---------- Informe ----------
const ICONO = { OK: '✅', AVISO: '⚠️', ERROR: '❌' };
const celda = c => (c ? `${c.estado === 'OK' ? '' : ICONO[c.estado] + ' '}${c.texto}` : '—');
function informe({ filas, resumen, modo }) {
  const relativa = u => u.replace(/^https:\/\/brototermic\.com/, '').replace(/^https:\/\/www\.brototermic\.es/, '.es ') || '/';
  const paginas = filas.filter(f => f.checks.title);
  const otras = filas.filter(f => !f.checks.title);
  const l = [];
  l.push('# Auditoría de paridad SEO', '');
  l.push(`> Generado por \`node tools/auditoria-seo.js\` (modo **${modo}**). **No se edita a mano.** Compara cada URL de /legacy con su equivalente en /dist: que exista (o tenga un 301 válido), que conserve title, H1, productos, modelos, imágenes, PDF, enlaces internos y el texto (cobertura ≥ ${UMBRAL_COBERTURA} %), y que tenga canonical, JSON-LD y presencia en sitemap.xml.`, '');
  l.push(`**Resultado:** ${resumen.OK} OK · ${resumen.AVISO} AVISO · ${resumen.ERROR} ERROR (${filas.length} URLs del inventario).`, '');
  l.push('## Páginas generadas', '');
  l.push('| URL | Estado | Title | Meta | H1 | Productos | Imágenes | PDF | Enlaces | Texto | Canonical | JSON-LD | Sitemap |');
  l.push('|---|---|---|---|---|---|---|---|---|---|---|---|---|');
  for (const f of paginas) {
    const c = f.checks;
    l.push(`| \`${relativa(f.url)}\` | ${ICONO[f.estado]} ${f.estado} | ${celda(c.title)} | ${celda(c.meta)} | ${celda(c.h1)} | ${celda(c.productos)} | ${celda(c.imagenes)} | ${celda(c.pdf)} | ${celda(c.enlaces)} | ${celda(c.texto)} | ${celda(c.canonical)} | ${celda(c.jsonld)} | ${celda(c.sitemap)} |`);
  }
  l.push('', '## Resto de URLs del inventario (páginas pendientes, redirecciones y archivos)', '');
  l.push('| URL | Tipo | Estado | Comprobación |', '|---|---|---|---|');
  for (const f of otras) l.push(`| \`${relativa(f.url)}\` | ${f.tipo} | ${ICONO[f.estado]} ${f.estado} | ${f.checks.url.texto} |`);
  const conDetalle = filas.filter(f => f.detalles.length);
  if (conDetalle.length) {
    l.push('', '## Detalles', '');
    for (const f of conDetalle) {
      l.push(`### \`${relativa(f.url)}\` — ${f.estado}`, '');
      f.detalles.forEach(d => l.push(`- ${d}`));
      l.push('');
    }
  }
  return l.join('\n') + '\n';
}

module.exports = { auditar, informe };

if (require.main === module) {
  const arg = process.argv.find(a => a.startsWith('--modo='));
  const modo = arg ? arg.slice(7) : 'piloto';
  const r = auditar({ modo });
  fs.writeFileSync(path.join(L.RAIZ, 'docs', 'auditoria-seo.md'), informe(r));
  console.log(`Auditoría SEO (modo ${modo}): ${r.resumen.OK} OK · ${r.resumen.AVISO} AVISO · ${r.resumen.ERROR} ERROR → docs/auditoria-seo.md`);
  for (const f of r.filas.filter(x => x.estado === 'ERROR')) console.log(`  ERROR  ${f.url}: ${Object.entries(f.checks).filter(([, c]) => c.estado === 'ERROR').map(([k, c]) => `${k} (${c.texto})`).join(', ')}`);
  process.exitCode = r.resumen.ERROR ? 1 : 0;
}
