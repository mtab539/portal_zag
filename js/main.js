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
  function renderNav(container, items, proximity) {
    container.textContent = '';
    items.forEach(function (item) {
      var li = el('li');
      var a = document.createElement('a');
      a.href = item.href;
      a.textContent = item.label;
      li.appendChild(a);
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
    a1.className = 'btn';
    a1.href = h.ctaPrimary.href;
    a1.textContent = h.ctaPrimary.label;
    var a2 = document.createElement('a');
    a2.className = 'hero-unirse';
    a2.href = h.ctaSecondary.href;
    a2.textContent = h.ctaSecondary.label;
    actions.appendChild(a1);
    actions.appendChild(a2);

    var box = document.getElementById('hero-box');
    box.textContent = '';
    box.appendChild(eyebrow);
    box.appendChild(h1);
    box.appendChild(sub);
    box.appendChild(actions);
  }

  /* ---------- render: marquee ---------- */
  function renderMarquee() {
    var track = document.getElementById('marquee-track');
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

  /* ---------- render: contexto ---------- */
  function renderContexto() {
    var ctx = C.contexto;

    var grid = document.getElementById('zig-grid');
    var zig = el('div', 'zig-card zig-card--zig');
    zig.appendChild(el('h3', null, ctx.zig.title));
    var ul = el('ul');
    ctx.zig.items.forEach(function (it) { ul.appendChild(el('li', null, it)); });
    zig.appendChild(ul);

    var zag = el('div', 'zig-card zig-card--zag');
    zag.appendChild(el('h3', null, ctx.zag.title));
    var ulZ = el('ul');
    ctx.zag.items.forEach(function (it) { ulZ.appendChild(el('li', null, it)); });
    zag.appendChild(ulZ);

    grid.appendChild(zig);
    grid.appendChild(zag);

    var quote = document.getElementById('quote-box');
    var blockquote = document.createElement('blockquote');
    blockquote.className = 'quote';
    blockquote.appendChild(el('p', null, ctx.quote));
    var fig = el('figcaption', null, '— ' + ctx.quoteAuthor);
    blockquote.appendChild(fig);
    quote.appendChild(blockquote);

    document.getElementById('zig-close').appendChild(el('p', 'zig-close', ctx.close));
  }

  /* ---------- render: carrusel ---------- */
  function renderCarrusel() {
    var cs = C.carrusel;
    document.getElementById('carousel-kicker').textContent = cs.kicker;
    document.getElementById('carousel-title').textContent = cs.title;
    document.getElementById('carousel-sub').textContent = cs.sub;

    var wrap = document.getElementById('carousel-track');
    cs.items.forEach(function (item) {
      var card = document.createElement('figure');
      card.className = 'carousel-card';
      var img = document.createElement('img');
      img.className = 'carousel-photo';
      img.src = item.img;
      img.alt = item.alt;
      img.loading = 'lazy';
      img.width = 400;
      img.height = 500;
      var cap = document.createElement('figcaption');
      cap.appendChild(el('span', null, item.tag));
      cap.appendChild(el('span', null, item.caption));
      card.appendChild(img);
      card.appendChild(cap);
      wrap.appendChild(card);
    });
  }

  /* ---------- render: muro ---------- */
  function renderMuro() {
    var m = C.muro;
    document.getElementById('muro-kicker').textContent = m.kicker;
    var title = document.getElementById('muro-title');
    title.textContent = '';
    title.appendChild(el('span', null, m.title));
    title.appendChild(tipButton('murodequiebre'));
    document.getElementById('muro-sub').textContent = m.sub;
    document.getElementById('muro-note').textContent = m.note;

    var grid = document.getElementById('muro-masonry');
    m.quotes.forEach(function (q) {
      var card = el('figure', 'muro-card');
      card.appendChild(el('p', null, '«' + q.text + '»'));
      card.appendChild(el('cite', null, q.author));
      grid.appendChild(card);
    });
  }

  /* ---------- render: niveles ---------- */
  function renderNiveles() {
    var n = C.niveles;
    document.getElementById('niv-kicker').textContent = n.kicker;
    document.getElementById('niv-title').textContent = n.title;
    document.getElementById('niv-sub').textContent = n.sub;

    var sellos = document.getElementById('sellos-line');
    sellos.textContent = '';
    addTip(sellos, n.sellosLine, 'sello');

    var grid = document.getElementById('profiles-grid');
    n.levels.forEach(function (lv) {
      var card = el('article', 'profile-card profile-card--' + lv.color);
      card.appendChild(el('div', 'profile-level', lv.name));
      card.appendChild(el('div', 'profile-identity', lv.identity));
      var benefit = el('div', 'profile-benefit');
      if (lv.id === 'rookie') {
        addTip(benefit, lv.benefit, 'fogata');
      } else {
        benefit.textContent = lv.benefit;
      }
      card.appendChild(benefit);
      var link = document.createElement('a');
      link.className = 'profile-link';
      link.href = C.urls.proximamente;
      link.textContent = n.cta;
      card.appendChild(link);
      grid.appendChild(card);
    });
  }

  /* ---------- render: acordeón ---------- */
  function renderAcordeon() {
    var a = C.acordeon;
    document.getElementById('acc-kicker').textContent = a.kicker;
    document.getElementById('acc-title').textContent = a.title;

    var list = document.getElementById('acc-list');
    a.items.forEach(function (item) {
      var itemEl = el('div', 'acc-item');
      itemEl.dataset.open = 'false';

      var trigger = document.createElement('button');
      trigger.type = 'button';
      trigger.className = 'acc-trigger';
      trigger.setAttribute('aria-expanded', 'false');

      var label = el('span', null, item.title);
      (item.tips || []).forEach(function (t) {
        label.appendChild(tipButton(t));
      });
      var icon = el('span', 'acc-icon', '+');
      trigger.appendChild(label);
      trigger.appendChild(icon);

      var panel = el('div', 'acc-panel');
      var inner = el('div', 'acc-panel-inner');
      var desc = el('div', 'acc-desc');
      desc.appendChild(el('span', null, item.desc));
      var link = document.createElement('a');
      link.href = item.link;
      link.textContent = 'Ver más →';
      desc.appendChild(link);
      inner.appendChild(desc);
      panel.appendChild(inner);

      itemEl.appendChild(trigger);
      itemEl.appendChild(panel);
      list.appendChild(itemEl);
    });
  }

  /* ---------- render: únete ---------- */
  function renderUnirme() {
    var u = C.unirme;
    document.getElementById('unirme-kicker').textContent = u.kicker;
    document.getElementById('unirme-title').textContent = u.title;
    document.getElementById('unirme-sub').textContent = u.sub;

    var grid = document.getElementById('unirme-grid');
    u.cards.forEach(function (card) {
      var cardEl = el('div', 'unirme-card');
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
    document.getElementById('close-kicker').textContent = c.kicker;
    document.getElementById('close-text').textContent = c.text;
    var btn = document.getElementById('close-cta');
    btn.href = c.cta.href;
    btn.textContent = c.cta.label;
  }

  function renderFooter() {
    var f = C.footer;
    document.getElementById('footer-institutional').textContent = f.institutional;
    document.getElementById('footer-legal').textContent = f.legal;

    var social = document.getElementById('footer-social');
    f.social.forEach(function (s) {
      var li = el('li');
      var a = document.createElement('a');
      a.href = s.href;
      a.textContent = s.label;
      li.appendChild(a);
      social.appendChild(li);
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

  /* ---------- nav móvil ---------- */
  function initNav() {
    var toggle = document.getElementById('nav-toggle');
    var nav = document.getElementById('primary-nav');
    if (!toggle || !nav) return;
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- acordeón (uno abierto) ---------- */
  function initAccordion() {
    var items = document.querySelectorAll('#acc-list .acc-item');
    items.forEach(function (item) {
      var trigger = item.querySelector('.acc-trigger');
      trigger.addEventListener('click', function () {
        var open = item.dataset.open === 'true';
        items.forEach(function (it) {
          it.dataset.open = 'false';
          it.querySelector('.acc-trigger').setAttribute('aria-expanded', 'false');
        });
        if (!open) {
          item.dataset.open = 'true';
          item.querySelector('.acc-trigger').setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  /* ---------- carrusel arrows ---------- */
  function initCarousel() {
    var track = document.getElementById('carousel-track');
    var prev = document.getElementById('carousel-prev');
    var next = document.getElementById('carousel-next');
    if (!track || !prev || !next) return;
    var step = function () {
      var card = track.querySelector('.carousel-card');
      return (card ? card.offsetWidth : 320) + 16;
    };
    prev.addEventListener('click', function () {
      track.scrollBy({ left: -step(), behavior: 'smooth' });
    });
    next.addEventListener('click', function () {
      track.scrollBy({ left: step(), behavior: 'smooth' });
    });
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

  /* ---------- init ---------- */
  function init() {
    renderNav(document.getElementById('primary-nav'), C.nav);
    renderNav(document.getElementById('footer-nav'), C.nav);
    renderHero();
    renderMarquee();
    renderContexto();
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
    initCarousel();
    initBrandLogos();
    initReveals();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();