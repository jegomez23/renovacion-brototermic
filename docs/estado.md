# Estado del proyecto (en 1 minuto)

> Última actualización: **2026-10-12 (noche)** · `main` en `bbdbe79` (PR #1-#9 de la Persona B) · Rama **`revision/complemento-b`** con la PR hacia `main` pendiente de revisión (plan de [revision-sesion-b.md](revision-sesion-b.md)) · Etiqueta **`v0.9-preproduccion`** (punto de vuelta atrás).
> Las reglas están en [AGENTS.md](../AGENTS.md); el detalle de cada hallazgo, en [auditoria-final.md](auditoria-final.md) (IDs C-, A-, M-, B-) y en [revision-sesion-b.md](revision-sesion-b.md) (IDs R-). Actualiza este documento cada vez que cambie algo de lo que dice.

## Qué está hecho

| | |
|---|---|
| **Páginas** | Las **52 del plan** (inicio, 4 familias, 39 categorías, empresa, fabricación a medida, nuevos productos, contacto, `/oviedo/`, privacidad, cookies y mapa web), más `404.html` y las 2 respuestas del formulario (`gracias`, `error`): **55 HTML**, con las mismas URLs que la web actual. |
| **Auditor de paridad SEO** (/legacy ↔ /dist) | **70 OK · 8 AVISO · 0 ERROR** en modo publicación (77 URLs del inventario + reglas generales del `.htaccess`, 24 casos). Los 8 avisos dependen del cliente: 6 keywords sin verificar en Search Console y el catálogo vigente (2 URLs). |
| **Pruebas del auditor** | **11/11 mutaciones detectadas**: borrar un producto, una frase o un PDF; cambiar un número, una unidad, un modelo o la ruta de una imagen; inventar un dato en la intro; quitar una redirección; página antigua ilegible; y, desde el 2026-10-12, **quitar la exención del 404 propio**. |
| **Paridad comprobada de forma independiente** (2026-10-12) | 0 diferencias de `v0.9` a `main` en URLs, imágenes, PDF, title, meta, H1, canonical, JSON-LD, sitemap y redirecciones (640 casos del `.htaccess`); 0 enlaces rotos en 6.703; 0 fotos de producto alteradas (284 comparadas byte a byte). |
| **W3C** (validador Nu) | **55/55 páginas y la hoja CSS sin errores ni advertencias**. |
| **Lighthouse móvil** | Inicio **95** (mediana de 3, 2026-10-12, con el equipo libre; LCP 2,5 s; 426 KiB: las tarjetas cargan banners de 910 px, se corrigen en el paso 4 del plan). El resto se midió el 2026-10-10: familia 99, categoría 99, contacto 99 y `/oviedo/` 98. Accesibilidad 100. Repetir en producción. |
| **SEO técnico** | Canonical en las 52 páginas, sitemap con 60 URLs (52 + 8 PDF) todas con 200, `robots.txt`, 0 páginas huérfanas, JSON-LD en todas y 404 con `noindex`. |
| **Redirecciones** | 17 reglas 301 + 404 real del resto del `.es`, en `dist/.htaccess` y en el docroot propio del `.es` (`dist-es/.htaccess`), comprobadas con el simulador del auditor. La **PR #7** (fusionada) las probó en **Apache 2.4.62 nativo** (HTTP y HTTPS, cuatro hosts, `AllowOverride All` y `FileInfo`): 1.336 peticiones correctas. Corrigió un **500 en toda la web** con `FileInfo` (`mod_expires`). La prueba en Docker con dos docroots sigue pendiente. |
| **`.htaccess`, compatibilidad** | Sin `Options`, `DirectoryIndex`, `<If>`, `mod_expires` ni `[END]` (todo daba 500 en algún hosting): funciona con `AllowOverride FileInfo` y en Apache 2.2 o 2.4. |
| **Formulario** | `/contacto/enviar.php` probado en local (PHP 8.2 + capturador SMTP). Si falla el almacenamiento del límite por IP, el envío **se acepta** y se anota en el log (D-015). **Envío desactivado** (`envioActivo: false`) hasta tener el hosting. |
| **Seguridad** | Cabeceras (nosniff, Referrer-Policy, X-Frame-Options, Permissions-Policy, HSTS de 5 min y CSP en modo informe, con el hash del script en línea comprobado por `build.js`). Archivos ocultos y copias → 404. Solo se publica `/dist` y `/dist-es` (lista blanca). |
| **Proceso** | **CI en GitHub Actions** (`npm run test`, W3C, pruebas PHP del limitador e informe del auditor al día) y plantilla de PR. Falta que el responsable active la protección de `main`. LF en todo el repositorio: `npm run test` ya no deja archivos modificados. |

## Cómo ver la web

Con Node ≥ 18: `npm run dev` y abrir **http://localhost:8000/** (se reconstruye sola al guardar). Comprobaciones: `npm run test`. W3C: `npm run validar`. Detalle en el [README](../README.md).

`npm run build:publicacion` **falla hoy, y es lo correcto**: quedan 51 textos en borrador y el envío del formulario desactivado.

## Cómo revisar los borradores (C-01)

1. `node tools/revision-borradores.js` y abrir `tools/salida/revision-borradores.html` en el navegador (con `npm run dev` en marcha, el enlace de cada pieza abre su página).
2. Cada pieza muestra, frase a frase, el fragmento de /legacy o de los catálogos PDF más parecido, con su archivo:
   - **rojo:** sin origen claro, o con una palabra que no está en ningún sitio (subrayado rojo);
   - **ámbar:** origen parcial, palabras que no están en su página antigua (subrayado de puntos) o afirmaciones sensibles (stock, plazos, certificaciones, normas, años…);
   - **verde:** el resto.

   Hoy: 73 rojas, 298 ámbar y 287 verdes en 658 frases. La herramienta acerca la evidencia; **decide la persona**.
3. Corregir en `/data` o `/content` lo que haga falta (con `npm run dev` se ve al guardar), marcar «Aprobada» y, al final, «Exportar».
4. Guardar lo exportado en un archivo y ejecutar `node tools/aprobar-borradores.js aprobadas.txt --simular`. Si es correcto, repetir sin `--simular`. Después, `npm run test` y commit.

Las marcas se guardan en el navegador de cada persona: con el reparto, cada una exporta solo sus piezas.

## En curso: plan de revision-sesion-b.md (rama `revision/complemento-b`)

| Paso | Qué | Estado |
|---|---|---|
| 1 | Bloque 1: arreglar lo roto o arriesgado (`[L]`, limitador D-015, menú B-06, alts D-014, frases sin respaldo, LF, CI, documentación) | **Hecho** |
| 2 | Vista de los 51 borradores con el origen de cada frase en /legacy | **Hecho** (ver «Cómo revisar los borradores») |
| 3 | Conversión: barra fija «Llamar · Presupuesto», buscador en el inicio y bloque de sectores | **Hecho** (aprobado) |
| 4 | Imágenes del inicio: `slide-1.webp`, WebP de los banners, tarjetas de familia con recortes, foto de «Mercado y aplicación» y tarjeta «Resistencias» dentro de su marco | **Hecho** (`tools/imagenes.js`; imágenes del inicio 356 → 233 KB en escritorio, menos en móvil) |
| 5 | `docs/seo-mejoras.md` | **Pendiente** (aplazado por la presentación) |
| 6 | Alts de las páginas de prioridad alta, en una hoja para aprobar | **Pendiente** (aplazado por la presentación) |
| 7 | Hero y ritmo de secciones del inicio (D-018), CTA bajo el H1 de familias y categorías (R-14), versión de demostración (D-017) y material de presentación (`docs/presentacion/`); PR hacia `main` | **Hecho**. PR pendiente de la revisión de la Persona B |

El reparto de lo pendiente entre las dos personas es una **propuesta** (tablero del apartado 6 de revision-sesion-b.md) hasta que la Persona B lo confirme.

## Hoy (2026-10-12) en `revision/complemento-b`

Bloque 1 de la revisión (CI, `[L]`, limitador D-015, menú sin JS, alts D-014), vista de borradores, barra fija, buscador y sectores, imágenes del inicio, diseño en franjas (D-018), CTA bajo el H1 (R-14), hero rotativo y microinteracciones (D-019), versión de demostración (D-017) y material de la presentación. **La PR hacia `main` está pendiente de revisión por la Persona B: no se fusiona sin ella.**

**Interruptor de efectos:** `site.json → efectos` (`heroRotativo`, `aparicionScroll`). Si PageSpeed da menos de 90, se pone el efecto en `false` y se hace el build: sale del HTML, del CSS y del JS sin tocar código.

## Presentación al cliente (2026-10-13)

- **Demo:** `npm run build:preview` y subir `dist-preview` a Netlify Drop ([presentacion/demo.md](presentacion/demo.md)). Lleva noindex en todo y la franja «Versión de demostración». **Nunca va al hosting real** (D-017).
- **Material:** [presentacion/](presentacion/): `antes-despues.png` (y su HTML), `resumen.md` (cifras), `guion.md` (5 minutos) y `pendientes-cliente.md` (lo que necesitamos, sin tecnicismos).
- **Hero de la demo:** ilustración IA con la placa tapada, solo en la demo (D-016). En producción, `slide-1`.

## Lo pendiente para publicar, en resumen

- **Cliente:** accesos (hosting, Search Console y el `.es`), email de destino del formulario y catálogo de resistencias vigente (más el resto de [presentacion/pendientes-cliente.md](presentacion/pendientes-cliente.md)).
- **Equipo:** revisar los 51 borradores con `node tools/revision-borradores.js`; `docs/seo-mejoras.md`; medir en PageSpeed; los alts, después de publicar.

## Lo que bloquea la publicación

**Nosotros**
- **C-03:** instalar Docker y pasar `bash tools/probar-redirecciones.sh` (dos vhosts, como en producción); después, probar el `.htaccess` en el hosting real.
- **M-06:** activar la protección de `main` (responsable) y pasar la Prueba de resultados enriquecidos de Google en una página de cada plantilla.
- **El día de publicar** (publicacion.md): crear `config-formulario.php` (con `dir_limites`) fuera del docroot y activar `envioActivo` (C-02); comprobar SPF/DKIM/DMARC (B-13); subir HSTS y activar la CSP tras revisarlas (M-04).

**Persona B** (según el reparto propuesto)
- **C-04:** enviar al cliente el mensaje de [preguntas-cliente.md](preguntas-cliente.md) (no consta como enviado) y anotar la fecha. Añadir: qué foto es la del sensor PTC y cuál la del NTC (vienen cruzadas de /legacy) y si los certificados ATEX siguen la 94/9/CE.
- **C-01:** revisar los **51 borradores** (39 categorías, 4 intros de familia y 8 textos de `/content`), repartidos con la Persona A, con la vista del paso 2.
- **M-03:** unificar la dirección de la página de privacidad. **B-03:** cambios no listados del piloto. Retocar las 3 fotos del piloto (fondo e iluminación).

**Cliente**
- **C-02, C-03, C-04, A-03:** accesos FTP/SFTP del hosting, Search Console de los dos dominios y a qué carpeta apunta el `.es` (escenario A, B o C de publicacion.md §2.4, con su certificado HTTPS). Con el FTP se revisa el PHPMailer de `rd-mailform.php` (A-03).
- **C-02:** email de destino del formulario, tamaño máximo del adjunto y si se aceptan DWG/DXF.
- **M-03, M-09:** revisión legal de privacidad y cookies (transferencias internacionales, primera capa RGPD, textos [REVISIÓN CLIENTE]).
- **M-05:** restringir o rotar la clave de Google Maps (y decidir si el repositorio debe seguir siendo público).
- Datos: 1982 y la dirección de Vitoria, si la delegación de Oviedo sigue activa y su horario, catálogo de resistencias vigente, certificaciones ATEX, productos vigentes de «Nuevos productos», logos SVG y si quieren analítica.

## Para después de publicar (aplazado, no bloquea)

- Iconos SVG propios (franja de cifras, tarjetas de familia y sectores); cabecera de categoría a dos columnas con ficha rápida desde 1024 px; adjunto del formulario con estilo propio (bloque 3 de revision-sesion-b.md).
- `docs/seo-mejoras.md` y los alts de las páginas de prioridad media y baja (los de prioridad alta, antes de publicar si da tiempo).
- Retoque de fondo de las fotos que desentonan (lista del auditor B en revision-sesion-b.md) y fotos reales del cliente.
- Documentar en detalle el diseño de D-018 en diseno.md (§3 y wireframes).

## Los siguientes 5 pasos, en orden

1. **Persona B, hoy:** enviar las preguntas al cliente, pidiendo primero los accesos (C-04), y confirmar el reparto propuesto.
2. **Persona B, esta noche:** revisar y aprobar la PR de `revision/complemento-b` (no se fusiona sin su revisión; si no da tiempo, la demo sale de la rama).
3. **Las dos personas:** tarde de borradores con la vista del paso 2 (C-01).
4. **Con los accesos del cliente:** copia de seguridad completa, exportación de 16 meses de Search Console, escenario del `.es`, Docker y hosting (C-03), `config-formulario.php` y envío real de prueba (C-02, C-04, A-03).
5. **`npm run build:publicacion` sin errores**, checklist completa y publicar siguiendo [publicacion.md](publicacion.md).
