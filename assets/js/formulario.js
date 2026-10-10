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

  function errorDe(campo) {
    if (campo.type === 'checkbox') return campo.required && !campo.checked ? 'Tienes que aceptar la política de privacidad para enviar la solicitud.' : '';
    var valor = campo.value.trim();
    if (campo.required && !valor) {
      return { name: 'Escribe tu nombre.', email: 'Escribe tu email.', message: 'Escribe tu mensaje.' }[campo.name] || 'Este campo es obligatorio.';
    }
    if (campo.type === 'email' && valor && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) return 'El email no parece correcto. Ejemplo: nombre@empresa.com';
    if (campo.type === 'file' && campo.files && campo.files[0]) {
      var archivo = campo.files[0];
      var extension = (archivo.name.match(/\.[^.]+$/) || [''])[0].toLowerCase();
      if (tipos.indexOf(extension) === -1) return 'Ese tipo de archivo no se admite. Adjunta un archivo ' + tipos.join(', ') + '.';
      if (archivo.size > maxBytes) return 'El archivo pesa más de ' + form.getAttribute('data-max-mb') + ' MB.';
    }
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
