<?php
/*
 * EJEMPLO de configuración del formulario (src/contacto/enviar.php). NO se publica y NO lleva datos reales.
 *
 * En el servidor: copiar este archivo como «config-formulario.php» UN NIVEL POR ENCIMA DEL DOCROOT (fuera de la web
 * pública: si el docroot es /htdocs, va en /config-formulario.php) y rellenarlo. No se sube nunca al repositorio
 * (.gitignore) ni a /dist (tools/comprobar-publicable.js lo impide).
 * Si el hosting no deja escribir fuera del docroot, se puede indicar otra ruta con la variable de entorno
 * BROTOTERMIC_FORMULARIO_CONFIG.
 */
return [
    // Buzón que recibe las solicitudes (pregunta al cliente: AGENTS.md §12, pendiente 3)
    'destino' => 'buzon-acordado@brototermic.com',
    // Remitente: una dirección DEL PROPIO DOMINIO (si no, el correo puede acabar en spam: revisar SPF/DKIM/DMARC)
    'remitente' => 'web@brototermic.com',
    'nombre_remitente' => 'Web BROTOTERMIC',
    'asunto' => 'Solicitud de presupuesto desde la web',

    // Adjunto: debe coincidir con data/site.json → formulario.maxAdjuntoMB y tiposAdjunto, y ser MENOR que los
    // límites upload_max_filesize y post_max_size del PHP del hosting (si no, el servidor lo corta antes)
    'max_adjunto_mb' => 10,
    // Extensión permitida → tipos MIME reales aceptados (finfo). DWG y DXF se comprueban además por su firma.
    'tipos' => [
        'pdf' => ['application/pdf'],
        'jpg' => ['image/jpeg'],
        'jpeg' => ['image/jpeg'],
        'png' => ['image/png'],
        'dwg' => ['image/vnd.dwg', 'image/x-dwg', 'application/acad', 'application/octet-stream'],
        'dxf' => ['image/vnd.dxf', 'application/dxf', 'text/plain', 'application/octet-stream'],
    ],

    // Límite de envíos: como mucho «limite_envios» por IP en «ventana_segundos»
    'limite_envios' => 5,
    'ventana_segundos' => 3600,
    // Sal para el hash de la IP (cualquier texto largo y aleatorio; NO es una contraseña, pero no se publica)
    'sal' => 'cambiar-por-un-texto-aleatorio-largo',
    // Carpeta para el límite de envíos (opcional; por defecto, la temporal del sistema)
    // 'dir_limites' => '/ruta/fuera/del/docroot/limites-formulario',

    // Orígenes desde los que se acepta el envío (cabecera Origin del navegador)
    'origenes' => ['https://brototermic.com'],
];
