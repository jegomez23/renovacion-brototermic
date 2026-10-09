# brototermic-web

Renovación de la web de **BROTOTERMIC, S.L.** (brototermic.com): resistencias eléctricas calefactoras e instrumentación industrial.

**Antes de tocar nada, lee [AGENTS.md](AGENTS.md).** Es la fuente única de verdad del proyecto (reglas SEO, contenido, diseño, estructura, decisiones y forma de trabajo), tanto para personas como para IAs. Los planes están en [`/docs`](docs/), empezando por [docs/tareas.md](docs/tareas.md).

## Resumen

- Web estática: HTML + CSS + JavaScript vanilla, sin frameworks ni dependencias.
- `build.js` (Node ≥ 18, sin paquetes npm) genera `/dist` a partir de `/src`, `/data`, `/content`, `/assets`, `/images` y los PDF de `/docs`.
- `/legacy` es la copia de la web actual: está versionada y solo se lee, nunca se edita.
- `docs/inventario-urls.csv` controla la migración de URLs (MANTENER / REDIRIGIR / NUEVA) y `docs/redirecciones.csv` contiene las reglas 301.

## Uso

```bash
node build.js              # genera /dist (pendiente de crear: tarea A-1-01)
node build.js --publicar   # igual, pero falla si queda algo [POR VERIFICAR] o algún borrador
node tools/validar-plan.js # comprueba title, meta y keywords de docs/plan-paginas.csv
bash tools/probar-redirecciones.sh   # prueba el .htaccess en el Apache de Docker (ver tools/apache-pruebas/)
```

Lo que se publica en el hosting (Apache) es el contenido de `/dist`.
