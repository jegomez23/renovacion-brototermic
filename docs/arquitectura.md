# Arquitectura de la web nueva

> Plan de estructura, navegación y enlazado interno. Las reglas generales están en [AGENTS.md](../AGENTS.md). La lista de páginas con su title, meta y prioridad está en [plan-paginas.csv](plan-paginas.csv).
> Total: **52 páginas HTML** (48 que ya existen y se mantienen con la misma URL + 4 páginas de familia nuevas), 8 PDF públicos, `sitemap.xml` y `robots.txt`.

## 1. Árbol completo

Todas las URLs son absolutas sobre `https://brototermic.com`. Las marcadas como **NUEVA** no existían; el resto conserva su nombre de archivo y su ruta.

```
/                                                    Inicio (archivo index.html; /index.html redirige a /)
│
├── PRODUCTOS
│   ├── /resistencias-electricas.html                Familia · NUEVA
│   │   ├── /resistencias-inmersion.html             ← PILOTO (Día 1)
│   │   ├── /resistencias-calentamientoaire.html
│   │   ├── /resistencias-flexibles.html
│   │   ├── /resistencias-infrarrojos.html
│   │   ├── /resistencias-tipo-cartucho.html
│   │   ├── /resistencias-tipo-abrazadera.html
│   │   ├── /resistencias-planas.html
│   │   ├── /resistencias-calefaccion-industrial.html
│   │   ├── /resistencias-atex.html
│   │   ├── /resistencias-especiales-a-medida.html
│   │   └── /resistencias-mantas-calefactoras.html
│   │
│   ├── /controltemperatura.html                     Familia · NUEVA
│   │   ├── /controltemperatura-sondastemperatura.html
│   │   ├── /controltemperatura-convertidores.html
│   │   ├── /controltemperatura-cables-compensacion.html
│   │   ├── /controltemperatura-indicadores-de-procesos.html
│   │   ├── /controltemperatura-videoregistradores.html
│   │   ├── /controltemperatura-dataloggers.html
│   │   ├── /controltemperatura-panelespc-software.html
│   │   ├── /controltemperatura-accesorios-sondas.html
│   │   ├── /controltemperatura-sensores-infrarrojos.html
│   │   ├── /controltemperatura-termometros.html
│   │   ├── /controltemperatura-termostatos.html
│   │   ├── /controltemperatura-equipos-de-medicion.html
│   │   └── /controltemperatura-reles-estado-solido.html
│   │
│   ├── /controldenivel.html                         Familia · NUEVA
│   │   ├── /controldenivel-niveles-de-flotador.html
│   │   ├── /controldenivel-interruptores-magneticos.html
│   │   ├── /controldenivel-sensores-conductivos.html
│   │   ├── /controldenivel-sensores-capacitivos.html
│   │   ├── /controldenivel-transductores-magneticos.html
│   │   ├── /controldenivel-sensores-de-presion.html
│   │   ├── /controldenivel-sensores-de-ultrasonidos.html
│   │   ├── /controldenivel-niveles-rotativos.html
│   │   └── /controldenivel-reles-de-nivel.html
│   │
│   ├── /presionhumedad.html                         Familia · NUEVA
│   │   ├── /presionhumedad-sondas-de-humedad.html
│   │   └── /presionhumedad-sensores-de-presion.html
│   │
│   └── Familias de una sola página («directas»: la propia página hace de familia y de categoría)
│       ├── /ventilacion.html
│       ├── /equipos-perifericos.html                (equipos periféricos para plástico)
│       ├── /equiposderefrigeracion-refrigeradores-chillers.html
│       └── /hornos-industriales.html
│
├── SERVICIO
│   ├── /fabricaciones-a-medida.html
│   ├── /empresa.html
│   ├── /nuevos-productos.html
│   └── /contacto/contacto.html                      (/contacto.html redirige aquí)
│
├── SEDE
│   └── /oviedo/                                     Landing de Asturias (archivo oviedo/index.html; todo el .es redirige aquí)
│
├── LEGAL Y AYUDA
│   ├── /privacidad.html
│   ├── /cookies.html
│   └── /mapa-web.html
│
└── ARCHIVOS
    ├── /docs/*.pdf                                  8 PDF con su nombre exacto (incluidos los que llevan ñ o espacios)
    ├── /sitemap.xml                                 lo genera build.js
    └── /robots.txt                                  NUEVA
```

**Nombres de las páginas de familia.** Siguen el patrón de prefijos de la web actual: las categorías de control de temperatura empiezan por `controltemperatura-`, las de nivel por `controldenivel-` y las de presión por `presionhumedad-`, así que la familia es el prefijo sin sufijo. Resistencias es la excepción porque `resistencias.html` sería demasiado genérico y la keyword que trabaja el menú actual es «Resistencias eléctricas».

## 2. Megamenú definitivo

### Barra principal (escritorio, ≥ 1280 px)

```
[Logo]   Productos ▾   Fabricación a medida   Empresa   Asturias   Contacto        945 22 33 31   [Pedir presupuesto]
```

| Posición | Etiqueta | Destino |
|---|---|---|
| Logo | (logo BROTOTERMIC) | `/` |
| 1 | Productos ▾ | Abre el megamenú. No es un enlace: cada familia tiene el suyo dentro del panel. |
| 2 | Fabricación a medida | `/fabricaciones-a-medida.html` |
| 3 | Empresa | `/empresa.html` |
| 4 | Asturias | `/oviedo/` |
| 5 | Contacto | `/contacto/contacto.html` |
| Derecha | 945 22 33 31 | `tel:+34945223331` |
| Derecha | Pedir presupuesto (botón primario) | `/contacto/contacto.html#formulario` |

### Panel «Productos» (4 columnas)

El orden de las categorías es el del menú actual, para no desorientar a quien ya conoce la web. Las etiquetas son las del menú actual con las erratas corregidas.

| Columna 1 | Columna 2 | Columna 3 | Columna 4 |
|---|---|---|---|
| **Resistencias eléctricas** → familia | **Control de temperatura** → familia | **Control de nivel** → familia | **Otros equipos** (rótulo, sin enlace) |
| Inmersión | Sondas de temperatura | Niveles de flotador | Ventilación |
| Calentamiento de aire | Convertidores de señal | Interruptores magnéticos | Equipos periféricos para plástico |
| Flexibles | Cables de compensación | Sensores conductivos | Refrigeración (chillers) |
| Emisores infrarrojos | Indicadores de procesos | Sensores capacitivos | Hornos industriales |
| De cartucho | Vídeo registradores | Transductores magnéticos | |
| De abrazadera | Dataloggers | Sensores de presión | **Servicios** (rótulo) |
| Planas | Paneles PC | Sensores de ultrasonidos | Fabricación a medida |
| Calefacción industrial | Accesorios para sondas | Niveles rotativos | Nuevos productos |
| ATEX | Sensores de infrarrojos | Relés de nivel | |
| Especiales a medida | Termómetros | | **Catálogos PDF** (rótulo) |
| Mantas calefactoras | Termostatos | **Presión y humedad** → familia | Instrumentación |
| | Equipos de medición | Sondas de humedad | Resistencias calefactoras |
| | Relés estado sólido | Sensores de presión | |

- El nombre de cada familia es un enlace a su página. Bajo cada familia, la primera línea es «Ver todas» (mismo destino), para quien no ve que el título es clicable.
- Los enlaces del panel están en el HTML (generados por `build.js` desde `data/familias.json`). El JS solo abre y cierra el panel.
- La página actual se marca con `aria-current="page"`, y su familia con un estilo de «sección activa».

### Tableta (768-1279 px)

- La barra se reduce: logo, «Productos ▾», «Contacto», el teléfono como icono y el botón «Presupuesto».
- El resto de entradas (Fabricación a medida, Empresa, Asturias) pasan al panel.
- El panel de productos ocupa todo el ancho, en 2 columnas: (Resistencias + Presión y humedad) | (Control de temperatura + Control de nivel + Otros equipos).

### Móvil (< 768 px): acordeón

```
[Logo]                              [☎] [☰]
───────────────────────────────────────────
☰ abierto (panel a pantalla completa, bajo la cabecera):
  [Pedir presupuesto]  (botón ancho completo)
  Productos                                  ▸
    Resistencias eléctricas                  ▸
      Ver todas las resistencias eléctricas
      Inmersión
      …
    Control de temperatura                   ▸
    Control de nivel                         ▸
    Presión y humedad                        ▸
    Ventilación
    Equipos periféricos para plástico
    Refrigeración (chillers)
    Hornos industriales
  Fabricación a medida
  Empresa
  Asturias
  Contacto
  ─────
  Vitoria 945 22 33 31 · Oviedo 629 462 642
```

- Cada nivel es un `<button aria-expanded>` que muestra u oculta una `<ul>`. Solo hay un nivel abierto a la vez por grupo.
- Sin JS, el panel se muestra entero y desplegado (todas las listas visibles) bajo la cabecera: la navegación sigue funcionando.

## 3. Migas de pan

Visibles en todas las páginas salvo el inicio, debajo de la cabecera. Usan el nombre corto de cada nivel, no el H1 completo. El último elemento es texto (sin enlace), con `aria-current="page"`.

| Tipo de página | Migas |
|---|---|
| Inicio | (no se muestran) |
| Familia | Inicio › Resistencias eléctricas |
| Categoría de una familia | Inicio › Resistencias eléctricas › Inmersión |
| Categoría «directa» | Inicio › Ventilación |
| Servicio | Inicio › Fabricación a medida · Inicio › Empresa · Inicio › Nuevos productos · Inicio › Contacto |
| Sede | Inicio › Asturias (Oviedo) |
| Legal y ayuda | Inicio › Política de privacidad · Inicio › Política de cookies · Inicio › Mapa web |

El JSON-LD `BreadcrumbList` reproduce exactamente las mismas migas (ver [schema.md](schema.md)).

## 4. Enlazado interno

Reglas comunes:
- El texto del enlace describe el destino y, siempre que se pueda, contiene la keyword de su title (ver `plan-paginas.csv`). Nada de «pincha aquí» ni «más».
- Todos los enlaces internos son absolutos desde la raíz (`/resistencias-inmersion.html`) y apuntan a la URL canónica: nunca a `/index.html`, a `/contacto.html` ni a una URL redirigida.
- Los PDF se enlazan con su ruta exacta y codificada (`/docs/catalogo_ca%C3%B1as_pirometricas_broto-03-02-2015.pdf`, `/docs/DISPLAYS%20DIGITALES%20PROGRAMABLES%20BROTOTERMIC%20HR.pdf`).

### Por tipo de página

| Página | Enlaza a |
|---|---|
| **Inicio** | Las 4 familias y las 4 directas (tarjetas de familia) · Fabricación a medida · Empresa · Asturias (`/oviedo/`) · Contacto (CTA) · los 2 catálogos PDF · bloque de marcas (sin enlaces externos) |
| **Familia** | Todas sus categorías (tarjetas, en el orden del menú) · Fabricación a medida (bloque «¿Necesitas algo a medida?») · Contacto (CTA) · las otras familias (bloque «Otras familias de producto») · catálogo PDF de la familia (instrumentación o resistencias) |
| **Categoría** | Su familia (migas + enlace «Ver todas las …») · sus categorías hermanas (bloque lateral en escritorio, al final en móvil) · Contacto desde cada producto («Pedir presupuesto de este producto») y desde la CTA final · Fabricación a medida · sus PDF · enlaces cruzados (tabla siguiente) |
| **Categoría «directa»** | Igual que una categoría, pero las «hermanas» son las otras 3 directas |
| **Fabricación a medida** | Resistencias especiales a medida · Resistencias eléctricas · Sondas de temperatura · Control de nivel · Contacto (CTA con «adjunta tu plano») |
| **Empresa** | Fabricación a medida · las 4 familias · Asturias · Contacto · catálogos |
| **Nuevos productos** | La categoría de cada novedad (chillers → `equiposderefrigeracion-refrigeradores-chillers.html`; multiplexores → `controltemperatura-convertidores.html`; calefactores de inmersión ATEX → `resistencias-atex.html`; sensores de nivel IoT → `controldenivel.html`) y sus 2 PDF |
| **Contacto** | Las dos sedes (`/oviedo/`) · Política de privacidad (casilla RGPD) |
| **Sede (/oviedo/)** | Las 4 familias y las directas · Fabricación a medida · Contacto · catálogos |
| **Legales y mapa web** | El mapa web enlaza las 52 páginas (lo genera `build.js` desde `familias.json`) |
| **Pie (todas)** | Las 4 familias + directas, Fabricación a medida, Empresa, Contacto, Asturias, Privacidad, Cookies, Mapa web, catálogos, teléfonos (`tel:`) y emails (`mailto:`) de las dos sedes |

### Enlaces cruzados entre categorías (apoyados en el contenido de /legacy)

| Desde | Hacia | Motivo (dato de /legacy) |
|---|---|---|
| `resistencias-tipo-cartucho` (Cartuchos con termopar) | `controltemperatura-sondastemperatura` | Cartuchos con sonda incorporada |
| `resistencias-atex` | `resistencias-mantas-calefactoras` | Mantas ATEX para bidones e IBC |
| `resistencias-mantas-calefactoras` | `resistencias-atex` | Ídem |
| `resistencias-calentamientoaire` (Aerotermo industrial ATEX) | `resistencias-atex` | El aerotermo ATEX aparece en las dos |
| `controltemperatura-sondastemperatura` | `controltemperatura-accesorios-sondas`, `controltemperatura-cables-compensacion`, `controltemperatura-convertidores` | Conectores, vainas, cables y convertidores para sondas |
| `controltemperatura-indicadores-de-procesos` | `controltemperatura-reles-estado-solido` | Relés de potencia para los controladores |
| `controldenivel-sensores-conductivos` | `controldenivel-reles-de-nivel` | «Necesitan conectarse a un relé de nivel» |
| `controldenivel-reles-de-nivel` | `controldenivel-sensores-conductivos` | Ídem |
| `controldenivel-sensores-de-presion` | `presionhumedad-sensores-de-presion` | Mismo nombre y distinto uso. Desde el 2026-10-09 se diferencian en title y H1: «Sensores de nivel por presión» y «Sensores de presión industriales». Los rótulos del menú siguen siendo «Sensores de presión» (la familia ya da el contexto). |
| `presionhumedad-sensores-de-presion` | `controldenivel-sensores-de-presion` | Ídem |
| `presionhumedad-sondas-de-humedad` | `controltemperatura-dataloggers` | Log-Tag HAXO-8 registra temperatura y humedad |
| `resistencias-*` | `resistencias-especiales-a-medida` | Fabricación a medida dentro de la familia |

### Enlace de presupuesto por producto

- Cada tarjeta de producto lleva «Pedir presupuesto», que enlaza a `/contacto/contacto.html?producto=<nombre>#formulario`.
- Un JS pequeño rellena el asunto del formulario con el producto; sin JS, el formulario funciona igual, solo que vacío.
- La página de contacto tiene canonical sin parámetros, así que estas URLs no generan duplicados.
