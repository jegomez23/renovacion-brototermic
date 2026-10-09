# AGENTS.md — Renovación web de BROTOTERMIC

> **Fuente única de verdad del proyecto.** Toda persona o IA (Claude, ChatGPT/Codex u otra) que trabaje en este repositorio debe leer este archivo completo antes de empezar y respetarlo. Si una decisión cambia, se actualiza este archivo **en el mismo commit** que el cambio.
>
> Convención: **[POR VERIFICAR]** marca cualquier dato que no se ha podido comprobar en `/legacy` (copia de la web actual) ni en los catálogos PDF. Un dato marcado así **no se publica** hasta que alguien lo confirme y quite la marca. Cuando un dato lo ha dado el cliente pero no aparece en `/legacy`, se indica como *(dato del cliente)*.
>
> Última revisión del análisis de `/legacy`: 2026-10-09.

---

## Índice

1. [Qué es el proyecto](#1-qué-es-el-proyecto)
2. [Objetivo y restricciones técnicas](#2-objetivo-y-restricciones-técnicas)
3. [Reglas SEO](#3-reglas-seo-prioridad-máxima-no-perder-el-posicionamiento-actual)
4. [Contenido](#4-contenido)
5. [Imágenes](#5-imágenes)
6. [Diseño](#6-diseño)
7. [Estructura de carpetas y esquemas de datos](#7-estructura-de-carpetas-y-esquemas-de-datos)
8. [Cómo trabajamos](#8-cómo-trabajamos-dos-personas-y-dos-ias)
9. [Definición de terminado](#9-definición-de-terminado)
10. [Prohibido](#10-prohibido)
11. [Pendientes](#11-pendientes-por-verificar)
12. [Anexos: datos extraídos de /legacy](#12-anexos-datos-extraídos-de-legacy)

---

## 1. Qué es el proyecto

### Cliente

| Dato | Valor | Fuente |
|---|---|---|
| Razón social | BROTOTERMIC, S.L. | `/legacy` (todas las páginas) |
| CIF | B01266303 | `/legacy/com/.../privacidad.html` |
| Registro Mercantil | Álava, tomo 820, libro 0, folio 14, hoja VI-5952 | `privacidad.html` |
| Nombre de origen | «Comercial Broto» | `empresa.html` |
| Año de fundación | 1982 | *(dato del cliente)*. En `/legacy` solo aparece «década de los 80», «más de 35 años» y «treinta y cinco años». |
| Actividad | Distribuidor B2B de resistencias eléctricas calefactoras e instrumentación industrial (temperatura, nivel, presión, humedad). Además de distribuir, hace **fabricaciones a medida**. | Brief del cliente + `/legacy` |
| Zona | País Vasco, provincias limítrofes y Asturias | `empresa.html` («País Vasco y provincias limítrofes») + delegación de Oviedo |

### Público

Departamentos de **mantenimiento, compras y oficina técnica** de empresas industriales del País Vasco, provincias limítrofes y Asturias. Saben lo que buscan: llegan por un tipo de producto o un modelo concreto y quieren confirmar que BROTOTERMIC lo suministra o lo fabrica a medida, y pedir precio.

### Objetivo de la web

1. **Generar peticiones de presupuesto** (formulario y teléfono).
2. **Transmitir confianza técnica**: trayectoria, marcas representadas, catálogos, fabricación a medida.

**NO es un e-commerce:** no hay precios, ni carrito, ni fichas de compra.

### Sedes

| | Sede central — Vitoria-Gasteiz | Delegación — Oviedo (Asturias) |
|---|---|---|
| Dirección | C/ Pintor Mauro Ortiz de Urbina, 7 bajo | Llano Ponte nº 8 bajo |
| CP y ciudad | 01008 Vitoria-Gasteiz (Álava) | **33011** Oviedo (Asturias) |
| Teléfono | 945 22 33 31 → `tel:+34945223331` | 629 462 642 → `tel:+34629462642` |
| Email | info@brototermic.com | brototermic@brototermic.com |
| Coordenadas (mapa de la web actual) | 42.849668, -2.685874 | 43.367693, -5.847025 |

Notas sobre las direcciones:
- En `/legacy` la calle de Vitoria aparece como «Pintor Ortiz de Urbina, n. 7» y «Ptr. Ortiz de Urbina, n. 7». Lo de «Mauro» y «bajo» es *(dato del cliente)*.
- Oviedo: `brototermic.com/contacto/contacto.html` pone **03011** (errata). `www.brototermic.es/contacto/contacto.html` pone **33011**, que es el correcto.
- Las coordenadas salen del JavaScript de Google Maps de las páginas de contacto. [POR VERIFICAR] antes de usarlas en el schema `geo`. El iframe del mapa de `www.brototermic.es/contacto/contacto.html` apunta a otra ubicación (40.378, -3.781, zona de Madrid): es un error de la web actual y no se reutiliza.
- [POR VERIFICAR] Si la delegación de Oviedo sigue activa.

### Marcas representadas

ElectricFor · Mesel · Disibeint · Sanara · Ebm-Papst · Eliwell · Kuhlmann Electro Heat · Remberg · Amco

(Las 9 aparecen en `brototermic.com/index.html`. `www.brototermic.es` solo lista las 6 primeras.)

### Familias de producto y subcategorías (de `/legacy`)

Cada subcategoría es hoy una página `.html` que **se mantiene con el mismo nombre de archivo**. El texto entre paréntesis es la etiqueta del menú actual.

**Resistencias eléctricas** (en el menú actual la familia no tiene página: `href="#"`)
- `resistencias-inmersion.html` (Inmersión)
- `resistencias-calentamientoaire.html` (Calentamiento de aire)
- `resistencias-flexibles.html` (Flexibles)
- `resistencias-infrarrojos.html` (Emisores infrarrojos)
- `resistencias-tipo-cartucho.html` (De cartucho)
- `resistencias-tipo-abrazadera.html` (De abrazadera)
- `resistencias-planas.html` (Planas)
- `resistencias-calefaccion-industrial.html` (Calefacción industrial: aerotermos, convectores, cortinas de aire, pantallas infrarrojos)
- `resistencias-atex.html` (ATEX)
- `resistencias-especiales-a-medida.html` (Especiales a medida)
- `resistencias-mantas-calefactoras.html` (Mantas calefactoras)

**Control de temperatura** (sin página de familia)
- `controltemperatura-sondastemperatura.html` (Sondas de temperatura)
- `controltemperatura-convertidores.html` (Convertidores de señal)
- `controltemperatura-cables-compensacion.html` (Cables de compensación)
- `controltemperatura-indicadores-de-procesos.html` (Indicadores de procesos)
- `controltemperatura-videoregistradores.html` (Video-registradores)
- `controltemperatura-dataloggers.html` (Dataloggers)
- `controltemperatura-panelespc-software.html` (Paneles PC)
- `controltemperatura-accesorios-sondas.html` (Accesorios sondas)
- `controltemperatura-sensores-infrarrojos.html` (Sensores de infrarrojos)
- `controltemperatura-termometros.html` (Termómetros)
- `controltemperatura-termostatos.html` (Termostatos)
- `controltemperatura-equipos-de-medicion.html` (Equipos de medición)
- `controltemperatura-reles-estado-solido.html` (Relés estado sólido)

**Presión y humedad** (sin página de familia)
- `presionhumedad-sondas-de-humedad.html` (Sondas de humedad)
- `presionhumedad-sensores-de-presion.html` (Sensores de presión)

**Control de nivel** (sin página de familia)
- `controldenivel-niveles-de-flotador.html` (Niveles de boya)
- `controldenivel-interruptores-magneticos.html` (Interruptores magnéticos)
- `controldenivel-sensores-conductivos.html` (Sensores conductivos)
- `controldenivel-sensores-capacitivos.html` (Sensores capacitivos)
- `controldenivel-transductores-magneticos.html` (Transductores magnéticos)
- `controldenivel-sensores-de-presion.html` (Sensores de presión)
- `controldenivel-sensores-de-ultrasonidos.html` (Sensores de ultrasonidos)
- `controldenivel-niveles-rotativos.html` (Niveles rotativos)
- `controldenivel-reles-de-nivel.html` (Relés de nivel)

**Ventilación**: `ventilacion.html`, una sola página con ventiladores compactos, axiales, centrífugos y tangenciales.

**Equipos periféricos para plástico**: `equipos-perifericos.html`, una sola página con alimentadores, atemperadores, caudalímetros, deshumidificadores, desincrustadores, dosificadores, mezcladores, filtros magnéticos y secadores. Su meta habla de «maquinaria auxiliar para el sector industrial de la transformación de termoplásticos».

**Refrigeración**: `equiposderefrigeracion-refrigeradores-chillers.html`, refrigeradores/chillers modelos ENR 003, ENR 001 y ENR 038.

**Hornos industriales**: `hornos-industriales.html`, con Horno Mic, Horno Metalar y Horno SM.

**Otras páginas**: `index.html` (inicio), `empresa.html`, `fabricaciones-a-medida.html` (calefactor de inmersión, batería de calentamiento de aire, resistencias abrazaderas, sensores de temperatura, detectores de nivel), `nuevos-productos.html`, `contacto/contacto.html`, `mapa-web.html`, `privacidad.html`, `cookies.html`, y la landing de Asturias `oviedo/`.

El listado completo de productos de cada página está en el [anexo 12.3](#123-productos-por-página).

---

## 2. Objetivo y restricciones técnicas

- **Renovación completa** con diseño moderno, minimalista y profesional, 100 % responsive y *mobile-first*.
- **Lo que se sube al servidor es SOLO HTML + CSS + JavaScript vanilla.** Sin CMS, sin frameworks (nada de React, Vue, Tailwind ni Bootstrap) y sin dependencias en el navegador: ni CDN, ni Google Fonts remotas, ni jQuery.
- **Generador mínimo `build.js`** (Node, **sin dependencias npm**: solo módulos nativos como `fs` y `path`). Combina `/src/templates` + `/src/partials` + `/data` + `/content` + `/assets` y escribe HTML estático en `/dist`.
  - El menú, las migas de pan y **todos los enlaces salen escritos en el HTML final**. Nunca se inyectan con JS en el navegador, porque el SEO depende de ello.
  - El JS del navegador solo sirve para mejorar la experiencia (abrir y cerrar el menú, validar el formulario). Con JS desactivado, la web tiene que poder navegarse entera.
  - Las rutas del HTML generado son **absolutas desde la raíz** (`/assets/css/style.css`, `/images/x.jpg`), porque hay páginas en subcarpetas (`/contacto/`, `/oviedo/`).
- **Hosting:** el actual, que es Apache: la cabecera `Server: Apache` está comprobada y el formulario actual usa PHP (`contacto/bat/rd-mailform.php`). Las redirecciones van en **`.htaccess`**.
- **Unificación de dominios:**
  - `brototermic.com` es el dominio principal.
  - `www.brototermic.es` (y `brototermic.es`) redirigen con **301** a `https://brototermic.com/oviedo/`, que será la landing propia de la delegación de Asturias. Cada URL del `.es` va a su equivalente: ver `docs/inventario-urls.csv`.
  - [POR VERIFICAR] Si el `.es` está en el mismo hosting (su `.htaccess`) o hay que redirigirlo desde el DNS o el panel del proveedor.

---

## 3. Reglas SEO (PRIORIDAD MÁXIMA: no perder el posicionamiento actual)

### 3.1 URLs

- **NO se renombra ni se borra ningún archivo `.html` existente.** Cada página nueva usa EXACTAMENTE el mismo nombre de archivo y la misma ruta que la antigua (p. ej., `/resistencias-tipo-cartucho.html` sigue siendo `/resistencias-tipo-cartucho.html`).
- Solo cambian las URLs duplicadas, cada una con un **301** a su versión buena:

| URL antigua | Destino 301 | Estado |
|---|---|---|
| `/index.html` | `/` | Decidido |
| `/contacto.html` | `/contacto/contacto.html` | **[POR VERIFICAR]** en Search Console cuál tiene más tráfico. Provisionalmente se mantiene `/contacto/contacto.html` porque es la que enlaza el menú y la que está en `sitemap.xml`. `/contacto.html` está huérfana: no la enlaza nadie y su formulario no tiene `action`. |
| `/oviedo/index.html`, `/oviedo/contacto/contacto.html` | `/oviedo/` (nueva landing) | Decidido |
| `/oviedo/politica-de-privacidad-brototermic-oviedo.html` | `/privacidad.html` | Se redirige a la página equivalente, no a `/oviedo/` |
| `/oviedo/politica-de-cookies-brototermic-oviedo.html` | `/cookies.html` | Ídem |
| `/oviedo/docs/*.pdf` | `/docs/` equivalente | Ver CSV |
| Todas las URLs de `www.brototermic.es` y `brototermic.es` | Su equivalente en `brototermic.com` | Ver CSV |
| PDF con ñ en el nombre | Se crea una copia sin ñ, que pasa a ser la enlazada. **El original sigue accesible** (no se borra ni se redirige) y se le añade `Link: <…copia…>; rel="canonical"` desde `.htaccess`. | Decidido |
| Host y protocolo | Una sola versión: HTTPS forzado con **301**. Con o sin www: **[POR VERIFICAR]**. | Ver abajo |

- **Situación actual del host** (comprobado el 2026-10-09): `https://brototermic.com/` y `https://www.brototermic.com/` responden **las dos 200** (contenido duplicado). `http://` redirige a `https://` con un **302** (debería ser 301). `brototermic.es` y `www.brototermic.es` responden las dos 200. El `sitemap.xml` actual usa `https://brototermic.com/` **sin www**, lo que apunta a que la versión preferida es sin www [POR VERIFICAR en Search Console].
- En el `.htaccess`, las URLs con espacios o ñ se escriben codificadas: `DISPLAYS%20DIGITALES…`, `ca%C3%B1as`. Un mismo archivo responde también con la codificación Latin-1 (`%F1`), y las dos tienen que funcionar.
- **`docs/inventario-urls.csv` es el control de la migración.** Antes de publicar, cada URL antigua debe estar marcada como `MANTENER` (y existir en `/dist`) o como `REDIRIGIR` (con su destino en `destino_301`). Las URLs que no existían se marcan `NUEVA`. No puede quedar ningún `[POR VERIFICAR]` en la columna `destino_301` el día de publicar.

### 3.2 Etiquetas por página

- **Title:** se puede mejorar, pero **conservando SIEMPRE la palabra clave principal del title antiguo** (está en el CSV). Máximo de unos 60 caracteres. Formato: `Producto | Familia | BROTOTERMIC`.
  - Excepción: si el title antiguo es un error de copia-pega, la palabra clave se toma del H1 antiguo. Casos detectados:
    - `controldenivel-transductores-magneticos.html` tiene el title de «Sensores de presión». Usar «Transductores magnéticos».
    - `controltemperatura-accesorios-sondas.html` tiene el title de «Sondas de temperatura». Usar «Accesorios para sondas».
- **Meta description:** nueva y **única** por página, de **140 a 155 caracteres**. Hoy hay muchas repetidas, vacías (las dos de contacto) o con el mismo texto que el title.
- **Un solo H1 por página.** Los nombres de producto van en **H2**. (Hoy `nuevos-productos.html` tiene 3 H1 y los productos van en `<div class="txt-1">`).
- **Eliminar las metas obsoletas:** `keywords`, `revisit-after`, `distribution`, `robots` con valor `all`, `resource-type`, `owner`, `Author`, `Googlebot` redundante y todas las `DC.*` (Dublin Core, `title`, `searchtitle` del `.es`). Tampoco se mantiene el `hreflang` actual, que apunta a `http://www.` y no aporta nada en una web en un solo idioma.
- **Canonical absoluto** en todas las páginas: `https://<host preferido>/<ruta>`.
- **`sitemap.xml`** (lo genera `build.js` con todas las URLs `MANTENER`/`NUEVA` que son HTML o PDF) y **`robots.txt`** (hoy da 404 en los dos dominios) con la línea `Sitemap:`.
- **Enlaces de teléfono con `tel:+34…`, nunca `callto:`** (el `.es` usa `callto:629462642`).
- **Enlaces de email** con `mailto:`. En `/legacy` hay enlaces rotos del tipo `href="info@brototermic.com"` y `href="www.agpd.es"`, sin protocolo: no se copian.

### 3.3 Datos estructurados (JSON-LD)

- **Organization** (en todas las páginas o en el inicio): nombre, `legalName` «BROTOTERMIC, S.L.», `taxID` B01266303, `url`, logo, teléfono, email y `foundingDate` 1982 *(dato del cliente)*.
- **Dos LocalBusiness**, uno para Vitoria (en inicio y contacto) y otro para Oviedo (en `/oviedo/`), con dirección, teléfono, email y `geo` [POR VERIFICAR coordenadas]. Los horarios no están en `/legacy`: [POR VERIFICAR].
- **BreadcrumbList** en todas las páginas.
- **ItemList** con los productos de cada página de categoría (nombre del producto + `url#ancla`).
- **Nada de `Product` con `offers`**: no hay precios.
- Todo el schema se valida con la Prueba de resultados enriquecidos o con validator.schema.org antes de dar una página por terminada.

---

## 4. Contenido

- **Las descripciones de producto existentes SE CONSERVAN.** Solo se corrigen erratas y se mejora el formato (por ejemplo, las especificaciones pasan a tabla o a lista ordenada). **No se reescriben.**
- **Cada página de categoría lleva una intro NUEVA de 120 a 200 palabras** encima de los productos: aplicaciones, sectores, opción de fabricación a medida y llamada a pedir presupuesto. La intro solo puede mencionar datos técnicos que ya estén en `/legacy` o en los catálogos PDF.
- **Regla para cualquier IA: está PROHIBIDO inventar especificaciones técnicas** (medidas, IP, temperaturas, potencias, tensiones, certificaciones, homologaciones, materiales, normas). Solo se usan datos presentes en `/legacy` o en los catálogos PDF. Si falta un dato, se deja fuera o se marca [POR VERIFICAR]; no se completa «por lógica».
- **Idioma:** español de España. Tono técnico, claro y cercano, sin relleno comercial («líderes», «la mejor calidad», etc.) que no aporte información.

### 4.1 Datos que hay que corregir

| Dato | Dónde | Corrección |
|---|---|---|
| «más de 35 años», «treinta y cinco años» | `index.html`, `empresa.html` (texto y pie), `www.brototermic.es` y `/oviedo/` (inicio y botón «35 años de experiencia») | Calcular desde 1982 *(dato del cliente)*: en 2026 son 44 años. Preferible una fórmula que no caduque: **«desde 1982»**. |
| Directiva ATEX **94/9/CE** (derogada; la vigente es **2014/34/UE**) | `resistencias-atex.html` («han de cumplir por obligación con la Directiva Atex 94/9/CE»), `resistencias-mantas-calefactoras.html` («compliance with 94/9/EC», «Atex directive 94/9/EG») | Las frases generales sobre la obligación legal se cambian a 2014/34/UE. **Cuidado:** donde el texto dice que un producto concreto está *certificado* según 94/9/CE, no se cambia la directiva sin comprobarlo en la documentación actual del fabricante [POR VERIFICAR]. Lo mismo para los marcados antiguos «EEx» y las normas EN 50014/EN 50019 (también sustituidas). |
| CP de Oviedo | `contacto/contacto.html` y `contacto.html` dicen 03011 | **33011** |
| Año de copyright | Pie de todas las páginas del `.com`: «© 2014» | Año actual, generado por `build.js` |
| «Nuevos Productos 2021» | H1 de `nuevos-productos.html` | Quitar el año o actualizarlo [POR VERIFICAR con el cliente qué productos siguen siendo nuevos] |
| `<html lang="es-ES">` / `lang="es"` | Variable | `lang="es-ES"` en todas las páginas |

### 4.2 Erratas encontradas en `/legacy`

| Página | Errata | Corrección |
|---|---|---|
| `resistencias-inmersion.html` | «Reistencias con caja conexiones IP-44» | Resistencias |
| `resistencias-inmersion.html` | «Gama para aguay para aceite» | agua y |
| `resistencias-tipo-cartucho.html` | «a larga la vida del cartucho» | alarga |
| `resistencias-tipo-cartucho.html` | «Nikel-Cromo», «Niquel-Cromo», «1400 c.º», «Oxido», «granulometria» | Níquel-cromo, 1400 ºC, Óxido, granulometría |
| `resistencias-calentamientoaire.html` | «Varias potecias» | potencias |
| `empresa.html` | «Equipos perféricos», «Estufas y hormos industriales» | periféricos, hornos |
| `controltemperatura-sondastemperatura.html` | «Temosonda con mango» | Termosonda |
| `controltemperatura-sondastemperatura.html` | «asilada de masa» | aislada |
| `controltemperatura-sondastemperatura.html` | «AlSl 316, AlSl 310» (con L minúscula), «lnconel 600», «ArmcoB», «TeflónB» | AISI, Inconel, Armco®, Teflón® (la «B» es un ® mal codificado) |
| `controltemperatura-termometros.html` | «Termométros» (en title, meta y H1) | Termómetros |
| `controltemperatura-panelespc-software.html` | «Control de termperatura» (title) | temperatura |
| `controltemperatura-indicadores-de-procesos.html` | «7segemnetos», «histeresis» | 7 segmentos, histéresis |
| `controltemperatura-reles-estado-solido.html` | «Mútiples modelos» | Múltiples |
| `controltemperatura-equipos-de-medicion.html` | «incluído» | incluido |
| `controltemperatura-termostatos.html` | «interruptor macha-paro» | marcha-paro |
| `controltemperatura-videoregistradores.html` | La meta incluye «Ventiladores axiales» (copia-pega) | Quitar |
| `controldenivel-niveles-de-flotador.html` | «no se empela plomo» | emplea |
| `controldenivel-sensores-de-presion.html` | «Categoria 1/2 D» | Categoría |
| `equipos-perifericos.html` | «estan provistos», «Punto de rocio», «fibra de vídrio» | están, rocío, vidrio |
| `nuevos-productos.html` | «Getways DE HubB», archivo «ejemplo-de-aplicacion-iot-didieint.pdf» | Gateways (el nombre del PDF se mantiene: no se renombran URLs) |
| `www.brototermic.es` / `/oviedo/` | «es un empresa líder» | una empresa |
| `www.brototermic.es` / `/oviedo/` | Imágenes `brototermic-distribuciones-insdustriales.jpg`, `electticfor-…`, `disibent-…`, `eliwell-Papst-…` | Solo afecta a nombres de archivo internos. Si la imagen se reutiliza, el nombre nuevo se escribe bien. |
| Varias | Sin tilde: «inmersion», «deposito», «bidon», «estandar», «Modulo», «tuberias», «solido», «presion», «medicion» (en textos visibles) | Con tilde. Ojo: **no** se tocan los nombres de archivo `.html`. |

La lista no es exhaustiva. Al migrar cada página, quien la migre revisa la ortografía del texto que copia.

---

## 5. Imágenes

- **Se mantienen las imágenes existentes.** Las que ya posicionan conservan el **mismo nombre base**. El inventario completo, con el alt actual y las páginas donde se usa cada una, está en `docs/inventario-imagenes.csv`.
- **Ruta pública:** las imágenes de contenido se publican en **`/images/`** (la misma ruta que hoy, `https://brototermic.com/images/<nombre>.jpg`), para no perder la URL que ya conoce Google Imágenes. En el repo viven en `/assets/img/`, y `build.js` las copia a `/dist/images/`.
- **Formatos:** WebP en dos anchos (**480 y 960 px**: `<nombre>-480.webp`, `<nombre>-960.webp`) y el **JPG original como respaldo** (`<nombre>.jpg`), con `<picture>` + `srcset`.
- Todas las `<img>` llevan **`width` y `height`**, **`loading="lazy"` excepto la imagen principal (hero)**, que lleva `fetchpriority="high"`, y un **`alt` descriptivo real** (qué producto es y qué se ve). Nada de alts genéricos con el nombre de la empresa del tipo «… BROTOTERMIC, S.L.», que es lo que hay hoy en casi todas.
- **IA solo para RETOCAR** (fondo, nitidez, ampliación). **Nunca para inventar un producto** ni cambiar su forma. Las imágenes de ambiente o de portada sí pueden generarse, siempre que no muestren un producto concreto como si fuera del catálogo.
- **Logo y logos de marcas en SVG cuando sea posible.** En `/legacy` **no hay ningún SVG**: el logo es `images/logo.png` (385×89, para fondo oscuro), con versiones `footer-logo.jpg` (152×36) y `logotipo-brototermic-oviedo.png` en el `.es`. Las marcas están en una sola imagen compuesta (`brototermic-marcas-representadas.jpg`) y en JPG sueltos en el `.es`. [POR VERIFICAR] Pedir el logo vectorial al cliente y los logos oficiales a cada marca.
- **Nombres de archivo nuevos:** minúsculas, con guiones, sin tildes ni ñ (p. ej., `resistencia-cartucho-alta-carga.jpg`). Las imágenes existentes que ya posicionan conservan su nombre aunque no cumplan la regla. Excepción: `brototermic-convertidor-señal.jpg` lleva ñ; se trata igual que los PDF (copia sin ñ y original accesible).

---

## 6. Diseño

### 6.1 Colores corporativos (hex EXACTOS extraídos de `/legacy`)

Se declaran como variables CSS en `:root` con estos valores, sin «ajustarlos».

```css
:root {
  /* Azules corporativos */
  --color-azul-logo: #1d356c;        /* «Broto» del logo (píxeles de images/logo.png) */
  --color-azul-corporativo: #004c9a; /* barra «Marcas representadas» (.bar-left, style.css) */
  --color-azul-menu: #004b9a;        /* fondo de los submenús (superfish.css) */
  --color-azul-oscuro: #004593;      /* sombra de botones */
  --color-azul-medio: #0081b8;       /* sombra de títulos */
  --color-azul-slider: #288dbc;      /* sombra del slider */
  --color-azul-claro: #36afe0;       /* subtítulos .txt-1, enlaces de email, hover */
  --color-cian-boton: #2dccf0;       /* fondo de botones .button */
  --color-cian-boton-hover: #63e8f8; /* hover de botones */
  --color-cian-menu-hover: #48daf4;  /* hover del menú (superfish.css) */
  --color-azul-palido: #dae9f9;      /* texto sobre azul corporativo */
  --color-azul-palido-menu: #d3e6f7; /* texto del menú */

  /* Neutros */
  --color-titulos: #404751;          /* h1–h6 */
  --color-texto: #989898;            /* texto base del body (ver nota de contraste) */
  --color-texto-oscuro: #2c2a33;
  --color-texto-medio: #5e5e5e;
  --color-gris-pie: #72767c;         /* texto del pie */
  --color-fondo-pie: #282b2f;        /* fondo del body/pie */
  --color-fondo-contenido: #f1f1f1;  /* fondo de la zona de contenido */
  --color-borde: #dadada;
  --color-borde-2: #e0e0e0;
  --color-borde-3: #d0d0d0;
  --color-blanco: #ffffff;
}
```

- El degradado de la cabecera actual es una imagen (`images/tail-bg-header.gif`) que va de **#0096c8** a **#004f9c** (valores muestreados de la imagen, no del CSS).
- Los colores de `www.brototermic.es` (`#3a5a9f`, `#45b0e3`, `#d61119`, `#1783bc`, `#c9484b`…) son de los iconos de redes sociales y de una plantilla genérica: **no son corporativos**.

**Contraste AA (calculado):** los colores se mantienen exactos, pero cada combinación de texto y fondo tiene que cumplir AA (4,5:1 en texto normal, 3:1 en texto grande ≥ 24 px o ≥ 18,66 px en negrita).

| Combinación | Ratio | Uso permitido |
|---|---|---|
| Blanco sobre `#004c9a` / `#004b9a` | 8,4 | Sí: botones principales, cabecera, bloques destacados |
| Blanco sobre `#1d356c` | 11,8 | Sí |
| Blanco sobre `#004593` | 9,2 | Sí |
| `#404751` sobre blanco / `#f1f1f1` | 9,4 / 8,3 | Sí: títulos y **texto de párrafo** |
| `#5e5e5e` sobre blanco | 6,5 | Sí: texto secundario |
| `#dae9f9` sobre `#004c9a` | 6,8 | Sí |
| `#e0e0e0` sobre `#282b2f` | 10,8 | Sí: texto del pie |
| `#36afe0` sobre `#282b2f` | 5,7 | Sí: enlaces en el pie |
| `#1d356c` sobre `#2dccf0` | 6,2 | Sí: texto de botón cian |
| `#004c9a` sobre `#2dccf0` | 4,4 | Solo texto grande |
| Blanco sobre `#0081b8` | 4,35 | Solo texto grande |
| `#72767c` sobre `#282b2f` | 3,1 | Solo texto grande (el pie actual no cumple) |
| `#989898` sobre blanco | 2,9 | **No como texto** (el texto base actual no cumple AA) |
| `#36afe0` sobre blanco | 2,5 | **No como texto**: solo decorativo (líneas, iconos, bordes) |
| Blanco sobre `#2dccf0` | 1,9 | **No** (los botones actuales no cumplen) |

### 6.2 Tipografías (de `/legacy`)

- `brototermic.com`: **Lora** 400/700 (Google Fonts) para los títulos, el menú y los botones, y **Arial, Helvetica, sans-serif** para el texto.
- `www.brototermic.es`: Roboto, Sarina, Font Awesome 4.3 y Glyphicons (plantilla Bootstrap). **No se reutilizan.**
- Para la web nueva, la propuesta es mantener **Lora** en los títulos, autoalojada en WOFF2 (sin llamadas a Google), y una pila de sistema para el texto (`system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif`). [POR VERIFICAR decisión de diseño. Si se aprueba, se añade la carpeta `/assets/fonts` a la estructura de la sección 7.]

### 6.3 Estilo y componentes

- Estilo moderno, limpio, industrial y técnico. Mucho espacio en blanco y una jerarquía clara.
- Componentes:
  - **Cabecera con megamenú** (familias → subcategorías). En móvil, **acordeón**. Es HTML real, generado por `build.js` y navegable con teclado.
  - **Tarjeta de producto** (imagen, nombre en H2, modelo, texto, enlace al PDF si lo hay, botón de presupuesto).
  - **Tabla de especificaciones.**
  - **Botón de presupuesto** (CTA principal, siempre visible en las fichas).
  - **Migas de pan.**
  - **Pie con los datos de las dos sedes.**
- **Formulario de contacto / presupuesto:** nombre, empresa, email, teléfono, mensaje, adjunto (plano o foto), casilla RGPD (sin marcar por defecto, con enlace a `/privacidad.html`) y **campo trampa (honeypot)** antispam.
  - Hoy el formulario de `contacto/contacto.html` hace `POST` a `contacto/bat/rd-mailform.php` (responde 200) y usa Google reCAPTCHA v2.
  - [POR VERIFICAR] Cómo se procesará el envío: con PHP propio en el hosting o con un servicio externo. Un servicio externo con script en el navegador iría contra la regla de cero dependencias.
- **Rendimiento:** Lighthouse en móvil **≥ 90**, **LCP < 2,5 s**, **una sola hoja CSS**, JS con **`defer`**. Nada de jQuery (hoy se cargan jQuery 3.2.0 y 1.7.1 a la vez). Los mapas no se cargan con la API de Google Maps (hoy lleva una API key en el HTML): se usa un enlace o un iframe de inserción con `loading="lazy"` [POR VERIFICAR decisión].
- **Accesibilidad:** contraste AA (tabla 6.1), navegable con teclado (foco visible), HTML semántico (`header`, `nav`, `main`, `footer`, listas, tablas con `<th>`), formularios con `<label>`.

---

## 7. Estructura de carpetas y esquemas de datos

```
/
├── AGENTS.md            ← este archivo (fuente única de verdad)
├── CLAUDE.md            ← solo contiene "@AGENTS.md"
├── README.md
├── .gitignore
├── build.js             ← generador (Node, sin dependencias npm) [aún no creado]
├── legacy/              ← copia de la web actual. SOLO LECTURA, NUNCA se edita
│   ├── com/brototermic.com/
│   └── es/www.brototermic.es/
├── src/
│   ├── templates/       ← plantillas de página (inicio, categoria, pagina, contacto, oviedo…)
│   └── partials/        ← trozos comunes (head, cabecera+megamenú, pie, migas, cta, schema)
├── data/
│   ├── site.json        ← datos de la empresa, sedes, marcas, host preferido
│   ├── familias.json    ← familias y orden de sus subcategorías (alimenta el megamenú)
│   └── categorias/
│       └── <archivo>.json   ← una por página de categoría (title, meta, h1, intro, productos[])
├── content/             ← textos SEO largos de páginas que no son de categoría
├── assets/
│   ├── css/             ← UNA hoja: style.css
│   ├── js/              ← JS vanilla (menú, formulario)
│   └── img/             ← imágenes optimizadas (se publican en /images/)
├── docs/                ← PDF públicos + documentación del proyecto
│   ├── inventario-urls.csv
│   └── inventario-imagenes.csv
└── dist/                ← salida generada por build.js. NO se edita a mano
```

### Reglas de la estructura

- **`/legacy`**: solo lectura. Es la referencia para los datos y no se toca. Está en `.gitignore` (pesa unos 87 MB). Para tenerla en local, ver el [anexo 12.6](#126-cómo-regenerar-legacy). [POR VERIFICAR] Si conviene versionarla o compartir un ZIP, porque cuando se publique la web nueva la antigua deja de existir y ya no se podrá volver a descargar.
- **`/data/categorias/<archivo>.json`**: el nombre del JSON es **el nombre del `.html` sin la extensión**. Así, `data/categorias/resistencias-tipo-cartucho.json` genera `/resistencias-tipo-cartucho.html`. Esto garantiza que no cambie ninguna URL.
- **`/content`**: fragmentos HTML (`<slug>.html`, sin `<html>` ni `<head>`) con el texto largo de inicio, empresa, fabricaciones a medida, nuevos productos, oviedo y legales. Se usa HTML y no Markdown para no necesitar un conversor (cero dependencias).
- **`/docs`**: dos usos, porque las URLs públicas de los PDF son `/docs/<nombre>.pdf`.
  - `build.js` copia a `/dist/docs/` **solo los `.pdf`**, con su nombre exacto.
  - Los `.csv` y `.md` de documentación del proyecto **no se publican**.
- **`/dist`**: lo que se sube por FTP. Está en `.gitignore`; se regenera con `node build.js`. Contiene los `.html` (en la raíz, `/contacto/` y `/oviedo/`), `/assets/css/style.css`, `/assets/js/*.js`, `/images/`, `/docs/*.pdf`, `sitemap.xml`, `robots.txt` y `.htaccess`.

### Esquemas JSON

**`data/site.json`** (orientativo):
```json
{
  "razonSocial": "BROTOTERMIC, S.L.",
  "cif": "B01266303",
  "fundacion": 1982,
  "host": "https://brototermic.com",
  "sedes": [
    {
      "id": "vitoria",
      "nombre": "Sede central — Vitoria-Gasteiz",
      "direccion": "C/ Pintor Mauro Ortiz de Urbina, 7 bajo",
      "cp": "01008",
      "ciudad": "Vitoria-Gasteiz",
      "provincia": "Álava",
      "telefono": "945 22 33 31",
      "tel": "+34945223331",
      "email": "info@brototermic.com"
    },
    {
      "id": "oviedo",
      "nombre": "Delegación — Oviedo",
      "direccion": "Llano Ponte nº 8 bajo",
      "cp": "33011",
      "ciudad": "Oviedo",
      "provincia": "Asturias",
      "telefono": "629 462 642",
      "tel": "+34629462642",
      "email": "brototermic@brototermic.com"
    }
  ],
  "marcas": ["ElectricFor", "Mesel", "Disibeint", "Sanara", "Ebm-Papst", "Eliwell", "Kuhlmann Electro Heat", "Remberg", "Amco"]
}
```

**`data/familias.json`**:
```json
[
  {
    "id": "resistencias-electricas",
    "nombre": "Resistencias eléctricas",
    "categorias": ["resistencias-inmersion", "resistencias-calentamientoaire", "…"]
  }
]
```

**`data/categorias/<archivo>.json`**:
```json
{
  "title": "Resistencias tipo cartucho | Resistencias eléctricas | BROTOTERMIC",
  "meta": "140–155 caracteres, única…",
  "h1": "Resistencias tipo cartucho",
  "intro": "<p>Intro nueva de 120–200 palabras…</p>",
  "productos": [ /* ver esquema de producto */ ]
}
```

**Esquema de un producto** (elemento de `productos[]`). El ejemplo es real y está tomado de `resistencias-tipo-cartucho.html`:
```json
{
  "nombre": "Microwatt",
  "modelo": null,
  "texto": "Calefactor unipolar con un hilo aislado de masa y el otro a tierra soldado en el fondo. Se puede fabricar a partir de diámetro 4, con un voltaje máximo de 48 V.",
  "specs": [
    "Base soldada por TIG estanca hasta una presión de 60 kg/cm2.",
    "Acero inox. 304 calibrado.",
    "Óxido de magnesio puro de granulometría controlada.",
    "Hilo calefactor níquel-cromo 80/20, punto de fusión 1400 ºC.",
    "Cable conductor."
  ],
  "img": "brototermic-cartuchosmicrowatt",
  "alt": "Resistencia de cartucho Microwatt con cable conductor de salida",
  "pdf": "/docs/Acabados-resistencias-cartucho.pdf"
}
```

| Campo | Tipo | Regla |
|---|---|---|
| `nombre` | string | Obligatorio. Se pinta en **H2** y genera el ancla `#slug-del-nombre`. |
| `modelo` | string \| null | Referencia o modelo tal como aparece en `/legacy` (p. ej., «ENR 003»). `null` si no hay. |
| `texto` | string | Descripción **original** de `/legacy`, con las erratas corregidas. No se reescribe. |
| `specs` | array | Dos formas: lista de strings (se pinta como lista ordenada) o lista de objetos `{"campo": "…", "valor": "…"}` (se pinta como tabla). Solo datos de `/legacy` o de los catálogos. `[]` si no hay. |
| `img` | string | Nombre base **sin extensión** del archivo de `/assets/img`. `build.js` busca `<img>-480.webp`, `<img>-960.webp` y `<img>.jpg`. |
| `alt` | string | Descripción real de la imagen. Obligatorio si hay `img`. |
| `pdf` | string \| null | Ruta absoluta del PDF (`/docs/…`) o `null`. |

### Plantillas (propuesta inicial; Persona A puede cambiarla si actualiza esta sección)

- Variables con `{{nombre}}` y partials con `{{> nombre}}`.
- Partials mínimos: `head`, `cabecera` (con megamenú), `migas`, `cta-presupuesto`, `pie`, `schema`.
- Plantillas: `inicio`, `categoria`, `pagina` (texto de `/content`), `contacto` y `oviedo`.

---

## 8. Cómo trabajamos (dos personas y dos IAs)

| | Persona A (técnica) | Persona B (contenido) |
|---|---|---|
| Carpetas | `/src`, `build.js`, `/assets/css`, `/assets/js` | `/data`, `/content`, `/assets/img` |
| Tareas | SEO técnico (canonical, schema, sitemap, robots), `.htaccess`, rendimiento, accesibilidad, publicación | Textos, intros, migración de productos desde `/legacy`, imágenes optimizadas y alts, `docs/inventario-urls.csv` |

- **Ninguna de las dos edita las carpetas de la otra sin avisar.** `AGENTS.md` y `/docs` son compartidos: se avisa antes de tocarlos.
- **Git:**
  - `main` siempre funciona (`node build.js` termina sin errores).
  - Una rama por tarea: `feat/…`, `content/…`, `fix/…`.
  - Pull request revisada por la otra persona.
  - Merge 2-3 veces al día para no acumular conflictos.
- **Commits pequeños y en español:** `feat: plantilla de categoría`, `content: intros de resistencias`, `fix: canonical en /oviedo/`.
- **Toda IA que trabaje en el repo debe leer `AGENTS.md` antes de empezar y respetarlo.** Si una decisión cambia, se actualiza `AGENTS.md` en el mismo commit.
- Ante la duda, una IA **pregunta o marca [POR VERIFICAR]**; no inventa.

---

## 9. Definición de terminado

Una página está lista cuando cumple todo esto:

- [ ] Mantiene su URL (misma ruta y nombre de archivo; `MANTENER` en el CSV).
- [ ] Tiene title, meta description y H1 revisados (sección 3.2).
- [ ] Conserva **todos** sus productos (compararla con `/legacy`).
- [ ] Las imágenes están optimizadas (WebP 480/960 + JPG) y tienen `alt` real, `width` y `height`.
- [ ] El schema es válido.
- [ ] Se ve bien a **360 px, 768 px y 1280 px**.
- [ ] No tiene enlaces rotos.

---

## 10. Prohibido

- Renombrar archivos `.html` existentes.
- Editar `/legacy` o `/dist` a mano.
- Añadir frameworks o librerías (ni en el navegador ni como dependencia npm de `build.js`).
- Inventar datos técnicos.
- Borrar contenido indexado sin redirección.
- Subir credenciales al repositorio (FTP, contraseñas, claves de API, `.env`).

---

## 11. Pendientes [POR VERIFICAR]

1. Accesos a **FTP**, **Search Console** (de los dos dominios) y **DNS del `.es`**.
2. Si la **delegación de Oviedo sigue activa**.
3. Cómo se procesará el **formulario** (PHP en el hosting o servicio externo).
4. **Versión de host preferida** (con o sin www; el `sitemap.xml` actual usa sin www).
5. Qué contacto se conserva: `/contacto/contacto.html` (propuesta) o `/contacto.html`, según el tráfico en Search Console.
6. Si `catalogo-resistencias-calefactoras.pdf` (`.es` y `/oviedo/`, 11.485.020 bytes) es el mismo catálogo que `catalogo-Brototermic-resistencias.pdf` (`.com`, 11.489.132 bytes). Los archivos no son idénticos.
7. **Año de fundación 1982** y dirección exacta «C/ Pintor Mauro Ortiz de Urbina, 7 bajo»: los ha dado el cliente y no aparecen así en `/legacy`.
8. **Coordenadas** de las dos sedes y **horarios** (para LocalBusiness).
9. **Logo vectorial (SVG)** y logos oficiales de las marcas.
10. Qué productos de `nuevos-productos.html` («2021») siguen vigentes.
11. Si las certificaciones ATEX de cada producto siguen bajo 94/9/CE o ya están bajo 2014/34/UE (documentación del fabricante).
12. Si se crean **páginas de familia** (hoy las familias del menú tienen `href="#"`). Serían URLs `NUEVA` y habría que añadirlas al CSV.
13. Tipografía (Lora autoalojada + sistema) y forma de mostrar los mapas.
14. Cómo se comparte `/legacy` entre las dos personas (ver sección 7).

---

## 12. Anexos: datos extraídos de /legacy

### 12.1 Qué contiene /legacy

Descargado con `wget` el 2026-10-09:
- `legacy/com/brototermic.com/`: todo lo enlazado desde la portada, más lo que estaba publicado pero no enlazado: `contacto.html`, la sección `oviedo/` (copia del `.es`) y `sitemap.xml`.
- `legacy/es/www.brototermic.es/`: la web del `.es` (4 páginas + 2 PDF).

En total hay **56 páginas HTML**: 48 del `.com`, 4 de `/oviedo/` (copias idénticas del `.es`) y 4 del `.es`. También hay **12 URLs de PDF** (8 en `/docs/` del `.com`, 2 en `/oviedo/docs/` y 2 en el `.es`) y unas 300 imágenes de contenido. El detalle está en `docs/inventario-urls.csv` y `docs/inventario-imagenes.csv`.

### 12.2 PDF

| URL | Enlazado desde | Nota |
|---|---|---|
| `/docs/catalogo-instrumentacion.pdf` | inicio | Idéntico (mismo MD5) al de `/oviedo/docs/` y al del `.es` |
| `/docs/catalogo-Brototermic-resistencias.pdf` | inicio | Distinto del `catalogo-resistencias-calefactoras.pdf` del `.es` [POR VERIFICAR] |
| `/docs/Acabados-resistencias-cartucho.pdf` | `resistencias-tipo-cartucho.html` | |
| `/docs/catalogo_termopares_broto-03-02-2015.pdf` | `controltemperatura-sondastemperatura.html` | |
| `/docs/catalogo_cañas_pirometricas_broto-03-02-2015.pdf` | `controltemperatura-sondastemperatura.html` | **Lleva ñ.** Copia sin ñ: `/docs/catalogo-canas-pirometricas-broto-03-02-2015.pdf` |
| `/docs/DISPLAYS DIGITALES PROGRAMABLES BROTOTERMIC HR.pdf` | `controltemperatura-indicadores-de-procesos.html` | Lleva espacios y mayúsculas; se mantiene tal cual (URL indexada) |
| `/docs/disibeint.IoT.pdf` | `nuevos-productos.html` | |
| `/docs/ejemplo-de-aplicacion-iot-didieint.pdf` | `nuevos-productos.html` | «didieint» es una errata del nombre, pero se mantiene (es la URL) |
| `/oviedo/docs/catalogo-instrumentacion.pdf`, `/oviedo/docs/catalogo-resistencias-calefactoras.pdf` | `/oviedo/` | Se redirigen a `/docs/` |

### 12.3 Productos por página

Nombres tal como aparecen en `/legacy` (sin corregir):

- **resistencias-inmersion**: Modelos NA, OV, T · Modelos DP, ED, ET · Modelos Gama Europa · Grupo Monobloc · Candelas termo con refractario · Grupos calefactores con bridas · Calentadores al paso · Copa sumergible · Calentadores para líquidos · Calentadores para líquidos agresivos · Sumergidores baños agresivos · Calentadores de inmersión fijos · Resistencias inmersion industria · Reistencias con caja conexiones IP-44
- **resistencias-calentamientoaire**: Resistencias para calentamiento de aire aletadas · Resistencias con racores aire reforzado · Baterías eléctricas (×4) · Conducto cilíndrico · Resistencias para horno y estufa · Resistencias de Nitruro de Boro · Resistencias Espiraladas para Hornos Industriales · Sistemas Resistencias para Tubos Radiantes · Paneles Calefactores · Sistemas Combinados · Aerotermo Industrial ATEX
- **resistencias-flexibles**: Conformables alto rendimiento · Elementos para desescarche · Cable calefactor de silicona · Bipolares de silicona tipo torpedo · Cable calefactor tipo paralelo · Resistencias cobre recocido · Resistencias para compresores · Cintas calefactoras alta temperatura · Cable calefactor aislamiento mineral · Cable calefactor autorregulante · Mangueras calefactoras · Laminares flexibles autoadhesivas · Banda calefactora de silicona, AFBS · Banda calefactora de silicona, AFAFS · Banda de silicona, AFHSSD
- **resistencias-infrarrojos**: Barritas de cuarzo · Monotubulares onda larga 77F · Monotubulares de onda media IRCM · Bitubo de onda media 77P · Emisores de onda corta IRCC · Bitubo de onda corta, modelos 81P · Equipos de calentamiento · Emisores cerámicos infrarrojos OSC / OSP / OSH / BOS · Pantallas de infrarrojos de cuarzo PQ · Infrarrojo compacto IC1003 / IC1013NG / IC1007 / IC1008 / IC1014FM
- **resistencias-tipo-cartucho**: Cartucho alta carga · Cartucho baja carga · Microwatt · Cartuchos con termopar · Cartuchos expan
- **resistencias-tipo-abrazadera**: Soporte de mica sin escafandra · Soporte de mica con escafandra · Cámara protectora de calor · Soporte de cerámica · Sistema hermético latón · Sistema hermético inoxidable · Sistema hermético alta carga
- **resistencias-planas**: Planas soporte de mica · Planas soporte de cerámica
- **resistencias-calefaccion-industrial**: Aerotermo eléctrico ANB · Aerotermo eléctrico RMO · Convectores trifásicos RIS · Convectores monofásicos CIE · Cortinas de aire caliente COR · Pantallas infrarrojos IRC · Pantallas infrarrojos IM
- **resistencias-atex**: Inmersión con tapón roscado RFA · Tapón roscado y vaina RFA-CS · Calentadores de bidón · Convectores zonas clasificadas FAW · Modelos zonas clasificadas FUH · Calefactores para armarios · Aerotermo Industrial ATEX
- **resistencias-especiales-a-medida**: texto corrido, sin productos con nombre
- **resistencias-mantas-calefactoras**: Mantas calefactoras depósitos IBC · Mantas ATEX depósitos IBC · Mantas calefactoras bidón · Camisa aislante aluminio IBC · Cobertura impermeable depósito IBC · Manta aislante depósito IBC · Mantas calefactoras bidón ATEX
- **controltemperatura-sondastemperatura**: Termosonda en vaina metálica · Termopar cerámico alta temperatura · Termopar propósito general · Termopar bayoneta general · Termopar encamisado · Temosonda con mango · Termosonda con zócalo cerámico · Termorresistencia propósito general · Termorresistencia mineral · Sensores PTC · Sensores NTC
- **controltemperatura-convertidores**: Convertidor señal carril Din Slim · Convertidor señal cabezal · Convertidor Señal carril DIN CV/1 · Convertidor señal Carril Din TXrail · Convertidor carril Termo Iso-Flex · Multiplexores MUX
- **controltemperatura-cables-compensacion**: Cable compensación termopar · Cable termorresistencia · Cable eléctrico alta temperatura
- **controltemperatura-indicadores-de-procesos**: Controlador a microprocesador (×3) · Controlador IC PLUS 902 · Controlador IC PLUS 915 · Controlador carril DIN DR4020-4022 · Controlador EW72 · Controlador WAYTEK MPR48 · Controlador multilazo CMC-99 · Regulador digital RGL · Regulador DIS401 · Controlador IDW961 · Controlador ID PLUS · Modulo adquisición datos Sielco D1 · Indicador Gran formato DG-01 · Indicadores universales ITP1 · Controlador doble lazo RE92
- **controltemperatura-videoregistradores**: Video registrador FUJI · Video registrador OHKURA
- **controltemperatura-dataloggers**: Log-Tag TRIX-8 · Log-Tag HAXO-8 · Log-Tag TREX-8 · Interface LTI para Log-Tag · Datalogger USB OM-EL
- **controltemperatura-panelespc-software**: Panel PC · Software adquisición datos Datacare
- **controltemperatura-accesorios-sondas**: Conectores compensados estándar · Conectores compensados mini · Conectores compensados cerámicos · Paneles para conectores · Conectores RTD · Racores deslizantes de compresión · Cabezales conexión · Vainas y Termopozos
- **controltemperatura-sensores-infrarrojos**: Pistola infrarrojos LASERSIGHT · Pirómetro infrarrojos Serie CS · Pirómetro infrarrojos CS-Micro · Pirómetro infrarrojos CS-Laser · Pirómetro infrarrojos Serie CT-Laser · Cámara termográfica fija Serie PI · Cámara termográfica Serie EXX
- **controltemperatura-termometros**: Termómetro EMPLUS600 · Termómetro electrónico EAS62 · Termómetro batería EWTL · Termómetros bimetálicos · Termómetros orientables · Termómetro a distancia · Termómetro tubería · Termómetro digital portátil
- **controltemperatura-termostatos**: Termostatos estancos · Termostato capilar a distancia · Termostato regulable TR2 · Termostato limitador seguridad LS-1 · Termostato bulbo capilar tripolares · Termostato inmersión TC-2 · Termostato regulable tubería BRC · Termostato líquidos agresivos · Termostato ambiente a distancia · Termostato ambiente mecánico · Termostato ambiente digital · Cronotermostato semanal · Cronotermostato radiofrecuencia · Control telefónico GSM/línea fija · Control telefónico GSM enchufable · Sistemas telecontrol y telemando
- **controltemperatura-equipos-de-medicion**: Calibradores de procesos · Horno de Calibración Portátil
- **controltemperatura-reles-estado-solido**: Gama Celpac · Gama Celpac2G · Gama Okpac · Relés estáticos corriente continua
- **presionhumedad-sondas-de-humedad**: Sonda humedad EWHS-284 · Sonda humedad EWHS-304 · Humedad/Temperatura EWHS-314 · Sonda humedad/temperatura STA-3 · Humedad/temperatura STA-3E · Sonda Humedad ambiente · Sonda Humedad/Temperatura cable · Transmisor Humedad
- **presionhumedad-sensores-de-presion**: Transmisor TPSP22 · Transmisor TPSP41 · Transmisor TPSP42 · Transmisor TPSP 32 · Detector presión PA3060 · Detector presión PN7160 · Transmisor TPSM40
- **controldenivel-niveles-de-flotador**: Sensor flotador INCR · INMR ECO · INMR INOX · INMR-VS · INMR-AMS · INMR HYP
- **controldenivel-interruptores-magneticos**: IMN 40 INOX · IMN 70 INOX · IMN 50 NY V · IMN 50 INOX H · IMN RP INOX · IMN TP INOX · IMN TC INOX · IMN TB PVC · IMN BC INOX · IMN BB PVC · IMN DP INOX · IMN TBEX INOX · IMN MPS
- **controldenivel-sensores-conductivos**: Electrodos NR 1 ½ · Electrodos NRA 1 1/2 · Electrodo NTBI · Electrodo NT · Electrodo NS · Electrodo NP · Electrodo NCPS DB INOX
- **controldenivel-sensores-capacitivos**: Sensor SCR 35 · Sensor SCRR 35 T 43650 · Sensor SCAV TB
- **controldenivel-transductores-magneticos**: TMN 300 TB INOX · TMN 300 DB INOX
- **controldenivel-sensores-de-presion**: Sensor CNM 10 · Sensor CNM 30 · Sensor CNM 20 EX
- **controldenivel-sensores-de-ultrasonidos**: Sensor ultrasonido SNU30P-1
- **controldenivel-niveles-rotativos**: Sensor CNPR-N · Sensor CNPR-D
- **controldenivel-reles-de-nivel**: PNSA-DNSA-SNSA · PNEA-DNEA · PNDA-DNDA · PNGA-DNGA · SNDA · PNWB · PTBA · PNAS · SNIA-SIN
- **ventilacion**: Ventiladores compactos · axiales · centrífugos · tangenciales
- **equipos-perifericos**: Alimentadores · Atemperadores · Caudalímetros · Deshumidificadores · Desincrustadores · Dosificadores · Mezcladores · Filtros magnéticos · Secadores
- **equiposderefrigeracion-refrigeradores-chillers**: Modelo ENR 003 · Modelo ENR 001 · Modelo ENR 038
- **hornos-industriales**: Horno Mic · Horno Metalar · Horno SM
- **fabricaciones-a-medida**: Calefactor de inmersión · Batería calentamiento aire · Resistencias abrazaderas · Sensores de temperatura · Detectores de nivel
- **nuevos-productos**: Equipos de refrigeración. CHILLERS · Sensores de nivel. IOT INDUSTRIAL · Calefactores de inmersión ATEX · Multiplexores MUX

### 12.4 Problemas técnicos de la web actual (no repetir)

- Dos versiones de jQuery cargadas a la vez, `superfish` y `<!--[if lt IE 9]>`.
- `min-width: 1150px` en el `body`: la web no es responsive.
- Metas obsoletas en todas las páginas (`keywords`, `revisit-after`, `distribution`, `robots all`, `DC.*`).
- Ningún canonical y ningún `robots.txt` (404). Las dos versiones del host (con y sin www) responden 200. `http` → `https` con 302.
- Títulos con «|» sin espacios y H1 que acaban siempre en «. BROTOTERMIC, S.L.».
- Alts genéricos del tipo «Producto. BROTOTERMIC, S.L.».
- Decenas de `<br/>` vacíos para maquetar.
- `callto:` en lugar de `tel:`. Enlaces sin protocolo (`href="www.agpd.es"`, `href="info@brototermic.com"`) que dan 404.
- Las páginas `contacto/` cargan `contacto/images/logo.png` y `contacto/images/favicon.ico`, que no existen (404).
- API key de Google Maps y site key de reCAPTCHA en el HTML. No se reutilizan; si hacen falta, se crean claves nuevas restringidas por dominio, y nunca se suben al repo si son secretas.
- `sitemap.xml` con `lastmod` 2022-06-15 en todas las entradas y URLs repetidas.

### 12.5 Correspondencia de URLs

El control completo está en **`docs/inventario-urls.csv`**:
- Columnas: `url, title, meta_description, h1, estado, destino_301`.
- Codificación UTF-8 con BOM y separador coma.
- Los `title`, `meta_description` y `h1` son los **antiguos**, como referencia para conservar la palabra clave.

### 12.6 Cómo regenerar /legacy

Solo sirve mientras la web antigua siga publicada. En Windows, `wget` se instala con `winget install JernejSimoncic.Wget`.

```bash
wget --mirror --page-requisites --no-parent --wait=1 --restrict-file-names=nocontrol -P legacy/com https://brototermic.com
wget --mirror --page-requisites --no-parent --wait=1 --restrict-file-names=nocontrol -P legacy/es https://www.brototermic.es
# Páginas publicadas pero no enlazadas desde la portada:
wget --page-requisites --no-parent --wait=1 --restrict-file-names=nocontrol -P legacy/com https://brototermic.com/contacto.html
wget --mirror --page-requisites --no-parent --wait=1 --restrict-file-names=nocontrol -P legacy/com https://brototermic.com/oviedo/
curl -o legacy/com/brototermic.com/sitemap.xml https://brototermic.com/sitemap.xml
# En Windows, wget codifica mal la ñ: estos dos archivos se bajan aparte
curl -o "legacy/com/brototermic.com/docs/catalogo_cañas_pirometricas_broto-03-02-2015.pdf" "https://brototermic.com/docs/catalogo_ca%C3%B1as_pirometricas_broto-03-02-2015.pdf"
curl -o "legacy/com/brototermic.com/images/brototermic-convertidor-señal.jpg" "https://brototermic.com/images/brototermic-convertidor-se%C3%B1al.jpg"
```
