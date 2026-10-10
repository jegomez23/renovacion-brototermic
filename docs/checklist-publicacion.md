# Checklist de publicación

> El guion paso a paso del día de publicar, con los comandos, está en [publicacion.md](publicacion.md); este documento son las casillas de control.
>
> La ejecuta la Persona A con la Persona B delante. Cada casilla se marca en el PR de publicación, con la evidencia (salida de comando o captura). Si una casilla de «Antes» falla, **no se publica**.
> Fuentes de control: [inventario-urls.csv](inventario-urls.csv), [redirecciones.csv](redirecciones.csv), [plan-paginas.csv](plan-paginas.csv).

## 0. Requisitos previos

- [ ] Accesos confirmados: FTP/SFTP del hosting del `.com`, Search Console del `.com` y del `.es`, DNS o hosting del `.es`. Las credenciales se guardan **fuera del repositorio**.
- [ ] El hosting admite `.htaccess` con `mod_rewrite` y `mod_headers` (comprobado con un archivo de prueba en una carpeta temporal, que luego se borra).
- [ ] `config-formulario.php` creado en el servidor **fuera del docroot** (a partir de `src/contacto/config.example.php`), con el email de destino del cliente; `max_adjunto_mb` y `tipos` iguales a los de `site.json`. Formulario (`/contacto/enviar.php`) probado de principio a fin (A-2-03). La versión de PHP del hosting es compatible y sus límites `upload_max_filesize` y `post_max_size` son mayores que `site.formulario.maxAdjuntoMB`.
- [ ] Docker Desktop instalado en el equipo de la Persona A y el entorno `tools/apache-pruebas/` arranca (`docker compose up -d --build`).
- [ ] Día y hora de publicación acordados con el cliente, en horario de baja actividad y **nunca un viernes por la tarde**. Las dos personas disponibles durante las 2 horas siguientes.

## 1. Antes de publicar

### Copia de seguridad (obligatoria)
- [ ] Descarga **completa** por FTP de la web actual del servidor del `.com` (todos los archivos, incluidos `.htaccess`, `contacto/bat/` y cualquier PHP), guardada en dos sitios **fuera del repo** (p. ej. un disco y una nube). Anotar la fecha y el tamaño.
- [ ] Ídem del `.es`, si está en un hosting accesible.
- [ ] Captura de la configuración actual de DNS de los dos dominios.
- [ ] Exportación de Search Console de los últimos 16 meses (páginas y consultas) del `.com` y del `.es`, para comparar después.

### Build
- [ ] `node build.js --publicar` termina **sin errores** (sin `_borrador`, sin `[POR VERIFICAR` y sin «(dato externo» en `/dist`). Los avisos de `site.pendientes` se revisan y se aceptan.
- [ ] `/dist` contiene exactamente las 52 páginas de `plan-paginas.csv` más `404.html`, `contacto/gracias.html`, `contacto/error.html` y `contacto/enviar.php` (y `/dist-es`, solo su `.htaccess`), los 8 PDF con su nombre exacto, `sitemap.xml`, `robots.txt` y `.htaccess`.
- [ ] `node tools/comprobar-dist.js` (con `node tools/servir.js` arrancado) dice «Todo correcto»: sitemap solo con URLs canónicas que responden 200, robots, canonical en todas las páginas, 404 con noindex y 0 páginas huérfanas.

### URLs
- [ ] Cada fila `MANTENER` de `inventario-urls.csv` existe en `/dist` con la misma ruta y el mismo nombre (comprobado por script).
- [ ] Cada fila `REDIRIGIR` tiene su regla en `.htaccess` y no queda ningún `[POR VERIFICAR]` en `destino_301`.
- [ ] Los PDF con ñ y con espacios responden 200 con la URL codificada **y** con la codificación Latin-1 (`%F1`), como hoy.

### Redirecciones (probadas en local con Apache en Docker, A-1-10 y A-3-03)
- [ ] `node build.js --publicar` y, con el `/dist` resultante, `docker compose up -d --build` en `tools/apache-pruebas/` y `bash tools/probar-redirecciones.sh` **sin fallos**. Se pega la salida en el PR. Nunca se sube un `.htaccess` que no haya pasado esta prueba.
- [ ] Cada fila de `redirecciones.csv` devuelve **un único 301** al destino exacto (sin cadenas: `curl -sIL` muestra 1 salto).
- [ ] `/index.html` → `/` y `/oviedo/index.html` → `/oviedo/` sin bucle.
- [ ] `http://`, `www.` y `http://www.` de cualquier URL → `https://brototermic.com/<misma ruta>` en un solo salto.
- [ ] Una URL inexistente devuelve **404** (no 200 ni redirección a la portada), también en el `.es`: solo sus 7 URLs conocidas redirigen.

### Etiquetas y SEO en la página
- [ ] Cada página tiene un **canonical absoluto** a `https://brototermic.com/…` (sin www, sin `index.html`, sin parámetros).
- [ ] Title ≤ 60, meta de 140-155, ambos únicos, un solo H1 (validado por `build.js`; revisión visual de 5 páginas al azar).
- [ ] No queda ninguna meta obsoleta: `keywords`, `revisit-after`, `distribution`, `robots all`, `DC.*`.
- [ ] Ninguna página tiene `noindex` por error.
- [ ] `sitemap.xml`: 52 páginas + 8 PDF, todas con 200 y canónicas, y ninguna URL redirigida.
- [ ] `robots.txt`: permite todo y tiene la línea `Sitemap: https://brototermic.com/sitemap.xml`.
- [ ] **Schema:** 0 errores en la Prueba de resultados enriquecidos para una página de cada plantilla (inicio, familia, categoría, servicio, sede, contacto y legal).

### Calidad
- [ ] **Lighthouse móvil ≥ 90** (rendimiento, accesibilidad, buenas prácticas y SEO) y **LCP < 2,5 s** en una página de cada plantilla.
- [ ] Una sola hoja CSS; JS con `defer`; ninguna petición a dominios de terceros (comprobado en la pestaña Red).
- [ ] Contraste AA y navegación completa con teclado (menú, acordeón y formulario) en inicio, categoría y contacto.
- [ ] Visualización correcta a 320, 360, 768 y 1280 px de una página de cada plantilla (`node tools/capturas.js`).
- [ ] **0 enlaces rotos** internos (comprobado por script sobre `/dist`).
- [ ] Todos los enlaces de teléfono usan `tel:+34…`; no queda ningún `callto:`.
- [ ] Todas las imágenes tienen `alt` real, `width` y `height`, y `loading="lazy"` excepto el hero.

### Formulario
- [ ] `site.formulario.envioActivo` está en `true` solo después de comprobar en el hosting que `enviar.php` envía con adjunto. Remitente del dominio con SPF/DKIM/DMARC correctos (si no, el correo puede ir a spam).
- [ ] Envío real de prueba con adjunto (PDF y JPG) recibido en el buzón acordado.
- [ ] **Validación en el servidor**, probada sin el navegador (`curl -F …` directo al script de envío): rechaza un email mal formado, un mensaje vacío, la casilla RGPD sin marcar, un adjunto mayor que el límite y un tipo no permitido (p. ej. un `.exe` renombrado a `.pdf`, que `finfo` debe detectar).
- [ ] Un nombre o un email con salto de línea no inyecta cabeceras en el correo.
- [ ] El script de envío no muestra errores de PHP al usuario y no contiene credenciales; el adjunto no queda guardado en el servidor.
- [ ] El honeypot bloquea el envío si se rellena; la casilla RGPD es obligatoria.
- [ ] Mensajes de error y de éxito accesibles y en español.

## 2. Publicación

> Detalle y orden en [publicacion.md](publicacion.md) §2. **Solo se sube el contenido de `/dist` y de `/dist-es`**; nunca `/legacy`, `/docs`, `/tools`, `/data`, `/src`, `.git` ni archivos `.md`, `.csv` o `.json`.

1. [ ] `node tools/comprobar-publicable.js` dice «todos publicables» (lista blanca de lo que se puede subir).
2. [ ] **La web antigua NO se mueve ni se borra** del docroot: se queda hasta que el formulario nuevo funcione en producción (publicacion.md §2.5).
3. [ ] Subir al docroot del `.com`, por este orden: recursos (`assets/`, `images/`, `oviedo/images/`, `docs/`), páginas (`.html`, `sitemap.xml`, `robots.txt`) y **`.htaccess` el último**.
4. [ ] `.es`: identificar el escenario (A: mismo hosting y otro docroot; B: otro hosting; C: mismo docroot) en el panel del hosting y aplicar lo de publicacion.md §2.4. Certificado HTTPS del `.es` activo.
5. [ ] (2 semanas después, con el formulario nuevo funcionando) limpieza de la web antigua según publicacion.md §2.5, incluida la retirada de `contacto/bat/`.

## 3. Después de publicar (primeras 2 horas)

- [ ] Repetir sobre **producción** el script de redirecciones y el de URLs MANTENER (todas 200 o un único 301).
- [ ] Probar 10 URLs antiguas al azar desde un navegador en modo incógnito, incluida alguna del `.es`.
- [ ] Enviar el formulario de verdad desde producción.
- [ ] Comprobar HTTPS (candado, sin contenido mixto) en inicio, categoría y contacto.
- [ ] Lighthouse móvil de producción en el inicio y en el piloto.

## 4. Search Console

- [ ] Propiedad del `.com` verificada (de dominio, si hay acceso al DNS). Enviar `https://brototermic.com/sitemap.xml`.
- [ ] Inspeccionar y solicitar la indexación de: inicio, las 4 familias nuevas, `/oviedo/` y 3 categorías de prioridad alta.
- [ ] Propiedad del `.es`: usar la **herramienta de cambio de dirección** hacia `brototermic.com`. [POR VERIFICAR: la herramienta comprueba que la portada antigua redirige al sitio nuevo; aquí redirige a `/oviedo/` y no a la portada, y podría rechazarlo. Si lo rechaza, basta con las redirecciones 301 y el sitemap; se documenta y no se cambia la decisión.]
- [ ] Mantener la propiedad del `.es` y su registro de dominio **al menos 1 año** con las redirecciones activas.

## 5. Seguimiento (días 1, 3, 7, 14 y 30; después, hasta la semana 8 según [publicacion.md](publicacion.md) §6)

- [ ] Informe de cobertura y de páginas: errores 404 nuevos, «Página con redirección» y «Duplicada». Cada 404 de una URL antigua se añade a `inventario-urls.csv` y a `redirecciones.csv`.
- [ ] Comparar clics e impresiones con la exportación previa. Si una página pierde más de un 30 % de clics en 14 días, revisar su title, su contenido y su redirección.
- [ ] Comprobar que llegan los formularios (pedir confirmación al cliente la primera semana).

## 6. Plan de vuelta atrás

**Cuándo:** un fallo grave que no se arregla en 30 minutos: la web no carga, hay bucles de redirección, los formularios no llegan y no hay alternativa, o desaparecen en masa páginas que deben mantenerse.

**Cómo (≤ 15 minutos):**
1. Renombrar el `.htaccess` nuevo (corta las redirecciones al momento).
2. Restaurar desde la copia del punto 1 lo que se sustituyó (páginas `.html`, `sitemap.xml`, imágenes y el `.htaccess` original). La web antigua no se movió, así que no hay que recuperar nada más.
3. Si se subió `dist-es/.htaccess` al `.es`, restaurar su `.htaccess` anterior.
4. Comprobar inicio, 3 categorías y contacto en la web antigua.
5. Avisar al cliente y anotar en el PR la causa, la hora y lo que se hizo.
6. **No** enviar nada a Search Console (ni sitemap ni cambio de dirección) hasta volver a publicar.

Como las URLs de las páginas son las mismas en las dos versiones, volver atrás durante unas horas no daña el posicionamiento. Lo que sí lo daña es dejar bucles o errores 404 activos durante días.
