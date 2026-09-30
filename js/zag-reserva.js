/* ============================================================
   PORTAL ZAG — Soporte compartido de reservas (js/zag-reserva.js)
   Helper único para armar el enlace de "Agregar a Google Calendar"
   que usan Fogatas ZAG y el Seminario Somos ZAG, para no duplicar
   lógica ni perder el comportamiento exacto de cada evento.
   No toca localStorage ni el DOM: es puro cálculo de URL.
   ============================================================ */

window.ZAG_RESERVA = (function () {
  'use strict';

  /*
   * buildGoogleCalendarUrl(p) -> url
   * p.text      Texto/resumen del evento (ej. "Somos ZAG · Día 1").
   * p.dates     Rango ya estampado, ej. "20261112T090000/20261112T105000".
   *             Para un día completo usar "20261112/20261113" (fin exclusivo).
   * p.details   Detalles.
   * p.location  Lugar.
   * p.ctz       Zona horaria, ej. "America/Bogota".
   */
  function buildGoogleCalendarUrl(p) {
    var params = new URLSearchParams();
    params.set('action', 'TEMPLATE');
    params.set('text', p && p.text ? p.text : '');
    params.set('dates', p && p.dates ? p.dates : '');
    params.set('details', p && p.details ? p.details : '');
    params.set('location', p && p.location ? p.location : '');
    if (p && p.ctz) params.set('ctz', p.ctz);
    return 'https://calendar.google.com/calendar/render?' + params.toString();
  }

  return {
    buildGoogleCalendarUrl: buildGoogleCalendarUrl
  };
})();