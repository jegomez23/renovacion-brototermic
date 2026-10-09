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
