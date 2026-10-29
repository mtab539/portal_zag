/* Botón flotante "volver al inicio" — solo móvil.
   Aparece cuando la persona llegó casi al final de la página. */
(function () {
  'use strict';
  if (!window.matchMedia) return;

  var css =
    '.zag-top{display:none}' +
    '@media (max-width:720px){' +
    '.zag-top{position:fixed;right:16px;bottom:16px;z-index:150;width:48px;height:48px;' +
    'display:flex;align-items:center;justify-content:center;border:2px solid #fff;border-radius:50%;' +
    'background:var(--color-cta,#fe5b00);color:#fff;cursor:pointer;' +
    'box-shadow:0 8px 20px rgba(4,29,173,.28);' +
    'opacity:0;visibility:hidden;transform:translateY(12px);' +
    'transition:opacity .25s ease,transform .25s ease,visibility .25s}' +
    '.zag-top.is-visible{opacity:1;visibility:visible;transform:none}' +
    '.zag-top svg{width:22px;height:22px}' +
    '.td-flotante ~ .zag-top{bottom:84px}' +
    '}';
  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  var btn;
  function build() {
    btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'zag-top';
    btn.setAttribute('aria-label', 'Volver al inicio de la página');
    btn.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M12 19V5"/><path d="M5 12l7-7 7 7"/></svg>';
    btn.addEventListener('click', function () {
      var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    });
    document.body.appendChild(btn);
  }

  var ticking = false;
  function update() {
    ticking = false;
    var doc = document.documentElement;
    var alFinal = window.innerHeight + window.pageYOffset >= doc.scrollHeight - 160;
    var hayScroll = doc.scrollHeight > window.innerHeight * 1.5;
    btn.classList.toggle('is-visible', alFinal && hayScroll);
  }
  function onScroll() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(update);
    }
  }

  function init() {
    build();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
