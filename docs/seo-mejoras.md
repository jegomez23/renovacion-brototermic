# Mejoras SEO para la entrega y el seguimiento

> Fecha: 2026-10-13. Lectura de `main` / `origin/main` en `bbdbe79` y de `origin/revision/complemento-b` en `ada1d14`, sin fusionar esa rama. Este documento registra propuestas y comprobaciones de lectura; no acredita cambios aplicados, aprobación comercial, PageSpeed ni publicación. AGENTS.md manda. Las decisiones D-014 a D-019 se han consultado en la rama de Juan porque todavía no están en main.

## Prioridades, riesgo y responsables

**Segura** conserva URLs, texto técnico e intención histórica. **Con GSC** necesita consultas, clics e impresiones de Search Console antes de decidir. **Arriesgada** afecta identidad, catálogo, datos comerciales o migración y queda pendiente de confirmación. Una propuesta segura sigue necesitando el test del proyecto cuando se implemente.

| Prioridad | Propuesta concreta | Riesgo | Esfuerzo orientativo | Responsable / dependencia | Estado comprobado |
|---|---|---|---|---|---|
| P0 | Mantener las imágenes históricas en su URL; nuevos ambientes con nombre nuevo, JPG de respaldo y WebP | Segura | 30 min de revisión por tanda | B: imágenes; A: HTML/build | D-011 ya establece publicación de históricos; inventario adjunto |
| P0 | Alts D-014 en páginas altas: nombre y modelo de /legacy primero, descripción visual después | Segura | Tandas de 30-45 min | B: revisión visual; A: validación | No se han aplicado alts en esta tarea; no duplicar lo hecho en complemento-b |
| P0 | Medir móvil en la demo: inicio, inmersión y contacto, con URL, fecha y reporte | Segura | 30-60 min | A; requiere demo accesible | Pendiente. Las cifras históricas de estado.md no son mediciones de hoy |
| P1 | Transcribir literalmente Tabla-fabricacion.jpg a tabla HTML, manteniendo la imagen | Segura tras lectura y doble revisión de cifras | 1-2 h | B: transcripción; A: marcado y auditor | Pendiente: no inferir celdas ilegibles ni adaptar unidades |
| P1 | Comprobar los enlaces cruzados existentes y mejorar su contexto próximo al producto, sin nuevas afirmaciones | Segura | 30-60 min | A/B; esperar integración si toca archivos de Juan | Las relaciones de arquitectura ya existen en los JSON de main |
| P1 | Añadir og:image representativa donde falta, con ruta absoluta, medidas y alt si procede | Segura | 30-60 min | A; imágenes definitivas | head.html ya admite pagina.ogImagen; no usar logo como imagen universal |
| P2 | Extender el sitemap con imágenes reales relevantes si la revisión de indexación descubre carencias | Segura técnicamente; retorno por verificar | 1-2 h | A; pruebas de XML y URLs | No sustituye el sitemap de 52 HTML + 8 PDF; no incluir demo |
| P2 | Revisar CTR e intención en titles/metas con comparación de 4-8 semanas | Con GSC | 1-2 h | A + cliente: acceso GSC | Pendiente; mantener keyword y Vitoria |
| P2 | Unificar NAP visible con site.json y revisar LocalBusiness existente | Segura para formato; arriesgada si cambia el dato | 30-60 min | B/A; cliente confirma dirección externa | Vitoria completa sigue marcada como dato externo; no añadir geo ni horario |
| P2 | Completar Google Business Profile de cada sede elegible y confirmada | Arriesgada sin validación comercial | 1-2 h | Cliente | No se ha accedido, creado ni editado ninguna ficha |
| P3 | Eliminar o fusionar páginas de pocos productos, cambiar slug o canonical | Arriesgada; fuera de alcance | — | Cliente/A + GSC | No aplicar: incumpliría conservación de URLs y podría perder consultas de modelos |

## Enlazado entre categorías: conservar y hacer visible lo que ya existe

Los campos `relacionadas` de main ya contienen las relaciones siguientes. No se presentan como enlaces nuevos entregados. Toda adaptación debe quedar escrita en HTML, funcionar sin JS y apuntar a la URL canónica desde raíz. Los anchors deben nombrar el destino; no atribuir compatibilidad entre modelos si el histórico no la confirma.

| Origen → destino | Respaldo concreto | Acción de bajo riesgo |
|---|---|---|
| `/resistencias-tipo-cartucho.html` → `/controltemperatura-sondastemperatura.html` | `legacy/com/brototermic.com/resistencias-tipo-cartucho.html:233-235`: Cartuchos con termopar y sonda incorporada | Mantener «Sondas de temperatura» cerca del bloque de cartuchos con termopar |
| `/controldenivel-sensores-conductivos.html` ↔ `/controldenivel-reles-de-nivel.html` | Histórico de conductivos, líneas 134-135 y 151: conexión necesaria a relé | Anchor «Relés de nivel para líquidos conductivos»; no asignar un relé concreto sin fuente |
| `/presionhumedad-sondas-de-humedad.html` → `/controltemperatura-dataloggers.html` | Histórico de dataloggers, líneas 141-144: Log-Tag HAXO-8 registra humedad y temperatura | Anchor «Dataloggers de temperatura y humedad» |
| `/controltemperatura-sondastemperatura.html` → accesorios, cables de compensación y convertidores | Productos correspondientes en /legacy; arquitectura §4 y sus tres `relacionadas` en main | Mantener el bloque existente; no prometer compatibilidad universal |
| `/resistencias-calentamientoaire.html` → `/resistencias-atex.html`; ATEX ↔ mantas | Aerotermo Industrial ATEX y mantas ATEX presentes en ambos grupos históricos | Enlazar por nombre; no cambiar certificaciones ni normativa del producto |
| Sensores de presión de nivel ↔ presión industrial | Dos catálogos distintos, CNM frente a TPSP/TPSM, conservados en /legacy | Anchors «Sensores de nivel por presión» y «Sensores de presión industriales» |
| Categorías de resistencias → `/resistencias-especiales-a-medida.html` | Histórico de fabricación especial, texto previo al programa de fabricación | Conservar el enlace; enfatizar pedir presupuesto o adjuntar plano sin anunciar plazos |

El bloque de sectores también es enlazado contextual: solo los nueve sectores documentados en arquitectura §3 y sus categorías de origen. No crear páginas por sector para la entrega.

## Titles, metas e intención de búsqueda

La intención se toma de los títulos históricos y los nombres de productos, no de un volumen de búsqueda supuesto. Ejemplos existentes comprobados en `plan-paginas.csv`:

| URL | Title actual propuesto y longitud | Intención que conserva | Meta: longitud |
|---|---|---|---|
| `/resistencias-tipo-cartucho.html` | Resistencias tipo cartucho \| BROTOTERMIC Vitoria (48) | Tipo de resistencia; alta/baja carga, termopar y expan en meta | 153 |
| `/controltemperatura-sondastemperatura.html` | Sondas de temperatura \| BROTOTERMIC Vitoria (43) | Sondas; tipos de termopar y termorresistencia históricos en meta | 155 |
| `/controldenivel-sensores-de-presion.html` | Sensores de nivel por presión \| BROTOTERMIC Vitoria (51) | Nivel: catálogo CNM para sólidos | 151 |
| `/presionhumedad-sensores-de-presion.html` | Sensores de presión industriales \| BROTOTERMIC Vitoria (54) | Presión industrial: transmisores TPSP/TPSM y detectores | 151 |

No se propone cambiar estos valores ahora. Si se toca el CSV, pasar `node tools/validar-plan.js`; sincronizar datos y plan y conservar una sola H1, la keyword histórica, ≤60 caracteres de title y 140-155 de meta. La excepción del inicio se mantiene. Google puede generar un title distinto a partir de varias señales; el límite de 60 es una regla de este proyecto, no una garantía de visualización. [Guía oficial de titles](https://developers.google.com/search/docs/appearance/title-link).

**Pendientes con GSC:** las seis keywords marcadas en el plan (inicio, contacto, empresa, Oviedo, transductores magnéticos, accesorios para sondas). Guardar antes de migrar consultas y páginas de ambos dominios; comparar después clics, impresiones, CTR y posición por consulta/URL, también búsqueda de imágenes. No retirar Vitoria para introducir Oviedo en categorías históricas, ni interpretar falta de clics como permiso para borrarlas.

## Páginas con pocos productos

El plan contiene ocho categorías con 0-2 productos: especiales a medida (0), ultrasonidos (1), planas, videoregistradores, paneles PC/software, equipos de medición, transductores magnéticos y niveles rotativos (2 cada una). Es un recuento del plan, no un diagnóstico de poco valor SEO.

- **Especiales a medida:** conservar programa de fabricación y `broto-fabricacion.jpg`; pasar `Tabla-fabricacion.jpg` a tabla HTML accesible con `caption` y encabezados. La imagen histórica está enlazada en /legacy, línea 173, y el programa explica la tabla desde la línea 131. Mantener el JPG publicado y en la página; leer las cifras con la imagen al 100 %, sin completar celdas por lógica. El nombre y las mayúsculas del archivo no cambian.
- **Ultrasonidos:** mantener SNU30P-1, fotografía y datos exactos. Mejorar la navegación a su familia, presupuesto del modelo y categorías relacionadas existentes; no agregar tecnologías o prestaciones.
- **El resto:** intro de 120-200 palabras respaldada, PDF donde ya exista y estructura legible de datos. No rellenar con FAQs que introduzcan promesas, ni duplicar productos de otras categorías para aumentar el recuento.
- **Nuevos productos:** conservar productos y enlaces de origen. Su vigencia está pendiente del cliente; no añadir fechas, stock, novedades ni redirigirla a otra categoría por conveniencia.

## Imágenes nuevas y rendimiento

Las imágenes de ambiente deben mostrar un contexto industrial genérico, sin identificar una sede ni un producto vendible. Su función es visual, no acreditar instalaciones o procesos propios. Nombre nuevo descriptivo en `/images/`, JPG y WebP, derivados con anchos reales, `sizes` y `srcset`; ningún descriptor puede afirmar un ancho superior al archivo. `width`/`height` reservan espacio. La imagen de primera pantalla no lleva lazy; las demás, sí. Repetir mediciones tras integrar, con accesibilidad 100, CLS 0 y Lighthouse móvil ≥90 como objetivos de aceptación.

Para SEO de una imagen relevante usar `<picture><img src="…jpg" alt="…"></picture>` cerca del contenido asociado; Google descubre el `src` y recomienda respaldo aun usando srcset. Los fondos puramente decorativos pueden seguir en CSS y no requieren alt. No prometer indexación de fondos CSS. Alts de ambiente describen lo visible y pueden indicar «ilustración de ambiente industrial»; nunca «taller de BROTOTERMIC». Los alts de producto siguen D-014 y conservan nombre/modelo. Google aconseja nombres descriptivos y alt útil, sin acumulación de keywords. [Guía oficial de imágenes](https://developers.google.com/search/docs/appearance/google-images).

`og:image` es una mejora de presentación y señal de imagen preferida, no una promesa de posicionamiento. Seleccionar una imagen representativa sin placas ni texto generado y no ampliar un JPG pequeño del catálogo para simular resolución. Las imágenes de D-016 son exclusivas de preview; no entran en sitemap ni en hosting del cliente.

## SEO local y lista para Google Business Profile

Fuente de NAP: `data/site.json`. Respaldo histórico de teléfonos en `legacy/com/brototermic.com/contacto/contacto.html:122-123`; dirección de Oviedo en línea 118. Actividad y ámbito en `legacy/com/brototermic.com/empresa.html:140` (País Vasco y provincias limítrofes). No convertir «limítrofes» en una lista inventada de provincias.

| Campo | Vitoria | Oviedo | Condición |
|---|---|---|---|
| Página | `/contacto/contacto.html` | `/oviedo/` | Canonical propio; .es conserva únicamente las 301 conocidas |
| Teléfono | 945 22 33 31 | 629 462 642 | Enlaces tel con prefijo +34 |
| Dirección | C/ Pintor Mauro Ortiz de Urbina, 7 bajo; 01008 | Llano Ponte nº 8 bajo; 33011 | Vitoria completa es dato externo pendiente; CP Oviedo corregido por decisión |
| Email | info@brototermic.com | brototermic@brototermic.com | Enlaces mailto |
| Geo / horario / actividad de delegación | Sin completar | Sin completar | Cliente confirma antes de añadir schema o ficha |

Lista de preparación para el cliente, sin ejecutar cambios externos:

- Confirmar actividad, atención presencial, dirección exacta, teléfono directo y elegibilidad de cada ubicación; comprobar si ya hay fichas y quién las administra. Evitar duplicados.
- Usar nombre comercial real BROTOTERMIC; no añadir keywords, localidades o «ATEX» al nombre de la ficha.
- Elegir categorías del selector de Google que describan la actividad real; la selección queda al responsable comercial, sin inventar una categoría disponible.
- Confirmar horarios habituales y especiales; aportar fotografías reales autorizadas de fachada, entrada, interior y equipo. Las imágenes generadas no sirven como prueba de sede.
- Vincular Vitoria con contacto y Oviedo con su landing propia; comprobar NAP consistente en web y ficha antes de guardar cambios. Confirmar áreas servidas; no usar oficina virtual ni dirección supuesta.
- Preparar descripción sin certificaciones, stock, tiempos de respuesta ni plazos no confirmados; revisar vigencia de marcas antes de destacarlas.
- Anotar responsable de ficha y permisos mínimos; el cliente revisa y publica. Ninguna ficha ni mensaje a terceros se ha enviado en esta tarea.

Google exige representar de forma exacta el negocio y su nombre real; los datos de una ficha deben describir la ubicación y actividad elegibles. [Directrices oficiales del Perfil de Empresa](https://support.google.com/business/answer/3038177?hl=es).

## Evidencias y cierre pendiente

Esta revisión ha leído AGENTS completo, estado, decisiones de main, decisiones y revisión de complemento-b, CSV, JSON y los HTML históricos citados. Se han contado 318 filas de imagen, 97 de prioridad alta y las ocho categorías de 0-2 productos. Los recuentos no sustituyen el auditor generado.

Tras implementar: `npm run test` antes de cada commit; `npm run validar`, `npm run build` y `npm run build:preview` donde exista el script tras integrar Juan. Guardar reportes y capturas de páginas tocadas. Registrar PageSpeed con URL y fecha, sin reciclar cifras antiguas. En este documento no se declaran ejecutadas esas pruebas ni medidas. `build:publicacion` continúa condicionado por datos confirmados, borradores, formulario y checklist de despliegue.
