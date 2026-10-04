/* ============================================================
   PORTAL ZAG — Checkout de la Tienda ZAG (js/checkout.js)
   Tres pasos: datos, recogida y pago, confirmación.

   El checkout no cobra nada: no hay formulario de tarjeta ni campos
   de pago. Se recogen los datos para avisar cuándo el pedido esté
   listo, y el pedido se paga en la U.

   El carrito vive en js/tienda-carrito.js, igual que en tienda.html,
   así que el resumen de esta página y el panel de la tienda nunca
   se contradicen.
   ============================================================ */

(function () {
  'use strict';

  var D = window.ZAG_TIENDA;
  var C = window.ZAG_TIENDA_CARRITO;
  var UI = D.ui;

  var $ = function (id) { return document.getElementById(id); };

  var paso = 1;
  var datos = { nombre: '', correo: '', celular: '', programa: '', nota: '' };
  var aceptado = false;
  var resumenAbierto = false;
  var enviado = false;

  function el(tag, clase, texto) {
    var n = document.createElement(tag);
    if (clase) n.className = clase;
    if (texto !== undefined && texto !== null) n.textContent = texto;
    return n;
  }

  function vaciar(nodo) {
    while (nodo && nodo.firstChild) nodo.removeChild(nodo.firstChild);
  }

  function imagen(p) {
    var img = document.createElement('img');
    img.alt = p.alt || p.nombre;
    img.width = 120;
    img.height = 120;
    img.loading = 'lazy';
    img.src = p.img;
    img.addEventListener('error', function () {
      if (img.dataset.caido) return;
      img.dataset.caido = '1';
      img.src = p.placeholder;
    });
    return img;
  }

  /* ============================================================
     Indicador de pasos
     ============================================================ */
  function pintarPasos() {
    var host = $('td-pasos');
    if (!host) return;
    vaciar(host);
    [UI.checkout.paso1, UI.checkout.paso2, UI.checkout.paso3].forEach(function (texto, i) {
      var n = i + 1;
      var li = el('li', 'td-paso');
      if (n < paso) li.classList.add('td-paso--listo');
      if (n === paso) li.setAttribute('aria-current', 'step');
      li.appendChild(el('span', 'td-paso__n', n < paso ? '✓' : String(n)));
      li.appendChild(el('span', null, texto));
      host.appendChild(li);
      if (n < 3) {
        var raya = el('li', 'td-pasos__raya');
        raya.setAttribute('aria-hidden', 'true');
        host.appendChild(raya);
      }
    });
  }

  /* ============================================================
     Resumen del pedido (colapsable en mobile, sticky en desktop)
     ============================================================ */
  function pintarResumen() {
    var host = $('td-resumen-body');
    if (!host) return;
    vaciar(host);

    var r = C.resumen();
    if (r.vacio) {
      host.appendChild(el('p', 'td-resumen__vacio', UI.checkout.vacioTexto));
      return;
    }

    r.items.forEach(function (x) {
      var foto = el('div', 'td-item__foto');
      foto.appendChild(imagen(x.producto));
      var item = el('div', 'td-item');
      item.appendChild(foto);

      var info = el('div', 'td-item__info');
      info.appendChild(el('p', 'td-item__nombre', x.producto.nombre));
      var meta = el('p', 'td-item__meta',
        (x.talla ? 'Talla ' + x.talla + ' · ' : '') +
        x.cantidad + ' × ' + D.formatearPrecio(x.unitario));
      info.appendChild(meta);
      item.appendChild(info);

      item.appendChild(el('p', 'td-item__precio', D.formatearPrecio(x.subtotal)));
      host.appendChild(item);
    });

    var t = el('div', 'td-totales');
    t.appendChild(fila(UI.carrito.subtotal, D.formatearPrecio(r.subtotal)));
    if (r.descuento > 0) {
      var d = fila(UI.carrito.descuento, '− ' + D.formatearPrecio(r.descuento));
      d.classList.add('td-totales__fila--desc');
      t.appendChild(d);
    }
    var tot = fila(UI.carrito.total, D.formatearPrecio(r.total));
    tot.classList.add('td-totales__fila--total');
    t.appendChild(tot);
    t.appendChild(el('p', 'td-totales__envio', UI.carrito.envio));
    host.appendChild(t);
  }

  function fila(etiqueta, valor) {
    var f = el('div', 'td-totales__fila');
    f.appendChild(el('span', null, etiqueta));
    f.appendChild(el('span', null, valor));
    return f;
  }

  function toggleResumen() {
    resumenAbierto = !resumenAbierto;
    var body = $('td-resumen-body');
    var btn = $('td-resumen-toggle');
    body.hidden = !resumenAbierto;
    btn.setAttribute('aria-expanded', resumenAbierto ? 'true' : 'false');
    var etiqueta = $('td-resumen-titulo');
    etiqueta.textContent = resumenAbierto ? UI.checkout.ocultarResumen : UI.checkout.verResumen;
    /* En desktop el cuerpo siempre se ve: el botón no aplica. */
    if (window.matchMedia('(min-width: 720px)').matches) {
      body.hidden = false;
    }
  }

  /* ============================================================
     Bloqueos: carrito vacío o sin sesión
     ============================================================ */
  function pantallaBloqueo(titulo, texto) {
    var main = $('td-main');
    var host = $('td-checkout__aside');
    if (host) host.hidden = true;
    vaciar(main);
    var caja = el('section', 'td-tarjeta');
    caja.appendChild(el('h2', 'td-tarjeta__titulo', titulo));
    caja.appendChild(el('p', 'td-tarjeta__fila', texto));
    var a = el('a', 'btn td-cta', UI.checkout.volver);
    a.href = 'tienda.html';
    caja.appendChild(a);
    main.appendChild(caja);
    var pasos = $('td-pasos');
    if (pasos) pasos.hidden = true;
  }

  /* ============================================================
     PASO 1 · Tus datos
     ============================================================ */
  var CAMPOS = [
    { id: 'ck-nombre', campo: 'nombre', etiqueta: 'Nombre completo *', tipo: 'text',
      autocomplete: 'name', ayuda: 'Con esto te llamamos cuando esté listo.' },
    { id: 'ck-correo', campo: 'correo', etiqueta: 'Correo institucional *', tipo: 'email',
      autocomplete: 'email', ayuda: 'Si usas tu correo de la EAM, mejor.' },
    { id: 'ck-celular', campo: 'celular', etiqueta: 'Celular / WhatsApp *', tipo: 'tel',
      autocomplete: 'tel', ayuda: '10 dígitos, sin el +57.' },
    { id: 'ck-programa', campo: 'programa', etiqueta: 'Programa y semestre', tipo: 'text',
      autocomplete: 'off', ayuda: 'Opcional.' }
  ];

  function validarCampo(def) {
    var input = $(def.id);
    if (!input) return true;
    var valor = input.value.trim();
    var error = '';

    if (def.campo === 'nombre') {
      if (!valor) error = 'Escribe tu nombre.';
      else if (valor.length < 3) error = 'El nombre parece muy corto.';
    } else if (def.campo === 'correo') {
      if (!valor) {
        error = 'Necesitamos un correo para avisarte.';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(valor)) {
        error = 'Ese correo no parece válido.';
      } else if (!/@eam\.edu\.co$/i.test(valor)) {
        error = 'Revisa el dominio: solemos usar @eam.edu.co.';
      }
    } else if (def.campo === 'celular') {
      var digitos = valor.replace(/\D/g, '');
      if (!digitos) error = 'Necesitamos un número para avisarte.';
      else if (digitos.length !== 10) error = 'Deben ser 10 dígitos. Van ' + digitos.length + '.';
    }

    var nodoError = document.getElementById(def.id + '-error');
    if (error) {
      input.setAttribute('aria-invalid', 'true');
      if (nodoError) {
        nodoError.textContent = error;
        nodoError.hidden = false;
      }
      return false;
    }
    input.removeAttribute('aria-invalid');
    if (nodoError) {
      nodoError.textContent = '';
      nodoError.hidden = true;
    }
    return true;
  }

  function leerCampos() {
    CAMPOS.forEach(function (def) {
      var input = $(def.id);
      if (input) datos[def.campo] = input.value.trim();
    });
  }

  function paso1() {
    var main = $('td-main');
    vaciar(main);

    var caja = el('section', 'td-tarjeta');
    caja.setAttribute('aria-labelledby', 'ck-paso1');
    caja.appendChild(el('h2', 'td-tarjeta__titulo', '1 · Tus datos'));
    caja.id = 'ck-paso1';

    var form = el('div', 'td-campos');
    CAMPOS.forEach(function (def) {
      var campo = el('div', 'td-campo');
      var label = el('label', null, def.etiqueta);
      label.setAttribute('for', def.id);
      campo.appendChild(label);

      var input = document.createElement('input');
      input.id = def.id;
      input.type = def.tipo;
      input.value = datos[def.campo] || '';
      input.setAttribute('autocomplete', def.autocomplete);
      input.setAttribute('aria-describedby', def.id + '-ayuda ' + def.id + '-error');

      if (def.campo === 'correo') input.inputMode = 'email';
      if (def.campo === 'celular') input.inputMode = 'numeric';

      campo.appendChild(input);

      var ayuda = el('p', 'td-campo__ayuda', def.ayuda);
      ayuda.id = def.id + '-ayuda';
      campo.appendChild(ayuda);

      var error = el('p', 'td-campo__error');
      error.id = def.id + '-error';
      error.hidden = true;
      campo.appendChild(error);

      /* Al salir del campo se valida; al escribir se limpia el error. */
      input.addEventListener('blur', function () {
        validarCampo(def);
      });
      input.addEventListener('input', function () {
        if (input.getAttribute('aria-invalid') === 'true') validarCampo(def);
      });

      form.appendChild(campo);
    });
    caja.appendChild(form);

    caja.appendChild(el('p', 'td-nota-legal',
      'Solo usamos estos datos para avisarte cuando tu pedido esté listo. ' +
      'Es un prototipo: no se envía nada a ningún servidor.'));

    var acciones = el('div', 'td-pedido__acciones');
    var seguir = el('button', 'btn td-cta', 'Continuar a recogida');
    seguir.type = 'button';
    seguir.id = 'ck-continuar';
    seguir.addEventListener('click', function () {
      leerCampos();
      var primerMal = null;
      CAMPOS.forEach(function (def) {
        if (!validarCampo(def) && !primerMal) primerMal = $(def.id);
      });
      if (primerMal) {
        primerMal.focus();
        anunciar('Faltan datos por corregir.');
        return;
      }
      paso = 2;
      render();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    acciones.appendChild(seguir);
    var volver = el('a', 'td-item__quitar', 'Volver a la tienda');
    volver.href = 'tienda.html';
    acciones.appendChild(volver);
    caja.appendChild(acciones);

    main.appendChild(caja);
  }

  /* ============================================================
     PASO 2 · Recogida y pago
     ============================================================ */
  function paso2() {
    var main = $('td-main');
    vaciar(main);
    var recogida = C.fechaRecogida();

    var caja = el('section', 'td-tarjeta');
    caja.appendChild(el('h2', 'td-tarjeta__titulo', '2 · Recogida y pago'));

    /* Tarjeta: recoger en la Facultad. */
    var t1 = el('section', 'td-tarjeta td-tarjeta--nivel');
    t1.setAttribute('data-nivel', 'rookie');
    t1.appendChild(el('h3', 'td-tarjeta__titulo', '📍 Recoges en la Facultad'));
    var f1 = el('p', 'td-tarjeta__fila');
    f1.appendChild(el('b', null, 'Lugar: '));
    f1.appendChild(document.createTextNode(D.config.lugarRecogida));
    t1.appendChild(f1);
    t1.appendChild(el('p', 'td-tarjeta__fila', '🕗 Horario: ' + D.config.horarioRecogida));
    var f2 = el('p', 'td-tarjeta__fila');
    f2.appendChild(el('b', null, 'Listo desde: '));
    f2.appendChild(document.createTextNode(C.fechaLarga(recogida)));
    t1.appendChild(f2);
    t1.appendChild(el('p', 'td-nota-legal',
      'Son ' + D.config.diasHabilesRecogida + ' días hábiles desde hoy. ' +
      'El pedido se cancela solo si no lo recoges en ' + D.config.diasParaCancelar + ' días hábiles.'));
    caja.appendChild(t1);

    /* Tarjeta: pagar en la U. Sin formulario de pago. */
    var t2 = el('section', 'td-tarjeta td-tarjeta--siguiente');
    t2.appendChild(el('h3', 'td-tarjeta__titulo', '💵 Pagas en la U'));
    t2.appendChild(el('p', 'td-tarjeta__fila',
      'No pagas nada ahora. Pagas al recoger, en efectivo o por Nequi.'));
    t2.appendChild(el('p', 'td-nota-legal',
      'Por eso no te pedimos tarjeta, ni contraseña, ni nada de eso. ' + D.config.pago + '.'));
    caja.appendChild(t2);

    /* Nota opcional. */
    var campoNota = el('div', 'td-campo');
    var labelNota = el('label', null, 'Nota para tu pedido');
    labelNota.setAttribute('for', 'ck-nota');
    campoNota.appendChild(labelNota);
    var nota = document.createElement('textarea');
    nota.id = 'ck-nota';
    nota.value = datos.nota;
    nota.setAttribute('aria-describedby', 'ck-nota-ayuda');
    nota.addEventListener('input', function () { datos.nota = nota.value.trim(); });
    campoNota.appendChild(nota);
    var ayudaNota = el('p', 'td-campo__ayuda', 'Opcional. Para cambios de talla o consultas al recoger.');
    ayudaNota.id = 'ck-nota-ayuda';
    campoNota.appendChild(ayudaNota);
    caja.appendChild(campoNota);

    /* Checkbox obligatorio. */
    var check = el('label', 'td-check');
    check.setAttribute('for', 'ck-acepto');
    var input = document.createElement('input');
    input.type = 'checkbox';
    input.id = 'ck-acepto';
    input.checked = aceptado;
    check.appendChild(input);
    check.appendChild(el('span', null,
      'Entiendo que debo recoger y pagar mi pedido en la Facultad. Si no lo recojo en ' +
      D.config.diasParaCancelar + ' días hábiles, se cancela.'));
    check.addEventListener('change', function () {
      aceptado = input.checked;
      check.removeAttribute('data-invalid');
      var err = $('ck-acepto-error');
      if (err) err.hidden = true;
    });
    caja.appendChild(check);
    var error = el('p', 'td-campo__error', 'Tienes que aceptar para confirmar el pedido.');
    error.id = 'ck-acepto-error';
    error.hidden = true;
    error.setAttribute('role', 'alert');
    caja.appendChild(error);

    var acciones = el('div', 'td-pedido__acciones');
    var confirmar = el('button', 'btn td-cta', 'Confirmar pedido');
    confirmar.type = 'button';
    confirmar.id = 'ck-confirmar';
    confirmar.addEventListener('click', function () {
      if (!input.checked) {
        check.setAttribute('data-invalid', 'true');
        error.hidden = false;
        input.focus();
        anunciar('Falta aceptar la condición de recogida.');
        return;
      }
      datos.nota = nota.value.trim();
      confirmar.disabled = true;
      confirmar.textContent = UI.checkout.confirmando;
      /* Simula el envío: en el portal no hay servidor. */
      window.setTimeout(function () {
        enviado = true;
        var r = C.crearPedido(datos);
        if (!r.ok) {
          confirmar.disabled = false;
          confirmar.textContent = 'Confirmar pedido';
          window.location.href = 'tienda.html';
          return;
        }
        paso = 3;
        render();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 700);
    });
    acciones.appendChild(confirmar);

    var atras = el('button', 'td-item__quitar', 'Atrás');
    atras.type = 'button';
    atras.addEventListener('click', function () {
      leerCampos();
      paso = 1;
      render();
    });
    acciones.appendChild(atras);
    caja.appendChild(acciones);

    main.appendChild(caja);
  }

  /* ============================================================
     PASO 3 · Confirmación
     ============================================================ */
  function paso3() {
    var main = $('td-main');
    var aside = $('td-checkout__aside');
    if (aside) aside.hidden = true;
    vaciar(main);
    var p = C.ultimoPedido();

    if (!p) {
      pantallaBloqueo(UI.checkout.vacioTitulo, UI.checkout.vacioTexto);
      return;
    }

    var caja = el('section', 'td-confirmacion');

    var sello = document.createElement('img');
    sello.className = 'td-sello';
    sello.src = 'assets/logos/sellozagnaranja.png';
    sello.alt = 'Sello ZAG: pedido confirmado';
    sello.width = 96;
    sello.height = 96;
    caja.appendChild(sello);

    caja.appendChild(el('h2', 'td-confirmacion__titulo', '¡Pedido confirmado!'));

    var codigo = el('p', 'td-codigo', p.codigo);
    caja.appendChild(codigo);

    var texto = el('p', 'td-confirmacion__texto');
    texto.appendChild(document.createTextNode('Recógelo en la Facultad desde el '));
    texto.appendChild(el('b', null, C.fechaLarga(p.fechaRecogida)));
    texto.appendChild(document.createTextNode('. Pagas '));
    texto.appendChild(el('b', null, D.formatearPrecio(p.total)));
    texto.appendChild(document.createTextNode(' al recoger.'));
    caja.appendChild(texto);

    var items = el('ul', 'td-pedido__items td-pedido__items--centro');
    (p.items || []).forEach(function (it) {
      var li = el('li');
      li.appendChild(el('span', null,
        it.nombre + (it.talla ? ' · ' + it.talla : '') + ' ×' + it.cantidad));
      li.appendChild(el('b', null, D.formatearPrecio(it.subtotal)));
      items.appendChild(li);
    });
    caja.appendChild(items);

    if (p.descuento > 0) {
      caja.appendChild(el('p', 'td-nota-legal',
        'Incluye tu descuento Senior de ' + D.formatearPrecio(p.descuento) + '.'));
    }

    var acciones = el('div', 'td-confirmacion__acciones');
    var cal = el('a', 'btn td-cta', UI.pedidos.calendario);
    cal.href = C.urlCalendario(p);
    cal.target = '_blank';
    cal.rel = 'noopener';
    acciones.appendChild(cal);

    var pedidos = el('a', 'btn td-btn-claro', UI.pedidos.titulo);
    pedidos.href = 'tienda.html#pedidos';
    acciones.appendChild(pedidos);

    var seguir = el('a', 'td-item__quitar', 'Seguir comprando');
    seguir.href = 'tienda.html';
    acciones.appendChild(seguir);
    caja.appendChild(acciones);

    main.appendChild(caja);
  }

  /* ============================================================
     Aviso para lectores de pantalla
     ============================================================ */
  function anunciar(texto) {
    var host = $('td-toasts');
    if (!host) return;
    var p = el('p', 'td-toast', texto);
    host.appendChild(p);
    window.setTimeout(function () {
      if (p.parentNode) p.parentNode.removeChild(p);
    }, 3000);
  }

  /* ============================================================
     Render
     ============================================================ */
  function render() {
    pintarPasos();
    pintarResumen();

    var aside = $('td-checkout__aside');

    /* La confirmación va primero: al confirmar, crearPedido() vacía el
       carrito y resumen().listo ya es false. */
    if (paso === 3 || enviado) {
      paso3();
      return;
    }

    var r = C.resumen();
    if (!r.listo) {
      if (!C.tieneSesion()) {
        pantallaBloqueo(UI.checkout.sinSesionTitulo, UI.checkout.sinSesionTexto);
      } else {
        pantallaBloqueo(UI.checkout.vacioTitulo,
          r.vacio ? UI.checkout.vacioTexto : 'Hay productos en tu carrito que ya no puedes pedir. Revísalos en la tienda.');
      }
      return;
    }

    if (aside) aside.hidden = false;

    if (paso === 3 || enviado) {
      paso3();
      return;
    }
    if (paso === 2) paso2();
    else paso1();
  }

  function init() {
    if (!D || !C) return;

    /* Prefill desde la sesión, como en el resto del portal. */
    datos.nombre = C.nombreSesion();
    datos.correo = C.correoSesion();

    var toggle = $('td-resumen-toggle');
    if (toggle) toggle.addEventListener('click', toggleResumen);

    /* En mobile el resumen arranca abierto para que se vea el total
       sin tener que tocar nada; en desktop el CSS lo muestra siempre. */
    if (window.matchMedia('(max-width: 719px)').matches) {
      resumenAbierto = true;
      var body = $('td-resumen-body');
      var etiqueta = $('td-resumen-titulo');
      if (body) body.hidden = false;
      if (toggle) toggle.setAttribute('aria-expanded', 'true');
      if (etiqueta) etiqueta.textContent = UI.checkout.ocultarResumen;
    }

    render();
    C.suscribir(function () { render(); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();