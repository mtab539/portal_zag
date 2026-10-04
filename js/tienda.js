/* ============================================================
   PORTAL ZAG — Tienda ZAG (js/tienda.js)
   Catálogo, ficha rápida, carrito y "Mis pedidos".

   Reglas que este archivo respeta siempre:
   - Nada de datos de negocio aquí: precios, textos y catálogo salen
     de window.ZAG_TIENDA; el estado, de window.ZAG_TIENDA_CARRITO.
   - Todo texto que venga del catálogo o de la sesión se inserta con
     textContent. Ni innerHTML con datos, ni estilos inline.
   - Los overlays son <div hidden> que se abren y cierran con foco
     atrapado y devuelto, y Esc los cierra.

   Además sube o baja el estado real cuando la sesión cambia, así que
   la tienda responde al botón "desbloquear nivel" del modo demo.
   ============================================================ */

(function () {
  'use strict';

  var D = window.ZAG_TIENDA;
  var C = window.ZAG_TIENDA_CARRITO;
  var UI = D.ui;

  var $ = function (id) { return document.getElementById(id); };
  var fotoCache = {};

  /* ============================================================
     Fechas: hoy en la zona del portal, para las etiquetas de la UI.
     ============================================================ */
  function hoyCorta() {
    try {
      return new Date().toLocaleDateString('es-CO', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        timeZone: D.config.zonaHoraria
      });
    } catch (e) {
      return C.fechaLarga(C.hoyISO());
    }
  }

  /* ============================================================
     Imágenes
     El <img> apunta al .png real. Como hoy no existe ninguno, cae
     en el SVG del mismo producto: se ve la ficha entera desde el
     primer día y cuando lleguen las fotos no hay que tocar nada.
     ============================================================ */
  function imagenProducto(p) {
    var img = document.createElement('img');
    img.alt = p.alt || p.nombre;
    img.loading = 'lazy';
    img.decoding = 'async';
    img.width = 400;
    img.height = 400;
    img.src = p.img;
    img.addEventListener('error', function () {
      if (img.dataset.caido) return;
      img.dataset.caido = '1';
      img.src = p.placeholder;
    });
    return img;
  }

  /* Un <img> sin src, paraprecargado: la ficha grande y el banner no
     deben parpadear mientras baja la foto. */
  function imagenPrecargada(p) {
    var img = imagenProducto(p);
    img.loading = 'eager';
    img.removeAttribute('width');
    img.removeAttribute('height');
    return img;
  }

  /* ============================================================
     Elementos
     ============================================================ */
  function el(tag, clase, texto) {
    var n = document.createElement(tag);
    if (clase) n.className = clase;
    if (texto !== undefined && texto !== null) n.textContent = texto;
    return n;
  }

  function vaciar(nodo) {
    while (nodo.firstChild) nodo.removeChild(nodo.firstChild);
  }

  /* ============================================================
     Overlay: abrir, cerrar, foco atrapado
     ============================================================ */
  var FOCO_ABIERTO = null;
  var FOCO_ORIGEN = null;
  var overlayAbierto = null;

  var FOCABLES = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

  function dentroDe(node, raiz) {
    while (node) {
      if (node === raiz) return true;
      node = node.parentElement;
    }
    return false;
  }

  function abrirOverlay(overlay, focoInicial, origen) {
    if (overlayAbierto && overlayAbierto !== overlay) cerrarOverlay(overlayAbierto);
    FOCO_ABIERTO = document.activeElement;
    /* Un click con el mouse o el dedo no siempre deja el foco en el boton:
       guardamos el origen explicito para devolverlo al cerrar. */
    FOCO_ORIGEN = origen || (FOCO_ABIERTO && FOCO_ABIERTO !== document.body ? FOCO_ABIERTO : null);
    overlay.hidden = false;
    overlayAbierto = overlay;
    document.body.classList.add('td-abierto');
    var primero = focoInicial || overlay.querySelector(FOCABLES);
    if (primero) primero.focus();
  }

  function limpiarUrlProducto() {
    try {
      var url = new URL(window.location.href);
      if (!url.searchParams.has('producto')) return;
      url.searchParams.delete('producto');
      window.history.replaceState({}, '', url);
    } catch (e) { /* file:// o historial bloqueado */ }
  }

  function cerrarOverlay(overlay) {
    overlay = overlay || overlayAbierto;
    if (!overlay) return;
    overlay.hidden = true;
    if (overlayAbierto === overlay) overlayAbierto = null;
    if (!overlayAbierto) document.body.classList.remove('td-abierto');
    if (overlay.id === 'td-ficha') {
      fichaActual = null;
      limpiarUrlProducto();
    }
    var destino = (FOCO_ORIGEN && document.contains(FOCO_ORIGEN)) ? FOCO_ORIGEN : FOCO_ABIERTO;
    if (destino && document.contains(destino)) {
      try { destino.focus(); } catch (e) { /* el foco se fue con el nodo */ }
    }
    FOCO_ABIERTO = null;
    FOCO_ORIGEN = null;
  }

  function alTeclear(e) {
    if (e.key === 'Escape' && overlayAbierto) {
      e.preventDefault();
      cerrarOverlay(overlayAbierto);
      return;
    }
    if (e.key !== 'Tab' || !overlayAbierto) return;
    var lista = Array.prototype.filter.call(
      overlayAbierto.querySelectorAll(FOCABLES),
      function (n) { return n.offsetParent !== null || n === document.activeElement; }
    );
    if (!lista.length) return;
    var primero = lista[0];
    var ultimo = lista[lista.length - 1];
    if (e.shiftKey && document.activeElement === primero) {
      e.preventDefault();
      ultimo.focus();
    } else if (!e.shiftKey && document.activeElement === ultimo) {
      e.preventDefault();
      primero.focus();
    }
  }

  document.addEventListener('keydown', alTeclear);

  /* Clic en el velo (fuera del panel) cierra. */
  function cerrarAlVelo(overlay) {
    overlay.addEventListener('mousedown', function (e) {
      if (e.target === overlay) cerrarOverlay(overlay);
    });
  }

  /* ============================================================
     Avisos
     ============================================================ */
  function anunciar(texto) {
    var n = $('td-aviso-rol');
    if (!n) return;
    n.textContent = '';
    window.setTimeout(function () { n.textContent = texto; }, 40);
  }

  function toast(texto, textoEnlace, alHacerClic) {
    var host = $('td-toasts');
    if (!host) return;
    var t = el('div', 'td-toast');
    t.appendChild(el('span', null, texto));
    if (textoEnlace) {
      var a = el('a', null, textoEnlace);
      a.href = '#carrito';
      a.addEventListener('click', function (e) {
        e.preventDefault();
        abrirCarrito();
      });
      t.appendChild(a);
    }
    host.appendChild(t);
    window.setTimeout(function () {
      t.classList.add('td-toast--saliendo');
      window.setTimeout(function () {
        if (t.parentNode) t.parentNode.removeChild(t);
      }, 240);
    }, 3400);
  }

  /* ============================================================
     Estado en vivo
     ============================================================ */
  var filtroCategoria = 'todo';
  var soloMio = false;
  var fichaActual = null;

  function nivel() { return C.nivelSesion(); }
  function conSesion() { return C.tieneSesion(); }

  /* ============================================================
     ANUNCIO y HERO
     ============================================================ */
  function pintarAnuncio() {
    var n = $('td-anuncio');
    if (!n) return;
    n.textContent = C.esSenior() ? UI.anuncioSenior : UI.anuncio;
  }

  function pintarChip() {
    var chip = $('tienda-chip');
    if (!chip) return;
    if (conSesion()) {
      var n = nivel();
      chip.setAttribute('data-nivel', D.nivelDe(n));
      chip.textContent = D.nivelNombre(n) + ' · demo';
      chip.hidden = false;
    } else {
      chip.hidden = true;
      chip.textContent = '';
    }
  }

  function pintarHero() {
    var n = $('td-hero-estado');
    if (!n) return;
    vaciar(n);
    if (conSesion()) {
      var nivelActual = nivel();
      var abiertos = D.productos.filter(function (p) {
        return D.desbloqueado(p, nivelActual) && !D.esAgotado(p, C.stock(p));
      }).length;
      var chip = el('span', 'td-chip', D.nivelNombre(nivelActual));
      chip.setAttribute('data-nivel', D.nivelDe(nivelActual));
      n.appendChild(chip);
      n.appendChild(el('span', null, 'Tienes ' + abiertos + ' productos desbloqueados de ' + D.productos.length));
      var a = el('a', null, 'Ver productos');
      a.href = '#catalogo';
      n.appendChild(a);
    } else {
      n.appendChild(el('span', null, UI.hero.sinSesion));
      var b = el('a', null, UI.hero.sinSesionCta);
      b.href = '#';
      b.id = 'td-hero-entrar';
      b.addEventListener('click', function (e) {
        e.preventDefault();
        abrirAcceso();
      });
      n.appendChild(b);
    }
  }

  /* ============================================================
     BARRA: categorías y toggle
     ============================================================ */
  function pintarCategorias() {
    var host = $('td-cats');
    if (!host) return;
    vaciar(host);
    D.categorias.forEach(function (cat) {
      var b = el('button', 'td-cat', cat.nombre);
      b.type = 'button';
      b.id = 'td-cat-' + cat.id;
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-selected', filtroCategoria === cat.id ? 'true' : 'false');
      b.addEventListener('click', function () {
        filtroCategoria = cat.id;
        pintarCategorias();
        pintarCatalogo();
      });
      host.appendChild(b);
    });
  }

  function pintarToggle() {
    var t = $('td-solo-mio');
    if (t) t.checked = soloMio;
  }

  /* ============================================================
     BANNER del producto estrella
     ============================================================ */
  function pintarBanner() {
    var banner = $('td-banner');
    if (!banner) return;
    vaciar(banner);
    var p = D.productoEstrella(nivel());
    banner.setAttribute('data-nivel', D.nivelDe(p.nivel));

    var cuerpo = el('div', 'td-banner__body');
    cuerpo.appendChild(el('p', 'td-banner__eyebrow', UI.banner.etiqueta + ' · ' + D.nivelNombre(p.nivel)));

    var h2 = el('h2', 'td-banner__titulo');
    h2.id = 'td-banner-titulo';
    h2.textContent = 'Estrena tu nivel: ' + p.nombre;
    cuerpo.appendChild(h2);

    cuerpo.appendChild(el('p', 'td-banner__texto', p.descripcion));

    var precio = el('span', 'td-banner__precio', D.formatearPrecio(D.precioFinal(p, C.esSenior())));
    cuerpo.appendChild(precio);

    var fila = el('p', 'td-banner__fila');
    var cta = el('button', 'btn td-cta', UI.banner.cta);
    cta.type = 'button';
    cta.addEventListener('click', function () { agregarRapido(p.id); });
    fila.appendChild(cta);
    cuerpo.appendChild(fila);

    var foto = el('div', 'td-banner__foto');
    foto.appendChild(imagenPrecargada(p));
    banner.appendChild(cuerpo);
    banner.appendChild(foto);
  }

  /* ============================================================
     CATÁLOGO
     ============================================================ */
  function visibleEnCatalogo(p) {
    if (filtroCategoria !== 'todo' && p.categoria !== filtroCategoria) return false;
    if (soloMio && conSesion() && !D.desbloqueado(p, nivel())) return false;
    return true;
  }

  function pintarCatalogo() {
    var host = $('catalogo');
    if (!host) return;
    vaciar(host);

    D.NIVELES.forEach(function (idNivel, indice) {
      var productos = D.porNivel(indice).filter(visibleEnCatalogo);
      var seccion = el('section', 'td-seccion');
      seccion.id = 'nivel-' + idNivel;
      seccion.setAttribute('data-nivel', idNivel);

      /* Con filtro de categoría, las secciones sin productos no se pintan. */
      if (!productos.length) {
        seccion.hidden = true;
        host.appendChild(seccion);
        return;
      }
      seccion.hidden = false;

      seccion.appendChild(cabeceraNivel(indice, productos.length));

      if (filtroCategoria !== 'todo' && productos.length) {
        var completa = D.porNivel(indice).length;
        if (productos.length < completa) {
          seccion.appendChild(el('p', 'td-seccion__vacia',
            'En este nivel, ' + (completa - productos.length) + ' producto(s) fuera de la categoría.'));
        }
      }

      var grid = el('div', 'td-grid');
      /* Ritmo Duolingo: si sobran dos tarjetas al llenar filas de tres,
         esas dos ocupan media fila cada una y quedan más anchas. */
      var sobra = productos.length % 3 === 2;
      productos.forEach(function (p, i) {
        var ancho = sobra && i >= productos.length - 2;
        grid.appendChild(tarjeta(p, ancho));
      });
      seccion.appendChild(grid);
      host.appendChild(seccion);
    });
  }

  function cabeceraNivel(indice, cuantos) {
    var idNivel = D.NIVELES[indice];
    var head = el('div', 'td-seccion__head');

    var izq = el('div', 'td-seccion__id');
    var textos = el('div');
    var h2 = el('h2', 'td-seccion__nombre', D.nivelNombre(indice));
    h2.id = 'nivel-titulo-' + idNivel;
    textos.appendChild(h2);
    textos.appendChild(el('p', 'td-seccion__identidad',
      D.nivelIdentidad(indice) + ' · ' + cuantos + ' producto' + (cuantos === 1 ? '' : 's')));
    izq.appendChild(textos);

    var chip = el('span', 'td-chip', D.nivelNombre(indice));
    chip.setAttribute('data-nivel', idNivel);
    izq.appendChild(chip);
    head.appendChild(izq);

    var nivelActual = nivel();
    var estado = el('div', 'td-seccion__estado');
    if (nivelActual !== null && nivelActual >= indice) {
      estado.className = 'td-seccion__estado td-seccion__estado--listo';
      estado.appendChild(el('span', null, UI.secciones.desbloqueado));
    } else {
      estado.className = 'td-seccion__estado td-seccion__estado--falta';
      var faltan = nivelActual === null ? indice : indice - nivelActual;
      estado.appendChild(el('span', null, UI.secciones.faltan(faltan)));
      var a = el('a', null, UI.secciones.verSubir);
      a.href = 'perfil.html#retos';
      estado.appendChild(a);
    }
    head.appendChild(estado);
    return head;
  }

  function tarjeta(p, ancho) {
    var nivelActual = nivel();
    var bloqueado = nivelActual !== null && !D.desbloqueado(p, nivelActual);
    var agotado = C.stock(p) <= 0;

    var card = el('article', 'td-card');
    if (ancho) card.classList.add('td-card--ancho');
    card.setAttribute('data-nivel', D.nivelDe(p.nivel));
    card.setAttribute('data-cat', p.categoria);
    card.setAttribute('data-producto', p.id);
    if (bloqueado) card.classList.add('td-card--bloqueado');
    if (agotado) card.classList.add('td-card--agotado');

    var foto = el('div', 'td-card__foto');

    /* Badge: AGOTADO pisa a los demás; luego "Nuevo"; y si quedan 5 o
       menos unidades, "Últimas unidades". */
    if (agotado) {
      foto.appendChild(el('span', 'td-badge td-badge--agotado', UI.card.agotado));
    } else if (p.badge === 'nuevo') {
      foto.appendChild(el('span', 'td-badge td-badge--nuevo', UI.card.nuevo));
    } else if (C.stock(p) <= 5) {
      foto.appendChild(el('span', 'td-badge td-badge--ultimas', UI.card.ultimas));
    }

    if (bloqueado) {
      var lock = el('span', 'td-card__lock', '🔒');
      lock.setAttribute('aria-label', 'Producto bloqueado, se desbloquea en ' + D.nivelNombre(p.nivel));
      foto.appendChild(lock);
    }

    foto.appendChild(imagenProducto(p));
    card.appendChild(foto);

    var body = el('div', 'td-card__body');
    var h3 = el('h3', 'td-card__nombre', p.nombre);
    body.appendChild(h3);

    var precio = el('p', 'td-card__precio');
    if (bloqueado) {
      precio.appendChild(el('span', null, UI.card.desde + ' ' + D.nivelNombre(p.nivel)));
    } else if (C.esSenior()) {
      var s = el('s', null, D.formatearPrecio(p.precio));
      precio.appendChild(s);
      precio.appendChild(el('span', null, D.formatearPrecio(D.precioFinal(p, true))));
      precio.appendChild(el('span', 'td-card__nota', UI.card.descuento));
    } else if (agotado) {
      precio.appendChild(el('span', null, D.formatearPrecio(p.precio)));
    } else {
      precio.appendChild(el('span', null, D.formatearPrecio(p.precio)));
    }
    body.appendChild(precio);

    if (!bloqueado) body.appendChild(el('p', 'td-card__desc', p.descripcion));
    if (D.tieneTallas(p)) body.appendChild(el('p', 'td-card__desc', 'Tallas S a XL · unisex'));
    card.appendChild(body);

    if (bloqueado) {
      /* La tarjeta bloqueada sí se abre: la ficha explica cómo subir. */
      card.tabIndex = 0;
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', p.nombre + ', bloqueado. Se desbloquea en ' + D.nivelNombre(p.nivel));
      card.addEventListener('click', function () { abrirFicha(p.id); });
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          abrirFicha(p.id);
        }
      });
      return card;
    }

    if (D.tieneTallas(p)) {
      card.appendChild(el('span', 'td-card--talla', 'Elige talla'));
    }

    if (!agotado) {
      var add = el('button', 'td-card__add', '+');
      add.type = 'button';
      var etiqueta = D.tieneTallas(p)
        ? UI.card.verFicha + ': ' + p.nombre
        : UI.card.agregar + ': ' + p.nombre;
      add.setAttribute('aria-label', etiqueta);
      add.addEventListener('click', function () { agregarRapido(p.id, add); });
      card.appendChild(add);
    }

    return card;
  }

  /* ============================================================
     Agregar desde la tarjeta
     ============================================================ */
  function agregarRapido(id, origen) {
    var p = D.buscar(id);
    if (!p) return;
    if (!conSesion()) {
      abrirAcceso(null, origen);
      return;
    }
    /* Con tallas siempre pasa por la ficha: no se adivina la talla. */
    if (D.tieneTallas(p)) {
      abrirFicha(id, null, origen);
      return;
    }
    var r = C.agregar(id, '', 1);
    if (!r.ok) {
      if (r.motivo === 'nivel') abrirFicha(id);
      else if (r.motivo === 'agotado') toast(UI.ficha.agotado);
      else toast(UI.ficha.muy(D.config.maxPorProducto));
      return;
    }
    rebotarContador();
    toast(UI.toasts.agregado, UI.toasts.verCarrito);
    anunciar(UI.barra.unidadesEnCarrito(C.resumen().unidades));
  }

  /* ============================================================
     Contador del carrito
     ============================================================ */
  function pintarContador() {
    var r = C.resumen();
    ['td-contador', 'td-contador-flotante'].forEach(function (id) {
      var n = $(id);
      if (!n) return;
      n.textContent = String(r.unidades);
      n.hidden = r.unidades === 0;
    });
    var btn = $('td-carrito-btn');
    if (btn) {
      btn.setAttribute('aria-label', r.unidades === 0
        ? 'Abrir carrito, vacío'
        : 'Abrir carrito, ' + UI.barra.unidadesEnCarrito(r.unidades));
    }
    var flot = $('td-flotante');
    if (flot) {
      flot.setAttribute('aria-label', r.unidades === 0
        ? 'Abrir carrito, vacío'
        : 'Abrir carrito, ' + UI.barra.unidadesEnCarrito(r.unidades));
    }
  }

  function rebotarContador() {
    ['td-contador', 'td-contador-flotante'].forEach(function (id) {
      var n = $(id);
      if (!n || n.hidden) return;
      n.classList.remove('td-rebote');
      /* reflow para que la animación vuelva a empezar */
      void n.offsetWidth;
      n.classList.add('td-rebote');
    });
  }

  /* ============================================================
     FICHA rápida
     ============================================================ */
  var fichaState = { talla: '', cantidad: 1 };

  function abrirFicha(id, opciones, origen) {
    var p = D.buscar(id);
    if (!p) return;
    fichaActual = p.id;
    fichaState.talla = '';
    fichaState.cantidad = 1;
    renderFicha(opciones);
    /* ?producto=<id> para poder compartir la ficha. */
    try {
      var url = new URL(window.location.href);
      url.searchParams.set('producto', p.id);
      window.history.replaceState({}, '', url);
    } catch (e) { /* file:// o historial bloqueado */ }
    abrirOverlay($('td-ficha'), $('td-ficha-panel').querySelector('.td-ficha__close'), origen);
  }

  function cerrarFicha() {
    cerrarOverlay($('td-ficha'));
  }

  function renderFicha(opciones) {
    if (!fichaActual) return;
    var p = D.buscar(fichaActual);
    if (!p) return;
    var panel = $('td-ficha-panel');
    vaciar(panel);

    var nivelActual = nivel();
    var bloqueado = nivelActual !== null && !D.desbloqueado(p, nivelActual);
    var agotado = C.stock(p) <= 0;
    var stock = C.stock(p);
    var yaEnCarrito = C.unidadesDe(p.id);
    var cupo = Math.max(0, Math.min(D.config.maxPorProducto, stock) - yaEnCarrito);
    if (fichaState.cantidad > Math.max(1, cupo)) fichaState.cantidad = Math.max(1, cupo);

    var cerrar = el('button', 'td-ficha__close');
    cerrar.type = 'button';
    cerrar.setAttribute('aria-label', UI.ficha.cierre);
    cerrar.appendChild(el('span', null, '×')).setAttribute('aria-hidden', 'true');
    cerrar.addEventListener('click', cerrarFicha);
    panel.appendChild(cerrar);

    var grid = el('div', 'td-ficha__grid');
    grid.setAttribute('data-nivel', D.nivelDe(p.nivel));

    /* ---- Izquierda: la foto ---- */
    var foto = el('div', 'td-ficha__foto');
    foto.appendChild(imagenPrecargada(p));
    grid.appendChild(foto);

    /* ---- Derecha: los datos ---- */
    var body = el('div', 'td-ficha__body');

    var chip = el('span', 'td-chip',
      bloqueado ? UI.ficha.desbloqueaEn + ' ' + D.nivelNombre(p.nivel) : D.nivelNombre(p.nivel));
    chip.setAttribute('data-nivel', D.nivelDe(p.nivel));
    body.appendChild(chip);

    var h2 = el('h2', 'td-ficha__nombre', p.nombre);
    h2.id = 'td-ficha-nombre';
    body.appendChild(h2);

    var precio = el('p', 'td-ficha__precio');
    if (C.esSenior() && !bloqueado) {
      precio.appendChild(el('s', null, D.formatearPrecio(p.precio)));
      precio.appendChild(document.createTextNode(' ' + D.formatearPrecio(D.precioFinal(p, true))));
      precio.appendChild(el('span', 'td-card__nota', UI.card.descuento));
    } else {
      precio.appendChild(document.createTextNode(D.formatearPrecio(D.precioFinal(p, bloqueado ? false : C.esSenior()))));
    }
    body.appendChild(precio);

    body.appendChild(el('p', 'td-ficha__desc', p.descripcion));

    /* ---- Tallas ---- */
    if (D.tieneTallas(p)) {
      body.appendChild(el('p', 'td-label', 'Talla'));
      var grupo = el('div', 'td-tallas');
      p.tallas.forEach(function (t) {
        var b = el('button', 'td-talla', t);
        b.type = 'button';
        b.setAttribute('aria-pressed', fichaState.talla === t ? 'true' : 'false');
        b.addEventListener('click', function () {
          fichaState.talla = t;
          renderFicha(opciones);
        });
        grupo.appendChild(b);
      });
      body.appendChild(grupo);

      var nota = el('p', 'td-tallas__nota', 'Unisex. ' + UI.ficha.notaNiveles);
      body.appendChild(nota);

      var btnGuia = el('button', 'td-guia-btn', UI.ficha.guiaTallas);
      btnGuia.type = 'button';
      btnGuia.setAttribute('aria-expanded', opciones && opciones.guia ? 'true' : 'false');
      btnGuia.setAttribute('aria-controls', 'td-guia-tallas');
      btnGuia.addEventListener('click', function () {
        renderFicha({ guia: !(opciones && opciones.guia) });
      });
      body.appendChild(btnGuia);
      body.appendChild(guiaTallas(opciones && opciones.guia));
    }

    /* ---- Cantidad ---- */
    if (!bloqueado && !agotado) {
      var fila = el('div');
      fila.appendChild(el('p', 'td-label', UI.ficha.cantidad));
      var caja = el('div', 'td-cantidad');
      var menos = el('button', 'td-step', '−');
      menos.type = 'button';
      menos.setAttribute('aria-label', 'Quitar una unidad');
      menos.disabled = fichaState.cantidad <= 1;
      menos.addEventListener('click', function () {
        fichaState.cantidad -= 1;
        renderFicha(opciones);
      });
      var valor = el('span', 'td-cantidad__valor', String(fichaState.cantidad));
      var mas = el('button', 'td-step', '+');
      mas.type = 'button';
      mas.setAttribute('aria-label', 'Agregar una unidad');
      mas.disabled = fichaState.cantidad >= Math.max(1, cupo);
      mas.addEventListener('click', function () {
        fichaState.cantidad += 1;
        renderFicha(opciones);
      });
      caja.appendChild(menos);
      caja.appendChild(valor);
      caja.appendChild(mas);
      fila.appendChild(caja);

      var limites = el('p', 'td-campo__ayuda');
      limites.textContent = UI.ficha.muy(D.config.maxPorProducto) +
        (yaEnCarrito > 0 ? ' · ya tienes ' + yaEnCarrito : '');
      fila.appendChild(limites);
      body.appendChild(fila);
    }

    /* ---- Botón principal, con sus cuatro estados ---- */
    body.appendChild(botonPrincipal(p, bloqueado, agotado, cupo));

    /* ---- Notas con iconos ---- */
    var notas = el('ul', 'td-notas');
    [
      '📍 ' + UI.ficha.notaRecogida + ' (' + hoyCorta() + ' → ' + C.fechaCorta(C.fechaRecogida()) + ')',
      '💵 ' + UI.ficha.notaPago,
      '🔒 Los de niveles superiores se desbloquean subiendo de nivel'
    ].forEach(function (t) {
      notas.appendChild(el('li', null, t));
    });
    body.appendChild(notas);

    grid.appendChild(body);
    panel.appendChild(grid);
  }

  function botonPrincipal(p, bloqueado, agotado, cupo) {
    var b;

    if (!conSesion()) {
      var caja = el('div', 'td-bloqueo');
      caja.appendChild(el('p', 'td-bloqueo__titulo', UI.ficha.necesitaSesion));
      b = el('button', 'btn td-cta', UI.hero.sinSesionCta);
      b.type = 'button';
      b.addEventListener('click', function () {
        cerrarFicha();
        abrirAcceso();
      });
      caja.appendChild(b);
      return caja;
    }

    if (bloqueado) {
      var bloqueada = el('div', 'td-bloqueo');
      bloqueada.appendChild(el('p', 'td-bloqueo__titulo', UI.ficha.desbloqueaEn + ' ' + D.nivelNombre(p.nivel)));
      b = el('button', 'btn td-cta', UI.ficha.desbloqueaEn + ' ' + D.nivelNombre(p.nivel));
      b.type = 'button';
      b.disabled = true;
      bloqueada.appendChild(b);
      var a = el('a', null, UI.secciones.verSubir);
      a.href = 'perfil.html#retos';
      bloqueada.appendChild(a);
      return bloqueada;
    }

    if (agotado) {
      var agotadoBox = el('div', 'td-bloqueo');
      agotadoBox.appendChild(el('p', 'td-bloqueo__titulo', UI.ficha.agotado));
      b = el('button', 'btn td-cta', UI.ficha.agotado);
      b.type = 'button';
      b.disabled = true;
      agotadoBox.appendChild(b);
      return agotadoBox;
    }

    if (D.tieneTallas(p) && !fichaState.talla) {
      var faltaTalla = el('div', 'td-bloqueo');
      faltaTalla.appendChild(el('p', 'td-bloqueo__titulo', UI.ficha.eligeTalla));
      b = el('button', 'btn td-cta', UI.ficha.eligeTalla);
      b.type = 'button';
      b.disabled = true;
      b.id = 'td-ficha-agregar';
      faltaTalla.appendChild(b);
      return faltaTalla;
    }

    if (cupo <= 0) {
      var tope = el('div', 'td-bloqueo');
      tope.appendChild(el('p', 'td-bloqueo__titulo', UI.ficha.muy(D.config.maxPorProducto)));
      b = el('button', 'btn td-cta', 'Ya tienes el máximo');
      b.type = 'button';
      b.disabled = true;
      tope.appendChild(b);
      return tope;
    }

    b = el('button', 'btn td-cta', UI.ficha.agregar);
    b.type = 'button';
    b.id = 'td-ficha-agregar';
    b.addEventListener('click', function () {
      var r = C.agregar(p.id, fichaState.talla, fichaState.cantidad);
      if (!r.ok) {
        if (r.motivo === 'tope') toast(UI.ficha.muy(D.config.maxPorProducto));
        else if (r.motivo === 'agotado') toast(UI.ficha.agotado);
        return;
      }
      cerrarFicha();
      rebotarContador();
      toast(UI.toasts.agregado, UI.toasts.verCarrito);
      anunciar(UI.barra.unidadesEnCarrito(C.resumen().unidades));
    });
    return b;
  }

  function guiaTallas(abierto) {
    var g = D.guiaTallas;
    var caja = el('div', 'td-guia');
    caja.id = 'td-guia-tallas';
    caja.hidden = !abierto;

    var tabla = el('table');
    var caption = el('caption', null, g.titulo);
    tabla.appendChild(caption);

    var thead = el('thead');
    var trh = el('tr');
    g.columnas.forEach(function (c) {
      var th = el('th', null, c);
      th.setAttribute('scope', 'col');
      trh.appendChild(th);
    });
    thead.appendChild(trh);
    tabla.appendChild(thead);

    var tbody = el('tbody');
    g.filas.forEach(function (f) {
      var tr = el('tr');
      [f.talla, f.pecho, f.largo].forEach(function (valor, i) {
        var celda = el(i === 0 ? 'th' : 'td', null, valor);
        if (i === 0) celda.setAttribute('scope', 'row');
        tr.appendChild(celda);
      });
      tbody.appendChild(tr);
    });
    tabla.appendChild(tbody);
    caja.appendChild(tabla);
    caja.appendChild(el('p', 'td-guia__nota', g.nota));
    return caja;
  }

  /* ============================================================
     CARRITO
     ============================================================ */
  function abrirCarrito() {
    renderCarrito();
    abrirOverlay($('td-carrito'), $('td-carrito-cerrar'));
  }

  function renderCarrito() {
    var r = C.resumen();
    var body = $('td-carrito-body');
    var foot = $('td-carrito-foot');
    vaciar(body);
    vaciar(foot);

    if (r.vacio) {
      var vacio = el('div', 'td-vacio');
      vacio.appendChild(el('div', 'td-vacio__arte', '🛍')).setAttribute('aria-hidden', 'true');
      vacio.appendChild(el('p', 'td-vacio__titulo', UI.carrito.vacioTitulo));
      vacio.appendChild(el('p', 'td-vacio__texto', UI.carrito.vacioTexto));
      var b = el('button', 'btn td-cta', UI.carrito.verProductos);
      b.type = 'button';
      b.addEventListener('click', function () {
        cerrarOverlay($('td-carrito'));
        var cat = $('catalogo');
        if (cat) cat.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      vacio.appendChild(b);
      body.appendChild(vacio);
      return;
    }

    r.items.forEach(function (x) { body.appendChild(filaItem(x)); });

    var t = el('div', 'td-totales');
    t.appendChild(filaTotal(UI.carrito.subtotal, D.formatearPrecio(r.subtotal)));
    if (r.descuento > 0) {
      var d = filaTotal(UI.carrito.descuento, '− ' + D.formatearPrecio(r.descuento));
      d.classList.add('td-totales__fila--desc');
      t.appendChild(d);
    }
    var tot = filaTotal(UI.carrito.total, D.formatearPrecio(r.total));
    tot.classList.add('td-totales__fila--total');
    t.appendChild(tot);
    t.appendChild(el('p', 'td-totales__envio', UI.carrito.envio));
    body.appendChild(t);

    if (r.problemas > 0) {
      var aviso = el('div', 'td-item__aviso', UI.carrito.problemas);
      aviso.id = 'td-carrito-problemas';
      body.appendChild(aviso);
    }

    var ir = el('button', 'btn td-cta', UI.carrito.checkout);
    ir.type = 'button';
    ir.id = 'td-ir-checkout';
    ir.disabled = !r.listo;
    if (!r.listo) ir.setAttribute('aria-describedby', 'td-carrito-problemas');
    ir.addEventListener('click', function () {
      window.location.href = 'checkout.html';
    });
    foot.appendChild(ir);

    var seguir = el('a', null, UI.carrito.seguir);
    seguir.href = '#catalogo';
    seguir.className = 'td-item__quitar';
    seguir.addEventListener('click', function () { cerrarOverlay($('td-carrito')); });
    foot.appendChild(seguir);
  }

  function filaTotal(etiqueta, valor) {
    var f = el('div', 'td-totales__fila');
    f.appendChild(el('span', null, etiqueta));
    f.appendChild(el('span', null, valor));
    return f;
  }

  function filaItem(x) {
    var p = x.producto;
    var item = el('div', 'td-item');
    item.setAttribute('data-nivel', D.nivelDe(p.nivel));
    if (!x.ok) item.classList.add('td-item--mal');

    var foto = el('div', 'td-item__foto');
    foto.appendChild(imagenProducto(p));
    item.appendChild(foto);

    var info = el('div', 'td-item__info');
    info.appendChild(el('p', 'td-item__nombre', p.nombre));

    var meta = el('p', 'td-item__meta');
    if (x.talla) {
      meta.appendChild(document.createTextNode('Talla ' + x.talla + ' · '));
    }
    if (C.esSenior()) {
      meta.appendChild(el('s', null, D.formatearPrecio(p.precio)));
      meta.appendChild(document.createTextNode(' ' + D.formatearPrecio(x.unitario) + ' c/u'));
    } else {
      meta.appendChild(document.createTextNode(D.formatearPrecio(x.unitario) + ' c/u'));
    }
    info.appendChild(meta);

    var pie = el('div', 'td-item__pie');

    var step = el('div', 'td-mini-step');
    var menos = el('button', 'td-step', '−');
    menos.type = 'button';
    menos.setAttribute('aria-label', 'Quitar una unidad de ' + p.nombre);
    menos.disabled = x.cantidad <= 1;
    menos.addEventListener('click', function () {
      if (x.cantidad <= 1) C.quitar(p.id, x.talla);
      else C.cambiar(p.id, x.talla, x.cantidad - 1);
      renderCarrito();
    });
    var valor = el('span', 'td-mini-step__valor', String(x.cantidad));
    var mas = el('button', 'td-step', '+');
    mas.type = 'button';
    mas.setAttribute('aria-label', 'Agregar una unidad de ' + p.nombre);
    var cupo = Math.max(0, Math.min(D.config.maxPorProducto, x.stock) - C.unidadesDe(p.id) + x.cantidad);
    mas.disabled = cupo <= 0;
    mas.addEventListener('click', function () {
      C.cambiar(p.id, x.talla, x.cantidad + 1);
      renderCarrito();
    });
    step.appendChild(menos);
    step.appendChild(valor);
    step.appendChild(mas);
    pie.appendChild(step);

    var quitar = el('button', 'td-item__quitar', 'Quitar');
    quitar.type = 'button';
    quitar.addEventListener('click', function () {
      C.quitar(p.id, x.talla);
      renderCarrito();
      toast(UI.toasts.quitado);
    });
    pie.appendChild(quitar);
    info.appendChild(pie);

    if (x.problemas.indexOf('nivel') > -1) {
      var aNivel = el('p', 'td-item__aviso', UI.carrito.sinNivel + ' · ' + D.nivelNombre(p.nivel));
      info.appendChild(aNivel);
    } else if (x.problemas.indexOf('agotado') > -1 || x.problemas.indexOf('stock') > -1) {
      info.appendChild(el('p', 'td-item__aviso', UI.carrito.sinStock + ': quítalo para continuar'));
    }

    item.appendChild(info);
    item.appendChild(el('p', 'td-item__precio', D.formatearPrecio(x.subtotal)));
    return item;
  }

  /* ============================================================
     ACCESO / modo demo
     ============================================================ */
  function abrirAcceso(opciones, origen) {
    renderAcceso(opciones);
    abrirOverlay($('td-acceso'), $('td-acceso-entrar'), origen);
  }

  /* Elige nivel y abre sesión, igual que Fogatas y Casos: se escribe
     { name, level } en zag_session y la tienda se entera por el evento. */
  function renderAcceso() {
    var box = $('td-acceso-box');
    if (!box) return;
    vaciar(box);

    var selBox = el('div', 'td-acceso__selector');
    selBox.appendChild(el('p', 'td-label', 'Elige tu nivel para esta demo'));
    var sel = document.createElement('select');
    sel.id = 'td-acceso-nivel';
    sel.setAttribute('aria-label', 'Nivel de la sesión demo');
    D.NIVELES.forEach(function (id, i) {
      var opt = document.createElement('option');
      opt.value = id;
      opt.textContent = D.nivelNombre(i) + ' · ' + D.nivelIdentidad(i);
      sel.appendChild(opt);
    });
    selBox.appendChild(sel);
    box.appendChild(selBox);

    var entrar = el('button', 'btn td-cta', UI.acceso.cta);
    entrar.type = 'button';
    entrar.id = 'td-acceso-entrar';
    entrar.addEventListener('click', function () {
      escribirDemo(sel.value);
      cerrarOverlay($('td-acceso'));
    });
    box.appendChild(entrar);

    var actual = $('td-acceso-actual');
    if (actual && conSesion()) {
      var salir = el('button', 'td-item__quitar', 'Cambiar o salir de la sesión demo');
      salir.type = 'button';
      salir.addEventListener('click', function () {
        try { window.ZAG_SESSION.clear(); } catch (e) { /* sin storage */ }
        C.emitir();
        render();
        cerrarOverlay($('td-acceso'));
      });
      box.appendChild(salir);
    }
  }

  function escribirDemo(level) {
    try {
      window.ZAG_SESSION.write({ name: 'Perfil demo ZAG', level: level });
    } catch (e) { /* sin storage */ }
    C.emitir();
    render();
    anunciar('Perfil demo activado como ' + D.nivelNombre(D.nivelIndexDe(level)) +
      '. Ya puedes comprar lo de tu nivel y de los anteriores.');
    document.dispatchEvent(new CustomEvent('zag:sesion'));
  }

  /* ============================================================
     MIS PEDIDOS
     ============================================================ */
  function pintarPedidos() {
    var seccion = $('pedidos');
    var lista = $('td-pedidos-lista');
    if (!seccion || !lista) return;

    var datos = C.pedidos();
    if (!conSesion() || !datos.length) {
      seccion.hidden = true;
      vaciar(lista);
      return;
    }
    seccion.hidden = false;
    vaciar(lista);

    datos.forEach(function (p) {
      lista.appendChild(tarjetaPedido(p));
    });
  }

  function tarjetaPedido(p) {
    var tarjeta = el('article', 'td-pedido');

    if (p.estado === 'cancelado') {
      tarjeta.classList.add('td-pedido--cancelado');
      tarjeta.appendChild(el('p', 'td-pedido__cancelado', UI.pedidos.cancelado));
    }

    var head = el('div', 'td-pedido__head');
    var izq = el('div');
    var etiqueta = el('p', 'td-pedido__etiqueta', UI.pedidos.codigo);
    izq.appendChild(etiqueta);
    izq.appendChild(el('h3', 'td-pedido__codigo', p.codigo));
    izq.appendChild(el('p', 'td-pedido__fecha', fechaPedido(p.fecha)));
    head.appendChild(izq);

    if (p.estado !== 'cancelado') head.appendChild(lineaEstado(p.estado));
    tarjeta.appendChild(head);

    var items = el('ul', 'td-pedido__items');
    (p.items || []).forEach(function (it) {
      var li = el('li');
      var texto = it.nombre + (it.talla ? ' · ' + it.talla : '') + ' ×' + it.cantidad;
      li.appendChild(el('span', null, texto));
      li.appendChild(el('b', null, D.formatearPrecio(it.subtotal)));
      items.appendChild(li);
    });
    tarjeta.appendChild(items);

    var recogida = el('p', 'td-pedido__recogida');
    recogida.appendChild(el('span', null, UI.pedidos.recoge + ' '));
    recogida.appendChild(el('b', null, C.fechaLarga(p.fechaRecogida)));
    if (p.estado !== 'cancelado') {
      var w = el('span', null, UI.pedidos.lugar + ': ');
      w.appendChild(el('b', null, D.config.lugarRecogida));
      recogida.appendChild(w);
      recogida.appendChild(el('span', null, UI.pedidos.horario + ': ' + D.config.horarioRecogida));
    }
    tarjeta.appendChild(recogida);

    var total = el('p', 'td-pedido__total');
    total.appendChild(el('span', null, UI.carrito.total));
    total.appendChild(el('span', null, D.formatearPrecio(p.total)));
    tarjeta.appendChild(total);

    if (p.estado !== 'cancelado') {
      var acciones = el('div', 'td-pedido__acciones');

      var cal = el('a', 'btn btn--sm', UI.pedidos.calendario);
      cal.href = C.urlCalendario(p);
      cal.target = '_blank';
      cal.rel = 'noopener';
      acciones.appendChild(cal);

      if (p.estado === 'preparacion') {
        var cancelar = el('button', 'btn btn--sm td-btn-claro', UI.pedidos.cancelar);
        cancelar.type = 'button';
        cancelar.addEventListener('click', function () { confirmarCancelar(tarjeta, p.codigo); });
        acciones.appendChild(cancelar);
      }

      var avanzar = el('button', 'td-item__quitar', UI.pedidos.avanzar);
      avanzar.type = 'button';
      avanzar.addEventListener('click', function () {
        C.avanzarPedido(p.codigo);
      });
      acciones.appendChild(avanzar);
      tarjeta.appendChild(acciones);
    }

    return tarjeta;
  }

  function fechaPedido(iso) {
    try {
      var d = new Date(iso);
      return d.toLocaleDateString('es-CO', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: D.config.zonaHoraria
      });
    } catch (e) {
      return String(iso).slice(0, 10);
    }
  }

  /* Confirmación en línea, sin window.confirm. */
  function confirmarCancelar(tarjeta, codigo) {
    var acciones = tarjeta.querySelector('.td-pedido__acciones');
    if (!acciones) return;
    var caja = el('p', 'td-pedido__confirma');
    caja.appendChild(el('span', null, UI.pedidos.cancelarPregunta));

    var si = el('button', 'btn btn--sm td-cta', UI.pedidos.cancelarSi);
    si.type = 'button';
    si.addEventListener('click', function () {
      C.cancelarPedido(codigo);
      toast(UI.toasts.pedidoListo);
    });
    caja.appendChild(si);

    var no = el('button', 'td-item__quitar', UI.pedidos.cancelarNo);
    no.type = 'button';
    no.addEventListener('click', function () {
      if (caja.parentNode) caja.parentNode.removeChild(caja);
    });
    caja.appendChild(no);

    tarjeta.insertBefore(caja, acciones);
    si.focus();
  }

  function lineaEstado(estado) {
    var caja = el('div', 'td-estado');
    var i = C.ESTADOS.indexOf(estado);
    C.ESTADOS.forEach(function (id, n) {
      if (n > 0) {
        var raya = el('span', 'td-estado__raya');
        raya.setAttribute('aria-hidden', 'true');
        if (n <= i) raya.classList.add('td-estado__raya--hecho');
        caja.appendChild(raya);
      }
      var paso = el('span', 'td-estado__paso');
      if (n < i) paso.classList.add('td-estado__paso--hecho');
      if (n === i) paso.classList.add('td-estado__paso--hecho', 'td-estado__paso--actual');
      paso.appendChild(el('span', 'td-estado__punto'));
      paso.appendChild(document.createTextNode(C.ESTADO_TEXTO[id]));
      caja.appendChild(paso);
    });
    return caja;
  }

  /* ============================================================
     Render general
     ============================================================ */
  function render() {
    pintarAnuncio();
    pintarChip();
    pintarHero();
    pintarToggle();
    pintarBanner();
    pintarCatalogo();
    pintarPedidos();
    pintarContador();
    if (!$('td-carrito').hidden) renderCarrito();
    if (fichaActual) renderFicha();
  }

  /* ============================================================
     Sesión en vivo
     El modo demo del muro y los botones de nivel escriben la sesión
     desde fuera: aquí nos enteramos por el evento storage y por un
     listener propio, y redibujamos.
     ============================================================ */
  function vigilarSesion() {
    window.addEventListener('storage', function (e) {
      if (!e.key) {
        render();
        return;
      }
      if (e.key === 'zag_session' || e.key.indexOf('zag_') === 0) render();
    });
    document.addEventListener('zag:sesion', function () { render(); });
  }

  /* ============================================================
     Arranque
     ============================================================ */
  function init() {
    if (!D || !C) return;

    /* Si hay perfil pero ningun pedido, dejamos una compra de ejemplo. */
    if (C.tieneSesion() && !C.pedidos().length) C.sembrarPedidoDemo();

    pintarCategorias();
    render();

    var solo = $('td-solo-mio');
    if (solo) {
      solo.addEventListener('change', function () {
        soloMio = solo.checked;
        pintarCatalogo();
      });
    }

    $('td-carrito-btn').addEventListener('click', abrirCarrito);
    $('td-carrito-cerrar').addEventListener('click', function () { cerrarOverlay($('td-carrito')); });
    $('td-flotante').addEventListener('click', abrirCarrito);
    $('td-acceso-cerrar').addEventListener('click', function () { cerrarOverlay($('td-acceso')); });
    cerrarAlVelo($('td-carrito'));
    cerrarAlVelo($('td-ficha'));
    cerrarAlVelo($('td-acceso'));

    renderAcceso();

    var reset = $('td-reset-demo');
    if (reset) {
      reset.addEventListener('click', function () {
        C.reiniciarDemo();
        render();
        toast('Demo de tienda reiniciada');
      });
    }

    /* Enlace directo por hash: "Mis pedidos". */
    if (window.location.hash === '#pedidos') {
      window.setTimeout(function () {
        var s = $('pedidos');
        if (s && !s.hidden) s.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 120);
    }

    /* Ficha directa por ?producto=<id>. */
    var params = new URLSearchParams(window.location.search);
    var pid = params.get('producto');
    if (pid && D.buscar(pid)) {
      window.setTimeout(function () { abrirFicha(pid); }, 80);
    }

    vigilarSesion();
    C.suscribir(function () {
      pintarContador();
      pintarPedidos();
      pintarCatalogo();
      pintarHero();
      pintarBanner();
    });

    observarEntradas();
  }

  /* Fade al hacer scroll, apagado con prefers-reduced-motion. */
  function observarEntradas() {
    var tarjetas = document.querySelectorAll('.td-card');
    if (!tarjetas.length) return;
    if (!window.IntersectionObserver) {
      Array.prototype.forEach.call(tarjetas, function (t) { t.classList.add('td-card--visible'); });
      return;
    }
    var obs = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('td-card--visible');
        obs.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -40px 0px' });
    Array.prototype.forEach.call(tarjetas, function (t) { obs.observe(t); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();