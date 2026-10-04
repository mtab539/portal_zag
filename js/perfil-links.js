/* Navegación de acceso al perfil y chips de usuario en todo el portal. */
(function () {
  'use strict';
  var LS_PROFILE = 'zag_perfil';

  var NIVEL_NOMBRES = {
    rookie: 'ROOKIE', strategist: 'STRATEGIST', creator: 'CREATOR',
    master: 'MASTER', senior: 'SENIOR'
  };

  function perfilValido() {
    try {
      var p = JSON.parse(window.localStorage.getItem(LS_PROFILE) || 'null');
      return !!(p && p.nombre && /^(rookie|strategist|creator|master|senior)$/.test(p.nivel));
    } catch (e) { return false; }
  }

  function sesionDemo() {
    var S = window.ZAG_SESSION;
    if (!S) return null;
    var s = S.read();
    if (!s) return null;
    if (s.origen === 'demo') return s;
    if (s.origen === 'perfil') return null;
    if (!perfilValido()) return s;
    return null;
  }

  function renderDemoBar() {
    document.querySelectorAll('.header-unete').forEach(function (a) {
      var demo = sesionDemo();
      var existing = a.parentNode.querySelector('.demo-header-bar');

      if (!demo) {
        if (existing) existing.remove();
        a.hidden = false;
        return;
      }

      a.hidden = true;
      if (existing) {
        var badge = existing.querySelector('.demo-header__nivel');
        if (badge) badge.textContent = NIVEL_NOMBRES[demo.level] || demo.level;
        return;
      }

      var bar = document.createElement('div');
      bar.className = 'demo-header-bar';

      var initial = (demo.name || 'T').charAt(0).toUpperCase();
      var avatar = document.createElement('span');
      avatar.className = 'demo-header__avatar';
      avatar.textContent = initial;

      var name = document.createElement('span');
      name.className = 'demo-header__name';
      name.textContent = 'Tú';

      var nivel = document.createElement('span');
      nivel.className = 'demo-header__nivel';
      nivel.textContent = NIVEL_NOMBRES[demo.level] || demo.level;

      var salir = document.createElement('button');
      salir.className = 'demo-header__salir';
      salir.type = 'button';
      salir.textContent = 'Salir de la demo';
      salir.addEventListener('click', function () {
        if (window.ZAG_SESSION) window.ZAG_SESSION.clear();
        window.location.assign('registro.html');
      });

      bar.appendChild(avatar);
      bar.appendChild(name);
      bar.appendChild(nivel);
      bar.appendChild(salir);
      a.parentNode.appendChild(bar);
    });
  }

  function actualizarUnete() {
    var demo = sesionDemo();
    if (demo) {
      renderDemoBar();
      return;
    }
    renderDemoBar();
    var href = perfilValido() ? 'perfil.html' : 'registro.html';
    document.querySelectorAll('.header-unete').forEach(function (a) { a.href = href; });
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
    style.textContent = [
      '.zag-profile-chip-link{cursor:pointer}',
      '.zag-profile-chip-link:focus-visible{outline:3px solid var(--color-functional);outline-offset:3px}',
      '.unirme-profile-cta{display:flex;align-items:center;justify-content:space-between;gap:20px;margin:0 0 28px;padding:20px 24px;background:var(--color-black);color:var(--color-cream)}',
      '.unirme-profile-cta p{margin:0;font-weight:700;line-height:1.5}',
      '.unirme-profile-cta .btn{flex:0 0 auto}',
      '@media(max-width:560px){.unirme-profile-cta{align-items:flex-start;flex-direction:column;padding:18px}.unirme-profile-cta .btn{width:100%;text-align:center}}',
      '.demo-header-bar{display:flex;align-items:center;gap:12px;padding:7px 18px 7px 7px;background:var(--color-white);border-radius:999px;order:3;flex-shrink:0;box-shadow:0 2px 12px rgba(0,0,0,.08),0 0 0 1px rgba(0,0,0,.04)}',
      '.demo-header__avatar{display:grid;place-items:center;width:36px;height:36px;border-radius:50%;background:#c0ccff;color:var(--color-brand-deep);font-size:.9rem;font-weight:800;line-height:1}',
      '.demo-header__name{font-size:.95rem;font-weight:700;color:var(--color-text)}',
      '.demo-header__nivel{padding:5px 14px;border-radius:999px;background:#c0ccff;color:var(--color-brand-deep);font-size:.72rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase}',
      '.demo-header__salir{background:none;border:none;color:var(--color-cta);font-size:.85rem;font-weight:800;cursor:pointer;padding:4px 4px;white-space:nowrap}',
      '.demo-header__salir:hover{text-decoration:underline}',
      '@media(max-width:640px){.demo-header-bar{gap:8px;padding:5px 12px 5px 5px}.demo-header__avatar{width:30px;height:30px;font-size:.78rem}.demo-header__name{display:none}.demo-header__salir{font-size:.76rem}}',
    ].join('');
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
