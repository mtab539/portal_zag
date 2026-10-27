/* ============================================================
   PORTAL ZAG — Podcast ZAG (podcast.html)
   Renderiza el podcast completo: hero, destacado, mosaico,
   playlist, ficha, formularios y acceso por sesión.
   ============================================================ */
(function () {
  'use strict';

  var D = window.ZAG_PODCAST;
  var UI = D.ui;
  var NIVELES = ['rookie', 'strategist', 'creator', 'master', 'senior'];

  function $(id) { return document.getElementById(id); }

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  function accentTitle(container, text, keyword) {
    container.innerHTML = '';
    var upper = text.toUpperCase();
    var key = keyword.toUpperCase();
    var idx = upper.indexOf(key);
    if (idx === -1) { container.textContent = upper; return; }
    if (idx > 0) container.appendChild(document.createTextNode(upper.substring(0, idx)));
    container.appendChild(el('span', 'accent', upper.substring(idx, idx + key.length)));
    if (idx + key.length < upper.length) container.appendChild(document.createTextNode(upper.substring(idx + key.length)));
  }

  function announce(msg) {
    var lv = $('podcast-live');
    if (lv) { lv.textContent = ''; requestAnimationFrame(function () { lv.textContent = msg; }); }
  }

  /* ---- Sesión ---- */
  function session() {
    return window.ZAG_SESSION ? window.ZAG_SESSION.read() : null;
  }

  function nivelIndex(lvl) {
    return NIVELES.indexOf(lvl);
  }

  function sessionLevel() {
    var s = session();
    if (!s) return -1;
    var idx = typeof s.level === 'number' ? s.level : nivelIndex(s.level);
    return idx >= 0 ? idx : 0;
  }

  function sessionLevelName() {
    var idx = sessionLevel();
    return idx >= 0 ? NIVELES[idx] : null;
  }

  /* ---- Spotify helpers ---- */
  function toSpotifyEmbed(url) {
    if (!url || typeof url !== 'string') return null;
    var m = url.match(/open\.spotify\.com\/(playlist|episode|show)\/([A-Za-z0-9]+)/);
    if (!m) return null;
    var base = 'https://open.spotify.com/embed/' + m[1] + '/' + m[2];
    if (D.spotify.tema === 'oscuro') base += '?theme=0';
    return base;
  }

  function renderPlayer(container, url, title, height) {
    container.textContent = '';
    var embedUrl = toSpotifyEmbed(url);
    if (embedUrl && session()) {
      var iframe = document.createElement('iframe');
      iframe.src = embedUrl;
      iframe.width = '100%';
      iframe.height = String(height);
      iframe.style.borderRadius = '12px';
      iframe.setAttribute('frameborder', '0');
      iframe.setAttribute('loading', 'lazy');
      iframe.setAttribute('allow', 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture');
      iframe.title = 'Reproductor de Spotify: ' + title;
      container.appendChild(iframe);
    } else {
      renderPlaceholder(container, null, title, height <= 200);
    }
  }

  function renderPlaceholder(container, ep, title, compact) {
    var ph = el('div', 'podcast-placeholder' + (compact ? '' : ' podcast-placeholder--playlist'));

    if (compact) {
      var cover = el('div', 'podcast-placeholder__cover');
      if (ep) {
        cover.style.background = ep.color;
        cover.textContent = UI.numeroEtiqueta(ep.numero);
      }
      ph.appendChild(cover);

      var info = el('div', 'podcast-placeholder__info');
      info.appendChild(el('p', 'podcast-placeholder__title', title));
      info.appendChild(el('p', 'podcast-placeholder__show', 'Podcast ZAG'));

      var bar = el('div', 'podcast-placeholder__bar');
      var playBtn = el('button', 'podcast-placeholder__play', '▶');
      playBtn.type = 'button';
      playBtn.disabled = true;
      playBtn.setAttribute('aria-label', 'Reproducir (no disponible)');
      bar.appendChild(playBtn);
      bar.appendChild(el('div', 'podcast-placeholder__bar-track'));
      info.appendChild(bar);
      info.appendChild(el('span', 'podcast-placeholder__badge', UI.placeholderMuyPronto));
      ph.appendChild(info);
    } else {
      var header = el('div', 'podcast-placeholder__info');
      header.appendChild(el('p', 'podcast-placeholder__title', 'Podcast ZAG'));
      header.appendChild(el('p', 'podcast-placeholder__show', UI.playlistPlaceholder));
      ph.appendChild(header);

      var list = document.createElement('ul');
      list.className = 'podcast-placeholder__list';
      D.episodios.forEach(function (ep2) {
        var li = document.createElement('li');
        li.appendChild(el('span', 'podcast-placeholder__list-num', UI.numeroEtiqueta(ep2.numero)));
        var tSpan = el('span', '', ep2.titulo);
        li.appendChild(tSpan);
        li.appendChild(el('span', 'podcast-placeholder__list-dur', ep2.duracionMin + ' min'));
        list.appendChild(li);
      });
      ph.appendChild(list);

      var playBtn2 = el('button', 'podcast-placeholder__play', '▶');
      playBtn2.type = 'button';
      playBtn2.disabled = true;
      playBtn2.setAttribute('aria-label', 'Reproducir (no disponible)');
      ph.appendChild(playBtn2);
      ph.appendChild(el('span', 'podcast-placeholder__badge', UI.placeholderMuyPronto));
    }

    container.appendChild(ph);
  }

  /* ---- Carátula generada ---- */
  function renderCover(ep, size) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'podcast-cover';
    btn.style.background = ep.color;
    btn.setAttribute('aria-label', 'Abrir episodio ' + ep.numero + ': ' + ep.titulo);

    btn.appendChild(el('span', 'podcast-cover__numero', ep.numero < 10 ? '0' + ep.numero : String(ep.numero)));
    btn.appendChild(el('span', 'podcast-cover__palabra', ep.palabraClave));

    var invitadoNames = ep.invitados.map(function (mid) {
      var m = D.mentor(mid);
      return m ? m.nombre : '';
    }).filter(Boolean).join(', ');

    if (invitadoNames) {
      btn.appendChild(el('span', 'podcast-cover__tag', invitadoNames));
    }

    var play = el('span', 'podcast-cover__play', '▶');
    play.setAttribute('aria-hidden', 'true');
    btn.appendChild(play);

    btn.addEventListener('click', function () { openFicha(ep.id); });
    return btn;
  }

  /* ---- Hero ---- */
  function renderHero() {
    var kicker = $('podcast-hero-kicker');
    var title = $('podcast-hero-title');
    var sub = $('podcast-hero-sub');
    var btns = $('podcast-hero-btns');

    kicker.textContent = UI.heroKicker;
    title.innerHTML = '';
    title.appendChild(document.createTextNode(UI.heroTitulo + ' '));
    var acc = el('span', 'zag-hero__title-accent', UI.heroTituloAccent);
    title.appendChild(acc);

    sub.textContent = UI.heroSub;

    btns.textContent = '';
    var spotifyBtn = document.createElement('a');
    spotifyBtn.className = 'btn btn--hero';
    if (D.spotify.playlistUrl) {
      spotifyBtn.href = D.spotify.playlistUrl;
      spotifyBtn.target = '_blank';
      spotifyBtn.rel = 'noopener noreferrer';
      spotifyBtn.textContent = UI.heroCtaSpotify;
    } else {
      spotifyBtn.setAttribute('aria-disabled', 'true');
      spotifyBtn.style.opacity = '0.5';
      spotifyBtn.style.pointerEvents = 'none';
      spotifyBtn.href = '#';
      spotifyBtn.textContent = UI.heroCtaSpotifyDisabled;
    }
    btns.appendChild(spotifyBtn);

    var epBtn = document.createElement('a');
    epBtn.className = 'btn';
    epBtn.style.background = 'var(--color-white)';
    epBtn.style.color = 'var(--color-cta)';
    epBtn.style.borderColor = 'var(--color-cta)';
    epBtn.href = '#episodios';
    epBtn.textContent = UI.heroCtaEpisodios;
    btns.appendChild(epBtn);

    renderHeroEstado();
  }

  function renderHeroEstado() {
    var estado = $('podcast-hero-estado');
    var s = session();
    if (!s) { estado.hidden = true; return; }

    estado.hidden = false;
    var lvl = sessionLevel();
    var lvlName = sessionLevelName();

    var hasSellos = false;
    if (window.ZagPerfil) {
      var perfil = window.ZagPerfil.get();
      if (perfil) {
        try {
          var sellos = JSON.parse(localStorage.getItem('zag_perfil_sellos') || '{}');
          if (sellos.rookie) {
            for (var i = 0; i < sellos.rookie.length; i++) {
              if (sellos.rookie[i].id === 'podcast' && sellos.rookie[i].estado === 'aprobado') {
                hasSellos = true; break;
              }
            }
          }
        } catch (e) { /* no storage */ }
      }
    }

    estado.textContent = '';
    var badge = el('span', 'podcast-badge');
    var meta = window.ZAG_NIVELES ? window.ZAG_NIVELES.meta(lvlName) : null;
    if (meta) {
      badge.textContent = meta.nombre;
      badge.style.background = meta.fondo;
      badge.style.color = meta.texto;
    }
    estado.appendChild(badge);

    if (lvl >= 3) {
      estado.appendChild(document.createTextNode(' ' + UI.estadoMaster));
    } else if (hasSellos) {
      estado.appendChild(document.createTextNode(' ' + UI.estadoSellos));
    } else {
      estado.appendChild(document.createTextNode(' ' + UI.estadoRookie));
    }
  }

  /* ---- Acceso ---- */
  function renderAccess() {
    var s = session();
    var gate = $('podcast-gate');
    var access = $('podcast-access');

    if (s) {
      gate.classList.remove('is-locked');
      access.hidden = true;
      return;
    }

    gate.classList.add('is-locked');
    access.hidden = false;

    $('podcast-access-kicker').textContent = UI.accessKicker;
    $('podcast-access-title').textContent = UI.accessTitle;
    $('podcast-access-copy').textContent = UI.accessCopy;

    var actions = $('podcast-access-actions');
    actions.textContent = '';

    var primary = document.createElement('a');
    primary.className = 'btn';
    primary.href = 'registro.html';
    primary.textContent = UI.accessCtaPrimary;
    actions.appendChild(primary);

    var demo = el('button', 'btn btn--secondary', UI.accessCtaDemo);
    demo.type = 'button';
    demo.addEventListener('click', function () {
      if (window.ZAG_SESSION && window.ZAG_SESSION.write) {
        window.ZAG_SESSION.write({ name: 'Demo', level: 'rookie' });
      }
      paint();
    });
    actions.appendChild(demo);
  }

  /* ---- Destacado ---- */
  function renderDestacado() {
    var ep = D.destacado();
    if (!ep) return;

    $('podcast-dest-kicker').textContent = UI.destacadoKicker + ' · ' + UI.numeroEtiqueta(ep.numero);

    var title = $('podcast-dest-title');
    accentTitle(title, ep.titulo, ep.palabraClave);

    var meta = $('podcast-dest-meta');
    meta.textContent = '';
    var avatarsWrap = el('span', 'podcast-destacado__avatars');
    ep.invitados.forEach(function (mid) {
      var m = D.mentor(mid);
      if (m && m.foto) {
        var img = document.createElement('img');
        img.className = 'podcast-destacado__avatar';
        img.src = m.foto;
        img.alt = m.nombre;
        img.width = 36;
        img.height = 36;
        img.setAttribute('loading', 'lazy');
        avatarsWrap.appendChild(img);
      }
    });
    meta.appendChild(avatarsWrap);

    var names = ep.invitados.map(function (mid) {
      var m = D.mentor(mid);
      return m ? m.nombre : '';
    }).filter(Boolean).join(', ');
    meta.appendChild(document.createTextNode(names));
    meta.appendChild(document.createTextNode(' · '));
    meta.appendChild(document.createTextNode(UI.duracion(ep.duracionMin)));
    meta.appendChild(document.createTextNode(' · '));
    meta.appendChild(document.createTextNode(UI.fechaCorta(ep.fecha)));

    $('podcast-dest-resumen').textContent = ep.resumen;

    renderPlayer($('podcast-dest-player'), ep.spotifyUrl, ep.titulo, 152);

    var actions = $('podcast-dest-actions');
    actions.textContent = '';

    var lvl = sessionLevel();
    if (lvl === 0) {
      var evBtn = document.createElement('a');
      evBtn.className = 'btn btn--secondary';
      evBtn.href = 'perfil.html#retos?reto=podcast';
      evBtn.textContent = UI.destacadoEvidencia;
      actions.appendChild(evBtn);
    } else if (lvl > 0) {
      var shareBtn = el('button', 'podcast-destacado__share', UI.destacadoCompartir);
      shareBtn.type = 'button';
      shareBtn.addEventListener('click', function () {
        var url = window.location.origin + window.location.pathname + '?ep=' + ep.id;
        try { navigator.clipboard.writeText(url); } catch (e) { /* fallback */ }
        showToast(UI.destacadoCopiado);
      });
      actions.appendChild(shareBtn);
    }

    var coverWrap = $('podcast-dest-cover');
    coverWrap.textContent = '';
    coverWrap.appendChild(renderCover(ep));
  }

  /* ---- Mosaico ---- */
  function renderMosaico() {
    $('podcast-mosaico-kicker').textContent = UI.mosaicoKicker;

    var title = $('podcast-mosaico-title');
    title.innerHTML = '';
    title.appendChild(document.createTextNode(UI.mosaicoTitulo + ' '));
    title.appendChild(el('span', 'accent', UI.mosaicoTituloAccent));

    var grid = $('podcast-mosaico-grid');
    grid.textContent = '';

    D.episodios.forEach(function (ep) {
      var item = el('div', 'podcast-mosaico-item');
      item.appendChild(renderCover(ep));

      item.appendChild(el('p', 'podcast-mosaico-meta',
        UI.numeroEtiqueta(ep.numero) + ' · ' + ep.duracionMin + ' min'));
      item.appendChild(el('p', 'podcast-mosaico-title', ep.titulo));
      item.appendChild(el('p', 'podcast-mosaico-date', UI.fechaCorta(ep.fecha)));

      grid.appendChild(item);
    });

    for (var p = 0; p < 2; p++) {
      var prox = el('div', 'podcast-mosaico-item');
      var proxCover = el('div', 'podcast-cover podcast-cover--prox');
      proxCover.setAttribute('aria-label', UI.mosaicoProximamente);
      proxCover.appendChild(el('span', 'podcast-cover__palabra', UI.mosaicoProximamente));
      prox.appendChild(proxCover);
      grid.appendChild(prox);
    }
  }

  /* ---- Ficha ---- */
  var fichaReturnFocus = null;

  function openFicha(epId) {
    var ep = D.episodio(epId);
    if (!ep) return;

    fichaReturnFocus = document.activeElement;
    history.replaceState(null, '', '?ep=' + epId + window.location.hash);

    var overlay = $('podcast-ficha-overlay');
    var ficha = $('podcast-ficha');
    ficha.textContent = '';

    var closeBtn = el('button', 'podcast-ficha__close', '✕');
    closeBtn.type = 'button';
    closeBtn.setAttribute('aria-label', UI.fichaCerrar);
    closeBtn.addEventListener('click', closeFicha);
    ficha.appendChild(closeBtn);

    var coverWrap = el('div', 'podcast-ficha__cover');
    coverWrap.appendChild(renderCover(ep));
    ficha.appendChild(coverWrap);

    var kicker = el('p', 'kicker', UI.fichaKicker + ' ' + UI.numeroEtiqueta(ep.numero));
    ficha.appendChild(kicker);

    var title = el('h2', 'podcast-ficha__title');
    accentTitle(title, ep.titulo, ep.palabraClave);
    ficha.appendChild(title);

    ficha.appendChild(el('p', 'podcast-ficha__meta',
      UI.fechaCorta(ep.fecha) + ' · ' + UI.duracion(ep.duracionMin)));

    var playerWrap = el('div', 'podcast-player');
    renderPlayer(playerWrap, ep.spotifyUrl, ep.titulo, 152);
    ficha.appendChild(playerWrap);

    ficha.appendChild(el('h3', 'podcast-ficha__title', UI.fichaQueHablamos));
    var descWrap = el('div', 'podcast-ficha__desc');
    ep.descripcion.forEach(function (par) {
      descWrap.appendChild(el('p', '', par));
    });
    ficha.appendChild(descWrap);

    ficha.appendChild(el('h3', 'podcast-ficha__title', UI.fichaMomentos));
    var momList = document.createElement('ul');
    momList.className = 'podcast-ficha__momentos';
    ep.momentos.forEach(function (m) {
      var li = document.createElement('li');
      li.appendChild(el('span', 'podcast-ficha__momentos-t', m.t));
      li.appendChild(document.createTextNode(m.tema));
      momList.appendChild(li);
    });
    ficha.appendChild(momList);

    var temasWrap = el('div', 'podcast-ficha__temas');
    ep.temas.forEach(function (t) {
      temasWrap.appendChild(el('span', 'podcast-ficha__tema-chip', t));
    });
    ficha.appendChild(temasWrap);

    ficha.appendChild(el('h3', 'podcast-ficha__title', UI.fichaInvitados));
    ep.invitados.forEach(function (mid) {
      var m = D.mentor(mid);
      if (!m) return;
      var card = el('div', 'podcast-ficha__invitado');

      var foto = document.createElement('img');
      foto.className = 'podcast-ficha__invitado-foto';
      foto.src = m.foto;
      foto.alt = m.nombre;
      foto.width = 56;
      foto.height = 56;
      foto.setAttribute('loading', 'lazy');
      card.appendChild(foto);

      var info = el('div', '');
      info.appendChild(el('p', 'podcast-ficha__invitado-nombre', m.nombre));
      info.appendChild(el('p', 'podcast-ficha__invitado-cargo', m.cargo + (m.empresa ? ' · ' + m.empresa : '')));
      var mentLink = document.createElement('a');
      mentLink.className = 'podcast-ficha__invitado-link';
      mentLink.href = 'mentorias.html?mentor=' + m.id;
      mentLink.textContent = UI.fichaAgendaMentoria;
      info.appendChild(mentLink);
      card.appendChild(info);

      ficha.appendChild(card);
    });

    var lvl = sessionLevel();
    if (lvl === 0) {
      var evBtn = document.createElement('a');
      evBtn.className = 'btn btn--secondary';
      evBtn.style.marginTop = 'var(--s-5)';
      evBtn.style.background = 'var(--color-white)';
      evBtn.style.color = 'var(--color-cta)';
      evBtn.style.borderColor = 'var(--color-cta)';
      evBtn.href = 'perfil.html#retos?reto=podcast';
      evBtn.textContent = UI.destacadoEvidencia;
      ficha.appendChild(evBtn);
    }

    overlay.hidden = false;
    requestAnimationFrame(function () {
      overlay.classList.add('is-open');
      closeBtn.focus();
    });

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeFicha();
    });

    trapFocus(overlay);
  }

  function closeFicha() {
    var overlay = $('podcast-ficha-overlay');
    overlay.classList.remove('is-open');
    var onEnd = function () {
      overlay.hidden = true;
      overlay.removeEventListener('transitionend', onEnd);
      if (fichaReturnFocus) { fichaReturnFocus.focus(); fichaReturnFocus = null; }
    };
    overlay.addEventListener('transitionend', onEnd);
    history.replaceState(null, '', window.location.pathname + window.location.hash);
  }

  function trapFocus(container) {
    container.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { closeFicha(); return; }
      if (e.key !== 'Tab') return;
      var focusable = container.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])');
      if (!focusable.length) return;
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }

  /* ---- Playlist ---- */
  function renderPlaylist() {
    $('podcast-playlist-kicker').textContent = UI.playlistKicker;

    var title = $('podcast-playlist-title');
    title.innerHTML = '';
    title.appendChild(document.createTextNode(UI.playlistTitulo + ' '));
    title.appendChild(el('span', 'accent', UI.playlistTituloAccent));
    title.appendChild(document.createTextNode(UI.playlistTituloFin));

    var playerWrap = $('podcast-playlist-player');
    var h = window.innerWidth >= 1024 ? 480 : 352;

    if (D.spotify.playlistUrl) {
      renderPlayer(playerWrap, D.spotify.playlistUrl, 'Podcast ZAG', h);
    } else {
      renderPlaceholder(playerWrap, null, 'Podcast ZAG', false);
    }

    var linkP = $('podcast-playlist-link');
    if (D.spotify.playlistUrl) {
      linkP.hidden = false;
      linkP.textContent = '';
      var a = document.createElement('a');
      a.href = D.spotify.playlistUrl;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.textContent = UI.playlistAbrir;
      a.className = 'btn';
      a.style.marginTop = 'var(--s-4)';
      linkP.appendChild(a);
    }
  }

  /* ---- Participa ---- */
  function renderParticipa() {
    $('podcast-participa-kicker').textContent = UI.participaKicker;

    var title = $('podcast-participa-title');
    title.innerHTML = '';
    title.appendChild(document.createTextNode(UI.participaTitulo + ' '));
    title.appendChild(el('span', 'accent', UI.participaTituloAccent));

    renderInvitadoCard();
    renderProponCard();
  }

  function renderInvitadoCard() {
    var card = $('podcast-card-invitado');
    card.textContent = '';

    card.appendChild(el('p', 'kicker', UI.invitadoKicker));

    var title = el('h3', 'podcast-card-invitado__title');
    title.appendChild(document.createTextNode(UI.invitadoTitulo + ' '));
    title.appendChild(el('span', 'accent', UI.invitadoTituloAccent));
    title.appendChild(document.createTextNode(UI.invitadoTituloFin));
    card.appendChild(title);

    card.appendChild(el('p', 'podcast-card-invitado__copy', UI.invitadoCopy));

    var lvl = sessionLevel();
    var btn = el('button', 'btn', UI.invitadoBtn);
    btn.type = 'button';

    if (lvl < 3) {
      btn.disabled = true;
      card.appendChild(btn);
      var falta = 3 - lvl;
      var lockText = el('p', 'podcast-card-invitado__locked');
      lockText.textContent = '🔒 ' + UI.invitadoLocked + ' · te ' + (falta === 1 ? 'falta' : 'faltan') + ' ' + falta + ' nivel' + (falta > 1 ? 'es' : '');
      var verLink = document.createElement('a');
      verLink.href = 'perfil.html#retos';
      verLink.textContent = ' ' + UI.invitadoVerComo;
      lockText.appendChild(verLink);
      card.appendChild(lockText);
    } else {
      var formWrap = el('div', '');
      formWrap.hidden = true;
      btn.addEventListener('click', function () {
        formWrap.hidden = !formWrap.hidden;
        btn.setAttribute('aria-expanded', String(!formWrap.hidden));
      });
      btn.setAttribute('aria-expanded', 'false');
      card.appendChild(btn);
      formWrap.appendChild(buildInvitadoForm());
      card.appendChild(formWrap);
    }
  }

  function buildInvitadoForm() {
    var form = document.createElement('form');
    form.className = 'podcast-inline-form';
    form.noValidate = true;

    var s = session();
    var sessionName = s ? s.name : '';
    var sessionLvl = sessionLevelName();

    var readonlyField = el('div', 'podcast-field');
    readonlyField.appendChild(el('span', '', 'Tu perfil'));
    readonlyField.appendChild(el('p', 'podcast-field__readonly',
      sessionName + ' · ' + (sessionLvl ? sessionLvl.toUpperCase() : '')));
    form.appendChild(readonlyField);

    var temaField = makeField('text', 'inv-tema', UI.invitadoFormTema, true, 100);
    form.appendChild(temaField.wrap);

    var porqueField = makeTextarea('inv-porque', UI.invitadoFormPorque, true, 400);
    form.appendChild(porqueField.wrap);

    var dispField = makeSelect('inv-disp', UI.invitadoFormDisponibilidad, true, UI.invitadoFormDisponibilidadOpciones);
    form.appendChild(dispField.wrap);

    var linkField = makeField('url', 'inv-link', UI.invitadoFormLink, false, 300);
    form.appendChild(linkField.wrap);

    var errP = el('p', 'podcast-field__error');
    errP.setAttribute('role', 'alert');
    errP.hidden = true;
    form.appendChild(errP);

    var okP = el('p', 'podcast-form-ok');
    okP.setAttribute('role', 'status');
    okP.setAttribute('aria-live', 'polite');
    okP.hidden = true;
    form.appendChild(okP);

    var submit = el('button', 'btn', UI.invitadoFormEnviar);
    submit.type = 'submit';
    form.appendChild(submit);

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      errP.hidden = true;

      var tema = temaField.input.value.trim();
      var porque = porqueField.input.value.trim();
      var disp = dispField.input.value;
      var link = linkField.input.value.trim();

      clearInvalid(temaField.input);
      clearInvalid(porqueField.input);
      clearInvalid(dispField.input);
      clearInvalid(linkField.input);

      if (!tema) { setInvalid(temaField.input, 'Escribe un tema'); temaField.input.focus(); return; }
      if (!porque) { setInvalid(porqueField.input, 'Cuéntanos por qué tú'); porqueField.input.focus(); return; }
      if (!disp) { setInvalid(dispField.input, 'Elige disponibilidad'); dispField.input.focus(); return; }
      if (link && !/^https?:\/\/[\w\-\.]+\.[a-z]{2,}/i.test(link)) {
        setInvalid(linkField.input, 'Ingresa una URL válida');
        linkField.input.focus();
        return;
      }

      saveToStorage('zag_podcast_postulaciones', {
        nombre: sessionName,
        nivel: sessionLvl,
        tema: tema,
        porque: porque,
        disponibilidad: disp,
        link: link,
        fecha: new Date().toISOString(),
      });

      form.reset();
      submit.hidden = true;
      okP.textContent = UI.invitadoFormOk;
      okP.hidden = false;
      announce(UI.invitadoFormOk);
    });

    return form;
  }

  function renderProponCard() {
    var card = $('podcast-card-propon');
    card.textContent = '';

    card.appendChild(el('p', 'kicker', UI.proponKicker));

    var title = el('h3', 'podcast-card-propon__title');
    title.appendChild(document.createTextNode(UI.proponTitulo + ' '));
    title.appendChild(el('span', 'accent', UI.proponTituloAccent));
    title.appendChild(document.createTextNode(UI.proponTituloFin));
    card.appendChild(title);

    card.appendChild(el('p', 'podcast-card-propon__copy', UI.proponCopy));

    var formWrap = el('div', '');
    formWrap.hidden = true;

    var btn = el('button', 'btn', UI.proponBtn);
    btn.type = 'button';
    btn.setAttribute('aria-expanded', 'false');
    btn.addEventListener('click', function () {
      formWrap.hidden = !formWrap.hidden;
      btn.setAttribute('aria-expanded', String(!formWrap.hidden));
    });
    card.appendChild(btn);

    formWrap.appendChild(buildProponForm());
    card.appendChild(formWrap);
  }

  function buildProponForm() {
    var form = document.createElement('form');
    form.className = 'podcast-inline-form';
    form.noValidate = true;

    var temaField = makeField('text', 'prop-tema', UI.proponFormTema, true, 100);
    form.appendChild(temaField.wrap);

    var queField = makeTextarea('prop-que', UI.proponFormQue, false, 280);
    form.appendChild(queField.wrap);

    var quienField = makeField('text', 'prop-quien', UI.proponFormQuien, false, 100);
    form.appendChild(quienField.wrap);

    var errP = el('p', 'podcast-field__error');
    errP.setAttribute('role', 'alert');
    errP.hidden = true;
    form.appendChild(errP);

    var okP = el('p', 'podcast-form-ok');
    okP.setAttribute('role', 'status');
    okP.setAttribute('aria-live', 'polite');
    okP.hidden = true;
    form.appendChild(okP);

    var submit = el('button', 'btn', UI.proponFormEnviar);
    submit.type = 'submit';
    form.appendChild(submit);

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      errP.hidden = true;

      var tema = temaField.input.value.trim();
      clearInvalid(temaField.input);

      if (!tema) { setInvalid(temaField.input, 'Escribe un tema'); temaField.input.focus(); return; }

      saveToStorage('zag_podcast_propuestas', {
        tema: tema,
        que: queField.input.value.trim(),
        quien: quienField.input.value.trim(),
        fecha: new Date().toISOString(),
      });

      form.reset();
      submit.hidden = true;
      okP.textContent = UI.proponFormOk;
      okP.hidden = false;
      announce(UI.proponFormOk);
    });

    return form;
  }

  /* ---- Form helpers ---- */
  function makeField(type, id, label, required, maxlen) {
    var wrap = el('div', 'podcast-field');
    var lbl = el('span', '', label + (required ? ' *' : ''));
    wrap.appendChild(lbl);
    var input = document.createElement('input');
    input.type = type;
    input.id = 'podcast-' + id;
    input.name = id;
    input.autocomplete = 'off';
    if (required) input.required = true;
    if (maxlen) input.maxLength = maxlen;
    wrap.appendChild(input);
    var errSpan = el('span', 'podcast-field__error');
    errSpan.id = 'podcast-' + id + '-err';
    errSpan.hidden = true;
    wrap.appendChild(errSpan);
    input.setAttribute('aria-describedby', errSpan.id);
    return { wrap: wrap, input: input, error: errSpan };
  }

  function makeTextarea(id, label, required, maxlen) {
    var wrap = el('div', 'podcast-field');
    wrap.appendChild(el('span', '', label + (required ? ' *' : '')));
    var ta = document.createElement('textarea');
    ta.id = 'podcast-' + id;
    ta.name = id;
    ta.rows = 3;
    if (required) ta.required = true;
    if (maxlen) ta.maxLength = maxlen;
    wrap.appendChild(ta);

    var count = el('small', 'podcast-field__count', '0 / ' + maxlen);
    wrap.appendChild(count);
    ta.addEventListener('input', function () {
      count.textContent = ta.value.length + ' / ' + maxlen;
    });

    var errSpan = el('span', 'podcast-field__error');
    errSpan.id = 'podcast-' + id + '-err';
    errSpan.hidden = true;
    wrap.appendChild(errSpan);
    ta.setAttribute('aria-describedby', errSpan.id);

    return { wrap: wrap, input: ta, error: errSpan };
  }

  function makeSelect(id, label, required, options) {
    var wrap = el('div', 'podcast-field');
    wrap.appendChild(el('span', '', label + (required ? ' *' : '')));
    var sel = document.createElement('select');
    sel.id = 'podcast-' + id;
    sel.name = id;
    if (required) sel.required = true;

    var blank = document.createElement('option');
    blank.value = '';
    blank.textContent = 'Selecciona…';
    sel.appendChild(blank);

    options.forEach(function (o) {
      var opt = document.createElement('option');
      opt.value = o;
      opt.textContent = o;
      sel.appendChild(opt);
    });
    wrap.appendChild(sel);

    var errSpan = el('span', 'podcast-field__error');
    errSpan.id = 'podcast-' + id + '-err';
    errSpan.hidden = true;
    wrap.appendChild(errSpan);
    sel.setAttribute('aria-describedby', errSpan.id);

    return { wrap: wrap, input: sel, error: errSpan };
  }

  function setInvalid(input, msg) {
    input.setAttribute('aria-invalid', 'true');
    var errSpan = document.getElementById(input.getAttribute('aria-describedby'));
    if (errSpan) { errSpan.textContent = msg; errSpan.hidden = false; }
  }

  function clearInvalid(input) {
    input.removeAttribute('aria-invalid');
    var errSpan = document.getElementById(input.getAttribute('aria-describedby'));
    if (errSpan) { errSpan.textContent = ''; errSpan.hidden = true; }
  }

  /* ---- Storage ---- */
  function saveToStorage(key, item) {
    var list = [];
    try {
      var raw = window.localStorage.getItem(key);
      if (raw) list = JSON.parse(raw) || [];
    } catch (e) { list = []; }
    if (!Array.isArray(list)) list = [];
    list.push(item);
    if (list.length > 200) list = list.slice(-200);
    try { window.localStorage.setItem(key, JSON.stringify(list)); } catch (e) { /* sin storage */ }
  }

  /* ---- Toast ---- */
  function showToast(msg) {
    var toast = $('podcast-toast');
    toast.textContent = msg;
    toast.classList.add('is-visible');
    setTimeout(function () { toast.classList.remove('is-visible'); }, 2500);
  }

  /* ---- Reset demo ---- */
  function initReset() {
    var btn = $('podcast-reset-demo');
    if (!btn) return;
    btn.addEventListener('click', function () {
      try { localStorage.removeItem('zag_podcast_postulaciones'); } catch (e) {}
      try { localStorage.removeItem('zag_podcast_propuestas'); } catch (e) {}
      showToast('Demo del podcast reiniciada');
    });
  }

  /* ---- URL params ---- */
  function checkUrlParams() {
    var params = new URLSearchParams(window.location.search);
    var epId = params.get('ep');
    if (epId && session()) openFicha(epId);
  }

  /* ---- Session chip ---- */
  function renderSessionChip() {
    var host = $('podcast-session-chip');
    if (!host) return;
    var s = session();
    if (!s) { host.hidden = true; return; }

    host.hidden = false;
    host.textContent = '';

    var avatar = el('span', 'muro-chip-avatar');
    var initials = (s.name || 'Z').trim().split(/\s+/).slice(0, 2).map(function (w) { return w.charAt(0).toUpperCase(); }).join('');
    avatar.textContent = initials;
    host.appendChild(avatar);

    var nameEl = el('span', '', s.name || 'Demo');
    host.appendChild(nameEl);

    var exitBtn = el('button', 'muro-chip-exit', 'Salir');
    exitBtn.type = 'button';
    exitBtn.addEventListener('click', function () {
      if (window.ZAG_SESSION && window.ZAG_SESSION.clear) window.ZAG_SESSION.clear();
      paint();
    });
    host.appendChild(exitBtn);
  }

  /* ---- Paint ---- */
  function paint() {
    renderHero();
    renderAccess();
    renderSessionChip();
    if (session()) {
      renderDestacado();
      renderMosaico();
      renderPlaylist();
      renderParticipa();
      checkUrlParams();
    }
  }

  /* ---- Init ---- */
  function init() {
    if (!D) return;
    paint();
    initReset();

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        var overlay = $('podcast-ficha-overlay');
        if (overlay && overlay.classList.contains('is-open')) closeFicha();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
