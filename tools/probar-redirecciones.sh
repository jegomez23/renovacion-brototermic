#!/usr/bin/env bash
# Prueba las 301 de docs/redirecciones.csv y las URL MANTENER/NUEVA de docs/inventario-urls.csv.
#
# Uso:
#   bash tools/probar-redirecciones.sh                # contra el Apache de Docker (tools/apache-pruebas)
#   bash tools/probar-redirecciones.sh --produccion   # contra los servidores reales, después de publicar
#
# En local, curl se conecta a 127.0.0.1:8080/8443 (PUERTO_HTTP / PUERTO_HTTPS) pero envía el host real
# (--connect-to), así que las reglas con %{HTTP_HOST} se prueban tal cual.
# Requiere curl y node (solo para leer los CSV). Sale con código 1 si falla alguna prueba.
set -u

RAIZ="$(cd "$(dirname "$0")/.." && pwd)"
MODO=local
[ "${1:-}" = "--produccion" ] && MODO=produccion
PUERTO_HTTP="${PUERTO_HTTP:-8080}"
PUERTO_HTTPS="${PUERTO_HTTPS:-8443}"

# Casos de prueba, uno por línea: url|código esperado|Location esperada
LEER_CSV=$(cat <<'JS'
const fs = require('fs'), path = require('path');
const raiz = process.argv[1];
function csv(archivo) {
  const t = fs.readFileSync(path.join(raiz, archivo), 'utf8').replace(/^﻿/, '');
  const filas = []; let fila = [], campo = '', q = false;
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
  return resto.filter(f => f.length > 1).map(f => Object.fromEntries(cab.map((k, i) => [k, f[i] || ''])));
}
// Codifica ñ y espacios; las URL que ya traen %xx se dejan como están
const cod = u => (u.includes('%') ? u : encodeURI(u));
// "*://(www.)dominio/ruta" = http y https, con y sin www; "*://www.dominio/ruta" = http y https
function variantes(origen) {
  let m = origen.match(/^\*:\/\/\(www\.\)([^/]+)(\/.*)$/);
  if (m) return ['http', 'https'].flatMap(p => ['', 'www.'].map(w => `${p}://${w}${m[1]}${m[2]}`));
  m = origen.match(/^\*:\/\/([^/]+)(\/.*)$/);
  if (m) return ['http', 'https'].map(p => `${p}://${m[1]}${m[2]}`);
  return [origen];
}
const casos = [];
const caso = (url, codigo, destino = '') => casos.push([cod(url), codigo, destino && cod(destino)].join('|'));
// Rutas de muestra para las reglas con comodín /*
const MUESTRAS = ['/resistencias-inmersion.html', '/docs/catalogo-instrumentacion.pdf', '/oviedo/'];
for (const r of csv('docs/redirecciones.csv')) {
  for (const url of variantes(r.origen)) {
    if (!url.endsWith('/*')) { caso(url, Number(r.tipo), r.destino); continue; }
    const base = url.slice(0, -2);
    // Regla 404 (resto del .es): ni redirige ni sirve el contenido del .com
    if (r.tipo === '404') { ['/ruta-que-no-existe.html', '/resistencias-inmersion.html', '/images/logo.png'].forEach(p => caso(base + p, 404)); continue; }
    if (r.destino.endsWith('/*')) MUESTRAS.forEach(p => caso(base + p, 301, r.destino.slice(0, -2) + p));
    else ['/ruta-que-no-existe.html', '/images/logo.png'].forEach(p => caso(base + p, 301, r.destino));
  }
}
for (const u of csv('docs/inventario-urls.csv')) if (u.estado === 'MANTENER' || u.estado === 'NUEVA') caso(u.url, 200);
// El PDF con ñ también debe responder con la codificación Latin-1 (%F1), como hoy (checklist §1)
caso('https://brototermic.com/docs/catalogo_ca%F1as_pirometricas_broto-03-02-2015.pdf', 200);
// Una URL inexistente da 404, nunca una redirección a la portada
caso('https://brototermic.com/esta-pagina-no-existe.html', 404);
// Sin listado de carpetas (la regla de mod_rewrite que sustituye a «Options -Indexes»)
caso('https://brototermic.com/images/', 404);
caso('https://brototermic.com/docs/', 404);
// Una imagen antigua que ya no se muestra sigue publicada (decisión D-011)
caso('https://brototermic.com/images/slide-2.jpg', 200);
caso('https://brototermic.com/oviedo/images/brototermic-oviedo.jpg', 200);
process.stdout.write(casos.join('\n') + '\n');
JS
)
CASOS=$(node -e "$LEER_CSV" "$RAIZ") || { echo "No se pudieron leer los CSV"; exit 1; }

peticion() { # url -> "código|location"
  local url="$1" conexion=()
  if [ "$MODO" = local ]; then
    case "$url" in
      https:*) conexion=(-k --connect-to "::127.0.0.1:$PUERTO_HTTPS") ;;
      *)       conexion=(--connect-to "::127.0.0.1:$PUERTO_HTTP") ;;
    esac
  fi
  curl -s -o /dev/null --max-time 15 "${conexion[@]}" -w '%{http_code}|%{redirect_url}' "$url"
}

total=0; fallos=0
declare -A destinos_probados=()
while IFS='|' read -r url esperado destino; do
  [ -z "$url" ] && continue
  total=$((total + 1))
  IFS='|' read -r codigo location <<< "$(peticion "$url")"
  if [ "$esperado" = 301 ]; then
    if [ "$codigo" != 301 ] || [ "$location" != "$destino" ]; then
      echo "FALLO  $url → $codigo $location (esperado: 301 $destino)"; fallos=$((fallos + 1)); continue
    fi
    # Sin cadenas: el destino responde 200 directamente (se comprueba una vez por destino)
    if [ -z "${destinos_probados[$destino]:-}" ]; then
      destinos_probados[$destino]=1
      IFS='|' read -r codigo2 location2 <<< "$(peticion "$destino")"
      if [ "$codigo2" != 200 ]; then
        echo "FALLO  destino $destino → $codigo2 $location2 (esperado: 200, sin otra redirección)"; fallos=$((fallos + 1)); continue
      fi
    fi
    echo "ok     $url → 301 $destino"
  else
    if [ "$codigo" != "$esperado" ]; then
      echo "FALLO  $url → $codigo $location (esperado: $esperado)"; fallos=$((fallos + 1)); continue
    fi
    echo "ok     $url → $codigo"
  fi
done <<< "$CASOS"

echo
echo "Modo: $MODO · $total pruebas · $fallos fallos"
[ "$fallos" -eq 0 ]
