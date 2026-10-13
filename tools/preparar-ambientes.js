#!/usr/bin/env node
// Derivadas reales de las imágenes ya generadas: macOS sips + cwebp, sin npm.
// node tools/preparar-ambientes.js /ruta/a/fuentes
'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const { spawnSync } = require('child_process');
const raiz = path.join(__dirname, '..');
const receta = path.join(__dirname, 'datos', 'ambientes-ia.json');
const fuentes = process.argv[2];
if (!fuentes) throw Error('Indica la carpeta con los PNG fuente de imagegen');
const datos = JSON.parse(fs.readFileSync(receta, 'utf8'));
const temporal = fs.mkdtempSync(path.join(os.tmpdir(), 'broto-ambientes-'));
function ejecutar(cmd, args) {
  const r = spawnSync(cmd, args, { encoding: 'utf8' });
  if (r.status !== 0) throw Error(`${cmd}: ${r.stderr || r.stdout || r.error}`);
}
const sha = archivo => crypto.createHash('sha256').update(fs.readFileSync(archivo)).digest('hex');
for (const item of datos.imagenes) {
  const origen = path.join(fuentes, item.fuente);
  const png = fs.readFileSync(origen);
  if (png.toString('ascii', 1, 4) !== 'PNG') throw Error('Fuente no PNG');
  item.fuenteSHA256 = sha(origen);
  item.fuenteMedidas = { ancho: png.readUInt32BE(16), alto: png.readUInt32BE(20) };
  const preparado = path.join(temporal, `${item.nombre}.png`);
  if (item.recorte) {
    const c = item.recorte;
    const cropWebp = preparado.replace(/\.png$/, '.webp');
    ejecutar('cwebp', ['-quiet', '-lossless', '-crop', String(c.x), String(c.y), String(c.ancho), String(c.alto), origen, '-o', cropWebp]);
    ejecutar('dwebp', [cropWebp, '-o', preparado]);
  } else fs.copyFileSync(origen, preparado);
  const medidas = item.recorte || item.fuenteMedidas;
  item.variantes = [];
  for (const ancho of [480, 960, 1280]) {
    if (ancho > medidas.ancho) throw Error('No se permite ampliar');
    const alto = Math.round(ancho * medidas.alto / medidas.ancho);
    const jpg = path.join(raiz, 'images', `${item.nombre}-${ancho}.jpg`);
    const webp = jpg.replace(/\.jpg$/, '.webp');
    ejecutar('sips', ['-z', String(alto), String(ancho), '-s', 'format', 'jpeg', '-s', 'formatOptions', '82', preparado, '--out', jpg]);
    ejecutar('cwebp', ['-quiet', '-q', '78', '-m', '6', '-metadata', 'none', '-resize', String(ancho), String(alto), preparado, '-o', webp]);
    item.variantes.push({ ancho, alto, jpg: '/images/' + path.basename(jpg), webp: '/images/' + path.basename(webp), bytesJpg: fs.statSync(jpg).size, bytesWebp: fs.statSync(webp).size, shaJpg: sha(jpg), shaWebp: sha(webp) });
  }
}
fs.writeFileSync(receta, JSON.stringify(datos, null, 2) + '\n');
const escapar = s => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');
const galeria = `<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Ambientes industriales: revisión</title><style>body{font:16px/1.6 system-ui;color:#404751;margin:auto;max-width:1100px;padding:24px}img{max-width:100%;height:auto}h1,h2{color:#1d356c}section{border-top:1px solid #dadada;padding:24px 0}table{border-collapse:collapse}td,th{padding:8px;text-align:left;border-bottom:1px solid #dadada}</style><h1>Ambientes industriales generados</h1><p>Imágenes ilustrativas. No representan productos del catálogo ni sedes reales. Los destinos indicados son propuestas; la integración en familias y Oviedo depende de la rama de Juan. Comparación de formatos y dimensiones reales, revisada a tamaño original.</p>${datos.imagenes.map(i => `<section><h2>${escapar(i.destino)}</h2><p>${escapar(i.alt)}</p><picture><source type="image/webp" srcset="../../../images/${i.nombre}-480.webp 480w, ../../../images/${i.nombre}-960.webp 960w, ../../../images/${i.nombre}-1280.webp 1280w" sizes="(max-width: 1100px) 100vw, 1100px"><img src="../../../images/${i.nombre}-1280.jpg" width="${i.variantes[2].ancho}" height="${i.variantes[2].alto}" loading="lazy" alt="${escapar(i.alt)}"></picture><p>${escapar(i.revision100)}</p><table><tr><th>Medidas</th><th>JPG</th><th>WebP</th></tr>${i.variantes.map(v => `<tr><td>${v.ancho} × ${v.alto}</td><td>${v.bytesJpg} B</td><td>${v.bytesWebp} B</td></tr>`).join('')}</table></section>`).join('')}</html>`;
const carpeta = path.join(raiz, 'docs', 'imagenes-antes-despues', 'ambientes');
fs.mkdirSync(carpeta, { recursive: true });
fs.writeFileSync(path.join(carpeta, 'index.html'), galeria);
console.log(`${datos.imagenes.length} ambientes × 3 tamaños × 2 formatos; manifiesto con medidas, pesos y hashes.`);
