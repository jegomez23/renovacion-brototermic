# AGENTS.md — Renovación web de BROTOTERMIC

> **Fuente única de verdad del proyecto.** Toda persona o IA (Claude, ChatGPT/Codex u otra) que trabaje en este repositorio debe leer este archivo completo antes de empezar y respetarlo. Si una decisión cambia, se actualiza este archivo **en el mismo commit** que el cambio.
>
> **AGENTS.md contiene las REGLAS y las DECISIONES. Los PLANES viven en `/docs`** (índice justo debajo). Si un documento de `/docs` contradice este archivo, manda AGENTS.md y el documento se corrige.
>
> Convenciones de marcado:
> - **[POR VERIFICAR]**: dato o decisión que no se ha podido comprobar en `/legacy` (copia de la web actual) ni en los catálogos PDF. **No se publica** hasta que alguien lo confirme y quite la marca.
> - **(dato externo, confirmar con cliente)**: dato que ha dado el cliente pero no aparece en `/legacy`. **Se usa** en la web, y queda anotado en `data/site.json → pendientes` hasta que el cliente lo confirme (decisión del 2026-10-09).
> - **[REVISIÓN CLIENTE]**: texto legal que **se publica** con la redacción propuesta, pero que el cliente o su asesor deben revisar. En `/content` va dentro de un comentario HTML (`<!-- [REVISIÓN CLIENTE] motivo -->`) para que no se vea en la página; `build.js` lo lista como aviso y **no bloquea** la publicación (decisión del 2026-10-09).
>
> Última revisión: 2026-10-09.

## Documentos del proyecto (`/docs`)

| Documento | Para qué sirve |
|---|---|
| [docs/tareas.md](docs/tareas.md) | **Por dónde empezar:** backlog por día y persona, dependencias, ruta crítica y qué se recorta si no da tiempo |
| [docs/arquitectura.md](docs/arquitectura.md) | Árbol de la web, megamenú definitivo, migas de pan y reglas de enlazado interno |
| [docs/plan-paginas.csv](docs/plan-paginas.csv) | Las 52 páginas finales: plantilla, title y meta nuevos, H1, keyword, nº de productos, prioridad, responsable y día |
| [docs/datos.md](docs/datos.md) | **Contrato entre A y B:** esquema exacto de `site.json`, `familias.json`, `categorias/*.json` y `/content` |
| [docs/diseno.md](docs/diseno.md) | Tokens (color con contrastes, tipografía, espaciado, radios, sombras, puntos de corte), componentes y wireframes de cada plantilla |
| [docs/plan-contenido.md](docs/plan-contenido.md) | Plantilla de intro con ejemplo real, **prompt estándar para IA**, lista de erratas y textos desactualizados con su propuesta |
| [docs/schema.md](docs/schema.md) | JSON-LD de cada tipo de página: campos y de dónde sale cada dato |
| [docs/plan-imagenes.csv](docs/plan-imagenes.csv) | Qué hacer con cada imagen (ORIGINAL / CONVERTIR / SUSTITUIR / ELIMINAR), si lleva retoque manual, prioridad y alt propuesto |
| [docs/redirecciones.csv](docs/redirecciones.csv) | Las 17 reglas 301 (validadas: sin cadenas ni bucles) y la regla 404 del resto del `.es` |
| [docs/inventario-urls.csv](docs/inventario-urls.csv) | **Control de la migración:** cada URL antigua o nueva con su estado (MANTENER / REDIRIGIR / NUEVA) y destino |
| [docs/inventario-imagenes.csv](docs/inventario-imagenes.csv) | Todas las imágenes de contenido de /legacy con su alt actual y las páginas donde se usan |
| [docs/checklist-publicacion.md](docs/checklist-publicacion.md) | Comprobaciones antes y después de publicar, Search Console, copia de seguridad y vuelta atrás |
| [docs/preguntas-cliente.md](docs/preguntas-cliente.md) | Mensaje único al cliente con todas las preguntas pendientes y el registro de respuestas |
| [docs/decisiones.md](docs/decisiones.md) | **Registro detallado de decisiones** (fecha, origen, qué se decide y qué documentos cambian). El resumen sigue en la sección 11 de este archivo |

---

## Índice

1. [Qué es el proyecto](#1-qué-es-el-proyecto)
2. [Objetivo y restricciones técnicas](#2-objetivo-y-restricciones-técnicas)
3. [Reglas SEO](#3-reglas-seo-prioridad-máxima-no-perder-el-posicionamiento-actual)
4. [Contenido](#4-contenido)
5. [Imágenes](#5-imágenes)
6. [Diseño](#6-diseño)
7. [Estructura de carpetas y datos](#7-estructura-de-carpetas-y-datos)
8. [Cómo trabajamos](#8-cómo-trabajamos-dos-personas-y-dos-ias)
9. [Definición de terminado](#9-definición-de-terminado)
10. [Prohibido](#10-prohibido)
11. [Decisiones tomadas](#11-decisiones-tomadas)
12. [Pendientes](#12-pendientes-por-verificar)
13. [Anexos: datos extraídos de /legacy](#13-anexos-datos-extraídos-de-legacy)

---

## 1. Qué es el proyecto

### Cliente

| Dato | Valor | Fuente |
|---|---|---|
| Razón social | BROTOTERMIC, S.L. | `/legacy` (todas las páginas) |
| CIF | B01266303 | `legacy/com/brototermic.com/privacidad.html` |
| Registro Mercantil | Álava, tomo 820, libro 0, folio 14, hoja VI-5952 | `privacidad.html` |
| Nombre de origen | «Comercial Broto» | `empresa.html` |
| Año de fundación | 1982 (dato externo, confirmar con cliente) | En `/legacy` solo aparecen «década de los 80», «más de 35 años» y «treinta y cinco años» |
| Actividad | Distribuidor B2B de resistencias eléctricas calefactoras e instrumentación industrial (temperatura, nivel, presión, humedad). Además de distribuir, hace **fabricaciones a medida**. | Brief del cliente + `/legacy` |
| Zona | País Vasco, provincias limítrofes y Asturias | `empresa.html` + delegación de Oviedo |

### Público

Departamentos de **mantenimiento, compras y oficina técnica** de empresas industriales del País Vasco, provincias limítrofes y Asturias. Saben lo que buscan: llegan por un tipo de producto o un modelo concreto y quieren confirmar que BROTOTERMIC lo suministra o lo fabrica a medida, y pedir precio.

### Objetivo de la web

1. **Generar peticiones de presupuesto** (formulario con adjunto y teléfono).
2. **Transmitir confianza técnica**: trayectoria, marcas representadas, catálogos y fabricación a medida.

**NO es un e-commerce:** no hay precios, ni carrito, ni fichas de compra.

### Sedes

| | Sede central — Vitoria-Gasteiz | Delegación — Oviedo (Asturias) |
|---|---|---|
| Dirección | C/ Pintor Mauro Ortiz de Urbina, 7 bajo (dato externo, confirmar con cliente; en `/legacy`: «Pintor Ortiz de Urbina, n. 7») | Llano Ponte nº 8 bajo |
| CP y ciudad | 01008 Vitoria-Gasteiz (Álava) | **33011** Oviedo (Asturias). La web actual pone 03011 por error en `contacto/contacto.html`. |
| Teléfono | 945 22 33 31 → `tel:+34945223331` | 629 462 642 → `tel:+34629462642` |
| Email | info@brototermic.com | brototermic@brototermic.com |
| Coordenadas (JS del mapa actual) | 42.849668, -2.685874 [POR VERIFICAR] | 43.367693, -5.847025 [POR VERIFICAR] |
| Horario | [POR VERIFICAR] | [POR VERIFICAR] |

El iframe del mapa de la página de contacto del `.es` apunta a Madrid (40.378, -3.781): es un error. El mapa de Oviedo se corrige con la dirección real (ver la sección 11).

### Marcas representadas

ElectricFor · Mesel · Disibeint · Sanara · Ebm-Papst · Eliwell · Kuhlmann Electro Heat · Remberg · Amco (las 9 están en `brototermic.com/index.html`).

### Familias de producto

| Familia | Página | Nº de categorías |
|---|---|---|
| Resistencias eléctricas | `resistencias-electricas.html` (NUEVA) | 11 |
| Control de temperatura | `controltemperatura.html` (NUEVA) | 13 |
| Control de nivel | `controldenivel.html` (NUEVA) | 9 |
| Presión y humedad | `presionhumedad.html` (NUEVA) | 2 |
| Ventilación | `ventilacion.html` (familia de una sola página, «directa») | — |
| Equipos periféricos para plástico | `equipos-perifericos.html` («directa») | — |
| Refrigeración | `equiposderefrigeracion-refrigeradores-chillers.html` («directa») | — |
| Hornos industriales | `hornos-industriales.html` («directa») | — |

El árbol completo con las 39 categorías está en [docs/arquitectura.md](docs/arquitectura.md), y los productos de cada página en el [anexo 13.2](#132-productos-por-página). En total hay **266 productos** en /legacy.

---

## 2. Objetivo y restricciones técnicas

- **Renovación completa** con diseño moderno, minimalista y profesional, 100 % responsive y *mobile-first*.
- **Lo que se sube al servidor es SOLO HTML + CSS + JavaScript vanilla** (más `.htaccess`, PDF, imágenes y fuentes). Sin CMS, sin frameworks (nada de React, Vue, Tailwind ni Bootstrap) y sin dependencias en el navegador: ni CDN, ni Google Fonts remotas, ni jQuery, ni scripts de terceros.
  - **Única excepción, APROBADA el 2026-10-09: el formulario se procesa con un único script PHP en el hosting actual** El hosting ya ejecuta PHP: el formulario actual usa `contacto/bat/rd-mailform.php`, y el nuevo envía **los mismos nombres de campo** (revisión de Codex, [docs/decisiones.md](docs/decisiones.md) D-007), así que puede usar ese script tal cual. Si al tener acceso al hosting resulta que no admite el adjunto o no cumple estos requisitos, se sustituye por `src/contacto/enviar.php` → `/contacto/enviar.php`, cambiando solo `site.json → formulario.accion`. Requisitos del script, sea cual sea:
    - **Validación en el servidor** de todos los campos, aunque el navegador ya los valide (nombre, email y mensaje obligatorios; email con formato válido; longitudes máximas). Nunca se confía en lo que llega del navegador.
    - **Adjunto:** límite de tamaño (`site.formulario.maxAdjuntoMB`) y lista blanca de tipos (`site.formulario.tiposAdjunto`), comprobando la extensión **y** el tipo real del archivo (`finfo`), no solo lo que declara el navegador. El adjunto va al email y no se guarda en el servidor.
    - **Campo trampa antispam** (honeypot): si llega relleno, se responde como si todo fuera bien y no se envía nada.
    - **Casilla RGPD** obligatoria: sin ella, el envío se rechaza también en el servidor.
    - Cabeceras de correo saneadas (sin saltos de línea en nombre, email ni asunto, para evitar la inyección de cabeceras), sin mostrar errores de PHP al usuario y sin credenciales en el repositorio (si hace falta SMTP, la configuración vive en el servidor, fuera de `/dist`).
    - Sin JS funciona igual: el formulario hace un POST normal y el script devuelve una página de éxito o de error. Con JS, solo se mejora la validación en el navegador.
    - Sin reCAPTCHA ni servicios de terceros.
- **Generador mínimo `build.js`** (Node ≥ 18, **sin dependencias npm**: solo `fs`, `path` y otros módulos nativos). Combina `/src`, `/data`, `/content`, `/assets`, `/images` y los PDF de `/docs`, y escribe HTML estático en `/dist`.
  - El menú, las migas de pan y **todos los enlaces salen escritos en el HTML final**. Nunca se inyectan con JS en el navegador, porque el SEO depende de ello.
  - El JS del navegador solo mejora la experiencia (abrir y cerrar el menú, validar el formulario). Con JS desactivado, la web se puede navegar entera.
  - Las rutas del HTML generado son **absolutas desde la raíz** (`/assets/css/style.css`, `/images/x.jpg`), porque hay páginas en subcarpetas (`/contacto/`, `/oviedo/`).
  - `build.js` valida lo descrito en [docs/datos.md](docs/datos.md), apartado 6. Tiene dos modos: **`piloto`** (por defecto: lo pendiente da aviso) y **`publicacion`** (`node build.js --modo=publicacion`, alias `--publicar`: falla si queda algún `[POR VERIFICAR`, `(dato externo`, `_borrador`, página del plan sin generar o enlace a una página pendiente).
- **Herramientas auxiliares** en `/tools` (Node sin dependencias o shell): script de importación de /legacy a JSON y pruebas de redirecciones. No se publican.
- **Hosting:** el actual, que es Apache (cabecera `Server: Apache` comprobada; el formulario actual usa PHP: `contacto/bat/rd-mailform.php`). Las redirecciones van en **`.htaccess`** (fuente: `src/.htaccess`).
- **Entorno de pruebas del `.htaccess`:** Apache en Docker (imagen oficial `httpd`), en `tools/apache-pruebas/`. Sirve `/dist` con los cuatro hosts (`brototermic.com`, `www.`, `.es` y `www.es`) por HTTP y HTTPS, y `tools/probar-redirecciones.sh` comprueba cada fila de `redirecciones.csv` y cada URL `MANTENER`. **Ningún `.htaccess` se publica sin pasar antes esta prueba.** (Decisión del 2026-10-09.)
- **Unificación de dominios:** `brototermic.com` es el principal. `www.brototermic.es` y `brototermic.es` redirigen con **301** a `https://brototermic.com/oviedo/` (landing propia de la delegación de Asturias), cada URL a su equivalente (ver [docs/redirecciones.csv](docs/redirecciones.csv)).

---

## 3. Reglas SEO (PRIORIDAD MÁXIMA: no perder el posicionamiento actual)

### 3.1 URLs

- **NO se renombra ni se borra ningún archivo `.html` existente.** Cada página nueva usa EXACTAMENTE el mismo nombre de archivo y la misma ruta que la antigua.
- **Los PDF se mantienen exactamente con su nombre y su ruta actuales, sin copias.** También los que llevan ñ (`catalogo_cañas_pirometricas_broto-03-02-2015.pdf`) o espacios (`DISPLAYS DIGITALES PROGRAMABLES BROTOTERMIC HR.pdf`). En el HTML se enlazan con la URL bien codificada (`ca%C3%B1as`, `%20`). Lo mismo para la imagen `brototermic-convertidor-señal.jpg`.
- Solo cambian las URLs duplicadas, cada una con su **301** a la versión buena: `/index.html` → `/`, `/contacto.html` → `/contacto/contacto.html`, las páginas antiguas de `/oviedo/` → `/oviedo/` (sus legales → `/privacidad.html` y `/cookies.html`), las URLs **conocidas** del `.es` → su equivalente en el `.com`, más HTTPS y el host sin www. La lista completa (17 reglas 301, validadas sin cadenas ni bucles, y 1 regla 404) está en [docs/redirecciones.csv](docs/redirecciones.csv). En la columna `origen`, `*://(www.)dominio` significa «http y https, con y sin www», y `/*` significa «cualquier otra ruta».
- **Sin comodín en el `.es`** (decisión del 2026-10-09, revisión de Codex): solo las URLs del `.es` que existían (las 7 del inventario) redirigen con 301. **Cualquier otra URL del `.es` devuelve 404**: ni se redirige a ciegas a `/oviedo/` (Google lo trataría como un «soft 404») ni se sirve el contenido del `.com` con el host `.es` (contenido duplicado).
- Reglas del `.htaccess`:
  - Las reglas específicas van **antes** que las de host y protocolo, y su destino ya es la URL final (`https://brototermic.com/…`). Así ninguna URL encadena dos redirecciones.
  - `/index.html` y `/oviedo/index.html` se redirigen comprobando `%{THE_REQUEST}`, para no entrar en bucle con `DirectoryIndex`.
  - Una URL inexistente devuelve 404, nunca una redirección a la portada.
- **[docs/inventario-urls.csv](docs/inventario-urls.csv) es el control de la migración:** 77 filas (57 MANTENER, 15 REDIRIGIR, 5 NUEVA). Antes de publicar:
  - cada URL `MANTENER` existe en `/dist`;
  - cada `REDIRIGIR` tiene su regla, y no queda ningún `[POR VERIFICAR]` en `destino_301`.

  `redirecciones.csv` lleva solo la URL de destino; la duda pendiente, si la hay, va en su columna `motivo`.

### 3.2 Etiquetas por página

Los valores propuestos de todas las páginas están en [docs/plan-paginas.csv](docs/plan-paginas.csv).

- **Title:** conserva SIEMPRE la keyword principal del title antiguo. Máximo 60 caracteres. Formato: `Producto | Familia | BROTOTERMIC`.
  - Si pasa de 60, o si el nombre del producto ya contiene la familia, se omite la familia: `Producto | BROTOTERMIC`.
  - **Si el title antiguo contenía «Vitoria», el nuevo lo conserva** con el formato `Producto | BROTOTERMIC Vitoria` (sin la familia), siempre dentro de los 60 caracteres (decisión del 2026-10-09; son 31 páginas). Si no cabe, se acorta el producto, nunca la keyword.
    - Única excepción: el **inicio**, que queda como `Componentes industriales e instrumentación | BROTOTERMIC` (56 caracteres; decisión del HITO-1). La keyword completa y la marca caben; «Vitoria» no.
  - Si el title antiguo es un error de copia-pega, la keyword se toma del H1 antiguo y se marca [POR VERIFICAR GSC]. Casos: `controldenivel-transductores-magneticos`, `controltemperatura-accesorios-sondas`.
  - **Las dos páginas «Sensores de presión» se diferencian** (decisión del 2026-10-09; las URLs no cambian): `controldenivel-sensores-de-presion.html` → title y H1 «Sensores de nivel por presión»; `presionhumedad-sensores-de-presion.html` → «Sensores de presión industriales».
  - `node tools/validar-plan.js` comprueba estas reglas sobre `plan-paginas.csv` (longitudes, duplicados, keyword y «Vitoria»). Se pasa cada vez que se toca el CSV.
- **Meta description:** nueva y **única** por página, de **140 a 155 caracteres**.
- **Un solo H1 por página.** Los nombres de producto van en **H2**.
- **Eliminar las metas obsoletas:** `keywords`, `revisit-after`, `distribution`, `robots` con valor `all`, `resource-type`, `owner`, `Author`, `Googlebot`, todas las `DC.*`, `title`/`searchtitle` y el `hreflang` actual.
- **Canonical absoluto** en todas las páginas: `https://brototermic.com/<ruta>` (sin www, sin `index.html`, sin parámetros).
- **`sitemap.xml`** (52 páginas + 8 PDF; lo genera `build.js`) y **`robots.txt`** con la línea `Sitemap:`.
- **Teléfonos con `tel:+34…`, nunca `callto:`. Emails con `mailto:`.** No se copian los enlaces sin protocolo de /legacy (`href="www.agpd.es"`).

### 3.3 Datos estructurados (JSON-LD)

Especificación completa en [docs/schema.md](docs/schema.md). Resumen:
- **Organization** completa en el inicio y como referencia en el resto de páginas.
- **Dos LocalBusiness**: Vitoria en el inicio y en contacto; Oviedo en el inicio, en contacto y en `/oviedo/`.
- **BreadcrumbList** en todas las páginas **excepto el inicio** (una miga de un solo elemento no aporta nada).
- **ItemList** de productos en las categorías y de categorías en las familias.
- **Nada de `Product` ni de `Offer`**: no hay precios.
- Si un dato no existe, la propiedad se omite. Nunca se rellena con un valor inventado.

---

## 4. Contenido

- **Las descripciones de producto existentes SE CONSERVAN.** Solo se corrigen erratas y se mejora el formato (especificaciones en tabla o lista). **No se reescriben.**
- **Cada familia y cada categoría lleva una intro NUEVA de 120 a 200 palabras** encima de los productos, en 4 bloques: qué es y para qué sirve, qué hay en la página, fabricación a medida y llamada a presupuesto. Se redacta con el **prompt estándar** de [docs/plan-contenido.md](docs/plan-contenido.md) y la revisa una persona.
- **Regla para cualquier IA: está PROHIBIDO inventar especificaciones técnicas** (medidas, IP, temperaturas, potencias, tensiones, certificaciones, homologaciones, materiales, normas, plazos, stock). Solo se usan datos presentes en `/legacy` o en los catálogos PDF. Si falta un dato, se deja fuera o se marca [POR VERIFICAR]; no se completa «por lógica».
- **Idioma:** español de España. Tono técnico, claro y cercano, **tuteando al lector** (como la web actual). Sin relleno comercial («líderes», «la mejor calidad»…).
- **Correcciones obligatorias** (detalle y texto propuesto en [docs/plan-contenido.md](docs/plan-contenido.md), apartados 3 y 4):
  - «más de 35 años» / «treinta y cinco años» → «desde 1982» (dato externo, confirmar con cliente).
  - **ATEX:** solo se actualizan las menciones **genéricas** a la normativa (la 94/9/CE fue sustituida por la 2014/34/UE). **Ninguna referencia a la certificación de un producto se cambia sin confirmación del cliente.**
  - CP de Oviedo: 33011.
  - © 2014 → año actual.
  - «Nuevos Productos 2021» → «Nuevos productos».
  - Las erratas listadas en ese documento.
- **Textos legales** (decisión del 2026-10-09):
  - **Se eliminan** el código de inscripción en la AEPD (la inscripción de ficheros desapareció con el RGPD) y las cookies de redes sociales y de terceros que la web no usa (Facebook, Twitter, Google+).
  - **El resto se marca [REVISIÓN CLIENTE]**: `www.agpd.es` → `www.aepd.es`, el «grupo BROTOTERMIC», el tratamiento de los adjuntos del formulario y la revisión general de privacidad y cookies por el asesor del cliente.

---

## 5. Imágenes

- **Ruta pública única: `/images/`**, la misma que hoy (`https://brototermic.com/images/<nombre>.jpg`). En el repositorio viven en la carpeta raíz **`/images/`**, y `build.js` las copia tal cual a `/dist/images/`. **Las imágenes nuevas (WebP, retocadas, de ambiente o logos) también van en `/images/`** (los logos de marca, en `/images/marcas/`).
- **Se mantienen las imágenes existentes con el mismo nombre base**, también las que tienen ñ o mayúsculas.
- **Se usan las imágenes originales a su tamaño real** (decisión del HITO-1, 2026-10-09; [docs/decisiones.md](docs/decisiones.md), D-005). **Se descarta la ampliación con IA** (Real-ESRGAN): una foto de 260 px ampliada inventa detalle que el producto no tiene.
  - Se muestran en un **contenedor 4:3 con `object-fit: contain` y marco blanco**, sin ampliarlas por CSS más allá de su tamaño real. Casi todas miden **260 × 168 px**.
  - **WebP opcional:** si existe `<nombre>.webp` con las mismas medidas que el JPG, `build.js` lo sirve con `<picture>`; si no, solo el JPG. No es obligatorio para las fotos de producto (pesan 8-16 KB).
  - **Retoque manual solo en 3 fotos del piloto con dominante de color**, y únicamente en **fondo e iluminación** (nunca forma, rótulos ni color del producto): `brototermic-industriaalimentaria`, `brototermic-calefactores` y `brototermic-liquidos-noagresivos` (medidas: [docs/plan-imagenes.csv](docs/plan-imagenes.csv)). El archivo retocado conserva el nombre y las medidas.
  - **Hero del inicio:** `slide-1` se sirve a **910 px** (su tamaño real), con `slide-1.webp` y `slide-1.jpg` de respaldo. Es la única imagen que se sirve a más de 480 px.
  - Las fotos mejores que pueda dar el cliente o los fabricantes (pregunta 21) sustituyen a las originales con el mismo nombre: la URL no cambia, así que no afecta al SEO.
- Todas las `<img>` llevan **`width` y `height`**, **`loading="lazy"` excepto la imagen principal (hero)**, que lleva `fetchpriority="high"`, y un **`alt` descriptivo real** (qué producto es y qué se ve), sin «BROTOTERMIC, S.L.». Los alts propuestos están en [docs/plan-imagenes.csv](docs/plan-imagenes.csv) y se revisan con la imagen delante.
- **IA solo para RETOCAR** (fondo, nitidez, ampliación). **Nunca para inventar un producto** ni cambiar su forma, sus rótulos o su color. Las imágenes de ambiente o de portada sí pueden generarse, siempre que no muestren un producto concreto como si fuera del catálogo.
- **Logo y logos de marcas en SVG cuando sea posible.** En /legacy no hay ningún SVG: el logo es `images/logo.png` (385 × 89, para fondo oscuro). El SVG se ha pedido al cliente.
- **Nombres de archivo nuevos:** minúsculas, con guiones, sin tildes ni ñ.

---

## 6. Diseño

Especificación completa (tokens, componentes y wireframes) en [docs/diseno.md](docs/diseno.md). Reglas fijas:

- **Colores** (hex exactos de /legacy; uso cerrado en la sección 11):

| Color | Uso permitido | Prohibido |
|---|---|---|
| `#004c9a` | Color principal: botones, enlaces y franja superior de la cabecera. Texto blanco encima (8,40:1). | — |
| `#1d356c` | Textos destacados, pie y hover del botón primario (blanco encima: 11,81:1) | — |
| `#36afe0`, `#2dccf0` | **Solo acentos:** líneas, iconos decorativos, estados en hover, foco sobre fondo oscuro | Texto sobre blanco (2,51:1 y 1,91:1) · fondo de botón con texto blanco |
| `#404751` | **Texto general** (9,38:1 sobre blanco) | — |
| `#5e5e5e` | Texto secundario (6,48:1) | — |
| `#72767c` | Bordes de controles de formulario (4,57:1) | — |
| `#dadada`, `#f1f1f1`, `#dae9f9`, `#ffffff` | Separadores, fondos alternos y bloques CTA | `#dadada` como borde de un control (1,40:1) |
| `#989898` | **Eliminado como color de texto** (2,88:1) | Texto |

- **Tipografía:** Lora autoalojada (WOFF2, **solo 400 y 700**, en `/assets/fonts/`) para los títulos; el texto, con la pila de fuentes del sistema.
- **Estilo:** moderno, limpio, industrial y técnico. Mucho espacio en blanco, jerarquía clara y fotografía de producto sobre fondo neutro.
- **Cabecera blanca** (decisión del HITO-1, 2026-10-09): barra principal en blanco con el logo (versión provisional para fondo claro, `images/logo-claro.png`, hasta que llegue el SVG del cliente) y una franja fina en `#004c9a` con los teléfonos y el email (≥ 768 px).
- **Componentes:** cabecera con megamenú (acordeón en móvil) y buscador de categorías, hero, tarjeta de familia, tarjeta de producto, tabla de especificaciones, botón primario y secundario, migas de pan, CTA de presupuesto, bloque de marcas, bloque de sedes, formulario y pie.
- **Formulario:** nombre, empresa, email, teléfono, mensaje, adjunto (plano o foto), casilla RGPD y campo trampa antispam. Se procesa con PHP en el hosting actual (excepción aprobada, sección 2). **Los nombres de campo son compatibles con el `rd-mailform.php` actual** (`name`, `email`, `phone`, `message`, `form-type`) más `empresa`, `adjunto` y `rgpd`; la URL de envío está en `site.json → formulario.accion`, y **no se activa el envío real hasta tener acceso al hosting** (`formulario.envioActivo: false`). Contrato en [docs/datos.md](docs/datos.md).
- **Accesibilidad del menú:** patrón *Disclosure Navigation Menu* del W3C (APG): botones con `aria-expanded` y `aria-controls`, sin `role="menu"`, Esc cierra y devuelve el foco. Movimiento reducido: `prefers-reduced-motion` anula transiciones y scroll suave. Se comprueba también a **320 px**.
- **Rendimiento:** Lighthouse en móvil ≥ 90, LCP < 2,5 s, **una sola hoja CSS**, JS con **`defer`** y ninguna petición a terceros.
- **Accesibilidad:** contraste AA, navegable con teclado y foco visible, HTML semántico y zonas táctiles de al menos 44 px.

---

## 7. Estructura de carpetas y datos

```
/
├── AGENTS.md            ← este archivo (reglas y decisiones)
├── CLAUDE.md            ← solo contiene "@AGENTS.md"
├── README.md
├── .gitignore
├── .gitattributes       ← /legacy se guarda byte a byte; formatos binarios marcados
├── build.js             ← generador (Node ≥ 18, sin dependencias npm)            [A]
├── legacy/              ← copia de la web actual. VERSIONADA. SOLO LECTURA, NUNCA se edita
│   ├── com/brototermic.com/   (incluye contacto.html, oviedo/ y sitemap.xml)
│   └── es/www.brototermic.es/
├── src/                                                                        [A]
│   ├── templates/       ← inicio, familia, categoria, servicio, contacto, sede, legal
│   ├── partials/        ← head, cabecera (megamenú), migas, cta-presupuesto, pie, schema
│   ├── contacto/enviar.php ← script PHP del formulario, solo si `rd-mailform.php` no sirve (§2)
│   └── .htaccess        ← redirecciones y configuración Apache (se copia a /dist)
├── tools/               ← no se publican                                       [A]
│   ├── validar-plan.js  ← comprueba plan-paginas.csv (title, meta, keyword, «Vitoria»)
│   ├── servir.js        ← servidor local de /dist (node tools/servir.js → http://localhost:8000)
│   ├── capturas.js      ← capturas a 360/768/1280 px y comprobaciones (scroll horizontal, consola, terceros)
│   ├── importar-legacy.js
│   ├── probar-redirecciones.sh
│   └── apache-pruebas/  ← Apache en Docker (imagen httpd) para probar el .htaccess en local
├── data/                                                                       [B]
│   ├── site.json        ← empresa, sedes, marcas, catálogos, formulario
│   ├── familias.json    ← familias, categorías y orden del megamenú
│   └── categorias/<archivo>.json   ← 39 archivos: title, meta, h1, intro, productos[]
├── content/             ← textos largos (fragmentos HTML) de inicio, servicio, sede y legales [B]
├── assets/                                                                     [A]
│   ├── css/style.css    ← UNA hoja
│   ├── js/              ← JS vanilla con defer
│   └── fonts/           ← Lora 400 y 700 en WOFF2
├── images/              ← TODAS las imágenes públicas (se publican en /images/)      [B]
├── docs/                ← PDF públicos (/docs/*.pdf) + planificación del proyecto (no se publica) [B: PDF; ambos: planes]
└── dist/                ← salida generada por build.js. NO se edita a mano. No está en git
```

### Reglas de la estructura

- **`/legacy` está versionada en git** (se añadió en un commit propio) para que las dos personas trabajen con los mismos datos aunque la web antigua desaparezca. Solo lectura. El [anexo 13.4](#134-cómo-se-descargó-legacy) explica cómo se descargó.
  - **Sin excepciones:** `/legacy` se guarda tal como se descargó, incluida la API key de Google Maps (ver §10). La reescritura del historial para quitarla se descartó el 2026-10-09 ([docs/decisiones.md](docs/decisiones.md)).
- **`data/categorias/<archivo>.json`**: el nombre es el del `.html` sin extensión. Así, `resistencias-tipo-cartucho.json` genera `/resistencias-tipo-cartucho.html`, y ninguna URL puede cambiar.
- **`/docs`** tiene dos usos, porque la URL pública de los PDF es `/docs/<nombre>.pdf`. `build.js` copia a `/dist/docs/` **solo los `.pdf`**, con su nombre exacto. Los `.md` y `.csv` son planificación y no se publican.
- **`/dist`** es lo que se sube al servidor: los `.html` (en la raíz, `/contacto/` y `/oviedo/`), `/assets/`, `/images/`, `/docs/*.pdf`, `sitemap.xml`, `robots.txt` y `.htaccess`.

### Datos: resumen del contrato

El esquema exacto (tipos, obligatoriedad, ejemplos y quién rellena cada campo) está en **[docs/datos.md](docs/datos.md)**. Es el contrato entre A y B: A programa contra él y B lo rellena. Esquema de un producto:

| Campo | Tipo | Regla |
|---|---|---|
| `nombre` | string | Obligatorio. Va en H2 y genera el ancla. |
| `modelo` | string \| null | Referencia tal como aparece en /legacy. |
| `texto` | string (HTML limitado) | Descripción **original** de /legacy, con las erratas corregidas. |
| `specs` | string[] o `{campo, valor}`[] | Lista o tabla. Solo datos de /legacy o de los catálogos. (`specsNumeradas: true` si la lista remite a números de la imagen). |
| `img` | string \| null | Nombre base sin extensión de un archivo de `/images/`. |
| `alt` | string \| null | Descripción real de la imagen. |
| `pdf` | string \| null | Ruta absoluta del PDF (`/docs/…`). |

---

## 8. Cómo trabajamos (dos personas y dos IAs)

| | Persona A (técnica) | Persona B (contenido) |
|---|---|---|
| Carpetas | `/src`, `build.js`, `/tools`, `/assets` | `/data`, `/content`, `/images`, PDF de `/docs` |
| Tareas | SEO técnico (canonical, schema, sitemap, robots), `.htaccess`, rendimiento, accesibilidad, publicación | Textos, intros, revisión de productos, imágenes y alts, estado de `plan-paginas.csv` |

- **Ninguna de las dos edita las carpetas de la otra sin avisar.** `AGENTS.md` y los planes de `/docs` son compartidos: se avisa antes de tocarlos.
- **Git:**
  - `main` siempre funciona (`node build.js` termina sin errores).
  - Una rama por tarea: `feat/…`, `content/…`, `fix/…`.
  - Pull request revisada por la otra persona.
  - Merge 2-3 veces al día.
- **Commits pequeños y en español:** `feat: plantilla de categoría`, `content: intros de resistencias`, `fix: canonical en /oviedo/`.
- **Toda IA que trabaje en el repo debe leer `AGENTS.md` antes de empezar y respetarlo.** Para saber qué hacer: [docs/tareas.md](docs/tareas.md). Para saber cómo son los datos: [docs/datos.md](docs/datos.md). Si una decisión cambia, se actualiza `AGENTS.md` en el mismo commit.
- Ante la duda, una IA **pregunta o marca [POR VERIFICAR]**; no inventa.
- **El Día 1 se hace una sola página piloto (`resistencias-inmersion.html`).** Hasta que esté aprobada no se genera ninguna otra.

---

## 9. Definición de terminado

Una página está lista cuando cumple todo esto:

- [ ] Mantiene su URL (misma ruta y nombre de archivo; `MANTENER` o `NUEVA` en el inventario).
- [ ] Tiene title, meta y H1 revisados (sección 3.2 y `plan-paginas.csv`).
- [ ] Conserva **todos** sus productos (`num_productos` de `plan-paginas.csv`).
- [ ] Las imágenes son las originales a su tamaño real (o la versión retocada de la misma medida) y tienen `alt` real, `width` y `height`.
- [ ] El schema es válido.
- [ ] Se ve bien a **320 px, 360 px, 768 px y 1280 px** (`node tools/capturas.js`).
- [ ] No tiene enlaces rotos.

---

## 10. Prohibido

- Renombrar archivos `.html` existentes (ni los PDF ni las imágenes indexadas).
- Editar `/legacy` o `/dist` a mano.
- Añadir frameworks o librerías (ni en el navegador ni como dependencia npm).
- Inventar datos técnicos.
- Borrar contenido indexado sin redirección.
- Subir credenciales al repositorio (FTP, contraseñas, claves de API, `.env`).
  - Excepción conocida: `/legacy` contiene, tal como se descargó, la API key de Google Maps (`contacto/contacto.html` del `.com`, de `/oviedo/` y del `.es`) y la *site key* de reCAPTCHA. Son claves de navegador que **ya son públicas** en la web actual; el cliente restringirá o revocará la de Maps ([docs/preguntas-cliente.md](docs/preguntas-cliente.md), pregunta 25). No se reutilizan. **No se reescribe el historial** para quitarlas: ya está en GitHub y la Persona B trabaja sobre él. El escáner de secretos de GitHub puede avisar.

---

## 11. Decisiones tomadas

| Fecha | Decisión |
|---|---|
| 2026-10-09 | **Host canónico:** `https://brototermic.com`, **sin www**, con HTTPS forzado (301). Se revisará si Search Console indica otra cosa. |
| 2026-10-09 | **Contacto:** se conserva `/contacto/contacto.html`; `/contacto.html` redirige allí con 301. |
| 2026-10-09 | **Privacidad y cookies del `.es` y de `/oviedo/`:** 301 a `/privacidad.html` y `/cookies.html`. |
| 2026-10-09 | **4 páginas de familia NUEVAS**, con nombre según el patrón de prefijos actual: `resistencias-electricas.html`, `controltemperatura.html`, `controldenivel.html`, `presionhumedad.html`. Ventilación, equipos periféricos, refrigeración y hornos siguen siendo una sola página («directas»). |
| 2026-10-09 | **Tipografía:** Lora autoalojada (WOFF2, solo 400 y 700) para los títulos; texto con la pila de fuentes del sistema. |
| 2026-10-09 | **Colores:** `#004c9a` principal (botones, enlaces, cabecera, texto blanco encima); `#1d356c` textos destacados y pie; `#36afe0` y `#2dccf0` **solo acentos**; texto general **`#404751`** (9,38:1 sobre blanco); se elimina `#989898` para texto. |
| 2026-10-09 | **Datos externos:** la fundación en 1982 y la dirección completa de Vitoria se usan marcadas como «(dato externo, confirmar con cliente)». |
| 2026-10-09 | **ATEX:** no se cambia ninguna referencia a la certificación de un producto sin confirmación del cliente; solo se actualizan las menciones genéricas a la normativa. |
| 2026-10-09 | **Mapa de Oviedo:** se corrige con la dirección real (hoy apunta a Madrid). |
| 2026-10-09 | **PDF con ñ o espacios:** se mantienen con su nombre y ruta exactos, **sin copias ni canonical**; se enlazan con la URL codificada. Sustituye a la propuesta anterior de copia sin ñ. |
| 2026-10-09 | **`/legacy` se versiona en git** en un commit propio. |
| 2026-10-09 | **Imágenes:** la ruta pública es `/images/`, también para las nuevas; desaparece `/assets/img`. |
| 2026-10-09 | **Git:** email de autor corregido para los commits nuevos. Los 3 commits iniciales conservan su autoría: **se descarta reescribir el historial** (ya estaba en GitHub y la Persona B trabaja sobre él). Detalle en [docs/decisiones.md](docs/decisiones.md). |
| 2026-10-09 | **API key de Google Maps:** se queda en `/legacy` y en el historial (ya es pública en la web actual). La restringe o revoca el cliente. Ningún commit nuevo la añade ni la reutiliza. |
| 2026-10-09 | ~~Imágenes: ampliación automática ×2 en lote y solo 480 px~~ → **sustituida** por la decisión del HITO-1 (más abajo). |
| 2026-10-09 | **Formulario:** excepción PHP **aprobada** (un único `enviar.php` en el hosting actual), con validación en el servidor, límite de tamaño y de tipos del adjunto, campo trampa y casilla RGPD (§2). |
| 2026-10-09 | **Titles con «Vitoria»:** si el title antiguo lo tenía, el nuevo lo conserva (`Producto \| BROTOTERMIC Vitoria`, ≤ 60). Excepción: el inicio, que queda como «Componentes industriales e instrumentación \| BROTOTERMIC» (HITO-1, §3.2). |
| 2026-10-09 | **«Sensores de presión»:** title y H1 diferenciados: «Sensores de nivel por presión» (control de nivel) y «Sensores de presión industriales» (presión y humedad). URLs sin cambios. |
| 2026-10-09 | **Textos legales:** se eliminan el código de inscripción en la AEPD y las cookies de redes sociales que no se usan; el resto se marca [REVISIÓN CLIENTE] (§4). |
| 2026-10-09 | **Entorno de pruebas del `.htaccess`:** Apache en Docker (imagen `httpd`) en `tools/apache-pruebas/`. |
| 2026-10-09 | **BreadcrumbList** en todas las páginas **excepto el inicio**: aprobado. |
| 2026-10-09 | **HITO-1 (decisiones del piloto, detalle en [docs/decisiones.md](docs/decisiones.md)):** cabecera blanca con logo provisional para fondo claro y franja `#004c9a`; title del inicio «Componentes industriales e instrumentación \| BROTOTERMIC»; hero `slide-1` a 910 px (WebP + JPG); **se descarta la ampliación de imágenes**: originales a tamaño real y retoque manual solo de 3 fotos (fondo e iluminación); buscador de categorías y marco blanco aprobados. |
| 2026-10-09 | **Revisión de Codex:** sin comodín en el `.es` (301 solo URLs conocidas, 404 el resto); formulario compatible con `rd-mailform.php` y sin envío real hasta tener el hosting; `build.js` con modos `piloto` y `publicacion`; bloque de sectores solo con sectores de /legacy y sin URLs nuevas; alts de RE92 y Catálogos corregidos; menú según el patrón *Disclosure Navigation* del W3C, `prefers-reduced-motion` y prueba a 320 px. |

---

## 12. Pendientes [POR VERIFICAR]

Las preguntas al cliente están redactadas en [docs/preguntas-cliente.md](docs/preguntas-cliente.md).

1. Accesos a **FTP**, **Search Console** (de los dos dominios) y **DNS/hosting del `.es`**.
2. Si la **delegación de Oviedo sigue activa**, sus horarios y los de Vitoria, y la ubicación exacta de las dos sedes.
3. **Formulario** (el procesado con PHP ya está decidido): a qué email llega, tamaño máximo del adjunto (se propone 10 MB; depende también del límite de PHP del hosting), si se aceptan DWG/DXF y plazo de respuesta.
4. Confirmación de los **datos externos**: 1982 y «C/ Pintor Mauro Ortiz de Urbina, 7 bajo».
5. **Certificaciones ATEX** vigentes de cada producto (94/9/CE o 2014/34/UE).
6. Qué productos de «Nuevos productos 2021» siguen vigentes y si hay productos descatalogados.
7. **Catálogo de resistencias vigente:** el del `.es` (`catalogo-resistencias-calefactoras.pdf`) y el del `.com` (`catalogo-Brototermic-resistencias.pdf`) no son idénticos.
8. **Logo vectorial (SVG)** propio, si el logotipo «BT» de la oficina de Oviedo está vigente, y logos oficiales de las 9 marcas.
9. **Textos legales [REVISIÓN CLIENTE]:** revisión por el asesor del cliente de lo que no se ha eliminado (`www.aepd.es`, el «grupo BROTOTERMIC», el tratamiento de los adjuntos y la revisión general).
10. Si se quiere **analítica**. Sin ella, y sin mapas incrustados ni reCAPTCHA, la web no necesita banner de cookies.
11. Keywords marcadas [POR VERIFICAR GSC] en `plan-paginas.csv` (inicio, contacto, empresa, `/oviedo/`, transductores magnéticos, accesorios para sondas).
12. Qué **provincias limítrofes** se atienden desde Vitoria (para `areaServed`).
13. **Propuestas de diseño pendientes de aprobar:** página 404 propia y el «Cómo llegar» con un enlace a Google Maps en lugar de un iframe (por rendimiento y cookies).
14. **Logo vectorial (SVG)** para fondo claro: mientras no llegue, la cabecera usa `images/logo-claro.png`, una copia del logo original con las partes blancas pasadas a `#004c9a` (provisional, pendiente de que el cliente la apruebe o la sustituya).
15. **Retoque de 3 fotos del piloto** (fondo e iluminación): lo hace la Persona B; herramienta a su elección, siempre comparando con el original.
16. **Envío real del formulario:** se activa (`envioActivo: true`) cuando haya acceso al hosting y se sepa qué admite `rd-mailform.php` (adjuntos) o se suba `enviar.php`.
17. **Docker:** no está instalado en el equipo de la Persona A. Hace falta instalar Docker Desktop para usar `tools/apache-pruebas/`.

---

## 13. Anexos: datos extraídos de /legacy

### 13.1 Qué contiene /legacy

Descargado con `wget` el 2026-10-09:
- `legacy/com/brototermic.com/`: todo lo enlazado desde la portada, más lo que estaba publicado pero no enlazado: `contacto.html`, la sección `oviedo/` (copia idéntica del `.es`) y `sitemap.xml`.
- `legacy/es/www.brototermic.es/`: la web del `.es`.

En /legacy hay **56 páginas HTML**: 48 del `.com`, 4 de `/oviedo/` y 4 del `.es`. De ellas, **48 se mantienen** en la web nueva (47 del `.com` más `/oviedo/`, que cambia de contenido pero conserva la URL) y el resto se redirige; con las 4 familias nuevas, la web nueva tiene **52 páginas**. Además hay 12 URLs de PDF (8 se mantienen) y unas 300 imágenes de contenido.

### 13.2 Productos por página

Nombres tal como aparecen en /legacy (sin corregir), en el orden de la página:

- **resistencias-inmersion** (14): Modelos NA, OV, T · Modelos DP, ED, ET · Modelos Gama Europa · Grupo Monobloc · Candelas termo con refractario · Grupos calefactores con bridas · Calentadores al paso · Copa sumergible · Calentadores para líquidos · Calentadores para líquidos agresivos · Sumergidores baños agresivos · Calentadores de inmersión fijos · Resistencias inmersion industria · Reistencias con caja conexiones IP-44
- **resistencias-calentamientoaire** (14): Resistencias para calentamiento de aire aletadas · Resistencias con racores aire reforzado · Baterías eléctricas (×4) · Conducto cilíndrico · Resistencias para horno y estufa · Resistencias de Nitruro de Boro · Resistencias Espiraladas para Hornos Industriales · Sistemas Resistencias para Tubos Radiantes · Paneles Calefactores · Sistemas Combinados · Aerotermo Industrial ATEX
- **resistencias-flexibles** (15): Conformables alto rendimiento · Elementos para desescarche · Cable calefactor de silicona · Bipolares de silicona tipo torpedo · Cable calefactor tipo paralelo · Resistencias cobre recocido · Resistencias para compresores · Cintas calefactoras alta temperatura · Cable calefactor aislamiento mineral · Cable calefactor autorregulante · Mangueras calefactoras · Laminares flexibles autoadhesivas · Banda calefactora de silicona, AFBS · Banda calefactora de silicona, AFAFS · Banda de silicona, AFHSSD
- **resistencias-infrarrojos** (17): Barritas de cuarzo · Monotubulares onda larga 77F · Monotubulares de onda media IRCM · Bitubo de onda media 77P · Emisores de onda corta IRCC · Bitubo de onda corta, modelos 81P · Equipos de calentamiento · Emisores cerámicos infrarrojos OSC / OSP / OSH / BOS · Pantallas de infrarrojos de cuarzo PQ · Infrarrojo compacto IC1003 / IC1013NG / IC1007 / IC1008 / IC1014FM
- **resistencias-tipo-cartucho** (5): Cartucho alta carga · Cartucho baja carga · Microwatt · Cartuchos con termopar · Cartuchos expan
- **resistencias-tipo-abrazadera** (7): Soporte de mica sin escafandra · Soporte de mica con escafandra · Cámara protectora de calor · Soporte de cerámica · Sistema hermético latón · Sistema hermético inoxidable · Sistema hermético alta carga
- **resistencias-planas** (2): Planas soporte de mica · Planas soporte de cerámica
- **resistencias-calefaccion-industrial** (7): Aerotermo eléctrico ANB · Aerotermo eléctrico RMO · Convectores trifásicos RIS · Convectores monofásicos CIE · Cortinas de aire caliente COR · Pantallas infrarrojos IRC · Pantallas infrarrojos IM
- **resistencias-atex** (7): Inmersión con tapón roscado RFA · Tapón roscado y vaina RFA-CS · Calentadores de bidón · Convectores zonas clasificadas FAW · Modelos zonas clasificadas FUH · Calefactores para armarios · Aerotermo Industrial ATEX
- **resistencias-especiales-a-medida** (0): texto corrido y tabla en imagen (`Tabla-fabricacion.jpg`), sin productos con nombre
- **resistencias-mantas-calefactoras** (7): Mantas calefactoras depósitos IBC · Mantas ATEX depósitos IBC · Mantas calefactoras bidón · Camisa aislante aluminio IBC · Cobertura impermeable deposito IBC · Manta aislante deposito IBC · Mantas calefactoras bidon ATEX
- **controltemperatura-sondastemperatura** (11): Termosonda en vaina metálica · Termopar cerámico alta temperatura · Termopar propósito general · Termopar bayoneta general · Termopar encamisado · Temosonda con mango · Termosonda con zócalo cerámico · Termorresistencia propósito general · Termorresistencia mineral · Sensores PTC · Sensores NTC
- **controltemperatura-convertidores** (6): Convertidor señal carril Din Slim · Convertidor señal cabezal · Convertidor Señal carril DIN CV/1 · Convertidor señal Carril Din TXrail · Convertidor carril Termo Iso-Flex · Multiplexores MUX
- **controltemperatura-cables-compensacion** (3): Cable compensación termopar · Cable termorresistencia · Cable eléctrico alta temperatura
- **controltemperatura-indicadores-de-procesos** (17): Controlador a microprocesador (×3) · Controlador IC PLUS 902 · Controlador IC PLUS 915 · Controlador carril DIN DR4020-4022 · Controlador EW72 · Controlador WAYTEK MPR48 · Controlador multilazo CMC-99 · Regulador digital RGL · Regulador DIS401 · Controlador IDW961 · Controlador ID PLUS · Modulo adquisición datos Sielco D1 · Indicador Gran formato DG-01 · Indicadores universales ITP1 · Controlador doble lazo RE92
- **controltemperatura-videoregistradores** (2): Video registrador FUJI · Video registrador OHKURA
- **controltemperatura-dataloggers** (5): Log-Tag TRIX-8 · Log-Tag HAXO-8 · Log-Tag TREX-8 · Interface LTI para Log-Tag · Datalogger USB OM-EL
- **controltemperatura-panelespc-software** (2): Panel PC · Software adquisición datos Datacare
- **controltemperatura-accesorios-sondas** (8): Conectores compensados estandar · Conectores compensados mini · Conectores compensados cerámicos · Paneles para conectores · Conectores RTD · Racores deslizantes de compresión · Cabezales conexión · Vainas y Termopozos
- **controltemperatura-sensores-infrarrojos** (7): Pistola infrarrojos LASERSIGHT · Pirómetro infrarrojos Serie CS · Pirómetro infrarrojos CS-Micro · Pirómetro infrarrojos CS-Laser · Pirómetro infrarrojos Serie CT-Laser · Cámara termográfica fija Serie PI · Cámara termográfica Serie EXX
- **controltemperatura-termometros** (8): Termómetro EMPLUS600 · Termómetro electrónico EAS62 · Termómetro batería EWTL · Termómetros bimetálicos · Termómetros orientables · Termómetro a distancia · Termómetro tubería · Termómetro digital portátil
- **controltemperatura-termostatos** (16): Termostatos estancos · Termostato capilar a distancia · Termostato regulable TR2 · Termostato limitador seguridad LS-1 · Termostato bulbo capilar tripolares · Termostato inmersión TC-2 · Termostato regulable tubería BRC · Termostato líquidos agresivos · Termostato ambiente a distancia · Termostato ambiente mecánico · Termostato ambiente digital · Cronotermostato semanal · Cronotermostato radiofrecuencia · Control telefónico GSM/línea fija · Control telefónico GSM enchufable · Sistemas telecontrol y telemando
- **controltemperatura-equipos-de-medicion** (2): Calibradores de procesos · Horno de Calibración Portátil
- **controltemperatura-reles-estado-solido** (4): Gama Celpac · Gama Celpac2G · Gama Okpac · Relés estáticos corriente continua
- **presionhumedad-sondas-de-humedad** (8): Sonda humedad EWHS-284 · Sonda humedad EWHS-304 · Humedad/Temperatura EWHS-314 · Sonda humedad/temperatura STA-3 · Humedad/temperatura STA-3E · Sonda Humedad ambiente · Sonda Humedad/Temperatura cable · Transmisor Humedad
- **presionhumedad-sensores-de-presion** (7): Transmisor TPSP22 · Transmisor TPSP41 · Transmisor TPSP42 · Transmisor TPSP 32 · Detector presión PA3060 · Detector presión PN7160 · Transmisor TPSM40
- **controldenivel-niveles-de-flotador** (6): Sensor flotador INCR · INMR ECO · INMR INOX · INMR-VS · INMR-AMS · INMR HYP
- **controldenivel-interruptores-magneticos** (13): IMN 40 INOX · IMN 70 INOX · IMN 50 NY V · IMN 50 INOX H · IMN RP INOX · IMN TP INOX · IMN TC INOX · IMN TB PVC · IMN BC INOX · IMN BB PVC · IMN DP INOX · IMN TBEX INOX · IMN MPS
- **controldenivel-sensores-conductivos** (7): Electrodos NR 1 ½ · Electrodos NRA 1 1/2 · Electrodo NTBI · Electrodo NT · Electrodo NS · Electrodo NP · Electrodo NCPS DB INOX
- **controldenivel-sensores-capacitivos** (3): Sensor SCR 35 · Sensor SCRR 35 T 43650 · Sensor SCAV TB
- **controldenivel-transductores-magneticos** (2): TMN 300 TB INOX · TMN 300 DB INOX
- **controldenivel-sensores-de-presion** (3): Sensor CNM 10 · Sensor CNM 30 · Sensor CNM 20 EX
- **controldenivel-sensores-de-ultrasonidos** (1): Sensor ultrasonido SNU30P-1
- **controldenivel-niveles-rotativos** (2): Sensor CNPR-N · Sensor CNPR-D
- **controldenivel-reles-de-nivel** (9): PNSA-DNSA-SNSA · PNEA-DNEA · PNDA-DNDA · PNGA-DNGA · SNDA · PNWB · PTBA · PNAS · SNIA-SIN
- **ventilacion** (4): Ventiladores compactos · axiales · centrífugos · tangenciales
- **equipos-perifericos** (9): Alimentadores · Atemperadores · Caudalímetros · Deshumidificadores · Desincrustadores · Dosificadores · Mezcladores · Filtros magnéticos · Secadores
- **equiposderefrigeracion-refrigeradores-chillers** (3): Modelo ENR 003 · Modelo ENR 001 · Modelo ENR 038
- **hornos-industriales** (3): Horno Mic · Horno Metalar · Horno SM
- **fabricaciones-a-medida** (página de servicio): Calefactor de inmersión · Batería calentamiento aire · Resistencias abrazaderas · Sensores de temperatura · Detectores de nivel
- **nuevos-productos** (página de servicio): Equipos de refrigeración. CHILLERS · Sensores de nivel. IOT INDUSTRIAL · Calefactores de inmersión ATEX · Multiplexores MUX (repite contenido de otras categorías)

### 13.3 PDF públicos (se mantienen con su nombre exacto)

| URL | Enlazado desde |
|---|---|
| `/docs/catalogo-instrumentacion.pdf` | inicio (idéntico, mismo MD5, al de `/oviedo/docs/` y al del `.es`) |
| `/docs/catalogo-Brototermic-resistencias.pdf` | inicio |
| `/docs/Acabados-resistencias-cartucho.pdf` | `resistencias-tipo-cartucho.html` |
| `/docs/catalogo_termopares_broto-03-02-2015.pdf` | `controltemperatura-sondastemperatura.html` |
| `/docs/catalogo_cañas_pirometricas_broto-03-02-2015.pdf` | `controltemperatura-sondastemperatura.html` (enlazar como `catalogo_ca%C3%B1as_…`) |
| `/docs/DISPLAYS DIGITALES PROGRAMABLES BROTOTERMIC HR.pdf` | `controltemperatura-indicadores-de-procesos.html` (enlazar con `%20`) |
| `/docs/disibeint.IoT.pdf` | `nuevos-productos.html` |
| `/docs/ejemplo-de-aplicacion-iot-didieint.pdf` | `nuevos-productos.html` (la errata «didieint» forma parte de la URL: se mantiene) |

### 13.4 Cómo se descargó /legacy

Solo como referencia, porque `/legacy` ya está versionada. En Windows, `wget` se instala con `winget install JernejSimoncic.Wget`.

```bash
wget --mirror --page-requisites --no-parent --wait=1 --restrict-file-names=nocontrol -P legacy/com https://brototermic.com
wget --mirror --page-requisites --no-parent --wait=1 --restrict-file-names=nocontrol -P legacy/es https://www.brototermic.es
# Publicadas pero no enlazadas desde la portada:
wget --page-requisites --no-parent --wait=1 --restrict-file-names=nocontrol -P legacy/com https://brototermic.com/contacto.html
wget --mirror --page-requisites --no-parent --wait=1 --restrict-file-names=nocontrol -P legacy/com https://brototermic.com/oviedo/
curl -o legacy/com/brototermic.com/sitemap.xml https://brototermic.com/sitemap.xml
# En Windows, wget codifica mal la ñ: estos dos archivos se bajaron aparte
curl -o "legacy/com/brototermic.com/docs/catalogo_cañas_pirometricas_broto-03-02-2015.pdf" "https://brototermic.com/docs/catalogo_ca%C3%B1as_pirometricas_broto-03-02-2015.pdf"
curl -o "legacy/com/brototermic.com/images/brototermic-convertidor-señal.jpg" "https://brototermic.com/images/brototermic-convertidor-se%C3%B1al.jpg"
```

### 13.5 Problemas de la web actual que no se deben repetir

- jQuery 3.2.0 y 1.7.1 cargados a la vez, `min-width: 1150px` (no es responsive) y decenas de `<br/>` vacíos para maquetar.
- Metas obsoletas, ningún canonical y ningún `robots.txt`. Las dos versiones del host responden 200, y `http` → `https` va con un 302.
- Titles con «|» sin espacios y H1 que acaban siempre en «. BROTOTERMIC, S.L.». Alts genéricos.
- `callto:` y enlaces sin protocolo que dan 404. Las páginas de `contacto/` piden `contacto/images/logo.png` y `contacto/images/favicon.ico`, que no existen.
- API key de Google Maps y site key de reCAPTCHA en el HTML. No se reutilizan.
- `sitemap.xml` con URLs repetidas y `lastmod` 2022-06-15 en todas.
- `nuevos-productos.html` duplica el contenido de otras categorías (chillers).
