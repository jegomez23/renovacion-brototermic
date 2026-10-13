# Entrega visual e imágenes — registro para reanudar

> Rama `mejora/visual-imagenes`, base `origin/main` = `bbdbe79`. Trabajo iniciado el 2026-10-13. No se integra `origin/revision/complemento-b` (`ada1d14`), ni sus commits se incluyen en la PR.

## Coordinación

Se consultaron el AGENTS.md completo local, las decisiones D-014 a D-019 y `docs/revision-sesion-b.md` de la referencia remota. El fetch inicial confirma que la rama de Juan todavía no está integrada. Se respeta su trabajo: no se copian sus archivos ni se adelantan los cambios en `build.js`, plantillas de familia/categoría, datos compartidos o modo preview. El CSS nuevo se anexa en un bloque aislado; al integrar main se conservarán los dos bloques.

## Plan visual aplicado

Paleta fija: blanco `#ffffff`, azul `#004c9a`, azul oscuro `#1d356c`, texto `#404751`, gris `#f1f1f1` y acento `#36afe0`. Lora 400/700 y texto de sistema. Alineación izquierda, lectura limitada y CTA antes del texto largo. Una textura metálica aporta identidad al encabezado de servicios; el resto permanece sobrio. Se descartan cifras decorativas y degradados añadidos. El sprite SVG tiene símbolos de calor, temperatura, nivel, presión, plano, teléfono, industria, alimentación, proceso y ventilación, todos propios y decorativos cuando se usan junto a texto.

```text
Escritorio: [ H1 + pedir presupuesto + teléfono | textura metálica ]
            [ contenido histórico, fotos reales a su tamaño original ]
Móvil:      [ H1 ] [ pedir presupuesto ] [ teléfono ] [ imagen ]
            [ contenido histórico ]
```

La textura se mantiene separada de las fotografías de catálogo. No representa una pieza suministrada, una sede ni una fabricación real. Los ambientes para las cuatro familias y Oviedo están preparados para el siguiente bloque, sin tocar las plantillas que modifica Juan.

## Imágenes producidas

- **7 ambientes** generados realmente con `image_gen.imagegen`, inspeccionados en resolución original. JPG + WebP en **480/960/1280 px**: **42 archivos nuevos** bajo `/images/`.
- Un primer ambiente de Oviedo se rechazó por placas pequeñas en maquinaria y se regeneró. El de resistencias se recorta con coordenadas exactas para excluir la señal desenfocada del fondo. Los demás no contienen texto, logos ni marcas de certificación observables.
- [Galería de ambientes](imagenes-antes-despues/ambientes/index.html), dimensiones, pesos, hashes, fuentes y destino en [manifiesto](../tools/datos/ambientes-ia.json).
- **3 ensayos de retoque rechazados**, no sustituciones: la IA recreó detalles y amplió los originales. [Hoja del piloto](imagenes-antes-despues/piloto/index.html), fuentes originales/generadas, máscaras conservadoras y mapas de diferencias. La máscara protege un área amplia que incluye fondo; no es una segmentación exacta del producto. La recodificación JPEG se mide aparte. No se atribuye cada píxel diferente a una alteración del producto.
- Los históricos de `/images/` y `/legacy/` permanecen intactos. El siguiente retoque debe ser manual o determinista con una máscara revisada por una persona, comprobación de píxeles y hoja aprobada antes de sustituir el JPG.

## Contenido y SEO

- [Revisión del lote exacto de 25 borradores T-15](revision-25-borradores-visual.md): herramienta remota ejecutada en copia temporal, 36 frases rojas con evidencia/disposición, 149 ámbar y 200 verdes. Los colores no son una aprobación.
- Corregido el alcance de AFHSSD en flexibles y del sensor cerámico en presión; retirada la promesa «presupuesto rápido» en contacto. Se conservan productos, specs, metas, titles y marcas de borrador.
- [Plan de mejoras SEO](seo-mejoras.md), con riesgo, fuentes, enlazado existente, páginas escasas, imágenes y SEO local; [inventario de 97 rutas altas](inventario-visual-imagenes.md).
- La aprobación humana de las intros y legales sigue pendiente, conforme a AGENTS.md §4. No se ejecuta `aprobar-borradores.js` sobre una lista ficticia de aprobaciones.

## Verificación del bloque independiente

- Línea base real: `npm run test` en verde, 70 OK / 8 AVISO / 0 ERROR, 10/10 mutaciones y 60 URLs del sitemap con 200.
- Chrome: antes y después a 390/1280 px, 24 combinaciones por fase (seis páginas × 320/390/768/1280), sin desbordes, errores JS, imágenes rotas ni terceros. El adjunto se comprueba con selector, arrastre, múltiples archivos, tamaño, extensión, nombre largo, envío inactivo y navegación sin JS.
- W3C local: 55 HTML y CSS sin errores ni advertencias después de los cambios de servicios/adjunto. Nu descargado como herramienta local ignorada por Git; sin dependencias nuevas del proyecto.
- La primera prueba detectó que `build.js` de main interpreta una lista `srcset` como un archivo. Se adaptó la cabecera nueva a fuentes individuales por resolución, con proporción exacta 480 × 320 / 960 × 640. El generador de Juan no se modifica.
- [Lighthouse local móvil](imagenes-antes-despues/lighthouse/resumen.json): inicio 97, inmersión/contacto/fabricaciones/empresa 99; accesibilidad 100 y CLS 0 en las cinco. Una medición por página con Chrome/Lighthouse 13.5.0, sin caché ni compresión Apache. **No equivale a PageSpeed Insights de la demo pública**. Se ha solicitado su URL, aún no recibida.
- Inicio: LCP 2,55 s; se repetirá con el WebP de Juan y el hosting definitivo. Empresa: buenas prácticas 96 por la foto histórica de 260 × 178 px en pantalla de alta densidad; no se amplía ni se inventa detalle. Los informes completos explican la limitación.
- `npm run test`, `npm run validar` y `npm run build` están en verde. `npm run build:preview` se intentó y devuelve «Missing script», porque el modo D-017 todavía no está en main. No se declara en verde ni se importa fuera de su rama.
- [19 alts de prioridad alta](alts-visual-prioridad-alta.md), [revisión de interfaz](revision-interfaz-visual.md) y [24 capturas](imagenes-antes-despues/index.html). Los alts y las tres correcciones se comprobaron con la suite global antes del commit.

## Dependencias que requieren la integración de Juan

1. Confirmar con `git fetch origin` que `revision/complemento-b` pertenece al historial de `origin/main`. Si sigue fuera, continuar solo los bloques independientes.
2. Con el árbol limpio y los commits propios guardados, incorporar **solo `origin/main`**. Resolver explícitamente el bloque CSS añadido y conservar la documentación más reciente de ambas ramas. No merge ni cherry-pick de complemento-b.
3. Con el generador definitivo, integrar los cuatro ambientes de familia, el de fabricación y Oviedo, los iconos restantes y la cabecera de categoría a dos columnas. Selección desde datos, sin alterar nombres o rutas históricos. Preparar capturas y mediciones de esas plantillas.
4. Rehacer la vista de revisión con las correcciones de Juan ya integradas. La persona revisora exportará las aprobaciones reales y entonces se aplicará `tools/aprobar-borradores.js`.
5. Ejecutar `test`, `validar`, `build` y **`build:preview`**. Este último no existe en el `package.json` de main actual: no se crea una imitación del modo D-017.
6. Medir la URL pública en pagespeed.web.dev (inicio, categoría y contacto). No publicar ni inventar puntuaciones de una demo que no se ha recibido.

## Comandos reproducibles

```bash
node tools/preparar-ambientes.js /ruta/a/los/png-generados
node tools/comparar-retoques-piloto.js --fuentes=docs/imagenes-antes-despues/piloto/fuentes
node tools/verificar-visual-imagenes.js antes
node tools/verificar-visual-imagenes.js despues
npm run test
npm run validar
npm run build
```

Los scripts de tratamiento usan `sips`, `cwebp`, `dwebp`/`djpeg` locales y no añaden librerías al sitio. Las capturas requieren Chrome y Node ≥22. Como no había Java instalado, Nu se descargó con su runtime en `tools/vnu/vnu-runtime-image` (ignorado por Git): `npm run validar` ya funciona sin variables especiales. El sitio sigue sin dependencias nuevas en el navegador o en package.json.
