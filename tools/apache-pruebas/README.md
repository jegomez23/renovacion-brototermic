# Apache de pruebas (Docker)

Entorno local para probar el `.htaccess` de `/dist` antes de publicar (AGENTS.md §2, tarea A-1-10). Usa la imagen oficial `httpd` con los módulos del hosting (`mod_rewrite`, `mod_headers`, `mod_deflate`, `mod_expires` y `mod_ssl`) y `AllowOverride All`.

Requisito: Docker Desktop.

```bash
node build.js                       # genera /dist (con su .htaccess)
cd tools/apache-pruebas
docker compose up -d --build        # http://localhost:8080 y https://localhost:8443 (certificado autofirmado)
cd ../..
bash tools/probar-redirecciones.sh  # una prueba por fila de redirecciones.csv y por URL MANTENER/NUEVA
docker compose -f tools/apache-pruebas/docker-compose.yml down
```

- `/dist` se monta **en solo lectura**: tras cada `node build.js`, Apache sirve la versión nueva sin reconstruir la imagen.
- El mismo Apache responde a `brototermic.com`, `www.brototermic.com`, `brototermic.es` y `www.brototermic.es`. El script envía el host real con `curl --connect-to`, así que no hace falta tocar el archivo `hosts`.
- Para ver en el navegador una página con otro host: `curl -k --connect-to ::127.0.0.1:8443 https://www.brototermic.es/ -I`.
- Si una regla no hace lo esperado: `docker compose logs apache` (el log de `mod_rewrite` está activado en nivel `trace2`).
- Después de publicar, el mismo script se ejecuta contra producción: `bash tools/probar-redirecciones.sh --produccion`.
- Limitación: el hosting real puede tener otra versión de Apache u otra configuración (por ejemplo, el HTTPS terminado en un proxy). Esta prueba no sustituye a la comprobación en producción (checklist, apartado 3).
