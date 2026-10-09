#!/usr/bin/env node
// Servidor local para ver /dist en el navegador: node tools/servir.js [puerto]   (por defecto 8000)
// Solo para desarrollo: no aplica el .htaccess (para eso está tools/apache-pruebas/).
// Hace falta porque las rutas del HTML son absolutas (/assets/…) y con file:// no funcionan.
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');

const DIST = path.join(__dirname, '..', 'dist');
const PUERTO = Number(process.argv[2]) || 8000;
const TIPOS = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.pdf': 'application/pdf',
};

http.createServer((req, res) => {
  let ruta;
  try { ruta = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch { res.writeHead(400).end('Petición no válida'); return; }
  if (ruta.endsWith('/')) ruta += 'index.html';
  const archivo = path.join(DIST, ruta);
  if (!archivo.startsWith(DIST)) { res.writeHead(403).end(); return; } // nada fuera de /dist
  fs.readFile(archivo, (err, datos) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end(`404: ${ruta}`);
      return;
    }
    res.writeHead(200, { 'Content-Type': TIPOS[path.extname(archivo).toLowerCase()] || 'application/octet-stream' });
    res.end(datos);
  });
}).listen(PUERTO, () => console.log(`Sirviendo /dist en http://localhost:${PUERTO}/  (Ctrl+C para parar)`));
