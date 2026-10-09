# Plan de contenido

> Cómo se redactan las intros y las metas, qué erratas se corrigen y qué textos se actualizan. Reglas de fondo en [AGENTS.md](../AGENTS.md), sección 4. Responsable: Persona B.
>
> **Recordatorio:** las descripciones de producto de /legacy **se conservan**: solo se corrigen erratas y se mejora el formato. Lo único que se redacta de nuevo son las **intros** de familia y de categoría, las **metas**, los **titles** (ya propuestos en [plan-paginas.csv](plan-paginas.csv)) y los textos de inicio, contacto y `/oviedo/`.

## 1. Plantilla de intro (familia y categoría)

**Longitud: 120-200 palabras**, en 3-4 párrafos cortos (`<p>`). Se tutea al lector, como en la web actual («tu empresa», «Disfruta de nuestros catálogos»).

| Bloque | Contenido | Extensión orientativa |
|---|---|---|
| 1. Qué es y para qué sirve | Qué hace este tipo de producto y en qué aplicaciones o sectores se usa. **Solo aplicaciones y sectores que aparecen en /legacy** para esa página. | 30-50 palabras |
| 2. Qué vas a encontrar | Los tipos, gamas o materiales de la página, con las palabras que usa /legacy (son las que busca el cliente). Sin cifras que no estén en los productos. | 50-80 palabras |
| 3. Fabricación a medida | Una frase: si ningún modelo encaja, se fabrica a medida (a partir de plano o muestra, según /legacy). En instrumentación: sondas a medida si la página lo dice. | 15-30 palabras |
| 4. Llamada a presupuesto | Qué datos conviene enviar para pedir presupuesto (se pregunta al cliente, no se afirma nada técnico), el formulario con adjunto y el teléfono 945 22 33 31. | 25-40 palabras |

La keyword principal de la página ([plan-paginas.csv](plan-paginas.csv)) aparece de forma natural en la primera frase y no más de 2-3 veces en total.

### Ejemplo real: `resistencias-inmersion.html` (solo con datos de /legacy)

> Las resistencias para inmersión calientan directamente el líquido en el que se sumergen: agua, aceite, aceite térmico o baños químicos. Se instalan en depósitos, tanques y recipientes de proceso, y también en equipos de uso doméstico, como las candelas para termo.
>
> En esta página tienes resistencias blindadas en tubo de cobre niquelado o de acero inoxidable con tapón roscado de acoplamiento, monofásicas y trifásicas; grupos calefactores con bridas, preparados para trabajar sometidos a presión; calentadores al paso; copas sumergibles para el fondo del tanque, y sumergidores para líquidos corrosivos, pensados para galvanotecnia y para baños alcalinos, ácidos o salinos. Para enotecnia hay calentadores fabricados íntegramente en acero inoxidable AISI 316L, que facilitan la fermentación del mosto.
>
> Si ningún modelo encaja con tu instalación, fabricamos la resistencia a medida a partir de un plano o de una muestra.
>
> Para pedir presupuesto, indícanos el líquido, las medidas del depósito, la potencia y la tensión de trabajo. Puedes adjuntar un plano o una foto en el formulario o llamarnos al 945 22 33 31.

*(171 palabras, dentro del rango de 120-200.)* De dónde sale cada dato:

| Afirmación | Origen en /legacy (`resistencias-inmersion.html`, salvo indicación) |
|---|---|
| agua, aceite, aceite térmico | Modelos NOB: «Para agua, aceite térmico alta calidad o aceite» |
| baños químicos | Sumergidores: «cualquier disolución química» |
| uso doméstico, candelas para termo | Candelas: «Se fabrica tanto para uso doméstico como para uso industrial» |
| cobre niquelado o acero inoxidable, tapón roscado, monofásicas y trifásicas | Modelos NA, OV, T y DP, ED, ET |
| grupos con bridas sometidos a presión | Grupos calefactores con bridas (GCB) |
| calentadores al paso | Calentadores al paso (GCP) |
| copas sumergibles para fondo de tanque | Copa sumergible |
| galvanotecnia; baños alcalinos, ácidos, salinos | Sumergidores baños agresivos |
| enotecnia, AISI 316L, fermentación del mosto | Resistencias inmersión industria (EPV) |
| a medida a partir de plano o muestra | Meta de `resistencias-especiales-a-medida.html` |
| 945 22 33 31 | Pie y página de contacto |

## 2. Prompt estándar para redactar intros y metas (Claude o ChatGPT)

Se copia **tal cual**. Solo se sustituyen los bloques entre `<<…>>`. Debajo del bloque de datos se pega el JSON de la categoría (o el texto de /legacy de la página).

```text
Eres redactor técnico de la web de BROTOTERMIC, S.L., distribuidor B2B de resistencias
eléctricas calefactoras e instrumentación industrial (temperatura, nivel, presión, humedad)
con sede en Vitoria-Gasteiz y delegación en Oviedo. Además de distribuir, fabrica a medida.
Público: mantenimiento, compras y oficina técnica de empresas industriales.

TAREA: redacta para la página <<archivo.html>>:
1) Una INTRO de 120 a 200 palabras, en 3-4 párrafos (<p>), con esta estructura:
   (1) qué es y para qué sirve, solo con aplicaciones o sectores que aparezcan en los DATOS;
   (2) qué tipos, gamas o materiales hay en la página, con las palabras de los DATOS;
   (3) una frase sobre fabricación a medida (a partir de plano o muestra);
   (4) llamada a pedir presupuesto: qué datos conviene enviar, formulario con adjunto
       (plano o foto) y teléfono 945 22 33 31.
2) Una META DESCRIPTION de 140 a 155 caracteres (cuenta los caracteres con espacios),
   única, que empiece por la keyword o la incluya en los primeros 60 caracteres.

KEYWORD PRINCIPAL: <<keyword de plan-paginas.csv>>  (úsala en la primera frase de la intro;
máximo 3 veces en total).

PROHIBIDO, SIN EXCEPCIONES:
- Inventar o deducir datos técnicos: medidas, potencias, tensiones, temperaturas, grados IP,
  materiales, normas, directivas, certificaciones, homologaciones, plazos, stock o marcas.
  Si un dato no está literalmente en los DATOS, NO lo escribas.
- Añadir sectores, aplicaciones o ventajas que no estén en los DATOS.
- Superlativos y relleno comercial: «líderes», «la mejor calidad», «soluciones integrales»,
  «amplia experiencia», «excelencia».
- Precios, ofertas o referencias a comprar online (no es una tienda).
- Mencionar la Directiva ATEX 94/9/CE como vigente. Si hace falta citar la normativa en general,
  la vigente es la 2014/34/UE; nunca cambies lo que dice un producto sobre su propia certificación.

ESTILO: español de España, tono técnico, claro y cercano. Se tutea al lector. Frases cortas.
Sin signos de exclamación. Sin emojis.

FORMATO DE RESPUESTA (exactamente así):
INTRO_HTML:
<p>…</p>
META (N caracteres):
…
PALABRAS: N
DATOS USADOS: lista con cada afirmación de la intro y el producto o frase de los DATOS
de donde sale. Si alguna afirmación no tiene origen en los DATOS, bórrala de la intro.

DATOS (única fuente permitida):
<<pegar aquí el JSON de data/categorias/<archivo>.json o el texto de /legacy de la página>>
```

**Revisión humana obligatoria (Persona B):** antes de copiar la intro al JSON, se comprueba la tabla «DATOS USADOS», se cuentan las palabras y los caracteres (`build.js` también los valida) y se quita cualquier afirmación sin origen.

## 3. Erratas que hay que corregir

Se corrigen en el texto de la página nueva. **Nunca** en los nombres de archivo `.html`, PDF o imagen (son URLs).

| Archivo | Texto actual | Texto corregido |
|---|---|---|
| resistencias-inmersion.html | Reistencias con caja conexiones IP-44 | Resistencias con caja de conexiones IP44 |
| resistencias-inmersion.html | Gama para aguay para aceite | Gama para agua y para aceite |
| resistencias-inmersion.html | Resistencias inmersion industria | Resistencias de inmersión para industria |
| resistencias-inmersion.html | Cobre niquelado ó Acero inoxidable | cobre niquelado o acero inoxidable |
| resistencias-tipo-cartucho.html | a larga la vida del cartucho | alarga la vida del cartucho |
| resistencias-tipo-cartucho.html | Hilo calefactor Nikel-Cromo / Niquel-Cromo | Hilo calefactor níquel-cromo |
| resistencias-tipo-cartucho.html | punto de fusión 1400 c.º | punto de fusión 1400 ºC |
| resistencias-tipo-cartucho.html | Oxido de magnesio … granulometria | Óxido de magnesio … granulometría |
| resistencias-tipo-cartucho.html | 400ºC y 750ºC ó temperaturas | 400 ºC y 750 ºC o temperaturas |
| resistencias-calentamientoaire.html | Varias potecias y dimensiones | Varias potencias y dimensiones |
| empresa.html | Equipos perféricos | Equipos periféricos |
| empresa.html | Estufas y hormos industriales | Estufas y hornos industriales |
| controltemperatura-sondastemperatura.html | Temosonda con mango | Termosonda con mango |
| controltemperatura-sondastemperatura.html | asilada de masa | aislada de masa |
| controltemperatura-sondastemperatura.html | AlSl 316, AlSl 310 | AISI 316, AISI 310 |
| controltemperatura-sondastemperatura.html | lnconel 600 | Inconel 600 |
| controltemperatura-sondastemperatura.html | Hierro ArmcoB, TeflónB | Hierro Armco®, Teflón® |
| controltemperatura-sondastemperatura.html | Termorresistencia  mineral (doble espacio) | Termorresistencia mineral |
| controltemperatura-termometros.html | Termométros (title, meta, H1) | Termómetros |
| controltemperatura-panelespc-software.html | Control de termperatura (title) | Control de temperatura |
| controltemperatura-indicadores-de-procesos.html | 7segemnetos | 7 segmentos |
| controltemperatura-indicadores-de-procesos.html | histeresis | histéresis |
| controltemperatura-indicadores-de-procesos.html | Modulo adquisición datos Sielco D1 | Módulo de adquisición de datos Sielco D1 |
| controltemperatura-reles-estado-solido.html | Mútiples modelos | Múltiples modelos |
| controltemperatura-equipos-de-medicion.html | Certificado de calibración del fabricante incluído | … incluido |
| controltemperatura-termostatos.html | interruptor macha-paro | interruptor marcha-paro |
| controltemperatura-accesorios-sondas.html | Conectores compensados estandar | Conectores compensados estándar |
| controltemperatura-videoregistradores.html | Meta: «… Ventiladores axiales …» | (se sustituye por la meta nueva) |
| controldenivel-niveles-de-flotador.html | no se empela plomo | no se emplea plomo |
| controldenivel-sensores-de-presion.html | Categoria 1/2 D | Categoría 1/2 D |
| controldenivel-interruptores-magneticos.html | basados en l acción | basados en la acción |
| controldenivel-sensores-capacitivos.html | Distancia actuación: 4…12mmm | Distancia de actuación: 4…12 mm |
| equipos-perifericos.html | estan provistos | están provistos |
| equipos-perifericos.html | Punto de rocio | Punto de rocío |
| equipos-perifericos.html | fibra de vídrio | fibra de vidrio |
| resistencias-mantas-calefactoras.html | Cobertura impermeable deposito IBC / Manta aislante deposito IBC | … depósito IBC |
| resistencias-mantas-calefactoras.html | Mantas calefactoras bidon ATEX | Mantas calefactoras para bidón ATEX |
| ventilacion.html | Dimensiones desde25x25mm | Dimensiones desde 25 × 25 mm |
| nuevos-productos.html | Getways DE HubB | Gateways DE HubB (comprobar el nombre comercial en el PDF de Disibeint) |
| www.brototermic.es / oviedo/ | BROTOTERMIC, S.L. es un empresa líder | (se reescribe sin superlativo: ver apartado 4) |
| Todas las páginas | Alts del tipo «Producto. BROTOTERMIC, S.L.» | Alt descriptivo (propuesta en [plan-imagenes.csv](plan-imagenes.csv)) |
| Todas las páginas | Tildes que faltan en texto visible: inmersion, deposito, bidon, estandar, Modulo, tuberias, solido, presion, medicion, calefaccion | inmersión, depósito, bidón, estándar, Módulo, tuberías, sólido, presión, medición, calefacción |

La lista no es exhaustiva: quien migre cada página revisa la ortografía de todo el texto que copia (tildes, «ó» con tilde entre cifras y palabras, espacio entre número y unidad).

## 4. Textos desactualizados: propuesta de sustitución

«Dato externo» = se usa marcado como «(dato externo, confirmar con cliente)» en `site.json → pendientes` (decisión del 2026-10-09).

| # | Dónde | Texto actual | Propuesta |
|---|---|---|---|
| 1 | index.html | «Con más de 35 años de experiencia, compuesta por un equipo joven y dinámico que se esfuerza por dar el mejor servicio a sus clientes.» | «Desde 1982 suministramos resistencias eléctricas e instrumentación a la industria del País Vasco, de las provincias limítrofes y de Asturias.» (dato externo: 1982) |
| 2 | index.html | «es una de las empresas líderes en el sector de la distribución…» | «es una empresa de distribución de instrumentación industrial especializada…» (sin superlativo) |
| 3 | empresa.html (cita) | «…Después de treinta y cinco años de dedicación y profesionalidad…» | «…Después de más de cuarenta años de dedicación y profesionalidad…» (desde 1982: 44 años en 2026; dato externo) |
| 4 | empresa.html (Servicio) | «Con más de 35 años de experiencia, y compuesta por un equipo joven y dinámico…» | «Con experiencia desde 1982 y un equipo…» (dato externo) |
| 5 | empresa.html (pie) | «Treinta y cinco años de dedicación y profesionalidad.» | Se elimina; el pie es común: «Resistencias eléctricas e instrumentación industrial desde 1982» (dato externo) |
| 6 | .es y /oviedo/ | «Con más de 35 años de experiencia. BROTOTERMIC le ofrece dedicación y profesionalidad.» y el botón «35 años de experiencia» | Texto nuevo de `/oviedo/` con «desde 1982» (dato externo) |
| 7 | resistencias-atex.html | «A partir de Julio del 2003 todos los equipos con puesta en servicio dentro de la Comunidad Europea han de cumplir por obligación con la Directiva Atex 94/9/CE.» | «Los equipos destinados a atmósferas potencialmente explosivas que se comercializan en la Unión Europea deben cumplir la Directiva 2014/34/UE, que sustituyó a la Directiva 94/9/CE el 20 de abril de 2016.» (mención genérica a la normativa: se actualiza) |
| 8 | resistencias-atex.html | «Todos los equipos expuestos en el presente documento están certificados en base a la Directiva Atex 94/9/CE.» | **No se cambia** hasta que el cliente confirme bajo qué directiva están certificados hoy. Si confirma 2014/34/UE: «Todos los equipos de esta página están certificados según la Directiva 2014/34/UE.» |
| 9 | resistencias-mantas-calefactoras.html | «Ex Zone 2 compliance with 94/9 / EC (ATEX)», «with 94/9 / EF (ATEX)», «Atex directive 94/9/EG» | **No se cambia la directiva** (es la certificación del producto). Sí se puede traducir literalmente al español: «Conforme con la 94/9/CE (ATEX), zona 2». Pendiente de confirmación del cliente. |
| 10 | resistencias-atex.html | «Ex II 2 G EEx'e' IIC T2 a T4, según EN 50014 y EN 50019», «EEx"e"», «EEx'd'» | **No se cambia** (marcado del certificado del producto). Pendiente de confirmación. |
| 11 | nuevos-productos.html | H1 «Nuevos Productos 2021» | «Nuevos productos». Qué productos siguen: [POR VERIFICAR con el cliente]. |
| 12 | index.html | «NUEVA DELEGACIÓN EN ASTURIAS» | «Delegación en Asturias» |
| 13 | Pie de todas las páginas | «© 2014» | © + año actual (lo genera `build.js`) |
| 14 | contacto/contacto.html y contacto.html | «03011 Oviedo» | «33011 Oviedo» |
| 15 | contacto, privacidad | «Ptr. Ortiz de Urbina, n. 7» | «C/ Pintor Mauro Ortiz de Urbina, 7 bajo» (dato externo) |
| 16 | privacidad.html | «…visitar la página web de la Agencia española de Protección de Datos, www.agpd.es» | «…www.aepd.es» (dominio actual de la Agencia). **[REVISIÓN CLIENTE]** |
| 17 | privacidad.html y cookies.html | «Código de inscripción en la Agencia Española de Protección de Datos: 2131260399» | **Se elimina** (la inscripción de ficheros desapareció con el RGPD). Decidido el 2026-10-09. |
| 18 | cookies.html | Cookies para compartir en «Facebook, Twitter o Google+» y apartado «Cookies de terceros» | **Se eliminan** las cookies de redes sociales y de terceros que la web no usa (decidido el 2026-10-09). La política describe solo las cookies reales de la web nueva: ninguna de terceros si no hay analítica, mapas incrustados ni reCAPTCHA, y en ese caso no hace falta banner. Si el cliente quiere analítica, se añade (pendiente 10 de AGENTS.md §12). |
| 19 | privacidad.html | Menciones al «grupo BROTOTERMIC» y a «empresas del grupo» | Se mantienen mientras el cliente no diga lo contrario. **[REVISIÓN CLIENTE]**: confirmar si existe tal grupo. |
| 20 | Formulario (privacidad) | El texto legal actual no describe el adjunto (plano o foto) | Añadir la finalidad «atender tu solicitud de presupuesto», la conservación y el tratamiento de los archivos adjuntos **[REVISIÓN CLIENTE]** |

El resto de los textos de privacidad y cookies se publica con la redacción propuesta y queda marcado **[REVISIÓN CLIENTE]** para que lo revise el asesor del cliente (convención en AGENTS.md: comentario HTML en `/content`, aviso en `build.js`, no bloquea).

## 5. Orden de trabajo del contenido

1. **Día 1:** intro, meta y revisión de productos de `resistencias-inmersion.html` (piloto). Se aprueba el formato antes de seguir.
2. **Días 2 y 3:** el resto, en el orden de [tareas.md](tareas.md) (prioridad alta primero).
3. Al terminar cada página: se marca `estado` = `hecho` en `plan-paginas.csv` y se quita `_borrador` del JSON.
