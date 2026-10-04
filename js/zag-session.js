/* ============================================================
   PORTAL ZAG — Sesión compartida (todas las páginas)
   Sesión = perfil real (zag_perfil) o atajo de demostración.

   Prioridad al leer:
     1. Atajo demo elegido en ESTA carga (solo en memoria)
     2. Perfil real de zag_perfil
     3. Sesión persistida en zag_session (compatibilidad)

   El demo pisa solo la sesión: nunca toca zag_perfil ni los
   sellos. Al recargar, si hay perfil real, vuelve a mandar el
   perfil. Por eso el override vive en memoria, no en storage.

   Cerrar sesión borra perfil, sellos, evidencias y sesión.

   Uso: window.ZAG_SESSION.read() | write({name, level}) | clear()
   ============================================================ */

window.ZAG_SESSION = (function () {
  'use strict';

  var LS_SESSION = 'zag_session';
  var LS_PERFIL = 'zag_perfil';

  /* Atajo demo de esta carga. Se pierde al recargar: es el
     comportamiento pedido para que un perfil real vuelva a mandar. */
  var demoEnMemoria = null;

  function perfilCrudo() {
    var raw = null;
    try { raw = window.localStorage.getItem(LS_PERFIL); } catch (e) { return null; }
    if (!raw) return null;
    try {
      var p = JSON.parse(raw);
      if (p && typeof p === 'object' && p.nombre) return p;
    } catch (e) { /* corrupto */ }
    return null;
  }

  function valida(s) {
    /* level 0 (Rookie) es válido: no usar truthiness, si no una
       sesión de Rookie se lee como si no hubiera sesión. */
    if (s && typeof s === 'object' && s.level !== undefined && s.level !== null) return s;
    return null;
  }

  function sesionPersistida() {
    var raw = null;
    try { raw = window.localStorage.getItem(LS_SESSION); } catch (e) { return null; }
    if (!raw) return null;
    try { return valida(JSON.parse(raw)); } catch (e) { return null; }
  }

  function read() {
    if (demoEnMemoria) return demoEnMemoria;

    var p = perfilCrudo();
    if (p && p.nivel) return { name: p.nombre, level: p.nivel, origen: 'perfil' };

    return sesionPersistida();
  }

  /* Atajo de demostración. Solo sesión. */
  function write(obj) {
    var s = valida(obj);
    if (!s) return;
    demoEnMemoria = { name: s.name, level: s.level, origen: 'demo' };
    try { window.localStorage.setItem(LS_SESSION, JSON.stringify({ name: s.name, level: s.level })); }
    catch (e) { /* sin storage */ }
  }

  /* Escritura desde el perfil real: limpia cualquier override de
     demo para que el perfil mande de inmediato. Solo lo usa
     ZagPerfil. */
  function sincronizarDesdePerfil(obj) {
    demoEnMemoria = null;
    var s = valida(obj);
    if (!s) return;
    try { window.localStorage.setItem(LS_SESSION, JSON.stringify({ name: s.name, level: s.level })); }
    catch (e) { /* sin storage */ }
  }

  /* Cerrar sesión: se va el perfil entero, no solo la sesión. */
  function clear() {
    demoEnMemoria = null;
    try { window.localStorage.removeItem(LS_SESSION); } catch (e) { /* sin storage */ }
    try {
      window.localStorage.removeItem(LS_PERFIL);
      window.localStorage.removeItem('zag_perfil_sellos');
      window.localStorage.removeItem('zag_perfil_evidencias');
    } catch (e) { /* sin storage */ }
  }

  return {
    read: read,
    write: write,
    clear: clear,
    sincronizarDesdePerfil: sincronizarDesdePerfil,
    LS_KEY: LS_SESSION,
  };
})();