# Correcciones funcionales e integración de seis ambientes

Fecha: 2026-10-13. Rama: `integracion/juan-pr10`. **Sin commit, push, merge ni publicación.**

Continuación: [auditoría del original y cierre provisional](auditoria-original-cierre.md). La ruta del ZIP de la empresa sigue pendiente; no se da por terminado ese contraste. Por petición posterior del usuario (2026-10-13), se retiran las leyendas visibles de los seis ambientes y su regla CSS. La procedencia se conserva en esta documentación y en `tools/datos/ambientes-ia.json`; los alts, las imágenes y sus rutas no cambian. Las capturas anteriores documentan el estado previo a esta retirada.

Verificación de la retirada (2026-10-13): Chrome 155, seis páginas a 390 y 1280 px (12 casos), sin leyendas visibles ni desbordamiento horizontal; imágenes cargadas con alt, figuras sin espacio residual de pie y títulos/CTA dentro del ancho disponible. Capturas revisadas y resultados locales en `/private/tmp/brototermic-sin-leyendas/`. Regenerados `dist` y `dist-preview` con `--sin-auditoria` para esta comprobación puntual, sin errores; no se repitieron Lighthouse ni la auditoría completa. Los resultados de pruebas y métricas que siguen corresponden al bloque anterior.

## Conservación del trabajo anterior

Se comprobó Git antes de editar. Antes de preparar la entrega, los 96 archivos preparados de la integración conservaban exactamente el SHA-256 del diff binario original. A petición del responsable, ahora se prepara conjuntamente la integración y los cambios nuevos para su revisión antes del commit.

HEAD/main siguen en `a65c984`; MERGE_HEAD y `origin/revision/complemento-b`, en `ada1d14`. No se modifica la rama de Juan. La resolución anterior está documentada en [integracion-pr11.md](integracion-pr11.md); no se ha rehecho.

## 1. Correcciones funcionales

### Acordeón durante la búsqueda

Antes, pulsar una familia después de buscar «sensor» ocultaba los seis resultados, aunque el estado seguía anunciándolos. Ahora los grupos coincidentes permanecen abiertos mientras exista consulta. Sus botones declaran `aria-expanded="true"` y `aria-disabled="true"`. Se conserva su foco. Al vaciar el campo se recupera el estado anterior y el funcionamiento normal del acordeón.

Cambio en `assets/js/menu.js`. No se altera la navegación escrita en HTML ni la recuperación del menú cuando falla JavaScript.

### Recuperación de un adjunto rechazado

Se añade **«Continuar sin adjunto»**, visible con JavaScript cuando existe una selección o un error de archivo. El botón elimina la selección y el error de arrastre, actualiza el resumen sin ocultar otros errores y devuelve el foco al input. No borra nombre, email, mensaje ni RGPD. Un archivo rechazado sigue bloqueado hasta que se descarte expresamente o se seleccione otro válido.

Cambios en `assets/js/formulario.js` y `src/partials/formulario.html`. Sin JavaScript permanece el selector nativo y el control adicional queda oculto. No se cambia PHP, la decisión D-015 ni `envioActivo: false`.

### Regresiones automatizadas

Nuevo comando: `npm run test:interfaz`, después del build. Usa Chrome instalado y WebSocket nativo de Node >= 22, sin añadir dependencias npm. `CHROME` permite indicar el ejecutable. Se añade al workflow existente; su ejecución remota queda pendiente de un futuro push autorizado.

**17 comprobaciones aprobadas:** búsqueda visible; conservación de resultados con Intro y clic; estados ARIA; recuperación al vaciar; rechazo de extensión y selección múltiple; descarte con teclado; foco; ausencia de error residual; PDF válido; preservación de errores obligatorios; envío desactivado; input y navegación sin JavaScript; ausencia de errores JS, HTTP y terceros.

La misma prueba se ejecutó contra una copia aislada del índice anterior y **falló detectando ambos defectos**. Los eventos de envío son sintéticos y cancelables: no realizan POST ni envían correos.

[Resultado anterior](imagenes-antes-despues/integracion/regresiones-antes.log) · [Resultado corregido](imagenes-antes-despues/integracion/regresiones-despues.log).

## 2. Seis ambientes aplicados

| Página | Imagen existente | Aplicación |
|---|---|---|
| `/resistencias-electricas.html` | `ambiente-resistencias-taller` | Columna visual de la cabecera; proporción original 480 × 210. |
| `/controltemperatura.html` | `ambiente-temperatura-proceso` | Columna visual de la cabecera. |
| `/controldenivel.html` | `ambiente-nivel-depositos` | Columna visual de la cabecera. |
| `/presionhumedad.html` | `ambiente-presion-humedad-tuberia` | Columna visual de la cabecera. |
| `/fabricaciones-a-medida.html` | `ambiente-fabricacion-plano` | Cabecera de servicio, en lugar de la textura genérica; fotografías históricas del contenido intactas. |
| `/oviedo/` | `ambiente-oviedo-taller` | Bloque de instrumentación, separado de la fotografía real de la sede, que permanece en la cabecera. |

Se conservan colores, Lora, franjas, CTA, espaciado y efectos de Juan. No se añaden efectos ni se modifican sus interruptores. No aparecen nuevas afirmaciones técnicas o comerciales.

El parcial `ambiente-industrial.html` muestra JPG/WebP con `srcset` real de 480/960/1280 px, `sizes`, dimensiones explícitas y alts del manifiesto revisado. CSS mantiene la proporción y limita la figura a 440 px, sin recortar ni ampliar los archivos. Las figuras no incluyen leyendas visibles de procedencia. Son ambientes industriales genéricos generados con IA, no fotografías de instalaciones de BROTOTERMIC; esta trazabilidad se mantiene solo en documentación interna.

Familias y Oviedo usan carga diferida: en móvil sus ambientes quedan después de la introducción o en una sección posterior. Fabricación conserva prioridad alta por su posición en la primera pantalla. La selección se obtiene del manifiesto existente `tools/datos/ambientes-ia.json`; no se altera el contrato de fotografías de productos o sedes ni sus datos.

## 3. Evidencia visual, conservación y SEO

- [Galería antes/después](imagenes-antes-despues/integracion/index.html): **28 capturas de página**, siete páginas a 390 y 1280 px, más comparaciones de los dos fallos funcionales.
- Total: **32 capturas**, incluidas cuatro de los estados de búsqueda y adjunto. Para repetir el bloque visual actual: `node tools/verificar-visual-imagenes.js despues docs/imagenes-antes-despues/integracion --integracion`.
- [Antes](imagenes-antes-despues/integracion/antes-resultados.json) y [después](imagenes-antes-despues/integracion/despues-resultados.json): **35 combinaciones por fase**, a 320/390/768/1280/1440 px. Sin desbordes, imágenes rotas, errores JavaScript ni terceros. También se comprueban ocho escenarios de adjunto y el selector sin JS.
- La línea base se reconstruyó desde el índice conservado en una copia temporal. Se detuvo el servidor que reconstruía automáticamente y se usaron servidores estáticos separados. Las capturas definitivas no mezclan builds.
- Las capturas usan movimiento reducido para mostrar también las secciones fuera de la primera pantalla; no prueban los tiempos de las animaciones.
- [Comprobación de los seis ambientes](imagenes-antes-despues/integracion/ambientes-comprobados.json): variantes JPG/WebP, alts, identificación y dimensiones presentes en cada página.
- **831 archivos** de `images/` y `legacy/` comparados con main mediante hashes de blob: cero diferencias. **42 variantes ambientales** comparadas con su manifiesto SHA-256: cero diferencias. Ningún original retocado o sustituido.
- Auditor SEO: **70 OK / 8 AVISO / 0 ERROR**, **11/11 mutaciones**. Permanecen URLs, PDF, productos y datos técnicos históricos. No se cambian titles, metas, canonicals ni schema para atribuir las escenas generadas a la empresa.

Durante las comprobaciones se corrigió una aserción del capturador: ausencia de desborde significa `scrollWidth <= innerWidth`, no igualdad. Una barra de desplazamiento puede reducir el ancho útil sin causar desborde.

## 4. Rendimiento medido

Lighthouse local móvil, Chrome 155, Lighthouse 13.5; sin compresión ni caché de Apache. Una ejecución por página en la pasada final. Son datos de laboratorio, **no PageSpeed público ni datos de usuarios**. Informes completos y resúmenes en [lighthouse/](imagenes-antes-despues/integracion/lighthouse/final-resumen.json).

| Página | Rendimiento final | Accesibilidad | LCP final | CLS |
|---|---:|---:|---:|---:|
| Resistencias | 98 | 100 | 2,327 s | 0 |
| Temperatura | 97 | 100 | 2,402 s | 0 |
| Nivel | 98 | 100 | 2,327 s | 0 |
| Presión y humedad | 98 | 100 | 2,252 s | 0 |
| Fabricación | 97 | 100 | 2,476 s | 0 |
| Oviedo | 97 | 100 | 2,477 s | 0 |
| Contacto | 98 | 100 | 2,251 s | 0 |
| Inicio | 95 | 100 | 2,777 s | 0 |

Comparación con la copia anterior:

| Página | Rendimiento antes / final | LCP antes / final | Bytes transferidos antes / final |
|---|---|---|---|
| Nivel | 98 / 98 | 2,179 / 2,327 s | 225.252 / 308.704 |
| Fabricación | 98 / 97 | 2,328 / 2,476 s | 257.751 / 287.803 |
| Oviedo | 97 / 97 | 2,477 / 2,477 s | 283.660 / 364.882 |
| Inicio | 95 / 95 | 2,778 / 2,777 s | 328.648 / 329.538 |

Añadir imágenes incrementa la transferencia. No se atribuye una mejora global de rendimiento: fabricación pierde un punto y nivel aumenta su LCP respecto a la base, dentro del objetivo.

La primera implementación cargaba con prioridad alta el ambiente de familia. Nivel daba **96 y LCP 2,705 s**; su elemento LCP era un párrafo de la introducción. Tras diferir la imagen secundaria se midieron **98 y 2,327 s**. Se conservan los informes intermedios y finales para contrastarlo. No se desactivaron efectos.

**Inicio sigue por encima de LCP < 2,5 s.** La copia anterior da prácticamente el mismo resultado; este bloque no lo corrige ni lo presenta como cumplido. Requiere una optimización independiente y mediciones en el hosting definitivo.

## 5. Validación y archivos afectados

- `npm run test`: correcto, incluidas paridad, mutaciones, sitemap y lista blanca de 470 archivos.
- `npm run test:interfaz`: 17 comprobaciones correctas.
- `npm run validar`: 55 HTML y CSS sin errores ni advertencias.
- `npm run build`: correcto; 61 avisos conocidos.
- `npm run build:preview`: 55 páginas de demostración noindex.
- `git diff --check` y `git diff --cached --check`: sin errores.

[Logs conservados](imagenes-antes-despues/integracion/test.log), [W3C](imagenes-antes-despues/integracion/validar.log), [build](imagenes-antes-despues/integracion/build.log) y [preview](imagenes-antes-despues/integracion/preview.log).

Archivos de implementación y proceso modificados respecto al índice de integración:

```text
.github/workflows/pruebas.yml
assets/css/style.css
assets/js/formulario.js
assets/js/menu.js
build.js
package.json
src/partials/ambiente-industrial.html (nuevo)
src/partials/formulario.html
src/templates/familia.html
src/templates/sede.html
src/templates/servicio.html
tools/test-regresiones-interfaz.js (nuevo)
tools/verificar-visual-imagenes.js
docs/estado.md
docs/bloques-funcionales-ambientes.md (nuevo)
docs/imagenes-antes-despues/integracion/ (evidencias nuevas)
```

## 6. Riesgos pendientes y entrega

- Siguen los 51 borradores, el formulario inactivo y las revisiones legales y datos externos. Los 61 avisos del build no son una aprobación de publicación.
- D-015 se conserva; no se han repetido sus pruebas PHP porque este bloque no cambia el backend. Falta el envío real en hosting.
- No se certifican Firefox o Safari en este bloque ni accesibilidad manual exhaustiva. Lighthouse 100 no sustituye una auditoría WCAG completa.
- Faltan PageSpeed público, comprobación de Apache/Docker y ejecución remota del workflow. No se publican resultados ficticios de CI.
- El merge anterior continúa pendiente. No cambiar de rama ni completar el merge sin aprobación. El índice de entrega reúne ambos bloques; la copia del índice anterior se conserva fuera del repositorio.

Recomendación: revisar las comparaciones, aprobar el conjunto y acordar después cómo guardar e integrar los cambios. No publicar mientras persistan los bloqueos del proyecto.

La vista local de esta sesión en `http://localhost:8000/` usa un servidor estático para evitar reconstrucciones durante las mediciones. Para reflejar nuevas ediciones, ejecutar el build; para recuperar el modo de desarrollo, detener ese servidor antes de iniciar `npm run dev`.

## 7. Preparación de la entrega, sin commit

Se revisaron el estado de Git, los archivos nuevos, sus tamaños y patrones de credenciales, claves privadas, URLs con contraseña y rutas personales. No se detectaron coincidencias en los textos candidatos a esta entrega. La revisión no constituye una certificación de ausencia absoluta de secretos. No se incluyen perfiles de navegador, configuraciones reales de correo, directorios de build, dependencias, copias temporales ni archivos de `/private/tmp`.

Se conservan las 32 capturas por ser evidencia solicitada. Los seis logs de validación son pequeños y contienen resultados técnicos, sin envíos reales ni datos de clientes. Los informes Lighthouse completos se guardan como **JSON comprimido con gzip sin pérdida**; los resúmenes siguen siendo JSON legible. No se repitieron las mediciones. [Manifiesto y hashes originales](imagenes-antes-despues/integracion/lighthouse/informes-comprimidos.json). Para leer un informe: `gunzip -c archivo.json.gz`. Los JSON originales redundantes quedan fuera del repositorio, en `/private/tmp/brototermic-entrega-lighthouse-originales`.

Las pruebas funcionales, build, W3C y Lighthouse documentadas arriba conservan su validez: esta preparación cambia únicamente documentación y empaquetado de evidencias. Se vuelven a comprobar los diffs y la conservación de originales. El siguiente commit completará el merge local en `integracion/juan-pr10`; por eso requiere autorización expresa. No modifica main por sí mismo. Push y posterior integración en main requieren sus autorizaciones correspondientes.
