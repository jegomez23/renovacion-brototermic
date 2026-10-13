<?php
// php tools/test-limitador.php: pruebas aisladas del código real, sin servidor ni correo real.
// Compatible con PHP 7.4. Los fallos de E/S se inyectan en un namespace de pruebas. Se ejecuta en el CI.
// Criterio (D-015): si el almacenamiento del limitador falla, dentroDelLimite() devuelve null y el envío SE ACEPTA,
// con una línea en el log; el campo trampa y la validación de los campos siguen funcionando igual.
declare(strict_types=1);
namespace PruebaLimitador;

$modo = '';
$correos = 0;
$respuesta = [];
$registro = [];
function error_log($mensaje) {
    $GLOBALS['registro'][] = (string) $mensaje;
    return true; // Capturador: no escribe en el log del sistema.
}
function mkdir($ruta, $permisos = 0777, $recursivo = false) {
    return $GLOBALS['modo'] === 'mkdir' ? false : \mkdir($ruta, $permisos, $recursivo);
}
function fopen($ruta, $modo) {
    return $GLOBALS['modo'] === 'fopen' ? false : \fopen($ruta, $modo);
}
function flock($f, $operacion) {
    return $GLOBALS['modo'] === 'flock' && $operacion === LOCK_EX ? false : \flock($f, $operacion);
}
function stream_get_contents($f) {
    return $GLOBALS['modo'] === 'lectura' ? false : \stream_get_contents($f);
}
function rewind($f) {
    return $GLOBALS['modo'] === 'rewind' ? false : \rewind($f);
}
function fwrite($f, $datos) {
    if ($GLOBALS['modo'] === 'escritura') return false;
    if ($GLOBALS['modo'] === 'parcial') return \fwrite($f, substr($datos, 0, 1));
    return \fwrite($f, $datos);
}
function ftruncate($f, $longitud) {
    return $GLOBALS['modo'] === 'ftruncate' ? false : \ftruncate($f, $longitud);
}
function fflush($f) {
    return $GLOBALS['modo'] === 'fflush' ? false : \fflush($f);
}
function header($cabecera, $sustituir = true, $codigo = 0) {
    $GLOBALS['respuesta'][] = [$cabecera, $codigo];
}
function mail(...$argumentos) {
    $GLOBALS['correos']++;
    return true; // Capturador: nunca invoca mail() del sistema.
}
function comprobar($condicion, $nombre): void {
    if (!$condicion) throw new \RuntimeException($nombre);
    echo "OK: $nombre\n";
}
function config(string $dir): array {
    return ['dir_limites' => $dir, 'sal' => 'solo-pruebas', 'limite_envios' => 5, 'ventana_segundos' => 3600];
}
function proceso(array $argumentos): array {
    $p = \proc_open(array_merge([PHP_BINARY, __FILE__], $argumentos),
        [0 => ['pipe', 'r'], 1 => ['pipe', 'w'], 2 => ['pipe', 'w']], $tubos);
    if (!is_resource($p)) throw new \RuntimeException('No se pudo crear el proceso de prueba');
    \fclose($tubos[0]);
    return [$p, $tubos];
}
function resultado(array $proceso): string {
    [$p, $tubos] = $proceso;
    $salida = \stream_get_contents($tubos[1]);
    $error = \stream_get_contents($tubos[2]);
    \fclose($tubos[1]);
    \fclose($tubos[2]);
    if (\proc_close($p) !== 0) throw new \RuntimeException($error ?: 'Falló un proceso de prueba');
    return $salida;
}
function limpiar(string $dir): void {
    foreach (\scandir($dir) as $nombre) {
        if ($nombre === '.' || $nombre === '..') continue;
        $ruta = $dir . '/' . $nombre;
        if (is_dir($ruta)) limpiar($ruta); else \unlink($ruta);
    }
    \rmdir($dir);
}

$fuente = file_get_contents(__DIR__ . '/../src/contacto/enviar.php');
$_SERVER['REMOTE_ADDR'] = '127.0.0.1';
if (($argv[1] ?? '') === '--post') {
    // Caso «fallo+variante»: el fallo de E/S que se inyecta (o «normal») y, opcionalmente, una variante del formulario
    [$modo, $variante] = array_pad(explode('+', $argv[2], 2), 2, '');
    if ($modo === 'honeypot' || $modo === 'rgpd') { $variante = $modo; $modo = ''; }
    \putenv('BROTOTERMIC_FORMULARIO_CONFIG=' . $argv[3]);
    $_SERVER['REQUEST_METHOD'] = 'POST';
    $_POST = ['name' => 'Prueba local', 'email' => 'prueba@example.invalid', 'message' => 'Prueba aislada', 'rgpd' => 'si'];
    if ($variante === 'honeypot') $_POST['web'] = 'robot';
    if ($variante === 'rgpd') unset($_POST['rgpd']);
    \register_shutdown_function(function () {
        echo json_encode(['respuesta' => $GLOBALS['respuesta'], 'correos' => $GLOBALS['correos'], 'registro' => $GLOBALS['registro']]);
    });
    // Se ejecuta el endpoint real con header() y mail() sustituidos únicamente en este proceso.
    $codigo = str_replace(['<?php', 'declare(strict_types=1);'], '', $fuente);
    eval('namespace PruebaLimitador;' . $codigo);
    exit;
}

$inicio = strpos($fuente, 'function dentroDelLimite(');
$fin = strpos($fuente, '// ---------- 4.', $inicio);
if ($inicio === false || $fin === false) throw new \RuntimeException('No se encuentra el limitador');
eval('namespace PruebaLimitador;' . substr($fuente, $inicio, $fin - $inicio));
if (($argv[1] ?? '') === '--worker') {
    echo json_encode(dentroDelLimite(config($argv[2])));
    exit;
}

$raiz = sys_get_temp_dir() . '/brototermic-test-' . bin2hex(random_bytes(8));
\mkdir($raiz, 0700);
try {
    $c = config($raiz . '/normal');
    for ($i = 1; $i <= 5; $i++) comprobar(dentroDelLimite($c) === true, "solicitud $i dentro del límite");
    comprobar(dentroDelLimite($c) === false, 'sexta solicitud limitada');
    $archivo = $c['dir_limites'] . '/' . hash('sha256', $c['sal'] . '|127.0.0.1');
    \file_put_contents($archivo, (string) (time() - 4000));
    comprobar(dentroDelLimite($c) === true, 'ventana vencida vuelve a permitir');
    \file_put_contents($archivo, 'registro-invalido');
    comprobar(dentroDelLimite($c) === null, 'registro corrupto no permite continuar');
    \file_put_contents($raiz . '/obstaculo', 'archivo');
    comprobar(dentroDelLimite(config($raiz . '/obstaculo/dir')) === null, 'error real de creación de directorio');
    $c = config($raiz . '/inaccesible');
    \mkdir($c['dir_limites']);
    \mkdir($c['dir_limites'] . '/' . hash('sha256', $c['sal'] . '|127.0.0.1'));
    comprobar(dentroDelLimite($c) === null, 'error real de apertura: destino no es archivo');
    $dirSoloLectura = $raiz . '/solo-lectura';
    \mkdir($dirSoloLectura);
    \chmod($dirSoloLectura, 0500);
    try {
        clearstatcache();
        if (is_writable($dirSoloLectura)) {
            echo "PENDIENTE: permisos de solo lectura no efectivos para este usuario.\n";
        } else {
            comprobar(dentroDelLimite(config($dirSoloLectura)) === null, 'almacenamiento real no escribible');
        }
    } finally {
        \chmod($dirSoloLectura, 0700);
    }
    foreach (['mkdir', 'fopen', 'flock', 'lectura', 'rewind', 'escritura', 'parcial', 'ftruncate', 'fflush'] as $fallo) {
        $modo = $fallo;
        comprobar(dentroDelLimite(config($raiz . '/fallo-' . $fallo)) === null, 'fallo inyectado: ' . $fallo);
    }
    $modo = '';
    $procesos = [];
    for ($i = 0; $i < 12; $i++) $procesos[] = proceso(['--worker', $raiz . '/concurrente']);
    $permitidas = 0;
    foreach ($procesos as $p) {
        $r = json_decode(resultado($p), true);
        comprobar(is_bool($r), 'proceso concurrente sin error de infraestructura');
        if ($r) $permitidas++;
    }
    comprobar($permitidas === 5, '12 solicitudes concurrentes permiten exactamente 5');

    if (!extension_loaded('mbstring')) throw new \RuntimeException('Falta mbstring para probar el endpoint completo');
    $configArchivo = $raiz . '/config.php';
    $c = config($raiz . '/endpoint') + ['destino' => 'destino@example.invalid', 'remitente' => 'web@example.invalid'];
    \file_put_contents($configArchivo, '<?php return ' . var_export($c, true) . ';');
    $fallosAlmacenamiento = ['mkdir', 'fopen', 'flock', 'lectura', 'rewind', 'escritura', 'parcial', 'ftruncate', 'fflush'];
    // D-015: con el almacenamiento roto, el envío se acepta (gracias + 1 correo) y queda una línea en el log
    foreach ($fallosAlmacenamiento as $caso) {
        $r = json_decode(resultado(proceso(['--post', $caso, $configArchivo])), true);
        comprobar(in_array(['Location: /contacto/gracias.html', 303], $r['respuesta'], true), 'fallo de almacenamiento acepta el envío: ' . $caso);
        comprobar($r['correos'] === 1, 'fallo de almacenamiento envía el correo: ' . $caso);
        comprobar((bool) preg_grep('/limitador no disponible/', $r['registro']), 'fallo de almacenamiento queda en el log: ' . $caso);
    }
    // Con el almacenamiento roto, el campo trampa y la validación siguen actuando
    foreach (['mkdir+honeypot' => '/contacto/gracias.html', 'fopen+rgpd' => '/contacto/error.html#rgpd'] as $caso => $destino) {
        $r = json_decode(resultado(proceso(['--post', $caso, $configArchivo])), true);
        comprobar(in_array(['Location: ' . $destino, 303], $r['respuesta'], true), 'respuesta controlada: ' . $caso);
        comprobar($r['correos'] === 0, 'sin correo: ' . $caso);
    }
    foreach (['rgpd' => '/contacto/error.html#rgpd', 'honeypot' => '/contacto/gracias.html', 'normal' => '/contacto/gracias.html'] as $caso => $destino) {
        $r = json_decode(resultado(proceso(['--post', $caso, $configArchivo])), true);
        comprobar(in_array(['Location: ' . $destino, 303], $r['respuesta'], true), 'respuesta controlada: ' . $caso);
        comprobar($r['correos'] === ($caso === 'normal' ? 1 : 0), 'correo capturado o ausente: ' . $caso);
        comprobar($r['registro'] === [], 'sin anotaciones en el log: ' . $caso);
    }
    for ($i = 0; $i < 4; $i++) resultado(proceso(['--post', 'normal', $configArchivo]));
    $r = json_decode(resultado(proceso(['--post', 'normal', $configArchivo])), true);
    comprobar(in_array(['Location: /contacto/error.html#limite', 303], $r['respuesta'], true) && $r['correos'] === 0,
        'límite agotado conserva su respuesta y no envía correo');
    echo "Todas las pruebas del limitador superadas; ningún correo real enviado.\n";
} finally {
    limpiar($raiz);
}
