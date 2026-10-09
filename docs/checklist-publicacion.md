# Checklist de publicación

> La ejecuta la Persona A con la Persona B delante. Cada casilla se marca en el PR de publicación, con la evidencia (salida de comando o captura). Si una casilla de «Antes» falla, **no se publica**.
> Fuentes de control: [inventario-urls.csv](inventario-urls.csv), [redirecciones.csv](redirecciones.csv), [plan-paginas.csv](plan-paginas.csv).

## 0. Requisitos previos

- [ ] Accesos confirmados: FTP/SFTP del hosting del `.com`, Search Console del `.com` y del `.es`, DNS o hosting del `.es`. Las credenciales se guardan **fuera del repositorio**.
- [ ] El hosting admite `.htaccess` con `mod_rewrite` y `mod_headers` (comprobado con un archivo de prueba en una carpeta temporal, que luego se borra).
- [ ] Formulario PHP (`/contacto/enviar.php`, excepción aprobada) probado de principio a fin (A-2-03). La versión de PHP del hosting es compatible y sus límites `upload_max_filesize` y `post_max_size` son mayores que `site.formulario.maxAdjuntoMB`.
- [ ] Docker Desktop instalado en el equipo de la Persona A y el entorno `tools/apache-pruebas/` arranca (`docker compose up -d --build`).
- [ ] Día y hora de publicación acordados con el cliente, en horario de baja actividad y **nunca un viernes por la tarde**. Las dos personas disponibles durante las 2 horas siguientes.

## 1. Antes de publicar

### Copia de seguridad (obligatoria)
- [ ] Descarga **completa** por FTP de la web actual del servidor del `.com` (todos los archivos, incluidos `.htaccess`, `contacto/bat/` y cualquier PHP), guardada en dos sitios **fuera del repo** (p. ej. un disco y una nube). Anotar la fecha y el tamaño.
- [ ] Ídem del `.es`, si está en un hosting accesible.
- [ ] Captura de la configuración actual de DNS de los dos dominios.
- [ ] Exportación de Search Console de los últimos 3 meses (páginas y consultas) del `.com` y del `.es`, para comparar después.

### Build
- [ ] `node build.js --publicar` termina **sin errores** (sin `_borrador`, sin `[POR VERIFICAR` y sin «(dato externo» en `/dist`). Los avisos de `site.pendientes` se revisan y se aceptan.
- [ ] `/dist` contiene exactamente las 52 páginas de `plan-paginas.csv`, los 8 PDF con su nombre exacto, `sitemap.xml`, `robots.txt` y `.htaccess`.

### URLs
- [ ] Cada fila `MANTENER` de `inventario-urls.csv` existe en `/dist` con la misma ruta y el mismo nombre (comprobado por script).
- [ ] Cada fila `REDIRIGIR` tiene su regla en `.htaccess` y no queda ningún `[POR VERIFICAR]` en `destino_301`.
- [ ] Los PDF con ñ y con espacios responden 200 con la URL codificada **y** con la codificación Latin-1 (`%F1`), como hoy.

### Redirecciones (probadas en local con Apache en Docker, A-1-10 y A-3-03)
- [ ] `node build.js --publicar` y, con el `/dist` resultante, `docker compose up -d --build` en `tools/apache-pruebas/` y `bash tools/probar-redirecciones.sh` **sin fallos**. Se pega la salida en el PR. Nunca se sube un `.htaccess` que no haya pasado esta prueba.
- [ ] Cada fila de `redirecciones.csv` devuelve **un único 301** al destino exacto (sin cadenas: `curl -sIL` muestra 1 salto).
- [ ] `/index.html` → `/` y `/oviedo/index.html` → `/oviedo/` sin bucle.
- [ ] `http://`, `www.` y `http://www.` de cualquier URL → `https://brototermic.com/<misma ruta>` en un solo salto.
- [ ] Una URL inexistente devuelve **404** (no 200 ni redirección a la portada).

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
- [ ] Visualización correcta a 360, 768 y 1280 px de una página de cada plantilla.
- [ ] **0 enlaces rotos** internos (comprobado por script sobre `/dist`).
- [ ] Todos los enlaces de teléfono usan `tel:+34…`; no queda ningún `callto:`.
- [ ] Todas las imágenes tienen `alt` real, `width` y `height`, y `loading="lazy"` excepto el hero.

### Formulario
- [ ] Envío real de prueba con adjunto (PDF y JPG) recibido en el buzón acordado.
- [ ] **Validación en el servidor**, probada sin el navegador (`curl -F …` directo a `enviar.php`): rechaza un email mal formado, un mensaje vacío, la casilla RGPD sin marcar, un adjunto mayor que el límite y un tipo no permitido (p. ej. un `.exe` renombrado a `.pdf`, que `finfo` debe detectar).
- [ ] Un nombre o un email con salto de línea no inyecta cabeceras en el correo.
- [ ] `enviar.php` no muestra errores de PHP al usuario y no contiene credenciales; el adjunto no queda guardado en el servidor.
- [ ] El honeypot bloquea el envío si se rellena; la casilla RGPD es obligatoria.
- [ ] Mensajes de error y de éxito accesibles y en español.

## 2. Publicación

1. [ ] Subir `/dist` a una **carpeta temporal** del servidor y comprobar 3 páginas desde ella (si el hosting lo permite).
2. [ ] Mover la web antigua a una carpeta de respaldo **fuera del docroot** (no borrarla) o tenerla ya descargada (punto 1).
3. [ ] Subir el contenido de `/dist` al docroot, `.htaccess` el último.
4. [ ] Aplicar la redirección del `.es` (su `.htaccess` o la redirección del proveedor de DNS u hosting, según lo que haya respondido el cliente).

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

## 5. Seguimiento (días 1, 3, 7, 14 y 30)

- [ ] Informe de cobertura y de páginas: errores 404 nuevos, «Página con redirección» y «Duplicada». Cada 404 de una URL antigua se añade a `inventario-urls.csv` y a `redirecciones.csv`.
- [ ] Comparar clics e impresiones con la exportación previa. Si una página pierde más de un 30 % de clics en 14 días, revisar su title, su contenido y su redirección.
- [ ] Comprobar que llegan los formularios (pedir confirmación al cliente la primera semana).

## 6. Plan de vuelta atrás

**Cuándo:** un fallo grave que no se arregla en 30 minutos: la web no carga, hay bucles de redirección, los formularios no llegan y no hay alternativa, o desaparecen en masa páginas que deben mantenerse.

**Cómo (≤ 15 minutos):**
1. Borrar o renombrar el `.htaccess` nuevo (corta las redirecciones al momento).
2. Restaurar la web antigua desde la carpeta de respaldo del servidor o desde la copia del punto 1 (incluido su `.htaccess` original).
3. Si se tocó la redirección del `.es`, desactivarla.
4. Comprobar inicio, 3 categorías y contacto en la web antigua.
5. Avisar al cliente y anotar en el PR la causa, la hora y lo que se hizo.
6. **No** enviar nada a Search Console (ni sitemap ni cambio de dirección) hasta volver a publicar.

Como las URLs de las páginas son las mismas en las dos versiones, volver atrás durante unas horas no daña el posicionamiento. Lo que sí lo daña es dejar bucles o errores 404 activos durante días.
