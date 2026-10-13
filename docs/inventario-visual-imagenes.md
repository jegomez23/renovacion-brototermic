# Inventario visual: piloto y prioridad alta

> Fecha: 2026-10-13. Base leída: main bbdbe79; complemento-b ada1d14, solo lectura. Inventario de archivos existentes y propuestas; no acredita retoques, imágenes generadas, aceptación comercial ni inspección visual terminada. /legacy permanece intacto.

## Alcance y prioridad

El plan de imágenes tiene 318 filas; **97 de prioridad alta**, incluidas fotografías, esquemas, banners, logos y tabla. «Alta» no significa que todas las imágenes deban retocarse. Se han leído dimensiones de cabeceras y bytes de archivos reales y comparado cada copia del repo con su fuente; los resultados están abajo.

Tres rutas altas `portada-*` son copias del inicio, nuevas frente a /legacy: temperatura procede de `legacy/com/brototermic.com/images/slide-3.jpg`; nivel, de `slide-4.jpg`; resistencias, de `legacy/com/brototermic.com/oviedo/images/electticfor-brototermic-oviedo.jpg`. En complemento-b Juan ya propone otros derivados y recetas. No se deben duplicar ni sobrescribir antes de integrar su trabajo.

Orden de tratamiento:

1. Las **tres fotos piloto** siguientes: fondo e iluminación del fondo, sin alterar producto, rótulos, color ni medidas. Marco 4:3 con contain en CSS; el JPG sigue siendo 260 × 168, sin recortar ni ampliar.
2. Fotos de categorías altas de resistencias: inmersión, aire, flexibles, cartucho, abrazadera, ATEX, mantas. Primero hoja al tamaño real; retocar solo las que tengan fondo separable y problema comprobado. No se presume dominante en todas.
3. Sondas altas: revisar alts D-014 mirando cada foto; nombre y modelo históricos primero. El cruce PTC/NTC y sus marcas de agua, documentados en revisión-sesion-b R-04, requieren confirmación del cliente; no intercambiar imágenes ni borrar marcas.
4. Conservar sin retoque automático logos, marcas, esquemas, tabla de fabricación, folletos y fotos de sedes. Pedir imágenes oficiales cuando el fondo no se separa del producto o aparece una marca de agua.

## Piloto: criterio de aceptación

| Foto | Producto en resistencias-inmersion | Problema documentado en D-005 | Tratamiento admisible |
|---|---|---|---|
| brototermic-industriaalimentaria.jpg | Resistencias inmersión industria | Borde amarillo/oscuro, RGB histórico medio 212,211,194 | Solo fondo; conservar piezas claras, conexiones y rótulos |
| brototermic-calefactores.jpg | Grupos calefactores con bridas | Borde crema, RGB 249,243,235 | Solo fondo; conservar bridas, tubos, caja y color |
| brototermic-liquidos-noagresivos.jpg | Calentadores para líquidos | Borde beige, RGB 234,232,226 | Solo fondo; no confundir piezas claras con fondo |

Guardar original decodificado, máscara binaria de fondo, banda de transición explícita y resultado antes de codificar. Contar los píxeles RGB distintos **fuera de fondo y transición**: objetivo 0. Guardar máscara, informe y hoja antes/después en `docs/imagenes-antes-despues/`; inspeccionar límite del producto al 100 % o más. Si la máscara invade piezas o no se puede justificar, conservar original y documentar pendiente.

JPEG tiene pérdida: recodificar puede cambiar píxeles de producto aunque el retoque solo afecte al fondo. El informe debe separar preservación del buffer previo a exportar y diferencia del JPG final. No declarar que un JPG recodificado conserva exactamente los píxeles sin medirlo. Tampoco aplicar ajuste global de color, nitidez, saturación, clonación ni ampliación.

**Ejecución posterior de comparación:** se han recibido tres propuestas reales de imagegen (1560 × 1008), inspeccionado al tamaño original y **rechazado las tres**: recrean detalles del producto y amplían generativamente. [Hoja local antes/después](imagenes-antes-despues/piloto/index.html), fuentes PNG, tres máscaras rectangulares conservadoras, mapas de diferencias y JSON están en `imagenes-antes-despues/piloto/`. No se ha sustituido ninguna fotografía del catálogo ni aprobado un retoque.

Las máscaras de rechazo **incluyen fondo y no son segmentación exacta**. Tras normalizar a 260 × 168 para comparar, presentan 33.531/33.600, 27.718/27.720 y 43.648/43.680 píxeles diferentes en las zonas protegidas. No se atribuyen todos esos cambios al producto: también hay fondo y remuestreo. Los JSON separan diferencias antes de JPG y pérdida de exportación JPEG. El rechazo combina inspección visual y prohibición de ampliación generativa, no solo estos conteos.

## Lista propuesta para ambientes nuevos

Estos nombres son propuestas, no archivos producidos. Generar sin texto, placas, certificaciones, logos ni edificios atribuibles a las sedes. Revisar cada máster al 100 % y registrar rechazo o aceptación antes de integrar.

| Prioridad | Uso | Nombre base nuevo sugerido | Escena y condición |
|---|---|---|---|
| A1 | Resistencias | ambiente-proceso-termico | Detalle metálico con luz cálida, sin producto del catálogo |
| A1 | Temperatura | ambiente-supervision-industrial | Línea de proceso genérica, sin pantallas legibles ni sondas identificables |
| A1 | Nivel | ambiente-depositos-industriales | Depósitos y tuberías sin placas ni sensores identificables |
| A1 | Presión/humedad | ambiente-tuberias-proceso | Tuberías sin manómetros con cifras, marcas ni modelo atribuido |
| A1 | Fabricación a medida | ambiente-mesa-trabajo-tecnico | Herramientas y papel sin palabras ni cotas; no acreditar taller propio |
| A1 | Hero Oviedo | ambiente-industrial-asturias | Ambiente industrial interior genérico, sin simular la sede o su geografía |
| A2 | Fondo de sección | ambiente-textura-metal | Metal y reflejos azules abstractos; decorativo |

WebP + JPG con anchos reales, sin ampliar (480/960/1440 solo si el máster lo permite), misma proporción, width/height, sizes y srcset. Medir bytes después de producirlos. Primera pantalla sin lazy; resto lazy. Luz y contexto con #004c9a, #1d356c y #36afe0, sin teñir productos históricos. Alt de ambiente describe la escena y puede aclarar «ilustración de ambiente industrial»; nunca «taller de BROTOTERMIC». Fondo decorativo: alt vacío si se incorpora como img.

La ilustración de calefactor D-016 es exclusiva de preview; no sustituye una foto del catálogo en producción. Las siete propuestas de arriba no permiten fabricar una nueva representación de ese producto.

## Inventario medido

La fuente de cada ruta histórica es `legacy/com/brototermic.com` + ruta publicada, excepto las tres copias de portada identificadas arriba. El archivo del repo es la ruta sin barra inicial. Mayúsculas y nombres históricos se conservan. «Igual» indica buffers idénticos a la fuente; no acredita calidad visual ni autorización para editar. Dimensiones y bytes son los de la **fuente**, no de una salida retocada.

### Fuente piloto y huella de conservación

| Ruta publicada | Fuente inmutable | Dimensiones | Bytes | SHA-256 fuente |
|---|---|---|---|---|
| `/images/brototermic-industriaalimentaria.jpg` | `legacy/com/brototermic.com/images/brototermic-industriaalimentaria.jpg` | 260 × 168 | 11353 | `e83dd3ed2c862c9c3f25d070a657236cb60f5aa010839dcc09c26db90d20a8b0` |
| `/images/brototermic-calefactores.jpg` | `legacy/com/brototermic.com/images/brototermic-calefactores.jpg` | 260 × 168 | 9926 | `5bad3f4af895e24115adebc05bf649a53ffd49bba0b9a29509b2a8429038f157` |
| `/images/brototermic-liquidos-noagresivos.jpg` | `legacy/com/brototermic.com/images/brototermic-liquidos-noagresivos.jpg` | 260 × 168 | 11844 | `20992494cde02f797a8742f0fbd70c522167fbb9780d80c05cbe1303e2a58cdb` |

### Las 97 rutas altas

Comparación de copias del repo: **92 iguales**, **0 diferentes**, **5 sin copia propia** (build.js las recupera de /legacy). Todas las fuentes se han encontrado y todas las dimensiones se han leído.

| Ruta publicada | Páginas del plan | Dimensiones fuente | Bytes fuente | Acción del plan | Retoque manual del plan | Copia del repo |
|---|---|---|---|---|---|---|
| `/images/brototermic-industriaalimentaria.jpg` | resistencias-inmersion.html | 260 × 168 | 11353 | ORIGINAL | fondo e iluminación | Igual |
| `/images/brototermic-calefactores.jpg` | resistencias-inmersion.html | 260 × 168 | 9926 | ORIGINAL | fondo e iluminación | Igual |
| `/images/brototermic-liquidos-noagresivos.jpg` | resistencias-inmersion.html | 260 × 168 | 11844 | ORIGINAL | fondo e iluminación | Igual |
| `/images/broto-fabricacion.jpg` | resistencias-especiales-a-medida.html | 512 × 140 | 23550 | CONVERTIR | — | Igual |
| `/images/brototermic-aireacondicionado.jpg` | resistencias-calentamientoaire.html | 260 × 168 | 20243 | ORIGINAL | — | Igual |
| `/images/brototermic-aireforzado.jpg` | resistencias-calentamientoaire.html | 260 × 168 | 5798 | ORIGINAL | — | Igual |
| `/images/brototermic-aletahelicoidal.jpg` | resistencias-calentamientoaire.html | 260 × 168 | 10225 | ORIGINAL | — | Igual |
| `/images/brototermic-bandaafafs.jpg` | resistencias-flexibles.html | 260 × 168 | 12142 | ORIGINAL | — | Igual |
| `/images/brototermic-bandaafhssd.jpg` | resistencias-flexibles.html | 260 × 168 | 8007 | ORIGINAL | — | Igual |
| `/images/brototermic-bandacalefactora.jpg` | resistencias-flexibles.html | 260 × 168 | 7996 | ORIGINAL | — | Igual |
| `/images/brototermic-bateria-calentamiento.jpg` | fabricaciones-a-medida.html | 260 × 168 | 16204 | ORIGINAL | — | Igual |
| `/images/brototermic-bateriaalbat.jpg` | resistencias-calentamientoaire.html | 260 × 168 | 14284 | ORIGINAL | — | Igual |
| `/images/brototermic-bidonhidh.jpg` | resistencias-atex.html | 260 × 168 | 8101 | ORIGINAL | — | Igual |
| `/images/brototermic-cajaconexiones.jpg` | resistencias-inmersion.html | 260 × 168 | 8529 | ORIGINAL | — | Igual |
| `/images/brototermic-calefactor-inmersion.jpg` | fabricaciones-a-medida.html | 260 × 168 | 8992 | ORIGINAL | — | Igual |
| `/images/brototermic-calefactoresarmarios.jpg` | resistencias-atex.html | 260 × 168 | 10212 | ORIGINAL | — | Igual |
| `/images/brototermic-calentadores.jpg` | resistencias-inmersion.html | 260 × 168 | 13822 | ORIGINAL | — | Igual |
| `/images/brototermic-calentadoresinmersion.jpg` | resistencias-inmersion.html | 260 × 168 | 11283 | ORIGINAL | — | Igual |
| `/images/brototermic-calentamientoaire.jpg` | resistencias-calentamientoaire.html | 260 × 168 | 16707 | ORIGINAL | — | Igual |
| `/images/brototermic-camara-protectora.jpg` | resistencias-tipo-abrazadera.html | 260 × 168 | 9713 | ORIGINAL | — | Igual |
| `/images/brototermic-camisa-aislante-aluminio.jpg` | resistencias-mantas-calefactoras.html | 260 × 168 | 8107 | ORIGINAL | — | Igual |
| `/images/brototermic-candelas.jpg` | resistencias-inmersion.html | 260 × 168 | 11191 | ORIGINAL | — | Igual |
| `/images/brototermic-cartuchosaltacarga.jpg` | resistencias-tipo-cartucho.html | 260 × 168 | 6738 | ORIGINAL | — | Igual |
| `/images/brototermic-cartuchosbajacarga.jpg` | resistencias-tipo-cartucho.html | 260 × 168 | 7161 | ORIGINAL | — | Igual |
| `/images/brototermic-cartuchosexpan.jpg` | resistencias-tipo-cartucho.html | 260 × 168 | 8653 | ORIGINAL | — | Igual |
| `/images/brototermic-cartuchosmicrowatt.jpg` | resistencias-tipo-cartucho.html | 260 × 168 | 5294 | ORIGINAL | — | Igual |
| `/images/brototermic-cobertura-impermeable-deposito-ibc.jpg` | resistencias-mantas-calefactoras.html | 260 × 168 | 8406 | ORIGINAL | — | Igual |
| `/images/brototermic-conductocilindrico.jpg` | resistencias-calentamientoaire.html | 260 × 168 | 17988 | ORIGINAL | — | Igual |
| `/images/brototermic-convectoresfaw.jpg` | resistencias-atex.html | 260 × 168 | 14911 | ORIGINAL | — | Igual |
| `/images/brototermic-copasumergible.jpg` | resistencias-inmersion.html | 260 × 168 | 15956 | ORIGINAL | — | Igual |
| `/images/brototermic-detectores- nivel.jpg` | fabricaciones-a-medida.html | 260 × 168 | 12998 | ORIGINAL | — | Igual |
| `/images/brototermic-gamaeuropa.jpg` | resistencias-inmersion.html | 260 × 168 | 11913 | ORIGINAL | — | Igual |
| `/images/brototermic-hermetico-altacarga.jpg` | resistencias-tipo-abrazadera.html | 260 × 168 | 7576 | ORIGINAL | — | Igual |
| `/images/brototermic-hermetico-inoxidable.jpg` | resistencias-tipo-abrazadera.html | 260 × 168 | 5829 | ORIGINAL | — | Igual |
| `/images/brototermic-liquidosagresivos.jpg` | resistencias-inmersion.html | 260 × 168 | 11637 | ORIGINAL | — | Igual |
| `/images/brototermic-manta-aislante-deposito2.jpg` | resistencias-mantas-calefactoras.html | 260 × 168 | 9068 | ORIGINAL | — | Igual |
| `/images/brototermic-mantas-calefactoras-atex-depositos-ibc.jpg` | resistencias-mantas-calefactoras.html | 260 × 168 | 10724 | ORIGINAL | — | Igual |
| `/images/brototermic-mantas-calefactoras-atex.jpg` | resistencias-mantas-calefactoras.html | 260 × 168 | 9443 | ORIGINAL | — | Igual |
| `/images/brototermic-mantas-calefactoras-bidon-brototermic.png` | resistencias-mantas-calefactoras.html | 260 × 168 | 33188 | ORIGINAL | — | Igual |
| `/images/brototermic-mantas-calefactoras-depositos-ibc.jpg` | resistencias-mantas-calefactoras.html | 260 × 168 | 7960 | ORIGINAL | — | Igual |
| `/images/brototermic-marcas-representadas.jpg` | index.html | 990 × 80 | 24787 | SUSTITUIR | — | Igual |
| `/images/brototermic-microwatt.jpg` | resistencias-tipo-cartucho.html | 260 × 168 | 5672 | ORIGINAL | — | Igual |
| `/images/brototermic-resistencia-flexible1.jpg` | resistencias-flexibles.html | 260 × 168 | 6456 | ORIGINAL | — | Igual |
| `/images/brototermic-resistencia-flexible10.jpg` | resistencias-flexibles.html | 260 × 168 | 15205 | ORIGINAL | — | Igual |
| `/images/brototermic-resistencia-flexible11.jpg` | resistencias-flexibles.html | 260 × 168 | 11648 | ORIGINAL | — | Igual |
| `/images/brototermic-resistencia-flexible12.jpg` | resistencias-flexibles.html | 260 × 168 | 13020 | ORIGINAL | — | Igual |
| `/images/brototermic-resistencia-flexible2.jpg` | resistencias-flexibles.html | 260 × 168 | 10439 | ORIGINAL | — | Igual |
| `/images/brototermic-resistencia-flexible3.jpg` | resistencias-flexibles.html | 260 × 168 | 14045 | ORIGINAL | — | Igual |
| `/images/brototermic-resistencia-flexible4.jpg` | resistencias-flexibles.html | 260 × 168 | 15836 | ORIGINAL | — | Igual |
| `/images/brototermic-resistencia-flexible5.jpg` | resistencias-flexibles.html | 260 × 168 | 12972 | ORIGINAL | — | Igual |
| `/images/brototermic-resistencia-flexible6.jpg` | resistencias-flexibles.html | 260 × 168 | 11781 | ORIGINAL | — | Igual |
| `/images/brototermic-resistencia-flexible7.jpg` | resistencias-flexibles.html | 260 × 168 | 11323 | ORIGINAL | — | Igual |
| `/images/brototermic-resistencia-flexible8.jpg` | resistencias-flexibles.html | 260 × 168 | 10403 | ORIGINAL | — | Igual |
| `/images/brototermic-resistencia-flexible9.jpg` | resistencias-flexibles.html | 260 × 168 | 5231 | ORIGINAL | — | Igual |
| `/images/brototermic-resistenciainmersion.jpg` | resistencias-inmersion.html | 260 × 168 | 8605 | ORIGINAL | — | Igual |
| `/images/brototermic-resistenciamonobloc.jpg` | resistencias-inmersion.html | 260 × 168 | 9894 | ORIGINAL | — | Igual |
| `/images/brototermic-resistencias-abrazadera.jpg` | fabricaciones-a-medida.html | 260 × 168 | 15526 | ORIGINAL | — | Igual |
| `/images/brototermic-resistencias-aerotermos-industrial.jpg` | resistencias-atex.html resistencias-calentamientoaire.html | 260 × 168 | 9227 | ORIGINAL | — | Igual |
| `/images/brototermic-resistencias-espiraladas.jpg` | resistencias-calentamientoaire.html | 260 × 168 | 9903 | ORIGINAL | — | Igual |
| `/images/brototermic-resistencias-nitruro.jpg` | resistencias-calentamientoaire.html | 260 × 168 | 6622 | ORIGINAL | — | Igual |
| `/images/brototermic-resistencias-paneles-calefactores.jpg` | resistencias-calentamientoaire.html | 260 × 168 | 10745 | ORIGINAL | — | Igual |
| `/images/brototermic-resistencias-sistemas-combinados.jpg` | resistencias-calentamientoaire.html | 260 × 168 | 12528 | ORIGINAL | — | Igual |
| `/images/brototermic-resistencias-tubos-radiantes.jpg` | resistencias-calentamientoaire.html | 260 × 168 | 11482 | ORIGINAL | — | Igual |
| `/images/brototermic-resistencias.jpg` | resistencias-calentamientoaire.html | 260 × 168 | 16326 | ORIGINAL | — | Igual |
| `/images/brototermic-resistenciasaletadas.jpg` | resistencias-calentamientoaire.html | 260 × 168 | 15501 | ORIGINAL | — | Igual |
| `/images/brototermic-resistenciatrifasica.jpg` | resistencias-inmersion.html | 260 × 168 | 15352 | ORIGINAL | — | Igual |
| `/images/brototermic-sensores-temperatura.jpg` | fabricaciones-a-medida.html | 260 × 168 | 10956 | ORIGINAL | — | Igual |
| `/images/brototermic-sensoresntc.jpg` | controltemperatura-sondastemperatura.html | 260 × 168 | 6233 | ORIGINAL | — | Igual |
| `/images/brototermic-sensoresptc.jpg` | controltemperatura-sondastemperatura.html | 260 × 168 | 6598 | ORIGINAL | — | Igual |
| `/images/brototermic-sistema-hermetico.jpg` | resistencias-tipo-abrazadera.html | 260 × 168 | 6455 | ORIGINAL | — | Igual |
| `/images/brototermic-soporte-ceramica.jpg` | resistencias-tipo-abrazadera.html | 260 × 168 | 8251 | ORIGINAL | — | Igual |
| `/images/brototermic-soporte-con-escafandra.jpg` | resistencias-tipo-abrazadera.html | 260 × 168 | 7604 | ORIGINAL | — | Igual |
| `/images/brototermic-soporte-sin-escafandra.jpg` | resistencias-tipo-abrazadera.html | 260 × 168 | 7705 | ORIGINAL | — | Igual |
| `/images/brototermic-sumergidores.jpg` | resistencias-inmersion.html | 260 × 168 | 11153 | ORIGINAL | — | Igual |
| `/images/brototermic-taponroscadorfa-cs.jpg` | resistencias-atex.html | 260 × 168 | 10565 | ORIGINAL | — | Igual |
| `/images/brototermic-taponroscadorfa.jpg` | resistencias-atex.html | 260 × 168 | 12951 | ORIGINAL | — | Igual |
| `/images/brototermic-termopar.jpg` | controltemperatura-sondastemperatura.html | 260 × 168 | 5084 | ORIGINAL | — | Igual |
| `/images/brototermic-termoparbayoneta.jpg` | controltemperatura-sondastemperatura.html | 260 × 168 | 5029 | ORIGINAL | — | Igual |
| `/images/brototermic-termoparceramico.jpg` | controltemperatura-sondastemperatura.html | 260 × 168 | 10120 | ORIGINAL | — | Igual |
| `/images/brototermic-termoparencamisado.jpg` | controltemperatura-sondastemperatura.html | 260 × 168 | 5827 | ORIGINAL | — | Igual |
| `/images/brototermic-termorresistenciartd.jpg` | controltemperatura-sondastemperatura.html | 260 × 168 | 5064 | ORIGINAL | — | Igual |
| `/images/brototermic-termorresistenciartd2.jpg` | controltemperatura-sondastemperatura.html | 260 × 168 | 7301 | ORIGINAL | — | Igual |
| `/images/brototermic-termosondamango.jpg` | controltemperatura-sondastemperatura.html | 260 × 168 | 8570 | ORIGINAL | — | Igual |
| `/images/brototermic-termosondavaina.jpg` | controltemperatura-sondastemperatura.html | 260 × 168 | 8428 | ORIGINAL | — | Igual |
| `/images/brototermic-termosondazocalo.jpg` | controltemperatura-sondastemperatura.html | 260 × 168 | 7597 | ORIGINAL | — | Igual |
| `/images/brototermic-zonasclasificadas.jpg` | resistencias-atex.html | 260 × 168 | 9569 | ORIGINAL | — | Igual |
| `/images/brototermic.jpg` | index.html | 260 × 178 | 19991 | ORIGINAL | — | Igual |
| `/images/footer-logo.jpg` | contacto.html controldenivel-interruptores-magneticos.html controldenivel-niveles-de-flotador.html controldenivel-niveles-rotativos.html controldenivel-reles-de-nivel.html controldenivel-sensores-capacitivos.html controldenivel-sensores-conductivos.html controldenivel-sensores-de-presion.html controldenivel-sensores-de-ultrasonidos.html controldenivel-transductores-magneticos.html controltemperatura-accesorios-sondas.html controltemperatura-cables-compensacion.html controltemperatura-convertidores.html controltemperatura-dataloggers.html controltemperatura-equipos-de-medicion.html controltemperatura-indicadores-de-procesos.html controltemperatura-panelespc-software.html controltemperatura-reles-estado-solido.html controltemperatura-sensores-infrarrojos.html controltemperatura-sondastemperatura.html controltemperatura-termometros.html controltemperatura-termostatos.html controltemperatura-videoregistradores.html cookies.html empresa.html equipos-perifericos.html equiposderefrigeracion-refrigeradores-chillers.html fabricaciones-a-medida.html hornos-industriales.html index.html mapa-web.html nuevos-productos.html presionhumedad-sensores-de-presion.html presionhumedad-sondas-de-humedad.html privacidad.html resistencias-atex.html resistencias-calefaccion-industrial.html resistencias-calentamientoaire.html resistencias-especiales-a-medida.html resistencias-flexibles.html resistencias-infrarrojos.html resistencias-inmersion.html resistencias-mantas-calefactoras.html resistencias-planas.html resistencias-tipo-abrazadera.html resistencias-tipo-cartucho.html ventilacion.html | 152 × 36 | 3138 | SUSTITUIR | — | Desde legacy |
| `/images/portada-control-nivel.jpg` | index.html | 910 × 426 | 48726 | ORIGINAL | — | Igual |
| `/images/portada-control-temperatura.jpg` | index.html | 910 × 426 | 44446 | ORIGINAL | — | Igual |
| `/images/portada-resistencias-electricas.jpg` | index.html | 370 × 290 | 21263 | ORIGINAL | — | Igual |
| `/images/slide-1.jpg` | index.html | 910 × 426 | 54018 | CONVERTIR | — | Igual |
| `/images/slide-2.jpg` | index.html | 910 × 426 | 82248 | CONVERTIR | — | Desde legacy |
| `/images/slide-3.jpg` | index.html | 910 × 426 | 44446 | CONVERTIR | — | Desde legacy |
| `/images/slide-4.jpg` | index.html | 910 × 426 | 48726 | CONVERTIR | — | Desde legacy |
| `/images/Tabla-fabricacion.jpg` | resistencias-especiales-a-medida.html | 907 × 416 | 95078 | CONVERTIR | — | Igual |
| `/oviedo/images/brototermic-oviedo.jpg` | oviedo/index.html | 444 × 293 | 32524 | ORIGINAL | — | Desde legacy |

## Comprobaciones realmente realizadas

Lectura del CSV con tools/lib/legacy.js (BOM y comillas), bytes del buffer real, dimensiones PNG/JPEG/GIF en cabecera, SHA-256 de fuentes piloto e igualdad de buffers fuente/repo. Después se ejecutó `tools/comparar-retoques-piloto.js` (sips, cwebp/dwebp, djpeg y Node nativo) para producir la evidencia de rechazo. Se verificaron los tamaños de máscaras/mapas, las copias históricas idénticas y cambios protegidos >0; se inspeccionaron fuentes y derivados. No se han ejecutado pruebas de navegador, npm run test, Lighthouse ni PageSpeed en esta subtarea. Ninguna cifra de este inventario representa esos procesos.
