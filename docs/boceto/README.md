# Bocetos del diseño aprobado (opción 3)

> **Son una REFERENCIA VISUAL, no una fuente de datos.** Las imágenes se generaron con IA: los textos, teléfonos, direcciones, fotos de producto, fotos de las sedes y logotipos que aparecen en ellas **son inventados o aproximados**. Los datos reales salen **siempre** de [AGENTS.md](../../AGENTS.md) y de [data/site.json](../../data/site.json), y los textos, de /legacy y de los planes de `/docs`. Si un boceto contradice a AGENTS.md, manda AGENTS.md.
>
> Lo que sí se toma de los bocetos: la composición, la jerarquía, el estilo (cabecera blanca, azul corporativo, tarjetas con foto sobre fondo claro, pie azul oscuro) y el tipo de bloques.

## Qué muestra cada imagen

| Imagen | Qué muestra |
|---|---|
| [opcionescritorio.png](opcionescritorio.png) | **Inicio en escritorio**, de arriba abajo: cabecera blanca con logo, menú (Inicio, Empresa, Productos, Fabricación a medida, Contacto) y botón «Pedir presupuesto»; hero partido (texto a la izquierda con un antetítulo, foto a la derecha con el rótulo «Precisión · Calor · Control»); franja de confianza con 4 iconos; «Nuestras familias de productos» con 4 tarjetas con foto, icono y enlace «Ver…»; bloque «¿Necesitas una solución especial?» (fabricación a medida) con foto, 3 ventajas y botón «Adjuntar archivo»; «Marcas que nos respaldan» con logos; «Nuestras sedes» con foto y datos; pie azul oscuro en 4 columnas. |
| [opcionmovilyescritorio.png](opcionmovilyescritorio.png) | **Inicio en escritorio y en móvil.** Escritorio: igual que la anterior, más un **buscador** («¿Qué necesitas?…») bajo el hero, **8 tarjetas** de familia (las 4 familias y las 4 «directas»), una franja de **sectores industriales** y el teléfono en la cabecera. Móvil: cabecera con teléfono, botón de presupuesto y menú ☰; hero con la foto arriba; buscador; franja de confianza en 4 iconos; **familias como lista desplegable** con miniatura; sectores en iconos; bloque de fabricación a medida; **botón fijo «Llamar»** al pie de la pantalla. |

## Datos de los bocetos que NO se deben copiar

| En el boceto | Dato real o regla |
|---|---|
| Teléfonos «945 29 12 34» y «985 27 45 18» | Vitoria **945 22 33 31**, Oviedo **629 462 642** (site.json) |
| «Pol. Ind. Júndiz, Pab. 12, 01015 Vitoria» y «Pol. Ind. de la Corredoria, 33011 Oviedo» | **C/ Pintor Mauro Ortiz de Urbina, 7 bajo, 01008** y **Llano Ponte nº 8 bajo, 33011** (site.json) |
| Fotos de edificios industriales en las sedes | Fotos reales de las oficinas (`brototermic.jpg` y `oviedo/images/brototermic-oviedo.jpg`) |
| Logotipo «BrotoTermic» redibujado | Logo provisional `images/logo-claro.png` hasta que llegue el SVG del cliente (D-002, pendiente 14) |
| Logos de marca dibujados por la IA | Logos oficiales en SVG, pedidos al cliente (pendiente 8); mientras tanto, los nombres en texto |
| Fotos de producto y del hero | Fotos originales de /legacy a su tamaño real (D-005); hero `slide-1` |
| «Más de 40 años», «Desde los años 80» | «Desde 1982» (dato externo, confirmar con cliente; plan-contenido §4.1) |
| «Marcas líderes», «la mejor solución» | Sin superlativos (AGENTS.md §4) |
| «Tiempos de entrega ajustados», «Fabricación en diferentes materiales», «Diseño y asesoramiento técnico» | No se publican ventajas que no estén en /legacy (prohibido inventar, AGENTS.md §4) |
| Agrupaciones «Presión y nivel», «Control de nivel y ventilación» | Las 4 familias y 4 directas de familias.json / arquitectura.md |
| Sectores «Plástico, Tratamientos térmicos y galvánicos, Alimentación, Química, Fundición» | Solo los sectores que aparecen en /legacy (arquitectura.md, «Bloque de sectores»): «Fundición» no está |
| Enlace «Aviso legal» en el pie | En /legacy el aviso legal va dentro de `privacidad.html`; no hay página propia |

## Diferencias importantes entre los bocetos y lo construido (2026-10-10)

Se apuntan para decidir; **no se han corregido**.

1. **Buscador visible bajo el hero.** El boceto lo pone en el inicio, a la vista; lo construido solo tiene el buscador de categorías dentro del megamenú (diseno.md §3.15).
2. **Bloque de sectores industriales.** Está en el boceto y especificado en arquitectura.md («Bloque de sectores»), pero no está construido ni en el inicio ni en las familias.
3. **Familias en móvil.** El boceto las muestra como una lista desplegable con miniatura; lo construido usa las mismas tarjetas con foto que en escritorio, en una columna (página más larga en móvil).
4. **Botón fijo «Llamar» en móvil.** Está en el boceto; lo construido no lo tiene (el teléfono está en la cabecera y en la CTA).
5. **Hero.** El boceto usa una foto grande que llega al borde, con antetítulo y el rótulo «Precisión · Calor · Control»; lo construido usa `slide-1` a su tamaño real (910 px, D-004) junto al texto, sin antetítulo ni rótulo.
6. **Iconos.** El boceto lleva iconos en la franja de confianza y en las tarjetas de familia; lo construido no lleva iconos (solo texto y foto).
7. **Tarjetas de familia.** El boceto añade un enlace «Ver productos →»; lo construido hace clicable toda la tarjeta desde el título (y muestra el número de categorías o productos).
8. **Bloque de fabricación a medida.** El boceto tiene foto propia, 3 ventajas y un botón «Adjuntar archivo»; lo construido tiene la miniatura y el texto de /legacy y el botón «Fabricación a medida» (las ventajas no están en /legacy).
9. **Marcas.** El boceto muestra logos; lo construido muestra los nombres en texto y la tira de logos antigua (`brototermic-marcas-representadas.jpg`) hasta que lleguen los SVG.
10. **Menú.** El boceto: Inicio · Empresa · Productos · Fabricación a medida · Contacto, sin franja superior. Lo construido: Productos · Fabricación a medida · Empresa · Asturias · Contacto, con la franja azul de teléfonos y email (D-002) y el enlace a la landing de Asturias.
11. **Pie.** El boceto tiene 4 columnas con «Quiénes somos» y «Marcas»; lo construido tiene catálogos PDF, productos, empresa y las dos sedes con dirección completa (NAP).

Con este documento queda cerrado el hallazgo **M-07** de [auditoria-final.md](../auditoria-final.md): el diseño aprobado ya está en el repositorio, con sus límites claros.
