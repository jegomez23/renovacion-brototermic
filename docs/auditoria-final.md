# Auditoría final independiente: renovación de brototermic.com

> **Actualización 2026-10-10 (rama `fix/auditoria`, decisión D-011):** se han corregido los hallazgos de la tanda pedida. La columna **Estado** de cada tabla dice qué queda y quién lo resuelve. Resultado tras las correcciones: `test-auditor` 10/10 mutaciones detectadas; auditor en publicación **70 OK · 8 AVISO · 0 ERROR** (78 filas: las 77 URLs y las reglas generales del `.htaccess`); W3C local 55/55 páginas y CSS sin errores ni advertencias; `comprobar-dist` y `comprobar-publicable` correctos; formulario probado en local (PHP 8.2 + capturador SMTP). **Sigue sin poder publicarse**: faltan los borradores (C-01), el acceso al hosting y a Search Console (C-02, C-03, C-04) y la prueba del `.htaccess` en Apache (C-03).

> Fecha: 2026-10-10 · Rama auditada: `feat/paginas-restantes` (commit `8fac00f`) · Modo: **solo lectura**. No se ha modificado ningún archivo del proyecto salvo este informe. Las pruebas se hicieron sobre una copia (`git archive HEAD`) fuera del repositorio, con scripts propios que no forman parte del proyecto.
>
> Criterio: solo se incluyen hallazgos con evidencia. Lo que es una sospecha se marca **SOSPECHA**.

---

## 1. Resumen ejecutivo

**¿Está lista para publicar? NO.** Hoy no se puede publicar, y no es por detalles:

1. `node build.js --modo=publicacion` **falla**: 51 textos siguen en borrador y el formulario tiene el envío desactivado. El propio build lo bloquea, como debe.
2. **El formulario no tiene backend que cumpla AGENTS.md §2.** `enviar.php` no existe, y `rd-mailform.php` no valida el honeypot, la casilla RGPD ni el tipo real del adjunto, y sin JS no devuelve una página de respuesta.
3. **El `.htaccess` no se ha ejecutado nunca en un Apache.** Además, el `.es` se sirve hoy desde otro docroot, así que sus 7 redirecciones 301 y su 404, escritas en el `.htaccess` del `.com`, probablemente no se aplicarían nunca. No hay procedimiento para el `.es`.
4. **No hay Search Console ni línea base**, y las preguntas al cliente no constan como enviadas.
5. **El auditor de paridad SEO, la red de seguridad del proyecto, da falsos OK.** Le cambié cifras técnicas (1500 → 1800 mm, 90 → 999 °C) y siguió marcando «100 % OK». En `/oviedo/` y en contacto no compara ni una palabra del texto antiguo.

En cambio, la base técnica es sólida:
- las URLs, los PDF (byte a byte) y `/legacy` se conservan;
- canonical, sitemap, robots y JSON-LD son correctos;
- el contraste cumple AA y las plantillas escapan por defecto;
- las intros solo traen cifras que están en /legacy;
- no hay secretos nuevos en el historial.

**Publicable en cuanto se cumplan estas condiciones:** C-01 a C-04 y A-01 a A-03 resueltos, y el `.htaccess` probado en Docker y en el hosting real.

---

## 2. Hallazgos

Ordenados por severidad. CRÍTICO = bloquea la publicación o puede hacer perder posicionamiento o datos. Esfuerzo: estimación para una persona.

### CRÍTICO

| ID | Estado | Área | Descripción | Evidencia | Impacto | Corrección propuesta | Esfuerzo |
|---|---|---|---|---|---|---|---|
| C-01 | **Pendiente Persona B** (revisar los 51 borradores; el auditor ya vigila cifras y modelos exactos) | Publicación | **51 textos en borrador** sin revisar: 39 categorías, 4 intros de familia y 8 textos de `/content`. Las 52 filas de `plan-paginas.csv` siguen en `estado = pendiente`. | `node build.js --modo=publicacion` → exit 1, 52 errores (51 de borrador y 1 de `envioActivo`). Columna `estado` de `docs/plan-paginas.csv`. | Bloquea el build de publicación, como está previsto. | Revisión de la Persona B con la definición de terminado (AGENTS §9). Antes, arreglar A-01, para que la revisión no pueda alterar especificaciones sin que nadie lo detecte. | 2-3 días (B) |
| C-02 | **Corregido** (`enviar.php` hecho y probado en local). Activarlo: **pendiente cliente** (email de destino, acceso al hosting) | Seguridad / Cumplimiento | **El formulario no tiene ningún script de servidor que cumpla AGENTS §2.** `src/contacto/enviar.php` no existe, aunque AGENTS §7 lo lista. La acción apunta a `rd-mailform.php`, un script de plantilla de TemplateMonster: espera AJAX y responde con códigos `MF000`/`MF255`, usa PHPMailer y no sabe nada de `web` (honeypot), `rgpd` ni `finfo`. AGENTS §2 dice que «puede usar ese script tal cual», lo que contradice sus propios requisitos (validación en el servidor, honeypot, RGPD, `finfo`, página de respuesta sin JS). | `data/site.json:66-67` (`accion: /contacto/bat/rd-mailform.php`, `envioActivo: false`). `AGENTS.md:118` frente a `AGENTS.md:119-125`. Códigos AJAX en `legacy/com/brototermic.com/contacto/js/script.js:345-352` (`MF254 … PHPMailer`). `ls src/contacto` → no existe. | Hoy `/contacto/contacto.html`, una URL indexada, saldría con el botón desactivado: se pierden peticiones de presupuesto. Si se activa con `rd-mailform.php`, sin JS el usuario ve un texto «MF000», llega spam sin filtro y no se valida el RGPD en el servidor. | Escribir `src/contacto/enviar.php` según §2, con validación, `finfo`, honeypot, RGPD, cabeceras saneadas y página HTML de éxito o error. Probarlo con `curl -F` según la checklist §1 «Formulario» y cambiar solo `formulario.accion`. Dejar de presentar `rd-mailform.php` como opción válida. | 1 día + acceso al hosting |
| C-03 | **Corregido** en el código (`/dist-es`, `.htaccess` sin riesgos de 500, Docker con dos vhosts). Falta: prueba en Docker (**pendiente nosotros**) y escenario del `.es` (**pendiente cliente**) | SEO / Publicación | **Las redirecciones no se han probado nunca, y las del `.es` probablemente no se aplicarían.** El `.htaccess` no se ha ejecutado en ningún Apache: Docker no está instalado. Hoy el `.es` sirve su propia web (title «BROTOTERMIC, SL Oviedo…»), así que tiene un docroot distinto del `.com`, y las reglas 1c y 2 (líneas 61-85) solo funcionan si los dos hosts comparten docroot. No existe ningún `.htaccess` para el docroot del `.es`, y `publicacion.md` §2.4 se queda en una línea vaga. Además, `Options` y `<If>` sin protección dan un **500 en toda la web** si el hosting no permite ese override. | `src/.htaccess:15, 22-24, 61-85`. `docs/publicacion.md:66`. `curl -s https://www.brototermic.es/` → title propio del `.es`. `which docker` → no existe (AGENTS §12.17). El Docker de pruebas monta los 4 hosts sobre un único docroot (`tools/apache-pruebas/httpd-pruebas.conf:14-26`), así que no reproduce el caso real. | Si el `.es` no redirige, se pierde todo el posicionamiento y los enlaces del `.es`, o queda contenido duplicado. Un 500 tumba la web entera. | 1) Preguntar en el hosting (IONOS) cómo están montados los dos dominios. 2) Generar desde `redirecciones.csv` un `.htaccess` propio para el docroot del `.es` (o apuntar el `.es` al docroot del `.com` con su certificado). 3) Pasar `probar-redirecciones.sh` en Docker con dos docroots. 4) Probar el `.htaccess` real en el hosting antes del día D. | 0,5-1 día + accesos |
| C-04 | **Pendiente Persona B** (enviar las preguntas, B-1-01) y **pendiente cliente** (accesos a Search Console) | SEO / Publicación | **Sin Search Console, sin línea base y sin respuesta del cliente.** Las preguntas al cliente no constan como enviadas, aunque era la primera tarea del Día 1 (B-1-01). `publicacion.md` §0.3 exige la exportación de GSC como línea base, y hay 6 keywords marcadas [POR VERIFICAR GSC]. | `docs/preguntas-cliente.md:5`: «Fecha de envío: ____». `docs/publicacion.md:15`. `docs/auditoria-seo.md`: 6 avisos de keyword. | Sin línea base no se puede detectar ni cuantificar una caída tras la migración. Sin acceso al DNS tampoco se puede resolver C-03. | Enviar hoy el mensaje de `preguntas-cliente.md` y anotar la fecha. Pedir primero los accesos a GSC y al hosting. Exportar 16 meses, no 3 (ver B-12). | Envío: 1 h; respuesta: cliente |

### ALTO

| ID | Estado | Área | Descripción | Evidencia | Impacto | Corrección propuesta | Esfuerzo |
|---|---|---|---|---|---|---|---|
| A-01 | **Corregido** (datos exactos, cobertura por producto, `.htaccess` real, 10 mutaciones obligatorias) | SEO / Código | **El auditor de paridad da falsos OK.** Lo demuestran tres pruebas: **(a)** si se cambian cifras técnicas, la página sigue en «100 % OK»; **(b)** en `/oviedo/` y `/contacto/contacto.html` no encuentra `id="content"` en la página antigua, no compara nada (0 palabras, 0 imágenes) y aun así da 100 %; **(c)** las redirecciones se comprueban contra `redirecciones.csv`, nunca contra el `.htaccess`. Causas: una frase cuenta como presente con el 85 % de sus palabras, los números de 5 cifras o más se aceptan con un dígito distinto (`coincide`, distancia ≤ 1) y un texto vacío da 100 %. | Copia de `/dist` alterada (1500 → 1800 mm, 3000 → 9000 mm, «0-90 °C» → «0-999 °C») + `AUDITORIA_DIST=… node tools/auditoria-seo.js --modo=publicacion` → «69 OK · 8 AVISO · 0 ERROR», con las dos páginas en «100.0 %». Código: `tools/auditoria-seo.js:20, 125, 138-142, 291-305`, `tools/lib/legacy.js:48-53, 109-110`. `docs/auditoria-seo.md`: filas de `/oviedo/` y contacto, «0/0 … 100.0 %». | Durante la revisión de los 51 borradores, una especificación cambiada, inventada o borrada pasaría el control de publicación sin que nadie lo vea. Es justo el riesgo que el auditor debía cubrir (AGENTS §4). | Añadir al auditor una comprobación **exacta** de los tokens con cifras y unidades (multiconjunto, sin tolerancia) por producto. Dar ERROR si el área antigua está vacía o tiene menos de N palabras. Comparar con el `.htaccess` real, o con su prueba en Docker, y no con el CSV. Probarlo con páginas estropeadas a propósito, como ya se hizo con la frase perdida. | 1 día |
| A-02 | **Corregido** (45 imágenes publicadas, procedimiento reescrito, lista blanca de lo publicable) | Publicación | **El procedimiento se contradice y puede romper el formulario e imágenes indexadas.** `publicacion.md` §1.5 y la checklist §2.2 dicen que se mueva la web antigua **fuera del docroot**. Pero `publicacion.md` §2.2 cuenta con que `contacto/bat/rd-mailform.php` siga en su sitio, y `/dist` no incluye 24 imágenes de `/images/` (entre ellas `slide-2/3/4.jpg`, del inicio antiguo) ni las 21 de `/oviedo/images/`. | `docs/publicacion.md:44` frente a `:64`. `docs/checklist-publicacion.md:71`. Mi script de paridad: «/images: 24 no están en /dist», «/oviedo/images: 21». `plan-imagenes.csv:286-287` (slide-2 y slide-3 «CONVERTIR, alta», sin hacer). | Formulario roto el día D. Las URLs de imágenes indexadas en Google Imágenes pasan a 404. | Decidir una sola estrategia: subir encima sin borrar, o mover y copiar explícitamente lo que se conserva. Hacer un diff entre el listado de la copia de seguridad y `/dist`, y decidir archivo por archivo: conservar, 301 o 404. Copiar o convertir `slide-2/3/4` como dice el plan. | 2-3 h |
| A-03 | **Pendiente cliente** (acceso FTP para ver PHPMailer). Mitigado: el formulario nuevo ya no lo usa y su retirada está en publicacion.md §2.5 | Seguridad (**SOSPECHA**) | **`rd-mailform.php` está activo hoy en producción con una versión de PHPMailer desconocida.** Las plantillas RD Mailform de esa época incluían PHPMailer 5.2.x; las versiones anteriores a la 5.2.20 tienen fallos de ejecución remota de código (CVE-2016-10033 y CVE-2016-10045). No he podido ver el código: no está en `/legacy` y las rutas típicas de PHPMailer dan 404. | `curl -I https://brototermic.com/contacto/bat/rd-mailform.php` → 200. `script.js:350` del legacy («Something went wrong with PHPMailer»). | Si se confirma, **es explotable hoy en la web actual**, haya migración o no, y seguiría siéndolo después si el script se deja en el servidor. | En cuanto haya acceso FTP: comprobar la versión de PHPMailer y cómo `rd-mailform.php` usa `From`/`Sender`. Si es vulnerable o no se va a usar, retirarlo, o actualizarlo como mínimo. No dejarlo en el servidor después de publicar «porque no se borra nada». | 1-2 h tras el acceso |

### MEDIO

| ID | Estado | Área | Descripción | Evidencia | Impacto | Corrección propuesta | Esfuerzo |
|---|---|---|---|---|---|---|---|
| M-01 | **Corregido** (texto recuperado; 0 frases perdidas) | SEO / Contenido | **`/oviedo/` pierde texto indexado** de la página antigua, y nada lo detecta (A-01 b): el bloque «Calidad» («En un mercado cada vez más globalizado… la calidad es un factor estratégico imprescindible», «Captar ideas de mejora o de innovación») y parte de «Mercado y aplicación». `/oviedo/` es la URL que recibe las 301 de la portada y del contacto del `.es`. | Comparación línea a línea de `legacy/com/brototermic.com/oviedo/index.html` con `dist/oviedo/index.html` (líneas con menos del 75 % de sus palabras presentes). | Puede caer el posicionamiento de las búsquedas de Asturias que hoy capta el `.es`. | Decidir de forma explícita (y registrarlo en decisiones.md) si ese texto se conserva. Si se conserva, añadirlo a `content/oviedo.html`. | 1 h |
| M-02 | **Corregido** (8 alts copiados o repetidos; aviso automático en build.js). Los 196 alts = nombre: **pendiente Persona B** | Contenido / Accesibilidad | **Alts incorrectos y genéricos.** PNWB (un relé de nivel) lleva el alt «IMN TP INOX», que es un interruptor magnético. El módulo Sielco D1 lleva «Infrarrojo compacto IC1013NG». En 196 de las 266 fotos de producto el alt es solo el nombre del producto. | `data/categorias/controldenivel-reles-de-nivel.json:58,63`; `data/categorias/controltemperatura-indicadores-de-procesos.json:130,135`; recuento con script sobre `data/categorias/*.json`. | Incumple AGENTS §5 («alt descriptivo real»): información falsa para lectores de pantalla y para Google Imágenes. | Persona B: corregir los 2 alts erróneos ya, y revisar el resto con la imagen delante (tarea B-3-04). Que build.js avise si un mismo alt se repite en productos distintos. | 0,5-1 día (B) |
| M-03 | **Corregido** el Privacy Shield y «Azzure». Las 3 formas de la dirección: **pendiente Persona B**; revisión legal: **pendiente cliente** | Contenido / Legal | **La privacidad publica una afirmación jurídica falsa e incoherencias.** Presenta el Privacy Shield como «instrumento jurídicamente vinculante y exigible», cuando se anuló en 2020. La marca [REVISIÓN CLIENTE] está en un comentario: se publica igual. La dirección aparece de 3 formas en la misma página («calle Pintor Ortiz de Urbina, n.7. – VITORIA ALAVA», «… n. 7 bajo, 01008…», «C/ … 7 bajo»), y hay una errata, «Azzure». | `content/privacidad.html:11, 55, 97-98`; `dist/privacidad.html`. | Riesgo legal y de confianza. El NAP de la página legal no coincide con el del pie ni con el schema. | No publicar el párrafo de transferencias internacionales sin la revisión del asesor: mientras tanto, retirarlo o reescribirlo con el Marco de Privacidad de Datos UE-EE. UU. de 2023 [REVISIÓN CLIENTE]. Unificar la dirección. | 1 h + asesor |
| M-04 | **Pendiente nosotros** (no entraba en esta tanda) | Seguridad | **Faltan cabeceras de seguridad** (se notará tras publicar; el riesgo es teórico). Faltan `Strict-Transport-Security`, `Content-Security-Policy` (o `frame-ancestors`) y `Permissions-Policy`. Sí están `nosniff`, `Referrer-Policy` y `X-Frame-Options`. | `src/.htaccess:142-145`. | Sin HSTS, la primera visita por http se puede interceptar. Sin CSP, falta una defensa en profundidad contra inyecciones. | Añadir HSTS (empezar con `max-age=300` y subir cuando el HTTPS esté comprobado) y `Permissions-Policy`. CSP: `default-src 'self'; img-src 'self' data:; object-src 'none'; base-uri 'self'; frame-ancestors 'self'; form-action 'self'`, más el hash del script en línea de `head.html:22` (o pasarlo a un archivo). Probarlo en Docker. | 2 h |
| M-05 | **Pendiente cliente** (restringir o rotar la clave) y decisión del responsable sobre la visibilidad del repo | Seguridad | **El repositorio de GitHub es público** (responde 200 sin sesión) y contiene la clave de Google Maps en 3 archivos de `/legacy`, toda la planificación interna y el email personal del autor en 23 commits. La clave sigue cargándose hoy en la web actual (`.com` y `.es`). No he comprobado sus restricciones (ver §4). | `curl https://api.github.com/repos/jegomez23/renovacion-brototermic` → 200. Escaneo de todo el historial: `AIzaSyDnGL…` en `legacy/com/brototermic.com/contacto/contacto.html:37`, `…/oviedo/contacto/contacto.html:32` y `legacy/es/…/contacto/contacto.html:32`. | **Explotable hoy** si la clave no tiene restricción por referer: cualquiera puede usarla con cargo a la cuenta del cliente. Los repos públicos se rastrean de forma automática en busca de claves. | Confirmar que la visibilidad pública es intencionada; si no, pasarlo a privado. Pedir al cliente que restrinja la clave por referer y API, o que la rote (pregunta 25). | 15 min + cliente |
| M-06 | **Pendiente nosotros y Persona B** (PR, revisión y fusión; Prueba de resultados enriquecidos) | Cumplimiento | **El flujo de trabajo de AGENTS §8 no se cumple.** `main` no contiene `build.js`, así que «main siempre funciona» no es cierto. Hay 13 commits sin PR ni revisión de la Persona B. El HITO-1 se da por aprobado (D-002 a D-006) sin la «aprobación escrita en el PR» que exige tareas.md. La Prueba de resultados enriquecidos (A-1-08, A-2-05) no se ha pasado. | `git log main` (5 commits, solo documentación). `docs/tareas.md:35`. `docs/decisiones.md:21`. | Nadie ha revisado de forma independiente el código ni el contenido que se publicaría. | Abrir la PR, que la revise la Persona B y fusionar. Pasar la Prueba de resultados enriquecidos con una página de cada plantilla. | 0,5 día |
| M-07 | **Pendiente nosotros** (añadir el boceto o declarar diseno.md como referencia) | Cumplimiento | **No existen las fuentes de verdad que se citan.** `docs/boceto/` (el diseño aprobado, «opción 3») no existe en ninguna rama, local ni remota. `docs/revision-codex.md` tampoco (D-007 lo reconoce). | `git ls-tree -r` de las 7 ramas: ninguna coincidencia con «boceto». `grep -ri boceto` en el repo: nada. `docs/decisiones.md:50`. | No se puede comprobar que `/dist` se corresponda con el diseño aprobado. | Añadir el boceto al repo (o un enlace estable) o registrar que `docs/diseno.md` lo sustituye. | 30 min |
| M-08 | **Parcial**: listado y limpieza en publicacion.md §1.5 y §2.5. Bloquear archivos ocultos y copias en el `.htaccess`: **pendiente nosotros** | Seguridad / SEO | **No hay inventario de lo que queda en el servidor.** Como la subida «no borra nada», seguirán publicados archivos antiguos: jQuery 3.2.0 y 1.7.1, `contacto/bat/`, CSS y JS antiguos, y cualquier página que wget no encontrara. Nadie ha revisado la lista. | `docs/publicacion.md:64`. `legacy/com/…/js/` y `…/contacto/js/jquery.js`. | Superficie de ataque heredada y posibles páginas antiguas que siguen dando 200 con contenido duplicado. | Al hacer la copia, guardar el listado completo y compararlo con `/dist`. Retirar lo que no se use (después de la copia) y añadir a `.htaccess` un bloqueo de `\.(bak|old|sql|zip|log|md|csv)$` y de los archivos ocultos. | 2 h |
| M-09 | **Pendiente cliente** (texto de primera capa con su asesor) | Privacidad / RGPD | **Junto al formulario falta la primera capa de información.** Solo hay una frase y un enlace: no figuran el responsable, la finalidad, la legitimación ni los derechos. | `src/partials/formulario.html:52`. | Incumplimiento formal del deber de informar (art. 13 RGPD), ya marcado como [REVISIÓN CLIENTE]. | Poner una tabla breve de primera capa bajo la casilla RGPD y validarla con el asesor del cliente. | 30 min + asesor |

### BAJO

| ID | Estado | Área | Descripción | Evidencia | Impacto | Corrección propuesta | Esfuerzo |
|---|---|---|---|---|---|---|---|
| B-01 | **Pendiente Persona B** (`slide-1.webp`; convertir `slide-2/3/4`). Sus URL ya responden (D-011) | Cumplimiento / Rendimiento | Falta `slide-1.webp` (D-004 y AGENTS §5) y no se han convertido `slide-2/3/4` (plan-imagenes «CONVERTIR, alta»). | `ls images/slide-1.*` → solo el `.jpg`. | Unos 59 KiB más en el LCP del inicio; imágenes del plan sin hacer. | Generar el WebP con las mismas medidas. | 15 min |
| B-02 | **Pendiente Persona B** (fila 7 de plan-contenido §4) y **cliente** (certificaciones) | Contenido | Siguen las menciones genéricas a la Directiva ATEX 94/9/CE, que AGENTS §4 manda actualizar. D-008 las deja pendientes de la Persona B. | `dist/resistencias-atex.html` («Directiva Atex 94/9/CE») y `dist/resistencias-mantas-calefactoras.html`. | Información normativa desfasada. | Persona B: actualizar solo las menciones genéricas. | 15 min |
| B-03 | **Pendiente Persona B** | Contenido | Hay cambios no listados en textos antiguos del piloto («acero inox» → «acero inoxidable», «Se fabrica» → «Se fabrican»), y una errata no listada sin corregir, «granulometria». El auditor no detecta ninguno (A-01). | `data/categorias/resistencias-inmersion.json:49, 76`; `data/categorias/controldenivel-niveles-rotativos.json:22`. | Mínimo, pero incumple «solo erratas listadas». | Añadirlos a plan-contenido §3 o deshacerlos. | 15 min |
| B-04 | **Pendiente nosotros** | Código / Seguridad | Una etiqueta no permitida (`<script>`, `<iframe>`, `on*=`) en `/data` o `/content` solo genera un aviso, también en modo publicación. Campos que se insertan sin escapar (`{{{ }}}`): `pagina.intro`, `pagina.cuerpo`, `texto` (producto), `pagina.texto.*`, `pagina.contenido`, `pagina.mapa` (generado y escapado) y `pagina.schema` (JSON con `<` escapado). Los `alt` de `/content` también van tal cual (`build.js:677`). Todo sale del repositorio (origen de confianza). | `build.js:483-489, 677`; `src/templates/*.html`. | Un error al editar a mano no detendría la publicación. | En modo publicación, dar ERROR si aparece `script`, `iframe`, `style`, un atributo `on*` o un `href` con `javascript:`. | 30 min |
| B-05 | **Pendiente nosotros** | Código | `/dist` se escribe completo aunque el build termine con errores. | `build.js:1009-1013` (escribe) frente a `:1054-1056` (exit 1). | Se podría subir un `/dist` no válido sin darse cuenta. | Si hay errores, generar en una carpeta temporal y renombrar al final solo si todo va bien, o borrar `/dist`. | 30 min |
| B-06 | **Pendiente nosotros** | Accesibilidad | La clase `js` se añade antes de que cargue `menu.js`. Si ese archivo falla (404, red), el megamenú queda oculto y el botón no hace nada. | `src/partials/head.html:22`; `assets/css/style.css:264, 307`. | Navegación rota en un caso límite (sin efecto en el SEO: los enlaces siguen en el HTML). | Que la clase la ponga el propio `menu.js`, o añadir un respaldo `<noscript>`. | 15 min |
| B-07 | **Pendiente nosotros** | Mantenibilidad | Para dar de alta una categoría hay que tocar 4 archivos (`familias.json`, `categorias/*.json`, `plan-paginas.csv` e `inventario-urls.csv`) y no hay ninguna guía. `validar-plan.js` tiene fijo el número 52. Prueba hecha en una copia: el build falla con mensajes claros (bien), pero `validar-plan.js` da error con 53 páginas. | `tools/validar-plan.js:46`; prueba en una copia temporal. | Fricción y errores al ampliar el catálogo. | Una sección «Añadir una categoría o un producto» en datos.md y que el total de páginas se calcule en lugar de fijarlo. | 1 h |
| B-08 | **Parcial**: conoce las páginas noindex. Ejecutarlo contra Docker o producción: **pendiente nosotros** | Herramientas | `comprobar-dist.js` comprueba el «200» del sitemap contra el servidor Node local, no contra Apache. La comprobación de huérfanas siempre sale bien porque el menú enlaza todas las páginas. | `tools/comprobar-dist.js:19, 47, 106-115`. | La afirmación «60 × 200» no dice nada de producción. | Ejecutarlo también contra Docker y contra producción (variable `BASE`), y contar los enlaces de huérfanas solo desde `<main>`. | 30 min |
| B-09 | **Pendiente nosotros** | Herramientas | `tools/servir.js` escucha en todas las interfaces, y su control de ruta por prefijo deja leer carpetas hermanas (`dist-*`). | `tools/servir.js:25, 34`. | Expone `/dist` a la red local. Solo afecta al desarrollo. | `listen(PUERTO, '127.0.0.1')` y comparar con `DIST + path.sep`. | 5 min |
| B-10 | Aceptado (el canonical lo resuelve) | SEO | Hay 266 enlaces del tipo `?producto=…` que crean variantes rastreables de la URL de contacto. | `build.js:396`. | Algo de presupuesto de rastreo; el canonical lo resuelve. | Aceptable. Opcional: `rel="nofollow"` en esos botones. | 5 min |
| B-11 | **Corregido** (paso sustituido en la checklist §2) | Publicación | La prueba en «carpeta temporal» de la checklist §2.1 no funciona con rutas absolutas (`/assets/…`) ni con un `.htaccess` basado en el host. | `docs/checklist-publicacion.md:70`. | Paso que no aporta nada. | Sustituirlo por una prueba en un subdominio, o con el archivo `hosts` apuntando al servidor. | 15 min |
| B-12 | **Corregido** (16 meses) | SEO | La línea base de GSC es de solo 3 meses. | `docs/publicacion.md:15`; `docs/checklist-publicacion.md:26`. | No se ve la estacionalidad. | Exportar los 16 meses que da GSC. | — |
| B-13 | **Corregido** (SPF, DKIM y DMARC en la checklist; se comprueba el día D) | Publicación (**SOSPECHA**) | No se contempla la entregabilidad del correo del formulario: SPF, DKIM y DMARC del dominio, ni el remitente. | No aparece en publicacion.md ni en la checklist. | Las peticiones pueden acabar en la carpeta de spam. | Añadir la comprobación a la checklist §1 «Formulario». | 15 min |
| B-14 | **Retirado**: no era cierto. `build.js` no escribe el informe; solo `node tools/auditoria-seo.js` | Código | Cada `node build.js` reescribe `docs/auditoria-seo.md`, que está versionado. | `tools/auditoria-seo.js:383` (ejecutado desde build). | Diferencias espurias en git. | Escribir el informe solo con un flag, o fuera de `docs/`. | 10 min |
| B-15 | **Pendiente nosotros** | Documentación | Hay contradicciones menores. D-002 dice que el pie usa `logo.png`, pero D-008 y `pie.html:4` usan `logo-claro.png`. D-010 cita una «regla de 480 px» que D-005 ya sustituyó. | `docs/decisiones.md:23, 71, 92`; `src/partials/pie.html:4`. | Confusión para quien llegue nuevo. | Marcar como sustituido lo que corresponda. | 10 min |

### Riesgos de la migración (lo que podría hacer caer el tráfico, de más a menos probable)

1. **Las 301 del `.es` no se aplican** porque el docroot es distinto (C-03): se pierde el posicionamiento y la autoridad del `.es`.
2. **El `.htaccess` falla en el hosting real**, con un 500 por `Options` o `<If>` no permitidos o con un bucle por un proxy HTTPS (C-03).
3. **Cambios de contenido sin detectar** durante la revisión de los 51 borradores (A-01): se pierden consultas de cola larga por modelo o especificación.
4. **Se reescriben a la vez los title, meta y H1 de las 52 páginas** y se añaden 4 familias que cambian el enlazado interno. Hay volatilidad esperable y, sin línea base (C-04), no se puede medir.
5. **`/oviedo/` cambia de contenido** mientras absorbe las URLs del `.es` (M-01).
6. **Imágenes antiguas en 404** si se mueve la web antigua (A-02).
7. **Cambio de host canónico** (www → sin www) sin datos de GSC sobre la versión que Google tiene elegida hoy.
8. Para el negocio, no para el SEO: **formulario sin funcionar** (C-02).

---

## 3. Cumplimiento: reglas y decisiones frente al código

| Regla (AGENTS.md o decisiones.md) | Cumple | Evidencia |
|---|---|---|
| §2 Solo HTML, CSS y JS vanilla, sin terceros | Sí | Ningún `<script>` ni `<iframe>` externo en `/dist`. Los únicos dominios externos son enlaces `<a>` a google.com/maps y aepd.es. |
| §2 Formulario PHP con validación en el servidor, honeypot, RGPD y `finfo` | **No** | C-02 |
| §2 `build.js` sin dependencias y con dos modos | Sí | `build.js:14-26`; exit 0 en piloto, exit 1 en publicación |
| §2 Menú y enlaces en el HTML, la web funciona sin JS | Sí | `src/partials/cabecera.html:20-56`; `style.css:251-252` |
| §2 `.htaccess` probado en Docker antes de publicar | **No** | Docker no instalado; C-03 |
| §3.1 Mismas URLs `.html` y ninguna página sin cubrir | Sí | Las 56 páginas y los 12 PDF de /legacy están en el inventario; las 51 URLs del sitemap antiguo también |
| §3.1 PDF con su nombre exacto, sin copias | Sí | `md5sum` de `dist/docs` igual a `legacy/…/docs` (8/8) |
| §3.1 17 reglas 301 y la regla 404 del `.es`, específicas primero, `THE_REQUEST` | Parcial | Leído en estático, `src/.htaccess:33-96` es correcto (orden, NE, sin redirección abierta); no se ha ejecutado, y lo del `.es` depende del docroot (C-03) |
| §3.1 Auditor de paridad como red de seguridad | Parcial | A-01 |
| §3.2 Title ≤ 60 con keyword y «Vitoria» | Sí | `build.js:943`; auditor; sin title duplicado (script on-page) |
| §3.2 Meta de 140-155 caracteres y única | Sí | `build.js:944-945, 999-1005` |
| §3.2 Un solo H1 y nombres de producto en H2 | Sí | `build.js:941-942`; `producto.html:7`; sin saltos de nivel de encabezado (script on-page) |
| §3.2 Metas obsoletas eliminadas y sin hreflang | Sí | `src/partials/head.html:1-25`; 0 `hreflang` en `/dist` |
| §3.2 Canonical absoluto | Sí | `head.html:8`; 52/52 |
| §3.2 `sitemap.xml` (52 + 8) y `robots.txt` | Sí | `build.js:1022-1029` |
| §3.2 `tel:+34`, nunca `callto:` | Sí | `build.js:950`; 0 `callto` en `/dist` |
| §3.3 Organization, 2 LocalBusiness, BreadcrumbList (no en el inicio), ItemList, sin Product | Sí | `build.js:401-449, 692-735`; JSON-LD válido en las 53 páginas (`JSON.parse`) |
| §3.3 0 errores en la Prueba de resultados enriquecidos | No verificado | M-06 |
| §4 Descripciones conservadas, solo con las erratas listadas | Parcial | B-03; las 38 erratas listadas están aplicadas (0 siguen en `/dist`) |
| §4 Intros de 120-200 palabras sin datos inventados | Sí (en borrador) | `build.js:473-477`; todas las cifras de las intros y las metas están en /legacy (`6,2 mm` aparece como `6.2mm`) |
| §4 «35 años», CP 33011, © dinámico, «Nuevos Productos 2021» | Sí | 0 apariciones en `/dist`; `pie.html:44` |
| §4 ATEX: actualizar las menciones genéricas | No | B-02 |
| §4 Legales: quitar el código AEPD y las cookies de terceros | Sí | 0 «2131260399» en `/dist`; `content/cookies.html` |
| §5 Ruta `/images/`, mismos nombres | Parcial | 286 copiadas; 24 de `/images/` de legacy no se copian (A-02) |
| §5 `width` y `height`; `lazy` salvo el hero | Sí | 0 `<img>` sin medidas en `/dist`; `inicio.html:16` |
| §5 Hero con `slide-1.webp` | No | B-01 |
| §5 Alt descriptivo real | Parcial | M-02 |
| §5 Retoque de las 3 fotos | No | Pendiente de la Persona B (§12.15) |
| §6 Colores y contraste AA | Sí | Todas las combinaciones de texto ≥ 4,5:1 (la mínima, `#5e5e5e` sobre `#dae9f9`: 5,25:1); los bordes de los controles, 4,04:1 sobre `#f1f1f1` (≥ 3:1). `#36afe0` solo en bordes y subrayados. |
| §6 Lora local 400 y 700; una sola hoja CSS; JS con `defer` | Sí | `style.css:11-25`; `head.html:20-23` |
| §6 Patrón *Disclosure*, Esc y `prefers-reduced-motion` | Sí | `menu.js:153-162`; `cabecera.html:15, 24, 37`; `style.css:701-706` |
| §6 Campos compatibles con `rd-mailform.php` + `empresa`, `adjunto`, `rgpd` y honeypot | Sí | `src/partials/formulario.html:9-51` (con `label`, `autocomplete` y errores enlazados por `aria-describedby`) |
| §7 `/legacy` sin tocar | Sí | `git diff 17c523b HEAD -- legacy` vacío |
| §8 `main` funciona; PR revisada; merges frecuentes | No | M-06 |
| §8 / tareas: HITO-1 aprobado por escrito en la PR | Parcial | Aprobado según decisiones.md; no hay PR |
| §10 Ninguna credencial en el repositorio | Sí | Escaneo de todo el historial (7 ramas): solo las claves de navegador conocidas de `/legacy` (M-05) |
| §12 Preguntas enviadas al cliente (B-1-01) | No | C-04 |
| D-001 No reescribir el historial | Sí | `backup/historial-reescrito` solo existe en local |
| D-002 / D-003 Cabecera blanca y title del inicio | Sí | `site.json:10`; plan |
| D-004 Hero a 910 px en WebP + JPG | Parcial | Sin WebP |
| D-005 Originales a su tamaño; retoque de 3 fotos | Parcial | Retoque pendiente |
| D-007 Sin comodín en el `.es`; envío desactivado | Sí en el código / sin probar | C-03 |
| D-008 a D-010 | Sí | 404 con noindex y sin canonical, fuera del sitemap; `ErrorDocument` en `src/.htaccess:21`; tira de logos con `lazy` (`inicio.html:66`) |

**Tareas de tareas.md:** ninguna está marcada formalmente como hecha (el documento no tiene columna de estado). Sin embargo, AGENTS.md y decisiones.md tratan como cerradas tareas cuyo criterio de «terminado» no se cumple: B-1-01 (no consta envío), HITO-1 (sin PR), A-1-08 y A-2-05 (sin Prueba de resultados enriquecidos), A-2-03 (sin envío real probado) y B-2-05 (sin `slide-1.webp`).

**Comparación con el boceto de la opción 3:** no se puede hacer porque el boceto no existe (M-07).

---

## 4. Lo que está bien hecho

- **Conservación de URLs y archivos:** inventario completo frente a /legacy (0 páginas o PDF fuera de él), PDF idénticos byte a byte y `/legacy` sin modificar.
- **Lo que llega al HTML final:** canonical absoluto en las 52 páginas, sitemap solo con URLs canónicas, `robots.txt` correcto, 404 con `noindex` y sin canonical, title y meta únicos, un H1 por página, sin `hreflang` ni metas obsoletas, sin saltos de nivel de encabezado y sin páginas casi duplicadas (similitud por bloques de 5 palabras: ningún par supera el 25 % de Jaccard).
- **`build.js` falla cuando debe:** variables inexistentes, páginas fuera del plan, metas repetidas o número de productos distinto del plan. La prueba de dar de alta una categoría lo confirma.
- **Escapado por defecto** en las plantillas, `<` escapado dentro del JSON-LD. En el JS no hay XSS: `?producto=` se asigna con `.value` y el buscador usa `textContent`.
- **El `.htaccess` está bien pensado:** destinos finales sin cadenas, `THE_REQUEST` contra bucles, `NE` para conservar la codificación, sin redirección abierta (el host es fijo), 404 real en el `.es` y no un soft 404.
- **Accesibilidad:** patrón *Disclosure* del W3C, contraste AA comprobado, formulario con etiquetas, `autocomplete`, errores anunciados y zonas táctiles de 44 px.
- **Veracidad:** todas las cifras de las intros y las metas en borrador están en /legacy. Las 38 erratas listadas están aplicadas.
- **`/dist` limpio:** solo contiene lo publicable (HTML, recursos, PDF, sitemap, robots y `.htaccess`); nada de `/data`, `/docs/*.md`, `/tools` ni `.git`.
- **Rendimiento:** 7-9 KB de HTML comprimido por página, una hoja de 39 KB, 13 KB de JS y ninguna petición a terceros.

---

## 5. Lo que no he podido verificar, y por qué

| Qué | Por qué |
|---|---|
| El comportamiento real del `.htaccess`: la reescritura de la ñ en Latin-1 (`\xf1`), `<If>` con `ErrorDocument`, `R=404` y `DirectoryIndex` | En este equipo no hay Docker, Apache ni WSL. Solo hay revisión estática. |
| La configuración del hosting: docroot del `.es`, `AllowOverride`, versión de Apache y de PHP, proxy HTTPS | No hay acceso. El docroot distinto del `.es` se deduce de que sirve su propio contenido (las dos IPv4 son la misma IP compartida de IONOS, así que eso no prueba nada). |
| El código de `rd-mailform.php` y la versión de PHPMailer | No está en `/legacy` (wget no descarga PHP) y no hay acceso FTP. **Nota de transparencia:** una de mis peticiones `curl -I` a `rd-mailform.php` ejecutó el script una vez, sin datos (respondió 200). |
| Las restricciones de la clave de Google Maps | Comprobarlas exigía **usar** la clave contra la API de Google, y no lo he hecho a propósito. Debe mirarlo el cliente en la consola de Google Cloud. |
| La Prueba de resultados enriquecidos | Es un servicio en línea de Google; no lo he ejecutado. |
| Lighthouse, W3C y capturas a 320/360/768/1280 px | No los he vuelto a ejecutar. Las cifras de la sesión anterior (Lighthouse ≥ 93, W3C 53/53 sin errores) no están verificadas por mí. |
| La veracidad semántica completa de las intros | La comprobación fue léxica y numérica (cada palabra y cada cifra contrastada con /legacy). No he contrastado afirmación por afirmación ni el contenido de los catálogos PDF. |
| Datos de Search Console | No hay acceso. |
| El diseño aprobado (opción 3) | `docs/boceto/` no existe (M-07). |
