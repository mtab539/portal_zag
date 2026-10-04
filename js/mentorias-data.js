/* ============================================================
   PORTAL ZAG — Mentorías ZAG (mentorias.html)
   Datos demo: los mentores, sus reglas de horario y los textos de
   la interfaz. Todo se expone en window.ZAG_MENTORIAS.

   Los horarios NO están escritos a mano: un generador crea las
   sesiones de las próximas 8 semanas a partir de reglas semanales
   (reglasGrupal / reglas1a1), en hora de Colombia, y descarta las
   que ya pasaron.

   Zona horaria: America/Bogota (UTC-5 todo el año, sin horario de
   verano), así que el desfase con UTC es fijo y los sellos para
   Google Calendar llevan -05:00.

   Los cupos ocupados son un pseudoaleatorio determinista a partir
   de mentorId + fechaISO: la misma fecha da siempre el mismo
   número, así que la demo no cambia al recargar. Al final se
   fuerzan dos casos para que siempre se vean un badge de "quedan
   2 cupos" y un horario "Lleno".
   ============================================================ */

window.ZAG_MENTORIAS = (function () {
  'use strict';

  /* ============================================================
     Constantes
     ============================================================ */

  var TZ = 'America/Bogota';

  var CUPOS_GRUPAL = 8;   /* máximo 8 personas por sesión grupal */
  var CUPOS_1A1 = 1;      /* la 1:1 es de una sola persona */
  var MIN_GRUPAL = 3;     /* a partir de este cupo libre sale el badge de urgencia */
  var SEMANAS = 8;        /* ventana de horarios generados */
  var DUR_GRUPAL = 60;    /* minutos */
  var DUR_1A1 = 45;

  /* Techo de reservas por estudiante (decisión de producto) */
  var MAX_POR_MENTOR = 1;
  var MAX_TOTAL = 3;

  var NIVEL_NAMES = {
    rookie: 'Rookie',
    strategist: 'Strategist',
    creator: 'Creator',
    master: 'Master',
    senior: 'Sociedad ZAG',
  };

  var NIVEL_ORDER = ['rookie', 'strategist', 'creator', 'master', 'senior'];

  /* dia abreviado -> indice de Date.getDay() (0 = domingo) */
  var DIAS = { dom: 0, lun: 1, mar: 2, mie: 3, jue: 4, vie: 5, sab: 6 };

  var DIAS_CORTOS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
  var DIAS_LARGOS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  var MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  var MESES_CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

  /* ============================================================
     Categorías de la fila de filtros
     Las 7 categorías de área se derivan de los temas de cada
     mentor, no de una lista aparte.
     ============================================================ */

  var CATEGORIAS = [
    { id: 'todos', label: 'Todos', icono: 'todos' },
    { id: 'semana', label: 'Disponibles esta semana', icono: 'reloj' },
    { id: 'pauta', label: 'Pauta', icono: 'pauta' },
    { id: 'branding', label: 'Branding', icono: 'branding' },
    { id: 'contenido', label: 'Contenido', icono: 'contenido' },
    { id: 'uxui', label: 'UX/UI', icono: 'uxui' },
    { id: 'growth', label: 'Growth', icono: 'growth' },
    { id: 'audiovisual', label: 'Audiovisual', icono: 'audiovisual' },
    { id: 'portafolio', label: 'Portafolio', icono: 'portafolio' },
  ];

  /* Las 3 áreas de "¿En qué necesitas ayuda?" */
  var AREAS = [
    {
      id: 'pauta',
      titulo: 'Pauta y datos',
      copy: 'Meta Ads, métricas y presupuestos: que tus números cuenten algo.',
      nota: '¿Por dónde empiezo?',
      mentor: 'camilo-torres',
    },
    {
      id: 'branding',
      titulo: 'Creatividad y branding',
      copy: 'Conceptos, marcas y campañas que no se parezcan a nada.',
      nota: 'Mi idea se parece a todas',
      mentor: 'laura-gomez',
    },
    {
      id: 'portafolio',
      titulo: 'Portafolio y carrera',
      copy: 'Tu portafolio, tu primer trabajo y cómo cobrar lo que vales.',
      nota: '¿Qué muestro primero?',
      mentor: 'mateo-restrepo',
    },
  ];

  /* ============================================================
     Los mentores
     foto: archivo local (4:5). Si no existiera, la tarjeta cae al
     bloque de color con iniciales. fotoFuente deja la página de
     Pixabay como referencia.
     ============================================================ */

  var MENTORES = [
    {
      id: 'camilo-torres',
      nombre: 'Camilo Torres',
      iniciales: 'CT',
      egreso: 2022,
      cargo: 'Media Buyer',
      empresa: 'Brújula Media',
      especialidad:
        'Te ayudo a que tu primera campaña de Meta Ads no queme el presupuesto.',
      bio:
        'Empecé buying con 300 mil pesos y un Excel que se rompía cada semana. Hoy muevo presupuesto para marcas que no tienen ni un dato ordenado. Aprendí a fuerza de informes feos y te ahorro ese camino.',
      temas: ['Meta Ads', 'Pauta digital', 'Analítica'],
      areas: ['pauta'],
      categorias: ['pauta', 'growth'],
      color: 'naranja',
      minNivelGrupal: 'strategist',
      sesionesDadas: 34,
      asistencia: 96,
      modalidades: ['virtual', 'presencial'],
      reglasGrupal: [
        { dia: 'mar', hora: '16:00', modalidad: 'virtual' },
        { dia: 'jue', hora: '17:30', modalidad: 'presencial' },
      ],
      reglas1a1: [
        { dia: 'lun', hora: '10:00' },
        { dia: 'mie', hora: '18:00' },
      ],
      foto: 'assets/img/mentores/camilo-torres.jpg',
      fotoFuente: 'https://pixabay.com/photos/male-model-portrait-man-face-7275452/',
    },
    {
      id: 'laura-gomez',
      nombre: 'Laura Gómez',
      iniciales: 'LG',
      egreso: 2019,
      cargo: 'Directora creativa',
      empresa: 'freelance',
      especialidad:
        'Si tu concepto se parece al de otros, lo armamos desde cero. Sin pedir permiso.',
      bio:
        'Soy directora creativa desde 2019: primero en agencia, hoy con clientes que me escriben porque los han visto. Lo que más me gusta es ese momento en que una idea deja de ser “correcta” y se vuelve tuya.',
      temas: ['Concepto creativo', 'Branding', 'Portafolio'],
      areas: ['branding'],
      categorias: ['branding', 'contenido', 'portafolio'],
      color: 'azul',
      minNivelGrupal: 'rookie',
      sesionesDadas: 51,
      asistencia: 98,
      modalidades: ['virtual', 'presencial'],
      reglasGrupal: [
        { dia: 'lun', hora: '15:00', modalidad: 'virtual' },
        { dia: 'mie', hora: '18:00', modalidad: 'presencial' },
      ],
      reglas1a1: [
        { dia: 'mar', hora: '11:00' },
        { dia: 'jue', hora: '16:00' },
      ],
      foto: 'assets/img/mentores/laura-gomez.jpg',
      fotoFuente: 'https://pixabay.com/photos/woman-smile-model-fashion-female-7895953/',
    },
    {
      id: 'daniel-rueda',
      nombre: 'Daniel Rueda',
      iniciales: 'DR',
      egreso: 2020,
      cargo: 'Growth Marketer',
      empresa: 'Andina Creative Lab',
      especialidad:
        'SEO, Growth y automatizaciones que no dependan de que alguien publique a mano.',
      bio:
        'Crescí copiando lo que miraba en Harvard y en blogs gringos hasta entender el porqué. Hoy armo sistemas de acquiring que funcionan solos. Traé tu landing rota y la desarmamos juntos.',
      temas: ['Growth', 'SEO', 'Automatización'],
      areas: ['pauta'],
      categorias: ['growth', 'pauta', 'contenido'],
      color: 'azulprofundo',
      minNivelGrupal: 'creator',
      sesionesDadas: 27,
      asistencia: 92,
      modalidades: ['virtual'],
      reglasGrupal: [{ dia: 'mar', hora: '18:00', modalidad: 'virtual' }],
      reglas1a1: [
        { dia: 'mie', hora: '17:00' },
        { dia: 'vie', hora: '10:00' },
      ],
      foto: 'assets/img/mentores/daniel-rueda.jpg',
      fotoFuente: 'https://pixabay.com/photos/young-clever-faces-people-happy-4549901/',
    },
    {
      id: 'valeria-pinzon',
      nombre: 'Valeria Pinzón',
      iniciales: 'VP',
      egreso: 2021,
      cargo: 'Productora audiovisual',
      empresa: 'Guadua Digital',
      especialidad:
        'Del guion al corte: video que aguante un pitch y una campaña a la vez.',
      bio:
        'Produzco, dirijo y edito. Si alguna vez tuviste un buen guion que murió por producción, lo revisamos y te digo qué se salva. Trabajo con lo que tenés, no con lo que no hay.',
      temas: ['Producción', 'Video', 'Redes'],
      areas: ['branding', 'portafolio'],
      categorias: ['audiovisual', 'contenido', 'branding'],
      color: 'naranja',
      minNivelGrupal: 'strategist',
      sesionesDadas: 22,
      asistencia: 95,
      modalidades: ['presencial'],
      reglasGrupal: [{ dia: 'vie', hora: '14:00', modalidad: 'presencial' }],
      reglas1a1: [
        { dia: 'mar', hora: '16:00' },
        { dia: 'jue', hora: '11:00' },
      ],
      foto: 'assets/img/mentores/valeria-pinzon.jpg',
      fotoFuente: 'https://pixabay.com/photos/idea-pointing-raise-hand-raise-3082824/',
    },
    {
      id: 'sofia-arango',
      nombre: 'Sofía Arango',
      iniciales: 'SA',
      egreso: 2018,
      cargo: 'Brand strategist',
      empresa: 'Ceiba Estudio',
      especialidad:
        'Tu marca necesita una idea que aguante una conversación, no un moodboard.',
      bio:
        'Hice estrategia para cervecería, banca y una app de medio. Lo que me gusta es sentarme a definir qué es tu marca cuando todo el mundo tiene una opinión distinta.',
      temas: ['Estrategia de marca', 'Naming', 'Posicionamiento'],
      areas: ['branding'],
      categorias: ['branding', 'contenido'],
      color: 'azul',
      minNivelGrupal: 'rookie',
      sesionesDadas: 44,
      asistencia: 97,
      modalidades: ['virtual', 'presencial'],
      reglasGrupal: [{ dia: 'jue', hora: '16:00', modalidad: 'virtual' }],
      reglas1a1: [
        { dia: 'mar', hora: '10:00' },
        { dia: 'vie', hora: '16:30' },
      ],
      foto: 'assets/img/mentores/sofia-arango.jpg',
      fotoFuente: 'https://pixabay.com/photos/woman-businesswoman-office-laptop-10489004/',
    },
    {
      id: 'mateo-restrepo',
      nombre: 'Mateo Restrepo',
      iniciales: 'MR',
      egreso: 2017,
      cargo: 'Director de UX',
      empresa: 'Montaña Studio',
      especialidad:
        'Tu portafolio no necesita ser lindo: necesita enseñar cómo pensaste.',
      bio:
        'Llevo siete años haciendo investigación de usuario y prototipos para bancos y marketplaces. Cuando reviso un portafolio siempre termino en lo mismo: el problema no era el diseño, era lo que no se contaba.',
      temas: ['UX/UI', 'Investigación', 'Prototipado'],
      areas: ['portafolio'],
      categorias: ['uxui', 'portafolio'],
      color: 'azulprofundo',
      minNivelGrupal: 'strategist',
      sesionesDadas: 39,
      asistencia: 94,
      modalidades: ['virtual'],
      reglasGrupal: [{ dia: 'mie', hora: '17:00', modalidad: 'virtual' }],
      reglas1a1: [
        { dia: 'lun', hora: '18:00' },
        { dia: 'jue', hora: '10:30' },
      ],
      foto: 'assets/img/mentores/mateo-restrepo.jpg',
      fotoFuente: 'https://pixabay.com/photos/man-freelance-technology-work-job-6494289/',
    },
    {
      id: 'juan-esteban-cardona',
      nombre: 'Juan Esteban Cardona',
      iniciales: 'JC',
      egreso: 2016,
      cargo: 'Fotógrafo y director de arte',
      empresa: 'independiente',
      especialidad:
        'Dirección de arte y fotografía: que tu campaña se vea como una, no como ocho fotos sueltas.',
      bio:
        'Hago fotos de producto, campañas y las dos cosas a la vez. Estudié Publicidad y terminé en un set con una cámara. Vengo a mirarte el portafolio con el ojo de quien tiene que responder por la imagen.',
      temas: ['Dirección de arte', 'Fotografía', 'Portafolio'],
      areas: ['portafolio', 'branding'],
      categorias: ['audiovisual', 'branding', 'portafolio'],
      color: 'crema',
      minNivelGrupal: 'rookie',
      sesionesDadas: 58,
      asistencia: 99,
      modalidades: ['presencial'],
      reglasGrupal: [{ dia: 'sab', hora: '10:00', modalidad: 'presencial' }],
      reglas1a1: [
        { dia: 'vie', hora: '15:00' },
        { dia: 'mar', hora: '19:00' },
      ],
      foto: 'assets/img/mentores/juan-esteban-cardona.jpg',
      fotoFuente: 'https://pixabay.com/photos/black-professional-4334648/',
    },
    {
      id: 'andres-quintero',
      nombre: 'Andrés Quintero',
      iniciales: 'AQ',
      egreso: 2015,
      cargo: 'Director del programa de Publicidad',
      empresa: 'EAM',
      especialidad:
        'Primer empleo, contrato y cuánto cobrar. Lo que no te enseñan por el pensum.',
      bio:
        'Llevo más de una década viendo estudiantes de este programa entrar a la industria. Sé qué piden, qué pagan y cómo se negocia. Esta mentoría es para los que están por salir, y también para los que ya salieron y siguen dando vueltas.',
      temas: ['Carrera', 'Primer empleo', 'Cómo cobrar'],
      areas: ['portafolio'],
      categorias: ['portafolio', 'contenido'],
      color: 'beige',
      minNivelGrupal: 'creator',
      sesionesDadas: 63,
      asistencia: 97,
      modalidades: ['presencial'],
      reglasGrupal: [{ dia: 'vie', hora: '11:00', modalidad: 'presencial' }],
      reglas1a1: [
        { dia: 'lun', hora: '09:00' },
        { dia: 'mie', hora: '12:00' },
      ],
      foto: 'assets/img/mentores/andres-quintero.jpg',
      fotoFuente: 'https://pixabay.com/photos/teacher-lecturer-writer-counselor-99741/',
    },
  ];

  /* ============================================================
     Fechas — todo se razona en días calendario de Colombia, no en
     la zona horaria de quien abre la página.
     ============================================================ */

  function dosDigitos(n) { return n < 10 ? '0' + n : String(n); }

  /* Fecha de hoy en Bogotá como 'YYYY-MM-DD' (sin hora). */
  function hoyISO() {
    try {
      var p = new Intl.DateTimeFormat('en-CA', {
        timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit',
      }).format(new Date());
      if (/^\d{4}-\d{2}-\d{2}$/.test(p)) return p;
    } catch (e) { /* sin Intl: caemos al reloj local */ }
    var d = new Date();
    return d.getFullYear() + '-' + dosDigitos(d.getMonth() + 1) + '-' + dosDigitos(d.getDate());
  }

  function partes(iso) {
    return {
      y: Number(iso.slice(0, 4)),
      m: Number(iso.slice(5, 7)),
      d: Number(iso.slice(8, 10)),
    };
  }

  /* Índice de día de la semana (0 = domingo) de un 'YYYY-MM-DD'. */
  function diaSemana(iso) {
    var p = partes(iso);
    return new Date(Date.UTC(p.y, p.m - 1, p.d)).getUTCDay();
  }

  function sumarDias(iso, n) {
    var p = partes(iso);
    var d = new Date(Date.UTC(p.y, p.m - 1, p.d + n));
    return d.getUTCFullYear() + '-' + dosDigitos(d.getUTCMonth() + 1) + '-' + dosDigitos(d.getUTCDate());
  }

  /* Sello de una hora 'HH:MM' a minutos, y de vuelta. */
  function minutos(hhmm) {
    return Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5));
  }

  function desdeMinutos(m) {
    return dosDigitos(Math.floor(m / 60)) + ':' + dosDigitos(m % 60);
  }

  /* ============================================================
     Cupos demo deterministas
     ============================================================ */

  /* Hash de cadena → entero positivo (variante FNV-1a). */
  function hash(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = (h * 16777619) >>> 0;
    }
    return h >>> 0;
  }

  /* Cupos ocupados para una sesión, siempre igual para la misma
     fecha: recargar no mueve nada. */
  function ocupadosDemo(mentorId, fechaISO, tipo) {
    if (tipo === '1a1') return hash(mentorId + fechaISO + 'a') % 2;
    return hash(mentorId + fechaISO) % (CUPOS_GRUPAL + 1);
  }

  /* ============================================================
     Generación de horarios
     ============================================================ */

  function idSesion(mentorId, tipo, fecha, hora) {
    return mentorId + ':' + tipo + ':' + fecha + 'T' + hora;
  }

  function construirSesion(mentor, tipo, fecha, hora, modalidad, duracion) {
    var h = Number(hora.slice(0, 2));
    var m = Number(hora.slice(3, 5));
    var fin = desdeMinutos(h * 60 + m + duracion);
    var fechaISO = fecha + 'T' + hora + ':00-05:00';

    return {
      id: idSesion(mentor.id, tipo, fecha, hora),
      mentorId: mentor.id,
      tipo: tipo,
      fecha: fecha,
      fechaISO: fechaISO,
      inicio: hora,
      fin: fin,
      duracion: duracion,
      modalidad: modalidad,
      cupos: tipo === '1a1' ? CUPOS_1A1 : CUPOS_GRUPAL,
      ocupados: ocupadosDemo(mentor.id, fechaISO, tipo),
    };
  }

  function generarSesiones() {
    var hoy = hoyISO();
    var ahora = Date.now();
    var lista = [];

    MENTORES.forEach(function (mentor) {
      /* Grupales: la modalidad viene de la regla. */
      mentor.reglasGrupal.forEach(function (r) {
        for (var s = 0; s < SEMANAS; s++) {
          var base = sumarDias(hoy, s * 7);
          var dow = DIAS[r.dia];
          var delta = (dow - diaSemana(base) + 7) % 7;
          var fecha = sumarDias(base, delta);
          if (Date.parse(fecha + 'T' + r.hora + ':00-05:00') <= ahora) continue;
          lista.push(construirSesion(mentor, 'grupal', fecha, r.hora, r.modalidad, DUR_GRUPAL));
        }
      });

      /* 1:1: el estudiante elige modalidad, así que la regla no la fija.
         Se generan con una modalidad neutra que el agendador reemplaza. */
      mentor.reglas1a1.forEach(function (r) {
        for (var s2 = 0; s2 < SEMANAS; s2++) {
          var base2 = sumarDias(hoy, s2 * 7);
          var dow2 = DIAS[r.dia];
          var delta2 = (dow2 - diaSemana(base2) + 7) % 7;
          var fecha2 = sumarDias(base2, delta2);
          if (Date.parse(fecha2 + 'T' + r.hora + ':00-05:00') <= ahora) continue;
          lista.push(construirSesion(mentor, '1a1', fecha2, r.hora, mentor.modalidades[0], DUR_1A1));
        }
      });
    });

    lista.sort(function (a, b) {
      return Date.parse(a.fechaISO) - Date.parse(b.fechaISO);
    });

    forzarCasosDemo(lista);
    return lista;
  }

  /* Dos ajustes fijos sobre los datos ya deterministas, para que la
     demo siempre muestre los dos estados que hay que poder ver: el
     badge de "quedan 2 cupos" y un horario "Lleno". */
  function forzarCasosDemo(lista) {
    var primeroDe = function (mentorId) {
      for (var i = 0; i < lista.length; i++) {
        if (lista[i].mentorId === mentorId && lista[i].tipo === 'grupal') return lista[i];
      }
      return null;
    };

    var urgente = primeroDe('laura-gomez');   /* 8 - 6 = 2 cupos → badge */
    if (urgente) urgente.ocupados = CUPOS_GRUPAL - 2;

    var lleno = primeroDe('mateo-restrepo');  /* 8 - 8 = 0 cupos → "Lleno" */
    if (lleno) lleno.ocupados = CUPOS_GRUPAL;
  }

  var SESIONES = generarSesiones();

  /* ============================================================
     Formato de fechas para la interfaz
     ============================================================ */

  function fechaCorta(iso) {
    var p = partes(iso);
    return DIAS_CORTOS[diaSemana(iso)] + ' ' + p.d + ' ' + MESES_CORTOS[p.m - 1];
  }

  function fechaMedia(iso) {
    var p = partes(iso);
    return DIAS_CORTOS[diaSemana(iso)] + ' ' + p.d + ' de ' + MESES[p.m - 1];
  }

  function fechaLarga(iso) {
    var p = partes(iso);
    return DIAS_LARGOS[diaSemana(iso)] + ' ' + p.d + ' de ' + MESES[p.m - 1];
  }

  function mesAnio(iso) {
    var p = partes(iso);
    return { y: p.y, m: p.m, etiqueta: MESES[p.m - 1] + ' ' + p.y };
  }

  /* ============================================================
     Textos de la interfaz
     ============================================================ */

  var UI = {
    /* ---- Hero ---- */
    heroPill: 'SOCIEDAD ZAG',
    heroTitleA: 'MENTORÍAS',
    heroTitleB: 'ZAG',
    heroSub:
      'Egresados que ya pasaron por donde vas. En grupo, máximo 8 personas, o 1:1 si ya eres Senior.',
    estadoGrupal: 'Grupales: ✓ desbloqueadas',
    estado1a1Listo: '1:1: ✓ desbloqueada',
    estado1a1Bloqueado: '1:1: 🔒 te faltan {n} niveles',
    sinSesionTexto: 'Entra para ver qué mentorías tienes desbloqueadas',
    sinSesionCta: 'Entrar en modo demo',

    /* ---- Próximas mentorías ---- */
    proximasKicker: 'TU AGENDA',
    proximasTitulo: 'Tus próximas mentorías',
    proximasVacio: 'Todavía no tenés mentorías reservadas.',
    tipoGrupalCorto: 'Grupal',
    tipo1a1Corto: '1:1',
    modalidadVirtual: '💻 Google Meet',
    modalidadPresencial: '📍 ZAG Room',

    /* ---- ¿En qué necesitas ayuda? ---- */
    necesidadesKicker: 'POR DÓNDE EMPEZAR',
    necesidadesTitulo: '¿En qué necesitas ayuda?',
    necesidadesCta: 'Encuentra tu mentor ↗',
    chipIlustracion: '✓ Un siguiente paso claro',

    /* ---- Buscador y filtros ---- */
    buscadorLabel: 'Busca por nombre, empresa o tema…',
    filtroModalidadLabel: 'Modalidad',
    modalidadTodas: 'Todas',
    modalidadPresencial: 'Presencial',
    modalidadVirtual: 'Virtual',
    soloReservables: 'Solo las que puedo reservar',
    contador: '{n} mentores',
    contadorSingular: '1 mentor',
    vacio: 'Nadie por aquí con ese filtro. Prueba otra área.',
    limpiar: 'Limpiar filtros',

    /* ---- Tarjeta de mentor ---- */
    puedeAyudarte: 'PUEDE AYUDARTE CON',
    datosTitulo: 'Sesiones dadas',
    datosAsistencia: 'Asistencia',
    leerMas: 'Leer más',
    leerMenos: 'Leer menos',
    grupalDesde: 'Mentoría grupal · máx. 8 · desde {nivel}',
    modalidadBadgeVirtual: '💻 Virtual',
    modalidadBadgePresencial: '📍 Presencial',
    proxima: 'Próxima: {fecha} · {hora} · {modalidad} · {cupos} de {max} cupos',
    ctaVerHorarios: 'Ver horarios',
    ctaBloqueada: 'Ver cómo subir de nivel',
    bloqueadaTexto: '🔒 Se desbloquea en {nivel}',
    sinSesionCta: 'Ver horarios',
    tagUrgencia: '🔥 Quedan {n} cupos',
    tagReservada: '✓ Tienes mentoría el {fecha}',
    duracionGrupo: '60 minutos',
    duracion1a1: '45 minutos',
    verMasBio: 'Ver bio completa',

    /* ---- Agendador ---- */
    agKicker: 'AGENDA TU SESIÓN',
    agTitulo: 'Elige día y hora',
    tabGrupal: 'Mentoría grupal',
    tab1a1: 'Mentoría 1:1',
    cerrar: 'Cerrar',
    infoTipo: 'Tipo de sesión',
    infoDuracion: '⏱ Duración',
    infoModalidad: 'Modalidad',
    infoZona: '🌎 {tz}',
    infoCuposGrupo: 'Cupos: máx. 8',
    infoCupos1a1: 'Solo tú y tu mentor',
    horasTitulo: 'Horas del {fecha}',
    eligiendoModalidad: '¿Cómo querés que sea?',
    modPresencial: 'Presencial · ZAG Room',
    modVirtual: 'Virtual · Google Meet',
    sinHoras: 'Ese día no hay horarios. Prueba otro.',
    slotLleno: 'Lleno',
    slotTuya: 'Tu reserva ✓',
    cuposSlot: '{libres}/{max}',
    resumenGrupo: 'Mentoría grupal con {mentor} · {fecha} · {rango} · {modalidad}',
    resumen1a1: 'Mentoría 1:1 con {mentor} · {fecha} · {rango} · {modalidad}',
    confirmar: 'Confirmar reserva',
    confirmando: 'Reservando…',
    sinSesion: 'Activa tu perfil para reservar',
    faltaNivel: 'Se desbloquea en {nivel}',
    modalElegirModalidad: 'Elegí una modalidad para continuar',

    /* ---- 1:1 bloqueada ---- */
    unoAUnoKicker: 'SOLO NIVEL SENIOR',
    unoAUnoTitulo: 'La mentoría 1:1 es exclusiva de nivel SENIOR.',
    unoAUnoCopy: 'Te faltan {n} {nivel}. Cuando llegues, esta sesión te queda abierta.',
    unoAUnoCta: 'Elegir cómo subir',

    /* ---- Bloque de acceso ---- */
    accesoKicker: 'PARA RESERVAR',
    accesoTitulo: 'Activa tu perfil',
    accesoCopy:
      'Las mentorías se reservan con tu perfil ZAG, así cada sesión sabe para qué nivel es.',
    accesoPrimario: 'Crear mi cuenta ZAG',
    accesoSecundario: 'Entrar en modo demo',
    accesoNivelLabel: 'Elegí tu nivel para la demo',
    accesoNivelHint: 'Después podés cambiarlo desde el Muro.',
    accesoListo: 'Perfil demo activado. Ya podés reservar mentorías.',

    /* ---- Cancelación ---- */
    cancelar: 'Cancelar',
    confirmarLiberar: '¿Liberar tu lugar del {fecha}?',
    liberarSi: 'Sí, liberar',
    liberarNo: 'No, dejarlo',
    cancelado: 'Liberaste tu lugar.',

    /* ---- Popup ---- */
    modalTitulo: '¡Listo!',
    modalTexto: 'Tienes tu lugar en la mentoría {tipo} con {mentor}: {fecha}, {hora}. {modalidad}. Nos vemos allí.',
    modalDetalleVirtual: 'El link de Google Meet te llega al portal 1 hora antes.',
    modalDetallePresencial: 'ZAG Room · Campus EAM.',
    modalEntendido: 'Entendido',
    agregarCalendario: 'Agregar a Google Calendar',

    /* ---- Tope de reservas ---- */
    topeMentor: 'Ya tenés una mentoría con {mentor}. Cancelala si querés otra.',
    topeTotal: 'Ya tenés {n} mentorías activas. Liberá una para seguir.',
    sinSesionReserva: 'Activa tu perfil para reservar.',
    nivelInsuficiente: 'Necesitás nivel {nivel} para esta mentoría.',

    /* ---- Footer / avisos ---- */
    resetDemo: 'Reiniciar demo',
    resetHecho: 'Demo reiniciada. Se soltaron tus mentorías.',
    reservadoAnunciado: 'Reservaste tu mentoría con {mentor}.',
    canceladoAnunciado: 'Liberaste tu lugar.',
    horarioElegido: 'Elegiste {fecha}, {hora}.',
    filtroAplicado: 'Mostrando {n} mentores.',
    subirNivel: 'Ver cómo subir de nivel',
  };

  /* ============================================================
     API pública
     ============================================================ */

  return {
    mentores: MENTORES,
    sesiones: SESIONES,
    categorias: CATEGORIAS,
    areas: AREAS,
    ui: UI,
    cuposGrupal: CUPOS_GRUPAL,
    cupos1a1: CUPOS_1A1,
    minCuposBadge: MIN_GRUPAL,
    maxPorMentor: MAX_POR_MENTOR,
    maxTotal: MAX_TOTAL,
    duracionGrupal: DUR_GRUPAL,
    duracion1a1: DUR_1A1,
    nivelNames: NIVEL_NAMES,
    nivelOrder: NIVEL_ORDER,
    LS_RESERVAS: 'zag_mentorias_reservas',
    TZ: TZ,

    /* formato */
    hoyISO: hoyISO,
    sumarDias: sumarDias,
    diaSemana: diaSemana,
    fechaCorta: fechaCorta,
    fechaMedia: fechaMedia,
    fechaLarga: fechaLarga,
    mesAnio: mesAnio,
    DIAS_CORTOS: DIAS_CORTOS,
    DIAS_LARGOS: DIAS_LARGOS,
    MESES: MESES,
    MESES_CORTOS: MESES_CORTOS,
  };
})();
