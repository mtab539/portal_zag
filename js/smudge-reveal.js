/* ============================================================
   PORTAL ZAG — Hero "Smudge Reveal" (Proyectos fuera del ZIG)
   Módulo independiente. Traduce la referencia React (gooey
   mask reveal) a vanilla, sin dependencias. Se inicializa solo
   sobre .smudge-root y expone initSmudgeReveal(root) por si
   se quiere reiniciar. Con prefers-reduced-motion o sin soporte
   de máscara SVG cae a una versión estática.
   ============================================================ */

(function () {
  'use strict';

  var S = 'http://www.w3.org/2000/svg';
  var NS = 'http://www.w3.org/2000/svg';

  /* constantes de la referencia original */
  var SMOOTHING = 0.1;
  var SPEED_THRESHOLD = 0.01;
  var SIZE_FROM_SPEED = 0.34;
  var EXPAND_MULT = 2.6;
  var EXPAND_MS = 2000;
  var DISSOLVE_START = 3200;
  var DISSOLVE_MS = 4200;
  var MAX_BLOBS = 60;
  var MIN_STEP = 5; /* px: distancia mínima entre manchas para no saturar */
  var TAP_RATIO = 0.18; /* radio del toque simple: 18% del lado menor */
  var TAP_MIN = 24;

  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function smoothstep(t) { t = clamp01(t); return t * t * (3 - 2 * t); }
  function power3in(t) { t = clamp01(t); return t * t * t; }

  function supportsMask() {
    if (!window.CSS || !CSS.supports) return true;
    return CSS.supports('mask-image', 'url(#x)') ||
      CSS.supports('-webkit-mask-image', 'url(#x)');
  }

  function initSmudgeReveal(rootEl) {
    if (!rootEl) return null;

    rootEl.classList.add('smudge-root');
    var layerBack = rootEl.querySelector('.smudge-back');
    var svg = rootEl.querySelector('.smudge-svg');
    var maskG = rootEl.querySelector('#zag-smudge-blobs');
    var filterEl = rootEl.querySelector('#zag-smudge-goo');
    var maskEl = rootEl.querySelector('#zag-smudge-mask');
    var phraseVisual = rootEl.querySelector('.smudge-frase-visual');
    var phraseSr = rootEl.querySelector('.smudge-frase-sr');
    var hintEl = rootEl.querySelector('.smudge-hint');
    var hintTouch = rootEl.querySelector('.smudge-hint--touch');

    var reduce = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---- fallback estático: reduced-motion o sin máscara SVG ---- */
    function staticMode() {
      rootEl.classList.add('is-static');
      if (phraseSr) phraseSr.classList.add('is-hidden');
      if (phraseVisual) phraseVisual.removeAttribute('aria-hidden');
      if (hintEl) hintEl.setAttribute('aria-hidden', 'true');
      if (hintTouch) hintTouch.setAttribute('aria-hidden', 'true');
      if (svg) svg.setAttribute('aria-hidden', 'true');
    }

    if (reduce || !supportsMask() || !maskG || !svg) {
      staticMode();
      return null;
    }

    /* ---- dimensión del SVG = tamaño de la sección ---- */
    var w = 0, h = 0;
    function size() {
      var rect = rootEl.getBoundingClientRect();
      w = Math.max(1, Math.round(rect.width));
      h = Math.max(1, Math.round(rect.height));
      svg.setAttribute('width', w);
      svg.setAttribute('height', h);
      svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
      if (maskEl) {
        maskEl.setAttribute('x', '0');
        maskEl.setAttribute('y', '0');
        maskEl.setAttribute('width', w);
        maskEl.setAttribute('height', h);
      }
      if (filterEl) {
        filterEl.setAttribute('x', '-200');
        filterEl.setAttribute('y', '-200');
        filterEl.setAttribute('width', w + 400);
        filterEl.setAttribute('height', h + 400);
      }
    }
    size();
    if ('ResizeObserver' in window) {
      new ResizeObserver(size).observe(rootEl);
    } else {
      window.addEventListener('resize', size);
    }

    /* ---- estado del puntero ---- */
    var target = { x: 0, y: 0 };
    var smooth = { x: 0, y: 0 };
    var hasPoint = false;
    var moved = false;
    var pendingR0 = 10;
    var lastSpawn = { x: 0, y: 0 };
    var lastMoveT = 0;
    var prev = { x: 0, y: 0 };

    var blobs = [];

    function relX(clientX) { return clientX - rootEl.getBoundingClientRect().left; }
    function relY(clientY) { return clientY - rootEl.getBoundingClientRect().top; }

    function spawn(x, y, r0) {
      if (blobs.length >= MAX_BLOBS) {
        var old = blobs.shift();
        if (old.node && old.node.parentNode) old.node.parentNode.removeChild(old.node);
      }
      var c = document.createElementNS(S, 'circle');
      c.setAttribute('cx', x);
      c.setAttribute('cy', y);
      c.setAttribute('r', r0);
      c.setAttribute('fill', '#ffffff');
      c.setAttribute('fill-opacity', '1');
      maskG.appendChild(c);
      blobs.push({ node: c, x: x, y: y, r0: r0, t0: performance.now() });
      lastSpawn.x = x; lastSpawn.y = y;
    }

    function onMove(e) {
      var x, y;
      if (e.touches && e.touches.length) { x = e.touches[0].clientX; y = e.touches[0].clientY; }
      else { x = e.clientX; y = e.clientY; }
      target.x = relX(x); target.y = relY(y);
      if (!hasPoint) {
        hasPoint = true; smooth.x = target.x; smooth.y = target.y;
        prev.x = target.x; prev.y = target.y; lastMoveT = performance.now();
      }
      var now = performance.now();
      var dt = Math.max(1, now - lastMoveT);
      var dx = target.x - prev.x, dy = target.y - prev.y;
      var dist = Math.sqrt(dx * dx + dy * dy);
      var speed = dist / dt; /* px por ms */
      prev.x = target.x; prev.y = target.y; lastMoveT = now;
      moved = true;
      if (speed > SPEED_THRESHOLD) {
        pendingR0 = Math.max(14, Math.min(72, dist * SIZE_FROM_SPEED + 16));
      }
    }

    /* toque simple: estampa una mancha grande */
    function onTouchStart(e) {
      if (!e.touches || !e.touches.length) return;
      var t = e.touches[0];
      var x = relX(t.clientX), y = relY(t.clientY);
      var side = Math.min(w, h);
      var r = Math.max(TAP_MIN, side * TAP_RATIO);
      spawn(x, y, r);
    }

    function frame(now) {
      smooth.x += (target.x - smooth.x) * SMOOTHING;
      smooth.y += (target.y - smooth.y) * SMOOTHING;

      if (moved) {
        moved = false;
        var ddx = smooth.x - lastSpawn.x, ddy = smooth.y - lastSpawn.y;
        if (Math.sqrt(ddx * ddx + ddy * ddy) >= MIN_STEP) {
          spawn(smooth.x, smooth.y, pendingR0);
        }
      }

      var keep = [];
      for (var i = 0; i < blobs.length; i++) {
        var b = blobs[i];
        var age = now - b.t0;
        if (age >= DISSOLVE_START + DISSOLVE_MS) {
          if (b.node && b.node.parentNode) b.node.parentNode.removeChild(b.node);
          continue;
        }
        keep.push(b);
        if (age < EXPAND_MS) {
          var rp = smoothstep(age / EXPAND_MS);
          b.node.setAttribute('r', b.r0 * (1 + EXPAND_MULT * rp));
          b.node.setAttribute('fill-opacity', '1');
        } else {
          b.node.setAttribute('r', b.r0 * (1 + EXPAND_MULT));
          var dp = power3in((age - DISSOLVE_START) / DISSOLVE_MS);
          b.node.setAttribute('fill-opacity', String(1 - dp));
        }
      }
      blobs = keep;
      rafId = requestAnimationFrame(frame);
    }

    /* ---- listeners ---- */
    rootEl.addEventListener('mousemove', onMove);
    rootEl.addEventListener('touchstart', onTouchStart, { passive: true });
    rootEl.addEventListener('touchmove', onMove, { passive: true });

    /* pista: cursor en desktop, dedo en mobile */
    var coarse = window.matchMedia && window.matchMedia('(hover: none)').matches;
    if (coarse) {
      if (hintEl) hintEl.setAttribute('aria-hidden', 'true');
      if (hintTouch) hintTouch.removeAttribute('aria-hidden');
    }

    /* ---- pausa el loop si no se ve o la pestaña está oculta ---- */
    var visible = true;
    var pageVisible = !document.hidden;
    var rafId = 0;

    function running() { return visible && pageVisible; }

    function start() {
      if (running() && !rafId) rafId = requestAnimationFrame(frame);
    }
    function stop() {
      if (rafId) { cancelAnimationFrame(rafId); rafId = 0; }
    }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        if (visible) start(); else stop();
      }, { threshold: 0.01 }).observe(rootEl);
    }
    document.addEventListener('visibilitychange', function () {
      pageVisible = !document.hidden;
      if (pageVisible) start(); else stop();
    });

    start();

    return { stop: stop, start: start };
  }

  window.SmudgeReveal = { init: initSmudgeReveal, supportsMask: supportsMask };

  document.addEventListener('DOMContentLoaded', function () {
    var el = document.querySelector('.smudge-root');
    if (el) initSmudgeReveal(el);
  });
})();
