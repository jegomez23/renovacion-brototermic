# Apache de pruebas (Docker)

Entorno local para probar los `.htaccess` de `/dist` (docroot del `.com`) y de `/dist-es` (docroot del `.es`) antes de publicar (AGENTS.md §2, tarea A-1-10). Usa la imagen oficial `httpd` con los módulos del hosting (`mod_rewrite`, `mod_alias`, `mod_headers`, `mod_filter`, `mod_deflate`, `mod_expires` y `mod_ssl`) y `AllowOverride All`.

**Como en producción, son dos vhosts con docroots distintos:** `brototermic.com` y `www.` sirven `/dist`; `brototermic.es` y `www.` sirven `/dist-es` (que solo contiene su `.htaccess`). Así se prueba el escenario real: las redirecciones del `.es` funcionan desde SU docroot, no desde el del `.com`.

Requisito: Docker Desktop.

```bash
node build.js                       # genera /dist y /dist-es (cada uno con su .htaccess)
cd tools/apache-pruebas
docker compose up -d --build        # http://localhost:8080 y https://localhost:8443 (certificado autofirmado)
cd ../..
bash tools/probar-redirecciones.sh  # una prueba por fila de redirecciones.csv y por URL MANTENER/NUEVA
docker compose -f tools/apache-pruebas/docker-compose.yml down
```

- `/dist` y `/dist-es` se montan **en solo lectura**: tras cada `node build.js`, Apache sirve la versión nueva sin reconstruir la imagen.
- El mismo Apache responde a `brototermic.com`, `www.brototermic.com`, `brototermic.es` y `www.brototermic.es`, cada pareja en su vhost. El script envía el host real con `curl --connect-to`, así que no hace falta tocar el archivo `hosts`.
- Para ver en el navegador una página con otro host: `curl -k --connect-to ::127.0.0.1:8443 https://www.brototermic.es/ -I`.
- Si una regla no hace lo esperado: `docker compose logs apache` (el log de `mod_rewrite` está activado en nivel `trace2` y el de `mod_alias` en `debug`).
- Para simular un hosting que solo permite `FileInfo` en `.htaccess`, cambiar `AllowOverride All` por `AllowOverride FileInfo` en `httpd-pruebas.conf`: el `.htaccess` debe seguir funcionando sin dar 500.
- Después de publicar, el mismo script se ejecuta contra producción: `bash tools/probar-redirecciones.sh --produccion`.
- Limitación: el hosting real puede tener otra versión de Apache u otra configuración (por ejemplo, el HTTPS terminado en un proxy). Esta prueba no sustituye a la comprobación en producción (checklist, apartado 3).
