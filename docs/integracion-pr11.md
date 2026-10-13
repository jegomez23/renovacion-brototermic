# Integración local de la PR #11 con main y la PR #10

Fecha: 2026-10-13. Estado: **resuelta localmente, pendiente de revisión y aprobación; sin commit ni publicación**.

## Referencias y alcance

- Rama de trabajo: `integracion/juan-pr10`.
- Base y HEAD: `a65c98449c0c135f1d03f0bf9b720c38640e0aab`, main con la PR #10 incorporada.
- MERGE_HEAD: `ada1d14cc6c7b5ebf4e235ed51b6feac118f951e`, `origin/revision/complemento-b`, PR #11.
- La integración se inició con `git merge --no-commit --no-ff origin/revision/complemento-b` en la rama temporal.
- Main y la referencia de Juan conservan sus commits. No se ha hecho commit, push, merge en main ni modificación de la PR.
- Al retomar: **96 archivos preparados, ningún conflicto sin resolver y ningún cambio sin preparar**. Este informe se añade después, sin preparar.
- La revisión final no repite las baterías completas ya aprobadas. Añade verificaciones concretas de navegación, responsive y conservación.

## Conflictos exactos y resolución

| Archivo | Conflicto | Resolución |
|---|---|---|
| `assets/css/style.css` | Ambas ramas añadían estilos al final del archivo. | Se conservan el bloque de servicios, adjunto y tablas de la PR #10 y los bloques de ritmo, hero y efectos de Juan. Se cierra expresamente el media query de servicios antes del bloque de Juan. No se acepta una rama completa sobre la otra. |
| `docs/estado.md` | Encabezado y relato del estado divergentes. | Se documentan la base real, la integración local pendiente y el trabajo de ambas PR. Las métricas anteriores se identifican como anteriores a la integración. |

No hubo conflictos textuales en `build.js`, `data/site.json`, PHP, plantillas ni imágenes. Su combinación automática también se revisó.

### Conservación adicional de URLs

La rama entrante retiraba cuatro archivos ya publicados por main. Se restauraron desde `origin/main`, conservando también los derivados nuevos de Juan:

- `images/portada-catalogos-provisional.png`
- `images/portada-control-nivel.jpg`
- `images/portada-control-temperatura.jpg`
- `images/portada-resistencias-electricas.jpg`

Estos cuatro archivos no aparecen como modificados frente a main porque quedaron idénticos. No queda ninguna eliminación en el índice.

## Decisiones conservadas

- **D-014:** regla de nombre y modelo en los alts y comprobación del generador. Se mantienen los alts y las correcciones de contenido de la PR #10.
- **D-015:** si falla el almacenamiento del limitador, PHP acepta la solicitud y registra el fallo. Es una decisión aprobada, que sustituye expresamente el comportamiento de la PR #6. Siguen activos los otros controles. Se mantiene `envioActivo: false`.
- **D-016 y D-017:** ilustración del producto solo en preview; producción conserva `slide-1`. Preview separado, noindex y sin procesador PHP.
- **D-018 y D-019:** franjas, CTA, hero rotativo, pausa, efectos y sus interruptores conviven con servicios, sprite y adjunto de la PR #10.
- Se conservan las 42 variantes ambientales existentes. **No se aplican todavía los seis ambientes pendientes**: cuatro familias, fabricación y Oviedo.

## Pruebas completas ya ejecutadas antes de esta reanudación

Los resultados siguientes proceden de las salidas de ejecución de esta misma integración conservadas en la sesión. No se presentan como nuevas ejecuciones ni como resultados de CI remoto.

| Comprobación | Resultado registrado |
|---|---|
| `npm run test` | Exit 0. 55 HTML; auditor SEO **70 OK / 8 AVISO / 0 ERROR**; **11/11** mutaciones detectadas; sitemap con **60 URLs con 200**, 52 canónicas, cero huérfanas; lista blanca de **470 archivos**. |
| `npm run validar` | Exit 0. **55 HTML y una hoja CSS**, sin errores ni advertencias de Nu. |
| `npm run build` | Exit 0. **55 páginas, 351 imágenes del repositorio y 45 históricas conservadas, 8 PDF y 6 assets**. **61 avisos**. |
| `npm run build:preview` | Exit 0. **55 HTML** en `dist-preview`. El script ya existe tras incorporar a Juan. |
| `php tools/test-limitador.php` | Exit 0. Fallos de almacenamiento, aceptación y log, concurrencia, caducidad, honeypot y RGPD. Captura de correo de prueba; ningún correo real enviado. |
| `git diff --check` y `git diff --cached --check` | Sin errores. Repetidos al retomar. |

El primer intento de `npm run test` encontró `EPERM` al abrir el puerto local 8765 dentro del sandbox. La repetición autorizada terminó correctamente. No fue un fallo del sitio.

## Comprobaciones nuevas y evidencias

Evidencias locales de esta revisión: `/private/tmp/brototermic-integracion-pr11/`. Son archivos temporales; los resultados esenciales quedan recogidos aquí.

- **Conservación:** hash de blob de Git para los **831 archivos** de `images/` y `legacy/` presentes en main: **cero diferencias**. Incluye los originales del piloto. Evidencia: `conservacion.json`.
- **Responsive en Chrome 155:** 11 páginas por cinco anchuras (**320, 390, 768, 1280 y 1440 px**), 55 combinaciones. Inicio, cuatro familias, inmersión, fabricación, empresa, novedades, contacto y Oviedo. Cero desbordes horizontales, un H1 por página y ninguna imagen cargada rota ni excepción JS observada. Es una comprobación de estructura y recursos cargados, no una auditoría visual exhaustiva ni una revisión de todas las imágenes lazy. Evidencia: `navegador.json`.
- **Buscador del inicio:** «cartucho» devuelve `/resistencias-tipo-cartucho.html`.
- **Sectores:** nueve enlaces de categoría presentes; destinos conservados.
- **Hero:** tres diapositivas en Chrome, control de pausa visible y cambio del control a «Reanudar el cambio de imagen». Con movimiento reducido: una diapositiva y control oculto. No se atribuyen nuevas cifras de CLS ni de rendimiento a estas pruebas.
- **Barra móvil:** Vitoria usa `tel:+34945223331`; Oviedo, `tel:+34629462642`. Contacto no muestra la barra duplicada.
- **Menú:** Escape cierra el menú móvil y devuelve el foco al botón. Sin JS quedan accesibles las 39 categorías. Al abortar la descarga de `menu.js`, la recuperación de Juan deja visibles esas 39 categorías. Evidencia específica: `menu.json`.
- **Adjunto:** arrastrar `plano.pdf` actualiza el nombre; arrastrar `.exe` vacía la selección y muestra error. Seleccionar después un PDF válido limpia el error. El botón de envío continúa desactivado. La prueba de validación dispara un evento cancelable; no realiza un POST.
- **Preview:** los 55 HTML tienen `noindex, nofollow`; robots contiene `Disallow: /`; no contiene PHP, `.htaccess` ni sitemap. Producción no contiene la carpeta de imágenes de demo.

Los campos `menuSearchBefore` y `menuSearchAfter` de `navegador.json` corresponden a un intento con Productos plegado; no sirven para evaluar la búsqueda. **La reproducción válida está en `menu.json`**, con Menú y Productos abiertos.

## Avisos importantes y riesgos pendientes

### Bloqueos de publicación existentes

- **51 borradores:** 39 categorías, cuatro familias y ocho contenidos, contados de nuevo. La revisión de 25 textos no equivale a aprobación humana.
- **Formulario desactivado:** falta configuración del hosting y prueba de envío real. No activar para superar avisos.
- **Revisión legal y datos externos:** siete marcas de revisión del cliente y dos datos externos pendientes: fundación y dirección de Vitoria. Junto con borradores y formulario explican los 61 avisos del build piloto.
- Los **ocho avisos del auditor SEO son un recuento separado**: seis keywords pendientes de Search Console y dos URLs cuyo catálogo vigente debe confirmar el cliente.
- `build:publicacion` no se declara aprobado: los borradores y el formulario desactivado siguen bloqueándolo.

### Dos fallos funcionales preexistentes, reproducidos en la integración

| Prioridad | Ubicación y reproducción | Efecto | Corrección propuesta |
|---|---|---|---|
| Media | `assets/js/menu.js`, acordeón móvil. A 390 px: abrir Menú y Productos, buscar «sensor», enfocar una cabecera de familia y pulsar Intro. | Pasa de seis resultados visibles a cero, pero el estado mantiene «6 categorías encontradas». | Coordinar el acordeón con el filtrado: mantener visibles los grupos coincidentes mientras haya consulta, con `aria-expanded` coherente. Probar teclado y ratón. |
| Media; resolver antes de activar envíos | `assets/js/formulario.js`, arrastre. Rechazar `.exe`, completar los campos válidos e intentar continuar sin adjunto. | La selección está vacía, pero `errorArrastre` persiste y bloquea la validación de un campo opcional. | Añadir una acción accesible para descartar el adjunto/error y continuar sin archivo; mantener el rechazo del archivo inválido. |

El manejador del acordeón coincide con el de main y `formulario.js` entero permanece idéntico a main. Son problemas ya observados antes de integrar; no se han introducido correcciones nuevas durante esta reanudación. Un PDF válido permite recuperar el adjunto; el buscador del inicio funciona.

### Validación pendiente antes de publicación

- Ejecutar la prueba obligatoria de redirecciones en Docker y comprobar el hosting. El simulador aprobado no sustituye Apache real. Las pruebas históricas de Apache no certifican esta combinación exacta.
- Medir Lighthouse sobre la integración y PageSpeed sobre una demo pública identificada. No reutilizar como actuales los valores 97/99, accesibilidad 100 o CLS 0 de la PR #10.
- No se certifica Safari ni Firefox sobre esta integración. Esta continuación usa Chrome y no constituye auditoría WCAG completa.
- Mantener vigilancia del log y almacenamiento del limitador antes de activar el formulario, conforme a D-015.
- Las capturas de `docs/presentacion/` llegan de Juan; no son capturas nuevas de la integración.
- La resolución local no cambia por sí sola el estado de conflicto de la PR #11 en GitHub. Su publicación e integración requieren aprobación y un procedimiento revisado.

## Recomendación

Revisar el diff preparado y aprobar explícitamente el siguiente paso. La resolución de los dos conflictos está completa y conserva ambas ramas. Conviene resolver los dos fallos funcionales documentados antes de activar los envíos o dar por terminada la revisión comercial. Los bloqueos de publicación permanecen separados de la integración Git.

La incorporación de los seis ambientes es el siguiente bloque solicitado. No se ha iniciado aquí. No cambiar a otra rama ni iniciar otro merge con este merge pendiente.

## Inventario exacto de archivos preparados frente a main

`M` significa modificado; `A`, añadido. Son **96 archivos**, antes de añadir este informe. Los cuatro originales restaurados no tienen diferencias con main y se enumeran arriba.

```text
M	.gitattributes
A	.github/pull_request_template.md
A	.github/workflows/pruebas.yml
M	.gitignore
M	AGENTS.md
M	assets/css/style.css
M	assets/js/menu.js
M	build.js
M	content/error.html
M	content/oviedo.html
M	data/categorias/controltemperatura-sondastemperatura.json
M	data/categorias/equipos-perifericos.json
M	data/categorias/resistencias-atex.json
M	data/categorias/resistencias-calentamientoaire.json
M	data/categorias/resistencias-especiales-a-medida.json
M	data/categorias/resistencias-inmersion.json
M	data/familias.json
M	data/site.json
M	docs/arquitectura.md
M	docs/auditoria-final.md
M	docs/auditoria-seo.md
M	docs/boceto/README.md
M	docs/checklist-publicacion.md
M	docs/decisiones.md
M	docs/diseno.md
M	docs/estado.md
M	docs/plan-imagenes.csv
A	docs/presentacion/antes-despues.html
A	docs/presentacion/antes-despues.png
A	docs/presentacion/capturas/antes-categoria-1280.png
A	docs/presentacion/capturas/antes-contacto-1280.png
A	docs/presentacion/capturas/antes-inicio-1280.png
A	docs/presentacion/capturas/antes-inicio-390.png
A	docs/presentacion/capturas/despues-categoria-1280.png
A	docs/presentacion/capturas/despues-contacto-1280.png
A	docs/presentacion/capturas/despues-inicio-1280.png
A	docs/presentacion/capturas/despues-inicio-390.png
A	docs/presentacion/capturas/hero-rotativo-1.png
A	docs/presentacion/capturas/hero-rotativo-2.png
A	docs/presentacion/capturas/hero-rotativo-3.png
A	docs/presentacion/capturas/hover-tarjeta.png
A	docs/presentacion/demo.md
A	docs/presentacion/guion.md
A	docs/presentacion/hero-rotativo.png
A	docs/presentacion/pendientes-cliente.md
A	docs/presentacion/resumen.md
A	docs/revision-sesion-b.md
A	images/brototermic-marcas-representadas-gris.jpg
A	images/brototermic-marcas-representadas-gris.webp
A	images/brototermic-marcas-representadas.webp
A	images/portada-catalogos-260.jpg
A	images/portada-catalogos-260.webp
A	images/portada-control-nivel-400.jpg
A	images/portada-control-nivel-400.webp
A	images/portada-control-temperatura-480.jpg
A	images/portada-control-temperatura-480.webp
A	images/portada-resistencias-electricas-370.jpg
A	images/portada-resistencias-electricas-370.webp
A	images/slide-1-480.jpg
A	images/slide-1-480.webp
A	images/slide-1.webp
A	images/slide-3-480.jpg
A	images/slide-3-480.webp
A	images/slide-3.webp
A	images/slide-4-480.jpg
A	images/slide-4-480.webp
A	images/slide-4.webp
M	package.json
M	src/.htaccess
M	src/contacto/config.example.php
M	src/contacto/enviar.php
M	src/partials/cabecera.html
M	src/partials/head.html
M	src/partials/pie.html
M	src/templates/categoria.html
M	src/templates/familia.html
M	src/templates/inicio.html
A	tools/aprobar-borradores.js
M	tools/auditoria-seo.js
M	tools/capturas.js
A	tools/datos/catalogos-pdf.txt
A	tools/datos/demo/hero-calefactor-inmersion-1600.jpg
A	tools/datos/demo/hero-calefactor-inmersion-1600.webp
A	tools/datos/demo/hero-calefactor-inmersion-480.jpg
A	tools/datos/demo/hero-calefactor-inmersion-480.webp
A	tools/datos/demo/hero-calefactor-inmersion-910.jpg
A	tools/datos/demo/hero-calefactor-inmersion-910.webp
A	tools/datos/fuentes/hero-demo-calefactor-ia.png
A	tools/datos/fuentes/portada-catalogos-provisional.png
A	tools/datos/imagenes.json
A	tools/imagenes.js
M	tools/lib/htaccess.js
A	tools/revision-borradores.js
M	tools/servir.js
M	tools/test-auditor.js
M	tools/test-limitador.php
```
