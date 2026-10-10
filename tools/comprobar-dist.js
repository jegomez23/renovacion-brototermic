#!/usr/bin/env node
// Comprobaciones de /dist antes de publicar (checklist-publicacion.md y docs/publicacion.md):
//   1. sitemap.xml: solo URLs canónicas, sin redirecciones, y cada una responde 200
//   2. robots.txt: permite rastrear y declara el sitemap
//   3. canonical: exactamente uno por página, absoluto y igual a su URL (la 404, ninguno y con noindex)
//   4. 404.html: noindex, sin canonical y fuera del sitemap
//   5. páginas huérfanas: cada página del plan recibe al menos un enlace desde OTRA página
//
//   node tools/servir.js              (en otra terminal: las peticiones 200 se hacen contra él)
//   node tools/comprobar-dist.js      BASE=http://localhost:8000 por defecto
//
// Sale con código 1 si algo falla. Sin dependencias: solo módulos nativos de Node ≥ 18.
'use strict';
const fs = require('fs');
const path = require('path');
const L = require('./lib/legacy');

const DIST = path.join(L.RAIZ, 'dist');
const BASE = process.env.BASE || 'http://localhost:8000';
const fallos = [];
const falla = m => fallos.push(m);
const rutaPublica = archivo => '/' + archivo.replace(/(^|\/)index\.html$/, '$1');
const archivoDe = ruta => path.join(DIST, decodeURIComponent(ruta.endsWith('/') ? `${ruta}index.html` : ruta));

const plan = L.leerCsv('docs/plan-paginas.csv');
const rutasPlan = plan.map(f => rutaPublica(f.archivo));
const origenes301 = new Set(L.leerCsv('docs/redirecciones.csv').filter(r => r.tipo === '301')
  .map(r => r.origen.replace(/^\*:\/\/\(www\.\)/, 'https://')).filter(u => !u.endsWith('*')));

async function main() {
  // ---------- 1. sitemap.xml ----------
  const sitemap = fs.readFileSync(path.join(DIST, 'sitemap.xml'), 'utf8');
  const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => L.decodificar(m[1]));
  const estados = {};
  for (const loc of locs) {
    const u = new URL(loc);
    if (u.origin !== L.HOST) falla(`sitemap: ${loc} no es del host canónico ${L.HOST}`);
    if (/\/index\.html$/.test(u.pathname) || u.search) falla(`sitemap: ${loc} no es canónica (index.html o parámetros)`);
    if (origenes301.has(decodeURI(loc))) falla(`sitemap: ${loc} es el origen de una 301`);
    if (!fs.existsSync(archivoDe(u.pathname))) falla(`sitemap: ${loc} no existe en /dist`);
    if (/\.html$|\/$/.test(u.pathname)) {
      const html = fs.readFileSync(archivoDe(u.pathname), 'utf8');
      const can = (html.match(/<link rel="canonical" href="([^"]+)"/) || [])[1];
      if (can !== loc && can !== encodeURI(loc)) falla(`sitemap: ${loc} tiene canonical ${can}`);
    }
    try {
      const r = await fetch(BASE + u.pathname, { method: 'HEAD', redirect: 'manual' });
      estados[r.status] = (estados[r.status] || 0) + 1;
      if (r.status !== 200) falla(`sitemap: ${loc} responde ${r.status} en ${BASE}`);
    } catch (e) {
      falla(`sitemap: no se puede pedir ${BASE}${u.pathname} (¿está arrancado node tools/servir.js?)`);
      break;
    }
  }
  const paginasSitemap = locs.filter(l => !l.endsWith('.pdf'));
  const faltanEnSitemap = rutasPlan.filter(r => !paginasSitemap.includes(`${L.HOST}${r}`));
  faltanEnSitemap.forEach(r => falla(`sitemap: falta la página del plan ${r}`));
  console.log(`1. sitemap.xml: ${locs.length} URLs (${paginasSitemap.length} páginas + ${locs.length - paginasSitemap.length} PDF) · respuestas: ${Object.entries(estados).map(([c, n]) => `${n} × ${c}`).join(', ')}`);

  // ---------- 2. robots.txt ----------
  const robots = fs.readFileSync(path.join(DIST, 'robots.txt'), 'utf8');
  if (!/^User-agent: \*$/m.test(robots)) falla('robots.txt: falta «User-agent: *»');
  if (/^Disallow: \/\s*$/m.test(robots)) falla('robots.txt: bloquea toda la web');
  if (!robots.includes(`Sitemap: ${L.HOST}/sitemap.xml`)) falla('robots.txt: falta la línea Sitemap');
  console.log(`2. robots.txt:\n${robots.trim().split('\n').map(l => `     ${l}`).join('\n')}`);

  // ---------- 3. canonical en todas las páginas ----------
  const paginas = [];
  (function recorrer(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) recorrer(p);
      else if (e.name.endsWith('.html')) paginas.push('/' + path.relative(DIST, p).split(path.sep).join('/'));
    }
  })(DIST);
  let conCanonical = 0;
  for (const archivo of paginas) {
    const html = fs.readFileSync(path.join(DIST, archivo), 'utf8');
    const cans = [...html.matchAll(/<link rel="canonical" href="([^"]+)"/g)].map(m => m[1]);
    if (archivo === '/404.html') continue;
    const esperado = `${L.HOST}${archivo.replace(/(^|\/)index\.html$/, '$1')}`;
    if (cans.length !== 1) falla(`canonical: ${archivo} tiene ${cans.length}`);
    else if (cans[0] !== esperado) falla(`canonical: ${archivo} → ${cans[0]} (esperado ${esperado})`);
    else conCanonical++;
    if (/<meta name="robots" content="[^"]*noindex/.test(html)) falla(`${archivo}: tiene noindex`);
  }
  console.log(`3. canonical: ${conCanonical} de ${paginas.length - 1} páginas indexables con un canonical absoluto igual a su URL`);

  // ---------- 4. 404.html ----------
  const p404 = path.join(DIST, '404.html');
  if (!fs.existsSync(p404)) falla('404.html: no existe');
  else {
    const h = fs.readFileSync(p404, 'utf8');
    const noindex = /<meta name="robots" content="noindex">/.test(h);
    const canonical = /rel="canonical"/.test(h);
    const enSitemap = sitemap.includes('404');
    if (!noindex) falla('404.html: falta <meta name="robots" content="noindex">');
    if (canonical) falla('404.html: no debe llevar canonical');
    if (enSitemap) falla('404.html: está en el sitemap');
    const htaccess = fs.existsSync(path.join(DIST, '.htaccess')) ? fs.readFileSync(path.join(DIST, '.htaccess'), 'utf8') : '';
    if (!/^ErrorDocument 404 \/404\.html$/m.test(htaccess)) falla('.htaccess: falta «ErrorDocument 404 /404.html»');
    console.log(`4. 404.html: noindex ${noindex ? 'sí' : 'NO'} · canonical ${canonical ? 'SÍ' : 'no'} · en sitemap ${enSitemap ? 'SÍ' : 'no'} · ErrorDocument en .htaccess ${/ErrorDocument 404 \/404\.html/.test(htaccess) ? 'sí' : 'NO'}`);
  }

  // ---------- 5. páginas huérfanas ----------
  const entrantes = new Map(rutasPlan.map(r => [r, new Set()]));
  for (const archivo of paginas) {
    if (archivo === '/404.html') continue; // un enlace desde la 404 no cuenta: nadie llega a ella navegando
    const desde = archivo.replace(/(^|\/)index\.html$/, '$1');
    const html = fs.readFileSync(path.join(DIST, archivo), 'utf8');
    for (const m of html.matchAll(/\shref="(\/[^"#?]*)/g)) {
      const destino = decodeURI(m[1]);
      if (destino !== desde && entrantes.has(destino)) entrantes.get(destino).add(desde);
    }
  }
  const huerfanas = [...entrantes].filter(([, s]) => s.size === 0).map(([r]) => r);
  huerfanas.forEach(r => falla(`huérfana: ${r} no recibe enlaces de ninguna otra página`));
  const minimo = Math.min(...[...entrantes.values()].map(s => s.size));
  console.log(`5. páginas huérfanas: ${huerfanas.length} (la página menos enlazada recibe enlaces desde ${minimo} páginas)`);

  console.log(fallos.length ? `\n${fallos.length} fallo(s):\n${fallos.map(f => `  FALLO  ${f}`).join('\n')}` : '\nTodo correcto.');
  process.exitCode = fallos.length ? 1 : 0;
}
main();
