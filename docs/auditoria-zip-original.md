# Auditoría del ZIP original — informe saneado y resolución

Fecha de auditoría: 2026-10-13. Cierre verificado: 2026-10-14. Rama: `fix/zip-rutas-historicas`, creada desde `main` actualizado a `1cc455b2f98f46326982c6bc1eb75554bbe0fb16`. Sin commit, push, merge ni publicación en este bloque.

## Alcance y conservación del trabajo

Se reutilizó el inventario ya realizado: **2.394 archivos**, 250 directorios, 1.255 contenidos únicos y 1.139 duplicados por hash, en un ZIP de 1.310.582.096 bytes. Incluía el sitio, copias, recursos, procesadores PHP, configuración y registros; no era exclusivamente código publicable. No se repitió la auditoría completa ni Lighthouse. No se ejecutó código del ZIP ni se extrajo dentro del repositorio.

La comparación previa verificó 435 archivos con la misma ruta en el sitio `.com` de `/legacy`, todos idénticos, incluidos sus 52 HTML activos. Se conservaron los 266 productos de las 39 categorías. El ZIP tenía 20 PDF con 10 contenidos únicos; los ocho catálogos canónicos estaban presentes. `/legacy` era fiel a lo descargado por HTTP, pero **no constituía una copia completa del hosting**: faltaban rutas alternativas, configuración privada y recursos que no se habían descargado. No se equiparan esas ausencias con pérdidas de productos.

Los informes originales completos permanecen localmente en `~/Downloads/brototermic-auditoria-originales-2026-10-13/`, fuera del repositorio, con permisos 700 para la carpeta y 600 para los archivos. Este informe y el CSV son versiones saneadas, centradas en los **3 críticos y 9 importantes**. Los registros de tráfico, cuentas privadas, valores de credenciales y sus huellas no se incorporan. Los números de respuestas históricas son agregados, no peticiones nuevas a producción.

Antes de cambiar de rama había solamente los dos informes sin seguimiento y ningún cambio en archivos versionados. Se protegieron antes de actualizar `main` mediante avance rápido y crear la rama de corrección. No se modificó la rama de Juan.

## Seguridad: alcance y responsables

La comparación exacta de los valores secretos del ZIP contra el árbol actual y el índice de Git no encontró coincidencias, incluidos los informes originales y los informes comprimidos `.gz`. El análisis inicial cubrió 1.184 archivos; la comprobación final del árbol cubrió 1.185, sin coincidencias. El índice se comprobó por separado. **No es un escaneo completo del historial ni una verificación del hosting remoto.**

Hay dos secretos distintos en tres ubicaciones: una contraseña de la misma cuenta SMTP repetida en dos configuraciones y una clave privada reCAPTCHA. Que SMTP figure desactivado en esas configuraciones no demuestra que la contraseña sea inocua o esté revocada. El titular debe rotar la contraseña, comprobar reutilización y revocar o rotar la clave privada reCAPTCHA. La renovación no necesita esos secretos.

Las claves públicas de navegador de Maps y reCAPTCHA ya existentes en `/legacy` son un asunto separado, documentado en AGENTS.md §10. Se conservan conforme a esa decisión; el cliente debe restringir o revocar Maps. No se añaden, reutilizan ni reproducen sus valores aquí. No se reescribe el historial.

## Matriz de los doce hallazgos

Las rutas de PHP/configuración se refieren al interior de `web-broto/` en el ZIP; no se han incorporado al código renovado.

| ID / severidad original | Ruta y evidencia | Riesgo real | Estado y acción |
|---|---|---|---|
| C1 · crítico | `contacto/bat/rd-mailform.config.json:6`. Contraseña SMTP en el ZIP; useSmtp=false; mismo secreto y cuenta que C3. Sin coincidencias en árbol actual ni índice. | Exposición en la copia original; vigencia no comprobada. No es una fuga introducida por la renovación. | **PENDIENTE HOSTING**. Rotar la contraseña de esa cuenta y comprobar reutilización y accesos. No publicar configuración antigua. |
| C2 · crítico | `contacto/bat/rd-mailform.php:50`. Clave privada reCAPTCHA en el ZIP; ausente del árbol actual y del índice. | Secreto antiguo expuesto; uso y vigencia por confirmar. La web renovada no usa reCAPTCHA. | **PENDIENTE TITULAR**. Revocar o rotar la clave privada desde la cuenta responsable, coordinando cualquier formulario antiguo aún activo. |
| C3 · crítico | `oviedo/contacto/bat/rd-mailform.config.json:6`. Misma contraseña y cuenta SMTP que C1, también useSmtp=false. | Duplicado de C1: tres ubicaciones críticas, pero solo dos secretos distintos. | **DUPLICADO DE C1**. Una rotación de la misma cuenta; retirar ambas copias de la configuración antigua del hosting cuando proceda. |
| I1 · importante | `bat/MailHandler.php:2,38`. El PHP original obtiene owner_email de POST y lo usa como destinatario de mail(). El archivo no existe en dist. | Posible abuso del endpoint antiguo si continúa accesible; no es una capacidad que deba recuperarse. | **PENDIENTE HOSTING**. Comprobar retirada del endpoint antiguo y otros procesadores obsoletos al activar y verificar enviar.php. No ejecutado ni restaurado. |
| I2 · importante | `/docs/DISPLAYS DIGITALES PROGRAMABLES BROTOTERMIC HR.PDF`. Mismos bytes que la ruta con .pdf; 62 respuestas 200 y una 206 en registros originales agregados. | La variante exacta falla en sistemas sensibles a mayúsculas si no se conserva. | **CORREGIDO**. Alias interno 200 al PDF existente, MIME y caché comprobados; sin renombrar ni duplicar el archivo. |
| I3 · importante | `/docs/catalogo-resistencias-calefactoras.pdf`. 95 respuestas 200 históricas; idéntico al PDF de legacy/com/brototermic.com/oviedo/docs/, distinto al catálogo enlazado. | Pérdida real de la URL pública. Las fechas no determinan cuál es el catálogo vigente. | **RUTA CORREGIDA; VIGENCIA PENDIENTE CLIENTE**. Generar la ruta desde legacy, con bytes idénticos, sin enlazarla ni añadirla al sitemap. Cliente confirma la edición comercial y las redirecciones ya aprobadas. |
| I4 · importante | `/google960f37cc2aefc699.html`. Archivo con formato válido de verificación presente en el ZIP, ausente en la renovación; dos respuestas 200 en registros originales. | Solo supone pérdida de verificación si la propiedad depende de ese método; no probado desde el repositorio. | **CONDICIONAL; PENDIENTE CLIENTE**. Titular comprueba propiedad y método en Search Console. Restaurar únicamente si sigue siendo necesario y de su titularidad. |
| I5 · importante | `/images/brototermic-control-telefonico-gsm.jpg`. 27 respuestas 200; bytes presentes con nombre brototermic-CONTROL-TELEFONICO-GSM.jpg. | URL histórica perdida por diferencia de mayúsculas. | **CORREGIDO**. Alias interno 200 al original existente; foto sin modificaciones. |
| I6 · importante | `/images/brototermic-cronotermostato-semanal-radiofrecuencia.jpg`. 30 respuestas 200; bytes presentes con nombre brototermic-Cronotermostato-semanal-radiofrecuencia.jpg. | URL histórica perdida por diferencia de mayúsculas. | **CORREGIDO**. Alias interno 200 al original existente; foto sin modificaciones. |
| I7 · importante | `/oviedo/contacto-brototermic-oviedo.html`. 11 respuestas 200 históricas; faltaba regla específica; contenido de la delegación conservado en /oviedo/. | 404 de una página histórica con tráfico. | **CORREGIDO**. 301 directa a https://brototermic.com/oviedo/, conservando consulta y sin cadenas en HTTP/HTTPS con/sin www. |
| I8 · importante | `/oviedo/images/ebm-papst-brototermic-oviedo.jpg`. Una respuesta 200 histórica; bytes presentes con nombre Ebm-Papst-brototermic-oviedo.jpg. | URL histórica perdida por diferencia de mayúsculas. | **CORREGIDO**. Alias interno 200 al original existente; foto sin modificaciones. |
| I9 · importante | `/oviedo/images/eliwell-papst-brototermic-oviedo.jpg`. Una respuesta 200 histórica; bytes presentes con nombre eliwell-Papst-brototermic-oviedo.jpg. | URL histórica perdida por diferencia de mayúsculas. | **CORREGIDO**. Alias interno 200 al original existente; foto sin modificaciones. |

## Correcciones aplicadas

1. Cinco variantes exactas de mayúsculas se sirven mediante reescrituras internas 200: un PDF y cuatro fotografías. No se renombra ni se duplica ningún original. Se conserva la caché mensual del PDF con extensión mayúscula.
2. Se recupera la URL raíz `/docs/catalogo-resistencias-calefactoras.pdf` desde el PDF idéntico ya versionado en `/legacy`. No se importa el ZIP ni se modifica el catálogo enlazado. No se promociona la edición recuperada en navegación o sitemap.
3. El contacto antiguo de Oviedo tiene una 301 directa a `/oviedo/`, antes de las reglas generales de host y protocolo.
4. El auditor de archivos usa las reglas reales del `.htaccess`. Su simulador comprueba la grafía exacta de cada componente, evitando falsos 200 en macOS. También conserva consultas en redirecciones, como Apache.
5. El inventario pasa de 77 a 84 URL: 63 MANTENER, 16 REDIRIGIR y 5 NUEVA. Hay 18 reglas 301 y una regla 404 en el CSV. El contrato del `.es` no se amplía.

**Precisión respecto al encargo:** son seis URL de recursos perdidas, pero solo **cinco** son variantes de mayúsculas. La sexta es un catálogo con nombre diferente. Sumando el contacto de Oviedo, se corrigen **siete URL**.

## Catálogos: existencia y fechas, sin decidir vigencia

| Rutas dentro del ZIP | Comparación | Metadatos internos PDF |
|---|---|---|
| `docs/catalogo-resistencias-calefactoras.pdf`, `docs/CATALOGO-Brototermic-Cfor-2017.pdf`, `docs/catalogo-resistencias-calefactoras-xx.pdf`, `oviedo/docs/catalogo-resistencias-calefactoras.pdf` | Cuatro copias idénticas; los bytes ya existían en `/legacy` | Creación: 2017-07-17 08:41:37 +02; modificación: 08:51:26 +02 |
| `docs/catalogo-Brototermic-resistencias.pdf` | Distinto de las cuatro copias anteriores; sigue siendo el catálogo enlazado | Misma fecha y horas internas de julio de 2017 |
| `docs/catalogo-instrumentacion.pdf` | Conservado en la renovación | Creación/modificación: 2017-09-26 17:47:21 -01 |

Las marcas de copia del ZIP son del 2026-10-08. Ninguna de estas fechas acredita vigencia comercial. Se corrige la redacción que presentaba 2024/2021 como fechas de edición en el motivo de una redirección. **No se cambia el destino aprobado de los catálogos de Oviedo y del `.es`**; su validación sigue pendiente del cliente. Los nombres alternativos no enlazados siguen documentados en la copia privada del inventario; no se restauran en lote.

## Pruebas y límites

Entorno: Node v24.13.0, Apache nativo 2.4.62 de macOS. Solicitudes exclusivamente a `127.0.0.1`, HTTP y HTTPS con certificado local, cuatro variantes de host, sin ejecutar PHP ni contactar a producción. Servidores de prueba detenidos al terminar.

| Comprobación | Resultado |
|---|---|
| `npm run test` | Correcto: build piloto, auditor SEO, comprobación de dist, rutas históricas y lista blanca |
| Build piloto incluido en `test` | 55 páginas; 8 PDF canónicos + 1 histórico sin enlazar |
| Auditor SEO, modo publicación | 77 OK / 8 AVISO / 0 ERROR; 11 mutaciones previas detectadas |
| `node tools/test-rutas-historicas.js` | 7 rutas, 5 mutaciones detectadas, hash de catálogo, hosts/protocolos y contrato `.es` correctos |
| `node tools/test-apache.js`, `AllowOverride All` | 727 solicitudes correctas, 0 fallos |
| Misma prueba, `AllowOverride FileInfo` | 727 solicitudes correctas, 0 fallos |
| Alias de recursos en Apache | Bytes, MIME, caché y cabeceras de seguridad correctos |
| `npm run build:preview` | Correcto; 55 páginas de demostración noindex |
| `git diff --check` y `git diff --cached --check` | Sin errores; 15 archivos preparados, sin cambios de imágenes, `/legacy`, contenido técnico ni datos comerciales |
| Docker / `tools/probar-redirecciones.sh` | No ejecutados: Docker no está instalado y Bash local 3.2 no admite el array asociativo del script. La prueba nativa anterior sí se ejecutó, pero no sustituye la condición de publicación de AGENTS.md |

Las primeras ejecuciones detectaron la consulta perdida en el simulador y la falta de caché del PDF `.PDF`; se corrigieron y se repitieron las pruebas afectadas. Los avisos restantes son los ya conocidos: keywords pendientes de GSC, catálogo vigente, borradores, revisión legal y datos externos. No se ejecutó ni se declaró aprobado `build:publicacion`.

## Cierre de la sesión interrumpida — 2026-10-14

- Se recuperó el proceso pendiente `comprobar-secretos.py`: terminó con **código 0**, con 1.185 archivos comprobados y ninguna coincidencia en el árbol o en el índice. No hubo un fallo final de esa verificación.
- El proceso Python anterior que ejecutaba Apache sí devolvió **código 1**: detectó la ausencia de `Cache-Control` en el alias `.PDF`, con 726/727 solicitudes correctas en cada configuración. Fue un fallo real, corregido antes de las ejecuciones finales de 727/727. Los mensajes `xcrun_db … Operation not permitted` proceden de la caché de herramientas de macOS dentro del entorno restringido; no equivalen a un hallazgo de secretos. La comprobación posterior fuera de esa restricción terminó con código 0.
- Se revisaron los 15 archivos preparados y los resultados JSON de Apache: **727 solicitudes, cero errores**, tanto con `All` como con `FileInfo`. La fuente `src/.htaccess` coincide byte a byte con `dist/.htaccess`. No se volvió a ejecutar la batería Apache completa.
- Se repitió únicamente `node tools/test-rutas-historicas.js`: siete rutas correctas y cinco mutaciones detectadas. Se conservaron los resultados aprobados de `npm run test` y `build:preview`; no hubo nuevos cambios de código que exigieran repetirlos.
- Los Markdown y CSV saneados se comprobaron contra los secretos, cuentas y servidores de las configuraciones originales: **cero coincidencias**. También se revisaron patrones de claves privadas, claves Google/reCAPTCHA, tokens y correos: cero coincidencias en ambos informes. El índice de los 15 cambios no incorpora los secretos conocidos. Esto no certifica todo el historial ni servicios externos.
- Los dos informes originales privados mantienen los mismos hashes que sus copias de respaldo, con permisos 600. No están incluidos en Git. Ningún archivo temporal, registro, ZIP ni credencial se añade al índice.
- Estado de entrega: **15 archivos preparados; cero modificaciones sin preparar y cero archivos sin seguimiento**. `git diff --check` y `git diff --cached --check` sin errores. `main` y la rama de Juan no se modificaron durante este cierre. Commit y push pendientes de autorización.

## Pendientes y criterio de entrega

- **Hosting/titular:** rotar los dos secretos distintos, comprobar reutilización y retirar los PHP antiguos cuando el nuevo envío funcione. No se ha probado el envío real ni alterado servicios externos.
- **Cliente:** confirmar edición comercial de catálogos y si Search Console necesita el archivo de verificación HTML. Su ausencia no demuestra por sí sola pérdida de propiedad.
- **Antes de publicar:** ejecutar las pruebas Docker exigidas por AGENTS.md y verificar las condiciones del hosting; permanecen la revisión editorial/legal, configuración del formulario y demás bloqueos ya documentados.
- **Demostración:** no se ha demostrado una vulnerabilidad crítica introducida en la renovación por estos doce hallazgos. Las siete pérdidas de URL se corrigen localmente. Puede revisarse la demo manteniendo el envío desactivado y las marcas de demostración; esto no autoriza publicación ni certifica la seguridad del hosting antiguo.

No se tocaron fotografías, textos técnicos, datos comerciales, componentes visuales ni dependencias. Los cambios quedan para revisión y autorización; ningún commit ni push se ejecuta en este bloque.
