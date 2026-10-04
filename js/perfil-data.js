/* ============================================================
   PORTAL ZAG — Datos del sistema de perfiles
   Niveles, retos, desbloqueos, merch y textos de la interfaz.
   Fuente única: la usan registro, perfil y cualquier página
   que necesite hablar de niveles. Sin dependencias.
   ============================================================ */
window.ZAG_NIVELES = (function () {
  'use strict';

  var NIVELES = ['rookie', 'strategist', 'creator', 'master', 'senior'];

  /* Meta por nivel. fondo/texto = cabecera del perfil; tinta = color
     del sello de respaldo (CSS/SVG) cuando falta la imagen. */
  var META = {
    rookie: {
      nombre: 'ROOKIE', identidad: 'Explorador',
      fondo: 'var(--color-cream)', texto: 'var(--color-black)',
      tinta: 'var(--color-text-muted)',
      definicion: 'El que explora. Entras a la tribu: fogatas, podcast y eventos abiertos.',
    },
    strategist: {
      nombre: 'STRATEGIST', identidad: 'Pensador',
      fondo: 'var(--color-light-blue)', texto: 'var(--color-black)',
      tinta: 'var(--color-functional)',
      definicion: 'El que piensa. Mentorías grupales y tu primer proyecto fuera del ZIG.',
    },
    creator: {
      nombre: 'CREATOR', identidad: 'Creador',
      fondo: 'var(--color-cta)', texto: 'var(--color-black)',
      tinta: 'var(--color-cta-text)',
      definicion: 'El que crea. Cursos extraclase, marcas aliadas y tu entrada al ZAG Room.',
    },
    master: {
      nombre: 'MASTER', identidad: 'Referente',
      fondo: 'var(--color-functional)', texto: 'var(--color-cream)',
      tinta: 'var(--color-brand-deep)',
      definicion: 'El que inspira. Lideras retos, facilitas sesiones y el ZAG Room es tuyo.',
    },
    senior: {
      nombre: 'SENIOR', identidad: 'Constructor de Cultura',
      fondo: 'var(--color-black)', texto: 'var(--color-cream)',
      tinta: 'var(--color-black)',
      definicion: 'El que construye cultura. Nivel tope: mentorías 1:1 y acceso permanente.',
    },
  };

  /* Retos por nivel. Cada reto aprobado = 1 sello. Todos llevan
     evidencia. Son repetibles, siempre con evidencia nueva. */
  var RETOS = {
    rookie: [
      { id: 'fogata', nombre: 'Asistir a una Fogata Zaggista', href: 'fogatas.html', pista: 'Llega, participa y guarda una foto del encuentro.' },
      { id: 'podcast', nombre: 'Escuchar un episodio del podcast', href: 'proximamente.html', pista: 'Comparte qué idea te llevas del episodio.' },
      { id: 'muro', nombre: 'Publicar en el Muro de Quiebre', href: 'muro.html', pista: 'Escribe tu respuesta en el muro y muéstrala.' },
    ],
    strategist: [
      { id: 'mentoria-grupal', nombre: 'Mentoría grupal con egresados', href: 'mentorias.html', pista: 'Asiste a una sesión grupal completa.' },
      { id: 'proyecto-zig', nombre: 'Publicar un proyecto en Proyectos fuera del ZIG', href: 'proyectos.html', pista: 'Sube el caso con su evidencia.' },
      { id: 'referido', nombre: 'Traer un referido nuevo', href: 'registro.html', pista: 'Una captura del registro de tu referido.' },
    ],
    creator: [
      { id: 'marca-aliada', nombre: 'Dinámica con marca aliada', href: 'seminario.html', pista: 'Participa en la dinámica completa.' },
      { id: 'zag-room', nombre: 'Reservar y usar el ZAG Room', href: 'zag-room.html', pista: 'Reserva un bloque y asiste.' },
      { id: 'entrega-publica', nombre: 'Entrega pública en el Muro de Quiebre', href: 'muro.html', pista: 'Presenta tu pieza en la sesión abierta.' },
    ],
    master: [
      { id: 'podcast-ponente', nombre: 'Invitado en un episodio del podcast', href: 'proximamente.html', pista: 'Graba un episodio o comparte tu participación.' },
      { id: 'liderar-reto', nombre: 'Liderar un reto para niveles junior', href: 'fogatas.html', pista: 'Cuéntanos qué reto lideraste y para quién.' },
      { id: 'sesion-abierta', nombre: 'Facilitar una sesión abierta en el ZAG Room', href: 'zag-room.html', pista: 'Reserva el bloque y facilítalo.' },
    ],
    senior: [],
  };

  /* Desbloqueos. Acumulativos: lo de tu nivel y lo de todos los
     anteriores. "TODOS" no pide nivel: con perfil o sin él. */
  var TODOS = [
    { titulo: 'Muro de Quiebre', desc: 'Escribe y lee lo que la tribu se dice.', href: 'muro.html', icono: '✳' },
    { titulo: 'Blog de Fracasos', desc: 'Casos ZIG contados sin filtro.', href: 'casos.html', icono: '✳' },
    { titulo: 'Proyectos fuera del ZIG', desc: 'Tu caso publicado con evidencia.', href: 'proyectos.html', icono: '✳' },
  ];

  var ITEMS = {
    rookie: [
      { titulo: 'Asistir a Fogatas', desc: 'Encuentros abiertos a todos los niveles.', href: 'fogatas.html', icono: '🔥' },
      { titulo: 'Escuchar el podcast', desc: 'La voz de quienes ya pasaron por esto.', href: 'proximamente.html', icono: '🎙' },
      { titulo: 'Participar en eventos', desc: 'Seminario Somos ZAG y activaciones.', href: 'seminario.html', icono: '📣' },
      { titulo: 'Merch: Pack Stickers', desc: 'El primer sticker de tu nivel.', href: 'tienda.html', icono: '🏷' },
      { titulo: 'Merch: Manilla Rookie', desc: 'Seis sellos caben en la muñeca.', href: 'tienda.html', icono: '🏷' },
      { titulo: 'Merch: Pines', desc: 'Los pines de la tribu.', href: 'tienda.html', icono: '🏷' },
    ],
    strategist: [
      { titulo: 'Mentorías grupales', desc: 'Sesiones con egresados del programa.', href: 'mentorias.html', icono: '🧭' },
      { titulo: 'Merch: Manilla Strategist', desc: 'Ya piensas como estrategia.', href: 'tienda.html', icono: '🏷' },
      { titulo: 'Merch: Llavero y cordón', desc: 'Para el notebook y la agenda.', href: 'tienda.html', icono: '🏷' },
    ],
    creator: [
      { titulo: 'Cursos extraclase', desc: 'Lo que el pensum no te cuenta.', href: 'cursos.html', icono: '📚' },
      { titulo: 'ZAG Room · 2 bloques por semana', desc: 'Tu primer territorio físico.', href: 'zag-room.html', icono: '🚪' },
      { titulo: 'Merch: Manilla Creator', desc: 'Tu criterio ya tiene nombre.', href: 'tienda.html', icono: '🏷' },
      { titulo: 'Merch: Botón y Tote Bag', desc: 'El kit del que crea.', href: 'tienda.html', icono: '🏷' },
    ],
    master: [
      { titulo: 'Participar en el podcast', desc: 'Como ponente, no como escucha.', href: 'proximamente.html', icono: '🎙' },
      { titulo: 'Prioridad en proyectos y retos', desc: 'Tu propuesta se lee primero.', href: 'proyectos.html', icono: '⚡' },
      { titulo: 'ZAG Room · 5 bloques por semana', desc: 'Uso pleno del territorio.', href: 'zag-room.html', icono: '🚪' },
      { titulo: 'Merch: Gorra, buzos y termo', desc: 'Gorra, buzo azul claro, buzo azul oscuro, termo y Manilla Master.', href: 'tienda.html', icono: '🏷' },
    ],
    senior: [
      { titulo: 'Mentorías personalizadas (1:1)', desc: 'Acompañamiento uno a uno.', href: 'mentorias.html', icono: '🧭' },
      { titulo: 'ZAG Room permanente', desc: 'Bloques ilimitados. El territorio es tuyo.', href: 'zag-room.html', icono: '🚪' },
      { titulo: 'Merch completo + 15% en Tienda', desc: 'Todo el catálogo y el descuento Senior.', href: 'tienda.html', icono: '🏷' },
    ],
  };

  /* Textos de la interfaz de perfil y registro. */
  var UI = {
    perfil: {
      nivelTope: 'Nivel tope. Construyes cultura, no la persigues.',
      progresoTip: 'Cada reto aprobado estampa 1 sello. Con 6 sellos del nivel actual subes al siguiente.',
      evidenciaInfo: 'Sube una foto o evidencia de que cumpliste este reto. Un encargado la revisa y aprueba el sello en máx. 48 horas.',
      retosSub: function (nivel, siguiente) {
        return 'Cada reto aprobado = 1 sello. Necesitas 6 sellos ' + nivel + ' para subir a ' + siguiente + '. Puedes repetir retos, pero cada vez con una evidencia nueva.';
      },
    },
    registro: {
      subtitulo: 'Si eres de Publicidad Digital y Mercadeo y tienes correo institucional, ya puedes ser ZAG. Sin filas, sin tiras, sin excusas.',
      otroPrograma: 'Por ahora el Portal ZAG es solo para Publicidad Digital y Mercadeo. Pronto llevamos el ZAG a tu carrera.',
      bienvenida: '¡Bienvenido a la tribu! Empiezas como',
    },
  };

  function indice(id) { return NIVELES.indexOf(id); }
  function existe(id) { return indice(id) !== -1; }
  function meta(id) { return META[existe(id) ? id : 'rookie']; }
  function nombre(id) { return meta(id).nombre; }
  function nivelSiguiente(id) { return NIVELES[indice(id) + 1] || null; }
  function retos(id) { return (RETOS[existe(id) ? id : 'rookie'] || []).slice(); }
  function reto(nivel, id) { return retos(nivel).filter(function (r) { return r.id === id; })[0] || null; }

  /* Desbloqueos acumulativos hasta el nivel dado (inclusive). */
  function desbloqueos(id) {
    var out = TODOS.slice();
    for (var i = 0; i <= indice(id); i++) out = out.concat(ITEMS[NIVELES[i]] || []);
    return out;
  }
  /* Solo lo nuevo de un nivel (para la tarjeta "AL SUBIR A" y el
     popup de felicitación). */
  function desbloqueosDe(id) { return (ITEMS[id] || []).slice(); }
  function resumenDesbloqueos(id) { return desbloqueosDe(id).slice(0, 5).map(function (x) { return x.titulo; }); }

  function fechaCorta(value) {
    var d = new Date(value);
    return isNaN(d) ? '' : new Intl.DateTimeFormat('es', { day: 'numeric', month: 'short' }).format(d);
  }
  function lineaRol(p) {
    if (!p) return '';
    return p.rol === 'egresado' ? 'Egresado · ' + (p.egreso || '') : 'Estudiante · ' + (p.semestre || '') + '.º semestre';
  }
  function sellosNecesarios() { return 6; }

  return {
    NIVELES: NIVELES, META: META, RETOS: RETOS, UI: UI,
    indice: indice, existe: existe, nombre: nombre, meta: meta,
    nivelSiguiente: nivelSiguiente, retos: retos, reto: reto,
    desbloqueos: desbloqueos, desbloqueosDe: desbloqueosDe, resumenDesbloqueos: resumenDesbloqueos,
    fechaCorta: fechaCorta, lineaRol: lineaRol, sellosNecesarios: sellosNecesarios,
  };
})();
