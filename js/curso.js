/* ============================================================
   PORTAL ZAG — Cursos Extraclase · vista de curso (curso.html)
   ------------------------------------------------------------
   Player, tabs, sidebar acordeón, quiz y comentarios. El estado
   (progreso, sellos, comentarios) vive en js/cursos-progreso.js.
   La URL manda: ?id=<curso>&l=<leccion> deep-enlaza una lección.
   ============================================================ */

(function () {
  'use strict';

  var Z = window.ZagCursos;
  var SESSION = window.ZAG_SESSION;
  var UI = {};

  var state = {
    curso: null,
    leccion: null,
    modulo: null,
    indiceModulo: 0,
    indiceLeccion: 0,
    tab: 'desc',
    quiz: null, /* {modulo, i, respuestas, enviado, resultado} */
    playerTimer: null,
    modal: null,
    focoPrevio: null,
    modsAbiertos: {},
  };

  /* ---------- helpers ---------- */
  function $(id) { return document.getElementById(id); }

  function el(tag, clase, texto) {
    var n = document.createElement(tag);
    if (clase) n.className = clase;
    if (texto !== undefined && texto !== null) n.textContent = String(texto);
    return n;
  }

  function txt(id, valor) {
    var n = $(id);
    if (n) n.textContent = valor === null || valor === undefined ? '' : String(valor);
  }

  function t(grupo, clave, vars, porDefecto) {
    var bloque = UI[grupo] || {};
    return Z.txt(bloque[clave] !== undefined ? bloque[clave] : porDefecto, vars);
  }

  function anunciar(mensaje) {
    var vivo = $('curso-vivo');
    if (vivo) vivo.textContent = mensaje;
  }

  function nivelTexto(n) { return Z.nivelTexto(n); }

  /* ---------- player simulado ---------- */
  var DUR_SIM = 6000;

  function detenerPlayer() {
    if (state.playerTimer) {
      window.clearInterval(state.playerTimer);
      state.playerTimer = null;
    }
  }

  /* Si la lección trae videoUrl montamos el iframe (YouTube/Vimeo);
     si no, el placeholder con la simulación de 6 segundos. */
  function renderPlayer() {
    var mount = $('player-mount');
    if (!mount) return;
    detenerPlayer();
    mount.textContent = '';

    var leccion = state.leccion;
    var url = leccion && leccion.videoUrl ? String(leccion.videoUrl).trim() : '';

    if (url) {
      var iframe = document.createElement('iframe');
      iframe.src = url;
      iframe.title = (state.curso ? state.curso.titulo : 'Curso') + ' — ' + (leccion ? leccion.titulo : '');
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture';
      iframe.allowFullscreen = true;
      iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
      mount.appendChild(iframe);
      return;
    }

    /* Placeholder */
    var ph = el('div', 'player__placeholder');
    ph.appendChild(el('span', 'player__badge', UI.curso.videoProduccion));

    var play = el('button', 'player__play');
    play.type = 'button';
    play.appendChild(el('span', 'player__play-ic', '▶'));
    play.appendChild(el('span', null, UI.curso.videoPlay));
    play.addEventListener('click', function () {
      play.remove();
      simular(ph);
    });
    ph.appendChild(play);
    mount.appendChild(ph);
  }

  function simular(ph) {
    var wrap = el('div', 'player__playing');
    wrap.appendChild(el('p', null, UI.curso.videoReproduciendo));
    var sim = el('div', 'player__sim');
    var bar = el('div', 'player__sim-fill');
    sim.appendChild(bar);
    wrap.appendChild(sim);
    var seg = el('p', 'player__sim-label', '0 s');
    wrap.appendChild(seg);
    ph.appendChild(wrap);

    var t0 = Date.now();
    state.playerTimer = window.setInterval(function () {
      var pct = Math.min(100, ((Date.now() - t0) / DUR_SIM) * 100);
      bar.style.width = pct + '%';
      seg.textContent = Math.round((Date.now() - t0) / 1000) + ' s';
      if (pct >= 100) {
        detenerPlayer();
        seg.textContent = UI.curso.videoReproduciendo + ' ✓';
      }
    }, 100);
  }

  /* ---------- cabecera y progreso ---------- */
  function renderTopbar() {
    var curso = state.curso;
    if (!curso) return;
    txt('curso-topbar-title', curso.titulo);

    var pct = Z.porcentaje(curso.id);
    txt('curso-topbar-pct', pct + '%');

    var fill = $('curso-topbar-fill');
    if (fill) {
      fill.style.width = pct + '%';
      fill.style.setProperty('--curso-color', 'var(--color-cta)');
    }
    txt('side-pct', pct + '%');

    var chip = $('curso-session-chip');
    var s = Z.sesion();
    if (chip) {
      if (s) {
        chip.textContent = nivelTexto(s.level) + ' · demo';
        chip.setAttribute('data-nivel', String(s.level).toLowerCase());
        chip.hidden = false;
      } else {
        chip.hidden = true;
      }
    }
  }

  /* ---------- acceso ---------- */
  function renderGate() {
    var gate = $('curso-gate');
    var player = $('curso-player');
    var curso = state.curso;
    if (!gate || !player) return;

    if (Z.tieneAcceso()) {
      gate.hidden = true;
      player.hidden = false;
      return;
    }

    player.hidden = true;
    gate.hidden = false;

    var nivel = nivelTexto(Z.NIVEL_ACCESO);
    var faltan = Z.nivelesFaltantes();
    if (Z.sinSesion()) {
      txt('curso-gate-title', UI.acceso.sinSesionTitulo);
      txt('curso-gate-copy', UI.acceso.sinSesionCopia);
    } else {
      txt('curso-gate-title', faltan === 1
        ? t('acceso', 'nivelInsuficienteTitulo', { n: faltan })
        : t('acceso', 'nivelInsuficienteTituloPlural', { n: faltan }));
      txt('curso-gate-copy', t('acceso', 'nivelInsuficienteCopia', { nivel: nivel }));
    }

    var acciones = $('curso-gate-actions');
    acciones.textContent = '';
    var temario = el('button', 'btn', UI.acceso.temarioTitulo);
    temario.type = 'button';
    temario.addEventListener('click', function () {
      renderTemario(acciones);
    });
    acciones.appendChild(temario);

    var volver = el('a', 'btn btn--outline', UI.acceso.volverCatalogo);
    volver.href = 'cursos.html';
    acciones.appendChild(volver);

    if (Z.sinSesion()) {
      var demo = el('button', 'btn btn--outline', UI.acceso.sinSesionCta);
      demo.type = 'button';
      demo.addEventListener('click', function () {
        if (!SESSION) return;
        SESSION.write({ name: 'Perfil demo ZAG', level: Z.NIVEL_ACCESO });
        renderTodo();
        anunciar(UI.demo.listo);
      });
      acciones.appendChild(demo);
    }

    gate.appendChild(acciones);
  }

  /* El temario completo se revela dentro del panel de bloqueo. */
  function renderTemario(host) {
    var curso = state.curso;
    if (!curso) return;
    var nivel = nivelTexto(Z.NIVEL_ACCESO);
    var box = el('div', 'side-panel__body');
    box.appendChild(el('p', 'lesson-gate', t('acceso', 'temarioCopia', { nivel: nivel })));

    var lista = el('ul', 'mod__list');
    Z.modulos(curso).forEach(function (m, mi) {
      var li = el('li');
      li.appendChild(el('p', 'mod__name', t('curso', 'modulo', { n: mi + 1 }) + '. ' + m.titulo));
      (m.lecciones || []).forEach(function (l) {
        var fila = el('div', 'mod-item');
        fila.appendChild(el('span', 'mod-item__label', l.titulo));
        fila.appendChild(el('span', 'mod-item__dur', l.duracionMin + ' min'));
        li.appendChild(fila);
      });
      lista.appendChild(li);
    });
    box.appendChild(lista);
    host.appendChild(box);
  }

  /* ---------- sidebar: acordeón de módulos ---------- */
  function renderSidebar() {
    var host = $('side-mods');
    if (!host || !state.curso) return;
    host.textContent = '';

    var curso = state.curso;

    Z.modulos(curso).forEach(function (m, mi) {
      var wrap = el('div', 'mod');

      var hechas = (m.lecciones || []).filter(function (l) {
        return Z.leccionCompletada(curso.id, l.id);
      }).length;

      var abierto = state.modsAbiertos[m.id];
      if (abierto === undefined) abierto = mi === state.indiceModulo;

      var btn = el('button', 'mod__btn');
      btn.type = 'button';
      btn.id = 'mod-btn-' + m.id;
      btn.setAttribute('aria-expanded', abierto ? 'true' : 'false');
      btn.setAttribute('aria-controls', 'mod-list-' + m.id);
      btn.appendChild(el('span', 'mod__chev', '▶'));
      btn.appendChild(el('span', 'mod__name', t('curso', 'modulo', { n: mi + 1 }) + '. ' + m.titulo));
      btn.appendChild(el('span', 'mod__count', hechas + '/' + (m.lecciones || []).length));
      btn.addEventListener('click', function () {
        state.modsAbiertos[m.id] = !abierto;
        renderSidebar();
      });
      wrap.appendChild(btn);

      var lista = el('ul', 'mod__list');
      lista.id = 'mod-list-' + m.id;
      lista.hidden = !abierto;

      (m.lecciones || []).forEach(function (l) {
        var item = el('li');
        var b = el('button', 'mod-item');
        b.type = 'button';
        var esActual = l.id === (state.leccion && state.leccion.id);
        if (esActual) b.setAttribute('aria-current', 'true');
        if (Z.leccionCompletada(curso.id, l.id)) b.classList.add('is-done');
        b.appendChild(el('span', 'mod-item__check', Z.leccionCompletada(curso.id, l.id) ? '✓' : ''));
        b.appendChild(el('span', 'mod-item__label', l.titulo));
        b.appendChild(el('span', 'mod-item__dur', l.duracionMin + ' min'));
        b.addEventListener('click', function () {
          irA(m.id, l.id);
        });
        item.appendChild(b);
        lista.appendChild(item);
      });

      /* Fila del quiz del módulo */
      if (m.quiz && m.quiz.length) {
        var qi = el('li');
        var qb = el('button', 'mod-quiz');
        qb.type = 'button';
        var aprobado = Z.quizAprobado(curso.id, m.id);
        if (aprobado) qb.classList.add('is-passed');
        var enQuiz = state.quiz && state.quiz.modulo.id === m.id;
        if (enQuiz) qb.setAttribute('aria-current', 'true');
        qb.appendChild(el('span', null, UI.curso.quizFila));
        var puntaje = Z.puntajeQuiz(curso.id, m.id);
        qb.appendChild(el('span', 'mod-quiz__state',
          aprobado ? t('curso', 'quizAprobado', { p: puntaje, t: m.quiz.length }) : UI.curso.quizPendiente));
        qb.addEventListener('click', function () {
          abrirQuiz(m);
        });
        qi.appendChild(qb);
        lista.appendChild(qi);
      }

      wrap.appendChild(lista);
      host.appendChild(wrap);
    });
  }

  /* ---------- certificado en el sidebar ---------- */
  function renderCertBox() {
    var host = $('cert-box');
    if (!host || !state.curso) return;
    host.textContent = '';
    var listo = Z.cursoCompleto(state.curso.id);
    host.classList.toggle('is-ready', listo);
    host.classList.toggle('is-locked', !listo);

    if (listo) {
      host.appendChild(el('p', 'cert-box__icon', '🎓'));
      host.appendChild(el('p', 'cert-box__title', UI.curso.certListoTitulo));
      host.appendChild(el('p', 'cert-box__copy', ''));
      var a = el('a', 'btn btn--sm', UI.curso.verCertificado);
      a.href = 'certificado.html?id=' + encodeURIComponent(state.curso.id);
      host.appendChild(a);
    } else {
      host.appendChild(el('p', 'cert-box__icon', '🔒'));
      host.appendChild(el('p', 'cert-box__title', UI.curso.certBloqueadoTitulo));
      var faltan = Z.totalLecciones(state.curso) - Z.progreso(state.curso.id).lecciones.length;
      var quizzes = Z.totalQuizzes(state.curso) - Z.quizzesAprobados(state.curso.id);
      host.appendChild(el('p', 'cert-box__copy',
        UI.curso.certBloqueadoCopia + ' (' + faltan + ' · ' + quizzes + ')'));
    }
  }

  /* ---------- navegación entre lecciones ---------- */
  function irA(moduloId, leccionId) {
    var curso = state.curso;
    if (!curso) return;
    var plano = Z.recorrido(curso);
    for (var i = 0; i < plano.length; i += 1) {
      if (plano[i].leccion.id === leccionId) {
        state.indiceModulo = plano[i].indiceModulo;
        state.indiceLeccion = plano[i].indiceLeccion;
        state.modulo = plano[i].modulo;
        state.leccion = plano[i].leccion;
        break;
      }
    }
    state.modsAbiertos[moduloId] = true;
    cerrarQuiz(false);
    renderTodo();
    var url = new URL(window.location.href);
    url.searchParams.set('id', curso.id);
    url.searchParams.set('l', leccionId);
    window.history.replaceState({}, '', url);
    window.scrollTo(0, 0);
  }

  function renderNavegacion() {
    var curso = state.curso;
    var leccion = state.leccion;
    if (!curso || !leccion) return;

    var prev = Z.anterior(curso, leccion.id);
    var next = Z.siguiente(curso, leccion.id);
    var btnPrev = $('lesson-prev');
    var btnNext = $('lesson-next');
    var fab = $('next-fab');

    if (btnPrev) {
      btnPrev.disabled = !prev;
      btnPrev.textContent = UI.curso.anterior;
      btnPrev.onclick = prev ? function () { irA(prev.modulo.id, prev.leccion.id); } : null;
    }

    var ultima = Z.esUltimaDelModulo(curso, leccion.id);

    if (btnNext) {
      if (ultima && state.modulo && state.modulo.quiz && state.modulo.quiz.length) {
        btnNext.textContent = UI.curso.siguienteUltima;
        btnNext.onclick = function () { abrirQuiz(state.modulo); };
      } else if (next) {
        btnNext.textContent = UI.curso.siguiente;
        btnNext.onclick = function () { irA(next.modulo.id, next.leccion.id); };
      } else {
        btnNext.textContent = UI.curso.siguienteUltima;
        btnNext.onclick = function () { abrirQuiz(state.modulo); };
      }
    }

    if (fab) {
      fab.textContent = btnNext ? btnNext.textContent : UI.curso.siguiente;
      fab.classList.toggle('is-visible', !!btnNext);
      fab.onclick = btnNext ? btnNext.onclick : null;
    }

    var btnDone = $('lesson-done-btn');
    var hecha = Z.leccionCompletada(curso.id, leccion.id);
    if (btnDone) {
      btnDone.textContent = hecha ? UI.curso.completada : UI.curso.marcar;
      btnDone.onclick = function () { toggleCompletada(); };
    }
    var box = $('lesson-done');
    if (box) box.classList.toggle('is-done', hecha);
    txt('lesson-done-state', hecha ? UI.curso.completada : '');
  }

  function toggleCompletada() {
    var curso = state.curso;
    var leccion = state.leccion;
    if (!curso || !leccion) return;
    var estaba = Z.leccionCompletada(curso.id, leccion.id);
    var r = Z.marcarLeccion(curso.id, leccion.id, !estaba);

    renderTopbar();
    renderSidebar();
    renderNavegacion();
    renderCertBox();

    if (estaba) {
      anunciar(UI.general.anunciarDeshacer);
      return;
    }
    anunciar(UI.general.anunciarLeccion);

    if (r.hecha && Z.cursoCompleto(curso.id)) {
      if (r.nuevoSello) abrirModalSello();
      else abrirModalTerminado();
    }
  }

  /* ---------- tabs ---------- */
  function initTabs() {
    ['desc', 'mat', 'com'].forEach(function (k) {
      var btn = $(k === 'desc' ? 'tab-desc' : (k === 'mat' ? 'tab-mat' : 'tab-com'));
      if (!btn) return;
      btn.addEventListener('click', function () {
        if (state.tab === k) return;
        state.tab = k;
        renderTabs();
      });
      /* Navegación con flechas, como espera un tablist. */
      btn.addEventListener('keydown', function (e) {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        e.preventDefault();
        var orden = ['desc', 'mat', 'com'];
        var i = orden.indexOf(state.tab);
        var siguiente = e.key === 'ArrowRight' ? (i + 1) % orden.length : (i - 1 + orden.length) % orden.length;
        state.tab = orden[siguiente];
        renderTabs();
        var nuevo = $(state.tab === 'desc' ? 'tab-desc' : (state.tab === 'mat' ? 'tab-mat' : 'tab-com'));
        if (nuevo) nuevo.focus();
      });
    });
  }

  function renderTabs() {
    var tabs = {
      desc: $('tab-desc'),
      mat: $('tab-mat'),
      com: $('tab-com'),
    };
    var panels = {
      desc: $('panel-desc'),
      mat: $('panel-mat'),
      com: $('panel-com'),
    };
    var n = state.leccion ? Z.comentariosDe(state.curso.id, state.leccion.id).length : 0;
    if (tabs.com) txt('tab-com', t('curso', 'tabComentarios', { n: n }));

    Object.keys(tabs).forEach(function (k) {
      if (!tabs[k]) return;
      tabs[k].setAttribute('aria-selected', state.tab === k ? 'true' : 'false');
      if (panels[k]) panels[k].hidden = state.tab !== k;
    });

    if (state.tab === 'desc') renderDescripcion();
    if (state.tab === 'mat') renderMateriales();
    if (state.tab === 'com') renderComentarios();
  }

  function renderDescripcion() {
    var panel = $('panel-desc');
    if (!panel || !state.leccion) return;
    panel.textContent = '';

    var cuerpo = state.leccion.descripcion || '';
    cuerpo.split(/\n{2,}/).forEach(function (par) {
      panel.appendChild(el('p', null, par.trim()));
    });

    var clave = state.leccion.puntosClave || [];
    if (clave.length) {
      panel.appendChild(el('h3', null, UI.curso.puntosClave));
      var ul = el('ul');
      clave.forEach(function (p) {
        ul.appendChild(el('li', null, p));
      });
      panel.appendChild(ul);
    }
  }

  function renderMateriales() {
    var panel = $('panel-mat');
    if (!panel || !state.leccion) return;
    panel.textContent = '';

    var mats = state.leccion.materiales || [];
    if (!mats.length) {
      panel.appendChild(el('p', null, UI.curso.sinMateriales));
      return;
    }

    var ul = el('ul', 'materiales-list');
    mats.forEach(function (m) {
      var li = el('li', 'material-item');
      li.appendChild(el('span', 'material-item__name', m.nombre));
      li.appendChild(el('span', 'material-item__size', m.peso || ''));
      var cta = el('span', 'material-item__cta', UI.curso.materialDemo);
      li.appendChild(cta);
      ul.appendChild(li);
    });
    panel.appendChild(ul);
  }

  /* ---------- comentarios ---------- */
  function renderComentarios() {
    var panel = $('panel-com');
    if (!panel || !state.leccion) return;
    panel.textContent = '';

    var cursoId = state.curso.id;
    var leccionId = state.leccion.id;
    var lista = Z.comentariosDe(cursoId, leccionId);

    /* Composer: mismo contrato visual muro-cc* del Muro. */
    var cc = el('div', 'muro-cc');
    var rest = el('div', 'muro-cc-rest');
    var avWrap = el('div', 'muro-cc-rest-avatar');
    var s = Z.sesion();
    var nivel = s && s.level ? String(s.level).toLowerCase() : 'rookie';
    avWrap.className = 'muro-cc-rest-avatar muro-cc-ring--' + nivel;
    var av = el('span', 'muro-avatar muro-avatar--' + nivel, Z.iniciales(s && s.name));
    avWrap.appendChild(av);
    rest.appendChild(avWrap);

    var pill = el('button', 'muro-cc-pill', s ? 'Escribí un comentario…' : UI.curso.sinSesionDemo);
    pill.type = 'button';
    if (!s) pill.disabled = true;
    rest.appendChild(pill);
    cc.appendChild(rest);

    var box = el('div', 'muro-cc-box');
    box.hidden = true;
    var head = el('div', 'muro-cc-head');
    head.appendChild(el('b', null, 'Nuevo comentario'));
    box.appendChild(head);

    var area = document.createElement('textarea');
    area.className = 'muro-cc-text';
    area.rows = 4;
    area.maxLength = Z.limiteComentario();
    area.setAttribute('aria-label', 'Escribí un comentario');
    area.placeholder = s ? '¿Qué te quedó dando esta lección?' : '';
    box.appendChild(area);

    var foot = el('div', 'muro-cc-foot');
    var count = el('span', 'muro-cc-count', '0/' + Z.limiteComentario());
    foot.appendChild(count);
    box.appendChild(foot);

    area.addEventListener('input', function () {
      var n = area.value.length;
      count.textContent = n + '/' + Z.limiteComentario();
      count.classList.toggle('is-warning', n > Z.limiteComentario() * 0.8);
      count.classList.toggle('is-limit', n >= Z.limiteComentario());
    });

    var actions = el('div', 'muro-cc-actions');
    var send = el('button', 'btn muro-cc-send', 'Publicar');
    send.type = 'button';
    send.disabled = true;
    var discard = el('button', 'btn muro-cc--link', 'Cancelar');
    discard.type = 'button';
    actions.appendChild(discard);
    actions.appendChild(send);
    box.appendChild(actions);
    cc.appendChild(box);
    panel.appendChild(cc);

    function abrir() {
      cc.classList.add('is-open');
      rest.hidden = true;
      box.hidden = false;
      area.focus();
    }
    function cerrar() {
      cc.classList.remove('is-open');
      rest.hidden = false;
      box.hidden = true;
    }
    pill.addEventListener('click', abrir);
    discard.addEventListener('click', cerrar);
    area.addEventListener('input', function () {
      send.disabled = !area.value.trim();
    });
    send.addEventListener('click', function () {
      if (!area.value.trim()) return;
      Z.agregarComentario(cursoId, leccionId, area.value);
      cerrar();
      renderComentarios();
    });

    if (!lista.length) {
      panel.appendChild(el('p', 'comments__empty', UI.curso.sinComentarios));
      return;
    }

    var ul = el('ul', 'comments__list');
    lista.forEach(function (c) {
      ul.appendChild(itemComentario(c, cursoId, leccionId));
    });
    panel.appendChild(ul);
  }

  function itemComentario(c, cursoId, leccionId) {
    /* El like de las semillas se identifica por su posición en el pool. */
    var semilla = c.mio ? -1 : (c.indiceSemilla === undefined ? -1 : c.indiceSemilla);
    var li = el('li', 'comment');
    var head = el('div', 'comment__head');
    head.appendChild(el('span', 'comment__avatar', Z.iniciales(c.autor)));
    var who = el('div', 'comment__who');
    who.appendChild(el('span', 'comment__name', c.autor));
    if (c.nivel) {
      who.appendChild(el('span', 'comment__text', nivelTexto(c.nivel)));
    }
    head.appendChild(who);
    li.appendChild(head);
    li.appendChild(el('p', 'comment__text', c.texto));

    var foot = el('div', 'comment__foot');
    var like = el('button', 'comment__like' + (c.meGusta ? ' is-liked' : ''), '♡ ' + (c.likes || 0));
    like.type = 'button';
    like.setAttribute('aria-label', 'Me gusta este comentario');
    if (!c.mio) {
      like.addEventListener('click', function () {
        Z.alternarLike(cursoId, leccionId, semilla);
        renderComentarios();
      });
    }
    foot.appendChild(like);

    /* Respuestas (un solo nivel) */
    var respuestas = c.respuestas || [];
    if (respuestas.length) {
      var rs = el('ul', 'comment__replies');
      respuestas.forEach(function (r) {
        var rli = el('li', 'comment__reply');
        rli.appendChild(el('b', null, r.autor + ': '));
        rli.appendChild(document.createTextNode(r.texto));
        rs.appendChild(rli);
      });
      li.appendChild(rs);
    }

    /* Responder: se puede abrir aunque el comentario todavía no tenga respuestas. */
    if (c.mio) {
      var rb = el('button', 'comment__reply-btn', 'Responder');
      rb.type = 'button';
      rb.setAttribute('aria-expanded', 'false');
      var rbox = el('div', 'muro-cc-box');
      rbox.hidden = true;
      var rarea = document.createElement('textarea');
      rarea.className = 'muro-cc-text';
      rarea.rows = 2;
      rarea.maxLength = Z.limiteComentario();
      rarea.setAttribute('aria-label', 'Escribí una respuesta');
      rbox.appendChild(rarea);
      var rsend = el('button', 'btn btn--sm muro-cc-send', 'Responder');
      rsend.type = 'button';
      rsend.disabled = true;
      rarea.addEventListener('input', function () {
        rsend.disabled = !rarea.value.trim();
      });
      rsend.addEventListener('click', function () {
        if (!rarea.value.trim()) return;
        Z.agregarRespuesta(cursoId, leccionId, c.id, rarea.value);
        renderComentarios();
      });
      rbox.appendChild(rsend);
      li.appendChild(rb);
      li.appendChild(rbox);
      rb.addEventListener('click', function () {
        rbox.hidden = !rbox.hidden;
        rb.setAttribute('aria-expanded', rbox.hidden ? 'false' : 'true');
        if (!rbox.hidden) rarea.focus();
      });
    }
    li.appendChild(foot);
    return li;
  }

  /* ---------- quiz ---------- */
  function abrirQuiz(modulo) {
    if (!modulo || !modulo.quiz || !modulo.quiz.length) return;
    var yaAprobado = Z.quizAprobado(state.curso.id, modulo.id);
    state.quiz = {
      modulo: modulo,
      i: 0,
      respuestas: new Array(modulo.quiz.length).fill(null),
      enviado: false,
      resultado: yaAprobado ? { puntaje: Z.puntajeQuiz(state.curso.id, modulo.id), aprobado: true } : null,
    };
    renderQuiz();
    var host = $('quiz-host');
    if (host) host.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function cerrarQuiz(irAlHost) {
    state.quiz = null;
    var host = $('quiz-host');
    if (host) {
      host.hidden = true;
      host.textContent = '';
    }
    if (irAlHost === false) return;
  }

  function renderQuiz() {
    var host = $('quiz-host');
    if (!host || !state.quiz) return;
    var q = state.quiz;
    var modulo = q.modulo;
    host.hidden = false;
    host.textContent = '';
    host.appendChild(el('p', 'kicker', t('quiz', 'kicker', { n: modulo.titulo })));

    /* Resultado si ya se envió */
    if (q.enviado && q.resultado) {
      var total = modulo.quiz.length;
      var r = q.resultado;
      var box = el('div', 'quiz__result' + (r.aprobado ? ' is-pass' : ''));
      box.appendChild(el('p', 'quiz__result-title', r.aprobado ? UI.quiz.aprobado : UI.quiz.casi));
      box.appendChild(el('p', 'quiz__result-copy',
        Z.pluralizar(r.puntaje, 'respuesta correcta', 'respuestas correctas') + ' de ' + total + '.'));
      var acts = el('div', 'quiz__actions');
      var otra = el('button', 'btn btn--sm btn--outline', UI.quiz.reintentar);
      otra.type = 'button';
      otra.addEventListener('click', function () {
        q.enviado = false;
        q.resultado = null;
        q.i = 0;
        q.respuestas = new Array(total).fill(null);
        renderQuiz();
      });
      acts.appendChild(otra);
      var volver = el('button', 'btn btn--sm', UI.quiz.volverCurso);
      volver.type = 'button';
      volver.addEventListener('click', function () { cerrarQuiz(); renderSidebar(); });
      acts.appendChild(volver);
      box.appendChild(acts);
      host.appendChild(box);

      /* Revisión pregunta por pregunta */
      modulo.quiz.forEach(function (pregunta, pi) {
        var mi = q.respuestas[pi];
        host.appendChild(el('h3', null, pregunta.pregunta));
        var correcta = pregunta.correcta;
        pregunta.opciones.forEach(function (op, oi) {
          var o = el('div', 'quiz-opt' + (oi === correcta ? ' is-correct' : (oi === mi ? ' is-wrong' : '')));
          o.appendChild(el('span', 'quiz-opt__mark',
            oi === correcta ? '✓' : (oi === mi ? '✕' : '·')));
          var txtO = el('span', null, op);
          if (oi === mi) txtO.appendChild(el('span', 'quiz-opt__why', 'Tu respuesta'));
          if (oi === correcta) txtO.appendChild(el('span', 'quiz-opt__why', UI.quiz.correcta + ' — ' + (pregunta.explicacion || '')));
          o.appendChild(txtO);
          host.appendChild(o);
        });
      });
      return;
    }

    var pregunta = modulo.quiz[q.i];
    if (!pregunta) return;

    var head = el('div', 'quiz__head');
    var prog = el('div', 'quiz__progress');
    prog.appendChild(el('p', 'quiz__progress-text', t('quiz', 'progreso', { i: q.i + 1, t: modulo.quiz.length })));
    head.appendChild(prog);
    head.appendChild(el('p', 'quiz__score', q.i + 1 + '/' + modulo.quiz.length));
    host.appendChild(head);

    host.appendChild(el('h2', 'quiz__q', pregunta.pregunta));

    var opts = el('fieldset', 'quiz__options');
    pregunta.opciones.forEach(function (op, oi) {
      var lbl = el('label', 'quiz-option');
      var radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = 'quiz-op-' + q.i;
      radio.value = String(oi);
      if (q.respuestas[q.i] === oi) radio.checked = true;
      radio.addEventListener('change', function () {
        q.respuestas[q.i] = oi;
        var err = $('quiz-error');
        if (err) err.textContent = '';
      });
      lbl.appendChild(radio);
      lbl.appendChild(el('span', 'quiz-option__text', op));
      opts.appendChild(lbl);
    });
    host.appendChild(opts);
    var err = el('p', 'quiz__error');
    err.id = 'quiz-error';
    host.appendChild(err);

    var acts = el('div', 'quiz__actions');
    if (q.i > 0) {
      var prev = el('button', 'btn btn--sm btn--outline', UI.quiz.anterior);
      prev.type = 'button';
      prev.addEventListener('click', function () { q.i -= 1; renderQuiz(); });
      acts.appendChild(prev);
    }
    var nav = el('div', 'quiz__nav');
    if (q.i < modulo.quiz.length - 1) {
      var sig = el('button', 'btn btn--sm', UI.quiz.siguiente);
      sig.type = 'button';
      sig.addEventListener('click', function () {
        if (q.respuestas[q.i] === null) {
          $('quiz-error').textContent = UI.quiz.sinResponder;
          return;
        }
        q.i += 1;
        renderQuiz();
      });
      nav.appendChild(sig);
    } else {
      var enviar = el('button', 'btn btn--sm', UI.quiz.enviar);
      enviar.type = 'button';
      enviar.addEventListener('click', function () {
        if (q.respuestas[q.i] === null) {
          $('quiz-error').textContent = UI.quiz.sinResponder;
          return;
        }
        var puntaje = 0;
        modulo.quiz.forEach(function (p, pi) {
          if (q.respuestas[pi] === p.correcta) puntaje += 1;
        });
        var r = Z.registrarQuiz(state.curso.id, modulo.id, puntaje, modulo.quiz.length);
        q.enviado = true;
        q.resultado = { puntaje: puntaje, aprobado: r.aprobado };
        anunciar(r.aprobado
          ? t('quiz', 'aprobadoAnunciado', { n: puntaje, t: modulo.quiz.length })
          : t('quiz', 'noAprobadoAnunciado', { n: puntaje, t: modulo.quiz.length }));
        renderQuiz();
        renderTopbar();
        renderSidebar();
        renderCertBox();
        if (r.completo) {
          if (r.nuevoSello) abrirModalSello();
          else abrirModalTerminado();
        }
      });
      nav.appendChild(enviar);
    }
    acts.appendChild(nav);
    host.appendChild(acts);
  }

  /* ---------- modal ---------- */
  function abrirModal(cfg) {
    state.modal = cfg;
    var box = $('curso-modal');
    if (!box) return;
    txt('curso-modal-icon', cfg.icon || '');
    txt('curso-modal-title', cfg.titulo);
    txt('curso-modal-copy', cfg.copia || '');
    var host = $('curso-modal-actions');
    if (host) {
      host.textContent = '';
      (cfg.acciones || []).forEach(function (a) {
        var b = el(a.href ? 'a' : 'button', 'btn btn--sm' + (a.secundario ? ' btn--outline' : ''), a.texto);
        if (a.href) b.href = a.href;
        else {
          b.type = 'button';
          b.addEventListener('click', function () {
            cerrarModal();
            if (a.alHacerClic) a.alHacerClic();
          });
        }
        host.appendChild(b);
      });
    }
    state.focoPrevio = document.activeElement;
    box.hidden = false;
    var cerrar = $('curso-modal-close');
    if (cerrar) cerrar.focus();
  }

  function cerrarModal() {
    var box = $('curso-modal');
    if (box) box.hidden = true;
    state.modal = null;
    if (state.focoPrevio && state.focoPrevio.focus) state.focoPrevio.focus();
  }

  function abrirModalSello() {
    abrirModal({
      icon: '🏅',
      titulo: UI.popup.selloTitulo,
      copia: t('popup', 'selloCopia', { n: Z.progresoSello().completos }),
      acciones: [{ texto: UI.popup.seguir, alHacerClic: function () {} }],
    });
  }

  function abrirModalTerminado() {
    abrirModal({
      icon: '🎓',
      titulo: t('popup', 'cursoTerminado', { curso: state.curso.titulo }),
      acciones: [
        { texto: UI.popup.verCertificado, href: 'certificado.html?id=' + encodeURIComponent(state.curso.id) },
        { texto: UI.popup.seguir, secundario: true, alHacerClic: function () {} },
      ],
    });
  }

  function initModal() {
    var cerrar = $('curso-modal-close');
    if (cerrar) cerrar.addEventListener('click', cerrarModal);
    var box = $('curso-modal');
    if (box) {
      box.addEventListener('click', function (e) {
        if (e.target === box) cerrarModal();
      });
    }
    document.addEventListener('keydown', function (e) {
      if (!state.modal) return;
      if (e.key === 'Escape') { cerrarModal(); return; }
      if (e.key !== 'Tab') return;
      var focoables = box.querySelectorAll('a[href], button:not([disabled])');
      if (!focoables.length) return;
      var primero = focoables[0];
      var ultimo = focoables[focoables.length - 1];
      if (e.shiftKey && document.activeElement === primero) {
        e.preventDefault(); ultimo.focus();
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault(); primero.focus();
      }
    });
  }

  /* ---------- profesor ---------- */
  function renderProfe() {
    var host = $('profe-host');
    if (!host || !state.curso) return;
    host.textContent = '';
    var p = Z.profesor(state.curso);

    var card = el('div', 'profe-card');
    var av = el('div', 'profe-card__avatar');
    if (p.foto) {
      var img = document.createElement('img');
      img.className = 'profe-card__avatar';
      img.src = p.foto;
      img.alt = '';
      img.loading = 'lazy';
      av = img;
    } else {
      /* Fallback de iniciales (p. ej. Natalia Ospina no está en
         mentorias-data.js). */
      av.textContent = p.iniciales || Z.iniciales(p.nombre);
    }
    card.appendChild(av);

    var info = el('div', 'profe-card__info');
    info.appendChild(el('p', 'profe-card__label', UI.curso.profesor));
    info.appendChild(el('p', 'profe-card__name', p.nombre));
    if (p.cargo) info.appendChild(el('p', 'profe-card__role', p.cargo));
    card.appendChild(info);

    var cta = el('a', 'profe-card__cta', 'Agendar mentoría →');
    cta.href = 'mentorias.html?mentor=' + encodeURIComponent(p.id);
    card.appendChild(cta);

    host.appendChild(card);
  }

  /* ---------- render global ---------- */
  function renderTodo() {
    renderTopbar();
    renderGate();
    if (!Z.tieneAcceso()) {
      /* Bloqueado: el temario jugable no existe. Solo el índice dentro del aviso. */
      txt('side-pct', '');
      $('side-mods').textContent = '';
      $('side-mods').appendChild(el('p', 'side-panel__empty',
        t('acceso', 'sinAccesoLeccion', { nivel: nivelTexto(Z.NIVEL_ACCESO) })));
      renderCertBox();
      return;
    }
    var leccion = state.leccion;
    if (leccion) {
      txt('curso-leccion-title', leccion.titulo);
      txt('player-kicker', t('curso', 'kicker', {
        m: state.indiceModulo + 1,
        l: state.indiceLeccion + 1,
        min: leccion.duracionMin,
      }));
      txt('player-dur', leccion.duracionMin + ' min');
      var s = Z.sesion();
      var nivel = $('player-nivel');
      if (nivel) {
        if (s) {
          nivel.textContent = nivelTexto(s.level);
          nivel.setAttribute('data-nivel', String(s.level).toLowerCase());
          nivel.hidden = false;
        } else {
          nivel.hidden = true;
        }
      }
      renderPlayer();
      renderNavegacion();
      renderTabs();
      renderProfe();
    }
    renderSidebar();
    renderCertBox();
  }

  /* ---------- init ---------- */
  function init() {
    if (!Z || !Z.datos().cursos.length) return;
    UI = Z.datos().ui || {};

    var q = new URLSearchParams(window.location.search);
    var curso = Z.cursoPorId(q.get('id')) || Z.cursos()[0];
    if (!curso) return;
    state.curso = curso;

    var leccionId = q.get('l');
    var plano = Z.recorrido(curso);
    var elegido = null;
    for (var i = 0; i < plano.length; i += 1) {
      if (plano[i].leccion.id === leccionId) { elegido = plano[i]; break; }
    }
    if (!elegido) elegido = plano[0];
    state.indiceModulo = elegido.indiceModulo;
    state.indiceLeccion = elegido.indiceLeccion;
    state.modulo = elegido.modulo;
    state.leccion = elegido.leccion;

    document.title = curso.titulo + ' - Portal ZAG';
    var back = $('curso-back');
    if (back) back.textContent = UI.curso.volver;

    renderTodo();
    initTabs();
    initModal();

    var reset = $('curso-reset');
    if (reset) {
      reset.textContent = UI.demo.reiniciar;
      reset.addEventListener('click', function () {
        Z.reiniciarDemo();
        renderTodo();
        anunciar(UI.demo.reiniciado);
      });
    }

    window.addEventListener('beforeunload', detenerPlayer);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();