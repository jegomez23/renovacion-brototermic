# Registro de decisiones

> Registro detallado y cronológico de las decisiones del proyecto: qué se decide, por qué, quién lo decide y qué documentos se actualizan. El **resumen** de las decisiones vigentes sigue en [AGENTS.md](../AGENTS.md), sección 11; si una entrada de aquí contradice a AGENTS.md, se corrigen los dos en el mismo commit.
>
> Formato: una entrada por decisión, la más reciente al final. Una decisión que sustituye a otra lo dice y enlaza con ella; la antigua no se borra.

## D-001 · 2026-10-09 · Se descarta la reescritura del historial de git

- **Origen:** responsable del proyecto, antes de publicar el piloto.
- **Contexto:** se había rehecho el historial en local para corregir el email de autor de los 3 commits iniciales y para quitar de `/legacy` la API key de Google Maps. Pero ese historial ya estaba en GitHub (`origin/main` y `origin/jhonda/desarrollo`) y la Persona B trabaja sobre él: publicarlo exigía un `push --force` y obligaba a rehacer su rama.
- **Decisión:**
  - No se reescribe el historial ni se hace `push --force`. El estado reescrito se guarda en la rama local `backup/historial-reescrito` (no se publica).
  - `main` parte de `origin/main` y el trabajo nuevo se aplica encima con `cherry-pick`.
  - Los commits antiguos conservan su email de autor (mal escrito) y la clave de Maps en `/legacy`. **`/legacy` vuelve a ser una copia byte a byte, sin excepciones.**
  - La clave ya es pública en la web actual: la restringe o revoca el cliente (pregunta 25 de [preguntas-cliente.md](preguntas-cliente.md)). Ningún commit nuevo la añade ni la reutiliza.
- **Sustituye a:** las entradas del 2026-10-09 «Git: autoría rehecha» y «API key sustituida por `[CLAVE_ELIMINADA]`» de AGENTS.md §11.
- **Documentos:** AGENTS.md (§7, §10, §11 e índice), `.gitattributes`, preguntas-cliente.md.

## D-002 · 2026-10-09 · Cabecera blanca con el logo original (HITO-1)

- **Origen:** responsable del proyecto, revisión del piloto (HITO-1).
- **Decisión:** la barra principal de la cabecera pasa a **blanco**, con navegación en `#1d356c` y botón primario «Pedir presupuesto». Se mantiene una **franja fina en `#004c9a`** (≥ 768 px) con los teléfonos de las dos sedes y el email.
- **Ajuste necesario:** todas las versiones del logo en /legacy (`logo.png`, `logotipo-brototermic-oviedo.png`, `footer-logo.jpg`) tienen «Termic» y el subtítulo en blanco, así que sobre blanco solo se leía «Broto». Por decisión del responsable se usa una **versión provisional**, `images/logo-claro.png`: copia del `logo.png` original en la que solo los píxeles blancos pasan a `#004c9a` (forma, proporciones y resto de colores intactos). El `logo.png` original se sigue usando en el pie (fondo oscuro). Se sustituye por el SVG del cliente cuando llegue (AGENTS.md §12, pendiente 14).
- **Documentos:** AGENTS.md §6, diseno.md §2.1 y §3.1, datos.md (`logo`, `logoFondoOscuro`), `site.json`, CSS y parciales.

## D-003 · 2026-10-09 · Title del inicio (HITO-1)

- **Decisión:** «Componentes industriales e instrumentación | BROTOTERMIC» (56 caracteres). Conserva la keyword completa y la marca; es la única página cuyo title antiguo tenía «Vitoria» y el nuevo no.
- **Sustituye a:** la propuesta «Componentes industriales e instrumentación en Vitoria».
- **Documentos:** plan-paginas.csv, AGENTS.md §3.2, `tools/validar-plan.js` (excepción explícita para `index.html`).

## D-004 · 2026-10-09 · Hero del inicio a 910 px (HITO-1)

- **Decisión:** `slide-1` se sirve a su tamaño real, **910 px**, con `slide-1.webp` y `slide-1.jpg` de respaldo, **solo en el hero**. Es la única imagen que se sirve a más de 480 px.
- **Documentos:** AGENTS.md §5, diseno.md §3.4, plan-imagenes.csv, tareas.md (B-2-05).

## D-005 · 2026-10-09 · Se descarta la ampliación de imágenes con IA (HITO-1)

- **Decisión:** **se descarta Real-ESRGAN** y cualquier ampliación. Se usan las **imágenes originales a su tamaño real**, en un contenedor 4:3 con `contain` y marco blanco. WebP opcional con las mismas medidas.
- **Retoque manual:** solo las **3 fotos del piloto con dominante de color**, y solo en **fondo e iluminación**. Se eligieron midiendo el color medio del borde de las 14 fotos: `brototermic-industriaalimentaria` (212,211,194), `brototermic-calefactores` (249,243,235) y `brototermic-liquidos-noagresivos` (234,232,226); las otras 11 tienen el fondo neutro.
- **Sustituye a:** la ampliación ×2 en lote y el retoque en fases (AGENTS.md §11, primera fila de imágenes del 2026-10-09).
- **Documentos:** AGENTS.md §5, §9 y §12; plan-imagenes.csv (acción `ORIGINAL`, columna `retoque_manual`); tareas.md (se elimina el comando y la sección de ampliación); datos.md; `build.js` (ya no avisa de WebP que faltan).

## D-006 · 2026-10-09 · Buscador de categorías y marco blanco: aprobados (HITO-1)

- **Decisión:** se aprueban el buscador de categorías del megamenú (diseno.md §3.15) y el marco blanco de las fotos de producto.

## D-007 · 2026-10-09 · Decisiones de la revisión de Codex

- **Origen:** revisión de Codex, según la lista del responsable del proyecto. **El documento `docs/revision-codex.md` no existe** en el repositorio, en GitHub ni en el equipo; si se recupera, se añade y se contrasta con esta entrada.
- **Estado de cada punto al revisarlo:**

| Punto | Estado previo | Qué se ha hecho |
|---|---|---|
| Sin comodín en el `.es`: 301 solo para URLs conocidas, 404 el resto | No aplicado (había un 301 de `brototermic.es/*` a `/oviedo/`) | redirecciones.csv: la fila pasa a tipo `404`; AGENTS.md §3.1; arquitectura.md; checklist; `tools/probar-redirecciones.sh` prueba el 404 |
| Formulario compatible con `rd-mailform.php` (`name`, `email`, `phone`, `message`, `form-type`) + `empresa`, `adjunto`, `rgpd`; URL de envío en `site.json`; sin envío real hasta tener el hosting | Parcial (la URL estaba en `site.json`, pero los nombres de campo no estaban fijados) | datos.md (tabla de campos), `site.json` (`accion` = `/contacto/bat/rd-mailform.php`, `envioActivo: false`), `build.js` lo valida y lo avisa, AGENTS.md §6, checklist |
| `build.js` con modo `piloto` (aviso) y `publicacion` (error) | Parcial (existía `--publicar`, pero los enlaces a páginas pendientes eran aviso también al publicar) | `--modo=piloto` / `--modo=publicacion` (`--publicar` queda como alias); los enlaces pendientes son error en publicación |
| Bloque de sectores solo con sectores de /legacy y sin URLs nuevas | No existía | arquitectura.md: regla y tabla de sectores con su página de origen |
| Corregir los alt de RE92 y de Catálogos | No aplicado | plan-imagenes.csv: RE92 tenía el alt del DG-01 (copia-pega de /legacy); la foto de Catálogos es un cajón de archivador: alt vacío (decorativa) |
| Accesibilidad: *Disclosure Navigation* del W3C y `prefers-reduced-motion`; probar a 320 px | Aplicado salvo la prueba a 320 px | Se documenta el patrón en diseno.md y AGENTS.md §6; `tools/capturas.js` y la definición de terminado incluyen 320 px |
