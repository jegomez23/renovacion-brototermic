# Procedimiento del día de publicación

> Guion paso a paso, con los comandos, para el día en que se sube la web nueva. Lo ejecuta la Persona A con la Persona B delante. **Las casillas de control están en [checklist-publicacion.md](checklist-publicacion.md)**: este documento dice *cómo* hacerlo y en qué orden; el checklist, *qué* tiene que estar bien. Si hay contradicción, manda [AGENTS.md](../AGENTS.md).
>
> Convenciones: los comandos son de Git Bash (Windows) o de cualquier shell POSIX. `AAAA-MM-DD` es la fecha del día. Las credenciales (FTP, Search Console) **nunca** se escriben en el repositorio ni en este documento: se teclean en el momento o viven en el gestor de contraseñas.

## 0. Condiciones para empezar (si alguna falla, no se publica)

1. Las secciones 0 y 1 de [checklist-publicacion.md](checklist-publicacion.md) están marcadas en el PR de publicación, con evidencias. En particular:
   - `node build.js --modo=publicacion` termina **sin errores**;
   - `bash tools/probar-redirecciones.sh` contra el Apache de Docker da **0 fallos**;
   - `node tools/comprobar-dist.js` dice «Todo correcto»;
   - el formulario se ha probado de principio a fin en el hosting.
2. Es un día laborable por la mañana, nunca un viernes por la tarde, y las dos personas están disponibles las 2 horas siguientes.
3. Se ha exportado de Search Console (`.com` y `.es`) el informe de **Rendimiento → Páginas** y **Consultas** de los últimos 3 meses (CSV). Es la **línea base** del seguimiento (apartado 6): sin ella no se puede saber si algo empeora.

## 1. Copia de seguridad completa ANTES de tocar nada

Nada se sube ni se borra hasta que la copia esté hecha y comprobada.

1. **Descargar todo el docroot del `.com`** por FTP/SFTP, incluidos los archivos ocultos (`.htaccess`), `contacto/bat/` y cualquier PHP. Con FileZilla o WinSCP: activar «mostrar archivos ocultos» y descargar la carpeta raíz entera. Por línea de comandos (si hay `lftp`):

   ```bash
   lftp -u USUARIO sftp://SERVIDOR -e "set ftp:list-options -a; mirror --verbose /RUTA-DOCROOT ./copia-com-AAAA-MM-DD; quit"
   ```

2. **Comprobar la copia** antes de seguir:

   ```bash
   cd copia-com-AAAA-MM-DD
   ls -la .htaccess contacto/bat/                       # existen
   find . -type f | wc -l                               # anotar el número de archivos
   ls *.html | wc -l                                    # al menos las 48 páginas del .com de /legacy
   ```

3. **Empaquetar y guardar en dos sitios fuera del repo** (un disco y una nube), con su huella:

   ```bash
   cd .. && zip -r copia-com-AAAA-MM-DD.zip copia-com-AAAA-MM-DD && sha256sum copia-com-AAAA-MM-DD.zip
   ```

   Anotar en el PR: fecha, número de archivos, tamaño del zip y su SHA-256.
4. Lo mismo con el `.es` si está en un hosting accesible, y una captura de la configuración DNS de los dos dominios.
5. Si el hosting lo permite, **renombrar** (no borrar) la web antigua dentro del servidor a una carpeta fuera del docroot (`web-antigua-AAAA-MM-DD`): es la vuelta atrás más rápida (apartado 5).

## 2. Subir /dist y el .htaccess

1. Generar la versión final en limpio:

   ```bash
   git switch main && git pull
   node build.js --modo=publicacion        # debe terminar sin errores
   node tools/comprobar-dist.js            # con node tools/servir.js arrancado en otra terminal
   ```

2. **Subir el contenido de `/dist` al docroot**, conservando las carpetas (`assets/`, `images/`, `docs/`, `contacto/`, `oviedo/`). **El `.htaccess` se sube el último**: así, si la subida se corta, no hay redirecciones apuntando a páginas que aún no están.
   - FileZilla o WinSCP: subir todo menos `.htaccess`; cuando termine sin errores, subir `.htaccess`.
   - Con `lftp`:

     ```bash
     lftp -u USUARIO sftp://SERVIDOR -e "mirror -R --verbose --exclude-glob .htaccess dist/ /RUTA-DOCROOT; put dist/.htaccess -o /RUTA-DOCROOT/.htaccess; quit"
     ```

   - **No se borra nada del servidor** con la subida (sin `--delete`): los archivos antiguos que no están en `/dist` (por ejemplo `contacto/bat/rd-mailform.php` si el formulario lo sigue usando) se quedan.
3. Comprobar que los nombres con **ñ** y con **espacios** han llegado bien (algunos clientes FTP los cambian): `docs/catalogo_cañas_pirometricas_broto-03-02-2015.pdf`, `docs/DISPLAYS DIGITALES PROGRAMABLES BROTOTERMIC HR.pdf`, `images/brototermic-convertidor-señal.jpg` y `images/brototermic-detectores- nivel.jpg`.
4. Aplicar la redirección del `.es` (su `.htaccess`, o la redirección del proveedor de DNS u hosting, según haya respondido el cliente).

## 3. Verificaciones inmediatas en producción (primeros 30 minutos)

Si algo de este apartado falla y no se arregla en 30 minutos, se vuelve atrás (apartado 5).

### 3.1 Redirecciones

El script completo, ahora contra producción (todas las filas de `redirecciones.csv` y todas las URL `MANTENER`/`NUEVA`):

```bash
bash tools/probar-redirecciones.sh --produccion        # debe terminar con 0 fallos
```

Y a mano, con `curl -I`, las que más importan (cada una, **un único** 301 al destino final):

```bash
for u in \
  http://brototermic.com/ \
  http://www.brototermic.com/resistencias-inmersion.html \
  https://www.brototermic.com/ \
  https://brototermic.com/index.html \
  https://brototermic.com/contacto.html \
  https://brototermic.com/oviedo/index.html \
  http://www.brototermic.es/ \
  https://brototermic.es/contacto/contacto.html \
  https://www.brototermic.es/politica-de-privacidad-brototermic-oviedo.html ; do
  echo "== $u"; curl -sI "$u" | grep -i -E '^HTTP|^location'
done
# Sin cadenas: -L debe mostrar exactamente un 301 y luego un 200
curl -sIL http://www.brototermic.com/resistencias-inmersion.html | grep -i -E '^HTTP|^location'
# 404 de verdad (nunca 200 ni redirección a la portada), también en el .es
curl -sI https://brototermic.com/esta-pagina-no-existe.html | head -1
curl -sI https://www.brototermic.es/esta-tampoco.html | head -1
```

### 3.2 Diez URLs clave

Cada una: **200**, su canonical y su title.

```bash
for r in / /resistencias-electricas.html /resistencias-inmersion.html /controltemperatura.html \
         /controltemperatura-sondastemperatura.html /controldenivel.html /fabricaciones-a-medida.html \
         /empresa.html /contacto/contacto.html /oviedo/ ; do
  u="https://brototermic.com$r"
  printf '%s  %s\n' "$(curl -s -o /dev/null -w '%{http_code}' "$u")" "$u"
  curl -s "$u" | grep -o -E '<link rel="canonical" href="[^"]+"|<title>[^<]+'
done
curl -sI https://brototermic.com/sitemap.xml | head -1      # 200
curl -s  https://brototermic.com/robots.txt                  # con la línea Sitemap:
```

Además, en un navegador en **modo incógnito**: el inicio, una categoría y contacto con el candado de HTTPS y sin avisos de contenido mixto; el menú se abre en el móvil.

### 3.3 PDF con ñ y con espacios

```bash
curl -sI "https://brototermic.com/docs/catalogo_ca%C3%B1as_pirometricas_broto-03-02-2015.pdf" | grep -i -E '^HTTP|^content-type'   # 200 application/pdf
curl -sI "https://brototermic.com/docs/catalogo_ca%F1as_pirometricas_broto-03-02-2015.pdf"    | grep -i -E '^HTTP|^content-type'   # 200 (Latin-1, como hoy)
curl -sI "https://brototermic.com/docs/DISPLAYS%20DIGITALES%20PROGRAMABLES%20BROTOTERMIC%20HR.pdf" | head -1                      # 200
curl -sI "https://brototermic.com/images/brototermic-convertidor-se%C3%B1al.jpg" | head -1                                       # 200
```

### 3.4 Formulario y teléfonos

1. **Envío real** desde `https://brototermic.com/contacto/contacto.html` con un PDF adjunto, y otro desde `/oviedo/` con un JPG: los dos llegan al buzón acordado con el adjunto. Pedir al cliente que confirme que los recibe.
2. Un envío **sin marcar la casilla RGPD** y otro con un adjunto de un tipo no permitido se rechazan con un mensaje claro.
3. Desde un **móvil**, tocar el teléfono de la cabecera y el de la CTA: abren la llamada a `945 22 33 31`; el de Oviedo, a `629 462 642`. Comprobación rápida de que no queda ningún `callto:`:

   ```bash
   curl -s https://brototermic.com/ | grep -o -E 'href="(tel|callto):[^"]+"' | sort -u
   ```

## 4. Search Console (el mismo día, cuando el apartado 3 esté en verde)

1. **Propiedad del `.com`** (mejor de tipo dominio, si hay acceso al DNS): **Sitemaps → enviar** `https://brototermic.com/sitemap.xml`. Comprobar a las pocas horas que aparece «Correcto» y 60 URL descubiertas (52 páginas + 8 PDF).
2. **Inspección de URLs → Solicitar indexación**, en este orden: el inicio, las 4 familias nuevas (`/resistencias-electricas.html`, `/controltemperatura.html`, `/controldenivel.html`, `/presionhumedad.html`), `/oviedo/`, `/contacto/contacto.html` y 3 categorías de prioridad alta (`/resistencias-inmersion.html`, `/resistencias-tipo-cartucho.html`, `/controltemperatura-sondastemperatura.html`). En cada una, «Probar URL publicada»: canonical declarado = canonical seleccionado por Google y sin errores de datos estructurados.
3. **Cambio de dirección del `.es`**: en la propiedad del `.es`, Configuración → **Cambio de dirección** → `brototermic.com`. La herramienta comprueba que la portada antigua redirige al sitio nuevo; aquí redirige a `/oviedo/`, no a la portada, y **podría rechazarlo** (checklist §4). Si lo rechaza, no se cambia la decisión: bastan las 301 y el sitemap, y se anota en el PR.
4. Mantener la propiedad del `.es` y su dominio **al menos 1 año**, con las redirecciones activas.

## 5. Plan de vuelta atrás

**Cuándo:** un fallo grave que no se arregla en 30 minutos: la web no carga, hay bucles de redirección, el formulario no envía y no hay alternativa, o páginas que deben mantenerse dan 404.

**Cómo (≤ 15 minutos):**
1. **Renombrar el `.htaccess` nuevo** (`.htaccess` → `htaccess-fallido-AAAA-MM-DD.txt`): corta las redirecciones al momento.
2. **Restaurar la copia del apartado 1**: devolver la carpeta `web-antigua-AAAA-MM-DD` del servidor a su sitio o subir de nuevo la copia `copia-com-AAAA-MM-DD` **completa, con su `.htaccess` original**. Lo que se subió nuevo y no existía antes (por ejemplo las 4 páginas de familia) se puede dejar: no está enlazado desde la web antigua.
3. Si se aplicó la redirección del `.es`, desactivarla.
4. Comprobar en incógnito el inicio, 3 categorías y contacto de la web antigua (`curl -sI` → 200).
5. **No** tocar Search Console: si ya se envió el sitemap nuevo, se elimina; no se envía nada más hasta volver a publicar.
6. Avisar al cliente y anotar en el PR la causa, la hora y lo que se hizo. Arreglar en local, volver a pasar el apartado 0 y fijar otra fecha.

Como las URLs de las páginas son las mismas en las dos versiones, unas horas de vuelta atrás no dañan el posicionamiento. Lo que sí lo daña es dejar bucles o errores 404 activos durante días.

## 6. Seguimiento durante 4-8 semanas

Lo hace la Persona A; los resultados se anotan en el PR de publicación (o en un issue de seguimiento). Las comparaciones se hacen siempre contra la **línea base** del apartado 0.3, con periodos equivalentes (mismos días de la semana).

| Cuándo | Qué se mira | Umbral de alarma | Qué se hace |
|---|---|---|---|
| Días 1, 3 y 7 | **Páginas → no indexadas**: «No encontrada (404)», «Página con redirección», «Duplicada» | Cualquier 404 de una URL que existía | Si era una URL real de la web antigua: añadirla a `inventario-urls.csv` y a `redirecciones.csv`, nueva regla, probar en Docker y subir el `.htaccess` |
| Días 1, 3 y 7 | **Sitemaps**: URL enviadas e indexadas | Errores de lectura o URL excluidas | Revisar la URL excluida con la inspección |
| Semanas 1, 2, 4, 6 y 8 | **Cobertura**: páginas indexadas del `.com` | Menos de 52 páginas indexadas a partir de la semana 4 | Inspeccionar las que falten y solicitar indexación |
| Semanas 2, 4, 6 y 8 | **Clics e impresiones por página** (Rendimiento → Páginas), comparados con la línea base | Una página pierde **más de un 30 %** de clics durante 2 semanas seguidas | Revisar su title, su meta, su contenido frente a /legacy (`node tools/auditoria-seo.js`) y su redirección |
| Semanas 2, 4, 6 y 8 | **Consultas** de la línea base (sobre todo las que llevan «Vitoria» o un modelo) | Una consulta con clics que deja de traerlos | Comprobar qué página posicionaba antes y si conserva la keyword |
| Semanas 1, 2, 4 y 8 | **Errores 404** en los registros del servidor (si el hosting los da) | URL antiguas con tráfico real | Igual que la primera fila |
| Semana 1 | **Formularios**: el cliente confirma que llegan | Ninguna solicitud en una semana | Envío de prueba y revisión del script |
| Semana 8 | **Cierre**: informe final y retirada de la vigilancia diaria | — | Se deja una revisión mensual de cobertura y 404 durante el primer año |

Las 8 semanas cubren el tiempo que suele tardar Google en recalcular el sitio tras una migración. Si en la semana 8 el tráfico total está por debajo del 80 % de la línea base y no hay una causa estacional, se revisa página por página con el auditor antes de cambiar nada.
