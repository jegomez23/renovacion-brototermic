#!/usr/bin/env node
// Regresión contra Apache REAL ya arrancado: HTTP y HTTPS, All y FileInfo (ejecutar por separado).
// Nunca conecta a producción: socket fijo en 127.0.0.1, Host/SNI del dominio y certificado local autofirmado.
// Sin PHP ni envíos de formulario. Sin dependencias. Véase apache-pruebas/README.md.
'use strict';
const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const crypto = require('crypto');
const { leerCsv } = require('./lib/legacy.js');

const RAIZ = path.join(__dirname, '..');
const puertos = { 'http:': Number(process.env.PUERTO_HTTP || 8080), 'https:': Number(process.env.PUERTO_HTTPS || 8443) };
const hosts = ['brototermic.com', 'www.brototermic.com', 'brototermic.es', 'www.brototermic.es'];
const resultados = [];
const codificar = url => url.includes('%') ? url : encodeURI(url);

async function comprobar(url, estado, location, opciones = {}) {
  const u = new URL(codificar(url));
  if (!hosts.includes(u.hostname) || !puertos[u.protocol] || u.port || u.username || u.password) {
    throw new Error(`URL de prueba no admitida: ${url}`);
  }
  const r = await new Promise((resolve, reject) => {
    const req = (u.protocol === 'https:' ? https : http).request({
      hostname: '127.0.0.1', port: puertos[u.protocol], path: u.pathname + u.search,
      servername: u.hostname, rejectUnauthorized: false,
      method: opciones.method || 'GET', headers: { Host: u.hostname, ...opciones.headers },
    }, res => {
      const hash = crypto.createHash('sha256');
      let muestra = '';
      res.on('data', chunk => { hash.update(chunk); if (muestra.length < 8192) muestra += chunk.toString('utf8'); });
      res.on('end', () => resolve({ estado: res.statusCode, headers: res.headers, muestra, hash: hash.digest('hex') }));
      res.on('error', reject);
    });
    req.setTimeout(10000, () => req.destroy(new Error('Tiempo de espera agotado en Apache local')));
    req.on('error', reject);
    req.end();
  });
  const errores = [];
  if (r.estado !== estado) errores.push(`HTTP ${r.estado}; esperado ${estado}`);
  if ((r.headers.location || '') !== (location ? codificar(location) : '')) errores.push(`Location inesperada: ${r.headers.location || '(ninguna)'}`);
  if (opciones.cache && r.headers['cache-control'] !== opciones.cache) errores.push(`Cache-Control: ${r.headers['cache-control'] || '(ninguna)'}`);
  if (opciones.mime && ![].concat(opciones.mime).some(m => (r.headers['content-type'] || '').startsWith(m))) errores.push('Tipo MIME incorrecto');
  if (opciones.archivo && r.hash !== crypto.createHash('sha256').update(fs.readFileSync(opciones.archivo)).digest('hex')) errores.push('Contenido distinto del archivo generado');
  if (opciones.errorPropio && (!/noindex/i.test(r.muestra) || !r.muestra.includes('BROTOTERMIC'))) errores.push('No se conserva la página 404 propia');
  if (opciones.seguridad) {
    for (const [h, valor] of Object.entries({
      'x-content-type-options': 'nosniff', 'x-frame-options': 'SAMEORIGIN',
      'referrer-policy': 'strict-origin-when-cross-origin', 'strict-transport-security': 'max-age=300',
    })) if (r.headers[h] !== valor) errores.push(`Cabecera ${h} incorrecta`);
    if (!r.headers['permissions-policy'] || !r.headers['content-security-policy-report-only']) errores.push('Faltan Permissions-Policy o CSP Report-Only');
  }
  if (opciones.gzip && r.headers['content-encoding'] !== 'gzip') errores.push('Falta compresión gzip');
  resultados.push({ url: u.href, method: opciones.method || 'GET', estado: r.estado, headers: r.headers, errores });
  return r;
}

async function redireccion(url, destino, estadoFinal = 200) {
  await comprobar(url, 301, destino);
  // Se pide el destino esperado por otro socket local. No se sigue una Location arbitraria ni una cadena.
  await comprobar(destino, estadoFinal);
}

async function main() {
  if (Object.values(puertos).some(p => !Number.isInteger(p) || p < 1 || p > 65535)) throw new Error('Puerto inválido');
  const inventario = leerCsv('docs/inventario-urls.csv');
  // Los destinos efectivos vienen de redirecciones.csv. El inventario conserva marcas de confirmación
  // comercial de dos catálogos; comprobar la ruta no aprueba su vigencia ni elimina esas marcas.
  const destinos = new Map();
  for (const fila of leerCsv('docs/redirecciones.csv')) {
    const m = fila.origen.match(/^\*:\/\/\(www\.\)([^/]+)(\/.*)$/);
    if (m && fila.tipo === '301' && !m[2].endsWith('/*')) destinos.set(m[1] + m[2], fila.destino);
  }
  for (const fila of inventario) {
    const u = new URL(codificar(fila.url));
    for (const protocolo of ['http:', 'https:']) for (const www of ['', 'www.']) {
      const host = www + u.hostname.replace(/^www\./, '');
      const url = `${protocolo}//${host}${u.pathname}${u.search}`;
      if (fila.estado === 'REDIRIGIR') {
        const destino = destinos.get(u.hostname.replace(/^www\./, '') + u.pathname);
        if (!destino) throw new Error(`Falta destino en redirecciones.csv: ${fila.url}`);
        await redireccion(url, destino);
      }
      else if (protocolo === 'http:' || www) await redireccion(url, `https://brototermic.com${u.pathname}${u.search}`);
      else await comprobar(url, 200);
    }
  }
  for (const host of hosts) for (const protocolo of ['http:', 'https:']) {
    const es = host.endsWith('.es');
    const base = `${protocolo}//${host}`;
    for (const ruta of ['/.git/HEAD', '/.env', '/index.html.bak', '/backup.sql', '/empresa.html~']) {
      await comprobar(base + ruta, 404, null, { errorPropio: !es, seguridad: !es });
    }
    for (const ruta of ['/no-existe-apache.html', '/images/', '/docs/', '/assets/']) {
      if (es || (protocolo === 'https:' && host === 'brototermic.com')) {
        await comprobar(base + ruta, 404, null, { errorPropio: !es });
      } else await redireccion(base + ruta, `https://brototermic.com${ruta}`, 404);
    }
  }
  const recursos = [
    ['/assets/css/style.css?v=prueba', 'text/css', 'public, max-age=31536000, immutable'],
    ['/assets/js/menu.js?v=prueba', ['text/javascript', 'application/javascript'], 'public, max-age=31536000, immutable'],
    ['/assets/fonts/lora-400.woff2', 'font/woff2', 'public, max-age=31536000, immutable'],
    ['/images/slide-1.jpg', 'image/jpeg', 'public, max-age=2592000'],
    ['/images/logo-claro.png', 'image/png', 'public, max-age=2592000'],
    ['/sitemap.xml', 'application/xml', 'public, max-age=3600'],
    ['/robots.txt', 'text/plain', 'public, max-age=3600'],
    ['/', 'text/html', 'no-cache'],
    ['/oviedo/', 'text/html', 'no-cache'],
  ];
  for (const ruta of fs.readdirSync(path.join(RAIZ, 'dist/docs')).filter(n => n.endsWith('.pdf'))) {
    recursos.push(['/docs/' + encodeURIComponent(ruta), 'application/pdf', 'public, max-age=2592000']);
  }
  for (const [ruta, mime, cache] of recursos) {
    await comprobar('https://brototermic.com' + ruta, 200, null, { mime, cache, seguridad: true });
  }
  const pdf = path.join(RAIZ, 'dist/docs/catalogo_cañas_pirometricas_broto-03-02-2015.pdf');
  // D-020: no basta un 200 en macOS; comprobar también bytes, MIME y caché tras la reescritura.
  const { aliases, catalogo, contacto } = require('./test-rutas-historicas');
  for (const [alias, destino] of [...aliases, [catalogo, catalogo]]) {
    await comprobar('https://brototermic.com/' + encodeURI(alias), 200, null, {
      archivo: path.join(RAIZ, 'dist', destino), mime: /\.pdf$/i.test(alias) ? 'application/pdf' : 'image/jpeg',
      cache: 'public, max-age=2592000', seguridad: true,
    });
  }
  await redireccion('http://www.brototermic.com/' + contacto + '?origen=prueba%20local', 'https://brototermic.com/oviedo/?origen=prueba%20local');
  for (const ruta of ['/docs/catalogo_ca%F1as_pirometricas_broto-03-02-2015.pdf', '/docs/catalogo_ca%C3%B1as_pirometricas_broto-03-02-2015.pdf']) {
    await redireccion('http://www.brototermic.com' + ruta + '?origen=prueba%20local', 'https://brototermic.com' + ruta + '?origen=prueba%20local');
    await comprobar('https://brototermic.com' + ruta, 200, null, { archivo: pdf, cache: 'public, max-age=2592000' });
  }
  await redireccion('http://www.brototermic.com/resistencias-inmersion.html?producto=NA%20OV', 'https://brototermic.com/resistencias-inmersion.html?producto=NA%20OV');
  await comprobar('https://brototermic.com/404.html', 200, null, { cache: 'no-cache' });
  await redireccion('http://brototermic.com/404.html', 'https://brototermic.com/404.html');
  await comprobar('https://brototermic.com/assets/css/style.css', 200, null, { method: 'HEAD', cache: 'public, max-age=31536000, immutable' });
  await comprobar('https://brototermic.com/assets/css/style.css', 200, null, { headers: { 'Accept-Encoding': 'gzip' }, gzip: true });
  const fallos = resultados.filter(r => r.errores.length);
  if (process.env.RESULTADOS_APACHE) fs.writeFileSync(process.env.RESULTADOS_APACHE, JSON.stringify(resultados, null, 2) + '\n');
  console.log(`${resultados.length} solicitudes Apache: ${resultados.length - fallos.length} correctas, ${fallos.length} incorrectas. Inventario: ${inventario.length} URLs.`);
  for (const r of fallos.slice(0, 15)) console.error(`${r.url}: ${r.errores.join('; ')}`);
  process.exitCode = fallos.length ? 1 : 0;
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
