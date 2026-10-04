/* ============================================================
   MENTORÍAS ZAG (mentorias.html)

   Arma las tarjetas de mentores, los filtros, el agendador con
   calendario y horas, las reservas demo en localStorage, el bloque
   de acceso, el popup de confirmación y el enlace de Google
   Calendar.

   Depende de: js/content.js, js/main.js, js/zag-session.js,
   js/zag-reserva.js, js/mentorias-data.js.

   Todo el texto dinámico entra por textContent, y todo lo que toca
   localStorage va dentro de try/catch.
   ============================================================ */

(function () {
  'use strict';

  var D = window.ZAG_MENTORIAS;
  if (!D) return;

  var UI = D.ui;
  var TZ = D.TZ;
  var LUGAR = 'ZAG Room';

  /* Los colores de mentor llegan como nombre corto y se resuelven a
     token, para no escribir ningún color literal en el JS. */
  var COLOR = {
    naranja: 'var(--color-cta)',
    azul: 'var(--color-functional)',
    azulprofundo: 'var(--color-brand-deep)',
    crema: 'var(--color-beige)',
    beige: 'var(--color-grey-soft)',
  };

  var ICONO_CAT = {
    todos: 'M4 7h16M4 12h16M4 17h10',
    reloj: 'M12 7v5l3.2 2M20 12a8 8 0 1 1-16 0 8 8 0 0 1 16 0z',
    pauta: 'M4 19V9M9 19V5M14 19v-7M19 19V8',
    branding: 'M12 3.5l2.4 5.3 5.6.6-4.2 3.9 1.2 5.6L12 16l-5 2.9 1.2-5.6L4 9.4l5.6-.6z',
    contenido: 'M4 6h16M4 11h16M4 16h9',
    uxui: 'M4 5h16v11H4zM9 20h6M12 16v4',
    growth: 'M4 18l5-6 4 3 7-8M15 7h5v5',
    audiovisual: 'M4 6h11a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4zM17 10l4-2v8l-4-2',
    portafolio: 'M4 8h16v12H4zM9 8V6h6v2',
  };

  var SESSION = window.ZAG_SESSION || {
    read: function () { return null; },
    write: function () {},
    clear: function () {},
  };

  var state = {
    session: null,
    reservas: [],
    filtro: 'todos',
    modalidad: 'todas',
    soloReservables: false,
    busqueda: '',
   confirmando: false,
    cancelando: null,
    ag: {
      abierto: false,
      mentorId: null,
      tipo: 'grupal',
      fecha: null,
      slot: null,
      modalidad: null,
      mes: 0,
      foco: null,
    },
  };

  /* ============================================================
     Helpers
     ============================================================ */

  function $(id) { return document.getElementById(id); }

  function el(tag, cls, txt) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (txt != null) n.textContent = txt;
    return n;
  }

  function txt(id, s) {
    var n = $(id);
    if (n) n.textContent = s == null ? '' : s;
  }

  function svg(path, w) {
    var s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 24 24');
    s.setAttribute('width', w || 16);
    s.setAttribute('height', w || 16);
    s.setAttribute('aria-hidden', 'true');
    s.setAttribute('focusable', 'false');
    var p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p.setAttribute('d', path);
    p.setAttribute('fill', 'none');
    p.setAttribute('stroke', 'currentColor');
    p.setAttribute('stroke-width', '1.9');
    p.setAttribute('stroke-linecap', 'round');
    p.setAttribute('stroke-linejoin', 'round');
    s.appendChild(p);
    return s;
  }

  function txt1(plantilla, mapa) {
    return plantilla.replace(/\{(\w+)\}/g, function (m, k) {
      return mapa && mapa[k] != null ? mapa[k] : m;
    });
  }

  /* Sin tildes, minúsculas y sin signos: "Sofia" encuentra a "Sofía". */
  function normalizar(s) {
    if (!s) return '';
    var n = s.toLowerCase();
    if (n.normalize) n = n.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return n.replace(/[^a-z0-9ñ\s]/g, ' ').replace(/\s+/g, ' ').trim();
  }

  function anunciar(s) { txt('mentorias-live', s); }

  function mentor(id) {
    for (var i = 0; i < D.mentores.length; i++) {
      if (D.mentores[i].id === id) return D.mentores[i];
    }
    return null;
  }

  function nivelActual() { return state.session && state.session.level ? state.session.level : null; }

  function indiceNivel(n) { return D.nivelOrder.indexOf(n); }

  function esSenior() { return nivelActual() === 'senior'; }

  /* ¿Alcanza el nivel del estudiante para las grupales de este mentor? */
  function grupalAbierta(m) {
    var act = nivelActual();
    if (!act) return false;
    return indiceNivel(act) >= indiceNivel(m.minNivelGrupal);
  }

  /* Cuántos niveles faltan entre el actual y el pedido. */
  function faltanNiveles(hasta) {
    var a = indiceNivel(nivelActual() || D.nivelOrder[0]);
    var b = indiceNivel(hasta);
    return Math.max(0, b - a);
  }

  function nivelTexto(n) { return D.nivelNames[n] || n; }

  function nombreArea(id) {
    for (var i = 0; i < D.categorias.length; i++) {
      if (D.categorias[i].id === id) return D.categorias[i].label;
    }
    return id;
  }

  /* ============================================================
     Sesiones y cupos
     ============================================================ */

  function sesionesDe(mentorId, tipo) {
    return D.sesiones.filter(function (s) {
      return s.mentorId === mentorId && s.tipo === tipo;
    });
  }

  function sesionesHoyDe(mentorId, tipo) {
    var hoy = D.hoyISO();
    return sesionesDe(mentorId, tipo).filter(function (s) { return s.fecha === hoy; });
  }

  /* Cupos que ve el estudiante: los de la demo más lo que élocupó. */
  function cuposLibres(s) {
    var libres = s.cupos - s.ocupados;
    if (reservaDe(s)) libres -= 1;
    return libres;
  }

  function primerGrupoLibre(m) {
    var l = sesionesDe(m.id, 'grupal').filter(function (s) { return cuposLibres(s) > 0; });
    return l.length ? l[0] : null;
  }

  /* ¿Tiene algún horario grupal con cupos dentro de los próximos días? */
  function disponibleEstaSemana(m) {
    var hoy = D.hoyISO();
    var hasta = D.sumarDias(hoy, 7);
    return sesionesDe(m.id, 'grupal').some(function (s) {
      return s.fecha >= hoy && s.fecha <= hasta && cuposLibres(s) > 0;
    });
  }

  /* ============================================================
     Reservas (localStorage)
     ============================================================ */

  function cargarReservas() {
    var raw = null;
    try { raw = window.localStorage.getItem(D.LS_RESERVAS); } catch (e) { return; }
    if (!raw) return;
    var arr;
    try { arr = JSON.parse(raw); } catch (e) { return; }
    if (!Array.isArray(arr)) return;
    state.reservas = arr.filter(function (r) {
      return r && mentor(r.mentorId) && (r.tipo === 'grupal' || r.tipo === '1a1') && r.fechaISO;
    });
  }

  function guardarReservas() {
    try {
      window.localStorage.setItem(D.LS_RESERVAS, JSON.stringify(state.reservas));
    } catch (e) { /* sin storage: la demo sigue en memoria */ }
  }

  function mismaReserva(r, s) {
    return r.mentorId === s.mentorId && r.tipo === s.tipo && r.fechaISO === s.fechaISO;
  }

  function reservaDe(s) {
    return state.reservas.some(function (r) { return mismaReserva(r, s); });
  }

  function reservasDe(mentorId) {
    return state.reservas.filter(function (r) { return r.mentorId === mentorId; });
  }

  function reservaPorFecha(fechaISO) {
    return state.reservas.filter(function (r) { return r.fechaISO === fechaISO; });
  }

  /* Devuelve el motivo del bloqueo, o null si se puede reservar. */
  function bloqueo(s, m) {
    var libres = cuposLibres(s);
    if (libres <= 0) return 'lleno';
    if (reservaDe(s)) return 'mio';

    if (s.tipo === '1a1' && !esSenior()) {
      return txt1(UI.nivelInsuficiente, { nivel: nivelTexto('senior') });
    }
    if (s.tipo === 'grupal' && !grupalAbierta(m)) {
      return txt1(UI.nivelInsuficiente, { nivel: nivelTexto(m.minNivelGrupal) });
    }
    if (reservasDe(m.id).length >= D.maxPorMentor) {
      return txt1(UI.topeMentor, { mentor: m.nombre });
    }
    if (state.reservas.length >= D.maxTotal) {
      return txt1(UI.topeTotal, { n: state.reservas.length });
    }
    return null;
  }

  function finISO(s) { return s.fecha + 'T' + s.fin + ':00-05:00'; }

  /* ============================================================
     Filtros
     ============================================================ */

  function pasaFiltroCategoria(m) {
    if (state.filtro === 'todos') return true;
    if (state.filtro === 'semana') return disponibleEstaSemana(m);
    return m.categorias.indexOf(state.filtro) !== -1;
  }

  function pasaFiltroModalidad(m) {
    if (state.modalidad === 'todas') return true;
    return m.modalidades.indexOf(state.modalidad) !== -1;
  }

  function pasaBusqueda(m) {
    if (!state.busqueda) return true;
    var q = normalizar(state.busqueda);
    if (!q) return true;
    var aplicable = [
      m.nombre, m.cargo, m.empresa, m.especialidad,
      m.temas.join(' '), m.categorias.map(nombreArea).join(' '),
    ].join(' ');
    return normalizar(aplicable).indexOf(q) !== -1;
  }

  function pasaSoloReservables(m) {
    if (!state.soloReservables) return true;
    return grupalAbierta(m) && !!primerGrupoLibre(m);
  }

  function mentoresFiltrados() {
    return D.mentores.filter(function (m) {
      return pasaFiltroCategoria(m) && pasaFiltroModalidad(m) &&
             pasaBusqueda(m) && pasaSoloReservables(m);
    });
  }

  function hayFiltros() {
    return state.filtro !== 'todos' || state.modalidad !== 'todas' ||
           state.soloReservables || !!state.busqueda;
  }

  /* ============================================================
     Google Calendar
     ============================================================ */

  function calStamp(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/.exec(iso);
    return m ? m[1] + m[2] + m[3] + 'T' + m[4] + m[5] + m[6] : '';
  }

  function buildGoogleCalendarUrl(s, m, modalidad) {
    var tipo = s.tipo === '1a1' ? '1:1' : 'grupal';
    var presencial = modalidad === 'presencial';
    var resumen = 'Mentoría ' + tipo + ' · ' + m.nombre + ' · Mentorías ZAG';
    var detalles = m.especialidad + '\n\nTemas: ' + m.temas.join(', ') +
      '\n\nMentorías ZAG · EAM';

    var p = {
      text: resumen,
      dates: calStamp(s.fechaISO) + '/' + calStamp(finISO(s)),
      details: detalles,
      location: presencial ? LUGAR + ' · Campus EAM' : 'Google Meet',
      ctz: TZ,
    };

    if (window.ZAG_RESERVA) return window.ZAG_RESERVA.buildGoogleCalendarUrl(p);

    var params = new URLSearchParams();
    params.set('action', 'TEMPLATE');
    params.set('text', p.text);
    params.set('dates', p.dates);
    params.set('details', p.details);
    params.set('location', p.location);
    params.set('ctz', TZ);
    return 'https://calendar.google.com/calendar/render?' + params.toString();
  }

  /* ============================================================
     Hero
     ============================================================ */

  function initHero() {
    txt('mentorias-hero-kicker', UI.heroPill);

    var t = $('mentorias-hero-title');
    if (t) {
      t.textContent = UI.heroTitleA;
      t.appendChild(el('span', 'zag-hero__title-accent', ' ' + UI.heroTitleB));
    }

    txt('mentorias-hero-sub', UI.heroSub);
    renderHeroEstado();
  }

  function renderHeroEstado() {
    var host = $('mentorias-hero-estado');
    if (!host) return;
    host.textContent = '';

    if (!state.session) {
      host.hidden = false;
      host.appendChild(document.createTextNode(UI.sinSesionTexto + ' '));
      var b = el('button', 'mentorias-hero-demo', UI.sinSesionCta);
      b.type = 'button';
      b.addEventListener('click', function () { abrirAcceso(b); });
      host.appendChild(b);
      return;
    }

    host.hidden = false;
    var g = el('b', null, 'Grupales:');
    host.appendChild(g);
    host.appendChild(document.createTextNode(' ✓ desbloqueadas'));

    host.appendChild(document.createTextNode(' · '));
    var u = el('b', null, '1:1:');
    host.appendChild(u);

    if (esSenior()) {
      host.appendChild(document.createTextNode(' ✓ desbloqueada'));
    } else {
      var n = faltanNiveles('senior');
      host.appendChild(document.createTextNode(
        ' 🔒 te ' + (n === 1 ? 'falta' : 'faltan') + ' ' + n +
        (n === 1 ? ' nivel' : ' niveles')
      ));
    }
  }

  /* ============================================================
     Bloque 1:1 del final de la página
     ============================================================ */

  function render1a1() {
    txt('mentorias-1a1-kicker', UI.unoAUnoKicker);

    var n = faltanNiveles('senior');
    txt('mentorias-1a1-title', esSenior() ? UI.estado1a1Listo : UI.unoAUnoTitulo);
    txt('mentorias-1a1-copy', esSenior()
      ? 'Reservá un 1:1 con el mentor que quieras: 45 minutos, presencial en el Campus o por Google Meet.'
      : txt1(UI.unoAUnoCopy, {
          n: n,
          nivel: n === 1 ? 'nivel' : 'niveles',
        })
    );

    var cta = $('mentorias-1a1-cta');
    if (!cta) return;

    if (esSenior()) {
      cta.textContent = 'Elegí mentor para tu 1:1 ↓';
      cta.href = '#mentorias-lista-title';
      cta.onclick = function () {
        var primera = D.mentores[0];
        abrirAg(primera.id, '1a1');
      };
    } else {
      cta.textContent = UI.unoAUnoCta;
      cta.href = 'perfil.html#retos';
      cta.onclick = null;
    }
  }

  /* ============================================================
     ¿En qué necesitas ayuda?
     ============================================================ */

  function renderAreas() {
    txt('mentorias-areas-kicker', UI.necesidadesKicker);
    txt('mentorias-areas-title', UI.necesidadesTitulo);

    var grid = $('mentorias-areas-grid');
    grid.textContent = '';

    D.areas.forEach(function (area) {
      var b = el('button', 'mentoria-area mentoria-area--' + area.id);
      b.type = 'button';
      b.setAttribute('aria-pressed', state.filtro === area.id ? 'true' : 'false');

      b.appendChild(el('span', 'mentoria-area-titulo', area.titulo));
      b.appendChild(el('span', 'mentoria-area-copy', area.copy));
      b.appendChild(el('span', 'mentoria-area-nota', '“' + area.nota + '”'));
      b.appendChild(el('span', 'mentoria-area-cta', UI.necesidadesCta));

      b.addEventListener('click', function () {
        limpiarFiltros();
        state.filtro = area.id;
        render();
        anunciar(txt1(UI.filtroAplicado, { n: mentoresFiltrados().length }));
        var inicio = $('mentorias-chips');
        if (inicio) inicio.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });

      grid.appendChild(b);
    });
  }

  /* ============================================================
     Chips de categoría
     ============================================================ */

  function conteoCategoria(id) {
    return D.mentores.filter(function (m) {
      if (id === 'todos') return true;
      if (id === 'semana') return disponibleEstaSemana(m);
      return m.categorias.indexOf(id) !== -1;
    }).length;
  }

  function renderChips() {
    var host = $('mentorias-chips');
    host.textContent = '';

    D.categorias.forEach(function (cat) {
      var n = conteoCategoria(cat.id);
      var b = el('button', 'mentoria-chip');
      b.type = 'button';
      b.dataset.cat = cat.id;
      b.setAttribute('aria-pressed', state.filtro === cat.id ? 'true' : 'false');
      b.disabled = n === 0 && cat.id !== state.filtro;
      b.appendChild(svg(ICONO_CAT[cat.id] || ICONO_CAT.todos, 15));
      b.appendChild(el('span', null, cat.label));
      b.appendChild(el('span', 'mentoria-chip-n', String(n)));
      b.addEventListener('click', function () {
        state.filtro = state.filtro === cat.id && cat.id !== 'todos' ? 'todos' : cat.id;
        render();
        anunciar(txt1(UI.filtroAplicado, { n: mentoresFiltrados().length }));
      });
      host.appendChild(b);
    });
  }

  function renderFiltros() {
    var input = $('mentorias-busca');
    if (input) input.placeholder = UI.buscadorLabel;
    txt('mentorias-solo-reservables-txt', UI.soloReservables);

    var sel = $('mentorias-modalidad');
    if (sel && !sel.options.length) {
      sel.appendChild(new Option(UI.modalidadTodas, 'todas'));
      sel.appendChild(new Option(UI.modalidadPresencial, 'presencial'));
      sel.appendChild(new Option(UI.modalidadVirtual, 'virtual'));
    }
    if (sel) sel.value = state.modalidad;

    var check = $('mentorias-solo-reservables');
    if (check) {
      check.checked = state.soloReservables;
      /* Sin sesión no hay nivel, así que el filtro no puede responder. */
      check.disabled = !state.session;
      check.closest('.mentorias-check').title = state.session
        ? ''
        : UI.sinSesionCta;
    }

    var limpiar = $('mentorias-limpiar');
    if (limpiar) limpiar.hidden = !hayFiltros();
  }

  /* ============================================================
     Tarjetas de mentores
     ============================================================ */

  function etiquetaModalidad(mod) {
    return mod === 'presencial' ? UI.modalidadPresencial : UI.modalidadVirtual;
  }

  function tarjeta(m) {
    var card = el('article', 'mentor-card mentor-card--' + m.color);
    card.dataset.mentor = m.id;

    /* --- foto --- */
    var media = el('div', 'mentor-card-media');
    var fallback = el('span', 'mentor-card-fallback', m.iniciales);
    fallback.hidden = true;
    media.appendChild(fallback);

    var img = document.createElement('img');
    img.className = 'mentor-card-foto';
    img.src = m.foto;
    img.alt = m.nombre + ', ' + m.cargo;
    img.loading = 'lazy';
    img.width = 800;
    img.height = 1000;
    img.style.setProperty('--mentor-color', COLOR[m.color] || COLOR.naranja);
    img.addEventListener('error', function () {
      img.hidden = true;
      fallback.hidden = false;
    });
    media.appendChild(img);

    media.appendChild(el('span', 'mentor-card-id', m.egreso === 0 ? 'ZAG' : 'Egresado ' + m.egreso));

    var tags = el('div', 'mentor-card-tags');
    m.temas.forEach(function (t) { tags.appendChild(el('span', 'mentor-tag', t)); });
    media.appendChild(tags);

    card.appendChild(media);

    /* --- cuerpo --- */
    var body = el('div', 'mentor-card-body');

    body.appendChild(el('h3', 'mentor-card-name', m.nombre));
    body.appendChild(el('p', 'mentor-card-rol', m.cargo + ' · ' + m.empresa));
    body.appendChild(el('p', 'mentor-card-especialidad', m.especialidad));

    var bio = el('p', 'mentor-card-bio mentor-card-bio--corta', m.bio);
    body.appendChild(bio);

    var bioBtn = el('button', 'mentor-bio-toggle', UI.leerMas);
    bioBtn.type = 'button';
    bioBtn.setAttribute('aria-expanded', 'false');
    bioBtn.addEventListener('click', function () {
      var corta = bio.classList.toggle('mentor-card-bio--corta');
      bioBtn.textContent = corta ? UI.leerMas : UI.leerMenos;
      bioBtn.setAttribute('aria-expanded', corta ? 'false' : 'true');
    });
    body.appendChild(bioBtn);

    body.appendChild(el('p', 'mentor-card-kicker', UI.puedeAyudarte));
    var temas = el('ul', 'mentor-card-temas');
    m.areas.map(nombreArea).forEach(function (a) {
      temas.appendChild(el('li', 'mentor-tema', a));
    });
    body.appendChild(temas);

    var datos = el('dl', 'mentor-card-datos');
    [['Sesiones dadas', String(m.sesionesDadas)], ['Asistencia', m.asistencia + '%']]
      .forEach(function (par) {
        var d = el('div', 'mentor-dato');
        d.appendChild(el('dt', null, par[0]));
        d.appendChild(el('dd', null, par[1]));
        datos.appendChild(d);
      });
    body.appendChild(datos);

    /* --- próxima grupal --- */
    var prox = primerGrupoLibre(m);
    if (prox) {
      var p = el('div', 'mentor-card-proxima');
      var b = el('b', null, 'Próxima: ');
      b.appendChild(document.createTextNode(''));
      p.appendChild(b);
      p.lastChild.textContent = 'Próxima: ' + D.fechaMedia(prox.fecha) + ' · ' +
        prox.inicio + ' · ' + etiquetaModalidad(prox.modalidad) + ' · ' +
        cuposLibres(prox) + ' de ' + prox.cupos + ' cupos';
      body.appendChild(p);
    }

    var minis = el('div', 'mentor-card-tags-mini');
    m.reglasGrupal.forEach(function (r) {
      minis.appendChild(el('span', 'mentor-mini', r.dia + ' ' + r.hora + ' · ' + etiquetaModalidad(r.modalidad)));
    });
    body.appendChild(minis);

    /* --- badges --- */
    var mias = reservasDe(m.id);
    if (mias.length) {
      var r0 = mias[0];
      var ses0 = sesionDe(r0);
      body.appendChild(el('span', 'mentor-badge-reserva',
        txt1(UI.tagReservada, { fecha: ses0 ? D.fechaCorta(ses0.fecha) : '' })));
    } else if (prox && cuposLibres(prox) <= D.minCuposBadge) {
      body.appendChild(el('span', 'mentor-badge-urgente',
        txt1(UI.tagUrgencia, { n: cuposLibres(prox) })));
    }

    /* --- 1:1 --- */
    var linea1a1 = el('div', 'mentor-card-proxima');
    if (esSenior()) {
      linea1a1.appendChild(el('b', null, '1:1: 45 min, cuando quieras.'));
    } else {
      linea1a1.appendChild(el('b', null, '1:1: 🔒 solo nivel Senior.'));
    }
    body.appendChild(linea1a1);

    /* El bloqueo por nivel solo se afirma cuando hay sesión: sin
       sesión no sabemos el nivel, así que no se dice "subí de nivel". */
    var bloqueado = !!state.session && !grupalAbierta(m);

    if (bloqueado) {
      body.appendChild(el('span', 'mentor-card-lock',
        txt1(UI.bloqueadaTexto, { nivel: nivelTexto(m.minNivelGrupal) })));
    }

    /* --- pie --- */
    var foot = el('div', 'mentor-card-foot');

    var cta = el('button', 'mentor-card-cta' + (bloqueado ? ' mentor-card-cta--outline' : ''));
    cta.type = 'button';
    cta.dataset.cta = m.id;
    cta.textContent = bloqueado ? UI.ctaBloqueada : UI.ctaVerHorarios;
    cta.addEventListener('click', function () {
      /* Sin sesión: primero el perfil, no la página de niveles. */
      if (!state.session) {
        abrirAcceso(cta, UI.sinSesionReserva);
        return;
      }
      if (bloqueado) {
        window.location.href = 'perfil.html#retos';
        return;
      }
      abrirAg(m.id, 'grupal');
    });
    foot.appendChild(cta);

    if (esSenior()) {
      var cta1 = el('button', 'mentor-card-cta mentor-card-cta--outline');
      cta1.type = 'button';
      cta1.textContent = 'Reservar 1:1';
      cta1.addEventListener('click', function () { abrirAg(m.id, '1a1'); });
      foot.appendChild(cta1);
    }

    body.appendChild(foot);
    card.appendChild(body);
    return card;
  }

  function sesionDe(r) {
    for (var i = 0; i < D.sesiones.length; i++) {
      if (D.sesiones[i].mentorId === r.mentorId &&
          D.sesiones[i].tipo === r.tipo &&
          D.sesiones[i].fechaISO === r.fechaISO) {
        return D.sesiones[i];
      }
    }
    return null;
  }

  function renderGrid() {
    var grid = $('mentorias-grid');
    grid.textContent = '';

    var lista = mentoresFiltrados();

    var n = lista.length;
    txt('mentorias-contador', n === 1 ? UI.contadorSingular : txt1(UI.contador, { n: n }));

    if (!n) {
      grid.appendChild(el('p', 'mentor-vacio', UI.vacio));
      return;
    }

    lista.forEach(function (m) { grid.appendChild(tarjeta(m)); });
    observarTarjetas();
  }

  /* ============================================================
     Tus próximas mentorías
     ============================================================ */

  function renderProximas() {
    var section = $('mentorias-proximas-section');
    var lista = $('mentorias-proximas-lista');

    if (!state.session || !state.reservas.length) {
      section.hidden = true;
      lista.textContent = '';
      return;
    }

    section.hidden = false;
    txt('mentorias-proximas-kicker', UI.proximasKicker);
    txt('mentorias-proximas-title', UI.proximasTitulo);
    lista.textContent = '';

    state.reservas
      .slice()
      .sort(function (a, b) { return Date.parse(a.fechaISO) - Date.parse(b.fechaISO); })
      .forEach(function (r) {
        var m = mentor(r.mentorId);
        var s = sesionDe(r);
        if (!m || !s) return;

        var li = el('li', 'mentorias-prox');

        var fb = el('span', 'mentorias-prox-foto mentorias-prox-foto--bloque', m.iniciales);
        fb.style.background = COLOR[m.color] || COLOR.naranja;
        li.appendChild(fb);

        var body = el('div', 'mentorias-prox-body');
        body.appendChild(el('span', 'mentorias-prox-nombre',
          m.nombre + ' · ' + (s.tipo === '1a1' ? UI.tipo1a1Corto : UI.tipoGrupalCorto)));
        body.appendChild(el('span', 'mentorias-prox-cuando',
          D.fechaLarga(s.fecha) + ' · ' + s.inicio + '–' + s.fin + ' · ' +
          etiquetaModalidad(r.modalidad || s.modalidad)));
        li.appendChild(body);

        var btn = el('button', 'mentorias-prox-quitar', UI.cancelar);
        btn.type = 'button';
        btn.setAttribute('aria-label',
          UI.cancelar + ' la mentoría con ' + m.nombre + ' del ' + D.fechaMedia(s.fecha));
        btn.addEventListener('click', function () { abrirCancel(r); });
        li.appendChild(btn);

        lista.appendChild(li);
      });
  }

  /* ============================================================
     Chip de sesión
     ============================================================ */

  function renderChipSesion() {
    var chip = $('mentorias-session-chip');
    if (!chip) return;
    if (state.session) {
      chip.textContent = nivelTexto(state.session.level) + ' · demo';
      chip.hidden = false;
    } else {
      chip.hidden = true;
      chip.textContent = '';
    }
  }

  /* ============================================================
     Bloque de acceso
     ============================================================ */

  var FOCO_SIN_SESION = null;

  function renderAcceso(mensaje) {
    var host = $('mentorias-access');
    host.textContent = '';

    host.appendChild(el('p', 'mentorias-access-kicker', UI.accesoKicker));
    host.appendChild(el('h2', 'mentorias-access-title', UI.accesoTitulo));
    host.appendChild(el('p', 'mentorias-access-copy', mensaje || UI.accesoCopy));

    var actions = el('div', 'mentorias-access-actions');

    var primary = document.createElement('a');
    primary.className = 'btn btn--outline';
    primary.href = 'registro.html';
    primary.textContent = UI.accesoPrimario;
    actions.appendChild(primary);

    var demo = el('button', 'btn', UI.accesoSecundario);
    demo.type = 'button';
    demo.setAttribute('aria-expanded', 'false');
    actions.appendChild(demo);

    var box = el('div', 'mentorias-access-box');
    box.hidden = true;
    box.appendChild(el('p', 'mentorias-access-box-label', UI.accesoNivelLabel));

    var selBox = el('div', 'mentorias-access-box-select');
    var select = document.createElement('select');
    select.className = 'mentorias-select';
    select.setAttribute('aria-label', UI.accesoNivelLabel);
    D.nivelOrder.forEach(function (lvl) {
      select.appendChild(new Option(D.nivelNames[lvl], lvl));
    });
    selBox.appendChild(select);
    box.appendChild(selBox);
    box.appendChild(el('p', 'mentorias-access-box-hint', UI.accesoNivelHint));

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
      anunciar(UI.accesoListo);
    });

    host.appendChild(actions);
    host.appendChild(box);
  }

  function abrirAcceso(origen, mensaje) {
    var host = $('mentorias-access');
    if (!host) return;

    FOCO_SIN_SESION = origen || document.activeElement;
    renderAcceso(mensaje);
    host.hidden = false;
    host.scrollIntoView({ behavior: 'smooth', block: 'center' });

    /* El foco va de una: esperar al scroll retarda al lector de pantalla. */
    var demo = host.querySelector('.mentorias-access-actions .btn:not(.btn--outline)');
    if (demo) demo.focus();
  }

  function cerrarAcceso() {
    var host = $('mentorias-access');
    if (host) host.hidden = true;
    if (FOCO_SIN_SESION && FOCO_SIN_SESION.focus) FOCO_SIN_SESION.focus();
    FOCO_SIN_SESION = null;
  }

  /* ============================================================
     Agendador — calendario
     ============================================================ */

  /* Meses que tienen horarios para este mentor y tipo. */
  function mesesDisponibles(m, tipo) {
    if (!m) return [];
    var vistos = {};
    var lista = [];
    sesionesDe(m.id, tipo).forEach(function (s) {
      var ma = D.mesAnio(s.fecha);
      var k = ma.y + '-' + ma.m;
      if (vistos[k]) return;
      vistos[k] = true;
      lista.push(ma);
    });
    lista.sort(function (a, b) { return a.y - b.y || a.m - b.m; });
    return lista;
  }

  function abrirAg(mentorId, tipo) {
    var m = mentor(mentorId);
    if (!m) return;

    /* Sin sesión primero: el pedido de reserva abre el acceso. */
    if (!state.session) {
      abrirAcceso(null, UI.sinSesionReserva);
      return;
    }
    if (tipo === '1a1' && !esSenior()) {
      anunciar(txt1(UI.nivelInsuficiente, { nivel: nivelTexto('senior') }));
      return;
    }
    if (tipo === 'grupal' && !grupalAbierta(m)) {
      anunciar(txt1(UI.nivelInsuficiente, { nivel: nivelTexto(m.minNivelGrupal) }));
      return;
    }

    var ag = state.ag;
    ag.abierto = true;
    ag.mentorId = mentorId;
    ag.tipo = tipo;
    ag.slot = null;
    ag.modalidad = null;

    var meses = mesesDisponibles(m, tipo);
    var primera = sesionesDe(m, tipo)[0];
    var mesSel = primera ? D.mesAnio(primera.fecha) : meses[0];
    ag.mes = Math.max(0, meses.findIndex(function (x) {
      return x.y === mesSel.y && x.m === mesSel.m;
    }));
    ag.foco = null;

    var dlg = $('mentorias-ag');
    dlg.hidden = false;
    document.body.style.overflow = 'hidden';
    dlg.addEventListener('keydown', onAgKey);

    renderAg();

    var x = $('mentorias-ag-x');
    if (x) x.focus();
  }

  function cerrarAg() {
    var dlg = $('mentorias-ag');
    if (!dlg || dlg.hidden) return;

    dlg.hidden = true;
    dlg.removeEventListener('keydown', onAgKey);
    document.body.style.overflow = '';

    var ag = state.ag;
    ag.abierto = false;
    ag.slot = null;
    ag.modalidad = null;
    ag.foco = null;

    /* Volver al botón del mentor que abrió el agendador. */
    var btn = ag.mentorId && document.querySelector('[data-cta="' + ag.mentorId + '"]');
    if (btn) btn.focus();
  }

  function mesesAg() { return mesesDisponibles(mentor(state.ag.mentorId), state.ag.tipo); }

  function renderAg() {
    var m = mentor(state.ag.mentorId);
    if (!m) return;

    txt('mentorias-ag-kicker', UI.agKicker);
    txt('mentorias-ag-title', UI.agTitulo);
    txt('mentorias-ag-mentor', m.nombre + ' · ' + m.cargo + ' · ' + m.empresa);

    renderAgTabs();
    renderAgInfo(m);
    renderCal(m);
    renderHoras(m);
    renderAgPie(m);
  }

  function renderAgTabs() {
    var g = $('mentorias-ag-tab-grupal');
    var u = $('mentorias-ag-tab-1a1');

    g.textContent = UI.tabGrupal;
    u.textContent = UI.tab1a1 + (esSenior() ? '' : ' 🔒');

    var activoGrupo = state.ag.tipo === 'grupal';
    g.classList.toggle('is-active', activoGrupo);
    g.setAttribute('aria-selected', activoGrupo ? 'true' : 'false');
    g.tabIndex = activoGrupo ? 0 : -1;

    u.classList.toggle('is-active', !activoGrupo);
    u.setAttribute('aria-selected', !activoGrupo ? 'true' : 'false');
    u.tabIndex = activoGrupo ? -1 : 0;
    u.disabled = !esSenior();
    u.title = esSenior() ? '' : txt1(UI.nivelInsuficiente, { nivel: nivelTexto('senior') });

    var panel = $('mentorias-ag-panel-cal');
    panel.setAttribute('aria-labelledby', activoGrupo ? 'mentorias-ag-tab-grupal' : 'mentorias-ag-tab-1a1');
  }

  function setTipo(tipo) {
    if (tipo === '1a1' && !esSenior()) return;
    if (state.ag.tipo === tipo) return;

    var m = mentor(state.ag.mentorId);
    state.ag.tipo = tipo;
    state.ag.slot = null;
    state.ag.modalidad = null;
    state.ag.foco = null;

    var meses = mesesDisponibles(m, tipo);
    var primera = sesionesDe(m, tipo)[0];
    var mesSel = primera ? D.mesAnio(primera.fecha) : meses[0];
    state.ag.mes = Math.max(0, meses.findIndex(function (x) {
      return x.y === mesSel.y && x.m === mesSel.m;
    }));

    renderAg();
    anunciar(tipo === '1a1' ? UI.tab1a1 : UI.tabGrupal);
  }

  function renderAgInfo(m) {
    var host = document.querySelector('.mentorias-ag-info');
    host.textContent = '';

    var es1a1 = state.ag.tipo === '1a1';
    var s = state.ag.slot;
    var mod = es1a1 ? state.ag.modalidad : (s ? s.modalidad : null);

    host.appendChild(el('span', 'mentoria-info-chip', UI.infoTipo + ': ' + (es1a1 ? UI.tipo1a1Corto : UI.tipoGrupalCorto)));
    host.appendChild(el('span', 'mentoria-info-chip', UI.infoDuracion + ': ' + (es1a1 ? UI.duracion1a1 : UI.duracionGrupo)));
    host.appendChild(el('span', 'mentoria-info-chip',
      UI.infoModalidad + ': ' + (mod ? etiquetaModalidad(mod) : '—')));
    host.appendChild(el('span', 'mentoria-info-chip', txt1(UI.infoZona, { tz: TZ })));
    host.appendChild(el('span', 'mentoria-info-chip',
      es1a1 ? UI.infoCupos1a1 : UI.infoCuposGrupo));
  }

  /* ---------- calendario ---------- */

  function diasDelMes(y, m) {
    var primero = new Date(Date.UTC(y, m - 1, 1)).getUTCDay();
    var ultimo = new Date(Date.UTC(y, m, 0)).getUTCDate();
    var celdas = [];
    var i;
    for (i = 0; i < primero; i++) celdas.push(null);
    for (i = 1; i <= ultimo; i++) {
      celdas.push(y + '-' + (m < 10 ? '0' + m : m) + '-' + (i < 10 ? '0' + i : i));
    }
    return celdas;
  }

  function renderCal(m) {
    var meses = mesesAg();
    var ma = meses[Math.min(state.ag.mes, meses.length - 1)] || D.mesAnio(D.hoyISO());

    txt('mentorias-cal-label', ma.etiqueta);
    $('mentorias-cal-prev').disabled = state.ag.mes <= 0;
    $('mentorias-cal-next').disabled = state.ag.mes >= meses.length - 1;

    var grid = $('mentorias-cal-grid');
    grid.textContent = '';

    ['lun', 'mar', 'mié', 'jue', 'vie', 'sáb', 'dom'].forEach(function (d) {
      grid.appendChild(el('span', 'mentoria-cal-dow', d));
    });

    var porDia = {};
    sesionesDe(m.id, state.ag.tipo).forEach(function (s) { porDia[s.fecha] = true; });

    /* El foco de teclado arranca en el día elegido o en el primer día
       con horarios del mes visible. */
    var celdas = diasDelMes(ma.y, ma.m);
    var foco = state.ag.foco;
    var enMes = foco && foco.slice(0, 7) === ma.y + '-' + (ma.m < 10 ? '0' + ma.m : ma.m);
    if (!enMes) {
      foco = state.ag.fecha && state.ag.fecha.slice(0, 7) === ma.y + '-' + (ma.m < 10 ? '0' + ma.m : ma.m)
        ? state.ag.fecha
        : (celdas.filter(function (c) { return c && porDia[c]; })[0] || null);
    }
    state.ag.foco = foco;

    var hoy = D.hoyISO();

    celdas.forEach(function (fecha) {
      var celda = el('div', 'mentoria-cal-cell');
      celda.setAttribute('role', 'gridcell');

      if (!fecha) {
        celda.appendChild(el('span', 'mentoria-cal-day mentoria-cal-day--vacio', '·'));
        grid.appendChild(celda);
        return;
      }

      var hay = !!porDia[fecha];
      var b = el('button', 'mentoria-cal-day', String(Number(fecha.slice(8, 10))));
      b.type = 'button';
      b.dataset.fecha = fecha;
      b.dataset.hay = hay ? '1' : '0';
      if (fecha === hoy) b.dataset.hoy = '1';
      b.tabIndex = fecha === foco ? 0 : -1;
      if (fecha === state.ag.fecha) b.setAttribute('aria-selected', 'true');

      b.setAttribute('aria-label', D.fechaLarga(fecha) + (hay ? ', hay horarios' : ', sin horarios'));

      if (hay) {
        b.appendChild(el('span', 'mentoria-cal-hay', ''));
        b.addEventListener('click', function () { elegirDia(fecha); });
      }

      celda.appendChild(b);
      grid.appendChild(celda);
    });
  }

  function elegirDia(fecha) {
    state.ag.fecha = fecha;
    state.ag.foco = fecha;
    state.ag.slot = null;
    if (state.ag.tipo !== '1a1') state.ag.modalidad = null;
    renderAg();
    anunciar(txt1(UI.horarioElegido, { fecha: D.fechaMedia(fecha), hora: '' }).trim());
  }

  /* Flechas / inicio / fin / RePág sobre el grid. */
  function onCalKey(e) {
    var m = mentor(state.ag.mentorId);
    if (!m) return;

    var meses = mesesAg();
    var ma = meses[Math.min(state.ag.mes, meses.length - 1)];
    if (!ma) return;

    var actual = state.ag.foco;
    if (!actual) return;

    var y = ma.y, mes = ma.m, dia = Number(actual.slice(8, 10));
    var handled = true;

    switch (e.key) {
      case 'ArrowLeft': dia -= 1; break;
      case 'ArrowRight': dia += 1; break;
      case 'ArrowUp': dia -= 7; break;
      case 'ArrowDown': dia += 7; break;
      case 'Home': dia = 1; break;
      case 'End': dia = new Date(Date.UTC(y, mes, 0)).getUTCDate(); break;
      case 'PageUp':
        if (state.ag.mes <= 0) { handled = false; break; }
        state.ag.mes -= 1;
        moverFocoAlMes();
        repintarCalFoco();
        return;
      case 'PageDown':
        if (state.ag.mes >= meses.length - 1) { handled = false; break; }
        state.ag.mes += 1;
        moverFocoAlMes();
        repintarCalFoco();
        return;
      case 'Enter':
      case ' ':
        if (document.activeElement && document.activeElement.dataset.hay === '1') {
          elegirDia(actual);
        }
        return;
      default:
        handled = false;
    }

    if (!handled) return;
    e.preventDefault();

    /* Moverse por el calendario cruza meses: se ajusta el índice. */
    var ultimo = new Date(Date.UTC(y, mes, 0)).getUTCDate();
    while (dia < 1) {
      mes -= 1;
      if (mes < 1) { mes = 12; y -= 1; }
      dia += new Date(Date.UTC(y, mes, 0)).getUTCDate();
    }
    while (dia > ultimo) {
      dia -= ultimo;
      mes += 1;
      if (mes > 12) { mes = 1; y += 1; }
      ultimo = new Date(Date.UTC(y, mes, 0)).getUTCDate();
    }

    var nuevo = y + '-' + (mes < 10 ? '0' + mes : mes) + '-' + (dia < 10 ? '0' + dia : dia);
    state.ag.foco = nuevo;

    var idx = meses.findIndex(function (x) { return x.y === y && x.m === mes; });
    if (idx >= 0) state.ag.mes = idx;
    renderCal(m);

    var btn = document.querySelector('.mentoria-cal-day[data-fecha="' + nuevo + '"]');
    if (btn) btn.focus();
  }

  function moverFocoAlMes() {
    var meses = mesesAg();
    var ma = meses[state.ag.mes];
    if (!ma) return;
    var primera = diasDelMes(ma.y, ma.m).filter(Boolean)[0];
    state.ag.foco = primera;
  }

  /* RePág ya no devuelve nada: repinta el mes y deja el foco en el
     primer día visible, para no perder el hilo del teclado. */
  function repintarCalFoco() {
    var m = mentor(state.ag.mentorId);
    if (!m) return;
    renderCal(m);
    var btn = state.ag.foco &&
      document.querySelector('.mentoria-cal-day[data-fecha="' + state.ag.foco + '"]');
    if (btn) btn.focus();
  }

  /* ---------- horas ---------- */

  function renderHoras(m) {
    var lista = $('mentorias-horas-lista');
    lista.textContent = '';

    var wrap = $('mentorias-mod-wrap');
    wrap.hidden = true;
    /* Al ocultarlo se vacía: si no, quedan las modalidades del mentor
       anterior en el DOM y un lector de pantalla las announcing. */
    var optsVacias = wrap.querySelector('.mentorias-mod-opts');
    if (optsVacias) optsVacias.textContent = '';

    if (!state.ag.fecha) {
      txt('mentorias-horas-titulo', 'Elige un día');
      lista.appendChild(el('p', 'mentorias-horas-vacio', 'Toca un día marcado para ver sus horas.'));
      return;
    }

    txt('mentorias-horas-titulo', txt1(UI.horasTitulo, { fecha: D.fechaLarga(state.ag.fecha) }));

    var sesiones = sesionesDe(m.id, state.ag.tipo).filter(function (s) {
      return s.fecha === state.ag.fecha;
    });

    if (!sesiones.length) {
      lista.appendChild(el('p', 'mentorias-horas-vacio', UI.sinHoras));
      return;
    }

    sesiones.forEach(function (s) {
      var bloqueoMotivo = bloqueo(s, m);
      var libre = cuposLibres(s);
      var mio = reservaDe(s);
      var elegido = state.ag.slot === s.id;

      var b = el('button', 'mentoria-slot' + (mio ? ' mentoria-slot--mio' : ''));
      b.type = 'button';
      b.dataset.slot = s.id;
      b.setAttribute('aria-pressed', elegido ? 'true' : 'false');
      b.disabled = !!bloqueoMotivo;

      b.appendChild(el('span', null, s.inicio + '–' + s.fin));

      var sub;
      if (mio) sub = UI.slotTuya;
      else if (libre <= 0) sub = UI.slotLleno;
      else if (s.tipo === 'grupal') sub = txt1(UI.cuposSlot, { libres: libre, max: s.cupos }) + ' · ' + etiquetaModalidad(s.modalidad);
      else sub = etiquetaModalidad(state.ag.modalidad || m.modalidades[0]);

      b.appendChild(el('span', 'mentoria-slot-sub', sub));

      b.setAttribute('aria-label',
        'Mentoría ' + (s.tipo === '1a1' ? '1 a 1' : 'grupal') + ' el ' + D.fechaLarga(s.fecha) +
        ' de ' + s.inicio + ' a ' + s.fin + ', ' + etiquetaModalidad(s.modalidad) +
        (s.tipo === 'grupal' ? ', ' + libre + ' de ' + s.cupos + ' cupos libres' : '') +
        (bloqueoMotivo ? '. No reservable: ' + bloqueoMotivo : ''));

      if (!bloqueoMotivo) {
        b.addEventListener('click', function () { elegirSlot(s); });
      }

      lista.appendChild(b);
    });

    /* En 1:1 el estudiante elige presencial o virtual. */
    if (state.ag.tipo === '1a1' && state.ag.slot) {
      wrap.hidden = false;
      txt('mentorias-mod-legend', UI.eligiendoModalidad);
      var opts = wrap.querySelector('.mentorias-mod-opts');
      opts.textContent = '';

      m.modalidades.forEach(function (mod) {
        var r = el('button', 'mentoria-mod', etiquetaModalidad(mod));
        r.type = 'button';
        r.setAttribute('role', 'radio');
        r.setAttribute('aria-checked', state.ag.modalidad === mod ? 'true' : 'false');
        r.addEventListener('click', function () {
          state.ag.modalidad = mod;
          renderHoras(m);
          renderAgInfo(m);
          renderAgPie(m);
        });
        opts.appendChild(r);
      });
    }
  }

  function elegirSlot(s) {
    state.ag.slot = s.id;
    if (state.ag.tipo === 'grupal') state.ag.modalidad = s.modalidad;
    else if (!state.ag.modalidad) state.ag.modalidad = null;

    var m = mentor(state.ag.mentorId);
    renderHoras(m);
    renderAgInfo(m);
    renderAgPie(m);
    anunciar(txt1(UI.horarioElegido, { fecha: D.fechaMedia(s.fecha), hora: s.inicio }));
  }

  /* ---------- pie del agendador ---------- */

  function slotElegido() {
    var m = mentor(state.ag.mentorId);
    if (!m || !state.ag.slot) return null;
    var s = sesionesDe(m.id, state.ag.tipo).filter(function (x) { return x.id === state.ag.slot; })[0];
    return s || null;
  }

  function renderAgPie(m) {
    var s = slotElegido();
    var btn = $('mentorias-ag-confirmar');
    var res = $('mentorias-ag-resumen');
    var msg = $('mentorias-ag-msg');

    txt('mentorias-ag-confirmar', state.confirmando ? UI.confirmando : UI.confirmar);
    res.textContent = '';
    msg.textContent = '';

    if (!s) {
      btn.disabled = true;
      return;
    }

    var mod = state.ag.tipo === '1a1' ? state.ag.modalidad : s.modalidad;

    if (state.ag.tipo === '1a1' && !mod) {
      btn.disabled = true;
      msg.textContent = UI.modalElegirModalidad;
      return;
    }

    res.textContent = txt1(
      state.ag.tipo === '1a1' ? UI.resumen1a1 : UI.resumenGrupo,
      {
        mentor: m.nombre,
        fecha: D.fechaMedia(s.fecha),
        rango: s.inicio + '–' + s.fin,
        modalidad: etiquetaModalidad(mod),
      }
    );

    btn.disabled = false;
  }

  /* ---------- confirmar ---------- */

  function confirmarReserva() {
    var m = mentor(state.ag.mentorId);
    var s = slotElegido();
    if (!m || !s || state.confirmando) return;

    var mod = state.ag.tipo === '1a1' ? state.ag.modalidad : s.modalidad;
    if (state.ag.tipo === '1a1' && !mod) return;

    var motivo = bloqueo(s, m);
    if (motivo) {
      txt('mentorias-ag-msg', motivo);
      anunciar(motivo);
      return;
    }

    var btn = $('mentorias-ag-confirmar');
    state.confirmando = true;
    btn.setAttribute('aria-busy', 'true');
    btn.disabled = true;
    txt('mentorias-ag-confirmar', UI.confirmando);

    window.setTimeout(function () {
      state.reservas.push({
        mentorId: m.id,
        tipo: s.tipo,
        fechaISO: s.fechaISO,
        modalidad: mod,
      });
      guardarReservas();
      state.confirmando = false;
      btn.removeAttribute('aria-busy');

      cerrarAg();
      render();
      anunciar(txt1(UI.reservadoAnunciado, { mentor: m.nombre }));
      abrirModal(s, m, mod);
    }, 500);
  }

  /* ============================================================
     Popup de confirmación
     ============================================================ */

  var FOCO_MODAL = null;

  function abrirModal(s, m, modalidad) {
    var modal = $('mentorias-modal');
    if (!modal) return;

    FOCO_MODAL = document.activeElement;

    var tipoTxt = s.tipo === '1a1' ? UI.tipo1a1Corto : UI.tipoGrupalCorto;
    txt('mentorias-modal-title', UI.modalTitulo);
    txt('mentorias-modal-copy', txt1(UI.modalTexto, {
      tipo: tipoTxt.toLowerCase(),
      mentor: m.nombre,
      fecha: D.fechaLarga(s.fecha),
      hora: s.inicio + '–' + s.fin,
      modalidad: etiquetaModalidad(modalidad),
    }));
    txt('mentorias-modal-detalle', modalidad === 'presencial'
      ? UI.modalDetallePresencial
      : UI.modalDetalleVirtual);

    var cal = $('mentorias-modal-calendar');
    cal.href = buildGoogleCalendarUrl(s, m, modalidad);
    txt('mentorias-modal-calendar-txt', UI.agregarCalendario);
    txt('mentorias-modal-cta', UI.modalEntendido);

    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    modal.addEventListener('keydown', onModalKey);
    $('mentorias-modal-cta').focus();
  }

  function cerrarModal() {
    var modal = $('mentorias-modal');
    if (!modal || modal.hidden) return;

    modal.hidden = true;
    document.body.style.overflow = '';
    modal.removeEventListener('keydown', onModalKey);

    if (FOCO_MODAL && FOCO_MODAL.focus) FOCO_MODAL.focus();
    FOCO_MODAL = null;
  }

  function focusables(host) {
    if (!host) return [];
    return Array.prototype.filter.call(
      host.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'),
      function (n) { return n.offsetParent !== null || n === document.activeElement; }
    );
  }

  function onModalKey(e) {
    if (e.key === 'Escape') { e.preventDefault(); cerrarModal(); return; }
    if (e.key !== 'Tab') return;

    var f = focusables($('mentorias-modal'));
    if (!f.length) return;
    var first = f[0];
    var last = f[f.length - 1];

    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  /* ============================================================
     Cancelar una reserva
     ============================================================ */

  var FOCO_CANCEL = null;

  function abrirCancel(r) {
    var modal = $('mentorias-cancel');
    var m = mentor(r.mentorId);
    var s = sesionDe(r);
    if (!modal || !m || !s) return;

    FOCO_CANCEL = document.activeElement;
    state.cancelando = r;

    txt('mentorias-cancel-title', '¿Liberar tu lugar?');
    txt('mentorias-cancel-copy', txt1(UI.confirmarLiberar, { fecha: D.fechaMedia(s.fecha) }));
    txt('mentorias-cancel-no', UI.liberarNo);
    txt('mentorias-cancel-si', UI.liberarSi);

    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    modal.addEventListener('keydown', onCancelKey);
    $('mentorias-cancel-no').focus();
  }

  function cerrarCancel() {
    var modal = $('mentorias-cancel');
    if (!modal || modal.hidden) return;

    modal.hidden = true;
    document.body.style.overflow = '';
    modal.removeEventListener('keydown', onCancelKey);

    if (FOCO_CANCEL && FOCO_CANCEL.focus) FOCO_CANCEL.focus();
    FOCO_CANCEL = null;
    state.cancelando = null;
  }

  function confirmarCancelacion() {
    var r = state.cancelando;
    if (!r) return;
    state.reservas = state.reservas.filter(function (x) { return !mismaReserva(x, r); });
    guardarReservas();
    cerrarCancel();
    render();
    anunciar(UI.canceladoAnunciado);
  }

  function onCancelKey(e) {
    if (e.key === 'Escape') { e.preventDefault(); cerrarCancel(); return; }
    if (e.key !== 'Tab') return;

    var f = focusables($('mentorias-cancel'));
    if (!f.length) return;
    var first = f[0];
    var last = f[f.length - 1];

    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  /* ============================================================
     Teclado del agendador
     ============================================================ */

  function onAgKey(e) {
    if (e.key === 'Escape') { e.preventDefault(); cerrarAg(); return; }

    if (e.key === 'Tab') {
      var f = focusables($('mentorias-ag'));
      if (!f.length) return;
      var first = f[0];
      var last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      return;
    }

    var grid = $('mentorias-cal-grid');
    if (grid && grid.contains(document.activeElement)) {
      onCalKey(e);
      return;
    }

    var tabs = document.querySelectorAll('.mentorias-ag-tab');
    var i = Array.prototype.indexOf.call(tabs, document.activeElement);
    if (i >= 0 && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
      e.preventDefault();
      var j = e.key === 'ArrowRight' ? (i + 1) % tabs.length : (i - 1 + tabs.length) % tabs.length;
      tabs[j].focus();
      setTipo(tabs[j].dataset.tipo);
    }
  }

  /* ============================================================
     Entrada escalonada de las tarjetas
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
    }, { threshold: 0.06, rootMargin: '0px 0px -6% 0px' });
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
    Array.prototype.forEach.call(
      document.querySelectorAll('.mentor-card:not(.is-in)'),
      function (c) {
        if (enPantalla(c, margen)) {
          c.classList.add('is-in');
          if (revealIO) revealIO.unobserve(c);
        } else {
          quedan++;
        }
      }
    );
    return quedan;
  }

  function observarTarjetas() {
    var cards = document.querySelectorAll('.mentor-card');
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
     Filtros: eventos
     ============================================================ */

  function limpiarFiltros() {
    state.filtro = 'todos';
    state.modalidad = 'todas';
    state.soloReservables = false;
    state.busqueda = '';
    var input = $('mentorias-busca');
    if (input) input.value = '';
  }

  function initFiltros() {
    var input = $('mentorias-busca');
    var debounce = null;

    input.addEventListener('input', function () {
      var v = input.value;
      window.clearTimeout(debounce);
      debounce = window.setTimeout(function () {
        state.busqueda = v;
        render();
      }, 180);
    });

    $('mentorias-modalidad').addEventListener('change', function (e) {
      state.modalidad = e.target.value;
      render();
    });

    $('mentorias-solo-reservables').addEventListener('change', function (e) {
      state.soloReservables = e.target.checked;
      render();
    });

    $('mentorias-limpiar').addEventListener('click', function () {
      limpiarFiltros();
      render();
      anunciar('Filtros limpiados.');
    });
  }

  /* ============================================================
     Reiniciar demo
     ============================================================ */

  function initReset() {
    var btn = $('mentorias-reset');
    txt('mentorias-reset', UI.resetDemo);
    if (!btn) return;
    btn.addEventListener('click', function () {
      try { window.localStorage.removeItem(D.LS_RESERVAS); } catch (e) { /* sin storage */ }
      state.reservas = [];
      render();
      anunciar(UI.resetHecho);
    });
  }

  /* ============================================================
     Link profundo ?mentor=id
     ============================================================ */

  function aplicarDeepLink() {
    var q = new URLSearchParams(window.location.search);
    var id = q.get('mentor');
    if (!id) return;

    var m = mentor(id);
    if (!m) return;

    var card = document.querySelector('[data-mentor="' + m.id + '"]');
    if (card) card.scrollIntoView({ behavior: 'smooth', block: 'start' });

    if (state.session && grupalAbierta(m) && primerGrupoLibre(m)) {
      abrirAg(m.id, 'grupal');
    }
  }

  /* ============================================================
     Render general
     ============================================================ */

  function render() {
    renderHeroEstado();
    renderChipSesion();
    render1a1();
    renderProximas();
    renderChips();
    renderFiltros();
    renderGrid();
    syncAreas();
  }

  /* Las 3 tarjetas de arriba reflejan qué filtro está activo. */
  function syncAreas() {
    var cards = document.querySelectorAll('.mentoria-area');
    Array.prototype.forEach.call(cards, function (c) {
      var on = state.filtro === c.className.match(/mentoria-area--(\w+)/)[1];
      c.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }

  /* ============================================================
     Init
     ============================================================ */

  function init() {
    initHero();
    renderAreas();
    initFiltros();
    initReset();
    initModalCierres();

    cargarReservas();
    state.session = SESSION.read();

    render();

    /* El link profundo necesita el layout listo para poder hacer scroll. */
    if (document.readyState === 'complete') aplicarDeepLink();
    else window.addEventListener('load', aplicarDeepLink, { once: true });
  }

  function initModalCierres() {
    /* Etiquetas por defecto: los botones existen desde el HTML y no
       deben quedarse sin nombre accesible antes de abrirse. */
    txt('mentorias-limpiar', UI.limpiar);
    txt('mentorias-modal-cta', UI.modalEntendido);
    txt('mentorias-cancel-title', '¿Liberar tu lugar?');
    txt('mentorias-cancel-no', UI.liberarNo);
    txt('mentorias-cancel-si', UI.liberarSi);

    Array.prototype.forEach.call(
      document.querySelectorAll('#mentorias-modal [data-close]'),
      function (n) { n.addEventListener('click', cerrarModal); }
    );
    $('mentorias-modal-cta').addEventListener('click', cerrarModal);

    Array.prototype.forEach.call(
      document.querySelectorAll('#mentorias-cancel [data-cancel-cerrar]'),
      function (n) { n.addEventListener('click', cerrarCancel); }
    );
    $('mentorias-cancel-no').addEventListener('click', cerrarCancel);
    $('mentorias-cancel-si').addEventListener('click', confirmarCancelacion);

    Array.prototype.forEach.call(
      document.querySelectorAll('#mentorias-ag [data-ag-cerrar]'),
      function (n) { n.addEventListener('click', cerrarAg); }
    );
    $('mentorias-ag-x').addEventListener('click', cerrarAg);
    $('mentorias-ag-confirmar').addEventListener('click', confirmarReserva);

    $('mentorias-ag-tab-grupal').addEventListener('click', function () { setTipo('grupal'); });
    $('mentorias-ag-tab-1a1').addEventListener('click', function () { setTipo('1a1'); });

    $('mentorias-cal-prev').addEventListener('click', function () {
      if (state.ag.mes <= 0) return;
      state.ag.mes -= 1;
      state.ag.foco = null;
      renderCal(mentor(state.ag.mentorId));
    });
    $('mentorias-cal-next').addEventListener('click', function () {
      var meses = mesesAg();
      if (state.ag.mes >= meses.length - 1) return;
      state.ag.mes += 1;
      state.ag.foco = null;
      renderCal(mentor(state.ag.mentorId));
    });

    $('mentorias-ag-tab-grupal').addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight' && esSenior()) { e.preventDefault(); $('mentorias-ag-tab-1a1').focus(); }
    });
    $('mentorias-ag-tab-1a1').addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); $('mentorias-ag-tab-grupal').focus(); }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* exposed para auditoría */
  window.ZAG_MENTORIAS_APP = {
    estado: state,
    mentor: mentor,
    mentoresFiltrados: mentoresFiltrados,
    cuposLibres: cuposLibres,
    sesionDe: sesionDe,
    abrirAg: abrirAg,
    mesesAg: mesesAg,
    onAgKey: onAgKey,
    onCalKey: onCalKey,
    buildGoogleCalendarUrl: buildGoogleCalendarUrl,
    bloqueos: bloqueo,
  };
})();
