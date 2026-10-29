/* ============================================================
   PORTAL ZAG — Rendimiento
   Las imágenes creadas desde JS (tarjetas, avatares, productos…)
   cargan en diferido y se decodifican fuera del hilo principal,
   igual que las del HTML. Debe cargarse antes que el resto de scripts.
   ============================================================ */
(function () {
  'use strict';
  var crear = document.createElement;
  document.createElement = function (tag, opciones) {
    var nodo = crear.call(document, tag, opciones);
    if (typeof tag === 'string' && tag.toLowerCase() === 'img') {
      nodo.loading = 'lazy';
      nodo.decoding = 'async';
    }
    return nodo;
  };
})();
