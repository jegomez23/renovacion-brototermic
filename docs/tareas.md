# Backlog del proyecto

> 3 días de trabajo, 2 personas. **A** = técnica (`/src`, `build.js`, `/tools`, CSS, JS, SEO técnico, `.htaccess`, publicación). **B** = contenido (`/data`, `/content`, `/images`, PDF de `/docs`, textos). Reglas: [AGENTS.md](../AGENTS.md).
>
> Formato de ID: `<persona>-<día>-<nº>`. Columna **∥**: ✔ = puede hacerse en paralelo con las demás tareas de su día; ✖ = espera a sus dependencias. **RC** = está en la ruta crítica.
>
> Cada tarea va en su rama (`feat/…`, `content/…`, `fix/…`) con PR revisado por la otra persona. Al cerrarla se actualiza `estado` en [plan-paginas.csv](plan-paginas.csv) si afecta a páginas.

## Regla del Día 1: una sola página piloto

**El Día 1 se construye una única página: `resistencias-inmersion.html`.** Hasta que el piloto esté aprobado (**HITO-1**), **no se genera ninguna otra página** ni se importan más categorías. Lo que se aprenda del piloto (plantilla, esquema de datos, formato de imágenes, tono de la intro) se corrige una vez y se aplica a las otras 51.

Mientras se espera la aprobación, solo se adelanta trabajo que no depende del formato: imágenes de prioridad alta (siguiendo las mismas reglas que las del piloto), `.htaccess` y seguimiento de las preguntas al cliente.

---

## Día 1: base técnica y página piloto

| ID | Descripción | Archivos | Depende de | Entregable | Terminado cuando | ∥ |
|---|---|---|---|---|---|---|
| **B-1-01** | Enviar al cliente el mensaje de [preguntas-cliente.md](preguntas-cliente.md) a primera hora | `docs/preguntas-cliente.md` (anotar fecha de envío) | — | Mensaje enviado | Fecha de envío anotada en el documento | ✔ |
| **A-1-01** RC | Esqueleto de `build.js`: leer `/data` y `/content`, motor de plantillas mínimo (`{{var}}`, `{{> partial}}`, bucles y condicionales), escribir `/dist`, copiar `/assets`, `/images` y los `.pdf` de `/docs` | `build.js` | — | `node build.js` genera `/dist` | Funciona en Node ≥ 18 sin `npm install` (sin dependencias); da un error claro si falta o está mal un JSON | ✔ |
| **A-1-02** | Script de importación: lee una categoría de `/legacy` y escribe el borrador de su JSON (`nombre`, `texto`, `specs`, `img`, `alt`, `pdf`, `_borrador: true`). El Día 1 **solo se ejecuta para el piloto**. | `tools/importar-legacy.js` | — | `data/categorias/resistencias-inmersion.json` (borrador) | Los 14 productos del piloto aparecen con su texto literal e imagen; ningún dato inventado; `modelo: null` si no se detecta | ✔ |
| **A-1-03** RC | CSS base: tokens de [diseno.md](diseno.md) §2, Lora autoalojada (WOFF2, 400 y 700), reset, retícula, tipografía, botones, foco visible | `assets/css/style.css`, `assets/fonts/` | — | Hoja con tokens y base | Variables en `:root` con los hex exactos; sin `#989898` en texto; una sola hoja | ✔ |
| **B-1-02** | `data/site.json` completo según [datos.md](datos.md) §1 (sedes, marcas, catálogos, `pendientes`) | `data/site.json` | — | JSON válido | Todos los campos obligatorios; 1982 y la dirección de Vitoria en `pendientes`; CP de Oviedo 33011 | ✔ |
| **B-1-03** RC | `data/familias.json` completo: 8 entradas y las 35 categorías con `menu` y `resumen`; `title`, `meta` y `h1` de las 4 familias copiados de `plan-paginas.csv` | `data/familias.json` | — | JSON válido | El megamenú del piloto se genera completo (sus enlaces a páginas aún no generadas son esperados) | ✔ |
| **B-1-04** | Copiar los 8 PDF del `.com` desde `/legacy` a `/docs` con su **nombre exacto** (incluidos la ñ y los espacios) | `docs/*.pdf` | — | 8 PDF | Nombres idénticos a /legacy; MD5 iguales | ✔ |
| **B-1-05** RC | Imágenes del piloto: las 14 de `resistencias-inmersion` se usan **originales, a su tamaño real** (sin ampliar). **Retoque manual solo de 3** con dominante de color (`industriaalimentaria`, `calefactores`, `liquidos-noagresivos`), y únicamente en **fondo e iluminación**. Documentar la herramienta usada. | `images/brototermic-*.jpg` | — | 3 JPG retocados | Mismo nombre y medidas que /legacy; producto sin alterar (comparado con el original) | ✔ |
| **A-1-04** RC | Partials: `head` (meta, canonical, preload de fuente, CSS), `cabecera` (megamenú + acordeón desde `familias.json`), `migas`, `cta-presupuesto`, `pie` (desde `site.json`), `schema` | `src/partials/*` | A-1-01, B-1-02, B-1-03 (mientras tanto, con datos de prueba) | Partials | Menú y enlaces escritos en el HTML (comprobado con JS desactivado) | ✖ |
| **A-1-05** RC | Plantilla `categoria` y sus componentes: índice de productos, tarjeta de producto, tabla y lista de specs, CTA, categorías hermanas | `src/templates/categoria.html`, `assets/css/style.css` | A-1-03, A-1-04 | Plantilla | Nombres de producto en H2, un solo H1, anclas únicas | ✖ |
| **A-1-06** | JS: megamenú y acordeón (teclado, Esc, `aria-expanded`) y relleno del producto en el formulario | `assets/js/menu.js` | A-1-04 | JS con `defer` | Navegable con teclado; sin JS, todo visible | ✖ |
| **A-1-07** | Validaciones de `build.js` para el piloto ([datos.md](datos.md) §6: title, meta, H1, imágenes, enlaces internos) | `build.js` | A-1-01 | Avisos y errores en consola | Detecta un title de 61 caracteres y una imagen inexistente (probado a propósito) | ✖ |
| **B-1-06** RC | Contenido del piloto: revisar el borrador importado (erratas de [plan-contenido.md](plan-contenido.md) §3, specs, alts de [plan-imagenes.csv](plan-imagenes.csv)), escribir la intro con el prompt estándar, poner title, meta y H1 de `plan-paginas.csv` y quitar `_borrador` | `data/categorias/resistencias-inmersion.json` | A-1-02 | JSON final | Intro de 120-200 palabras con tabla de «datos usados» revisada; los 14 productos; meta 140-155 | ✖ |
| **A-1-08** RC | Generar y revisar el piloto: validador W3C, prueba de resultados enriquecidos, Lighthouse móvil, 360/768/1280 px, teclado | `dist/resistencias-inmersion.html` | A-1-05, A-1-06, A-1-07, B-1-05, B-1-06 | PR con capturas a 3 anchos y la nota de Lighthouse | Cumple la definición de terminado (AGENTS.md §9) y Lighthouse móvil ≥ 90 | ✖ |
| **HITO-1** RC | **Aprobación del piloto** por las dos personas y por el responsable del proyecto | — | A-1-08 | Aprobación escrita en el PR | Los cambios pedidos están hechos y se actualizan AGENTS.md y datos.md si cambia algo del esquema | ✖ |
| A-1-09 | `.htaccess`: redirecciones de [redirecciones.csv](redirecciones.csv) (reglas específicas primero, con `THE_REQUEST` para `/index.html` y `/oviedo/index.html`), HTTPS y host sin www, tipos MIME (`woff2`, `webp`), compresión, caché e `index.html` | `src/.htaccess` | — | Archivo | Revisado contra el CSV fila por fila (la prueba real, en A-3-03) | ✔ |
| A-1-10 | **Entorno de pruebas del `.htaccess`: Apache en Docker** (imagen `httpd`): `docker compose up` sirve `/dist` en `http://localhost:8080` y `https://localhost:8443` para los 4 hosts (`brototermic.com`, `www.`, `.es`, `www.es`), con `mod_rewrite`, `mod_headers`, `mod_deflate` y `mod_expires`; `tools/probar-redirecciones.sh` recorre `redirecciones.csv` y las URL `MANTENER` de `inventario-urls.csv` | `tools/apache-pruebas/`, `tools/probar-redirecciones.sh` | Docker Desktop instalado | Entorno y script | El script da un único 301 al destino exacto por fila y 200 en cada MANTENER (se usa en A-3-03 y antes de cada publicación) | ✔ |

## Día 2: plantillas y páginas de prioridad alta (después de HITO-1)

| ID | Descripción | Archivos | Depende de | Entregable | Terminado cuando | ∥ |
|---|---|---|---|---|---|---|
| **A-2-01** RC | Ejecutar el importador para las **38 categorías restantes** (incluidas las 4 directas), a primera hora | `data/categorias/*.json` | HITO-1, A-1-02 | 38 borradores con `_borrador: true` | Cada JSON tiene el mismo número de productos que `num_productos` en `plan-paginas.csv` | ✖ |
| A-2-02 | Plantillas `familia` e `inicio` (hero, tarjeta de familia, bloque de marcas, bloque de sedes) | `src/templates/familia.html`, `inicio.html` | HITO-1 | Plantillas | Validadas en 360/768/1280 px | ✔ |
| A-2-03 | Plantilla `contacto` + formulario (campos, honeypot, RGPD, validación accesible) + script de envío: el `rd-mailform.php` actual con los mismos nombres de campo, o **`enviar.php`** si no admite el adjunto (excepción PHP aprobada: validación en el servidor, límite de tamaño y lista blanca de tipos del adjunto comprobada con `finfo`, honeypot, RGPD obligatoria, cabeceras saneadas; ver AGENTS.md §2) | `src/templates/contacto.html`, `src/contacto/enviar.php`, `assets/js/formulario.js` | HITO-1; email de destino y tamaño máximo (cliente) | Formulario | Envío probado de principio a fin con adjunto (PDF y JPG), rechazo de un tipo no permitido, de un archivo demasiado grande, sin RGPD y con el honeypot relleno; error y éxito accesibles, también sin JS | ✔ |
| A-2-04 | Plantillas `servicio`, `sede` y `legal` | `src/templates/*.html` | HITO-1 | Plantillas | Wireframes de [diseno.md](diseno.md) §4 | ✔ |
| A-2-05 | Schema completo ([schema.md](schema.md)), `sitemap.xml` (solo URLs MANTENER/NUEVA) y `robots.txt` | `src/partials/schema.html`, `build.js` | A-1-04 | Archivos generados | 0 errores en el validador para cada plantilla; el sitemap tiene 52 páginas + 8 PDF | ✔ |
| **B-2-01** RC | Resistencias (10 categorías): revisar borradores, erratas, alts, intros, metas y title | `data/categorias/resistencias-*.json` | A-2-01 | 10 JSON sin `_borrador` | Definición de terminado por página | ✖ |
| **B-2-02** RC | Control de temperatura (13 categorías): igual que B-2-01 | `data/categorias/controltemperatura-*.json` | A-2-01 | 13 JSON | Ídem | ✖ |
| B-2-03 | Intros y resúmenes de las 4 familias | `data/familias.json` | HITO-1 | Intros | 120-200 palabras, prompt estándar | ✔ |
| B-2-04 | Textos de inicio, fabricaciones a medida y contacto (con los cambios de [plan-contenido.md](plan-contenido.md) §4) | `content/inicio.html`, `fabricaciones-a-medida.html`, `contacto.html` | HITO-1 | 3 fragmentos | Sin superlativos; datos externos en `pendientes` | ✔ |
| B-2-05 | Copiar a `/images/` las imágenes originales de las páginas de prioridad alta (acción ORIGINAL, sin tocar) y las CONVERTIR; preparar el **hero `slide-1` a 910 px** (`slide-1.jpg` optimizado + `slide-1.webp`) | `images/` | Formato aprobado en HITO-1 | JPG (+ WebP del hero) | Mismo nombre que /legacy; el hero a 910 px | ✔ |

## Día 3: resto de páginas, QA y publicación

| ID | Descripción | Archivos | Depende de | Entregable | Terminado cuando | ∥ |
|---|---|---|---|---|---|---|
| **B-3-01** RC | Control de nivel (9) y presión y humedad (2) | `data/categorias/controldenivel-*.json`, `presionhumedad-*.json` | A-2-01 | 11 JSON | Definición de terminado | ✖ |
| **B-3-02** RC | Las 4 directas (ventilación, periféricos, chillers, hornos) | `data/categorias/*.json` | A-2-01 | 4 JSON | Ídem | ✖ |
| B-3-03 | Empresa, nuevos productos, `/oviedo/`, privacidad y cookies (textos desactualizados de plan-contenido §4) | `content/*.html` | HITO-1 | 5 fragmentos | Revisión legal anotada como pendiente si no ha llegado | ✔ |
| B-3-04 | Imágenes de prioridad media y baja: copiar los originales y revisar cada alt con la imagen delante | `images/`, `data/categorias/*.json` | — | Alts revisados | Ningún alt copiado de otra imagen (caso RE92) | ✔ |
| A-3-01 | Mapa web generado desde `familias.json` + página 404 (si se aprueba: ver AGENTS.md §12, Pendientes) | `build.js`, `content/mapa-web.html` | A-2-04 | Páginas | El mapa enlaza las 52 páginas | ✔ |
| **A-3-02** RC | Modo `node build.js --publicar`: validación completa (las 52 páginas, sin borradores ni `[POR VERIFICAR`, cada URL MANTENER del inventario existe en `/dist`) | `build.js` | B-2-01, B-2-02, B-3-01, B-3-02 | Build limpio | Termina sin errores | ✖ |
| A-3-03 | Prueba real de `.htaccess` en el **Apache en Docker** de A-1-10 (y, si el hosting lo ofrece, también en un subdominio de pruebas): un `curl` por fila de `redirecciones.csv` y por URL MANTENER | `tools/probar-redirecciones.sh` | A-1-09 | Informe | Todas las filas devuelven un único 301 al destino; las MANTENER, 200 | ✔ |
| **A-3-04** RC | QA final: Lighthouse móvil (1 página por plantilla, ≥ 90, LCP < 2,5 s), accesibilidad (teclado, contraste, axe), 360/768/1280 px, enlaces rotos, schema | — | A-3-02 | Informe en el PR | Todo en verde o con incidencia anotada y aceptada | ✖ |
| **A-3-05** RC | Publicación según [checklist-publicacion.md](checklist-publicacion.md) (copia de seguridad, subida, comprobaciones posteriores, Search Console) | servidor | A-3-03, A-3-04, accesos FTP | Web publicada | Checklist completo y firmado por A y B | ✖ |

## Ruta crítica

```
A-1-01 → A-1-04 → A-1-05 → A-1-08 → HITO-1 → A-2-01 (importar 38) → B-2-01 + B-2-02 + B-3-01 + B-3-02 (revisar 38 categorías) → A-3-02 → A-3-04 → A-3-05
                    ↑                ↑
       B-1-03 (familias.json)   B-1-05 + B-1-06 (imágenes y contenido del piloto)
```

- **El tramo más largo es la revisión de las 38 categorías por la Persona B** (unos 250 productos y 38 intros). El importador (A-1-02) existe para recortarlo: B revisa en lugar de transcribir.
- **Dependencias externas que pueden parar la ruta:** acceso FTP y copia de seguridad (bloquean A-3-05) y la decisión sobre el formulario (bloquea A-2-03, y contacto es una página que hay que mantener).
- **Riesgo paralelo:** casi ninguno con las imágenes desde el HITO-1: se usan los originales y solo se retocan 3.

## Si no da tiempo: qué se recorta y en qué orden

Se recorta de arriba abajo, solo lo necesario:

1. **Retoque de las 3 fotos con dominante de color:** si no da tiempo, se publican los originales y se sustituyen después (la URL no cambia).
2. **Página 404 personalizada:** se queda la de Apache.
3. **Intros de las categorías de prioridad baja (12):** se publican sin intro y se añade en los 7 días siguientes. Los productos, el title, la meta y el H1 sí van completos.
4. **Enlaces cruzados (`relacionadas`) y lateral sticky** de la plantilla de categoría.
5. **Logos SVG en el bloque de marcas:** se muestran los nombres en texto.
6. **`nuevos-productos.html`:** se publica con el texto de /legacy y las erratas corregidas, sin reescribir.

**Nunca se recorta:** las 52 URLs, las 17 reglas de redirección y la regla 404 del `.es`, title, meta y H1 únicos, todos los productos, canonical, sitemap, robots, el formulario funcionando, los enlaces `tel:`, el contraste AA y la copia de seguridad.

**Último recurso:** retrasar la publicación. La web antigua sigue funcionando mientras tanto, y no se conoce ninguna fecha límite externa [POR VERIFICAR con el cliente].
