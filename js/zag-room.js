/* ============================================================
   PORTAL ZAG — ZAG Room (zag-room.html)
   Interacción de la landing: hero y su píldora de estado, el
   estado en vivo del room, los tres usos, el mosaico con lightbox,
   las amenidades, el agendador (día → bloque → mapa de la semana),
   la tarjeta de resumen, la confirmación con el pase, los pases
   tipo ticket y la cancelación.

   La disponibilidad sale de js/zag-room-data.js y las reservas
   viven en localStorage bajo "zag_room_reservas", siempre con
   try/catch. Nada de lo que viene de datos se mete con innerHTML:
   todo es textContent.
   ============================================================ */

(function () {
  'use strict';

  var D = window.ZAG_ROOM;
  if (!D) {
    console.error('ZAG Room: no se encontró zag-room-data.js');
    return;
  }

  var SESSION = window.ZAG_SESSION;
  var UI = D.ui;
  var CFG = D.config;

  /* ============================================================
     Utilidades
     ============================================================ */

  function $(id) { return document.getElementById(id); }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  }

  function txt(id, valor) {
    var n = $(id);
    if (n) n.textContent = valor == null ? '' : valor;
    return n;
  }

  function tituloConColor(id, texto) {
    var n = $(id);
    if (!n) return;
    n.textContent = '';
    var partes = String(texto).split(/\{([^}]+)\}/);
    for (var i = 0; i < partes.length; i++) {
      if (i % 2 === 0) {
        n.appendChild(document.createTextNode(partes[i]));
      } else {
        n.appendChild(el('span', 'zr-highlight', partes[i]));
      }
    }
    n.style.color = 'var(--color-brand-deep)';
  }

  var SVG_NS = 'http://www.w3.org/2000/svg';

  /* Ícono de línea. El trazo es currentColor para que herede el
     color del contenedor. */
  function icono(pathD, tam) {
    var svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('width', String(tam || 24));
    svg.setAttribute('height', String(tam || 24));
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '1.8');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    var p = document.createElementNS(SVG_NS, 'path');
    p.setAttribute('d', pathD);
    svg.appendChild(p);
    return svg;
  }

  var ICONOS = {
    /* usos */
    book: 'M4 5c3-1.5 6-1.5 8 0v14c-2-1.5-5-1.5-8 0zM20 5c-3-1.5-6-1.5-8 0v14c2-1.5 5-1.5 8 0z',
    board: 'M3 4h18v12H3zM12 16v4M8 20h8M7 8h6M7 12h10',
    people: 'M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM3 20v-1a5 5 0 0 1 10 0v1M16 8a2.5 2.5 0 1 0 0-5M17 13a4 4 0 0 1 4 4v1',
    /* amenidades */
    wifi: 'M2.5 9a14 14 0 0 1 19 0M5.5 12.5a10 10 0 0 1 13 0M8.5 16a6 6 0 0 1 7 0M12 19.5h.01',
    proyector: 'M3 5h18v10H3zM8 19h8M12 15v4M7 9.5l2.5-2 2.5 2',
    cafe: 'M4 8h12v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4zM16 9h2a2 2 0 0 1 0 4h-2M6 3v2M10 3v2',
    tablero: 'M3 4h18v11H3zM7 20h10M12 15v5M7 8h5M7 11h8',
    lockers: 'M5 3h14v18H5zM12 3v18M9 12h.01M15 12h.01',
    poofs: 'M12 4c5 4 7 6.5 7 9a7 7 0 0 1-14 0c0-2.5 2-5 7-9zM5.5 12c3 1.5 10 1.5 13 0',
    /* reglas */
    nivel: 'M12 3l8 4v6c0 5-3.5 7.5-8 8-4.5-.5-8-3-8-8V7zM9 12l2 2 4-4',
    puesto: 'M7 10v7M17 10v7M4 17h16M7 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM17 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
    semana: 'M4 5h16v16H4zM4 10h16M9 3v4M15 3v4',
    anticipacion: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2',
    cancelar: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM9 9l6 6M15 9l-6 6',
    checkin: 'M3 5h18v14H3zM8 10h4M8 14h7M16 9.5a1 1 0 1 0 0 .01',
    mesa: 'M3 10h18M6 10v8M18 10v8M6 13h12',
  };

  /* ============================================================
     Estado
     ============================================================ */

  var state = {
    session: null,
    reservas: [],
    dia: null,
    bloque: null,
    confirmando: false,
    verAnteriores: false,
    cancelando: null,
  };

  /* ============================================================
     Persistencia
     ============================================================ */

  function leerReservas() {
    var crudo = null;
    try { crudo = window.localStorage.getItem(D.LS_RESERVAS); } catch (e) { /* sin storage */ }
    if (!crudo) return [];
    try {
      var arr = JSON.parse(crudo);
      if (!Array.isArray(arr)) return [];
      return arr.filter(function (r) {
        return r && typeof r === 'object' &&
          /^\d{4}-\d{2}-\d{2}$/.test(String(r.fechaISO || '')) &&
          !!D.bloquePorId(String(r.bloqueId || ''));
      });
    } catch (e) { /* corrupto */ }
    return [];
  }

  function guardarReservas() {
    try {
      window.localStorage.setItem(D.LS_RESERVAS, JSON.stringify(state.reservas));
    } catch (e) { /* sin storage: la demo sigue en memoria */ }
  }

  /* ============================================================
     Sesión y nivel
     ============================================================ */

  function nivelActual() {
    return state.session && state.session.level != null ? state.session.level : null;
  }

  function sinSesion() { return D.indiceNivel(nivelActual()) < 0; }

  function tieneAcceso() {
    var i = D.indiceNivel(nivelActual());
    return i >= 0 && i >= D.indiceNivel(CFG.nivelMinimo);
  }

  function nombreSesion() {
    return state.session && state.session.name ? String(state.session.name) : '';
  }

  /* Máximo de bloques de la semana según el nivel actual.
     null = ilimitado (SENIOR). */
  function maxSemanaActual() {
    return D.maxBloquesPara(nivelActual());
  }

  /* ============================================================
     Cálculos de reserva
     ============================================================ */

  function yaReservo(fechaISO, bloqueId) {
    return state.reservas.some(function (r) {
      return r.fechaISO === fechaISO && r.bloqueId === bloqueId;
    });
  }

  /* Reservas dentro de la semana calendario (lunes a domingo) de
     la fecha dada. El contador sigue la semana del bloque elegido,
     así que al reservar para la semana que viene muestra los
     bloques que llevas de ESA semana. */
  function reservasDeSemana(fechaISO) {
    var clave = D.claveSemana(fechaISO);
    return state.reservas.filter(function (r) {
      return D.claveSemana(r.fechaISO) === clave;
    });
  }

  function estadoCelda(fechaISO, bloque) {
    var hoy = D.hoyISO();
    var pasado = D.yaEmpezo(bloque, fechaISO, hoy);
    var mio = yaReservo(fechaISO, bloque.id);
    var libres = D.puestosLibres(fechaISO, bloque.id, state.reservas, hoy);
    return {
      pasado: pasado,
      mio: mio,
      libres: pasado ? 0 : libres,
      lleno: !pasado && !mio && libres === 0,
    };
  }

  /* Etiqueta de estado de un bloque. Además del color, el texto
     dice lo mismo: el color nunca es la única señal. */
  function etiquetaEstado(fechaISO, bloque) {
    var e = estadoCelda(fechaISO, bloque);
    if (e.pasado) return { texto: UI.estadoPaso, clase: '', tono: '' };
    if (e.mio) return { texto: UI.estadoTuReserva, clase: 'zr-bloque-estado--mio', tono: 'mio' };
    if (e.libres === 0) return { texto: UI.estadoLleno, clase: '', tono: 'lleno' };
    if (e.libres === 1) return { texto: UI.estadoUltimo, clase: 'zr-bloque-estado--pocos', tono: 'pocos' };
    if (e.libres === 2) return { texto: UI.estadoUltimos, clase: 'zr-bloque-estado--pocos', tono: 'pocos' };
    return { texto: UI.estadoDisponible, clase: 'zr-bloque-estado--libre', tono: 'libre' };
  }

  function textoLibres(n) {
    return String(n) + UI.deAforo;
  }

  /* Primer día con algún bloque por delante. Si hoy ya se terminó
     la jornada, arranca en el siguiente día hábil. */
  function primerDiaUtil(hoy) {
    var dias = D.diasReservables(hoy);
    for (var i = 0; i < dias.length; i++) {
      for (var j = 0; j < CFG.bloques.length; j++) {
        if (!D.yaEmpezo(CFG.bloques[j], dias[i].fechaISO, hoy)) return dias[i].fechaISO;
      }
    }
    return dias.length ? dias[0].fechaISO : hoy;
  }

  /* Por qué no se puede confirmar ahora mismo. La sesión va primero:
     sin perfil el bloqueo es de acceso, no de selección, y el botón
     tiene que poder llevar al bloque de acceso. */
  function motivoBloqueo() {
    if (sinSesion()) return 'sin-sesion';
    if (!tieneAcceso()) return 'nivel';
    if (!state.dia || !state.bloque) return 'sin-seleccion';
    var bloque = D.bloquePorId(state.bloque);
    if (!bloque) return 'sin-seleccion';
    var e = estadoCelda(state.dia, bloque);
    if (e.pasado) return 'pasado';
    if (e.mio) return 'mio';
    if (e.libres === 0) return 'lleno';
    var maxSem = maxSemanaActual();
    if (maxSem !== null && reservasDeSemana(state.dia).length >= maxSem) return 'max-semana';
    return null;
  }

  /* ============================================================
     Anuncios para lectores de pantalla
     ============================================================ */

  function anunciar(msg) {
    var live = $('zr-live');
    if (!live) return;
    live.textContent = '';
    window.setTimeout(function () { live.textContent = msg; }, 60);
  }

  /* ============================================================
     HERO
     ============================================================ */

  function renderHero() {
    txt('zr-hero-pill', D.hero.pill);

    var t = $('zr-hero-title');
    if (t) {
      t.textContent = D.hero.titleA;
      t.appendChild(el('span', 'zag-hero__title-accent', ' ' + D.hero.titleB));
    }

    txt('zr-hero-sub', D.hero.sub);
    txt('zr-hero-cta', D.hero.cta);
    renderEstadoHero();
  }

  function textoContadorSemana() {
    /* Sin selección se cuenta la semana de hoy; con selección, la
       del bloque elegido. */
    var ancla = state.dia || D.hoyISO();
    var n = reservasDeSemana(ancla).length;
    var maxSem = maxSemanaActual();
    return String(n) + '/' + (maxSem === null ? '∞' : String(maxSem));
  }

  function renderEstadoHero() {
    var host = $('zr-hero-estado');
    if (!host) return;
    host.textContent = '';
    host.classList.remove('zag-room-hero__estado--listo');

    if (sinSesion()) {
      host.appendChild(document.createTextNode(UI.estadoSinSesion + ' '));
      var b = el('button', 'zag-room-hero__demo', UI.estadoSinSesionCta);
      b.type = 'button';
      b.addEventListener('click', function () { abrirAcceso(b); });
      host.appendChild(b);
      return;
    }

    if (!tieneAcceso()) {
      var faltan = D.faltanNiveles(nivelActual());
      host.appendChild(document.createTextNode(
        UI.estadoBloqueado + String(faltan) + (faltan === 1 ? ' nivel' : ' niveles')
      ));
      return;
    }

    host.classList.add('zag-room-hero__estado--listo');
    host.appendChild(el('b', null, UI.estadoListo + textoContadorSemana() + ' esta semana'));
  }

  /* ============================================================
     FOTO PRINCIPAL + ESTADO EN VIVO
     ============================================================ */

  function renderFoto() {
    var img = $('zr-foto-img');
    if (img) {
      img.src = D.foto.src;
      img.alt = D.foto.alt;
    }

    var chips = $('zr-foto-chips');
    if (chips) {
      chips.textContent = '';
      D.foto.chips.forEach(function (c) {
        var li = el('li', 'zr-foto-chip');
        li.appendChild(el('span', null, c.icon));
        li.appendChild(document.createTextNode(' ' + c.texto));
        chips.appendChild(li);
      });
    }
  }

  function renderVivo() {
    var host = $('zr-foto-vivo');
    if (!host) return;
    host.textContent = '';
    host.classList.remove('zr-foto-vivo--cerrado');

    var hoy = D.hoyISO();
    var punto = el('span', 'zr-punto zr-punto--pulso');
    punto.setAttribute('aria-hidden', 'true');

    var bloqueAhora = D.bloqueAhora(hoy);

    if (bloqueAhora) {
      var libres = D.puestosLibres(hoy, bloqueAhora.id, state.reservas, hoy);
      host.appendChild(punto);
      host.appendChild(document.createTextNode(
        '● Abierto ahora · ' + String(libres) +
        (libres === 1 ? ' puesto libre en este bloque' : ' puestos libres en este bloque')
      ));
      return;
    }

    punto.className = 'zr-punto zr-punto--cerrado';
    host.appendChild(punto);
    host.classList.add('zr-foto-vivo--cerrado');

    var prox = D.proximaApertura(hoy);
    var cola = 'Cerrado · ';
    if (!prox) {
      cola = 'Cerrado · abre la próxima semana';
    } else if (prox.esHoy) {
      cola = 'Cerrado ahora · abre hoy a las ' + D.hora12(prox.bloque.inicio);
    } else {
      cola = 'Cerrado · abre ' + D.diaLargo(prox.fechaISO) + ' ' + D.hora12(prox.bloque.inicio);
    }
    host.appendChild(document.createTextNode('● ' + cola));
  }

  /* ============================================================
     MANIFIESTO
     ============================================================ */

  function renderManifiesto() {
    txt('zr-manifiesto-kicker', D.manifiesto.kicker);
    txt('zr-manifiesto-title', D.manifiesto.texto);
  }

  /* ============================================================
     USOS
     ============================================================ */

  function renderUsos() {
    txt('zr-usos-kicker', UI.usosKicker);
    tituloConColor('zr-usos-title', UI.usosTitle);

    var grid = $('zr-usos-grid');
    if (!grid) return;
    grid.textContent = '';

    D.usos.forEach(function (u) {
      var card = el('article', 'zr-uso');

      var foto = el('div', 'zr-uso-foto');
      foto.appendChild(icono(ICONOS[u.icono], 64));
      card.appendChild(foto);

      var body = el('div', 'zr-uso-body');
      body.appendChild(el('h3', 'zr-uso-titulo', u.titulo));
      body.appendChild(el('p', 'zr-uso-texto', u.texto));

      var a = document.createElement('a');
      a.className = 'zr-uso-link';
      a.href = u.link.href;
      a.appendChild(document.createTextNode(u.link.label + ' '));
      a.appendChild(el('span', null, u.link.flecha));
      body.appendChild(a);

      card.appendChild(body);
      grid.appendChild(card);
    });
  }

  /* ============================================================
     ESPACIO: mosaico + amenidades
     ============================================================ */

  function renderEspacio() {
    txt('zr-espacio-kicker', UI.espacioKicker);
    tituloConColor('zr-espacio-title', UI.espacioTitle);
    txt('zr-mosaico-ver', UI.verTodas);

    var mosaico = $('zr-mosaico');
    if (mosaico) {
      mosaico.textContent = '';
      D.galeria.forEach(function (f, i) {
        var b = el('button', 'zr-mosaico-item');
        b.type = 'button';
        b.setAttribute('aria-label', 'Ver foto: ' + f.etiqueta);

        var img = document.createElement('img');
        img.src = f.src;
        img.alt = f.alt;
        img.loading = 'lazy';
        b.appendChild(img);

        b.appendChild(el('span', 'zr-mosaico-tag', f.etiqueta));

        b.addEventListener('click', function () { abrirLightbox(i); });
        mosaico.appendChild(b);
      });
    }

    txt('zr-amenidades-kicker', UI.amenidadesKicker);
    var amens = $('zr-amenidades');
    if (amens) {
      amens.textContent = '';
      D.amenidades.forEach(function (a) {
        var li = el('li', 'zr-amenidad');
        var ico = el('span', 'zr-amenidad-ico');
        ico.appendChild(icono(ICONOS[a.icono], 21));
        li.appendChild(ico);

        var txts = el('div');
        txts.appendChild(el('p', 'zr-amenidad-nombre', a.nombre));
        txts.appendChild(el('p', 'zr-amenidad-texto', a.texto));
        li.appendChild(txts);
        amens.appendChild(li);
      });
    }
  }

  /* ---------- lightbox ---------- */

  var FOCO_LB = null;
  var lbIndice = 0;

  function abrirLightbox(indice) {
    var lb = $('zr-lightbox');
    if (!lb) return;
    FOCO_LB = document.activeElement;
    lbIndice = indice;
    lb.hidden = false;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onLightboxKey);
    pintarLightbox();
    var cerrar = $('zr-lightbox-cerrar');
    if (cerrar) cerrar.focus();
  }

  function pintarLightbox() {
    var f = D.galeria[lbIndice];
    if (!f) return;

    var slide = document.querySelector('#zr-lightbox-track .zr-lightbox-slide');
    if (slide) {
      slide.textContent = '';
      var img = document.createElement('img');
      img.src = f.src;
      img.alt = f.alt;
      slide.appendChild(img);
    }
    txt('zr-lightbox-pie', f.etiqueta + ' (' + String(lbIndice + 1) + ' de ' + String(D.galeria.length) + ')');
  }

  function moverLightbox(delta) {
    var n = D.galeria.length;
    lbIndice = (lbIndice + delta + n) % n;
    pintarLightbox();
  }

  function cerrarLightbox() {
    var lb = $('zr-lightbox');
    if (!lb || lb.hidden) return;
    lb.hidden = true;
    document.body.style.overflow = '';
    document.removeEventListener('keydown', onLightboxKey);
    if (FOCO_LB && FOCO_LB.focus) FOCO_LB.focus();
    FOCO_LB = null;
  }

  function focusables(host) {
    if (!host) return [];
    return Array.prototype.filter.call(
      host.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'),
      function (n) { return n.offsetParent !== null || n === document.activeElement; }
    );
  }

  function onLightboxKey(e) {
    var lb = $('zr-lightbox');
    if (!lb || lb.hidden) return;

    if (e.key === 'Escape') { e.preventDefault(); cerrarLightbox(); return; }
    if (e.key === 'ArrowRight') { e.preventDefault(); moverLightbox(1); return; }
    if (e.key === 'ArrowLeft') { e.preventDefault(); moverLightbox(-1); return; }

    if (e.key !== 'Tab') return;
    var f = focusables(lb);
    if (!f.length) return;
    var primero = f[0];
    var ultimo = f[f.length - 1];
    if (e.shiftKey && document.activeElement === primero) {
      e.preventDefault(); ultimo.focus();
    } else if (!e.shiftKey && document.activeElement === ultimo) {
      e.preventDefault(); primero.focus();
    }
  }

  /* ============================================================
     RESERVA
     ============================================================ */

  function renderReserva() {
    txt('zr-reserva-kicker', UI.reservaKicker);
    tituloConColor('zr-reserva-title', UI.reservaTitle);
    txt('zr-paso-dia', UI.pasoDia);
    txt('zr-paso-bloque', UI.pasoBloque);
    txt('zr-paso-mapa', UI.pasoMapa);
    txt('zr-resumen-titulo', UI.resumenNombre);
    txt('zr-resumen-nota', UI.cancelarNota);

    renderBanner();
    renderDias();
    renderBloques();
    renderMapa();
    renderResumen();
  }

  /* ---------- banner de candado ---------- */

  function renderBanner() {
    var banner = $('zr-bloqueo');
    var texto = $('zr-bloqueo-texto');
    if (!banner || !texto) return;

    if (tieneAcceso()) {
      banner.hidden = true;
      texto.textContent = '';
      return;
    }

    banner.hidden = false;
    if (sinSesion()) {
      texto.textContent = UI.bannerSinSesion;
    } else {
      var faltan = D.faltanNiveles(nivelActual());
      texto.textContent = UI.bannerBloqueo;
      banner.dataset.faltan = String(faltan);
    }
  }

  /* ---------- 1 · chips de día ---------- */

  function renderDias() {
    var host = $('zr-dias');
    if (!host) return;
    host.textContent = '';

    var hoy = D.hoyISO();
    D.diasReservables(hoy).forEach(function (d) {
      var b = el('button', 'zr-dia');
      b.type = 'button';
      b.setAttribute('aria-pressed', String(state.dia === d.fechaISO));
      b.setAttribute('aria-label',
        (d.esHoy ? 'Hoy, ' : D.diaLargo(d.fechaISO) + ', ') + D.fechaMedia(d.fechaISO));

      if (d.esHoy) b.appendChild(el('span', 'zr-dia-hoy', UI.hoy));
      b.appendChild(document.createTextNode(d.esHoy ? ' · ' + D.fechaDia(d.fechaISO) : D.fechaDia(d.fechaISO)));

      b.addEventListener('click', function () {
        state.dia = d.fechaISO;
        /* al cambiar de día, el bloque elegido puede no servir */
        if (state.bloque) {
          var bloque = D.bloquePorId(state.bloque);
          if (bloque && D.yaEmpezo(bloque, d.fechaISO, hoy)) state.bloque = null;
        }
        render();
        anunciar('Día elegido: ' + (d.esHoy ? 'hoy, ' : '') + D.diaLargo(d.fechaISO));
      });

      host.appendChild(b);
    });
  }

  /* ---------- 2 · lista de bloques ---------- */

  function renderBloques() {
    var host = $('zr-bloques');
    if (!host) return;
    host.textContent = '';
    if (!state.dia) return;

    var hoy = D.hoyISO();

    CFG.bloques.forEach(function (b) {
      var e = estadoCelda(state.dia, b);
      var etiqueta = etiquetaEstado(state.dia, b);
      var bloqueado = e.pasado || e.libres === 0;

      var li = el('li');

      var btn = el('button', 'zr-bloque');
      btn.type = 'button';
      btn.setAttribute('aria-pressed', String(state.bloque === b.id));
      btn.disabled = bloqueado;

      btn.appendChild(el('span', 'zr-bloque-hora', D.rango12(b)));

      var est = el('span', 'zr-bloque-estado ' + etiqueta.clase, etiqueta.texto);
      btn.appendChild(est);

      var ocup = el('span', 'zr-bloque-ocup');

      var barra = el('span', 'zr-bloque-barra');
      var llenoCls = 'zr-bloque-lleno';
      if (etiqueta.tono === 'pocos') llenoCls += ' zr-bloque-lleno--pocos';
      if (etiqueta.tono === 'lleno' || e.pasado) llenoCls += ' zr-bloque-lleno--lleno';
      if (etiqueta.tono === 'mio') llenoCls += ' zr-bloque-lleno--mio';

      var pct = e.pasado ? 100 : Math.round(((CFG.aforo - e.libres) / CFG.aforo) * 100);
      var lleno = el('span', llenoCls);
      lleno.style.width = String(pct) + '%';
      barra.appendChild(lleno);
      ocup.appendChild(barra);

      var conteo;
      if (e.pasado) {
        conteo = UI.estadoPaso;
      } else if (e.mio) {
        conteo = UI.estadoTuReserva;
      } else {
        conteo = String(e.libres) + (e.libres === 1 ? UI.puestoLibre : UI.puestosLibres) + UI.deAforo;
      }
      ocup.appendChild(el('span', 'zr-bloque-conteo', conteo));
      btn.appendChild(ocup);

      btn.addEventListener('click', function () {
        state.bloque = b.id;
        render();
        anunciar('Bloque elegido: ' + D.rango12(b) + ' · ' +
          textoLibres(e.libres));
      });

      li.appendChild(btn);
      host.appendChild(li);
    });
  }

  /* ---------- 3 · mapa de la semana ---------- */

  function renderMapa() {
    var host = $('zr-mapa');
    if (!host) return;
    host.textContent = '';

    var hoy = D.hoyISO();
    var dias = D.diasReservables(hoy);

    txt('zr-mapa-desc', 'Puestos libres por día y bloque. Cada celda es un botón: al pulsarla elige ese día y ese bloque.');

    host.style.setProperty('--cols', String(dias.length));

    /* encabezado: una fila por bloque, con el nombre del día arriba */
    var head = el('div', 'zr-mapa-fila');
    head.setAttribute('role', 'row');
    head.appendChild(el('span', 'zr-mapa-etq', 'Hora'));
    dias.forEach(function (d) {
      var h = el('span', 'zr-mapa-etq', d.esHoy ? 'Hoy' : D.fechaDia(d.fechaISO));
      h.setAttribute('role', 'columnheader');
      head.appendChild(h);
    });
    host.appendChild(head);

    CFG.bloques.forEach(function (b) {
      var fila = el('div', 'zr-mapa-fila');
      fila.setAttribute('role', 'row');

      var etq = el('span', 'zr-mapa-etq', D.hora12(b.inicio).replace(' ', ''));
      etq.setAttribute('role', 'rowheader');
      fila.appendChild(etq);

      dias.forEach(function (d, col) {
        var e = estadoCelda(d.fechaISO, b);
        var wrap = el('div', 'zr-mapa-celda-wrap');
        wrap.setAttribute('role', 'gridcell');
        wrap.setAttribute('aria-selected',
          String(state.dia === d.fechaISO && state.bloque === b.id));

        var celda = el('button', 'zr-mapa-celda');
        celda.type = 'button';
        celda.dataset.dia = d.fechaISO;
        celda.dataset.bloque = b.id;
        celda.dataset.fila = String(CFG.bloques.indexOf(b));
        celda.dataset.col = String(col);

        if (e.pasado) {
          celda.classList.add('zr-mapa-celda--paso');
          celda.disabled = true;
          celda.appendChild(el('span', 'zr-mapa-num', '—'));
          celda.appendChild(el('span', 'zr-mapa-mini', UI.leyendaPaso));
          celda.setAttribute('aria-label',
            D.diaLargo(d.fechaISO) + ', ' + D.rango12(b) + ': ' + UI.estadoPaso);
        } else {
          if (e.libres === 0) {
            celda.classList.add('zr-mapa-celda--lleno');
            celda.disabled = true;
          } else if (e.libres <= 2) {
            celda.classList.add('zr-mapa-celda--pocos');
          }

          celda.appendChild(el('span', 'zr-mapa-num', e.mio ? '✓' : String(e.libres)));
          celda.appendChild(el('span', 'zr-mapa-mini',
            e.mio ? UI.estadoTuReservaShort : (e.libres === 1 ? UI.leyendaLibre : UI.leyendaLibres)));
          celda.setAttribute('aria-label',
            D.diaLargo(d.fechaISO) + ', ' + D.rango12(b) + ': ' +
            (e.mio ? UI.estadoTuReserva : textoLibres(e.libres)));
        }

        celda.addEventListener('click', function () {
          state.dia = d.fechaISO;
          state.bloque = b.id;
          render();
          anunciar('Elegiste ' + D.diaLargo(d.fechaISO) + ', ' + D.rango12(b));
        });

        wrap.appendChild(celda);
        fila.appendChild(wrap);
      });

      host.appendChild(fila);
    });

    /* leyenda */
    var leg = $('zr-mapa-leyenda');
    if (leg) {
      leg.textContent = '';
      [
        { key: '', txt: UI.leyendaDisponible },
        { key: '--pocos', txt: UI.leyendaPocos },
        { key: '--lleno', txt: UI.leyendaLleno },
        { key: '--paso', txt: UI.leyendaPaso },
      ].forEach(function (l) {
        var li = el('li');
        var k = el('span', l.key ? 'zr-mapa-key ' + 'zr-mapa-key' + l.key : 'zr-mapa-key');
        k.setAttribute('aria-hidden', 'true');
        li.appendChild(k);
        li.appendChild(document.createTextNode(l.txt));
        leg.appendChild(li);
      });
    }
  }

  /* Flechas sobre el mapa de la semana. */
  function onMapaKey(e) {
    var celda = e.target.closest ? e.target.closest('.zr-mapa-celda') : null;
    if (!celda) return;

    var f = Number(celda.dataset.fila);
    var c = Number(celda.dataset.col);
    var filas = CFG.bloques.length;
    var cols = D.diasReservables(D.hoyISO()).length;
    var objetivo = null;

    if (e.key === 'ArrowRight') objetivo = [f, c + 1];
    else if (e.key === 'ArrowLeft') objetivo = [f, c - 1];
    else if (e.key === 'ArrowDown') objetivo = [f + 1, c];
    else if (e.key === 'ArrowUp') objetivo = [f - 1, c];
    else return;

    e.preventDefault();
    if (objetivo[0] < 0 || objetivo[0] >= filas) return;
    if (objetivo[1] < 0 || objetivo[1] >= cols) return;

    var sel = document.querySelector(
      '.zr-mapa-celda[data-fila="' + objetivo[0] + '"][data-col="' + objetivo[1] + '"]'
    );
    if (sel) sel.focus();
  }

  /* ---------- tarjeta de resumen ---------- */

  function renderResumen() {
    var titulo = $('zr-resumen-titulo');
    var eleccion = $('zr-resumen-eleccion');
    var semana = $('zr-resumen-semana');
    var puntos = $('zr-resumen-puntos');
    var cta = $('zr-resumen-cta');
    var aviso = $('zr-resumen-aviso');
    var linkNivel = $('zr-resumen-nivel');
    var lugar = document.querySelector('.zr-resumen-lugar');

    if (titulo) titulo.textContent = UI.resumenNombre;
    if (lugar) lugar.textContent = '📍 ' + CFG.lugar.replace('ZAG Room · ', '');

    var bloque = state.bloque ? D.bloquePorId(state.bloque) : null;

    if (bloque && state.dia) {
      var e = estadoCelda(state.dia, bloque);
      var linea = D.fechaLarga(state.dia) + ' · ' + D.rango12(bloque);
      if (e.mio) linea += ' · ' + UI.estadoTuReserva;
      eleccion.textContent = linea;
      eleccion.classList.remove('zr-resumen-eleccion--vacio');
    } else {
      eleccion.textContent = UI.resumenVacio;
      eleccion.classList.add('zr-resumen-eleccion--vacio');
    }

    /* el contador sigue la semana del bloque elegido */
    var ancla = state.dia || D.hoyISO();
    var usados = reservasDeSemana(ancla).length;
    if (semana) {
      semana.textContent = '';
      semana.appendChild(document.createTextNode(UI.resumenSemana));
      semana.appendChild(el('b', null, String(usados) + D.textoDeSemana(nivelActual())));
    }

    if (puntos) {
      puntos.textContent = '';
      var maxSem = maxSemanaActual();
      if (maxSem === null) {
        /* SENIOR: bloques ilimitados */
        puntos.appendChild(el('li', 'zr-punto-slot zr-punto-slot--infinito', '∞'));
      } else {
        for (var i = 0; i < maxSem; i++) {
          var li = el('li', 'zr-punto-slot');
          if (i < usados) li.classList.add('zr-punto-slot--lleno');
          puntos.appendChild(li);
        }
      }
    }

    if (aviso) { aviso.hidden = true; aviso.textContent = ''; }
    if (linkNivel) linkNivel.hidden = true;

    var motivo = motivoBloqueo();

    if (!cta) return;

    if (state.confirmando) {
      cta.textContent = UI.confirmando;
      cta.disabled = true;
      cta.setAttribute('aria-busy', 'true');
    } else {
      cta.removeAttribute('aria-busy');

      if (motivo === 'sin-sesion') {
        /* sin sesión el botón sí sirve: abre el bloque de acceso.
           Deshabilitarlo haría imposible llegar al modo demo. */
        cta.textContent = UI.sinSesion;
        cta.disabled = false;
        if (aviso) { aviso.hidden = false; aviso.textContent = UI.bannerSinSesion; }
      } else if (motivo === 'nivel') {
        var faltan = D.faltanNiveles(nivelActual());
        cta.textContent = '🔒 ' + UI.nivelBloqueado + String(faltan) + (faltan === 1 ? ' nivel' : ' niveles');
        cta.disabled = true;
        if (aviso) { aviso.hidden = false; }
        if (linkNivel) {
          linkNivel.hidden = false;
          linkNivel.textContent = UI.verNivel + ' →';
        }
      } else if (motivo === 'max-semana') {
        cta.textContent = '🔒 ' + D.textoMaxSemana(nivelActual());
        cta.disabled = true;
      } else if (motivo === 'lleno') {
        cta.textContent = UI.confirmar;
        cta.disabled = true;
        if (aviso) { aviso.hidden = false; aviso.textContent = UI.llenoAviso; }
      } else if (motivo === 'sin-seleccion') {
        cta.textContent = UI.resumenVacio;
        cta.disabled = true;
      } else if (motivo === 'mio') {
        cta.textContent = UI.estadoTuReserva;
        cta.disabled = true;
      } else if (motivo === 'pasado') {
        cta.textContent = UI.confirmar;
        cta.disabled = true;
        if (aviso) { aviso.hidden = false; aviso.textContent = UI.pasoAviso; }
      } else {
        cta.textContent = UI.confirmar;
        cta.disabled = false;
      }
    }

    renderBarraMovil(motivo);
  }

  /* ---------- barra fija de mobile ---------- */

  function renderBarraMovil(motivo) {
    var barra = $('zr-barra');
    if (!barra) return;

    var bloque = state.bloque ? D.bloquePorId(state.bloque) : null;
    var titulo = $('zr-barra-titulo');
    var detalle = $('zr-barra-detalle');
    var cta = $('zr-barra-cta');
    var elegido = !!(bloque && state.dia);

    /* la barra solo aparece cuando hay algo que confirmar */
    barra.hidden = !elegido;

    if (titulo) {
      titulo.textContent = elegido
        ? D.fechaMedia(state.dia) + ' · ' + D.rango12(bloque)
        : UI.resumenVacio;
    }
    if (detalle) {
      detalle.textContent = elegido ? CFG.lugar : UI.resumenVacio;
    }
    if (cta) {
      if (state.confirmando) {
        cta.textContent = UI.confirmando;
        cta.disabled = true;
      } else if (motivo === 'sin-sesion') {
        cta.textContent = UI.sinSesion;
        cta.disabled = false;
      } else if (motivo === 'nivel') {
        cta.textContent = '🔒 CREATOR';
        cta.disabled = true;
      } else if (motivo === 'max-semana') {
        cta.textContent = '🔒 ' + D.textoMaxSemana(nivelActual());
        cta.disabled = true;
      } else if (motivo === 'mio') {
        cta.textContent = UI.estadoTuReserva;
        cta.disabled = true;
      } else if (motivo === 'lleno' || motivo === 'pasado' || motivo === 'sin-seleccion') {
        cta.textContent = UI.confirmar;
        cta.disabled = true;
      } else {
        cta.textContent = UI.confirmar;
        cta.disabled = false;
      }
    }
  }

  /* ============================================================
     Confirmar reserva
     ============================================================ */

  function confirmarReserva() {
    if (state.confirmando) return;

    var motivo = motivoBloqueo();
    if (motivo) {
      if (motivo === 'sin-sesion') { abrirAcceso($('zr-resumen-cta')); return; }
      anunciar(mensajeBloqueo(motivo));
      return;
    }

    var bloque = D.bloquePorId(state.bloque);
    var codigo = D.codigoReserva(state.dia, state.bloque, nombreSesion());

    state.confirmando = true;
    render();

    window.setTimeout(function () {
      var reserva = {
        fechaISO: state.dia,
        bloqueId: state.bloque,
        codigo: codigo,
        creadoEn: new Date().toISOString(),
      };

      state.reservas.push(reserva);
      guardarReservas();

      state.confirmando = false;
      /* el bloque sigue elegido: ahora muestra "Tu reserva ✓" */
      render();

      anunciar(UI.modalReservado + ' ' + D.fechaMedia(reserva.fechaISO) + ', ' + D.rango12(bloque) + '.');
      abrirModal(reserva);
    }, 500);
  }

  /* ============================================================
     Popup de confirmación
     ============================================================ */

  var FOCO_MODAL = null;

  function abrirModal(reserva) {
    var modal = $('zr-modal');
    if (!modal) return;
    var bloque = D.bloquePorId(reserva.bloqueId);

    FOCO_MODAL = document.activeElement;

    txt('zr-modal-title', UI.modalTitulo);
    txt('zr-modal-copy',
      'Tienes tu puesto en el ZAG Room: ' + D.fechaLarga(reserva.fechaISO) +
      ', ' + D.rango12(bloque) + '. Muestra tu pase en la entrada.');
    txt('zr-modal-codigo', reserva.codigo);

    var cal = $('zr-modal-calendar');
    if (cal) cal.href = D.buildGoogleCalendarUrl(reserva);

    txt('zr-modal-pase', UI.modalVerPase);
    txt('zr-modal-cta', UI.modalEntendido);

    var verPase = $('zr-modal-pase');
    if (verPase) {
      verPase.onclick = function () {
        cerrarModal();
        irAPases(reserva);
      };
    }

    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onModalKey);
    var ent = $('zr-modal-cta');
    if (ent) ent.focus();
  }

  function cerrarModal() {
    var modal = $('zr-modal');
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    document.body.style.overflow = '';
    document.removeEventListener('keydown', onModalKey);
    if (FOCO_MODAL && FOCO_MODAL.focus) FOCO_MODAL.focus();
    FOCO_MODAL = null;
  }

  function onModalKey(e) {
    var modal = $('zr-modal');
    if (!modal || modal.hidden) return;
    if (e.key === 'Escape') { e.preventDefault(); cerrarModal(); return; }
    if (e.key !== 'Tab') return;
    var f = focusables(modal);
    if (!f.length) return;
    var primero = f[0];
    var ultimo = f[f.length - 1];
    if (e.shiftKey && document.activeElement === primero) {
      e.preventDefault(); ultimo.focus();
    } else if (!e.shiftKey && document.activeElement === ultimo) {
      e.preventDefault(); primero.focus();
    }
  }

  function irAPases(reserva) {
    var sec = $('zr-pases');
    if (!sec) return;
    sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.setTimeout(function () {
      var pase = document.querySelector('[data-codigo="' + reserva.codigo + '"]');
      if (pase) {
        pase.style.outline = '3px solid var(--color-cta)';
        window.setTimeout(function () { pase.style.outline = ''; }, 2400);
      }
      anunciar('Tu pase está aquí. Muéstralo en la entrada.');
    }, 500);
  }

  /* ============================================================
     PASES
     ============================================================ */

  var STRIPES = ['brand-deep', 'cta', 'functional', 'black', 'brand-deep', 'cta', 'functional'];

  /* El pase se separa en vigente y anterior. Un bloque en curso sigue
       vigente: sirve hasta que termina. */
  function renderPases() {
    var sec = $('zr-pases');
    if (!sec) return;

    if (sinSesion()) { sec.hidden = true; return; }
    sec.hidden = false;

    txt('zr-pases-kicker', UI.pasesKicker);
    tituloConColor('zr-pases-title', UI.pasesTitle);

    var hoy = D.hoyISO();
    var futuras = [];
    var pasadas = [];

    state.reservas.forEach(function (r) {
      var b = D.bloquePorId(r.bloqueId);
      if (!b) return;
      if (D.yaTermino(b, r.fechaISO, hoy)) pasadas.push(r);
      else futuras.push(r);
    });

    futuras.sort(function (a, b) { return (a.fechaISO + a.bloqueId) < (b.fechaISO + b.bloqueId) ? -1 : 1; });
    pasadas.sort(function (a, b) { return (a.fechaISO + a.bloqueId) < (b.fechaISO + b.bloqueId) ? 1 : -1; });

    var vacio = $('zr-pases-vacio');
    if (vacio) vacio.hidden = futuras.length > 0 || (state.verAnteriores && pasadas.length > 0);
    if (vacio) vacio.textContent = UI.sinReservas;

    var lista = $('zr-pases-lista');
    if (lista) {
      lista.textContent = '';
      futuras.forEach(function (r) { lista.appendChild(paseNode(r, false)); });
    }

    var btnAnt = $('zr-pases-anteriores-btn');
    var contAnt = $('zr-pases-anteriores');
    var listaAnt = $('zr-pases-lista-anteriores');

    if (btnAnt) btnAnt.hidden = pasadas.length === 0;
    if (btnAnt) btnAnt.textContent = state.verAnteriores ? UI.ocultarAnteriores : UI.verAnteriores;
    if (contAnt) contAnt.hidden = !state.verAnteriores || pasadas.length === 0;
    if (listaAnt) {
      listaAnt.textContent = '';
      if (state.verAnteriores) {
        pasadas.forEach(function (r) { listaAnt.appendChild(paseNode(r, true)); });
      }
    }
  }

  /* Minutos que faltan para que empiece el bloque. Colombia es UTC-5
     todo el año, así que el desfase es fijo y el cálculo es exacto
     sin depender del reloj del navegador. */
  function minutosParaEmpezar(fechaISO, bloqueId) {
    var b = D.bloquePorId(bloqueId);
    if (!b) return 0;
    var ahora = new Date();
    var inicio = new Date(fechaISO + 'T' + b.inicio + ':00-05:00');
    return Math.round((inicio.getTime() - ahora.getTime()) / 60000);
  }

  function puedeCancelar(reserva) {
    return minutosParaEmpezar(reserva.fechaISO, reserva.bloqueId) > CFG.horasMinCancelar * 60;
  }

  /* Texto que explica por qué el botón no deja confirmar. */
  function mensajeBloqueo(motivo) {
    switch (motivo) {
      case 'nivel':
        var faltan = D.faltanNiveles(nivelActual());
        return UI.nivelBloqueado + String(faltan) + (faltan === 1 ? ' nivel' : ' niveles');
      case 'max-semana':
        return D.textoMaxSemana(nivelActual());
      case 'lleno':
        return UI.llenoAviso;
      case 'pasado':
        return UI.pasoAviso;
      case 'mio':
        return UI.estadoTuReserva;
      case 'sin-seleccion':
        return UI.resumenVacio;
      case 'sin-sesion':
        return UI.bannerSinSesion;
      default:
        return '';
    }
  }

  function paseNode(reserva, esPasado) {
    var bloque = D.bloquePorId(reserva.bloqueId);
    var li = el('li', 'zr-pase');
    li.dataset.codigo = reserva.codigo;

    var idx = CFG.bloques.indexOf(bloque);
    li.style.setProperty('--pas-stripe', 'var(--color-' + (STRIPES[(idx < 0 ? 0 : idx) % STRIPES.length]) + ')');

    var qr = el('span', 'zr-pase-qr');
    qr.appendChild(D.patronQR(reserva.codigo));
    li.appendChild(qr);

    var body = el('div', 'zr-pase-body');
    body.appendChild(el('p', 'zr-pase-codigo', reserva.codigo));
    body.appendChild(el('p', 'zr-pase-when', D.fechaLarga(reserva.fechaISO) + ' · ' + D.rango12(bloque)));
    body.appendChild(el('p', 'zr-pase-lugar', UI.pasePuesto + ' · 📍 ' + CFG.lugar.replace('ZAG Room · ', '')));

    var quien = el('div', 'zr-pase-quien');
    quien.appendChild(el('span', 'zr-pase-nombre', nombreSesion()));
    quien.appendChild(el('span', 'zr-pase-badge', D.nivelBadge(nivelActual())));
    body.appendChild(quien);
    li.appendChild(body);

    var acciones = el('div', 'zr-pase-acciones');

    if (!esPasado) {
      var mostrar = el('button', 'zr-pase-btn zr-pase-btn--principal', UI.verPase);
      mostrar.type = 'button';
      mostrar.addEventListener('click', function () { abrirPaseFull(reserva); });
      acciones.appendChild(mostrar);
    }

    var cal = document.createElement('a');
    cal.className = 'zr-pase-btn';
    cal.href = D.buildGoogleCalendarUrl(reserva);
    cal.target = '_blank';
    cal.rel = 'noopener noreferrer';
    cal.textContent = UI.agregarCalendario;
    acciones.appendChild(cal);

    if (!esPasado) {
      var puede = puedeCancelar(reserva);
      var cancelar = el('button', 'zr-pase-btn zr-pase-btn--peligro',
        puede ? UI.cancelar : UI.cancelarNoSePuede);
      cancelar.type = 'button';
      cancelar.disabled = !puede;
      if (puede) {
        cancelar.addEventListener('click', function () {
          state.cancelando = reserva.codigo;
          renderPases();
          anunciar('Confirmá si querés cancelar tu reserva del ' + D.fechaMedia(reserva.fechaISO) + '.');
        });
      }
      acciones.appendChild(cancelar);
    }

    li.appendChild(acciones);

    /* confirmación inline, sin confirm() del navegador */
    if (state.cancelando === reserva.codigo && !esPasado && puedeCancelar(reserva)) {
      var conf = el('div', 'zr-confirm');
      conf.appendChild(el('span', null,
        '¿Liberar el puesto del ' + D.fechaMedia(reserva.fechaISO) + '?'));

      var si = el('button', 'zr-pase-btn zr-pase-btn--peligro', UI.cancelarConfirmar);
      si.type = 'button';
      si.addEventListener('click', function () { confirmarCancelacion(reserva); });
      conf.appendChild(si);

      var no = el('button', 'zr-pase-btn', UI.cancelarCancelar);
      no.type = 'button';
      no.addEventListener('click', function () {
        state.cancelando = null;
        renderPases();
      });
      conf.appendChild(no);

      li.appendChild(conf);
    }

    return li;
  }

  function confirmarCancelacion(reserva) {
    state.reservas = state.reservas.filter(function (r) {
      return !(r.fechaISO === reserva.fechaISO && r.bloqueId === reserva.bloqueId);
    });
    guardarReservas();
    state.cancelando = null;

    /* si el bloque cancelado estaba elegido, se limpia */
    if (state.bloque === reserva.bloqueId && state.dia === reserva.fechaISO) {
      state.bloque = null;
    }

    render();
    anunciar('Reserva cancelada. El puesto quedó libre.');
  }

  /* ---------- pase a pantalla completa ---------- */

  var FOCO_PASE = null;

  function abrirPaseFull(reserva) {
    var full = $('zr-pase-full');
    if (!full) return;
    var bloque = D.bloquePorId(reserva.bloqueId);

    FOCO_PASE = document.activeElement;

    var body = $('zr-pase-full-body');
    body.textContent = '';

    body.appendChild(el('p', 'zr-pase-codigo', reserva.codigo));
    body.appendChild(el('p', 'zr-pase-when',
      D.diaLargo(reserva.fechaISO).charAt(0).toUpperCase() +
      D.diaLargo(reserva.fechaISO).slice(1) + ' ' + D.fechaMedia(reserva.fechaISO) +
      ' · ' + D.rango12(bloque)));
    body.appendChild(el('p', 'zr-pase-lugar', UI.pasePuesto + ' · 📍 ' + CFG.lugar.replace('ZAG Room · ', '')));

    var qr = el('span', 'zr-pase-qr');
    qr.appendChild(D.patronQR(reserva.codigo));
    body.appendChild(qr);

    var quien = el('div', 'zr-pase-quien zr-pase-quien--centrado');
    quien.appendChild(el('span', 'zr-pase-nombre', nombreSesion()));
    quien.appendChild(el('span', 'zr-pase-badge', D.nivelBadge(nivelActual())));
    body.appendChild(quien);

    txt('zr-pase-full-note', UI.qrNota);

    full.hidden = false;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onPaseFullKey);
    var cerrar = $('zr-pase-full-cerrar');
    if (cerrar) cerrar.focus();
  }

  function cerrarPaseFull() {
    var full = $('zr-pase-full');
    if (!full || full.hidden) return;
    full.hidden = true;
    document.body.style.overflow = '';
    document.removeEventListener('keydown', onPaseFullKey);
    if (FOCO_PASE && FOCO_PASE.focus) FOCO_PASE.focus();
    FOCO_PASE = null;
  }

  function onPaseFullKey(e) {
    var full = $('zr-pase-full');
    if (!full || full.hidden) return;
    if (e.key === 'Escape') { e.preventDefault(); cerrarPaseFull(); return; }
    if (e.key !== 'Tab') return;
    var f = focusables(full);
    if (!f.length) return;
    var primero = f[0];
    var ultimo = f[f.length - 1];
    if (e.shiftKey && document.activeElement === primero) {
      e.preventDefault(); ultimo.focus();
    } else if (!e.shiftKey && document.activeElement === ultimo) {
      e.preventDefault(); primero.focus();
    }
  }

  /* ============================================================
     REGLAS Y FAQ
     ============================================================ */

  function renderReglas() {
    var host = $('zr-reglas');
    if (!host) return;
    host.textContent = '';

    D.reglas.forEach(function (r) {
      var li = el('li', 'zr-regla');
      var ico = el('span', 'zr-regla-ico');
      ico.appendChild(icono(ICONOS[r.icono], 28));
      li.appendChild(ico);
      li.appendChild(el('span', null, r.texto));
      host.appendChild(li);
    });
  }

  function renderFaq() {
    var host = $('zr-faq');
    if (!host) return;
    host.textContent = '';

    D.faq.forEach(function (f, i) {
      var det = el('details', 'zr-faq-item');
      if (i === 0) det.open = true;
      var sum = document.createElement('summary');
      sum.textContent = f.q;
      det.appendChild(sum);
      det.appendChild(el('p', 'zr-faq-a', f.a));
      host.appendChild(det);
    });
  }

  function renderCierre() {
    var t = $('zr-cierre-title');
    if (t) {
      t.textContent = D.cierre.titleA;
      t.appendChild(el('span', null, ' ' + D.cierre.titleB));
    }

    var cta = $('zr-cierre-cta');
    if (cta) {
      if (sinSesion()) {
        cta.textContent = UI.accesoSecundario;
        cta.href = '#reservar';
      } else if (!tieneAcceso()) {
        cta.textContent = UI.verNivel;
        cta.href = 'perfil.html#retos';
      } else {
        cta.textContent = D.hero.cta;
        cta.href = '#reservar';
      }
    }
  }

  /* ============================================================
     Chip de sesión
     ============================================================ */

  function renderChip() {
    var chip = $('zag-room-chip');
    if (!chip) return;
    if (state.session) {
      chip.textContent = D.nivelTexto(nivelActual()) + ' · demo';
      chip.hidden = false;
    } else {
      chip.hidden = true;
      chip.textContent = '';
    }
  }

  /* ============================================================
     Bloque de acceso / modo demo
     ============================================================ */

  var FOCO_SIN_SESION = null;

  function renderAcceso(mensaje) {
    var host = $('zr-acceso');
    if (!host) return;

    host.querySelector('.zr-acceso-title').textContent = UI.accesoTitulo;
    host.querySelector('.zr-acceso-copy').textContent = mensaje || UI.accesoCopy;
    txt('zr-acceso-primario', UI.accesoPrimario);
    txt('zr-acceso-demo', UI.accesoSecundario);
    txt('zr-acceso-box-label', UI.accesoNivelLabel);
    txt('zr-acceso-select-label', UI.accesoNivelLabel);
    txt('zr-acceso-hint', UI.accesoNivelHint);

    var select = $('zr-acceso-select');
    if (select && !select.options.length) {
      D.NIVELES.forEach(function (n) {
        select.appendChild(new Option(D.NIVEL_NAMES[n], n));
      });
      select.value = 'creator';
    }
  }

  function abrirAcceso(origen, mensaje) {
    var host = $('zr-acceso');
    if (!host) return;

    FOCO_SIN_SESION = origen || document.activeElement;
    renderAcceso(mensaje);
    host.hidden = false;
    host.scrollIntoView({ behavior: 'smooth', block: 'center' });

    var demo = $('zr-acceso-demo');
    if (demo) demo.focus();
  }

  function cerrarAcceso() {
    var host = $('zr-acceso');
    if (host) host.hidden = true;
    if (FOCO_SIN_SESION && FOCO_SIN_SESION.focus) FOCO_SIN_SESION.focus();
    FOCO_SIN_SESION = null;
  }

  /* ============================================================
     Reiniciar demo
     ============================================================ */

  function initReset() {
    var btn = $('zr-reset');
    txt('zr-reset', UI.resetDemo);
    if (!btn) return;
    btn.addEventListener('click', function () {
      try { window.localStorage.removeItem(D.LS_RESERVAS); } catch (e) { /* sin storage */ }
      state.reservas = [];
      state.cancelando = null;
      render();
      anunciar(UI.resetHecho);
    });
  }

  /* ============================================================
     Render general
     ============================================================ */

  function render() {
    renderEstadoHero();
    renderVivo();
    renderChip();
    renderReserva();
    renderPases();
    renderCierre();
  }

  /* ============================================================
     Init
     ============================================================ */

  function init() {
    state.session = SESSION ? SESSION.read() : null;
    state.reservas = leerReservas();

    /* día por defecto: el primero con bloques por delante */
    state.dia = primerDiaUtil(D.hoyISO());

    renderHero();
    renderManifiesto();
    renderUsos();
    renderEspacio();
    renderReglas();
    renderFaq();
    renderCierre();
    render();
    initReset();

    /* eventos */
    $('zr-resumen-cta').addEventListener('click', confirmarReserva);
    $('zr-barra-cta').addEventListener('click', confirmarReserva);

    var verTodas = $('zr-mosaico-ver');
    if (verTodas) verTodas.addEventListener('click', function () { abrirLightbox(0); });

    $('zr-lightbox-cerrar').addEventListener('click', cerrarLightbox);
    $('zr-lightbox-prev').addEventListener('click', function () { moverLightbox(-1); });
    $('zr-lightbox-next').addEventListener('click', function () { moverLightbox(1); });
    document.querySelectorAll('#zr-lightbox [data-close]').forEach(function (n) {
      n.addEventListener('click', cerrarLightbox);
    });

    $('zr-pase-full-cerrar').addEventListener('click', cerrarPaseFull);

    $('zr-modal-cta').addEventListener('click', cerrarModal);
    $('zr-modal').querySelectorAll('[data-close]').forEach(function (n) {
      n.addEventListener('click', cerrarModal);
    });

    var mapa = $('zr-mapa');
    if (mapa) mapa.addEventListener('keydown', onMapaKey);

    var btnAnt = $('zr-pases-anteriores-btn');
    if (btnAnt) {
      btnAnt.addEventListener('click', function () {
        state.verAnteriores = !state.verAnteriores;
        renderPases();
      });
    }

    /* modo demo */
    var demo = $('zr-acceso-demo');
    var box = $('zr-acceso-box');
    if (demo && box) {
      demo.addEventListener('click', function () {
        box.hidden = !box.hidden;
        demo.setAttribute('aria-expanded', String(!box.hidden));
        if (!box.hidden) $('zr-acceso-select').focus();
      });
    }

    var select = $('zr-acceso-select');
    if (select) {
      select.addEventListener('change', function () {
        if (SESSION) SESSION.write({ name: 'Perfil demo ZAG', level: select.value });
        state.session = SESSION ? SESSION.read() : { name: 'Perfil demo ZAG', level: select.value };
        cerrarAcceso();
        render();
        anunciar(UI.accesoListo);
      });
    }

    /* si no hay sesión, el CTA del resumen abre el bloque de acceso.
       El listener normal (confirmarReserva) ya lo contempla, así que
       no hace falta un segundo manejador en captura. */

    /* el estado vivo se recalcula por si la página queda abierta */
    window.setInterval(function () {
      renderVivo();
    }, 60000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();