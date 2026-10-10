# Estado del proyecto (en 1 minuto)

> Última actualización: **2026-10-10** · Rama `main` · Etiqueta **`v0.9-preproduccion`** (punto de vuelta atrás).
> Las reglas están en [AGENTS.md](../AGENTS.md); el detalle de cada hallazgo, en [auditoria-final.md](auditoria-final.md) (los IDs de abajo son los suyos). Actualiza este documento cada vez que cambie algo de lo que dice.

## Qué está hecho

| | |
|---|---|
| **Páginas** | Las **52 del plan** (inicio, 4 familias, 39 categorías, empresa, fabricación a medida, nuevos productos, contacto, `/oviedo/`, privacidad, cookies y mapa web) + `404.html` + las 2 respuestas del formulario (`gracias`, `error`): **55 HTML**, con las mismas URLs que la web actual |
| **Auditor de paridad SEO** (/legacy ↔ /dist) | **70 OK · 8 AVISO · 0 ERROR** en modo publicación (77 URLs del inventario + reglas generales del `.htaccess`). Los 8 avisos dependen del cliente: 6 keywords sin verificar en Search Console y el catálogo vigente (2 URLs) |
| **Pruebas del auditor** | **10/10 mutaciones detectadas** (borrar producto, frase o PDF; cambiar número, unidad, modelo o ruta de imagen; dato inventado en la intro; redirección quitada; página antigua ilegible) |
| **W3C** (validador Nu local) | **55/55 páginas y la hoja CSS sin errores ni advertencias** |
| **Lighthouse móvil** (medido el 2026-10-10 en local, sin compresión ni caché del servidor) | Inicio 93 · familia 99 · categoría 99 · contacto 99 · `/oviedo/` 98. Accesibilidad, buenas prácticas y SEO: 100 en las cinco. LCP 1,9-2,3 s. Repetir en producción |
| **SEO técnico** | Canonical en las 52 páginas, sitemap con 60 URLs (52 + 8 PDF) todas con 200, `robots.txt`, 0 páginas huérfanas, JSON-LD en todas, 404 con `noindex` |
| **Redirecciones** | 17 reglas 301 + 404 real del resto del `.es`, en `dist/.htaccess` y en el docroot propio del `.es` (`dist-es/.htaccess`). Comprobadas con el simulador del auditor; **no probadas aún en un Apache** |
| **Formulario** | `/contacto/enviar.php` hecho y probado en local (PHP 8.2 + capturador SMTP: 17 casos, incluidos inyección de cabeceras y adjuntos falsos). **Envío desactivado** (`envioActivo: false`) hasta tener el hosting |
| **Seguridad** | Cabeceras (nosniff, Referrer-Policy, X-Frame-Options, Permissions-Policy, HSTS de 5 min y CSP en modo informe), archivos ocultos y copias → 404, solo se publica `/dist` y `/dist-es` (lista blanca) |

## Cómo ver la web

Con Node ≥ 18: `npm run dev` y abrir **http://localhost:8000/** (se reconstruye sola al guardar). Comprobaciones: `npm run test`. W3C: `npm run validar`. Detalle en el [README](../README.md).

`npm run build:publicacion` **falla hoy, y es lo correcto**: quedan 51 textos en borrador y el envío del formulario desactivado.

## Lo que bloquea la publicación

**Nosotros**
- **C-03:** instalar Docker y pasar `bash tools/probar-redirecciones.sh` (dos vhosts, como en producción); después, probar el `.htaccess` en el hosting real.
- **M-06:** pasar la Prueba de resultados enriquecidos de Google en una página de cada plantilla. La Persona B debe revisar lo que se ha fusionado en `main` sin su revisión.
- **El día de publicar** (publicacion.md): crear `config-formulario.php` fuera del docroot y activar `envioActivo` (C-02); comprobar SPF/DKIM/DMARC (B-13); subir HSTS y activar la CSP tras revisarlas (M-04).
- Mejoras que no bloquean: B-04, B-05, B-06, B-07, B-08 y B-15.

**Persona B**
- **C-04:** enviar al cliente el mensaje de [preguntas-cliente.md](preguntas-cliente.md) (no consta como enviado) y anotar la fecha.
- **C-01:** revisar los **51 borradores** (39 categorías, 4 intros de familia, 8 textos de `/content`) y quitar `_borrador` / `borrador: si`. Con `npm run dev` se ve el resultado al guardar y `npm run test` avisa si cambia una cifra, una unidad o un modelo.
- **M-02:** revisar los 196 alts que son solo el nombre del producto. **M-03:** unificar la dirección de la página de privacidad.
- **B-01:** `slide-1.webp` y convertir `slide-2/3/4`. **B-02:** menciones genéricas a la directiva ATEX (plan-contenido §4, fila 7). **B-03:** cambios no listados del piloto. Retocar las 3 fotos del piloto.

**Cliente**
- **C-02, C-03, C-04, A-03:** accesos FTP/SFTP del hosting, Search Console de los dos dominios y a qué carpeta apunta el `.es` (escenario A, B o C de publicacion.md §2.4, con su certificado HTTPS). Con el FTP se revisa el PHPMailer de `rd-mailform.php` (A-03).
- **C-02:** email de destino del formulario, tamaño máximo del adjunto y si se aceptan DWG/DXF.
- **M-03, M-09:** revisión legal de privacidad y cookies (transferencias internacionales, primera capa RGPD, textos [REVISIÓN CLIENTE]).
- **M-05:** restringir o rotar la clave de Google Maps (y decidir si el repositorio debe seguir siendo público).
- Datos: 1982 y la dirección de Vitoria, si la delegación de Oviedo sigue activa y su horario, catálogo de resistencias vigente, certificaciones ATEX, productos vigentes de «Nuevos productos», logos SVG y si quieren analítica.

## Los siguientes 5 pasos, en orden

1. **Persona B, hoy:** enviar las preguntas al cliente, pidiendo primero los accesos (C-04).
2. **Persona B:** revisar los borradores por prioridad de [plan-paginas.csv](plan-paginas.csv), con `npm run dev` abierto y `npm run test` antes de cada commit (C-01).
3. **Nosotros:** instalar Docker y pasar la prueba de redirecciones con los dos docroots (C-03).
4. **Con los accesos del cliente:** copia de seguridad completa, exportación de 16 meses de Search Console, escenario del `.es`, `config-formulario.php` y envío real de prueba (C-02, C-03, C-04, A-03).
5. **`npm run build:publicacion` sin errores**, checklist completa y publicar siguiendo [publicacion.md](publicacion.md).
