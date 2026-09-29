/* ============================================================
   PORTAL ZAG — Proyectos fuera del ZIG
   Grilla, filtros, buscador, formulario y modal. Vanilla.
   Todo texto de datos o del usuario se inserta con textContent.
   ============================================================ */

(function () {
  'use strict';

  var D = window.ZAG_PROYECTOS;
  if (!D) return;
  var UI = D.ui;

  var LS = 'zag_proyectos_enviados';
  var THEMES = ['cream', 'light', 'cta', 'white', 'black'];

  function $(id) { return document.getElementById(id); }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  var state = {
    q: '',
    cat: 'Todos',
    nivel: 'Todos',
    orden: 'recientes',
    reduce: false,
    session: null,
    sent: [],
    cats: [],
    equipo: [],
  };

  /* ============================================================
     Utilidades
     ============================================================ */
  function norm(s) {
    return (s || '')
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  function debounce(fn, ms) {
    var t = 0;
    return function () {
      var args = arguments, self = this;
      window.clearTimeout(t);
      t = window.setTimeout(function () { fn.apply(self, args); }, ms);
    };
  }

  function iconBirrete() {
    var S = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(S, 'svg');
    svg.setAttribute('width', '16'); svg.setAttribute('height', '16');
    svg.setAttribute('viewBox', '0 0 24 24'); svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor'); svg.setAttribute('stroke-width', '2');
    svg.setAttribute('stroke-linecap', 'round'); svg.setAttribute('stroke-linejoin', 'round');
    svg.setAttribute('aria-hidden', 'true');
    var p = document.createElementNS(S, 'path');
    p.setAttribute('d', 'm2 9 10-5 10 5-10 5L2 9Zm4 2.5V15c0 1.1 2.7 2.5 6 2.5s6-1.4 6-2.5v-3.5');
    svg.appendChild(p);
    return svg;
  }

  function iconSalir() {
    var S = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(S, 'svg');
    svg.setAttribute('width', '22'); svg.setAttribute('height', '22');
    svg.setAttribute('viewBox', '0 0 24 24'); svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor'); svg.setAttribute('stroke-width', '2.4');
    svg.setAttribute('stroke-linecap', 'round'); svg.setAttribute('stroke-linejoin', 'round');
    svg.setAttribute('aria-hidden', 'true');
    var p1 = document.createElementNS(S, 'path');
    p1.setAttribute('d', 'M6 18 18 6');
    var p2 = document.createElementNS(S, 'path');
    p2.setAttribute('d', 'M9 6h9v9');
    svg.appendChild(p1);
    svg.appendChild(p2);
    return svg;
  }

  function fmtDate(iso) {
    if (!iso) return '';
    var p = String(iso).split('-');
    if (p.length < 3) return iso;
    var m = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    var mi = parseInt(p[1], 10) - 1;
    if (mi < 0 || mi > 11) return iso;
    return parseInt(p[2], 10) + ' ' + m[mi] + ' ' + p[0];
  }

  function initialsOf(name) {
    var parts = String(name || '').trim().split(/\s+/);
    if (!parts.length) return '?';
    var a = parts[0][0] || '';
    var b = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (a + b).toUpperCase();
  }

  function announce(msg) {
    var live = $('proy-live');
    if (!live) return;
    live.textContent = '';
    window.setTimeout(function () { live.textContent = msg; }, 20);
  }

  function getParam(k) {
    var m = new RegExp('[?&]' + k + '=([^&]*)').exec(window.location.search);
    return m ? decodeURIComponent(m[1].replace(/\+/g, ' ')) : '';
  }

  function syncUrl() {
    var p = [];
    if (state.q) p.push('q=' + encodeURIComponent(state.q));
    if (state.cat && state.cat !== 'Todos') p.push('cat=' + encodeURIComponent(state.cat));
    if (state.nivel && state.nivel !== 'Todos') p.push('nivel=' + encodeURIComponent(state.nivel));
    if (state.orden === 'antiguos') p.push('orden=antiguos');
    var qs = p.length ? '?' + p.join('&') : '';
    window.history.replaceState(null, '', window.location.pathname + qs);
  }

  function readUrl() {
    state.q = getParam('q') || '';
    var cat = getParam('cat');
    var niv = getParam('nivel');
    var canon = function (list, v) {
      for (var i = 0; i < list.length; i++) {
        if (norm(list[i]) === norm(v)) return list[i];
      }
      return '';
    };
    state.cat = canon(UI.cats, cat) || 'Todos';
    state.nivel = canon(UI.niveles, niv) || 'Todos';
    state.orden = getParam('orden') === 'antiguos' ? 'antiguos' : 'recientes';
  }

  /* ============================================================
     Almacenamiento de enviados
     ============================================================ */
  function loadSent() {
    try {
      var raw = window.localStorage.getItem(LS);
      var list = raw ? JSON.parse(raw) : [];
      state.sent = Array.isArray(list) ? list : [];
    } catch (e) { state.sent = []; }
  }

  function saveSent() {
    try {
      window.localStorage.setItem(LS, JSON.stringify(state.sent.slice(-50)));
      return true;
    } catch (e) { return false; }
  }

  function reduceImage(src, maxW, quality) {
    return new Promise(function (resolve) {
      var img = new Image();
      img.onload = function () {
        try {
          var w = img.naturalWidth, h = img.naturalHeight;
          if (!w || !h) return resolve(null);
          var scale = Math.min(1, maxW / w);
          var cw = Math.max(1, Math.round(w * scale));
          var ch = Math.max(1, Math.round(h * scale));
          var c = document.createElement('canvas');
          c.width = cw; c.height = ch;
          var ctx = c.getContext('2d');
          ctx.drawImage(img, 0, 0, cw, ch);
          resolve(c.toDataURL('image/jpeg', quality));
        } catch (e) { resolve(null); }
      };
      img.onerror = function () { resolve(null); };
      img.src = src;
    });
  }

  /* ============================================================
     Hero
     ============================================================ */
  function buildFrase(visual) {
    /* devuelve el nodo con el texto partido y "la filosofía del ZAG." en naranja */
    var n = el(visual ? 'p' : 'span', 'smudge-frase ' + (visual ? 'smudge-frase-visual' : 'smudge-frase-sr'));
    n.appendChild(document.createTextNode(UI.heroFraseAntes + ' '));
    n.appendChild(el('span', 'smudge-frase-accent', UI.heroFraseAccent + (UI.heroFraseDespues || '')));
    return n;
  }

  function renderHero() {
    var k = $('smudge-kicker');
    var t = $('smudge-title');
    if (k) k.textContent = UI.heroKicker;
    if (t) {
      t.textContent = '';
      t.appendChild(document.createTextNode(UI.heroTitle + ' '));
      t.appendChild(el('span', 'smudge-accent', UI.heroTitleAccent));
    }
    /* la capa revelada lleva el acento naranja; la copia para lectores de
       pantalla se queda en texto plano, sin markup */
    var visual = document.querySelector('.smudge-frase-visual');
    if (visual && visual.parentNode) {
      visual.parentNode.replaceChild(buildFrase(true), visual);
    }
    var sr = document.querySelector('.smudge-frase-sr');
    if (sr) {
      sr.textContent = UI.heroFraseAntes + ' ' + UI.heroFraseAccent + (UI.heroFraseDespues || '');
    }
    var hd = document.querySelector('.smudge-hint--desktop');
    var ht = document.querySelector('.smudge-hint--touch');
    if (hd) hd.textContent = UI.heroHintDesktop;
    if (ht) ht.textContent = UI.heroHintMobile;
  }

  /* ============================================================
     Barra de filtros
     ============================================================ */
  function renderFiltros() {
    var k = $('proy-filters-kicker');
    var t = $('proy-filters-title');
    if (k) k.textContent = UI.filtrosKicker;
    if (t) t.textContent = UI.filtrosTitle;

    var input = $('proy-search-input');
    if (input) {
      input.placeholder = UI.searchPh;
      input.setAttribute('aria-label', UI.searchAria);
      input.value = state.q;
    }

    var chips = $('proy-chips');
    if (chips) {
      chips.textContent = '';
      UI.cats.forEach(function (c) {
        var b = el('button', 'proy-chip', c);
        b.type = 'button';
        b.setAttribute('aria-pressed', String(c === state.cat));
        b.addEventListener('click', function () {
          state.cat = c;
          renderFiltros();
          renderGrid();
          syncUrl();
        });
        chips.appendChild(b);
      });
    }

    var nl = $('proy-nivel-label');
    if (nl) nl.textContent = UI.nivelAria;
    var nivel = $('proy-nivel');
    if (nivel && !nivel.options.length) {
      UI.niveles.forEach(function (n) {
        var o = document.createElement('option');
        o.value = n; o.textContent = n;
        nivel.appendChild(o);
      });
      nivel.addEventListener('change', function () {
        state.nivel = nivel.value;
        renderGrid(); syncUrl();
      });
    }
    if (nivel) nivel.value = state.nivel;

    var ol = $('proy-orden-label');
    if (ol) ol.textContent = UI.ordenAria;
    var orden = $('proy-orden');
    if (orden && orden.options.length) {
      orden.options[0].textContent = UI.ordenRecientes;
      orden.options[1].textContent = UI.ordenAntiguos;
      if (!orden.dataset.bound) {
        orden.dataset.bound = '1';
        orden.addEventListener('change', function () {
          state.orden = orden.value;
          renderGrid(); syncUrl();
        });
      }
      orden.value = state.orden;
    }

    var clear = $('proy-clear');
    if (clear) {
      clear.textContent = UI.limpiar;
      clear.hidden = !(state.q || state.cat !== 'Todos' || state.nivel !== 'Todos' || state.orden !== 'recientes');
      clear.onclick = function () {
        state.q = ''; state.cat = 'Todos'; state.nivel = 'Todos'; state.orden = 'recientes';
        renderFiltros(); renderGrid(); syncUrl();
      };
    }
  }

  function onSearchInput() {
    var input = $('proy-search-input');
    var run = debounce(function () {
      state.q = input.value.trim();
      renderGrid(); syncUrl();
    }, 250);
    if (input && !input.dataset.bound) {
      input.dataset.bound = '1';
      input.addEventListener('input', run);
    }
  }

  /* ============================================================
     Datos
     ============================================================ */
  function all() {
    return state.sent.concat(D.proyectos);
  }

  function levelMatches(proj, nivel) {
    if (nivel === 'Todos') return true;
    var n = norm(proj.autor && proj.autor.nivel);
    return n === norm(nivel);
  }

  function filter() {
    var q = norm(state.q);
    var list = all().filter(function (p) {
      if (state.cat !== 'Todos') {
        var cats = (p.categorias || []).map(norm);
        if (cats.indexOf(norm(state.cat)) === -1) return false;
      }
      if (!levelMatches(p, state.nivel)) return false;
      if (q) {
        var hay = [
          p.titulo, p.extracto,
          p.autor && p.autor.nombre,
          (p.categorias || []).join(' '),
        ].join(' ');
        if (norm(hay).indexOf(q) === -1) return false;
      }
      return true;
    });
    list.sort(function (a, b) {
      /* lo que acabas de enviar manda, luego los fijados, luego por fecha */
      var rank = function (p) { return p.enRevision ? 0 : (p.pinned ? 1 : 2); };
      var ra = rank(a), rb = rank(b);
      if (ra !== rb) return ra - rb;
      var da = Date.parse(a.fecha) || 0;
      var db = Date.parse(b.fecha) || 0;
      return state.orden === 'antiguos' ? da - db : db - da;
    });
    return list;
  }

  /* ============================================================
     Tarjetas
     ============================================================ */
  function buildCard(p, idx) {
    var revision = !!p.enRevision;
    var card = el('article', 'proy-card' + (p.pinned ? ' proy-card--pinned' : '') + (revision ? ' is-revision' : ''));
    card.style.setProperty('--stagger', (Math.min(idx, 8) * 60) + 'ms');

    var cover = el('div', 'proy-cover');
    if (p.cover) {
      var img = el('img', 'proy-cover-img');
      img.src = p.cover;
      img.alt = 'Portada de ' + p.titulo;
      img.loading = 'lazy';
      cover.appendChild(img);
    } else {
      var theme = THEMES[idx % THEMES.length];
      var ph = el('div', 'proy-cover-ph proy-cover-ph--' + theme);
      ph.appendChild(el('span', 'proy-cover-ph-ini', initialsOf(p.titulo)));
      cover.appendChild(ph);
    }

    var cats = (p.categorias || []).slice(0, 2);
    var extra = (p.categorias || []).length - cats.length;
    if (cats.length || extra > 0) {
      var tags = el('div', 'proy-cover-tags');
      cats.forEach(function (c) { tags.appendChild(el('span', 'proy-tag', c)); });
      if (extra > 0) tags.appendChild(el('span', 'proy-tag', '+' + extra));
      cover.appendChild(tags);
    }

    if (p.pinned && !revision) cover.appendChild(el('span', 'proy-badge-pinned', UI.badgeDestacado));
    if (revision) cover.appendChild(el('span', 'proy-badge-revision', UI.badgeRevision));

    var overlay = el('div', 'proy-overlay');
    var btn = el('span', 'btn proy-btn-ver');
    btn.appendChild(document.createTextNode(UI.verProyecto));
    btn.appendChild(iconSalir());
    overlay.appendChild(btn);
    cover.appendChild(overlay);
    card.appendChild(cover);

    var body = el('div', 'proy-body');
    var title = el('h3', 'proy-title');
    if (revision) {
      title.appendChild(document.createTextNode(p.titulo));
    } else {
      var a = document.createElement('a');
      a.href = p.link;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.textContent = p.titulo;
      a.setAttribute('aria-label', 'Ver proyecto ' + p.titulo + ' en ' +
        (p.destino === 'drive' ? UI.destinoDrive : UI.destinoBehance) +
        ', se abre en otra pestaña');
      title.appendChild(a);
    }
    body.appendChild(title);
    body.appendChild(el('p', 'proy-extract', p.extracto));

    if (p.equipo && p.equipo.length) {
      var team = el('div', 'proy-team');
      var plus = p.equipo.length - 3;
      p.equipo.slice(0, 3).forEach(function (name) {
        var t = el('span', 'proy-team-chip');
        t.appendChild(el('span', 'proy-team-avatar', initialsOf(name)));
        t.appendChild(el('span', 'proy-team-name', name));
        team.appendChild(t);
      });
      if (plus > 0) team.appendChild(el('span', 'proy-team-more', '+' + plus));
      body.appendChild(team);
    }

    if (revision) {
      var sim = el('button', 'proy-simular', UI.simularAprobacion);
      sim.type = 'button';
      sim.addEventListener('click', function () { approve(p.id); });
      body.appendChild(sim);
    }

    var foot = el('div', 'proy-foot');
    var who = el('div', 'proy-who');
    var av = el('span', 'proy-avatar proy-avatar--' + norm(p.autor.nivel), p.autor.iniciales || initialsOf(p.autor.nombre));
    who.appendChild(av);
    var wt = el('div', 'proy-who-text');
    wt.appendChild(el('div', 'proy-card-author', p.autor.nombre));
    wt.appendChild(el('div', 'proy-meta', levelName(p.autor.nivel) + ' · ' + fmtDate(p.fecha)));
    who.appendChild(wt);
    foot.appendChild(who);

    var sem = el('div', 'proy-sem');
    sem.appendChild(iconBirrete());
    sem.appendChild(document.createTextNode((p.semestre || '') + ' · ' + (p.periodo || '')));
    foot.appendChild(sem);
    body.appendChild(foot);

    card.appendChild(body);
    return card;
  }

  function levelName(id) {
    var c = window.ZAG_CONTENT;
    var list = c && c.niveles && c.niveles.levels;
    if (list) {
      for (var i = 0; i < list.length; i++) {
        if (list[i].id === id) return list[i].name;
      }
    }
    return id || '';
  }

  function approve(id) {
    state.sent = state.sent.filter(function (x) { return x.id !== id; });
    saveSent();
    renderGrid();
    announce('Proyecto aprobado. Ya aparece como un proyecto normal.');
  }

  function renderGrid() {
    var grid = $('proy-grid');
    var empty = $('proy-empty');
    if (!grid) return;
    var list = filter();
    grid.textContent = '';
    list.forEach(function (p, i) {
      grid.appendChild(buildCard(p, i));
    });

    if (empty) {
      empty.hidden = list.length > 0;
      var et = $('proy-empty-titulo');
      var ec = $('proy-empty-copy');
      var ecta = $('proy-empty-cta');
      if (et) et.textContent = UI.vacioTitulo;
      if (ec) ec.textContent = UI.vacioCopy;
      if (ecta) ecta.textContent = UI.vacioCta;
    }

    var count = $('proy-count');
    if (count) {
      count.textContent = list.length + ' ' + (list.length === 1 ? UI.contadorUno : UI.contadorVarios);
    }

    if (list.length) {
      announce(list.length + ' ' + (list.length === 1 ? UI.contadorUno : UI.contadorVarios) + ' encontrados.');
    }
    observeCards();
  }

  function observeCards() {
    var cards = document.querySelectorAll('.proy-card:not(.is-in)');
    if (state.reduce) {
      cards.forEach(function (c) { c.classList.add('is-in'); });
      return;
    }
    if (!('IntersectionObserver' in window)) {
      cards.forEach(function (c) { c.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          var d = parseInt(en.target.style.getPropertyValue('--stagger') || '0', 10) || 0;
          window.setTimeout(function () { en.target.classList.add('is-in'); }, d);
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.1 });
    cards.forEach(function (c) { io.observe(c); });
  }

  /* ============================================================
     Sesión / gate
     ============================================================ */
  function sessionLevel() {
    var s = window.ZAG_SESSION && window.ZAG_SESSION.read();
    return s && s.level ? s : null;
  }

  function renderGate() {
    state.session = sessionLevel();
    var gate = $('proy-gate');
    var author = $('proy-author');
    var form = $('proy-form');
    if (state.session) {
      if (gate) gate.hidden = true;
      if (form) form.hidden = false;
      if (author) {
        author.hidden = false;
        var av = $('proy-author-avatar');
        var tx = $('proy-author-text');
        if (av) {
          av.className = 'proy-avatar proy-avatar--' + norm(state.session.level);
          av.textContent = initialsOf(state.session.name || 'Demo');
        }
        if (tx) tx.textContent = (state.session.name || 'Demo') + ' · ' + levelName(state.session.level);
      }
    } else {
      if (gate) gate.hidden = false;
      if (form) form.hidden = true;
      if (author) author.hidden = true;
    }
  }

  function initGate() {
    var g = $('proy-gate');
    if (!g) return;
    var msg = $('proy-gate-msg');
    var act = $('proy-gate-activar');
    var demo = $('proy-gate-demo');
    var box = $('proy-gate-box');
    var hint = $('proy-gate-hint');
    var nivel = $('proy-gate-nivel');
    var nl = $('proy-gate-nivel-label');
    if (msg) msg.textContent = UI.formSinSesion;
    if (act) act.textContent = UI.formActivar;
    if (demo) demo.textContent = UI.formDemo;
    if (hint) hint.textContent = UI.formDemoHint;
    if (nl) nl.textContent = UI.nivelAria;

    if (nivel && !nivel.options.length) {
      UI.niveles.slice(1).forEach(function (n) {
        var o = document.createElement('option');
        o.value = n; o.textContent = n;
        nivel.appendChild(o);
      });
      nivel.addEventListener('change', function () {
        window.ZAG_SESSION.write({ name: 'Demo', level: norm(nivel.value) });
        var sembrado = seedDemoPendiente();
        renderGate();
        renderFiltros();
        renderGrid();
        renderBell();
        announce(sembrado
          ? 'Perfil demo activado. Mariana T. tiene un proyecto en revisión.'
          : 'Perfil demo activado. Ya puedes subir tu proyecto.');
      });
    }

    if (demo && box) {
      demo.addEventListener('click', function () {
        box.hidden = !box.hidden;
        demo.setAttribute('aria-expanded', String(!box.hidden));
      });
    }
  }

  /* ============================================================
     Formulario
     ============================================================ */
  function showErr(id, msg) {
    var n = $(id);
    if (!n) return;
    n.textContent = msg || '';
    n.hidden = !msg;
  }

  function setInvalid(inputId, bad) {
    var n = $(inputId);
    if (n) n.setAttribute('aria-invalid', String(!!bad));
  }

  /* Devuelve 'drive' | 'behance' | 'web' si el link es una URL válida,
     o null si no lo es. Se acepta cualquier sitio: el destino solo
     clasifica para mostrar el ícono y el aviso de Drive. */
  function parseLink(url) {
    var raw = String(url || '').trim();
    if (!raw) return null;
    if (!/^https?:\/\//i.test(raw)) return null;
    var host;
    try {
      host = new URL(raw).hostname.toLowerCase();
    } catch (e) {
      return null;
    }
    if (host === 'drive.google.com' || host.endsWith('.drive.google.com')) return 'drive';
    if (host === 'docs.google.com' || host.endsWith('.docs.google.com')) return 'drive';
    if (host === 'behance.net' || host.endsWith('.behance.net')) return 'behance';
    return 'web';
  }

  function initForm() {
    var f = $('proy-form');
    if (!f) return;

    var set = function (id, text) { var n = $(id); if (n) n.textContent = text; };
    set('proy-form-kicker', UI.formKicker);
    set('proy-form-title', UI.formTitle);
    set('proy-form-sub', UI.formSub);
    set('proy-titulo-label', UI.fTitulo);
    set('proy-desc-label', UI.fDesc);
    set('proy-cat-label', UI.fCat);
    set('proy-link-label', UI.fLink);
    set('proy-link-hint', UI.fLinkHint);
    set('proy-portada-label', UI.fPortada);
    set('proy-equipo-label', UI.fEquipo);
    set('proy-specs-summary', UI.specsTitulo);
    set('proy-specs-footer', UI.specsFooter);
    set('proy-legal-text', UI.avisoLegal);
    set('proy-reset', UI.resetDemo);

    var titulo = $('proy-titulo');
    if (titulo) titulo.placeholder = UI.fTituloPh;
    var desc = $('proy-desc');
    if (desc) desc.placeholder = UI.fDescPh;
    var link = $('proy-link');
    if (link) link.placeholder = UI.fLinkPh;

    var specs = $('proy-specs-list');
    if (specs) {
      UI.specs.forEach(function (s) { specs.appendChild(el('li', null, s)); });
    }

    /* chips de categoría (hasta 3) */
    var catBox = $('proy-cat-chips');
    if (catBox) {
      D.categorias.forEach(function (c) {
        var b = el('button', 'proy-cat-chip', c);
        b.type = 'button';
        b.setAttribute('aria-pressed', 'false');
        b.addEventListener('click', function () {
          var on = b.getAttribute('aria-pressed') === 'true';
          if (!on && state.cats.length >= 3) return;
          if (on) {
            state.cats = state.cats.filter(function (x) { return x !== c; });
          } else {
            state.cats.push(c);
          }
          b.setAttribute('aria-pressed', String(!on));
          showErr('proy-cat-error', '');
          updateSubmit();
        });
        catBox.appendChild(b);
      });
    }

    /* contadores */
    var tCount = $('proy-titulo-count');
    var dCount = $('proy-desc-count');
    var updCounts = function () {
      if (tCount) tCount.textContent = (titulo ? titulo.value.length : 0) + ' / 80';
      if (dCount) dCount.textContent = (desc ? desc.value.length : 0) + ' / 280';
      updateSubmit();
    };
    if (titulo) titulo.addEventListener('input', updCounts);
    if (desc) desc.addEventListener('input', updCounts);
    updCounts();

    /* link: nota de Drive (solo si el destino es Drive) */
    if (link) {
      link.addEventListener('input', function () {
        var v = parseLink(link.value);
        var note = $('proy-link-drive');
        if (note) note.hidden = v !== 'drive';
        showErr('proy-link-error', '');
        setInvalid('proy-link', false);
        updateSubmit();
      });
    }

    /* portada: tamaño, proporción y vista previa */
    var file = $('proy-portada');
    var covImg = $('proy-cover-img');
    var covEmpty = $('proy-cover-empty');
    var coverData = { data: null, ratio: 0, weight: 0, over: false };
    if (file) {
      file.addEventListener('change', function () {
        var fl = file.files && file.files[0];
        if (!fl) {
          coverData = { data: null, ratio: 0, weight: 0, over: false };
          if (covImg) { covImg.hidden = true; covImg.removeAttribute('src'); }
          if (covEmpty) covEmpty.hidden = false;
          showErr('proy-portada-error', ''); showErr('proy-portada-warn', '');
          setInvalid('proy-portada', false);
          updateSubmit();
          return;
        }
        if (fl.size > 2 * 1024 * 1024) {
          coverData = { data: null, ratio: 0, weight: fl.size, over: true };
          showErr('proy-portada-error', UI.errPortadaPeso);
          setInvalid('proy-portada', true);
          if (covImg) { covImg.hidden = true; covImg.removeAttribute('src'); }
          if (covEmpty) covEmpty.hidden = false;
          updateSubmit();
          return;
        }
        showErr('proy-portada-error', ''); setInvalid('proy-portada', false);
        var reader = new FileReader();
        reader.onload = function () {
          var src = reader.result;
          var probe = new Image();
          probe.onload = function () {
            coverData = { data: src, ratio: probe.naturalWidth / probe.naturalHeight, weight: fl.size, over: false };
            if (covImg) { covImg.src = src; covImg.hidden = false; }
            if (covEmpty) covEmpty.hidden = true;
            var r = coverData.ratio;
            if (Math.abs(r - 16 / 9) > 0.12) {
              showErr('proy-portada-warn', UI.warnPortadaRatio);
            } else {
              showErr('proy-portada-warn', '');
            }
            updateSubmit();
          };
          probe.onerror = function () { updateSubmit(); };
          probe.src = src;
        };
        reader.readAsDataURL(fl);
      });
    }

    /* chips de equipo */
    var eq = $('proy-equipo');
    var eqBox = $('proy-equipo-chips');
    function drawEq() {
      if (!eqBox) return;
      eqBox.textContent = '';
      state.equipo.forEach(function (name, i) {
        var c = el('span', 'proy-equipo-chip');
        c.appendChild(document.createTextNode(name));
        var x = el('button', null, '×');
        x.type = 'button';
        x.setAttribute('aria-label', 'Quitar ' + name);
        x.addEventListener('click', function () {
          state.equipo.splice(i, 1);
          drawEq();
          updateSubmit();
        });
        c.appendChild(x);
        eqBox.appendChild(c);
      });
    }
    if (eq) {
      eq.placeholder = UI.fEquipoPh;
      eq.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter' && e.key !== ',') return;
        e.preventDefault();
        var v = eq.value.trim().replace(/,$/, '');
        if (!v) return;
        if (state.equipo.length >= 6) { showErr('proy-equipo-error', UI.errEquipo); return; }
        showErr('proy-equipo-error', '');
        state.equipo.push(v);
        eq.value = '';
        drawEq();
        updateSubmit();
      });
    }

    /* legal */
    var legal = $('proy-legal');
    if (legal) legal.addEventListener('change', function () {
      showErr('proy-legal-error', '');
      updateSubmit();
    });

    /* validación al salir del campo */
    function validateField(input) {
      if (!input) return true;
      var id = input.id;
      var ok = true;
      if (id === 'proy-titulo') {
        ok = input.value.trim().length > 0 && input.value.trim().length <= 80;
        showErr('proy-titulo-error', ok ? '' : UI.errTitulo);
        setInvalid('proy-titulo', !ok);
      } else if (id === 'proy-desc') {
        ok = input.value.trim().length > 0 && input.value.trim().length <= 280;
        showErr('proy-desc-error', ok ? '' : UI.errDesc);
        setInvalid('proy-desc', !ok);
      } else if (id === 'proy-link') {
        ok = parseLink(input.value) !== null;
        showErr('proy-link-error', ok ? '' : UI.errLink);
        setInvalid('proy-link', !ok);
      }
      updateSubmit();
      return ok;
    }
    ['proy-titulo', 'proy-desc', 'proy-link'].forEach(function (id) {
      var n = $(id);
      if (n) n.addEventListener('blur', function () { validateField(n); });
    });

    function firstErrorField() {
      if (titulo && (!titulo.value.trim() || titulo.value.trim().length > 80)) return titulo;
      if (desc && (!desc.value.trim() || desc.value.trim().length > 280)) return desc;
      if (state.cats.length === 0) return catBox;
      if (link && parseLink(link.value) === null) return link;
      if (coverData && coverData.over) return $('proy-portada');
      if (!legal || !legal.checked) return legal;
      return null;
    }

    function updateSubmit() {
      var bad = firstErrorField();
      var sub = $('proy-submit');
      if (sub) {
        sub.disabled = !!bad;
        /* la etiqueta se refresca siempre: si no, el botón queda vacío al cargar */
        if (sub.textContent !== UI.enviar && sub.textContent !== UI.enviando) {
          sub.textContent = UI.enviar;
        }
      }
    }
    updateSubmit();

    /* envío */
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      /* Sin sesión dentro del portal no se envía nada: vuelve el cartel. */
      if (!sessionLevel()) {
        renderGate();
        var g = $('proy-gate');
        if (g) g.scrollIntoView({ block: 'center' });
        return;
      }
      var first = firstErrorField();
      if (first) {
        if (first === catBox) {
          showErr('proy-cat-error', UI.errCat);
          var chip = catBox && catBox.querySelector('button');
          if (chip) chip.focus();
        } else if (first === legal) {
          showErr('proy-legal-error', UI.errLegal);
          first.focus();
        } else {
          validateField(first);
        }
        return;
      }
      var sub = $('proy-submit');
      sub.disabled = true;
      sub.textContent = UI.enviando;

      window.setTimeout(function () {
        var p = {
          id: 'enviado-' + Date.now(),
          titulo: titulo.value.trim(),
          extracto: desc.value.trim(),
          categorias: state.cats.slice(),
          autor: {
            nombre: (state.session && state.session.name) || 'Demo',
            iniciales: initialsOf((state.session && state.session.name) || 'Demo'),
            nivel: (state.session && state.session.level) || 'rookie',
          },
          equipo: state.equipo.slice(),
          fecha: new Date().toISOString().slice(0, 10),
          semestre: '1° sem',
          periodo: '2026-1',
          link: link.value.trim(),
          destino: parseLink(link.value) || 'web',
          cover: null,
          enRevision: true,
        };

        var finish = function () {
          state.sent.unshift(p);
          saveSent();
          renderGrid();
          openModal(sub);
          /* limpiar */
          f.reset();
          state.cats = [];
          state.equipo = [];
          drawEq();
          document.querySelectorAll('.proy-cat-chip').forEach(function (b) {
            b.setAttribute('aria-pressed', 'false');
          });
          if (covImg) { covImg.hidden = true; covImg.removeAttribute('src'); }
          if (covEmpty) covEmpty.hidden = false;
          showErr('proy-titulo-error', ''); showErr('proy-desc-error', '');
          showErr('proy-cat-error', ''); showErr('proy-link-error', '');
          showErr('proy-portada-error', ''); showErr('proy-portada-warn', '');
          showErr('proy-equipo-error', ''); showErr('proy-legal-error', '');
          setInvalid('proy-titulo', false); setInvalid('proy-desc', false);
          setInvalid('proy-link', false); setInvalid('proy-portada', false);
          var note = $('proy-link-drive'); if (note) note.hidden = true;
          sub.textContent = UI.enviar;
          updCounts();
        };

        if (coverData.data) {
          reduceImage(coverData.data, 960, 0.7).then(function (small) {
            if (small) p.cover = small;
            finish();
          });
        } else {
          finish();
        }
      }, 600);
    });
  }

  /* ============================================================
     Modal
     ============================================================ */
  var modalPrevFocus = null;

  function openModal(returnTo) {
    var m = $('proy-modal');
    if (!m) return;
    modalPrevFocus = returnTo || document.activeElement;
    var t = $('proy-modal-title');
    var c = $('proy-modal-copy');
    var cta = $('proy-modal-cta');
    if (t) t.textContent = UI.modTitulo;
    if (c) c.textContent = UI.modCopy;
    if (cta) cta.textContent = UI.modCta;
    m.hidden = false;
    document.body.style.overflow = 'hidden';
    if (cta) cta.focus();
  }

  function closeModal() {
    var m = $('proy-modal');
    if (!m || m.hidden) return;
    m.hidden = true;
    document.body.style.overflow = '';
    /* el botón de envío se deshabilita al limpiar el formulario:
       si ya no puede recibir foco, se devuelve a un campo visible */
    var back = modalPrevFocus;
    var usable = back && back.focus && document.contains(back) && !back.disabled && back.offsetParent !== null;
    if (!usable) {
      back = $('proy-titulo');
      if (!back || back.offsetParent === null) back = $('proy-empty-cta') || $('proy-gate') || document.body;
    }
    if (back && back.focus) back.focus();
  }

  function initModal() {
    var m = $('proy-modal');
    if (!m) return;
    var cta = $('proy-modal-cta');
    if (cta) cta.addEventListener('click', closeModal);
    m.addEventListener('click', function (e) {
      if (e.target.hasAttribute('data-close')) closeModal();
    });
    document.addEventListener('keydown', function (e) {
      if (m.hidden) return;
      if (e.key === 'Escape') { closeModal(); return; }
      if (e.key === 'Tab') {
        var focusables = m.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (!focusables.length) return;
        var first = focusables[0];
        var last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  /* ============================================================
     Reiniciar demo
     ============================================================ */
  function initReset() {
    var b = $('proy-reset');
    if (!b) return;
    b.addEventListener('click', function () {
      try { window.localStorage.removeItem(LS); } catch (e) { /* sin storage */ }
      state.sent = [];
      /* el envío en revisión de Mariana T. es parte de la demo: se repone */
      seedDemoPendiente();
      renderGrid();
      renderBell();
      announce('Demo reiniciada. Se borraron los proyectos enviados.');
    });
  }

  /* ============================================================
     Campana de avisos
     Muestra solo lo que envió ESTE visitante en ESTE navegador.
     No hay backend: nada de lo que hay aquí sale de su máquina.
     ============================================================ */
  var DEMO_PENDIENTE = {
    id: 'enviado-mariana-t',
    titulo: 'Rebranding de una tostadora',
    extracto: 'Le devolvimos el alma a un electrodoméstico de 1974 sin tocar una sola pieza de la máquina.',
    categorias: ['Identidad', 'Producto'],
    autor: { nombre: 'Mariana T.', iniciales: 'MT', nivel: 'senior' },
    equipo: ['Julián R.'],
    fecha: '2026-09-27',
    semestre: '2° sem',
    periodo: '2026-2',
    link: 'https://zag.co/rebranding-tostadora',
    destino: 'web',
    cover: null,
    enRevision: true,
  };

  /* Siembra el envío en revisión de Mariana T. una sola vez por navegador */
  function seedDemoPendiente() {
    if (state.sent.some(function (p) { return p.id === DEMO_PENDIENTE.id; })) return false;
    state.sent.unshift(DEMO_PENDIENTE);
    saveSent();
    return true;
  }

  function pendingSent() {
    return state.sent.filter(function (p) { return p.enRevision; });
  }

  function renderBell() {
    var bell = $('proy-bell');
    var dot = $('proy-bell-dot');
    var panel = $('proy-bell-panel');
    if (!bell || !dot || !panel) return;

    var pend = pendingSent();
    dot.hidden = pend.length === 0;

    /* el texto accesible del boton siempre anuncia cuantos hay */
    bell.setAttribute(
      'aria-label',
      pend.length
        ? UI.bellLabel + ': ' + pend.length + (pend.length === 1 ? ' en revisión' : ' en revisión')
        : UI.bellLabel
    );
  }

  function drawBellPanel() {
    var panel = $('proy-bell-panel');
    if (!panel) return;
    panel.textContent = '';

    var head = el('p', 'proy-bell-title', UI.bellTitulo);
    panel.appendChild(head);

    var pend = pendingSent();
    if (!pend.length) {
      panel.appendChild(el('p', 'proy-bell-empty', UI.bellVacio));
      return;
    }

    pend.forEach(function (p) {
      var item = el('div', 'proy-bell-item');
      var autor = (p.autor && p.autor.nombre) || '';
      if (autor) item.appendChild(el('p', 'proy-bell-autor', autor));
      item.appendChild(el('p', 'proy-bell-item-titulo', p.titulo));
      var meta = el('p', 'proy-bell-item-meta');
      meta.appendChild(el('span', 'proy-bell-badge', UI.bellPendientes));
      if (p.fecha) meta.appendChild(el('span', null, p.fecha));
      item.appendChild(meta);
      panel.appendChild(item);
    });
  }

  function setBell(open) {
    var bell = $('proy-bell');
    var panel = $('proy-bell-panel');
    if (!bell || !panel) return;
    bell.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) {
      drawBellPanel();
      panel.hidden = false;
    } else {
      panel.hidden = true;
    }
  }

  function initBell() {
    var bell = $('proy-bell');
    var panel = $('proy-bell-panel');
    if (!bell || !panel) return;

    renderBell();

    bell.addEventListener('click', function () {
      setBell(bell.getAttribute('aria-expanded') !== 'true');
    });

    /* Escape cierra y devuelve el foco al boton */
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      if (bell.getAttribute('aria-expanded') !== 'true') return;
      setBell(false);
      bell.focus();
    });

    /* click fuera cierra */
    document.addEventListener('click', function (e) {
      if (bell.getAttribute('aria-expanded') !== 'true') return;
      if (bell.contains(e.target) || panel.contains(e.target)) return;
      setBell(false);
    });
  }

  /* ============================================================
     Init
     ============================================================ */
  function init() {
    state.reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    loadSent();
    readUrl();
    renderHero();
    renderFiltros();
    onSearchInput();
    renderGate();
    initGate();
    initForm();
    initModal();
    initReset();
    initBell();
    renderGrid();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
