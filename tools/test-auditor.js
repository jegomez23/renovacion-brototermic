#!/usr/bin/env node
// Pruebas de mutación del auditor de paridad SEO (tools/auditoria-seo.js).
//
//   node tools/test-auditor.js
//
// Estropea a propósito, EN MEMORIA (no toca /dist ni /legacy), una página que hoy está bien y comprueba que el
// auditor la marca como ERROR en el chequeo que corresponde. Si alguna mutación pasa sin ERROR, el auditor no es
// fiable y falla todo: auditoria-seo.js no audita y build.js no termina.
// Se ejecuta SIEMPRE antes del auditor (desde auditoria-seo.js y desde build.js).
//
// Las páginas de prueba se eligen solas (la primera página que hoy está bien y tiene lo que hace falta mutar):
// así las pruebas siguen funcionando mientras la Persona B revisa y cambia los textos.
// Sin dependencias: solo módulos nativos de Node.
'use strict';
const L = require('./lib/legacy');
const { auditar } = require('./auditoria-seo.js');

const archivoRel = url => { const r = decodeURIComponent(new URL(url).pathname); return r.endsWith('/') ? `${r}index.html` : r; };
const productos = html => html.match(/<article class="producto"[\s\S]*?<\/article>/g) || [];
// Aplica «cambio» a la primera coincidencia de «re» dentro de los textos de producto (no en el JSON-LD ni en el menú)
function enTextoDeProducto(html, re, cambio) {
  let hecho = false;
  const nuevo = html.replace(/<div class="producto__texto">[\s\S]*?<\/div>|<table class="specs">[\s\S]*?<\/table>|<ul class="specs-lista[\s\S]*?<\/ul>/g, bloque => {
    if (hecho) return bloque;
    return bloque.replace(/>([^<]+)</g, (m, texto) => {
      if (hecho || !re.test(texto)) return m;
      hecho = true;
      return `>${texto.replace(re, cambio)}<`;
    });
  });
  return hecho ? nuevo : null;
}

// Cada mutación: qué chequeo debe saltar y cómo se estropea la página (devuelve null si no aplica a esa página)
const MUTACIONES = [
  { nombre: 'borrar un producto', chequeo: 'productos', tipo: 'categoria',
    aplicar: h => (productos(h).length >= 2 ? h.replace(productos(h)[1], '') : null) },
  { nombre: 'borrar una frase', chequeo: 'texto', tipo: 'categoria',
    aplicar: h => {
      const m = h.match(/<div class="producto__texto"><p>([^<]*?)([A-ZÁÉÍÓÚ][^.<]{40,}\.)/);
      return m ? h.replace(m[0], `<div class="producto__texto"><p>${m[1]}`) : null;
    } },
  { nombre: 'cambiar un número', chequeo: 'cifras', tipo: 'categoria',
    aplicar: h => enTextoDeProducto(h, /\b(\d{2,4})(\s?(?:mm|°C|ºC|W|V|bar|kW|mA)\b)/, (m, n, u) => `${Number(n) + 1}${u}`) },
  { nombre: 'cambiar una unidad', chequeo: 'cifras', tipo: 'categoria',
    aplicar: h => enTextoDeProducto(h, /(\d)(\s?)mm\b/, '$1$2cm') },
  { nombre: 'cambiar un modelo', chequeo: 'cifras', tipo: 'categoria',
    aplicar: h => enTextoDeProducto(h, /\b([A-Z]{2,}[- ]?\d*)(\d)\b/, (m, a, d) => `${a}${(Number(d) + 1) % 10}`) },
  { nombre: 'inventar un dato en la intro', chequeo: 'cifras', tipo: 'categoria',
    aplicar: h => (h.includes('<div class="entradilla"><p>') ? h.replace('<div class="entradilla"><p>', '<div class="entradilla"><p>Soporta hasta 9876 mm. ') : null) },
  { nombre: 'quitar un PDF', chequeo: 'pdf', tipo: 'conPdf',
    aplicar: h => {
      const main = h.match(/<main\b[\s\S]*<\/main>/)[0];
      const sinPdf = main.replace(/<a\b[^>]*href="\/docs\/[^"]+\.pdf"[^>]*>[\s\S]*?<\/a>/g, '');
      return sinPdf !== main ? h.replace(main, sinPdf) : null;
    } },
  { nombre: 'cambiar la ruta de una imagen', chequeo: 'imagenes', tipo: 'categoria',
    aplicar: h => {
      const a = productos(h).find(x => /<img src="\/images\//.test(x));
      if (!a) return null;
      const src = a.match(/<img src="([^"]+)"/)[1];
      return h.split(src).join(src.replace(/(\.\w+)$/, '-cambiada$1'));
    } },
];

// La auditoría completa de partida (en el modo pedido) se devuelve en «base»: auditoria-seo.js y build.js la usan
// como resultado, así que las mutaciones se comprueban ANTES de dar por buena la auditoría y sin repetirla.
function ejecutar({ modo = 'piloto' } = {}) {
  const base = auditar({ modo });
  const porUrl = new Map(base.filas.map(f => [f.url, f]));
  const inventario = L.leerCsv('docs/inventario-urls.csv');
  const plan = new Map(L.leerCsv('docs/plan-paginas.csv').map(f => [f.archivo, f]));
  const fs = require('fs');
  const path = require('path');
  const dist = path.join(L.RAIZ, 'dist');
  const leer = url => { const a = path.join(dist, archivoRel(url)); return fs.existsSync(a) ? fs.readFileSync(a, 'utf8') : null; };
  const candidatas = inventario.filter(f => f.estado === 'MANTENER' && /\.html$/.test(f.url)).map(f => {
    const archivo = new URL(f.url).pathname.slice(1);
    return { url: f.url, plantilla: plan.get(archivo)?.plantilla, fila: porUrl.get(f.url) };
  }).filter(c => c.fila && c.fila.checks && c.fila.checks.url?.estado === 'OK');

  const resultados = [];
  const fallos = [];
  for (const m of MUTACIONES) {
    // Página de prueba: la primera que hoy está bien en ese chequeo (si ya estuviera en ERROR, la prueba no demostraría nada)
    let elegida = null, mutado = null;
    for (const c of candidatas) {
      if (m.tipo === 'categoria' && c.plantilla !== 'categoria') continue;
      if (c.fila.checks[m.chequeo]?.estado === 'ERROR') continue;
      if (m.tipo === 'conPdf' && !/^[1-9]/.test(c.fila.checks.pdf?.texto || '')) continue;
      const html = leer(c.url);
      const x = html && m.aplicar(html);
      if (x && x !== html) { elegida = c; mutado = x; break; }
    }
    if (!elegida) { fallos.push(`«${m.nombre}»: no hay ninguna página en buen estado a la que aplicar la mutación`); continue; }
    const r = auditar({ modo: 'piloto', urls: [elegida.url], sobrescribir: { [archivoRel(elegida.url)]: mutado } }).filas[0];
    const ok = r.checks[m.chequeo]?.estado === 'ERROR';
    resultados.push({ mutacion: m.nombre, url: elegida.url, chequeo: m.chequeo, detectada: ok });
    if (!ok) fallos.push(`«${m.nombre}» en ${elegida.url}: el chequeo «${m.chequeo}» da ${r.checks[m.chequeo]?.estado || 'nada'}`);
  }

  // Redirección: se borra del .htaccess la regla de /contacto.html → la fila REDIRIGIR debe dar ERROR
  const htaccess = leer('https://brototermic.com/.htaccess') || '';
  const sinRegla = htaccess.replace(/^RewriteRule \^contacto\\\.html\$.*$/m, '# (regla borrada por la prueba)');
  const urlRed = 'https://brototermic.com/contacto.html';
  if (sinRegla === htaccess) fallos.push('«quitar una redirección»: no se encuentra la regla de /contacto.html en dist/.htaccess');
  else {
    const r = auditar({ modo: 'piloto', urls: [urlRed], sobrescribir: { '/.htaccess': sinRegla } }).filas[0];
    const ok = r.estado === 'ERROR';
    resultados.push({ mutacion: 'quitar una redirección del .htaccess', url: urlRed, chequeo: 'url', detectada: ok });
    if (!ok) fallos.push(`«quitar una redirección»: ${urlRed} da ${r.estado}`);
  }

  // Área de contenido antigua ilegible: debe ser ERROR, nunca «100 % conservado»
  const urlArea = candidatas.find(c => c.plantilla === 'categoria')?.url;
  if (urlArea) {
    const r = auditar({ modo: 'piloto', urls: [urlArea], sobrescribirLegacy: { [urlArea]: '<html><body><p>Página sin área de contenido</p></body></html>' } }).filas[0];
    const ok = r.checks.contenido?.estado === 'ERROR' && r.checks.texto?.estado === 'ERROR';
    resultados.push({ mutacion: 'página antigua sin área de contenido', url: urlArea, chequeo: 'contenido', detectada: ok });
    if (!ok) fallos.push(`«área de contenido vacía» en ${urlArea}: contenido ${r.checks.contenido?.estado}, texto ${r.checks.texto?.estado}`);
  }

  return { ok: fallos.length === 0, total: resultados.length, resultados, fallos, base };
}

module.exports = { ejecutar };

if (require.main === module) {
  const r = ejecutar();
  for (const x of r.resultados) console.log(`${x.detectada ? 'ok    ' : 'FALLO '} ${x.mutacion.padEnd(38)} → ${x.chequeo.padEnd(9)} ${x.url.replace('https://brototermic.com', '')}`);
  for (const f of r.fallos) console.log(`FALLO  ${f}`);
  console.log(`\n${r.total} mutaciones · ${r.fallos.length} fallo(s)${r.ok ? ': el auditor detecta todas.' : ': EL AUDITOR NO ES FIABLE.'}`);
  process.exitCode = r.ok ? 0 : 1;
}
