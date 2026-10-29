/* ============================================================
   PORTAL ZAG — Header de sesión (todas las páginas)

   Estado en el header, en un solo lugar:

     · sin sesión      → botón "Únete"
     · perfil real     → [foto] NIVEL
     · modo demo       → [foto] NIVEL  demo  Salir

   - La foto es la del perfil real si existe en el navegador
     (zag_perfil.foto); si no, la inicial del nombre.
   - La etiqueta "demo" y el botón "Salir" solo aparecen cuando
     la sesión es de demostración (ver zag-session.js).
   - Los chips "NIVEL · demo" que cada página ponía junto a
     "Únete" se eliminaron: el header es la única ubicación
     donde se ve el estado de sesión.

   Se repinta solo cuando cambia el estado (hay un MutationObserver
   sobre todo el body, no hay que tocar el DOM sin necesidad).

   Uso: se auto-inicializa. Escucha el evento "zag:session" que
   dispara zag-session.js al entrar o salir de la demo.
   ============================================================ */
(function () {
  'use strict';

  var LS_PROFILE = 'zag_perfil';
  var LS_DEMO = 'zag_demo_perfil';

  var NIVEL_NOMBRES = {
    rookie: 'ROOKIE',
    strategist: 'STRATEGIST',
    creator: 'CREATOR',
    master: 'MASTER',
    senior: 'SENIOR'
  };

  function nivelNombre(nivel) {
    return NIVEL_NOMBRES[nivel] || String(nivel == null ? '' : nivel).toUpperCase();
  }

  function perfilCrudo(key) {
    var raw = null;
    try { raw = window.localStorage.getItem(key || LS_PROFILE); } catch (e) { return null; }
    if (!raw) return null;
    try {
      var p = JSON.parse(raw);
      if (p && typeof p === 'object' && p.nombre &&
          /^(rookie|strategist|creator|master|senior)$/.test(p.nivel)) return p;
    } catch (e) { /* corrupto */ }
    return null;
  }

  /* Sesión de demostración vigente. Prioridad de zag-session.js:
     demo en esta carga > perfil real > sesión persistida. */
  function sesionDemo() {
    var S = window.ZAG_SESSION;
    if (!S || !S.read) return null;
    var s = S.read();
    if (!s) return null;
    if (s.origen === 'demo') return s;
    if (s.origen === 'perfil') return null;
    if (!perfilCrudo()) return s;
    return null;
  }

  function estado() {
    var demo = sesionDemo();
    if (demo) {
      /* La foto de la demo es la que la persona puso en la demo, no la del perfil real. */
      var p = perfilCrudo(LS_DEMO);
      return {
        tipo: 'demo',
        nivel: demo.level,
        nombre: demo.name || 'Tú',
        foto: p && typeof p.foto === 'string' ? p.foto : '',
        semestre: p ? Number(p.semestre) || null : null,
        egresado: !!(p && p.rol === 'egresado')
      };
    }

    var perfil = perfilCrudo();
    if (!perfil) return null;
    return {
      tipo: 'perfil',
      nivel: perfil.nivel,
      nombre: perfil.nombre,
      foto: typeof perfil.foto === 'string' ? perfil.foto : '',
      semestre: Number(perfil.semestre) || null,
      egresado: perfil.rol === 'egresado'
    };
  }

  /* Foto del perfil activo (demo o real) para que cualquier avatar del
     portal que represente a la persona la muestre en vez de su inicial.
     Uso: ZAG_FOTO.url() → string ('' si no hay foto)
          ZAG_FOTO.aplicar(nodo) → true si puso la foto dentro del nodo. */
  /* Semestre del perfil activo con el formato de las tarjetas de proyectos:
     '5° sem', 'Egresado' o 'Estudiante' si el perfil no trae semestre. */
  window.ZAG_SEMESTRE = {
    texto: function () {
      var est = estado();
      if (est && est.egresado) return 'Egresado';
      if (est && est.semestre) return est.semestre + '° sem';
      return 'Estudiante';
    }
  };

  window.ZAG_FOTO = {
    url: function () {
      var est = estado();
      return est && est.foto ? est.foto : '';
    },
    aplicar: function (nodo) {
      var url = this.url();
      if (!nodo || !url) return false;
      nodo.textContent = '';
      var img = document.createElement('img');
      img.className = 'zag-foto-img';
      img.src = url;
      img.alt = '';
      nodo.classList.add('tiene-foto');
      nodo.appendChild(img);
      return true;
    }
  };

  function claveDe(est) {
    if (!est) return 'sin-sesion';
    return est.tipo + '|' + est.nivel + '|' + (est.foto ? 'foto-' + est.foto.length : est.nombre);
  }

  function nodo(tag, clase, texto) {
    var n = document.createElement(tag);
    if (clase) n.className = clase;
    if (texto != null) n.textContent = texto;
    return n;
  }

  function crearPill(est) {
    var box = nodo('div', 'zag-user');
    box.setAttribute('data-tipo', est.tipo);
    box.setAttribute('data-nivel', est.nivel);

    var link = nodo('a', 'zag-user__link');
    link.href = 'perfil.html';
    link.setAttribute('aria-label', 'Mi perfil ZAG · nivel ' + nivelNombre(est.nivel));
    link.setAttribute('title', 'Mi perfil ZAG');

    var foto = nodo('span', 'zag-user__foto');
    if (est.foto) {
      var img = document.createElement('img');
      img.src = est.foto;
      img.alt = '';
      foto.appendChild(img);
    } else {
      foto.classList.add('zag-user__foto--inicial');
      foto.textContent = (est.nombre || 'Z').replace(/^\s+|\s+$/g, '').charAt(0).toUpperCase() || 'Z';
    }

    link.appendChild(foto);
    link.appendChild(nodo('span', 'zag-user__nivel', nivelNombre(est.nivel)));

    if (est.tipo === 'demo') link.appendChild(nodo('span', 'zag-user__demo', 'demo'));

    box.appendChild(link);

    if (est.tipo === 'demo') {
      var salir = nodo('button', 'zag-user__salir', 'Salir');
      salir.type = 'button';
      salir.setAttribute('aria-label', 'Salir de la demo');
      salir.addEventListener('click', function () {
        if (window.ZAG_SESSION && window.ZAG_SESSION.clear) window.ZAG_SESSION.clear();
        window.location.assign('registro.html');
      });
      box.appendChild(salir);
    }

    return box;
  }

  function pintar() {
    var est = estado();
    var clave = claveDe(est);
    var pills = document.querySelectorAll('.zag-user');

    /* Sin cambio de estado no se toca el DOM: el observer de
       mutaciones vuelve a llamar aquí en cada render de la página. */
    if (pintar.clave === clave &&
        ((est && pills.length > 0) || (!est && pills.length === 0))) return;
    pintar.clave = clave;

    document.querySelectorAll('.header-unete').forEach(function (a) {
      var cont = a.parentNode;
      if (!cont) return;

      var vieja = cont.querySelector('.zag-user');
      if (vieja) vieja.remove();

      if (!est) {
        a.hidden = false;
        a.href = 'registro.html';
        return;
      }

      a.hidden = true;
      cont.appendChild(crearPill(est));
    });

    var href = est ? 'perfil.html' : 'registro.html';
    document.querySelectorAll('[data-cta-perfil]').forEach(function (a) { a.href = href; });
  }

  function installStyle() {
    if (document.getElementById('zag-user-style')) return;
    var style = document.createElement('style');
    style.id = 'zag-user-style';
    style.textContent = [
      /* el atributo hidden debe ganar al display inline-flex de .btn */
      '.header-unete[hidden]{display:none !important}',
      /* contenedor del estado de sesión: siempre al final del header,
         en todas las páginas (las que no traían regla para esto) */
      '.header-right{order:3;display:flex;align-items:center;gap:10px;flex-shrink:0}',
      '.zag-user{display:flex;align-items:center;gap:8px;order:3;flex-shrink:0;padding:4px 8px 4px 4px;background:var(--color-white);border:1px solid var(--color-border);border-radius:999px;box-shadow:0 2px 12px rgba(0,0,0,.06)}',
      '.zag-user__link{display:inline-flex;align-items:center;gap:8px;min-width:0;text-decoration:none;color:inherit}',
      '.zag-user__foto{display:grid;place-items:center;width:34px;height:34px;flex:none;border-radius:50%;overflow:hidden;background:#c0ccff;color:var(--color-brand-deep);font-size:.85rem;font-weight:800;line-height:1}',
      '.zag-user__foto img{display:block;width:100%;height:100%;object-fit:cover}',
      '.zag-foto-img{display:block;width:100%;height:100%;object-fit:cover;border-radius:inherit}',
      '.tiene-foto{overflow:hidden;padding:0}',
      /* el icono lleva el color de su nivel (mismos tokens que perfil-data.js) */
      '.zag-user[data-nivel=rookie] .zag-user__foto{background:var(--color-cream);color:var(--color-black);box-shadow:inset 0 0 0 1.5px var(--color-text-muted)}',
      '.zag-user[data-nivel=strategist] .zag-user__foto{background:var(--color-light-blue);color:var(--color-brand-deep)}',
      '.zag-user[data-nivel=creator] .zag-user__foto{background:var(--color-cta);color:var(--color-white)}',
      '.zag-user[data-nivel=master] .zag-user__foto{background:var(--color-functional);color:var(--color-white)}',
      '.zag-user[data-nivel=senior] .zag-user__foto{background:var(--color-black);color:var(--color-cream)}',
      '.zag-user[data-nivel=rookie] .zag-user__foto:has(img){box-shadow:0 0 0 2px var(--color-text-muted)}',
      '.zag-user[data-nivel=strategist] .zag-user__foto:has(img){box-shadow:0 0 0 2px var(--color-light-blue)}',
      '.zag-user[data-nivel=creator] .zag-user__foto:has(img){box-shadow:0 0 0 2px var(--color-cta)}',
      '.zag-user[data-nivel=master] .zag-user__foto:has(img){box-shadow:0 0 0 2px var(--color-functional)}',
      '.zag-user[data-nivel=senior] .zag-user__foto:has(img){box-shadow:0 0 0 2px var(--color-black)}',
      '.zag-user__nivel{font-size:.74rem;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--color-black);white-space:nowrap}',
      '.zag-user__demo{padding:4px 9px;border-radius:999px;background:#c0ccff;color:var(--color-brand-deep);font-size:.62rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase;white-space:nowrap}',
      '.zag-user__salir{border:0;background:none;padding:2px 4px;color:var(--color-cta);font-size:.76rem;font-weight:800;cursor:pointer;white-space:nowrap}',
      '.zag-user__salir:hover{text-decoration:underline}',
      '@media(min-width:720px){.zag-user{order:0;justify-self:end}.header-right{justify-self:end}}',
      '@media(max-width:719px){.header-right{gap:6px}.zag-user{gap:5px;padding:3px 6px 3px 3px}.zag-user__foto{width:28px;height:28px;font-size:.72rem}.zag-user__nivel{font-size:.7rem}.zag-user__demo{padding:3px 7px;font-size:.625rem;letter-spacing:.06em}.zag-user__salir{font-size:.72rem;padding:9px 4px;margin:-7px 0}}',
    ].join('');
    document.head.appendChild(style);
  }

  function init() {
    installStyle();
    pintar();

    window.addEventListener('zag:session', pintar);

    var observer = new MutationObserver(function () { pintar(); });
    observer.observe(document.body, { childList: true, subtree: true });

    window.addEventListener('storage', function (ev) {
      if (ev.key === LS_PROFILE || ev.key === LS_DEMO || ev.key === 'zag_session') pintar();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
