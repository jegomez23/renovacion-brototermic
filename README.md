# brototermic-web

Renovación de la web de **BROTOTERMIC, S.L.** (brototermic.com): resistencias eléctricas calefactoras e instrumentación industrial.

**Antes de tocar nada, lee [AGENTS.md](AGENTS.md).** Es la fuente única de verdad del proyecto (reglas SEO, contenido, diseño, estructura y forma de trabajo), tanto para personas como para IAs.

## Resumen

- Web estática: HTML + CSS + JavaScript vanilla, sin frameworks ni dependencias.
- `build.js` (Node, sin paquetes npm) genera `/dist` a partir de `/src`, `/data`, `/content` y `/assets`.
- `/legacy` es la copia de la web actual: solo se lee, no se edita y no está en git (ver AGENTS.md, anexo 12.6).
- `docs/inventario-urls.csv` controla la migración de URLs (MANTENER / REDIRIGIR / NUEVA).

## Uso

```bash
node build.js   # genera /dist (pendiente de crear)
```

Lo que se publica en el hosting (Apache) es el contenido de `/dist`.
