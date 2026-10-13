# La web nueva de BROTOTERMIC, en cifras

> Para la presentación al cliente del 2026-10-13. Todas las cifras están medidas el 2026-10-12 y se pueden repetir con las herramientas del proyecto (`npm run test`, `npm run validar`, Lighthouse). La comparación visual está en [antes-despues.png](antes-despues.png).

## Lo que no se pierde (posicionamiento en Google)

| | |
|---|---|
| **Páginas** | **52 páginas**: las **48 de la web actual** (47 del .com y la de Asturias, /oviedo/) con **la misma dirección** (URL), más 4 páginas de familia nuevas. |
| **Direcciones conservadas** | **Ninguna dirección indexada se pierde.** Las 77 direcciones conocidas de la web actual (páginas, PDF y duplicados) siguen respondiendo o redirigen con un **301** (redirección permanente: Google pasa el posicionamiento a la nueva). |
| **Catálogos PDF e imágenes** | Los 8 catálogos PDF y las más de 300 imágenes de la web actual siguen en **la misma dirección**, aunque algunas ya no se muestren. |
| **Contenido** | Se conservan **los 266 productos** con sus textos y datos técnicos **idénticos**. Un auditor automático compara la web nueva con la actual página a página: **70 páginas correctas, 0 errores** (8 avisos que dependen de datos del cliente). El auditor se pone a prueba a sí mismo estropeando páginas a propósito: detecta **11 de 11** fallos. |
| **Unificación del .es** | `brototermic.es` deja de competir con el `.com`: sus direcciones conocidas redirigen (301) a la página equivalente del `.com`, y la delegación de Asturias tiene su propia página, `/oviedo/`. |

## Lo que mejora

| | Web actual | Web nueva |
|---|---|---|
| **Móvil** | No se adapta (diseño de escritorio de 1150 px) | Diseñada primero para el móvil, de 320 px en adelante, con botones fijos **Llamar** y **Pedir presupuesto** |
| **Lighthouse móvil: rendimiento** (inicio · categoría · contacto) | 78 · 94 · **30** | Pendiente de medir en PageSpeed (servidores de Google) |
| **Estabilidad visual (CLS)** | — | **0** en las tres páginas |
| **Lighthouse móvil: accesibilidad** | 72 · 92 · 77 | **100 · 100 · 100** |
| **Lighthouse móvil: buenas prácticas** | 71 · 71 · 86 | **100 · 100 · 100** |
| **Lighthouse móvil: SEO** | 82 · 100 · 91 | **100 · 100 · 100** |
| **Peso de la página** (inicio · contacto) | 673 KB · 1,7 MB | 267 KB · 215 KB |
| **Código** | jQuery en dos versiones, errores de validación | HTML, CSS y JS propios; **55 páginas sin un solo error** en el validador oficial del W3C |
| **Pedir presupuesto** | Formulario sin adjuntos | Formulario con **adjunto** (plano, foto, PDF, DWG, DXF) y el producto ya rellenado desde su ficha |
| **Buscar un producto** | Navegando por menús | **Buscador** en el inicio y en el menú («termopar», «cartucho», «flotador»…) |

La web actual se midió en producción (`brototermic.com`). El rendimiento de la nueva se mide en PageSpeed Insights sobre la versión de demostración, porque las mediciones en el equipo local variaban con su carga; se repetirá en producción el día de publicar.

## Seguridad y privacidad

- **Formulario:** valida todos los datos en el servidor, filtra el spam sin captchas de terceros, exige aceptar la privacidad, comprueba que el adjunto es de verdad un PDF, una imagen o un plano, y no guarda nada en el servidor.
- **Servidor:** el archivo de configuración (`.htaccess`) se ha probado en un Apache real: **1.336 peticiones correctas, 0 incorrectas**. Incluye cabeceras de seguridad modernas y bloquea archivos ocultos y copias de seguridad.
- **Sin servicios de terceros:** ni Google Fonts, ni mapas incrustados, ni analítica. La web **no instala cookies**, así que no necesita banner de cookies.
- **Solo se publica lo necesario:** una lista blanca impide subir al servidor nada que no sea la web.

## Veracidad

- Ninguna especificación técnica, certificación, plazo o afirmación comercial inventada: cada dato sale de la web actual o de los catálogos PDF, y una herramienta lo comprueba frase a frase.
- Las fotos de producto son las originales. Ninguna se ha retocado con IA.
- **Excepción de la demostración:** la imagen grande del inicio es **una ilustración** preparada para esta versión de demostración. En la web definitiva irá una foto real.
