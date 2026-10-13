#!/usr/bin/env node
'use strict';

// Evidencia de rechazo, NO herramienta para sustituir fotografías del catálogo.
// Node nativo + sips, cwebp, dwebp y djpeg instalados fuera del proyecto.
// node tools/comparar-retoques-piloto.js --fuentes=/ruta/a/png-generados
// Repetición desde artefactos: --fuentes=docs/imagenes-antes-despues/piloto/fuentes
const fs = require('fs');
const path = require('path');
const os = require('os');
const zlib = require('zlib');
const crypto = require('crypto');
const { execFileSync } = require('child_process');
const RAIZ = path.resolve(__dirname, '..');
const SALIDA = path.join(RAIZ, 'docs', 'imagenes-antes-despues', 'piloto');
const W = 260, H = 168;
const FOTOS = [
  { nombre: 'industriaalimentaria', fuente: 'exec-ceea8ef7-c1d7-4161-8ca5-0b084956e742.png', zona: [35, 0, 200, 168], motivo: 'La propuesta recrea tubos, reflejos y conexiones en una imagen de mayor resolución. No conserva los píxeles históricos del producto.' },
  { nombre: 'calefactores', fuente: 'exec-4bcd2082-7ff5-4437-8dad-a318088f7193.png', zona: [45, 0, 165, 168], motivo: 'La propuesta recrea bridas, tubos y cajas, con detalle y proporciones propios de una ampliación generativa. No es un cambio limitado al fondo.' },
  { nombre: 'liquidos-noagresivos', fuente: 'exec-756f71aa-fc44-4d3b-b6bf-ea557d54f204.png', zona: [0, 0, 260, 168], motivo: 'La propuesta recrea mangos, espiras, cables y reflejos. El producto llega a los bordes: se protege el cuadro completo, incluido el fondo.' },
];

function argumentos() {
  const argv = process.argv.slice(2);
  if (argv.includes('--help') || argv.includes('-h')) {
    process.stdout.write('Uso: node tools/comparar-retoques-piloto.js --fuentes=/carpeta/png-generados\nSalida fija: docs/imagenes-antes-despues/piloto/; nunca modifica images/ ni legacy/.\n');
    process.exit(0);
  }
  if (argv.length !== 1 || !argv[0].startsWith('--fuentes=')) throw new Error('Indica solo --fuentes=/carpeta/png-generados (ver --help).');
  const carpeta = path.resolve(argv[0].slice('--fuentes='.length));
  if (!fs.statSync(carpeta).isDirectory()) throw new Error('La carpeta fuente no existe.');
  return carpeta;
}
function ejecutar(cmd, args) {
  return execFileSync(cmd, args, { encoding: null, stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 32 * 1024 * 1024 });
}
const sha = b => crypto.createHash('sha256').update(b).digest('hex');
const huellaArchivo = p => { const b = fs.readFileSync(p); return { bytes: b.length, sha256: sha(b) }; };
function ppm(buffer) {
  let i = 0;
  const espacio = b => [9, 10, 13, 32].includes(b);
  function token() {
    while (true) {
      while (espacio(buffer[i])) i++;
      if (buffer[i] !== 35) break;
      while (i < buffer.length && buffer[i] !== 10) i++;
    }
    const inicio = i;
    while (i < buffer.length && !espacio(buffer[i])) i++;
    return buffer.subarray(inicio, i).toString('ascii');
  }
  if (token() !== 'P6') throw new Error('Se esperaba PPM binario P6.');
  const ancho = Number(token()), alto = Number(token()), maximo = Number(token());
  if (maximo !== 255 || !espacio(buffer[i])) throw new Error('Cabecera PPM inesperada.');
  if (buffer[i] === 13 && buffer[i + 1] === 10) i += 2; else i++;
  const pixeles = buffer.subarray(i);
  if (pixeles.length !== ancho * alto * 3) throw new Error('Longitud PPM incorrecta.');
  return { ancho, alto, pixeles };
}
function exigirTamano(imagen) {
  if (imagen.ancho !== W || imagen.alto !== H) throw new Error(`Medidas inesperadas: ${imagen.ancho}×${imagen.alto}.`);
}
function crc32(bytes) {
  let c = 0xffffffff;
  for (const byte of bytes) { c ^= byte; for (let j = 0; j < 8; j++) c = (c >>> 1) ^ (c & 1 ? 0xedb88320 : 0); }
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(tipo, datos) {
  const etiqueta = Buffer.from(tipo), n = Buffer.alloc(4), crc = Buffer.alloc(4);
  n.writeUInt32BE(datos.length); crc.writeUInt32BE(crc32(Buffer.concat([etiqueta, datos])));
  return Buffer.concat([n, etiqueta, datos, crc]);
}
// PNG RGB sin pérdida, para que máscara y mapa no añadan diferencias JPEG.
function pngRGB(pixeles) {
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(W); ihdr.writeUInt32BE(H, 4); ihdr[8] = 8; ihdr[9] = 2;
  const filas = Buffer.alloc(H * (W * 3 + 1));
  for (let y = 0; y < H; y++) pixeles.copy(filas, y * (W * 3 + 1) + 1, y * W * 3, (y + 1) * W * 3);
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(filas)), chunk('IEND', Buffer.alloc(0))]);
}
function pngMedidas(p) {
  const b = fs.readFileSync(p);
  if (!b.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) throw new Error('Fuente sin cabecera PNG.');
  return { ancho: b.readUInt32BE(16), alto: b.readUInt32BE(20) };
}
const html = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function main() {
  const fuentes = argumentos();
  // Validar todos los archivos y herramientas antes de escribir artefactos.
  for (const foto of FOTOS) { pngMedidas(path.join(fuentes, foto.fuente)); fs.accessSync(path.join(RAIZ, 'legacy/com/brototermic.com/images', `brototermic-${foto.nombre}.jpg`)); }
  for (const [cmd, arg] of [['sips', '--version'], ['cwebp', '-version'], ['dwebp', '-version'], ['djpeg', '-version']]) ejecutar(cmd, [arg]);
  fs.mkdirSync(path.join(SALIDA, 'fuentes'), { recursive: true });
  const temporal = fs.mkdtempSync(path.join(os.tmpdir(), 'brototermic-comparacion-'));
  const informes = [];
  try {
    for (const foto of FOTOS) {
      const base = foto.nombre;
      const originalFuente = path.join(RAIZ, 'legacy/com/brototermic.com/images', `brototermic-${base}.jpg`);
      const propuestaFuente = path.join(fuentes, foto.fuente);
      const copiaFuente = path.join(SALIDA, 'fuentes', foto.fuente);
      const original = path.join(SALIDA, `${base}-original.jpg`);
      const normalizadaPng = path.join(SALIDA, `${base}-propuesta-normalizada.png`);
      const normalizadaJpg = path.join(SALIDA, `${base}-propuesta-normalizada.jpg`);
      const losslessWebp = path.join(temporal, `${base}.webp`);
      const originalAntes = huellaArchivo(originalFuente);
      const propuestaAntes = huellaArchivo(propuestaFuente);
      fs.copyFileSync(originalFuente, original);
      if (path.resolve(propuestaFuente) !== path.resolve(copiaFuente)) fs.copyFileSync(propuestaFuente, copiaFuente);
      // Transformación de COMPARACIÓN únicamente. Fuerza el cuadro completo a 260×168,
      // sin recortar ni registrar geométricamente el producto; se declara en el JSON.
      ejecutar('sips', ['--resampleHeightWidth', String(H), String(W), '-s', 'format', 'png', propuestaFuente, '--out', normalizadaPng]);
      ejecutar('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '90', normalizadaPng, '--out', normalizadaJpg]);
      ejecutar('cwebp', ['-quiet', '-lossless', '-exact', normalizadaPng, '-o', losslessWebp]);
      const a = ppm(ejecutar('djpeg', ['-pnm', original]));
      const b = ppm(ejecutar('dwebp', [losslessWebp, '-ppm', '-o', '-']));
      const jpg = ppm(ejecutar('djpeg', ['-pnm', normalizadaJpg]));
      [a, b, jpg].forEach(exigirTamano);
      const mascara = Buffer.alloc(W * H * 3), mapa = Buffer.alloc(W * H * 3), mapaJpg = Buffer.alloc(W * H * 3);
      let protegidos = 0, cambiosProtegidos = 0, cambiosTotal = 0, cambiosJpg = 0, suma = 0, maximo = 0;
      const [x0, y0, ancho, alto] = foto.zona;
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const p = (y * W + x) * 3, protegido = x >= x0 && x < x0 + ancho && y >= y0 && y < y0 + alto;
        let d = 0, dj = 0;
        for (let c = 0; c < 3; c++) { const delta = Math.abs(a.pixeles[p + c] - b.pixeles[p + c]); d = Math.max(d, delta); suma += delta; dj = Math.max(dj, Math.abs(b.pixeles[p + c] - jpg.pixeles[p + c])); mascara[p + c] = protegido ? 255 : 0; }
        if (protegido) protegidos++;
        if (d) { cambiosTotal++; if (protegido) cambiosProtegidos++; }
        if (dj) cambiosJpg++;
        maximo = Math.max(maximo, d);
        for (let c = 0; c < 3; c++) { mapa[p + c] = d; mapaJpg[p + c] = dj; }
      }
      if (!cambiosProtegidos) throw new Error(`Sin cambios en máscara: revisar evidencia ${base}.`);
      fs.writeFileSync(path.join(SALIDA, `${base}-mascara-proteccion.png`), pngRGB(mascara));
      fs.writeFileSync(path.join(SALIDA, `${base}-diferencias.png`), pngRGB(mapa));
      fs.writeFileSync(path.join(SALIDA, `${base}-diferencias-exportacion-jpg.png`), pngRGB(mapaJpg));
      if (sha(fs.readFileSync(originalFuente)) !== originalAntes.sha256 || sha(fs.readFileSync(propuestaFuente)) !== propuestaAntes.sha256) throw new Error('Se ha modificado una fuente.');
      const informe = {
        nombre: base, estado: 'RECHAZADA', motivo: foto.motivo,
        fuenteHistorica: path.relative(RAIZ, originalFuente), fuenteGenerada: `fuentes/${foto.fuente}`,
        herramientas: ['sips (reescalado/PNG/JPG)', 'djpeg (JPEG a RGB)', 'cwebp lossless -exact y dwebp (PNG a RGB)', 'Node nativo (máscara, diferencias, SHA-256, PNG)'],
        fuenteGeneradaMedidas: pngMedidas(propuestaFuente), originalMedidas: { ancho: W, alto: H }, comparacionMedidas: pngMedidas(normalizadaPng),
        transformacionComparacion: 'sips --resampleHeightWidth 168 260; cuadro completo, sin recorte ni registro geométrico. Se normaliza para comparar, no es retoque aprobado.',
        mascara: { tipo: 'rectangulo conservador de protección, NO segmentación exacta', zona: { x: x0, y: y0, ancho, alto }, blanco: 'zona protegida, incluye fondo', negro: 'zona no incluida', pixelesProtegidos: protegidos },
        comparacionAntesDeJpg: { totalPixeles: W * H, pixelesDistintos: cambiosTotal, pixelesDistintosEnZonaProtegida: cambiosProtegidos, porcentajeDistintosEnZonaProtegida: Number((cambiosProtegidos * 100 / protegidos).toFixed(4)), diferenciaAbsolutaMediaPorCanal: Number((suma / (W * H * 3)).toFixed(4)), maximaDiferenciaPorCanal: maximo, criterio: 'diferencia RGB exacta > 0; incluye cambios de fondo y remuestreo; no mide únicamente producto' },
        exportacionJpg: { calidadSips: 90, pixelesDistintosRespectoPngNormalizado: cambiosJpg, nota: 'Pérdida de codificación cuantificada por separado, no atribuida al retoque.' },
        hashes: { originalFuente: originalAntes, copiaOriginal: huellaArchivo(original), propuestaFuente: propuestaAntes, copiaPropuestaFuente: huellaArchivo(copiaFuente), normalizadaPng: huellaArchivo(normalizadaPng), normalizadaJpg: huellaArchivo(normalizadaJpg), mascara: huellaArchivo(path.join(SALIDA, `${base}-mascara-proteccion.png`)), diferencias: huellaArchivo(path.join(SALIDA, `${base}-diferencias.png`)), diferenciasExportacionJpg: huellaArchivo(path.join(SALIDA, `${base}-diferencias-exportacion-jpg.png`)), bufferOriginalRgb: sha(a.pixeles), bufferNormalizadoRgb: sha(b.pixeles), bufferJpgRgb: sha(jpg.pixeles) },
        limiteDeLaPrueba: 'La máscara contiene fondo y el remuestreo aporta diferencias. Los conteos no prueban por sí solos modificación del producto. El rechazo combina inspección visual de original/propuesta fuente y prohibición de ampliación generativa. No sustituye una revisión comercial.',
        sustitucionCatalogo: false,
      };
      fs.writeFileSync(path.join(SALIDA, `${base}-informe.json`), JSON.stringify(informe, null, 2) + '\n');
      informes.push(informe);
    }
    fs.writeFileSync(path.join(SALIDA, 'resumen.json'), JSON.stringify({ estado: '3 PROPUESTAS RECHAZADAS; 0 RETOQUES APROBADOS', ancho: W, alto: H, informes }, null, 2) + '\n');
    const figuras = (base, sufijo, titulo) => `<figure><figcaption>${titulo}</figcaption><img src="${base}-${sufijo}" width="260" height="168" alt="${html(titulo)}"></figure>`;
    const articulos = informes.map(r => `<article><h2>${html(r.nombre)} <strong class="rechazo">RECHAZADA</strong></h2><p>${html(r.motivo)}</p><p>Fuente generada: ${r.fuenteGeneradaMedidas.ancho} × ${r.fuenteGeneradaMedidas.alto}. Comparación: 260 × 168. Zona protegida: ${r.comparacionAntesDeJpg.pixelesDistintosEnZonaProtegida}/${r.mascara.pixelesProtegidos} píxeles diferentes antes de JPG. La zona contiene fondo.</p><div class="imagenes">${figuras(r.nombre, 'original.jpg', 'Original histórico, sin modificar')}${figuras(r.nombre, 'propuesta-normalizada.jpg', 'Propuesta normalizada para comparar; rechazada')}${figuras(r.nombre, 'mascara-proteccion.png', 'Máscara: blanco protegido; incluye fondo')}${figuras(r.nombre, 'diferencias.png', 'Diferencias antes de JPG: negro 0; blanco 255')}${figuras(r.nombre, 'diferencias-exportacion-jpg.png', 'Diferencias debidas a exportar el JPG')}</div><p><a href="${html(r.fuenteGenerada)}">Abrir propuesta fuente a resolución original</a> · <a href="${r.nombre}-propuesta-normalizada.png">PNG normalizado antes de JPG</a> · <a href="${r.nombre}-informe.json">Informe JSON y hashes</a></p></article>`).join('\n');
    fs.writeFileSync(path.join(SALIDA, 'index.html'), `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Piloto: tres propuestas rechazadas</title><style>body{font-family:system-ui,sans-serif;color:#404751;background:#fff;margin:0;padding:24px;line-height:1.5}main{max-width:1200px;margin:auto}h1,h2{color:#1d356c}article{border-top:2px solid #004c9a;margin-top:32px;padding-top:20px}.rechazo{display:inline-block;padding:4px 8px;background:#8b1a1a;color:white;font-size:16px}.imagenes{display:flex;flex-wrap:wrap;gap:24px}figure{margin:0;width:260px}figcaption{min-height:48px;font-size:14px}img{display:block;width:260px;height:168px;border:1px solid #72767c}a{color:#004c9a}:focus-visible{outline:3px solid #004c9a;outline-offset:3px}code{overflow-wrap:anywhere}p{max-width:80ch}</style></head><body><main><h1>Tres propuestas IA rechazadas</h1><p><strong>0 retoques aprobados; originales del catálogo intactos.</strong> Hoja local de comparación, fuera de la web publicada. Las imágenes se muestran a 260 × 168, sin ampliación por CSS.</p><p>La normalización a 260 × 168 es una transformación para comparar. No es un retoque autorizado. La máscara rectangular protege producto y fondo; no es una segmentación exacta ni demuestra por sí sola que cambió el producto. El rechazo incluye la inspección visual de las fuentes generadas a resolución original.</p>${articulos}</main></body></html>\n`);
    fs.writeFileSync(path.join(SALIDA, 'README.md'), `# Piloto: propuestas IA rechazadas\n\nSe produjeron tres propuestas reales y se **rechazan las tres**. No se sustituye ninguna fotografía en images/ ni legacy/. Las fuentes PNG generadas se conservan en fuentes/ y los JPG históricos se copian byte a byte solo en esta carpeta de documentación.\n\nAbrir index.html para la comparación a tamaño real. Cada informe JSON registra dimensiones, bytes y SHA-256 de fuentes, derivados, máscara y mapas.\n\nReproducir desde el repositorio (sips, cwebp, dwebp y djpeg deben estar disponibles fuera de npm):\n\n\x60\x60\x60sh\nnode tools/comparar-retoques-piloto.js --fuentes=docs/imagenes-antes-despues/piloto/fuentes\n\x60\x60\x60\n\nLa propuesta se normaliza con sips al cuadro completo 260 × 168, sin recorte ni registro geométrico; si su proporción difiere, se fuerza para esta comparación y no se oculta ese hecho. Se conserva PNG normalizado antes de JPEG. Los mapas muestran diferencia máxima por canal (0 negro, 255 blanco), sin amplificar. El mapa de exportación compara PNG normalizado con su JPG calidad 90 para separar pérdida de codificación.\n\nLa máscara rectangular es conservadora, contiene fondo y **no es segmentación exacta**. No se puede concluir que todos sus píxeles diferentes sean cambios del producto: hay diferencias del fondo y del remuestreo. El rechazo está motivado también por inspección visual de fuentes: son recreaciones generativas de tubos, bridas, cajas, mangos y reflejos, con resolución ampliada; no simples cambios del fondo.\n\nNo se acredita aprobación comercial, conservación exacta de píxeles del producto, ni test/build/Lighthouse. El script se ejecutó para producir las evidencias de esta carpeta y verificó tamaños 260 × 168, cambios en zona protegida > 0 y hashes intactos de las fuentes durante la ejecución.\n`);
    process.stdout.write(JSON.stringify(informes.map(r => ({ nombre: r.nombre, estado: r.estado, fuente: r.fuenteGeneradaMedidas, pixelesProtegidos: r.mascara.pixelesProtegidos, cambiosProtegidos: r.comparacionAntesDeJpg.pixelesDistintosEnZonaProtegida, cambiosExportacionJpg: r.exportacionJpg.pixelesDistintosRespectoPngNormalizado })), null, 2) + '\n');
  } finally {
    // Solo se borra el directorio temporal creado por este mismo proceso.
    fs.rmSync(temporal, { recursive: true, force: true });
  }
}
try { main(); } catch (e) { process.stderr.write(`Comparación rechazada: ${e.message}\n`); process.exitCode = 1; }
