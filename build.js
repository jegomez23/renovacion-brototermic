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

const RAIZ = __dirname;
const DIST = path.join(RAIZ, 'dist');
const argModo = process.argv.find(a => a.startsWith('--modo='));
const MODO = process.argv.includes('--publicar') ? 'publicacion' : argModo ? argModo.slice(7) : 'piloto';
if (!['piloto', 'publicacion'].includes(MODO)) {
  console.error(`ERROR  modo desconocido «${MODO}»: usa --modo=piloto o --modo=publicacion`);
  process.exit(1);
}
const PUBLICAR = MODO === 'publicacion';

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
function imagen(nombre, contexto) {
  if (!nombre) return null;
  const ext = ['.jpg', '.png', '.gif'].find(e => fs.existsSync(path.join(RAIZ, 'images', `${nombre}${e}`)));
  if (!ext) { error(`${contexto}: no existe images/${nombre}.jpg`); return null; }
  const medidas = medidasImagen(path.join(RAIZ, 'images', `${nombre}${ext}`));
  if (!medidas) { error(`${contexto}: no se pueden leer las medidas de images/${nombre}${ext}`); return null; }
  const tieneWebp = fs.existsSync(path.join(RAIZ, 'images', `${nombre}.webp`));
  return {
    src: urlPublica(`/images/${nombre}${ext}`),
    webp: tieneWebp ? urlPublica(`/images/${nombre}.webp`) : null,
    ancho: medidas.ancho,
    alto: medidas.alto,
  };
}

// =====================================================================
// 6. Modelo común: menú, pie y recursos
// =====================================================================
const recursos = {
  css: `/assets/css/style.css?v=${hashArchivo(path.join(RAIZ, 'assets/css/style.css'))}`,
  js: `/assets/js/menu.js?v=${hashArchivo(path.join(RAIZ, 'assets/js/menu.js'))}`,
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
      ...fam.categorias.map(c => enlace(c.menu, `/${c.archivo}.html`, { buscar: textoBusqueda(c.archivo, `${fam.nombre} ${c.menu}`) })),
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
  };
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
function revisarEtiquetas(html, contexto) {
  for (const m of html.matchAll(/<\/?([a-z0-9]+)([^>]*)>/gi)) {
    const n = m[1].toLowerCase();
    if (!ETIQUETAS_TEXTO.has(n)) aviso(`${contexto}: etiqueta <${n}> no permitida en textos (datos.md)`);
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
// 9. Generación
// =====================================================================
function limpiarDist() {
  fs.mkdirSync(DIST, { recursive: true });
  for (const e of fs.readdirSync(DIST)) {
    if (e === '.gitkeep') continue;
    fs.rmSync(path.join(DIST, e), { recursive: true, force: true });
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
  for (const m of html.matchAll(/\s(?:href|src|srcset)="([^"]+)"/g)) {
    const url = m[1].replace(/&amp;/g, '&');
    if (/^(https?:|mailto:|tel:|data:)/.test(url)) continue;
    if (url.startsWith('#')) {
      if (!ids.has(url.slice(1))) error(`${c}: el ancla ${url} no existe en la página`);
      continue;
    }
    if (!url.startsWith('/')) { error(`${c}: enlace relativo «${url}» (las rutas deben ser absolutas desde la raíz)`); continue; }
    const ruta = decodeURI(url.split(/[?#]/)[0]);
    if (ruta.startsWith('/assets/') || ruta.startsWith('/images/')) {
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
  for (const fam of familias.filter(f => f.tipo === 'familia')) paginas.push({ plantilla: 'familia', pagina: modeloFamilia(fam) });
  for (const [archivo, cat] of categorias) {
    if (cat.datos) paginas.push({ plantilla: 'categoria', pagina: modeloCategoria(archivo, cat) });
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
    const html = renderizar(plantilla, { site, pagina, menu: modeloMenu(pagina.ruta), recursos, anio });
    validarHtml(pagina, html, generadas);
    escribir(pagina.ruta, html);
  }

  // Copia de recursos: /assets, /images y solo los .pdf de /docs, con su nombre exacto
  const nAssets = copiarDirectorio(path.join(RAIZ, 'assets'), path.join(DIST, 'assets'));
  const nImagenes = copiarDirectorio(path.join(RAIZ, 'images'), path.join(DIST, 'images'));
  const nPdf = copiarDirectorio(path.join(RAIZ, 'docs'), path.join(DIST, 'docs'), f => f.toLowerCase().endsWith('.pdf'));
  if (fs.existsSync(path.join(RAIZ, 'src', '.htaccess'))) fs.copyFileSync(path.join(RAIZ, 'src', '.htaccess'), path.join(DIST, '.htaccess'));
  else pendiente('src/.htaccess aún no existe (tarea A-1-09): /dist sale sin redirecciones.');

  // sitemap.xml: solo URLs canónicas que existen (páginas generadas + PDF públicos), nunca una URL redirigida
  const pdfs = fs.readdirSync(path.join(RAIZ, 'docs')).filter(f => f.toLowerCase().endsWith('.pdf')).sort();
  const urlsSitemap = [...paginas.map(p => p.pagina.canonical), ...pdfs.map(f => `${host}/docs/${f}`)];
  const xmlEscapar = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  fs.writeFileSync(path.join(DIST, 'sitemap.xml'),
    '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urlsSitemap.map(u => `  <url><loc>${xmlEscapar(encodeURI(u))}</loc></url>`).join('\n') + '\n</urlset>\n');
  fs.writeFileSync(path.join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${host}/sitemap.xml\n`);

  // Auditoría de paridad SEO contra /legacy (tools/auditoria-seo.js): en publicación, cualquier ERROR detiene el build
  const { auditar } = require('./tools/auditoria-seo.js');
  const auditoria = auditar({ modo: MODO });
  for (const f of auditoria.filas.filter(x => x.estado === 'ERROR')) {
    const fallos = Object.entries(f.checks).filter(([, c]) => c.estado === 'ERROR').map(([k, c]) => `${k}: ${c.texto}`).join('; ');
    (PUBLICAR ? error : aviso)(`Auditoría SEO ${f.url} → ${fallos} (detalle: node tools/auditoria-seo.js)`);
  }
  console.log(`Auditoría SEO: ${auditoria.resumen.OK} OK · ${auditoria.resumen.AVISO} AVISO · ${auditoria.resumen.ERROR} ERROR`);

  // Resumen
  const faltan = plan.filter(f => !generadas.has(rutaPublica(f.archivo)));
  if (faltan.length) pendiente(`Generadas ${generadas.size} de ${plan.length} páginas del plan; faltan ${faltan.length}.`);
  if (enlacesPendientes.size) {
    pendiente(`${enlacesPendientes.size} enlaces internos apuntan a páginas del plan que aún no se generan` +
      (PUBLICAR ? `: ${[...enlacesPendientes].join(', ')}` : ' (normal en modo piloto).'));
  }
  for (const p of site.pendientes || []) aviso(`Dato externo pendiente de confirmar por el cliente: site.${p}`);

  console.log(`build.js (modo ${MODO}) → /dist: ${generadas.size} página(s), ${nAssets} archivos de /assets, ${nImagenes} imágenes, ${nPdf} PDF.`);
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
