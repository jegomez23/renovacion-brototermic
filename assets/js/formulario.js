/* formulario.js — mejora progresiva del formulario de presupuesto (diseno.md §3.13).
   Sin JS el formulario funciona igual (POST normal) y el servidor repite todas las validaciones.
   Con JS: rellena el mensaje con el producto (?producto=…), valida en el navegador con mensajes
   accesibles (aria-invalid, aria-describedby, resumen con role="alert" y foco al primer error)
   y comprueba el tamaño y el tipo del adjunto antes de enviar. */
(function () {
  'use strict';
  var form = document.getElementById('formulario');
  if (!form) return;

  /* ---------- 1. Producto desde «Pedir presupuesto de este producto» ---------- */
  var mensaje = form.querySelector('[name="message"]');
  var producto = new URLSearchParams(window.location.search).get('producto');
  if (producto && mensaje && !mensaje.value.trim()) {
    mensaje.value = 'Quiero pedir presupuesto de: ' + producto.slice(0, 200) + '\n\n';
  }

  /* ---------- 2. Validación ---------- */
  var maxBytes = Number(form.getAttribute('data-max-mb')) * 1024 * 1024;
  var tipos = (form.getAttribute('data-tipos') || '').split(',').map(function (t) { return t.trim().toLowerCase(); });
  var resumen = form.querySelector('.formulario__error-resumen');
  var errorArrastre = '';

  function errorDeArchivo(archivo) {
    var extension = (archivo.name.match(/\.[^.]+$/) || [''])[0].toLowerCase();
    if (tipos.indexOf(extension) === -1) return 'Ese tipo de archivo no se admite. Adjunta un archivo ' + tipos.join(', ') + '.';
    if (archivo.size > maxBytes) return 'El archivo pesa más de ' + form.getAttribute('data-max-mb') + ' MB.';
    return '';
  }

  function errorDe(campo) {
    if (campo.type === 'checkbox') return campo.required && !campo.checked ? 'Tienes que aceptar la política de privacidad para enviar la solicitud.' : '';
    if (campo.type === 'file') {
      if (errorArrastre) return errorArrastre;
      if (campo.files && campo.files.length > 1) return 'Adjunta un solo archivo. Selecciona el plano o la foto que quieres enviar.';
      return campo.files && campo.files[0] ? errorDeArchivo(campo.files[0]) : '';
    }
    var valor = campo.value.trim();
    if (campo.required && !valor) {
      return { name: 'Escribe tu nombre.', email: 'Escribe tu email.', message: 'Escribe tu mensaje.' }[campo.name] || 'Este campo es obligatorio.';
    }
    if (campo.type === 'email' && valor && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) return 'El email no parece correcto. Ejemplo: nombre@empresa.com';
    return '';
  }

  function mostrar(campo, mensajeError) {
    var caja = document.getElementById(campo.id + '-error');
    if (!caja) return;
    caja.textContent = mensajeError;
    caja.hidden = !mensajeError;
    if (mensajeError) campo.setAttribute('aria-invalid', 'true');
    else campo.removeAttribute('aria-invalid');
  }

  var campos = Array.prototype.slice.call(form.querySelectorAll('input[id]:not([type="hidden"]), textarea[id]'))
    .filter(function (c) { return document.getElementById(c.id + '-error'); });

  // Al salir de un campo con error, se revalida (no se molesta mientras se escribe por primera vez)
  campos.forEach(function (campo) {
    campo.addEventListener(campo.type === 'checkbox' || campo.type === 'file' ? 'change' : 'blur', function () {
      if (campo.getAttribute('aria-invalid') === 'true' || campo.type === 'file') mostrar(campo, errorDe(campo));
    });
  });

  /* ---------- 3. Adjunto: input nativo y arrastre opcional ---------- */
  var adjunto = form.querySelector('[name="adjunto"]');
  var zona = form.querySelector('[data-adjunto]');
  var nombreArchivo = form.querySelector('[data-adjunto-nombre]');
  var instruccion = form.querySelector('[data-adjunto-arrastre]');
  var quitarAdjunto = form.querySelector('[data-adjunto-quitar]');

  function actualizarAdjunto() {
    var archivo = adjunto.files && adjunto.files[0];
    nombreArchivo.textContent = archivo ? 'Archivo seleccionado: ' + archivo.name : 'Ningún archivo seleccionado.';
    zona.classList.toggle('adjunto--error', !!errorDe(adjunto));
    mostrar(adjunto, errorDe(adjunto));
    if (quitarAdjunto) quitarAdjunto.hidden = !archivo && !errorDe(adjunto);
  }

  if (adjunto && zona && nombreArchivo && instruccion) {
    nombreArchivo.hidden = false;
    actualizarAdjunto();
    if (quitarAdjunto) quitarAdjunto.addEventListener('click', function () {
      adjunto.value = '';
      errorArrastre = '';
      actualizarAdjunto();
      if (resumen && !resumen.hidden) {
        var restantes = campos.filter(function (campo) { return !!errorDe(campo); }).length;
        resumen.hidden = restantes === 0;
        resumen.textContent = restantes === 1 ? 'Revisa 1 campo del formulario.' : 'Revisa ' + restantes + ' campos del formulario.';
      }
      adjunto.focus();
    });
    adjunto.addEventListener('change', function () {
      errorArrastre = '';
      actualizarAdjunto();
    });
    form.addEventListener('reset', function () {
      window.setTimeout(function () { errorArrastre = ''; actualizarAdjunto(); }, 0);
    });

    // Comprobamos la asignación real de FileList antes de anunciar el arrastre.
    var admiteArrastre = false;
    try {
      var prueba = document.createElement('input');
      prueba.type = 'file';
      prueba.files = new DataTransfer().files;
      admiteArrastre = prueba.files.length === 0 && 'ondrop' in zona;
    } catch (error) { /* El selector nativo sigue disponible. */ }

    if (admiteArrastre) {
      instruccion.hidden = false;
      var profundidad = 0;

      function contieneArchivos(evento) {
        return evento.dataTransfer && Array.prototype.indexOf.call(evento.dataTransfer.types || [], 'Files') !== -1;
      }

      zona.addEventListener('dragenter', function (evento) {
        if (!contieneArchivos(evento)) return;
        evento.preventDefault();
        profundidad += 1;
        zona.classList.add('adjunto--arrastrando');
      });
      zona.addEventListener('dragover', function (evento) {
        if (!contieneArchivos(evento)) return;
        evento.preventDefault();
        evento.dataTransfer.dropEffect = 'copy';
      });
      zona.addEventListener('dragleave', function () {
        profundidad = Math.max(0, profundidad - 1);
        if (!profundidad) zona.classList.remove('adjunto--arrastrando');
      });
      zona.addEventListener('drop', function (evento) {
        if (!contieneArchivos(evento)) return;
        evento.preventDefault();
        profundidad = 0;
        zona.classList.remove('adjunto--arrastrando');
        var archivos = evento.dataTransfer.files;
        var carpeta = Array.prototype.some.call(evento.dataTransfer.items || [], function (item) {
          var entrada = item.webkitGetAsEntry && item.webkitGetAsEntry();
          return entrada && entrada.isDirectory;
        });
        errorArrastre = carpeta || !archivos.length
          ? 'Adjunta un archivo, no una carpeta. Selecciona un plano o una foto.'
          : archivos.length > 1 ? 'Adjunta un solo archivo. Selecciona el plano o la foto que quieres enviar.' : errorDeArchivo(archivos[0]);
        // Rechazamos todo el lote: nunca enviamos una selección anterior por accidente.
        adjunto.value = '';
        if (!errorArrastre) {
          try { adjunto.files = archivos; }
          catch (error) { errorArrastre = 'Selecciona el archivo con el botón. Tu navegador no permite adjuntarlo al arrastrarlo.'; }
        }
        actualizarAdjunto();
      });
    }
  }

  form.addEventListener('submit', function (evento) {
    var errores = campos.map(function (campo) {
      var e = errorDe(campo);
      mostrar(campo, e);
      return e ? campo : null;
    }).filter(Boolean);
    if (!errores.length) { resumen.hidden = true; return; }
    evento.preventDefault();
    resumen.textContent = errores.length === 1
      ? 'Revisa 1 campo del formulario.'
      : 'Revisa ' + errores.length + ' campos del formulario.';
    resumen.hidden = false;
    errores[0].focus();
  });
})();
