#!/usr/bin/env node
// npm run test: todas las comprobaciones automáticas, en orden. Sale con código 1 si falla alguna.
//   1. build.js (modo piloto): genera /dist y /dist-es tal como están hoy los datos
//   2. tools/auditoria-seo.js --modo=publicacion: pruebas de mutación (test-auditor) + auditor de paridad SEO
//      (escribe docs/auditoria-seo.md; los AVISOS no fallan, los ERRORES sí)
//   3. tools/comprobar-dist.js: sitemap con 200, robots, canonical, noindex y huérfanas (con un servidor local propio)
//   4. tools/comprobar-publicable.js: /dist y /dist-es solo contienen lo que se puede subir
// No incluye la validación W3C (npm run validar: necesita Java) ni el build de publicación (hoy falla a propósito
// por los borradores: npm run build:publicacion).
'use strict';
const path = require('path');
const { spawn } = require('child_process');
const { servir } = require('./servir.js');

const RAIZ = path.join(__dirname, '..');
const PUERTO_PRUEBA = 8765;

// Asíncrono (no spawnSync): mientras comprobar-dist hace sus peticiones, el servidor de este proceso debe poder responder
const node = (args, env = {}) => new Promise(resolver => {
  spawn(process.execPath, args, { cwd: RAIZ, stdio: 'inherit', env: { ...process.env, ...env } }).on('close', resolver);
});

async function main() {
  const pasos = [
    ['1. build (modo piloto)', () => node(['build.js'])],
    ['2. test-auditor + auditor SEO (modo publicación)', () => node(['tools/auditoria-seo.js', '--modo=publicacion'])],
    ['3. comprobar-dist', async () => {
      const servidor = await new Promise(r => servir(PUERTO_PRUEBA, r));
      const codigo = await node(['tools/comprobar-dist.js'], { BASE: `http://localhost:${PUERTO_PRUEBA}` });
      servidor.close();
      return codigo;
    }],
    ['4. comprobar-publicable', () => node(['tools/comprobar-publicable.js'])],
  ];
  const resultados = [];
  for (const [nombre, fn] of pasos) {
    console.log(`\n=== ${nombre} ===`);
    resultados.push([nombre, (await fn()) === 0]);
  }
  console.log('\n=== Resumen de npm run test ===');
  for (const [nombre, ok] of resultados) console.log(`${ok ? 'ok    ' : 'FALLO '} ${nombre}`);
  const fallos = resultados.filter(([, ok]) => !ok).length;
  console.log(fallos ? `\n${fallos} comprobación(es) con fallos.` : '\nTodo correcto.');
  process.exitCode = fallos ? 1 : 0;
}
main();
