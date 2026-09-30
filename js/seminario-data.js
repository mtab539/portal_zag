/* ============================================================
   PORTAL ZAG — Seminario Somos ZAG (seminario.html)
   Datos demo del seminario y textos de la interfaz.
   Todo se expone en window.ZAG_SEMINARIO. Sin dependencias.

   Fechas y horas se interpretan en America/Bogota (UTC-5, sin
   horario de verano). El lugar y el horario aún no están
   confirmados: la interfaz lo dice y el enlace de Google Calendar
   se genera como evento de día completo (horarioConfirmado: false).
   ============================================================ */

window.ZAG_SEMINARIO = (function () {
  'use strict';

  var NIVEL_NAMES = {
    rookie: 'Rookie',
    strategist: 'Strategist',
    creator: 'Creator',
    master: 'Master',
    senior: 'Sociedad ZAG',
  };

  var EVENTO = {
    nombre: 'Somos ZAG',
    edicion: 'Seminario · 30 años de Publicidad EAM',
    marca: 'ZAG',
    inicioISO: '2026-11-12T00:00:00-05:00',
    lugar: null,
    horarioConfirmado: false,
    dias: [
      {
        id: 'dia-1',
        label: 'Día 1',
        fecha: '2026-11-12',
        fechaLarga: 'Jueves 12 de noviembre',
        cupos: 200,
        ocupados: 137,
      },
      {
        id: 'dia-2',
        label: 'Día 2',
        fecha: '2026-11-13',
        fechaLarga: 'Viernes 13 de noviembre',
        cupos: 200,
        ocupados: 62,
      },
    ],
  };

  var PONENTES = [
    {
      id: 'laura-gomez',
      nombre: 'Laura Gómez',
      cargo: 'Directora creativa freelance',
      empresa: 'Egresada 2019',
      iniciales: 'LG',
      color: 'naranja',
      foto: 'assets/img/ponentes/laura-gomez.webp',
    },
    {
      id: 'camilo-torres',
      nombre: 'Camilo Torres',
      cargo: 'Especialista en pauta digital',
      empresa: 'Andina Creative Lab',
      iniciales: 'CT',
      color: 'azul',
      foto: 'assets/img/ponentes/camilo-torres.webp',
    },
    {
      id: 'daniel-rueda',
      nombre: 'Daniel Rueda',
      cargo: 'Growth Marketer',
      empresa: 'Egresado 2020',
      iniciales: 'DR',
      color: 'azulprofundo',
      foto: 'assets/img/ponentes/daniel-rueda.webp',
    },
    {
      id: 'valeria-pinzon',
      nombre: 'Valeria Pinzón',
      cargo: 'Directora de contenido',
      empresa: 'Colibrí Brands',
      iniciales: 'VP',
      color: 'naranja',
      foto: 'assets/img/ponentes/valeria-pinzon.webp',
    },
    {
      id: 'sofia-arango',
      nombre: 'Sofía Arango',
      cargo: 'Fundadora',
      empresa: 'Ceiba Estudio',
      iniciales: 'SA',
      color: 'azul',
      foto: 'assets/img/ponentes/sofia-arango.webp',
    },
    {
      id: 'mateo-restrepo',
      nombre: 'Mateo Restrepo',
      cargo: 'Product Designer',
      empresa: 'Guadua Digital',
      iniciales: 'MR',
      color: 'azulprofundo',
      foto: 'assets/img/ponentes/mateo-restrepo.webp',
    },
    {
      id: 'isabela-duque',
      nombre: 'Isabela Duque',
      cargo: 'Creative Producer',
      empresa: 'Montaña Studio',
      iniciales: 'ID',
      color: 'naranja',
      foto: 'assets/img/ponentes/isabela-duque.webp',
    },
    {
      id: 'andres-quintero',
      nombre: 'Andrés Quintero',
      cargo: 'Director del programa de Publicidad',
      empresa: 'EAM',
      iniciales: 'AQ',
      color: 'azulprofundo',
      foto: 'assets/img/ponentes/andres-quintero.webp',
    },
    {
      id: 'natalia-ospina',
      nombre: 'Natalia Ospina',
      cargo: 'Consultora en contenidos digitales',
      empresa: 'Andina Creative Lab',
      iniciales: 'NO',
      color: 'azul',
      foto: 'assets/img/ponentes/natalia-ospina.webp',
    },
    {
      id: 'juan-esteban-cardona',
      nombre: 'Juan Esteban Cardona',
      cargo: 'Director comercial',
      empresa: 'Brújula Media',
      iniciales: 'JC',
      color: 'naranja',
      foto: 'assets/img/ponentes/juan-esteban-cardona.webp',
    },
  ];

  var MARCAS = [
    { id: 'brujula-media', nombre: 'Brújula Media', logo: 'assets/img/marcas/brujula-media.svg' },
    { id: 'andina-creative-lab', nombre: 'Andina Creative Lab', logo: 'assets/img/marcas/andina-creative-lab.svg' },
    { id: 'guadua-digital', nombre: 'Guadua Digital', logo: 'assets/img/marcas/guadua-digital.svg' },
    { id: 'ceiba-estudio', nombre: 'Ceiba Estudio', logo: 'assets/img/marcas/ceiba-estudio.svg' },
    { id: 'montana-studio', nombre: 'Montaña Studio', logo: 'assets/img/marcas/montana-studio.svg' },
    { id: 'colibri-brands', nombre: 'Colibrí Brands', logo: 'assets/img/marcas/colibri-brands.svg' },
  ];

  var AGENDA = [
    /* ---------- DÍA 1 · Jueves 12 de noviembre ---------- */
    {
      id: 'd1-b1', dia: 'dia-1', inicio: '08:00', fin: '08:45', tipo: 'break', icon: 'cafe',
      sala: 'Zona común', titulo: 'Registro y café de bienvenida',
      descripcion: 'Café, mapa del campus y un sello más en tu tira. Empezamos puntuales.',
      temas: [], ponentes: [],
    },
    {
      id: 'd1-c1', dia: 'dia-1', inicio: '08:45', fin: '09:00', tipo: 'charla',
      sala: 'Auditorio principal', titulo: 'Apertura: 30 años haciendo ZAG',
      descripcion: 'Por qué este programa no repite ni el eslogan: tres décadas eligiendo el camino incómodo.',
      temas: [], ponentes: ['andres-quintero'],
    },
    {
      id: 'd1-c2', dia: 'dia-1', inicio: '09:00', fin: '09:50', tipo: 'charla',
      sala: 'Auditorio principal', titulo: 'La marca que no se parece a nadie',
      descripcion: 'Criterio para encontrar la diferencia real de una marca y defenderla sin pedir permiso.',
      temas: ['Branding'], ponentes: ['sofia-arango'],
    },
    {
      id: 'd1-t1', dia: 'dia-1', inicio: '10:00', fin: '11:30', tipo: 'taller',
      sala: 'Sala de talleres', titulo: 'Del brief al quiebre: ideación sin zig',
      descripcion: 'Dos consignas, seis conceptos y cero ideas de revistilla. Se trabaja, se corta y se justifica en el lugar.',
      temas: ['Creatividad', 'Concepto'], ponentes: ['laura-gomez', 'juan-esteban-cardona'],
    },
    {
      id: 'd1-b2', dia: 'dia-1', inicio: '11:30', fin: '11:50', tipo: 'break', icon: 'cafe',
      sala: 'Zona común', titulo: 'Break',
      descripcion: 'Café, agua y el chisme productivo de la mañana.',
      temas: [], ponentes: [],
    },
    {
      id: 'd1-c3', dia: 'dia-1', inicio: '11:50', fin: '12:40', tipo: 'charla',
      sala: 'Auditorio principal', titulo: 'Pauta con criterio: datos que sí cuentan historias',
      descripcion: 'Números que respaldan ideas, no que las reemplazan: cómo leer el reporte sin morir en el intento.',
      temas: ['Pauta digital', 'Meta Ads'], ponentes: ['camilo-torres'],
    },
    {
      id: 'd1-b3', dia: 'dia-1', inicio: '12:40', fin: '14:00', tipo: 'break', icon: 'almuerzo',
      sala: '', titulo: 'Almuerzo libre',
      descripcion: 'Tiempo para comer, pelar al contrincante o estudiar el pitch ajeno.',
      temas: [], ponentes: [],
    },
    {
      id: 'd1-t2', dia: 'dia-1', inicio: '14:00', fin: '15:30', tipo: 'taller',
      sala: 'Sala de talleres', titulo: 'IA como copiloto creativo, no como piloto automático',
      descripcion: 'Cuándo la IA acelera tu idea y cuándo te la roba: prompts, fallos y ajustes en vivo.',
      temas: ['IA'], ponentes: ['natalia-ospina'],
    },
    {
      id: 'd1-c4', dia: 'dia-1', inicio: '15:40', fin: '16:30', tipo: 'charla',
      sala: 'Auditorio principal', titulo: 'Fracasé en público y me fue bien',
      descripcion: 'Una campaña fallida contada con números, abrazos y lo que nadie pone en LinkedIn.',
      temas: ['Growth', 'Fracasos'], ponentes: ['daniel-rueda'],
    },
    {
      id: 'd1-n1', dia: 'dia-1', inicio: '16:30', fin: '17:30', tipo: 'networking',
      sala: 'Zona de networking', titulo: 'Café con las marcas aliadas',
      descripcion: 'Las marcas aliadas abren su mesa: vení con tu tarjeta o inventate una.',
      temas: ['Networking'], ponentes: [],
    },

    /* ---------- DÍA 2 · Viernes 13 de noviembre ---------- */
    {
      id: 'd2-b1', dia: 'dia-2', inicio: '08:30', fin: '09:00', tipo: 'break', icon: 'cafe',
      sala: 'Zona común', titulo: 'Café de bienvenida',
      descripcion: 'Segundo round: café, mapa y reconocerse del día anterior.',
      temas: [], ponentes: [],
    },
    {
      id: 'd2-c1', dia: 'dia-2', inicio: '09:00', fin: '09:50', tipo: 'charla',
      sala: 'Auditorio principal', titulo: 'Branding desde las regiones: el Eje Cafetero también hace zag',
      descripcion: 'Marcas que triunfan fuera de la capital con identidad propia y orgullo local.',
      temas: ['Branding'], ponentes: ['sofia-arango'],
    },
    {
      id: 'd2-t1', dia: 'dia-2', inicio: '10:00', fin: '11:30', tipo: 'taller',
      sala: 'Sala de talleres', titulo: 'Contenido que no parece anuncio',
      descripcion: 'Formatos que se ven como un reel, se sienten como un amigo y venden como publicidad.',
      temas: ['Social media', 'Audiovisual'], ponentes: ['isabela-duque', 'valeria-pinzon'],
    },
    {
      id: 'd2-b2', dia: 'dia-2', inicio: '11:30', fin: '11:50', tipo: 'break', icon: 'cafe',
      sala: 'Zona común', titulo: 'Break',
      descripcion: 'Recargá pilas: la tarde trae mesas abiertas.',
      temas: [], ponentes: [],
    },
    {
      id: 'd2-c2', dia: 'dia-2', inicio: '11:50', fin: '12:40', tipo: 'charla',
      sala: 'Auditorio principal', titulo: 'UX: diseñar para humanos cansados',
      descripcion: 'Interfaces que no humillan: decisiones de diseño con los dedos y con la cabeza.',
      temas: ['UX/UI'], ponentes: ['mateo-restrepo'],
    },
    {
      id: 'd2-b3', dia: 'dia-2', inicio: '12:40', fin: '14:00', tipo: 'break', icon: 'almuerzo',
      sala: '', titulo: 'Almuerzo libre',
      descripcion: 'Comida, aire y un pitch de pasillo si te animás.',
      temas: [], ponentes: [],
    },
    {
      id: 'd2-c3', dia: 'dia-2', inicio: '14:00', fin: '15:00', tipo: 'charla',
      sala: 'Auditorio principal', titulo: 'Mesa abierta: ¿qué publicidad viene?',
      descripcion: 'Tres egresados, un moderador sin guion y el público con micrófono abierto.',
      temas: ['Industria', 'Futuro'], ponentes: ['laura-gomez', 'camilo-torres', 'natalia-ospina'],
    },
    {
      id: 'd2-t2', dia: 'dia-2', inicio: '15:00', fin: '16:30', tipo: 'taller',
      sala: 'Sala de talleres', titulo: 'Tu portafolio en 90 minutos',
      descripcion: 'Menos retroescritura, más court: claves para que tu portafolio se hable solo.',
      temas: ['Portafolio'], ponentes: ['valeria-pinzon', 'juan-esteban-cardona'],
    },
    {
      id: 'd2-n1', dia: 'dia-2', inicio: '16:30', fin: '18:00', tipo: 'networking',
      sala: 'Zona de networking', titulo: 'Cierre Somos ZAG + networking',
      descripcion: 'Palabras finales, abrazos apretados y la última vuelta por las mesas de las marcas.',
      temas: ['Networking', 'Comunidad'], ponentes: ['andres-quintero'],
    },
  ];

  var UI = {
    /* Hero */
    heroKicker: 'Seminario · 30 años de Publicidad EAM',
    heroSub:
      'Dos días de charlas, talleres y conversaciones con quienes rompen lo obvio. 200 cupos por día para cenar ideas y no repetirlas.',
    heroCta: 'Reservar mi lugar',
    heroCuposPrefix: 'Cupos por día · ',
    heroChipFecha: '12 y 13 de noviembre de 2026',
    heroChipLugar: 'Lugar por confirmar',
    heroChipHora: 'Horario por confirmar',
    marquee: 'Somos ZAG ✦ 12·13 Nov ✦ Charlas ✦ Talleres ✦ Networking ✦',
    countDias: 'días',
    countHoras: 'horas',
    countMin: 'minutos',
    countSeg: 'segundos',
    esHoy: '¡Es hoy!',
    gracias: 'Gracias por ser ZAG',

    /* Line-up */
    lineupKicker: 'Line-up',
    lineupTitle: 'Quién rompe lo obvio',
    lineupNote:
      'Line-up en confirmación: pueden sumarse voces más cerca del evento. Los horarios corresponden a la primera actividad de cada persona.',
    lineupChipDia: 'Día {n} · {hora}',

    /* Marcas */
    marcaKicker: 'Marcas aliadas',
    marcaTitle: 'Con el apoyo de quienes también hacen zag',

    /* Agenda */
    tabDia1: 'Jue 12 Nov · Día 1',
    tabDia2: 'Vie 13 Nov · Día 2',
    filtroLabel: 'Filtro',
    filtroAll: 'Todas',
    tipoNames: { charla: 'Charlas', taller: 'Talleres', networking: 'Networking', break: 'Breaks' },
    vistaLista: 'Ver agenda en lista',
    vistaGrilla: 'Ver agenda en grilla',
    mostrando: 'Mostrando {n} actividades',
    horasNota: 'Horas tentativas · pueden cambiar',

    /* Reserva por día */
    stripPlaceholder: 'Lugar por confirmar',
    quedan: 'Quedan {n} de {cupos} cupos',
    ultimos: '¡Últimos cupos!',
    reservar: 'Reservar {dia}',
    reservando: 'Reservando…',
    reservadoConfirmado: 'Ya tienes tu lugar',
    agotado: 'Cupos agotados',
    sinSesion: 'Activa tu perfil para reservar',
    agregarCalendario: 'Agregar a Google Calendar',
    cancelarReserva: 'Cancelar reserva',
    confirmarLiberar: '¿Liberar tu cupo del {dia}?',
    confirmarSi: 'Sí, liberar',
    confirmarNo: 'No',
    reservadoAnunciado: 'Reserva confirmada.',
    liberadoAnunciado: 'Reserva cancelada.',

    /* Acceso */
    accessKicker: 'Sesiones por cupo',
    accessTitle: 'Activa tu perfil para reservar',
    accessCopy:
      'Para separar tu silla en el Seminario Somos ZAG necesitás estar en el programa o en la comunidad. Creá tu cuenta o entrá en modo demo con un nivel.',
    accessCtaPrimary: 'Crear mi cuenta',
    accessCtaSecondary: 'Entrar en modo demo',
    accessLevelLabel: 'Elegí tu nivel',
    accessLevelHint: 'Es una demo: tu perfil se guarda solo en este navegador.',

    /* Popup */
    modalTitulo: '¡Listo!',
    modalCopy: 'Ya tienes tu lugar en Somos ZAG · {dia}, {fechaLarga}. Nos vemos allí.',
    modalDetalle: 'Lugar y horario por confirmar: te avisamos por el portal.',
    modalCalendar: 'Agregar a Google Calendar',
    modalEntendido: 'Entendido',

    /* Pie */
    resetDemo: 'Reiniciar demo',
    resetHecho: 'Demo reiniciada: volvés a contar desde cero.',

    /* CTA final */
    finalKicker: 'Vení',
    finalTitle: 'Somos ZAG. ¿Y tú?',
    finalSub: '200 cupos por día. Cuando se acaban, se acaban.',
    finalCupos: '200 cupos por día',
  };

  return {
    evento: EVENTO,
    ponentes: PONENTES,
    marcas: MARCAS,
    agenda: AGENDA,
    ui: UI,
    nivelNames: NIVEL_NAMES,
    nivelOrder: ['rookie', 'strategist', 'creator', 'master', 'senior'],
    LS_RESERVAS: 'zag_seminario_reservas',
    TZ: 'America/Bogota',
  };
})();