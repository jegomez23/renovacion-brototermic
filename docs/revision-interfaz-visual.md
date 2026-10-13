# Revisión de interfaz del bloque visual

Fuente consultada el 2026-10-13: [Web Interface Guidelines](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md). Se revisan los archivos del bloque independiente, respetando las reglas de AGENTS.md y la excepción del envío inactivo.

## src/partials/formulario.html

src/partials/formulario.html:22 - corregido: email con inputmode y spellcheck desactivado.
src/partials/formulario.html:27 - corregido: teclado de teléfono con inputmode.
src/partials/formulario.html:37 - correcto: label asociado; selector nativo siempre visible.
src/partials/formulario.html:42 - correcto: nombre seleccionado anunciado con aria-live y aria-atomic.
src/partials/formulario.html:44 - correcto: error inline asociado al input y anunciado.
src/partials/formulario.html:57 - excepción de proyecto: envío desactivado hasta configurar el hosting, según AGENTS.md §2. No se habilita por una recomendación genérica de interfaz.

## assets/js/formulario.js

assets/js/formulario.js:67 - correcto: el selector nativo ofrece alternativa al arrastre.
assets/js/formulario.js:118 - correcto: rechazo del lote completo, sin conservar un archivo anterior inadvertidamente.
assets/js/formulario.js:145 - correcto: validación inline y foco al primer campo con error.

## src/templates/servicio.html

src/templates/servicio.html:10 - correcto: un H1, texto sobre fondo blanco.
src/templates/servicio.html:12 - correcto: enlaces nativos con texto; SVG decorativo oculto a tecnología asistiva.
src/templates/servicio.html:17 - correcto: fuentes WebP/JPG según resolución; dimensiones reales y proporción constante.
src/templates/servicio.html:20 - corregido: imagen de primera pantalla con fetchpriority alto y dimensiones explícitas.

## src/partials/iconos-industriales.html

src/partials/iconos-industriales.html:1 - correcto: sprite inline oculto a tecnología asistiva y sin foco; símbolos propios, sin logos inventados.

## assets/css/style.css

assets/css/style.css:1050 - correcto: adjunto con focus-within, contraste y control nativo de al menos 44 px.
assets/css/style.css:1094 - correcto: cabecera con Grid, texto equilibrado y acciones que se apilan en móvil.
assets/css/style.css:1101 - correcto: filas de especificaciones alternas; números tabulares y textos largos ajustables.

## Evidencia ejecutada

- 24 combinaciones por fase a 320/390/768/1280 px; cero desbordes, errores JS, imágenes rotas o terceros.
- Ocho escenarios de adjunto y comprobación sin JS en [JSON de Chrome](imagenes-antes-despues/plantillas/despues-resultados.json).
- [Capturas antes/después](imagenes-antes-despues/index.html), W3C y [Lighthouse local](imagenes-antes-despues/lighthouse/resumen.json).
- Lighthouse automatizado no sustituye una revisión completa con lector de pantalla. Los cambios de familia/categoría de Juan y su menú definitivo quedan fuera de este bloque.
