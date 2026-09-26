/* ============================================================
   PORTAL ZAG — Interacciones y render de contenido
   Vanilla JS. Sin librerías. Contenido desde js/content.js.
   ============================================================ */

(function () {
  'use strict';

  var C = window.ZAG_CONTENT;
  if (!C) {
    console.error('ZAG: no se encontró content.js');
    return;
  }

  var TIP_NEEDLE = {
    zag: 'ZAG',
    sello: 'sellos',
    murodequiebre: 'Muro de Quiebre',
    sociedadzag: 'Sociedad ZAG',
    zagroom: 'ZAG Room',
    zaggista: 'Zaggista',
    fogata: 'Fogata Zaggista',
    booth: 'tira de fotos',
  };

  var TIP_LABEL = {
    zag: 'ZAG',
    sello: 'sello',
    murodequiebre: 'Muro de Quiebre',
    sociedadzag: 'Sociedad ZAG',
    zagroom: 'ZAG Room',
    zaggista: 'Zaggista',
    fogata: 'Fogata Zaggista',
    booth: 'Booth / tira de fotos',
  };

  /* ---------- utilidades ---------- */
  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  }

  function esc(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function hideBrokenImage(img) {
    var text = img.dataset.fallback || 'ZAG';
    var span = document.createElement('span');
    span.className = 'brand-mark';
    span.textContent = text;
    span.setAttribute('aria-hidden', 'true');
    img.replaceWith(span);
  }

  function tipButton(term) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'tip';
    btn.dataset.term = term;
    btn.textContent = 'i';
    return btn;
  }

  /* Inserta un botón ⓘ después de la primera aparición del término
     (corrección H2: explicar términos de marca la primera vez). */
  function addTip(container, text, term) {
    var needle = TIP_NEEDLE[term] || term;
    var idx = text.indexOf(needle);
    container.appendChild(el('span', null, idx === -1 ? text : text.slice(0, idx + needle.length)));
    if (idx !== -1) container.appendChild(tipButton(term));
    if (idx !== -1 && idx + needle.length < text.length) {
      container.appendChild(el('span', null, text.slice(idx + needle.length)));
    }
  }

  /* ---------- render: nav ---------- */
  var NAV_ICONS = {
    wall: 'M4 4h16v6H4zM8 14h2v4H8zM14 14h2v4h-2zM4 8h16M6 8v3M18 8v3',
    fail: 'M12 3l6 3v5c0 5-2.5 8-6 10-3.5-2-6-5-6-10V6zM9 10l6 6M15 10l-6 6',
    rocket: 'M12 2c3 3 4 7 4 11H8c0-4 1-8 4-11zM8 13c-2 2-2 4-1 5M16 13c2 2 2 4 1 5M12 15l1 4',
    fire: 'M12 3c1 3 3 4 3 7a3 3 0 0 1-6 0c0-1 .5-2 1-3 .5-.8 1-1.7 2-4zM12 21c-3 0-5-2-5-5s2-5 5-6c3 1 5 3 5 6s-2 5-5 5z',
    talk: 'M4 5h16v11H9l-5 4zM8 9h8M8 12h5',
    compass: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM15.5 8.5l-2 5-5 2 2-5z',
    learn: 'M4 6c3-2 6-2 8 0 2-2 5-2 8 0v12c-3-2-6-2-8 0-2-2-5-2-8 0zM12 6v12',
  };

  function navIcon(name) {
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('width', '22');
    svg.setAttribute('height', '22');
    svg.setAttribute('aria-hidden', 'true');
    var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', NAV_ICONS[name] || NAV_ICONS.compass);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', 'currentColor');
    path.setAttribute('stroke-width', '1.8');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');
    svg.appendChild(path);
    return svg;
  }

  function navChevron() {
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('width', '14');
    svg.setAttribute('height', '14');
    svg.setAttribute('aria-hidden', 'true');
    var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'm6 9 6 6 6-6');
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', 'currentColor');
    path.setAttribute('stroke-width', '2');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');
    svg.appendChild(path);
    return svg;
  }

  function renderNav(container, items, proximity) {
    if (!container) return;
    container.textContent = '';
    items.forEach(function (item) {
      var li = el('li');
      li.className = item.children && item.children.length ? 'nav-item has-dropdown' : 'nav-item';
      if (item.children && item.children.length) {
        var btn = el('button', 'nav-link nav-link--toggle');
        btn.type = 'button';
        btn.setAttribute('aria-haspopup', 'true');
        btn.setAttribute('aria-expanded', 'false');
        btn.appendChild(document.createTextNode(item.label));
        btn.appendChild(navChevron());
        li.appendChild(btn);

        var sub = el('ul', 'nav-dropdown');
        sub.setAttribute('aria-label', 'Submenú de ' + item.label);
        item.children.forEach(function (child) {
          var sLi = el('li');
          var sA = document.createElement('a');
          sA.href = child.href;
          var iconBox = el('span', 'nav-dropdown-icon');
          iconBox.appendChild(navIcon(child.icon));
          sA.appendChild(iconBox);
          var txt = el('span', 'nav-dropdown-text');
          txt.appendChild(el('span', 'nav-dropdown-title', child.label));
          if (child.desc) txt.appendChild(el('span', 'nav-dropdown-desc', child.desc));
          sA.appendChild(txt);
          sLi.appendChild(sA);
          sub.appendChild(sLi);
        });
        li.appendChild(sub);
      } else {
        var a = document.createElement('a');
        a.href = item.href;
        a.textContent = item.label;
        a.className = 'nav-link';
        li.appendChild(a);
      }
      container.appendChild(li);
    });
  }

  /* ---------- render: hero ---------- */
  function renderHero() {
    var h = C.hero;

    var eyebrow = el('p', 'hero-eyebrow', h.eyebrow);

    var h1 = document.createElement('h1');
    h1.className = 'hero-title';
    h.title.forEach(function (part) {
      var sp = el(
        'span',
        part.zag ? 'hero-line hero-line--zag' : 'hero-line',
        part.text || ''
      );
      if (part.zag) sp.appendChild(tipButton('zag')); // glosario al lado de "ZAG."
      h1.appendChild(sp);
    });

    var sub = el('p', 'hero-sub', h.sub);

    var actions = el('div', 'hero-actions');
    var a1 = document.createElement('a');
    a1.className = 'btn btn--hero';
    a1.href = h.ctaPrimary.href;
    a1.textContent = h.ctaPrimary.label;
    var a2 = document.createElement('a');
    a2.className = 'hero-unirse';
    a2.href = h.ctaSecondary.href;
    a2.textContent = h.ctaSecondary.label;
    actions.appendChild(a1);
    actions.appendChild(a2);

    var box = document.getElementById('hero-box');
    if (!box) return;
    box.textContent = '';
    box.appendChild(eyebrow);
    box.appendChild(h1);
    box.appendChild(sub);
    box.appendChild(actions);
  }

  /* ---------- render: marquee ---------- */
  function renderMarquee() {
    var track = document.getElementById('marquee-track');
    if (!track) return;
    var reps = [];
    for (var i = 0; i < C.marquee.repeat; i++) {
      var r = el('div', 'marquee-repeat');
      var seg = el('span', null, C.marquee.text);
      seg.className = 'marquee-text';
      var dot = el('span', 'dot', '✦');
      r.appendChild(seg);
      r.appendChild(dot);
      reps.push(r);
    }
    /* clona el grupo para que translateX(-50%) cierre el loop sin saltos */
    reps.forEach(function (r) {
      track.appendChild(r.cloneNode(true));
    });
    reps.forEach(function (r) {
      track.appendChild(r);
    });
  }

  /* ---------- render: tira de fotos del campus (en movimiento, pausa al hover) ---------- */
  function renderCarrusel() {
    var cs = C.carrusel;
    var kicker = document.getElementById('carousel-kicker');
    if (!kicker) return;
    kicker.textContent = cs.kicker;

    var title = document.getElementById('carousel-title');
    title.textContent = '';
    var accent = cs.titleAccent || '';
    var at = accent ? cs.title.indexOf(accent) : -1;
    if (at !== -1) {
      title.appendChild(el('span', 'carousel-part', cs.title.slice(0, at)));
      var accSpan = el('span', 'carousel-part carousel-part--accent', accent);
      title.appendChild(accSpan);
      title.appendChild(document.createTextNode(cs.title.slice(at + accent.length)));
    } else {
      title.textContent = cs.title;
    }
    document.getElementById('carousel-sub').textContent = cs.sub;

    var track = document.getElementById('film-track');

    function buildCard(item) {
      var card = document.createElement('article');
      card.className = 'film-card';
      card.setAttribute('aria-label', item.tag + '. ' + item.caption);
      var img = document.createElement('img');
      img.className = 'film-photo';
      img.src = item.img;
      img.alt = item.alt;
      img.loading = 'lazy';
      img.width = 800;
      img.height = 500;
      var fig = document.createElement('div');
      fig.className = 'film-caption';
      fig.appendChild(el('h3', 'film-title', item.tag));
      fig.appendChild(el('p', 'film-text', item.caption));
      card.appendChild(img);
      card.appendChild(fig);
      return card;
    }

    cs.items.forEach(function (item) {
      track.appendChild(buildCard(item));
    });

    /* clona todo el set para que translateX(-50%) cierre el loop sin saltos */
    Array.prototype.slice.call(track.children).forEach(function (child) {
      track.appendChild(child.cloneNode(true));
    });

    var dur = Math.max(18, cs.items.length * 6);
    track.style.animationDuration = dur + 's';
  }

  /* ---------- render: muro ---------- */
  function renderMuro() {
    var m = C.muro;
    var kicker = document.getElementById('muro-kicker');
    if (!kicker) return;
    kicker.textContent = m.kicker;
    var title = document.getElementById('muro-title');
    title.textContent = '';
    title.appendChild(el('span', 'muro-part', m.titleAccent ? m.title.split(m.titleAccent)[0] : m.title));
    var accSpan = el('span', 'muro-part muro-part--accent', m.titleAccent || '');
    title.appendChild(accSpan);
    title.appendChild(document.createTextNode(m.titleAccent ? m.title.split(m.titleAccent)[1] : ''));
    title.appendChild(tipButton('murodequiebre'));
    document.getElementById('muro-sub').textContent = '';
    document.getElementById('muro-note').textContent = m.note;

    var linkEl = document.getElementById('muro-link');
    if (m.link && linkEl) {
      linkEl.href = m.link.href;
      linkEl.textContent = m.link.label;
    }

    var list = document.getElementById('muro-list');

    function buildCard(q) {
      var card = el('figure', 'muro-card');
      var head = el('div', 'post-head');
      var initial = q.author.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ]/g, '').charAt(0).toUpperCase();
      head.appendChild(el('span', 'post-avatar', initial || q.author.charAt(0).toUpperCase()));
      head.appendChild(el('cite', 'post-name', q.author));
      var handle = '@' + q.author.split(' ')[0].toLowerCase()
        .replace(/[áàäâ]/g, 'a').replace(/[éèëê]/g, 'e').replace(/[íìïî]/g, 'i')
        .replace(/[óòöô]/g, 'o').replace(/[úùüû]/g, 'u').replace(/[ñ]/g, 'n')
        .replace(/[^a-z0-9]/g, '');
      head.appendChild(el('span', 'post-handle', handle + ' · 2 h'));
      card.appendChild(head);
      card.appendChild(el('p', 'post-text', q.text));
      var actions = el('div', 'post-actions');
      actions.appendChild(el('span', null, '↩'));
      actions.appendChild(el('span', null, '↻'));
      actions.appendChild(el('span', null, '♡'));
      card.appendChild(actions);
      return card;
    }

    var max = 4;
    var quotes = m.quotes;
    var p = Math.min(max, quotes.length);
    for (var i = p - 1; i >= 0; i--) {
      list.appendChild(buildCard(quotes[i]));
    }

    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var timer = null;

    function tick() {
      var leaving = list.lastElementChild;
      if (leaving) {
        leaving.classList.add('is-leaving');
        leaving.style.pointerEvents = 'none';
        (function (n) {
          window.setTimeout(function () {
            if (n && n.parentNode) n.parentNode.removeChild(n);
          }, 360);
        })(leaving);
      }
      p = (p + 1) % quotes.length;
      var fresh = buildCard(quotes[p]);
      list.insertBefore(fresh, list.firstChild);
    }

    function schedule() {
      if (timer) window.clearInterval(timer);
      timer = window.setInterval(tick, 2600);
    }

    list.addEventListener('mouseenter', function () {
      if (timer) window.clearInterval(timer);
    });
    list.addEventListener('mouseleave', schedule);
    schedule();
  }

  /* ---------- render: perfiles (Settle — el stack se asienta con el scroll) ---------- */

  /* helpers de easing del stack (equivalentes a la animación Settle) */
  function clamp01S(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function mapRangeS(a, b, x) { return clamp01S((x - a) / (b - a)); }
  function smoothS(t) { return t * t * (3 - 2 * t); }
  function lerpS(a, b, t) { return a + (b - a) * t; }
  function easeOutBackS(t) {
    var c = 1.7;
    var u = t - 1;
    return 1 + (c + 1) * u * u * u + c * u * u;
  }

  var SETTLE_CARDS = [
    {
      id: 'senior',
      bg: '#000000', fg: '#fff8ee',
      flipTilt: 18, dismissTilt: 62,
      icon: 'M12 2 20 6v6c0 5-3.4 8.6-8 10-4.6-1.4-8-5-8-10V6zM9 12l2 2 4-4'
    },
    {
      id: 'master',
      bg: '#041dad', fg: '#fff8ee',
      flipTilt: 12, dismissTilt: 50,
      icon: 'M3 17h18M4 17 5 9l5 3 2-6 2 6 5-3 1 8z'
    },
    {
      id: 'creator',
      art: 'creador',
      bg: '#ff5c01', fg: '#fff8ee',
      flipTilt: -6, dismissTilt: -40,
      icon: 'M13 2 4 14h6l-1 8 9-12h-6z'
    },
    {
      id: 'strategist',
      bg: '#c0ccff', fg: '#041dad',
      flipTilt: -16, dismissTilt: -56,
      icon: 'M12 3a9 9 0 1 0 9 9M12 7a5 5 0 1 1-5 5M12 11a1 1 0 1 1-1 1'
    },
    {
      id: 'rookie',
      bg: '#fff8ee', fg: '#041dad',
      flipTilt: -8, dismissTilt: -44,
      icon: 'M12 3c1.5 2.5 3 4 3 6.5a3 3 0 0 1-6 0c0-1.2.6-2.3 1.5-3.2C11 8 11.5 7 12 3zM12 21c-2.5 0-4.5-2-4.5-4.5S9.5 12 12 12s4.5 2 4.5 4.5S14.5 21 12 21z'
    },
  ];

  var SETTLE_FLIP_START = 0.3;
  var SETTLE_FLIP_END = 0.46;
  var SETTLE_DISMISS_START = 0.52;

  function settleSvgIcon(pathD) {
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', pathD);
    svg.appendChild(path);
    return svg;
  }

  function buildSettleCard(cfg) {
    var card = el('article', 'settle-card settle-card--back');
    card.style.background = cfg.bg;
    card.style.color = cfg.fg;
    card.dataset.flipTilt = String(cfg.flipTilt);
    card.dataset.dismissTilt = String(cfg.dismissTilt);
    card.style.backgroundImage = 'url("assets/img/' + (cfg.art || cfg.id) + '-tarjeta.svg")';
    card.style.backgroundSize = 'cover';
    card.style.backgroundPosition = 'center';
    card.classList.add('settle-card--imagen');
    var body = el('p', null, cfg.benefit);
    card.appendChild(body);
    var more = document.createElement('a');
    more.className = 'settle-more';
    more.href = 'index.html';
    more.textContent = 'click para ver más';
    more.setAttribute('aria-label', 'Más sobre el nivel ' + cfg.name);
    card.appendChild(more);
    return card;
  }

  function renderNiveles() {
    var n = C.niveles;
    var kicker = document.getElementById('niv-kicker');
    if (!kicker) return;
    kicker.textContent = n.kicker;

    var title = document.getElementById('niv-title');
    title.textContent = '';
    var accent = 'ZAG';
    var at = n.title.indexOf(accent);
    if (at !== -1) {
      title.appendChild(document.createTextNode(n.title.slice(0, at)));
      title.appendChild(el('span', 'settle-title-accent', accent));
      title.appendChild(document.createTextNode(n.title.slice(at + accent.length)));
    } else {
      title.textContent = n.title;
    }

    document.getElementById('niv-sub').textContent = n.sub;

    var sellos = document.getElementById('sellos-line');
    sellos.textContent = '';
    addTip(sellos, n.sellosLine, 'sello');

    /* portada (front card) — marca los perfiles igual que la animación Settle */
    var front = document.getElementById('settle-front');
    front.textContent = '';
    front.classList.add('settle-card--front-img');
    var frontBtn = document.createElement('a');
    frontBtn.className = 'settle-more';
    frontBtn.href = '#perfiles';
    frontBtn.textContent = 'Click para ver';
    frontBtn.setAttribute('aria-label', 'Ver los perfiles del ZAG');
    front.appendChild(frontBtn);

    /* cinco tarjetas de nivel (back cards) */
    var backWrap = document.getElementById('settle-back');
    backWrap.textContent = '';
    var built = [];
    SETTLE_CARDS.forEach(function (cfg) {
      var lv = null;
      n.levels.forEach(function (x) { if (x.id === cfg.id) lv = x; });
      if (!lv) return;
      cfg.name = lv.name;
      cfg.identity = lv.identity;
      cfg.benefit = lv.benefit;
      var card = buildSettleCard(cfg);
      card.style.zIndex = String(10 + built.length);
      backWrap.appendChild(card);
      built.push(card);
    });
    if (!built.length) return;

    /* ---- motor del stack: la animación de scroll por tarjeta queda igual,
         pero solo se activa al hacer click en la portada (track is-open).
         Sin click la sección mide una pantalla y la landing sigue directo. ---- */
    var track = document.getElementById('settle-track');
    var headline = track.querySelector('.settle-headline');
    var frontEl = front;
    var stickerWrap = document.querySelector('.settle-sticker-wrap');
    var count = built.length;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function applySettle(p) {
      var enter = mapRangeS(0, 0.18, p);
      var deckY = lerpS(46, -6, enter);
      if (headline) {
        headline.style.transform = 'translateY(' + lerpS(0, -120, enter) + '%)';
        headline.style.opacity = String(1 - enter);
      }

      if (stickerWrap) {
        stickerWrap.style.transform = 'translateY(calc(-50% + ' + deckY + '%))';
        var stickerFade = smoothS(mapRangeS(SETTLE_FLIP_START, SETTLE_FLIP_END, p));
        stickerWrap.style.opacity = String(stickerFade);
      }

      var flip = easeOutBackS(mapRangeS(SETTLE_FLIP_START, SETTLE_FLIP_END, p));
      if (frontEl) {
        frontEl.style.transform =
          'translate(-50%,calc(-50% + ' + deckY + '%)) rotateY(' + lerpS(0, 180, flip) + 'deg)';
      }

      var window_ = (1 - SETTLE_DISMISS_START) / count;
      built.forEach(function (c, i) {
        var order = count - 1 - i;
        var dStart = SETTLE_DISMISS_START + order * window_;
        var dismiss = smoothS(mapRangeS(dStart, dStart + window_, p));
        var ry = lerpS(-180, 0, flip);
        var y = deckY + lerpS(0, -240, dismiss);
        var rz = lerpS(parseFloat(c.dataset.flipTilt) * clamp01S(flip), parseFloat(c.dataset.dismissTilt), dismiss);
        c.style.transform =
          'translate(-50%,calc(-50% + ' + y + '%)) rotateY(' + ry + 'deg) rotateZ(' + rz + 'deg)';
        c.style.opacity = String(1 - dismiss * dismiss);
      });
    }

    /* estado cerrado (una pantalla): el deck se ve bajo — la portada queda
       encima de la barra azul, esperando el click para activar el scroll */
    var rafSettle = 0;
    function settleTick() {
      if (reduce) {
        applySettle(0.5);
      } else if (track.classList.contains('is-open')) {
        var rect = track.getBoundingClientRect();
        var span = track.offsetHeight - window.innerHeight;
        applySettle(clamp01S(span > 0 ? -rect.top / span : 0));
      } else {
        applySettle(0);
      }
      rafSettle = requestAnimationFrame(settleTick);
    }
    rafSettle = requestAnimationFrame(settleTick);

    /* click en la portada: expande el track, entra el sticky y el usuario
       hace scroll para ir viendo tarjeta por tarjeta */
    var frontBtn = frontEl.querySelector('.settle-more');
    var hintEl = track.querySelector('.settle-hint');
    if (frontBtn) {
      frontBtn.addEventListener('click', function (e) {
        e.preventDefault();
        if (reduce) return;
        if (track.classList.contains('is-open')) return;
        track.classList.add('is-open');
        if (hintEl) hintEl.textContent = 'Desliza para ver todas las tarjetas';
        var top = track.getBoundingClientRect().top + window.pageYOffset;
        window.scrollTo({ top: top, behavior: 'smooth' });
      });
    }

    /* al salir de la sección, se vuelve a una pantalla (reset) */
    if ('IntersectionObserver' in window) {
      var settleObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting && track.classList.contains('is-open')) {
            track.classList.remove('is-open');
            if (hintEl) hintEl.textContent = 'Click para ver los perfiles';
            applySettle(0);
          }
        });
      });
      settleObs.observe(track);
    }
  }

  /* ---------- render: paneles "Descubre el ZAG" (expandibles, estilo panel-grid) ---------- */
  var PANEL_TONES = [
    { tone: 'comunidad', bg: '#041dad', fg: '#fff8ee' },
    { tone: 'eventos', bg: '#ff5c01', fg: '#fff8ee' },
    { tone: 'aprende', bg: '#1144ff', fg: '#fff8ee' },
    { tone: 'zagroom', bg: '#041dad', fg: '#fff8ee' },
    { tone: 'tienda', bg: '#000000', fg: '#fff8ee' },
  ];

  function renderAcordeon() {
    var a = C.acordeon;
    var kicker = document.getElementById('acc-kicker');
    if (!kicker) return;
    kicker.textContent = a.kicker;

    var accTitle = document.getElementById('acc-title');
    accTitle.textContent = '';
    accTitle.appendChild(el('span', 'zpanel-title-part', a.title.split(' tiene para ti')[0]));
    accTitle.appendChild(el('span', 'zpanel-title-part zpanel-title-part--accent', ' tiene para ti'));

    var grid = document.getElementById('panel-grid');

    a.items.forEach(function (item, idx) {
      var tone = PANEL_TONES[idx % PANEL_TONES.length];

      var panel = el('article', 'zpanel zpanel--' + tone.tone);
      panel.tabIndex = 0;
      panel.setAttribute('role', 'button');
      panel.setAttribute('aria-pressed', 'false');
      panel.style.setProperty('--panel-bg', tone.bg);
      panel.style.setProperty('--panel-fg', tone.fg);
      if (item.img) panel.style.setProperty('--panel-img-src', 'url("' + item.img + '")');

      var label = el('div', 'zpanel-collapsed');
      label.appendChild(el('span', null, item.title));
      panel.appendChild(label);

      var expanded = el('div', 'zpanel-expanded');
      var copy = el('div', 'zpanel-copy');
      copy.appendChild(el('h3', null, item.title));
      var body = el('p');
      if (item.tips && item.tips.length) {
        addTip(body, item.desc, item.tips[0]);
      } else {
        body.textContent = item.desc;
      }
      copy.appendChild(body);
      var link = document.createElement('a');
      link.href = item.link;
      link.textContent = 'Ver más →';
      copy.appendChild(link);
      expanded.appendChild(copy);
      panel.appendChild(expanded);

      var arrow = document.createElement('button');
      arrow.type = 'button';
      arrow.className = 'zpanel-arrow';
      arrow.setAttribute('aria-label', 'Siguiente: ' + a.items[(idx + 1) % a.items.length].title);
      arrow.textContent = '→';
      panel.appendChild(arrow);

      grid.appendChild(panel);
    });

    var panels = grid.querySelectorAll('.zpanel');
    var active = 0;
    setActive(0);

    function setActive(i) {
      panels.forEach(function (pn, j) {
        var on = j === i;
        pn.classList.toggle('is-active', on);
        pn.setAttribute('aria-pressed', String(on));
      });
      active = i;
    }

    grid.addEventListener('click', function (e) {
      var arrow = e.target.closest('.zpanel-arrow');
      var pn = e.target.closest('.zpanel');
      if (!pn) return;
      var i = Array.prototype.indexOf.call(panels, pn);
      if (arrow) {
        setActive((i + 1) % panels.length);
      } else {
        setActive(i === active ? -1 : i);
      }
    });

    grid.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      var pn = e.target.closest('.zpanel');
      if (!pn) return;
      e.preventDefault();
      var i = Array.prototype.indexOf.call(panels, pn);
      setActive(i === active ? -1 : i);
    });
  }

  /* ---------- render: únete ---------- */
  function renderUnirme() {
    var u = C.unirme;
    var kicker = document.getElementById('unirme-kicker');
    if (kicker) kicker.textContent = u.kicker;

    var sideImg = document.getElementById('unirme-image');
    if (sideImg) {
      sideImg.src = u.image || '';
      sideImg.addEventListener('error', function () { sideImg.remove(); });
    }

    var grid = document.getElementById('unirme-grid');
    if (!grid) return;
    u.cards.forEach(function (card) {
      var cardEl = el('div', 'unirme-card');
      if (card.img) {
        var img = document.createElement('img');
        img.className = 'unirme-img';
        img.src = card.img;
        img.alt = '';
        img.loading = 'lazy';
        img.addEventListener('error', function () { img.remove(); });
        cardEl.appendChild(img);
      }
      cardEl.appendChild(el('h3', null, card.title));

      var p = document.createElement('p');
      if (card.tips && card.tips.length) {
        addTip(p, card.desc, card.tips[0]);
      } else {
        p.textContent = card.desc;
      }
      cardEl.appendChild(p);

      var a = document.createElement('a');
      a.className = 'btn';
      a.href = card.cta.href;
      a.textContent = card.cta.label;
      cardEl.appendChild(a);
      grid.appendChild(cardEl);
    });
  }

  /* ---------- render: cierre + footer ---------- */
  function renderClose() {
    var c = C.close;
    var btn = document.getElementById('close-cta');
    if (!btn) return;
    btn.href = c.cta.href;
    btn.textContent = c.cta.label;
  }

  function renderFooter() {
    var f = C.footer;
    var copyright = document.getElementById('footer-copyright');
    if (copyright) {
      copyright.textContent = '© 2026 Portal ZAG — Todos los derechos reservados';
    }

    var legal = document.getElementById('footer-legal');
    if (legal) legal.textContent = f.legal;

    var icons = {
      instagram: 'assets/img/instagramlogo.svg',
      tiktok: '<svg viewBox="0 0 448 512" aria-hidden="true" focusable="false"><path fill="currentColor" d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0A121.18,121.18,0,0,0,381,102.39a121.43,121.43,0,0,0,67,20.14Z"/></svg>',
      web: 'assets/img/webicon.svg',
    };

    var letters = ['Z', 'A', 'G'];

    var social = document.getElementById('footer-social');
    if (!social) return;
    [].forEach.call(f.social, function (s, index) {
      var group = el('div', 'sflip-item');
      var clip = el('div', 'sflip-clip');
      clip.appendChild(el('span', 'sflip-line sflip-line--top'));
      clip.appendChild(el('span', 'sflip-line sflip-line--bottom'));
      group.appendChild(clip);

      var tip = el('span', 'sflip-tip');
      tip.textContent = s.label;
      group.appendChild(tip);

      var inner = el('span', 'sflip-inner');
      var front = el('span', 'sflip-face sflip-face--front');
      front.textContent = letters[index % letters.length];
      var back = el('span', 'sflip-face sflip-face--back');
      var iconMarkup = icons[s.icon] || icons[s.label] || '';
      if (iconMarkup.indexOf('<svg') === 0) {
        back.innerHTML = iconMarkup;
      } else if (iconMarkup) {
        var iconImg = document.createElement('img');
        iconImg.src = iconMarkup;
        iconImg.alt = s.label;
        iconImg.setAttribute('aria-hidden', 'true');
        iconImg.classList.add('sflip-img');
        back.appendChild(iconImg);
      }
      inner.appendChild(front);
      inner.appendChild(back);
      group.appendChild(inner);

      if (s.href && s.href !== '#') {
        group.setAttribute('role', 'link');
        group.tabIndex = 0;
        group.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            window.open(s.href, '_blank', 'noopener,noreferrer');
          }
        });
        group.addEventListener('click', function () {
          window.open(s.href, '_blank', 'noopener,noreferrer');
        });
      } else {
        group.setAttribute('role', 'listitem');
      }
      group.style.setProperty('--i', index);
      social.appendChild(group);
    });
  }

  /* ---------- tooltips ---------- */
  function initTooltips() {
    document.querySelectorAll('.tip').forEach(function (btn) {
      var term = btn.dataset.term;
      var def = C.glossary[term];
      if (!def) return;
      btn.setAttribute('aria-label', 'Más información: ' + (TIP_LABEL[term] || term));
      var box = el('span', 'tip-box', def);
      box.id = 'tip-' + term;
      btn.appendChild(box);
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var wasOpen = btn.classList.contains('is-open');
        document.querySelectorAll('.tip.is-open').forEach(function (b) { b.classList.remove('is-open'); });
        if (!wasOpen) btn.classList.add('is-open');
      });
      btn.addEventListener('blur', function () {
        btn.classList.remove('is-open');
      });
      btn.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') btn.classList.remove('is-open');
      });
    });
  }

  /* ---------- reveal on scroll ---------- */
  function initReveals() {
    var items = document.querySelectorAll('[data-reveal]');
    if (!('IntersectionObserver' in window)) {
      items.forEach(function (item) { item.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    items.forEach(function (item) { io.observe(item); });
  }

  /* ---------- nav (móvil + dropdowns) ---------- */
  function closeDropdowns() {
    document.querySelectorAll('.primary-nav .has-dropdown.is-open').forEach(function (li) {
      li.classList.remove('is-open');
      var btn = li.querySelector('.nav-link--toggle');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    });
  }

  function initNav() {
    var toggle = document.getElementById('nav-toggle');
    var nav = document.getElementById('primary-nav');
    if (!toggle || !nav) return;
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
      if (!open) closeDropdowns();
    });
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        closeDropdowns();
      });
    });
    nav.querySelectorAll('.nav-link--toggle').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var li = btn.closest('.has-dropdown');
        if (!li) return;
        var open = li.classList.toggle('is-open');
        btn.setAttribute('aria-expanded', String(open));
      });
    });
    document.addEventListener('click', function (e) {
      if (nav.contains(e.target)) return;
      if (toggle && toggle.contains(e.target)) return;
      closeDropdowns();
      if (nav.classList.contains('is-open')) {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        closeDropdowns();
        if (nav.classList.contains('is-open')) {
          nav.classList.remove('is-open');
          toggle.setAttribute('aria-expanded', 'false');
        }
      }
    });
  }

  /* ---------- acordeón / paneles (la lógica vive en renderAcordeon) ---------- */
  function initAccordion() {
    /* noop — el panel-grid gestiona sus propios eventos */
  }

  /* ---------- imágenes de marca con fallback ---------- */
  function initBrandLogos() {
    document.querySelectorAll('[data-fallback]').forEach(function (img) {
      if (img.complete && img.naturalWidth === 0) {
        hideBrokenImage(img);
      } else {
        img.addEventListener('error', function () { hideBrokenImage(img); });
      }
    });
  }

  /* ---------- hero: dibujar con el cursor (canvas) ---------- */
  function initHeroCanvas() {
    var canvas = document.getElementById('hero-canvas');
    if (!canvas) return;

    /* solo con mouse real y sin reduced-motion */
    if (window.matchMedia && !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var ctx = canvas.getContext('2d');
    var hero = canvas.parentElement;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0,
      H = 0;
    var pts = [];
    var tx = -100,
      ty = -100;
    var cx = -100,
      cy = -100;
    var LIFE = 950;
    var hover = false;
    var ready = false;
    var started = false;

    function resize() {
      var r = hero.getBoundingClientRect();
      W = r.width;
      H = r.height;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function onEnter() { hover = true; }
    function onLeave() { hover = false; }

    function onMove(e) {
      if (!ready) return;
      var r = hero.getBoundingClientRect();
      tx = e.clientX - r.left;
      ty = e.clientY - r.top;
      if (!started) {
        started = true;
        cx = tx;
        cy = ty;
      }
    }

    function frame(now) {
      if (!ready) {
        requestAnimationFrame(frame);
        return;
      }
      /* seguimiento suavizado: el trazo va un poco detrás del mouse */
      cx += (tx - cx) * 0.22;
      cy += (ty - cy) * 0.22;
      if (hover && (Math.abs(tx - cx) + Math.abs(ty - cy)) > 0.3) {
        pts.push({ x: cx, y: cy, t: now });
      }

      while (pts.length && now - pts[0].t > LIFE) pts.shift();
      if (pts.length > 400) pts.splice(0, pts.length - 400);

      ctx.clearRect(0, 0, W, H);
      var n = pts.length;

      /* trazo continuo liso (curvas cuadráticas por puntos medios) con desvanecido según edad */
      if (n > 1) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (var i = 1; i < n - 1; i++) {
          var mx = (pts[i].x + pts[i + 1].x) / 2;
          var my = (pts[i].y + pts[i + 1].y) / 2;
          ctx.quadraticCurveTo(pts[i].x, pts[i].y, mx, my);
        }
        var lastA = 1 - (now - pts[n - 1].t) / LIFE;
        ctx.strokeStyle = 'rgba(255,248,238,' + (Math.max(0, lastA) * 0.85).toFixed(3) + ')';
        ctx.lineWidth = Math.max(0.75, 1.5 * Math.max(0, lastA));
        ctx.stroke();
      }

      requestAnimationFrame(frame);
    }

    function enable() {
      if (ready) return;
      ready = true;
      started = false;
      resize();
    }

    resize();
    hero.addEventListener('mouseenter', onEnter);
    hero.addEventListener('mousemove', onMove);
    hero.addEventListener('mouseleave', onLeave);
    window.addEventListener('resize', resize);

    if (document.readyState === 'complete') {
      enable();
    } else {
      window.addEventListener('load', enable);
    }

    requestAnimationFrame(frame);
  }

  /* ---------- init ---------- */
  function init() {
    renderNav(document.getElementById('primary-nav'), C.nav);
    renderHero();
    renderMarquee();
    renderCarrusel();
    renderMuro();
    renderNiveles();
    renderAcordeon();
    renderUnirme();
    renderClose();
    renderFooter();

    initTooltips();
    initNav();
    initAccordion();
    initBrandLogos();
    initReveals();
    initHeroCanvas();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();