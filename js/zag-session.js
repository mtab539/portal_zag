/* ============================================================
   PORTAL ZAG — Sesión compartida (muro.html y casos.html)
   Lee/escribe la sesión demo en localStorage bajo la clave
   "zag_session", siempre dentro de try/catch.
   Uso: window.ZAG_SESSION.read() | write({name, level}) | clear()
   ============================================================ */

window.ZAG_SESSION = (function () {
  'use strict';

  var LS_SESSION = 'zag_session';

  function read() {
    var raw = null;
    try { raw = window.localStorage.getItem(LS_SESSION); } catch (e) { /* sin storage */ }
    if (!raw) return null;
    try {
      var s = JSON.parse(raw);
      if (s && typeof s === 'object' && s.level) return s;
    } catch (e) { /* corrupto */ }
    return null;
  }

  function write(obj) {
    try { window.localStorage.setItem(LS_SESSION, JSON.stringify(obj)); } catch (e) { /* sin storage */ }
  }

  function clear() {
    try { window.localStorage.removeItem(LS_SESSION); } catch (e) { /* sin storage */ }
  }

  return { read: read, write: write, clear: clear, LS_KEY: LS_SESSION };
})();