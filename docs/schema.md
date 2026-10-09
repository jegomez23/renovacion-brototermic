# Datos estructurados (JSON-LD)

> Especificación de campos y de su origen. El código lo escribe la Persona A en el partial `schema`. Los nombres de campo de origen son los de [datos.md](datos.md).
> Regla general (AGENTS.md): **nada de `Product` ni de `Offer`**, porque no hay precios. Todo el JSON-LD va en un único `<script type="application/ld+json">` por página, con un `@graph`.

## 1. Qué lleva cada tipo de página

| Tipo de página | Organization | LocalBusiness Vitoria | LocalBusiness Oviedo | BreadcrumbList | ItemList |
|---|---|---|---|---|---|
| Inicio | ✔ completo | ✔ | ✔ | — (ver nota) | — |
| Familia | ✔ (referencia) | — | — | ✔ | ✔ de categorías |
| Categoría | ✔ (referencia) | — | — | ✔ | ✔ de productos (si hay ≥ 1) |
| Servicio: empresa, fabricaciones, nuevos productos | ✔ (referencia) | — | — | ✔ | — |
| Contacto | ✔ (referencia) | ✔ | ✔ | ✔ | — |
| Sede `/oviedo/` | ✔ (referencia) | — | ✔ | ✔ | — |
| Legal y mapa web | ✔ (referencia) | — | — | ✔ | — |

- **«Completo»** = el objeto con todas sus propiedades. **«Referencia»** = un nodo mínimo `{"@type": "Organization", "@id": …, "name": …, "url": …}`, para que cada página tenga su editor sin repetir todos los datos.
- **Nota sobre el inicio:** AGENTS.md pedía BreadcrumbList en todas las páginas. En el inicio no se incluye, porque una miga de un solo elemento no aporta nada y Google recomienda al menos dos. Es la única excepción.

## 2. Identificadores (`@id`)

Fijos, para que los nodos se enlacen entre páginas:

| Nodo | `@id` |
|---|---|
| Organization | `{host}/#organizacion` |
| LocalBusiness Vitoria | `{host}/#sede-vitoria` |
| LocalBusiness Oviedo | `{host}/oviedo/#sede-oviedo` |
| WebPage de cada página | `{canonical}#pagina` (opcional; si se usa, `isPartOf` y `publisher` apuntan a la organización) |

`{host}` = `site.json → host` (`https://brototermic.com`).

## 3. Organization

| Propiedad | Valor / origen | Nota |
|---|---|---|
| `@type` | `"Organization"` | |
| `@id` | `{host}/#organizacion` | |
| `name` | `site.nombre` | `"BROTOTERMIC"` |
| `legalName` | `site.razonSocial` | `"BROTOTERMIC, S.L."` |
| `taxID` | `site.cif` | `"B01266303"` |
| `url` | `{host}/` | |
| `logo` | `{host}/images/<logo>` | El SVG cuando llegue; mientras tanto el PNG. Google pide al menos 112×112 px: [POR VERIFICAR con el logo final]. |
| `foundingDate` | `site.fundacion` | `"1982"`. Dato externo: se usa, pero está en `site.pendientes` hasta que el cliente lo confirme. |
| `email` | `sedes[vitoria].email` | |
| `telephone` | `sedes[vitoria].tel` | `+34945223331` |
| `address` | PostalAddress de Vitoria (ver LocalBusiness) | |
| `contactPoint` | 2 × `ContactPoint` (uno por sede): `telephone`, `email`, `contactType: "sales"`, `areaServed` («ES»), `availableLanguage: "es"` | |
| `subOrganization` | `[{ "@id": "{host}/#sede-vitoria" }, { "@id": "{host}/oviedo/#sede-oviedo" }]` | |
| `brand` | `site.marcas[].nombre` como `Brand` | Son marcas que **representa**; no son marcas propias. Si hay duda, se omite [POR VERIFICAR]. |

## 4. LocalBusiness (uno por sede)

| Propiedad | Origen (`site.sedes[id]`) | Vitoria | Oviedo |
|---|---|---|---|
| `@type` | fijo | `"LocalBusiness"` | `"LocalBusiness"` |
| `@id` | fijo | `{host}/#sede-vitoria` | `{host}/oviedo/#sede-oviedo` |
| `name` | `"BROTOTERMIC — " + localidad` | BROTOTERMIC — Vitoria-Gasteiz | BROTOTERMIC — Oviedo |
| `parentOrganization` | `{ "@id": "{host}/#organizacion" }` | ✔ | ✔ |
| `url` | `{host}` + `pagina` | `/contacto/contacto.html` | `/oviedo/` |
| `telephone` | `tel` | `+34945223331` | `+34629462642` |
| `email` | `email` | info@brototermic.com | brototermic@brototermic.com |
| `image` | `{host}/images/<foto>.jpg` | `brototermic` (fachada) | `brototermic-oviedo` |
| `address.@type` | fijo | `PostalAddress` | `PostalAddress` |
| `address.streetAddress` | `direccion` | C/ Pintor Mauro Ortiz de Urbina, 7 bajo (dato externo) | Llano Ponte nº 8 bajo |
| `address.postalCode` | `cp` | 01008 | **33011** |
| `address.addressLocality` | `localidad` | Vitoria-Gasteiz | Oviedo |
| `address.addressRegion` | `provincia` | Álava | Asturias |
| `address.addressCountry` | `pais` | ES | ES |
| `geo` | `geo` | Solo si no es `null` [POR VERIFICAR] | Ídem. **Nunca** las coordenadas de Madrid del iframe antiguo. |
| `hasMap` | `mapaUrl` | Si no es `null` | Si no es `null` |
| `openingHours` | `horario` | Se omite mientras sea `null` | Ídem |
| `areaServed` | fijo | `"País Vasco"`. Las «provincias limítrofes» que cita /legacy se añaden solo cuando el cliente diga cuáles [POR VERIFICAR]. | `"Asturias"` |

Si una propiedad no tiene dato, **se omite**. Nunca se rellena con un valor inventado o genérico.

## 5. BreadcrumbList

Reproduce las migas visibles (ver [arquitectura.md](arquitectura.md), apartado 3).

| Propiedad | Origen |
|---|---|
| `itemListElement[n].@type` | `"ListItem"` |
| `itemListElement[n].position` | 1, 2, 3… |
| `itemListElement[n].name` | El rótulo de la miga: «Inicio», `familias[].nombre`, `familias[].categorias[].menu` o el H1 corto de servicio/legal |
| `itemListElement[n].item` | URL canónica absoluta de ese nivel. El último elemento también lleva `item` (su propia URL canónica). |

Ejemplo de niveles para `/resistencias-inmersion.html`: (1) Inicio → `{host}/`, (2) Resistencias eléctricas → `{host}/resistencias-electricas.html`, (3) Inmersión → `{host}/resistencias-inmersion.html`.

## 6. ItemList

### En categorías (productos)

| Propiedad | Origen |
|---|---|
| `@type` | `"ItemList"` |
| `name` | `categoria.h1` |
| `numberOfItems` | `productos.length` |
| `itemListOrder` | `"https://schema.org/ItemListUnordered"` |
| `itemListElement[n]` | `{ "@type": "ListItem", "position": n, "name": producto.nombre, "url": "{canonical}#<ancla>" }` |
| `itemListElement[n].image` | `{host}/images/<producto.img>.jpg` (opcional, solo si hay `img`) |

No se incluye `ItemList` si `productos` está vacío (p. ej. `resistencias-especiales-a-medida`).

### En familias (categorías)

Igual, pero cada `ListItem` es una categoría: `name` = `categorias[].menu` y `url` = `{host}/<archivo>.html`.

## 7. Validación

- Cada tipo de plantilla se valida con la [Prueba de resultados enriquecidos](https://search.google.com/test/rich-results) y con [validator.schema.org](https://validator.schema.org/) antes de dar por terminada la página piloto, y de nuevo antes de publicar (ver [checklist-publicacion.md](checklist-publicacion.md)).
- Cero errores. Las advertencias se revisan una a una: solo se dejan las que se deben a datos que no tenemos (p. ej. `openingHours`).
