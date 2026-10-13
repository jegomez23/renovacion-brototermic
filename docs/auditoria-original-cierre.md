# Código original y cierre: revisión pendiente del ZIP

Fecha: 2026-10-13. Rama `integracion/juan-pr10`. **Informe provisional: falta la ruta del ZIP proporcionado por la empresa, solicitada al responsable. No se ha inspeccionado ese archivo ni se declara completa la auditoría del original.**

## Trabajo protegido

Se han leído AGENTS.md y los informes de estado, integración y bloques funcionales. Git conserva HEAD/main `a65c984` y MERGE_HEAD/Juan `ada1d14`. Al inicio de esta continuación había 96 archivos preparados, 12 archivos con modificaciones adicionales y 75 archivos nuevos. Se copiaron el diff binario del índice, el diff de trabajo y todos los archivos nuevos fuera del repositorio, en `/private/tmp/brototermic-cierre-final/`.

No se ejecutaron reset, clean, cambios de rama, commit, push ni publicación. La preparación del índice para revisión no completa el merge pendiente.

## Matriz provisional

Esta matriz usa **solo `/legacy` y el código renovado**. La columna ORIGINAL no certifica el contenido del ZIP pendiente; debe contrastarse y ampliarse cuando se facilite su ruta.

| ORIGINAL: evidencia en /legacy; ZIP pendiente | RENOVADO | DIFERENCIA | PRIORIDAD | ACCIÓN RECOMENDADA |
|---|---|---|---|---|
| 499 archivos: 56 HTML, 38 CSS, 30 JS, 12 PDF, 350 imágenes raster y 13 recursos restantes | 55 HTML generados, una CSS y JS propio; recursos históricos conservados según el inventario | El número de archivos cambia por unificación y retirada de dependencias; no demuestra por sí solo una pérdida | Alta | Inventariar todas las entradas del ZIP, hashes y rutas; comparar con /legacy y el inventario de URLs. |
| URLs históricas y duplicados recogidos en `docs/inventario-urls.csv` | 52 canónicas más 404 y respuestas del formulario; redirecciones documentadas | Unificación aprobada D-011 y conservación de rutas | Alta | Contrastar posibles URLs presentes solo en el ZIP; no generar redirecciones sin evidencia. |
| Productos, referencias, especificaciones, imágenes y PDF de la copia pública | Auditor: 70 OK, 8 AVISO, 0 ERROR; 11/11 mutaciones detectadas | Sin errores de paridad detectados frente a /legacy; alcance del ZIP desconocido | Alta | Comparar fichas y fotografías exclusivas del ZIP antes de afirmar cobertura completa. |
| jQuery 3.2.0 y 1.7.1 en inicio; recursos de navegación y efectos antiguos | Menú disclosure, búsqueda, hero y efectos con JS vanilla | Sustitución técnica aprobada; 17 regresiones de interfaz correctas | Media | Mapear las funciones del JS incluido en el ZIP y comprobar si hay funciones comerciales adicionales. No restaurar librerías automáticamente. |
| Formulario HTML apunta a `contacto/bat/rd-mailform.php`; la copia /legacy no contiene PHP | `src/contacto/enviar.php`, validación, adjuntos, honeypot y limitador D-015; envío inactivo | No es posible auditar el backend original usando solo la copia pública | Alta | Leer PHP y configuración del ZIP sin ejecutarlos ni publicar secretos. Confirmar versión y módulos del hosting. |
| Google Maps y reCAPTCHA referenciados en contacto | Enlaces para llegar, teléfonos, email y formulario propio | Eliminación aprobada de servicios de terceros | Media | Confirmar con el cliente ubicación, actividad de Oviedo, horarios y necesidades reales. |
| Datos corporativos y textos legales históricos | Borradores y siete marcas de revisión legal; dos datos externos pendientes | Cambios aprobados y dudas expresas; no constituyen aprobación legal o comercial | Alta | Contrastar versiones del ZIP; mantener la revisión del cliente y los datos externos identificados. |
| Recursos originales no incluidos en la descarga pública: desconocidos | No se inventan equivalencias | No se puede descartar que falten documentos o funciones exclusivos del ZIP | Alta | Completar la inspección de todo el archivo antes del cierre definitivo para Juan. |

Inventario de `/legacy`: 311 JPG, 18 PNG, 18 GIF y 3 ICO; los otros 13 recursos son fuentes, dos SVG y un XML. Es un recuento de archivos, no de productos únicos.

## Leyendas de los seis ambientes

Se sustituye el texto repetitivo por **«Ambiente industrial ilustrativo, generado con IA.»** en el parcial compartido. Se conservan los alts descriptivos del manifiesto, que identifican talleres o instalaciones genéricas. La fotografía real de Oviedo permanece separada en su cabecera. No cambian imágenes, diseño, efectos ni decisiones D-014 a D-019.

Las seis páginas generadas contienen la leyenda, variantes y dimensiones esperadas. Se actualizan las capturas posteriores y la evidencia de comprobación de ambientes.

## LCP del inicio: análisis de la evidencia existente

No se repite Lighthouse. Se lee el informe final conservado: Chrome 155, Lighthouse 13.5, rendimiento 95, accesibilidad 100, CLS 0, LCP simulado 2,777 s. La copia anterior daba 2,778 s.

- El elemento LCP es la imagen `slide-1.webp` del hero, de 21.826 bytes transferidos en esa medición.
- Se descubre en el HTML inicial, lleva `fetchpriority="high"` y no tiene carga diferida. No hay un fallo de descubrimiento demostrado que justifique añadir otro preload.
- La CSS transfería 69.987 bytes sin compresión y aparece como recurso bloqueante, con 751 ms estimados en ese diagnóstico. El HTML transfería 46.007 bytes y Lora 700, 21.214 bytes.
- El tiempo LCP simulado no debe confundirse con las duraciones locales sin throttling del desglose. Estos datos no prueban que una única modificación vaya a alcanzar 2,5 s.
- `src/.htaccess` ya contiene compresión DEFLATE condicionada a `mod_deflate` y `mod_filter`, además de caché. El servidor estático usado para las mediciones no aplica Apache.

Acción prioritaria: verificar las cabeceras y compresión del hosting de demostración y medir allí. No se añade otro minificador, no se altera el hero aprobado y no se desactivan efectos sin una mejora medida. **El objetivo de LCP del inicio continúa pendiente.**

## Avisos y validación de esta continuación

Los 61 avisos de compilación corresponden a 51 borradores, envío inactivo, siete revisiones legales y dos datos externos. Los ocho avisos del auditor SEO son distintos: seis keywords pendientes de GSC y dos URLs con catálogo vigente por confirmar. No se eliminan marcas para presentar una aprobación ficticia.

Tras cambiar la leyenda se ejecutaron:

- `npm run test`: correcto; paridad sin errores, 11 mutaciones detectadas, sitemap y lista blanca correctos.
- `npm run build:preview`: correcto, 55 HTML de demostración noindex.
- `npm run test:interfaz`: 17 comprobaciones correctas, con teclado y navegación sin JS.
- `npm run validar`: 55 HTML y CSS sin errores ni advertencias.
- Verificación visual: 35 combinaciones de siete páginas a 320/390/768/1280/1440 px, sin desbordes, imágenes rotas, errores JS ni terceros. Incluye las seis páginas con ambientes y contacto, además de pruebas de adjuntos.
- Conservación: 831 archivos de imágenes y /legacy comparados con main, sin diferencias. Se mantienen las comprobaciones SHA-256 de las 42 variantes ambientales.

Evidencias actualizadas en [la galería](imagenes-antes-despues/integracion/index.html) y los logs de `docs/imagenes-antes-despues/integracion/`. Las mediciones Lighthouse anteriores conservan su fecha: no se presentan como mediciones posteriores a la leyenda.

## Estado de entrega y bloqueos

Se preparan para revisión código, documentos, capturas y pruebas; quedan fuera de Git las copias temporales, los builds, perfiles de navegador y configuraciones reales. Los informes Lighthouse completos están comprimidos sin pérdida. Se conserva el trabajo de Juan y ambos bloques nuevos.

Preparación: **177 archivos en el índice**, incluidos los 96 originales de integración y los cambios posteriores; sin archivos modificados fuera del índice ni nuevos sin preparar. La comprobación de espacios detectó una línea vacía con espacios en el log de pruebas: se normalizó solo ese espacio final, manteniendo el log original fuera del repositorio. `git diff --check` y `git diff --cached --check` deben quedar sin mensajes antes de entregar. El escaneo básico de secretos, incluidos los JSON comprimidos, no encontró coincidencias.

**La fase de auditoría del ZIP permanece bloqueada por información pendiente del responsable.** Facilitar la ruta local permitirá completar inventario, comparación integral y matriz definitiva. No procede declarar el cierre final ni pedir aprobación de un commit como entrega terminada antes de resolver esta dependencia.

Pendientes del cliente: hosting y dominios, destinatario y prueba real del formulario, borradores y legales, catálogos vigentes, datos de sedes, certificaciones y keywords GSC. Pendientes técnicos: Apache/Docker, LCP en hosting y CI remoto. No se hace commit ni push sin aprobación expresa.
