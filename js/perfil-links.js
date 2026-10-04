/* Navegación de acceso al perfil y chips de usuario en todo el portal. */
(function () {
  'use strict';
  var LS_PROFILE = 'zag_perfil';

  function perfilValido() {
    try {
      var p = JSON.parse(window.localStorage.getItem(LS_PROFILE) || 'null');
      return !!(p && p.nombre && /^(rookie|strategist|creator|master|senior)$/.test(p.nivel));
    } catch (e) { return false; }
  }

  function actualizarUnete() {
    var href = perfilValido() ? 'perfil.html' : 'registro.html';
    document.querySelectorAll('.header-unete').forEach(function (a) { a.href = href; });
    /* CTA primario del hero ("Ver mi perfil ZAG"): perfil si hay, registro si no */
    document.querySelectorAll('[data-cta-perfil]').forEach(function (a) { a.href = href; });
  }

  function prepararChips(root) {
    var scope = root && root.querySelectorAll ? root : document;
    scope.querySelectorAll('[id$="-session-chip"]').forEach(function (chip) {
      if (chip.dataset.profileLinkReady === 'true') return;
      chip.dataset.profileLinkReady = 'true';
      chip.classList.add('zag-profile-chip-link');
      chip.setAttribute('role', 'link');
      chip.setAttribute('tabindex', '0');
      chip.setAttribute('aria-label', 'Abrir mi perfil ZAG');
      chip.setAttribute('title', 'Abrir mi perfil ZAG');
      function go() { window.location.assign('perfil.html'); }
      chip.addEventListener('click', function (ev) {
        if (ev.target.closest('a, button, input, select, textarea')) return;
        go();
      });
      chip.addEventListener('keydown', function (ev) {
        if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); go(); }
      });
    });
  }

  function installStyle() {
    if (document.getElementById('zag-profile-chip-style')) return;
    var style = document.createElement('style');
    style.id = 'zag-profile-chip-style';
    style.textContent = '.zag-profile-chip-link{cursor:pointer}.zag-profile-chip-link:focus-visible{outline:3px solid var(--color-functional);outline-offset:3px}.unirme-profile-cta{display:flex;align-items:center;justify-content:space-between;gap:20px;margin:0 0 28px;padding:20px 24px;background:var(--color-black);color:var(--color-cream)}.unirme-profile-cta p{margin:0;font-weight:700;line-height:1.5}.unirme-profile-cta .btn{flex:0 0 auto}@media(max-width:560px){.unirme-profile-cta{align-items:flex-start;flex-direction:column;padding:18px}.unirme-profile-cta .btn{width:100%;text-align:center}}';
    document.head.appendChild(style);
  }

  function init() {
    installStyle();
    actualizarUnete();
    prepararChips(document);
    var observer = new MutationObserver(function (records) {
      actualizarUnete();
      records.forEach(function (record) {
        record.addedNodes.forEach(function (n) { if (n.nodeType === 1) prepararChips(n); });
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('storage', function (ev) {
      if (ev.key === LS_PROFILE || ev.key === 'zag_session') actualizarUnete();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
