/* ============================================================
   PORTAL ZAG — Cursos Extraclase · certificado (certificado.html)
   ------------------------------------------------------------
   Emite el certificado A4 de un curso terminado, deja fijar el
   nombre y verifica códigos. Todo el estado vive en
   js/cursos-progreso.js; acá solo se pinta y se imprime.
   ============================================================ */

(function () {
  'use strict';

  var Z = window.ZagCursos;
  var UI = {};

  var state = {
    curso: null,
    cert: null,
  };

  /* ---------- helpers ---------- */
  function $(id) { return document.getElementById(id); }

  function el(tag, clase, texto) {
    var n = document.createElement(tag);
    if (clase) n.className = clase;
    if (texto !== undefined && texto !== null) n.textContent = String(texto);
    return n;
  }

  function txt(id, valor) {
    var n = $(id);
    if (n) n.textContent = valor === null || valor === undefined ? '' : String(valor);
  }

  function t(grupo, clave, vars, porDefecto) {
    var bloque = UI[grupo] || {};
    return Z.txt(bloque[clave] !== undefined ? bloque[clave] : porDefecto, vars);
  }

  function anunciar(mensaje) {
    var vivo = $('cert-vivo');
    if (vivo) vivo.textContent = mensaje;
  }

  /* ---------- estado bloqueado ---------- */
  function renderBloqueado() {
    var curso = state.curso;
    var faltan = Z.totalLecciones(curso) - Z.progreso(curso.id).lecciones.length;
    var quizzes = Z.totalQuizzes(curso) - Z.quizzesAprobados(curso.id);

    txt('cert-locked-title', UI.certificado.sinTerminar);
    txt('cert-locked-copy', t('certificado', 'sinTerminarCopia', { n: faltan, q: quizzes }));
    var back = $('cert-locked-back');
    if (back) back.href = 'curso.html?id=' + encodeURIComponent(curso.id);

    $('cert-locked').hidden = false;
    $('cert-zona').hidden = true;
    document.title = UI.certificado.sinTerminar + ' - Portal ZAG';
  }

  /* ---------- la hoja ---------- */
  function renderCertificado() {
    var cert = state.cert;
    var curso = state.curso;
    var C = UI.certificado;

    txt('cert-portal', C.portalLine);
    txt('cert-kicker', C.kicker);
    txt('cert-se', C.seCertifica);
    txt('cert-sheet-name', cert.nombre);
    txt('cert-sheet-curso', curso.titulo);
    txt('cert-sheet-copy', C.completo);

    txt('cert-fact-duracion-label', C.duracion);
    txt('cert-fact-duracion', cert.horasTexto + ' h');
    txt('cert-fact-modulos-label', C.modulos);
    txt('cert-fact-modulos', String(cert.modulos));
    txt('cert-fact-fecha-label', C.fecha);
    txt('cert-fact-fecha', cert.fechaTexto);

    var firma = String(C.firmaDirector || '').split('·');
    txt('cert-sign-name', (firma[0] || '').trim());
    txt('cert-sign-role', (firma.slice(1).join('·') || '').trim());

    var codigo = $('cert-code');
    codigo.textContent = C.codigo + ': ' + cert.codigo;

    var back = $('cert-back');
    if (back) back.href = 'curso.html?id=' + encodeURIComponent(curso.id);
    var lockedBack = $('cert-locked-back');
    if (lockedBack) lockedBack.href = 'curso.html?id=' + encodeURIComponent(curso.id);

    document.title = C.kicker + ' - ' + curso.titulo + ' - Portal ZAG';

    txt('cert-name-title', C.nombreTitulo);
    txt('cert-name-copy', C.nombreCopia);
    txt('cert-name-label', C.nombreLabel);
    txt('cert-name-cta', C.nombreCta);

    var input = $('cert-name-input');
    if (input && document.activeElement !== input) input.value = cert.nombre;
    txt('cert-name-default', t('certificado', 'nombrePorDefecto', { nombre: Z.nombreSesion() || cert.nombre }));
  }

  function renderTodo() {
    var curso = state.curso;
    state.cert = Z.certificado(curso.id);
    if (!state.cert) {
      renderBloqueado();
      return;
    }
    $('cert-locked').hidden = true;
    $('cert-zona').hidden = false;
    renderCertificado();
  }

  /* ---------- acciones ---------- */
  function initAcciones() {
    var form = $('cert-name-form');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var input = $('cert-name-input');
        var limpio = String(input && input.value ? input.value : '').trim();
        if (!limpio) {
          if (input) input.focus();
          return;
        }
        Z.guardarNombreCertificado(limpio);
        renderTodo();
        anunciar(UI.certificado.kicker + ' — ' + state.cert.nombre);
      });
    }

    var print = $('cert-print');
    if (print) {
      print.textContent = UI.certificado.descargar;
      print.addEventListener('click', function () {
        window.print();
      });
    }

    /* Verificador: abre y cierra el panel, siempre accesible por teclado. */
    var toggle = $('cert-verify-toggle');
    var panel = $('cert-verify');
    if (toggle && panel) {
      toggle.textContent = UI.certificado.verificar;
      txt('cert-verify-copy', UI.certificado.verificarCopia);
      toggle.addEventListener('click', function () {
        panel.hidden = !panel.hidden;
        toggle.setAttribute('aria-expanded', panel.hidden ? 'false' : 'true');
        if (!panel.hidden) {
          var input = $('cert-verify-input');
          if (input) input.focus();
        }
      });
    }

    var vform = $('cert-verify-form');
    if (vform) {
      vform.addEventListener('submit', function (e) {
        e.preventDefault();
        var input = $('cert-verify-input');
        var resultado = $('cert-verify-result');
        var v = Z.verificar(input && input.value ? input.value : '');
        resultado.classList.remove('is-ok', 'is-error');
        if (v.valido) {
          resultado.classList.add('is-ok');
          resultado.textContent = t('certificado', 'verificado', { curso: v.curso.titulo })
            + ' ' + t('certificado', 'ligado', { nombre: v.nombre });
        } else {
          resultado.classList.add('is-error');
          resultado.textContent = UI.certificado.noVerificado;
        }
      });
    }
  }

  function init() {
    if (!Z || !Z.datos().cursos.length) return;
    UI = Z.datos().ui || {};

    var q = new URLSearchParams(window.location.search);
    var curso = Z.cursoPorId(q.get('id')) || Z.cursos()[0];
    if (!curso) return;
    state.curso = curso;

    renderTodo();
    initAcciones();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();