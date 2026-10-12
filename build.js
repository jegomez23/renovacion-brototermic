#!/usr/bin/env node
// build.js — generador estático de brototermic.com
//
//   node build.js                      modo «piloto» (por defecto): genera /dist y AVISA de lo pendiente
//   node build.js --modo=publicacion   modo «publicacion»: lo pendiente es ERROR (alias: --publicar)
//
// Pendiente = borradores, marcas sin resolver ([POR VERIFICAR, (dato externo), páginas del plan que aún
// no se generan y enlaces a esas páginas. En piloto es normal; en publicación, nada de eso puede quedar.
//
// Node ≥ 18 y sin dependencias npm: solo módulos nativos (fs, path, crypto).
// Contrato de datos: docs/datos.md · Reglas: AGENTS.md

'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const L = require('./tools/lib/legacy');

const RAIZ = __dirname;
const argModo = process.argv.find(a => a.startsWith('--modo='));
const MODO = process.argv.includes('--publicar') ? 'publicacion' : argModo ? argModo.slice(7) : 'piloto';
if (!['piloto', 'publicacion', 'preview'].includes(MODO)) {
  console.error(`ERROR  modo desconocido «${MODO}»: usa --modo=piloto, --modo=publicacion o --modo=preview`);
  process.exit(1);
}
const PUBLICAR = MODO === 'publicacion';
// Modo «preview» (D-017): versión de DEMOSTRACIÓN para enseñar al cliente en un hosting estático (Netlify Drop,
// Cloudflare Pages). Sale en /dist-preview, con noindex/nofollow en todas las páginas, robots.txt «Disallow: /», la
// franja «Versión de demostración», sin .htaccess ni PHP y con el hero de demostración (D-016). NUNCA va al hosting real.
const PREVIA = MODO === 'preview';
const DIST = path.join(RAIZ, PREVIA ? 'dist-preview' : 'dist'); // docroot del .com (o de la demo)
const DIST_ES = path.join(RAIZ, 'dist-es');   // docroot del .es: solo su .htaccess (301 al .com y 404 para el resto)
const SIN_AUDITORIA = process.argv.includes('--sin-auditoria');
if (SIN_AUDITORIA && PUBLICAR) {
  console.error('ERROR  --sin-auditoria no se admite en modo publicación: la auditoría SEO es obligatoria para publicar');
  process.exit(1);
}

// =====================================================================
// 1. Avisos y errores
// =====================================================================
// Un AVISO no para el build (algo pendiente o mejorable). Un ERROR sí: el /dist no sería válido.
// En modo publicación, lo pendiente (borradores, marcas sin resolver, páginas y enlaces que faltan) pasa a ERROR.
const avisos = [];
const errores = [];
const aviso = m => avisos.push(m);
const error = m => errores.push(m);
const pendiente = m => (PUBLICAR ? error(m) : aviso(m));

class ErrorFatal extends Error {}

// =====================================================================
// 2. Utilidades
// =====================================================================
const rel = p => path.relative(RAIZ, p).split(path.sep).join('/');

function leerJson(ruta) {
  const abs = path.join(RAIZ, ruta);
  if (!fs.existsSync(abs)) throw new ErrorFatal(`Falta ${ruta}`);
  const texto = fs.readFileSync(abs, 'utf8');
  if (texto.charCodeAt(0) === 0xfeff) error(`${ruta}: tiene BOM; debe guardarse como UTF-8 sin BOM`);
  try {
    return JSON.parse(texto.replace(/^﻿/, ''));
  } catch (e) {
    throw new ErrorFatal(`${ruta}: JSON mal formado → ${e.message}`);
  }
}

function leerCsv(ruta) {
  const t = fs.readFileSync(path.join(RAIZ, ruta), 'utf8').replace(/^﻿/, '');
  const filas = [];
  let fila = [], campo = '', q = false;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (q) { if (c === '"' && t[i + 1] === '"') { campo += '"'; i++; } else if (c === '"') q = false; else campo += c; }
    else if (c === '"') q = true;
    else if (c === ',') { fila.push(campo); campo = ''; }
    else if (c === '\n') { fila.push(campo.replace(/\r$/, '')); filas.push(fila); fila = []; campo = ''; }
    else campo += c;
  }
  if (campo || fila.length) { fila.push(campo); filas.push(fila); }
  const [cab, ...resto] = filas;
  return resto.filter(f => f.length > 1).map(f => Object.fromEntries(cab.map((k, i) => [k, f[i] ?? ''])));
}

const escaparHtml = v => String(v)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

// Ancla a partir del nombre: «Grupo Monobloc» → «grupo-monobloc»
const slug = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  .replace(/ñ/g, 'n').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

// Rutas públicas con ñ o espacios, codificadas (catalogo_ca%C3%B1as…, DISPLAYS%20…)
const urlPublica = ruta => encodeURI(ruta);

const contarPalabras = html => html.replace(/<[^>]+>/g, ' ').trim().split(/\s+/).filter(Boolean).length;
const longitud = s => [...s].length; // caracteres reales (una «ñ» cuenta 1)

// Medidas de un JPEG (marcador SOF) o un PNG (cabecera IHDR), sin librerías
function medidasImagen(ruta) {
  const b = fs.readFileSync(ruta);
  if (b.readUInt32BE(0) === 0x89504e47) return { ancho: b.readUInt32BE(16), alto: b.readUInt32BE(20) };
  if (b[0] === 0xff && b[1] === 0xd8) {
    let i = 2;
    while (i < b.length) {
      if (b[i] !== 0xff) { i++; continue; }
      const marca = b[i + 1];
      // SOF0–SOF15 salvo DHT (C4), JPG (C8) y DAC (CC)
      if (marca >= 0xc0 && marca <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marca)) {
        return { alto: b.readUInt16BE(i + 5), ancho: b.readUInt16BE(i + 7) };
      }
      i += 2 + b.readUInt16BE(i + 2);
    }
  }
  return null;
}

function hashArchivo(ruta) {
  return crypto.createHash('sha256').update(fs.readFileSync(ruta)).digest('hex').slice(0, 10);
}

function copiarDirectorio(origen, destino, filtro = () => true) {
  if (!fs.existsSync(origen)) return 0;
  let n = 0;
  fs.mkdirSync(destino, { recursive: true });
  for (const e of fs.readdirSync(origen, { withFileTypes: true })) {
    if (e.name === '.gitkeep') continue;
    const o = path.join(origen, e.name), d = path.join(destino, e.name);
    if (e.isDirectory()) n += copiarDirectorio(o, d, filtro);
    else if (filtro(e.name)) { fs.copyFileSync(o, d); n++; }
  }
  return n;
}

// =====================================================================
// 3. Motor de plantillas mínimo
// =====================================================================
//   {{ruta}}             valor ESCAPADO (siempre, salvo que se pida lo contrario)
//   {{{ruta}}}           HTML sin escapar: solo para campos que el contrato define como HTML (texto, intro…)
//   {{> parcial}}        incluye src/partials/parcial.html con el mismo contexto
//   {{#if ruta}}…{{else}}…{{/if}}   {{#unless ruta}}…{{/unless}}
//   {{#each ruta}}…{{/each}}        dentro: los campos del elemento, {{this}}, {{@numero}} (1, 2, 3…)
//   {{! comentario }}
// Una variable INEXISTENTE es un error (detecta erratas en las plantillas); null pinta vacío.
const PARCIALES = {};
const PLANTILLAS = {};

function compilar(fuente, nombre) {
  const raiz = { hijos: [] };
  const pila = [raiz];
  const re = /\{\{\{\s*([\w.@]+)\s*\}\}\}|\{\{\s*([^}]+?)\s*\}\}/g;
  let ultimo = 0, m;
  const actual = () => pila[pila.length - 1];
  while ((m = re.exec(fuente))) {
    if (m.index > ultimo) actual().hijos.push({ tipo: 'texto', valor: fuente.slice(ultimo, m.index) });
    ultimo = re.lastIndex;
    if (m[1]) { actual().hijos.push({ tipo: 'html', ruta: m[1] }); continue; }
    const t = m[2];
    if (t.startsWith('!')) continue;
    if (t.startsWith('>')) { actual().hijos.push({ tipo: 'parcial', nombre: t.slice(1).trim() }); continue; }
    const bloque = t.match(/^#(if|unless|each)\s+([\w.@]+)$/);
    if (bloque) {
      const nodo = { tipo: bloque[1], ruta: bloque[2], hijos: [], sino: null };
      actual().hijos.push(nodo);
      pila.push(nodo);
      continue;
    }
    if (t === 'else') {
      if (actual().tipo !== 'if' && actual().tipo !== 'unless') throw new ErrorFatal(`${nombre}: {{else}} fuera de un {{#if}}`);
      actual().hijos.push({ tipo: 'else' });
      continue;
    }
    const cierre = t.match(/^\/(if|unless|each)$/);
    if (cierre) {
      const nodo = pila.pop();
      if (!nodo || nodo.tipo !== cierre[1]) throw new ErrorFatal(`${nombre}: {{/${cierre[1]}}} no cierra ningún bloque abierto`);
      // {{else}} divide los hijos: lo de antes se pinta si se cumple la condición; lo de después, si no
      const i = nodo.hijos.findIndex(h => h.tipo === 'else');
      if (i >= 0) { nodo.sino = nodo.hijos.slice(i + 1); nodo.hijos = nodo.hijos.slice(0, i); }
      continue;
    }
    if (/^[\w.@]+$/.test(t)) { actual().hijos.push({ tipo: 'var', ruta: t }); continue; }
    throw new ErrorFatal(`${nombre}: etiqueta de plantilla no reconocida {{${t}}}`);
  }
  if (ultimo < fuente.length) actual().hijos.push({ tipo: 'texto', valor: fuente.slice(ultimo) });
  if (pila.length > 1) throw new ErrorFatal(`${nombre}: falta cerrar {{#${actual().tipo} ${actual().ruta}}}`);
  return raiz.hijos;
}

function buscar(ruta, ambitos, nombre) {
  if (ruta === 'this') return ambitos[0].valor;
  if (ruta.startsWith('@')) {
    const meta = ambitos.find(a => a.meta)?.meta;
    if (!meta || !(ruta.slice(1) in meta)) throw new ErrorFatal(`${nombre}: {{${ruta}}} fuera de un {{#each}}`);
    return meta[ruta.slice(1)];
  }
  const [primero, ...resto] = ruta.split('.');
  const ambito = ambitos.find(a => a.valor !== null && typeof a.valor === 'object' && primero in a.valor);
  if (!ambito) throw new ErrorFatal(`${nombre}: la variable {{${ruta}}} no existe`);
  let v = ambito.valor[primero];
  for (const parte of resto) {
    if (v === null || v === undefined) return v;
    if (!(parte in Object(v))) throw new ErrorFatal(`${nombre}: la variable {{${ruta}}} no existe`);
    v = v[parte];
  }
  return v;
}

const verdadero = v => (Array.isArray(v) ? v.length > 0 : Boolean(v));

function pintar(nodos, ambitos, nombre) {
  let s = '';
  for (const n of nodos) {
    switch (n.tipo) {
      case 'texto': s += n.valor; break;
      case 'var': {
        const v = buscar(n.ruta, ambitos, nombre);
        if (v === undefined) throw new ErrorFatal(`${nombre}: {{${n.ruta}}} es undefined`);
        s += v === null ? '' : escaparHtml(v);
        break;
      }
      case 'html': {
        const v = buscar(n.ruta, ambitos, nombre);
        s += v === null || v === undefined ? '' : String(v);
        break;
      }
      case 'parcial': {
        const p = PARCIALES[n.nombre];
        if (!p) throw new ErrorFatal(`${nombre}: no existe el parcial src/partials/${n.nombre}.html`);
        s += pintar(p, ambitos, `partials/${n.nombre}`);
        break;
      }
      case 'if':
      case 'unless': {
        let v = verdadero(buscar(n.ruta, ambitos, nombre));
        if (n.tipo === 'unless') v = !v;
        s += pintar(v ? n.hijos : n.sino || [], ambitos, nombre);
        break;
      }
      case 'each': {
        const lista = buscar(n.ruta, ambitos, nombre) || [];
        if (!Array.isArray(lista)) throw new ErrorFatal(`${nombre}: {{#each ${n.ruta}}} no es una lista`);
        lista.forEach((item, i) => {
          s += pintar(n.hijos, [{ valor: item, meta: { numero: i + 1, primero: i === 0, ultimo: i === lista.length - 1 } }, ...ambitos], nombre);
        });
        break;
      }
    }
  }
  return s;
}

function cargarPlantillas() {
  for (const [dir, destino] of [['src/partials', PARCIALES], ['src/templates', PLANTILLAS]]) {
    for (const f of fs.readdirSync(path.join(RAIZ, dir))) {
      if (!f.endsWith('.html')) continue;
      const nombre = `${dir.split('/')[1]}/${f}`;
      const fuente = fs.readFileSync(path.join(RAIZ, dir, f), 'utf8');
      destino[f.replace(/\.html$/, '')] = compilar(fuente, nombre);
    }
  }
}

const renderizar = (plantilla, contexto) => {
  if (!PLANTILLAS[plantilla]) throw new ErrorFatal(`No existe src/templates/${plantilla}.html`);
  return pintar(PLANTILLAS[plantilla], [{ valor: contexto }], `templates/${plantilla}`)
    .replace(/^[ \t]+$/gm, '')       // líneas con solo espacios
    .replace(/\n{3,}/g, '\n\n');     // como mucho una línea en blanco seguida
};

// =====================================================================
// 4. Datos
// =====================================================================
const site = leerJson('data/site.json');
const familias = leerJson('data/familias.json');
const plan = leerCsv('docs/plan-paginas.csv');
const planPorArchivo = new Map(plan.map(f => [f.archivo, f]));
const host = site.host.replace(/\/$/, '');

// Rutas públicas de cada página del plan («index.html» → «/», «oviedo/index.html» → «/oviedo/»)
const rutaPublica = archivo => '/' + archivo.replace(/(^|\/)index\.html$/, '$1');
const rutasPlan = new Set(plan.map(f => rutaPublica(f.archivo)));

// Entrada de cada categoría en familias.json, por archivo (para sus campos opcionales: otrosNombres)
const categoriasPorArchivo = new Map(familias.flatMap(f => f.categorias).map(c => [c.archivo, c]));
const categorias = new Map(); // archivo → { datos, familia, menu }
for (const fam of familias) {
  const lista = fam.tipo === 'familia' ? fam.categorias : [{ archivo: fam.archivo, menu: fam.nombre }];
  for (const c of lista) {
    const ruta = path.join(RAIZ, 'data', 'categorias', `${c.archivo}.json`);
    if (!fs.existsSync(ruta)) { categorias.set(c.archivo, { datos: null, familia: fam, menu: c.menu }); continue; }
    categorias.set(c.archivo, { datos: leerJson(`data/categorias/${c.archivo}.json`), familia: fam, menu: c.menu });
  }
}
// Validación 3 (datos.md §6): cada JSON de categoría está en familias.json y viceversa
for (const f of fs.readdirSync(path.join(RAIZ, 'data', 'categorias'))) {
  if (f.endsWith('.json') && !categorias.has(f.replace(/\.json$/, ''))) error(`data/categorias/${f} no aparece en familias.json`);
}
const sinJson = [...categorias].filter(([, c]) => !c.datos).map(([a]) => a);
if (sinJson.length) pendiente(`${sinJson.length} de ${categorias.size} categorías aún no tienen JSON en data/categorias/ (se generarán cuando existan).`);

// =====================================================================
// 5. Imágenes
// =====================================================================
// Imágenes originales a su tamaño real (AGENTS.md §5): <nombre>.jpg (o .png/.gif si así se llama en /legacy:
// la extensión forma parte de la URL indexada y no se cambia) y <nombre>.webp opcional
// «nombre» es el nombre base de un archivo de /images/ («brototermic-candelas») o, para una imagen antigua que se
// conserva con su URL original (D-011), su ruta completa sin extensión («oviedo/images/brototermic-oviedo»): esas
// se toman de /legacy y build.js las publica en la misma ruta.
const IMAGENES_CONSERVADAS = new Map(L.imagenesConservadas().map(i => [i.url, i.origen]));
function archivoImagen(nombre) {
  for (const ext of ['.jpg', '.png', '.gif']) {
    const enRepo = path.join(RAIZ, 'images', `${nombre}${ext}`);
    if (fs.existsSync(enRepo)) return { ruta: enRepo, url: `/images/${nombre}${ext}`, ext };
    const antigua = nombre.includes('/') && IMAGENES_CONSERVADAS.get(`/${nombre}${ext}`);
    if (antigua) return { ruta: antigua, url: `/${nombre}${ext}`, ext };
  }
  return null;
}
function imagen(nombre, contexto) {
  if (!nombre) return null;
  const archivo = archivoImagen(nombre);
  if (!archivo) { error(`${contexto}: no existe images/${nombre}.jpg`); return null; }
  const medidas = medidasImagen(archivo.ruta);
  if (!medidas) { error(`${contexto}: no se pueden leer las medidas de ${archivo.url}`); return null; }
  const tieneWebp = fs.existsSync(path.join(RAIZ, 'images', `${nombre}.webp`));
  return {
    src: urlPublica(archivo.url),
    webp: tieneWebp ? urlPublica(`/images/${nombre}.webp`) : null,
    ancho: medidas.ancho,
    alto: medidas.alto,
  };
}

// =====================================================================
// 6. Modelo común: menú, pie y recursos
// =====================================================================
// Interruptor de efectos (site.json → efectos): un efecto en false sale del CSS y del JS publicados, quitando el
// bloque entre «@efecto:nombre» y «@fin:nombre». El ?v= se calcula sobre lo publicado, así la caché se renueva.
function filtrarEfectos(texto) {
  for (const [nombre, activo] of Object.entries(site.efectos || {})) {
    if (activo === false) texto = texto.replace(new RegExp(`/\\* @efecto:${nombre}\\b[\\s\\S]*?/\\* @fin:${nombre} \\*/`, 'g'), '');
  }
  return texto;
}
const publicado = rel => filtrarEfectos(fs.readFileSync(path.join(RAIZ, rel), 'utf8'));
const hashTexto = t => crypto.createHash('sha256').update(t).digest('hex').slice(0, 10);
const recursos = {
  css: `/assets/css/style.css?v=${hashTexto(publicado('assets/css/style.css'))}`,
  js: `/assets/js/menu.js?v=${hashTexto(publicado('assets/js/menu.js'))}`,
  jsFormulario: `/assets/js/formulario.js?v=${hashArchivo(path.join(RAIZ, 'assets/js/formulario.js'))}`,
};
// Dos logos: para fondo claro (cabecera blanca) y el original para fondo oscuro (pie)
function logoDe(campo) {
  const ruta = site[campo];
  if (!ruta || !fs.existsSync(path.join(RAIZ, ruta.replace(/^\//, '')))) throw new ErrorFatal(`site.json → ${campo}: no existe ${ruta}`);
  return { src: urlPublica(ruta), ...medidasImagen(path.join(RAIZ, ruta.replace(/^\//, ''))) };
}
const logo = logoDe('logo');
const logoFondoOscuro = logoDe('logoFondoOscuro');

// Contrato del formulario (datos.md §1): compatible con rd-mailform.php y sin envío real hasta tener el hosting
const formulario = site.formulario || {};
if (typeof formulario.accion !== 'string' || !formulario.accion.startsWith('/')) error('site.json → formulario.accion: falta la URL de envío (ruta absoluta)');
if (typeof formulario.envioActivo !== 'boolean') error('site.json → formulario.envioActivo: debe ser true o false');
if (formulario.envioActivo === false) pendiente('site.json → formulario.envioActivo es false: el formulario no enviará nada hasta tener acceso al hosting.');
const vitoria = site.sedes.find(s => s.id === 'vitoria');
const urlFamilia = fam => `/${fam.archivo}.html`;
const verTodas = fam => `Ver todas las categorías de ${fam.nombre.toLowerCase()}`;
// Texto con el que el buscador encuentra cada categoría: rótulo + H1 + keyword del plan
const textoBusqueda = (archivo, extra = '') => {
  const p = planPorArchivo.get(`${archivo}.html`);
  return [extra, p?.h1_propuesto, p?.keyword_principal?.replace(/\[.*?\]/g, '')].filter(Boolean).join(' ');
};

function modeloMenu(rutaActual) {
  const familiaActual = familias.find(f => urlFamilia(f) === rutaActual ||
    (f.tipo === 'familia' && f.categorias.some(c => `/${c.archivo}.html` === rutaActual)));
  // Todos los enlaces tienen los mismos campos: la plantilla nunca pregunta por uno que no existe
  // «oculto»: texto que completa el nombre del enlace para lectores de pantalla sin alargarlo en pantalla
  const enlace = (texto, url, extra = {}) => ({ texto, url, actual: url === rutaActual, verTodas: false, buscar: '', pdf: false, clase: '', oculto: '', ...extra });

  const grupoFamilia = fam => ({
    id: fam.id,
    nombre: fam.nombre,
    url: urlFamilia(fam),
    plegable: true,
    activa: fam === familiaActual,
    clase: '',
    enlaces: [
      enlace('Ver todas', urlFamilia(fam), { verTodas: true, oculto: ` las categorías de ${fam.nombre.toLowerCase()}` }),
      ...fam.categorias.map(c => enlace(c.menu, `/${c.archivo}.html`, { buscar: textoBusqueda(c.archivo, [fam.nombre, c.menu, ...(c.otrosNombres || [])].join(' ')) })),
    ],
  });
  const columnas = [1, 2, 3, 4].map(n => ({
    grupos: familias.filter(f => f.tipo === 'familia' && f.columnaMenu === n).map(grupoFamilia),
  }));
  const directas = familias.filter(f => f.tipo === 'directa');
  columnas[3].grupos.push(
    { id: 'otros-equipos', nombre: 'Otros equipos', url: null, plegable: false, activa: directas.includes(familiaActual), clase: '',
      enlaces: directas.map(f => enlace(f.nombre, urlFamilia(f), { buscar: textoBusqueda(f.archivo, f.nombre) })) },
    { id: 'servicios', nombre: 'Servicios', url: null, plegable: false, activa: false, clase: ' megamenu__grupo--no-movil',
      enlaces: [enlace('Fabricación a medida', '/fabricaciones-a-medida.html'), enlace('Nuevos productos', '/nuevos-productos.html')] },
    // En tableta (768-1279 px) estos enlaces salen de la barra y pasan al panel (arquitectura.md §2)
    { id: 'empresa', nombre: 'Empresa', url: null, plegable: false, activa: false, clase: ' megamenu__grupo--tableta',
      enlaces: [enlace('Empresa', '/empresa.html'), enlace('Asturias (Oviedo)', '/oviedo/')] },
    { id: 'catalogos', nombre: 'Catálogos PDF', url: null, plegable: false, activa: false, clase: '',
      enlaces: site.catalogos.map(c => enlace(c.titulo.replace(/^Catálogo de /, '').replace(/^./, l => l.toUpperCase()), urlPublica(c.pdf), { pdf: true })) },
  );
  return {
    columnas,
    secundarios: [
      enlace('Fabricación a medida', '/fabricaciones-a-medida.html', { clase: 'menu__item--secundario' }),
      enlace('Empresa', '/empresa.html', { clase: 'menu__item--secundario' }),
      enlace('Asturias', '/oviedo/', { clase: 'menu__item--secundario' }),
      enlace('Contacto', '/contacto/contacto.html', { clase: '' }),
    ],
    familias: familias.map(f => ({ nombre: f.nombre, url: urlFamilia(f) })),
    catalogos: site.catalogos.map(c => ({ titulo: c.titulo, url: urlPublica(c.pdf) })),
    sedes: site.sedes.map(s => ({ ...s, corta: s.localidad.replace(/-Gasteiz$/, '') })),
    telPrincipal: vitoria.tel,
    telefonoPrincipal: vitoria.telefono,
    email: vitoria.email,
    logo,
    logoFondoOscuro,
    barraMovil: barraMovil(rutaActual),
  };
}

// Barra fija «Llamar · Pedir presupuesto» en móvil (revision-sesion-b.md, decisión 2): en todas las páginas salvo las
// de /contacto/ (ya son el formulario). En /oviedo/ llama a la delegación de Oviedo; en el resto, a Vitoria.
function barraMovil(rutaActual) {
  if (rutaActual.startsWith('/contacto/')) return null;
  const sede = rutaActual === '/oviedo/' ? site.sedes.find(s => s.id === 'oviedo') : vitoria;
  return { tel: sede.tel, telefono: sede.telefono, localidad: sede.localidad.replace(/-Gasteiz$/, '') };
}

const presupuestoUrl = nombre => `/contacto/contacto.html?producto=${encodeURIComponent(nombre)}#formulario`;

// =====================================================================
// 7. Schema (JSON-LD): docs/schema.md
// =====================================================================
const organizacionRef = () => ({ '@type': 'Organization', '@id': `${host}/#organizacion`, name: site.nombre, url: `${host}/` });

// Grafo común de cualquier página: organización (referencia salvo en el inicio), WebPage, migas (si hay
// más de una: el inicio no lleva) y, si se pasa, un ItemList (productos o categorías) como entidad principal.
// «nodos»: nodos extra (LocalBusiness de las sedes, Organization completa…).
function schemaPagina(pagina, { itemList = null, organizacion = organizacionRef(), nodos = [] } = {}) {
  const conMigas = pagina.migas.length > 1;
  const grafo = [
    organizacion,
    ...nodos,
    {
      '@type': 'WebPage',
      '@id': `${pagina.canonical}#pagina`,
      url: pagina.canonical,
      name: pagina.title,
      description: pagina.meta,
      inLanguage: site.idioma,
      publisher: { '@id': `${host}/#organizacion` },
      ...(conMigas ? { breadcrumb: { '@id': `${pagina.canonical}#migas` } } : {}),
      ...(itemList ? { mainEntity: { '@id': `${pagina.canonical}#lista` } } : {}),
    },
  ];
  if (conMigas) {
    grafo.push({
      '@type': 'BreadcrumbList',
      '@id': `${pagina.canonical}#migas`,
      itemListElement: pagina.migas.map((m, i) => ({ '@type': 'ListItem', position: i + 1, name: m.nombre, item: `${host}${m.url}` })),
    });
  }
  // Nada de Product ni Offer (no hay precios): ItemList con el nombre y la URL de cada elemento
  if (itemList) {
    grafo.push({
      '@type': 'ItemList',
      '@id': `${pagina.canonical}#lista`,
      name: pagina.h1,
      numberOfItems: itemList.length,
      itemListOrder: 'https://schema.org/ItemListUnordered',
      itemListElement: itemList.map((e, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: e.nombre,
        url: e.url,
        ...(e.imagen ? { image: `${host}${e.imagen.src}` } : {}),
      })),
    });
  }
  // «<» escapado: un texto con «</script>» nunca puede cerrar la etiqueta antes de tiempo
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': grafo }, null, 2).replace(/</g, '\\u003c');
}

const schemaCategoria = pagina => schemaPagina(pagina, {
  itemList: pagina.productos.length
    ? pagina.productos.map(p => ({ nombre: p.nombre, url: `${pagina.canonical}#${p.ancla}`, imagen: p.imagen }))
    : null,
});

// Migas: [{nombre, url}] → con «actual» en la última
function migasDe(...niveles) {
  const migas = [{ nombre: 'Inicio', url: '/' }, ...niveles];
  migas.forEach((m, i) => { m.actual = i === migas.length - 1; });
  return migas;
}

// Comprobaciones contra el plan (plan-paginas.csv) y reglas SEO (AGENTS.md §3.2) comunes a todas las plantillas
function comprobarPlan(ctx, archivo, datos) {
  const filaPlan = planPorArchivo.get(archivo);
  if (!filaPlan) { error(`${ctx}: ${archivo} no está en plan-paginas.csv`); return null; }
  for (const [campo, col] of [['title', 'title_nuevo_propuesto'], ['meta', 'meta_nueva_propuesta'], ['h1', 'h1_propuesto']]) {
    if (datos[campo] !== filaPlan[col]) aviso(`${ctx}: ${campo} distinto del de plan-paginas.csv («${datos[campo]}» / «${filaPlan[col]}»)`);
  }
  return filaPlan;
}
function comprobarIntro(ctx, intro) {
  revisarEtiquetas(intro || '', `${ctx} → intro`);
  const palabras = contarPalabras(intro || '');
  if (palabras < 120 || palabras > 200) pendiente(`${ctx}: la intro tiene ${palabras} palabras (deben ser 120-200)`);
}

// =====================================================================
// 8. Páginas de categoría
// =====================================================================
const ETIQUETAS_TEXTO = new Set(['p', 'strong', 'em', 'br', 'a', 'ul', 'ol', 'li', 'sup', 'sub', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'caption']);
function revisarEtiquetas(html, contexto, permitidas = ETIQUETAS_TEXTO) {
  for (const m of html.matchAll(/<\/?([a-z0-9]+)([^>]*)>/gi)) {
    const n = m[1].toLowerCase();
    if (!permitidas.has(n)) aviso(`${contexto}: etiqueta <${n}> no permitida en textos (datos.md)`);
    if (/\s(style|class)\s*=/i.test(m[2])) aviso(`${contexto}: atributo style/class en <${n}> (los estilos los pone la plantilla)`);
  }
}

function modeloCategoria(archivo, { datos, familia }) {
  const ruta = `/${archivo}.html`;
  const ctx = `data/categorias/${archivo}.json`;
  for (const campo of ['title', 'meta', 'h1', 'intro', 'productos']) {
    if (datos[campo] === undefined) error(`${ctx}: falta el campo obligatorio «${campo}»`);
  }
  if (datos._borrador) pendiente(`${ctx}: sigue marcado como _borrador (lo quita la Persona B al revisarlo)`);
  comprobarIntro(ctx, datos.intro);
  if (datos.cuerpo) revisarEtiquetas(datos.cuerpo, `${ctx} → cuerpo`);

  const anclas = new Set();
  const productos = (datos.productos || []).map((p, i) => {
    const c = `${ctx} → productos[${i}] «${p.nombre}»`;
    for (const campo of ['nombre', 'modelo', 'texto', 'specs', 'img', 'alt', 'pdf']) {
      if (p[campo] === undefined) error(`${c}: falta el campo «${campo}» (puede ser null, pero debe estar)`);
    }
    if (p.img && !p.alt) error(`${c}: tiene imagen y no tiene alt`);
    if (p.alt && /BROTOTERMIC/i.test(p.alt)) aviso(`${c}: el alt no debe incluir «BROTOTERMIC»`);
    // D-014: el alt lleva el modelo o la designación que aparece en el nombre (CNM 10, PTC, IP44, ATEX…)
    if (p.img && p.alt) {
      const codigos = `${p.nombre} ${p.modelo || ''}`.split(/[\s/,()·]+/).map(t => t.replace(/[.:;]+$/, ''))
        .filter(t => /[A-Z]{2,}|\d/.test(t) && /^[A-Z0-9][A-Za-z0-9.-]*$/.test(t));
      const plano = s => s.toLowerCase().replace(/[\s-]/g, '');
      const faltan = codigos.filter(t => !plano(p.alt).includes(plano(t)));
      if (faltan.length) pendiente(`${c}: el alt no contiene ${faltan.join(', ')} (D-014: el alt empieza por el nombre y el modelo)`);
    }
    revisarEtiquetas(p.texto || '', c);
    // Ancla única: «copa-sumergible», y «-2», «-3»… si el nombre se repite
    let ancla = slug(p.nombre) || `producto-${i + 1}`;
    for (let n = 2; anclas.has(ancla); n++) ancla = `${slug(p.nombre)}-${n}`;
    anclas.add(ancla);
    const specs = p.specs || [];
    const specsTabla = specs.length > 0 && typeof specs[0] === 'object';
    return {
      ...p,
      ancla,
      imagen: imagen(p.img, c),
      extra: (p.imgExtra || []).map(x => ({ ...x, imagen: imagen(x.img, c) })),
      // El modelo solo se muestra aparte si no forma ya parte del nombre («Modelos NA, OV, T»)
      mostrarModelo: Boolean(p.modelo) && !p.nombre.includes(p.modelo),
      specsTabla,
      specsLista: specs.length > 0 && !specsTabla && !p.specsNumeradas,
      specsListaNumerada: specs.length > 0 && !specsTabla && Boolean(p.specsNumeradas),
      // Lista que ya trae su número en el texto («1. Base soldada…», remite a la imagen): sin viñeta, texto literal
      specsConNumero: specs.length > 0 && !specsTabla && specs.every(s => /^\d+\s*[.)-]/.test(String(s))),
      pdfUrl: p.pdf ? urlPublica(p.pdf) : null,
      // Si el texto original ya enlaza el PDF («Ver Ficha Técnica.»), no se añade un segundo enlace igual
      mostrarPdf: Boolean(p.pdf) && !(p.texto || '').includes(`href="${urlPublica(p.pdf)}"`),
      presupuestoUrl: presupuestoUrl(p.nombre),
    };
  });

  const esDirecta = familia.tipo === 'directa';
  const migas = esDirecta
    ? migasDe({ nombre: categorias.get(archivo).menu, url: ruta })
    : migasDe({ nombre: familia.nombre, url: urlFamilia(familia) }, { nombre: categorias.get(archivo).menu, url: ruta });

  // Hermanas: las otras categorías de la familia (en una directa, las otras directas)
  const hermanas = esDirecta
    ? familias.filter(f => f.tipo === 'directa').map(f => ({ menu: f.nombre, url: urlFamilia(f) }))
    : familia.categorias.map(c => ({ menu: c.menu, url: `/${c.archivo}.html` }));
  hermanas.forEach(h => { h.actual = h.url === ruta; });

  const relacionadas = (datos.relacionadas || []).map(a => {
    const p = planPorArchivo.get(`${a}.html`);
    if (!p) { error(`${ctx} → relacionadas: «${a}» no es ninguna página del plan`); return null; }
    return { nombre: p.h1_propuesto, url: `/${a}.html` };
  }).filter(Boolean);

  const canonical = `${host}${ruta}`;
  const pagina = {
    ruta,
    canonical,
    title: datos.title,
    meta: datos.meta,
    h1: datos.h1,
    intro: datos.intro,
    cuerpo: datos.cuerpo ?? null,
    imagenesCuerpo: (datos.imagenesCuerpo || []).map(x => ({ ...x, imagen: imagen(x.img, `${ctx} → imagenesCuerpo`) })),
    documentos: (datos.documentos || []).map(d => ({ ...d, url: urlPublica(d.pdf) })),
    productos,
    migas,
    hermanas,
    relacionadas,
    familia: esDirecta
      ? { nombre: 'Otros equipos', url: null, verTodas: null }
      : { nombre: familia.nombre, url: urlFamilia(familia), verTodas: verTodas(familia) },
    ogImagen: productos.find(p => p.imagen)?.imagen ? `${host}${productos.find(p => p.imagen).imagen.src}` : null,
  };
  pagina.schema = schemaCategoria(pagina);

  const filaPlan = comprobarPlan(ctx, `${archivo}.html`, datos);
  if (filaPlan && filaPlan.num_productos !== '' && Number(filaPlan.num_productos) !== productos.length) {
    error(`${ctx}: tiene ${productos.length} productos y el plan dice ${filaPlan.num_productos} (no se puede perder ninguno)`);
  }

  return pagina;
}

// Imagen representativa de una categoría (tarjetas): la del primer producto con foto o, si no hay
// productos, la primera del texto general. Solo se usa como ilustración: el enlace ya lleva el nombre.
function imagenDeCategoria(archivo) {
  const datos = categorias.get(archivo)?.datos;
  if (!datos) return null;
  const img = datos.productos.find(p => p.img)?.img || (datos.imagenesCuerpo || [])[0]?.img;
  return img ? imagen(img, `data/categorias/${archivo}.json`) : null;
}

// =====================================================================
// 8b. Páginas de familia (NUEVAS: no existían en /legacy)
// =====================================================================
function modeloFamilia(fam) {
  const ruta = urlFamilia(fam);
  const ctx = `data/familias.json → ${fam.id}`;
  for (const campo of ['title', 'meta', 'h1', 'intro', 'resumen']) {
    if (!fam[campo]) error(`${ctx}: falta el campo «${campo}»`);
  }
  if (fam._borrador) pendiente(`${ctx}: sigue marcado como _borrador (lo quita la Persona B al revisarlo)`);
  comprobarIntro(ctx, fam.intro);
  comprobarPlan(ctx, `${fam.archivo}.html`, fam);

  const tarjetas = fam.categorias.map(c => {
    if (!c.resumen) error(`${ctx} → ${c.archivo}: falta el «resumen» de la tarjeta`);
    else if (longitud(c.resumen) > 120) aviso(`${ctx} → ${c.archivo}: el resumen tiene ${longitud(c.resumen)} caracteres (máx. 120)`);
    const n = categorias.get(c.archivo)?.datos?.productos.length || 0;
    return {
      nombre: c.menu,
      url: `/${c.archivo}.html`,
      resumen: c.resumen,
      imagen: imagenDeCategoria(c.archivo),
      nota: n ? `${n} producto${n === 1 ? '' : 's'}` : null,
    };
  });
  const canonical = `${host}${ruta}`;
  const pagina = {
    ruta,
    canonical,
    title: fam.title,
    meta: fam.meta,
    h1: fam.h1,
    intro: fam.intro,
    imagen: fam.img ? { ...imagen(fam.img, ctx), alt: fam.alt } : null,
    migas: migasDe({ nombre: fam.nombre, url: ruta }),
    tituloTarjetas: `Categorías de ${fam.nombre.toLowerCase()}`,
    tarjetas,
    // Catálogo PDF de la familia (site.json → catalogos[].familias)
    catalogos: site.catalogos.filter(c => c.familias.includes(fam.id)).map(c => ({ titulo: c.titulo, url: urlPublica(c.pdf) })),
    otrasFamilias: familias.filter(f => f !== fam).map(f => ({ nombre: f.nombre, url: urlFamilia(f) })),
    ogImagen: tarjetas.find(t => t.imagen) ? `${host}${tarjetas.find(t => t.imagen).imagen.src}` : null,
  };
  pagina.schema = schemaPagina(pagina, {
    itemList: tarjetas.map(t => ({ nombre: t.nombre, url: `${host}${t.url}` })),
  });
  return pagina;
}

// =====================================================================
// 8c. Páginas con texto de /content (servicio, sede, contacto, legales): datos.md §5
// =====================================================================
const ETIQUETAS_CONTENIDO = new Set([...ETIQUETAS_TEXTO, 'h2', 'h3', 'img', 'figure', 'figcaption']);

// Lee content/<slug>.html: bloque de metadatos (comentario inicial, «clave: valor») y cuerpo HTML.
// Las marcas [REVISIÓN CLIENTE] se listan como aviso y, como todo comentario, no llegan al HTML final.
// <img src="/images/…" alt="…"> se completa con width, height, loading y el WebP si existe.
// Devuelve null si el archivo aún no existe (la página queda pendiente).
function leerContenido(slug) {
  const ruta = `content/${slug}.html`;
  const abs = path.join(RAIZ, ruta);
  if (!fs.existsSync(abs)) return null;
  let texto = fs.readFileSync(abs, 'utf8');
  if (texto.charCodeAt(0) === 0xfeff) { error(`${ruta}: tiene BOM; debe guardarse como UTF-8 sin BOM`); texto = texto.slice(1); }
  const cab = texto.match(/^\s*<!--([\s\S]*?)-->/);
  if (!cab) throw new ErrorFatal(`${ruta}: falta el bloque de metadatos (<!-- title: … -->) al principio`);
  const meta = {};
  for (const l of cab[1].split(/\r?\n/)) {
    const m = l.match(/^\s*([\w-]+):\s*(.*?)\s*$/);
    if (m) meta[m[1]] = m[2];
  }
  let cuerpo = texto.slice(cab[0].length);
  for (const m of cuerpo.matchAll(/<!--\s*\[REVISIÓN CLIENTE\]([\s\S]*?)-->/g)) aviso(`${ruta}: [REVISIÓN CLIENTE] ${m[1].trim()}`);
  // «<!-- bloque: nombre -->» parte el texto en bloques que la plantilla coloca por separado (inicio, sede)
  cuerpo = cuerpo.replace(/<!--\s*bloque:\s*([\w-]+)\s*-->/g, '\u0000$1\u0000');
  cuerpo = cuerpo.replace(/<!--[\s\S]*?-->/g, '').trim();
  revisarEtiquetas(cuerpo.replace(/\u0000[\w-]+\u0000/g, ''), ruta, ETIQUETAS_CONTENIDO);
  const imagenes = [];
  cuerpo = cuerpo.replace(/<img\b([^>]*)>/gi, (etiqueta, attrs) => {
    const src = (attrs.match(/\ssrc="([^"]+)"/) || [])[1];
    const alt = (attrs.match(/\salt="([^"]*)"/) || [])[1];
    if (!src || alt === undefined) { error(`${ruta}: <img> sin src o sin alt: ${etiqueta}`); return etiqueta; }
    // En /images/ o, si es una imagen antigua conservada con su URL original (D-011), en /oviedo/images/
    if (!src.startsWith('/images/') && !IMAGENES_CONSERVADAS.has(decodeURI(src))) { error(`${ruta}: la imagen ${src} no está en /images/ ni entre las conservadas de /legacy`); return etiqueta; }
    const sinExt = decodeURI(src).replace(/\.(jpe?g|png|gif)$/i, '');
    const img = imagen(src.startsWith('/images/') ? sinExt.slice('/images/'.length) : sinExt.slice(1), ruta);
    if (!img) return '';
    imagenes.push(img);
    return `<picture>${img.webp ? `<source type="image/webp" srcset="${img.webp}">` : ''}` +
      `<img src="${img.src}" width="${img.ancho}" height="${img.alto}" alt="${alt}" loading="lazy" decoding="async"></picture>`;
  });
  const [principal, ...trozos] = cuerpo.split('\u0000');
  const bloques = {};
  for (let i = 0; i < trozos.length; i += 2) bloques[trozos[i]] = trozos[i + 1].trim();
  return { ruta, meta, cuerpo: principal.trim(), bloques, imagenes };
}

// Bloque obligatorio de un texto de /content (inicio, sede): error claro si falta
function bloque(c, nombre) {
  if (!(nombre in c.bloques)) { error(`${c.ruta}: falta el bloque «<!-- bloque: ${nombre} -->»`); return ''; }
  return c.bloques[nombre];
}

// Schema completo de la organización y de cada sede (schema.md §3 y §4). Lo que no tiene dato se omite.
const direccionPostal = s => ({
  '@type': 'PostalAddress', streetAddress: s.direccion, postalCode: s.cp,
  addressLocality: s.localidad, addressRegion: s.provincia, addressCountry: s.pais,
});
const idSede = s => (s.id === 'vitoria' ? `${host}/#sede-vitoria` : `${host}${s.pagina}#sede-${s.id}`);
const AREA_SEDE = { vitoria: 'País Vasco', oviedo: 'Asturias' }; // provincias limítrofes: pendiente 12 de AGENTS.md
function schemaSede(s) {
  const foto = s.foto ? imagen(s.foto, `site.json → sedes.${s.id}.foto`) : null;
  return {
    '@type': 'LocalBusiness',
    '@id': idSede(s),
    name: `${site.nombre} — ${s.localidad}`,
    parentOrganization: { '@id': `${host}/#organizacion` },
    url: `${host}${s.pagina}`,
    telephone: s.tel,
    email: s.email,
    ...(foto ? { image: `${host}${foto.src}` } : {}),
    address: direccionPostal(s),
    ...(s.geo ? { geo: { '@type': 'GeoCoordinates', latitude: s.geo.lat, longitude: s.geo.lng } } : {}),
    ...(s.mapaUrl ? { hasMap: s.mapaUrl } : {}),
    ...(s.horario ? { openingHours: s.horario } : {}),
    areaServed: AREA_SEDE[s.id],
  };
}
function schemaOrganizacion() {
  const vit = site.sedes.find(s => s.id === 'vitoria');
  return {
    '@type': 'Organization',
    '@id': `${host}/#organizacion`,
    name: site.nombre,
    legalName: site.razonSocial,
    taxID: site.cif,
    url: `${host}/`,
    logo: `${host}${encodeURI(site.logo)}`,
    foundingDate: String(site.fundacion),
    email: vit.email,
    telephone: vit.tel,
    address: direccionPostal(vit),
    contactPoint: site.sedes.map(s => ({
      '@type': 'ContactPoint', telephone: s.tel, email: s.email, contactType: 'sales', areaServed: 'ES', availableLanguage: 'es',
    })),
    subOrganization: site.sedes.map(s => ({ '@id': idSede(s) })),
  };
}

// Sedes con su foto (bloque de sedes del inicio, empresa, contacto)
let sedesConFoto = null;
const sedes = () => (sedesConFoto ??= site.sedes.map(s => ({
  ...s,
  imagen: s.foto ? imagen(s.foto, `site.json → sedes.${s.id}.foto`) : null,
})));

// Mapa web: TODAS las páginas del plan, generado desde familias.json (orden del menú) y plan-paginas.csv.
// Los rótulos son los H1 del plan (contienen la keyword de cada página). Se comprueba que no falte ninguna.
function mapaWeb() {
  const h1 = archivo => planPorArchivo.get(archivo)?.h1_propuesto || archivo;
  // «otrosNombres» (familias.json): rótulos con los que la web antigua enlazaba la página («Niveles de boya»)
  const alias = archivo => categoriasPorArchivo.get(archivo.replace(/\.html$/, ''))?.otrosNombres || [];
  const li = (archivo, hijos = '') => `<li><a href="${escaparHtml(rutaPublica(archivo))}">${escaparHtml(h1(archivo))}</a>` +
    `${alias(archivo).length ? ` (${escaparHtml(alias(archivo).join(', '))})` : ''}${hijos}</li>`;
  const ul = items => `<ul>${items.join('')}</ul>`;
  const enMapa = new Set();
  const usar = a => { enMapa.add(a); return a; };
  const productos = familias.map(f => f.tipo === 'familia'
    ? li(usar(`${f.archivo}.html`), ul(f.categorias.map(c => li(usar(`${c.archivo}.html`)))))
    : li(usar(`${f.archivo}.html`)));
  const grupos = [
    ['Productos', productos],
    ['Empresa y servicios', ['index.html', 'empresa.html', 'fabricaciones-a-medida.html', 'nuevos-productos.html'].map(a => li(usar(a)))],
    ['Contacto y sedes', ['contacto/contacto.html', 'oviedo/index.html'].map(a => li(usar(a)))],
    ['Información legal', ['privacidad.html', 'cookies.html', 'mapa-web.html'].map(a => li(usar(a)))],
  ];
  for (const f of plan) if (!enMapa.has(f.archivo)) error(`mapa-web: la página ${f.archivo} del plan no aparece en el mapa web`);
  return grupos.map(([titulo, items]) => `<h2>${titulo}</h2>${ul(items)}`).join('\n');
}

// Tarjetas de las 8 familias (4 con página + 4 directas), en el orden de familias.json (inicio y /oviedo/)
// Imagen de la tarjeta: «imgTarjeta» de familias.json (recortes de tools/datos/imagenes.json; revision-sesion-b.md,
// R-06 y R-09), si no «img», y si no la foto del primer producto. La misma en el inicio y en /oviedo/.
function tarjetasFamilias() {
  return familias.map(f => {
    const esFamilia = f.tipo === 'familia';
    if (!f.resumen) error(`data/familias.json → ${f.id}: falta el «resumen» de la tarjeta`);
    const n = esFamilia ? f.categorias.length : categorias.get(f.archivo)?.datos?.productos.length || 0;
    const img = f.imgTarjeta || f.img;
    return {
      nombre: f.nombre,
      url: urlFamilia(f),
      resumen: f.resumen,
      imagen: img ? imagen(img, `data/familias.json → ${f.id}`) : imagenDeCategoria(esFamilia ? f.categorias[0].archivo : f.archivo),
      nota: n ? `${n} ${esFamilia ? 'categorías' : 'productos'}` : null,
    };
  });
}

// Hero del inicio con srcset (WebP + JPG). Producción: slide-1 a 480 y 910 px (D-004; su URL antigua sigue
// publicada). Demostración (modo preview): la imagen de tools/datos/demo a 480/910/1600 px (D-016), nunca en producción.
function heroInicio(c) {
  const srcset = (base, anchos, ext) => anchos.map(a => `${base}-${a}.${ext} ${a}w`).join(', ');
  const sizes = '100vw'; // el hero va a todo el ancho
  if (PREVIA) {
    const anchos = [480, 910, 1600];
    const base = '/images/demo/hero-calefactor-inmersion';
    const m = medidasImagen(path.join(RAIZ, 'tools', 'datos', 'demo', 'hero-calefactor-inmersion-1600.jpg'));
    return { src: `${base}-910.jpg`, ancho: m.ancho, alto: m.alto, srcsetJpg: srcset(base, anchos, 'jpg'), srcsetWebp: srcset(base, anchos, 'webp'),
      sizes, fondoBlanco: false, alt: 'Ilustración de un calefactor de inmersión con brida, caja de conexiones roja y haz de tubos calefactores' };
  }
  // El src y la versión de 910 px son la URL indexada /images/slide-1.jpg; el srcset añade la de 480 px y el WebP
  for (const n of ['slide-1.webp', 'slide-1-480.webp', 'slide-1-480.jpg']) {
    if (!fs.existsSync(path.join(RAIZ, 'images', n))) error(`images/${n} no existe (node tools/imagenes.js slide-1)`);
  }
  const m = medidasImagen(path.join(RAIZ, 'images', 'slide-1.jpg')) || { ancho: 910, alto: 426 };
  return { src: '/images/slide-1.jpg', ancho: m.ancho, alto: m.alto,
    srcsetJpg: '/images/slide-1-480.jpg 480w, /images/slide-1.jpg 910w',
    srcsetWebp: '/images/slide-1-480.webp 480w, /images/slide-1.webp 910w', sizes, fondoBlanco: true, alt: c.meta['hero-alt'] || '' };
}
// Diapositivas 2 y 3 del hero rotativo (fotos reales de /legacy, sin ampliar: el controlador TKC con su sonda y la
// gama de sensores de nivel). Van en un <template>: el JS las añade tras la carga; sin JS o con movimiento reducido,
// solo se ve la primera. Decorativas (alt vacío): el hero ya tiene su alt y el texto no cambia.
function diapositivasHero() {
  const sizes = '100vw';
  return ['slide-3', 'slide-4'].map(n => {
    for (const f of [`${n}.webp`, `${n}-480.webp`, `${n}-480.jpg`]) {
      if (!fs.existsSync(path.join(RAIZ, 'images', f))) error(`images/${f} no existe (node tools/imagenes.js ${n})`);
    }
    return { src: `/images/${n}.jpg`, ancho: 910, alto: 426, sizes,
      srcsetJpg: `/images/${n}-480.jpg 480w, /images/${n}.jpg 910w`, srcsetWebp: `/images/${n}-480.webp 480w, /images/${n}.webp 910w` };
  });
}

// Inicio: los textos salen de content/inicio.html (bloques); tarjetas, marcas, catálogos y sedes, de /data
function modeloInicio() {
  const c = leerContenido('inicio');
  if (!c) return null;
  for (const campo of ['title', 'meta', 'h1']) if (!c.meta[campo]) error(`${c.ruta}: falta «${campo}» en los metadatos`);
  if (c.meta.borrador === 'si') pendiente(`${c.ruta}: sigue marcado como borrador (lo quita la Persona B al revisarlo)`);
  comprobarPlan(c.ruta, 'index.html', c.meta);
  const hero = heroInicio(c);
  const pagina = {
    ruta: '/',
    canonical: `${host}/`,
    title: c.meta.title,
    meta: c.meta.meta,
    h1: c.meta.h1,
    migas: migasDe(),
    hero,
    diapositivas: site.efectos?.heroRotativo === false ? [] : diapositivasHero(),
    texto: Object.fromEntries(['hero', 'empresa', 'medida', 'novedades', 'catalogos', 'marcas', 'sedes'].map(b => [b, bloque(c, b)])),
    tarjetas: tarjetasFamilias(),
    fundacion: site.fundacion,
    numMarcas: site.marcas.length,
    marcas: site.marcas,
    marcasImagen: imagen('brototermic-marcas-representadas', c.ruta),
    marcasGris: imagen('brototermic-marcas-representadas-gris', c.ruta),
    catalogos: site.catalogos.map(k => ({ titulo: k.titulo, url: urlPublica(k.pdf) })),
    sectores: sectoresInicio(),
    sedes: sedes(),
    // Miniaturas decorativas (el título de cada bloque ya dice lo que es): foto de producto sin atribuir fabricación
    // propia (D-013), el chiller ENR de nuevos productos en lugar de la foto de archivo (decisión 6 de
    // revision-sesion-b.md) y las portadas de los dos PDF (provisional hasta confirmar su vigencia con el cliente).
    miniaturas: {
      medida: imagen('brototermic-calefactor-inmersion', c.ruta),
      novedades: imagen('equipos-de-refrigeracion', c.ruta),
      catalogos: imagen('portada-catalogos-260', c.ruta),
    },
    ogImagen: hero && !PREVIA ? `${host}${hero.src}` : null,
  };
  if (!pagina.hero?.alt) error(`${c.ruta}: falta «hero-alt» (alt de slide-1) en los metadatos`);
  pagina.schema = schemaPagina(pagina, { organizacion: schemaOrganizacion(), nodos: site.sedes.map(schemaSede) });
  return pagina;
}

// Bloque de sectores del inicio (arquitectura.md, «Bloque de sectores»): solo sectores que aparecen en /legacy, sin
// URLs nuevas; cada uno enlaza a la página existente de la que sale el dato, con su H1 como texto del enlace.
function sectoresInicio() {
  return (site.sectores || []).map((s, i) => {
    const ruta = path.join(RAIZ, 'data', 'categorias', `${s.categoria}.json`);
    if (!s.nombre || !fs.existsSync(ruta)) { error(`data/site.json → sectores[${i}]: falta el nombre o no existe data/categorias/${s.categoria}.json`); return null; }
    return { nombre: s.nombre, url: `/${s.categoria}.html`, destino: JSON.parse(fs.readFileSync(ruta, 'utf8')).h1 };
  }).filter(Boolean);
}

// Formulario de presupuesto (contacto y /oviedo/): todo sale de site.json → formulario
function modeloFormulario(mensajeInicial = '') {
  const tipos = formulario.tiposAdjunto || [];
  const nombres = tipos.map(t => t.replace(/^\./, '').toUpperCase());
  return {
    accion: formulario.accion,
    envioActivo: formulario.envioActivo === true,
    maxMB: formulario.maxAdjuntoMB,
    accept: tipos.join(','),
    tiposTexto: nombres.length > 1 ? `${nombres.slice(0, -1).join(', ')} o ${nombres.at(-1)}` : nombres.join(''),
    mensajeInicial,
  };
}

// Contacto: entradilla de content/contacto.html + formulario + sedes, con las dos LocalBusiness
function modeloContacto() {
  const pagina = modeloContenido('contacto', 'contacto/contacto.html');
  if (!pagina) return null;
  pagina.sedes = sedes();
  pagina.form = modeloFormulario();
  pagina.schema = schemaPagina(pagina, { nodos: site.sedes.map(schemaSede) });
  return pagina;
}

// Sede de Oviedo (/oviedo/): landing de la delegación con su LocalBusiness
function modeloSede() {
  const c = leerContenido('oviedo');
  if (!c) return null;
  for (const campo of ['title', 'meta', 'h1']) if (!c.meta[campo]) error(`${c.ruta}: falta «${campo}» en los metadatos`);
  if (c.meta.borrador === 'si') pendiente(`${c.ruta}: sigue marcado como borrador (lo quita la Persona B al revisarlo)`);
  comprobarPlan(c.ruta, 'oviedo/index.html', c.meta);
  const sede = sedes().find(s => s.id === 'oviedo');
  const pagina = {
    ruta: '/oviedo/',
    canonical: `${host}/oviedo/`,
    title: c.meta.title,
    meta: c.meta.meta,
    h1: c.meta.h1,
    migas: migasDe({ nombre: c.meta.miga || c.meta.h1, url: '/oviedo/' }),
    texto: Object.fromEntries(['hero', 'valores', 'ofrecemos', 'medida', 'novedades', 'catalogos'].map(b => [b, bloque(c, b)])),
    sede,
    tarjetas: tarjetasFamilias(),
    marcas: site.marcas,
    catalogos: site.catalogos.map(k => ({ titulo: k.titulo, url: urlPublica(k.pdf) })),
    sedes: [sede],
    form: modeloFormulario('Consulta para la delegación de Oviedo (Asturias):\n'),
    ogImagen: sede.imagen ? `${host}${sede.imagen.src}` : null,
  };
  pagina.schema = schemaPagina(pagina, { nodos: [schemaSede(site.sedes.find(s => s.id === 'oviedo'))] });
  return pagina;
}

// Páginas noindex, sin canonical, sin JSON-LD y fuera del sitemap y de plan-paginas.csv (no son URLs indexables):
// 404.html (propuesta del §12 aprobada el 2026-10-10; Apache la sirve con ErrorDocument, src/.htaccess) y las
// páginas de respuesta del formulario.
// Las páginas de respuesta del formulario (contacto/gracias.html y contacto/error.html, a las que redirige
// src/contacto/enviar.php) siguen el mismo patrón: noindex, sin canonical, fuera del sitemap y del plan.
const PAGINAS_NOINDEX = [
  { slug: '404', ruta: '/404.html', migas: [] },
  { slug: 'gracias', ruta: '/contacto/gracias.html', migas: [{ nombre: 'Contacto', url: '/contacto/contacto.html' }] },
  { slug: 'error', ruta: '/contacto/error.html', migas: [{ nombre: 'Contacto', url: '/contacto/contacto.html' }] },
];
function modeloNoindex({ slug, ruta, migas }) {
  const c = leerContenido(slug);
  if (!c) return null;
  for (const campo of ['title', 'meta', 'h1']) if (!c.meta[campo]) error(`${c.ruta}: falta «${campo}» en los metadatos`);
  return {
    ruta,
    canonical: null,
    noindex: true,
    title: c.meta.title,
    meta: c.meta.meta,
    h1: c.meta.h1,
    contenido: c.cuerpo,
    migas: migasDe(...migas, { nombre: c.meta.miga || c.meta.h1, url: ruta }),
    sedes: null,
    mapa: null,
    ogImagen: null,
    schema: null,
  };
}

// Página de servicio o legal: el texto entero sale de content/<slug>.html
function modeloContenido(slug, archivo) {
  const c = leerContenido(slug);
  if (!c) return null;
  for (const campo of ['title', 'meta', 'h1']) if (!c.meta[campo]) error(`${c.ruta}: falta «${campo}» en los metadatos`);
  if (c.meta.borrador === 'si') pendiente(`${c.ruta}: sigue marcado como borrador (lo quita la Persona B al revisarlo)`);
  comprobarPlan(c.ruta, archivo, c.meta);
  const ruta = rutaPublica(archivo);
  const pagina = {
    ruta,
    canonical: `${host}${ruta}`,
    title: c.meta.title,
    meta: c.meta.meta,
    h1: c.meta.h1,
    contenido: c.cuerpo,
    // «miga»: nombre corto en las migas (arquitectura.md §3); si falta, el H1
    migas: migasDe({ nombre: c.meta.miga || c.meta.h1, url: ruta }),
    sedes: c.meta.sedes === 'si' ? sedes() : null,
    mapa: slug === 'mapa-web' ? mapaWeb() : null,
    ogImagen: c.imagenes[0] ? `${host}${c.imagenes[0].src}` : null,
  };
  pagina.schema = schemaPagina(pagina);
  return pagina;
}

// =====================================================================
// 9. Generación
// =====================================================================
// /dist y /dist-es se vacían enteros: solo deben contener lo que se sube al servidor (tools/comprobar-publicable.js)
function limpiarDist() {
  for (const dir of PREVIA ? [DIST] : [DIST, DIST_ES]) {
    fs.mkdirSync(dir, { recursive: true });
    for (const e of fs.readdirSync(dir)) fs.rmSync(path.join(dir, e), { recursive: true, force: true });
  }
}

function escribir(rutaPublicaPagina, html) {
  const archivo = rutaPublicaPagina.endsWith('/') ? `${rutaPublicaPagina}index.html` : rutaPublicaPagina;
  const destino = path.join(DIST, archivo);
  fs.mkdirSync(path.dirname(destino), { recursive: true });
  fs.writeFileSync(destino, html);
}

// Comprueba el HTML YA GENERADO (no los datos): lo que se publica es esto
function validarHtml(pagina, html, generadas) {
  const c = `dist${pagina.ruta}`;
  const h1 = (html.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) error(`${c}: tiene ${h1} <h1> (debe tener exactamente 1)`);
  if (longitud(pagina.title) > 60) error(`${c}: title de ${longitud(pagina.title)} caracteres (máx. 60)`);
  const lm = longitud(pagina.meta);
  if (lm < 140 || lm > 155) error(`${c}: meta description de ${lm} caracteres (140-155)`);
  for (const marca of ['[POR VERIFICAR', '(dato externo']) {
    if (html.includes(marca)) pendiente(`${c}: contiene «${marca}»`);
  }
  for (const m of html.matchAll(/<!--\s*\[REVISIÓN CLIENTE\]([^>]*?)-->/g)) aviso(`${c}: [REVISIÓN CLIENTE]${m[1]}`);
  if (/callto:/i.test(html)) error(`${c}: contiene un enlace callto: (usar tel:+34…)`);

  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]));
  // srcset: «url 480w, url 910w» → una URL por candidata
  const urls = [...html.matchAll(/\s(href|src|srcset)="([^"]+)"/g)]
    .flatMap(m => (m[1] === 'srcset' ? m[2].split(',').map(x => x.trim().split(/\s+/)[0]) : [m[2]]));
  for (const original of urls) {
    const url = original.replace(/&amp;/g, '&');
    if (/^(https?:|mailto:|tel:|data:)/.test(url)) continue;
    if (url.startsWith('#')) {
      if (!ids.has(url.slice(1))) error(`${c}: el ancla ${url} no existe en la página`);
      continue;
    }
    if (!url.startsWith('/')) { error(`${c}: enlace relativo «${url}» (las rutas deben ser absolutas desde la raíz)`); continue; }
    const ruta = decodeURI(url.split(/[?#]/)[0]);
    if (IMAGENES_CONSERVADAS.has(ruta)) continue; // imagen antigua conservada (D-011): build.js la copia de /legacy
    if (ruta.startsWith('/images/demo/')) {
      // Hero de la demostración (D-016): vive en tools/datos/demo y solo existe en modo preview
      if (!PREVIA || !fs.existsSync(path.join(RAIZ, 'tools', 'datos', 'demo', ruta.slice('/images/demo/'.length)))) error(`${c}: no existe ${ruta}`);
    } else if (ruta.startsWith('/assets/') || ruta.startsWith('/images/')) {
      if (!fs.existsSync(path.join(RAIZ, ruta))) error(`${c}: no existe ${ruta}`);
    } else if (ruta.startsWith('/docs/')) {
      if (!ruta.endsWith('.pdf') || !fs.existsSync(path.join(RAIZ, ruta))) error(`${c}: el PDF ${ruta} no existe en /docs`);
    } else if (!generadas.has(ruta)) {
      if (rutasPlan.has(ruta)) enlacesPendientes.add(ruta);
      else error(`${c}: enlace roto a ${ruta} (no está en el plan de páginas)`);
    }
  }
}
const enlacesPendientes = new Set();

function main() {
  cargarPlantillas();
  limpiarDist();

  const paginas = [];
  const inicio = modeloInicio();
  if (inicio) paginas.push({ plantilla: 'inicio', pagina: inicio });
  for (const fam of familias.filter(f => f.tipo === 'familia')) paginas.push({ plantilla: 'familia', pagina: modeloFamilia(fam) });
  for (const [archivo, cat] of categorias) {
    if (cat.datos) paginas.push({ plantilla: 'categoria', pagina: modeloCategoria(archivo, cat) });
  }
  // Servicio y legales: una página por fila del plan con esa plantilla, si ya existe su content/<slug>.html
  for (const fila of plan.filter(f => f.plantilla === 'servicio' || f.plantilla === 'legal')) {
    const pagina = modeloContenido(fila.archivo.replace(/\.html$/, ''), fila.archivo);
    if (pagina) paginas.push({ plantilla: fila.plantilla, pagina });
  }
  const contacto = modeloContacto();
  if (contacto) paginas.push({ plantilla: 'contacto', pagina: contacto });
  const oviedo = modeloSede();
  if (oviedo) paginas.push({ plantilla: 'sede', pagina: oviedo });
  for (const def of PAGINAS_NOINDEX) {
    const p = modeloNoindex(def);
    if (p) paginas.push({ plantilla: 'legal', pagina: p });
    else if (def.slug !== '404') error(`content/${def.slug}.html no existe: enviar.php redirige a ${def.ruta}`);
  }
  for (const p of paginas) p.pagina = { noindex: false, ...p.pagina };

  // Un mismo alt en fotos DISTINTAS es casi siempre un alt copiado de otro producto (casos PNWB y Sielco D1 de /legacy):
  // pendiente de revisar (aviso en piloto, error en publicación). La misma foto con el mismo alt en dos páginas, sí vale.
  const fotosPorAlt = new Map();
  for (const [archivo, { datos }] of categorias) {
    for (const p of datos?.productos || []) {
      if (!p.img || !p.alt) continue;
      if (!fotosPorAlt.has(p.alt)) fotosPorAlt.set(p.alt, new Map());
      fotosPorAlt.get(p.alt).set(p.img, `${archivo} → «${p.nombre}»`);
    }
  }
  for (const [alt, fotos] of fotosPorAlt) {
    if (fotos.size > 1) pendiente(`alt «${alt}» repetido en fotos distintas: ${[...fotos.values()].join(', ')} (cada foto necesita su alt)`);
  }

  // Title y meta únicos entre todas las páginas generadas
  for (const campo of ['title', 'meta']) {
    const vistos = new Map();
    for (const { pagina } of paginas) {
      if (vistos.has(pagina[campo])) error(`${campo} repetido en ${pagina.ruta} y ${vistos.get(pagina[campo])}`);
      vistos.set(pagina[campo], pagina.ruta);
    }
  }

  const generadas = new Set(paginas.map(p => p.pagina.ruta));
  const anio = new Date().getFullYear();
  for (const { plantilla, pagina } of paginas) {
    const html = renderizar(plantilla, { site, pagina, menu: modeloMenu(pagina.ruta), recursos, anio, previa: PREVIA });
    validarHtml(pagina, html, generadas);
    escribir(pagina.ruta, html);
  }

  // Copia de recursos: /assets, /images y solo los .pdf de /docs, con su nombre exacto
  const nAssets = copiarDirectorio(path.join(RAIZ, 'assets'), path.join(DIST, 'assets'));
  for (const rel of ['assets/css/style.css', 'assets/js/menu.js']) fs.writeFileSync(path.join(DIST, rel), publicado(rel));
  const nImagenes = copiarDirectorio(path.join(RAIZ, 'images'), path.join(DIST, 'images'));
  // Imágenes antiguas que la web nueva ya no muestra, pero cuya URL puede estar indexada (decisión D-011): se
  // publican igual, sin enlazar, para que nunca den 404. Se copian de /legacy (copia byte a byte de la web actual);
  // si /images/ del repo tiene una con el mismo nombre (p. ej. retocada), manda la del repo.
  let nConservadas = 0;
  for (const { url, origen } of L.imagenesConservadas()) {
    const destino = path.join(DIST, url);
    if (fs.existsSync(destino)) continue;
    fs.mkdirSync(path.dirname(destino), { recursive: true });
    fs.copyFileSync(origen, destino);
    nConservadas++;
  }
  const nPdf = copiarDirectorio(path.join(RAIZ, 'docs'), path.join(DIST, 'docs'), f => f.toLowerCase().endsWith('.pdf'));
  if (PREVIA) {
    // Demostración: hero de demostración (D-016), cabecera noindex también en HTTP (_headers lo entienden Netlify y
    // Cloudflare Pages), robots.txt que lo bloquea todo y nada más: ni .htaccess, ni PHP, ni sitemap, ni /dist-es
    copiarDirectorio(path.join(RAIZ, 'tools', 'datos', 'demo'), path.join(DIST, 'images', 'demo'));
    fs.writeFileSync(path.join(DIST, '_headers'), '/*\n  X-Robots-Tag: noindex, nofollow\n');
    fs.writeFileSync(path.join(DIST, 'robots.txt'), 'User-agent: *\nDisallow: /\n');
    for (const a of avisos) console.log(`  AVISO  ${a}`);
    for (const e of errores) console.log(`  ERROR  ${e}`);
    console.log(`build.js (modo preview) → /dist-preview: ${generadas.size} páginas de DEMOSTRACIÓN (noindex). No se sube nunca al hosting real.`);
    if (errores.length) process.exitCode = 1;
    return;
  }
  if (fs.existsSync(path.join(RAIZ, 'src', '.htaccess'))) {
    fs.copyFileSync(path.join(RAIZ, 'src', '.htaccess'), path.join(DIST, '.htaccess'));
    // La CSP solo admite el script en línea de head.html por su hash: si cambia el script, el hash debe cambiar
    const enLinea = fs.readFileSync(path.join(RAIZ, 'src', 'partials', 'head.html'), 'utf8').match(/<script>([\s\S]*?)<\/script>/);
    if (enLinea) {
      const hash = `'sha256-${crypto.createHash('sha256').update(enLinea[1]).digest('base64')}'`;
      if (!fs.readFileSync(path.join(RAIZ, 'src', '.htaccess'), 'utf8').includes(hash)) {
        error(`src/.htaccess: la CSP no tiene el hash del script en línea de src/partials/head.html; debe ser ${hash}`);
      }
    }
  } else pendiente('src/.htaccess aún no existe (tarea A-1-09): /dist sale sin redirecciones.');
  // Script del formulario (AGENTS.md §2): SOLO enviar.php. config.example.php no se publica; la configuración real
  // vive en el servidor, fuera del docroot. Mientras envioActivo sea false, el botón está desactivado.
  fs.copyFileSync(path.join(RAIZ, 'src', 'contacto', 'enviar.php'), path.join(DIST, 'contacto', 'enviar.php'));
  // Docroot del .es (docs/publicacion.md §2.4): solo su .htaccess
  if (fs.existsSync(path.join(RAIZ, 'src', 'es', '.htaccess'))) fs.copyFileSync(path.join(RAIZ, 'src', 'es', '.htaccess'), path.join(DIST_ES, '.htaccess'));
  else error('src/es/.htaccess no existe: el .es se quedaría sin sus redirecciones.');

  // sitemap.xml: solo URLs canónicas que existen (páginas generadas + PDF públicos), nunca una URL redirigida
  const pdfs = fs.readdirSync(path.join(RAIZ, 'docs')).filter(f => f.toLowerCase().endsWith('.pdf')).sort();
  const urlsSitemap = [...paginas.filter(p => !p.pagina.noindex).map(p => p.pagina.canonical), ...pdfs.map(f => `${host}/docs/${f}`)];
  const xmlEscapar = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  fs.writeFileSync(path.join(DIST, 'sitemap.xml'),
    '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urlsSitemap.map(u => `  <url><loc>${xmlEscapar(encodeURI(u))}</loc></url>`).join('\n') + '\n</urlset>\n');
  fs.writeFileSync(path.join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${host}/sitemap.xml\n`);

  // Auditoría de paridad SEO contra /legacy (tools/auditoria-seo.js). Primero, sus pruebas de mutación
  // (tools/test-auditor.js): si el auditor no detecta alguna página estropeada a propósito, su resultado no vale y el
  // build falla en CUALQUIER modo. Después, en publicación, cualquier ERROR de la auditoría detiene el build.
  // --sin-auditoria: SOLO para las reconstrucciones automáticas de npm run dev (la auditoría tarda ~20 s). No se admite
  // en modo publicación: ahí la auditoría es obligatoria.
  if (SIN_AUDITORIA) {
    aviso('Auditoría SEO omitida (reconstrucción rápida de npm run dev): npm run test la pasa completa.');
  } else {
    const prueba = require('./tools/test-auditor.js').ejecutar({ modo: MODO });
    if (!prueba.ok) prueba.fallos.forEach(f => error(`test-auditor: mutación no detectada: ${f} (el auditor no es fiable)`));
    console.log(`test-auditor: ${prueba.total - prueba.fallos.length}/${prueba.total} mutaciones detectadas.`);
    const auditoria = prueba.base;
    for (const f of auditoria.filas.filter(x => x.estado === 'ERROR')) {
      const fallos = Object.entries(f.checks).filter(([, c]) => c.estado === 'ERROR').map(([k, c]) => `${k}: ${c.texto}`).join('; ');
      (PUBLICAR ? error : aviso)(`Auditoría SEO ${f.url} → ${fallos} (detalle: node tools/auditoria-seo.js)`);
    }
    console.log(`Auditoría SEO: ${auditoria.resumen.OK} OK · ${auditoria.resumen.AVISO} AVISO · ${auditoria.resumen.ERROR} ERROR`);
  }

  // Resumen
  const faltan = plan.filter(f => !generadas.has(rutaPublica(f.archivo)));
  // Validación 1 (datos.md §6): ninguna página fuera del plan, salvo la 404
  for (const r of generadas) if (!rutasPlan.has(r) && !PAGINAS_NOINDEX.some(p => p.ruta === r)) error(`dist${r}: página generada que no está en plan-paginas.csv`);
  if (faltan.length) pendiente(`Generadas ${generadas.size} de ${plan.length} páginas del plan; faltan ${faltan.length}.`);
  if (enlacesPendientes.size) {
    pendiente(`${enlacesPendientes.size} enlaces internos apuntan a páginas del plan que aún no se generan` +
      (PUBLICAR ? `: ${[...enlacesPendientes].join(', ')}` : ' (normal en modo piloto).'));
  }
  for (const p of site.pendientes || []) aviso(`Dato externo pendiente de confirmar por el cliente: site.${p}`);

  console.log(`build.js (modo ${MODO}) → /dist: ${generadas.size} página(s), ${nAssets} archivos de /assets, ${nImagenes} imágenes (+${nConservadas} antiguas conservadas sin enlazar), ${nPdf} PDF; /dist-es: .htaccess del .es.`);
  // Lo que se sube al servidor: solo lo publicable (lista blanca). Cualquier otro archivo es error en cualquier modo.
  for (const p of require('./tools/comprobar-publicable.js').comprobar().problemas) error(`No publicable: ${p}`);
  for (const a of avisos) console.log(`  AVISO  ${a}`);
  for (const e of errores) console.log(`  ERROR  ${e}`);
  if (errores.length) {
    console.log(`\n${errores.length} error(es). /dist no es válido.`);
    process.exitCode = 1;
  } else {
    console.log(`\nSin errores${avisos.length ? ` (${avisos.length} avisos)` : ''}.`);
  }
}

try {
  main();
} catch (e) {
  if (e instanceof ErrorFatal) {
    console.error(`ERROR  ${e.message}`);
    process.exit(1);
  }
  throw e;
}
