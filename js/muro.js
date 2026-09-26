/* ============================================================
   PORTAL ZAG — Muro de Quiebre (muro.html)
   Vanilla JS. Sin librerías. Sesión y datos en localStorage
   (dentro de try/catch). Textos de usuario siempre con textContent.
   ============================================================ */

(function () {
  'use strict';

  var D = window.ZAG_MURO;
  if (!D) {
    console.error('ZAG: no se encontró muro-data.js');
    return;
  }

  var UI = D.ui;
  var LS_POSTS = 'zag_muro_v3';
  var LS_SESSION = 'zag_session';
  var LS_CC_DRAFTS = 'zag_muro_drafts';

  /* ---------- utilidades ---------- */
  function $(id) { return document.getElementById(id); }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  }

  function avatarEl(author, extraClass) {
    var a = el('span', 'muro-avatar' + (extraClass ? ' ' + extraClass : ''));
    if (author.photo) {
      var img = document.createElement('img');
      img.className = 'muro-avatar-photo';
      img.src = author.photo;
      img.alt = author.name;
      img.setAttribute('loading', 'lazy');
      a.appendChild(img);
    } else {
      a.textContent = author.initials || author.name.charAt(0);
    }
    return a;
  }

  function ns() { return 'http://www.w3.org/2000/svg'; }

  function icon(name, cls) {
    var shapes = {
      heart: '<path d="M12 21C12 21 3.5 16.6 3.5 10.4 3.5 7.5 5.8 5.2 8.7 5.2c1.3 0 2.5.6 3.3 1.5.8-.9 2-1.5 3.3-1.5 2.9 0 5.2 2.3 5.2 5.2 0 6.2-8.5 10.6-8.5 10.6z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
      comment: '<path d="M4 5h16v11H9l-5 3V5zM8 10h5M8 13h8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
      bookmark: '<path d="M6 3h12v18l-6-4.8L6 21V3z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
      dots: '<circle cx="5" cy="12" r="1.8" fill="currentColor"/><circle cx="12" cy="12" r="1.8" fill="currentColor"/><circle cx="19" cy="12" r="1.8" fill="currentColor"/>',
      flag: '<path d="M6 21V4M6 5h11l-2.4 3L17 11H6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
      trash: '<path d="M4 7h16M10 4h4M9 7v13M15 7v13M6 7l1 13h10l1-13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
      close: '<path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
      chevron: '<path d="m6 9 6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
      reply: '<path d="M3 11h11a4 4 0 0 1 4 4v2M14 6l3 3-3 3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
      send: '<path d="M3 11.5 21 3l-6.5 18-2.3-7.5L3 11.5zM12.2 13.5 21 3" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
    };
    var wide = {
      pin: ['0 0 810 810', '<path fill="currentColor" d="M 724.324219 307.515625 C 719.28125 312.558594 712.578125 315.339844 705.449219 315.339844 C 698.324219 315.339844 691.617188 312.558594 686.578125 307.523438 L 673.667969 294.605469 C 670.308594 291.246094 665.695312 289.382812 660.976562 289.527344 C 656.230469 289.648438 651.738281 291.707031 648.554688 295.230469 L 494.597656 465.5625 C 490.527344 470.058594 489.105469 476.355469 490.835938 482.167969 C 506.34375 534.121094 504.371094 590.4375 485.25 640.769531 C 484.410156 643.003906 482.769531 644.402344 480.339844 644.914062 C 477.089844 645.621094 473.1875 644.367188 470.65625 641.84375 L 291.015625 462.046875 C 291.003906 462.035156 291 462.027344 290.992188 462.023438 L 166.214844 337.140625 C 163.679688 334.601562 162.445312 330.730469 163.148438 327.4375 C 163.664062 325.03125 165.050781 323.378906 167.308594 322.527344 C 195.257812 311.910156 224.621094 306.527344 254.585938 306.527344 C 278.664062 306.527344 302.601562 310.035156 325.730469 316.949219 C 331.535156 318.675781 337.824219 317.257812 342.316406 313.1875 L 512.550781 159.121094 C 516.074219 155.933594 518.140625 151.445312 518.257812 146.695312 C 518.382812 141.953125 516.546875 137.359375 513.195312 134 L 500.25 121.019531 C 489.859375 110.625 489.859375 93.695312 500.25 83.292969 C 505.285156 78.261719 511.980469 75.488281 519.105469 75.488281 C 526.226562 75.488281 532.929688 78.261719 537.964844 83.292969 L 724.308594 269.792969 C 734.679688 280.191406 734.679688 297.125 724.324219 307.515625 Z M 165.203125 643.734375 L 280.238281 500.332031 L 309.546875 529.664062 Z M 748.832031 245.265625 L 562.476562 58.753906 C 550.878906 47.164062 535.480469 40.789062 519.105469 40.789062 C 502.714844 40.789062 487.316406 47.171875 475.738281 58.761719 C 451.828125 82.6875 451.828125 121.625 475.726562 145.550781 L 475.789062 145.613281 L 326.15625 281.039062 C 302.769531 274.921875 278.742188 271.828125 254.585938 271.828125 C 220.402344 271.828125 186.902344 277.972656 155.027344 290.074219 C 141.824219 295.074219 132.175781 306.347656 129.246094 320.183594 C 126.074219 334.914062 130.84375 350.8125 141.699219 361.679688 L 255.570312 475.644531 L 42.523438 741.242188 C 37.003906 748.121094 37.523438 758.054688 43.730469 764.324219 C 47.105469 767.726562 51.5625 769.453125 56.042969 769.453125 C 59.824219 769.453125 63.617188 768.226562 66.78125 765.71875 L 334.234375 554.375 L 446.144531 666.375 C 454.675781 674.914062 466.441406 679.8125 478.429688 679.8125 C 481.527344 679.8125 484.613281 679.488281 487.570312 678.851562 C 501.433594 675.910156 512.691406 666.257812 517.671875 653.0625 C 538.308594 598.734375 541.4375 538.285156 526.714844 481.75 L 662.042969 332.039062 L 662.070312 332.074219 C 673.667969 343.65625 689.066406 350.039062 705.449219 350.039062 C 721.832031 350.039062 737.230469 343.65625 748.851562 332.042969 C 772.703125 308.109375 772.699219 269.183594 748.832031 245.265625" fill-rule="nonzero"/><path fill="currentColor" d="M 524.058594 198.148438 L 389.714844 332.625 C 382.949219 339.402344 382.949219 350.386719 389.714844 357.160156 C 393.097656 360.550781 397.535156 362.242188 401.96875 362.242188 C 406.410156 362.242188 410.847656 360.550781 414.234375 357.160156 L 548.578125 222.675781 C 555.347656 215.902344 555.34375 204.914062 548.578125 198.140625 C 541.804688 191.363281 530.832031 191.363281 524.058594 198.148438" fill-rule="nonzero"/>'],
      flecha: ['0 0 810 810', '<path fill="currentColor" d="M 761.9375 380.992188 L 536.324219 155.292969 C 525.367188 144.332031 510.796875 138.269531 495.328125 138.269531 C 479.855469 138.269531 465.289062 144.332031 454.332031 155.292969 C 443.371094 166.257812 437.3125 180.832031 437.3125 196.308594 C 437.3125 211.785156 443.371094 226.359375 454.332031 237.320312 L 580.933594 363.96875 L 89.222656 363.96875 C 57.25 363.96875 31.207031 390.023438 31.207031 422.007812 C 31.207031 453.992188 57.25 480.042969 89.222656 480.042969 L 580.933594 480.042969 L 454.332031 606.695312 C 443.371094 617.65625 437.3125 632.230469 437.3125 647.707031 C 437.3125 663.183594 443.371094 677.757812 454.332031 688.71875 C 465.289062 699.683594 479.855469 705.742188 495.328125 705.742188 C 510.796875 705.742188 525.367188 699.683594 536.324219 688.71875 L 761.550781 463.40625 C 772.640625 452.703125 778.828125 438.128906 778.828125 422.394531 C 778.957031 406.660156 773.027344 392.085938 761.9375 380.992188 Z M 761.9375 380.992188" fill-rule="nonzero"/>'],
    };
    var big = wide[name];
    var svg = document.createElementNS(ns(), 'svg');
    svg.setAttribute('viewBox', big ? big[0] : '0 0 24 24');
    svg.setAttribute('width', cls === 'sm' ? '16' : '18');
    svg.setAttribute('height', cls === 'sm' ? '16' : '18');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    svg.innerHTML = big ? big[1] : (shapes[name] || shapes.dots);
    return svg;
  }

  function cloneSeed() {
    try { return JSON.parse(JSON.stringify(D.seedPosts)); } catch (e) { return D.seedPosts; }
  }

  /* ---------- storage (siempre con try/catch) ---------- */
  function loadPosts() {
    var raw = null;
    try { raw = window.localStorage.getItem(LS_POSTS); } catch (e) { /* sin storage */ }
    if (raw) {
      try {
        var parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) return parsed;
      } catch (e) { /* data corrupta → volver al seed */ }
    }
    return cloneSeed();
  }

  function savePosts() {
    try { window.localStorage.setItem(LS_POSTS, JSON.stringify(state.posts)); } catch (e) { /* sin storage */ }
  }

  function loadSession() {
    var raw = null;
    try { raw = window.localStorage.getItem(LS_SESSION); } catch (e) { /* sin storage */ }
    if (!raw) return null;
    try {
      var s = JSON.parse(raw);
      if (s && typeof s === 'object' && s.level) return s;
    } catch (e) { /* corrupto */ }
    return null;
  }

  function setSession(level) {
    state.session = { name: UI.myName, level: level };
    try {
      window.localStorage.setItem(LS_SESSION, JSON.stringify({ name: UI.myName, level: level }));
    } catch (e) { /* sin storage */ }
  }

  function clearSession() {
    state.session = null;
    try { window.localStorage.removeItem(LS_SESSION); } catch (e) { /* sin storage */ }
  }

  function resetDemo() {
    state.posts = cloneSeed();
    savePosts();
    clearSession();
    clearCcState();
  }

  function clearCcState() {
    state.cc = {};
    state.ccDraftTimers = {};
    state.ccFocus = null;
    state.ccNewReply = null;
    state.ccFlash = null;
    try { window.localStorage.removeItem(LS_CC_DRAFTS); } catch (e) { /* sin storage */ }
  }

  /* ---------- estado ---------- */
  var state = {
    posts: [],
    session: null,
    filter: 'recent',
    level: 'all',
    threadOpen: {},   /* id → bool */
    threadAll: {},    /* id → bool (ver todas las respuestas) */
    menusOpen: [],    /* tokens del menú abierto */
    modal: null,      /* { kind, postId, onConfirm } */
    cc: {},           /* id → estado del comment composer { open, replyingTo, draft } */
    ccDraftTimers: {},/* id → timer del autoguardado del borrador */
    ccFocus: null,    /* id → composer que debe recibir el foco tras render */
    ccNewReply: null, /* id → respuesta recién publicada a resaltar */
    ccFlash: null,    /* { postId, replyId } → resaltar la respuesta original respondida */
  };

  /* ---------- tiempo relativo ---------- */
  function relativeTime(iso) {
    var diff = Date.now() - new Date(iso).getTime();
    if (diff < 0) diff = 0;
    var mins = Math.round(diff / 60000);
    if (mins < 60) return UI.agoMinutes + ' ' + Math.max(1, mins);
    var hours = Math.round(mins / 60);
    if (hours < 24) return UI.agoHours + ' ' + hours;
    return UI.agoDays + ' ' + Math.round(hours / 24);
  }

  function lastReplyTime(post) {
    if (!post.replies.length) return null;
    var latest = post.replies.reduce(function (a, b) {
      return new Date(a.createdAt) > new Date(b.createdAt) ? a : b;
    });
    return latest.createdAt;
  }

  /* ---------- textos de la sesión (mi nivel) ---------- */
  function isMine(post) { return !!(state.session && post.author.name === UI.myName); }

  function levelClass(author) {
    return author.level && ['rookie', 'strategist', 'creator', 'master', 'senior'].indexOf(author.level) !== -1
      ? author.level
      : 'rookie';
  }

  /* ============================================================
     Header: hero reducido, hero animado, estado
     ============================================================ */
  function renderHero() {
    var kicker = $('muro-hero-kicker');
    kicker.textContent = UI.heroKicker;

    var title = $('muro-hero-title');
    var a = el('span', null, UI.heroTitleA);
    title.appendChild(a);
    title.appendChild(document.createTextNode(' '));
    title.appendChild(el('span', 'muro-hero-title-accent', UI.heroTitleB));

    $('muro-hero-sub').textContent = UI.heroSub;
  }

  /* Hero: avatares solapados con tooltip que sigue el puntero.
     Versión vanilla de la referencia (framer-motion). */
  function renderHeroProfiles() {
    var host = $('muro-hero-avatars');
    if (!host || !D.heroTeam) return;
    host.textContent = '';

    D.heroTeam.forEach(function (p) {
      var person = el('div', 'muro-hero-person');

      var box = el('div', 'muro-hero-tip-card');
      box.appendChild(el('span', 'muro-hero-tip-light muro-hero-tip-light-a'));
      box.appendChild(el('span', 'muro-hero-tip-light muro-hero-tip-light-b'));
      box.appendChild(el('strong', null, p.name));
      box.appendChild(el('small', null, p.role));
      box.appendChild(el('span', 'muro-hero-tip-arrow'));

      var tip = el('div', 'muro-hero-tip');
      tip.appendChild(box);

      var pos = el('div', 'muro-hero-tip-pos');
      pos.appendChild(tip);

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'muro-hero-avatar-btn';
      btn.setAttribute('aria-label', p.name + ', ' + p.role);
      var img = document.createElement('img');
      img.src = p.photo;
      img.alt = p.name;
      img.draggable = false;
      btn.appendChild(img);

      person.appendChild(pos);
      person.appendChild(btn);
      host.appendChild(person);

      var visible = false;
      var target = 0;
      var current = 0;
      var raf = null;

      function run() {
        raf = null;
        current += (target - current) * 0.32;
        if (Math.abs(target - current) < 0.1) current = target;
        box.style.transform = 'translateX(' + current.toFixed(2) + 'px) rotate(' +
          ((current / 28) * 9).toFixed(2) + 'deg)';
        if ((visible && Math.abs(target - current) > 0.05) || Math.abs(target - current) > 0.1) {
          raf = requestAnimationFrame(run);
        }
      }
      function show() { visible = true; tip.classList.add('is-visible'); }
      function hide() { visible = false; target = 0; tip.classList.remove('is-visible'); if (raf === null) raf = requestAnimationFrame(run); }
      function move(e) {
        var b = btn.getBoundingClientRect();
        var d = e.clientX - (b.left + b.width / 2);
        target = Math.max(-22, Math.min(22, (d / 28) * 22));
        if (raf === null) raf = requestAnimationFrame(run);
      }

      btn.addEventListener('pointerenter', show);
      btn.addEventListener('pointermove', move);
      btn.addEventListener('pointerleave', hide);
      btn.addEventListener('focus', show);
      btn.addEventListener('blur', hide);
      btn.addEventListener('click', function () { if (visible) hide(); else show(); });
    });
  }

  function renderStatus() {
    var members = $('muro-status-members');
    members.textContent = '';
    members.appendChild(el('b', null, String(D.membersNow)));
    members.appendChild(document.createTextNode(' ' + UI.membersLabel));

    var online = $('muro-status-online');
    online.textContent = '';
    online.appendChild(el('b', null, String(D.onlineNow)));
    online.appendChild(document.createTextNode(' ' + UI.onlineLabel));

    var posts = $('muro-status-posts');
    posts.textContent = '';
    posts.appendChild(el('b', null, String(state.posts.length)));
    posts.appendChild(document.createTextNode(' ' + UI.postsLabel));
  }

  /* ============================================================
     Hero animado — placeholder (aquí entra la animación del muro)
     ============================================================ */
  function initHeroAnim() {
    /* Placeholder de la animación del muro (tiras de fotos que entran
       y una rotación suave de la frase). Próxima iteración: tejerlo
       con los datos reales de ZAG_MURO. */
    var host = $('muro-hero-anim');
    if (!host) return;
    host.style.display = 'none';
  }

  /* ============================================================
     Chip de sesión
     ============================================================ */
  function renderSessionChip() {
    var host = $('muro-session-chip');
    host.textContent = '';
    if (!state.session) {
      host.hidden = true;
      return;
    }

    var me = el('span', 'muro-session-me');
    me.setAttribute('aria-label', UI.sessionChipAria);
    me.appendChild(el('span', 'muro-avatar muro-avatar--' + levelClass(state.session) + ' muro-avatar--small', 'T'));
    var name = el('span', null, UI.myName);
    name.appendChild(document.createTextNode(' '));
    me.appendChild(name);
    me.appendChild(el('span', 'muro-badge muro-badge--' + levelClass(state.session), D.nivelNames[state.session.level] || state.session.level));

    var exit = el('button', 'muro-session-exit', UI.sessionExit);
    exit.type = 'button';
    exit.addEventListener('click', function () {
      clearSession();
      paint();
    });

    host.appendChild(me);
    host.appendChild(exit);
    host.hidden = false;
  }

  /* ============================================================
     Acceso (sin sesión)
     ============================================================ */
  function renderAccess() {
    var host = $('muro-access');
    host.textContent = '';

    var card = el('div', 'muro-access-card');
    card.appendChild(el('p', 'kicker muro-access-kicker', UI.accessKicker));
    card.appendChild(el('h2', 'muro-access-title', UI.accessTitle));
    card.appendChild(el('p', 'muro-access-copy', UI.accessCopy));

    var actions = el('div', 'muro-access-actions');
    var primary = document.createElement('a');
    primary.className = 'btn';
    primary.href = 'proximamente.html';
    primary.textContent = UI.accessCtaPrimary;
    actions.appendChild(primary);

    var demo = el('button', 'muro-btn muro-btn--secondary', UI.accessCtaSecondary);
    demo.type = 'button';
    actions.appendChild(demo);

    var box = el('div', 'muro-access-box');
    box.hidden = true;
    box.appendChild(el('p', 'muro-access-box-label', UI.accessLevelLabel));

    var select = document.createElement('select');
    select.className = 'muro-filters-select';
    select.setAttribute('aria-label', UI.accessLevelLabel);
    D.nivelOrder.forEach(function (lvl) {
      var opt = document.createElement('option');
      opt.value = lvl;
      opt.textContent = D.nivelNames[lvl];
      select.appendChild(opt);
    });
    box.appendChild(select);
    box.appendChild(el('p', 'muro-access-box-hint', UI.accessLevelHint));

    demo.addEventListener('click', function () {
      box.hidden = !box.hidden;
    });

    select.addEventListener('change', function () {
      setSession(select.value);
      paint();
    });

    card.appendChild(actions);
    card.appendChild(box);
    host.appendChild(card);
  }

  /* ============================================================
     Compositor
     ============================================================ */
  function renderComposer() {
    var host = $('muro-composer');
    host.textContent = '';

    var closed = el('button', 'muro-composer-ph', UI.composerClosed);
    closed.type = 'button';
    closed.setAttribute('aria-expanded', 'false');
    closed.setAttribute('aria-controls', 'muro-composer-input');

    var panel = el('div', 'muro-composer-panel');
    var input = document.createElement('textarea');
    input.className = 'muro-composer-text';
    input.id = 'muro-composer-input';
    input.rows = 4;
    input.maxLength = D.maxText;
    input.placeholder = UI.composerPlaceholder;
    input.setAttribute('aria-label', UI.composerPlaceholder);

    var foot = el('div', 'muro-composer-foot');
    var count = el('span', 'muro-composer-count', '');
    var actions = el('div', 'muro-composer-actions');
    var cancel = el('button', 'muro-btn muro-btn--secondary', UI.composerCancel);
    cancel.type = 'button';
    var publish = el('button', 'muro-btn', UI.composerPublish);
    publish.type = 'button';
    publish.disabled = true;
    actions.appendChild(cancel);
    actions.appendChild(publish);
    foot.appendChild(count);
    foot.appendChild(actions);
    panel.appendChild(input);
    panel.appendChild(foot);

    host.appendChild(closed);
    host.appendChild(panel);

    function updateCount() {
      var n = input.value.length;
      count.textContent = String(n) + '/500';
      count.classList.toggle('is-warning', n > 450);
      publish.disabled = !input.value.trim();
    }

    function openComposer() {
      host.classList.add('is-open');
      closed.setAttribute('aria-expanded', 'true');
      input.focus();
    }

    function closeComposer() {
      host.classList.remove('is-open');
      closed.setAttribute('aria-expanded', 'false');
      input.value = '';
      updateCount();
    }

    closed.addEventListener('click', openComposer);
    input.addEventListener('input', function () {
      updateCount();
      if (input.value.length >= D.maxText) announce(UI.composerMaxAlert);
    });
    cancel.addEventListener('click', closeComposer);

    publish.addEventListener('click', function () {
      var text = input.value.trim();
      if (!text) return;
      var post = {
        id: 'p' + Date.now(),
        author: { name: UI.myName, initials: 'T', level: state.session ? state.session.level : 'rookie', isAdmin: false },
        text: text,
        createdAt: new Date().toISOString(),
        likes: 0,
        likedByMe: false,
        savedByMe: false,
        pinned: false,
        reportedByMe: false,
        replies: [],
      };
      state.posts.unshift(post);
      savePosts();
      state.threadOpen[post.id] = false;
      closeComposer();
      renderStatus();
      renderFeed();
      announce(UI.composerPublishedLive);
    });

    updateCount();
  }

  function announce(msg) {
    var live = $('muro-live');
    if (!live) return;
    live.textContent = '';
    window.setTimeout(function () {
      live.textContent = msg;
    }, 40);
  }

  /* ============================================================
     Filtros
     ============================================================ */
  function renderFilters() {
    var host = $('muro-filters');
    host.textContent = '';

    var chips = [
      { key: 'recent', label: UI.filterRecent },
      { key: 'popular', label: UI.filterPopular },
      { key: 'commented', label: UI.filterCommented },
      { key: 'saved', label: UI.filterSaved },
      { key: 'mine', label: UI.filterMine },
    ];

    chips.forEach(function (chip) {
      var b = el('button', 'muro-chip', chip.label);
      b.type = 'button';
      b.dataset.filter = chip.key;
      b.setAttribute('aria-pressed', String(state.filter === chip.key));
      b.classList.toggle('is-active', state.filter === chip.key);
      b.addEventListener('click', function () {
        state.filter = chip.key;
        renderFilters();
        renderFeed();
      });
      host.appendChild(b);
    });

    var select = document.createElement('select');
    select.className = 'muro-filters-select';
    select.setAttribute('aria-label', UI.levelFilterAria);
    var allOpt = document.createElement('option');
    allOpt.value = 'all';
    allOpt.textContent = UI.levelAll;
    select.appendChild(allOpt);
    D.nivelOrder.forEach(function (lvl) {
      var opt = document.createElement('option');
      opt.value = lvl;
      opt.textContent = D.nivelNames[lvl];
      select.appendChild(opt);
    });
    select.value = state.level;
    select.addEventListener('change', function () {
      state.level = select.value;
      renderFeed();
    });
    host.appendChild(select);
  }

  function filteredPosts() {
    var list = state.posts.slice();

    if (state.level !== 'all') {
      list = list.filter(function (p) { return levelClass(p.author) === state.level; });
    }

    if (state.filter === 'recent') {
      list.sort(function (a, b) {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
    } else if (state.filter === 'popular') {
      list.sort(function (a, b) { return b.likes - a.likes; });
    } else if (state.filter === 'commented') {
      list.sort(function (a, b) {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        return b.replies.length - a.replies.length;
      });
    } else if (state.filter === 'saved') {
      list = list.filter(function (p) { return p.savedByMe; });
    } else if (state.filter === 'mine') {
      list = list.filter(isMine);
    }

    return list;
  }

  /* ============================================================
     Feed
     ============================================================ */
  function renderFeed() {
    var host = $('muro-feed');
    host.textContent = '';
    removeDockedCc();
    var list = filteredPosts();

    if (!list.length) {
      var emptyMsg = UI.feedEmpty;
      if (state.filter === 'saved') emptyMsg = UI.feedEmptySaved;
      if (state.filter === 'mine') emptyMsg = UI.feedEmptyMine;
      var empty = el('div', 'muro-empty', emptyMsg);
      empty.setAttribute('role', 'note');
      host.appendChild(empty);
      return;
    }

    list.forEach(function (post) {
      host.appendChild(buildPost(post));
    });

    if (state.ccFlash) {
      var fp = null;
      for (var i = 0; i < state.posts.length; i++) {
        if (state.posts[i].id === state.ccFlash.postId) { fp = state.posts[i]; break; }
      }
      if (fp) flashReplyTarget(fp, state.ccFlash.replyId);
      state.ccFlash = null;
    }

    restoreDock();
    if (state.ccFocus) {
      var openRoot = document.querySelector('.muro-cc.is-open');
      var ta = openRoot ? openRoot.querySelector('.muro-cc-text') : null;
      if (ta) {
        ta.focus();
        var len = ta.value.length;
        ta.setSelectionRange(len, len);
      }
      state.ccFocus = null;
    }
  }

  /* --- composer en pantallas pequeñas: barra fija al fondo --- */
  var mqMobile = null;
  function isMobileView() {
    if (!mqMobile) mqMobile = window.matchMedia('(max-width: 719px)');
    return mqMobile.matches;
  }

  function removeDockedCc() {
    var d = document.querySelector('.muro-cc-docked');
    if (d) d.remove();
  }

  function restoreDock() {
    var openRoot = document.querySelector('.muro-cc.is-open');
    if (!openRoot) return;
    if (isMobileView()) {
      if (openRoot.parentNode !== document.body) {
        openRoot._ccOrigin = { parent: openRoot.parentNode, next: openRoot.nextSibling };
        document.body.appendChild(openRoot);
        openRoot.classList.add('muro-cc-docked');
      }
    } else if (openRoot.classList.contains('muro-cc-docked')) {
      undeck(openRoot);
    }
  }

  function undeck(node) {
    var org = node._ccOrigin;
    node.classList.remove('muro-cc-docked');
    if (org && org.parent && org.parent.isConnected) {
      org.parent.insertBefore(node, org.next || null);
    }
    node._ccOrigin = null;
  }

  function bindViewport() {
    function kbOffset() {
      var h = window.visualViewport && window.visualViewport.height;
      if (h == null) return '0px';
      return Math.max(0, (window.innerHeight || 0) - h) + 'px';
    }
    if (window.visualViewport) {
      ['resize', 'scroll'].forEach(function (ev) {
        window.visualViewport.addEventListener(ev, function () {
          document.documentElement.style.setProperty('--cc-kb', kbOffset());
        });
      });
    }
    window.addEventListener('resize', function () {
      var d = document.querySelector('.muro-cc-docked');
      if (d && !isMobileView()) undeck(d);
    });
  }

  function buildPost(post) {
    var card = el('article', 'muro-post' + (post.pinned ? ' is-pinned' : ''));
    if (post.reportedByMe) card.classList.add('is-reported');
    card.dataset.id = post.id;
    card.style.position = 'relative';

    /* --- head --- */
    var head = el('div', 'muro-post-head');
    head.appendChild(avatarEl(post.author, 'muro-avatar--' + levelClass(post.author)));

    var who = el('div', 'muro-post-who');
    var nameLine = el('div', 'muro-post-name-line');
    nameLine.appendChild(el('span', 'muro-post-name', post.author.name));
    var lvlName = D.nivelNames[levelClass(post.author)] || post.author.level;
    if (lvlName) nameLine.appendChild(el('span', 'muro-badge muro-badge--' + levelClass(post.author), lvlName));
    if (post.author.isAdmin) nameLine.appendChild(el('span', 'muro-badge muro-badge--admin', UI.teamBadge));
    who.appendChild(nameLine);
    if (post.pinned) {
      var pin = el('span', 'muro-pin', UI.pinnedLabel);
      pin.insertBefore(icon('pin', 'sm'), pin.firstChild);
      who.appendChild(pin);
    }
    head.appendChild(who);

    var time = el('time', 'muro-post-time', 'hace ' + relativeTime(post.createdAt));
    time.setAttribute('datetime', post.createdAt);
    head.appendChild(time);
    card.appendChild(head);

    /* --- body (se oculta si fue reportado) --- */
    if (!post.reportedByMe) {
      var body = el('div', 'muro-post-body');
      var textEl = el('p', 'muro-post-text', post.text);
      body.appendChild(textEl);
      if (post.text.length > D.truncateChars) {
        var more = el('button', 'muro-more', UI.seeMore);
        more.type = 'button';
        more.setAttribute('aria-expanded', 'false');
        textEl.textContent = post.text.slice(0, D.truncateChars) + '…';
        more.addEventListener('click', function () {
          var open = more.getAttribute('aria-expanded') === 'true';
          more.setAttribute('aria-expanded', String(!open));
          more.textContent = open ? UI.seeMore : UI.seeLess;
          textEl.textContent = open ? post.text.slice(0, D.truncateChars) + '…' : post.text;
        });
        body.appendChild(more);
      }
      card.appendChild(body);
    }

    /* --- barra de publicación reportada --- */
    if (post.reportedByMe) {
      var bar = el('div', 'muro-reported-bar');
      bar.appendChild(el('span', null, UI.reportSuccess));
      var undo = el('button', 'muro-more', UI.reportUndo);
      undo.type = 'button';
      undo.addEventListener('click', function () {
        post.reportedByMe = false;
        savePosts();
        renderFeed();
      });
      bar.appendChild(undo);
      card.appendChild(bar);
    }

    /* --- acciones --- */
    if (!post.reportedByMe) {
      var actions = el('div', 'muro-post-actions');

      var like = el('button', 'muro-action' + (post.likedByMe ? ' is-on' : ''), '');
      like.type = 'button';
      like.dataset.act = 'like';
      like.setAttribute('aria-pressed', String(post.likedByMe));
      like.setAttribute('aria-label', post.likedByMe ? UI.likeAriaOn : UI.likeAriaOff);
      like.appendChild(icon('heart'));
      like.appendChild(el('span', 'muro-likes', String(post.likes)));

      var replyBtn = el('button', 'muro-action' + (state.threadOpen[post.id] ? ' is-on' : ''), '');
      replyBtn.type = 'button';
      replyBtn.dataset.act = 'replyopen';
      replyBtn.setAttribute('aria-expanded', String(!!state.threadOpen[post.id]));
      replyBtn.setAttribute('aria-label', state.threadOpen[post.id] ? UI.threadAriaOpen : UI.threadAria);
      replyBtn.appendChild(icon('comment'));
      replyBtn.appendChild(el('span', null, String(post.replies.length)));

      var save = el('button', 'muro-action' + (post.savedByMe ? ' is-on' : ''), '');
      save.type = 'button';
      save.dataset.act = 'save';
      save.setAttribute('aria-pressed', String(post.savedByMe));
      save.setAttribute('aria-label', post.savedByMe ? UI.saveAriaOn : UI.saveAriaOff);
      save.appendChild(icon('bookmark'));
      save.appendChild(el('span', null, post.savedByMe ? UI.filterSaved : UI.glyphSave));

      actions.appendChild(like);
      actions.appendChild(replyBtn);
      actions.appendChild(save);
      actions.appendChild(buildMenu(post));
      card.appendChild(actions);
    }

    /* --- hilo --- */
    if (!post.reportedByMe) {
      card.appendChild(buildThread(post));
    }

    card.addEventListener('click', function (e) {
      var t = e.target.closest('[data-act], [data-menu], [data-rlike], [data-rdel], [data-rreply]');
      if (!t || !t.dataset) return;
      onFeedAction(e, post, t);
    });

    return card;
  }

  function buildMenu(post) {
    var wrap = el('div', 'muro-menu');
    var btn = el('button', 'muro-action muro-action--menu', '');
    btn.type = 'button';
    btn.dataset.act = 'menu';
    btn.setAttribute('aria-label', UI.menuAria);
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-haspopup', 'true');
    btn.appendChild(icon('dots'));

    var pop = el('div', 'muro-menu-pop');
    pop.hidden = true;

    var report = el('button', 'muro-menu-item', '');
    report.type = 'button';
    report.dataset.menu = 'report';
    report.appendChild(icon('flag', 'sm'));
    report.appendChild(el('span', null, UI.menuReport));

    pop.appendChild(report);

    if (isMine(post)) {
      var del = el('button', 'muro-menu-item muro-menu-item--danger', '');
      del.type = 'button';
      del.dataset.menu = 'delete';
      del.appendChild(icon('trash', 'sm'));
      del.appendChild(el('span', null, UI.menuDelete));
      pop.appendChild(del);
    }

    wrap.appendChild(btn);
    wrap.appendChild(pop);
    return wrap;
  }

  /* ============================================================
     Hilos (un solo nivel, se expanden dentro de la tarjeta)
     ============================================================ */
  function buildThread(post) {
    var thread = el('div', 'muro-thread');
    var open = !!state.threadOpen[post.id];

    var cta = el('button', 'muro-thread-cta', '');
    cta.type = 'button';
    cta.dataset.act = 'thread';
    cta.setAttribute('aria-expanded', String(open));
    cta.appendChild(icon('flecha', 'sm'));
    var ctaText = post.replies.length
      ? String(post.replies.length) + ' ' + UI.replyWord
      : UI.replyCta;
    cta.appendChild(document.createTextNode(ctaText));

    var side = el('div', 'muro-thread-side');
    if (post.replies.length) {
      var stack = el('span', 'muro-thread-avatars');
      post.replies.slice(-3).forEach(function (r) {
        stack.appendChild(avatarEl(r.author, 'muro-avatar--' + levelClass(r.author) + ' muro-avatar--small'));
      });
      side.appendChild(stack);
      var lr = lastReplyTime(post);
      if (lr) {
        var note = freshTime(lr) ? UI.lastReply + ' ' + UI.composer.lastReplyNow : UI.lastReply + ' hace ' + relativeTime(lr);
        side.appendChild(el('span', 'muro-reply-note', note));
      }
    }

    var listWrap = el('div', 'muro-thread-panel');
    listWrap.hidden = !open;

    if (open) {
      var list = el('div', 'muro-thread-list');
      var replies = post.replies.slice().sort(function (a, b) { return new Date(b.createdAt) - new Date(a.createdAt); });
      var showAll = !!state.threadAll[post.id];
      var visible = showAll ? replies : replies.slice(0, 2);
      visible.forEach(function (r) { list.appendChild(buildReply(post, r)); });

      if (replies.length > 2) {
        var moreBtn = el('button', 'muro-thread-more', '');
        moreBtn.type = 'button';
        moreBtn.textContent = UI.replyMorePast.replace('{n}', String(replies.length - 2));
        moreBtn.addEventListener('click', function () {
          state.threadAll[post.id] = !state.threadAll[post.id];
          renderFeed();
        });
        list.appendChild(moreBtn);
      }
      listWrap.appendChild(list);
    }

    var cc = createCommentComposer(post);

    var row = el('div', 'muro-thread-row');
    row.appendChild(cta);
    row.appendChild(side);
    thread.appendChild(row);
    thread.appendChild(listWrap);
    thread.appendChild(cc);

    return thread;
  }

  function buildReply(post, reply) {
    var r = el('div', 'muro-reply');
    if (state.ccNewReply && state.ccNewReply === reply.id) r.classList.add('is-new');
    r.setAttribute('tabindex', '-1');
    r.append(avatarEl(reply.author, 'muro-avatar--' + levelClass(reply.author) + ' muro-avatar--small'));

    var body = el('div', 'muro-reply-body');
    var meta = el('div', 'muro-reply-meta', reply.author.name);
    var t = el('time', 'muro-reply-time', replyTime(reply.createdAt));
    t.setAttribute('datetime', reply.createdAt);
    meta.appendChild(t);
    body.appendChild(meta);
    var text = el('p', 'muro-reply-text');
    body.appendChild(text);
    renderReplyText(text, post, reply);

    var foot = el('div', 'muro-reply-foot');
    var like = el('button', 'muro-reply-like' + (reply.likedByMe ? ' is-on' : ''), '');
    like.type = 'button';
    like.dataset.rlike = reply.id;
    like.setAttribute('aria-pressed', String(reply.likedByMe));
    like.setAttribute('aria-label', reply.likedByMe ? UI.likeAriaOn : UI.likeAriaOff);
    like.appendChild(icon('heart', 'sm'));
    like.appendChild(el('span', null, String(reply.likes)));
    foot.appendChild(like);

    if (state.session) {
      var rep = el('button', 'muro-reply-like', '');
      rep.type = 'button';
      rep.dataset.rreply = reply.id;
      rep.setAttribute('aria-label', reply.author.name);
      rep.appendChild(icon('flecha', 'sm'));
      rep.appendChild(el('span', null, UI.ownReplyReply));
      foot.appendChild(rep);
    }

    if (isMine(reply)) {
      var del = el('button', 'muro-reply-like', '');
      del.type = 'button';
      del.dataset.rdel = reply.id;
      del.setAttribute('aria-label', UI.menuDelete);
      del.appendChild(icon('trash', 'sm'));
      foot.appendChild(del);
    }

    body.appendChild(foot);
    r.appendChild(body);
    return r;
  }

  /* Voz del texto de una respuesta: resalta menciones "@Nombre" como span.mention */
  function renderReplyText(target, post, reply) {
    var names = ccParticipantNames(post).slice();
    names.sort(function (a, b) { return b.length - a.length; });
    var re = names.length
      ? new RegExp('@(' + names.map(reEscape).join('|') + ')(?![\\S])', 'g')
      : null;
    var text = reply.text;
    if (!re) {
      target.textContent = text;
      return;
    }
    var last = 0;
    var m;
    while ((m = re.exec(text)) !== null) {
      if (m.index > last) target.appendChild(document.createTextNode(text.slice(last, m.index)));
      target.appendChild(el('span', 'mention', m[0]));
      last = m.index + m[0].length;
    }
    if (last < text.length) target.appendChild(document.createTextNode(text.slice(last)));
  }

  function replyTime(iso) {
    return freshTime(iso) ? UI.composer.nowTime : 'hace ' + relativeTime(iso);
  }

  function freshTime(iso) {
    return Date.now() - new Date(iso).getTime() < 60000;
  }

  function reEscape(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /* Participantes del hilo (autor del post primero), sin ti mismo. */
  function ccParticipants(post) {
    var list = [];
    var seen = {};
    function push(a) {
      if (!a || !a.name || a.name === UI.myName) return;
      if (seen[a.name]) return;
      seen[a.name] = true;
      list.push(a);
    }
    push(post.author);
    post.replies.forEach(function (r) { push(r.author); });
    return list;
  }

  function ccParticipantNames(post) {
    return ccParticipants(post).map(function (a) { return a.name; });
  }

  /* ---------- borradores por publicación (zag_muro_drafts) ---------- */
  function loadCcDraft(postId) {
    var raw = null;
    try { raw = window.localStorage.getItem(LS_CC_DRAFTS); } catch (e) { /* sin storage */ }
    if (!raw) return '';
    try {
      var all = JSON.parse(raw);
      if (all && typeof all === 'object' && typeof all[postId] === 'string') return all[postId];
    } catch (e) { /* corrupto */ }
    return '';
  }

  function saveCcDraft(postId, text) {
    var all = {};
    var raw = null;
    try { raw = window.localStorage.getItem(LS_CC_DRAFTS); } catch (e) { /* sin storage */ }
    if (raw) { try { all = JSON.parse(raw) || {}; } catch (e) { all = {}; } }
    if (text) all[postId] = text; else delete all[postId];
    try { window.localStorage.setItem(LS_CC_DRAFTS, JSON.stringify(all)); } catch (e) { /* sin storage */ }
  }

  function clearCcDraft(postId) {
    if (state.cc[postId]) state.cc[postId].draft = '';
    saveCcDraft(postId, '');
  }

  /* ============================================================
     Comment composer — experiencia de escribir un comentario
     ============================================================ */
  function createCommentComposer(post) {
    var root = el('div', 'muro-cc');
    var pid = post.id;

    /* --- estado 10: sin sesión → candado --- */
    if (!state.session) {
      var locked = el('div', 'muro-cc-locked');
      locked.appendChild(el('strong', null, UI.composer.lockTitle));
      var demo = el('button', 'muro-cc-locked-link', UI.composer.lockCta);
      demo.type = 'button';
      demo.addEventListener('click', function () {
        var acc = $('muro-access');
        if (!acc) return;
        acc.hidden = false;
        acc.scrollIntoView({ behavior: 'smooth', block: 'center' });
        var box = acc.querySelector('.muro-access-box');
        if (box) box.hidden = false;
        var sel = acc.querySelector('select');
        if (sel) window.setTimeout(function () { sel.focus(); }, 300);
      });
      locked.appendChild(demo);
      root.appendChild(locked);
      return root;
    }

    var st = state.cc[pid];
    if (!st) st = state.cc[pid] = { open: false, replyingTo: null, draft: loadCcDraft(pid) || '', sending: false };

    /* --- reposo (cerrado) --- */
    var rest = el('div', 'muro-cc-rest');
    var avatar = el('span', 'muro-cc-rest-avatar muro-cc-avatar--' + levelClass(state.session), '');
    avatar.appendChild(el('span', 'muro-avatar muro-avatar--' + levelClass(state.session), state.session ? 'T' : ''));
    rest.appendChild(avatar);
    var pill = el('button', 'muro-cc-pill', UI.composer.rest);
    pill.type = 'button';
    pill.addEventListener('click', function () {
      openCc(post, null);
    });
    rest.appendChild(pill);
    root.appendChild(rest);

    if (!st.open) return root;

    /* --- foco (abierto) --- */
    root.classList.add('is-open');

    var box = el('div', 'muro-cc-box');
    var reply = null;
    if (st.replyingTo) {
      post.replies.forEach(function (r) { if (!reply && r.id === st.replyingTo) reply = r; });
    }

    var chiprow = el('div', 'muro-cc-chiprow');
    chiprow.hidden = !reply;
    if (reply) {
      var chip = el('span', 'muro-cc-chip', '');
      chip.appendChild(document.createTextNode(UI.composer.respondingTo + ' '));
      chip.appendChild(el('b', null, '@' + reply.author.name));
      var chipx = el('button', 'muro-cc-chipx', '');
      chipx.type = 'button';
      chipx.setAttribute('aria-label', UI.composer.removeMentionAria + ' ' + reply.author.name);
      chipx.appendChild(icon('close', 'sm'));
      chip.appendChild(chipx);
      chiprow.appendChild(chip);
    }
    box.appendChild(chiprow);

    var head = el('div', 'muro-cc-head');
    head.appendChild(document.createTextNode(UI.composer.commentingAs + ' '));
    head.appendChild(el('b', null, UI.myName));
    head.appendChild(document.createTextNode(' '));
    head.appendChild(el('span', 'muro-badge muro-badge--' + levelClass(state.session), D.nivelNames[levelClass(state.session)] || state.session.level));
    var draftnote = el('span', 'muro-cc-draftnote', UI.composer.draftSaved);
    draftnote.hidden = !(st.draft && st.draft.length);
    head.appendChild(draftnote);
    box.appendChild(head);

    var textarea = document.createElement('textarea');
    textarea.className = 'muro-cc-text';
    textarea.maxLength = D.maxReply;
    textarea.placeholder = UI.composer.placeholder;
    textarea.setAttribute('aria-label', UI.composer.fieldAria.replace('{autor}', post.author.name));
    textarea.setAttribute('role', 'combobox');
    textarea.setAttribute('aria-autocomplete', 'list');
    textarea.setAttribute('aria-expanded', 'false');
    textarea.setAttribute('aria-controls', 'muro-cc-mentions-' + pid);
    textarea.value = st.draft || '';
    box.appendChild(textarea);

    var mentions = el('div', 'muro-cc-mentions');
    mentions.id = 'muro-cc-mentions-' + pid;
    mentions.setAttribute('role', 'listbox');
    mentions.hidden = true;
    box.appendChild(mentions);

    var foot = el('div', 'muro-cc-foot');
    var count = el('span', 'muro-cc-count', '');
    var hint = el('span', 'muro-cc-hint', UI.composer.hintDesktop);
    var actions = el('div', 'muro-cc-actions');
    var cancel = el('button', 'muro-btn muro-btn--link', UI.composer.cancel);
    cancel.type = 'button';
    var send = el('button', 'muro-btn muro-cc-send', '');
    send.type = 'button';
    var sendB = el('span', 'muro-cc-send-label', UI.composer.send);
    var sendI = el('span', 'muro-cc-send-ic', '');
    sendI.appendChild(icon('send'));
    send.appendChild(sendB);
    send.appendChild(sendI);
    actions.appendChild(cancel);
    actions.appendChild(send);
    foot.appendChild(count);
    foot.appendChild(hint);
    foot.appendChild(actions);
    box.appendChild(foot);

    var discard = el('div', 'muro-cc-discard');
    discard.hidden = true;
    var di = el('div', 'muro-cc-discard-inner');
    di.appendChild(el('span', null, UI.composer.discardTitle));
    var da = el('div', 'muro-cc-discard-actions');
    var dkeep = el('button', 'muro-btn muro-btn--link', UI.composer.discardKeep);
    dkeep.type = 'button';
    var ddisc = el('button', 'muro-btn muro-cc-send', UI.composer.discardYes);
    ddisc.type = 'button';
    da.appendChild(dkeep);
    da.appendChild(ddisc);
    di.appendChild(da);
    discard.appendChild(di);
    box.appendChild(discard);

    root.appendChild(box);

    send.setAttribute('aria-label', isMobileView() ? UI.composer.sendAriaMobile : UI.composer.send);

    var activeIndex = -1;
    var participants = ccParticipants(post);
    var announced = { n30: false, n300: false };

    function updateBox() {
      updateCount();
      updateGrow();
      autosave();
    }

    function updateCount() {
      var n = textarea.value.length;
      var label = String(n) + '/' + D.maxReply;
      count.textContent = label;
      count.classList.toggle('is-warning', n >= D.maxReply - 30 && n < D.maxReply);
      count.classList.toggle('is-limit', n >= D.maxReply);
      send.disabled = !textarea.value.trim() || st.sending;
      if (n >= D.maxReply && !announced.n300) {
        announced.n300 = true;
        announce(UI.composer.atLimit);
      } else if (n >= D.maxReply - 30 && n < D.maxReply && !announced.n30) {
        announced.n30 = true;
        announce(UI.composer.nearLimit);
      }
      if (n < D.maxReply - 30) announced.n30 = false;
      if (n < D.maxReply) announced.n300 = false;
    }

    function updateGrow() {
      textarea.style.height = 'auto';
      var max = 6 * 22;
      textarea.style.height = Math.min(textarea.scrollHeight, max) + 'px';
    }

    function autosave() {
      st.draft = textarea.value;
      var t = state.ccDraftTimers[pid];
      if (t) window.clearTimeout(t);
      state.ccDraftTimers[pid] = window.setTimeout(function () {
        saveCcDraft(pid, st.draft);
      }, 400);
      if (st.draft.length) draftnote.hidden = false;
    }

    function currentMention() {
      var val = textarea.value;
      var caret = textarea.selectionStart;
      var i = caret - 1;
      if (i < 0 || val[i] !== '@') {
        while (i >= 0 && val[i] !== ' ' && val[i] !== '\n') i--;
        if (i + 1 >= caret || val[i + 1] !== '@') return null;
      }
      var start = i >= 0 && val[i] !== '@' ? i + 1 : i;
      if (val[start] !== '@') start = i + 1;
      var query = val.slice(start + 1, caret);
      return { start: start, query: query };
    }

    function renderMentions() {
      var cm = currentMention();
      if (!cm) {
        closeMentions();
        return;
      }
      var q = cm.query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      var results = participants.filter(function (p) {
        var name = (p.name || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return !q || name.indexOf(q) === 0;
      }).slice(0, 5);
      if (!results.length) {
        closeMentions();
        return;
      }
      mentions.textContent = '';
      results.forEach(function (p, i) {
        var opt = el('button', 'muro-cc-option', '');
        opt.type = 'button';
        opt.setAttribute('role', 'option');
        opt.id = 'muro-cc-opt-' + pid + '-' + i;
        opt.appendChild(avatarEl(p, 'muro-avatar--' + levelClass(p) + ' muro-avatar--small'));
        opt.appendChild(el('span', 'muro-cc-option-name', p.name));
        opt.appendChild(el('span', 'muro-badge muro-badge--' + levelClass(p), D.nivelNames[levelClass(p)] || p.level));
        opt.addEventListener('mousedown', function (e) {
          e.preventDefault();
          pickMention(p.name);
        });
        opt.addEventListener('mouseenter', function () {
          activeIndex = i;
          ariaActivate();
        });
        mentions.appendChild(opt);
      });
      activeIndex = 0;
      mentions.hidden = false;
      textarea.setAttribute('aria-expanded', 'true');
      ariaActivate();
    }

    function ariaActivate() {
      var opts = mentions.querySelectorAll('.muro-cc-option');
      opts.forEach(function (o, i) {
        o.classList.toggle('is-active', i === activeIndex);
      });
      var cur = mentions.querySelectorAll('.muro-cc-option')[activeIndex];
      textarea.setAttribute('aria-activedescendant', cur ? cur.id : '');
    }

    function closeMentions() {
      mentions.hidden = true;
      mentions.textContent = '';
      activeIndex = -1;
      textarea.setAttribute('aria-expanded', 'false');
      textarea.removeAttribute('aria-activedescendant');
    }

    function pickMention(name) {
      var cm = currentMention();
      if (!cm) { closeMentions(); return; }
      var val = textarea.value;
      var before = val.slice(0, cm.start);
      var after = val.slice(textarea.selectionStart);
      var insert = '@' + name + ' ';
      textarea.value = before + insert + after;
      var caret = before.length + insert.length;
      textarea.setSelectionRange(caret, caret);
      closeMentions();
      updateBox();
      textarea.focus();
    }

    function enterDiscard() {
      if (!textarea.value.trim()) { closeCc(post); return; }
      textarea.disabled = true;
      foot.hidden = true;
      discard.hidden = false;
      dkeep.focus();
    }

    function exitDiscard() {
      textarea.disabled = false;
      foot.hidden = false;
      discard.hidden = true;
      textarea.focus();
    }

    function doSend() {
      if (st.sending) return;
      var text = textarea.value.trim();
      if (!text) return;
      st.sending = true;
      textarea.disabled = true;
      send.disabled = true;
      send.classList.add('is-sending');
      sendB.textContent = UI.composer.sending;

      window.setTimeout(function () {
        var reply = {
          id: 'r' + Date.now(),
          author: { name: UI.myName, initials: 'T', level: state.session ? state.session.level : 'rookie', isAdmin: false },
          text: text,
          createdAt: new Date().toISOString(),
          likes: 0,
          likedByMe: false,
          savedByMe: false,
          reportedByMe: false,
        };
        post.replies.push(reply);
        savePosts();
        st.open = false;
        st.replyingTo = null;
        st.draft = '';
        st.sending = false;
        saveCcDraft(pid, '');
        state.ccFocus = null;
        state.threadOpen[pid] = true;
        state.threadAll[pid] = true;
        state.ccNewReply = reply.id;
        renderFeed();
        announce(UI.composer.publishedLive);
        window.setTimeout(function () { focusNewReply(pid, reply.id); }, 60);
      }, 500);
    }

    cancel.addEventListener('click', enterDiscard);
    dkeep.addEventListener('click', exitDiscard);
    ddisc.addEventListener('click', function () {
      clearCcDraft(pid);
      closeCc(post, { keepDraft: false });
    });
    send.addEventListener('click', doSend);

    textarea.addEventListener('input', function () {
      updateBox();
      renderMentions();
      st.sending = false;
    });
    textarea.addEventListener('keydown', function (e) {
      if (!mentions.hidden) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          moveActive(1);
          return;
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          moveActive(-1);
          return;
        }
        if (e.key === 'Enter' || e.key === 'Tab') {
          e.preventDefault();
          var cur = mentions.querySelectorAll('.muro-cc-option')[activeIndex];
          var nameEl = cur ? cur.querySelector('.muro-cc-option-name') : null;
          if (nameEl) pickMention(nameEl.textContent);
          return;
        }
        if (e.key === 'Escape') {
          e.preventDefault();
          closeMentions();
          return;
        }
      }
      if (e.key === 'Enter' && !e.shiftKey) {
        if (isMobileView()) return;
        e.preventDefault();
        doSend();
        return;
      }
      if (e.key === 'Escape') {
        closeMentions();
        return;
      }
      if (e.key.length === 1 && textarea.value.length >= D.maxReply) {
        e.preventDefault();
        box.classList.remove('is-shake');
        void box.offsetWidth;
        box.classList.add('is-shake');
      }
    });
    textarea.addEventListener('blur', function () {
      window.setTimeout(closeMentions, 120);
    });

    function moveActive(dir) {
      var opts = mentions.querySelectorAll('.muro-cc-option');
      activeIndex = (activeIndex + dir + opts.length) % opts.length;
      ariaActivate();
    }

    updateCount();
    updateGrow();

    return root;
  }

  function openCc(post, reply) {
    var pid = post.id;
    /* solo un composer abierto a la vez; al abrir otro se cierra el anterior */
    Object.keys(state.cc).forEach(function (id) {
      if (id !== pid && state.cc[id].open) {
        state.cc[id].open = false;
      }
    });
    var st = state.cc[pid] || (state.cc[pid] = { open: false, replyingTo: null, draft: loadCcDraft(pid) || '', sending: false });
    st.open = true;
    if (reply) {
      st.replyingTo = reply.id;
      if (!st.draft || st.draft.indexOf('@' + reply.author.name) !== 0) {
        st.draft = st.draft && st.draft.trim() ? st.draft : '@' + reply.author.name + ' ';
      }
      state.threadAll[pid] = true;
      state.ccFlash = { postId: pid, replyId: reply.id };
    }
    state.threadOpen[pid] = true;
    state.ccFocus = pid;
    renderFeed();
  }

  function closeCc(post, opts) {
    var st = state.cc[post.id];
    if (!st) return;
    st.open = false;
    st.replyingTo = null;
    st.sending = false;
    if (opts && opts.keepDraft === false) {
      st.draft = '';
      saveCcDraft(post.id, '');
    }
    state.ccFocus = null;
    renderFeed();
  }

  function flashReplyTarget(post, replyId) {
    var node = document.querySelector('[data-rreply="' + replyId + '"]');
    var target = node ? node.closest('.muro-reply') : null;
    if (target) {
      target.classList.add('is-targeted');
      window.setTimeout(function () { target.classList.remove('is-targeted'); }, 1500);
    }
  }

  function focusNewReply(postId, replyId) {
    var node = document.querySelector('[data-rreply="' + replyId + '"]');
    var row = node ? node.closest('.muro-reply') : null;
    if (row) {
      if (row.scrollIntoView) row.scrollIntoView({ behavior: 'smooth', block: 'center' });
      row.focus({ preventScroll: true });
    }
  }

  /* ============================================================
     Acciones del feed (delegación)
     ============================================================ */
  function onFeedAction(e, post, target) {
    if (!target || !target.dataset) return;

    /* menú */
    if (target.dataset.act === 'menu') {
      e.stopPropagation();
      var pop = target.parentNode.querySelector('.muro-menu-pop');
      var open = pop.hidden;
      closeAllMenus();
      pop.hidden = !open;
      target.setAttribute('aria-expanded', String(!open));
      return;
    }

    if (target.dataset.menu === 'report') {
      e.preventDefault();
      closeAllMenus();
      openReportModal(post);
      return;
    }

    if (target.dataset.menu === 'delete') {
      e.preventDefault();
      closeAllMenus();
      openDeleteModal(post);
      return;
    }

    if (!state.session) return;

    if (target.dataset.act === 'like') {
      post.likedByMe = !post.likedByMe;
      post.likes += post.likedByMe ? 1 : -1;
      if (post.likes < 0) post.likes = 0;
      savePosts();
      renderFeed();
      return;
    }

    if (target.dataset.act === 'save') {
      post.savedByMe = !post.savedByMe;
      savePosts();
      renderFeed();
      return;
    }

    if (target.dataset.act === 'replyopen') {
      if (state.threadOpen[post.id]) {
        state.threadOpen[post.id] = false;
        state.ccFocus = null;
        var cst = state.cc[post.id];
        if (cst) {
          cst.open = false;
          cst.replyingTo = null;
          cst.sending = false;
        }
        renderFeed();
      } else {
        openCc(post, null);
      }
      return;
    }

    if (target.dataset.act === 'thread') {
      state.threadOpen[post.id] = !state.threadOpen[post.id];
      renderFeed();
      return;
    }

    /* responder a una respuesta específica */
    if (target.dataset.rreply) {
      var rr = post.replies.filter(function (r) { return r.id === target.dataset.rreply; })[0];
      if (rr) openCc(post, rr);
      return;
    }

    /* like / delete de respuestas */
    if (target.dataset.rlike) {
      var rl = post.replies.filter(function (r) { return r.id === target.dataset.rlike; })[0];
      if (rl) {
        rl.likedByMe = !rl.likedByMe;
        rl.likes += rl.likedByMe ? 1 : -1;
        if (rl.likes < 0) rl.likes = 0;
        savePosts();
        renderFeed();
      }
      return;
    }

    if (target.dataset.rdel) {
      post.replies = post.replies.filter(function (r) { return r.id !== target.dataset.rdel; });
      savePosts();
      renderFeed();
      return;
    }
  }

  function closeAllMenus() {
    var open = document.querySelectorAll('.muro-menu-pop:not([hidden])');
    open.forEach(function (pop) {
      pop.hidden = true;
      var btn = pop.parentNode.querySelector('.muro-action--menu');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    });
  }

  /* ============================================================
     Modal (reporte y confirmación de eliminación)
     ============================================================ */
  var modal = null;
  var lastFocused = null;

  function focusables() {
    if (!modal) return [];
    return Array.prototype.slice.call(modal.querySelectorAll('button, a, input, textarea, select, [tabindex]:not([tabindex="-1"])'))
      .filter(function (n) { return !n.disabled && !n.hidden; });
  }

  function trap(e) {
    if (e.key === 'Escape') {
      e.preventDefault();
      closeModal();
      return;
    }
    if (e.key !== 'Tab') return;
    var items = focusables();
    if (!items.length) return;
    var first = items[0];
    var last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  function openReportModal(post) {
    var host = $('muro-report-modal');
    host.textContent = '';
    modal = host;

    var backdrop = el('div', 'muro-modal-backdrop');
    backdrop.setAttribute('data-close', '1');

    var card = el('div', 'muro-modal-card');
    var close = el('button', 'muro-modal-close', '');
    close.type = 'button';
    close.dataset.close = '1';
    close.setAttribute('aria-label', UI.reportCancel);
    close.appendChild(icon('close'));
    card.appendChild(close);

    card.appendChild(el('h2', 'muro-modal-title', UI.reportTitle));
    card.appendChild(el('p', 'muro-modal-intro', UI.reportIntro));

    var fieldset = el('fieldset', 'muro-modal-fieldset');
    fieldset.appendChild(el('legend', 'muro-modal-legend', UI.reportReasonLabel));

    var reasons = [
      { key: 'spam', label: UI.reportSpam },
      { key: 'harass', label: UI.reportHarass },
      { key: 'fake', label: UI.reportFake },
      { key: 'other', label: UI.reportOther },
    ];

    var chosen = { value: reasons[0].key };
    var otherWrap = null;

    reasons.forEach(function (reason) {
      var label = el('label', 'muro-radio');
      var radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = 'muro-report-reason';
      radio.value = reason.key;
      radio.checked = chosen.value === reason.key;
      radio.addEventListener('change', function () {
        chosen.value = reason.key;
        if (otherWrap) otherWrap.hidden = reason.key !== 'other';
      });
      label.appendChild(radio);
      label.appendChild(document.createTextNode(' ' + reason.label));
      fieldset.appendChild(label);
    });

    otherWrap = el('div', 'muro-modal-other');
    otherWrap.hidden = true;
    var othei = document.createElement('textarea');
    othei.className = 'muro-modal-text';
    othei.rows = 2;
    othei.maxLength = 200;
    othei.placeholder = UI.reportOtherPlaceholder;
    othei.setAttribute('aria-label', UI.reportOtherPlaceholder);
    otherWrap.appendChild(othei);
    fieldset.appendChild(otherWrap);
    card.appendChild(fieldset);

    var actions = el('div', 'muro-modal-actions');
    var cancel = el('button', 'muro-btn muro-btn--secondary', UI.reportCancel);
    cancel.type = 'button';
    var send = el('button', 'muro-btn', UI.reportSend);
    send.type = 'button';
    actions.appendChild(cancel);
    actions.appendChild(send);
    card.appendChild(actions);

    host.appendChild(backdrop);
    host.appendChild(card);

    function closeIt() {
      host.removeEventListener('keydown', trap);
      host.hidden = true;
      if (lastFocused && lastFocused.focus) lastFocused.focus();
    }

    send.addEventListener('click', function () {
      post.reportedByMe = true;
      savePosts();
      closeIt();
      renderFeed();
      announce(UI.reportSuccess);
    });

    [cancel, close, backdrop].forEach(function (btn) {
      var target = btn.dataset ? btn : null;
      btn.addEventListener('click', closeIt);
    });

    lastFocused = document.activeElement;
    host.hidden = false;
    host.addEventListener('keydown', trap);
    window.setTimeout(function () {
      var r = modal.querySelector('input[type="radio"]');
      if (r) r.focus();
    }, 30);
  }

  function openDeleteModal(post) {
    var host = $('muro-report-modal');
    host.textContent = '';
    modal = host;

    var backdrop = el('div', 'muro-modal-backdrop');
    backdrop.setAttribute('data-close', '1');

    var card = el('div', 'muro-modal-card');
    var close = el('button', 'muro-modal-close', '');
    close.type = 'button';
    close.dataset.close = '1';
    close.setAttribute('aria-label', UI.reportCancel);
    close.appendChild(icon('close'));
    card.appendChild(close);

    card.appendChild(el('h2', 'muro-modal-title', UI.menuDelete));
    card.appendChild(el('p', 'muro-modal-intro', UI.deleteConfirm));

    var actions = el('div', 'muro-modal-actions');
    var cancel = el('button', 'muro-btn muro-btn--secondary', UI.deleteConfirmNo);
    cancel.type = 'button';
    var yes = el('button', 'muro-btn', UI.deleteConfirmYes);
    yes.type = 'button';
    actions.appendChild(cancel);
    actions.appendChild(yes);
    card.appendChild(actions);

    host.appendChild(backdrop);
    host.appendChild(card);

    function closeIt() {
      host.removeEventListener('keydown', trap);
      host.hidden = true;
      if (lastFocused && lastFocused.focus) lastFocused.focus();
    }

    yes.addEventListener('click', function () {
      state.posts = state.posts.filter(function (p) { return p.id !== post.id; });
      delete state.threadOpen[post.id];
      delete state.threadAll[post.id];
      if (state.ccDraftTimers[post.id]) window.clearTimeout(state.ccDraftTimers[post.id]);
      delete state.ccDraftTimers[post.id];
      delete state.cc[post.id];
      saveCcDraft(post.id, '');
      savePosts();
      closeIt();
      renderStatus();
      renderFeed();
      announce(UI.menuDelete);
    });

    [cancel, close, backdrop].forEach(function (btn) {
      btn.addEventListener('click', closeIt);
    });

    lastFocused = document.activeElement;
    host.hidden = false;
    host.addEventListener('keydown', trap);
    window.setTimeout(function () {
      var b = modal.querySelector('.muro-btn:not(.muro-btn--secondary)');
      if (b) b.focus();
    }, 30);
  }

  /* ============================================================
     Candado: pintar según sesión
     ============================================================ */
  function paint() {
    var wrap = $('muro-feed-wrap');
    var access = $('muro-access');
    renderSessionChip();

    if (!state.session) {
      wrap.classList.add('is-locked');
      access.hidden = false;
      renderAccess();
      return;
    }

    wrap.classList.remove('is-locked');
    access.hidden = true;
    renderFeed();
  }

  /* ============================================================
     Footer demo: reiniciar
     ============================================================ */
  function renderReset() {
    var btn = $('muro-reset-demo');
    btn.textContent = UI.demoReset;
    btn.title = UI.demoReset;
    btn.addEventListener('click', function () {
      resetDemo();
      state.threadOpen = {};
      state.threadAll = {};
      state.filter = 'recent';
      state.level = 'all';
      renderStatus();
      renderFilters();
      paint();
      announce(UI.demoResetDone);
    });
  }

  /* ============================================================
     init
     ============================================================ */
  function init() {
    state.posts = loadPosts();
    state.session = loadSession();

    renderHero();
    renderHeroProfiles();
    renderStatus();
    renderComposer();
    renderFilters();
    renderSessionChip();
    initHeroAnim();
    paint();
    renderReset();
    bindViewport();

    /* menús: cerrar al hacer click fuera o con Esc */
    document.addEventListener('click', function (e) {
      if (!e.target.closest('.muro-menu')) closeAllMenus();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        closeAllMenus();
        if (modal && !modal.hidden) closeModal();
      }
    });
  }

  function closeModal() {
    if (modal) {
      var host = $('muro-report-modal');
      host.removeEventListener('keydown', trap);
      host.hidden = true;
      if (lastFocused && lastFocused.focus) lastFocused.focus();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();