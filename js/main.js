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

  /* ---------- render: contexto (manifiesto ZIG vs ZAG) ---------- */
  function renderContexto() {
    var ctx = C.contexto;

    /* título-manifiesto en dos líneas */
    var title = document.getElementById('contexto-title');
    title.textContent = '';
    (ctx.statementLines || []).forEach(function (line, idx) {
      var span = document.createElement('span');
      span.className = 'statement-line statement-line--' + (idx + 1);
      if (line.accent) {
        var pos = line.text.indexOf(line.accent);
        if (pos !== -1) {
          span.appendChild(document.createTextNode(line.text.slice(0, pos)));
          var acc = document.createElement('span');
          acc.className = 'statement-accent';
          acc.textContent = line.accent;
          span.appendChild(acc);
          span.appendChild(document.createTextNode(line.text.slice(pos + line.accent.length)));
        } else {
          span.textContent = line.text;
        }
      } else {
        span.textContent = line.text;
      }
      title.appendChild(span);
      if (idx < ctx.statementLines.length - 1) {
        title.appendChild(document.createTextNode(' '));
      }
    });

    /* párrafos: cita sin la frase ya dicha en el título + cierre + autor */
    var body = document.getElementById('contexto-body');
    body.textContent = '';
    var quote = ctx.quote
      .replace('Cuando todos hacen zig, hacer zag.', '')
      .replace(/\s+/g, ' ')
      .trim();
    body.appendChild(el('p', null, quote));
    body.appendChild(el('p', null, ctx.close));
    body.appendChild(el('p', 'statement-attr', '— ' + ctx.quoteAuthor));
  }

  /* ---------- render: tira de fotos del campus (en movimiento, pausa al hover) ---------- */
  function renderCarrusel() {
    var cs = C.carrusel;
    document.getElementById('carousel-kicker').textContent = cs.kicker;

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
    document.getElementById('muro-kicker').textContent = m.kicker;
    var title = document.getElementById('muro-title');
    title.textContent = '';
    title.appendChild(el('span', 'muro-part', m.titleAccent ? m.title.split(m.titleAccent)[0] : m.title));
    var accSpan = el('span', 'muro-part muro-part--accent', m.titleAccent || '');
    title.appendChild(accSpan);
    title.appendChild(document.createTextNode(m.titleAccent ? m.title.split(m.titleAccent)[1] : ''));
    title.appendChild(tipButton('murodequiebre'));
    document.getElementById('muro-sub').textContent = '';
    document.getElementById('muro-note').textContent = m.note;

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
        (function (n) {
          window.setTimeout(function () {
            if (n && n.parentNode) n.parentNode.removeChild(n);
          }, 280);
        })(leaving);
      }
      p = (p + 1) % quotes.length;
      var fresh = buildCard(quotes[p]);
      list.insertBefore(fresh, list.firstChild);
    }

    function schedule() {
      timer = window.setInterval(tick, 2600);
    }

    list.addEventListener('mouseenter', function () {
      if (timer) window.clearInterval(timer);
    });
    list.addEventListener('mouseleave', schedule);
    schedule();
  }

  /* ---------- render: perfiles ---------- */
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