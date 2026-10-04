/* ============================================================
   PORTAL ZAG — Fuente única del estado del usuario
   Perfil, nivel, sellos y evidencias en localStorage.
   La usan todas las páginas del módulo de perfiles; el resto
   del portal sigue leyendo zag_session (se sincroniza aquí).

   API: ZagPerfil.get() · .nivel() · .sellosNivelActual()
        · .enviarEvidencia() · .aprobar() · .rechazar()
        · .subirNivelSiCorresponde() · .onChange(cb)
   ============================================================ */
window.ZagPerfil = (function () {
  'use strict';

  var D = window.ZAG_NIVELES;
  var KEY = { perfil: 'zag_perfil', sellos: 'zag_perfil_sellos', evid: 'zag_perfil_evidencias' };
  var listeners = [];
  var code = {};

  /* ---------- almacenamiento seguro ---------- */
  function read(k, fallback) {
    try { var v = JSON.parse(localStorage.getItem(k) || 'null'); return v == null ? fallback : v; }
    catch (e) { return fallback; }
  }
  function save(k, v) {
    try { localStorage.setItem(k, JSON.stringify(v)); return true; }
    catch (e) { return false; }
  }

  /* ---------- perfil ---------- */
  function get() { var p = read(KEY.perfil, null); return p && p.nombre && D.existe(p.nivel) ? p : null; }
  function hayPerfil() { return !!get(); }
  function nivel() { var p = get(); return p ? p.nivel : null; }
  function nivelIndice() { return D.indice(nivel()); }
  function nombre() { var p = get(); return p ? p.nombre : ''; }
  function primerNombre() { return nombre().trim().split(/\s+/)[0] || ''; }
  function iniciales() {
    return nombre().trim().split(/\s+/).slice(0, 2).map(function (w) { return w.charAt(0).toUpperCase(); }).join('') || 'Z';
  }

  function announce(ev) { listeners.slice().forEach(function (fn) { try { fn(ev); } catch (e) { /* listener */ } }); }
  function sync() {
    var p = get();
    if (p && window.ZAG_SESSION && window.ZAG_SESSION.sincronizarDesdePerfil) {
      window.ZAG_SESSION.sincronizarDesdePerfil({ name: p.nombre, level: p.nivel });
    }
  }

  function crear(data) {
    var now = new Date().toISOString();
    var p = {
      nombre: String(data.nombre || '').trim(),
      correo: String(data.correo || '').trim().toLowerCase(),
      rol: data.rol === 'egresado' ? 'egresado' : 'estudiante',
      semestre: data.rol === 'egresado' ? null : Number(data.semestre) || null,
      egreso: data.rol === 'egresado' ? Number(data.egreso) || null : null,
      foto: data.foto || '',
      nivel: 'rookie',
      creadoEn: now,
      historialNiveles: [{ nivel: 'rookie', fecha: now }],
    };
    if (!save(KEY.perfil, p)) return { ok: false, motivo: 'almacenamiento' };
    if (!read(KEY.sellos, null)) save(KEY.sellos, {});
    if (!read(KEY.evid, null)) save(KEY.evid, []);
    sync(); announce({ tipo: 'perfil', perfil: p });
    return { ok: true, perfil: p };
  }

  function actualizar(changes) {
    var p = get(); if (!p) return { ok: false };
    var limpio = {};
    if (changes.nombre !== undefined) limpio.nombre = String(changes.nombre).trim();
    if (changes.semestre !== undefined) limpio.semestre = Number(changes.semestre) || null;
    if (changes.egreso !== undefined) limpio.egreso = Number(changes.egreso) || null;
    if (changes.foto !== undefined) limpio.foto = changes.foto;
    Object.assign(p, limpio);
    save(KEY.perfil, p); sync(); announce({ tipo: 'perfil', perfil: p });
    return { ok: true, perfil: p };
  }

  /* ---------- sellos ---------- */
  function sellos() { var s = read(KEY.sellos, {}); return s && typeof s === 'object' ? s : {}; }
  function sellosDe(id) { var s = sellos()[id]; return Array.isArray(s) ? s : []; }
  function sellosNivelActual() { return sellosDe(nivel()); }
  function progreso() { return Math.min(6, sellosNivelActual().length); }

  function sumarSello(id, retoId, origen, sourceId) {
    var all = sellos();
    if (!Array.isArray(all[id])) all[id] = [];
    all[id].push({ retoId: retoId, fecha: new Date().toISOString(), origen: origen || 'reto', sourceId: sourceId || null });
    save(KEY.sellos, all);
    announce({ tipo: 'sello', nivel: id });
    return all[id].length;
  }

  /* Sello por cursos extraclase: si zag_sellos trae uno sin aplicar,
     suma 1 sello del nivel actual (solo CREATOR o superior). */
  function aplicarSelloCursos() {
    var p = get();
    if (!p || D.indice(p.nivel) < D.indice('creator')) return null;
    var source;
    try { source = JSON.parse(localStorage.getItem('zag_sellos') || '[]'); } catch (e) { source = []; }
    if (!Array.isArray(source)) return null;
    var all = sellos(), consumed = {};
    Object.keys(all).forEach(function (level) {
      (Array.isArray(all[level]) ? all[level] : []).forEach(function (stamp) {
        if (stamp.origen === 'cursos-extraclase' && stamp.sourceId) consumed[stamp.sourceId] = true;
      });
    });
    var item = source.filter(function (x) { return x && x.tipo === 'cursos-extraclase'; }).filter(function (x) {
      var id = x.id || [x.fecha || '', (x.cursos || []).join(',')].join('|'); return !consumed[id];
    })[0];
    if (!item) return null;
    var sourceId = item.id || [item.fecha || '', (item.cursos || []).join(',')].join('|');
    sumarSello(p.nivel, 'cursos-extraclase', 'cursos-extraclase', sourceId);
    return { aplicado: true, nivel: p.nivel, sourceId: sourceId };
  }

  /* ---------- evidencias ---------- */
  function evidencias() { var e = read(KEY.evid, []); return Array.isArray(e) ? e : []; }
  function evidenciaPorId(id) { return evidencias().filter(function (e) { return e.id === id; })[0] || null; }
  function evidenciasDe(retoId, id) { return evidencias().filter(function (e) { return e.retoId === retoId && e.nivel === id; }); }
  function pendienteDe(retoId, id) { return evidenciasDe(retoId, id).filter(function (e) { return e.estado === 'pendiente'; })[0] || null; }
  function aprobadosDe(retoId, id) { return evidenciasDe(retoId, id).filter(function (e) { return e.estado === 'aprobada'; }).length; }

  function enviarEvidencia(data) {
    if (!get()) return { ok: false, motivo: 'sin-perfil' };
    if (pendienteDe(data.retoId, data.nivel)) return { ok: false, motivo: 'pendiente' };
    var ev = {
      id: 'ev-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      nivel: data.nivel, retoId: data.retoId, img: data.img || '',
      nota: String(data.nota || '').slice(0, 140),
      estado: 'pendiente', fecha: new Date().toISOString(),
    };
    var all = evidencias(); all.unshift(ev);
    if (!save(KEY.evid, all) && ev.img) {
      /* Sin espacio: se guarda sin imagen y se avisa. */
      ev.img = ''; all[0] = ev;
      if (!save(KEY.evid, all)) return { ok: false, motivo: 'almacenamiento' };
    }
    announce({ tipo: 'evidencia', evidencia: ev });
    return { ok: true, evidencia: ev, aviso: ev.img || !data.img ? '' : 'sin-imagen' };
  }

  function setStatus(id, status) {
    var all = evidencias(), found = null;
    all = all.map(function (e) {
      if (e.id !== id) return e;
      found = Object.assign({}, e, { estado: status, revisadoEn: new Date().toISOString() });
      return found;
    });
    if (!found) return null;
    save(KEY.evid, all);
    if (status === 'aprobada') sumarSello(found.nivel, found.retoId, 'reto');
    else announce({ tipo: 'evidencia', evidencia: found });
    return found;
  }
  function aprobar(id) { return setStatus(id, 'aprobada'); }
  function rechazar(id) { return setStatus(id, 'rechazada'); }

  /* ---------- subida de nivel ---------- */
  function subirNivelSiCorresponde() {
    var p = get(), i = p ? D.indice(p.nivel) : -1;
    if (!p || i < 0 || i >= D.NIVELES.length - 1 || sellosDe(p.nivel).length < 6) return null;
    var from = p.nivel, to = D.NIVELES[i + 1], now = new Date().toISOString();
    p.nivel = to;
    p.historialNiveles.push({ nivel: to, fecha: now });
    save(KEY.perfil, p); sync();
    var event = { de: from, a: to, fecha: now, puntos: D.resumenDesbloqueos(to) };
    announce({ tipo: 'levelup', evento: event });
    return event;
  }

  /* ---------- historial y actividad ---------- */
  function historial() { var p = get(); return p && Array.isArray(p.historialNiveles) ? p.historialNiveles : []; }
  function actividad(n) {
    var out = [];
    evidencias().forEach(function (e) {
      var r = D.reto(e.nivel, e.retoId);
      var nombreReto = r ? r.nombre : (e.retoId === 'cursos-extraclase' ? '3 cursos extraclase' : 'un reto');
      out.push({
        fecha: e.revisadoEn || e.fecha,
        texto: (e.estado === 'aprobada' ? 'Sello aprobado: ' : e.estado === 'rechazada' ? 'Evidencia no aprobada: ' : 'Enviaste evidencia de ') + nombreReto,
      });
    });
    historial().slice(1).forEach(function (h) { out.push({ fecha: h.fecha, texto: 'Subiste a ' + D.nombre(h.nivel) }); });
    out.sort(function (a, b) { return String(b.fecha).localeCompare(String(a.fecha)); });
    return out.slice(0, n || 8);
  }

  /* ---------- código de verificación demo (sin contraseñas) ---------- */
  function generarCodigo(email) { code[email] = '482913'; return code[email]; }
  function comprobarCodigo(email, input) { return code[email] === String(input || '').replace(/\s/g, ''); }
  function perfilPorCorreo(email) {
    var p = get();
    return p && p.correo.toLowerCase() === String(email || '').toLowerCase() ? p : null;
  }

  /* ---------- imágenes (canvas, sin red) ---------- */
  function imageData(file) {
    return new Promise(function (resolve, reject) {
      if (!file || file.size > 5 * 1024 * 1024 || !/^image\//.test(file.type)) {
        reject(new Error(file && file.size > 5 * 1024 * 1024 ? 'peso' : 'tipo')); return;
      }
      var fr = new FileReader();
      fr.onerror = function () { reject(new Error('lectura')); };
      fr.onload = function () { resolve(String(fr.result)); };
      fr.readAsDataURL(file);
    });
  }
  function canvasImage(data, side, square) {
    return new Promise(function (resolve) {
      var img = new Image();
      img.onerror = function () { resolve(null); };
      img.onload = function () {
        var w = img.naturalWidth, h = img.naturalHeight;
        var size = square ? Math.min(w, h) : Math.min(1, side / Math.max(w, h));
        var c = document.createElement('canvas');
        c.width = square ? side : Math.max(1, Math.round(w * size));
        c.height = square ? side : Math.max(1, Math.round(h * size));
        var ctx = c.getContext('2d');
        if (!ctx) { resolve(null); return; }
        if (square) ctx.drawImage(img, (w - size) / 2, (h - size) / 2, size, size, 0, 0, side, side);
        else ctx.drawImage(img, 0, 0, c.width, c.height);
        try { resolve(c.toDataURL('image/jpeg', square ? 0.82 : 0.7)); } catch (e) { resolve(null); }
      };
      img.src = data;
    });
  }
  function reducir(data, side) { return canvasImage(data, side || 800, false); }
  function recortarCuadrado(data, side) { return canvasImage(data, side || 320, true); }
  function leerArchivo(file) { return imageData(file); }

  function onChange(fn) {
    listeners.push(fn);
    return function () { listeners = listeners.filter(function (x) { return x !== fn; }); };
  }

  function clear() {
    [KEY.perfil, KEY.sellos, KEY.evid, 'zag_session'].forEach(function (k) {
      try { localStorage.removeItem(k); } catch (e) { /* storage */ }
    });
  }

  return {
    LS: { PERFIL: KEY.perfil, SELLOS: KEY.sellos, EVID: KEY.evid, CURSOS: 'zag_sellos' },
    get: get, hayPerfil: hayPerfil, nivel: nivel, nivelIndice: nivelIndice,
    nombre: nombre, primerNombre: primerNombre, iniciales: iniciales,
    crear: crear, actualizar: actualizar,
    sellos: sellos, sellosDe: sellosDe, sellosNivelActual: sellosNivelActual,
    progreso: progreso, sumarSello: sumarSello, aplicarSelloCursos: aplicarSelloCursos,
    evidencias: evidencias, evidenciaPorId: evidenciaPorId, evidenciasDe: evidenciasDe,
    pendienteDe: pendienteDe, aprobadosDe: aprobadosDe,
    enviarEvidencia: enviarEvidencia, aprobar: aprobar, rechazar: rechazar,
    subirNivelSiCorresponde: subirNivelSiCorresponde,
    historial: historial, actividad: actividad, onChange: onChange,
    generarCodigo: generarCodigo, comprobarCodigo: comprobarCodigo, perfilPorCorreo: perfilPorCorreo,
    reducir: reducir, recortarCuadrado: recortarCuadrado, leerArchivo: leerArchivo,
    MAX_PESO: 5 * 1024 * 1024,
    reiniciar: clear,
  };
})();
