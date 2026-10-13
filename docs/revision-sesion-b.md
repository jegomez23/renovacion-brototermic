# Revisión de la sesión de la Persona B (PR #1-#9) y plan de complemento

> Fecha: 2026-10-12 · Rango revisado: `v0.9-preproduccion..main` (`bbdbe79`), 9 PR fusionadas los días 11 y 12 de octubre · Revisor principal: Persona A (con Claude) y seis auditorías independientes en solo lectura (SEO, imágenes, diseño, contenido, código y proceso).
>
> Criterio: la visión final (abajo). Solo se incluyen hallazgos con evidencia; los CRÍTICO y ALTO los ha comprobado de nuevo el revisor principal (columna «Verif.»). Este documento lo leen las dos personas: es técnico y no valora a nadie, valora el código y el proceso.
>
> **Estado: plan APROBADO por el responsable el 2026-10-12, con estos ajustes:**
> - Decisiones 1 a 9 aceptadas tal como se recomiendan.
> - La 10 (reparto) queda como **PROPUESTA** hasta que la confirme la Persona B.
> - **Limitador:** si falla su almacenamiento, el envío se **acepta** y se registra en el log (D-015, sustituye a R-05).
> - **Orden de ejecución** en la rama `revision/complemento-b`:
>   1. bloque 1, con CI;
>   2. herramienta de revisión de borradores;
>   3. barra fija, buscador y sectores;
>   4. imágenes del inicio;
>   5. `docs/seo-mejoras.md`;
>   6. alts, solo de las páginas de prioridad alta;
>   7. del bloque 3, solo el hero y el ritmo de secciones del inicio.
> - Lo demás del bloque 3 pasa a post-publicación.

**Visión final** (el criterio de todo el documento):
1. **SEO:** no perder nada del posicionamiento actual y mejorarlo.
2. **Diseño:** moderno, minimalista e industrial, con personalidad, de 320 a 1280+ px.
3. **Conversión B2B:** pedir presupuesto, llamar y enviar un plano sin esfuerzo.
4. **Veracidad:** nada inventado.
5. **Calidad técnica:** vanilla, AA, Lighthouse móvil ≥ 90 y seguridad.
6. **Dominios:** el `.es` redirige con 301 y `/oviedo/` es una landing propia.

---

## 1. Resumen ejecutivo

**Qué aporta la sesión.** Lo más valioso es lo técnico:
- **PR #7:** quita un **error 500 en toda la web** que se habría producido el día de publicar en un hosting con `AllowOverride FileInfo`. Además, es la primera vez que el `.htaccess` se ejecuta en un Apache de verdad.
- **PR #6:** si falla el almacenamiento del límite de envíos, el formulario ya no se queda sin antispam sin que nadie lo note.
- **PR #3 y #4:** arreglan fallos reales de accesibilidad del menú y de los botones.
- **PR #8 y #9:** el inicio en móvil es un 44 % más corto en el bloque de familias, y «Productos a medida» pasa a ser el bloque principal.
- **PR #2:** cierra B-02 (ATEX) sin debilitar el auditor.

**Qué no se ha hecho** (lo confirma el responsable). La ruta crítica de la Persona B no se ha movido:
- **0 de 51 borradores** aprobados (C-01).
- Preguntas al cliente sin enviar (C-04).
- 183 alts todavía genéricos (M-02).
- Sin `slide-1.webp` y sin retoque de las 3 fotos.
- No existe `docs/seo-mejoras.md`.
- Las 4 funciones del boceto pendientes (botón fijo, buscador en el inicio, sectores, familias en móvil) siguen igual.

**Riesgos que introduce:**
1. **Proceso:** 9 PR fusionadas sin revisión ni CI. La PR #2 pedía «No fusionar hasta completar la revisión».
2. **Documentación:** decisiones sin registrar y una contradicción en AGENTS.md §5 (imágenes de 910 px fuera de las excepciones aprobadas).
3. **Producto:**
   - El inicio pesa **+69 %** (252 → 426 KiB).
   - La tarjeta «Resistencias eléctricas» se sale de su marco 4:3, y la de «Control de nivel» no se distingue en móvil.
   - 5 alts pierden el modelo o la designación (PTC, NTC, RTD…).
   - El flag `[END]` da un 500 si el hosting usa Apache 2.2.
   - Si falla el almacenamiento del limitador, el formulario se bloquea para todos con un mensaje engañoso.

Ninguno es irreversible y todos tienen una corrección de menos de 1 h.

**Línea base, sin regresiones:**

| Comprobación | v0.9 | main |
|---|---|---|
| `npm run test` | OK | OK (70 OK · 8 AVISO · 0 ERROR; 10/10 mutaciones; sitemap 60 × 200) |
| `npm run validar` (W3C) | 55/55 sin errores | 55/55 sin errores |
| `npm run build:publicacion` | 52 errores (51 borradores + `envioActivo`) | **los mismos 52** |
| Lighthouse móvil, inicio (3 mediciones con el equipo libre, mediana) | 95 · LCP 2,4 s · 252 KiB | 95 · LCP 2,5 s · **426 KiB** |
| Accesibilidad (Lighthouse) | 100 | 100 |
| Paridad SEO independiente (árbol de `/dist`, 55 páginas, 6.703 enlaces, 640 casos de `.htaccess`) | — | **0 diferencias** en URLs, imágenes, PDF, title, meta, H1, canonical, JSON-LD, sitemap y redirecciones; 0 enlaces rotos |
| Fotos de producto alteradas | — | **0** (284 comparadas byte a byte con /legacy) |

### Puntuación frente a la visión (estado de `main` hoy, de 1 a 10)

| # | Punto de la visión | Nota | Por qué | Efecto de la sesión B |
|---|---|---|---|---|
| 1 | SEO: no perder nada y mejorar | **8** | Paridad total comprobada de cuatro formas (auditor, árbol de `/dist`, 55 páginas campo a campo y simulador del `.htaccess`). Falta lo que solo se ve en producción: la prueba en Docker y en el hosting, la línea base de Search Console y el `.es`. La mejora (intros, alts, tabla HTML) sigue en borrador. | **+** La PR #7 quita el mayor riesgo SEO del día de publicar (un 500 en toda la web). **−** 5 alts pierden la keyword del modelo. |
| 2 | Diseño con personalidad, de 320 a 1280+ | **5** | Limpio, accesible y sin desbordes en 28 combinaciones de página y ancho. Pero todo son cajas con borde en el mismo contenedor: sin bandas, sin iconos, sin antetítulos, con fotos de estilos dispares y el hero como un recuadro blanco. Parece una plantilla bien hecha. | **+** Jerarquía del bloque a medida y tarjetas compactas en móvil. **−** Tarjetas de familia desiguales (C-2, imágenes dispares). |
| 3 | Conversión B2B | **5** | El producto llega precargado al formulario (2 toques). Pero el envío está desactivado (pendiente del hosting), no hay barra fija de llamar o presupuesto, en móvil el «Pedir presupuesto» de categorías y familias queda fuera de la primera pantalla y el adjunto no se ve sin desplazarse. | **+** «Fabricación a medida» como botón primario. **−** El botón secundario «Ver productos» a ancho completo desplaza aún más la CTA en móvil. |
| 4 | Veracidad | **8** | 0 especificaciones inventadas en 43 intros; 0 fotos alteradas; ATEX bien resuelto. Quedan 3 frases sin respaldo o inexactas (ATEX, `/oviedo/` y «te ayuda a definir»). | **+** Cierra B-02 con fechas exactas y registrado. Neutro en lo demás. |
| 5 | Calidad técnica | **7** | W3C 55/55, AA, Lighthouse 95 en el inicio, cabeceras de seguridad, lista blanca de publicación y `/dist` idéntico a lo que genera el código. Pendiente: B-06 (menú si falla el JS), `[END]` y el limitador sin carpeta configurada. | **+** PR #6 y #7 de calidad, con sus pruebas. **−** CSS +12 % con selectores por id y una regla muerta; imágenes fijadas en `build.js`. |
| 6 | Unificación de dominios | **6** | `dist-es` con su `.htaccess` y sus 7 redirecciones 301 más el 404, comprobados con el simulador. Sin probar en Docker ni en el hosting, y sin saber a qué carpeta apunta el `.es`. `/oviedo/` tiene contenido propio, con una frase sin respaldo («el mismo catálogo»). | **+** La PR #7 prueba el `.es` en Apache 2.4.62 (`All` y `FileInfo`). |

---

## 2. Lo que está bien hecho (no tocar)

| PR | Qué hace | Impacto concreto |
|---|---|---|
| **#7** `review/jhonda-apache-fixes` | Quita `mod_expires` del `.htaccess` y deja la caché solo con `Cache-Control` (`mod_headers`). Hace que `/404.html` no vuelva a pasar por las reglas cuando la sirve `ErrorDocument`. Añade `tools/test-apache.js` y una línea a la checklist. | **El hallazgo más importante de la sesión.** `ExpiresActive` y `ExpiresByType` exigen `AllowOverride Indexes` aunque estén dentro de `<IfModule>`; lo confirma la documentación de Apache (auditor E). En un hosting compartido con `FileInfo`, habitual, **toda la web habría devuelto 500 el día de publicar**. Es la **primera ejecución real del `.htaccess`**: Apache 2.4.62 nativo, por HTTP y HTTPS, con los 4 hosts, `All` y `FileInfo`: **1.336 peticiones correctas y 0 incorrectas**. La regla del 404 resuelve un problema real: la canonicalización usa `THE_REQUEST`, que dentro de `ErrorDocument` sigue siendo la ruta original. `test-apache.js` es seguro: solo se conecta a 127.0.0.1, no sigue redirecciones y usa una lista blanca de hosts. |
| **#6** `review/jhonda-antispam` | El limitador por IP de `enviar.php` pasa de «si falla, deja pasar» (*fail-open*) a «si falla, rechaza» (*fail-closed*), controlando los errores de creación, apertura, bloqueo, lectura y escritura. Además, escribe antes de truncar. Añade `tools/test-limitador.php`. | Antes, un disco lleno o una carpeta temporal sin permisos **desactivaban el antispam sin avisar**. Ahora queda registrado en `error_log`. Probado con **12 solicitudes concurrentes: se aceptan exactamente 5** (el límite), con fallos simulados y reales. Compatible con PHP 7.4 y sin regresiones de seguridad (auditor E). Su efecto secundario está en el hallazgo R-05. |
| **#3** `review/jhonda-menu-accesible` | Sin JS, «Productos» es un enlace a `/mapa-web.html` y no un botón. El panel no se cierra con `mouseleave` si el foco está dentro. | Sin JS, el botón anunciaba un `aria-expanded` que nadie controlaba, que es **información ARIA falsa**. Ahora lleva a la lista completa de productos. Quien usa el teclado ya no pierde el panel porque el ratón se haya movido. |
| **#4** `review/jhonda-microinteracciones` | `:not(:disabled)` en los hover, `:active` con `currentColor` y `display: list-item` en el `summary` del índice. | El botón «Enviar», hoy desactivado por `envioActivo: false`, ya no simula hover. Se recupera el marcador nativo del índice «Ver los N productos». |
| **#8** `review/jhonda-familias-movil` | Tarjetas de familia compactas en el móvil del inicio (miniatura de 88 px y título en la misma fila). | A 320 px, el bloque de familias pasa de 3.146 a **1.759 px (−44 %)** y la página de 10.645 a 8.878 px. No toca el componente de las páginas interiores ni `/oviedo/`. |
| **#9** `review/jhonda-portada-destacados` | «Productos a medida» pasa a ser el bloque principal, con botón primario, y los otros dos quedan como apoyo. | Pone la fabricación a medida, el servicio diferencial del cliente, por delante del resto (comparación en `auditor-C/sec/*-inicio-1280-destacados.png`). |
| **#2** `review/jhonda-contenido-atex` | Mención genérica de ATEX actualizada (94/9/CE → 2014/34/UE), errata «pude» y 21 alts. | Cierra **B-02** de la auditoría final con las fechas exactas (1-7-2003 y 20-4-2016). **No toca ninguna certificación de producto** (§4.8-4.10) y queda registrada en `SUSTITUCIONES`, así que el auditor la acepta sin perder precisión (siguen detectándose 10/10 mutaciones). De los 21 alts, **18 ganan precisión**, ninguno es falso y 8 de 8 conservan el modelo alfanumérico (CNM, RFA, HIDH, FAW, FUH). |
| **#1** `review/jhonda-visual-seo` | Zonas táctiles de 44 px en los teléfonos y emails del pie, sin logo repetido en el pie móvil, y la foto de «Productos a medida» cambiada por una de producto existente sin atribuir fabricación propia. Todo documentado en `plan-imagenes.csv`. | Cumple AA en las zonas táctiles del pie. La foto anterior insinuaba una fabricación propia que no se puede probar. Las imágenes que salen del inicio siguen publicadas en su URL y tienen su fila `ELIMINAR` justificada. |
| **#5** `review/jhonda-acceso-catalogo` | Botón «Ver productos» o «Ver categorías» bajo el H1. | Atajo hacia el listado en las categorías largas. Su ubicación se revisa en R-14, pero la idea de un acceso directo se mantiene. |

**De toda la sesión:**
- `main` funciona en los 15 commits: el auditor F ejecutó `tools/test.js` en cada uno.
- Merges sin conflictos.
- Descripciones de PR detalladas en #1, #2, #3 y #6.
- `/dist` coincide byte a byte con lo que genera el código: ningún cambio a mano.

---

## 3. Contraste con el informe de la Persona B

> `docs/informe-persona-b.md` **no estaba en el repositorio** cuando se redactó esta revisión. Mientras tanto, el contraste se hace con las descripciones de las PR en GitHub, que recogen lo que la Persona B declaró de cada cambio. Cuando el informe esté en `docs/`, se completa este apartado.

| Lo que declaran las PR | Lo que encuentran las auditorías |
|---|---|
| #1: «Revisión responsive en 320, 390, 768 y 1280 px. Sin desbordamientos ni deformaciones» | Cierto en cuanto a desbordes: 0 en 28 combinaciones. Pero hay una deformación a 768 y 1280 px: la tarjeta «Resistencias» rompe el marco 4:3 y baja el título 8-10 px (R-07). |
| #1: «Conservadas 329 rutas históricas» | Cierto: 0 rutas perdidas (auditor A). |
| #2: «Mejorados 21 alts… conservadas las referencias técnicas» | Cierto en 16 de 21. **5 pierden el modelo, la designación o parte del nombre** (tabla de R-04). Parece una diferencia de criterio y no un descuido: los alts que empiezan por «Esquema de…» o que describen solo el aspecto desplazan el nombre. Se propone una regla explícita (D-014). |
| #2: «No fusionar hasta completar la revisión» | Se fusionó sin revisión registrada (R-01). |
| #3: «Navegación sin JavaScript comprobada» | Cierto. Queda abierto B-06 (si `menu.js` falla en lugar de faltar), que la PR no tocaba pero ahora también oculta el respaldo (R-08). |
| #6: «12 solicitudes concurrentes: exactamente 5 permitidas» | Coherente con el código revisado. No se ha podido repetir aquí porque no hay PHP. |
| #7 (en `estado.md`): «1.336 solicitudes correctas, 0 incorrectas» | Coherente con `test-apache.js` y con la configuración probada. No se ha podido repetir aquí porque no hay Apache ni Docker. **No sustituye a la prueba en Docker** que exige AGENTS §2, y así lo decía la propia línea. |

---

## 4. Hallazgos

Severidad: CRÍTICO = bloquea la publicación o hace perder posicionamiento o datos; ALTO = riesgo serio o incumplimiento de una regla del proyecto; MEDIO = defecto real con impacto limitado; BAJO = mejora o higiene. **Verif.:** ✔ = comprobado de nuevo por el revisor principal. Las letras entre paréntesis remiten al auditor de origen (A SEO, B imágenes, C diseño, D contenido, E código, F proceso).

**No hay hallazgos CRÍTICOS.**

| ID | Sev. | Área | Hallazgo | Evidencia | Propuesta | Esfuerzo | Verif. |
|---|---|---|---|---|---|---|---|
| R-01 | ALTO | Proceso | **Las 9 PR se fusionaron sin revisión y sin CI**. La #2 pedía literalmente no fusionar sin revisar. 6 PR se fusionaron en 3 minutos y 3 en 46 segundos. Además, 5 PR estaban sobre una base desactualizada (sin conflictos). (F-1, F-2) | API de GitHub: PR #1, #2, #5 y #9 → 0 reviews, 0 comments. `merged_at` entre 14:54:08 y 14:57:14 UTC. Sin `.github/` ni checks. | Workflow de GitHub Actions sin dependencias que ejecute `node tools/test.js` y compruebe que `docs/auditoria-seo.md` está al día. Plantilla de PR con checklist. Protección de `main`: 1 revisión, check obligatorio y rama al día (la activa el responsable en GitHub). | 1-2 h | ✔ |
| R-02 | ALTO | Documentación | **Decisiones sin registrar y AGENTS.md contradictorio.** La fila del 2026-10-11 de AGENTS §11 no tiene entrada en `decisiones.md` (termina en D-012). AGENTS §5 dice que, además del hero, solo la tira de logos se sirve a más de 480 px, pero el inicio sirve dos banners de 910 px. Tampoco están registradas la retirada de `mod_expires`, la regla del 404, el limitador *fail-closed*, «Productos» sin JS, los accesos rápidos ni la nueva jerarquía del inicio. (F-3) | `docs/decisiones.md` (último: D-012); `AGENTS.md:221` frente a `dist/index.html` (`portada-control-*.jpg`, 910 × 426). | **Hecho en esta revisión:** D-013 con lo decidido en cada PR. Corregir AGENTS §5 junto con R-06, que elimina la excepción. | 30 min | ✔ |
| R-03 | MEDIO | `.htaccess` | El flag `[END]` (`src/.htaccess:44-45`) solo existe desde Apache 2.3.9. En Apache 2.2 da un **500 en toda la web**, y el propio archivo quitó `<If>` por eso mismo. La lógica es correcta y no tiene bypass. (A-1, E-1) | `src/.htaccess:30` («solo Apache ≥ 2.4») frente a `:45`. La versión del hosting no se conoce. | `[END]` → `[L]`: con la sustitución `-` no hay segunda pasada en contexto de directorio, así que el efecto es el mismo. Repetir `test-apache.js`. | 15 min + prueba | |
| R-04 | MEDIO | SEO / contenido | **5 alts pierden el modelo o el nombre**. Además, la misma imagen del aerotermo MFH tiene dos alts distintos según la página, y `plan-imagenes.csv` (fuente de los alts, AGENTS §5) no se actualizó. (A-3, B-4, D-6) | Detalle en la tabla de R-04, más abajo. | Aplicar la regla **D-014**: el alt empieza por el nombre o modelo de /legacy y sigue con lo que se ve. Que `build.js` avise si el alt no contiene el código de modelo del nombre del producto. Sincronizar `plan-imagenes.csv`. | 1 h | ✔ |
| R-05 | MEDIO | Formulario | **Si falla el almacenamiento del limitador, el formulario se bloquea para todos.** El directorio por defecto es `sys_get_temp_dir()`: con `open_basedir`, un `/tmp` sin permisos o un `/tmp` compartido en el que otro cliente creó la carpeta, falla **cada** envío. Mensaje engañoso: «El formulario aún no está disponible». `dir_limites` está comentado en el ejemplo y no aparece en la checklist. (E-2) | `src/contacto/enviar.php:88-107, 143-147`; `content/error.html:23`; `config.example.php:38`. | Hacer `dir_limites` obligatorio y fuera del docroot. Un motivo propio (`servicio`) con «No hemos podido procesar el envío: llámanos al 945 22 33 31 o escríbenos a info@…». Añadir a la checklist: «la carpeta del limitador existe y se puede escribir». | 45 min | |
| R-06 | MEDIO | Rendimiento / imágenes | **El inicio pesa un 69 % más** (252 → 426 KiB) porque las tarjetas cargan copias de los banners de 910 × 426 (`slide-3` y `slide-4`) que se pintan a 88 × 41 px en móvil y a ~248 × 116 en escritorio. La nota de Lighthouse no cambia (95), pero el peso y el LCP (+0,1 s) sí. La tira de nivel muestra 11 sensores de ~7 px en móvil: no se distinguen. (C-1, B-1, B-2, A-4, E-10) | Suma de bytes de las imágenes de `index.html`: 219.377 → 355.977 B. Lighthouse con el equipo libre: v0.9 98/80/95, main 96/95/94. Captura `auditor-C/sec/main-inicio-320-familias.png`. | Miniaturas de un solo producto, **recortadas sin reescalar al alza ni retocar**, a unos 300 px, de las mismas fotos de /legacy, en JPG y WebP de ~10-15 KB. Como las URLs `portada-*` aún no se han publicado, se pueden sustituir sin coste SEO. | 1,5 h | ✔ |
| R-07 | MEDIO | Diseño | **Regresión:** la foto de 370 × 290 de «Resistencias eléctricas» desborda el marco 4:3 y baja el título 8-10 px respecto a la fila. `max-height: 100%` no limita nada en un contenedor con `aspect-ratio` y sin altura explícita. (C-2) | `assets/css/style.css:766`; capturas `auditor-C/sec/main-inicio-768-familias.png` y `-1280-familias.png` (comprobadas). | `overflow: hidden` en `.tarjeta__imagen` y limitar la imagen con `max-width` y `max-height` sobre una caja de altura explícita, sin ampliar nunca. | 30 min | ✔ |
| R-08 | MEDIO | JS / accesibilidad | **B-06 sigue abierto y ahora además oculta el respaldo.** La clase `js` se pone antes de cargar `menu.js`. Si el script falla (404 o red), «Productos» queda como un botón muerto y el enlace nuevo a `/mapa-web.html` está oculto. (E-3) | `src/partials/head.html:22`; `style.css:256-257`. | Que `menu.js` añada `menu-listo` al terminar y usar `.menu-listo` en lugar de `.js` en esas reglas (y en las del megamenú). | 20 min | |
| R-09 | MEDIO | Mantenibilidad | **Imágenes del inicio fijadas en `build.js`** (carpeta de A) en lugar de en los datos (carpeta de B), sin contrato en `datos.md`. Además, `/oviedo/` llama a `tarjetasFamilias()` sin ese mapa: las mismas familias salen con fotos distintas en `/` y en `/oviedo/`. (E-4, F-4, C-11) | `build.js:824-842, 891`; `datos.md:114`. | Campo `imgTarjeta` (+ `altTarjeta`) en `familias.json` y `site.json → inicio.miniaturas`, documentados en `datos.md`. Las mismas imágenes en `/` y `/oviedo/`. | 45 min | |
| R-10 | MEDIO | Contenido | **Frase inexacta en la intro de ATEX:** «la certificación de cada equipo figura en su descripción». Es falso en RFA, RFA-CS y MFH. (D-1) | `data/categorias/resistencias-atex.json → intro`. | «…cuando la certificación está disponible, figura en la descripción del equipo. Pregúntanos por la del modelo que te interese.» | 10 min | ✔ |
| R-11 | MEDIO | Contenido | **Frase sin respaldo en `/oviedo/`:** «con el mismo catálogo… que la sede central». No aparece en /legacy, y el cliente no ha confirmado que la delegación siga activa. (D-4) | `content/oviedo.html` (hero); `grep -ri "mismo catálogo" legacy` → 0. | Cambiarla por el texto de /legacy («Distribuciones Industriales. Instrumentación.») o esperar a la respuesta del cliente. | 10 min | ✔ |
| R-12 | MEDIO | Contenido | **El NAP de privacidad sigue sin unificar** (M-03): Vitoria aparece de 3 formas, más «Teléfono:945» (sin espacio) y el punto dentro del enlace del email. La sede de Oviedo del inicio dice «Llano Ponte, nº8 - Bajo (Oviedo)». (D-5) | `content/privacidad.html:11, 55-57, 110-112`; `content/inicio.html`. | El formato de `site.json` en todas partes. | 20 min | |
| R-13 | MEDIO | Documentación | **`estado.md` está desactualizado:** fecha del 10/10, dice que `apache-fixes` está «pendiente de revisión» cuando ya está fusionada, «196 alts» cuando son 183, y B-02 sigue como pendiente aunque está hecho. Tampoco se actualizaron `auditoria-final.md` (B-02, M-02, M-06), `boceto/README.md` (diferencias 3 y 8), `diseno.md`, `arquitectura.md` (Productos sin JS) ni el árbol de AGENTS §7 (`test-apache.js`, `test-limitador.php`). (F-5, F-6, A-6) | `docs/estado.md:3, 17, 38-39`. | Ponerlos al día en el bloque 1. | 1,5 h | |
| R-14 | MEDIO | Conversión | **En móvil, la CTA de presupuesto de categorías y familias queda fuera de la primera pantalla.** Lo primero tras el H1 es el botón secundario a ancho completo «Ver productos», que además repite lo que hace el índice «Ver los N productos». La cabecera móvil no tiene «Pedir presupuesto»: está dentro del menú, a 2 toques. (C-4) | A 360 × 780, el primer «Pedir presupuesto» está en y = 1011 (planas) e y = 1203 (indicadores): `auditor-C/main/catcorta/360-arriba.png`. | Bajo el H1, una fila compacta: botón primario «Pedir presupuesto» + enlace «Ver los N productos ↓». Junto con la barra fija (bloque 2). | 1 h | |
| R-15 | MEDIO | Diseño | **En escritorio, el lateral fijo de las categorías no cabe en la pantalla** (927 px frente a 800). La CTA «¿No encuentras el modelo?» nunca llega a verse. Ya pasaba en v0.9. (C-3) | `auditor-C/sec/catlarga-1280-sticky.png`. | Fijar solo la CTA compacta, o ponerla antes de las categorías hermanas. | 30 min | |
| R-16 | MEDIO | Imágenes | **Falta `slide-1.webp`** (B-01, D-004) y el hero se ve como un rectángulo blanco sobre el degradado gris. (B-6, C-8) | `images/*.webp` → 0 archivos; captura `auditor-B/inicio-1280.png` (comprobada). | Generar la WebP con el Chrome instalado (sin dependencias) y poner el hero sobre fondo blanco o enmarcar la foto a propósito. | 45 min | ✔ |
| R-17 | MEDIO | Imágenes | **Las 3 fotos del piloto siguen sin retocar**: bordes de color 215,214,203 / 251,245,237 / 238,237,231. (B-7) | Idénticas byte a byte a /legacy. | Bloque 2, tarea 2.8. | 2-3 h | |
| R-18 | MEDIO | Alts | **183 de 266 alts** son el nombre del producto, sin describir lo que se ve (M-02). | Script sobre `data/categorias/*.json`. | Bloque 2, tarea 2.6. | 6-8 h | ✔ |
| R-19 | BAJO | Herramientas | El simulador del `.htaccess` no entiende `%{ENV:…}` ni `END`: la regla nueva «pasa» por casualidad y ninguna prueba automática la vigila. (A-2) | `tools/lib/htaccess.js:48`. | Resolver `%{ENV:*}` como vacío, tratar `END` como `L` y avisar ante un flag desconocido. | 30 min | |
| R-20 | BAJO | Contenido | Erratas heredadas que no están en el §3: «termoresistencia» ×2, «frio» ×2, «por si solo», «las baños», «A parte de», «no Propagador», «de en Titanio», «Vitón», «ó» ×17. En una intro nueva: «**hidroscópicos**» → «higroscópicos». «pude → puede» se corrigió sin registrarla. (D-3, D-7) | Informe del auditor D. | Añadirlas al §3 de plan-contenido y corregirlas (el auditor las acepta al estar listadas). | 1 h | |
| R-21 | BAJO | Contenido | Tuteo incoherente (cookies, privacidad, fabricaciones), bloques en inglés en mantas, «Podrás hojearlos online» (son PDF), «te ayuda a definir la resistencia» (sin respaldo) y «1982» escrito a mano en 3 archivos de `/content`. (D-8 a D-11) | Informe del auditor D. | Filas nuevas en el §4 y corrección durante la revisión de los borradores. | 1 h | |
| R-22 | BAJO | CSS | Nueve selectores `#familias`, valores sueltos fuera de los tokens (1.25rem, 195px, 88/66, 120/90), un punto de corte nuevo de 359 px sin documentar y una regla sin efecto (`style.css:851-853`). CSS +12 % (gzip +878 B). (E-5, E-6) | `assets/css/style.css:793-812, 851-853, 895, 906`. | Clase `seccion--familias`, variable `--marco` y borrar la regla muerta. | 45 min | |
| R-23 | BAJO | JS | El cierre por `mouseleave` comprueba el foco y no si se usa el teclado: tras hacer clic con el ratón, el panel se queda abierto. (E-8) | `assets/js/menu.js:68-71`. | `itemProductos.querySelector(':focus-visible')`. | 10 min | |
| R-24 | BAJO | Imágenes | `portada-catalogos-provisional.png` pesa 44 KB a 260 × 184 y se muestra a 120 × 90: las portadas no se leen. No se pudo comparar píxel a píxel con el PDF. (B-3) | — | JPG o WebP de unos 10 KB, o una sola portada. | 15 min | |
| R-25 | BAJO | Proceso | Commits sin prefijo (`feat:`/`fix:`/`content:`) y sin tildes, ramas `review/…` en lugar de `feat/…`/`fix/…`, un commit que mezcla 4 temas, el informe del auditor desfasado en 5 commits y 9 ramas `review/jhonda-*` (más 5 antiguas) ya fusionadas que siguen en el remoto. (F-7, F-8, F-10) | `git log`, `git ls-remote`. | Plantilla de PR con la convención. Borrar las ramas fusionadas, previa confirmación. | 15 min | |
| R-26 | BAJO | Repositorio | `npm run test` deja `docs/auditoria-seo.md` como modificado solo por los finales de línea (`core.autocrlf=true` del sistema; el auditor escribe en LF). (F-9) | `git diff --ignore-cr-at-eol` vacío. | `* text=auto eol=lf` en `.gitattributes` (antes de `legacy/** -text`) y `git add --renormalize .` en un commit propio. | 15 min | ✔ |
| R-27 | BAJO | Diseño | Tira de marcas ilegible en móvil (logos de ~23 px) y repetida en los chips; adjunto nativo sin estilo («Ning…onado» a 360 px); teléfono sin `tel:` en la 404; pie con todos los enlaces subrayados; etiqueta PDF separada a 320 px. (C-7, C-9, C-10) | Capturas de `auditor-C/sec/`. | Bloque 3. | 2 h | |
| R-28 | BAJO | Contenido | La frase nueva de ATEX deja juntas «la 94/9/CE fue sustituida…» y «todos los equipos… certificados en base a la 94/9/CE»: el lector puede entender que la certificación ha caducado. El cambio cumple el §4. (A-5, D-2) | `resistencias-atex.json → cuerpo`. | Dar prioridad a la pregunta 5 al cliente (el art. 41.2 de la 2014/34/UE mantiene válidos los certificados anteriores). **No añadir esa afirmación sin su confirmación.** | Cliente | |

### Detalle de R-04: los 21 alts reescritos (antes → ahora)

| Producto | Antes | Ahora | Resultado |
|---|---|---|---|
| Sensor CNM 10 / CNM 30 / CNM 20 EX | «Sensor CNM 10»… | «Sensor CNM 10 con membrana circular y carcasa»… | Conserva el modelo ✔ |
| RFA / RFA-CS / HIDH / FAW / FUH | «Tapón roscado RFA»… | «Resistencias RFA con tubos calefactores y cajas de conexiones»… | Conserva el modelo ✔ |
| Aerotermo Industrial ATEX | «Aerotermo Industrial ATEX» | «Aerotermo portátil MFH con rejilla circular y patas» | Gana el modelo (MFH) y **pierde «ATEX»** |
| **Sensores PTC** | «Sensores PTC» | «Sensor con cable negro, dos conductores y bulbo metálico» | **Pierde la designación** |
| **Sensores NTC** | «Sensores NTC» | «Sensor con cable negro y bulbo metálico en el extremo» | **Pierde la designación** |
| **Termorresistencia propósito general** | «Termorresistencia RTD» | «Esquema de termorresistencia con cable y muelle protector» | **Pierde «RTD»** |
| **Termopar propósito general** | «Termopar propósito general» | «Esquema de termopar con cable y muelle protector» | **Pierde parte del nombre** |
| Termorresistencia mineral | «Termorresistencia aislamiento mineral» | «Esquema de termorresistencia mineral con racor y conductores» | Pierde «aislamiento» (menor) |
| Calefactores para armarios | «Calefactores para armarios» | «Calefactor para armarios con aletas negras» | Sin modelo antes ni ahora; el texto da **CREX** |
| Otras 6 sondas | nombre | «Esquema de…» + descripción | Correctos; el nombre queda detrás de «Esquema de» |

Las fotos de PTC y NTC vienen cruzadas desde /legacy (`controltemperatura-sondastemperatura.html:195, 198`), son casi idénticas y llevan una marca de agua de terceros («mag-pro»). La asignación actual es fiel a /legacy. Se pregunta al cliente cuál es cuál; si confirma el cruce, basta con intercambiar `img` en el JSON (las dos URLs siguen publicadas).

---

## 5. Plan de complemento

Estimaciones para una persona con Claude. Cada bloque termina con `npm run test`, `npm run validar`, capturas de lo cambiado y un commit pequeño en español. Las mejoras de diseño se enseñan antes y después, con capturas, antes de pasar a la siguiente.

### Bloque 1: arreglar lo roto o arriesgado (≈ 7 h)

| # | Tarea | Hallazgos | Criterio de terminado | Est. |
|---|---|---|---|---|
| 1.1 | `[END]` → `[L]`. El simulador entiende `%{ENV:…}` y `END`, y una prueba de mutación nueva («quitar la exención del 404») | R-03, R-19 | `test-auditor` detecta 11/11 mutaciones; `test-apache.js` en verde con `All` y `FileInfo` (Persona B, que tiene Apache) | 45 min |
| 1.2 | Limitador: `dir_limites` obligatorio, motivo `servicio` con el teléfono, checklist y `test-limitador.php` ampliado | R-05 | `test-limitador.php` cubre «carpeta inexistente» y «sin permisos»; `error.html#servicio` con el teléfono y el email | 45 min |
| 1.3 | **Alts:** regla D-014; recuperar el modelo en los 5 casos (PTC, NTC, RTD, propósito general y ATEX), añadir CREX e igualar el alt del aerotermo en sus dos páginas; aviso en `build.js` si un alt no contiene el código de modelo del nombre; sincronizar `plan-imagenes.csv` | R-04 | 0 avisos de alt sin modelo; `plan-imagenes.csv` = `data/` | 1 h |
| 1.4 | **Tarjetas del inicio:** las imágenes pasan a los datos (`imgTarjeta`); miniaturas recortadas de un solo producto (sin reescalar al alza ni retocar) en JPG + WebP de ~300 px; arreglar el marco 4:3; mismas imágenes en `/oviedo/`; catálogos en JPG o WebP; borrar las copias `portada-*` (nunca se han publicado) | R-06, R-07, R-09, R-24 | Imágenes del inicio ≤ 240 KB; las 8 tarjetas alineadas a 320, 768 y 1280 px; AGENTS §5 sin excepciones nuevas | 2 h |
| 1.5 | Menú: clase `menu-listo` puesta por `menu.js` (B-06) y cierre por `mouseleave` con `:focus-visible` | R-08, R-23 | Con `menu.js` bloqueado, «Productos» enlaza al mapa web | 30 min |
| 1.6 | Contenido sin respaldo o inexacto: intro de ATEX, `/oviedo/` «mismo catálogo», «hidroscópicos» y «te ayuda a definir» | R-10, R-11, R-20 (parte), R-21 (parte) | El auditor sigue en 0 ERROR; cada frase cambiada se puede rastrear hasta /legacy | 30 min |
| 1.7 | **Documentación:** D-013 y D-014 (ya hechas), `estado.md`, AGENTS §5, §7 y §11, `auditoria-final.md` (estados), `boceto/README.md`, `diseno.md` y `arquitectura.md`; `.gitattributes` con `eol=lf` y renormalización | R-02, R-13, R-26 | `git status` limpio después de `npm run test`; ningún documento contradice el código | 1,5 h |
| 1.8 | **Proceso:** workflow de CI (`node tools/test.js` + informe al día), plantilla de PR con la convención de commits y ramas | R-01, R-25 | Una PR de prueba muestra el check en verde; la protección de `main` la activa el responsable | 1 h |

### Bloque 2: completar la visión (prioritario, ≈ 24 h)

| # | Tarea | Detalle | Criterio de terminado | Est. |
|---|---|---|---|---|
| 2.1 | **Barra fija móvil «Llamar · Presupuesto»** | Por debajo de 768 px, solo CSS (`position: sticky; bottom: 0`) y HTML generado: «Llamar 945 22 33 31» (`tel:`) y «Pedir presupuesto». En `/oviedo/`, el teléfono de Oviedo. No aparece en `/contacto/`. `padding-bottom` en el pie para que no tape nada. Zonas táctiles de 44 px. | Sin JS funciona; no tapa contenido a 320 px; Lighthouse y accesibilidad sin bajadas | 2 h |
| 2.2 | **Cabecera de categoría y familia orientada a la conversión** | Sustituir el botón secundario «Ver productos» por una fila: botón primario «Pedir presupuesto» + enlace «Ver los N productos ↓». Arreglar el lateral fijo. Enlace «Adjunta tu plano» a `#f-adjunto`. | «Pedir presupuesto» dentro de la primera pantalla a 360 × 780 en las 43 plantillas | 1,5 h |
| 2.3 | **Buscador en el inicio** | El mismo componente del megamenú (diseno §3.15), bajo el hero. La lista de categorías sale escrita en el HTML; el JS solo filtra. Sin JS, enlace al mapa web. | Teclado, lector de pantalla y 320 px OK; sin peticiones nuevas | 2,5 h |
| 2.4 | **Bloque de sectores** | Los 9 sectores de la tabla de `arquitectura.md` (todos con su página de origen en /legacy), en texto, cada uno enlazado a su categoría y con un icono SVG propio. Sin URLs nuevas ni sectores inventados («Fundición» no). | Cada sector se puede rastrear hasta /legacy; el auditor sigue en 0 ERROR | 2 h |
| 2.5 | **Familias en móvil** | Recomendación: **mantener la lista compacta** y mejorar sus miniaturas (1.4). Motivo en la decisión 1. | — | — |
| 2.6 | **Los 183 alts genéricos, por tandas** | `tools/hoja-alts.js` genera una hoja HTML por familia con la foto a tamaño real, el nombre, el modelo, un fragmento del texto, el alt actual y una propuesta. **Claude redacta las propuestas mirando cada foto** con la regla D-014. Una persona revisa con la foto delante y aprueba o corrige. Un script aplica lo aprobado a `data/` y a `plan-imagenes.csv`. Tandas: resistencias (~80), temperatura (~95), nivel y presión (~60) y directas (~19). | 0 alts iguales al nombre; 0 alts sin modelo cuando existe; cada tanda aprobada por una persona | 6-8 h (3 de redacción + 3-4 de revisión) |
| 2.7 | **`slide-1.webp`** | `tools/webp.js`: Chrome sin ventana (el mismo método que `capturas.js`, sin dependencias) decodifica el JPG y lo codifica con `canvas.toBlob('image/webp', 0,8)`. Conversión pura, mismas medidas. | 910 × 426, menos de 35 KB; `<picture>` la sirve; LCP igual o mejor | 1 h |
| 2.8 | **Retoque de las 3 fotos del piloto** | `tools/retoque-fondo.js` (Chrome con canvas, sin dependencias). (1) Máscara del fondo por relleno desde los bordes, con tolerancia de color. (2) Solo los píxeles de la máscara pasan a blanco, con 1-2 px de transición. (3) **Comprobación:** fuera de la máscara y de la transición, la diferencia con el original debe ser **0 píxeles**; si no, se rechaza. (4) Hoja antes/después para aprobarla. Mismo nombre y medidas. Si la máscara no separa bien el fondo (producto que toca el borde o con poco contraste), se hace a mano: ver «Procedimiento manual». | Informe con 0 píxeles de producto cambiados y aprobación de una persona con la hoja delante | 2-3 h |
| 2.9 | **`docs/seo-mejoras.md`** | Análisis completo con cada propuesta clasificada en **segura**, **con datos de Search Console** o **arriesgada**. Ya se sabe que entrarán: `Tabla-fabricacion.jpg` → `<table>` en `resistencias-especiales-a-medida` (página fina, 0 productos); alts con keyword (2.6); `og:image` donde falta; sitemap de imágenes; `geo`, horario y `areaServed` cuando responda el cliente; enlazado interno por sectores (2.4); revisión de titles y CTR tras 4-8 semanas de GSC. | Documento con prioridad, riesgo, esfuerzo y dueño de cada mejora | 2 h |
| 2.10 | **Herramienta de revisión de borradores** | `tools/revision-borradores.js` genera **una página HTML local** (no se publica) con las 51 piezas. Para cada una: la intro dividida en frases; al lado de cada frase, el fragmento de /legacy o del PDF que la respalda, con archivo y similitud; en **rojo**, las frases sin origen; en **ámbar**, las que tienen origen parcial o una cifra que no casa; los problemas ya detectados (auditor D); y una casilla «Aprobada» con nota, que se guarda en el navegador y se exporta a una lista. `tools/aprobar-borradores.js lista.txt` quita `_borrador` o `borrador: si` solo de las aprobadas. | Una pieza «lista» se revisa en 3-5 min: los 51 en una tarde entre dos personas (~25 cada una) | 4 h |

**Procedimiento manual para el retoque** (si la herramienta no separa bien el fondo de alguna foto):
1. Herramienta: **Photopea** (gratis, en el navegador) o **GIMP 2.10+**.
2. Abrir el original de `legacy/com/brototermic.com/images/<nombre>.jpg`.
3. Seleccionar el fondo con la *Varita mágica* (tolerancia 10-20, con «Contiguo» activado) y ampliar la selección 1 px.
4. Comprobar que la selección **no toca el producto**, a un zoom del 300 %.
5. Rellenar con `#ffffff`.
6. Solo si la luz del fondo sigue irregular: *Niveles* aplicados a la misma selección. Nunca a toda la imagen.
7. **Prohibido** nitidez, saturación, clonar o cambiar el tamaño.
8. Exportar en JPG, calidad 85, con el mismo nombre y medidas, en `/images/`.
9. Pasar `tools/retoque-fondo.js --comprobar <nombre>`, que mide los píxeles cambiados fuera del fondo, y adjuntar la hoja antes/después a la PR.

### Bloque 3: mejoras que elevan el resultado (≈ 16 h)

| # | Mejora | Por qué | Est. |
|---|---|---|---|
| 3.1 | **Ritmo de secciones:** bandas a ancho completo alternando blanco, `#f1f1f1` y `#dae9f9`, menos cajas con borde, y antetítulos con texto real («Distribuciones industriales · Instrumentación», del logo) sobre una línea de acento `#36afe0` | Es lo que más separa una plantilla de un diseño propio | 3 h |
| 3.2 | **Iconografía propia en SVG en línea** (en `#004c9a` con acento `#36afe0`) en la franja de confianza, en las tarjetas de familia y en los sectores | La lleva el boceto, da identidad y no pesa | 3 h |
| 3.3 | **Hero:** foto sobre panel blanco intencionado (o hero sobre fondo blanco), antetítulo y enlace «Adjunta tu plano» | Quita el rectángulo blanco y adelanta la conversión a medida | 1 h |
| 3.4 | **Sistema de imagen de producto:** marco blanco con margen fijo y `mix-blend-mode: multiply` para disimular los fondos casi blancos **sin tocar los píxeles**. En «Mercado y aplicación», cambiar la foto de archivo del hombre con prismáticos por un producto real de `nuevos-productos` (decisión 6) | Uniformidad sin retocar 270 fotos | 2 h |
| 3.5 | **Cabecera de categoría a dos columnas desde 1024 px:** la intro a la izquierda y, a la derecha, una ficha rápida con datos reales (nº de productos, PDF, «Pedir presupuesto», teléfono y «Adjunta tu plano») | Conversión en escritorio y aspecto de catálogo técnico | 3 h |
| 3.6 | **Adjunto con estilo:** `::file-selector-button` como botón secundario y zona «Adjunta un plano o una foto (PDF, JPG, PNG, DWG, DXF)» | Es la acción diferencial de la fabricación a medida | 1,5 h |
| 3.7 | Detalles: tira de marcas oculta por debajo de 768 px (quedan los chips), `tel:` y buscador en la 404, pie con subrayado solo al pasar el ratón, etiqueta PDF a 320 px, limpieza del CSS (R-22) | Acabado | 2 h |
| 3.8 | **Uniformidad del catálogo:** misma herramienta de 2.8 en las ~30 fotos de fondo gris o azul (lista priorizada del auditor B) y pedir al cliente o a los fabricantes las fotos con marca de agua o que son folletos (PTC/NTC «mag-pro», Celduc, Disibeint, MUX) | Fotografía coherente sin inventar | según el cliente |

---

## 6. Reparto del trabajo pendiente (tablero)

Criterio:
- **Persona B:** lo que encaja con lo que ha demostrado (pruebas de servidor con Apache, PHP, responsive y accesibilidad) y, por norma (AGENTS §8), sus carpetas: `/data`, `/content` e `/images`.
- **Persona A:** herramientas, generador, SEO técnico y documentación.

Los borradores se reparten entre los dos (51 = 25 + 26).

| # | Tarea | Dueño | Depende de | Terminado cuando | Est. |
|---|---|---|---|---|---|
| T-01 | Enviar las preguntas al cliente (C-04), añadiendo PTC/NTC, ATEX art. 41.2 y «mismo catálogo» de Oviedo | **B** | — | Fecha de envío en `preguntas-cliente.md` | 1 h |
| T-02 | `[END]` → `[L]` + `test-apache.js` en su Apache con `All` y `FileInfo` | **B** (el cambio de simulador, A) | — | 0 respuestas incorrectas y 11/11 mutaciones | 45 min |
| T-03 | Limitador: `dir_limites`, motivo `servicio` y pruebas PHP | **B** | — | `test-limitador.php` en verde y checklist actualizada | 45 min |
| T-04 | Prueba en Docker (C-03) con los dos docroots | **B** | T-02 | `probar-redirecciones.sh` en verde (las 17 reglas 301 + 404) | 2 h |
| T-05 | Menú: `menu-listo` y `:focus-visible` (R-08, R-23) | **B** | — | Menú usable con `menu.js` bloqueado; teclado OK | 30 min |
| T-06 | Barra fija móvil «Llamar · Presupuesto» (2.1) | **B** | Decisión 2 | 320-767 px sin solapes; AA | 2 h |
| T-07 | Cabecera de categoría y familia + lateral fijo (2.2, R-14, R-15) | **B** | — | CTA en la primera pantalla a 360 × 780 | 1,5 h |
| T-08 | Adjunto con estilo (3.6) y detalles de 3.7 | **B** | — | Capturas a 4 anchos aprobadas | 2,5 h |
| T-09 | Documentación, `.gitattributes`, CI y plantilla de PR (1.7, 1.8) | **A** | — | `git status` limpio tras el test; check en verde | 2,5 h |
| T-10 | Alts: regla D-014, 5 correcciones, aviso en `build.js` (1.3) | **A** | — | 0 avisos de alt sin modelo | 1 h |
| T-11 | Tarjetas del inicio: datos, recortes, marco y `/oviedo/` (1.4) | **A** (los recortes los aprueba B) | Decisión 3 | Imágenes del inicio ≤ 240 KB; tarjetas alineadas | 2 h |
| T-12 | Correcciones de contenido de 1.6 | **A** | — | Auditor en 0 ERROR | 30 min |
| T-13 | Herramienta de revisión de borradores (2.10) | **A** | T-12 | Vista de las 51 piezas con orígenes y frases sin respaldo marcadas | 4 h |
| T-14 | **Borradores, mitad A (26):** 13 categorías de temperatura, 9 de nivel, familias de temperatura y nivel, `inicio` y `empresa` | **A** | T-13 | Sin `_borrador`; frases rojas resueltas | 2 h |
| T-15 | **Borradores, mitad B (25):** 11 categorías de resistencias, 2 de presión y humedad, 4 directas, familias de resistencias y de presión, `contacto`, `cookies`, `privacidad`, `nuevos-productos`, `fabricaciones-a-medida` y `oviedo` | **B** | T-13, T-01 (`oviedo`, `nuevos-productos`) | Sin `_borrador`; frases rojas resueltas; NAP unificado (R-12) | 2 h |
| T-16 | Hoja de alts y propuestas de Claude, por tandas (2.6) | **A** (redacta) / **B** (aprueba) | T-10 | Cada tanda aprobada y aplicada | 3 h A + 3-4 h B |
| T-17 | `slide-1.webp` y herramienta de retoque de fondo (2.7, 2.8) | **A** (herramienta) / **B** (aprueba la hoja o hace el retoque manual) | — | 0 píxeles de producto cambiados; WebP servida | 3-4 h |
| T-18 | Buscador del inicio y bloque de sectores (2.3, 2.4) | **A** | Decisión 4 | Teclado y 320 px OK; sectores rastreables | 4,5 h |
| T-19 | `docs/seo-mejoras.md` (2.9) | **A** | — | Propuestas con riesgo y dueño | 2 h |
| T-20 | Diseño del bloque 3 (3.1-3.5) | **A** (diseño) / **B** (revisión responsive y AA) | Bloque 2 | Capturas antes/después aprobadas por el responsable | 12 h |
| T-21 | Revisión cruzada de cada PR (la de A la revisa B y viceversa) | **A y B** | T-09 | 1 revisión aprobada por PR | continua |

**Orden recomendado:** T-01 y T-09 hoy (desbloquean al cliente y el proceso). Después, el bloque 1 en paralelo (B: T-02 a T-05; A: T-10 a T-12). Luego T-13 y la tarde de borradores (T-14 y T-15). Por último, el bloque 2 y el bloque 3.

---

## 7. Decisiones que necesito que tomes

| # | Decisión | Opciones | Recomendación |
|---|---|---|---|
| 1 | **Familias en móvil** | (a) Mantener la lista compacta de la PR #8. (b) Acordeón como en el boceto, con las categorías dentro (`<details>`). (c) Acordeón con JS. | **(a).** Ya reduce el bloque un 44 %. Cada familia tiene su propia página (con intro, que es la mejor entrada SEO y no conviene saltársela). Un acordeón con las 39 categorías duplicaría en cada carga los enlaces que ya están en el megamenú, añadiría un toque antes de llegar y no funciona igual sin JS (el boceto lo muestra cerrado). Se mejoran sus miniaturas (1.4). |
| 2 | **Barra fija móvil** | (a) Solo «Llamar», como en el boceto. (b) «Llamar · Presupuesto». (c) No ponerla. | **(b).** El presupuesto es el objetivo número 1 de la web (AGENTS §1) y hoy está a 2 toques en móvil. Teléfono de Vitoria, y de Oviedo en `/oviedo/`. |
| 3 | **Imágenes de las tarjetas de familia** | (a) Recortes de un solo producto de las mismas fotos de /legacy (sin reescalar al alza). (b) Fotos de catálogo de 260 × 168 ya publicadas (p. ej. `brototermic-sensor-inmr`, `brototermic-controladordr4020`). (c) Banners redimensionados enteros. | **(a)**, con **(b)** como respaldo donde el recorte no quede limpio. (c) deja la tira de nivel ilegible en móvil. |
| 4 | **Buscador del inicio** | (a) Bajo el hero, visible siempre. (b) Solo en escritorio. (c) No ponerlo (ya está en el megamenú). | **(a).** El usuario B2B llega buscando un modelo concreto. Reutiliza un componente ya aprobado (D-006). |
| 5 | **Alts: quién los escribe** | (a) Claude propone mirando cada foto y una persona aprueba en la hoja. (b) La Persona B los escribe desde cero. | **(a).** Reduce 183 alts a unas 3-4 h de revisión humana, con la regla D-014 y la foto delante. |
| 6 | **Foto de «Mercado y aplicación»** | (a) Producto real de `nuevos-productos` (chiller ENR). (b) Sin foto. (c) Dejar los prismáticos. | **(a).** La foto de archivo es lo más anticuado del sitio y no muestra nada del catálogo. |
| 7 | **Protección de `main` y CI** | (a) Revisión obligatoria + check de CI + rama al día. (b) Solo CI. (c) Nada. | **(a).** Lo activas tú en GitHub (Settings → Branches); yo dejo el workflow y la plantilla. |
| 8 | **Borrar las ramas fusionadas del remoto** | (a) Las 9 `review/jhonda-*` y las 5 antiguas (`jhonda/desarrollo`, `feat/*` y `fix/auditoria`). (b) Solo las `review/*`. (c) Ninguna. | **(a)**, después de que la Persona B confirme que no tiene nada local pendiente. Es una acción en GitHub: la haré solo con tu confirmación explícita. |
| 9 | **Aprobación de borradores frente a alts** | (a) El borrador se aprueba por el texto; los alts tienen su propia tarea (T-16). (b) Una página no se aprueba hasta tener los alts descriptivos. | **(a).** Si no, los 51 borradores dependen de las 183 fotos y no caben en una tarde. |
| 10 | **Reparto** | El tablero del apartado 6, u otro reparto. | **El tablero del apartado 6:** B en servidor, PHP, responsive y accesibilidad, donde ya ha demostrado nivel; A en herramientas, SEO y diseño; borradores a medias. |

---

## 8. Fuentes

Las seis auditorías trabajaron en solo lectura (el repositorio sigue limpio). Sus scripts y capturas están en la carpeta temporal de la sesión, no en el repositorio:
- `auditor-A`: árbol, páginas, texto, enlaces y simulador del `.htaccess`.
- `auditor-B`: hojas de contacto y color de los bordes de 285 imágenes.
- `auditor-C`: capturas a 4 anchos y Lighthouse.
- `auditor-D`: corpus de /legacy, /dist y PDF.
- `auditor-E`: CSS sin uso y build de comprobación.
- `auditor-F`: pruebas en los 15 commits y API de GitHub.

Las cifras citadas en este documento (Lighthouse con el equipo libre, bytes del inicio, PR sin revisión, recuento de alts, frases sin respaldo y capturas de C-2 y del hero) las ha repetido el revisor principal.
