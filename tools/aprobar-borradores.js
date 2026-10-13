#!/usr/bin/env node
// Quita la marca de borrador de las piezas aprobadas en la vista de revisión (tools/revision-borradores.js).
//
//   node tools/aprobar-borradores.js aprobadas.txt [--simular]
//
// aprobadas.txt es lo que da el botón «Exportar» de la vista: una línea por pieza, «APROBADA» o «PENDIENTE», un
// tabulador y el identificador (data/categorias/x.json, data/familias.json#id o content/x.html), y la nota si la hay.
// Solo toca las APROBADAS, y solo la marca: «"_borrador": true» en /data y «borrador: si» en la cabecera de /content.
// Con --simular dice qué cambiaría sin escribir nada. Después: npm run test, revisar el diff y commit.
// Sin dependencias: solo módulos nativos de Node.
'use strict';
const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..');
const [lista, opcion] = process.argv.slice(2);
if (!lista) { console.error('Uso: node tools/aprobar-borradores.js aprobadas.txt [--simular]'); process.exit(1); }
const simular = opcion === '--simular';

const aprobadas = fs.readFileSync(lista, 'utf8').split(/\r?\n/)
  .map(l => l.split('\t'))
  .filter(([estado, id]) => estado === 'APROBADA' && id)
  .map(([, id]) => id.trim());

const cambios = new Map(); // archivo → texto nuevo
const leer = archivo => cambios.get(archivo) ?? fs.readFileSync(path.join(RAIZ, archivo), 'utf8');
const errores = [];

for (const id of aprobadas) {
  const [archivo, familia] = id.split('#');
  if (!/^(data\/categorias\/[\w-]+\.json|data\/familias\.json|content\/[\w-]+\.html)$/.test(archivo) || !fs.existsSync(path.join(RAIZ, archivo))) {
    errores.push(`${id}: no es una pieza conocida`); continue;
  }
  let texto = leer(archivo);
  let nuevo = texto;
  if (archivo.startsWith('content/')) {
    nuevo = texto.replace(/^(<!--[\s\S]*?)^[ \t]*borrador:[ \t]*si[ \t]*\r?\n([\s\S]*?-->)/m, '$1$2');
  } else if (familia) {
    // El objeto de esa familia: desde su «"id": "…"» hasta el «"id"» siguiente
    const ini = texto.indexOf(`"id": "${familia}"`);
    if (ini === -1) { errores.push(`${id}: no existe esa familia`); continue; }
    const sig = texto.indexOf('"id": "', ini + 1);
    const tramo = texto.slice(ini, sig === -1 ? undefined : sig);
    nuevo = texto.slice(0, ini) + tramo.replace(/\r?\n[ \t]*"_borrador": true,/, '') + (sig === -1 ? '' : texto.slice(sig));
  } else {
    nuevo = texto.replace(/,(\r?\n[ \t]*)"_borrador": true(\r?\n)/, '$2').replace(/\r?\n[ \t]*"_borrador": true,/, '');
  }
  if (nuevo === texto) { errores.push(`${id}: no tiene marca de borrador (¿ya estaba aprobada?)`); continue; }
  if (archivo.endsWith('.json')) {
    try { JSON.parse(nuevo); } catch (e) { errores.push(`${id}: el JSON quedaría roto (${e.message}); no se toca`); continue; }
  }
  cambios.set(archivo, nuevo);
  console.log(`${simular ? '(simulación) ' : ''}aprobada: ${id}`);
}

if (!simular) for (const [archivo, texto] of cambios) fs.writeFileSync(path.join(RAIZ, archivo), texto);
for (const e of errores) console.error(`AVISO  ${e}`);
console.log(`\n${aprobadas.length - errores.length} de ${aprobadas.length} aprobadas${simular ? ' (nada escrito)' : ''}. Ahora: npm run test y revisa el diff antes del commit.`);
process.exitCode = errores.length ? 1 : 0;
