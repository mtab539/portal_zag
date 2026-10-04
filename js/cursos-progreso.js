/* ============================================================
   PORTAL ZAG — Cursos Extraclase · Estado compartido
   ------------------------------------------------------------
   Un solo módulo (window.ZagCursos) que usan las 3 páginas para:
     - leer la sesión demo (nombre + nivel) y decidir el acceso
     - guardar progreso de lecciones y quizzes
     - mezclar comentarios semilla con los del usuario
       (likes y respuestas de un nivel)
     - emitir certificados con código de verificación
     - entregar Sello ZAG cada 3 cursos completados
   Todo acceso a localStorage va en try/catch para que un
   navegador con storage bloqueado no rompa la página.
   ============================================================ */

window.ZagCursos = (function () {
  'use strict';

  /* ---------- claves ---------- */
  var LS = {
    progreso: 'zag_cursos_progreso',
    comentarios: 'zag_cursos_comentarios',
    sellos: 'zag_sellos',
    nombreCert: 'zag_cursos_cert_nombre',
  };

  var NIVELES = ['rookie', 'strategist', 'creator', 'master', 'senior'];
  var NIVEL_ACCESO = 'creator';
  var CURSOS_POR_SELLO = 3;
  var QUIZ_PARA_APROBAR = 2;
  var LIMITE_COMENTARIO = 300;

  /* ---------- storage tolerante ---------- */
  function leer(clave, porDefecto) {
    try {
      var crudo = window.localStorage.getItem(clave);
      if (!crudo) return porDefecto;
      var dato = JSON.parse(crudo);
      return dato === null || dato === undefined ? porDefecto : dato;
    } catch (e) {
      return porDefecto;
    }
  }

  function escribir(clave, valor) {
    try {
      window.localStorage.setItem(clave, JSON.stringify(valor));
      return true;
    } catch (e) {
      return false;
    }
  }

  function borrar(clave) {
    try {
      window.localStorage.removeItem(clave);
      return true;
    } catch (e) {
      return false;
    }
  }

  /* ---------- datos ---------- */
  function datos() {
    return window.ZAG_CURSOS || { meta: {}, cursos: [], comentarios: {}, ui: {} };
  }

  function texto(grupo, clave, porDefecto) {
    var ui = datos().ui || {};
    var bloque = ui[grupo] || {};
    return typeof bloque[clave] === 'string' ? bloque[clave] : porDefecto;
  }

  /* Reemplaza {clave} por valor. */
  function txt(tpl, vars) {
    var s = String(tpl === null || tpl === undefined ? '' : tpl);
    if (!vars) return s;
    Object.keys(vars).forEach(function (k) {
      s = s.split('{' + k + '}').join(String(vars[k]));
    });
    return s;
  }

  function cursos() {
    return datos().cursos || [];
  }

  function cursoPorId(id) {
    var lista = cursos();
    for (var i = 0; i < lista.length; i += 1) {
      if (lista[i].id === id) return lista[i];
    }
    return null;
  }

  function modulos(curso) {
    return (curso && curso.modulos) || [];
  }

  function totalLecciones(curso) {
    var n = 0;
    modulos(curso).forEach(function (m) {
      n += (m.lecciones || []).length;
    });
    return n;
  }

  function totalQuizzes(curso) {
    var n = 0;
    modulos(curso).forEach(function (m) {
      if (m.quiz && m.quiz.length) n += 1;
    });
    return n;
  }

  function duracionCurso(curso) {
    var min = 0;
    modulos(curso).forEach(function (m) {
      (m.lecciones || []).forEach(function (l) {
        min += l.duracionMin || 0;
      });
    });
    return min;
  }

  /* Plano de lectura: cada lección con su módulo y sus índices. */
  function recorrido(curso) {
    var out = [];
    modulos(curso).forEach(function (m, mi) {
      (m.lecciones || []).forEach(function (l, li) {
        out.push({ modulo: m, leccion: l, indiceModulo: mi, indiceLeccion: li });
      });
    });
    return out;
  }

  function buscarLeccion(curso, leccionId) {
    var lista = recorrido(curso);
    for (var i = 0; i < lista.length; i += 1) {
      if (lista[i].leccion.id === leccionId) return lista[i];
    }
    return null;
  }

  function primeraLeccion(curso) {
    var lista = recorrido(curso);
    return lista.length ? lista[0].leccion.id : null;
  }

  function esUltimaDelModulo(curso, leccionId) {
    var plano = recorrido(curso);
    for (var i = 0; i < plano.length; i += 1) {
      if (plano[i].leccion.id !== leccionId) continue;
      var m = plano[i].modulo;
      var lecciones = m.lecciones || [];
      return i === plano.length - 1 || plano[i + 1].modulo.id !== m.id;
    }
    return false;
  }

  function siguiente(curso, leccionId) {
    var plano = recorrido(curso);
    for (var i = 0; i < plano.length; i += 1) {
      if (plano[i].leccion.id === leccionId) return plano[i + 1] || null;
    }
    return null;
  }

  function anterior(curso, leccionId) {
    var plano = recorrido(curso);
    for (var i = 0; i < plano.length; i += 1) {
      if (plano[i].leccion.id === leccionId) return plano[i - 1] || null;
    }
    return null;
  }

  /* ---------- sesión y acceso ---------- */
  function sesion() {
    var S = window.ZAG_SESSION;
    if (!S || typeof S.read !== 'function') return null;
    var s = null;
    try {
      s = S.read();
    } catch (e) {
      s = null;
    }
    return s && s.level ? s : null;
  }

  /* Acepta los nombres de nivel y también el índice conceptual
     (0..4). "2" es Creator, que es el nivel que abre los cursos. */
  function indiceNivel(nivel) {
    var bruto = nivel;
    if (typeof bruto === 'number' || /^\d+$/.test(String(bruto == null ? '' : bruto).trim())) {
      var n = Number(bruto);
      return n >= 0 && n < NIVELES.length ? n : -1;
    }
    return NIVELES.indexOf(String(bruto || '').toLowerCase());
  }

  function nivelTexto(nivel) {
    var i = indiceNivel(nivel);
    if (i === -1) return 'Rookie';
    var n = NIVELES[i];
    return n.charAt(0).toUpperCase() + n.slice(1);
  }

  function nivelSesion() {
    var s = sesion();
    return s ? s.level : null;
  }

  function nombreSesion() {
    var s = sesion();
    return s && s.name ? s.name : '';
  }

  /* Acceso: desde Creator hacia arriba (rookie=0 … senior=4). */
  function tieneAcceso() {
    var i = indiceNivel(nivelSesion());
    var min = indiceNivel(NIVEL_ACCESO);
    if (i < 0) return false;
    return i >= min;
  }

  function sinSesion() {
    return indiceNivel(nivelSesion()) < 0;
  }

  function nivelesFaltantes() {
    var i = indiceNivel(nivelSesion());
    var min = indiceNivel(NIVEL_ACCESO);
    if (i < 0) return min + 1;
    return Math.max(0, min - i);
  }

  /* ---------- progreso ---------- */
  function progresoVacio() {
    return { lecciones: [], quizzes: {}, ultimaLeccion: null, completadoEn: null };
  }

  function progreso(cursoId) {
    var todo = leer(LS.progreso, {});
    var g = todo && typeof todo === 'object' ? todo[cursoId] : null;
    if (!g || typeof g !== 'object') return progresoVacio();
    return {
      lecciones: Array.isArray(g.lecciones) ? g.lecciones : [],
      quizzes: g.quizzes && typeof g.quizzes === 'object' ? g.quizzes : {},
      ultimaLeccion: typeof g.ultimaLeccion === 'string' ? g.ultimaLeccion : null,
      completadoEn: typeof g.completadoEn === 'string' ? g.completadoEn : null,
    };
  }

  function guardarProgreso(cursoId, parcial) {
    var todo = leer(LS.progreso, {});
    if (!todo || typeof todo !== 'object') todo = {};
    var base = progreso(cursoId);
    var nuevo = {
      lecciones: parcial && Array.isArray(parcial.lecciones) ? parcial.lecciones : base.lecciones,
      quizzes: parcial && parcial.quizzes ? parcial.quizzes : base.quizzes,
      ultimaLeccion:
        parcial && parcial.ultimaLeccion !== undefined ? parcial.ultimaLeccion : base.ultimaLeccion,
      completadoEn:
        parcial && parcial.completadoEn !== undefined ? parcial.completadoEn : base.completadoEn,
    };
    todo[cursoId] = nuevo;
    escribir(LS.progreso, todo);
    return nuevo;
  }

  function leccionCompletada(cursoId, leccionId) {
    return progreso(cursoId).lecciones.indexOf(leccionId) !== -1;
  }

  /* Marca/desmarca. Devuelve true si el curso quedó completo justo ahora. */
  function marcarLeccion(cursoId, leccionId, hecha) {
    var base = progreso(cursoId);
    var lista = base.lecciones.slice();
    var i = lista.indexOf(leccionId);
    var yaEstaba = i !== -1;
    if (hecha && i === -1) lista.push(leccionId);
    if (!hecha && i !== -1) lista.splice(i, 1);

    var estabaCompleto = cursoCompleto(cursoId);
    guardarProgreso(cursoId, { lecciones: lista, ultimaLeccion: leccionId });

    var completoAhora = cursoCompleto(cursoId);
    var nuevoSello = false;
    if (!estabaCompleto && completoAhora) {
      nuevoSello = registrarSello(cursoId);
      guardarProgreso(cursoId, { completadoEn: new Date().toISOString() });
    }
    return {
      hecho: !!hecha,
      nuevo: !yaEstaba,
      completo: completoAhora,
      nuevoSello: nuevoSello,
    };
  }

  function quizzesAprobados(cursoId) {
    var q = progreso(cursoId).quizzes;
    return modulos(cursoPorId(cursoId)).filter(function (m) {
      return m.quiz && m.quiz.length && q[m.id] && q[m.id].aprobado;
    }).length;
  }

  function quizAprobado(cursoId, moduloId) {
    var q = progreso(cursoId).quizzes[moduloId];
    return !!(q && q.aprobado);
  }

  function puntajeQuiz(cursoId, moduloId) {
    var q = progreso(cursoId).quizzes[moduloId];
    return q && typeof q.puntaje === 'number' ? q.puntaje : null;
  }

  function registrarQuiz(cursoId, moduloId, puntaje, total) {
    var aprobado = puntaje >= QUIZ_PARA_APROBAR;
    var base = progreso(cursoId);
    var quizzes = {};
    Object.keys(base.quizzes).forEach(function (k) {
      quizzes[k] = base.quizzes[k];
    });
    quizzes[moduloId] = {
      puntaje: puntaje,
      total: total,
      aprobado: aprobado,
      fecha: new Date().toISOString(),
    };

    var estabaCompleto = cursoCompleto(cursoId);
    guardarProgreso(cursoId, { quizzes: quizzes });

    var nuevoSello = false;
    var completoAhora = cursoCompleto(cursoId);
    if (!estabaCompleto && aprobado && completoAhora) {
      nuevoSello = registrarSello(cursoId);
      guardarProgreso(cursoId, { quizzes: quizzes, completadoEn: new Date().toISOString() });
    }
    return { aprobado: aprobado, completo: completoAhora, nuevoSello: nuevoSello };
  }

  /* Porcentaje = (lecciones completadas + quizzes aprobados)
     / (total de lecciones + total de quizzes). */
  function porcentaje(cursoId) {
    var curso = cursoPorId(cursoId);
    if (!curso) return 0;
    var lec = totalLecciones(curso);
    var qui = totalQuizzes(curso);
    var total = lec + qui;
    if (!total) return 0;
    var hechas = Math.min(progreso(cursoId).lecciones.length, lec) + quizzesAprobados(cursoId);
    return Math.round((hechas / total) * 100);
  }

  function cursoCompleto(cursoId) {
    var curso = cursoPorId(cursoId);
    if (!curso) return false;
    return progreso(cursoId).lecciones.length >= totalLecciones(curso) &&
      quizzesAprobados(cursoId) >= totalQuizzes(curso);
  }

  function completados() {
    return cursos().filter(function (c) {
      return cursoCompleto(c.id);
    });
  }

  /* En curso: tiene progreso > 0 y < 100. */
  function enCurso() {
    return cursos().filter(function (c) {
      var p = porcentaje(c.id);
      return p > 0 && p < 100;
    });
  }

  function sinIniciar() {
    return cursos().filter(function (c) {
      return progreso(c.id).lecciones.length === 0 && quizzesAprobados(c.id) === 0;
    });
  }

  /* "Continuar donde ibas": la última lección visitada, o la primera. */
  function dondeIba(cursoId) {
    var curso = cursoPorId(cursoId);
    if (!curso) return null;
    var u = progreso(cursoId).ultimaLeccion;
    if (u && buscarLeccion(curso, u)) return u;
    return primeraLeccion(curso);
  }

  /* ---------- sellos ---------- */
  function sellos() {
    var l = leer(LS.sellos, []);
    return Array.isArray(l) ? l : [];
  }

  /* Un sello por cada grupo completo de 3 cursos (3º, 6º…). */
  function registrarSello(cursoId) {
    var completos = completados().map(function (c) {
      return c.id;
    });
    var actuales = sellos();
    var esperado = Math.floor(completos.length / CURSOS_POR_SELLO);
    if (actuales.length >= esperado) return false;

    var nuevo = actuales.slice();
    for (var g = actuales.length; g < esperado; g += 1) {
      nuevo.push({
        tipo: 'cursos-extraclase',
        fecha: new Date().toISOString(),
        cursos: completos.slice(g * CURSOS_POR_SELLO, g * CURSOS_POR_SELLO + CURSOS_POR_SELLO),
      });
    }
    escribir(LS.sellos, nuevo);
    return nuevo.length > actuales.length;
  }

  /* Para la píldora del hero: ●●○ y "2 de 3".
     `puntos` siempre mira hacia el SIGUIENTE sello: al ganar uno
     se reinicia a ○○○ y `ganados` dice cuántos llevas. */
  function progresoSello() {
    var n = completados().length;
    var enCurso = n % CURSOS_POR_SELLO;
    var ganados = Math.floor(n / CURSOS_POR_SELLO);
    return {
      completos: n,
      enCurso: enCurso,
      faltan: CURSOS_POR_SELLO - enCurso,
      grupo: ganados,
      ganados: ganados,
      puntos: puntosSello(enCurso),
      objetivo: CURSOS_POR_SELLO,
    };
  }

  function puntosSello(llenos) {
    var out = '';
    for (var i = 0; i < CURSOS_POR_SELLO; i += 1) {
      out += i < llenos ? '●' : '○';
    }
    return out;
  }

  /* ---------- comentarios ---------- */
  function comentariosSemilla(cursoId, leccionId) {
    var pool = (datos().comentarios || {})[cursoId];
    if (!Array.isArray(pool) || !pool.length) return [];
    var curso = cursoPorId(cursoId);
    if (!curso) return pool.slice(0, 3);

    var plano = recorrido(curso);
    var indice = -1;
    for (var i = 0; i < plano.length; i += 1) {
      if (plano[i].leccion.id === leccionId) {
        indice = i;
        break;
      }
    }
    if (indice < 0) return pool.slice(0, 3);

    /* 3 por lección, corridos: cada autor aparece en varias lecciones
       sin que se repita dentro de la misma. */
    var out = [];
    for (var k = 0; k < 3; k += 1) {
      var idx = (indice * 3 + k) % pool.length;
      if (out.indexOf(idx) === -1) out.push(idx);
    }
    var lista = out.map(function (i) {
      var base = 1 + ((indice + i) % 7);
      return {
        id: idComentario(cursoId, leccionId, i),
        indiceSemilla: i,
        autor: pool[i].autor,
        nivel: pool[i].nivel,
        texto: pool[i].texto,
        semilla: true,
        likesBase: base,
        likes: base,
        meGusta: false,
        respuestas: [],
      };
    });
    return aplicarLikesGuardados(lista, cursoId, leccionId);
  }

  /* Los likes que el usuario dejó sobre comentarios semilla viven en
     zag_cursos_comentarios; hay que re-aplicarlos cada vez que se
     reconstruye la lista semilla. Se guarda el DELTA (-1/0/+1) para
     que quitar el like devuelva el contador a su valor original. */
  function aplicarLikesGuardados(semillas, cursoId, leccionId) {
    var guardados = mio(cursoId, leccionId);
    if (!guardados.length) return semillas;
    semillas.forEach(function (s) {
      var guardado = null;
      guardados.forEach(function (g) {
        if (g.id === s.id && g.likeSemilla) guardado = g;
      });
      if (guardado) {
        var delta = typeof guardado.delta === 'number' ? guardado.delta : 0;
        s.meGusta = delta > 0;
        s.likes = s.likesBase + delta;
      }
    });
    return semillas;
  }

  function mio(cursoId, leccionId) {
    var todo = leer(LS.comentarios, {});
    var porCurso = todo && todo[cursoId] ? todo[cursoId] : null;
    if (!porCurso) return [];
    var l = porCurso[leccionId];
    return Array.isArray(l) ? l : [];
  }

  /* Los likes de semilla viven en el mismo storage pero NO son comentarios:
   filtrarlos acá evita que el marcador aparezca como un cuarto comentario. */
  function comentariosDe(cursoId, leccionId) {
    var propios = mio(cursoId, leccionId).filter(function (c) {
      return !c.likeSemilla;
    });
    return comentariosSemilla(cursoId, leccionId).concat(propios);
  }

  function guardarMio(cursoId, leccionId, lista) {
    var todo = leer(LS.comentarios, {});
    if (!todo || typeof todo !== 'object') todo = {};
    if (!todo[cursoId] || typeof todo[cursoId] !== 'object') todo[cursoId] = {};
    todo[cursoId][leccionId] = lista;
    escribir(LS.comentarios, todo);
  }

  /* id estable para poder dar like a un comentario semilla. */
  function idComentario(cursoId, leccionId, indice) {
    return cursoId + '/' + leccionId + '/' + indice;
  }

  /* Solo guarda el delta: +1 me gusta, -1 lo quité. Los comentarios
     del usuario guardan su contador absoluto (no son semilla). */
  function alternarLike(cursoId, leccionId, indiceSemilla) {
    var lista = mio(cursoId, leccionId).slice();
    var id = idComentario(cursoId, leccionId, indiceSemilla);
    var encontrado = null;
    lista.forEach(function (c) {
      if (c.id === id) encontrado = c;
    });
    if (encontrado) {
      if (encontrado.meGusta) {
        encontrado.meGusta = false;
        encontrado.delta = 0;
      } else {
        encontrado.meGusta = true;
        encontrado.delta = 1;
      }
    } else {
      lista.push({ id: id, likeSemilla: true, meGusta: true, delta: 1 });
    }
    guardarMio(cursoId, leccionId, lista);
    return lista;
  }

  function agregarComentario(cursoId, leccionId, texto) {
    var limpio = String(texto == null ? '' : texto).trim();
    if (!limpio) return null;
    var s = sesion();
    var lista = mio(cursoId, leccionId).slice();
    lista.push({
      id: Date.now() + '-' + Math.floor(Math.random() * 1000),
      autor: s && s.name ? s.name : 'Vos',
      nivel: s && s.level ? s.level : null,
      texto: limpio,
      fecha: new Date().toISOString(),
      likes: 0,
      meGusta: false,
      respuestas: [],
      mio: true,
    });
    guardarMio(cursoId, leccionId, lista);
    return lista;
  }

  /* Solo se responde a comentarios raíz del usuario (un nivel). */
  function agregarRespuesta(cursoId, leccionId, comentarioId, texto) {
    var limpio = String(texto == null ? '' : texto).trim();
    if (!limpio) return null;
    var s = sesion();
    var lista = mio(cursoId, leccionId).slice();
    var destino = null;
    lista.forEach(function (c) {
      if (c.id === comentarioId) destino = c;
    });
    if (!destino) return null;
    destino.respuestas = destino.respuestas || [];
    destino.respuestas.push({
      id: Date.now() + '-' + Math.floor(Math.random() * 1000),
      autor: s && s.name ? s.name : 'Vos',
      texto: limpio,
      fecha: new Date().toISOString(),
    });
    guardarMio(cursoId, leccionId, lista);
    return lista;
  }

  function limiteComentario() {
    return LIMITE_COMENTARIO;
  }

  /* ---------- certificados ---------- */
  var MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio',
    'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

  function fechaLarga(iso) {
    var d = iso ? new Date(iso) : new Date();
    if (isNaN(d.getTime())) return '';
    return d.getDate() + ' de ' + MESES[d.getMonth()] + ' de ' + d.getFullYear();
  }

  function iniciales(nombre) {
    var partes = String(nombre || '').trim().split(/\s+/).filter(Boolean);
    if (!partes.length) return 'ZAG';
    var a = partes[0].charAt(0);
    var b = partes.length > 1 ? partes[partes.length - 1].charAt(0) : '';
    return (a + b).toUpperCase();
  }

  function nombreCertificado() {
    var v = leer(LS.nombreCert, '');
    return typeof v === 'string' ? v : '';
  }

  function guardarNombreCertificado(nombre) {
    var limpio = String(nombre || '').trim();
    if (!limpio) return '';
    escribir(LS.nombreCert, limpio);
    return limpio;
  }

  /* Código: ZAG-SIGLAS-[4 chars]. Determinista: mismo curso + mismo
     nombre → mismo código, sin red. */
  var ALFABETO = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

  function hash(texto) {
    var h = 5381;
    var i;
    for (i = 0; i < texto.length; i += 1) {
      h = ((h << 5) + h + texto.charCodeAt(i)) >>> 0;
    }
    var out = '';
    var n = h;
    for (i = 0; i < 4; i += 1) {
      out += ALFABETO.charAt(n % ALFABETO.length);
      n = Math.floor(n / ALFABETO.length) + 7 * (i + 1);
    }
    return out;
  }

  function codigo(curso, nombre) {
    var base = String(curso.id || '') + '|' + String(nombre || '').toLowerCase();
    return 'ZAG-' + iniciales(curso.titulo) + '-' + hash(base);
  }

  /* Datos del certificado, o null si el curso no está completo. */
  function certificado(cursoId) {
    var curso = cursoPorId(cursoId);
    if (!curso || !cursoCompleto(cursoId)) return null;
    var nombre = nombreCertificado() || nombreSesion() || 'Estudiante ZAG';
    var p = progreso(cursoId);
    var horas = Math.round((duracionCurso(curso) / 60) * 10) / 10;
    return {
      curso: curso,
      nombre: nombre,
      horas: horas,
      horasTexto: String(horas).replace('.', ','),
      modulos: totalModulos(curso),
      fecha: p.completadoEn,
      fechaTexto: fechaLarga(p.completadoEn),
      codigo: codigo(curso, nombre),
    };
  }

  function totalModulos(curso) {
    return modulos(curso).length;
  }

  /* Verificación local: se recalcula el código de cada curso completo. */
  function verificar(codigoIngresado) {
    var limpio = String(codigoIngresado || '').trim().toUpperCase();
    if (!limpio) return { valido: false };
    var guardados = nombreCertificado() || nombreSesion();
    var lista = cursos();
    for (var i = 0; i < lista.length; i += 1) {
      var c = lista[i];
      if (codigo(c, guardados) === limpio) {
        return { valido: true, curso: c, nombre: guardados, fecha: progreso(c.id).completadoEn };
      }
    }
    return { valido: false };
  }

  /* ---------- profesores ---------- */
  /* Nombre, cargo y foto salen de mentorias-data.js; si el profesor
     no está allí, fallback con iniciales. */
  function profesor(curso) {
    var id = curso && curso.profesorId;
    var mentores = window.ZAG_MENTORIAS && window.ZAG_MENTORIAS.mentores;
    var base = { id: id, nombre: '', cargo: '', foto: '', iniciales: '' };
    if (!id) return base;

    var encontrado = null;
    if (Array.isArray(mentores)) {
      for (var i = 0; i < mentores.length; i += 1) {
        if (mentores[i].id === id) {
          encontrado = mentores[i];
          break;
        }
      }
    }
    if (!encontrado) {
      /* Fallback: nombre derivado del id. */
      var palabras = String(id).split('-');
      base.nombre = palabras.map(function (p) {
        return p.charAt(0).toUpperCase() + p.slice(1);
      }).join(' ');
      base.iniciales = iniciales(base.nombre);
      return base;
    }
    return {
      id: encontrado.id,
      nombre: encontrado.nombre || '',
      cargo: encontrado.cargo || '',
      foto: encontrado.foto || '',
      iniciales: encontrado.iniciales || iniciales(encontrado.nombre),
      existe: true,
    };
  }

  /* ---------- demo ---------- */
  /* Completa todo un curso (lecciones + quizzes) para probar el
     certificado y el sello sin hacer 60 clicks. */
  function completarCursoDemo(cursoId) {
    var curso = cursoPorId(cursoId);
    if (!curso) return null;

    var lecciones = [];
    recorrido(curso).forEach(function (r) {
      lecciones.push(r.leccion.id);
    });

    var quizzes = {};
    modulos(curso).forEach(function (m) {
      if (m.quiz && m.quiz.length) {
        quizzes[m.id] = {
          puntaje: m.quiz.length,
          total: m.quiz.length,
          aprobado: true,
          fecha: new Date().toISOString(),
        };
      }
    });

    var estabaCompleto = cursoCompleto(cursoId);
    guardarProgreso(cursoId, {
      lecciones: lecciones,
      quizzes: quizzes,
      ultimaLeccion: lecciones.length ? lecciones[lecciones.length - 1] : null,
      completadoEn: new Date().toISOString(),
    });
    var sello = !estabaCompleto ? registrarSello(cursoId) : false;
    return { completo: cursoCompleto(cursoId), nuevoSello: sello };
  }

  /* Reinicia la demo de cursos: progreso, comentarios, sellos de
     cursos y nombre del certificado. No toca la sesión. */
  function reiniciarDemo() {
    var sellosActual = sellos().filter(function (s) {
      return s.tipo !== 'cursos-extraclase';
    });
    borrar(LS.progreso);
    borrar(LS.comentarios);
    borrar(LS.nombreCert);
    escribir(LS.sellos, sellosActual);
    return true;
  }

  /* ---------- formatos ---------- */
  function duracionTexto(min) {
    var h = Math.floor(min / 60);
    var m = min % 60;
    if (h && m) return h + ' h ' + m + ' min';
    if (h) return h + ' h';
    return m + ' min';
  }

  function pluralizar(n, singular, plural) {
    return n + ' ' + (n === 1 ? singular : plural);
  }

  /* ============================================================
     API pública
     ============================================================ */
  return {
    LS: LS,
    NIVELES: NIVELES,
    NIVEL_ACCESO: NIVEL_ACCESO,
    CURSOS_POR_SELLO: CURSOS_POR_SELLO,
    QUIZ_PARA_APROBAR: QUIZ_PARA_APROBAR,

    txt: txt,
    texto: texto,
    datos: datos,

    cursos: cursos,
    cursoPorId: cursoPorId,
    modulos: modulos,
    totalLecciones: totalLecciones,
    totalQuizzes: totalQuizzes,
    totalModulos: totalModulos,
    duracionCurso: duracionCurso,
    recorrido: recorrido,
    buscarLeccion: buscarLeccion,
    primeraLeccion: primeraLeccion,
    siguiente: siguiente,
    anterior: anterior,
    esUltimaDelModulo: esUltimaDelModulo,

    sesion: sesion,
    nivelSesion: nivelSesion,
    nombreSesion: nombreSesion,
    indiceNivel: indiceNivel,
    nivelTexto: nivelTexto,
    tieneAcceso: tieneAcceso,
    sinSesion: sinSesion,
    nivelesFaltantes: nivelesFaltantes,

    progreso: progreso,
    guardarProgreso: guardarProgreso,
    leccionCompletada: leccionCompletada,
    marcarLeccion: marcarLeccion,
    quizzesAprobados: quizzesAprobados,
    quizAprobado: quizAprobado,
    puntajeQuiz: puntajeQuiz,
    registrarQuiz: registrarQuiz,
    porcentaje: porcentaje,
    cursoCompleto: cursoCompleto,
    completados: completados,
    enCurso: enCurso,
    sinIniciar: sinIniciar,
    dondeIba: dondeIba,

    sellos: sellos,
    registrarSello: registrarSello,
    progresoSello: progresoSello,

    comentariosDe: comentariosDe,
    comentariosSemilla: comentariosSemilla,
    mio: mio,
    agregarComentario: agregarComentario,
    agregarRespuesta: agregarRespuesta,
    alternarLike: alternarLike,
    idComentario: idComentario,
    limiteComentario: limiteComentario,

    certificado: certificado,
    nombreCertificado: nombreCertificado,
    guardarNombreCertificado: guardarNombreCertificado,
    codigo: codigo,
    verificar: verificar,
    iniciales: iniciales,
    fechaLarga: fechaLarga,

    profesor: profesor,
    completarCursoDemo: completarCursoDemo,
    reiniciarDemo: reiniciarDemo,

    duracionTexto: duracionTexto,
    pluralizar: pluralizar,
  };
})();