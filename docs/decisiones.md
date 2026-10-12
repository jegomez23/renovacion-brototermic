# Registro de decisiones

> Registro detallado y cronológico de las decisiones del proyecto: qué se decide, por qué, quién lo decide y qué documentos se actualizan. El **resumen** de las decisiones vigentes sigue en [AGENTS.md](../AGENTS.md), sección 11; si una entrada de aquí contradice a AGENTS.md, se corrigen los dos en el mismo commit.
>
> Formato: una entrada por decisión, la más reciente al final. Una decisión que sustituye a otra lo dice y enlaza con ella; la antigua no se borra.

## D-001 · 2026-10-09 · Se descarta la reescritura del historial de git

- **Origen:** responsable del proyecto, antes de publicar el piloto.
- **Contexto:** se había rehecho el historial en local para corregir el email de autor de los 3 commits iniciales y para quitar de `/legacy` la API key de Google Maps. Pero ese historial ya estaba en GitHub (`origin/main` y `origin/jhonda/desarrollo`) y la Persona B trabaja sobre él: publicarlo exigía un `push --force` y obligaba a rehacer su rama.
- **Decisión:**
  - No se reescribe el historial ni se hace `push --force`. El estado reescrito se guarda en la rama local `backup/historial-reescrito` (no se publica).
  - `main` parte de `origin/main` y el trabajo nuevo se aplica encima con `cherry-pick`.
  - Los commits antiguos conservan su email de autor (mal escrito) y la clave de Maps en `/legacy`. **`/legacy` vuelve a ser una copia byte a byte, sin excepciones.**
  - La clave ya es pública en la web actual: la restringe o revoca el cliente (pregunta 25 de [preguntas-cliente.md](preguntas-cliente.md)). Ningún commit nuevo la añade ni la reutiliza.
- **Sustituye a:** las entradas del 2026-10-09 «Git: autoría rehecha» y «API key sustituida por `[CLAVE_ELIMINADA]`» de AGENTS.md §11.
- **Documentos:** AGENTS.md (§7, §10, §11 e índice), `.gitattributes`, preguntas-cliente.md.

## D-002 · 2026-10-09 · Cabecera blanca con el logo original (HITO-1)

- **Origen:** responsable del proyecto, revisión del piloto (HITO-1).
- **Decisión:** la barra principal de la cabecera pasa a **blanco**, con navegación en `#1d356c` y botón primario «Pedir presupuesto». Se mantiene una **franja fina en `#004c9a`** (≥ 768 px) con los teléfonos de las dos sedes y el email.
- **Ajuste necesario:** todas las versiones del logo en /legacy (`logo.png`, `logotipo-brototermic-oviedo.png`, `footer-logo.jpg`) tienen «Termic» y el subtítulo en blanco, así que sobre blanco solo se leía «Broto». Por decisión del responsable se usa una **versión provisional**, `images/logo-claro.png`: copia del `logo.png` original en la que solo los píxeles blancos pasan a `#004c9a` (forma, proporciones y resto de colores intactos). El `logo.png` original se sigue usando en el pie (fondo oscuro). Se sustituye por el SVG del cliente cuando llegue (AGENTS.md §12, pendiente 14).
- **Documentos:** AGENTS.md §6, diseno.md §2.1 y §3.1, datos.md (`logo`, `logoFondoOscuro`), `site.json`, CSS y parciales.

## D-003 · 2026-10-09 · Title del inicio (HITO-1)

- **Decisión:** «Componentes industriales e instrumentación | BROTOTERMIC» (56 caracteres). Conserva la keyword completa y la marca; es la única página cuyo title antiguo tenía «Vitoria» y el nuevo no.
- **Sustituye a:** la propuesta «Componentes industriales e instrumentación en Vitoria».
- **Documentos:** plan-paginas.csv, AGENTS.md §3.2, `tools/validar-plan.js` (excepción explícita para `index.html`).

## D-004 · 2026-10-09 · Hero del inicio a 910 px (HITO-1)

- **Decisión:** `slide-1` se sirve a su tamaño real, **910 px**, con `slide-1.webp` y `slide-1.jpg` de respaldo, **solo en el hero**. Es la única imagen que se sirve a más de 480 px.
- **Documentos:** AGENTS.md §5, diseno.md §3.4, plan-imagenes.csv, tareas.md (B-2-05).

## D-005 · 2026-10-09 · Se descarta la ampliación de imágenes con IA (HITO-1)

- **Decisión:** **se descarta Real-ESRGAN** y cualquier ampliación. Se usan las **imágenes originales a su tamaño real**, en un contenedor 4:3 con `contain` y marco blanco. WebP opcional con las mismas medidas.
- **Retoque manual:** solo las **3 fotos del piloto con dominante de color**, y solo en **fondo e iluminación**. Se eligieron midiendo el color medio del borde de las 14 fotos: `brototermic-industriaalimentaria` (212,211,194), `brototermic-calefactores` (249,243,235) y `brototermic-liquidos-noagresivos` (234,232,226); las otras 11 tienen el fondo neutro.
- **Sustituye a:** la ampliación ×2 en lote y el retoque en fases (AGENTS.md §11, primera fila de imágenes del 2026-10-09).
- **Documentos:** AGENTS.md §5, §9 y §12; plan-imagenes.csv (acción `ORIGINAL`, columna `retoque_manual`); tareas.md (se elimina el comando y la sección de ampliación); datos.md; `build.js` (ya no avisa de WebP que faltan).

## D-006 · 2026-10-09 · Buscador de categorías y marco blanco: aprobados (HITO-1)

- **Decisión:** se aprueban el buscador de categorías del megamenú (diseno.md §3.15) y el marco blanco de las fotos de producto.

## D-007 · 2026-10-09 · Decisiones de la revisión de Codex

- **Origen:** revisión de Codex, según la lista del responsable del proyecto. **El documento `docs/revision-codex.md` no existe** en el repositorio, en GitHub ni en el equipo; si se recupera, se añade y se contrasta con esta entrada.
- **Estado de cada punto al revisarlo:**

| Punto | Estado previo | Qué se ha hecho |
|---|---|---|
| Sin comodín en el `.es`: 301 solo para URLs conocidas, 404 el resto | No aplicado (había un 301 de `brototermic.es/*` a `/oviedo/`) | redirecciones.csv: la fila pasa a tipo `404`; AGENTS.md §3.1; arquitectura.md; checklist; `tools/probar-redirecciones.sh` prueba el 404 |
| Formulario compatible con `rd-mailform.php` (`name`, `email`, `phone`, `message`, `form-type`) + `empresa`, `adjunto`, `rgpd`; URL de envío en `site.json`; sin envío real hasta tener el hosting | Parcial (la URL estaba en `site.json`, pero los nombres de campo no estaban fijados) | datos.md (tabla de campos), `site.json` (`accion` = `/contacto/bat/rd-mailform.php`, `envioActivo: false`), `build.js` lo valida y lo avisa, AGENTS.md §6, checklist |
| `build.js` con modo `piloto` (aviso) y `publicacion` (error) | Parcial (existía `--publicar`, pero los enlaces a páginas pendientes eran aviso también al publicar) | `--modo=piloto` / `--modo=publicacion` (`--publicar` queda como alias); los enlaces pendientes son error en publicación |
| Bloque de sectores solo con sectores de /legacy y sin URLs nuevas | No existía | arquitectura.md: regla y tabla de sectores con su página de origen |
| Corregir los alt de RE92 y de Catálogos | No aplicado | plan-imagenes.csv: RE92 tenía el alt del DG-01 (copia-pega de /legacy); la foto de Catálogos es un cajón de archivador: alt vacío (decorativa) |
| Accesibilidad: *Disclosure Navigation* del W3C y `prefers-reduced-motion`; probar a 320 px | Aplicado salvo la prueba a 320 px | Se documenta el patrón en diseno.md y AGENTS.md §6; `tools/capturas.js` y la definición de terminado incluyen 320 px |

## D-008 · 2026-10-09 · Catálogo completo y auditor de paridad SEO

- **Origen:** responsable del proyecto (sesión del catálogo). Principio rector: **no perder el posicionamiento actual**.
- **Decisiones:**
  - Se crea `tools/auditoria-seo.js` (informe en `docs/auditoria-seo.md`) y `build.js` lo ejecuta; en modo publicación, un ERROR detiene el build.
  - Las 38 categorías restantes se extraen de /legacy de forma **literal** con `tools/importar-legacy.js`, aplicando solo las erratas de `plan-contenido.md` §3 (más las tildes de «Todas las páginas»). Quedan con `_borrador: true` y con una intro de borrador para la revisión de la Persona B.
  - El texto que en /legacy está fuera de los productos (introducciones, programa de fabricación, PDF de acabados) se conserva en `cuerpo` y se pinta en la columna principal, antes de los productos; sus imágenes, en `imagenesCuerpo`.
  - **H1 de `resistencias-especiales-a-medida`:** «Fabricación especial y a medida de resistencias» (el anterior no contenía la keyword «fabricación especial y a medida»).
  - Los iconos `Pdf_icon.png` se sustituyen por la etiqueta de texto «PDF» (el enlace al PDF se conserva) y los enlaces `href="#"` que envolvían fotos se eliminan (no llevaban a ningún sitio; la foto se conserva).
  - **Logo del pie:** el logo original tiene «Broto» en marino y no se lee sobre `#1d356c`: el pie usa el logo para fondo claro sobre una placa blanca (`logoFondoOscuro` queda sin uso hasta que haya un SVG en blanco).
  - Listas de especificaciones que ya traen su número en el texto («1. Base soldada…», remiten a la imagen): se pintan sin viñeta y con el texto literal.
- **Pendiente de decidir:** la frase de pie propia de cada página antigua (texto de 25 px, ver el informe de la sesión) y la mención genérica a la Directiva 94/9/CE del `cuerpo` de `resistencias-atex` (plan-contenido §4, fila 7: se deja literal hasta que la Persona B la actualice).

## D-009 · 2026-10-10 · Páginas de familia, servicio y legales; ajustes del auditor

- **Origen:** sesión de las páginas restantes (rama `feat/paginas-restantes`). Principio rector: no perder el posicionamiento actual.
- **Decisiones:**
  - **Familias:** plantilla `familia` con tarjetas de categoría (foto del primer producto, alt vacío porque el título ya es el enlace), bloque «¿No encuentras lo que buscas?» con el texto de /legacy de fabricaciones a medida y enlaces a las otras familias. Intros redactadas con el prompt estándar solo con datos de /legacy, marcadas `_borrador` para la revisión de la Persona B.
  - **`/content`:** metadatos `miga`, `sedes` y `borrador: si` (este último bloquea la publicación como `_borrador`); se admiten `figure` e `img` (build.js añade medidas, lazy y WebP). Contrato en datos.md §5.
  - **Auditor:** el chequeo de productos solo se aplica a categorías; las sustituciones del §4 de plan-contenido (y las eliminaciones decididas) están en `tools/lib/legacy.js → SUSTITUCIONES` y no cuentan como frases perdidas; un H1 sin keyword es AVISO (no ERROR) si el H1 antiguo tampoco la tenía (caso «Nuestra historia» de empresa); los enlaces sin protocolo de /legacy (`www.agpd.es`, `info@…`) no se exigen (daban 404, AGENTS.md §3.2); `&nbsp` sin «;» se decodifica como espacio.
  - **Cookies (§4.18):** la política describe que la web nueva no usa cookies; se eliminan también las categorías «esenciales» (sesión, cesta), «analíticas» y «de usuario» (idioma) que describía el texto antiguo, porque la web nueva no las tiene. [REVISIÓN CLIENTE]
  - **Privacidad:** texto literal con §4.15-4.17 y §4.20 (párrafo de adjuntos del formulario). Nueva marca [REVISIÓN CLIENTE]: el apartado de Microsoft se apoya en el acuerdo Privacy Shield, anulado en 2020.
  - **Mapa web:** lo genera build.js con los H1 del plan y da error si falta alguna página. El rótulo antiguo «Niveles de boya» se conserva con el campo nuevo `otrosNombres` de familias.json (también lo usa el buscador del menú).
- **Documentos:** datos.md (§2 y §5), build.js, tools/auditoria-seo.js, tools/lib/legacy.js, plantillas `familia`, `servicio` y `legal`.

## D-010 · 2026-10-10 · Página 404 propia y tira de logos de marcas a 990 px

- **Origen:** responsable del proyecto, revisión del informe de la sesión del 2026-10-10.
- **Decisiones:**
  - **Página 404 propia** (era la propuesta pendiente 13 de AGENTS.md §12): `/404.html` con `<meta name="robots" content="noindex">`, sin canonical, sin JSON-LD y fuera del sitemap. Texto en `content/404.html` (enlaces al inicio, las 4 familias, el mapa web y el formulario). El `.htaccess` la sirve con `ErrorDocument 404 /404.html` en el `.com`; en el `.es` se mantiene el 404 por defecto de Apache, porque los enlaces de la 404 son rutas del `.com`. `build.js` la genera aparte del plan (no es una URL indexable) y da error si se genera cualquier otra página fuera de `plan-paginas.csv`.
  - **Tira de logos de marcas** (`/images/brototermic-marcas-representadas.jpg`, 990 × 80): se aprueba como **excepción** a la regla «solo el hero se sirve a más de 480 px», con `loading="lazy"` (está por debajo del primer pantallazo). Se conserva la URL indexada de /legacy. Cuando lleguen los SVG oficiales de las marcas (pendiente 8), se sustituye por los logos individuales y esta excepción desaparece.
- **Documentos:** AGENTS.md (§5, §11 y §12.13), diseno.md §3.4, `src/.htaccess`, `build.js`, `content/404.html`, `tools/comprobar-dist.js`.

## D-011 · 2026-10-10 · Correcciones de la auditoría final independiente (rama `fix/auditoria`)

- **Origen:** responsable del proyecto, a partir de [auditoria-final.md](auditoria-final.md).
- **Auditor de paridad SEO (A-01):**
  - **Datos técnicos exactos:** cifras, unidades, rangos, modelos, IP y teléfonos se comparan sin tolerancia, producto a producto y en los dos sentidos (lo que falta se ha perdido; lo que sobra se ha inventado). Solo se normaliza lo que no cambia el dato (`1500mm` = `1500 mm`, `IP-44` = `IP44`, `º`/`°`, coma o punto decimal, unidad compartida en un rango, `AISI 316` = `AISI316`). Las intros nuevas tampoco pueden traer un dato técnico que no esté en /legacy. Las únicas excepciones son las correcciones registradas en plan-contenido.md §3 y §4.
  - Las cifras ya no casan «por parecido» en la comparación de texto (`12000` ≠ `13000`), y en las categorías la cobertura de texto se mide **producto a producto**: en una página con productos casi iguales, una frase borrada se «encontraba» en el producto de al lado.
  - Si no encuentra el área de contenido de la página antigua, es **ERROR** (antes daba «100 %»). Se lee también la plantilla de /legacy de `/oviedo/` y contacto (de `<header>` a `</main>`).
  - Las redirecciones se comprueban contra el **`.htaccess` real** (`tools/lib/htaccess.js`, un simulador del subconjunto de directivas que usamos), no solo contra el CSV. No sustituye a la prueba en Docker.
  - **`tools/test-auditor.js`:** 10 pruebas de mutación (borrar un producto, borrar una frase, cambiar un número, una unidad o un modelo, inventar un dato en la intro, quitar un PDF, cambiar la ruta de una imagen, quitar una redirección, página antigua ilegible). Se ejecutan siempre antes de dar por buena una auditoría (desde `auditoria-seo.js` y desde `build.js`); si alguna no se detecta, el build falla en cualquier modo.
  - Que una imagen siga publicada no justifica quitarla de su página: solo una fila `ELIMINAR` de plan-imagenes.csv.
- **Imágenes antiguas (A-02):** todas las imágenes con URL pública de `/images/` y `/oviedo/images/` de /legacy (45 que no estaban en `/dist`) se publican aunque no se muestren, para que ninguna URL indexada dé 404. `build.js` las copia de /legacy (copia byte a byte de la web actual; así no se duplican en git); si `/images/` del repo tiene una con el mismo nombre, manda la del repo. Las imágenes `ORIGINAL` de `/oviedo/` se usan con su URL original (`foto: "oviedo/images/brototermic-oviedo"`), y se retira la copia `images/brototermic-oviedo.jpg`.
- **Publicación (A-02):** solo se sube el contenido de `/dist` y `/dist-es`; `tools/comprobar-publicable.js` lo comprueba con una lista blanca en cada build. La web antigua no se mueve fuera del docroot hasta que el formulario nuevo funcione en producción; la limpieza, 2 semanas después (publicacion.md §2.5). `dist/.gitkeep` sale del repositorio (dist/ y dist-es/ se ignoran enteros).
- **`.es` (C-03):** docroot propio con su `.htaccess` (`src/es/.htaccess` → `/dist-es`), solo con `mod_alias`. Escenarios A (mismo hosting, otro docroot), B (otro hosting) y C (mismo docroot: el `.htaccess` del `.com` mantiene las reglas del `.es` como red de seguridad) en publicacion.md §2.4. Apache de pruebas con dos vhosts y dos docroots.
- **`.htaccess` del `.com`:** fuera `Options`, `DirectoryIndex` y `<If>` (500 si el hosting no permite su override o es Apache < 2.4); el listado de carpetas se bloquea con mod_rewrite; `AddOutputFilterByType` también dentro de `<IfModule mod_filter.c>`.
- **Formulario (C-02):** `src/contacto/enviar.php` (PHP nativo): validación en el servidor, RGPD, campo trampa, cabeceras sin datos del usuario salvo un Reply-To validado, adjunto con lista blanca + `finfo` + firma de DWG/DXF + nombre regenerado y sin guardarlo, límite por IP (hash con sal), comprobación de `Origin` y redirección 303 a `/contacto/gracias.html` o `/contacto/error.html#motivo` (noindex). Configuración fuera del docroot (`config-formulario.php`, ejemplo en `config.example.php`). Probado en local con PHP 8.2 (`php -S`) y un capturador SMTP. **`rd-mailform.php` no se usa** (AGENTS.md §2). `envioActivo` sigue en `false`.
- **Contenido:** `/oviedo/` recupera todo el texto antiguo (Calidad / Servicio / Innovación, Mercado y aplicación); contacto conserva la keyword del H1 antiguo («Contacto: componentes industriales en Vitoria y Oviedo») y los rótulos de las sedes («Sede central en Vitoria-Gasteiz», «Delegación en Asturias (Oviedo)»); alts corregidos (PNWB, Sielco D1, 4 baterías, 2 soportes de mica) y aviso de `build.js` si un mismo alt se repite en fotos distintas; privacidad sin la afirmación de que el Privacy Shield está vigente [REVISIÓN CLIENTE]. Sustituciones registradas en plan-contenido.md §4, filas 21 a 24.
- **Documentos:** AGENTS.md (§2, §3.1, §5, §7, §11, §12), datos.md, plan-contenido.md, plan-imagenes.csv, plan-paginas.csv (H1 de contacto), diseno.md, publicacion.md, checklist-publicacion.md, auditoria-final.md (columna «Estado»), tools/apache-pruebas.

## D-012 · 2026-10-10 · Sesión de cierre: bocetos, npm run dev y endurecimiento del .htaccess

- **Origen:** responsable del proyecto (sesión de cierre antes de integrar en `main`).
- **Bocetos (M-07):** las imágenes del diseño aprobado (opción 3) están en `docs/boceto/`. Son **referencia visual**: se generaron con IA y sus datos (teléfonos, direcciones, logos, fotos, ventajas) no son reales. Los datos salen de AGENTS.md y `site.json`. Las diferencias con lo construido están en `docs/boceto/README.md`, pendientes de decidir.
- **`package.json` sin dependencias**, solo con scripts: `dev`, `build`, `build:publicacion`, `test` y `validar`. No contradice AGENTS.md §2 («sin dependencias npm»): no hay nada que instalar. En `npm run dev`, el primer build es completo y las reconstrucciones automáticas usan `--sin-auditoria`, que `build.js` rechaza en modo publicación. El validador W3C (`tools/vnu/`) se descarga aparte y no va en git.
- **`tools/servir.js` (B-09):** solo escucha en 127.0.0.1, no deja salir de `/dist` (ni a carpetas hermanas) y responde la 404 propia.
- **`.htaccess` (M-04 y M-08)**, todo sin riesgo de 500: Permissions-Policy; **HSTS con `max-age=300`** (se sube a un año tras una semana sin incidencias en producción; sin `includeSubDomains` hasta comprobar los subdominios); **CSP en modo `Content-Security-Policy-Report-Only`** (solo `'self'` y el hash del único script en línea; se activa tras revisar la consola en producción); archivos ocultos (salvo `/.well-known/`) y copias de seguridad → 404 con mod_rewrite, no con `Require` (que exige otro override).
- **Documentos:** README.md, AGENTS.md (§7), `docs/boceto/README.md`, auditoria-final.md (estados de M-04, M-07, M-08 y B-09).

## D-013 · 2026-10-11/12 · Sesión de la Persona B (PR #1-#9)

- **Origen:** la Persona B, en 9 PR desde las ramas `review/jhonda-*`. El responsable del proyecto las fusionó el 11 y el 12 de octubre **sin revisión registrada en GitHub**. Se registran aquí a posteriori, a partir de la revisión de [revision-sesion-b.md](revision-sesion-b.md); las que esa revisión propone cambiar lo indican.
- **Decisiones, por PR:**
  - **PR #1:**
    - Las tarjetas de resistencias, temperatura y nivel del inicio usan copias idénticas de `oviedo/images/electticfor-brototermic-oviedo.jpg` (370 × 290), `slide-3.jpg` y `slide-4.jpg` (910 × 426) con `alt=""`, seleccionadas en `build.js → modeloInicio`.
    - «Productos a medida» usa `brototermic-calefactor-inmersion.jpg`, sin atribuir fabricación propia a la foto.
    - «Catálogos» usa `portada-catalogos-provisional.png` (las portadas de los dos PDF), provisional hasta que el cliente confirme la vigencia de los catálogos.
    - Las imágenes que salen del inicio siguen publicadas en su URL (filas `ELIMINAR` en plan-imagenes.csv).
    - En el pie móvil se quita el logo y los teléfonos y emails tienen zona táctil de 44 px.
    - *Revisión R-06, R-07 y R-09: se propone sustituir los banners de 910 px por miniaturas recortadas y llevar la selección a los datos.*
  - **PR #2:**
    - La mención genérica a la Directiva 94/9/CE de `resistencias-atex` se actualiza con la 2014/34/UE (plan-contenido §4, fila 7, y `SUSTITUCIONES` de `tools/lib/legacy.js`), sin tocar ninguna certificación de producto (§4, filas 8-10). Cierra B-02 de auditoria-final.md.
    - Se corrige la errata «Se pude» → «Se puede» (sondastemperatura).
    - Se reescriben 21 alts en `controltemperatura-sondastemperatura`, `resistencias-atex` y `controldenivel-sensores-de-presion`.
    - *Revisión R-04: 5 pierden el modelo o el nombre, ver D-014.*
  - **PR #3:**
    - Sin JS, «Productos» es un enlace a `/mapa-web.html` y no un botón con `aria-expanded`.
    - El panel no se cierra con `mouseleave` si el foco está dentro.
  - **PR #4:**
    - Los botones no cambian con el ratón si están desactivados (`:not(:disabled)`) y tienen estado `:active`.
    - El `summary` del índice recupera su marcador nativo.
  - **PR #5:** botón «Ver productos» (categorías) y «Ver categorías» (familias) bajo el H1, con `tabindex="-1"` en el destino. *Revisión R-14: se propone sustituirlo por «Pedir presupuesto» + enlace «Ver los N productos ↓».*
  - **PR #6:**
    - El limitador por IP de `enviar.php` pasa de *fail-open* a *fail-closed*: si el almacenamiento falla, el envío se rechaza (`error.html#configuracion`) y se anota en `error_log`.
    - Pruebas en `tools/test-limitador.php`.
    - *Revisión R-05: se propone hacer obligatoria la carpeta del limitador y dar al usuario un mensaje con el teléfono.*
  - **PR #7:**
    - El `.htaccess` del `.com` deja `mod_expires` y gestiona la caché solo con `Cache-Control` (`mod_headers`): un año para CSS, JS y WOFF2; 30 días para imágenes y PDF; 1 h para XML, TXT, JSON y manifest; `no-cache` para HTML. Motivo: `ExpiresActive` y `ExpiresByType` exigen `AllowOverride Indexes` y, con `FileInfo`, daban un 500 en toda la web.
    - `/404.html` queda fuera de las reglas cuando la sirve `ErrorDocument` (`REDIRECT_STATUS=404`).
    - Prueba de regresión `tools/test-apache.js` (Apache 2.4.62 nativo, `All` y `FileInfo`: 1.336 peticiones correctas). No sustituye a la prueba en Docker.
    - *Revisión R-03: `[END]` → `[L]` por compatibilidad con Apache 2.2.*
  - **PR #8:** en el móvil del inicio (y solo ahí), las 8 tarjetas de familia pasan a formato compacto (miniatura de 88 px y título en la misma fila).
  - **PR #9:**
    - «Productos a medida» pasa a ser el bloque principal del inicio, con el botón primario «Fabricación a medida».
    - «Mercado y aplicación» y «Catálogos» quedan como bloques de apoyo, solo en el inicio (`/oviedo/` conserva el componente compartido).
- **Documentos:**
  - Ya actualizados en las PR: AGENTS.md §11, plan-imagenes.csv, plan-contenido.md §4, checklist-publicacion.md y tools/apache-pruebas/README.md.
  - Pendientes (revision-sesion-b.md, tarea 1.7): AGENTS.md §5 y §7, estado.md, auditoria-final.md, diseno.md, arquitectura.md y boceto/README.md.

## D-014 · 2026-10-12 · Regla de los textos alternativos: el modelo, siempre

- **Origen:** responsable del proyecto, a partir de la revisión de la PR #2 (revision-sesion-b.md, R-04). Aprobada con el plan de revision-sesion-b.md el 2026-10-12.
- **Contexto:** de los 21 alts reescritos en la PR #2, 16 conservan el modelo o el nombre, pero 5 lo pierden: PTC, NTC, RTD, «propósito general» y «ATEX». Los alts que empiezan por «Esquema de…» o que describen solo el aspecto desplazan el nombre del producto. Los modelos y las designaciones son búsquedas reales del público (AGENTS.md §1), también en Google Imágenes.
- **Regla:**
  - El alt **empieza por el nombre del producto y, si existe, su modelo o designación** (referencia, tipo como PTC, NTC, Pt100 o RTD, o la marca de la gama), **tal como figuran en /legacy**.
  - Sigue **lo que se ve** en la foto: forma, elementos distinguibles y, si es un dibujo o un render, se dice al final («…, dibujo técnico»).
  - Solo datos de /legacy o de los catálogos (AGENTS.md §4). Sin «BROTOTERMIC» y sin repetir el mismo alt en fotos distintas.
  - Una misma imagen usada en dos páginas lleva el mismo alt.
  - Ejemplos: «Sensor PTC con bulbo metálico y cable negro de dos conductores»; «Termorresistencia RTD de propósito general con cable y muelle protector, dibujo técnico»; «Aerotermo portátil ATEX MFH con rejilla circular y patas».
- **Cómo se comprueba:** `build.js` avisará si el alt de un producto no contiene el código de modelo que aparece en su nombre (tarea 1.3 de revision-sesion-b.md).
- **Documentos:** AGENTS.md §5, datos.md (campo `alt`) y plan-imagenes.csv.

## D-015 · 2026-10-12 · Limitador del formulario: si falla su almacenamiento, el envío se acepta

- **Origen:** responsable del proyecto, al aprobar el plan de [revision-sesion-b.md](revision-sesion-b.md). **Sustituye en parte a la PR #6** (D-013).
- **Contexto:** la PR #6 cambió el limitador por IP de `enviar.php` de *fail-open* a *fail-closed*: si su almacenamiento falla (carpeta que no se puede crear o escribir, bloqueo o registro ilegible), el envío se rechazaba con `error.html#configuracion`. Es el criterio habitual en un control de seguridad, y la PR resolvió además errores reales de E/S (escribir antes de truncar, `flock` con `finally`, registro validado). La revisión (R-05) vio el efecto secundario: en un hosting compartido, con `open_basedir` o un `/tmp` no escribible, **todas** las peticiones de presupuesto se rechazarían, y el usuario vería un mensaje que no explica qué ha pasado.
- **Decisión:** si el almacenamiento falla, el envío **se acepta** y se anota en el log de PHP («almacenamiento del limitador no disponible; el envío se acepta sin límite por IP»). Siguen activos el campo trampa, la casilla RGPD, la validación de todos los campos, la comprobación de `Origin` y la del adjunto. Si el almacenamiento funciona, el límite por IP se aplica igual que antes.
- **Por qué:** el objetivo número 1 de la web es generar peticiones de presupuesto (AGENTS.md §1). Perder una petición es peor que dejar pasar algo de spam durante una avería, que además queda registrada y se puede corregir.
- **Se conserva de la PR #6:** el control de errores de E/S y su detección (`dentroDelLimite()` devuelve `null`) y las pruebas de `tools/test-limitador.php`, ampliadas: con cada fallo inyectado, el envío se acepta, se envía 1 correo y queda la línea en el log; con el almacenamiento roto, el campo trampa y la casilla RGPD siguen funcionando. El CI las ejecuta.
- **Configuración:** `config.example.php` recomienda `dir_limites` en una carpeta propia fuera del docroot; la checklist de publicación lo comprueba.
- **Documentos:** `src/contacto/enviar.php`, `src/contacto/config.example.php`, `content/error.html` (mensaje de `#configuracion` con remisión al teléfono y al email), `tools/test-limitador.php`, checklist-publicacion.md y AGENTS.md §2 y §11.

## D-016 · 2026-10-12 · Hero de la versión de demostración: imagen generada con IA, con la placa tapada

- **Origen:** responsable del proyecto, para la presentación al cliente del 2026-10-13.
- **Contexto:** la imagen propuesta para el hero (`tools/datos/fuentes/hero-demo-calefactor-ia.png`) es el calefactor de `slide-1` redibujado con IA. Su placa tenía marcados inventados o ilegibles (CE, «ATEX 2036X», tensión) y llevaba incrustado el rótulo «PRECISIÓN · CALOR · CONTROL». AGENTS.md §5 no permite IA para cambiar un producto ni sus rótulos.
- **Decisión:** se usa **solo en la versión de demostración** (modo `preview`, D-017), con la placa tapada por una superficie lisa y el rótulo fuera del encuadre (receta en `tools/datos/imagenes.json`). Su alt dice que es una ilustración. **En producción el hero sigue siendo `slide-1`** (D-004), ahora con WebP y `srcset` 480/910.
- **Pendiente:** si se quiere esta estética en producción, hace falta una foto real o una imagen de ambiente que no muestre un producto concreto del catálogo.

## D-017 · 2026-10-12 · Modo de build «preview»: versión de demostración que nunca va al hosting real

- **Origen:** responsable del proyecto (presentación al cliente).
- **Decisión:** `node build.js --modo=preview` genera `/dist-preview` (en `.gitignore`):
  - `noindex, nofollow` en **todas** las páginas, cabecera HTTP `X-Robots-Tag` en `_headers` (Netlify y Cloudflare Pages) y `robots.txt` con `Disallow: /`;
  - franja «Versión de demostración» arriba;
  - sin `.htaccess`, sin `enviar.php`, sin sitemap y sin `/dist-es`; el hero de la D-016;
  - no ejecuta el auditor ni la lista blanca de publicación (no es lo que se publica).
- **Nunca se sube al hosting del cliente.** Se publica en un hosting estático aparte (Netlify Drop) solo para enseñarla, y se borra después. `tools/comprobar-publicable.js` sigue revisando solo `/dist` y `/dist-es`.
- `node tools/servir.js 8001 --carpeta=dist-preview` la sirve en local.

## D-018 · 2026-10-12 · Diseño: franjas, antetítulos numerados, hero editorial y CTA bajo el H1

- **Origen:** responsable del proyecto (paso 7 de revision-sesion-b.md, adelantado para la presentación).
- **Decisiones:**
  - **Inicio en franjas** a todo el ancho que alternan blanco, `#f5f6f8` (token nuevo `--color-fondo-suave`, pedido por el responsable) y `#1d356c` (fabricación a medida). Antetítulos «01 · Catálogo», «02 · Aplicaciones»… con la línea de acento cian.
  - **Hero:** antetítulo con el lema del logo («Distribuciones industriales · Instrumentación»), H1 grande en Lora, entradilla, dos botones grandes y el teléfono. En móvil, la imagen arriba; desde 1024 px, titular y botones en dos columnas y la imagen debajo a todo el ancho. El texto va siempre sobre fondo liso (contraste AA).
  - **Tarjetas** con elevación de 3 px y barra cian al pasar el ratón (150 ms; sin movimiento con `prefers-reduced-motion`). El número de categorías o productos, como etiqueta técnica.
  - **Tarjetas de familia** con recortes de las fotos de /legacy (`imgTarjeta` en familias.json, también en `/oviedo/`); «Mercado y aplicación» con el chiller ENR en lugar de la foto de archivo.
  - **Familias y categorías:** franja suave con las migas y, **bajo el H1, «Pedir presupuesto» y «Ver los N productos ↓»** (R-14): la CTA se ve al abrir la página en móvil.
  - En móvil se oculta la tira de logos de marcas (quedan los nombres). Pie con la línea de acento y enlaces sin subrayar hasta pasar el ratón.
- **Documentos:** diseno.md (pendiente de redactar en detalle: ver estado.md).
