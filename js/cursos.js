/* ============================================================
   PORTAL ZAG — Cursos Extraclase · catálogo (cursos.html)
   ------------------------------------------------------------
   Dibuja el hero, la píldora del Sello ZAG, los tabs con
   contador y las tarjetas. Toda la lógica de estado vive en
   js/cursos-progreso.js (window.ZagCursos); acá solo la vista.
   ============================================================ */

(function () {
  'use strict';

  var Z = window.ZagCursos;
  var SESSION = window.ZAG_SESSION;
  var UI = {};

  var TABS = ['todos', 'enCurso', 'completados', 'sinIniciar'];

  var state = {
    tab: 'todos',
    modal: null,
    focoPrevio: null,
  };

  /* ---------- helpers ---------- */
  function $(id) {
    return document.getElementById(id);
  }

  function el(tag, clase, texto) {
    var n = document.createElement(tag);
    if (clase) n.className = clase;
    if (texto !== undefined && texto !== null) n.textContent = String(texto);
    return n;
  }

  function txt(id, valor) {
    var n = $(id);
    if (n) n.textContent = valor;
  }

  function t(grupo, clave, vars, porDefecto) {
    return Z.txt(UI[grupo] && UI[grupo][clave] !== undefined ? UI[grupo][clave] : porDefecto, vars);
  }

  function anunciar(mensaje) {
    if (!mensaje) return;
    var vivo = $('cursos-vivo');
    if (vivo) vivo.textContent = mensaje;
  }

  function pluralizar(n, singular, plural) {
    return Z.pluralizar(n, singular, plural);
  }

  /* ---------- sesión ---------- */
  function nivelTexto(n) {
    return Z.nivelTexto(n);
  }

  function renderChipSesion() {
    var chip = $('cursos-session-chip');
    if (!chip) return;
    var s = Z.sesion();
    if (s) {
      chip.textContent = nivelTexto(s.level) + ' · demo';
      chip.setAttribute('data-nivel', String(s.level).toLowerCase());
      chip.hidden = false;
    } else {
      chip.hidden = true;
      chip.textContent = '';
    }
  }

  /* ---------- hero ---------- */
  function renderHero() {
    txt('cursos-hero-pill', UI.hero.pill);
    txt('cursos-hero-title', '');
    var h1 = $('cursos-hero-title');
    if (h1) {
      var a = el('span', null, UI.hero.titulo1);
      var b = el('span', 'zag-hero__title-accent', ' ' + UI.hero.titulo2);
      h1.appendChild(a);
      h1.appendChild(b);
    }
    txt('cursos-hero-sub', UI.hero.sub);

    renderSelloPill();
    renderHeroLinks();
  }

  /* Píldora de estado: ●●○ · 2 de 3 */
  function renderSelloPill() {
    var pill = $('cursos-sello-pill');
    if (!pill) return;
    var s = Z.progresoSello();
    if (!s.completos) {
      pill.hidden = true;
      return;
    }
    txt('cursos-sello-dots', s.puntos);
    /* Con sellos ya ganados el contador vuelve a 0: hay que decirlo,
       o parece que el último curso no contaba. */
    txt('cursos-sello-count', s.ganados > 0
      ? t('catalogo', 'selloGanado', { ganados: s.ganados, n: s.enCurso, total: s.objetivo })
      : t('catalogo', 'proximoSello', {
        puntos: '',
        n: s.enCurso,
        total: s.objetivo,
      }).trim());
    pill.hidden = false;
  }

  /* Enlaces rápidos: al curso que estabas viendo, y al certificado. */
  function renderHeroLinks() {
    var host = $('cursos-hero-links');
    if (!host) return;
    host.textContent = '';
    if (!Z.tieneAcceso()) return;

    var enCurso = Z.enCurso();
    if (enCurso.length) {
      var curso = enCurso[0];
      var leccion = Z.dondeIba(curso.id);
      var a = el('a', 'cursos-hero-link', 'Continuar: ' + curso.tituloCorto);
      a.href = 'curso.html?id=' + encodeURIComponent(curso.id) +
        (leccion ? '&l=' + encodeURIComponent(leccion) : '');
      host.appendChild(a);
    }

    var completos = Z.completados();
    if (completos.length) {
      var cert = el('a', 'cursos-hero-link', '🎓 ' + UI.popup.verCertificado);
      cert.href = 'certificado.html?id=' + encodeURIComponent(completos[0].id);
      host.appendChild(cert);
    }
  }

  /* ---------- resumen sobre los tabs ---------- */
  function renderStats() {
    var host = $('cursos-catalogo-stats');
    if (!host) return;
    host.textContent = '';
    txt('cursos-catalogo-eyebrow', UI.catalogo.eyebrow);
    txt('cursos-catalogo-title', UI.catalogo.tituloTodos);

    var completos = Z.completados().length;
    var ganados = Z.sellos().length;

    host.appendChild(el('span', 'cursos-tag', t('catalogo', 'completados', { n: completos })));
    host.appendChild(el('span', 'cursos-tag', t('catalogo', 'sellosGanados', { n: ganados })));
  }

  /* ---------- tabs ---------- */
  function cursosDelTab() {
    var lista = Z.cursos();
    if (state.tab === 'enCurso') return Z.enCurso();
    if (state.tab === 'completados') return Z.completados();
    if (state.tab === 'sinIniciar') return Z.sinIniciar();
    return lista;
  }

  function renderTabs() {
    var host = $('cursos-tabs');
    if (!host) return;
    host.textContent = '';

    var conteos = {
      todos: Z.cursos().length,
      enCurso: Z.enCurso().length,
      completados: Z.completados().length,
      sinIniciar: Z.sinIniciar().length,
    };

    TABS.forEach(function (clave) {
      var b = el('button', 'cursos-tab');
      b.type = 'button';
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-selected', clave === state.tab ? 'true' : 'false');
      b.id = 'cursos-tab-' + clave;
      b.setAttribute('aria-controls', 'cursos-grid');
      b.appendChild(el('span', null, UI.catalogo.tabs[clave]));
      b.appendChild(el('span', 'cursos-tab__count', conteos[clave]));
      b.addEventListener('click', function () {
        if (state.tab === clave) return;
        state.tab = clave;
        renderTabs();
        renderGrid();
      });
      host.appendChild(b);
    });
  }

  /* ---------- tarjeta ---------- */
  function tarjeta(curso) {
    var acceso = Z.tieneAcceso();
    var pct = Z.porcentaje(curso.id);
    var profe = Z.profesor(curso);

    var card = el('article', 'curso-card');
    card.setAttribute('data-color', curso.color);
    card.style.setProperty('--curso-color', 'var(--color-' + curso.color + ')');

    /* Portada: patrón + título + profesor */
    var cover = el('a', 'curso-card__cover');
    cover.href = 'curso.html?id=' + encodeURIComponent(curso.id);
    cover.appendChild(el('span', 'curso-card__emoji', curso.emoji));
    cover.appendChild(el('h3', 'curso-card__titulo', curso.titulo));

    var meta = el('div', 'curso-card__meta');
    if (profe.nombre) meta.appendChild(el('span', null, profe.nombre));
    meta.appendChild(el('span', null, pluralizar(Z.totalModulos(curso), 'módulo', 'módulos')));
    meta.appendChild(el('span', null, Z.duracionTexto(Z.duracionCurso(curso))));
    cover.appendChild(meta);

    card.appendChild(cover);

    /* Cuerpo: hechos + progreso + acción */
    var body = el('div', 'curso-card__body');

    var facts = el('ul', 'curso-card__facts');
    [
      pluralizar(Z.totalLecciones(curso), 'lección', 'lecciones'),
      pluralizar(Z.totalQuizzes(curso), 'quiz', 'quizzes'),
    ].forEach(function (f) {
      facts.appendChild(el('li', null, f));
    });
    body.appendChild(facts);

    if (acceso) {
      var prog = el('div', 'curso-card__progress');
      var top = el('div', 'curso-card__progress-top');
      top.appendChild(el('span', null, pct === 100 ? UI.catalogo.certificadoListo : 'Progreso'));
      top.appendChild(el('span', null, pct + '%'));
      prog.appendChild(top);

      var bar = el('div', 'cursos-bar');
      var fill = el('div', 'cursos-bar__fill');
      fill.style.width = pct + '%';
      bar.appendChild(fill);
      prog.appendChild(bar);
      body.appendChild(prog);
    }

    var foot = el('div', 'curso-card__foot');

    if (pct === 100) {
      var cert = el('a', 'btn btn--sm curso-card__cta', '🎓 ' + UI.curso.verCertificado);
      cert.href = 'certificado.html?id=' + encodeURIComponent(curso.id);
      foot.appendChild(cert);
    } else {
      var cta = el('a', 'btn btn--sm curso-card__cta',
        pct > 0 ? 'Continuar' : UI.catalogo.verCurso);
      cta.href = 'curso.html?id=' + encodeURIComponent(curso.id);
      foot.appendChild(cta);
    }

    if (pct > 0 && pct < 100) {
      foot.appendChild(el('span', 'curso-card__cert', pct + '%'));
    }
    body.appendChild(foot);
    card.appendChild(body);

    /* Overlay de bloqueo */
    if (!acceso) card.appendChild(overlayLock(curso));

    return card;
  }

  function overlayLock(curso) {
    var lock = el('div', 'curso-card__lock');
    lock.appendChild(el('span', 'curso-card__lock-icon', '🔒'));

    var nivel = nivelTexto(Z.NIVEL_ACCESO);
    if (Z.sinSesion()) {
      lock.appendChild(el('p', 'curso-card__lock-text', UI.acceso.sinSesionTitulo));
      var demo = el('button', 'btn btn--sm', UI.acceso.sinSesionCta);
      demo.type = 'button';
      demo.addEventListener('click', function () {
        crearDemo(Z.NIVEL_ACCESO);
      });
      lock.appendChild(demo);
    } else {
      lock.appendChild(el('p', 'curso-card__lock-text',
        t('acceso', 'desbloqueaEn', { nivel: nivel })));
      var ver = el('a', 'btn btn--sm', UI.acceso.verComoSubir);
      ver.href = 'mentorias.html';
      lock.appendChild(ver);
    }
    return lock;
  }

  /* ---------- rejilla ---------- */
  function renderGrid() {
    var grid = $('cursos-grid');
    if (!grid) return;
    grid.textContent = '';

    var lista = cursosDelTab();
    var empty = $('cursos-empty');

    if (!lista.length) {
      if (empty) {
        empty.textContent = UI.catalogo.sinFiltro;
        empty.hidden = false;
      }
      return;
    }
    if (empty) empty.hidden = true;

    lista.forEach(function (curso) {
      grid.appendChild(tarjeta(curso));
    });
  }

  /* ---------- panel de acceso / demo ---------- */
  function renderDemo() {
    var host = $('cursos-demo');
    if (!host) return;
    host.textContent = '';

    var s = Z.sesion();
    var nivelMinimo = nivelTexto(Z.NIVEL_ACCESO);

    host.appendChild(el('span', null, UI.demo.titulo + ':'));

    if (s) {
      var chip = el('span', 'cursos-demo__nivel', s.name + ' · ' + nivelTexto(s.level));
      host.appendChild(chip);
    }

    var acciones = el('div', 'cursos-demo__actions');

    /* Selector de nivel para probar el bloqueo */
    var sel = document.createElement('select');
    sel.className = 'cursos-tag';
    sel.setAttribute('aria-label', UI.demo.nivelLabel);
    Z.NIVELES.forEach(function (n) {
      var o = document.createElement('option');
      o.value = n;
      o.textContent = nivelTexto(n);
      if (s && s.level === n) o.selected = true;
      sel.appendChild(o);
    });
    sel.addEventListener('change', function () {
      crearDemo(sel.value);
    });
    acciones.appendChild(sel);

    /* Saltar al certificado sin hacer 60 clicks */
    var enCurso = Z.enCurso();
    if (enCurso.length) {
      var salto = el('button', 'btn btn--sm', UI.demo.completaCurso);
      salto.type = 'button';
      salto.addEventListener('click', function () {
        var curso = enCurso[0];
        var r = Z.completarCursoDemo(curso.id);
        renderTodo();
        anunciar(UI.demo.completaCurso);
        if (r && r.nuevoSello) {
          modalSello(Z.progresoSello().completos);
        } else {
          modalCursoTerminado(curso);
        }
      });
      acciones.appendChild(salto);
    }

    var reset = el('button', 'btn btn--sm', UI.demo.reiniciar);
    reset.type = 'button';
    reset.addEventListener('click', function () {
      Z.reiniciarDemo();
      renderTodo();
      anunciar(UI.demo.reiniciado);
    });
    acciones.appendChild(reset);

    host.appendChild(acciones);

    if (!s) {
      host.appendChild(el('span', null,
        t('acceso', 'nivelInsuficienteTitulo', {
          n: Z.nivelesFaltantes(),
        }) + ' → ' + nivelMinimo));
    }
  }

  function crearDemo(nivel) {
    if (!SESSION) return;
    SESSION.write({ name: 'Perfil demo ZAG', level: nivel });
    renderTodo();
    anunciar(UI.demo.listo);
  }

  /* ---------- modal ---------- */
  function abrirModal(cfg) {
    state.modal = cfg;
    var box = $('cursos-modal');
    if (!box) return;
    txt('cursos-modal-icon', cfg.icon || '');
    txt('cursos-modal-title', cfg.titulo);
    txt('cursos-modal-copy', cfg.copia || '');

    var host = $('cursos-modal-actions');
    if (host) {
      host.textContent = '';
      (cfg.acciones || []).forEach(function (a) {
        var b = el(a.href ? 'a' : 'button', 'btn btn--sm' + (a.secundario ? ' btn--outline' : ''), a.texto);
        if (a.href) {
          b.href = a.href;
        } else {
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
    var cerrar = $('cursos-modal-close');
    if (cerrar) cerrar.focus();
  }

  function cerrarModal() {
    var box = $('cursos-modal');
    if (box) box.hidden = true;
    state.modal = null;
    if (state.focoPrevio && typeof state.focoPrevio.focus === 'function') {
      state.focoPrevio.focus();
    }
  }

  /* Modal de Sello ZAG ganado */
  function modalSello(nCursos) {
    abrirModal({
      icon: '🏅',
      titulo: UI.popup.selloTitulo,
      copia: t('popup', 'selloCopia', { n: nCursos }),
      acciones: [
        { texto: UI.popup.seguir, alHacerClic: function () {} },
      ],
    });
  }

  /* Modal de curso terminado */
  function modalCursoTerminado(curso) {
    abrirModal({
      icon: '🎓',
      titulo: t('popup', 'cursoTerminado', { curso: curso.titulo }),
      copia: '',
      acciones: [
        {
          texto: UI.popup.verCertificado,
          href: 'certificado.html?id=' + encodeURIComponent(curso.id),
        },
        { texto: UI.popup.seguir, secundario: true, alHacerClic: function () {} },
      ],
    });
  }

  function initModal() {
    var cerrar = $('cursos-modal-close');
    if (cerrar) cerrar.addEventListener('click', cerrarModal);

    var box = $('cursos-modal');
    if (box) {
      box.addEventListener('click', function (e) {
        if (e.target === box) cerrarModal();
      });
    }

    document.addEventListener('keydown', function (e) {
      if (!state.modal) return;
      if (e.key === 'Escape') {
        cerrarModal();
        return;
      }
      /* Focus trap: el foco no puede escaparse del diálogo. */
      if (e.key !== 'Tab') return;
      var focoables = box.querySelectorAll('a[href], button:not([disabled])');
      if (!focoables.length) return;
      var primero = focoables[0];
      var ultimo = focoables[focoables.length - 1];
      if (e.shiftKey && document.activeElement === primero) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault();
        primero.focus();
      }
    });
  }

  /* ---------- reset del footer ---------- */
  function initReset() {
    var btn = $('cursos-reset');
    if (!btn) return;
    btn.textContent = UI.demo.reiniciar;
    btn.addEventListener('click', function () {
      Z.reiniciarDemo();
      renderTodo();
      anunciar(UI.demo.reiniciado);
    });
  }

  /* ---------- render global ---------- */
  function renderTodo() {
    renderChipSesion();
    renderSelloPill();
    renderHeroLinks();
    renderStats();
    renderTabs();
    renderGrid();
    renderDemo();
  }

  /* ---------- init ---------- */
  function init() {
    if (!Z || !Z.datos().cursos.length) return;
    UI = (Z.datos().ui || {});

    /* Región viva para anunciar cambios a lectores de pantalla. */
    var vivo = el('p', 'cursos-sr');
    vivo.id = 'cursos-vivo';
    vivo.setAttribute('role', 'status');
    vivo.setAttribute('aria-live', 'polite');
    document.body.appendChild(vivo);

    renderHero();
    renderTodo();
    initModal();
    initReset();

    /* El progreso puede cambiar desde otra pestaña abierta. */
    window.addEventListener('storage', function (e) {
      if (!e.key) return;
      if (e.key.indexOf('zag_cursos') === 0 || e.key === 'zag_sellos') renderTodo();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();