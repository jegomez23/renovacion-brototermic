#!/usr/bin/env node
// npm run validar: validación W3C en local (validador Nu, el mismo de validator.w3.org) de TODAS las páginas de /dist
// y de la hoja CSS, por tandas de 10. Sale con código 1 si hay algún error o advertencia.
//
// Necesita el validador Nu, que NO va en el repositorio (tools/vnu/ está en .gitignore). Se busca, por orden:
//   1. VNU_JAR = ruta a vnu.jar        → se ejecuta con «java -jar» (Java 11 o superior en el PATH, o JAVA = ruta a java)
//   2. tools/vnu/vnu.jar               → igual
//   3. tools/vnu/vnu-runtime-image/    → el paquete «vnu.windows.zip», que trae su propio Java (no hace falta instalarlo)
// Descarga: https://github.com/validator/validator/releases (vnu.jar_*.zip o vnu.windows.zip) y descomprimir en tools/vnu/.
// Ejecuta antes npm run build (valida lo que hay en /dist).
'use strict';
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const RAIZ = path.join(__dirname, '..');
const DIST = path.join(RAIZ, 'dist');
const VNU = path.join(__dirname, 'vnu');
const TANDA = 10;

function validador() {
  const jar = process.env.VNU_JAR || (fs.existsSync(path.join(VNU, 'vnu.jar')) ? path.join(VNU, 'vnu.jar') : null);
  if (jar) return { cmd: process.env.JAVA || 'java', base: ['-jar', jar], nombre: jar };
  const java = ['java.exe', 'java'].map(j => path.join(VNU, 'vnu-runtime-image', 'bin', j)).find(fs.existsSync);
  if (java) return { cmd: java, base: ['-m', 'vnu/nu.validator.client.SimpleCommandLineValidator'], nombre: 'tools/vnu/vnu-runtime-image' };
  return null;
}

const v = validador();
if (!v) {
  console.error('No se encuentra el validador Nu. Descarga vnu.jar (necesita Java) o vnu.windows.zip (trae su Java) de\n' +
    'https://github.com/validator/validator/releases y descomprímelo en tools/vnu/ (no se sube a git).');
  process.exit(1);
}
if (!fs.existsSync(DIST)) { console.error('No existe /dist: ejecuta antes npm run build.'); process.exit(1); }

const paginas = [];
(function recorrer(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) recorrer(p); else if (e.name.endsWith('.html')) paginas.push(path.relative(DIST, p));
  }
})(DIST);

console.log(`Validador: ${v.nombre}\n${paginas.length} páginas en tandas de ${TANDA} + la hoja CSS`);
let mensajes = 0;
const validar = (args, etiqueta) => {
  // stdin cerrado: el validador no se queda esperando entrada
  const r = spawnSync(v.cmd, [...v.base, '--format', 'gnu', ...args], { cwd: DIST, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  if (r.error) { console.error(`No se pudo ejecutar el validador: ${r.error.message}`); process.exit(1); }
  const salida = `${r.stdout}${r.stderr}`.trim();
  const n = salida ? salida.split('\n').length : 0;
  mensajes += n;
  console.log(`  ${etiqueta}: ${n ? `${n} mensaje(s)` : 'sin errores ni advertencias'}`);
  if (n) console.log(salida.split('\n').map(l => `    ${l}`).join('\n'));
};
for (let i = 0; i < paginas.length; i += TANDA) {
  validar(paginas.slice(i, i + TANDA), `tanda ${i / TANDA + 1} (${Math.min(TANDA, paginas.length - i)} páginas)`);
}
validar(['--css', path.join('assets', 'css', 'style.css')], 'assets/css/style.css');

console.log(mensajes ? `\n${mensajes} mensaje(s) del validador.` : `\nW3C: ${paginas.length} páginas y la hoja CSS sin errores ni advertencias.`);
process.exitCode = mensajes ? 1 : 0;
