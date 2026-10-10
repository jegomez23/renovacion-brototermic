#!/usr/bin/env node
// npm run dev: build en modo piloto + servidor local en http://localhost:8000 + reconstrucción automática.
//
// - El primer build es completo (con las pruebas de mutación y la auditoría SEO: unos 20 s).
// - Al guardar un cambio en /src, /data, /content, /assets o /images se reconstruye con «--sin-auditoria»
//   (pocos segundos). La auditoría completa la pasa npm run test, y es obligatoria en npm run build:publicacion.
// - Varios cambios seguidos (guardar varios archivos) se agrupan: se espera 400 ms sin cambios antes de reconstruir,
//   y si llega un cambio durante un build, se hace otro al terminar (nunca dos a la vez).
// Sin dependencias: fs.watch (recursivo en Windows y macOS; en Linux, Node ≥ 20) y child_process.
'use strict';
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { servir } = require('./servir.js');

const RAIZ = path.join(__dirname, '..');
const PUERTO = Number(process.env.PUERTO) || 8000;
const CARPETAS = ['src', 'data', 'content', 'assets', 'images'];
const ESPERA_MS = 400;

let construyendo = false, pendiente = false, temporizador = null;
const hora = () => new Date().toLocaleTimeString('es-ES');

function build(completo) {
  construyendo = true;
  const args = ['build.js', ...(completo ? [] : ['--sin-auditoria'])];
  console.log(`\n[${hora()}] ${completo ? 'Build completo (con auditoría SEO)…' : 'Reconstruyendo…'}`);
  const inicio = Date.now();
  // Se muestra la salida del build tal cual: avisos, errores y resumen
  const p = spawn(process.execPath, args, { cwd: RAIZ, stdio: 'inherit' });
  p.on('close', codigo => {
    construyendo = false;
    console.log(`[${hora()}] ${codigo === 0 ? 'Listo' : 'El build ha terminado CON ERRORES (ver arriba)'} en ${((Date.now() - inicio) / 1000).toFixed(1)} s · http://localhost:${PUERTO}/`);
    if (pendiente) { pendiente = false; build(false); }
  });
}

function alCambiar(carpeta, archivo) {
  if (!archivo || /(^|[\\/])\.|~$|\.tmp$|\.swp$/.test(archivo)) return; // temporales de editores
  clearTimeout(temporizador);
  temporizador = setTimeout(() => {
    console.log(`[${hora()}] Cambio en ${carpeta}/${String(archivo).split(path.sep).join('/')}`);
    if (construyendo) pendiente = true; else build(false);
  }, ESPERA_MS);
}

for (const c of CARPETAS) {
  const dir = path.join(RAIZ, c);
  if (!fs.existsSync(dir)) continue;
  fs.watch(dir, { recursive: true }, (evento, archivo) => alCambiar(c, archivo));
}

servir(PUERTO, () => {
  console.log(`Web en http://localhost:${PUERTO}/  (Ctrl+C para parar)`);
  console.log(`Vigilando: ${CARPETAS.map(c => `/${c}`).join(', ')}`);
  build(true);
}).on('error', e => {
  console.error(e.code === 'EADDRINUSE'
    ? `El puerto ${PUERTO} está ocupado: cierra el otro servidor o usa otro puerto (PowerShell: $env:PUERTO=8001; npm run dev)`
    : e.message);
  process.exit(1);
});
