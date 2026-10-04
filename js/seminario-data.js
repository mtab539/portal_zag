/* ============================================================
   PORTAL ZAG — Seminario Somos ZAG (seminario.html)
   Datos del seminario y textos de la interfaz.
   Todo se expone en window.ZAG_SEMINARIO. Sin dependencias.

   Fechas y horas se interpretan en America/Bogota (UTC-5, sin
   horario de verano).
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
    inicioISO: '2026-11-12T08:30:00-05:00',
    lugar: 'Auditorio Principal',
    horarioConfirmado: true,
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
      id: 'socorro-jaramillo',
      nombre: 'Socorro Jaramillo',
      cargo: 'Conferencista invitada',
      empresa: '',
      iniciales: 'SJ',
      color: 'naranja',
      foto: 'assets/img/ponentes/Socorro-Jaramillo-Velasquez.webp',
    },
    {
      id: 'hernan-truque',
      nombre: 'Hernán Truque',
      cargo: 'Ponente invitado',
      empresa: '',
      iniciales: 'HT',
      color: 'azul',
      foto: 'assets/img/ponentes/hernan.jpg',
    },
    {
      id: 'jardin-botanico',
      nombre: 'Jardín Botánico del Quindío',
      cargo: 'Caso de estudio',
      empresa: '',
      iniciales: 'JB',
      color: 'azulprofundo',
      foto: 'assets/img/ponentes/jardinbotanico.jpeg',
    },
    {
      id: 'ia-produccion',
      nombre: 'IA en Producción y Marketing',
      cargo: 'Conferencia',
      empresa: '',
      iniciales: 'IA',
      color: 'naranja',
      foto: 'assets/img/ponentes/ia2.jpg',
    },
    {
      id: 'agencia-cj-martins',
      nombre: 'Agencia CJ Martins',
      cargo: 'Agencia',
      empresa: 'Manizales',
      iniciales: 'CJ',
      color: 'azul',
      foto: 'assets/img/ponentes/cjmartins.png',
    },
    {
      id: 'agencia-conexion',
      nombre: 'Agencia Conexión',
      cargo: 'Agencia',
      empresa: 'Armenia',
      iniciales: 'AC',
      color: 'azulprofundo',
      foto: 'assets/img/ponentes/conexionagencia.jpg',
    },
    {
      id: 'agencias-moderador',
      nombre: 'Agencias invitadas y moderador EAM',
      cargo: 'Panel conversatorio',
      empresa: 'EAM',
      iniciales: 'AE',
      color: 'naranja',
      foto: 'assets/img/ponentes/bernardo.jpg',
    },
    {
      id: 'matti',
      nombre: 'Tattiana Bernal y Mariana Tabares',
      cargo: 'Presentadoras',
      empresa: 'EAM',
      subtitulo: 'Creadoras del ZAG - Agencia Matti',
      iniciales: 'MT',
      color: 'azul',
      foto: 'assets/img/ponentes/matti.jpg',
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
      id: 'd1-b1', dia: 'dia-1', inicio: '08:30', fin: '09:00', tipo: 'break', icon: 'cafe',
      sala: '', titulo: 'Registro y {Acreditación}',
      descripcion: 'Bienvenida y entrega de material ZAG.',
      temas: [], ponentes: [],
    },
    {
      id: 'd1-c1', dia: 'dia-1', inicio: '09:00', fin: '09:20', tipo: 'charla',
      sala: 'Auditorio Principal', titulo: 'Apertura e {Introducción} ZAG',
      descripcion: 'Instalación del seminario y filosofía de Marty Neumeier.',
      temas: [], ponentes: [],
    },
    {
      id: 'd1-c2', dia: 'dia-1', inicio: '09:20', fin: '10:30', tipo: 'charla',
      sala: 'Auditorio Principal', titulo: 'Marca {Territorio} — «Quindío Corazón Mío»',
      descripcion: 'Conferencia principal sobre marca territorio.',
      temas: ['Branding', 'Territorio'], ponentes: ['socorro-jaramillo'],
    },
    {
      id: 'd1-b2', dia: 'dia-1', inicio: '10:30', fin: '11:00', tipo: 'break', icon: 'cafe',
      sala: '', titulo: 'Coffee Break & {Networking}',
      descripcion: 'Espacio de relacionamiento.',
      temas: [], ponentes: [],
    },
    {
      id: 'd1-c3', dia: 'dia-1', inicio: '11:00', fin: '12:15', tipo: 'charla',
      sala: 'Auditorio Principal', titulo: 'Marketing de {Música} en el Territorio',
      descripcion: 'Ponencia sobre marketing musical territorial.',
      temas: ['Marketing', 'Música'], ponentes: ['hernan-truque'],
    },
    {
      id: 'd1-b3', dia: 'dia-1', inicio: '12:15', fin: '14:00', tipo: 'break', icon: 'almuerzo',
      sala: '', titulo: 'Receso de {Almuerzo}',
      descripcion: '',
      temas: [], ponentes: [],
    },
    {
      id: 'd1-c4', dia: 'dia-1', inicio: '14:00', fin: '15:30', tipo: 'charla',
      sala: 'Auditorio Principal', titulo: 'Marketing {Ambiental}',
      descripcion: 'Ponencia y caso de estudio sobre marketing ambiental.',
      temas: ['Marketing', 'Ambiental'], ponentes: ['jardin-botanico'],
    },
    {
      id: 'd1-t1', dia: 'dia-1', inicio: '15:30', fin: '16:30', tipo: 'taller',
      sala: 'Auditorio Principal', titulo: 'Identificando el {ZAG} de nuestra región',
      descripcion: 'Taller práctico y conversatorio del Día 1.',
      temas: ['ZAG', 'Región'], ponentes: [],
    },

    /* ---------- DÍA 2 · Viernes 13 de noviembre ---------- */
    {
      id: 'd2-c1', dia: 'dia-2', inicio: '08:30', fin: '09:00', tipo: 'charla',
      sala: 'Auditorio Principal', titulo: 'Reapertura y {Resumen} Día 1',
      descripcion: 'Dinámica de activación Zaggista.',
      temas: [], ponentes: [],
    },
    {
      id: 'd2-c2', dia: 'dia-2', inicio: '09:00', fin: '10:15', tipo: 'charla',
      sala: 'Auditorio Principal', titulo: 'Inteligencia Artificial {Creativa}',
      descripcion: 'IA en Producción y Marketing.',
      temas: ['IA', 'Marketing'], ponentes: ['ia-produccion'],
    },
    {
      id: 'd2-b1', dia: 'dia-2', inicio: '10:15', fin: '10:45', tipo: 'break', icon: 'cafe',
      sala: '', titulo: 'Coffee Break & {Networking}',
      descripcion: 'Espacio de relacionamiento.',
      temas: [], ponentes: [],
    },
    {
      id: 'd2-c3', dia: 'dia-2', inicio: '10:45', fin: '11:45', tipo: 'charla',
      sala: 'Auditorio Principal', titulo: 'Perspectiva {Interdepartamental}',
      descripcion: 'Ponencia de Agencia CJ Martins.',
      temas: ['Agencia'], ponentes: ['agencia-cj-martins'],
    },
    {
      id: 'd2-c4', dia: 'dia-2', inicio: '11:45', fin: '12:45', tipo: 'charla',
      sala: 'Auditorio Principal', titulo: 'Retos de la Agencia {Local}',
      descripcion: 'Ponencia de Agencia Conexión.',
      temas: ['Agencia'], ponentes: ['agencia-conexion'],
    },
    {
      id: 'd2-b2', dia: 'dia-2', inicio: '12:45', fin: '14:15', tipo: 'break', icon: 'almuerzo',
      sala: '', titulo: 'Receso de {Almuerzo}',
      descripcion: '',
      temas: [], ponentes: [],
    },
    {
      id: 'd2-c5', dia: 'dia-2', inicio: '14:15', fin: '15:15', tipo: 'charla',
      sala: 'Auditorio Principal', titulo: 'El {Futuro} de la Publicidad en el Eje Cafetero',
      descripcion: 'Panel conversatorio con agencias invitadas.',
      temas: ['Publicidad', 'Futuro'], ponentes: ['agencias-moderador'],
    },
    {
      id: 'd2-c6', dia: 'dia-2', inicio: '15:15', fin: '16:30', tipo: 'charla',
      sala: 'Auditorio Principal', titulo: 'Lanzamiento Comunidad {Zaggista} EAM',
      descripcion: 'Presentación del Manifiesto, equipo directivo y hoja de ruta.',
      temas: ['Comunidad', 'ZAG'], ponentes: ['matti'],
    },
    {
      id: 'd2-n1', dia: 'dia-2', inicio: '16:30', fin: '17:00', tipo: 'networking',
      sala: 'Auditorio Principal', titulo: 'Cierre, Fotos y Brindis de {Celebración}',
      descripcion: 'Cierre oficial del evento.',
      temas: ['Cierre'], ponentes: [],
    },
  ];

  var UI = {
    /* Hero */
    heroKicker: 'Seminario · 30 años de Publicidad EAM',
    heroSub:
      'Dos días de charlas, talleres y conversaciones con quienes rompen lo obvio. 200 cupos por día.',
    heroCta: 'Reservar mi lugar',
    heroCuposPrefix: 'Cupos por día · ',
    heroChipFecha: '12 y 13 de noviembre de 2026',
    heroChipLugar: 'Auditorio Principal · Campus EAM',
    heroChipHora: '08:30 AM – 05:00 PM',
    marquee: 'Somos ZAG • 12·13 Nov • Charlas • Taller • Networking •',
    countDias: 'días',
    countHoras: 'horas',
    countMin: 'minutos',
    countSeg: 'segundos',
    esHoy: '¡Es hoy!',
    gracias: 'Gracias por ser ZAG',

    /* Line-up */
    lineupKicker: 'Line-up',
    lineupTitle: 'Quién rompe lo {obvio}',
    lineupNote:
      'Line-up en confirmación: pueden sumarse voces más cerca del evento. Los horarios corresponden a la primera actividad de cada persona.',
    lineupChipDia: 'Día {n} · {hora}',

    /* Marcas */
    marcaKicker: 'Marcas aliadas',
    marcaTitle: 'Con el apoyo de quienes también hacen {zag}',

    /* Agenda */
    tabDia1: 'Jue 12 Nov · Día 1',
    tabDia2: 'Vie 13 Nov · Día 2',
    filtroLabel: 'Filtro',
    filtroAll: 'Todas',
    tipoNames: { charla: 'Charlas', taller: 'Talleres', networking: 'Networking', break: 'Breaks' },
    tipoSingular: { charla: 'Charla', taller: 'Taller', networking: 'Networking', break: 'Break' },
    vistaLista: 'Ver agenda en lista',
    vistaGrilla: 'Ver agenda en grilla',
    mostrando: 'Mostrando {n} actividades',
    horasNota: 'Horas tentativas · pueden cambiar',

    /* Reserva por día */
    stripPlaceholder: 'Auditorio Principal',
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
    modalDetalle: '',
    modalCalendar: 'Agregar a Google Calendar',
    modalEntendido: 'Entendido',

    /* Pie */
    resetDemo: 'Reiniciar demo',
    resetHecho: 'Demo reiniciada: volvés a contar desde cero.',

    /* CTA final */
    finalKicker: '',
    finalTitle: 'Somos ZAG. ¿Y tú?',
    finalSub: '200 cupos por día. Reserva tu experiencia ZAG ahora.',
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
