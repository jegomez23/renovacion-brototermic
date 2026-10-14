#!/usr/bin/env node
// D-020: URLs probadas en el ZIP. Detecta pérdidas de rutas incluso en discos insensibles a mayúsculas.
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { simular } = require('./lib/htaccess');
const { auditar } = require('./auditoria-seo');

const aliases = [
  ['docs/DISPLAYS DIGITALES PROGRAMABLES BROTOTERMIC HR.PDF', 'docs/DISPLAYS DIGITALES PROGRAMABLES BROTOTERMIC HR.pdf'],
  ['images/brototermic-control-telefonico-gsm.jpg', 'images/brototermic-CONTROL-TELEFONICO-GSM.jpg'],
  ['images/brototermic-cronotermostato-semanal-radiofrecuencia.jpg', 'images/brototermic-Cronotermostato-semanal-radiofrecuencia.jpg'],
  ['oviedo/images/ebm-papst-brototermic-oviedo.jpg', 'oviedo/images/Ebm-Papst-brototermic-oviedo.jpg'],
  ['oviedo/images/eliwell-papst-brototermic-oviedo.jpg', 'oviedo/images/eliwell-Papst-brototermic-oviedo.jpg'],
];
const catalogo = 'docs/catalogo-resistencias-calefactoras.pdf';
const contacto = 'oviedo/contacto-brototermic-oviedo.html';

function main() {
  const raiz = path.join(__dirname, '..');
  const dist = path.join(raiz, 'dist');
  const htaccess = fs.readFileSync(path.join(dist, '.htaccess'), 'utf8');
  const htaccessEs = fs.readFileSync(path.join(raiz, 'dist-es/.htaccess'), 'utf8');
  const url = ruta => 'https://brototermic.com/' + encodeURI(ruta);
  for (const [alias, destino] of aliases) {
    const r = simular(htaccess, url(alias), dist);
    assert.equal(r.estado, 200, alias);
    assert.equal(r.archivo, path.join(dist, destino), alias);
    assert.equal(simular(htaccess, url(destino), dist).estado, 200, destino);
    // Quitar una regla debe provocar 404 y ERROR del auditor, también en macOS.
    const sinRegla = htaccess.split('\n').filter(l => !(l.startsWith('RewriteRule ') && l.includes(destino))).join('\n');
    assert.notEqual(sinRegla, htaccess, 'La mutación debe eliminar la regla');
    assert.equal(simular(sinRegla, url(alias), dist).estado, 404, alias);
    const informe = auditar({ modo: 'publicacion', urls: [url(alias)], sobrescribir: { '/.htaccess': sinRegla } });
    assert.equal(informe.resumen.ERROR, 1, 'El auditor debe detectar la pérdida de ' + alias);
    assert.equal(simular(htaccess, url(alias.replace(/\.(jpg|PDF)$/, '.JpG')), dist).estado, 404);
  }
  const hash = ruta => crypto.createHash('sha256').update(fs.readFileSync(ruta)).digest('hex');
  assert.equal(hash(path.join(dist, catalogo)), '7d491d3844444368b6b5f233329b5aa9c5304ffecfb7d8bb743934227c034b4e');
  assert.equal(hash(path.join(dist, catalogo)), hash(path.join(raiz, 'legacy/com/brototermic.com/oviedo', catalogo)));
  assert.notEqual(hash(path.join(dist, catalogo)), hash(path.join(dist, 'docs/catalogo-Brototermic-resistencias.pdf')));
  assert.ok(!fs.readFileSync(path.join(dist, 'sitemap.xml'), 'utf8').includes('/' + catalogo), 'No promocionar una edición sin confirmar');
  for (const ruta of [...aliases.map(([a]) => a), catalogo, contacto]) {
    for (const protocolo of ['http:', 'https:']) for (const www of ['', 'www.']) {
      const consulta = '?origen=prueba%20local';
      const r = simular(htaccess, `${protocolo}//${www}brototermic.com/${encodeURI(ruta)}${consulta}`, dist);
      if (ruta === contacto || protocolo === 'http:' || www) {
        assert.equal(r.estado, 301, ruta);
        const destino = (ruta === contacto ? url('oviedo/') : url(ruta)) + consulta;
        assert.equal(r.location, destino);
        assert.equal(simular(htaccess, destino, dist).estado, 200, 'Sin cadenas ni bucles');
      } else assert.equal(r.estado, 200, ruta);
    }
    // No ampliar el contrato del .es: el catálogo sí tiene una 301 aprobada; los otros alias, no.
    for (const [reglas, carpeta] of [[htaccess, dist], [htaccessEs, path.join(raiz, 'dist-es')]]) {
      assert.equal(simular(reglas, 'https://brototermic.es/' + encodeURI(ruta), carpeta).estado, ruta === catalogo ? 301 : 404);
    }
  }
  const informe = auditar({ modo: 'publicacion', urls: [...aliases.map(([a]) => url(a)), url(catalogo), url(contacto)] });
  assert.equal(informe.resumen.OK, 7);
  assert.equal(informe.resumen.ERROR, 0);
  console.log('Rutas históricas: 7 rutas OK; 5 mutaciones detectadas; bytes del catálogo conservados; variantes de host/protocolo y contrato .es OK.');
}

module.exports = { aliases, catalogo, contacto };
if (require.main === module) main();
