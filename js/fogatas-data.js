/* ============================================================
   PORTAL ZAG — Fogatas ZAG (fogatas.html)
   Datos demo de los encuentros y textos de la interfaz.
   Todo se expone en window.ZAG_FOGATAS. Sin dependencias.

   Zona horaria de todas las fechas: America/Bogota (UTC-5, sin horario
   de verano). El separador entrePróximas y Pasadas se calcula con la
   hora de FIN contra new Date(), no contra un campo "pasada".
   ============================================================ */

window.ZAG_FOGATAS = (function () {
  'use strict';

  var CUPOS_MAX = 15;

  var NIVEL_NAMES = {
    rookie: 'Rookie',
    strategist: 'Strategist',
    creator: 'Creator',
    master: 'Master',
    senior: 'Sociedad ZAG',
  };

  var FOGATAS = [
    /* ---------- PRÓXIMAS ---------- */
    {
      id: 'f01',
      numero: 1,
      tema: 'Fracasos que me hicieron publicista',
      descripcion:
        'Tres egresados cuentan la campaña que peor les salió, sin editing: qué prometieron, qué salió y qué aprendieron después. Hablamos de los briefs que no leímos, los clientes que cambiaron de opinión y las ideas que se murieron en una reunión.',
      inicio: '2026-10-08T17:00:00-05:00',
      fin: '2026-10-08T19:00:00-05:00',
      lugar: 'Campus EAM, Cancha Bloque C',
      anfitrion: { nombre: 'Laura Gómez', iniciales: 'LG', rol: 'Egresada 2019 · Directora creativa freelance' },
      cupos: CUPOS_MAX,
      ocupados: 9,
    },
    {
      id: 'f02',
      numero: 2,
      tema: '¿La IA hace zig o zag?',
      descripcion:
        'Conversación abierta sobre cuándo la IA te empuja a ser más creativo y cuándo te acomoda hasta dejarte igual a todos. Trayectos con herramientas, prompts que sí sirvieron y ese momento exacto en que la máquina te devuelve lo que ya habías visto cien veces.',
      inicio: '2026-10-21T17:30:00-05:00',
      fin: '2026-10-21T19:30:00-05:00',
      lugar: 'Campus EAM, Cancha Bloque C',
      anfitrion: { nombre: 'Daniel Rueda', iniciales: 'DR', rol: 'Egresado 2020 · Growth Marketer' },
      cupos: CUPOS_MAX,
      ocupados: 13,
    },
    {
      id: 'f03',
      numero: 3,
      tema: 'Pauta sin miedo',
      descripcion:
        'Lo que nadie te dice de tu primer cliente con Meta Ads: cómo se arma un presupuesto que no se coma solo, qué errores se repiten y, lo más importante, cómo cobrar lo que vale. Trae tus dudas, Salimos con números reales, no con tips de Instagram.',
      inicio: '2026-11-05T17:00:00-05:00',
      fin: '2026-11-05T19:00:00-05:00',
      lugar: 'Campus EAM, Cancha Bloque C',
      anfitrion: { nombre: 'Camilo Torres', iniciales: 'CT', rol: 'Egresado 2022 · Media Buyer' },
      cupos: CUPOS_MAX,
      ocupados: 15,
    },
    {
      id: 'f04',
      numero: 4,
      tema: 'Portafolio que no parezca tarea',
      descripcion:
        'Trae tu portafolio y lo revisamos en grupo, sin juicio y con ideas para que hable por ti. Vemos portfolios que repiten el brief del cliente, los que nadie entiende y cómo ordenar lo tuyo para que se entienda en treinta segundos.',
      inicio: '2026-11-17T16:30:00-05:00',
      fin: '2026-11-17T18:30:00-05:00',
      lugar: 'Campus EAM, Cancha Bloque C',
      anfitrion: { nombre: 'Valeria Pinzón', iniciales: 'VP', rol: 'Egresada 2021 · Productora audiovisual' },
      cupos: CUPOS_MAX,
      ocupados: 4,
    },

    /* ---------- PASADAS (fechas y datos inventados) ---------- */
    {
      id: 'f05',
      numero: 5,
      tema: 'El fin del zig',
      descripcion:
        'La fogata que abrió la campaña de los 30 años. Nos sentamos a contar por qué este programa eligió el camino opuesto al de todos y qué queremos que pase de aquí en adelante. Chocolate, risas y cero slides.',
      inicio: '2026-09-03T18:00:00-05:00',
      fin: '2026-09-03T20:00:00-05:00',
      lugar: 'Campus EAM, Cancha Bloque C',
      anfitrion: { nombre: 'Mariana Trujillo', iniciales: 'MT', rol: 'Egresada 2018 · Head of Brand' },
      cupos: CUPOS_MAX,
      ocupados: CUPOS_MAX,
      asistieron: 15,
    },
    {
      id: 'f06',
      numero: 6,
      tema: 'Tu tira de fotos, tu primera pieza',
      descripcion:
        'Trajimos cámara y rollos, y salimos con una pieza cada uno. Vimos cómo bajarte de la idea perfecta y trabajar con lo que había en la bolsa terminó rindiendo más que la referencia que traías en la cabeza.',
      inicio: '2026-09-21T18:00:00-05:00',
      fin: '2026-09-21T20:00:00-05:00',
      lugar: 'Campus EAM, Cancha Bloque C',
      anfitrion: { nombre: 'Nicolás Bueno', iniciales: 'NB', rol: 'Egresado 2017 · Fotógrafo' },
      cupos: CUPOS_MAX,
      ocupados: 12,
      asistieron: 12,
    },
  ];

  var UI = {
    /* ---- Hero ---- */
    heroKicker: 'COMUNIDAD ZAG',
    heroTitleA: 'Fogatas',
    heroTitleB: 'ZAG',
    heroSub: 'Lo que no se dice en clase, se dice alrededor del fuego.',

    /* ---- Section ---- */
    sectionTitle: 'Fogatas ZAG',
    sectionCopy:
      'Encuentros informales, abiertos a todos los niveles. Sin charcoal, sin speaker, sin slides: solo chocolate, malvaviscos y conversación que se queda.',

    /* ---- Filtro ---- */
    tabProximas: 'Próximas',
    tabPasadas: 'Pasadas',
    vacioProximas: 'No hay fogatas prendidas por ahora. Pronto encendemos la próxima.',
    vacioPasadas: 'Todavía no hay fogatas apagadas. Qué envidia, en serio.',

    /* ---- Acceso (sin sesión) ---- */
    accessKicker: 'COMUNIDAD ZAG',
    accessTitle: 'Activa tu perfil para reservar',
    accessCopy:
      'Las fogatas son abiertas a todos los niveles, pero necesitas un perfil para guardar tu lugar. Actívalo y seguí.',
    accessCtaPrimary: 'Activar mi perfil',
    accessCtaSecondary: 'Entrar en modo demo',
    accessLevelLabel: 'Elige tu nivel de la demo',
    accessLevelHint: 'Solo para la demo: el nivel no cambia tu perfil real.',
    accessSessionLabel: 'Nivel',

    /* ---- Estados del CTA ---- */
    ctaSinSesion: 'Activa tu perfil para reservar',
    ctaReservar: 'Quiero asistir',
    ctaReservando: 'Reservando…',
    ctaReservado: 'Ya tienes tu lugar ✓',
    ctaAgotada: 'Agotada',
    ctaCancelar: 'Cancelar reserva',
    ctaConfirmar: 'Sí, liberar',
    ctaNo: 'No',
    cancelPregunta: '¿Liberar tu cupo?',
    cancelNota: 'Se le devuelve a quien llega después de vos.',

    /* ---- Cupos ---- */
    cuposQuedan: 'Quedan',
    cuposDe: 'de',
    cuposUltimos: '¡Últimos cupos!',
    cuposLlenos: 'Cupos llenos · atento a la próxima',
    yaPaso: 'Ya pasó',

    /* ---- Calendario ---- */
    calendarCta: 'Agregar a Google Calendar',
    calendarEnlaceCorto: 'Agregar a Google Calendar',

    /* ---- Popup ---- */
    modalTitulo: '¡Listo!',
    modalTexto: 'Ya tienes un espacio reservado en la fogata, nos vemos allí.',
    modalEntendido: 'Entendido',

    /* ---- Footer / avisos ---- */
    resetDemo: 'Reiniciar demo',
    resetHecho: 'Demo reiniciada. Se soltaron tus reservas de fogata.',
    reservadoAnunciado: 'Reservaste tu lugar en la fogata.',
    canceladoAnunciado: 'Liberaste tu cupo.',
    sinCupos: 'No quedan cupos en esta fogata.',
  };

  return {
    fogatas: FOGATAS,
    ui: UI,
    cuposMax: CUPOS_MAX,
    nivelNames: NIVEL_NAMES,
    nivelOrder: ['rookie', 'strategist', 'creator', 'master', 'senior'],
    LS_RESERVAS: 'zag_fogatas_reservas',
    TZ: 'America/Bogota',
  };
})();
