# Contrato de datos: /data y /content

> **Este documento es el CONTRATO entre las dos personas.** La Persona A programa `build.js` y las plantillas contra este esquema; la Persona B rellena los archivos siguiendo este esquema. Cualquier cambio de campo se acuerda entre las dos y se cambia **aquí y en `build.js` en el mismo PR**.
>
> Reglas generales: [AGENTS.md](../AGENTS.md). Lista de páginas: [plan-paginas.csv](plan-paginas.csv).

## Convenciones

- Archivos JSON en **UTF-8 sin BOM**, indentados con 2 espacios, sin comentarios (JSON estándar).
- Los nombres de campo van en minúsculas, en español y en camelCase (`nombreCorto`).
- **Rutas:** siempre absolutas desde la raíz pública (`/images/…`, `/docs/…`, `/resistencias-inmersion.html`).
- **Imágenes (`img`):** nombre base **sin extensión** de un archivo de `/images/`. `build.js` busca `/images/<img>.jpg` (obligatorio: si falta, da error) y, opcionalmente, `/images/<img>.webp` con las mismas medidas (si existe, lo sirve con `<picture>`). Se usan las imágenes **originales a su tamaño real**, sin ampliar (decisión del HITO-1).
- **Textos con formato (`texto`, `intro`, `cuerpo`):** fragmento HTML con estas etiquetas permitidas: `p`, `strong`, `em`, `br`, `a`, `ul`, `ol`, `li`, `sup`, `sub`, `table`, `thead`, `tbody`, `tr`, `th`, `td`, `caption`. Nada de `style`, `class`, `h1`–`h6` ni `img` (los títulos e imágenes los pone la plantilla). `build.js` avisa si encuentra otra etiqueta.
- **[POR VERIFICAR]:** si un texto contiene `[POR VERIFICAR` o `(dato externo`, `build.js` lo avisa en el modo normal y **falla** en el modo de publicación (`node build.js --publicar`).
- **[REVISIÓN CLIENTE]:** solo en los textos legales de `/content`, dentro de un comentario HTML (`<!-- [REVISIÓN CLIENTE] motivo -->`). `build.js` quita los comentarios del HTML final, lista cada marca como aviso y **no bloquea** la publicación.
- «Quién» indica quién rellena el campo: **A** (técnica) o **B** (contenido). Si un campo está vacío, **B** lo pide a **A** o al revés; nadie lo inventa.

## 1. `data/site.json`

Datos globales: empresa, sedes, marcas y configuración. Un solo objeto.

| Campo | Tipo | Oblig. | Ejemplo | Quién |
|---|---|---|---|---|
| `nombre` | string | sí | `"BROTOTERMIC"` | B |
| `razonSocial` | string | sí | `"BROTOTERMIC, S.L."` | B |
| `cif` | string | sí | `"B01266303"` | B |
| `registroMercantil` | string | sí | `"Registro Mercantil de Álava, tomo 820, libro 0, folio 14, hoja VI-5952"` | B |
| `fundacion` | number | sí | `1982` | B |
| `host` | string | sí | `"https://brototermic.com"` (sin barra final, sin www) | A |
| `idioma` | string | sí | `"es-ES"` | A |
| `logo` | string | sí | `"/images/logo-claro.png"`: logo de la **cabecera** (fondo blanco). Provisional hasta el SVG. `build.js` lee sus medidas. | B |
| `logoFondoOscuro` | string | sí | `"/images/logo.png"`: logo original, para el **pie** (fondo `#1d356c`). | B |
| `pendientes` | string[] | sí | `["fundacion", "sedes.vitoria.direccion"]`: datos externos que se usan pero falta que el cliente los confirme. `build.js` los lista como aviso en cada ejecución; **no bloquean** la publicación (decisión del 2026-10-09). Vacío = todo confirmado. | B |
| `sedes` | objeto[] | sí | ver tabla siguiente (exactamente 2: `vitoria` y `oviedo`) | B |
| `marcas` | objeto[] | sí | ver tabla de marcas | B |
| `catalogos` | objeto[] | sí | ver tabla de catálogos | B |
| `formulario` | objeto | sí | ver tabla del formulario | A |

`sedes[]`:

| Campo | Tipo | Oblig. | Ejemplo (Vitoria) | Quién |
|---|---|---|---|---|
| `id` | `"vitoria"` \| `"oviedo"` | sí | `"vitoria"` | B |
| `nombre` | string | sí | `"Sede central — Vitoria-Gasteiz"` | B |
| `direccion` | string | sí | `"C/ Pintor Mauro Ortiz de Urbina, 7 bajo"` (dato externo, confirmar con el cliente) | B |
| `cp` | string | sí | `"01008"` (string: conserva el 0 inicial) | B |
| `localidad` | string | sí | `"Vitoria-Gasteiz"` | B |
| `provincia` | string | sí | `"Álava"` | B |
| `pais` | string | sí | `"ES"` | B |
| `telefono` | string | sí | `"945 22 33 31"` (como se muestra) | B |
| `tel` | string | sí | `"+34945223331"` (para `tel:` y schema) | B |
| `email` | string | sí | `"info@brototermic.com"` | B |
| `pagina` | string | sí | `"/contacto/contacto.html"` (Oviedo: `"/oviedo/"`) | B |
| `mapaUrl` | string \| null | no | Enlace «Cómo llegar» a Google Maps con la dirección. Oviedo: con la dirección real (Llano Ponte 8, 33011), nunca con las coordenadas de Madrid del iframe antiguo. | B |
| `geo` | `{ "lat": number, "lng": number }` \| null | no | `{ "lat": 42.849668, "lng": -2.685874 }` [POR VERIFICAR] | B |
| `horario` | string[] \| null | no | Formato `openingHours` de schema.org: `["Mo-Fr HH:MM-HH:MM"]`. **`null` hasta que lo dé el cliente**: no hay horarios en /legacy. | B |
| `foto` | string \| null | no | `"brototermic"` (nombre base en /images) | B |
| `alt` | string \| null | si hay `foto` | `"Fachada de la oficina de BROTOTERMIC en Vitoria-Gasteiz"` | B |

`marcas[]`:

| Campo | Tipo | Oblig. | Ejemplo | Quién |
|---|---|---|---|---|
| `nombre` | string | sí | `"Ebm-Papst"` | B |
| `logo` | string \| null | no | `"/images/marcas/ebm-papst.svg"`. Si es `null`, se muestra el nombre en texto. | B |

`catalogos[]`:

| Campo | Tipo | Oblig. | Ejemplo | Quién |
|---|---|---|---|---|
| `titulo` | string | sí | `"Catálogo de instrumentación"` | B |
| `pdf` | string | sí | `"/docs/catalogo-instrumentacion.pdf"` | B |
| `familias` | string[] | sí | `["controltemperatura", "controldenivel", "presionhumedad"]`: familias donde se enlaza | B |

`formulario` (decisión del 2026-10-09, revisión de Codex: **compatible con el `rd-mailform.php` actual**):

| Campo | Tipo | Oblig. | Ejemplo | Quién |
|---|---|---|---|---|
| `accion` | string | sí | `"/contacto/bat/rd-mailform.php"`: URL de envío. Hoy es la del formulario actual; si el hosting no admite adjuntos con ese script, se cambia por `"/contacto/enviar.php"` (excepción PHP aprobada) sin tocar la plantilla. | A |
| `envioActivo` | boolean | sí | `false` **hasta tener acceso al hosting** y probar el envío. Con `false`, el formulario se pinta pero no envía nada: el botón y un aviso remiten al teléfono y al email. | A |
| `maxAdjuntoMB` | number | sí | `10` [POR VERIFICAR con el cliente y con los límites de PHP del hosting]. El script de envío aplica el mismo límite en el servidor. | A |
| `tiposAdjunto` | string[] | sí | `[".pdf", ".jpg", ".jpeg", ".png", ".dwg", ".dxf"]`. Lista blanca: el script comprueba la extensión y el tipo real del archivo (`finfo`). DWG/DXF, pendiente de confirmar con el cliente. | A |

**Nombres de los campos que envía el formulario** (atributo `name`; los 5 primeros son los que ya espera `rd-mailform.php`):

| `name` | Campo | Oblig. | Nota |
|---|---|---|---|
| `form-type` | oculto | sí | Valor `contact`, como el formulario actual |
| `name` | Nombre | sí | |
| `email` | Email | sí | |
| `phone` | Teléfono | no | |
| `message` | Mensaje | sí | Se rellena con el producto si se llega desde «Pedir presupuesto» (`?producto=`) |
| `empresa` | Empresa | no | Nuevo |
| `adjunto` | Plano o foto | no | Nuevo. Exige `enctype="multipart/form-data"` |
| `rgpd` | Casilla de privacidad | sí | Nuevo. Valor `si`; el script la exige también en el servidor |
| `web` | Campo trampa | — | Nuevo. Oculto por CSS; si llega relleno, el envío se descarta |

## 2. `data/familias.json`

Array ordenado: **el orden del array es el orden del megamenú, del inicio y del mapa web**. Contiene las 4 familias con página y las 4 «directas».

| Campo | Tipo | Oblig. | Ejemplo | Quién |
|---|---|---|---|---|
| `id` | string | sí | `"resistencias-electricas"` | B |
| `tipo` | `"familia"` \| `"directa"` | sí | `"familia"` | B |
| `archivo` | string | sí | `"resistencias-electricas"`: el `.html` sin extensión. En una «directa» es su propia página (`"ventilacion"`). | B |
| `nombre` | string | sí | `"Resistencias eléctricas"` (rótulo del menú y de las migas) | B |
| `columnaMenu` | 1 \| 2 \| 3 \| 4 | sí | `1` (ver [arquitectura.md](arquitectura.md), apartado 2) | B |
| `categorias` | objeto[] | sí si `tipo` = `familia`; `[]` si es `directa` | ver tabla siguiente | B |
| `title` | string | sí si `familia` | Ver `plan-paginas.csv` | B |
| `meta` | string | sí si `familia` | 140-155 caracteres | B |
| `h1` | string | sí si `familia` | `"Resistencias eléctricas calefactoras"` | B |
| `intro` | string (HTML) | sí si `familia` | 120-200 palabras (ver [plan-contenido.md](plan-contenido.md)) | B |
| `img` | string \| null | no | `"slide-1"` | B |
| `alt` | string \| null | si hay `img` | | B |
| `resumen` | string | sí | 1 frase (≤ 120 caracteres) para la tarjeta de familia en el inicio | B |

`categorias[]` (dentro de una familia):

| Campo | Tipo | Oblig. | Ejemplo | Quién |
|---|---|---|---|---|
| `archivo` | string | sí | `"resistencias-inmersion"`: debe existir `data/categorias/resistencias-inmersion.json` | B |
| `menu` | string | sí | `"Inmersión"` (rótulo corto en el megamenú y en las migas) | B |
| `resumen` | string | sí | 1 frase (≤ 120 caracteres) para la tarjeta de categoría en la página de familia | B |

En las «directas», `title`, `meta`, `h1` e `intro` viven en su `data/categorias/<archivo>.json`, como en cualquier categoría.

## 3. `data/categorias/<archivo>.json`

Un archivo por página de categoría (**39**). El nombre del archivo es el del `.html` sin extensión, y es lo que garantiza que la URL no cambie.

| Campo | Tipo | Oblig. | Ejemplo | Quién |
|---|---|---|---|---|
| `title` | string | sí | `"Resistencias para inmersión \| BROTOTERMIC"` (≤ 60, conserva la keyword: ver `plan-paginas.csv`) | B |
| `meta` | string | sí | 140-155 caracteres, única | B |
| `h1` | string | sí | `"Resistencias para inmersión"` | B |
| `intro` | string (HTML) | sí | 120-200 palabras, NUEVA (ver [plan-contenido.md](plan-contenido.md)) | B |
| `cuerpo` | string (HTML) \| null | no | Texto original de /legacy que no es de un producto (p. ej. el texto general de `resistencias-especiales-a-medida` o de `resistencias-atex`, o la tabla transcrita de `Tabla-fabricacion.jpg`). Se pinta entre la intro y los productos. | B |
| `documentos` | objeto[] | no | `[{ "titulo": "Acabados de cartuchos", "pdf": "/docs/Acabados-resistencias-cartucho.pdf" }]` | B |
| `relacionadas` | string[] | no | `["resistencias-atex"]`: enlaces cruzados (ver arquitectura.md, apartado 4) | B |
| `productos` | objeto[] | sí (puede ser `[]`) | ver apartado 4 | B |
| `_borrador` | boolean | no | `true` mientras la página salga del script de importación sin revisar. `build.js --publicar` falla si queda alguno. | A pone `true`; B lo quita al revisar |

## 4. Esquema de un producto (elemento de `productos[]`)

| Campo | Tipo | Oblig. | Regla | Quién |
|---|---|---|---|---|
| `nombre` | string | sí | Nombre de /legacy con las erratas corregidas. Se pinta en **H2**. El ancla es el slug del nombre (`#copa-sumergible`); si se repite en la página, se añade `-2`, `-3`… | B |
| `modelo` | string \| null | sí | Referencia o modelo tal como aparece en /legacy (`"ENR 003"`). `null` si no hay. | B |
| `texto` | string (HTML) | sí | Descripción **original** de /legacy, con las erratas corregidas. No se reescribe. | B |
| `specs` | string[] \| `{campo, valor}`[] | sí (puede ser `[]`) | Strings → lista. Objetos `{"campo": "…", "valor": "…"}` → tabla. Solo datos de /legacy o de los catálogos PDF. | B |
| `specsNumeradas` | boolean | no | `true` si la lista original va numerada porque los números remiten a la imagen (p. ej. las piezas de un cartucho). Se pinta como `<ol>`. Por defecto `false`. | B |
| `img` | string \| null | sí | Nombre base en `/images/` (sin extensión). | B |
| `alt` | string \| null | sí si hay `img` | Qué producto es y qué se ve. Sin «BROTOTERMIC, S.L.». Propuesta inicial en `plan-imagenes.csv`. | B |
| `imgExtra` | `{img, alt}`[] | no | Solo si en /legacy el producto tiene más de una imagen. | B |
| `pdf` | string \| null | sí | Ruta del PDF del producto (`"/docs/…"`) o `null`. | B |

### Ejemplo completo (`data/categorias/resistencias-tipo-cartucho.json`, recortado)

```json
{
  "title": "Resistencias tipo cartucho alta y baja carga | BROTOTERMIC",
  "meta": "Resistencias tipo cartucho de alta y baja carga, microwatt, con termopar incorporado y cartuchos expan. Amplio stock y fabricación a medida. Presupuesto.",
  "h1": "Resistencias tipo cartucho",
  "intro": "<p>…120-200 palabras…</p>",
  "cuerpo": null,
  "documentos": [
    { "titulo": "Acabados de cartuchos", "pdf": "/docs/Acabados-resistencias-cartucho.pdf" }
  ],
  "relacionadas": ["controltemperatura-sondastemperatura"],
  "productos": [
    {
      "nombre": "Microwatt",
      "modelo": null,
      "texto": "<p>Calefactor unipolar con un hilo aislado de masa y el otro a tierra soldado en el fondo. Se puede fabricar a partir de diámetro 4, con un voltaje máximo de 48 V.</p>",
      "specs": [
        "Base soldada por TIG estanca hasta una presión de 60 kg/cm2.",
        "Acero inox. 304 calibrado.",
        "Óxido de magnesio puro de granulometría controlada.",
        "Hilo calefactor níquel-cromo 80/20, punto de fusión 1400 ºC.",
        "Cable conductor."
      ],
      "specsNumeradas": true,
      "img": "brototermic-cartuchosmicrowatt",
      "alt": "Esquema de una resistencia de cartucho Microwatt con sus piezas numeradas",
      "pdf": null
    }
  ]
}
```

## 5. `/content/<slug>.html`

Fragmentos HTML (mismas etiquetas permitidas que arriba, más `h2` y `h3`) con el texto largo de las páginas que no son de categoría. Cada archivo empieza con un bloque de metadatos en un comentario HTML:

```html
<!--
title: Empresa | Distribución industrial en Vitoria | BROTOTERMIC
meta: BROTOTERMIC, antes Comercial Broto: distribución de resistencias e instrumentación para la industria del País Vasco, provincias limítrofes y Asturias.
h1: Nuestra historia
-->
<p>…</p>
```

| Archivo | Página | Plantilla | Quién |
|---|---|---|---|
| `content/inicio.html` | `/` | inicio (solo los bloques de texto; tarjetas, marcas y sedes salen de `/data`) | B |
| `content/empresa.html` | `/empresa.html` | servicio | B |
| `content/fabricaciones-a-medida.html` | `/fabricaciones-a-medida.html` | servicio | B |
| `content/nuevos-productos.html` | `/nuevos-productos.html` | servicio | B |
| `content/contacto.html` | `/contacto/contacto.html` | contacto (texto de cabecera; el formulario es de la plantilla) | B |
| `content/oviedo.html` | `/oviedo/` | sede | B |
| `content/privacidad.html` | `/privacidad.html` | legal | B |
| `content/cookies.html` | `/cookies.html` | legal | B |
| `content/mapa-web.html` | `/mapa-web.html` | legal (solo los metadatos: el listado lo genera `build.js`) | A |

## 6. Validaciones que hace `build.js` (compromiso de A)

1. Todas las páginas del `plan-paginas.csv` existen en `/dist` y no hay ninguna más (salvo `404.html` si se aprueba).
2. Title ≤ 60 caracteres, meta de 140 a 155, title y meta únicos, un solo H1 por página.
3. Cada `archivo` de `familias.json` tiene su JSON en `data/categorias/` y viceversa.
4. Toda `img` existe en `/images/` (`.jpg` obligatorio; el `.webp` es opcional).
5. Todo enlace interno apunta a una página de `/dist` o a un PDF de `/docs`.
6. Ninguna página publicada contiene `[POR VERIFICAR`, `(dato externo` ni `_borrador: true` (solo en modo `--publicar`).
