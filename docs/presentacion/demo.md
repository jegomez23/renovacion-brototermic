# Versión de demostración: cómo generarla y subirla (D-017)

> **Nunca se sube al hosting real del cliente.** Lleva `noindex, nofollow` en todas las páginas, `robots.txt` con `Disallow: /`, la cabecera `X-Robots-Tag` (archivo `_headers`) y la franja «Versión de demostración». No tiene `.htaccess` ni PHP: el formulario se ve, pero el envío está desactivado.

## 1. Generarla y verla en local

```bash
npm run build:preview      # → /dist-preview (55 páginas)
npm run preview            # → http://localhost:8001/
```

Comprobado en local (2026-10-12): enlaces, imágenes, el PDF con «ñ» (`/docs/catalogo_ca%C3%B1as_…pdf`) y la 404 propia.

## 2. Subirla a Netlify Drop (recomendado: 2 minutos, sin instalar nada)

1. Entra en **https://app.netlify.com/drop** e inicia sesión con una cuenta gratuita (con GitHub o con un email). Sin cuenta, el sitio es temporal.
2. Arrastra la carpeta **`dist-preview`** entera (la carpeta, no su contenido) a la zona «Drag and drop your site output folder here».
3. En unos segundos Netlify da un enlace del tipo `https://nombre-aleatorio-123.netlify.app`. Ese es el enlace de la demo.
4. Opcional: en *Site configuration → Change site name*, ponle un nombre fácil de dictar, por ejemplo `brototermic-demo`. El enlace queda `https://brototermic-demo.netlify.app`.
5. **Comprueba en el enlace:** el inicio, el buscador («termopar»), una categoría, `/oviedo/`, el catálogo de cañas pirométricas (el PDF con «ñ») y una dirección inexistente, que debe mostrar la 404 propia.
6. Después de la presentación: *Site configuration → Delete this site*.

Netlify aplica `_headers` (noindex también en la cabecera HTTP), sirve `404.html` en las direcciones que no existen y entiende los nombres de archivo con «ñ» y espacios.

## 3. Alternativa: Cloudflare Pages

1. https://dash.cloudflare.com → *Workers & Pages* → *Create* → *Pages* → *Upload assets*.
2. Pon un nombre al proyecto y sube la carpeta `dist-preview`.
3. Diferencia: Cloudflare Pages redirige `pagina.html` a `pagina` (sin la extensión). Los enlaces siguen funcionando, pero la dirección que se ve en el navegador no lleva `.html`. Para la demo da igual; Netlify no lo hace.

## 4. Qué NO hacer

- No subir `dist-preview` al servidor del cliente ni a ninguna carpeta de `brototermic.com`.
- No enlazar la demo desde ningún sitio público.
- No compartir el enlace fuera de la reunión.
