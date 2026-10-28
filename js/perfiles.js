/* ============================================================
   PORTAL ZAG — Página "Conoce los perfiles"
   Depende de: perfil-data.js (ZAG_NIVELES), zag-perfil.js (ZagPerfil),
               perfiles-data.js (ZAG_PERFILES), escarapela.js (ZAGEscarapela)
   ============================================================ */
(function () {
  'use strict';

  /* ---- Espera a que el DOM esté listo ---- */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    /* Si ya hay stickers creados, no volver a inicializar */
    if (document.querySelectorAll('.pf-poster-item').length > 0) return;
    var PERFILES = window.ZAG_PERFILES && window.ZAG_PERFILES.PERFILES;
    var UI       = window.ZAG_PERFILES && window.ZAG_PERFILES.UI;
    var NIVELES  = window.ZAG_NIVELES;
    var PERFIL   = window.ZagPerfil;

    if (!PERFILES || !UI || !NIVELES || !PERFIL) {
      console.warn('[perfiles.js] Dependencias no cargadas');
      return;
    }

    /* ---- Sesión ---- */
    var sesion   = PERFIL.get();
    var nivelId  = sesion ? PERFIL.nivel() : null;
    var nivelIdx = nivelId ? NIVELES.indice(nivelId) : -1;
    var NIVEL    = nivelId ? NIVELES.meta(nivelId) : null;

    /* ---- CTA dinámico ---- */
    var CTA_LABEL = UI.cta.sinSesion.label;
    var CTA_HREF  = UI.cta.sinSesion.href;
    if (sesion) {
      CTA_LABEL = UI.cta.conSesion.label;
      CTA_HREF  = UI.cta.conSesion.href;
    }

    /* Actualizar CTAs estáticos del HTML */
    var heroCta   = document.getElementById('pf-hero-cta');
    var cierreCta = document.getElementById('pf-cierre-cta');
    var cierreSub = document.getElementById('pf-cierre-sub');
    if (heroCta)   { heroCta.textContent = CTA_LABEL; heroCta.href = CTA_HREF; }
    if (cierreCta) { cierreCta.textContent = CTA_LABEL + ' →'; cierreCta.href = CTA_HREF; }
    if (cierreSub && sesion) { cierreSub.textContent = UI.cierre.subSesion; }

    /* Header "Únete" */
    var headerCta = document.getElementById('pf-header-cta');
    if (headerCta && sesion) { headerCta.textContent = 'Mi perfil'; headerCta.href = 'perfil.html'; }

    /* ---- Escarapela ---- */
    var escRoot = document.getElementById('escarapela');
    if (escRoot && window.ZAGEscarapela) {
      var info = {};
      if (sesion && NIVEL) {
        info = {
          nombre:      PERFIL.nombre(),
          nivelNombre: NIVEL.nombre + ' · ' + NIVEL.identidad,
          nivelBg:     'var(' + NIVEL.fondo.replace('var(', '').replace(')', '') + ')',
          nivelFg:     'var(' + NIVEL.texto.replace('var(', '').replace(')', '') + ')',
        };
        /* Normalizar: NIVEL.fondo ya es 'var(--color-cream)' */
        info.nivelBg = NIVEL.fondo;
        info.nivelFg = NIVEL.texto;
      }
      ZAGEscarapela.mount(escRoot, ZAGEscarapela.zagFaces(info));
    }

    /* ---- Helpers de UI ---- */
    function el(tag, cls) {
      var n = document.createElement(tag);
      if (cls) n.className = cls;
      return n;
    }
    function txt(text) { return document.createTextNode(text); }

    /* Construye la info de un perfil (columna izquierda / info de tarjeta mobile) */
    function buildInfo(perfil, containerEl) {
      var isCurrentLevel = sesion && nivelId === perfil.id;
      var isUnlocked     = sesion && nivelIdx > perfil.orden;
      var nivelMeta      = PERFILES.find ? PERFILES.filter(function(p){ return p.id === perfil.id; })[0] : perfil;

      /* Token vars para los colores del nivel */
      containerEl.style.setProperty('--pf-nivel-bg', 'var(' + perfil.bg + ')');
      containerEl.style.setProperty('--pf-nivel-fg', 'var(' + perfil.fg + ')');

      /* Contador */
      var counter = el('p', 'pf-info__counter');
      counter.textContent = pad(perfil.orden + 1) + ' / 05';
      containerEl.appendChild(counter);

      /* Apodo */
      var apodo = el('p', 'pf-info__eyebrow');
      apodo.textContent = perfil.apodo;
      containerEl.appendChild(apodo);

      /* Nombre gigante */
      var nombre = el('h3', 'pf-info__nombre');
      nombre.appendChild(txt(perfil.nombre));
      var punto = el('span', 'punto');
      punto.textContent = '.';
      nombre.appendChild(punto);
      containerEl.appendChild(nombre);

      /* Píldora "TU NIVEL ACTUAL" o "✓ Ya lo desbloqueaste" */
      if (isCurrentLevel) {
        var pill = el('span', 'pf-info__pill');
        pill.textContent = 'TU NIVEL ACTUAL';
        containerEl.appendChild(pill);
      } else if (isUnlocked) {
        var desbloq = el('p', 'pf-info__desbloqueado');
        desbloq.textContent = '✓ Ya lo desbloqueaste';
        containerEl.appendChild(desbloq);
      }

      /* Frase */
      var frase = el('p', 'pf-info__frase');
      frase.textContent = perfil.frase;
      containerEl.appendChild(frase);

      /* DESBLOQUEAS */
      var desblLabel = el('p', 'pf-info__section-label');
      desblLabel.textContent = 'DESBLOQUEAS';
      containerEl.appendChild(desblLabel);

      var chipsList = el('ul', 'pf-info__chips');
      /* Chip "todo lo del nivel anterior" desde Strategist */
      if (perfil.orden > 0) {
        var li0 = el('li');
        var chip0 = el('span', 'pf-chip pf-chip--prev');
        chip0.textContent = '+ todo lo del nivel anterior';
        li0.appendChild(chip0);
        chipsList.appendChild(li0);
      }
      perfil.desbloquea.forEach(function (item) {
        var li = el('li');
        var chipEl;
        if (item.href) {
          chipEl = el('a', 'pf-chip');
          chipEl.href = item.href;
        } else {
          chipEl = el('span', 'pf-chip');
        }
        var check = el('span', 'pf-chip__check');
        check.setAttribute('aria-hidden', 'true');
        check.textContent = '✓';
        chipEl.appendChild(check);
        chipEl.appendChild(txt(item.label));
        li.appendChild(chipEl);
        chipsList.appendChild(li);
      });
      containerEl.appendChild(chipsList);

      /* MERCH */
      var merchLabel = el('p', 'pf-info__section-label');
      merchLabel.textContent = 'MERCH DEL NIVEL';
      containerEl.appendChild(merchLabel);

      var merchList = el('ul', 'pf-info__chips');
      perfil.merch.forEach(function (item) {
        var li = el('li');
        var chipCls = 'pf-chip-merch' + (perfil.id === 'rookie' ? ' pf-chip-merch--rookie' : '');
        var chipEl = el('span', chipCls);
        /* Icono bolsita SVG inline */
        var icon = el('span', 'pf-chip-merch__icon');
        icon.setAttribute('aria-hidden', 'true');
        icon.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>';
        chipEl.appendChild(icon);
        chipEl.appendChild(txt(item));
        li.appendChild(chipEl);
        merchList.appendChild(li);
      });
      containerEl.appendChild(merchList);

      /* CÓMO LLEGAR */
      var llegarLabel = el('p', 'pf-info__section-label');
      llegarLabel.textContent = 'CÓMO LLEGAR';
      containerEl.appendChild(llegarLabel);

      var llegarWrap = el('div', 'pf-info__llegar');
      if (perfil.orden === 0) {
        /* Rookie: solo un check */
        var checkSpan = el('span');
        checkSpan.textContent = '✓';
        checkSpan.style.color = 'var(--color-cta)';
        checkSpan.style.fontWeight = '700';
        checkSpan.style.fontSize = '18px';
        llegarWrap.appendChild(checkSpan);
      } else {
        /* 6 círculos */
        var sellosWrap = el('div', 'pf-sellos');
        for (var s = 0; s < 6; s++) {
          var sello = el('span', 'pf-sello' + (perfil.id === 'rookie' ? ' pf-sello--rookie' : ''));
          sellosWrap.appendChild(sello);
        }
        llegarWrap.appendChild(sellosWrap);
      }
      var llegarText = el('p', 'pf-info__llegar-text');
      llegarText.textContent = perfil.comoLlegar;
      llegarWrap.appendChild(llegarText);
      containerEl.appendChild(llegarWrap);

      /* CTA */
      var ctaEl = el('a', 'btn btn--hero');
      ctaEl.href = CTA_HREF;
      ctaEl.textContent = CTA_LABEL + ' →';
      containerEl.appendChild(ctaEl);
    }

    /* Construye el contenedor del sticker grande (sin tarjeta, sin fondo) */
    function buildPoster(perfil) {
      var wrap = el('div', 'pf-poster-item');
      wrap.style.setProperty('--pf-nivel-bg', 'var(' + perfil.bg + ')');
      wrap.style.setProperty('--pf-nivel-fg', 'var(' + perfil.fg + ')');

      var poster = el('div', 'pf-poster');

      var stickerWrap = el('div', 'pf-poster__sticker');
      var img = el('img');
      img.src = perfil.sticker;
      img.alt = 'Sticker del nivel ' + perfil.nombre;
      img.onerror = function () {
        stickerWrap.removeChild(img);
        var fb = el('div', 'pf-poster__sticker-fallback');
        fb.textContent = perfil.nombre.charAt(0);
        stickerWrap.appendChild(fb);
      };
      stickerWrap.appendChild(img);
      poster.appendChild(stickerWrap);
      wrap.appendChild(poster);
      return wrap;
    }

    function pad(n) { return n < 10 ? '0' + n : '' + n; }

    /* ============================================================
       MOBILE: Tarjetas apiladas
    ============================================================ */
    var mobileContainer = document.getElementById('pf-cards-mobile');
    var isMobile = window.matchMedia('(max-width: 1023px)').matches;
    if (mobileContainer && isMobile) {
      PERFILES.forEach(function (perfil) {
        var card = el('div', 'pf-card-mobile');

        /* Póster */
        var poster = buildPoster(perfil);
        var posterWrap = el('div');
        posterWrap.style.setProperty('--pf-nivel-bg', 'var(' + perfil.bg + ')');
        posterWrap.style.setProperty('--pf-nivel-fg', 'var(' + perfil.fg + ')');
        posterWrap.appendChild(poster);

        /* Info */
        var info = el('div', 'pf-info');
        buildInfo(perfil, info);

        card.appendChild(posterWrap);
        card.appendChild(info);
        mobileContainer.appendChild(card);
      });

      /* IntersectionObserver para revelar tarjetas */
      if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        var io = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              io.unobserve(entry.target);
            }
          });
        }, { threshold: 0.12 });
        mobileContainer.querySelectorAll('.pf-card-mobile').forEach(function (c) { io.observe(c); });
      } else {
        mobileContainer.querySelectorAll('.pf-card-mobile').forEach(function (c) { c.classList.add('is-visible'); });
      }
    }

    /* ============================================================
       DESKTOP: Sticky scroll
    ============================================================ */
    var stickyWrap    = document.querySelector('.pf-sticky-wrap');
    var stickyHeight  = document.querySelector('.pf-sticky-height');
    var leftInner     = document.getElementById('pf-sticky-left-inner');
    var postersStack  = document.getElementById('pf-posters-stack');
    var navDotsList   = document.getElementById('pf-nav-dots');
    var glow          = document.getElementById('pf-glow');
    var progressBar   = document.getElementById('pf-progress');

    var isDesktop = window.matchMedia('(min-width: 1024px)').matches;
    if (!isDesktop || !stickyWrap || !leftInner || !postersStack) return;

    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var currentIdx = 0;
    var posterItems = [];

    /* Limpiar stack por si acaso */
    postersStack.innerHTML = '';
    posterItems = [];

    /* Insertar los 5 stickers en el stack (absolutos, apilados) */
    PERFILES.forEach(function (perfil, i) {
      var item = buildPoster(perfil);

      /* Accesibilidad */
      item.setAttribute('aria-hidden', i !== 0 ? 'true' : 'false');
      if (i !== 0) item.setAttribute('inert', '');

      postersStack.appendChild(item);
      posterItems.push(item);
    });

    /* Dar dimensiones al stack: ocupa todo el ancho disponible */
    function sizePosterStack() {
      var maxW = postersStack.parentElement.clientWidth * 0.95;
      postersStack.style.width  = maxW + 'px';
      postersStack.style.height = 'auto';
    }
    sizePosterStack();
    window.addEventListener('resize', sizePosterStack);

    /* Puntos de navegación */
    PERFILES.forEach(function (perfil, i) {
      var li = el('li');
      var btn = el('button', 'pf-nav-dot' + (i === 0 ? ' is-active' : ''));
      btn.setAttribute('aria-label', 'Ver perfil ' + perfil.nombre);
      var inner = el('span', 'pf-nav-dot__inner');
      btn.appendChild(inner);
      li.appendChild(btn);
      navDotsList.appendChild(li);

      btn.addEventListener('click', function () {
        if (!stickyHeight) return;
        var rect   = stickyHeight.getBoundingClientRect();
        var total  = stickyHeight.offsetHeight - window.innerHeight;
        var offset = (i / (PERFILES.length - 1)) * total;
        var target = window.scrollY + rect.top + offset;
        window.scrollTo({ top: target, behavior: 'smooth' });
      });
    });

    /* Renderizar estado de un sticker */
    function updatePosters(idx) {
      posterItems.forEach(function (item, i) {
        item.classList.remove('is-active');
        if (i === idx) {
          item.setAttribute('aria-hidden', 'false');
          item.removeAttribute('inert');
          item.classList.add('is-active');
        } else {
          item.setAttribute('aria-hidden', 'true');
          item.setAttribute('inert', '');
        }
      });

      /* Nav dots */
      var dots = navDotsList.querySelectorAll('.pf-nav-dot');
      dots.forEach(function (d, i) {
        d.classList.toggle('is-active', i === idx);
      });
    }

    /* Renderizar contenido izquierdo */
    function updateLeft(idx) {
      if (!reduced) {
        leftInner.classList.add('is-exiting');
      }
      function doSwap() {
        leftInner.textContent = '';
        leftInner.classList.remove('is-exiting');
        buildInfo(PERFILES[idx], leftInner);
        if (!reduced) {
          leftInner.classList.add('is-entering');
          requestAnimationFrame(function () {
            requestAnimationFrame(function () {
              leftInner.classList.remove('is-entering');
            });
          });
        }
      }
      if (!reduced) {
        setTimeout(doSwap, 200);
      } else {
        doSwap();
      }
    }

    /* Inicializar */
    updatePosters(0);
    buildInfo(PERFILES[0], leftInner);

    /* Scroll handler con RAF */
    var rafId = 0;
    var lastIdx = -1;
    var stickyTop = stickyHeight.getBoundingClientRect().top + window.pageYOffset;

    function onScroll() {
      if (rafId) return;
      rafId = requestAnimationFrame(function () {
        rafId = 0;
        if (!stickyHeight) return;

        var scrollY = window.pageYOffset;
        var total   = stickyHeight.offsetHeight - window.innerHeight;
        if (total <= 0) return;

        var progress = Math.max(0, Math.min(1, (scrollY - stickyTop) / total));
        var idx      = Math.min(PERFILES.length - 1, Math.floor(progress * PERFILES.length));

        /* Barra de progreso */
        var stickyPanel = document.getElementById('pf-sticky-panel');
        if (progressBar && stickyPanel) {
          var isVisible = scrollY >= stickyTop && scrollY < stickyTop + stickyHeight.offsetHeight;
          progressBar.classList.toggle('is-visible', isVisible);
          if (isVisible) {
            progressBar.style.width = (progress * 100).toFixed(1) + '%';
          }
        }

        if (idx === lastIdx) return;
        lastIdx = idx;
        currentIdx = idx;

        updatePosters(idx);
        updateLeft(idx);
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
})();
