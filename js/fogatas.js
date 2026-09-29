/* ============================================================
   FOGATAS ZAG (fogatas.html)

   Arma el listado, el filtro Próximas/Pasadas, las reservas demo
   (localStorage), el bloque de acceso, el popup de confirmación
   y el enlace de Google Calendar.

   Depende de: js/content.js, js/main.js, js/zag-session.js,
   js/fogatas-data.js. Todo dentro de try/catch donde se tocan
   localStorage.
   ============================================================ */

(function () {
  'use strict';

  var D = window.ZAG_FOGATAS;
  if (!D) return;

  var UI = D.ui;
  var TZ = D.TZ;
  var ULTIMOS_CUPOS = 3;

  var SESSION = window.ZAG_SESSION || {
    read: function () { return null; },
    write: function () {},
  };

  var state = {
    tab: 'proximas',
    session: null,
    reservas: {},
  };

  /* ---------- helpers ---------- */

  function $(id) { return document.getElementById(id); }

  function el(tag, cls, txt) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (txt != null) n.textContent = txt;
    return n;
  }

  function mayus(s) {
    return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
  }

  function icono(path, w) {
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('width', w || 15);
    svg.setAttribute('height', w || 15);
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    var p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p.setAttribute('d', path);
    p.setAttribute('fill', 'none');
    p.setAttribute('stroke', 'currentColor');
    p.setAttribute('stroke-width', '1.9');
    p.setAttribute('stroke-linecap', 'round');
    p.setAttribute('stroke-linejoin', 'round');
    svg.appendChild(p);
    return svg;
  }

  var ICONO_CAL = 'M7 3v3M17 3v3M4.5 9.5h15M5 6h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z';
  var ICONO_LUGAR = 'M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11zM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z';

  /* ---------- fechas (America/Bogota) ---------- */

  var fmtLargo = new Intl.DateTimeFormat('es-CO', {
    timeZone: TZ, weekday: 'long', day: 'numeric', month: 'long',
  });
  var fmtHora = new Intl.DateTimeFormat('es-CO', {
    timeZone: TZ, hour: 'numeric', minute: '2-digit', hour12: true,
  });

  function fechaLarga(iso) {
    return mayus(fmtLargo.format(new Date(iso)));
  }

  function rangoHorario(f) {
    return fmtHora.format(new Date(f.inicio)) + ' – ' + fmtHora.format(new Date(f.fin));
  }

  /* La fogata es "pasada" cuando su hora de FIN ya pasó. */
  function esPasada(f) {
    return new Date(f.fin).getTime() < Date.now();
  }

  function separadas() {
    var pro = [];
    var pas = [];
    D.fogatas.forEach(function (f) { (esPasada(f) ? pas : pro).push(f); });

    pro.sort(function (a, b) { return new Date(a.inicio) - new Date(b.inicio); });
    pas.sort(function (a, b) { return new Date(b.inicio) - new Date(a.inicio); });
    return { proximas: pro, pasadas: pas };
  }

  /* ---------- reservas ---------- */

  function cargarReservas() {
    try {
      var raw = window.localStorage.getItem(D.LS_RESERVAS);
      if (raw) {
        var o = JSON.parse(raw);
        if (o && typeof o === 'object') state.reservas = o;
      }
    } catch (e) { state.reservas = {}; }
  }

  function guardarReservas() {
    try {
      window.localStorage.setItem(D.LS_RESERVAS, JSON.stringify(state.reservas));
    } catch (e) { /* modo privado */ }
  }

  function estaReservada(id) { return state.reservas[id] === true; }

  /* Los cupos que se muestran son los ocupados en los datos más
     la reserva del usuario, así que reservar descuenta uno. */
  function cuposLibres(f) {
    var libres = f.cupos - f.ocupados;
    if (estaReservada(f.id)) libres -= 1;
    return libres;
  }

  function estaLlena(f) {
    return cuposLibres(f) <= 0 && !estaReservada(f.id);
  }

  /* ---------- Google Calendar ---------- */

  function calStamp(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/.exec(iso);
    return m ? m[1] + m[2] + m[3] + 'T' + m[4] + m[5] + m[6] : '';
  }

  function buildGoogleCalendarUrl(f) {
    var params = new URLSearchParams();
    params.set('action', 'TEMPLATE');
    params.set('text', f.tema + ' · Fogatas ZAG');
    params.set('dates', calStamp(f.inicio) + '/' + calStamp(f.fin));
    params.set('details', f.descripcion + '\n\nFogatas ZAG · EAM\n' + f.lugar);
    params.set('location', f.lugar);
    params.set('ctz', TZ);
    return 'https://calendar.google.com/calendar/render?' + params.toString();
  }

  /* ---------- avisos ---------- */

  function anunciar(txt) {
    var live = $('fogatas-live');
    if (live) live.textContent = txt;
  }

  /* ---------- entrada escalonada de las tarjetas ---------- */

  var revealIO = null;
  if ('IntersectionObserver' in window) {
    revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          revealIO.unobserve(e.target);
          soltarRespaldo();
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  }

  var respaldoScroll = null;

  function enPantalla(el, margen) {
    var r = el.getBoundingClientRect();
    if (!r.height) return false;
    return r.top < window.innerHeight + margen && r.bottom > -margen;
  }

  function soltarRespaldo() {
    if (!respaldoScroll) return;
    window.removeEventListener('scroll', respaldoScroll);
    window.removeEventListener('resize', respaldoScroll);
    respaldoScroll = null;
  }

  function revelarVisibles(margen) {
    var quedan = 0;
    Array.prototype.forEach.call(document.querySelectorAll('.fogata-card:not(.is-in)'), function (c) {
      if (enPantalla(c, margen)) {
        c.classList.add('is-in');
        if (revealIO) revealIO.unobserve(c);
      } else {
        quedan++;
      }
    });
    return quedan;
  }

  function observarTarjetas() {
    var cards = document.querySelectorAll('.fogata-card');
    if (!revealIO) {
      Array.prototype.forEach.call(cards, function (c) { c.classList.add('is-in'); });
      return;
    }
    Array.prototype.forEach.call(cards, function (c) { revealIO.observe(c); });
    if (revelarVisibles(40)) {
      if (!respaldoScroll) {
        respaldoScroll = function () { if (!revelarVisibles(40)) soltarRespaldo(); };
        window.addEventListener('scroll', respaldoScroll, { passive: true });
        window.addEventListener('resize', respaldoScroll);
      }
      requestAnimationFrame(function () { if (!revelarVisibles(40)) soltarRespaldo(); });
    } else {
      soltarRespaldo();
    }
  }

  /* ============================================================
     Tarjeta
     ============================================================ */

  function chipConIcono(iconoPath, texto) {
    var chip = el('span', 'fogata-chip fogata-chip--icon');
    chip.appendChild(icono(iconoPath));
    chip.appendChild(el('span', null, texto));
    return chip;
  }

  function bloqueAnfitrion(f) {
    var box = el('div', 'fogata-host');

    var av = el('span', 'fogata-avatar', f.anfitrion.iniciales);
    av.setAttribute('aria-hidden', 'true');
    box.appendChild(av);

    var txt = el('div');
    txt.appendChild(el('span', 'sr-only', 'Anfitriona o anfitrión: '));
    txt.appendChild(el('p', 'fogata-host-name', f.anfitrion.nombre));
    txt.appendChild(el('p', 'fogata-host-rol', f.anfitrion.rol));
    box.appendChild(txt);
    return box;
  }

  function barra(f) {
    var pct = Math.max(0, Math.min(100, (f.ocupados / f.cupos) * 100));
    if (estaReservada(f.id)) pct = Math.min(100, pct + (100 / f.cupos));
    var wrap = el('div', 'fogata-bar');
    var fill = el('div', 'fogata-bar-fill');
    fill.style.width = pct + '%';
    wrap.appendChild(fill);
    return wrap;
  }

  function bloqueCupos(f) {
    var box = el('div', 'fogata-cupos');
    var libres = cuposLibres(f);
    var txt = el('p', 'fogata-cupos-txt');

    if (estaReservada(f.id)) {
      txt.appendChild(document.createTextNode(UI.cuposQuedan + ' '));
      txt.appendChild(el('strong', null, String(Math.max(0, libres))));
      txt.appendChild(document.createTextNode(' ' + UI.cuposDe + ' ' + f.cupos + ' · tu lugar está guardado'));
      if (libres > 0 && libres <= ULTIMOS_CUPOS) {
        box.appendChild(el('span', 'fogata-tag-ultimos', UI.cuposUltimos));
      }
    } else if (estaLlena(f)) {
      txt.appendChild(document.createTextNode(UI.cuposLlenos));
    } else {
      txt.appendChild(document.createTextNode(UI.cuposQuedan + ' '));
      txt.appendChild(el('strong', null, String(libres)));
      txt.appendChild(document.createTextNode(' ' + UI.cuposDe + ' ' + f.cupos + ' cupos'));
      if (libres <= ULTIMOS_CUPOS) {
        box.appendChild(el('span', 'fogata-tag-ultimos', UI.cuposUltimos));
      }
    }
    box.appendChild(txt);
    return box;
  }

  function confirmacionCancelar(f) {
    var box = el('div', 'fogata-cancel');
    box.setAttribute('role', 'group');

    var wrap = el('div');
    wrap.appendChild(el('p', 'fogata-cancel-preg', UI.cancelPregunta));
    wrap.appendChild(el('p', 'fogata-cancel-nota', UI.cancelNota));

    var si = el('button', 'fogata-cancel-btn fogata-cancel-btn--si', UI.ctaConfirmar);
    si.type = 'button';
    si.addEventListener('click', function () {
      delete state.reservas[f.id];
      guardarReservas();
      render();
      anunciar(UI.canceladoAnunciado);
    });

    var no = el('button', 'fogata-cancel-btn fogata-cancel-btn--no', UI.ctaNo);
    no.type = 'button';
    no.addEventListener('click', function () { render(); });

    box.appendChild(wrap);
    box.appendChild(si);
    box.appendChild(no);
    return box;
  }

  function tarjetaProxima(f, idx) {
    var card = el('article', 'fogata-card fogata--t' + (((f.numero - 1) % 5) + 1) + ' reveal');
    card.dataset.fogata = f.id;
    card.style.setProperty('--f-reveal-delay', (idx * 70) + 'ms');

    var top = el('div', 'fogata-top');
    top.appendChild(el('p', 'fogata-kicker', 'Fogata #' + String(f.numero).padStart(2, '0')));
    top.appendChild(chipConIcono(ICONO_CAL, fechaLarga(f.inicio)));
    top.appendChild(el('span', 'fogata-chip', rangoHorario(f)));
    top.appendChild(chipConIcono(ICONO_LUGAR, f.lugar));
    card.appendChild(top);

    card.appendChild(el('h3', 'fogata-tema', f.tema));
    card.appendChild(el('p', 'fogata-desc', f.descripcion));
    card.appendChild(bloqueAnfitrion(f));
    card.appendChild(bloqueCupos(f));
    card.appendChild(barra(f));

    var actions = el('div', 'fogata-actions');
    var reservada = estaReservada(f.id);
    var llena = estaLlena(f);

    if (llena) {
      var agot = el('button', 'fogata-cta fogata-cta--agotada', UI.ctaAgotada);
      agot.type = 'button';
      agot.disabled = true;
      actions.appendChild(agot);
    } else if (reservada) {
      var mio = el('button', 'fogata-cta fogata-cta--reservado', UI.ctaReservado);
      mio.type = 'button';
      mio.setAttribute('aria-expanded', 'false');
      mio.addEventListener('click', function () {
        var actual = card.querySelector('.fogata-cancel');
        if (actual) { actual.remove(); mio.setAttribute('aria-expanded', 'false'); return; }
        card.querySelector('.fogata-actions').appendChild(confirmacionCancelar(f));
        mio.setAttribute('aria-expanded', 'true');
        var si = card.querySelector('.fogata-cancel-btn--si');
        if (si) si.focus();
      });
      actions.appendChild(mio);
    } else if (state.session) {
      var ir = el('button', 'fogata-cta', UI.ctaReservar);
      ir.type = 'button';
      ir.addEventListener('click', function () { reservar(f, ir); });
      actions.appendChild(ir);
    } else {
      var activar = el('button', 'fogata-cta', UI.ctaSinSesion);
      activar.type = 'button';
      activar.addEventListener('click', function () { abrirAcceso(); });
      actions.appendChild(activar);
    }

    card.appendChild(actions);
    return card;
  }

  function tarjetaPasada(f, idx) {
    var card = el('article', 'fogata-card fogata--t' + (((f.numero - 1) % 5) + 1) + ' fogata-card--pasada reveal');
    card.dataset.fogata = f.id;
    card.style.setProperty('--f-reveal-delay', (idx * 70) + 'ms');

    var top = el('div', 'fogata-top');
    top.appendChild(el('p', 'fogata-kicker', 'Fogata #' + String(f.numero).padStart(2, '0')));
    top.appendChild(el('span', 'fogata-pasada-tag', UI.yaPaso));
    top.appendChild(chipConIcono(ICONO_CAL, fechaLarga(f.inicio)));
    top.appendChild(el('span', 'fogata-chip', rangoHorario(f)));
    top.appendChild(chipConIcono(ICONO_LUGAR, f.lugar));
    card.appendChild(top);

    card.appendChild(el('h3', 'fogata-tema', f.tema));
    card.appendChild(el('p', 'fogata-desc', f.descripcion));
    card.appendChild(bloqueAnfitrion(f));

    var asis = el('p', 'fogata-asistieron');
    asis.appendChild(document.createTextNode('Asistieron '));
    asis.appendChild(el('span', null, f.asistieron + (f.asistieron === 1 ? ' persona' : ' personas')));
    card.appendChild(asis);

    var actions = el('div', 'fogata-actions');
    var link = el('a', 'fogata-calendar-link');
    link.href = buildGoogleCalendarUrl(f);
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.appendChild(icono(ICONO_CAL, 17));
    link.appendChild(el('span', null, UI.calendarCta));
    actions.appendChild(link);
    card.appendChild(actions);

    return card;
  }

  /* ============================================================
     Listado
     ============================================================ */

  function render() {
    var panel = $('fogatas-panel');
    if (!panel) return;

    var g = separadas();
    var lista = g[state.tab];

    panel.textContent = '';

    if (!lista.length) {
      panel.appendChild(el('p', 'fogatas-empty', state.tab === 'proximas' ? UI.vacioProximas : UI.vacioPasadas));
      return;
    }

    var wrap = el('div', 'fogatas-list');
    lista.forEach(function (f, i) {
      wrap.appendChild(state.tab === 'proximas' ? tarjetaProxima(f, i) : tarjetaPasada(f, i));
    });
    panel.appendChild(wrap);
    observarTarjetas();
  }

  function pintarTabs() {
    var tabs = document.querySelectorAll('.fogatas-tab');
    Array.prototype.forEach.call(tabs, function (t) {
      var on = t.dataset.tab === state.tab;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
    });
    var panel = $('fogatas-panel');
    if (panel) panel.setAttribute('aria-labelledby', 'fogatas-tab-' + state.tab);
  }

  function setTab(tab) {
    if (state.tab === tab) return;
    state.tab = tab;
    pintarTabs();
    render();
  }

  function initTabs() {
    var tabs = Array.prototype.slice.call(document.querySelectorAll('.fogatas-tab'));

    tabs.forEach(function (t) {
      t.textContent = t.dataset.tab === 'proximas' ? UI.tabProximas : UI.tabPasadas;
      t.addEventListener('click', function () { setTab(t.dataset.tab); });
    });

    var list = document.querySelector('.fogatas-tabs');
    if (!list) return;

    list.addEventListener('keydown', function (e) {
      var i = tabs.indexOf(document.activeElement);
      if (i < 0) return;
      var j = null;

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') j = (i + 1) % tabs.length;
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') j = (i - 1 + tabs.length) % tabs.length;
      else if (e.key === 'Home') j = 0;
      else if (e.key === 'End') j = tabs.length - 1;

      if (j === null) return;
      e.preventDefault();
      tabs[j].focus();
      setTab(tabs[j].dataset.tab);
    });
  }

  /* ============================================================
     Bloque de acceso (sin sesión)
     ============================================================ */

  var FOCO_SIN_SESION = null;

  function renderAcceso() {
    var host = $('fogatas-access');
    host.textContent = '';

    host.appendChild(el('p', 'fogatas-access-kicker', UI.accessKicker));
    host.appendChild(el('h2', 'fogatas-access-title', UI.accessTitle));
    host.appendChild(el('p', 'fogatas-access-copy', UI.accessCopy));

    var actions = el('div', 'fogatas-access-actions');

    var primary = document.createElement('a');
    primary.className = 'fogata-btn--primary';
    primary.href = 'proximamente.html';
    primary.textContent = UI.accessCtaPrimary;
    actions.appendChild(primary);

    var demo = el('button', 'fogata-btn--secondary', UI.accessCtaSecondary);
    demo.type = 'button';
    demo.setAttribute('aria-expanded', 'false');
    actions.appendChild(demo);

    var box = el('div', 'fogatas-access-box');
    box.hidden = true;
    box.appendChild(el('p', 'fogatas-access-box-label', UI.accessLevelLabel));

    var selBox = el('div', 'fogatas-access-box-select');
    var select = document.createElement('select');
    select.setAttribute('aria-label', UI.accessLevelLabel);
    D.nivelOrder.forEach(function (lvl) {
      var opt = document.createElement('option');
      opt.value = lvl;
      opt.textContent = D.nivelNames[lvl];
      select.appendChild(opt);
    });
    selBox.appendChild(select);
    box.appendChild(selBox);
    box.appendChild(el('p', 'fogatas-access-box-hint', UI.accessLevelHint));

    demo.addEventListener('click', function () {
      box.hidden = !box.hidden;
      demo.setAttribute('aria-expanded', box.hidden ? 'false' : 'true');
      if (!box.hidden) select.focus();
    });

    select.addEventListener('change', function () {
      SESSION.write({ name: 'Perfil demo ZAG', level: select.value });
      state.session = SESSION.read();
      cerrarAcceso();
      render();
      renderChipSesion();
      anunciar('Perfil demo activado. Ya podés reservar tu lugar en la fogata.');
    });

    host.appendChild(actions);
    host.appendChild(box);
  }

  function abrirAcceso() {
    var host = $('fogatas-access');
    if (!host) return;

    FOCO_SIN_SESION = document.activeElement;
    renderAcceso();
    host.hidden = false;
    host.scrollIntoView({ behavior: 'smooth', block: 'center' });

    /* El foco va de una: esperar al scroll retarda al lector de pantalla. */
    var demo = host.querySelector('.fogata-btn--secondary');
    if (demo) demo.focus();
  }

  function cerrarAcceso() {
    var host = $('fogatas-access');
    if (host) host.hidden = true;
    if (FOCO_SIN_SESION && FOCO_SIN_SESION.focus) FOCO_SIN_SESION.focus();
    FOCO_SIN_SESION = null;
  }

  function renderChipSesion() {
    var chip = $('fogatas-session-chip');
    if (!chip) return;
    if (state.session) {
      chip.textContent = (D.nivelNames[state.session.level] || state.session.level) + ' · demo';
      chip.hidden = false;
    } else {
      chip.hidden = true;
      chip.textContent = '';
    }
  }

  /* ============================================================
     Reserva
     ============================================================ */

  function reservar(f, btn) {
    if (!state.session) { abrirAcceso(); return; }
    if (estaLlena(f)) { anunciar(UI.sinCupos); render(); return; }

    btn.setAttribute('aria-busy', 'true');
    btn.disabled = true;
    btn.textContent = UI.ctaReservando;

    window.setTimeout(function () {
      state.reservas[f.id] = true;
      guardarReservas();
      render();
      renderChipSesion();
      anunciar(UI.reservadoAnunciado);
      abrirModal(f);
    }, 500);
  }

  /* ============================================================
     Popup
     ============================================================ */

  var FOCO_PREVIO = null;
  var FOCO_MODAL_ID = null;

  function focusables(host) {
    return Array.prototype.filter.call(
      host.querySelectorAll('a[href], button:not([disabled]), select, [tabindex]:not([tabindex="-1"])'),
      function (n) { return n.offsetParent !== null; }
    );
  }

  function abrirModal(f) {
    var modal = $('fogatas-modal');
    if (!modal) return;

    FOCO_PREVIO = document.activeElement;

    /* El botón que abrió el modal desaparece cuando render() repinta la
       lista, así que guardamos la fogata y lo buscamos de nuevo al cerrar. */
    FOCO_MODAL_ID = f.id;

    $('fogatas-modal-title').textContent = UI.modalTitulo;
    $('fogatas-modal-copy').textContent = UI.modalTexto;
    $('fogatas-modal-detalle').textContent = f.tema + ' · ' + fechaLarga(f.inicio) + ' · ' + rangoHorario(f) + ' · ' + f.lugar;

    var cal = $('fogatas-modal-calendar');
    cal.href = buildGoogleCalendarUrl(f);
    cal.querySelector('.fogatas-modal-calendar-txt').textContent = UI.calendarEnlaceCorto;

    $('fogatas-modal-cta').textContent = UI.modalEntendido;

    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    $('fogatas-modal-cta').focus();
  }

  function cerrarModal() {
    var modal = $('fogatas-modal');
    if (!modal || modal.hidden) return;

    modal.hidden = true;
    document.body.style.overflow = '';
    modal.removeEventListener('keydown', onModalKey);

    var destino = FOCO_MODAL_ID
      ? document.querySelector('[data-fogata="' + FOCO_MODAL_ID + '"] .fogata-cta')
      : null;
    if (destino) destino.focus();
    else if (FOCO_PREVIO && FOCO_PREVIO.focus) FOCO_PREVIO.focus();

    FOCO_PREVIO = null;
    FOCO_MODAL_ID = null;
  }

  function onModalKey(e) {
    if (e.key === 'Escape') { e.preventDefault(); cerrarModal(); return; }
    if (e.key !== 'Tab') return;

    var f = focusables($('fogatas-modal'));
    if (!f.length) return;
    var first = f[0];
    var last = f[f.length - 1];

    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  function initModal() {
    var modal = $('fogatas-modal');
    if (!modal) return;

    $('fogatas-modal-cta').addEventListener('click', cerrarModal);
    Array.prototype.forEach.call(modal.querySelectorAll('[data-close]'), function (n) {
      n.addEventListener('click', cerrarModal);
    });
  }

  /* ============================================================
     Reiniciar demo (solo las reservas de fogata)
     ============================================================ */

  function initReset() {
    var btn = $('fogatas-reset');
    if (!btn) return;

    btn.textContent = UI.resetDemo;
    btn.title = UI.resetDemo;

    btn.addEventListener('click', function () {
      try { window.localStorage.removeItem(D.LS_RESERVAS); } catch (e) { /* nada */ }
      state.reservas = {};
      render();
      anunciar(UI.resetHecho);
    });
  }

  /* ============================================================
     Arranque
     ============================================================ */

  function initHero() {
    var k = $('fogatas-hero-kicker');
    if (k) k.textContent = UI.heroKicker;

    var t = $('fogatas-hero-title');
    if (t) {
      t.textContent = UI.heroTitleA;
      var b = el('span', 'zag-hero__title-accent', ' ' + UI.heroTitleB);
      t.appendChild(b);
    }

    var s = $('fogatas-hero-sub');
    if (s) s.textContent = UI.heroSub;
  }

  function init() {
    initHero();

    $('fogatas-section-title').textContent = UI.sectionTitle;
    $('fogatas-section-copy').textContent = UI.sectionCopy;

    cargarReservas();
    state.session = SESSION.read();

    initTabs();
    initModal();
    initReset();
    renderChipSesion();
    pintarTabs();
    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      var modal = $('fogatas-modal');
      if (modal && !modal.hidden) {
        e.preventDefault();
        modal.addEventListener('keydown', onModalKey);
        cerrarModal();
      }
    }
  });

  window.ZAG_FOGATAS_APP = {
    buildGoogleCalendarUrl: buildGoogleCalendarUrl,
    separadas: separadas,
    cuposLibres: cuposLibres,
    estado: state,
  };
})();
