#!/usr/bin/env node
// Servidor local para ver /dist en el navegador: node tools/servir.js [puerto]   (por defecto 8000)
// Solo para desarrollo: no aplica el .htaccess (para eso está tools/apache-pruebas/) ni ejecuta PHP.
// Hace falta porque las rutas del HTML son absolutas (/assets/…) y con file:// no funcionan.
// También lo usan tools/dev.js (npm run dev) y tools/test.js (npm run test).
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');

const DIST = path.join(__dirname, '..', 'dist');
const TIPOS = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.gif': 'image/gif', '.webp': 'image/webp',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.pdf': 'application/pdf',
};

// Devuelve el servidor ya escuchando. Solo en 127.0.0.1: no se expone a la red local.
function servir(puerto = 8000, alEscuchar = () => {}) {
  const servidor = http.createServer((req, res) => {
    let ruta;
    try { ruta = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
    catch { res.writeHead(400).end('Petición no válida'); return; }
    if (ruta.endsWith('/')) ruta += 'index.html';
    const archivo = path.join(DIST, ruta);
    // Nada fuera de /dist (tampoco carpetas hermanas como «dist-old»: se compara con «dist» + separador)
    if (!archivo.startsWith(DIST + path.sep)) { res.writeHead(403).end(); return; }
    fs.readFile(archivo, (err, datos) => {
      if (err) {
        // Como Apache con ErrorDocument: la 404 propia, con código 404
        fs.readFile(path.join(DIST, '404.html'), (e2, html) => {
          res.writeHead(404, { 'Content-Type': e2 ? 'text/plain; charset=utf-8' : TIPOS['.html'] }).end(e2 ? `404: ${ruta}` : html);
        });
        return;
      }
      res.writeHead(200, { 'Content-Type': TIPOS[path.extname(archivo).toLowerCase()] || 'application/octet-stream' });
      res.end(datos);
    });
  });
  servidor.listen(puerto, '127.0.0.1', () => alEscuchar(servidor));
  return servidor;
}

module.exports = { servir };

if (require.main === module) {
  const puerto = Number(process.argv[2]) || 8000;
  servir(puerto, () => console.log(`Sirviendo /dist en http://localhost:${puerto}/  (Ctrl+C para parar)`));
}
