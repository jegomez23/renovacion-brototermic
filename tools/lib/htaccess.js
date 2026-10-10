// Simulador MÍNIMO de un .htaccess de Apache, para que el auditor compruebe las redirecciones contra el
// archivo REAL (dist/.htaccess y dist-es/.htaccess) y no solo contra redirecciones.csv.
//
// Interpreta solo el subconjunto que usa este proyecto:
//   mod_rewrite: RewriteEngine, RewriteBase, RewriteCond (%{HTTP_HOST}, %{THE_REQUEST}, %{HTTPS}, %{REQUEST_FILENAME};
//                [NC], [OR], «!», «!=on», -d, -f), RewriteRule (patrón, «-» o destino con $n y %n; [R=nnn], [L], [NE], [NC])
//   mod_alias:   Redirect y RedirectMatch (con código 3xx y destino, o 404/410 sin destino)
//   <IfModule> se considera presente (se comprueba lo que haría el hosting con los módulos cargados).
// NO es Apache: no sustituye a tools/probar-redirecciones.sh en Docker ni a la prueba en el hosting.
// Sin dependencias: solo módulos nativos de Node.
'use strict';
const fs = require('fs');
const path = require('path');

function convertirRegex(patron, nc) {
  // Las expresiones de Apache (PCRE) que usamos son compatibles con las de JS; \xf1 = byte Latin-1 «ñ»
  return new RegExp(patron, nc ? 'i' : '');
}

function leerReglas(texto) {
  const reglas = [];
  let conds = [];
  for (let linea of texto.split(/\r?\n/)) {
    linea = linea.trim();
    if (!linea || linea.startsWith('#')) continue;
    const partes = linea.match(/("[^"]*"|\S+)/g).map(p => p.replace(/^"|"$/g, ''));
    const [dir, ...args] = partes;
    const flags = s => (s && /^\[.*\]$/.test(s) ? s.slice(1, -1).split(',').map(f => f.trim()) : []);
    if (dir === 'RewriteCond') {
      const [variable, patron, f] = args;
      conds.push({ variable, patron, flags: flags(f) });
    } else if (dir === 'RewriteRule') {
      const [patron, destino, f] = args;
      reglas.push({ tipo: 'rewrite', patron, destino, flags: flags(f), conds });
      conds = [];
    } else if (dir === 'RedirectMatch' || dir === 'Redirect') {
      const conCodigo = /^\d{3}$|^(permanent|temp|gone)$/.test(args[0]);
      const codigo = conCodigo ? ({ permanent: '301', temp: '302', gone: '410' }[args[0]] || args[0]) : '302';
      const [patron, destino] = conCodigo ? args.slice(1) : args;
      reglas.push({ tipo: dir, codigo: Number(codigo), patron, destino: destino || null });
    }
  }
  return reglas;
}

// Evalúa una condición; devuelve {ok, grupos}
function evaluarCond(c, vars) {
  const valor = c.variable.replace(/%\{(\w+)\}/g, (_, v) => vars[v] ?? '');
  const nc = c.flags.includes('NC');
  let patron = c.patron, negar = false;
  if (patron.startsWith('!')) { negar = true; patron = patron.slice(1); }
  // Pruebas de archivo: -d (carpeta), -f (archivo)
  if (patron === '-d' || patron === '-f') {
    const ok = fs.existsSync(valor) && (patron === '-d' ? fs.statSync(valor).isDirectory() : fs.statSync(valor).isFile());
    return { ok: negar ? !ok : ok, grupos: [] };
  }
  if (patron.startsWith('=')) {
    const ok = nc ? valor.toLowerCase() === patron.slice(1).toLowerCase() : valor === patron.slice(1);
    return { ok: negar ? !ok : ok, grupos: [] };
  }
  const m = valor.match(convertirRegex(patron, nc));
  return { ok: negar ? !m : Boolean(m), grupos: m && !negar ? [...m] : [] };
}

// Simula UNA petición contra un .htaccess. url: URL absoluta tal como la pide el navegador (con %xx).
// docroot: carpeta que sirve ese host. Devuelve { estado, location } o { estado: 200, archivo }.
function simular(textoHtaccess, url, docroot) {
  const u = new URL(url);
  const vars = {
    HTTP_HOST: u.host,
    HTTPS: u.protocol === 'https:' ? 'on' : 'off',
    THE_REQUEST: `GET ${u.pathname}${u.search} HTTP/1.1`,
  };
  let rutaUrl;
  try { rutaUrl = decodeURIComponent(u.pathname); } catch { rutaUrl = unescape(u.pathname); }
  // Una «%F1» (ñ en Latin-1) no es UTF-8 válido: Apache la decodifica a un byte; aquí, al carácter U+00F1,
  // que es lo que casa con «\xf1» en la expresión regular
  let ruta = rutaUrl.replace(/^\//, ''); // en un .htaccess de la raíz, RewriteRule ve la ruta sin la barra inicial
  for (const r of leerReglas(textoHtaccess)) {
    if (r.tipo === 'RedirectMatch' || r.tipo === 'Redirect') {
      const coincide = r.tipo === 'Redirect'
        ? (rutaUrl === r.patron || rutaUrl.startsWith(r.patron.replace(/\/?$/, '/')))
        : convertirRegex(r.patron).exec(rutaUrl);
      if (!coincide) continue;
      if (r.codigo >= 300 && r.codigo < 400) {
        const destino = r.tipo === 'Redirect' ? r.destino + rutaUrl.slice(r.patron.length) : r.destino.replace(/\$(\d)/g, (_, n) => coincide[n] || '');
        return { estado: r.codigo, location: destino + u.search };
      }
      return { estado: r.codigo };
    }
    // mod_rewrite: primero el patrón de la regla, luego sus condiciones (como Apache)
    const nc = r.flags.includes('NC');
    const m = convertirRegex(r.patron, nc).exec(ruta);
    if (!m) continue;
    let ok = true, grupos = [], enOr = false, okOr = false;
    vars.REQUEST_FILENAME = path.join(docroot || '', ruta).replace(/[\\/]$/, '');
    for (const c of r.conds) {
      const res = evaluarCond(c, vars);
      if (res.ok) grupos = res.grupos.length ? res.grupos : grupos;
      if (c.flags.includes('OR')) { okOr = okOr || res.ok; enOr = true; continue; }
      const efectivo = enOr ? okOr || res.ok : res.ok;
      enOr = false; okOr = false;
      if (!efectivo) { ok = false; break; }
    }
    if (!ok) continue;
    const r3 = r.flags.find(f => /^R(=\d+)?$/.test(f));
    const codigo = r3 ? Number((r3.split('=')[1]) || 302) : null;
    if (codigo && (codigo < 300 || codigo > 399)) return { estado: codigo };
    if (r.destino === '-') { if (r.flags.includes('L')) break; continue; }
    const destino = r.destino.replace(/\$(\d)/g, (_, n) => m[n] || '').replace(/%(\d)/g, (_, n) => grupos[n] || '');
    if (codigo) return { estado: codigo, location: /^https?:/.test(destino) ? destino : `https://${u.host}/${destino.replace(/^\//, '')}` };
    // Reescritura interna: se sirve otro archivo, sin redirección
    ruta = destino.replace(/^\//, '');
    if (r.flags.includes('L')) break;
  }
  let archivo = path.join(docroot, ruta);
  if (ruta === '' || ruta.endsWith('/')) archivo = path.join(archivo, 'index.html');
  return fs.existsSync(archivo) && fs.statSync(archivo).isFile() ? { estado: 200, archivo } : { estado: 404 };
}

module.exports = { simular, leerReglas };
