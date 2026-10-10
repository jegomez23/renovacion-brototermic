# brototermic-web

Renovación de la web de **BROTOTERMIC, S.L.** (brototermic.com): resistencias eléctricas calefactoras e instrumentación industrial.

**Antes de tocar nada, lee [AGENTS.md](AGENTS.md).** Es la fuente única de verdad del proyecto (reglas SEO, contenido, diseño, estructura, decisiones y forma de trabajo), tanto para personas como para IAs. **Dónde estamos, en 1 minuto: [docs/estado.md](docs/estado.md).** Los planes están en [`/docs`](docs/), empezando por [docs/tareas.md](docs/tareas.md).

## Ver la web en 3 pasos

Requisitos: **Node.js 18 o superior** (nada más: el proyecto no tiene dependencias npm). Java solo hace falta para `npm run validar`.

1. Clonar el repositorio y entrar en la carpeta: `git clone git@github.com:jegomez23/renovacion-brototermic.git` y `cd renovacion-brototermic`.
2. `npm run dev` (no hace falta `npm install`).
3. Abrir **http://localhost:8000/**. Al guardar un cambio en `/src`, `/data`, `/content`, `/assets` o `/images`, la web se reconstruye sola en uno o dos segundos (recarga el navegador). Los avisos del build salen en la consola. `Ctrl+C` para parar.

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | Build en modo piloto, servidor en http://localhost:8000 y reconstrucción automática al guardar (el primer build lleva la auditoría SEO completa; los siguientes, no, para ir rápido) |
| `npm run build` | Build en modo piloto: genera `/dist` y `/dist-es` y **avisa** de lo pendiente |
| `npm run build:publicacion` | Build en modo publicación: **falla** si queda algo pendiente (borradores, `[POR VERIFICAR`, envío del formulario desactivado…). Hoy falla, y es lo correcto: ver [docs/estado.md](docs/estado.md) |
| `npm run test` | Build + pruebas de mutación del auditor + auditor de paridad SEO /legacy ↔ /dist + `comprobar-dist` (sitemap, robots, canonical, noindex, huérfanas) + `comprobar-publicable` |
| `npm run validar` | Validación W3C en local (validador Nu) de todas las páginas y de la hoja CSS. Necesita el validador en `tools/vnu/` (no va en git): `vnu.jar` con Java, o `vnu.windows.zip`, que trae su Java ([descarga](https://github.com/validator/validator/releases)) |

Herramientas sueltas (sin script npm):

```bash
node tools/capturas.js /ruta.html   # capturas y comprobaciones a 320, 360, 768 y 1280 px (con npm run dev arrancado; necesita Chrome)
node tools/validar-plan.js          # comprueba title, meta y keywords de docs/plan-paginas.csv
bash tools/probar-redirecciones.sh  # prueba los .htaccess en el Apache de Docker (ver tools/apache-pruebas/)
```

## Resumen técnico

- Web estática: HTML + CSS + JavaScript vanilla, sin frameworks ni dependencias.
- `build.js` (Node ≥ 18, sin paquetes npm) genera `/dist` a partir de `/src`, `/data`, `/content`, `/assets`, `/images` y los PDF de `/docs`, y `/dist-es` (el `.htaccess` del `.es`).
- `/legacy` es la copia de la web actual: está versionada y solo se lee, nunca se edita.
- `docs/inventario-urls.csv` controla la migración de URLs (MANTENER / REDIRIGIR / NUEVA) y `docs/redirecciones.csv` contiene las reglas 301.
- Lo que se publica en el hosting (Apache) es **solo** el contenido de `/dist` (docroot del `.com`) y de `/dist-es` (docroot del `.es`): ver [docs/publicacion.md](docs/publicacion.md).
