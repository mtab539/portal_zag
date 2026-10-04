/* ============================================================
   PORTAL ZAG — ZAG Room (zag-room.html)
   Datos y cálculo de la landing del ZAG Room: configuración del
   espacio, amenidades, reglas, FAQ y los textos de la interfaz.
   Se expone en window.ZAG_ROOM.

   Zona horaria: America/Bogota (UTC-5 todo el año, sin horario de
   verano), igual que en Mentorías: el desfase con UTC es fijo y los
   sellos para Google Calendar van con -05:00.

   La ocupación de puestos NO está escrita a mano: sale de un
   pseudoaleatorio determinista a partir de fechaISO + bloqueId, así
   que recargar no mueve nada. Después se fuerzan dos casos para que
   siempre haya un bloque Lleno y uno con los últimos 2 puestos.
   ============================================================ */

window.ZAG_ROOM = (function () {
  'use strict';

  /* ============================================================
     Configuración — fácil de cambiar
     ============================================================ */

  var config = {
    aforo: 8,
    dias: ['lun', 'mar', 'mie', 'jue', 'vie'],
    bloques: [
      { id: 'b1', inicio: '07:00', fin: '09:00' },
      { id: 'b2', inicio: '09:00', fin: '11:00' },
      { id: 'b3', inicio: '11:00', fin: '13:00' },
      { id: 'b4', inicio: '13:00', fin: '15:00' },
      { id: 'b5', inicio: '15:00', fin: '17:00' },
      { id: 'b6', inicio: '17:00', fin: '19:00' },
      { id: 'b7', inicio: '19:00', fin: '21:00' },
    ],
    maxBloquesSemana: 5, /* respaldo si no se puede leer el nivel */
    maxBloquesPorNivel: { creator: 2, master: 5, senior: null }, /* null = ilimitado */
    diasAnticipacion: 7,
    horasMinCancelar: 2,
    nivelMinimo: 2, /* CREATOR (rookie=0 … senior=4) */
    lugar: 'ZAG Room · Campus EAM',
  };

  var LS_RESERVAS = 'zag_room_reservas';
  var TZ = 'America/Bogota';

  /* ============================================================
     Niveles
     ============================================================ */

  var NIVELES = ['rookie', 'strategist', 'creator', 'master', 'senior'];

  var NIVEL_NAMES = {
    rookie: 'Rookie',
    strategist: 'Strategist',
    creator: 'Creator',
    master: 'Master',
    senior: 'Sociedad ZAG',
  };

  /* Acepta el nombre del nivel y también el índice conceptual
     (0..4): "2" es Creator, el nivel que abre el ZAG Room. */
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

  function nivelBadge(nivel) {
    var i = indiceNivel(nivel);
    return i === -1 ? 'Rookie' : NIVELES[i].toUpperCase();
  }

  /* Cuántos niveles faltan para llegar al mínimo. Sin sesión no se
     puede afirmar nada, así que devuelve -1. */
  function faltanNiveles(nivelActual) {
    var i = indiceNivel(nivelActual);
    var min = indiceNivel(config.nivelMinimo);
    if (i === -1) return -1;
    return Math.max(0, min - i);
  }

  /* Máximo de bloques por semana según el nivel:
     CREATOR 2 · MASTER 5 · SENIOR ilimitado (null). */
  function maxBloquesPara(nivel) {
    var i = indiceNivel(nivel);
    if (i < 0) return config.maxBloquesSemana;
    var v = config.maxBloquesPorNivel[NIVELES[i]];
    return v === undefined ? config.maxBloquesSemana : v;
  }
  function textoMaxSemana(nivel) {
    var max = maxBloquesPara(nivel);
    if (max === null) return 'Con SENIOR tienes bloques ilimitados esta semana';
    return 'Llegaste a tu máximo de ' + max + (max === 1 ? ' bloque' : ' bloques') + ' esta semana';
  }
  function textoDeSemana(nivel) {
    var max = maxBloquesPara(nivel);
    return ' de ' + (max === null ? '∞' : max) + (max === 1 ? ' bloque' : ' bloques');
  }

  /* ============================================================
     Fechas — días calendario de Colombia, no la zona de quien mira
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

  /* Hora de Bogotá como minutos desde medianoche, y al revés.
     El desfase con UTC es fijo (-05:00), así que se puede restar
     sin depender de Intl. */
  function ahoraMinutos() {
    var d = new Date();
    var utc = d.getUTCHours() * 60 + d.getUTCMinutes();
    var m = utc - 300;
    if (m < 0) m += 1440;
    return m;
  }

  function ahoraTexto() {
    try {
      return new Intl.DateTimeFormat('es-CO', {
        timeZone: TZ, hour: '2-digit', minute: '2-digit', hour12: false,
      }).format(new Date());
    } catch (e) { /* sin Intl */ }
    var d = new Date();
    return dosDigitos(d.getUTCHours()) + ':' + dosDigitos(d.getUTCMinutes());
  }

  function partes(iso) {
    return { y: Number(iso.slice(0, 4)), m: Number(iso.slice(5, 7)), d: Number(iso.slice(8, 10)) };
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

  /* Clave de semana calendario: lunes a domingo. */
  function claveSemana(iso) {
    var dow = diaSemana(iso);            /* 0 = domingo */
    var lunes = sumarDias(iso, dow === 0 ? -6 : 1 - dow);
    return lunes;                         /* el lunes identifica la semana */
  }

  function minutos(hhmm) {
    return Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5));
  }

  function desdeMinutos(m) {
    return dosDigitos(Math.floor(m / 60)) + ':' + dosDigitos(m % 60);
  }

  /* 'HH:MM' → '7:00 am' / '1:00 pm' */
  function hora12(hhmm) {
    var m = minutos(hhmm);
    var h24 = Math.floor(m / 60);
    var mm = m % 60;
    var h = h24 % 12;
    if (h === 0) h = 12;
    return h + ':' + dosDigitos(mm) + (h24 >= 12 ? ' pm' : ' am');
  }

  function rango12(bloque) {
    return hora12(bloque.inicio) + ' – ' + hora12(bloque.fin);
  }

  var DIAS_CORTOS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
  var DIAS_LARGOS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  var MESES = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
  ];

  function fechaDia(iso) {
    var p = partes(iso);
    return DIAS_CORTOS[diaSemana(iso)] + ' ' + p.d;
  }

  function fechaMedia(iso) {
    var p = partes(iso);
    return DIAS_CORTOS[diaSemana(iso)] + ' ' + p.d + ' de ' + MESES[p.m - 1];
  }

  function fechaLarga(iso) {
    var p = partes(iso);
    return DIAS_LARGOS[diaSemana(iso)] + ' ' + p.d + ' de ' + MESES[p.m - 1];
  }

  function diaLargo(iso) { return DIAS_LARGOS[diaSemana(iso)]; }

  /* ============================================================
     Días reservables: los hábiles dentro de la ventana de
     anticipación, contando desde hoy.
     ============================================================ */

  function diasReservables(hoy) {
    var base = hoy || hoyISO();
    var salida = [];
    for (var i = 0; i <= config.diasAnticipacion; i++) {
      var iso = sumarDias(base, i);
      var dow = diaSemana(iso);
      var nombre = config.dias[dow - 1];   /* 0 = domingo, así que lunes = 1 */
      if (!nombre) continue;
      salida.push({ fechaISO: iso, dow: dow, nombre: nombre, esHoy: i === 0 });
    }
    return salida;
  }

  /* ¿El bloque ya empezó? Solo importa para el día de hoy. */
  /* Desde el minuto en que arranca, el bloque deja de ser reservable. */
  function yaEmpezo(bloque, fechaISO, hoy) {
    if (fechaISO !== (hoy || hoyISO())) return false;
    return minutos(bloque.inicio) <= ahoraMinutos();
  }

  /* Un bloque en curso sigue vigente: su pase sirve hasta que acaba. */
  function yaTermino(bloque, fechaISO, hoy) {
    if (fechaISO !== (hoy || hoyISO())) return false;
    return minutos(bloque.fin) <= ahoraMinutos();
  }

  /* Bloque en curso ahora mismo (o null si el room está cerrado). */
  function bloqueAhora(hoy) {
    var base = hoy || hoyISO();
    var dow = diaSemana(base);
    if (!config.dias[dow - 1]) return null;
    var ahora = ahoraMinutos();
    for (var i = 0; i < config.bloques.length; i++) {
      var b = config.bloques[i];
      if (ahora >= minutos(b.inicio) && ahora < minutos(b.fin)) return b;
    }
    return null;
  }

  /* Próxima apertura, para el texto de "Cerrado". */
  function proximaApertura(hoy) {
    var base = hoy || hoyISO();
    var ahora = ahoraMinutos();
    for (var i = 0; i <= config.diasAnticipacion; i++) {
      var iso = sumarDias(base, i);
      var dow = diaSemana(iso);
      if (!config.dias[dow - 1]) continue;
      for (var j = 0; j < config.bloques.length; j++) {
        var b = config.bloques[j];
        if (i > 0 || minutos(b.inicio) > ahora) {
          return {
            fechaISO: iso,
            bloque: b,
            esHoy: i === 0,
          };
        }
      }
    }
    return null;
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

  /* Puestos ocupados para un bloque. Mismo día + mismo bloque da
     siempre el mismo número, así que la demo no cambia al recargar.

     La carga se reparte por franja: la mañana del medio día va más
     llena que las 7 am o las 7 pm. Cada franja tiene su propio rango
     de mínimo y máximo para que el pico pueda llegar a llenarse. */
  function ocupadosDemo(fechaISO, bloqueId) {
    var bloque = bloquePorId(bloqueId);
    var h = bloque ? minutos(bloque.inicio) / 60 : 12;

    var min, max;
    if (h < 9) { min = 0; max = 2; }        /* 7 am: poca gente */
    else if (h < 17) { min = 2; max = 5; }  /* 9 am a 5 pm: el pico */
    else { min = 0; max = 3; }              /* 7 pm: medio */

    var n = min + (hash(fechaISO + '|' + bloqueId + '|room') % (max - min + 1));
    return Math.min(config.aforo, n);
  }

  function bloquePorId(id) {
    for (var i = 0; i < config.bloques.length; i++) {
      if (config.bloques[i].id === id) return config.bloques[i];
    }
    return null;
  }

  /* ============================================================
     Mapa de ocupación de la ventana visible

     Se calcula una sola vez por día y se cachea: así el forzaje
     siempre cae en los mismos bloques y la demo no "salta" entre
     renders. Después de calcular la ocupación base de cada celda
     visible se fuerzan dos casos, para que siempre haya en pantalla
     un bloque Lleno y uno con los últimos 2 puestos:

       · el Lleno es la celda bookable con más gente base;
       · los "Últimos 2" es la celda bookable de franja pico más
         vacía que aún le quepan 2 puestos.

     Solo se forzan celdas que todavía se pueden reservar (no han
     pasado), porque forzar una pasada no se vería nunca.
     ============================================================ */

  var CACHE_MAPA = { dia: null, mapa: null };

  function claveCelda(fechaISO, bloqueId) {
    return fechaISO + '|' + bloqueId;
  }

  function mapaOcupacion(hoy) {
    var base = hoy || hoyISO();
    if (CACHE_MAPA.dia === base) return CACHE_MAPA.mapa;

    var dias = diasReservables(base);
    var mapa = {};
    var bookables = [];

    dias.forEach(function (dia) {
      config.bloques.forEach(function (b) {
        var k = claveCelda(dia.fechaISO, b.id);
        mapa[k] = ocupadosDemo(dia.fechaISO, b.id);
        if (!yaEmpezo(b, dia.fechaISO, base)) {
          bookables.push({ key: k, fechaISO: dia.fechaISO, bloque: b, base: mapa[k] });
        }
      });
    });

    if (bookables.length) {
      /* 1 · un bloque Lleno: el más lleno que se pueda reservar */
      var lleno = bookables.reduce(function (a, b) { return b.base > a.base ? b : a; });
      if (lleno.base < config.aforo) {
        mapa[lleno.key] = config.aforo;
      }

      /* 2 · uno con los últimos 2 puestos: el pico más lleno que
             todavía tenga 3 o más libres. Se elige el más lleno para
             que el ajuste sea de un puesto o dos, no un salto. Se
             excluye la celda del paso 1, que ya quedó Llena. */
      var pico = bookables.filter(function (c) {
        return c.key !== lleno.key &&
          c.base <= config.aforo - 3 &&
          c.bloque &&
          minutos(c.bloque.inicio) >= 540 && minutos(c.bloque.inicio) < 1020;
      });
      if (pico.length) {
        var ultimos = pico.reduce(function (a, b) { return b.base > a.base ? b : a; });
        mapa[ultimos.key] = config.aforo - 2;
      }
    }

    CACHE_MAPA = { dia: base, mapa: mapa };
    return mapa;
  }

  /* Puestos ocupados de una celda, con el forzaje aplicado. */
  function ocupados(fechaISO, bloqueId, hoy) {
    var mapa = mapaOcupacion(hoy);
    var v = mapa[claveCelda(fechaISO, bloqueId)];
    return typeof v === 'number' ? v : ocupadosDemo(fechaISO, bloqueId);
  }

  /* Puestos libres que ve la persona. Su propia reserva ya ocupa un
     puesto, así que se descuenta para no ofrecerle algo que es suyo. */
  function puestosLibres(fechaISO, bloqueId, reservas, hoy) {
    var ocupadosBase = ocupados(fechaISO, bloqueId, hoy);
    var mios = 0;
    (reservas || []).forEach(function (r) {
      if (r.fechaISO === fechaISO && r.bloqueId === bloqueId) mios++;
    });
    var libres = config.aforo - ocupadosBase - mios;
    return libres < 0 ? 0 : libres;
  }

  /* ============================================================
     Contenido de la página
     ============================================================ */

  var hero = {
    pill: 'Sociedad ZAG',
    titleA: 'ZAG',
    titleB: 'ROOM',
    sub: 'El territorio físico de la Sociedad ZAG. Un lugar para estudiar, crear y recibir mentorías, abierto desde CREATOR.',
    cta: 'Reservar un puesto ↓',
  };

  var foto = {
    src: 'assets/img/zagroom.svg',
    alt: 'El ZAG Room en el campus de la EAM: mesas largas, tablero y luz natural.',
    chips: [
      { icon: '👥', texto: 'Aforo 8' },
      { icon: '🕖', texto: 'L–V · 7 am–9 pm' },
      { icon: '📍', texto: 'Campus EAM' },
    ],
  };

  var manifiesto = {
    kicker: 'Bienvenido al ZAG Room',
    texto: 'Un cuarto pensado para hacer zag: mesas largas, un tablero que nunca está limpio y café para lo que salga.',
  };

  var usos = [
    {
      id: 'estudiar',
      icono: 'book',
      titulo: 'Estudiar',
      texto: 'Silencio relativo, buena luz y enchufes para todos.',
      link: { label: 'Reservar un puesto', href: '#reservar', flecha: '▷' },
    },
    {
      id: 'crear',
      icono: 'board',
      titulo: 'Crear',
      texto: 'Tablero, proyector y espacio para armar la próxima campaña.',
      link: { label: 'Reservar un puesto', href: '#reservar', flecha: '▷' },
    },
    {
      id: 'mentorias',
      icono: 'people',
      titulo: 'Mentorías',
      texto: 'Aquí se dan las mentorías presenciales con egresados.',
      link: { label: 'Ver mentorías', href: 'mentorias.html', flecha: '▷' },
    },
  ];

  /* Las 5 del mosaico. Para cambiarlas por las fotos reales basta
     con poner src: 'assets/img/zag-room/<n>.webp'. */
  var galeria = [
    { n: 1, src: 'assets/img/zag-room/1.svg', etiqueta: 'Mesa de trabajo', alt: 'Mesa de trabajo larga con enchufes y monitor en el ZAG Room.' },
    { n: 2, src: 'assets/img/zag-room/2.svg', etiqueta: 'Barra de café y agua', alt: 'La barra de café y agua del ZAG Room.' },
    { n: 3, src: 'assets/img/zag-room/3.svg', etiqueta: 'Rincón de poofs', alt: 'El rincón con los poofs para trabajar informalmente.' },
    { n: 4, src: 'assets/img/zag-room/4.svg', etiqueta: 'Tablero y proyector', alt: 'El tablero grande y el proyector del ZAG Room.' },
    { n: 5, src: 'assets/img/zag-room/5.svg', etiqueta: 'Lockers', alt: 'Los lockers donde dejas tus cosas mientras estás en el bloque.' },
  ];

  var amenidades = [
    { id: 'wifi', icono: 'wifi', nombre: 'Wi-Fi', texto: 'Wi-Fi de alta velocidad del campus.' },
    { id: 'proyector', icono: 'proyector', nombre: 'Proyector', texto: 'Para compartir pantalla en el bloque.' },
    { id: 'cafe', icono: 'cafe', nombre: 'Café y agua', texto: 'Café de la casa y agua siempre fría.' },
    { id: 'tablero', icono: 'tablero', nombre: 'Tablero', texto: 'El tablero grande de la pared.' },
    { id: 'lockers', icono: 'lockers', nombre: 'Lockers', texto: 'Lockers para tus cosas mientras estés en el bloque.' },
    { id: 'poofs', icono: 'poofs', nombre: 'Poofs', texto: 'Puffs para trabajar sin mesa.' },
  ];

  var reglas = [
    { icono: 'nivel', texto: 'Se reserva desde nivel CREATOR.' },
    { icono: 'puesto', texto: '1 puesto por bloque de 2 horas; el aforo es de 8.' },
    { icono: 'semana', texto: 'Bloques por semana según tu nivel: CREATOR 2 · MASTER 5 · SENIOR ilimitados.' },
    { icono: 'anticipacion', texto: 'Reservas con hasta 7 días de anticipación.' },
    { icono: 'cancelar', texto: 'Cancela hasta 2 horas antes para liberar el puesto.' },
    { icono: 'checkin', texto: 'Check-in mostrando tu pase en la entrada.' },
    { icono: 'mesa', texto: 'Deja la mesa como la encontraste. El tablero sí puede quedar lleno.' },
  ];

  var faq = [
    {
      q: '¿Puedo ir sin reserva?',
      a: 'Si hay puestos libres en el bloque, sí, pero quien tiene reserva tiene prioridad.',
    },
    {
      q: '¿Puedo reservar para un amigo?',
      a: 'No. Cada persona reserva su propio puesto con su perfil.',
    },
    {
      q: '¿Qué pasa si no llego?',
      a: 'Tu puesto queda libre para otra persona. Si vas a faltar, cancela con tiempo.',
    },
    {
      q: '¿Qué pasa si aún no soy Creator?',
      a: 'Suma sellos en retos, fogatas y cursos. Al llegar a CREATOR se desbloquea.',
    },
    {
      q: '¿Puedo traer comida?',
      a: 'Snacks sí. Almuerzos, mejor en la cafetería.',
    },
  ];

  var cierre = {
    titleA: 'TU PUESTO TE',
    titleB: 'ESPERA',
  };

  /* ============================================================
     Textos de la interfaz
     ============================================================ */

  var ui = {
    /* píldora de estado del hero */
    estadoSinSesion: 'Activa tu perfil para reservar',
    estadoSinSesionCta: 'Entrar en modo demo',
    estadoBloqueado: '🔒 Se desbloquea en CREATOR · te faltan ',
    estadoListo: '✓ Puedes reservar · llevas ',
    estadoSinSesionTitulo: 'Activa tu perfil para reservar',
    estadoBloqueadoTitulo: '🔒 Se desbloquea en CREATOR · te faltan ',
    estadoListoTitulo: '✓ Puedes reservar · llevas ',

    /* estado vivo sobre la foto */
    abierto: '● Abierto ahora · ',
    abiertosPuestos: ' puestos libres en este bloque',
    abiertoPuesto: ' puesto libre en este bloque',
    cerrado: '● Cerrado · ',
    cierraHoy: 'cierra hoy a las ',
    abreProximo: 'abre ',
    enEsteBloque: 'en este bloque',

    /* secciones */
    usosKicker: 'Para qué sirve',
    usosTitle: 'Tres formas de {usarlo}',
    espacioKicker: 'El espacio',
    espacioTitle: 'Qué hay en el {ZAG Room}',
    verTodas: 'Ver todas las fotos',
    amenidadesKicker: 'Amenidades',

    /* reserva */
    reservaKicker: 'Reserva',
    reservaTitle: 'Elige tu {bloque}',
    pasoDia: '1. Elige el día',
    pasoBloque: '2. Elige el bloque',
    pasoMapa: '3. Mapa de la semana',
    hoy: 'Hoy',
    puestosLibres: ' puestos libres',
    puestoLibre: ' puesto libre',
    deAforo: ' de ' + config.aforo,
    estadoDisponible: 'Disponible',
    estadoUltimos: 'Últimos 2',
    estadoUltimo: 'Último puesto',
    estadoLleno: 'Lleno',
    estadoPaso: 'Ya pasó',
    estadoTuReserva: 'Tu reserva ✓',
    estadoTuReservaShort: 'mío',
    leyenda: 'Puestos libres por bloque',
    leyendaLibre: 'libre',
    leyendaLibres: 'libres',
    leyendaDisponible: 'Disponible',
    leyendaPocos: 'Quedan pocos',
    leyendaLleno: 'Lleno',
    leyendaPaso: 'Ya pasó',

    /* resumen */
    resumenFotoAlt: 'El ZAG Room',
    resumenNombre: 'ZAG Room · 1 puesto',
    resumenVacio: 'Elige día y bloque',
    resumenSemana: 'Esta semana: ',
    deSemana: ' de ' + config.maxBloquesSemana + ' bloques',
    confirmar: 'Confirmar reserva',
    confirmando: 'Reservando…',
    cancelarNota: 'Puedes cancelar hasta ' + config.horasMinCancelar + ' horas antes.',
    maxSemana: 'Llegaste a tu máximo de ' + config.maxBloquesSemana + ' bloques esta semana',
    nivelBloqueado: 'Se desbloquea en CREATOR · te faltan ',
    verNivel: 'Ver cómo subir de nivel',
    sinSesion: 'Activa tu perfil para reservar',
    llenoAviso: 'No quedan puestos en este bloque. Elige otro.',
    pasoAviso: 'Este bloque ya empezó. Elige otro horario.',

    /* banner de bloqueo */
    bannerBloqueo: 'El ZAG Room se reserva desde CREATOR. Suma sellos para entrar.',
    bannerSinSesion: 'Activa tu perfil para reservar un puesto. Entra en modo demo para probar el flujo.',

    /* pases */
    pasesKicker: 'Tus reservas',
    pasesTitle: 'Pasa con {esto}',
    pasePuesto: 'Puesto en el ZAG Room',
    verPase: 'Mostrar pase',
    agregarCalendario: 'Agregar a Google Calendar',
    cancelar: 'Cancelar',
    cancelarConfirmar: 'Sí, cancelar mi reserva',
    cancelarCancelar: 'No, dejar la reserva',
    cancelarNoSePuede: 'Ya no se puede cancelar (menos de ' + config.horasMinCancelar + ' h)',
    verAnteriores: 'Ver anteriores',
    ocultarAnteriores: 'Ocultar anteriores',
    sinReservas: 'Todavía no tenés puestos reservados.',
    qrNota: 'Pase de demostración. El patrón no se escanea: el check-in lo hace una persona.',

    /* popup de confirmación */
    modalTitulo: '¡Listo!',
    modalEntendido: 'Entendido',
    modalVerPase: 'Ver mi pase',
    modalReservado: 'Reserva confirmada.',

    /* acceso / demo */
    accesoKicker: 'Acceso',
    accesoTitulo: 'Activa tu perfil para reservar',
    accesoPrimario: 'Ver cómo subir de nivel',
    accesoSecundario: 'Entrar en modo demo',
    accesoNivelLabel: 'Elegí tu nivel',
    accesoNivelHint: 'Es una demo: el nivel es ficticio y solo vive en este navegador.',
    accesoListo: 'Perfil activado. Ya podés reservar.',
    accesoCopy: 'El ZAG Room abre para nivel CREATOR en adelante. Entrá en modo demo para probar el flujo sinesperar a llegar a sellos.',
    avisoSesion: 'Perfil demo activado. Ya podés reservar en el ZAG Room.',

    /* reinicio */
    resetDemo: 'Reiniciar demo',
    resetHecho: 'Demo reiniciada: se borraron tus reservas del ZAG Room.',

    /* varios */
    noReservasAnnounce: 'No hay puestos libres en ese bloque.',
  };

  /* ============================================================
     Plantillas con {algo}
     ============================================================ */

  function txt1(plantilla, datos) {
    return String(plantilla == null ? '' : plantilla).replace(/\{(\w+)\}/g, function (_, k) {
      return datos && datos[k] != null ? datos[k] : '';
    });
  }

  /* ============================================================
     Código de reserva
     ============================================================ */

  var CODIGO_PREFIJO = 'ZR-';

  /* Código legible derivado de fecha + bloque + persona. No es
     criptográfico: es un sello legible para el check-in. */
  function codigoReserva(fechaISO, bloqueId, persona) {
    var h = hash(fechaISO + '|' + bloqueId + '|' + (persona || ''));
    var alfabeto = 'ACDEFGHJKLMNPQRTUVWXY3479';
    var out = '';
    for (var i = 0; i < 4; i++) {
      out += alfabeto.charAt(h % alfabeto.length);
      h = Math.floor(h / alfabeto.length) + 7 * (i + 1);
    }
    return CODIGO_PREFIJO + out;
  }

  /* Patrón tipo QR decorativo a partir del código. NO es un QR
     funcional: es una textura hecha con los bits del hash. */
  function patronQR(codigo) {
    var S = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(S, 'svg');
    svg.setAttribute('viewBox', '0 0 84 84');
    svg.setAttribute('width', '84');
    svg.setAttribute('height', '84');
    svg.setAttribute('class', 'pase-qr');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');

    var fondo = document.createElementNS(S, 'rect');
    fondo.setAttribute('width', '84');
    fondo.setAttribute('height', '84');
    fondo.setAttribute('fill', 'currentColor');
    fondo.setAttribute('opacity', '0.06');
    svg.appendChild(fondo);

    var N = 21;
    var celda = 84 / N;
    var h = hash(codigo + '|qr');

    /* tres esquinas de lectura, como un QR */
    function esquina(cx, cy) {
      var g = document.createElementNS(S, 'g');
      g.setAttribute('fill', 'currentColor');
      var anillo = document.createElementNS(S, 'rect');
      anillo.setAttribute('x', String(cx * celda));
      anillo.setAttribute('y', String(cy * celda));
      anillo.setAttribute('width', String(7 * celda));
      anillo.setAttribute('height', String(7 * celda));
      anillo.setAttribute('rx', String(celda));
      g.appendChild(anillo);
      var cal = document.createElementNS(S, 'rect');
      cal.setAttribute('x', String((cx + 2) * celda));
      cal.setAttribute('y', String((cy + 2) * celda));
      cal.setAttribute('width', String(3 * celda));
      cal.setAttribute('height', String(3 * celda));
      cal.setAttribute('rx', String(celda * 0.6));
      cal.setAttribute('class', 'pase-qr-hole');
      g.appendChild(cal);
      return g;
    }

    svg.appendChild(esquina(0, 0));
    svg.appendChild(esquina(N - 7, 0));
    svg.appendChild(esquina(0, N - 7));

    for (var y = 0; y < N; y++) {
      for (var x = 0; x < N; x++) {
        var enEsquina = (x < 8 && y < 8) || (x >= N - 8 && y < 8) || (x < 8 && y >= N - 8);
        if (enEsquina) continue;
        h = (h * 1103515245 + 12345) >>> 0;
        if (h % 100 < 46) {
          var r = document.createElementNS(S, 'rect');
          r.setAttribute('x', String(x * celda));
          r.setAttribute('y', String(y * celda));
          r.setAttribute('width', String(celda));
          r.setAttribute('height', String(celda));
          r.setAttribute('fill', 'currentColor');
          svg.appendChild(r);
        }
      }
    }
    return svg;
  }

  /* ============================================================
     Google Calendar
     ============================================================ */

  function calStamp(fechaISO, hhmm) {
    return fechaISO.replace(/-/g, '') + 'T' + hhmm.replace(':', '') + '00';
  }

  function buildGoogleCalendarUrl(reserva) {
    var bloque = bloquePorId(reserva.bloqueId);
    if (!bloque) return '#';

    var p = {
      text: 'ZAG Room · Puesto reservado',
      dates: calStamp(reserva.fechaISO, bloque.inicio) + '/' +
             calStamp(reserva.fechaISO, bloque.fin),
      details: 'Código ' + reserva.codigo +
        ' · Muestra tu pase en la entrada' +
        ' · Cancela hasta ' + config.horasMinCancelar + ' h antes' +
        ' · Portal ZAG',
      location: config.lugar,
      ctz: TZ,
    };

    if (window.ZAG_RESERVA) return window.ZAG_RESERVA.buildGoogleCalendarUrl(p);

    var params = new URLSearchParams();
    params.set('action', 'TEMPLATE');
    params.set('text', p.text);
    params.set('dates', p.dates);
    params.set('details', p.details);
    params.set('location', p.location);
    params.set('ctz', p.ctz);
    return 'https://calendar.google.com/calendar/render?' + params.toString();
  }

  return {
    config: config,
    LS_RESERVAS: LS_RESERVAS,
    TZ: TZ,
    CODIGO_PREFIJO: CODIGO_PREFIJO,

    NIVELES: NIVELES,
    NIVEL_NAMES: NIVEL_NAMES,

    indiceNivel: indiceNivel,
    nivelTexto: nivelTexto,
    nivelBadge: nivelBadge,
    faltanNiveles: faltanNiveles,
    maxBloquesPara: maxBloquesPara,
    textoMaxSemana: textoMaxSemana,
    textoDeSemana: textoDeSemana,

    hoyISO: hoyISO,
    ahoraMinutos: ahoraMinutos,
    ahoraTexto: ahoraTexto,
    diaSemana: diaSemana,
    sumarDias: sumarDias,
    claveSemana: claveSemana,
    minutos: minutos,
    desdeMinutos: desdeMinutos,
    hora12: hora12,
    rango12: rango12,
    fechaDia: fechaDia,
    fechaMedia: fechaMedia,
    fechaLarga: fechaLarga,
    diaLargo: diaLargo,

    diasReservables: diasReservables,
    yaEmpezo: yaEmpezo,
    yaTermino: yaTermino,
    bloqueAhora: bloqueAhora,
    proximaApertura: proximaApertura,
    ocupadosDemo: ocupadosDemo,
    ocupados: ocupados,
    puestosLibres: puestosLibres,
    bloquePorId: bloquePorId,

    hero: hero,
    foto: foto,
    manifiesto: manifiesto,
    usos: usos,
    galeria: galeria,
    amenidades: amenidades,
    reglas: reglas,
    faq: faq,
    cierre: cierre,
    ui: ui,
    txt1: txt1,

    codigoReserva: codigoReserva,
    patronQR: patronQR,
    buildGoogleCalendarUrl: buildGoogleCalendarUrl,
  };
})();