/* ============================================================
   PORTAL ZAG — Casos ZIG (Blog de Fracasos)
   - Hero con titular gigante animado char por char + stickers
     (parallax con el cursor y el scroll; el slot 1 se puede
     arrastrar en escritorio).
   - Acordeón apilado de casos reales. Solo se abre una tarjeta.
     Deep link: casos.html#new-coke.
   - Acceso solo con sesión demo (usa js/zag-session.js).
     Sin sesión: solo 3 tarjetas, lista difuminada y CTA oculto.
   - Teclado: Enter/Espacio abren, flechas ↑/↓ navegan, Esc cierra.
   - CTA final con formulario guardado en localStorage (try/catch).
   Todo el texto se inserta con textContent.
   ============================================================ */

(function () {
  'use strict';

  var D = window.ZAG_CASOS || { ui: {}, casos: [], categorias: [] };
  var SESSION = window.ZAG_SESSION || { read: noop, write: noop, clear: noop };
  var LS_SENT = 'zag_casos_enviados';

  var state = {
    locked: true,
    openId: null,
    listed: [],
    keyboard: null,
    reduced: false,
  };

  function noop() {}

  function $(id) { return document.getElementById(id); }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function svgArrow() {
    var S = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(S, 'svg');
    svg.setAttribute('width', '22');
    svg.setAttribute('height', '22');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2.4');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.setAttribute('aria-hidden', 'true');
    var p1 = document.createElementNS(S, 'path');
    p1.setAttribute('d', 'M6 18 18 6');
    var p2 = document.createElementNS(S, 'path');
    p2.setAttribute('d', 'M9 6h9v9');
    svg.appendChild(p1);
    svg.appendChild(p2);
    return svg;
  }

  /* ============================================================
     Hero
     ============================================================ */
  function renderHero() {
    var ui = D.ui;
    var kicker = $('casos-hero-kicker');
    var title = $('casos-hero-title');
    var sub = $('casos-hero-sub');
    var scroll = $('casos-hero-scroll');

    if (kicker) kicker.textContent = ui.kicker;
    if (sub) sub.textContent = ui.sub;
    if (scroll) scroll.textContent = ui.scroll;

    if (!title) return;
    title.textContent = '';

    var lines = [];
    ui.title.forEach(function (txt, idx) {
      var span = el('span', 'casos-hero-line ' + (idx === 0 ? 'casos-hero-line--light' : 'casos-hero-line--cream'));
      var accent = ui.titleAccent || '';
      var at = accent ? txt.indexOf(accent) : -1;
      txt.split('').forEach(function (ch, i) {
        var c = el('span', 'c-char');
        c.textContent = ch;
        if (at !== -1 && i >= at && i < at + accent.length) c.className = 'c-char casos-hero-line--accent';
        if (!state.reduced) c.style.animationDelay = (0.06 * (idx * 24 + i)).toFixed(3) + 's';
        span.appendChild(c);
      });
      lines.push(span);
    });
    lines.forEach(function (s) { title.appendChild(s); });
  }

  /* ============================================================
     Stickers: parallax (cursor + scroll) y arrastre del slot 1
     ============================================================ */
  function initStickers() {
    if (state.reduced) return;
    var slots = Array.prototype.slice.call(document.querySelectorAll('.sticker-slot'));
    if (!slots.length) return;

    var hero = $('casos-hero');
    var nx = 0, ny = 0;
    var cur = {};   /* {index: {x, y}} destino suavizado */
    var drag = { active: false, dx: 0, dy: 0, px: 0, py: 0 };

    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      nx = ((e.clientX - r.left) / r.width) * 2 - 1;
      ny = ((e.clientY - r.top) / r.height) * 2 - 1;
    });

    slots.forEach(function (slot, i) {
      cur[i] = { x: 0, y: 0 };

      if (slot.getAttribute('data-slot') === '1') {
        var active = slot.firstElementChild;
        if (!active) active = slot;
        active.addEventListener('pointerdown', function (e) {
          if (e.pointerType !== 'mouse') return;
          drag.active = true;
          drag.px = e.clientX;
          drag.py = e.clientY;
        });
      }
    });

    window.addEventListener('pointermove', function (e) {
      if (!drag.active) return;
      drag.dx += e.clientX - drag.px;
      drag.dy += e.clientY - drag.py;
      drag.px = e.clientX;
      drag.py = e.clientY;
    });

    window.addEventListener('pointerup', function () {
      drag.active = false;
    });

    var raf;
    function tick() {
      var sy = window.pageYOffset || 0;
      slots.forEach(function (slot, i) {
        var depth = parseFloat(slot.getAttribute('data-depth') || '0.5');
        var tx = nx * 16 * depth;
        var ty = ny * 16 * depth + sy * 0.12 * depth;
        if (i === 0) {
          tx += drag.dx;
          ty += drag.dy;
        }
        var c = cur[i];
        c.x += (tx - c.x) * 0.08;
        c.y += (ty - c.y) * 0.08;
        slot.style.transform = 'translate3d(' + c.x.toFixed(2) + 'px,' + c.y.toFixed(2) + 'px,0)';
      });
      raf = window.requestAnimationFrame(tick);
    }
    tick();

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { if (raf) window.cancelAnimationFrame(raf); }
      else if (!raf) tick();
    });
  }

  /* ============================================================
     Sesión / acceso
     ============================================================ */
  function sessionLevel() {
    var s = SESSION.read();
    return s ? s.level : null;
  }

  function renderSessionChip() {
    var host = $('casos-session-chip');
    var unete = document.querySelector('.header-unete');
    var level = sessionLevel();
    if (unete) unete.hidden = !!level; /* con sesión, el chip ocupa su lugar */
    if (!host) return;
    host.textContent = '';
    if (!level) { host.hidden = true; return; }
    host.hidden = false;

    host.appendChild(el('span', 'chip-dot'));
    host.appendChild(document.createTextNode('Demo'));
    host.setAttribute('title', 'Sesión de demostración · nivel ' + level);
    host.setAttribute('aria-label', 'Modo demo activo · nivel ' + level);
    var exit = el('button', 'chip-exit', '✕');
    exit.type = 'button';
    exit.setAttribute('aria-label', 'Salir de la demo');
    exit.addEventListener('click', function () {
      SESSION.clear();
      window.location.hash = '';
      refresh();
    });
    host.appendChild(exit);
  }

  function renderStageBar() {
    var host = $('casos-list-utils');
    if (!host) return;
    host.textContent = '';
    var level = sessionLevel();
    if (!level) return;

    var count = el('p', 'casos-count', D.casos.length + ' casos · ' + D.casos.length + ' fracasos');
    host.appendChild(count);

    var exit = el('button', 'casos-exit', 'Salir de la demo');
    exit.type = 'button';
    exit.addEventListener('click', function () {
      SESSION.clear();
      window.location.hash = '';
      refresh();
    });
    host.appendChild(exit);
  }

  function renderAccess() {
    var host = $('casos-access');
    if (!host) return;
    host.hidden = true;
    host.textContent = '';
    var ui = D.ui;
    if (!state.locked) return;

    host.hidden = false;
    host.appendChild(el('p', 'kicker', ui.accesoKicker));
    host.appendChild(el('h2', 'casos-access-title', ui.accesoTitulo)).id = 'casos-access-title';
    host.appendChild(el('p', 'casos-access-copy', ui.accesoCopy));

    var actions = el('div', 'casos-access-actions');

    var primary = document.createElement('a');
    primary.className = 'btn';
    primary.href = 'proximamente.html';
    primary.textContent = ui.accesoCta1;
    actions.appendChild(primary);

    var demo = el('button', 'casos-btn--secondary', ui.accesoCta2);
    demo.type = 'button';
    demo.setAttribute('aria-expanded', 'false');
    demo.setAttribute('aria-controls', 'casos-access-box');
    actions.appendChild(demo);
    host.appendChild(actions);

    var box = el('div', 'casos-access-box');
    box.id = 'casos-access-box';
    box.hidden = true;

    var select = document.createElement('select');
    select.setAttribute('aria-label', ui.accesoLevelAria);
    if (window.ZAG_CONTENT && window.ZAG_CONTENT.niveles) {
      window.ZAG_CONTENT.niveles.levels.forEach(function (lvl) {
        var opt = document.createElement('option');
        opt.value = lvl.id;
        opt.textContent = lvl.name;
        select.appendChild(opt);
      });
    }
    box.appendChild(select);
    box.appendChild(el('p', 'casos-access-hint', ui.accesoHint));

    demo.addEventListener('click', function () {
      box.hidden = !box.hidden;
      demo.setAttribute('aria-expanded', String(!box.hidden));
    });

    select.addEventListener('change', function () {
      SESSION.write({ name: 'Demo', level: select.value });
      renderAccess();
      renderStageBar();
      renderSessionChip();
      announce('Demo activado para el nivel ' + select.value + '. Ya puedes ver los 11 casos.');
      setView(false);
    });

    host.appendChild(box);
  }

  /* ============================================================
     Acordeón
     ============================================================ */
  function themeFor(i) {
    return 'case-theme--' + D.ui.temas[(i % D.ui.temas.length)];
  }

  function pillNodes(c) {
    var pills = [];
    (c.categorias || []).forEach(function (cat) {
      var p = el('span', 'case-pill', cat);
      pills.push(p);
    });
    if (c.debate) {
      var b = el('span', 'case-pill case-pill--debate', D.ui.debatePill);
      b.title = D.ui.debateNote;
      pills.push(b);
    }
    return pills;
  }

  function buildRow(c, idx) {
    var theme = themeFor(idx);
    var row = document.createElement('article');
    row.id = c.id;
    row.className = 'case-row ' + theme + ' reveal';
    row.style.setProperty('--stagger', (idx * 70) + 'ms');
    row.setAttribute('aria-labelledby', 'btn-' + c.id);

    var card = el('div', 'case-card');

    var toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'case-toggle';
    toggle.id = 'btn-' + c.id;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-controls', 'body-' + c.id);

    var bodyWrap = el('div', 'case-toggle-body');
    var title = el('h3', 'case-title', c.marca);
    var imeta = el('span', 'case-imeta', c.campana + ' · ' + c.anio);
    bodyWrap.appendChild(title);
    bodyWrap.appendChild(imeta);

    var pills = el('div', 'case-pills');
    pillNodes(c).forEach(function (p) { pills.appendChild(p); });

    var arrow = el('span', 'case-arrow');
    arrow.appendChild(svgArrow());

    toggle.appendChild(bodyWrap);
    toggle.appendChild(pills);
    toggle.appendChild(arrow);

    var body = el('div', 'case-body');
    body.id = 'body-' + c.id;
    body.setAttribute('role', 'region');
    body.setAttribute('aria-labelledby', 'btn-' + c.id);

    var inner = el('div', 'case-body-inner');
    var content = el('div', 'case-content');

    var hero = el('div', 'case-hero');
    var heroText = el('div', 'case-hero-text');
    heroText.appendChild(el('p', 'case-ymeta', c.campana + ' · ' + c.anio));
    heroText.appendChild(el('h4', 'case-hero-title', c.marca));
    hero.appendChild(heroText);
    content.appendChild(hero);

    var copy = el('div', 'case-body-copy');
    copy.appendChild(el('p', 'case-hook', c.hook));

    var stats = el('div', 'case-stats');
    var dato = el('div', 'case-stat');
    var strong = document.createElement('b');
    strong.textContent = c.datoDuro;
    dato.appendChild(strong);
    dato.appendChild(el('span', null, 'El dato duro'));
    stats.appendChild(dato);
    copy.appendChild(stats);

    var b1 = el('div', 'case-block');
    b1.appendChild(el('h3', null, D.ui.bloques.quePaso));
    b1.appendChild(el('p', null, c.quePaso));
    copy.appendChild(b1);

    var b2 = el('div', 'case-block');
    b2.appendChild(el('h3', null, D.ui.bloques.resultado));
    b2.appendChild(el('p', null, c.resultado));
    copy.appendChild(b2);

    var b3 = el('div', 'case-block case-block--zag');
    b3.appendChild(el('h3', null, D.ui.bloques.zag));
    b3.appendChild(el('p', 'case-leccion', c.leccion));
    if (c.debate) b3.appendChild(el('p', 'case-debate-note', D.ui.debateNote));
    copy.appendChild(b3);

    var source = el('div', 'case-source');
    source.appendChild(document.createTextNode(D.ui.sourceLabel + ' '));
    var link = document.createElement('a');
    link.className = 'case-source-link';
    link.href = c.fuente.url;
    link.rel = 'noopener noreferrer';
    link.target = '_blank';
    link.textContent = c.fuente.medio;
    link.appendChild(svgArrow());
    source.appendChild(link);
    copy.appendChild(source);

    content.appendChild(copy);
    inner.appendChild(content);
    body.appendChild(inner);

    card.appendChild(toggle);
    card.appendChild(body);
    row.appendChild(card);

    toggle.addEventListener('click', function () {
      toggleCase(row, true);
    });

    return row;
  }

  function renderList() {
    var host = $('casos-list');
    if (!host) return;
    host.textContent = '';
    state.listed = [];

    var showAll = !state.locked;
    var limit = showAll ? D.casos.length : 3;

    D.casos.slice(0, limit).forEach(function (c, idx) {
      var row = buildRow(c, idx);
      host.appendChild(row);
      state.listed.push(row);
      if (state.locked) row.setAttribute('aria-hidden', 'true');
    });

    wireReveal();
  }

  function wireReveal() {
    if (state.reduced) { revealAll(); return; }
    if (!('IntersectionObserver' in window)) { revealAll(); return; }
    var rows = state.listed;
    if (!rows.length) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    rows.forEach(function (r) { io.observe(r); });
  }

  function revealAll() {
    state.listed.forEach(function (r) { r.classList.add('is-in'); });
  }

  function toggleCase(row, fromClick) {
    var id = row.id;
    var wasOpen = state.openId === id;
    if (!state.locked && state.openId) {
      var prev = document.getElementById(state.openId);
      if (prev) setOpen(prev, false);
    }
    setOpen(row, !wasOpen);
    state.openId = wasOpen ? null : id;

    if (wasOpen) {
      announce('Caso cerrado.');
    } else {
      announce('Caso abierto: ' + id + '.');
    }

    if (!state.locked && !fromClick && window.history && id) {
      try { window.history.replaceState(null, '', '#' + id); } catch (e) { /* sinop */ }
    }

    var target = state.locked ? null : document.getElementById(id);
    if (target && state.openId === id) {
      setTimeout(function () {
        var rect = target.getBoundingClientRect();
        if (rect.top < 72) {
          target.scrollIntoView({ behavior: state.reduced ? 'auto' : 'smooth', block: 'start' });
        }
      }, state.reduced ? 0 : 60);
    }
  }

  function setOpen(row, open) {
    var toggle = document.getElementById('btn-' + row.id);
    if (toggle) toggle.setAttribute('aria-expanded', String(open));
    row.classList.toggle('is-open', open);
  }

  function initKeyboard() {
    var list = $('casos-list');
    if (!list) return;
    list.addEventListener('keydown', function (e) {
      var rows = state.listed;
      if (!rows.length || e.altKey || e.metaKey || e.ctrlKey) return;
      var idx = rows.indexOf(document.activeElement.closest('.case-row'));
      if (idx === -1) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          focusRow((idx + 1) % rows.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          focusRow((idx - 1 + rows.length) % rows.length);
          break;
        case 'Escape':
          if (state.openId === rows[idx].id) {
            toggleCase(rows[idx], true);
            document.getElementById('btn-' + rows[idx].id).focus();
          }
          break;
      }
    });
  }

  function focusRow(i) {
    var toggle = document.getElementById('btn-' + state.listed[i].id);
    if (toggle) toggle.focus();
  }

  /* ============================================================
     View (bloqueo con sesión)
     ============================================================ */
  function setView(locked) {
    state.locked = locked;
    var wrap = $('casos-list-wrap');
    if (wrap) {
      wrap.classList.toggle('is-locked', locked);
      if (locked) wrap.setAttribute('inert', '');
      else wrap.removeAttribute('inert');
    }
    var cta = $('casos-cta-section');
    if (cta) cta.hidden = locked;
    renderAccess();
    renderStageBar();
    renderSessionChip();
    renderList();
    if (locked) {
      state.openId = null;
    } else {
      handleDeepLink();
    }
  }

  function handleDeepLink() {
    var hash = window.location.hash.replace('#', '');
    if (!hash) return;
    var row = document.getElementById(hash);
    if (row && !state.locked) {
      toggleCase(row, false);
      announce('Abriendo el caso ' + hash + '.');
    }
  }

  /* ============================================================
     CTA — manda el caso que conocés
     ============================================================ */
  function renderCtaText() {
    var ui = D.ui;
    var kicker = $('casos-cta-kicker');
    var title = $('casos-cta-title');
    var sub = $('casos-cta-sub');
    var toggle = $('casos-cta-toggle');
    var submit = $('casos-cta-form button[type="submit"]');
    var close = $('casos-cta-close');

    if (kicker) kicker.textContent = ui.ctaKicker;
    if (sub) sub.textContent = ui.ctaSub;
    if (toggle) toggle.textContent = ui.ctaBtn;
    if (submit) submit.textContent = ui.form.send;
    if (close) close.textContent = ui.ctaClose;

    if (title) {
      title.textContent = '';
      title.appendChild(document.createTextNode('¿CONOCES OTRO '));
      title.appendChild(el('span', 'cta-accent', 'ZIG'));
      title.appendChild(document.createTextNode('?'));
    }
  }

  function initCta() {
    renderCtaText();
    var toggle = $('casos-cta-toggle');
    var form = $('casos-cta-form');
    var close = $('casos-cta-close');
    var cat = $('casos-f-categoria');
    var count = $('casos-f-quepaso-count');
    var qp = $('casos-f-quepaso');
    var error = $('casos-form-error');
    var ok = $('casos-form-ok');

    if (cat) {
      D.categorias.forEach(function (c) {
        var opt = document.createElement('option');
        opt.value = c;
        opt.textContent = c;
        cat.appendChild(opt);
      });
    }
    if (qp && count) {
      count.textContent = '0 / ' + D.ui.form.maxQuePaso;
      qp.addEventListener('input', function () {
        count.textContent = qp.value.length + ' / ' + D.ui.form.maxQuePaso;
      });
    }

    function show(el2, msg) {
      el2.textContent = msg;
      el2.hidden = !msg;
    }

    if (toggle && form) {
      toggle.addEventListener('click', function () {
        var open = form.hidden;
        form.hidden = !open;
        toggle.setAttribute('aria-expanded', String(open));
        show(error, '');
        show(ok, '');
        if (open) window.setTimeout(function () { $('casos-f-marca').focus(); }, 60);
      });
    }
    if (close && form) {
      close.addEventListener('click', function () {
        form.hidden = true;
        toggle.setAttribute('aria-expanded', 'false');
      });
    }

    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var marca = ($('casos-f-marca').value || '').trim();
        var campana = ($('casos-f-campana').value || '').trim();
        var categoria = $('casos-f-categoria').value;
        var quePaso = ($('casos-f-quepaso').value || '').trim();
        var link = ($('casos-f-link').value || '').trim();

        if (!marca) { show(error, D.ui.form.errMarca); announce(D.ui.form.errMarca); return; }
        if (!quePaso || quePaso.length > D.ui.form.maxQuePaso) { show(error, D.ui.form.errQuePaso); announce(D.ui.form.errQuePaso); return; }
        if (!/^https?:\/\/[\w\-\.]+\.[a-z]{2,}/i.test(link)) { show(error, D.ui.form.errLink); announce(D.ui.form.errLink); return; }

        saveCase({ marca: marca, campana: campana, categoria: categoria, quePaso: quePaso, link: link, fecha: new Date().toISOString() });
        show(error, '');
        show(ok, D.ui.form.ok);
        form.reset();
        count.textContent = '0 / ' + D.ui.form.maxQuePaso;
        announce(D.ui.form.ok);
      });
    }
  }

  function saveCase(item) {
    var list = [];
    try {
      var raw = window.localStorage.getItem(LS_SENT);
      if (raw) list = JSON.parse(raw) || [];
    } catch (e) { list = []; }
    if (!Array.isArray(list)) list = [];
    list.push(item);
    if (list.length > 200) list = list.slice(-200);
    try { window.localStorage.setItem(LS_SENT, JSON.stringify(list)); } catch (e) { /* sin storage */ }
  }

  /* ============================================================
     Live region
     ============================================================ */
  function announce(msg) {
    var live = $('casos-live');
    if (!live) return;
    live.textContent = '';
    window.setTimeout(function () { live.textContent = msg; }, 20);
  }

  /* ============================================================
     Init
     ============================================================ */
  function init() {
    state.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    renderHero();
    renderCtaText();
    initCta();
    initStickers();
    initKeyboard();

    var locked = !sessionLevel();
    setView(locked);
  }

  document.addEventListener('DOMContentLoaded', init);

  /* Rebuild completo cuando se entra o sale de la demo */
  function refresh() {
    var locked = !sessionLevel();
    setView(locked);
    announce(locked ? 'Saliste de la demo de Casos ZIG.' : 'Demo activada.');
  }
})();