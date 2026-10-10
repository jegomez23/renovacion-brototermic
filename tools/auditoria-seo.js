#!/usr/bin/env node
// Auditor de paridad SEO: compara cada URL de la web antigua (/legacy) con la nueva (/dist).
//
//   node tools/auditoria-seo.js                     modo piloto: una página aún no generada es AVISO
//   node tools/auditoria-seo.js --modo=publicacion  una página no generada es ERROR
//
// Antes de auditar ejecuta SIEMPRE las pruebas de mutación (tools/test-auditor.js): si el auditor no detecta
// alguna de las mutaciones, no se audita nada y sale con código 1.
// Escribe docs/auditoria-seo.md. Sale con código 1 si hay algún ERROR.
// build.js lo ejecuta también: en modo publicación, cualquier ERROR detiene el build.
//
// Principio: ninguna URL indexada desaparece y la página nueva nunca tiene menos contenido que la antigua.
// Dos niveles de comparación:
//   - texto: frase a frase, con tolerancia a erratas y plurales (los cambios de formato son legítimos);
//   - datos técnicos (cifras, unidades, rangos, modelos, IP, teléfonos): EXACTA, producto a producto y en los dos
//     sentidos (lo que falta se ha perdido; lo que sobra se ha inventado). Solo se admiten las correcciones
//     registradas en plan-contenido.md §3 y §4 (tools/lib/legacy.js → erratas y SUSTITUCIONES).
// Sin dependencias: solo módulos nativos de Node.
'use strict';
const fs = require('fs');
const path = require('path');
const L = require('./lib/legacy');
const H = require('./lib/htaccess');

const UMBRAL_COBERTURA = 95;   // % mínimo del texto antiguo presente en la página nueva
const UMBRAL_FRASE = 0.85;     // una frase cuenta como presente si coincide en ≥ 85 % de sus palabras, en orden
const MIN_PALABRAS_AREA = 20;  // menos palabras en el área antigua = no se ha encontrado el contenido: ERROR
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
const familias = JSON.parse(fs.readFileSync(path.join(L.RAIZ, 'data', 'familias.json'), 'utf8'));

// ---------- Fuente de los archivos: disco o sustituciones en memoria (pruebas de mutación) ----------
// ctx.dist: carpeta de /dist · ctx.distEs: carpeta del docroot del .es · ctx.sobrescribir: { '/ruta': contenido }
// ctx.sobrescribirLegacy: { 'https://url-antigua': html }
function fuente(ctx) {
  const leer = rel => (rel in ctx.sobrescribir ? ctx.sobrescribir[rel]
    : fs.existsSync(path.join(ctx.dist, rel)) ? fs.readFileSync(path.join(ctx.dist, rel), 'utf8') : null);
  const existe = rel => (rel in ctx.sobrescribir ? ctx.sobrescribir[rel] !== null : fs.existsSync(path.join(ctx.dist, rel)));
  const leerLegacy = url => (url in ctx.sobrescribirLegacy ? ctx.sobrescribirLegacy[url]
    : L.archivoLegacy(url) ? fs.readFileSync(L.archivoLegacy(url), 'utf8') : null);
  return { leer, existe, leerLegacy };
}

// ---------- Redirecciones: URL antigua → regla de redirecciones.csv ----------
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

// ---------- Redirecciones contra el .htaccess REAL (simulado: tools/lib/htaccess.js) ----------
// El .com usa dist/.htaccess. El .es usa dist-es/.htaccess (su propio docroot) y, además, dist/.htaccess
// (por si el .es acaba apuntando al docroot del .com): las dos versiones deben dar el mismo resultado.
function htaccessesPara(host, ctx, F) {
  if (/brototermic\.es$/.test(host)) {
    const es = ctx.distEs && (('/dist-es/.htaccess' in ctx.sobrescribir) ? ctx.sobrescribir['/dist-es/.htaccess']
      : fs.existsSync(path.join(ctx.distEs, '.htaccess')) ? fs.readFileSync(path.join(ctx.distEs, '.htaccess'), 'utf8') : null);
    return [
      ...(es !== null && es !== undefined ? [{ nombre: 'dist-es/.htaccess', texto: es, docroot: ctx.distEs }] : [{ nombre: 'dist-es/.htaccess', texto: null }]),
      { nombre: 'dist/.htaccess (alias)', texto: F.leer('/.htaccess'), docroot: ctx.dist },
    ];
  }
  return [{ nombre: 'dist/.htaccess', texto: F.leer('/.htaccess'), docroot: ctx.dist }];
}
// Comprueba que una URL da exactamente: un 301 a «destino» y el destino un 200 (sin cadenas), o el código esperado
function comprobarUrl(url, esperado, destino, ctx, F) {
  const problemas = [];
  for (const h of htaccessesPara(new URL(url).hostname, ctx, F)) {
    if (!h.texto) { problemas.push(`${h.nombre} no existe`); continue; }
    const r = H.simular(h.texto, url, h.docroot);
    if (esperado === 301) {
      if (r.estado !== 301 || r.location !== destino) { problemas.push(`${h.nombre}: ${url} → ${r.estado} ${r.location || ''} (esperado 301 → ${destino})`); continue; }
      const r2 = H.simular(F.leer('/.htaccess') || '', destino, ctx.dist);
      if (r2.estado !== 200) problemas.push(`${h.nombre}: el destino ${destino} da ${r2.estado} ${r2.location || ''} (cadena o destino inexistente)`);
    } else if (r.estado !== esperado) problemas.push(`${h.nombre}: ${url} → ${r.estado} ${r.location || ''} (esperado ${esperado})`);
  }
  return problemas;
}

// ---------- Lectura de la página nueva (/dist) ----------
const rutaPublica = archivo => '/' + archivo.replace(/(^|\/)index\.html$/, '$1');
const archivoRel = ruta => { const r = decodeURIComponent(ruta); return r.endsWith('/') ? `${r}index.html` : r; };
// Texto de un producto nuevo, sin lo que añade la plantilla (botón «Pedir presupuesto de…», «Ficha de… PDF»,
// leyenda de la tabla, «Modelo:»): solo queda lo que sale de los datos
const textoProducto = html => L.textoPlano(html
  .replace(/<p class="producto__accion">[\s\S]*?<\/p>/g, '')
  .replace(/<caption>[\s\S]*?<\/caption>/g, '')
  .replace(/<a class="enlace-pdf"[\s\S]*?<\/a>/g, '')
  .replace(/<p class="producto__modelo">[\s\S]*?<\/p>/g, ''));
function leerNueva(ruta, F) {
  const html = F.leer(archivoRel(ruta));
  if (html === null) return null;
  const canonical = `${L.HOST}${ruta}`;
  const main = (html.match(/<main\b[\s\S]*<\/main>/i) || [''])[0];
  const absoluto = h => { try { return new URL(h.replace(/&amp;/g, '&'), canonical); } catch { return null; } };
  const enlaces = new Set(L.hrefs(html).map(absoluto).filter(Boolean).map(u => `${u.origin}${decodeURIComponent(u.pathname)}`));
  const imagenes = new Set([...html.matchAll(/\s(?:src|srcset)="([^"]+)"/g)].map(m => decodeURIComponent(m[1].split(/[?\s]/)[0])));
  const articulos = (main.match(/<article class="producto"[\s\S]*?<\/article>/g) || []).map(a => ({
    nombre: L.textoPlano((a.match(/<h2\b[^>]*>([\s\S]*?)<\/h2>/) || [])[1] || ''),
    texto: textoProducto(a),
  }));
  const mainSinProductos = main.replace(/<article class="producto"[\s\S]*?<\/article>/g, '');
  return {
    html,
    title: L.decodificar((html.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || ''),
    meta: L.decodificar((html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || ''),
    canonical: (html.match(/<link rel="canonical" href="([^"]*)"/) || [])[1] || '',
    h1s: [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/g)].map(m => L.textoPlano(m[1])),
    h2s: [...main.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/g)].map(m => L.textoPlano(m[1])),
    textoMain: L.textoPlano(main),
    textoFueraProductos: L.textoPlano(mainSinProductos),
    intro: L.textoPlano((main.match(/<div class="entradilla">([\s\S]*?)<\/div>/) || [])[1] || ''),
    articulos,
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
// Nombre antiguo presente si TODAS sus palabras (sin vacías) están en el nombre nuevo (con tolerancia a erratas)
const mismoNombre = (antiguo, nuevo) => {
  const t = L.tokens(nuevo);
  return palabrasClave(antiguo).every(p => t.some(x => L.coincide(p, x)));
};

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
    if (t.length < 3) continue; // fragmentos mínimos (rótulos sueltos) no cuentan; sus cifras las vigila el chequeo exacto
    total += t.length;
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
  // Sin texto antiguo que comparar NO es «100 %»: el llamador lo trata como ERROR (MIN_PALABRAS_AREA)
  return { porcentaje: total ? (presentes / total) * 100 : 0, faltan, palabras: total };
}

const frasesDe = area => L.textoPlano(area.replace(/<h1\b[\s\S]*?<\/h1>/i, ''))
  .split('\n').flatMap(l => l.split(/(?<=[.;:])\s+(?=[A-ZÁÉÍÓÚÑ0-9«"(-])/)).map(s => s.trim()).filter(Boolean);

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

// ---------- Datos técnicos exactos ----------
const fmt = l => l.map(x => `«${x}»`).join(', ');
// Producto a producto (categorías): los tokens técnicos del producto antiguo y del nuevo deben ser IGUALES
function compararProductos(antiguos, nuevos, detalles) {
  const usados = new Set();
  let diferencias = 0;
  antiguos.forEach((a, i) => {
    if (!a.nombre) return;
    // Emparejado: el de la misma posición si el nombre coincide; si no, el primero libre con ese nombre
    let j = nuevos[i] && !usados.has(i) && mismoNombre(a.nombre, nuevos[i].nombre) ? i : nuevos.findIndex((n, k) => !usados.has(k) && mismoNombre(a.nombre, n.nombre));
    if (j === -1) return; // la falta del producto ya la marca el chequeo de productos
    usados.add(j);
    const ta = L.tokensTecnicos(L.textoPlano(a.interior)), tn = L.tokensTecnicos(nuevos[j].texto);
    const faltan = L.faltanEn(ta, tn), sobran = L.faltanEn(tn, ta);
    if (faltan.length || sobran.length) {
      diferencias++;
      detalles.push(`Datos técnicos distintos en «${a.nombre}»:${faltan.length ? ` faltan ${fmt(faltan)}` : ''}${sobran.length ? `${faltan.length ? ';' : ''} sobran ${fmt(sobran)}` : ''}.`);
    }
  });
  return diferencias;
}
// Página entera (o texto fuera de los productos): todo dato técnico antiguo debe seguir (con sus repeticiones)
function compararPagina(textoAntiguo, textoNuevo, detalles, donde, opciones) {
  const faltan = L.faltanEn(L.tokensTecnicos(textoAntiguo, opciones), L.tokensTecnicos(textoNuevo, opciones));
  if (faltan.length) detalles.push(`Datos técnicos que faltan (${donde}): ${fmt(faltan)}.`);
  return faltan.length;
}
// Intro nueva: cualquier dato técnico que no esté en la página antigua es un dato inventado
function compararIntro(intro, textoAntiguo, detalles) {
  const antiguos = new Set(L.tokensTecnicos(textoAntiguo));
  // Una sigla de la intro («SCADA») vale si la palabra está en /legacy aunque sea en minúsculas («Scada»)
  const palabras = new Set((L.decodificar(textoAntiguo).match(/\p{L}+/gu) || []).map(w => w.toUpperCase()));
  // Un número suelto de la intro vale si en /legacy forma parte de un código: «IC PLUS 902 y 915» (antiguo: «IC PLUS 915»),
  // «serie EWHS (284, 304 y 314)» (antiguo: «EWHS-284»…). Una cifra con unidad tiene que coincidir con su unidad.
  const enCodigos = new Set([...antiguos].flatMap(t => t.match(/\d+/g) || []));
  const inventados = [...new Set(L.tokensTecnicos(intro))].filter(t => !antiguos.has(t)
    && !(/^\p{L}+$/u.test(t) && palabras.has(t))
    && !(/^\d+$/.test(t) && enCodigos.has(t)));
  if (inventados.length) detalles.push(`Datos técnicos de la intro que no están en /legacy: ${fmt(inventados)}.`);
  return inventados.length;
}

// ---------- Auditoría de una página que se mantiene ----------
function auditarPagina(fila, ctx, F) {
  const url = fila.url;
  const ruta = new URL(url).pathname;
  const archivoPlan = ruta === '/' ? 'index.html' : ruta.slice(1).replace(/\/$/, '/index.html');
  const p = planPorArchivo.get(archivoPlan);
  const c = {};
  const detalles = [];
  const nueva = leerNueva(ruta, F);
  if (!nueva) {
    const estado = ctx.modo === 'publicacion' ? 'ERROR' : 'AVISO';
    return { url, tipo: p?.plantilla || 'página', estado, checks: { url: { estado, texto: 'pendiente: aún no se genera' } }, detalles: [] };
  }
  c.url = { estado: 'OK', texto: 'existe' };

  // Se aplican al texto antiguo las erratas (§3) y sustituciones (§4) de plan-contenido.md: las únicas correcciones permitidas
  const legacyCrudo = F.leerLegacy(url);
  const legacyHtml = L.corregirErratas(legacyCrudo || '', archivoPlan);
  const area = L.areaContenido(legacyHtml);
  const palabrasArea = L.tokens(L.textoPlano(area)).length;
  // Sin área de contenido antigua no hay nada con qué comparar: ERROR, nunca «100 % conservado»
  c.contenido = palabrasArea >= MIN_PALABRAS_AREA
    ? { estado: 'OK', texto: `${palabrasArea} pal.` }
    : { estado: 'ERROR', texto: legacyCrudo === null ? 'sin archivo en /legacy' : `área de contenido antigua no encontrada (${palabrasArea} pal.)` };
  if (c.contenido.estado === 'ERROR') detalles.push(`No se ha podido leer el contenido de la página antigua: el auditor no sabe qué comparar. Hay que adaptar L.areaContenido a esta plantilla.`);
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

  // H1: uno solo y con la keyword. Si el H1 antiguo tampoco la tenía, no se pierde nada: AVISO (paridad)
  const probH = [];
  let estadoH = 'OK';
  if (nueva.h1s.length !== 1) { probH.push(`${nueva.h1s.length} H1`); estadoH = 'ERROR'; }
  else if (kw && !contienePalabras(nueva.h1s[0], kw)) {
    const h1Antiguo = L.textoPlano((legacyHtml.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i) || [])[1] || '');
    const laTenia = contienePalabras(h1Antiguo, kw);
    probH.push(laTenia ? 'sin la keyword' : 'sin la keyword (el H1 antiguo tampoco la tenía)');
    estadoH = laTenia ? 'ERROR' : 'AVISO';
  }
  c.h1 = { estado: estadoH, texto: probH.length ? probH.join('; ') : 'OK' };

  // Productos (solo categorías): todos los nombres antiguos están entre los nuevos
  const antiguos = p?.plantilla === 'categoria' ? L.productosLegacy(legacyHtml) : [];
  const faltanNombres = antiguos.filter(a => a.nombre && !nueva.articulos.some(n => mismoNombre(a.nombre, n.nombre))).map(a => a.nombre);
  c.productos = {
    estado: faltanNombres.length ? 'ERROR' : 'OK',
    texto: `${antiguos.length - faltanNombres.length}/${antiguos.length}`,
  };
  faltanNombres.forEach(n => detalles.push(`Producto que falta: «${n}».`));

  // Datos técnicos EXACTOS: producto a producto en los dos sentidos; fuera de los productos, que no falte ninguno;
  // y en la intro nueva, ninguno que no esté en la página antigua
  let difs = 0;
  if (antiguos.length) {
    difs += compararProductos(antiguos, nueva.articulos, detalles);
    difs += compararPagina(L.textoPlano(L.fueraDeArticles(area).replace(/<h1\b[\s\S]*?<\/h1>/i, '')), nueva.textoFueraProductos, detalles, 'texto fuera de los productos');
  } else {
    // Páginas institucionales: solo cuentan cifras y códigos con cifras (sus mayúsculas son tipografía: «VITORIA ALAVA»)
    difs += compararPagina(L.textoPlano(area.replace(/<h1\b[\s\S]*?<\/h1>/i, '')), nueva.textoMain, detalles, 'texto de la página', { siglas: false });
  }
  if (p?.plantilla === 'categoria' && nueva.intro) difs += compararIntro(nueva.intro, L.textoPlano(legacyHtml), detalles);
  const nTec = L.tokensTecnicos(L.textoPlano(area)).length;
  c.cifras = { estado: difs ? 'ERROR' : (c.contenido.estado === 'ERROR' ? 'ERROR' : 'OK'), texto: difs ? `${difs} diferencia(s)` : `${nTec} datos` };

  // Imágenes de contenido: misma ruta y nombre; las que se eliminan, justificadas en plan-imagenes.csv
  const imgsAntiguas = [...new Set(L.srcImagenes(area).map(s => decodeURIComponent(new URL(s, url).pathname)))];
  let justificadas = 0;
  const faltanImgs = [];
  for (const img of imgsAntiguas) {
    if (nueva.imagenes.has(img)) continue;
    const planImg = imagenesPlan.get(img);
    // Solo una fila ELIMINAR de plan-imagenes.csv justifica quitar una imagen de su página. Que el archivo siga
    // publicado (D-011) evita el 404, pero la imagen pierde el contexto de la página: eso no se da por bueno.
    if (planImg && planImg.accion === 'ELIMINAR') { justificadas++; detalles.push(`Imagen eliminada (justificada): ${img} — ${planImg.notas}`); }
    else faltanImgs.push(img);
  }
  c.imagenes = { estado: faltanImgs.length ? 'ERROR' : 'OK', texto: `${imgsAntiguas.length - faltanImgs.length - justificadas}/${imgsAntiguas.length}${justificadas ? ` (+${justificadas} just.)` : ''}` };
  faltanImgs.forEach(i => detalles.push(`Imagen que ya no se usa: ${i}.`));

  // PDF: los mismos enlaces y el archivo existe en /dist con su nombre exacto
  const base = new URL(url);
  const pdfsAntiguos = [...new Set(L.hrefs(area).filter(h => /\.pdf$/i.test(h)).map(h => decodeURIComponent(new URL(h, base).pathname)))];
  const faltanPdf = pdfsAntiguos.filter(pdf => {
    const destino = canonizar(new URL(pdf, base).href) || `${L.HOST}${pdf}`;
    return !nueva.enlaces.has(decodeURIComponent(destino)) || !F.existe(decodeURIComponent(new URL(destino).pathname));
  });
  c.pdf = { estado: faltanPdf.length ? 'ERROR' : 'OK', texto: `${pdfsAntiguos.length - faltanPdf.length}/${pdfsAntiguos.length}` };
  faltanPdf.forEach(pdf => detalles.push(`PDF sin enlace o sin archivo en /dist: ${pdf}.`));

  // Enlaces internos de la página antigua (incluido su menú) → enlazados desde la nueva (incluido su menú)
  const destinos = new Set();
  for (const h of L.hrefs(L.sinComentarios(legacyHtml))) {
    if (!h || h.startsWith('#') || /^(mailto|tel|callto|javascript):/i.test(h)) continue;
    // Enlaces sin protocolo de /legacy (href="www.agpd.es", href="info@…"): daban 404 y no se copian (AGENTS.md §3.2)
    if (/^(www\.|[\w.+-]+@)/i.test(h)) continue;
    let abs; try { abs = new URL(h, base); } catch { continue; }
    if (/\.(jpe?g|png|gif|css|js|ico|pdf)$/i.test(abs.pathname)) continue;
    const c2 = canonizar(abs.href);
    if (c2 && c2 !== `${L.HOST}${ruta}`) destinos.add(c2);
  }
  const faltanEnlaces = [...destinos].filter(d => !nueva.enlaces.has(decodeURIComponent(d)));
  c.enlaces = { estado: faltanEnlaces.length ? 'ERROR' : 'OK', texto: `${destinos.size - faltanEnlaces.length}/${destinos.size}` };
  faltanEnlaces.forEach(d => detalles.push(`Enlace interno que se pierde: ${d}.`));

  // Cobertura del texto significativo antiguo (sin menú ni pie). Una sola frase perdida es ERROR.
  // En las categorías, PRODUCTO A PRODUCTO: en páginas con productos casi iguales (13 interruptores IMN), una frase
  // borrada en un producto se «encontraba» en el de al lado (lo descubrió tools/test-auditor.js).
  let cob;
  if (antiguos.length) {
    const partes = [cobertura(frasesDe(L.fueraDeArticles(area)), nueva.textoFueraProductos)];
    const usados = new Set();
    for (const a of antiguos) {
      const j = nueva.articulos.findIndex((n, k) => !usados.has(k) && a.nombre && mismoNombre(a.nombre, n.nombre));
      if (j !== -1) usados.add(j);
      partes.push(cobertura(frasesDe(a.interior), j === -1 ? '' : `${nueva.articulos[j].nombre}\n${nueva.articulos[j].texto}`));
    }
    const total = partes.reduce((s, p) => s + p.palabras, 0);
    const presentes = partes.reduce((s, p) => s + (p.porcentaje / 100) * p.palabras, 0);
    cob = { porcentaje: total ? (presentes / total) * 100 : 0, faltan: partes.flatMap(p => p.faltan), palabras: total };
  } else cob = cobertura(frasesDe(area), nueva.textoMain);
  const estadoTexto = c.contenido.estado === 'OK' && cob.porcentaje >= UMBRAL_COBERTURA && cob.faltan.length === 0 ? 'OK' : 'ERROR';
  c.texto = { estado: estadoTexto, texto: `${cob.porcentaje.toFixed(1)} %${cob.faltan.length ? ` · ${cob.faltan.length} frase(s) perdida(s)` : ''}`, valor: cob.porcentaje, palabras: cob.palabras };
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

// ---------- Auditoría de una URL que se redirige: CSV + .htaccess real ----------
function auditarRedireccion(fila, ctx, F) {
  const regla = reglaPara(fila.url);
  const detalles = [];
  let estado = 'OK', texto;
  if (!regla || regla.tipo !== '301') { estado = 'ERROR'; texto = 'sin regla 301 en redirecciones.csv'; }
  else if (regla.destino !== fila.destino_301.replace(/\s*\[.*\]\s*$/, '')) { estado = 'ERROR'; texto = `301 a ${regla.destino}, el inventario dice ${fila.destino_301}`; }
  else {
    texto = `301 → ${regla.destino}`;
    const ruta = decodeURIComponent(new URL(regla.destino).pathname);
    const enPlan = plan.some(f => rutaPublica(f.archivo) === ruta) || /\.pdf$/.test(ruta);
    if (!enPlan) { estado = 'ERROR'; detalles.push(`El destino ${regla.destino} no es ninguna URL del plan.`); }
    // Las 4 variantes (http/https, con y sin www) contra el .htaccess real
    const u = new URL(fila.url);
    const host = u.hostname.replace(/^www\./, '');
    const problemas = ['http', 'https'].flatMap(pr => ['', 'www.'].map(w => `${pr}://${w}${host}${u.pathname}`))
      .flatMap(v => comprobarUrl(v, 301, regla.destino, ctx, F));
    if (problemas.length) { estado = 'ERROR'; texto += ' · el .htaccess no lo cumple'; problemas.forEach(p => detalles.push(p)); }
    else texto += ' · .htaccess OK';
    if (/POR VERIFICAR/.test(regla.motivo + fila.destino_301)) { estado = peor([estado, 'AVISO']); detalles.push(`Destino pendiente de confirmar: ${regla.motivo}`); }
  }
  return { url: fila.url, tipo: 'redirección', estado, checks: { url: { estado, texto } }, detalles };
}

// Reglas generales del .htaccess que no son una URL del inventario: host y protocolo, 404 del .es, ñ en Latin-1
function auditarReglasGenerales(ctx, F) {
  const casos = [
    ['http://brototermic.com/resistencias-inmersion.html', 301, `${L.HOST}/resistencias-inmersion.html`],
    ['http://www.brototermic.com/resistencias-inmersion.html', 301, `${L.HOST}/resistencias-inmersion.html`],
    ['https://www.brototermic.com/', 301, `${L.HOST}/`],
    ['https://www.brototermic.com/docs/catalogo_ca%C3%B1as_pirometricas_broto-03-02-2015.pdf', 301, `${L.HOST}/docs/catalogo_ca%C3%B1as_pirometricas_broto-03-02-2015.pdf`],
    ['https://brototermic.com/docs/catalogo_ca%F1as_pirometricas_broto-03-02-2015.pdf', 200],
    ['https://brototermic.com/esta-pagina-no-existe.html', 404],
    ['https://brototermic.es/esta-pagina-no-existe.html', 404],
    ['http://www.brototermic.es/resistencias-inmersion.html', 404],
    ['https://www.brototermic.es/images/logo.png', 404],
    ['http://brototermic.es/', 301, `${L.HOST}/oviedo/`],
    // Sin listado de carpetas; las carpetas con index.html sí responden
    ['https://brototermic.com/images/', 404],
    ['https://brototermic.com/docs/', 404],
    ['https://brototermic.com/oviedo/', 200],
    ['https://brototermic.com/', 200],
    // Archivos ocultos y copias de seguridad: 404 aunque existieran en el servidor (M-08)
    ['https://brototermic.com/.git/HEAD', 404],
    ['https://brototermic.com/.env', 404],
    ['https://brototermic.com/contacto/.htaccess', 404],
    ['https://brototermic.com/index.html.bak', 404],
    ['https://brototermic.com/backup.SQL', 404],
    ['https://brototermic.com/empresa.html~', 404],
  ];
  const detalles = casos.flatMap(([u, e, d]) => comprobarUrl(u, e, d, ctx, F));
  const estado = detalles.length ? 'ERROR' : 'OK';
  return { url: '.htaccess (reglas generales)', tipo: 'redirección', estado, checks: { url: { estado, texto: `${casos.length - detalles.length}/${casos.length} casos` } }, detalles };
}

// ---------- Auditoría de un archivo (PDF, sitemap, robots) ----------
function auditarArchivo(fila, ctx, F) {
  const ruta = decodeURIComponent(new URL(fila.url).pathname);
  const existe = F.existe(ruta);
  const estado = existe ? 'OK' : (fila.estado === 'NUEVA' && ctx.modo !== 'publicacion' ? 'AVISO' : 'ERROR');
  return { url: fila.url, tipo: 'archivo', estado, checks: { url: { estado, texto: existe ? 'existe' : 'falta en /dist' } }, detalles: [] };
}

// ---------- Página de familia (NUEVA): existe y su intro no trae datos técnicos que no estén en sus categorías ----------
function auditarFamilia(fila, ctx, F) {
  const ruta = new URL(fila.url).pathname;
  const nueva = leerNueva(ruta, F);
  const detalles = [];
  if (!nueva) {
    const estado = ctx.modo === 'publicacion' ? 'ERROR' : 'AVISO';
    return { url: fila.url, tipo: 'familia (nueva)', estado, checks: { url: { estado, texto: 'pendiente' } }, detalles };
  }
  const fam = familias.find(f => `/${f.archivo}.html` === ruta);
  const textoAntiguo = (fam?.categorias || []).map(c => F.leerLegacy(`${L.HOST}/${c.archivo}.html`) || '').map(L.textoPlano).join('\n');
  const inventados = compararIntro(nueva.intro, textoAntiguo, detalles);
  const estado = inventados ? 'ERROR' : 'OK';
  return { url: fila.url, tipo: 'familia (nueva)', estado, checks: { url: { estado, texto: inventados ? `existe · ${inventados} dato(s) de la intro sin origen` : 'existe · intro OK' } }, detalles };
}

// ---------- Auditoría completa ----------
// opciones: modo, dist, distEs, sobrescribir, sobrescribirLegacy, urls (solo esas URLs del inventario; para las pruebas)
function auditar({ modo = 'piloto', dist, distEs, sobrescribir = {}, sobrescribirLegacy = {}, urls = null } = {}) {
  const ctx = {
    modo,
    dist: dist || (process.env.AUDITORIA_DIST ? path.resolve(process.env.AUDITORIA_DIST) : path.join(L.RAIZ, 'dist')),
    distEs: distEs || path.join(L.RAIZ, 'dist-es'),
    sobrescribir,
    sobrescribirLegacy,
  };
  const F = fuente(ctx);
  const sitemapTxt = F.leer('/sitemap.xml') || '';
  ctx.sitemap = new Set([...sitemapTxt.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => L.decodificar(m[1])));
  // Metas de todas las páginas generadas, para detectar repetidas
  ctx.metas = new Map();
  for (const f of plan) {
    const h = F.leer(archivoRel(rutaPublica(f.archivo)));
    if (h === null) continue;
    const m = L.decodificar((h.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '');
    ctx.metas.set(m, (ctx.metas.get(m) || 0) + 1);
  }
  const filas = inventario.filter(f => !urls || urls.includes(f.url)).map(f => {
    const esPagina = /\.html$|\/$/.test(new URL(f.url).pathname);
    if (f.estado === 'REDIRIGIR') return auditarRedireccion(f, ctx, F);
    if (!esPagina) return auditarArchivo(f, ctx, F);
    if (f.estado === 'NUEVA') return auditarFamilia(f, ctx, F);
    return auditarPagina(f, ctx, F);
  });
  if (!urls || urls.includes('.htaccess')) filas.push(auditarReglasGenerales(ctx, F));
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
  l.push(`> Generado por \`node tools/auditoria-seo.js\` (modo **${modo}**). **No se edita a mano.** Compara cada URL de /legacy con su equivalente en /dist: que exista (o tenga un 301 válido **en el .htaccess real**), que conserve title, H1, productos, imágenes, PDF, enlaces internos y el texto (cobertura ≥ ${UMBRAL_COBERTURA} %), que los **datos técnicos** (cifras, unidades, rangos, modelos) sean idénticos producto a producto, y que tenga canonical, JSON-LD y presencia en sitemap.xml. Antes de auditar, \`tools/test-auditor.js\` comprueba que el auditor detecta las mutaciones conocidas.`, '');
  l.push(`**Resultado:** ${resumen.OK} OK · ${resumen.AVISO} AVISO · ${resumen.ERROR} ERROR (${filas.length} filas: las URLs del inventario y las reglas generales del .htaccess).`, '');
  l.push('## Páginas generadas', '');
  l.push('| URL | Estado | Contenido antiguo | Title | Meta | H1 | Productos | Datos técnicos | Imágenes | PDF | Enlaces | Texto | Canonical | JSON-LD | Sitemap |');
  l.push('|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|');
  for (const f of paginas) {
    const c = f.checks;
    l.push(`| \`${relativa(f.url)}\` | ${ICONO[f.estado]} ${f.estado} | ${celda(c.contenido)} | ${celda(c.title)} | ${celda(c.meta)} | ${celda(c.h1)} | ${celda(c.productos)} | ${celda(c.cifras)} | ${celda(c.imagenes)} | ${celda(c.pdf)} | ${celda(c.enlaces)} | ${celda(c.texto)} | ${celda(c.canonical)} | ${celda(c.jsonld)} | ${celda(c.sitemap)} |`);
  }
  l.push('', '## Resto de URLs del inventario (familias nuevas, redirecciones y archivos)', '');
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
  // Primero, las pruebas de mutación: si el auditor no detecta alguna, su resultado no vale nada
  const { ejecutar } = require('./test-auditor.js');
  const prueba = ejecutar({ modo });
  if (!prueba.ok) {
    console.log(`test-auditor: ${prueba.fallos.length} prueba(s) de mutación NO detectadas. No se audita.`);
    prueba.fallos.forEach(f => console.log(`  FALLO  ${f}`));
    process.exit(1);
  }
  console.log(`test-auditor: ${prueba.total} mutaciones detectadas.`);
  const r = prueba.base;
  fs.writeFileSync(path.join(L.RAIZ, 'docs', 'auditoria-seo.md'), informe(r));
  console.log(`Auditoría SEO (modo ${modo}): ${r.resumen.OK} OK · ${r.resumen.AVISO} AVISO · ${r.resumen.ERROR} ERROR → docs/auditoria-seo.md`);
  for (const f of r.filas.filter(x => x.estado === 'ERROR')) console.log(`  ERROR  ${f.url}: ${Object.entries(f.checks).filter(([, c]) => c.estado === 'ERROR').map(([k, c]) => `${k} (${c.texto})`).join(', ')}`);
  process.exitCode = r.resumen.ERROR ? 1 : 0;
}
