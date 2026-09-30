/* ============================================================
   PORTAL ZAG — Seminario Somos ZAG (seminario.html)
   Lógica de la página: hero con cuenta regresiva, marquee,
   line-up con porciones de la agenda, marcas, agenda por días
   con filtros y vista lista/grilla (estado en la URL), reserva
   independiente por día, popup accesible y reveal escalonado.

   Patrón y ayudantes del acceso/modo demo tomados de Fogatas,
   con el armado de Google Calendar en js/zag-reserva.js.
   ============================================================ */

window.ZAG_SEMINARIO_APP = (function () {
  'use strict';

  var D = window.ZAG_SEMINARIO || { evento: { dias: [] }, ui: {}, ponentes: [], marcas: [], agenda: [], nivelOrder: [], nivelNames: {}, LS_RESERVAS: 'zag_seminario_reservas', TZ: 'America/Bogota' };

  var SESSION = window.ZAG_SESSION || {
    read: function () { return null; },
    write: function () {},
    clear: function () {},
  };

  var noop = function () {};
  window.ZAG_RESERVA = window.ZAG_RESERVA || { buildGoogleCalendarUrl: noop };

  var REDUCED = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  var COLOR = {
    naranja: 'var(--color-cta)',
    azul: 'var(--color-functional)',
    azulprofundo: 'var(--color-brand-deep)',
  };

  var state = {
    session: SESSION.read(),
    dia: 0,
    filtro: '',
    vista: 'lista',
    reservas: leerReservas(),
  };

  /* ============================================================
     Utilidades
     ============================================================ */

  function $(id) {
    return document.getElementById(id);
  }

  function el(tag, cls, txt) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (txt !== undefined && txt !== null) n.textContent = txt;
    return n;
  }

  function anunciar(txt) {
    var live = $('sem-live');
    if (live) live.textContent = txt;
  }

  function porId(pid) {
    return D.ponentes.filter(function (p) { return p.id === pid; })[0] || null;
  }

  function mayus(s) {
    return String(s).charAt(0).toUpperCase() + String(s).slice(1);
  }

  function horaCorta(hhmm) {
    return String(hhmm).replace(/^0/, '');
  }

  function rellenar(n) {
    return n < 10 ? '0' + n : String(n);
  }

  function activosDia() {
    return D.agenda.filter(function (a) { return a.dia === D.evento.dias[state.dia].id; });
  }

  function activosFiltrados() {
    return activosDia().filter(function (a) {
      return state.filtro === '' || a.tipo === state.filtro;
    });
  }

  /* ============================================================
     Reservas (localStorage)
     ============================================================ */

  function leerReservas() {
    try {
      var raw = window.localStorage.getItem(D.LS_RESERVAS);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function guardarReservas() {
    try {
      window.localStorage.setItem(D.LS_RESERVAS, JSON.stringify(state.reservas));
    } catch (e) { /* nada */ }
  }

  function diaPorId(id) {
    return D.evento.dias.filter(function (d) { return d.id === id; })[0];
  }

  function cuposLibres(d) {
    var libres = d.cupos - d.ocupados;
    if (state.reservas[d.id]) libres -= 1;
    return Math.max(0, libres);
  }

  function estaLlena(d) {
    return cuposLibres(d) <= 0 && !state.reservas[d.id];
  }

  /* ============================================================
     Google Calendar
     ============================================================ */

  function sumarDia(ymd) {
    var d = new Date(ymd.slice(0, 4) + '-' + ymd.slice(4, 6) + '-' + ymd.slice(6, 8) + 'T00:00:00');
    d.setDate(d.getDate() + 1);
    return String(d.getFullYear()) + rellenar(d.getMonth() + 1) + rellenar(d.getDate());
  }

  function urlCalendar(d) {
    var inicio = d.fecha.replace(/-/g, '');
    if (!D.evento.horarioConfirmado) {
      return window.ZAG_RESERVA.buildGoogleCalendarUrl({
        text: 'Somos ZAG · ' + d.label,
        dates: inicio + '/' + sumarDia(inicio),
        details: 'Seminario Somos ZAG · Portal ZAG. Horario y lugar por confirmar.',
        location: 'Por confirmar · EAM',
      });
    }
    var act = D.agenda.filter(function (a) { return a.dia === d.id; });
    var pri = act[0];
    var ult = act[act.length - 1];
    var stamp = function (hhmm) {
      return inicio + 'T' + hhmm.replace(':', '') + '00';
    };
    return window.ZAG_RESERVA.buildGoogleCalendarUrl({
      text: 'Somos ZAG · ' + d.label,
      dates: stamp(pri.inicio) + '/' + stamp(ult.fin),
      details: 'Seminario Somos ZAG · Portal ZAG.',
      location: 'Por confirmar · EAM',
      ctz: D.TZ,
    });
  }

  /* ============================================================
     Hero
     ============================================================ */

  function initHero() {
    var k = $('sem-hero-kicker');
    if (k) k.textContent = D.ui.heroKicker;

    var sub = $('sem-hero-sub');
    if (sub) sub.textContent = D.ui.heroSub;

    var chips = $('sem-hero-chips');
    if (chips) {
      [
        ['📅', D.ui.heroChipFecha],
        ['📍', D.ui.heroChipLugar],
        ['🕘', D.ui.heroChipHora],
      ].forEach(function (c) {
        var li = el('li', null);
        li.appendChild(el('span', null, c[0]));
        li.appendChild(el('span', null, c[1]));
        chips.appendChild(li);
      });
    }

    var cta = $('sem-hero-cta');
    if (cta) cta.textContent = D.ui.heroCta + ' ↓';

    var cupos = $('sem-hero-cupos');
    if (cupos && D.evento.dias.length) cupos.textContent = D.ui.heroCuposPrefix + D.evento.dias[0].cupos;
  }

  var FIN_EVENTO = (function () {
    var ult = D.evento.dias[D.evento.dias.length - 1];
    return ult ? new Date(ult.fecha + 'T23:59:59-05:00').getTime() : Infinity;
  })();

  function countdownTick() {
    var inicio = new Date(D.evento.inicioISO).getTime();
    var ahora = Date.now();
    var diff = inicio - ahora;
    var count = $('sem-countdown');
    var msg = $('sem-countdown-msg');

    if (diff <= 0) {
      msg.textContent = ahora >= FIN_EVENTO ? D.ui.gracias : D.ui.esHoy;
      msg.hidden = false;
      if (count) count.hidden = true;
      return;
    }

    var seg = Math.floor(diff / 1000);
    var dd = Math.floor(seg / 86400);
    var hh = Math.floor((seg % 86400) / 3600);
    var mm = Math.floor((seg % 3600) / 60);
    var ss = seg % 60;

    if ($('sem-count-dias')) $('sem-count-dias').textContent = dd;
    if ($('sem-count-horas')) $('sem-count-horas').textContent = rellenar(hh);
    if ($('sem-count-min')) $('sem-count-min').textContent = rellenar(mm);
    if ($('sem-count-seg')) $('sem-count-seg').textContent = rellenar(ss);
  }

  function initCountdown() {
    if (!D.evento.inicioISO) return;
    countdownTick();
    window.setInterval(countdownTick, REDUCED ? 60000 : 1000);
  }

  /* ============================================================
     Marquee
     ============================================================ */

  function initMarquee() {
    var track = $('sem-marquee');
    if (!track) return;

    function rep() {
      var r = el('div', 'marquee-repeat');
      var seg = el('span', 'marquee-text', D.ui.marquee);
      var dot = el('span', 'dot', '✦');
      r.appendChild(seg);
      r.appendChild(dot);
      return r;
    }

    var reps = [rep(), rep(), rep()];
    reps.forEach(function (r) { track.appendChild(r.cloneNode(true)); });
    reps.forEach(function (r) { track.appendChild(r); });
  }

  /* ============================================================
     Line-up
     ============================================================ */

  function primerTurno(pid) {
    var a = D.agenda.filter(function (x) { return x.ponentes.indexOf(pid) !== -1; })[0];
    if (!a) return null;
    var dia = diaPorId(a.dia);
    return { dia: dia ? dia.label : a.dia, hora: a.inicio };
  }

  function chipLabel(pid) {
    var t = primerTurno(pid);
    if (!t) return '';
    var m = /(\d+)/.exec(t.dia);
    return D.ui.lineupChipDia
      .replace('{n}', m ? m[1] : t.dia)
      .replace('{hora}', horaCorta(t.hora));
  }

  function renderLineup() {
    var k = $('sem-lineup-kicker');
    if (k) k.textContent = D.ui.lineupKicker;

    var t = $('sem-lineup-title');
    if (t) t.textContent = D.ui.lineupTitle;

    var note = $('sem-lineup-note');
    if (note) note.textContent = D.ui.lineupNote;

    var grid = $('sem-speakers');
    if (!grid) return;

    D.ponentes.forEach(function (p, i) {
      var li = el('li', 'sem-speaker');
      li.style.setProperty('--f-reveal-delay', Math.min(i * 70, 280) + 'ms');

      var media = el('div', 'sem-speaker__media');
      media.style.setProperty('--sp-color', COLOR[p.color] || 'var(--color-cta)');
      media.appendChild(el('span', 'sem-speaker__iniciales', p.iniciales));

      var nombre = el('h3', 'sem-speaker__nombre', p.nombre);

      var cargo = el('p', 'sem-speaker__cargo', p.cargo);
      cargo.appendChild(el('span', 'sem-speaker__empresa', ' · ' + p.empresa));

      var chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'sem-speaker__chip';
      chip.textContent = chipLabel(p.id);
      if (chip.textContent) {
        chip.addEventListener('click', function () { mostrarSesion(p.id); });
      } else {
        chip.hidden = true;
      }

      li.appendChild(media);
      li.appendChild(nombre);
      li.appendChild(cargo);
      li.appendChild(chip);
      grid.appendChild(li);
    });
  }

  /* ============================================================
     Marcas
     ============================================================ */

  function renderMarcas() {
    var k = $('sem-marcas-kicker');
    if (k) k.textContent = D.ui.marcaKicker;

    var t = $('sem-marcas-title');
    if (t) t.textContent = D.ui.marcaTitle;

    var grid = $('sem-brands');
    if (!grid) return;

    D.marcas.forEach(function (m) {
      var li = el('li', 'sem-brand', m.nombre);
      li.setAttribute('aria-label', m.nombre);
      grid.appendChild(li);
    });
  }

  /* ============================================================
     Agenda: estado en la URL
     ============================================================ */

  function leerURL() {
    var q = new URLSearchParams(window.location.search);
    var d = parseInt(q.get('dia'), 10);
    if (d >= 1 && d <= D.evento.dias.length) state.dia = d - 1;
    if (q.get('vista') === 'grilla') state.vista = 'grilla';
  }

  function escribirURL() {
    if (!history.replaceState) return;
    var p = new URLSearchParams(window.location.search);
    p.set('dia', String(state.dia + 1));
    p.set('vista', state.vista);
    history.replaceState(null, '', '?' + p.toString());
  }

  /* ============================================================
     Agenda: tabs por día
     ============================================================ */

  function pintarTabs() {
    Array.prototype.forEach.call(document.querySelectorAll('#sem-tablist .sem-tab'), function (t, i) {
      var on = i === state.dia;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
    });
    var panel = $('sem-panel');
    if (panel) panel.setAttribute('aria-labelledby', 'sem-tab-' + state.dia);
  }

  function setDia(i) {
    if (state.dia === i) return;
    state.dia = i;
    pintarTabs();
    pintarPanel();
    escribirURL();
    anunciar(D.evento.dias[i].label + ': ' + D.evento.dias[i].fechaLarga);
  }

  function initTabs() {
    var list = $('sem-tablist');
    if (!list) return;

    D.evento.dias.forEach(function (d, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'sem-tab';
      b.id = 'sem-tab-' + i;
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-controls', 'sem-panel');
      b.textContent = i === 0 ? D.ui.tabDia1 : D.ui.tabDia2;
      b.addEventListener('click', function () { setDia(i); });
      list.appendChild(b);
    });

    list.addEventListener('keydown', function (e) {
      var tabs = Array.prototype.slice.call(list.querySelectorAll('.sem-tab'));
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
      setDia(j);
    });
  }

  /* ============================================================
     Agenda: filtro por tipo
     ============================================================ */

  function pintarFiltro() {
    var chips = $('sem-filtro-chips');
    if (!chips) return;
    Array.prototype.forEach.call(chips.querySelectorAll('.sem-filtro__chip'), function (c) {
      var on = c.dataset.tipo === state.filtro;
      c.classList.toggle('is-active', on);
      c.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }

  function setFiltro(tipo) {
    state.filtro = tipo === 'all' ? '' : tipo;
    pintarFiltro();
    pintarPanel();
    anunciar(filtroAnuncio());
  }

  function filtroAnuncio() {
    var nombre = state.filtro === '' ? D.ui.filtroAll : (D.ui.tipoNames[state.filtro] || state.filtro);
    return nombre + ': ' + activosFiltrados().length + ' actividades.';
  }

  function initFiltro() {
    var btn = $('sem-filtro-btn');
    var chips = $('sem-filtro-chips');
    if (!btn || !chips) return;

    btn.textContent = D.ui.filtroLabel;
    btn.appendChild(el('span', 'sem-filtro__caret', '▾'));

    var tipos = [['all', D.ui.filtroAll]].concat(
      ['charla', 'taller', 'networking', 'break'].map(function (t) {
        return [t, D.ui.tipoNames[t]];
      })
    );

    tipos.forEach(function (t) {
      var c = document.createElement('button');
      c.type = 'button';
      c.className = 'sem-filtro__chip';
      c.dataset.tipo = t[0];
      c.setAttribute('aria-pressed', 'false');
      c.textContent = t[1];
      c.addEventListener('click', function () { setFiltro(t[0]); ocultarFiltro(btn, chips); });
      chips.appendChild(c);
    });

    btn.addEventListener('click', function () {
      var abierto = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', abierto ? 'false' : 'true');
      chips.hidden = abierto;
      if (!abierto) {
        var activo = chips.querySelector('.is-active');
        if (activo) activo.focus();
      }
    });

    pintarFiltro();

    document.addEventListener('click', function (e) {
      var dentro = btn.contains(e.target) || chips.contains(e.target);
      if (!dentro && !chips.hidden) ocultarFiltro(btn, chips);
    });
  }

  function ocultarFiltro(btn, chips) {
    btn.setAttribute('aria-expanded', 'false');
    chips.hidden = true;
  }

  /* ============================================================
     Agenda: vista lista / grilla
     ============================================================ */

  function setVista(v) {
    if (state.vista === v) return;
    state.vista = v;
    pintarVista();
    pintarPanel();
    escribirURL();
  }

  function pintarVista() {
    var lista = $('sem-vista-lista');
    var grilla = $('sem-vista-grilla');
    if (lista) lista.setAttribute('aria-pressed', state.vista === 'lista' ? 'true' : 'false');
    if (grilla) grilla.setAttribute('aria-pressed', state.vista === 'grilla' ? 'true' : 'false');
    var rows = $('sem-rows');
    if (rows) rows.dataset.vista = state.vista;
  }

  function initVista() {
    var lista = $('sem-vista-lista');
    var grilla = $('sem-vista-grilla');
    if (lista) lista.addEventListener('click', function () { setVista('lista'); });
    if (grilla) grilla.addEventListener('click', function () { setVista('grilla'); });
  }

  /* ============================================================
     Agenda: contenido de la franja y las filas
     ============================================================ */

  function pintarMostrando(n) {
    var m = $('sem-mostrando');
    if (m) m.textContent = D.ui.mostrando.replace('{n}', String(n));
    var nota = $('sem-horas-nota');
    if (nota) {
      nota.textContent = D.ui.horasNota;
      nota.hidden = !!D.evento.horarioConfirmado;
    }
  }

  function construirStrip(d) {
    var strip = el('aside', 'sem-strip');
    strip.setAttribute('aria-label', 'Reserva ' + d.label);

    var info = el('div', 'sem-strip__info');
    info.appendChild(el('h3', 'sem-strip__dia', d.label + ' · ' + d.fechaLarga));
    info.appendChild(el('p', 'sem-strip__lugar', '📍 ' + D.ui.stripPlaceholder));
    strip.appendChild(info);

    var cupos = el('div', 'sem-strip__cupos');
    var libres = cuposLibres(d);
    cupos.appendChild(el('p', 'sem-strip__restante', D.ui.quedan.replace('{n}', String(libres)).replace('{cupos}', String(d.cupos))));

    var barra = el('div', 'sem-strip__barra');
    var fill = el('span', 'sem-strip__barra-fill');
    var lleno = d.ocupados + (state.reservas[d.id] ? 1 : 0);
    var pct = Math.max(0, Math.min(100, Math.round((lleno / d.cupos) * 100)));
    fill.style.width = '0%';
    barra.appendChild(fill);
    cupos.appendChild(barra);

    if (libres > 0 && libres <= 20) cupos.appendChild(el('p', 'sem-strip__ultimos', D.ui.ultimos));
    strip.appendChild(cupos);

    var actions = el('div', 'sem-strip__actions');
    actions.appendChild(bloqueReserva(d, false));
    strip.appendChild(actions);

    requestAnimationFrame(function () {
      requestAnimationFrame(function () { fill.style.width = pct + '%'; });
    });

    return strip;
  }

  function construirPonentes(a) {
    var ids = a.ponentes || [];
    if (!ids.length) return null;
    var wrap = el('div', 'sem-row__ponentes');
    ids.forEach(function (pid) {
      var p = porId(pid);
      if (!p) return;
      var item = el('div', 'sem-row__ponente');
      item.appendChild(el('div', 'sem-row__ponente-media', p.iniciales));
      item.appendChild(el('p', 'sem-row__ponente-nombre', p.nombre));
      item.appendChild(el('p', 'sem-row__ponente-rol', p.cargo));
      wrap.appendChild(item);
    });
    return wrap;
  }

  function construirRow(a, i) {
    if (a.tipo === 'break') {
      var rowB = el('div', 'sem-row sem-row--break');
      rowB.id = 'sem-row-' + a.id;
      rowB.dataset.sesion = a.id;
      rowB.appendChild(el('p', 'sem-row__hora', a.inicio + '–' + a.fin));

      var infoB = el('div', 'sem-row--break__info');
      infoB.appendChild(el('span', 'sem-row__icon', a.icon === 'almuerzo' ? '🍽' : '☕'));
      infoB.appendChild(el('p', 'sem-row__meta', mayus(D.ui.tipoNames[a.tipo].replace(/s$/, ''))));
      infoB.appendChild(el('h3', 'sem-row__titulo', a.titulo));
      rowB.appendChild(infoB);
      return rowB;
    }

    var row = el('div', 'sem-row');
    row.id = 'sem-row-' + a.id;
    row.dataset.sesion = a.id;
    row.dataset.dia = a.dia;
    row.style.setProperty('--f-reveal-delay', Math.min(i * 70, 280) + 'ms');

    row.appendChild(el('p', 'sem-row__hora', a.inicio + '–' + a.fin));

    var content = el('div', 'sem-row__contenido');
    content.appendChild(el('p', 'sem-row__meta', mayus(D.ui.tipoNames[a.tipo].replace(/s$/, '')) + (a.sala ? ' | ' + a.sala : '')));
    content.appendChild(el('h3', 'sem-row__titulo', a.titulo));
    content.appendChild(el('p', 'sem-row__desc', a.descripcion));

    if (a.temas && a.temas.length) {
      var temas = el('div', 'sem-row__temas');
      a.temas.forEach(function (t) { temas.appendChild(el('span', 'sem-tag sem-tag--' + a.tipo, t)); });
      content.appendChild(temas);
    }
    row.appendChild(content);

    var pon = construirPonentes(a);
    if (pon) row.appendChild(pon);

    return row;
  }

  function pintarPanel() {
    var panel = $('sem-panel');
    if (!panel) return;
    panel.textContent = '';

    var d = D.evento.dias[state.dia];
    if (d) panel.appendChild(construirStrip(d));

    var rows = el('div', 'sem-rows');
    rows.id = 'sem-rows';
    rows.dataset.vista = state.vista;

    var items = activosFiltrados();
    items.forEach(function (a, i) { rows.appendChild(construirRow(a, i)); });
    panel.appendChild(rows);

    pintarMostrando(items.length);
    revelarRows(rows);
    pintarVista();
  }

  /* ============================================================
     Reserva por día
     ============================================================ */

  function bloqueReserva(d, oscuro) {
    var wrap = el('div', 'sem-reserva' + (oscuro ? ' sem-reserva--oscuro' : ''));

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'sem-btn';
    btn.dataset.dia = d.id;

    if (!state.session) {
      btn.classList.add('sem-btn--outline');
      btn.textContent = D.ui.sinSesion;
      btn.addEventListener('click', abrirAcceso);
    } else if (state.reservas[d.id]) {
      btn.classList.add('sem-btn--reservado');
      btn.textContent = D.ui.reservadoConfirmado + ' ✓';
      btn.setAttribute('aria-disabled', 'true');
    } else if (estaLlena(d)) {
      btn.classList.add('sem-btn--agotado');
      btn.disabled = true;
      btn.textContent = D.ui.agotado;
    } else {
      btn.textContent = D.ui.reservar.replace('{dia}', d.label);
      btn.addEventListener('click', function () { reservar(d, btn); });
    }

    wrap.appendChild(btn);

    if (state.session && state.reservas[d.id]) {
      var links = el('div', 'sem-reserva__links');

      var cal = document.createElement('a');
      cal.className = 'sem-reserva__link';
      cal.href = urlCalendar(d);
      cal.target = '_blank';
      cal.rel = 'noopener noreferrer';
      cal.textContent = D.ui.agregarCalendario;
      links.appendChild(cal);

      var canc = document.createElement('button');
      canc.type = 'button';
      canc.className = 'sem-reserva__link sem-reserva__cancel';
      canc.textContent = D.ui.cancelarReserva;
      canc.addEventListener('click', function () { pintarConfirma(d, wrap); });
      links.appendChild(canc);

      wrap.appendChild(links);
    }

    return wrap;
  }

  function pintarConfirma(d, wrap) {
    var conf = el('div', 'sem-reserva__confirma');
    conf.appendChild(el('p', null, D.ui.confirmarLiberar.replace('{dia}', d.label)));

    var acts = el('div', 'sem-reserva__confirma-actions');
    var si = el('button', 'sem-btn--mini', D.ui.confirmarSi);
    si.type = 'button';
    var no = el('button', 'sem-btn--mini sem-btn--mini--ghost', D.ui.confirmarNo);
    no.type = 'button';
    acts.appendChild(si);
    acts.appendChild(no);
    conf.appendChild(acts);

    si.addEventListener('click', function () {
      delete state.reservas[d.id];
      guardarReservas();
      repintarReservas();
      anunciar(D.ui.liberadoAnunciado);
    });
    no.addEventListener('click', function () { repintarReservas(); });

    var prev = wrap.querySelector('.sem-reserva__links');
    if (prev) wrap.replaceChild(conf, prev);
    else wrap.appendChild(conf);
  }

  function reservar(d, btn) {
    if (!state.session) { abrirAcceso(); return; }
    if (estaLlena(d)) {
      anunciar(D.ui.agotado);
      repintarReservas();
      return;
    }

    btn.setAttribute('aria-busy', 'true');
    btn.disabled = true;
    btn.textContent = D.ui.reservando;

    window.setTimeout(function () {
      state.reservas[d.id] = true;
      guardarReservas();
      repintarReservas();
      anunciar(D.ui.reservadoAnunciado);
      abrirModal(d);
    }, 500);
  }

  function repintarReservas() {
    pintarPanel();
    pintarHeroDays();
    pintarFinalDays();
    renderChipSesion();
  }

  /* ============================================================
     Botones de reserva del héroe y del cierre
     ============================================================ */

  function pintarHeroDays() {
    var host = $('sem-hero-days');
    if (!host) return;
    host.textContent = '';
    D.evento.dias.forEach(function (d) { host.appendChild(bloqueReserva(d, true)); });
  }

  function pintarFinalDays() {
    var host = $('sem-final-days');
    if (!host) return;
    host.textContent = '';
    D.evento.dias.forEach(function (d) { host.appendChild(bloqueReserva(d, true)); });

    var k = $('sem-final-kicker');
    if (k) k.textContent = D.ui.finalKicker;

    var t = $('sem-final-title');
    if (t) {
      t.setAttribute('aria-label', D.ui.finalTitle);
      t.textContent = '';
      var partes = D.ui.finalTitle.split('ZAG');
      t.appendChild(el('span', null, partes[0]));
      t.appendChild(el('span', 'sem-final__zag', 'ZAG'));
      t.appendChild(el('span', null, partes.slice(1).join('ZAG')));
    }

    var sub = $('sem-final-sub');
    if (sub) sub.textContent = D.ui.finalSub;
  }

  /* ============================================================
     Ir a una sesión desde el line-up
     ============================================================ */

  function mostrarSesion(pid) {
    var a = D.agenda.filter(function (x) { return x.ponentes.indexOf(pid) !== -1; })[0];
    if (!a) return;
    var idx = D.evento.dias.map(function (d) { return d.id; }).indexOf(a.dia);
    if (idx >= 0) {
      state.dia = idx;
      state.filtro = '';
      pintarTabs();
      pintarFiltro();
      pintarPanel();
      escribirURL();

      requestAnimationFrame(function () {
        var row = $('sem-row-' + a.id);
        if (row) {
          row.scrollIntoView({ behavior: 'smooth', block: 'center' });
          row.classList.add('sem-row--resaltada');
          window.setTimeout(function () { row.classList.remove('sem-row--resaltada'); }, 1500);
        }
      });
      anunciar(a.titulo);
    }
  }

  /* ============================================================
     Chip de sesión en el header
     ============================================================ */

  function renderChipSesion() {
    var chip = $('sem-session-chip');
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
     Bloque de acceso (sin sesión)
     ============================================================ */

  var FOCO_SIN_SESION = null;

  function renderAcceso() {
    var host = $('sem-access');
    if (!host) return;
    host.textContent = '';

    host.appendChild(el('p', 'sem-access-kicker', D.ui.accessKicker));
    host.appendChild(el('h2', 'sem-access-title', D.ui.accessTitle));
    host.appendChild(el('p', 'sem-access-copy', D.ui.accessCopy));

    var actions = el('div', 'sem-access-actions');

    var primary = document.createElement('a');
    primary.className = 'sem-btn sem-btn--mini';
    primary.href = 'proximamente.html';
    primary.textContent = D.ui.accessCtaPrimary;
    actions.appendChild(primary);

    var demo = el('button', 'sem-btn sem-btn--mini sem-btn--mini--ghost', D.ui.accessCtaSecondary);
    demo.type = 'button';
    demo.setAttribute('aria-expanded', 'false');
    actions.appendChild(demo);

    var box = el('div', 'sem-access-box');
    box.hidden = true;
    box.appendChild(el('p', 'sem-access-box-label', D.ui.accessLevelLabel));

    var selBox = el('div', 'sem-access-box-select');
    var select = document.createElement('select');
    select.setAttribute('aria-label', D.ui.accessLevelLabel);
    D.nivelOrder.forEach(function (lvl) {
      var opt = document.createElement('option');
      opt.value = lvl;
      opt.textContent = D.nivelNames[lvl];
      select.appendChild(opt);
    });
    selBox.appendChild(select);
    box.appendChild(selBox);
    box.appendChild(el('p', 'sem-access-box-hint', D.ui.accessLevelHint));

    demo.addEventListener('click', function () {
      box.hidden = !box.hidden;
      demo.setAttribute('aria-expanded', box.hidden ? 'false' : 'true');
      if (!box.hidden) select.focus();
    });

    select.addEventListener('change', function () {
      SESSION.write({ name: 'Perfil demo ZAG', level: select.value });
      state.session = SESSION.read();
      cerrarAcceso();
      repintarReservas();
      anunciar('Perfil demo activado. Ya podés reservar tu lugar en el seminario.');
    });

    host.appendChild(actions);
    host.appendChild(box);

    var pri = host.querySelector('a, button, select');
    if (pri) pri.focus();
  }

  function abrirAcceso() {
    var host = $('sem-access');
    if (!host) return;
    FOCO_SIN_SESION = document.activeElement;
    renderAcceso();
    host.hidden = false;
    host.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function cerrarAcceso() {
    var host = $('sem-access');
    if (host) host.hidden = true;
    if (FOCO_SIN_SESION && FOCO_SIN_SESION.focus) FOCO_SIN_SESION.focus();
    FOCO_SIN_SESION = null;
  }

  /* ============================================================
     Popup
     ============================================================ */

  var FOCO_PREVIO = null;
  var FOCO_DIA = null;

  function focusables(host) {
    return Array.prototype.filter.call(
      host.querySelectorAll('a[href], button:not([disabled]), select, [tabindex]:not([tabindex="-1"])'),
      function (n) { return n.offsetParent !== null; }
    );
  }

  function abrirModal(d) {
    var modal = $('sem-modal');
    if (!modal) return;

    FOCO_PREVIO = document.activeElement;
    FOCO_DIA = d.id;

    $('sem-modal-title').textContent = D.ui.modalTitulo;
    $('sem-modal-copy').textContent = D.ui.modalCopy
      .replace('{dia}', d.label)
      .replace('{fechaLarga}', d.fechaLarga);
    $('sem-modal-detalle').textContent = D.evento.horarioConfirmado ? '' : D.ui.modalDetalle;

    var cal = $('sem-modal-calendar');
    cal.href = urlCalendar(d);
    cal.querySelector('.sem-modal-calendar-txt').textContent = D.ui.modalCalendar;

    $('sem-modal-cta').textContent = D.ui.modalEntendido;

    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    modal.addEventListener('keydown', onModalKey);
    $('sem-modal-cta').focus();
  }

  function cerrarModal() {
    var modal = $('sem-modal');
    if (!modal || modal.hidden) return;

    modal.hidden = true;
    document.body.style.overflow = '';
    modal.removeEventListener('keydown', onModalKey);

    var destino = FOCO_DIA
      ? document.querySelector('.sem-reserva .sem-btn[data-dia="' + FOCO_DIA + '"]')
      : null;
    if (destino && destino.focus) destino.focus();
    else if (FOCO_PREVIO && FOCO_PREVIO.focus) FOCO_PREVIO.focus();

    FOCO_PREVIO = null;
    FOCO_DIA = null;
  }

  function onModalKey(e) {
    if (e.key === 'Escape') { e.preventDefault(); cerrarModal(); return; }
    if (e.key !== 'Tab') return;

    var f = focusables($('sem-modal'));
    if (!f.length) return;
    var first = f[0];
    var last = f[f.length - 1];

    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  function initModal() {
    var modal = $('sem-modal');
    if (!modal) return;

    $('sem-modal-cta').addEventListener('click', cerrarModal);
    Array.prototype.forEach.call(modal.querySelectorAll('[data-close]'), function (n) {
      n.addEventListener('click', cerrarModal);
    });
  }

  /* ============================================================
     Reiniciar demo
     ============================================================ */

  function initReset() {
    var btn = $('sem-reset');
    if (!btn) return;

    btn.textContent = D.ui.resetDemo;
    btn.title = D.ui.resetDemo;

    btn.addEventListener('click', function () {
      try { window.localStorage.removeItem(D.LS_RESERVAS); } catch (e) { /* nada */ }
      state.reservas = {};
      repintarReservas();
      anunciar(D.ui.resetHecho);
    });
  }

  /* ============================================================
     Reveal escalonado (robusto: sin IO, sin transición)
     ============================================================ */

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

  function enPantalla(n, margen) {
    var r = n.getBoundingClientRect();
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
    var pendientes = document.querySelectorAll('.sem-row:not(.is-in), .sem-speaker:not(.is-in)');
    Array.prototype.forEach.call(pendientes, function (n) {
      if (enPantalla(n, margen)) {
        n.classList.add('is-in');
        if (revealIO) revealIO.unobserve(n);
      } else {
        quedan++;
      }
    });
    return quedan;
  }

  function revelarRows(scope) {
    var targets = scope ? scope.querySelectorAll('.sem-row, .sem-speaker') : document.querySelectorAll('.sem-row, .sem-speaker');
    if (!revealIO) {
      Array.prototype.forEach.call(targets, function (t) { t.classList.add('is-in'); });
      return;
    }
    Array.prototype.forEach.call(targets, function (t) { revealIO.observe(t); });
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
     Arranque
     ============================================================ */

  function init() {
    leerURL();
    initHero();
    initMarquee();
    initCountdown();
    renderLineup();
    renderMarcas();
    initTabs();
    initFiltro();
    initVista();
    initModal();
    initReset();
    pintarTabs();
    pintarPanel();
    pintarHeroDays();
    pintarFinalDays();
    renderChipSesion();
    revelarRows(null);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return {
    cuposLibres: cuposLibres,
    repintarReservas: repintarReservas,
  };
})();