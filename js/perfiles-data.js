/* ============================================================
   PORTAL ZAG — Datos de la página "Conoce los perfiles"
   window.ZAG_PERFILES: los 5 perfiles con sus textos y los
   textos de la interfaz en ZAG_PERFILES.ui.
   Reutiliza los tokens de color de perfil-data.js (ZAG_NIVELES).
   ============================================================ */
window.ZAG_PERFILES = (function () {
  'use strict';

  var PERFILES = [
    {
      id: 'rookie',
      orden: 0,
      nombre: 'ROOKIE',
      apodo: 'EXPLORADOR',
      frase: 'Llegas con curiosidad. Te asomas a todo lo que pasa en la comunidad y empiezas a mirar distinto.',
      desbloquea: [
        { label: 'Asistir a Fogatas',           href: 'fogatas.html'   },
        { label: 'Escuchar el Podcast ZAG',     href: 'podcast.html'   },
        { label: 'Participar en eventos',        href: 'seminario.html' },
      ],
      merch: ['Pack de stickers', 'Manilla Rookie', 'Pines'],
      comoLlegar: 'Te inscribes con tu correo institucional y ya eres Rookie.',
      sticker: 'assets/img/stickers/rookie-recorte.webp',
      bg: '--color-cream',
      fg: '--color-black',
    },
    {
      id: 'strategist',
      orden: 1,
      nombre: 'STRATEGIST',
      apodo: 'PENSADOR',
      frase: 'Ya no solo miras: te preguntas el porqué de las cosas y aprendes con otros.',
      desbloquea: [
        { label: 'Mentorías grupales', href: 'mentorias.html' },
      ],
      merch: ['Manilla Strategist', 'Llavero', 'Cordón'],
      comoLlegar: 'Completa los 6 sellos de Rookie.',
      sticker: 'assets/img/stickers/strategist-recorte.webp',
      bg: '--color-light-blue',
      fg: '--color-black',
    },
    {
      id: 'creator',
      orden: 2,
      nombre: 'CREATOR',
      apodo: 'CREADOR',
      frase: 'Pasas de la idea a la pieza. Aprendes haciendo y tienes un lugar para crear.',
      desbloquea: [
        { label: 'Cursos extraclase',              href: 'cursos.html'   },
        { label: 'ZAG Room (2 bloques por semana)', href: 'zag-room.html' },
      ],
      merch: ['Manilla Creator', 'Botón', 'Tote bag'],
      comoLlegar: 'Completa los 6 sellos de Strategist.',
      sticker: 'assets/img/stickers/creator-recorte.webp',
      bg: '--color-cta',
      fg: '--color-white',
    },
    {
      id: 'master',
      orden: 3,
      nombre: 'MASTER',
      apodo: 'REFERENTE',
      frase: 'Otros aprenden de ti. Tu voz pesa y tu trabajo abre camino.',
      desbloquea: [
        { label: 'Participar en el Podcast ZAG',       href: 'podcast.html'  },
        { label: 'Prioridad en proyectos y retos',     href: null            },
        { label: 'ZAG Room (5 bloques por semana)',    href: 'zag-room.html' },
      ],
      merch: ['Gorra', 'Termo', 'Pañoleta'],
      comoLlegar: 'Completa los 6 sellos de Creator.',
      sticker: 'assets/img/stickers/master-recorte.webp',
      bg: '--color-functional',
      fg: '--color-cream',
    },
    {
      id: 'senior',
      orden: 4,
      nombre: 'SENIOR',
      apodo: 'CONSTRUCTOR DE CULTURA',
      frase: 'Ya no sigues la cultura ZAG: la construyes.',
      desbloquea: [
        { label: 'Mentorías personalizadas 1:1', href: 'mentorias.html' },
        { label: 'ZAG Room permanente',          href: 'zag-room.html'  },
      ],
      merch: ['Buzos ZAG', 'Merch completo', '15% de descuento en la Tienda ZAG'],
      comoLlegar: 'Completa los 6 sellos de Master.',
      sticker: 'assets/img/stickers/senior-recorte.webp',
      bg: '--color-black',
      fg: '--color-cream',
    },
  ];

  var UI = {
    hero: {
      pill: 'COMUNIDAD ZAG',
      titleBase: 'CONOCE LOS',
      titleAccent: 'PERFILES',
      sub: '5 niveles, un mismo camino: atreverse a ir en contra del zig.',
      ctaSecondary: 'Ver los 5 perfiles ↓',
    },
    intro: {
      eyebrow: 'NO SE REGALA, SE GANA',
      titleBase: 'CADA NIVEL SE',
      titleAccent: 'GANA.',
      parrafo: 'En la comunidad ZAG nadie llega sabiéndolo todo. Empiezas como Rookie, completas retos, sumas sellos en tu Pasaporte ZAG y, cada 6 sellos, subes de nivel. Cada nivel te abre puertas nuevas: mentorías, cursos, el ZAG Room, el podcast y merch que solo lleva quien se lo ganó.',
      stats: [
        { numero: '5', label: 'niveles' },
        { numero: '6', label: 'sellos por nivel' },
        { numero: '1', label: 'comunidad' },
      ],
      hint: 'Haz scroll y conoce los perfiles ↓',
      escarapelaHint: 'Arrástrala · tócala para darle la vuelta',
    },
    perfiles: {
      eyebrow: 'LOS 5 PERFILES',
      titleBase: 'ELIGE TU PRÓXIMO',
      titleAccent: 'NIVEL.',
      sub: 'Cinco perfiles, un mismo camino. Haz scroll y mira qué desbloqueas en cada uno.',
    },
    cierre: {
      titleBase: 'TU PRIMER SELLO TE',
      titleAccent: 'ESPERA',
      sub: 'Inscríbete con tu correo institucional y empieza hoy como Rookie.',
      subSesion: 'Sigue sumando sellos en tu Pasaporte ZAG.',
    },
    cta: {
      sinSesion: { label: 'Unirme a la comunidad zaggista', href: 'registro.html' },
      conSesion:  { label: 'Subir de nivel',                href: 'perfil.html#retos' },
      retosCumplidos: { label: 'Ver los retos cumplidos', href: 'perfil.html#retos' },
      conSesionTope: { label: 'Ver mi perfil',              href: 'perfil.html'   },
    },
  };

  return { PERFILES: PERFILES, UI: UI };
})();
