# Revisión documentada de los 25 borradores de la Persona B

> 2026-10-13. Revisión de evidencia y tres correcciones de alcance aplicadas. Sin aprobación automática ni integración de `revision/complemento-b`.

## Alcance y ejecución real

Se revisa el lote **T-15** de `origin/revision/complemento-b:docs/revision-sesion-b.md`: 11 categorías de resistencias, 2 de presión/humedad, 4 directas, 2 familias y 6 textos. El reparto consta como propuesta en ese documento; aquí sirve para seleccionar el lote pedido de 25, sin cambiar la propiedad de los archivos.

- Base leída: `HEAD` y `origin/main` = `bbdbe794450082fdc055f65a17f8ced0d23867c2`.
- Decisiones y herramienta remotas: `origin/revision/complemento-b` = `ada1d14cc6c7b5ebf4e235ed51b6feac118f951e`.
- Leídos AGENTS.md completo, D-014 a D-019 y el reparto T-15; el archivo remoto se consultó con `git show`.
- Ejecutada una copia temporal real de `tools/revision-borradores.js`, con el lector local `tools/lib/legacy.js` y `catalogos-pdf.txt` de esa referencia remota. Se cambiaron solamente las rutas de salida y se instrumentó la copia temporal para extraer sus resultados en JSON.
- Ejecución: `node /private/tmp/brototermic-revision-25/revision-borradores.js` terminó con código 0. Resultado global: 51 piezas, 73 frases rojas, 297 ámbar y 287 verdes. Subconjunto T-15: **25 piezas, 36 rojas, 149 ámbar y 200 verdes**.
- Artefactos temporales reales: `/private/tmp/brototermic-revision-25/revision-borradores.html`, `analisis.json` y `lote-25.json`. No son archivos publicados ni aprobaciones exportadas. Sus conclusiones quedan conservadas abajo.

Los colores miden coincidencia de vocabulario. Un plural, una conjugación, una CTA aprobada o una modificación legal autorizada pueden resultar rojos. También una frase ámbar puede cambiar el alcance de una prestación. Por eso la evidencia se revisa por producto y archivo, sin usar el porcentaje como aprobación. El texto extraído de PDF solo sirve para buscar; los escaneados requieren inspección del PDF. Ninguna conclusión de este informe depende de atribuir una especificación nueva a un PDF sin verlo.

## Inventario del lote

| Pieza actual | Rojo / ámbar / verde | Estado de esta revisión |
|---|---:|---|
| `data/categorias/equipos-perifericos.json` | 1 / 4 / 1 | Evidencia histórica localizada; pendiente aprobación humana |
| `data/categorias/equiposderefrigeracion-refrigeradores-chillers.json` | 1 / 6 / 0 | Evidencia histórica localizada; pendiente aprobación humana |
| `data/categorias/hornos-industriales.json` | 2 / 5 / 2 | Evidencia histórica localizada; pendiente aprobación humana |
| `data/categorias/presionhumedad-sensores-de-presion.json` | 2 / 5 / 2 | Frase general y alcance de sensor cerámico corregidos; borrador conservado |
| `data/categorias/presionhumedad-sondas-de-humedad.json` | 2 / 5 / 2 | Dos precisiones de redacción propuestas |
| `data/categorias/resistencias-atex.json` | 0 / 6 / 2 | Corrección de certificaciones ya existe en complemento-b |
| `data/categorias/resistencias-calefaccion-industrial.json` | 1 / 4 / 1 | Evidencia histórica localizada; pendiente aprobación humana |
| `data/categorias/resistencias-calentamientoaire.json` | 0 / 7 / 2 | Evidencia histórica localizada; pendiente aprobación humana |
| `data/categorias/resistencias-especiales-a-medida.json` | 2 / 6 / 0 | Corrección de la intro ya existe en complemento-b; meta a revisar |
| `data/categorias/resistencias-flexibles.json` | 1 / 7 / 2 | Corrección de alcance AFHSSD aplicada; borrador conservado |
| `data/categorias/resistencias-infrarrojos.json` | 0 / 7 / 2 | Evidencia histórica localizada; pendiente aprobación humana |
| `data/categorias/resistencias-inmersion.json` | 1 / 6 / 2 | Evidencia histórica localizada; pendiente aprobación humana |
| `data/categorias/resistencias-mantas-calefactoras.json` | 2 / 5 / 2 | Evidencia histórica localizada; pendiente aprobación humana |
| `data/categorias/resistencias-planas.json` | 3 / 4 / 3 | Evidencia histórica localizada; pendiente aprobación humana |
| `data/categorias/resistencias-tipo-abrazadera.json` | 2 / 6 / 1 | Evidencia histórica localizada; pendiente aprobación humana |
| `data/categorias/resistencias-tipo-cartucho.json` | 1 / 7 / 2 | Evidencia histórica localizada; pendiente aprobación humana |
| `data/categorias/ventilacion.json` | 3 / 5 / 2 | Evidencia histórica localizada; pendiente aprobación humana |
| `data/familias.json#resistencias-electricas` | 0 / 6 / 2 | Evidencia histórica localizada; pendiente aprobación humana |
| `data/familias.json#presionhumedad` | 1 / 5 / 2 | Evidencia histórica localizada; pendiente aprobación humana |
| `content/contacto.html` | 2 / 2 / 0 | Quitada promesa «rápido»; borrador conservado |
| `content/cookies.html` | 1 / 2 / 11 | Revisión cliente y comprobación navegador final |
| `content/fabricaciones-a-medida.html` | 2 / 9 / 11 | Evidencia histórica localizada; pendiente aprobación humana |
| `content/nuevos-productos.html` | 1 / 10 / 17 | Confirmación de vigencia y nombre DE HubB |
| `content/oviedo.html` | 0 / 6 / 14 | Corrección de «mismo catálogo» ya existe en complemento-b |
| `content/privacidad.html` | 5 / 14 / 115 | Revisión cliente y NAP pendiente |

## Hallazgos que no detecta bien el color

1. **Flexibles:** la frase sobre fundir o reducir viscosidad tiene origen, pero ese origen pertenece solo a **AFHSSD**. No respalda trasladarlo a BSA, AFBS y AFAFS. Propuesta exacta en R-12 abajo.
2. **Presión:** «transmisores con sensor cerámico de óxido de aluminio … el TPSP42» puede atribuir ese material al TPSP42. El artículo histórico de TPSP42 no lo indica, mientras TPSP22, TPSP41, TPSP 32 y TPSM40 sí. Proponer: «En esta página tienes los transmisores TPSP22, TPSP41, TPSP42 y TPSP 32, con salida de 4-20 mA o 0-10 V, y el TPSM40, con salida de 4-20 mA. Los modelos TPSP22, TPSP41, TPSP 32 y TPSM40 incorporan sensor cerámico de óxido de aluminio». La descripción original TPSP42 se conserva íntegra. Ver [artículos históricos](../legacy/com/brototermic.com/presionhumedad-sensores-de-presion.html).
3. **ATEX:** «la certificación de cada equipo figura en su descripción» promete documentación para todos. `origin/revision/complemento-b` ya lo cambia por «cuando la certificación está disponible, figura en la descripción del equipo. Pregúntanos por la del modelo que te interese». Esperar la integración segura; no duplicar el cambio. Las certificaciones históricas de producto no se actualizan.
4. **Oviedo:** «el mismo catálogo … que la sede central» carece de respaldo en el histórico `.es`. `complemento-b` ya lo limita a «Desde nuestra delegación en Oviedo atendemos a las empresas de Asturias en resistencias eléctricas calefactoras e instrumentación industrial». La actividad de la delegación y el año 1982 siguen en las preguntas/datos externos autorizados.
5. **Resistencias especiales:** «te ayuda a definir» no es literal ni una prestación claramente delimitada en el histórico. La rama de Juan lo cambia por «te ofrece soluciones reales de manera inmediata y reduce al máximo el plazo de suministro», con origen en el párrafo histórico. No duplicar. Su origen histórico no acredita un plazo comercial nuevo; si se opta por reducir el tono en una futura revisión, hacerlo en la intro, conservando el cuerpo original.
6. **Contacto:** «Para un presupuesto rápido» insinúa una respuesta rápida sin plazo confirmado. Cambiar únicamente a «Para pedir presupuesto».
7. **NAP de privacidad:** permanecen simultáneamente «Pintor Ortiz de Urbina, n.7» y «Pintor Mauro Ortiz de Urbina, 7 bajo». Es una diferencia conocida entre el histórico y el dato externo autorizado. Proponer unificar el dato de sede tras coordinación con Juan y conservar el registro en `site.json → pendientes`; no modificar todo el legal fuera de las sustituciones autorizadas.

Los ámbar de stock en cartucho y abrazadera tienen frases históricas expresas («Amplio stock y fabricaciones a medida», «Diversas medidas y potencias en stock»). Las cifras de hornos, ventilación, chiller, inmersión, planas y abrazadera se localizaron en sus artículos originales. La intro nueva no acredita vigencia comercial: conservar los datos históricos y no añadir disponibilidad, plazos o certificación actual.

## Las 36 frases rojas: evidencia y disposición propuesta

Todas las disposiciones siguientes requieren la revisión humana del lote antes de quitar `_borrador` o `borrador: si`. «Conservar» significa que se ha localizado evidencia o autorización expresa; no significa aprobada ni publicada.

### `data/categorias/equipos-perifericos.json`

**R-01 · Intro** — «Los equipos periféricos son maquinaria auxiliar para el sector industrial de la transformación de termoplásticos: alimentan, secan, dosifican y mezclan el material, controlan la temperatura del proceso y mantienen limpias las máquinas.»

**Evidencia:** [equipos-perifericos.html](../legacy/com/brototermic.com/equipos-perifericos.html): «Los secadores se utilizan en el procesamiento de materiales plásticos en gránulos hidroscópicos»; artículos Dosificadores, Mezcladores, Atemperadores y Desincrustadores.

**Propuesta:** Conservar. «secan» es una conjugación que el vocabulario automático no reconoce. Resume funciones presentes, sin cifras nuevas.


### `data/categorias/equiposderefrigeracion-refrigeradores-chillers.json`

**R-02 · Intro** — «Para pedir presupuesto, indícanos la potencia frigorífica que necesitas, la temperatura del agua, si el equipo irá en el interior o al aire libre y el tipo de condensación que prefieres.»

**Evidencia:** [equiposderefrigeracion-refrigeradores-chillers.html](../legacy/com/brototermic.com/equiposderefrigeracion-refrigeradores-chillers.html): «Refrigeradores compactos para la instalación al aire libre.» [plan-contenido.md §1](plan-contenido.md): «se pregunta al cliente, no se afirma nada técnico»; adjunto autorizado en AGENTS.md §2 y contrato de [site.json](../data/site.json) (envío desactivado).

**Propuesta:** Conservar la solicitud. «irá» no promete una especificación ni disponibilidad; es una pregunta al lector.


### `data/categorias/hornos-industriales.json`

**R-03 · Intro** — «Los hornos SM, de solera móvil (vagoneta) para facilitar la carga y la descarga, están pensados para piezas pesadas o de gran tamaño y se fabrican con 2 acabados y 4 temperaturas máximas diferentes.»

**Evidencia:** [hornos-industriales.html](../legacy/com/brototermic.com/hornos-industriales.html): «Tratamiento térmico (temple, revenido, sinterizado, esmaltado...) de piezas pesadas o de gran tamaño. La solera móvil (vagoneta) facilita la carga y descarga.» «Se fabrican con 2 acabados y 4 temperaturas máximas diferentes.»

**Propuesta:** Conservar. «pensados» parafrasea el destino de uso del SM; cifras idénticas.

**R-04 · Intro** — «Para pedir presupuesto, indícanos el tratamiento térmico que vas a hacer, la temperatura máxima, el tamaño y el peso de las piezas y la producción prevista.»

**Evidencia:** [plan-contenido.md §1](plan-contenido.md): «se pregunta al cliente, no se afirma nada técnico»; adjunto autorizado en AGENTS.md §2 y contrato de [site.json](../data/site.json) (envío desactivado). [hornos-industriales.html](../legacy/com/brototermic.com/hornos-industriales.html): «Diseñados para el tratamiento térmico de piezas hasta 1200ºC»

**Propuesta:** Conservar como solicitud de datos. «vas» no es una prestación del equipo.


### `data/categorias/presionhumedad-sensores-de-presion.json`

**R-05 · Intro** — «Los sensores de presión industriales miden la presión de líquidos y gases en un proceso y la convierten en una señal normalizada para los equipos de control.»

**Evidencia:** [presionhumedad-sensores-de-presion.html](../legacy/com/brototermic.com/presionhumedad-sensores-de-presion.html): «Señal de salida normalizada: 4-20mA, 0-10V.»; TPSM40: «lectura continua de nivel hidrostático». La página termina «Otros modelos para gasoil, líquidos agresivos, bajas presiones…etc.»

**Propuesta:** Limitar la frase general a lo documentado: «Aquí tienes transmisores y detectores de presión para el control de procesos, incluidos transmisores con señal de salida normalizada». No asignar la compatibilidad con gases a todos los modelos sin PDF o cliente.

**R-06 · Intro** — «Si lo que necesitas es controlar el nivel de productos sólidos en silos, consulta los sensores de nivel por presión .»

**Evidencia:** [controldenivel-sensores-de-presion.html](../legacy/com/brototermic.com/controldenivel-sensores-de-presion.html): «A medida que el material que entra en el silo se amontona y cubre la membrana, la presión que ejerce la obliga a retroceder accionando el interruptor alojado en la caja.»

**Propuesta:** Conservar enlace. «silos» es el plural del «silo» histórico; el clasificador falla con esta flexión.


### `data/categorias/presionhumedad-sondas-de-humedad.json`

**R-07 · Intro** — «Las sondas de humedad miden la humedad relativa, y muchas también la temperatura, y envían la señal a los instrumentos de medida y control.»

**Evidencia:** [presionhumedad-sondas-de-humedad.html](../legacy/com/brototermic.com/presionhumedad-sondas-de-humedad.html): «Las sondas de humedad de la serie EWHS son sensores construidos para conectarse a instrumentos de medición de humedad y humedad/temperatura»; EWHS-314: «Sensor que incorpora sonda de temperatura (PT-100) y humedad (Hygromer)».

**Propuesta:** Conservar medición; precisar «varios modelos también miden temperatura» en vez de «muchas», que evita una cantidad imprecisa.

**R-08 · Intro** — «Para registrar estos valores de forma autónoma, consulta los dataloggers .»

**Evidencia:** [controltemperatura-dataloggers.html](../legacy/com/brototermic.com/controltemperatura-dataloggers.html): «Registrador económico con sensor de temperatura y humedad integrado.»; HAXO-8, batería y 8.000 puntos de medición.

**Propuesta:** Proponer «Para registrar la humedad y la temperatura, consulta los dataloggers». Elimina «de forma autónoma» y limita el enlace a las variables presentes en HAXO-8.


### `data/categorias/resistencias-calefaccion-industrial.json`

**R-09 · Intro** — «Si buscas otra potencia o configuración, consúltanos: también fabricamos resistencias a medida a partir de un plano o de una muestra.»

**Evidencia:** [resistencias-especiales-a-medida.html](../legacy/com/brototermic.com/resistencias-especiales-a-medida.html): «construir cualquier tipo de resistencia ya sea a partir de un plano o de una muestra» [fabricaciones-a-medida.html](../legacy/com/brototermic.com/fabricaciones-a-medida.html): «Todas las fabricaciones especiales se realizan según planos aportados por el cliente o diseñados por la Oficina Técnica de nuestros fabricantes representados.»

**Propuesta:** Conservar. Respaldo transversal de fabricación de resistencias; no promete fabricar a medida todo aerotermo o convector.


### `data/categorias/resistencias-especiales-a-medida.json`

**R-10 · Meta** — «Asesoramiento técnico y presupuesto.»

**Evidencia:** [fabricaciones-a-medida.html](../legacy/com/brototermic.com/fabricaciones-a-medida.html): «Disponemos de un equipo comercial dispuesto a atender cualquiera de sus consultas respaldado por el cualificado departamento técnico de nuestros fabricantes»

**Propuesta:** Conservar solo si se entiende como atención técnica comercial, sin atribuir ingeniería propia. Más prudente: «Consulta tu caso y pide presupuesto». Ajustar toda la meta a 140–155 caracteres antes de aplicar.

**R-11 · Intro** — «Puedes adjuntar los archivos en el formulario o llamarnos al 945 22 33 31.»

**Evidencia:** [plan-contenido.md §1](plan-contenido.md): «se pregunta al cliente, no se afirma nada técnico»; adjunto autorizado en AGENTS.md §2 y contrato de [site.json](../data/site.json) (envío desactivado).

**Propuesta:** Conservar; describe un campo real. Añadir disponibilidad actual solo cuando envioActivo se habilite en el hosting.


### `data/categorias/resistencias-flexibles.json`

**R-12 · Intro** — «Completan la gama las resistencias laminares autoadhesivas BSA y las bandas calefactoras de silicona AFBS, AFAFS y AFHSSD para bidones, pensadas para fundir o reducir la viscosidad de jabones, grasas, barnices y productos con base de aceite.»

**Evidencia:** [resistencias-flexibles.html](../legacy/com/brototermic.com/resistencias-flexibles.html): «El AFHSSD está específicamente diseñado para fundir o reducir la viscosidad de jabones, grasas, barnices, y productos con base de aceite.»

**Propuesta:** CORREGIR alcance: «Completan la gama las resistencias laminares autoadhesivas BSA y las bandas calefactoras de silicona AFBS, AFAFS y AFHSSD. El modelo AFHSSD está diseñado para fundir o reducir la viscosidad de jabones, grasas, barnices y productos con base de aceite». El uso no está acreditado para BSA, AFBS y AFAFS.


### `data/categorias/resistencias-inmersion.json`

**R-13 · Intro** — «En esta página tienes resistencias blindadas en tubo de cobre niquelado o de acero inoxidable con tapón roscado de acoplamiento, monofásicas y trifásicas; grupos calefactores con bridas, preparados para trabajar sometidos a presión; calentadores al paso; copas sumergibles para el fondo del tanque, y sumergidores para líquidos corrosivos, pensados para galvanotecnia y para baños alcalinos, ácidos o salinos.»

**Evidencia:** [resistencias-inmersion.html](../legacy/com/brototermic.com/resistencias-inmersion.html): «Copa sumergible»; «Resistencias de inmersión para fondo de tanque»; «Los grupos calefactores GCB son equipos de calentamiento preparados para trabajar sometidos a presión»; «Calentadores especiales que se emplean sobre todo en galvanotecnia para líquidos corrosivos».

**Propuesta:** Conservar. «copas» es plural de Copa y «pensados» resume la aplicación histórica. Los usos se atribuyen a los grupos correctos.


### `data/categorias/resistencias-mantas-calefactoras.json`

**R-14 · Intro** — «Las mantas calefactoras envuelven el recipiente para calentar de forma rápida y eficaz los fluidos y materiales almacenados en depósitos IBC y en bidones.»

**Evidencia:** [resistencias-mantas-calefactoras.html](../legacy/com/brototermic.com/resistencias-mantas-calefactoras.html): «rápido y efectivo calentamiento de fluidos y materiales almacenados en los contenedores IBC»; bidones: «Las mantas son un método sencillo y eficaz para aplicar calor a bidones».

**Propuesta:** Conservar calentamiento; «envuelven» describe la disposición. No deriva un plazo de suministro.

**R-15 · Intro** — «Si tu depósito o tu bidón tiene otra medida, cuéntanos el caso y estudiaremos la solución.»

**Evidencia:** [resistencias-especiales-a-medida.html](../legacy/com/brototermic.com/resistencias-especiales-a-medida.html): «construir cualquier tipo de resistencia ya sea a partir de un plano o de una muestra» [plan-contenido.md §1](plan-contenido.md): «se pregunta al cliente, no se afirma nada técnico»; adjunto autorizado en AGENTS.md §2 y contrato de [site.json](../data/site.json) (envío desactivado).

**Propuesta:** Conservar «estudiaremos la solución»: invitación a consultar, sin prometer una manta a medida ni tamaños no documentados.


### `data/categorias/resistencias-planas.json`

**R-16 · Intro** — «En esta página tienes dos versiones.»

**Evidencia:** [resistencias-planas.html](../legacy/com/brototermic.com/resistencias-planas.html): «Planas soporte de mica» y «Planas soporte de cerámica».

**Propuesta:** Conservar; se cuentan exactamente dos productos, verificables en HTML y JSON.

**R-17 · Intro** — «Si necesitas otra forma, otra medida o una conexión distinta, fabricamos la resistencia a medida a partir de un plano o de una muestra.»

**Evidencia:** [resistencias-especiales-a-medida.html](../legacy/com/brototermic.com/resistencias-especiales-a-medida.html): «construir cualquier tipo de resistencia ya sea a partir de un plano o de una muestra» [resistencias-planas.html](../legacy/com/brototermic.com/resistencias-planas.html): «Tamaños, watios y voltios según características técnicas y demanda.»

**Propuesta:** Conservar fabricación a medida: respaldo explícito y transversal.

**R-18 · Intro** — «Para pedir presupuesto, indícanos las medidas de la superficie que hay que calentar, la temperatura de trabajo, la potencia, la tensión y el tipo de conexión.»

**Evidencia:** [plan-contenido.md §1](plan-contenido.md): «se pregunta al cliente, no se afirma nada técnico»; adjunto autorizado en AGENTS.md §2 y contrato de [site.json](../data/site.json) (envío desactivado). [resistencias-planas.html](../legacy/com/brototermic.com/resistencias-planas.html): «Distintos tipos de conexión eléctrica: Tornillos, enchufable, cables flexibles, regleta cerámica»

**Propuesta:** Conservar como petición de datos, sin fijar máximos ni compatibilidades.


### `data/categorias/resistencias-tipo-abrazadera.json`

**R-19 · Intro** — «Algunos modelos están pensados para lugares donde caen materiales que pueden dañar la resistencia o para atmósferas corrosivas.»

**Evidencia:** [resistencias-tipo-abrazadera.html](../legacy/com/brototermic.com/resistencias-tipo-abrazadera.html): «La M-85-I está especialmente diseñada para aquellos lugares en los que es frecuente la caída de materiales que pueden dañar la resistencia y para atmósferas corrosivas..»

**Propuesta:** Conservar. «caen» y «pensados» reformulan la función histórica de M-85-I.

**R-20 · Intro** — «Para pedir presupuesto, indícanos el diámetro y el ancho de la pieza, la potencia, la tensión y cómo quieres la salida de los cables.»

**Evidencia:** [plan-contenido.md §1](plan-contenido.md): «se pregunta al cliente, no se afirma nada técnico»; adjunto autorizado en AGENTS.md §2 y contrato de [site.json](../data/site.json) (envío desactivado). [resistencias-tipo-abrazadera.html](../legacy/com/brototermic.com/resistencias-tipo-abrazadera.html): «La salida del cable de la resistencia puede ser: radial, axial, tangencial.»

**Propuesta:** Conservar como solicitud de características; no inventa un nuevo tipo de conexión.


### `data/categorias/resistencias-tipo-cartucho.json`

**R-21 · Intro** — «Aquí tienes cartuchos de alta carga y de baja carga, con el detalle de sus componentes; el cartucho Microwatt, unipolar y para tensiones de hasta 48 V; cartuchos con termopar incorporado en el punto que indiques, y cartuchos expan, capaces de expandirse por sí solos.»

**Evidencia:** [resistencias-tipo-cartucho.html](../legacy/com/brototermic.com/resistencias-tipo-cartucho.html): «con la particularidad de ser capaz de expandirse por si solo»; Microwatt: «un voltaje máximo de 48 V»; cartuchos con termopar: «en cualquier punto del cartucho a petición del cliente».

**Propuesta:** Conservar. «solos» es plural de «solo» y los 48 V son idénticos.


### `data/categorias/ventilacion.json`

**R-22 · Intro** — «La ventilación de esta página reúne ventiladores para mover el aire en equipos e instalaciones, por ejemplo a través de intercambiadores de calor: compactos, axiales, centrífugos y tangenciales.»

**Evidencia:** [ventilacion.html](../legacy/com/brototermic.com/ventilacion.html): «especialmente adecuados para el flujo de aire a través de intercambiadores de calor»; las cuatro cabeceras Compactos/Axiales/Centrífugos/Tangenciales.

**Propuesta:** Conservar «por ejemplo», o precisar que el ejemplo de intercambiadores corresponde a los axiales. «mover» no añade cifras ni prestaciones.

**R-23 · Intro** — «Si además necesitas calentar el aire que mueven, consulta las resistencias para calentamiento de aire .»

**Evidencia:** [resistencias-calentamientoaire.html](../legacy/com/brototermic.com/resistencias-calentamientoaire.html): «Resistencias para calentamiento de aire.»

**Propuesta:** Conservar enlace: intención explícita y producto relacionado, sin afirmar compatibilidad entre modelos.

**R-24 · Intro** — «Para pedir presupuesto, indícanos el tipo de ventilador, sus dimensiones, la alimentación (alterna o continua), el caudal o la presión que necesitas y la posición de montaje.»

**Evidencia:** [plan-contenido.md §1](plan-contenido.md): «se pregunta al cliente, no se afirma nada técnico»; adjunto autorizado en AGENTS.md §2 y contrato de [site.json](../data/site.json) (envío desactivado). [ventilacion.html](../legacy/com/brototermic.com/ventilacion.html): «Amplia gama de ventiladores compactos para CA y CC.»; «La unidad se puede montar horizontal o verticalmente».

**Propuesta:** Conservar petición. No atribuye montaje a todos los ventiladores: solicita la posición necesaria.


### `data/familias.json#presionhumedad`

**R-25 · Intro** — «Los sensores de presión y humedad miden estas variables para indicarlas, registrarlas o controlar un proceso.»

**Evidencia:** [presionhumedad-sondas-de-humedad.html](../legacy/com/brototermic.com/presionhumedad-sondas-de-humedad.html): «Los transmisores con salidas a relé están diseñados para la medición y control de temperatura, humedad relativa y presión barométrica.» [presionhumedad-sensores-de-presion.html](../legacy/com/brototermic.com/presionhumedad-sensores-de-presion.html): «Señal de salida normalizada: 4-20mA, 0-10V.»

**Propuesta:** Conservar como resumen de familia; lectura y registro se respaldan con dataloggers, sin asignar registro interno a cada sonda.


### `content/contacto.html`

**R-26 · Meta** — «Pide presupuesto de resistencias e instrumentación con plano o foto.»

**Evidencia:** [plan-contenido.md §1](plan-contenido.md): «se pregunta al cliente, no se afirma nada técnico»; adjunto autorizado en AGENTS.md §2 y contrato de [site.json](../data/site.json) (envío desactivado). [empresa.html](../legacy/com/brototermic.com/empresa.html): «Instrumentación Resistencias Calefactoras»

**Propuesta:** Conservar meta; adjunto de plano/foto es una nueva función aprobada, no un dato inventado.

**R-27 · Texto** — «Para un presupuesto rápido, cuéntanos qué producto necesitas, las medidas y las condiciones de trabajo, y adjunta un plano o una foto si los tienes.»

**Evidencia:** [plan-contenido.md §1](plan-contenido.md): «se pregunta al cliente, no se afirma nada técnico»; adjunto autorizado en AGENTS.md §2 y contrato de [site.json](../data/site.json) (envío desactivado).

**Propuesta:** CORREGIR «Para un presupuesto rápido» → «Para pedir presupuesto». No hay plazo de respuesta confirmado (AGENTS.md §12.3).


### `content/cookies.html`

**R-28 · Texto** — «Esta web no utiliza cookies propias ni de terceros: no tiene analítica, ni mapas incrustados, ni botones de redes sociales, ni zona de clientes.»

**Evidencia:** AGENTS.md §4 y §12.10; comentario [REVISIÓN CLIENTE] ya presente en [content/cookies.html](../content/cookies.html). El histórico no prueba el comportamiento del nuevo sitio.

**Propuesta:** Mantener propuesta legal con revisión del asesor. Comprobar cookies y peticiones en el navegador sobre el build final; esta revisión de texto no acredita por sí sola ausencia de cookies.


### `content/fabricaciones-a-medida.html`

**R-29 · Texto** — «Envíanos el plano de la pieza o, si no lo tienes, una foto o una muestra, con las medidas y las condiciones de trabajo que conozcas.»

**Evidencia:** [fabricaciones-a-medida.html](../legacy/com/brototermic.com/fabricaciones-a-medida.html): «Todas las fabricaciones especiales se realizan según planos aportados por el cliente o diseñados por la Oficina Técnica de nuestros fabricantes representados.» [resistencias-especiales-a-medida.html](../legacy/com/brototermic.com/resistencias-especiales-a-medida.html): «construir cualquier tipo de resistencia ya sea a partir de un plano o de una muestra» [plan-contenido.md §1](plan-contenido.md): «se pregunta al cliente, no se afirma nada técnico»; adjunto autorizado en AGENTS.md §2 y contrato de [site.json](../data/site.json) (envío desactivado).

**Propuesta:** Conservar solicitud, «que conozcas» limita lo que se solicita y no añade una especificación.

**R-30 · Texto** — «Puedes adjuntar el archivo en el formulario de presupuesto o llamarnos al 945 22 33 31.»

**Evidencia:** [plan-contenido.md §1](plan-contenido.md): «se pregunta al cliente, no se afirma nada técnico»; adjunto autorizado en AGENTS.md §2 y contrato de [site.json](../data/site.json) (envío desactivado).

**Propuesta:** Conservar. El adjunto nuevo es aprobado en AGENTS.md §2. El envío real sigue pendiente del hosting.


### `content/nuevos-productos.html`

**R-31 · Texto** — «Sensores de nivel con comunicación Modbus RTU (sensores electrodos conductivos, interruptores y transductores magnéticos de nivel), pasarelas de comunicación RS485/LoRa (largas distancias), que permiten comunicar los sensores, equipos, máquinas o instalaciones con la plataforma IoT DeDat, a través de Gateways DE HubB, usando tecnología móvil (2G/3G) y monitorizar cualquier proceso industrial.»

**Evidencia:** [nuevos-productos.html](../legacy/com/brototermic.com/nuevos-productos.html): «a través de Getways DE HubB, usando tecnología móvil (2G/3G) y monitorizar cualquier proceso industrial..»; [plan-contenido.md §3](plan-contenido.md): «Getways DE HubB → Gateways DE HubB (comprobar el nombre comercial en el PDF de Disibeint)».

**Propuesta:** La corrección de errata está registrada; «Gateways» no es una nueva prestación. Sigue pendiente verificar el nombre comercial en PDF y la vigencia de novedades con el cliente antes de aprobar esta pieza.


### `content/privacidad.html`

**R-32 · Texto** — «Dirección postal: calle Pintor Mauro Ortiz de Urbina, n.»

**Evidencia:** AGENTS.md §1, sedes, y [site.json → pendientes](../data/site.json). El texto histórico dice «Pintor Ortiz de Urbina».

**Propuesta:** Dato externo autorizado: conservar «Mauro» con pendiente registrado. No etiquetar falsamente como verificado en legacy.

**R-33 · Texto** — «Si nos pides presupuesto con el formulario de contacto, tratamos tus datos y los archivos que adjuntes (planos o fotos) para atender tu solicitud de presupuesto.»

**Evidencia:** [plan-contenido.md §1](plan-contenido.md): «se pregunta al cliente, no se afirma nada técnico»; adjunto autorizado en AGENTS.md §2 y contrato de [site.json](../data/site.json) (envío desactivado).; [content/privacidad.html](../content/privacidad.html) ya incluye comentario [REVISIÓN CLIENTE] para adjuntos.

**Propuesta:** Conservar propuesta con revisión del asesor y plazo de conservación de correos pendiente; autorización expresa de AGENTS.md §4.

**R-34 · Texto** — «c) Utilizamos empresas de Estados Unidos, como Microsoft, proveedora de las aplicaciones Office 365 y Azure, por lo que algunos datos pueden ser objeto de una transferencia internacional a un país de fuera del Espacio Económico Europeo.»

**Evidencia:** [privacidad.html](../legacy/com/brototermic.com/privacidad.html): «Microsoft proveedora de la aplicación Office 365 y Azzure»; [plan-contenido.md §4, fila 24](plan-contenido.md).

**Propuesta:** Corrección Azure registrada; mantener comentario de revisión del asesor. No validar aquí la base de transferencia internacional.

**R-35 · Texto** — «C/ Pintor Mauro Ortiz de Urbina, 7 bajo»

**Evidencia:** AGENTS.md §1, sedes, y [site.json → pendientes](../data/site.json).

**Propuesta:** Mismo dato externo autorizado que la primera dirección; pendiente de unificación NAP, sin duplicar verificación.

**R-36 · Texto** — «Si deseas más información acerca de los derechos que puedes ejercitar y para la solicitud de modelos de formularios de ejercicio de derechos puedes visitar la página web de la Agencia española de Protección de Datos, www.aepd.es .»

**Evidencia:** [privacidad.html](../legacy/com/brototermic.com/privacidad.html): «www.agpd.es»; AGENTS.md §4 autoriza «www.aepd.es» con [REVISIÓN CLIENTE].

**Propuesta:** Corrección registrada: conservar enlace nuevo y revisión del asesor. No tratar «aepd» como producto sin origen.

## Límites y siguiente paso seguro

- No se ha ejecutado `aprobar-borradores.js`, no se ha exportado ninguna pieza como `APROBADA` y las 25 marcas siguen presentes. La aprobación de una persona que pide AGENTS.md §4 no se reemplaza por este análisis.
- Esperar la integración de `revision/complemento-b` para sus tres correcciones de texto (ATEX, especiales y Oviedo). Repetir después la herramienta sobre la rama actualizada; los recuentos de arriba pertenecen a main `bbdbe79`.
- Aplicar las correcciones de bajo riesgo propuestas solo en la nueva intro/meta, con `npm run test` y validación de longitudes; conservar literalmente descripciones, números, modelos, enlaces, PDF y URLs originales.
- Revisar los legales con los comentarios `[REVISIÓN CLIENTE]` existentes. Su publicación propuesta está autorizada por AGENTS.md §4; este informe no crea una nueva prohibición de publicarlos.
- `nuevos-productos` y `oviedo` conservan dependencias comerciales T-01. No enviar mensajes al cliente desde herramientas sin autorización explícita.
- Los alts D-014 son una tarea separada: aprobar el texto no significa que las fotos hayan sido inspeccionadas ni que sus alts estén aprobados.
- No se ha corrido el build, Lighthouse ni W3C en esta subtarea de lectura; no hay una afirmación de paridad final, producción activa ni métricas nuevas en este informe.

## Ejecución posterior: tres correcciones aplicadas

Por indicación expresa del responsable de esta sesión, se aplicaron solo estas correcciones independientes en archivos que Juan no había modificado:

- `data/categorias/resistencias-flexibles.json → intro`: la capacidad de fundir o reducir viscosidad de jabones, grasas, barnices y productos con base de aceite se atribuye únicamente a **AFHSSD**. BSA, AFBS y AFAFS mantienen su presencia sin heredar esa aplicación. Intro final: **184 palabras**, 4 bloques.
- `data/categorias/presionhumedad-sensores-de-presion.json → intro`: se sustituye la compatibilidad general «líquidos y gases» por el listado de transmisores/detectores y la aplicación hidrostática documentada del TPSM40. El sensor cerámico se atribuye expresamente solo a TPSP22, TPSP41, TPSP 32 y TPSM40; TPSP42 conserva sus aplicaciones y salidas históricas sin material de sensor inventado. Intro final: **163 palabras**, 4 bloques.
- `content/contacto.html`: «Para un presupuesto rápido» pasa a «Para pedir presupuesto». Se ajusta también esa misma descripción en el comentario explicativo. La cabecera de title/meta/H1 y `borrador: si` no cambia.

La comprobación local real, ejecutada con Node, parseó ambos JSON, contó el texto plano de las intros con `tools/lib/legacy.js` y exigió 120–200 palabras. Una comparación profunda antes/después confirmó que **todos los campos salvo `intro` son idénticos**, incluidos productos, descripciones, specs, imágenes, alts, documentos, relacionadas, title, meta, H1 y `_borrador: true`. Se verificó también que la cabecera del fragmento de contacto fuera idéntica y que conservara su marca. `git diff --check` terminó con código 0. Las copias anteriores usadas en la comprobación están en `/private/tmp/brototermic-revision-25/`.

No se ejecutaron build global, pruebas globales ni commits en esta subtarea; corresponden al responsable de la integración antes del commit. Los recuentos del análisis original no se presentan como una medición del contenido ya corregido: hay que repetir la herramienta cuando esté integrada la rama de Juan.

**Pendiente de confirmación:** una persona debe revisar el lote completo y resolver las propuestas restantes antes de exportarlo como aprobado. Para volver a atribuir material de sensor al TPSP42, compatibilidad general con gases o usos AFHSSD a otros modelos haría falta una fuente explícita del fabricante/PDF o confirmación del cliente; esas afirmaciones se han retirado de la nueva intro. La vigencia de novedades, actividad de Oviedo, datos externos de dirección/año y revisión de los legales siguen con las dependencias documentadas. Ninguna marca de borrador se ha quitado y no se ha fabricado una aprobación.
