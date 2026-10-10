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
const ENTIDADES = { nbsp: ' ', amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", ordm: 'º', ordf: 'ª', deg: '°', frac14: '¼', frac12: '½', frac34: '¾', reg: '®', copy: '©', euro: '€', iexcl: '¡', iquest: '¿', laquo: '«', raquo: '»', middot: '·', micro: 'µ', plusmn: '±', sup2: '²', sup3: '³', times: '×', hellip: '…', ndash: '–', mdash: '—', lsquo: '‘', rsquo: '’', ldquo: '“', rdquo: '”', bull: '•', trade: '™', Omega: 'Ω', shy: '' };
// Letras con tilde, diéresis, cedilla… (&Oacute;, &ntilde;): en /legacy hay muchas escritas así y, sin decodificarlas,
// «INMERSI&Oacute;N» se partía en dos palabras y no casaba con «Inmersión»
for (const [l, base] of [['acute', 'aeiouyAEIOUY'], ['grave', 'aeiouAEIOU'], ['circ', 'aeiouAEIOU'], ['uml', 'aeiouyAEIOU'], ['tilde', 'anoANO']]) {
  const marca = { acute: '́', grave: '̀', circ: '̂', uml: '̈', tilde: '̃' }[l];
  for (const c of base) ENTIDADES[c + l] = (c + marca).normalize('NFC');
}
Object.assign(ENTIDADES, { ccedil: 'ç', Ccedil: 'Ç' });
const decodificar = s => s
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
  .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
  .replace(/&([a-z0-9]+);/gi, (m, e) => ENTIDADES[e] ?? ENTIDADES[e.toLowerCase()] ?? m)
  // «&nbsp» sin punto y coma (nuevos-productos.html): el navegador también lo muestra como espacio
  .replace(/&nbsp(?![\w;])/gi, ' ');

const sinComentarios = h => h.replace(/<!--[\s\S]*?-->/g, '').replace(/<script\b[\s\S]*?<\/script>/gi, '').replace(/<style\b[\s\S]*?<\/style>/gi, '');

// Texto plano: las etiquetas de bloque y los <br> cortan frase (marca \n)
const BLOQUE = /<\/?(p|div|br|li|ul|ol|h[1-6]|article|section|figure|table|tr|td|th|caption|header|footer|nav|aside|main|details|summary|address)\b[^>]*>/gi;
const textoPlano = html => decodificar(sinComentarios(html).replace(BLOQUE, '\n').replace(/<[^>]+>/g, ' '))
  .replace(/[ \t ]+/g, ' ').replace(/ *\n */g, '\n').replace(/\n+/g, '\n').trim();

// Área de contenido de una página de /legacy (sin menú ni pie). Dos plantillas en /legacy:
//   - la del .com: de <section id="content"> al <footer>;
//   - la de /oviedo/ y contacto (otra plantilla): de <header> a </main>, sin los <nav>. La cabecera entra
//     porque lleva texto indexable (el carrusel «Calidad / Servicio / Innovación» de /oviedo/).
// Si no encuentra ninguna, devuelve '' y el auditor lo trata como ERROR (nunca como «100 % conservado»).
function areaContenido(html) {
  const i = html.indexOf('id="content"');
  if (i !== -1) {
    const f = html.indexOf('<footer', i);
    return sinComentarios(html.slice(html.indexOf('>', i) + 1, f === -1 ? undefined : f));
  }
  const ini = html.search(/<header\b/i), fin = html.search(/<\/main>/i);
  if (ini === -1 || fin === -1 || fin < ini) return '';
  return sinComentarios(html.slice(ini, fin)).replace(/<nav\b[\s\S]*?<\/nav>/gi, '');
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
  return decodificar(s)
    // Teléfonos: «945 223 331» = «945 22 33 31» (una sola palabra, sin separadores)
    .replace(/(?<![\d.,])(?:\+34[\s.]?)?([6789](?:[\s.]?\d){8})(?!\d)/g, (m, n) => ` ${n.replace(/\D/g, '')} `)
    // «Vitoria - Gasteiz», «Vitoria-Gasteiz»: el mismo topónimo
    .replace(/vitoria\s*-\s*gasteiz/gi, 'vitoria gasteiz')
    .toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/ñ/g, 'n')
    .replace(/(\p{L})-(\p{L}|\d)|(\d)-(\p{L})/gu, (m, a, b, c, d) => (a ? a + b : c + d))
    .replace(/(\d)(\p{L})/gu, '$1 $2').replace(/(\p{L})(\d)/gu, '$1 $2')
    .replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
}
const VACIAS = new Set(['de', 'del', 'el', 'la', 'los', 'las', 'y', 'e', 'o', 'u', 'en', 'para', 'por', 'a', 'al', 'con', 'un', 'una', 'que', 'se', 'su', 'sus']);
const tokens = s => normalizar(s).split(' ').filter(Boolean);

// ¿a y b se diferencian como mucho en UNA edición (cambiar, quitar o añadir una letra)? Lineal y sin matrices:
// el LCS del auditor la llama millones de veces.
function unaEdicion(a, b) {
  if (Math.abs(a.length - b.length) > 1) return false;
  if (a.length > b.length) [a, b] = [b, a];
  let i = 0, j = 0, ediciones = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) { i++; j++; continue; }
    if (++ediciones > 1) return false;
    if (a.length === b.length) i++;
    j++;
  }
  return ediciones + (b.length - j) + (a.length - i) <= 1;
}
// Dos palabras «coinciden» si son iguales, si solo difieren en una letra (erratas: «Reistencias») o en el plural.
// Las cifras NUNCA coinciden por aproximación («12000» ≠ «13000»): de eso se encarga tokensTecnicos, que es exacto.
const CON_CIFRA = new Map();
const tieneCifra = s => { let v = CON_CIFRA.get(s); if (v === undefined) { v = /\d/.test(s); CON_CIFRA.set(s, v); } return v; };
const coincide = (a, b) => a === b || (a.length >= 4 && b.length >= 4 && !tieneCifra(a) && !tieneCifra(b) &&
  ((a.length >= 5 && b.length >= 5 && unaEdicion(a, b)) || a + 's' === b || b + 's' === a || a + 'es' === b || b + 'es' === a));

// ---------- Datos técnicos: comparación EXACTA (números, unidades, rangos, modelos, IP, teléfonos) ----------
// Devuelve la lista de «tokens técnicos» de un texto plano. Solo se normaliza lo que no cambia el dato:
//   - espacio o guion entre la cifra y su unidad: «1500mm» = «1500 mm»; «IP-44» = «IP 44» = «IP44»
//   - «º» y «°» delante de C/F: «90ºC» = «90 °C»
//   - el signo «+» («+70» = «70»); el «-» se conserva si es un signo («-20 °C»), no si separa un rango («0-90»)
//   - coma o punto decimal: «6.2» = «6,2» (salvo grupos de 3 cifras, que pueden ser millares: «1.500» ≠ «1,500»)
//   - teléfonos: «945 223 331» = «945 22 33 31» = «+34 945223331»
// Todo lo demás cuenta: una cifra, una unidad, una letra o una cifra de un modelo distintas son una diferencia.
const UNIDADES = ['°C', '°F', 'VAC', 'Vac', 'VCA', 'Vca', 'VCC', 'Vcc', 'VDC', 'Vdc', 'mm²', 'mm2', 'mm', 'cm', 'µm', 'μm', 'km', 'm³', 'm3', 'm²', 'm2', 'm', 'kW', 'MW', 'mW', 'W',
  'kV', 'mV', 'V', 'mA', 'kA', 'A', 'mbar', 'bar', 'kPa', 'MPa', 'Pa', 'psi', 'kHz', 'MHz', 'Hz', 'rpm', 'kg/h', 'kg', 'g', 'l/h',
  'l/min', 'litros', 'ltrs', 'l', 'L', 'ms', 's', 'min', 'h', '%', 'Ω', 'ohm', 'ohmios', 'K', 'µ', 'pulgadas', '"', '”', '″', 'mts', 'mt', 'Kg', 'KW', 'Kw', 'kw', 'Mts', 'Lts'];
const RE_UNIDAD = UNIDADES.slice().sort((a, b) => b.length - a.length).map(u => u.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')).join('|');
const NO_MODELO = new Set(['BROTOTERMIC', 'PDF', 'S', 'L', 'SL']);
// Una línea escrita entera en MAYÚSCULAS, con alguna palabra de más de 5 letras, es un rótulo («BATERÍA DE AIRE»,
// «MÁS INFORMACIÓN»): sus palabras no son siglas, y escribirlas en minúsculas en la web nueva es un cambio de
// formato, no de datos. «Acero INOX y SPDT» o «TPSP22 INOX» no son rótulos: sus siglas cuentan.
const esRotulo = linea => {
  const palabras = (linea.match(/\p{L}{3,}/gu) || []);
  return palabras.length >= 2 && palabras.every(p => p === p.toUpperCase()) && palabras.some(p => p.length > 5);
};
// Palabras corrientes que pueden ir en mayúsculas sin ser una sigla («LEER MÁS», «VER»)
const NO_SIGLA = new Set(['MÁS', 'MAS', 'VER', 'LEER', 'DE', 'DEL', 'LA', 'EL', 'LOS', 'LAS', 'EN', 'CON', 'POR', 'PARA', 'Y', 'O', 'A', 'AL', 'UN', 'UNA', 'SU', 'SUS', 'QUE', 'NUEVA', 'NUEVO', 'AQUÍ', 'CLICK', 'INFO', 'TODO', 'TODOS']);
// opciones.siglas: contar también las siglas sin cifras («INOX», «SPDT»). Se usa en categorías e intros; en las páginas
// institucionales (legales, empresa) las mayúsculas son tipografía («VITORIA ALAVA»), no datos.
// Expresiones compiladas una sola vez (tokensTecnicos se llama cientos de veces por auditoría)
const RE_SIGLA_NUM = new RegExp(String.raw`(?<![\p{L}\d])([A-Z]{2,5})[\s-]+(\d+)(?!\s?(?:${RE_UNIDAD})(?![\p{L}\d]))(?![\p{L}\d]|[.,/]\d)`, 'gu');
const RE_ES_CIFRA_UNIDAD = new RegExp(String.raw`^[\d.,-]+(?:${RE_UNIDAD})$`);
const RE_UNIDAD_FINAL = new RegExp(`(${RE_UNIDAD})$`);
const RE_SIGLA = new RegExp(String.raw`(?<![\p{L}\d])(?<!\d\s?)(?!(?:${RE_UNIDAD})(?![\p{L}\d]))\p{Lu}{2,5}(?![\p{L}\d])`, 'gu');
const RE_CIFRA =new RegExp(String.raw`(?:(?<=^|[\s(:;=/«"'])(-))?\+?(\d+(?:[.,]\d+)*)(?:\s?(${RE_UNIDAD}))?(?![\p{L}\d²³])`, 'gu');
const CACHE_TECNICOS = new Map();
function tokensTecnicos(texto, opciones = {}) {
  const clave = `${opciones.siglas === false ? 0 : 1}${texto}`;
  if (!CACHE_TECNICOS.has(clave)) CACHE_TECNICOS.set(clave, calcularTokensTecnicos(texto, opciones));
  return CACHE_TECNICOS.get(clave).slice();
}
function calcularTokensTecnicos(texto, { siglas = true } = {}) {
  let t = decodificar(texto).replace(/[   ]/g, ' ').replace(/[−–]/g, '-')
    .replace(/(\d)\s*[º°]\s*([CF])\b/g, '$1 °$2').replace(/[º°]\s*([CF])\b/g, '°$1')
    .replace(/\bIP\s*-?\s*(\d{2})\b/g, 'IP$1')
    // Medidas «280x280mm», «74 x 32 x 59 mm», «160×144»: cada cifra por separado
    .replace(/(\d)\s*[x×X]\s*(?=\d)/g, '$1 x ')
    // Símbolo de diámetro: «ø102 mm» = «102 mm», «Ø8mm» = «8 mm»
    .replace(/[øØΦ⌀]\s*(?=\d)/g, ' ')
    // Número de portal: «Nº8» = «nº 8» = «n.º 8» (la «º» es una letra para Unicode: sin esto, «Nº8» sería un código)
    .replace(/(?<![\p{L}\d])[nN]\.?\s?[º°]\s*(?=\d)/gu, 'nº ')
    // Rango con dos puntos o puntos suspensivos: «90..3500 mm» = «90…3500 mm» = «90 a 3500 mm»
    .replace(/(\d)\s*(?:\.{2,3}|…)\s*(?=[-+]?\d)/g, '$1 a ');
  // Sigla + número sin unidad = un solo código: «AISI 316» = «AISI316», «IEC 60684» = «IEC60684», «CNM 10» = «CNM10»
  // (no «ATEX 1/2 D» ni «IP 6,5»: un número seguido de «/», «,5» o «.5» no es el final de un código)
  t = t.replace(RE_SIGLA_NUM, '$1$2');
  // En los rótulos en mayúsculas solo cuentan las palabras con cifras (los modelos): el resto pasa a minúsculas
  t = t.split('\n').map(l => (esRotulo(l) ? l.replace(/(?<![\p{L}\d])\p{Lu}+(?![\p{L}\d])/gu, m => m.toLowerCase()) : l)).join('\n');
  const out = [];
  // Teléfonos de 9 cifras (6, 7, 8 o 9 delante), con o sin +34 y separadores
  t = t.replace(/(?<![\d.,])(?:\+34[\s.]?)?([6789](?:[\s.]?\d){8})(?![\d])/g, (m, n) => { out.push('tel:' + n.replace(/\D/g, '')); return ' '; });
  // Códigos de modelo: letras y cifras mezcladas («TPSP22», «IC1013NG», «PT100», «77F»)
  const sinGuion = s => s.replace(/-/g, '');
  t = t.replace(/(?<![\p{L}\d.,])(?=[\p{L}\d-]*\p{L})(?=[\p{L}\d-]*\d)[\p{L}\d]+(?:-[\p{L}\d]+)*(?![\p{L}\d])/gu, m => {
    // «1500mm», «230V», «12-24V»: cifra + unidad, no es un modelo
    if (RE_ES_CIFRA_UNIDAD.test(m)) return ` ${m.replace(RE_UNIDAD_FINAL, ' $1')} `;
    // Mayúsculas y minúsculas de un código no cambian el dato: «Pt100» = «PT100»
    out.push(sinGuion(m).toUpperCase()); return ' ';
  });
  // Siglas (2-5 letras en mayúsculas, fuera de los rótulos): «INOX», «PNP», «SPDT», «ATEX»
  // (no las que van justo detrás de una cifra: «690 VAC» es una unidad, la recoge el paso siguiente)
  t = t.replace(RE_SIGLA, m => {
    if (siglas && !NO_MODELO.has(m) && !NO_SIGLA.has(m)) out.push(m);
    return ' ';
  });
  // Cifras, con su unidad si la llevan detrás
  const re = RE_CIFRA;
  const cifras = [];
  for (const m of t.matchAll(re)) {
    // «3,6,9,18» es una lista, no un número: varios separadores que no son grupos de millares
    const partes = (m[2].match(/[.,]/g) || []).length >= 2 && !/^\d{1,3}([.,]\d{3})+([.,]\d+)?$/.test(m[2]) ? m[2].split(/[.,]/) : [m[2]];
    const unidad = (m[3] || '').replace(/^mm2$/, 'mm²').replace(/^m2$/, 'm²').replace(/^m3$/, 'm³')
      .replace(/^V(ac|ca|cc|dc)$/i, (_, x) => `V${x.toUpperCase()}`).replace(/^["”″]$/, 'pulgadas')
      .replace(/^(litros|ltrs|Lts|L)$/, 'l').replace(/^(Kg|KW|Kw|kw|Mts)$/, u => ({ Kg: 'kg', KW: 'kW', Kw: 'kW', kw: 'kW', Mts: 'mts' }[u]));
    partes.forEach((p, k) => cifras.push({
      signo: k === 0 ? m[1] || '' : '',
      num: p.replace(/[.,](?=\d{1,2}$|\d{4,}$)/, ','),
      unidad: k === partes.length - 1 ? unidad : '',
      ini: m.index, fin: m.index + m[0].length,
    }));
  }
  // La unidad del último número de un rango o una lista vale para los anteriores: «-25 a 650 ºC» = «-25 ºC a 650 ºC»,
  // «25, 50, 105 y 200 litros» = «25L, 50L, 105L y 200L», «0-90 °C» = «0 °C-90 °C»
  for (let i = cifras.length - 2; i >= 0; i--) {
    const a = cifras[i], b = cifras[i + 1];
    const entre = a.fin === b.ini && a.ini === b.ini ? ',' : t.slice(a.fin, b.ini);
    if (!a.unidad && b.unidad && /^\s*(?:,|y|o|a|hasta|-|…|\.\.\.|\/|x)?\s*$/i.test(entre)) a.unidad = b.unidad;
  }
  for (const c of cifras) out.push(`${c.signo}${c.num}${c.unidad ? ' ' + c.unidad : ''}`);
  return out;
}
// Diferencia de multiconjuntos: lo que hay en «a» y no en «b» (con repeticiones)
function faltanEn(a, b) {
  const resto = new Map();
  for (const x of b) resto.set(x, (resto.get(x) || 0) + 1);
  const faltan = [];
  for (const x of a) { if (resto.get(x)) resto.set(x, resto.get(x) - 1); else faltan.push(x); }
  return faltan;
}

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
  'nuevos-productos.html': [['Getways DE HubB', 'Gateways DE HubB']],
};
// Textos desactualizados de docs/plan-contenido.md §4: las ÚNICAS sustituciones de texto (no erratas) que
// se permiten en páginas de /legacy. Cada una cita su fila del §4. Los espacios del texto antiguo casan con
// cualquier espacio o salto de línea del HTML. «a» vacío = el texto se elimina (decidido en el §4).
// Solo hace falta listar lo que DESAPARECE: añadir palabras alrededor no rompe la cobertura del auditor.
const SUSTITUCIONES = {
  'index.html': [
    // §4.1: «más de 35 años» → «desde 1982» (dato externo, en site.json → pendientes)
    ['Con más de 35 años de experiencia, compuesta por un equipo joven y dinámico que se esfuerza por dar el mejor servicio a sus clientes.',
      'Desde 1982 suministramos resistencias eléctricas e instrumentación a la industria del País Vasco, de las provincias limítrofes y de Asturias.'],
    // §4.2: sin superlativo
    ['es una de las empresas líderes en el sector de la distribución de instrumentación industrial especializada',
      'es una empresa de distribución de instrumentación industrial especializada'],
    // §4.12
    ['NUEVA DELEGACIÓN EN ASTURIAS', 'Delegación en Asturias'],
  ],
  'contacto/contacto.html': [
    // §4.14: CP de Oviedo
    ['03011 Oviedo', '33011 Oviedo'],
    // §4.21: el bloque de direcciones y teléfonos pasa a ser el bloque de sedes (mismos datos, redacción de site.json).
    // Las cifras (teléfonos, CP, número de portal) las sigue comparando el chequeo exacto sobre este texto.
    [/<dt>BROTOTERMIC \| Sede central en Vitoria<\/dt>[\s\S]*?Delegación de Asturias<\/dt>/,
      '<p>Sede central en Vitoria-Gasteiz</p><p>C/ Pintor Mauro Ortiz de Urbina, 7 bajo</p><p>01008 Vitoria-Gasteiz (Álava)</p>' +
      '<p>Teléfono: 945 22 33 31</p><p>Delegación en Asturias (Oviedo)</p><p>Llano Ponte nº 8 bajo</p><p>33011 Oviedo (Asturias)</p>' +
      '<p>Teléfono: 629 462 642</p>'],
    // §4.22: la frase de consentimiento del formulario antiguo pasa a ser la casilla RGPD del formulario nuevo
    ['Registrándome en este formulario, confirmo que he leído y acepto los Términos y Condiciones de privacidad.',
      'He leído y acepto la política de privacidad'],
  ],
  'oviedo/index.html': [
    // §4.6: «más de 35 años» → «desde 1982» (dato externo); el carrusel partía la frase en dos líneas
    [/Con más de 35 años de experiencia\. BROTOTERMIC([\s\S]*?)le ofrece dedicación y profesionalidad\./, 'Desde 1982, BROTOTERMIC$1te ofrece dedicación y profesionalidad.'],
    // §4.23 (= §4.2 del inicio): sin superlativos
    ['es una de las empresas líderes en el sector de la distribución de instrumentación industrial especializada',
      'es una empresa de distribución de instrumentación industrial especializada'],
    ['Líderes en Instrumentación Industrial Especializada', 'Instrumentación industrial especializada'],
    ['Podemos ofrecerle las mejores soluciones adaptadas a su actividad.', 'Podemos ofrecerte soluciones adaptadas a tu actividad.'],
  ],
  'empresa.html': [
    // §4.3 (cita) y §4.4 (Servicio)
    ['Después de treinta y cinco años', 'Después de más de cuarenta años'],
    ['Con más de 35 años de experiencia, y compuesta por un equipo', 'Con experiencia desde 1982 y un equipo'],
  ],
  'nuevos-productos.html': [
    // §4.11 (el H1 no cuenta en la cobertura, pero el rótulo se corrige igual)
    ['Nuevos Productos 2021', 'Nuevos productos'],
  ],
  'privacidad.html': [
    ['Ptr. Ortiz de Urbina, n. 7', 'C/ Pintor Mauro Ortiz de Urbina, 7 bajo'],   // §4.15
    ['www.agpd.es', 'www.aepd.es'],                                                // §4.16 [REVISIÓN CLIENTE]
    ['Código de inscripción en la Agencia Española de Protección de Datos: 2131260399', ''], // §4.17
    // §4.24 (D-011): sin la afirmación de que el Privacy Shield está vigente (anulado en 2020) [REVISIÓN CLIENTE]
    [/Utilizamos empresas americanas como Microsoft[\s\S]*?en su página web\./,
      'Utilizamos empresas de Estados Unidos, como Microsoft, proveedora de las aplicaciones Office 365 y Azure, por lo que algunos datos pueden ser objeto de una transferencia internacional a un país de fuera del Espacio Económico Europeo. Si lo deseas, puedes consultar la política de privacidad de Microsoft en su página web.'],
  ],
  'cookies.html': [
    // §4.18: la política describe solo las cookies reales de la web nueva (ninguna: sin analítica, mapas,
    // reCAPTCHA, redes sociales ni zona de clientes). Se eliminan las categorías que no se usan y el
    // apartado de cookies de terceros. [REVISIÓN CLIENTE]
    [/Las cookies que utilizamos en esta página web se agrupan[\s\S]*?(?=\s*<\/p>)/g,
      'Esta web no utiliza cookies propias ni de terceros: no tiene analítica, ni mapas incrustados, ni botones de redes sociales, ni zona de clientes.'],
    [/si sólo quiere rechazar todas o algunas de las cookies de terceros[\s\S]*?Cookies de terceros.\.?\s*/g, ''],
    [/TIPO Y FINALIDAD:[\s\S]*?(?=\s*<\/p>)/g, ''],
    ['Código de inscripción en la Agencia Española de Protección de Datos: 2131260399', ''], // §4.17
  ],
};
// «de» es un texto literal (sus espacios casan con cualquier espacio del HTML) o una RegExp ya construida
const sustituciones = archivo => (SUSTITUCIONES[archivo] || []).map(([de, a]) => ({
  re: de instanceof RegExp ? de : new RegExp(de.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/ /g, '\\s+'), 'g'),
  a,
}));

// Aplica las erratas (§3) y las sustituciones (§4) de una página (archivo = «resistencias-inmersion.html») a un texto
function corregirErratas(texto, archivo, lista = erratas()) {
  let s = texto;
  for (const e of lista) if (e.archivo === archivo) s = s.split(e.de).join(e.a);
  for (const { re, a } of sustituciones(archivo)) s = s.replace(re, a);
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

// ---------- Imágenes antiguas que se siguen publicando (decisión D-011) ----------
// Todas las imágenes con URL pública de /images/ y /oviedo/images/ del .com, aunque la web nueva ya no las muestre:
// una URL de imagen indexada no puede dar 404. build.js copia a /dist las que no estén ya en /images/ del repo
// (las del repo mandan: pueden ser versiones retocadas con el mismo nombre). Se copian de /legacy, que es la copia
// byte a byte de la web actual: así no se duplican en git y son exactamente los mismos bytes que Google indexó.
const CARPETAS_IMAGENES_CONSERVADAS = ['images', 'oviedo/images'];
function imagenesConservadas() {
  const lista = [];
  for (const carpeta of CARPETAS_IMAGENES_CONSERVADAS) {
    const base = path.join(LEGACY_COM, carpeta);
    if (!fs.existsSync(base)) continue;
    (function recorrer(dir) {
      for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) recorrer(p);
        else if (/\.(jpe?g|png|gif|svg|ico|webp)$/i.test(e.name)) {
          lista.push({ url: '/' + path.relative(LEGACY_COM, p).split(path.sep).join('/'), origen: p });
        }
      }
    })(base);
  }
  return lista;
}

module.exports = {
  imagenesConservadas,
  RAIZ, LEGACY_COM, LEGACY_ES, HOST,
  leerCsv, decodificar, sinComentarios, textoPlano, areaContenido, productosLegacy, segmentosArticle, fueraDeArticles, srcImagenes, hrefs,
  normalizar, tokens, VACIAS, coincide, archivoLegacy, erratas, corregirErratas, tokensTecnicos, faltanEn,
};
