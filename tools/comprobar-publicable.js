#!/usr/bin/env node
// ¿Contiene /dist (y /dist-es) SOLO lo que se puede subir al servidor?
//
//   node tools/comprobar-publicable.js
//
// Al hosting se sube ÚNICAMENTE el contenido de /dist (docroot del .com) y de /dist-es (docroot del .es). Nunca
// /legacy, /docs (salvo sus PDF, que build.js copia a /dist/docs), /tools, /data, /src, .git ni archivos .md o .csv.
// Este comprobador usa una LISTA BLANCA: solo acepta las rutas que la web necesita; cualquier otra cosa es un error,
// aunque no se haya previsto (una copia de seguridad, un .json de datos, un config.php con contraseñas…).
// build.js lo ejecuta al final de cada build (error en cualquier modo). Sale con código 1 si algo sobra.
// Sin dependencias: solo módulos nativos de Node.
'use strict';
const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..');

// Rutas permitidas en cada docroot (relativas, con «/»)
const PERMITIDO = {
  dist: [
    /^\.htaccess$/,
    /^(sitemap\.xml|robots\.txt)$/,
    /^[\w-]+\.html$/,                                   // páginas de la raíz (y 404.html)
    /^contacto\/(contacto|gracias|error)\.html$/,
    /^contacto\/enviar\.php$/,                          // el ÚNICO PHP que se publica (AGENTS.md §2)
    /^oviedo\/index\.html$/,
    /^assets\/css\/[\w.-]+\.css$/,
    /^assets\/js\/[\w.-]+\.js$/,
    /^assets\/fonts\/([\w.-]+\.woff2|OFL\.txt)$/,
    /^images\/.+\.(jpe?g|png|gif|webp|svg|ico)$/i,      // incluye nombres antiguos con ñ, espacios o mayúsculas
    /^oviedo\/images\/.+\.(jpe?g|png|gif|webp|svg|ico)$/i,
    /^docs\/[^/]+\.pdf$/,
  ],
  'dist-es': [/^\.htaccess$/],
};

// Motivo legible de lo más peligroso (el resto: «no está en la lista de lo publicable»)
function motivo(rel) {
  if (/(^|\/)\.git(\/|$)/.test(rel)) return 'carpeta .git: expondría todo el historial del repositorio';
  if (/(^|\/)(legacy|tools|data|src|node_modules)\//.test(rel)) return 'carpeta del repositorio que no se publica';
  if (/\.(md|csv)$/i.test(rel)) return 'documento de planificación (.md/.csv): no se publica';
  if (/\.json$/i.test(rel)) return 'archivo de datos .json: no se publica';
  if (/config[\w.-]*\.php$|\.example\.php$/i.test(rel)) return 'configuración PHP: vive fuera del docroot del servidor, nunca en /dist';
  if (/\.php$/i.test(rel)) return 'PHP no permitido: el único script publicable es contacto/enviar.php';
  if (/\.(env|log|bak|old|orig|swp|zip|tar|gz|sql|sh|key|pem)$|(^|\/)\.env/i.test(rel)) return 'archivo sensible o de copia de seguridad';
  if (/(^|\/)\.[^/]+$/.test(rel)) return 'archivo oculto: solo se publica .htaccess';
  if (/^docs\//.test(rel)) return 'en /docs solo se publican PDF';
  return 'no está en la lista de lo publicable (tools/comprobar-publicable.js)';
}

function recorrer(dir, base = dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    const rel = path.relative(base, p).split(path.sep).join('/');
    if (e.isDirectory()) {
      if (/^\.git$|^(legacy|tools|data|src|node_modules)$/.test(e.name)) { out.push(rel + '/'); continue; }
      recorrer(p, base, out);
    } else out.push(rel);
  }
  return out;
}

// Devuelve la lista de problemas de los docroots que existan
function comprobar() {
  const problemas = [];
  let archivos = 0;
  for (const [carpeta, reglas] of Object.entries(PERMITIDO)) {
    const dir = path.join(RAIZ, carpeta);
    if (!fs.existsSync(dir)) { problemas.push(`/${carpeta} no existe (¿se ha ejecutado node build.js?)`); continue; }
    for (const rel of recorrer(dir)) {
      archivos++;
      if (!rel.endsWith('/') && reglas.some(r => r.test(rel))) continue;
      problemas.push(`${carpeta}/${rel}: ${motivo(rel)}`);
    }
  }
  return { problemas, archivos };
}

module.exports = { comprobar };

if (require.main === module) {
  const { problemas, archivos } = comprobar();
  if (problemas.length) {
    console.log(`${problemas.length} archivo(s) que NO se pueden subir al servidor:`);
    problemas.forEach(p => console.log(`  ERROR  ${p}`));
    process.exitCode = 1;
  } else console.log(`/dist y /dist-es: ${archivos} archivos, todos publicables.`);
}
