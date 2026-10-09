# Especificación de diseño

> Especificación sin código: la implementa la Persona A en `/assets/css/style.css` (una sola hoja) y en las plantillas. Las decisiones de color y tipografía son las de AGENTS.md («Decisiones tomadas»). Todos los ratios de contraste están calculados con la fórmula WCAG 2.x.

## 1. Dirección visual

- **Industrial, técnica, moderna y minimalista.** Es la web de un proveedor que sabe de lo que habla, no un folleto: tipografía clara, retícula ordenada, datos en tablas y nada de adornos.
- **Mucho espacio en blanco.** Fondo blanco dominante, secciones alternas en gris muy claro (`#f1f1f1`) y el azul corporativo reservado para la acción (botones, enlaces) y para la cabecera.
- **Fotografía de producto sobre fondo neutro** (blanco o gris claro), recortada y con la misma proporción en cada rejilla (4:3 recomendado, con `object-fit: contain` para no recortar el producto). Las imágenes de ambiente, permitidas en hero y portadas, en tonos fríos y sin saturar.
- **Jerarquía clara:** H1 en Lora, H2 de producto en Lora más pequeño y todo lo demás en la fuente del sistema. Los números y modelos (ENR 003, IMN 40 INOX) siempre visibles y en texto, nunca solo dentro de una imagen.
- Sin carruseles automáticos, sin animaciones de entrada y sin parallax. Como mucho, una transición de 150-200 ms en hover y focus. Se respeta `prefers-reduced-motion`.

## 2. Tokens

### 2.1 Color

| Token | Hex | Uso permitido | Prohibido |
|---|---|---|---|
| `--color-primario` | `#004c9a` | Fondo de botones primarios y de la cabecera, enlaces, iconos funcionales y bordes de foco sobre fondo claro | — |
| `--color-primario-oscuro` | `#1d356c` | Hover de botones primarios, textos destacados (H1, H2, cifras), fondo del pie | — |
| `--color-acento` | `#36afe0` | **Solo acentos:** líneas decorativas, iconos decorativos, subrayado o borde en hover y estados activos | Texto sobre blanco (2,51:1) · fondo de botón con texto blanco |
| `--color-acento-2` | `#2dccf0` | **Solo acentos:** igual que el anterior; además, anillo de foco sobre fondos oscuros | Texto sobre blanco (1,91:1) · fondo de botón con texto blanco (1,91:1) |
| `--color-texto` | `#404751` | Texto general (párrafos, tablas, formularios) | — |
| `--color-texto-secundario` | `#5e5e5e` | Texto de apoyo: pies de foto, migas, notas, placeholders | Texto principal largo |
| `--color-borde-control` | `#72767c` | Bordes de inputs, select y checkbox (contraste ≥ 3:1 exigido para controles) | — |
| `--color-borde` | `#dadada` | Separadores y bordes de tarjetas y de tablas (decorativos) | Bordes de controles de formulario (1,40:1) |
| `--color-fondo` | `#ffffff` | Fondo general | — |
| `--color-fondo-alt` | `#f1f1f1` | Secciones alternas, cabecera de tablas, fondo de la tarjeta de imagen | — |
| `--color-fondo-destacado` | `#dae9f9` | Bloques CTA y avisos informativos (texto `#1d356c` o `#004c9a`) | — |
| `--color-blanco` | `#ffffff` | Texto sobre `#004c9a` y `#1d356c` | — |
| `--color-error` | `#b42318` | Mensajes de error del formulario. **No es corporativo**: es un rojo funcional que cumple AA (≈ 6,5:1 sobre blanco). | Decoración |

**Se elimina `#989898`** (era el texto general de la web antigua: 2,88:1, no cumple AA).

**Texto general propuesto: `#404751`**, con **9,38:1 sobre blanco** y 8,31:1 sobre `#f1f1f1` (AA y AAA). Es el gris de los títulos de la web actual, así que no se introduce ningún color nuevo. Para texto secundario: `#5e5e5e`, con 6,48:1 sobre blanco y 5,74:1 sobre `#f1f1f1`.

Combinaciones comprobadas:

| Texto / elemento | Fondo | Ratio | Resultado |
|---|---|---|---|
| `#404751` | `#ffffff` | 9,38 | AA ✔ (texto general) |
| `#404751` | `#f1f1f1` | 8,31 | AA ✔ |
| `#5e5e5e` | `#ffffff` | 6,48 | AA ✔ |
| `#1d356c` | `#ffffff` | 11,81 | AA ✔ (títulos) |
| `#004c9a` | `#ffffff` | 8,40 | AA ✔ (enlaces) |
| `#004c9a` | `#f1f1f1` | 7,44 | AA ✔ |
| `#ffffff` | `#004c9a` | 8,40 | AA ✔ (botón primario, cabecera) |
| `#ffffff` | `#1d356c` | 11,81 | AA ✔ (pie, hover del botón) |
| `#dae9f9` | `#1d356c` | 9,56 | AA ✔ (texto secundario del pie) |
| `#1d356c` | `#dae9f9` | 9,56 | AA ✔ (bloque CTA) |
| `#004c9a` | `#dae9f9` | 6,80 | AA ✔ |
| `#72767c` (borde de control) | `#ffffff` | 4,57 | ≥ 3:1 ✔ |
| `#2dccf0` (foco) | `#1d356c` | 6,19 | ≥ 3:1 ✔ (foco en el pie) |
| `#2dccf0` (foco) | `#004c9a` | 4,40 | ≥ 3:1 ✔ (foco en la cabecera) |
| `#36afe0` (icono decorativo) | `#1d356c` | 4,70 | ✔ como icono en el pie |
| `#36afe0` | `#ffffff` | 2,51 | ✘ solo decorativo |
| `#2dccf0` | `#ffffff` | 1,91 | ✘ solo decorativo |

**Enlaces:** `#004c9a` y subrayados en el texto corrido. En hover, el subrayado se engrosa o cambia a `#36afe0`, **pero el texto no cambia a cian**. **Foco visible:** contorno de 3 px `#004c9a` con 2 px de separación sobre fondo claro, y `#2dccf0` sobre fondo oscuro (cabecera y pie).

### 2.2 Tipografía

| Token | Valor |
|---|---|
| `--fuente-titulos` | `"Lora", Georgia, "Times New Roman", serif`: **autoalojada**, solo **2 archivos WOFF2: 400 y 700** (subconjunto latino), en `/assets/fonts/`, con `font-display: swap`. Solo se precarga (`preload`) el 700. |
| `--fuente-texto` | `system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif` |
| `--fuente-mono` | `ui-monospace, "SFMono-Regular", Consolas, monospace` (solo para referencias de modelo dentro de tablas, opcional) |

Escala (rem sobre 16 px; móvil → escritorio ≥ 1280 px; entre medias, `clamp()`):

| Elemento | Fuente | Peso | Tamaño móvil | Tamaño escritorio | Interlineado |
|---|---|---|---|---|---|
| H1 | Lora | 700 | 1,75 rem (28 px) | 2,5 rem (40 px) | 1,2 |
| H2 (sección y nombre de producto) | Lora | 700 | 1,375 rem (22 px) | 1,75 rem (28 px) | 1,25 |
| H3 | Sistema | 600 | 1,125 rem (18 px) | 1,25 rem (20 px) | 1,3 |
| Entradilla (intro) | Sistema | 400 | 1,0625 rem (17 px) | 1,1875 rem (19 px) | 1,6 |
| Texto | Sistema | 400 | 1 rem (16 px) | 1 rem (16 px) | 1,6 |
| Pequeño (migas, notas, tablas densas) | Sistema | 400 | 0,875 rem (14 px) | 0,875 rem (14 px) | 1,5 |
| Botón | Sistema | 600 | 1 rem | 1 rem | 1 |
| Cifras destacadas (teléfono, «desde 1982») | Lora | 400 | 1,5 rem | 2 rem | 1,2 |

Longitud de línea del texto corrido: **máximo 70 caracteres** (≈ 40 rem).

### 2.3 Espaciado (base 4 px)

`--esp-1` 4 px · `--esp-2` 8 px · `--esp-3` 12 px · `--esp-4` 16 px · `--esp-5` 24 px · `--esp-6` 32 px · `--esp-7` 48 px · `--esp-8` 64 px · `--esp-9` 96 px

- Margen lateral del contenedor: 16 px (< 768), 24 px (768-1279), 32 px (≥ 1280).
- Separación vertical entre secciones: 48 px en móvil y 96 px en escritorio.
- Contenedor máximo: 1200 px de contenido.

### 2.4 Radios y sombras

| Token | Valor | Uso |
|---|---|---|
| `--radio-s` | 4 px | Botones, inputs, etiquetas |
| `--radio-m` | 8 px | Tarjetas, bloques CTA, imágenes |
| `--radio-0` | 0 | Tablas, cabecera, pie |
| `--sombra-1` | `0 1px 2px rgba(29, 53, 108, .08)` | Tarjetas en reposo |
| `--sombra-2` | `0 8px 24px rgba(29, 53, 108, .12)` | Tarjetas en hover y panel del megamenú |

### 2.5 Puntos de corte (mobile-first)

| Nombre | Desde | Comportamiento clave |
|---|---|---|
| base | 360 px (ancho mínimo de prueba) | 1 columna, menú en acordeón, tablas con scroll horizontal o apiladas |
| `md` | 768 px | 2 columnas en rejillas, megamenú de 2 columnas, migas completas |
| `lg` | 1280 px | 3-4 columnas, megamenú de 4 columnas, lateral de categorías hermanas |

## 3. Componentes

Cada componente tiene su descripción, sus variantes y su comportamiento en móvil. Ninguno depende de JS para mostrar contenido o enlaces.

### 3.1 Cabecera
- **Descripción:** franja superior fina (fondo `#004c9a`, separada de la barra por una línea de acento `#36afe0`) con los teléfonos de las dos sedes y el email. Debajo, la barra principal, también en `#004c9a`, con el logo (en blanco o en su versión para fondo oscuro), la navegación y el botón «Pedir presupuesto». En escritorio es *sticky* (`top: env(safe-area-inset-top)`) y se compacta al hacer scroll.
- **Variantes:** normal y compacta (al hacer scroll, sin la franja superior).
- **Móvil:** solo logo, icono de teléfono (`tel:` a Vitoria) e icono de menú (`<button aria-expanded aria-controls>`). La franja superior desaparece y sus datos pasan al final del panel del menú.

### 3.2 Megamenú (≥ 768 px)
- **Descripción:** panel desplegable bajo «Productos», a todo el ancho del contenedor, con fondo blanco, `--sombra-2` y 4 columnas en ≥ 1280 px (2 en 768-1279). Contenido y orden en [arquitectura.md](arquitectura.md), apartado 2.
- **Comportamiento:** se abre con clic o con Enter/Espacio (no solo con hover) y se cierra con Esc, con clic fuera o al tabular fuera. El hover abre con un retardo de 150 ms para no abrirlo sin querer. `aria-expanded` en el botón.
- **Variantes:** ninguna.

### 3.3 Acordeón móvil (< 768 px)
- **Descripción:** panel a pantalla completa bajo la cabecera con el botón «Pedir presupuesto» arriba, los niveles plegables (Productos › Familia › Categorías) y los teléfonos al final.
- **Comportamiento:** cada nivel es un `<button aria-expanded>` con su `<ul>`. Las zonas táctiles miden al menos 44 × 44 px. Bloquea el scroll del fondo mientras está abierto. Sin JS, se ve entero y desplegado.

### 3.4 Hero
- **Descripción:** solo en el inicio, en `/oviedo/` y en las familias. Lleva el H1, una frase de valor (de /legacy o de `content/`), 2 botones («Pedir presupuesto» como primario y «Ver productos» como secundario) y una imagen (en el inicio, `slide-1`, el calefactor ATEX con brida).
- **Variantes:** `inicio` (imagen grande a la derecha en escritorio), `familia` (imagen pequeña, más bajo) y `sede` (foto real de la delegación).
- **Móvil:** el texto va primero y la imagen debajo, con proporción fija. La imagen del hero no lleva `loading="lazy"` y lleva `fetchpriority="high"`.

### 3.5 Tarjeta de familia
- **Descripción:** imagen de producto representativa, nombre de la familia (H3), `resumen` (1 frase) y lista de 3-4 categorías destacadas en texto pequeño. Toda la tarjeta es un enlace a la página de familia. Las categorías destacadas son texto, sin enlaces anidados.
- **Variantes:** `familia` (con página propia) y `directa` (enlaza a la página única).
- **Móvil:** 1 columna; a partir de 768 px, 2; a partir de 1280 px, 4.

### 3.6 Tarjeta de producto
- **Descripción:** bloque con ancla (`id` = slug del nombre). Contiene la imagen (4:3, fondo `#f1f1f1`, `contain`), el **nombre en H2**, el modelo (si hay) como etiqueta, el texto original, la lista o tabla de especificaciones, el enlace al PDF (si hay) y el botón secundario «Pedir presupuesto de este producto».
- **Variantes:** `con-specs-tabla`, `con-specs-lista` (numerada si `specsNumeradas`) y `sin-imagen` (solo si /legacy no tiene imagen).
- **Móvil:** imagen arriba y texto debajo, a ancho completo. Desde 768 px, imagen a la izquierda (40 %) y texto a la derecha. Los productos van en una sola columna en todos los anchos: son fichas largas que se leen de arriba abajo, no una rejilla de tienda.

### 3.7 Tabla de especificaciones
- **Descripción:** `<table>` con `<caption>` (nombre del producto o «Especificaciones»), dos columnas (`<th scope="row">` campo | valor), filas separadas con `#dadada` y la cabecera con fondo `#f1f1f1`. Las cifras con unidad no se parten en dos líneas (espacio duro entre número y unidad).
- **Variantes:** 2 columnas (campo/valor) y multicolumna (tablas transcritas, como la de `Tabla-fabricacion.jpg`).
- **Móvil:** la de 2 columnas se queda tal cual. La multicolumna va dentro de un contenedor con `overflow-x: auto` y la primera columna fija, más una sombra que indica que hay más contenido a la derecha.

### 3.8 Botón
- **Primario:** fondo `#004c9a`, texto blanco (8,40:1) y radio de 4 px. Hover: fondo `#1d356c`. Foco: anillo `#004c9a` (o `#2dccf0` sobre fondo oscuro).
- **Secundario:** fondo transparente, borde de 2 px y texto `#004c9a`. Hover: fondo `#dae9f9`.
- **Sobre fondo oscuro (cabecera, pie):** fondo blanco y texto `#004c9a`, o borde blanco y texto blanco.
- **Prohibido:** fondo `#36afe0` o `#2dccf0` con texto blanco.
- **Tamaño:** 44 px de alto mínimo, con 16-24 px de padding horizontal. En móvil, los botones de una CTA ocupan el ancho completo.

### 3.9 Migas de pan
- **Descripción:** `<nav aria-label="Migas de pan">` con `<ol>`. Texto pequeño `#5e5e5e`, separador «›» decorativo (`aria-hidden`) y enlaces en `#004c9a`. El último elemento es texto con `aria-current="page"`.
- **Móvil:** si no caben, se muestra solo «‹ Volver a [nivel anterior]», con el mismo HTML recortado por CSS.

### 3.10 CTA de presupuesto
- **Descripción:** bloque con fondo `#dae9f9`, título en `#1d356c` («¿Necesitas un presupuesto o una fabricación a medida?»), una frase («Envíanos el plano o una foto y te respondemos con una propuesta») y 2 acciones: botón primario al formulario y teléfono de Vitoria.
- **Variantes:** `final` (al final de cada página de producto, servicio y familia) y `compacta` (dentro del lateral de la categoría en ≥ 1280 px).
- **Móvil:** apilado, con botones a ancho completo; el teléfono es un enlace `tel:`.

### 3.11 Bloque de marcas
- **Descripción:** rótulo «Marcas que representamos» y rejilla de logos en SVG en gris neutro (con su color al pasar el ratón). Si falta el SVG de una marca, se muestra su nombre en texto (`site.marcas[].logo = null`). Sin enlaces externos. Los logos llevan `alt` = nombre de la marca.
- **Móvil:** rejilla de 3 columnas; en escritorio, 1 fila de 9.

### 3.12 Bloque de sedes
- **Descripción:** 2 tarjetas (Vitoria | Oviedo) con nombre de la sede, dirección, teléfono (`tel:`), email (`mailto:`) y enlace «Cómo llegar» (`mapaUrl`, se abre en Google Maps). El horario solo aparece si existe. **Sin iframe de mapa ni API de Google Maps** (rendimiento y cookies de terceros). [Es una propuesta: aprobar o descartar].
- **Uso:** en el pie (versión compacta), en Contacto y en el inicio.
- **Móvil:** apiladas.

### 3.13 Formulario
- **Campos:** nombre*, empresa, email*, teléfono, mensaje* (rellenado con el producto si se llega desde un «Pedir presupuesto»), adjunto (plano o foto: tipos y tamaño máximo según `site.formulario`), casilla RGPD* (sin marcar, con enlace a `/privacidad.html`), **campo trampa** oculto por CSS (no `type=hidden`), con `tabindex="-1"` y `autocomplete="off"`.
- **Comportamiento:** etiquetas `<label>` visibles (el placeholder no sustituye a la etiqueta), validación HTML5 más un JS mínimo con mensajes accesibles (`aria-describedby` y foco al primer error) y errores en `#b42318` con icono y texto. El envío se procesa según la decisión pendiente (`site.formulario.accion`). Al enviarse, la página de confirmación o el mensaje dice qué pasará y en qué plazo (plazo [POR VERIFICAR con el cliente]).
- **Móvil:** 1 columna. En escritorio, nombre y empresa, y email y teléfono, en 2 columnas.

### 3.14 Pie
- **Descripción:** fondo `#1d356c`, texto blanco y `#dae9f9`, en 4 columnas en escritorio: (1) logo, frase («Resistencias eléctricas e instrumentación industrial desde 1982», dato externo) y catálogos PDF; (2) Productos (familias y directas); (3) Empresa (Fabricación a medida, Empresa, Nuevos productos, Contacto, Asturias); (4) las dos sedes. Debajo, una línea con © año actual BROTOTERMIC, S.L., Privacidad, Cookies y Mapa web.
- **Móvil:** columnas apiladas, sedes primero.

## 4. Estructura de cada plantilla (wireframes en texto)

De arriba abajo. Entre corchetes, el componente.

### 4.1 Inicio (`inicio`)
```
[Cabecera]
[Hero inicio] H1 «Resistencias eléctricas e instrumentación industrial» · frase de valor · [Pedir presupuesto] [Ver productos] · imagen slide-1
Bloque de confianza (1 fila): «Desde 1982»* · «Distribuidor de 9 marcas» · «Fabricación a medida» · «Vitoria y Oviedo»   (*dato externo)
Familias de producto: H2 · [Tarjeta de familia] ×8 (4 familias + 4 directas)
Fabricación a medida: H2 · texto breve (de /legacy) · imagen · [Botón secundario → /fabricaciones-a-medida.html]
[Bloque de marcas]
Catálogos: H2 · 2 tarjetas PDF (instrumentación, resistencias calefactoras)
Sobre nosotros: H2 · texto breve (de /legacy, sin «líderes») · foto de la fachada · enlace a Empresa
[Bloque de sedes]
[CTA de presupuesto final]
[Pie]
```

### 4.2 Familia (`familia`)
```
[Cabecera]
[Migas] Inicio › Resistencias eléctricas
[Hero familia] H1 · intro de 120-200 palabras · [Pedir presupuesto]
Categorías: H2 «Tipos de resistencias eléctricas» · [Tarjeta de categoría] × N (imagen + nombre + resumen), en rejilla de 1/2/3 columnas
Bloque fabricación a medida (fondo #f1f1f1): texto + enlace
Catálogo de la familia (PDF)
Otras familias de producto: lista de enlaces
[CTA de presupuesto final]
[Pie]
```

### 4.3 Categoría (`categoria`)
```
[Cabecera]
[Migas] Inicio › Familia › Categoría
H1
Intro NUEVA (120-200 palabras) · [Pedir presupuesto] · enlaces a los PDF de la categoría
Índice de productos (lista de anclas a cada H2; en móvil, plegable con «Ver los N productos»)
cuerpo (si existe: texto original general o tabla transcrita)
┌───────────────────────────────────────────┬──────────────────────────┐
│ [Tarjeta de producto] × N (1 columna)      │ Lateral (solo ≥ 1280 px): │
│   H2 nombre · modelo · imagen · texto      │  - Categorías hermanas    │
│   [Tabla/lista de specs] · PDF             │  - [CTA compacta]         │
│   [Pedir presupuesto de este producto]     │  (sticky)                 │
└───────────────────────────────────────────┴──────────────────────────┘
Relacionadas (enlaces cruzados) · Categorías hermanas (en móvil y tableta, aquí)
[CTA de presupuesto final] (menciona la fabricación a medida)
[Pie]
```

### 4.4 Servicio (`servicio`: empresa / fabricaciones a medida / nuevos productos)
```
[Cabecera]
[Migas] Inicio › Página
H1 · entradilla
Contenido de /content/<slug>.html en secciones H2
  - Empresa: historia (texto de /legacy) · Calidad · Servicio · Innovación · foto de la fachada · [Bloque de sedes]
  - Fabricaciones a medida: qué fabricamos (5 bloques de /legacy: calefactor de inmersión, batería de calentamiento de aire,
    resistencias abrazaderas, sensores de temperatura, detectores de nivel) · cómo pedirlo (plano / muestra) · enlaces a las categorías
  - Nuevos productos: cada novedad con enlace a su categoría y a su PDF
[CTA de presupuesto final] (en fabricaciones: «Adjunta tu plano»)
[Pie]
```

### 4.5 Sede (`sede`: `/oviedo/`)
```
[Cabecera]
[Migas] Inicio › Asturias (Oviedo)
[Hero sede] H1 «BROTOTERMIC en Oviedo: delegación de Asturias» · dirección, teléfono 629 462 642 y email · foto real de la delegación
Qué ofrecemos en Asturias: texto (content/oviedo.html) · [Tarjeta de familia] ×8 (versión compacta)
Fabricación a medida + catálogos
Datos de la delegación: dirección completa (CP 33011), «Cómo llegar» (dirección real, no Madrid), horario si existe
[Formulario] (mismo componente; el mensaje indica «Delegación de Oviedo»)
[Pie]
```

### 4.6 Contacto (`contacto`)
```
[Cabecera]
[Migas] Inicio › Contacto
H1 «Contacto y presupuestos» · entradilla (content/contacto.html): qué datos enviar para un presupuesto rápido
┌──────────────────────────────┬────────────────────────────┐
│ [Formulario] id="formulario"  │ [Bloque de sedes] (2 tarjetas apiladas) │
└──────────────────────────────┴────────────────────────────┘
(En móvil: primero un resumen con teléfonos, luego el formulario y por último las sedes completas)
[Pie]
```

### 4.7 Legal (`legal`: privacidad / cookies / mapa web)
```
[Cabecera]
[Migas] Inicio › Página
H1
Índice de secciones (solo privacidad)
Texto en una columna (máx. 70 caracteres por línea), H2/H3 · en el mapa web, el listado generado por familias
[Pie]
```
