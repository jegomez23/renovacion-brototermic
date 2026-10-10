# Auditoría de paridad SEO

> Generado por `node tools/auditoria-seo.js` (modo **publicacion**). **No se edita a mano.** Compara cada URL de /legacy con su equivalente en /dist: que exista (o tenga un 301 válido **en el .htaccess real**), que conserve title, H1, productos, imágenes, PDF, enlaces internos y el texto (cobertura ≥ 95 %), que los **datos técnicos** (cifras, unidades, rangos, modelos) sean idénticos producto a producto, y que tenga canonical, JSON-LD y presencia en sitemap.xml. Antes de auditar, `tools/test-auditor.js` comprueba que el auditor detecta las mutaciones conocidas.

**Resultado:** 70 OK · 8 AVISO · 0 ERROR (78 filas: las URLs del inventario y las reglas generales del .htaccess).

## Páginas generadas

| URL | Estado | Contenido antiguo | Title | Meta | H1 | Productos | Datos técnicos | Imágenes | PDF | Enlaces | Texto | Canonical | JSON-LD | Sitemap |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `/` | ⚠️ AVISO | 235 pal. | ⚠️ 56 car. | 154 car. | ⚠️ sin la keyword (el H1 antiguo tampoco la tenía) | 0/0 | 4 datos | 5/5 | 2/2 | 47/47 | 100.0 % | OK | OK | OK |
| `/contacto/contacto.html` | ⚠️ AVISO | 80 pal. | ⚠️ 56 car. | 154 car. | OK | 0/0 | 6 datos | 0/0 | 0/0 | 3/3 | 100.0 % | OK | OK | OK |
| `/controldenivel-interruptores-magneticos.html` | ✅ OK | 1032 pal. | 46 car. | 153 car. | OK | 13/13 | 246 datos | 13/13 | 0/0 | 44/44 | 100.0 % | OK | OK | OK |
| `/controldenivel-niveles-de-flotador.html` | ✅ OK | 321 pal. | 52 car. | 146 car. | OK | 6/6 | 61 datos | 6/6 | 0/0 | 44/44 | 100.0 % | OK | OK | OK |
| `/controldenivel-niveles-rotativos.html` | ✅ OK | 186 pal. | 39 car. | 152 car. | OK | 2/2 | 34 datos | 2/2 | 0/0 | 44/44 | 100.0 % | OK | OK | OK |
| `/controldenivel-reles-de-nivel.html` | ✅ OK | 392 pal. | 36 car. | 149 car. | OK | 9/9 | 72 datos | 9/9 | 0/0 | 44/44 | 100.0 % | OK | OK | OK |
| `/controldenivel-sensores-capacitivos.html` | ✅ OK | 251 pal. | 42 car. | 149 car. | OK | 3/3 | 59 datos | 3/3 | 0/0 | 44/44 | 100.0 % | OK | OK | OK |
| `/controldenivel-sensores-conductivos.html` | ✅ OK | 448 pal. | 42 car. | 148 car. | OK | 7/7 | 69 datos | 7/7 | 0/0 | 44/44 | 100.0 % | OK | OK | OK |
| `/controldenivel-sensores-de-presion.html` | ✅ OK | 196 pal. | 51 car. | 151 car. | OK | 3/3 | 37 datos | 3/3 | 0/0 | 44/44 | 100.0 % | OK | OK | OK |
| `/controldenivel-sensores-de-ultrasonidos.html` | ✅ OK | 85 pal. | 46 car. | 152 car. | OK | 1/1 | 11 datos | 1/1 | 0/0 | 44/44 | 100.0 % | OK | OK | OK |
| `/controldenivel-transductores-magneticos.html` | ⚠️ AVISO | 223 pal. | ⚠️ 46 car. | 149 car. | OK | 2/2 | 49 datos | 2/2 | 0/0 | 44/44 | 100.0 % | OK | OK | OK |
| `/controltemperatura-accesorios-sondas.html` | ⚠️ AVISO | 434 pal. | ⚠️ 51 car. | 146 car. | OK | 8/8 | 31 datos | 8/8 | 0/0 | 44/44 | 100.0 % | OK | OK | OK |
| `/controltemperatura-cables-compensacion.html` | ✅ OK | 136 pal. | 52 car. | 141 car. | OK | 3/3 | 10 datos | 3/3 | 0/0 | 44/44 | 100.0 % | OK | OK | OK |
| `/controltemperatura-convertidores.html` | ✅ OK | 440 pal. | 52 car. | 143 car. | OK | 6/6 | 90 datos | 6/6 | 0/0 | 44/44 | 100.0 % | OK | OK | OK |
| `/controltemperatura-dataloggers.html` | ✅ OK | 305 pal. | 33 car. | 154 car. | OK | 5/5 | 40 datos | 5/5 | 0/0 | 44/44 | 100.0 % | OK | OK | OK |
| `/controltemperatura-equipos-de-medicion.html` | ✅ OK | 186 pal. | 41 car. | 154 car. | OK | 2/2 | 30 datos | 2/2 | 0/0 | 44/44 | 100.0 % | OK | OK | OK |
| `/controltemperatura-indicadores-de-procesos.html` | ✅ OK | 1289 pal. | 60 car. | 151 car. | OK | 17/17 | 278 datos | 17/18 (+1 just.) | 1/1 | 44/44 | 100.0 % | OK | OK | OK |
| `/controltemperatura-panelespc-software.html` | ✅ OK | 201 pal. | 43 car. | 152 car. | OK | 2/2 | 13 datos | 2/2 | 0/0 | 44/44 | 100.0 % | OK | OK | OK |
| `/controltemperatura-reles-estado-solido.html` | ✅ OK | 425 pal. | 41 car. | 145 car. | OK | 4/4 | 27 datos | 4/4 | 0/0 | 44/44 | 100.0 % | OK | OK | OK |
| `/controltemperatura-sensores-infrarrojos.html` | ✅ OK | 448 pal. | 58 car. | 146 car. | OK | 7/7 | 64 datos | 7/7 | 0/0 | 44/44 | 100.0 % | OK | OK | OK |
| `/controltemperatura-sondastemperatura.html` | ✅ OK | 860 pal. | 43 car. | 155 car. | OK | 11/11 | 62 datos | 11/12 (+1 just.) | 2/2 | 44/44 | 100.0 % | OK | OK | OK |
| `/controltemperatura-termometros.html` | ✅ OK | 350 pal. | 33 car. | 147 car. | OK | 8/8 | 51 datos | 8/8 | 0/0 | 44/44 | 100.0 % | OK | OK | OK |
| `/controltemperatura-termostatos.html` | ✅ OK | 975 pal. | 33 car. | 153 car. | OK | 16/16 | 135 datos | 16/16 | 0/0 | 44/44 | 100.0 % | OK | OK | OK |
| `/controltemperatura-videoregistradores.html` | ✅ OK | 153 pal. | 41 car. | 149 car. | OK | 2/2 | 34 datos | 2/2 | 0/0 | 44/44 | 100.0 % | OK | OK | OK |
| `/cookies.html` | ✅ OK | 194 pal. | 33 car. | 146 car. | OK | 0/0 | 0 datos | 0/0 | 0/0 | 44/44 | 100.0 % | OK | OK | OK |
| `/empresa.html` | ⚠️ AVISO | 449 pal. | ⚠️ 54 car. | 150 car. | ⚠️ sin la keyword (el H1 antiguo tampoco la tenía) | 0/0 | 2 datos | 1/1 | 2/2 | 46/46 | 100.0 % | OK | OK | OK |
| `/equipos-perifericos.html` | ✅ OK | 656 pal. | 53 car. | 151 car. | OK | 9/9 | 43 datos | 9/9 | 0/0 | 44/44 | 100.0 % | OK | OK | OK |
| `/equiposderefrigeracion-refrigeradores-chillers.html` | ✅ OK | 483 pal. | 52 car. | 142 car. | OK | 3/3 | 37 datos | 3/3 | 0/0 | 44/44 | 100.0 % | OK | OK | OK |
| `/fabricaciones-a-medida.html` | ✅ OK | 189 pal. | 49 car. | 153 car. | OK | 0/0 | 1 datos | 5/5 | 0/0 | 45/45 | 100.0 % | OK | OK | OK |
| `/hornos-industriales.html` | ✅ OK | 305 pal. | 59 car. | 141 car. | OK | 3/3 | 21 datos | 3/3 | 0/0 | 44/44 | 100.0 % | OK | OK | OK |
| `/mapa-web.html` | ✅ OK | 101 pal. | 30 car. | 150 car. | OK | 0/0 | 1 datos | 0/0 | 0/0 | 44/44 | 100.0 % | OK | OK | OK |
| `/nuevos-productos.html` | ✅ OK | 328 pal. | 42 car. | 154 car. | OK | 0/0 | 30 datos | 4/4 | 2/2 | 45/45 | 100.0 % | OK | OK | OK |
| `/oviedo/` | ⚠️ AVISO | 256 pal. | ⚠️ 59 car. | 145 car. | ⚠️ sin la keyword (el H1 antiguo tampoco la tenía) | 0/0 | 3 datos | 2/12 (+10 just.) | 2/2 | 6/6 | 100.0 % | OK | OK | OK |
| `/presionhumedad-sensores-de-presion.html` | ✅ OK | 387 pal. | 54 car. | 151 car. | OK | 7/7 | 94 datos | 7/7 | 0/0 | 44/44 | 100.0 % | OK | OK | OK |
| `/presionhumedad-sondas-de-humedad.html` | ✅ OK | 590 pal. | 51 car. | 152 car. | OK | 8/8 | 105 datos | 8/8 | 0/0 | 44/44 | 100.0 % | OK | OK | OK |
| `/privacidad.html` | ✅ OK | 3739 pal. | 36 car. | 154 car. | OK | 0/0 | 34 datos | 0/0 | 0/0 | 44/44 | 100.0 % | OK | OK | OK |
| `/resistencias-atex.html` | ✅ OK | 604 pal. | 39 car. | 152 car. | OK | 7/7 | 71 datos | 7/7 | 0/0 | 44/44 | 100.0 % | OK | OK | OK |
| `/resistencias-calefaccion-industrial.html` | ✅ OK | 476 pal. | 57 car. | 148 car. | OK | 7/7 | 54 datos | 7/7 | 0/0 | 44/44 | 100.0 % | OK | OK | OK |
| `/resistencias-calentamientoaire.html` | ✅ OK | 608 pal. | 56 car. | 149 car. | OK | 14/14 | 63 datos | 14/14 | 0/0 | 44/44 | 100.0 % | OK | OK | OK |
| `/resistencias-especiales-a-medida.html` | ✅ OK | 453 pal. | 59 car. | 147 car. | OK | 0/0 | 27 datos | 2/2 | 0/0 | 44/44 | 100.0 % | OK | OK | OK |
| `/resistencias-flexibles.html` | ✅ OK | 876 pal. | 58 car. | 152 car. | OK | 15/15 | 82 datos | 15/15 | 0/0 | 44/44 | 100.0 % | OK | OK | OK |
| `/resistencias-infrarrojos.html` | ✅ OK | 1059 pal. | 46 car. | 154 car. | OK | 17/17 | 61 datos | 17/17 | 0/0 | 44/44 | 100.0 % | OK | OK | OK |
| `/resistencias-inmersion.html` | ✅ OK | 530 pal. | 41 car. | 147 car. | OK | 14/14 | 25 datos | 14/14 | 0/0 | 44/44 | 100.0 % | OK | OK | OK |
| `/resistencias-mantas-calefactoras.html` | ✅ OK | 517 pal. | 41 car. | 154 car. | OK | 7/7 | 87 datos | 7/7 | 0/0 | 44/44 | 100.0 % | OK | OK | OK |
| `/resistencias-planas.html` | ✅ OK | 115 pal. | 52 car. | 149 car. | OK | 2/2 | 5 datos | 2/2 | 0/0 | 44/44 | 100.0 % | OK | OK | OK |
| `/resistencias-tipo-abrazadera.html` | ✅ OK | 352 pal. | 50 car. | 152 car. | OK | 7/7 | 22 datos | 7/7 | 0/0 | 44/44 | 100.0 % | OK | OK | OK |
| `/resistencias-tipo-cartucho.html` | ✅ OK | 564 pal. | 48 car. | 153 car. | OK | 5/5 | 49 datos | 5/6 (+1 just.) | 1/1 | 44/44 | 100.0 % | OK | OK | OK |
| `/ventilacion.html` | ✅ OK | 215 pal. | 48 car. | 150 car. | OK | 4/4 | 16 datos | 4/4 | 0/0 | 44/44 | 100.0 % | OK | OK | OK |

## Resto de URLs del inventario (familias nuevas, redirecciones y archivos)

| URL | Tipo | Estado | Comprobación |
|---|---|---|---|
| `/contacto.html` | redirección | ✅ OK | 301 → https://brototermic.com/contacto/contacto.html · .htaccess OK |
| `/index.html` | redirección | ✅ OK | 301 → https://brototermic.com/ · .htaccess OK |
| `/oviedo/contacto/contacto.html` | redirección | ✅ OK | 301 → https://brototermic.com/oviedo/ · .htaccess OK |
| `/oviedo/index.html` | redirección | ✅ OK | 301 → https://brototermic.com/oviedo/ · .htaccess OK |
| `/oviedo/politica-de-cookies-brototermic-oviedo.html` | redirección | ✅ OK | 301 → https://brototermic.com/cookies.html · .htaccess OK |
| `/oviedo/politica-de-privacidad-brototermic-oviedo.html` | redirección | ✅ OK | 301 → https://brototermic.com/privacidad.html · .htaccess OK |
| `/docs/Acabados-resistencias-cartucho.pdf` | archivo | ✅ OK | existe |
| `/docs/DISPLAYS DIGITALES PROGRAMABLES BROTOTERMIC HR.pdf` | archivo | ✅ OK | existe |
| `/docs/catalogo-Brototermic-resistencias.pdf` | archivo | ✅ OK | existe |
| `/docs/catalogo-instrumentacion.pdf` | archivo | ✅ OK | existe |
| `/docs/catalogo_cañas_pirometricas_broto-03-02-2015.pdf` | archivo | ✅ OK | existe |
| `/docs/catalogo_termopares_broto-03-02-2015.pdf` | archivo | ✅ OK | existe |
| `/docs/disibeint.IoT.pdf` | archivo | ✅ OK | existe |
| `/docs/ejemplo-de-aplicacion-iot-didieint.pdf` | archivo | ✅ OK | existe |
| `/oviedo/docs/catalogo-instrumentacion.pdf` | redirección | ✅ OK | 301 → https://brototermic.com/docs/catalogo-instrumentacion.pdf · .htaccess OK |
| `/oviedo/docs/catalogo-resistencias-calefactoras.pdf` | redirección | ⚠️ AVISO | 301 → https://brototermic.com/docs/catalogo-Brototermic-resistencias.pdf · .htaccess OK |
| `/resistencias-electricas.html` | familia (nueva) | ✅ OK | existe · intro OK |
| `/controltemperatura.html` | familia (nueva) | ✅ OK | existe · intro OK |
| `/controldenivel.html` | familia (nueva) | ✅ OK | existe · intro OK |
| `/presionhumedad.html` | familia (nueva) | ✅ OK | existe · intro OK |
| `/sitemap.xml` | archivo | ✅ OK | existe |
| `/robots.txt` | archivo | ✅ OK | existe |
| `.es /` | redirección | ✅ OK | 301 → https://brototermic.com/oviedo/ · .htaccess OK |
| `.es /contacto/contacto.html` | redirección | ✅ OK | 301 → https://brototermic.com/oviedo/ · .htaccess OK |
| `.es /index.html` | redirección | ✅ OK | 301 → https://brototermic.com/oviedo/ · .htaccess OK |
| `.es /politica-de-cookies-brototermic-oviedo.html` | redirección | ✅ OK | 301 → https://brototermic.com/cookies.html · .htaccess OK |
| `.es /politica-de-privacidad-brototermic-oviedo.html` | redirección | ✅ OK | 301 → https://brototermic.com/privacidad.html · .htaccess OK |
| `.es /docs/catalogo-instrumentacion.pdf` | redirección | ✅ OK | 301 → https://brototermic.com/docs/catalogo-instrumentacion.pdf · .htaccess OK |
| `.es /docs/catalogo-resistencias-calefactoras.pdf` | redirección | ⚠️ AVISO | 301 → https://brototermic.com/docs/catalogo-Brototermic-resistencias.pdf · .htaccess OK |
| `.htaccess (reglas generales)` | redirección | ✅ OK | 20/20 casos |

## Detalles

### `/` — AVISO

- Keyword [POR VERIFICAR GSC]: «componentes industriales e instrumentación [POR VERIFICAR GSC]».

### `/contacto/contacto.html` — AVISO

- Keyword [POR VERIFICAR GSC]: «componentes industriales Vitoria [POR VERIFICAR GSC]».

### `/controldenivel-transductores-magneticos.html` — AVISO

- Keyword [POR VERIFICAR GSC]: «transductores magnéticos [POR VERIFICAR GSC]».

### `/controltemperatura-accesorios-sondas.html` — AVISO

- Keyword [POR VERIFICAR GSC]: «accesorios para sondas [POR VERIFICAR GSC]».

### `/controltemperatura-indicadores-de-procesos.html` — OK

- Imagen eliminada (justificada): /images/Pdf_icon.png — Se sustituye por un icono SVG en la plantilla (Persona A).

### `/controltemperatura-sondastemperatura.html` — OK

- Imagen eliminada (justificada): /images/Pdf_icon.png — Se sustituye por un icono SVG en la plantilla (Persona A).

### `/empresa.html` — AVISO

- Keyword [POR VERIFICAR GSC]: «empresa BROTOTERMIC [POR VERIFICAR GSC]».

### `/oviedo/` — AVISO

- Keyword [POR VERIFICAR GSC]: «componentes industriales Oviedo [POR VERIFICAR GSC]».
- Imagen eliminada (justificada): /oviedo/images/instrumentacion-brototermic-oviedo.jpg — Miniatura de 136x136 de la portada del .es; la landing nueva no la usa.
- Imagen eliminada (justificada): /oviedo/images/resistencias1-brototermic-oviedo.jpg — Miniatura de 136x136 de la portada del .es; la landing nueva no la usa.
- Imagen eliminada (justificada): /oviedo/images/productos-a-medida-brototermic-oviedo.jpg — Miniatura de 136x136 de la portada del .es; la landing nueva no la usa.
- Imagen eliminada (justificada): /oviedo/images/mercado-aplicacion-brototermic-oviedo.jpg — Miniatura de 136x136 de la portada del .es; la landing nueva no la usa.
- Imagen eliminada (justificada): /oviedo/images/electticfor-brototermic-oviedo.jpg — Logo de marca en JPG (370x290). Se sustituye por el SVG oficial en el bloque de marcas; guardar como respaldo si no llegan los SVG.
- Imagen eliminada (justificada): /oviedo/images/mesel-brototermic-oviedo.jpg — Logo de marca en JPG (370x290). Se sustituye por el SVG oficial en el bloque de marcas; guardar como respaldo si no llegan los SVG.
- Imagen eliminada (justificada): /oviedo/images/disibent-brototermic-oviedo.jpg — Logo de marca en JPG (370x290). Se sustituye por el SVG oficial en el bloque de marcas; guardar como respaldo si no llegan los SVG.
- Imagen eliminada (justificada): /oviedo/images/sanara-brototermic-oviedo.jpg — Logo de marca en JPG (370x290). Se sustituye por el SVG oficial en el bloque de marcas; guardar como respaldo si no llegan los SVG.
- Imagen eliminada (justificada): /oviedo/images/Ebm-Papst-brototermic-oviedo.jpg — Logo de marca en JPG (370x290). Se sustituye por el SVG oficial en el bloque de marcas; guardar como respaldo si no llegan los SVG.
- Imagen eliminada (justificada): /oviedo/images/eliwell-Papst-brototermic-oviedo.jpg — Logo de marca en JPG (370x290). Se sustituye por el SVG oficial en el bloque de marcas; guardar como respaldo si no llegan los SVG.

### `/resistencias-tipo-cartucho.html` — OK

- Imagen eliminada (justificada): /images/Pdf_icon.png — Se sustituye por un icono SVG en la plantilla (Persona A).

### `/oviedo/docs/catalogo-resistencias-calefactoras.pdf` — AVISO

- Destino pendiente de confirmar: Catálogo equivalente [POR VERIFICAR con el cliente cuál es el vigente: el de /oviedo/ es de 2024 y el de /docs/ de 2021; no son idénticos].

### `.es /docs/catalogo-resistencias-calefactoras.pdf` — AVISO

- Destino pendiente de confirmar: Unificación de dominios [POR VERIFICAR catálogo vigente, ver fila de /oviedo/docs/].

