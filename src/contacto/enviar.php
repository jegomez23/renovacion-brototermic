<?php
/*
 * enviar.php: formulario de presupuesto de brototermic.com (AGENTS.md §2, única excepción PHP aprobada).
 * build.js lo copia a /dist/contacto/enviar.php. Lo usan /contacto/contacto.html y /oviedo/.
 *
 * Qué hace, en este orden:
 *   1. Solo acepta POST; lee la configuración (email de destino, límites) de un archivo FUERA del docroot.
 *   2. Campo trampa «web» relleno → responde «gracias» y no envía nada (el robot no sabe que lo hemos descartado).
 *   3. Límite de envíos por IP (se guarda solo un hash de la IP, con sal, nunca la IP).
 *   4. Valida TODOS los campos en el servidor (aunque el navegador ya lo haya hecho), incluida la casilla RGPD.
 *   5. Adjunto opcional: extensión en lista blanca Y tipo real del archivo con finfo, tamaño máximo y nombre
 *      regenerado. Va adjunto al email y NO se guarda en el servidor (PHP borra el temporal al acabar).
 *   6. Envía el email con mail(): Para y De salen de la configuración; nada del usuario va a esas cabeceras.
 *      Reply-To = email del usuario, ya validado y sin saltos de línea. El asunto lleva el nombre, limpio y codificado.
 *   7. Responde SIEMPRE con una redirección 303 a /contacto/gracias.html o a /contacto/error.html#motivo:
 *      funciona igual con JS y sin JS, y el usuario nunca ve un error de PHP.
 *
 * Sin dependencias (PHP ≥ 7.4 con fileinfo y mbstring, que vienen en cualquier hosting). Sin reCAPTCHA ni terceros.
 */
declare(strict_types=1);
ini_set('display_errors', '0');
error_reporting(E_ALL);

const URL_GRACIAS = '/contacto/gracias.html';
const URL_ERROR = '/contacto/error.html';
const URL_FORMULARIO = '/contacto/contacto.html#formulario';

function ir(string $url): void
{
    header('Location: ' . $url, true, 303);
    header('Cache-Control: no-store');
    exit;
}
function fallo(string $motivo): void
{
    ir(URL_ERROR . '#' . $motivo);
}

// ---------- 1. Método y configuración ----------
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') ir(URL_FORMULARIO);

// La configuración NO está en el repositorio ni en /dist: se crea en el servidor a partir de config.example.php.
// Se busca, por orden: la variable de entorno BROTOTERMIC_FORMULARIO_CONFIG y config-formulario.php un nivel por
// encima del docroot (fuera de la web pública).
function cargarConfig(): ?array
{
    $rutas = array_filter([
        getenv('BROTOTERMIC_FORMULARIO_CONFIG') ?: null,
        dirname(__DIR__, 2) . '/config-formulario.php',
        isset($_SERVER['DOCUMENT_ROOT']) ? dirname($_SERVER['DOCUMENT_ROOT']) . '/config-formulario.php' : null,
    ]);
    foreach ($rutas as $ruta) {
        if (is_file($ruta)) {
            $c = require $ruta;
            if (is_array($c)) return $c;
        }
    }
    return null;
}
$config = cargarConfig();
if ($config === null
    || !filter_var($config['destino'] ?? '', FILTER_VALIDATE_EMAIL)
    || !filter_var($config['remitente'] ?? '', FILTER_VALIDATE_EMAIL)) {
    error_log('enviar.php: falta config-formulario.php o no tiene «destino» y «remitente» válidos');
    fallo('configuracion');
}
$maxBytes = (int) round((float) ($config['max_adjunto_mb'] ?? 10) * 1024 * 1024);
$tipos = $config['tipos'] ?? [];

// Un POST mayor que post_max_size llega con $_POST vacío: es un adjunto demasiado grande
if (empty($_POST) && (int) ($_SERVER['CONTENT_LENGTH'] ?? 0) > 0) fallo('tamano');

// Mismo origen: si el navegador envía Origin, debe ser la propia web (evita que otra web use este formulario)
$origen = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origen !== '' && !in_array($origen, $config['origenes'] ?? ['https://brototermic.com'], true)) fallo('origen');

// ---------- 2. Campo trampa ----------
// Oculto por CSS; una persona no lo ve. Si viene relleno, se responde como si todo hubiera ido bien.
if (trim((string) ($_POST['web'] ?? '')) !== '') ir(URL_GRACIAS);

// ---------- 3. Límite de envíos por IP ----------
// Se guarda solo un hash de la IP con sal (no se puede volver a la IP) y las horas de los envíos de la última ventana.
function dentroDelLimite(array $config): bool
{
    $limite = (int) ($config['limite_envios'] ?? 5);
    $ventana = (int) ($config['ventana_segundos'] ?? 3600);
    $dir = $config['dir_limites'] ?? (sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'brototermic-formulario');
    if (!is_dir($dir) && !@mkdir($dir, 0700, true)) return true; // sin carpeta temporal no se bloquea a nadie
    $clave = hash('sha256', ($config['sal'] ?? '') . '|' . ($_SERVER['REMOTE_ADDR'] ?? ''));
    $archivo = $dir . DIRECTORY_SEPARATOR . $clave;
    $f = @fopen($archivo, 'c+');
    if ($f === false) return true;
    flock($f, LOCK_EX);
    $ahora = time();
    $envios = array_filter(array_map('intval', explode(',', (string) stream_get_contents($f))), fn($t) => $t > $ahora - $ventana);
    $permitido = count($envios) < $limite;
    if ($permitido) $envios[] = $ahora;
    ftruncate($f, 0);
    rewind($f);
    fwrite($f, implode(',', $envios));
    flock($f, LOCK_UN);
    fclose($f);
    return $permitido;
}

// ---------- 4. Validación de los campos ----------
// Un texto que no es UTF-8 válido se rechaza: si no, preg_replace(/u) devolvería null y el campo quedaría «vacío»,
// saltándose la validación (lo descubrió la prueba local con un teléfono enviado en Latin-1)
foreach (['name' => 'nombre', 'empresa' => 'empresa', 'email' => 'email', 'phone' => 'telefono', 'message' => 'mensaje'] as $campo => $motivo) {
    if (!is_string($_POST[$campo] ?? '') || !mb_check_encoding((string) ($_POST[$campo] ?? ''), 'UTF-8')) fallo($motivo);
}

// Texto de una línea: sin caracteres de control (ni saltos de línea: así nunca pueden inyectar una cabecera)
function linea(string $campo, int $max): string
{
    $v = trim((string) ($_POST[$campo] ?? ''));
    $v = preg_replace('/[\x00-\x1F\x7F]+/u', ' ', $v) ?? '';
    return mb_substr($v, 0, $max + 1);
}
$nombre = linea('name', 100);
$empresa = linea('empresa', 150);
$email = linea('email', 150);
$telefono = linea('phone', 30);
$mensaje = str_replace("\r\n", "\n", trim((string) ($_POST['message'] ?? '')));
$mensaje = preg_replace('/[\x00-\x08\x0B-\x1F\x7F]+/u', ' ', $mensaje) ?? '';

if ($nombre === '' || mb_strlen($nombre) > 100) fallo('nombre');
if (mb_strlen($empresa) > 150) fallo('empresa');
if ($email === '' || mb_strlen($email) > 150 || !filter_var($email, FILTER_VALIDATE_EMAIL)) fallo('email');
if (mb_strlen($telefono) > 30 || !preg_match('/^[0-9 +().\-]*$/', $telefono)) fallo('telefono');
if ($mensaje === '' || mb_strlen($mensaje) > 5000) fallo('mensaje');
if (($_POST['rgpd'] ?? '') !== 'si') fallo('rgpd');

if (!dentroDelLimite($config)) fallo('limite');

// ---------- 5. Adjunto (opcional) ----------
// Comprueba que el contenido es de verdad del tipo que dice la extensión. finfo no reconoce siempre DWG ni DXF
// (los da como application/octet-stream o text/plain): para ellos se mira además su firma.
function firmaValida(string $ext, string $ruta): bool
{
    $inicio = (string) file_get_contents($ruta, false, null, 0, 4096);
    if ($ext === 'dwg') return strncmp($inicio, 'AC10', 4) === 0;          // todas las versiones de DWG empiezan por «AC10…»
    if ($ext === 'dxf') return (bool) preg_match('/^\s*0\s*\r?\n\s*SECTION/', $inicio) || strncmp($inicio, 'AutoCAD Binary DXF', 18) === 0;
    return true;
}
$adjunto = null;
$archivo = $_FILES['adjunto'] ?? null;
if (is_array($archivo) && ($archivo['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_NO_FILE) {
    $err = (int) $archivo['error'];
    if ($err === UPLOAD_ERR_INI_SIZE || $err === UPLOAD_ERR_FORM_SIZE) fallo('tamano');
    if ($err !== UPLOAD_ERR_OK || !is_uploaded_file($archivo['tmp_name'])) fallo('adjunto');
    if ((int) $archivo['size'] > $maxBytes || filesize($archivo['tmp_name']) > $maxBytes) fallo('tamano');
    $ext = strtolower(pathinfo((string) $archivo['name'], PATHINFO_EXTENSION));
    if (!isset($tipos[$ext])) fallo('tipo');
    $mime = (string) (new finfo(FILEINFO_MIME_TYPE))->file($archivo['tmp_name']);
    if (!in_array($mime, $tipos[$ext], true) || !firmaValida($ext, $archivo['tmp_name'])) fallo('tipo');
    // Nombre nuevo: nunca se usa el del usuario (podría llevar rutas, comillas o saltos de línea)
    $adjunto = [
        'nombre' => 'adjunto-' . date('Ymd-His') . '.' . $ext,
        'mime' => $mime,
        'datos' => (string) file_get_contents($archivo['tmp_name']),
    ];
}

// ---------- 6. Email ----------
$asunto = ($config['asunto'] ?? 'Solicitud de presupuesto desde la web') . ': ' . mb_substr($nombre, 0, 60);
$asuntoCodificado = '=?UTF-8?B?' . base64_encode($asunto) . '?=';
$cuerpo = "Solicitud de presupuesto recibida desde brototermic.com\n\n"
    . "Nombre: $nombre\n"
    . 'Empresa: ' . ($empresa !== '' ? $empresa : '-') . "\n"
    . "Email: $email\n"
    . 'Teléfono: ' . ($telefono !== '' ? $telefono : '-') . "\n"
    . 'Adjunto: ' . ($adjunto ? $adjunto['nombre'] : 'no') . "\n\n"
    . "Mensaje:\n$mensaje\n\n"
    . "--\nEl remitente ha aceptado la política de privacidad (casilla RGPD).\n";

$cabeceras = [
    'From: ' . ($config['nombre_remitente'] ?? 'Web BROTOTERMIC') . ' <' . $config['remitente'] . '>',
    'Reply-To: ' . $email,           // validado con FILTER_VALIDATE_EMAIL y sin saltos de línea
    'MIME-Version: 1.0',
    'X-Mailer: brototermic-enviar',
];
if ($adjunto === null) {
    $cabeceras[] = 'Content-Type: text/plain; charset=UTF-8';
    $cabeceras[] = 'Content-Transfer-Encoding: base64';
    $datos = chunk_split(base64_encode($cuerpo));
} else {
    $limite = 'brototermic-' . bin2hex(random_bytes(12));
    $cabeceras[] = 'Content-Type: multipart/mixed; boundary="' . $limite . '"';
    $datos = "--$limite\r\n"
        . "Content-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n"
        . chunk_split(base64_encode($cuerpo)) . "\r\n"
        . "--$limite\r\n"
        . 'Content-Type: ' . $adjunto['mime'] . '; name="' . $adjunto['nombre'] . "\"\r\n"
        . "Content-Transfer-Encoding: base64\r\n"
        . 'Content-Disposition: attachment; filename="' . $adjunto['nombre'] . "\"\r\n\r\n"
        . chunk_split(base64_encode($adjunto['datos'])) . "\r\n"
        . "--$limite--\r\n";
}
// El remitente del sobre (-f) también sale de la configuración, ya validado
$ok = @mail($config['destino'], $asuntoCodificado, $datos, implode("\r\n", $cabeceras), '-f' . $config['remitente']);
if (!$ok) {
    error_log('enviar.php: mail() ha devuelto false');
    fallo('envio');
}
ir(URL_GRACIAS);
