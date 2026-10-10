/* menu.js — mejora progresiva de la cabecera y del índice de productos.
   Se carga con «defer» y no tiene dependencias. SIN JS LA WEB FUNCIONA IGUAL: todos los enlaces
   están escritos en el HTML; este archivo solo abre y cierra paneles y filtra la lista de categorías.
   Estados: siempre con aria-expanded (lo leen los lectores de pantalla y lo usa el CSS). */
(function () {
  'use strict';

  var raiz = document.documentElement;
  var escritorio = window.matchMedia('(min-width: 768px)');
  var conRaton = window.matchMedia('(hover: hover) and (pointer: fine)');
  var lista = function (selector, base) { return Array.prototype.slice.call((base || document).querySelectorAll(selector)); };
  var expandido = function (boton) { return Boolean(boton) && boton.getAttribute('aria-expanded') === 'true'; };

  /* ---------- 1. Menú móvil (botón ☰) ---------- */
  var cabecera = document.querySelector('.cabecera');
  var botonMenu = document.querySelector('.cabecera__menu');
  var menu = document.getElementById('menu-principal');

  function abrirMenuMovil(abrir) {
    if (!botonMenu) return;
    botonMenu.setAttribute('aria-expanded', String(abrir));
    raiz.classList.toggle('menu-abierto', abrir); // el CSS muestra el panel y bloquea el scroll del fondo
  }
  if (botonMenu && menu) {
    botonMenu.addEventListener('click', function () { abrirMenuMovil(!expandido(botonMenu)); });
    // Si el foco sale de la cabecera con el menú abierto (tabulador), se cierra: no queda un panel tapando la página
    cabecera.addEventListener('focusout', function (e) {
      if (!escritorio.matches && expandido(botonMenu) && e.relatedTarget && !cabecera.contains(e.relatedTarget)) abrirMenuMovil(false);
    });
    // Al pulsar un enlace del menú (también un ancla de esta página), se cierra
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a') && expandido(botonMenu)) abrirMenuMovil(false);
    });
  }

  /* ---------- 2. Panel «Productos» ---------- */
  var itemProductos = document.querySelector('.menu__item--productos');
  var botonProductos = itemProductos && itemProductos.querySelector('.menu__boton');
  var panel = document.getElementById('panel-productos');
  var temporizador = null;
  var abiertoPorRaton = 0;

  function abrirPanel(abrir) {
    if (!botonProductos) return;
    clearTimeout(temporizador);
    botonProductos.setAttribute('aria-expanded', String(abrir));
  }

  if (botonProductos && panel) {
    botonProductos.addEventListener('click', function () {
      // Si el ratón acaba de abrirlo, el clic no lo vuelve a cerrar
      if (expandido(botonProductos) && Date.now() - abiertoPorRaton < 600) return;
      abrirPanel(!expandido(botonProductos));
    });

    // Con ratón: se abre al pasar por encima con 150 ms de retardo, para no abrirlo sin querer
    itemProductos.addEventListener('mouseenter', function () {
      if (!escritorio.matches || !conRaton.matches) return;
      clearTimeout(temporizador);
      temporizador = setTimeout(function () {
        if (!expandido(botonProductos)) abiertoPorRaton = Date.now();
        abrirPanel(true);
      }, 150);
    });
    itemProductos.addEventListener('mouseleave', function () {
      if (!escritorio.matches || !conRaton.matches) return;
      clearTimeout(temporizador);
      temporizador = setTimeout(function () { abrirPanel(false); }, 300);
    });

    // En escritorio se cierra al tabular fuera o al hacer clic fuera
    itemProductos.addEventListener('focusout', function (e) {
      if (escritorio.matches && e.relatedTarget && !itemProductos.contains(e.relatedTarget)) abrirPanel(false);
    });
    document.addEventListener('click', function (e) {
      if (escritorio.matches && expandido(botonProductos) && !itemProductos.contains(e.target)) abrirPanel(false);
    });
  }

  // Esc cierra lo que esté abierto y devuelve el foco al botón que lo abrió
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (escritorio.matches && expandido(botonProductos)) {
      abrirPanel(false);
      botonProductos.focus();
    } else if (expandido(botonMenu)) {
      abrirMenuMovil(false);
      botonMenu.focus();
    }
  });

  /* ---------- 3. Acordeón de familias (móvil): una abierta a la vez ---------- */
  var plegables = lista('.megamenu__plegar');
  plegables.forEach(function (boton) {
    boton.addEventListener('click', function () {
      var abrir = !expandido(boton);
      plegables.forEach(function (otro) { otro.setAttribute('aria-expanded', 'false'); });
      boton.setAttribute('aria-expanded', String(abrir));
    });
  });
  // La familia de la página actual empieza desplegada
  var plegableActivo = document.querySelector('.megamenu__grupo--activo .megamenu__plegar');
  if (plegableActivo) plegableActivo.setAttribute('aria-expanded', 'true');

  /* ---------- 4. Buscador de categorías ---------- */
  var buscador = panel && panel.querySelector('.buscador');
  var campo = buscador && buscador.querySelector('.buscador__campo');
  var estado = buscador && buscador.querySelector('.buscador__estado');

  if (buscador && campo && estado) {
    buscador.hidden = false; // solo se muestra si este JS funciona
    // Sin tildes ni mayúsculas: «calefaccion» encuentra «Calefacción»
    var normalizar = function (s) { return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); };
    var enlaces = lista('.megamenu__lista a', panel).map(function (a) {
      return {
        li: a.parentNode,
        buscable: a.hasAttribute('data-buscar'), // solo las categorías (no «Ver todos», servicios ni PDF)
        texto: normalizar(a.textContent + ' ' + (a.getAttribute('data-buscar') || '')),
        enlace: a
      };
    });
    var grupos = lista('.megamenu__grupo', panel);
    var columnas = lista('.megamenu__columna', panel);
    var temporizadorEstado = null;
    var plegadoAntes = null; // estado del acordeón antes de buscar, para recuperarlo al vaciar el campo

    var filtrar = function () {
      var palabras = normalizar(campo.value.trim()).split(/\s+/).filter(Boolean);
      var filtrando = palabras.length > 0;
      var encontrados = [];
      panel.classList.toggle('megamenu--filtrando', filtrando);
      // Mientras se busca, todas las familias se despliegan (y lo dicen con aria-expanded, no solo con CSS)
      if (filtrando && !plegadoAntes) {
        plegadoAntes = plegables.map(expandido);
        plegables.forEach(function (b) { b.setAttribute('aria-expanded', 'true'); });
      } else if (!filtrando && plegadoAntes) {
        plegables.forEach(function (b, i) { b.setAttribute('aria-expanded', String(plegadoAntes[i])); });
        plegadoAntes = null;
      }
      enlaces.forEach(function (e) {
        // Coincide si contiene TODAS las palabras («resistencias aire» → Calentamiento de aire)
        var visible = !filtrando || (e.buscable && palabras.every(function (p) { return e.texto.indexOf(p) !== -1; }));
        e.li.hidden = !visible;
        if (filtrando && visible) encontrados.push(e);
      });
      grupos.forEach(function (g) {
        g.hidden = filtrando && !g.querySelector('.megamenu__lista li:not([hidden])');
      });
      // Una columna sin resultados no debe dejar un hueco en la rejilla
      columnas.forEach(function (c) {
        c.hidden = filtrando && !c.querySelector('.megamenu__grupo:not([hidden])');
      });
      // El resultado se anuncia (role="status") con un pequeño retardo para no leerlo en cada tecla
      clearTimeout(temporizadorEstado);
      temporizadorEstado = setTimeout(function () {
        var n = encontrados.length;
        estado.textContent = !filtrando ? ''
          : n === 0 ? 'Ninguna categoría coincide. Prueba con otra palabra o pídenos presupuesto: también fabricamos a medida.'
          : n === 1 ? '1 categoría encontrada. Pulsa Intro para ir a ella.'
          : n + ' categorías encontradas.';
      }, 300);
      return encontrados;
    };

    campo.addEventListener('input', filtrar);
    campo.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && campo.value) {
        campo.value = '';
        filtrar();
        e.stopPropagation(); // el primer Esc vacía el campo; el segundo cierra el panel
      } else if (e.key === 'Enter') {
        var encontrados = filtrar();
        if (encontrados.length === 1) {
          e.preventDefault();
          window.location.href = encontrados[0].enlace.href;
        }
      }
    });
  }

  /* ---------- 5. Índice de productos: plegado de entrada en móvil ---------- */
  var indice = document.querySelector('.indice');
  if (indice && !escritorio.matches) indice.open = false;

  /* ---------- 6. Al pasar de móvil a escritorio (o al revés), todo cerrado ---------- */
  var alCambiarDeTamano = function () {
    abrirPanel(false);
    abrirMenuMovil(false);
  };
  if (escritorio.addEventListener) escritorio.addEventListener('change', alCambiarDeTamano);
  else if (escritorio.addListener) escritorio.addListener(alCambiarDeTamano);
})();
