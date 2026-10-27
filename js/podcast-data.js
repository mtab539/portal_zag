/* ============================================================
   PORTAL ZAG — Podcast ZAG
   Datos demo: episodios, configuración de Spotify y textos de la
   interfaz. Todo se expone en window.ZAG_PODCAST.
   ============================================================ */

window.ZAG_PODCAST = (function () {
  'use strict';

  var spotify = {
    playlistUrl: null,
    tema: 'oscuro',
  };

  var episodios = [
    {
      id: 'ep01',
      numero: 1,
      titulo: 'El primer ZAG: 30 años de Publicidad en la EAM',
      palabraClave: 'ORIGEN',
      resumen: 'Andrés Quintero cuenta cómo nació el programa, qué significa hacer zag cuando todos hacen zig, y por qué esa decisión de hace 30 años sigue definiendo lo que somos hoy.',
      descripcion: [
        'Hace tres décadas alguien se sentó y dijo: «El programa de publicidad de esta universidad no va a parecerse a ningún otro». No fue un discurso bonito: fue una apuesta que costó matrícula, plata y reputación. Andrés Quintero estuvo ahí, lo vio de cerca, y en este episodio lo desarma pieza por pieza.',
        'Hablamos de la primera generación, del primer plan de estudios que se atrevió a mezclar creatividad con datos, y de por qué la cultura ZAG no es un eslogan sino un método. Si estudias aquí y nunca te habían contado esta historia, este es el punto de partida.',
      ],
      duracionMin: 32,
      fecha: '2026-09-05',
      temas: ['Historia', 'Cultura ZAG'],
      momentos: [
        { t: '02:15', tema: 'El día que se fundó el programa' },
        { t: '10:40', tema: '«Hacer zig es más barato, hacer zag da más miedo»' },
        { t: '18:50', tema: 'Primer egresado en montar agencia propia' },
        { t: '26:30', tema: 'Lo que cambiaría si empezara hoy' },
      ],
      invitados: ['andres-quintero'],
      spotifyUrl: null,
      color: 'var(--color-functional)',
    },
    {
      id: 'ep02',
      numero: 2,
      titulo: 'Fracasé en público y me fue bien',
      palabraClave: 'FRACASO',
      resumen: 'Daniel Rueda abre el caso de la campaña que salió mal en vivo, lo que aprendió cuando no había dónde esconderse, y por qué contarlo le abrió más puertas que cualquier portafolio.',
      descripcion: [
        'Daniel lanzó una campaña de Meta Ads para un cliente grande. Los números estaban bien en el Excel, pero el público la destrozó en 48 horas. Lo peor: todo pasó a la vista de medio LinkedIn. En vez de borrar el post, lo dejó. Y eso cambió su carrera.',
        'En este episodio hablamos de lo que pasa cuando el fracaso es público, de cómo se reconstruye una estrategia cuando el presupuesto ya se quemó, y de por qué la transparencia le ganó a la vergüenza. Si alguna vez te dio miedo equivocarte en voz alta, dale play.',
      ],
      duracionMin: 41,
      fecha: '2026-09-19',
      temas: ['Fracasos', 'Growth', 'Carrera'],
      momentos: [
        { t: '03:10', tema: 'El brief que sonaba perfecto' },
        { t: '12:45', tema: 'La métrica que ignoré y me costó el cliente' },
        { t: '24:00', tema: 'El post que no borré y el DM que llegó después' },
        { t: '35:20', tema: 'Qué hago distinto hoy antes de lanzar' },
      ],
      invitados: ['daniel-rueda'],
      spotifyUrl: null,
      color: 'var(--color-cta)',
    },
    {
      id: 'ep03',
      numero: 3,
      titulo: 'Tu primer cliente no te va a pagar lo que vales (todavía)',
      palabraClave: 'TODAVÍA',
      resumen: 'Laura Gómez y Camilo Torres hablan sin filtro de cómo poner precio, cuándo decir que no, y cómo crecer como freelance sin regalar tu trabajo.',
      descripcion: [
        'Tu primer cliente te va a pedir «algo rápido» que se convierte en tres semanas de trabajo. Te van a pagar tarde, o poco, o con exposición. Laura y Camilo pasaron por eso, y en este episodio cuentan cuánto cobraron la primera vez, cuánto perdieron y cuándo aprendieron a decir que no.',
        'Hablamos de tarifas reales, de cómo armar un presupuesto que no te dé vergüenza mandar, y de la diferencia entre cobrar barato para empezar y cobrar barato para siempre. Si estás por lanzarte como freelance o ya lo hiciste y algo no cuadra, este episodio es para ti.',
      ],
      duracionMin: 38,
      fecha: '2026-10-03',
      temas: ['Freelance', 'Pauta', 'Creatividad'],
      momentos: [
        { t: '04:20', tema: 'El peor pitch de mi vida' },
        { t: '14:00', tema: '¿Cuánto cobrar cuando no tienes portafolio?' },
        { t: '23:30', tema: 'El cliente que me pagó con «exposición»' },
        { t: '32:10', tema: 'Cómo subí mi tarifa sin perder clientes' },
      ],
      invitados: ['laura-gomez', 'camilo-torres'],
      spotifyUrl: null,
      color: 'var(--color-black)',
    },
  ];

  var destacadoId = 'ep03';

  var coloresCaratula = [
    'var(--color-functional)',
    'var(--color-cta)',
    'var(--color-black)',
    'var(--color-light-blue)',
    'var(--color-brand-deep)',
  ];

  var ui = {
    heroKicker: 'APRENDE MÁS',
    heroTitulo: 'PODCAST',
    heroTituloAccent: 'ZAG',
    heroSub: 'La voz de egresados y docentes, sin filtro de clase. Dale play entre clase y clase.',
    heroCtaSpotify: 'Escuchar en Spotify ↗',
    heroCtaSpotifyDisabled: 'Muy pronto en Spotify',
    heroCtaEpisodios: 'Ver episodios ↓',

    accessKicker: 'ACCESO',
    accessTitle: 'SOLO PARA LA TRIBU',
    accessCopy: 'El Podcast ZAG es para la tribu. Activa tu perfil y escúchalo desde ROOKIE.',
    accessCtaPrimary: 'Activar mi perfil',
    accessCtaDemo: 'Entrar en modo demo',

    estadoRookie: 'Reto Rookie: escucha 1 episodio y gana un sello',
    estadoSellos: '✓ Ya ganaste sellos con el podcast',
    estadoMaster: 'Puedes postularte como invitado',

    destacadoKicker: 'ÚLTIMO EPISODIO',
    destacadoEvidencia: 'Ya lo escuché → sube tu evidencia',
    destacadoCompartir: 'Compartir episodio',
    destacadoCopiado: 'Link copiado',

    mosaicoKicker: 'EPISODIOS',
    mosaicoTitulo: 'TODO LO QUE SE HA',
    mosaicoTituloAccent: 'DICHO',
    mosaicoProximamente: 'Episodio en producción',

    fichaKicker: 'EPISODIO',
    fichaQueHablamos: 'De qué hablamos',
    fichaMomentos: 'Momentos',
    fichaInvitados: 'Invitados',
    fichaAgendaMentoria: 'Agenda mentoría →',
    fichaCerrar: 'Cerrar',

    playlistKicker: 'PLAYLIST',
    playlistTitulo: 'ESCÚCHALOS',
    playlistTituloAccent: 'TODOS',
    playlistTituloFin: ', UNO TRAS OTRO',
    playlistPlaceholder: 'La playlist del Podcast ZAG llega pronto a Spotify',
    playlistAbrir: 'Abrir en Spotify ↗',

    participaKicker: 'PARTICIPA',
    participaTitulo: 'HAZ PARTE DEL',
    participaTituloAccent: 'PODCAST',

    invitadoKicker: 'DESDE MASTER',
    invitadoTitulo: 'TU',
    invitadoTituloAccent: 'VOZ',
    invitadoTituloFin: ' EN EL PODCAST',
    invitadoCopy: 'Si ya eres referente, cuéntale a la tribu lo que aprendiste. Suma un sello Master.',
    invitadoBtn: 'Quiero ser invitado',
    invitadoLocked: 'Se desbloquea en MASTER',
    invitadoVerComo: 'Ver cómo subir',

    invitadoFormTema: 'Tema que propones',
    invitadoFormPorque: '¿Por qué eres la persona para hablarlo?',
    invitadoFormDisponibilidad: 'Disponibilidad',
    invitadoFormDisponibilidadOpciones: [
      'Entre semana en la mañana',
      'Entre semana en la tarde',
      'Sábados',
    ],
    invitadoFormLink: 'Link a tu portafolio o proyecto',
    invitadoFormEnviar: 'Enviar postulación',
    invitadoFormOk: 'Recibido. El equipo ZAG revisa tu postulación y te contacta para agendar la grabación.',

    proponKicker: 'PARA TODA LA TRIBU',
    proponTitulo: '¿DE QUÉ',
    proponTituloAccent: 'HABLAMOS',
    proponTituloFin: '?',
    proponCopy: 'Dinos qué tema te gustaría escuchar en el Podcast ZAG.',
    proponBtn: 'Proponer un tema',
    proponFormTema: 'Tema',
    proponFormQue: '¿Qué te gustaría saber?',
    proponFormQuien: '¿A quién te gustaría escuchar?',
    proponFormEnviar: 'Enviar propuesta',
    proponFormOk: '¡Propuesta enviada! Gracias por ponerle tema al Podcast ZAG.',

    placeholderMuyPronto: 'Muy pronto en Spotify',
    duracion: function (min) { return '🎧 ' + min + ' min'; },
    fechaCorta: function (iso) {
      var d = new Date(iso + 'T12:00:00');
      if (isNaN(d)) return '';
      var meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
      return d.getDate() + ' ' + meses[d.getMonth()] + ' ' + d.getFullYear();
    },
    numeroEtiqueta: function (n) { return '#' + (n < 10 ? '0' + n : n); },
  };

  function episodio(id) {
    for (var i = 0; i < episodios.length; i++) {
      if (episodios[i].id === id) return episodios[i];
    }
    return null;
  }

  function destacado() { return episodio(destacadoId); }

  function mentor(id) {
    if (!window.ZAG_MENTORIAS) return null;
    var lista = window.ZAG_MENTORIAS.mentores;
    for (var i = 0; i < lista.length; i++) {
      if (lista[i].id === id) return lista[i];
    }
    return null;
  }

  return {
    spotify: spotify,
    episodios: episodios,
    destacadoId: destacadoId,
    coloresCaratula: coloresCaratula,
    ui: ui,
    episodio: episodio,
    destacado: destacado,
    mentor: mentor,
  };
})();
