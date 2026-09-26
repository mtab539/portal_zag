/* ============================================================
   PORTAL ZAG — Muro de Quiebre: datos semilla y textos de UI
   Vanilla JS. Sin librerías. Voz de la comunidad en español
   colombiano (demo).
   ============================================================ */

window.ZAG_MURO = (function () {

  /* --- utilidades de tiempo (relativo, el demo siempre se ve vivo) --- */
  var MIN = 60 * 1000;
  var HOUR = 60 * MIN;
  var DAY = 24 * HOUR;

  function ago(hours, mins) {
    var offset = hours * HOUR + (mins || 0) * MIN;
    return new Date(Date.now() - offset).toISOString();
  }

  var NIVEL_NAMES = {
    rookie: 'ROOKIE',
    strategist: 'STRATEGIST',
    creator: 'CREATOR',
    master: 'MASTER',
    senior: 'SENIOR',
  };

  var UI = {
    /* ---- hero ---- */
    heroKicker: 'COMUNIDAD ZAG',
    heroTitleA: 'El Muro de',
    heroTitleB: 'Quiebre',
    heroSub: '¿Qué le dirías al mundo si nadie te juzgara?',

    /* ---- barra de estado ---- */
    membersLabel: 'Zaggistas activos',
    onlineLabel: 'en línea ahora',
    postsLabel: 'publicaciones',

    /* ---- acceso (sin sesión) ---- */
    accessKicker: 'ESTE MURO ES DE LA TRIBU',
    accessTitle: 'El Muro se abre cuando rompes lo obvio',
    accessCopy: 'Esto es un demo con testimonios de ejemplo. Activa tu perfil ZAG para escribir, reaccionar y responder en el muro real.',
    accessCtaPrimary: 'Activar mi perfil',
    accessCtaSecondary: 'Entrar en modo demo',
    accessLevelLabel: 'Elige tu nivel de la demo',
    accessLevelHint: 'Solo para la demo: el nivel no cambia tu perfil real.',

    /* ---- sesión demo ---- */
    sessionChipAria: 'Sesión en modo demo',
    sessionLevelLabel: 'Nivel',
    sessionExit: 'Salir de la demo',
    myName: 'Tú',

    /* ---- compositor ---- */
    composerClosed: 'Escribe algo, Zaggista…',
    composerPlaceholder: '¿Qué le dirías al mundo si nadie te juzgara?',
    composerCountHint: 'Quedan pocos caracteres',
    composerCancel: 'Cancelar',
    composerPublish: 'Publicar',
    composerPublishedLive: 'Publicado en el Muro',
    composerMaxAlert: 'Máximo 500 caracteres',

    /* ---- filtros ---- */
    filterRecent: 'Recientes',
    filterPopular: 'Populares',
    filterCommented: 'Más comentados',
    filterSaved: 'Guardados',
    filterMine: 'Mis publicaciones',
    levelAll: 'Todos',
    levelFilterAria: 'Filtrar por nivel',

    /* ---- feed ---- */
    feedEmpty: 'No hay publicaciones aquí todavía. Rompe el silencio.',
    feedEmptyMine: 'Todavía no has publicado nada. Empieza por ahí.',
    feedEmptySaved: 'Todavía no has guardado publicaciones. Toca el marcador para guardarlas.',
    pinnedLabel: 'Fijado',
    teamBadge: 'Equipo ZAG',
    seeMore: 'Ver más',
    seeLess: 'Ver menos',
    replyWord: 'respuestas',
    likeAriaOn: 'Quitar Me gusta',
    likeAriaOff: 'Dar Me gusta',
    saveAriaOn: 'Quitar de guardados',
    saveAriaOff: 'Guardar publicación',
    threadAria: 'Abrir hilo de respuestas',
    threadAriaOpen: 'Cerrar hilo de respuestas',
    menuAria: 'Más opciones',
    glyphLike: '♥',
    glyphComment: '💬',
    glyphSave: '🔖',
    lastReply: 'Última respuesta',
    agoMinutes: 'min',
    agoHours: 'h',
    agoDays: 'd',

    /* ---- hilos ---- */
    replyCta: 'Responder',
    replyMorePast: 'Ver las {n} respuestas anteriores',
    ownReplyReply: 'Responder',

    /* ---- comment composer (respuestas) ---- */
    composer: {
      rest: 'Escribe un comentario…',
      commentingAs: 'Comentando como',
      respondingTo: 'Respondiendo a',
      removeMentionAria: 'Quitar la mención a',
      placeholder: 'Responde con algo que rompa lo obvio…',
      draftSaved: 'Borrador guardado',
      hintDesktop: 'Enter para enviar · Shift + Enter para salto de línea',
      send: 'Comentar',
      sending: 'Publicando…',
      sendAriaMobile: 'Publicar comentario',
      cancel: 'Cancelar',
      discardTitle: '¿Descartar tu comentario?',
      discardKeep: 'Seguir escribiendo',
      discardYes: 'Descartar',
      publishedLive: 'Comentario publicado',
      fieldAria: 'Escribe tu comentario en la publicación de {autor}',
      nearLimit: 'Te quedan 30 caracteres',
      atLimit: 'Máximo 300 caracteres',
      nowTime: 'Ahora',
      lastReplyNow: 'hace un momento',
      mentionInputAria: 'Busca un Zaggista para mencionar',
      lockTitle: 'Activa tu perfil ZAG para comentar',
      lockCta: 'Entrar en modo demo',
    },

    /* ---- menú ---- */
    menuReport: 'Reportar',
    menuDelete: 'Eliminar',

    /* ---- reporte ---- */
    reportTitle: 'Reportar publicación',
    reportIntro: '¿Por qué reportas esta publicación?',
    reportReasonLabel: 'Motivo',
    reportSpam: 'Spam',
    reportHarass: 'Ofensivo o acoso',
    reportFake: 'Información falsa',
    reportOther: 'Otro',
    reportOtherPlaceholder: 'Cuéntanos brevemente qué pasó…',
    reportSend: 'Enviar reporte',
    reportCancel: 'Cancelar',
    reportSuccess: 'Reportaste esta publicación. El equipo ZAG la revisará.',
    reportUndo: 'Deshacer',
    reportHiddenPrefix: 'Reportada',
    deleteConfirm: '¿Eliminar esta publicación? No se puede deshacer.',
    deleteConfirmYes: 'Sí, eliminar',
    deleteConfirmNo: 'No, conservarla',

    /* ---- footer demo ---- */
    demoReset: 'Reiniciar demo',
    demoResetDone: 'Demo reiniciada.',
  };

  /* --- data semilla: 12 posts en español colombiano, con voz ZAG --- */
  var SEED = [
    {
      id: 'p1',
      author: { name: 'Mariana P.', initials: 'MP', level: 'rookie', isAdmin: false },
      text: 'Dejé de pedir permiso para tener ideas raras. Ayer mostré mi primera tira de fotos y casi me da un infarto, pero nadie se burló. Primera vez que entiendo que romper lo obvio es un ejercicio, no un talento.',
      createdAt: ago(2, 15),
      likes: 86,
      likedByMe: false,
      savedByMe: false,
      pinned: false,
      reportedByMe: false,
      replies: [
        { id: 'r1a', author: { name: 'Camilo R.', initials: 'CR', level: 'strategist', isAdmin: false }, text: 'Papi, eso es puro quiebre. El miedo pasa, la tira queda.', createdAt: ago(1, 40), likes: 12, likedByMe: false, savedByMe: false, reportedByMe: false },
        { id: 'r1b', author: { name: 'Equipo ZAG', initials: 'ZAG', level: 'master', isAdmin: true }, text: 'Eso es exactamente de lo que se trata este muro. Gracias por empezar, Mariana.', createdAt: ago(1, 5), likes: 24, likedByMe: false, savedByMe: false, reportedByMe: false },
        { id: 'r1c', author: { name: 'Sara L.', initials: 'SL', level: 'strategist', isAdmin: false }, text: 'Que buena nota. "Romper lo obvio es ejercicio, no talento." Me la robo.', createdAt: ago(0, 30), likes: 9, likedByMe: false, savedByMe: false, reportedByMe: false },
      ],
    },
    {
      id: 'p2',
      author: { name: 'Equipo ZAG', initials: 'ZAG', level: 'master', isAdmin: true },
      text: 'Treinta años después seguimos sin seguir a nadie. Este Muro de Quiebre es el lugar para dejar eso por escrito: la frase que nunca te atreviste a decir en clase, en el trabajo o en el retrato del espejo. Reglas: respeto, cero copia y pega, y la verdad por encima de la pose. ⚡',
      createdAt: ago(26),
      likes: 214,
      likedByMe: false,
      savedByMe: false,
      pinned: true,
      reportedByMe: false,
      replies: [
        { id: 'r2a', author: { name: 'Valentina G.', initials: 'VG', level: 'creator', isAdmin: false }, text: 'Créditos a quien los usa bien. Me encanta que esto exista.', createdAt: ago(24), likes: 18, likedByMe: false, savedByMe: false, reportedByMe: false },
        { id: 'r2b', author: { name: 'Julián T.', initials: 'JT', level: 'master', isAdmin: false }, text: 'Firmado. La pose no rompe nada.', createdAt: ago(22), likes: 15, likedByMe: false, savedByMe: false, reportedByMe: false },
      ],
    },
    {
      id: 'p3',
      author: { name: 'Camilo R.', initials: 'CR', level: 'strategist', isAdmin: false },
      text: 'Si mi campaña no incomoda a alguien, la vuelvo a hacer. Hoy presenté una idea en Mercadeo y mi profe me dijo "eso es muy arriesgado". Se lo tomé como cumplido.',
      createdAt: ago(30),
      likes: 132,
      likedByMe: false,
      savedByMe: false,
      pinned: false,
      reportedByMe: false,
      replies: [
        { id: 'r3a', author: { name: 'Daniel Z.', initials: 'DZ', level: 'creator', isAdmin: false }, text: 'Riesgo = campaña viva. Sin eso es solo una tarea.', createdAt: ago(28), likes: 10, likedByMe: false, savedByMe: false, reportedByMe: false },
        { id: 'r3b', author: { name: 'Laura E.', initials: 'LE', level: 'rookie', isAdmin: false }, text: 'Mi primera reacción fue asustarme por ti, jajaja. Pero tienes razón, ¿cómo se aprende si no incomoda?', createdAt: ago(27), likes: 7, likedByMe: false, savedByMe: false, reportedByMe: false },
      ],
    },
    {
      id: 'p4',
      author: { name: 'Equipo ZAG', initials: 'ZAG', level: 'master', isAdmin: true },
      text: 'Reto de la semana: escribí una frase que dirías en el Muro y no en el retrato. Así de simple, así de difícil. Las mejores van para las tiras de fotos del próximo evento. ¿Se les mide?',
      createdAt: ago(44),
      likes: 158,
      likedByMe: false,
      savedByMe: false,
      pinned: true,
      reportedByMe: false,
      replies: [
        { id: 'r4a', author: { name: 'Andrés M.', initials: 'AM', level: 'senior', isAdmin: false }, text: '"Parezco serio, pero rompo por dentro." Ahí está, dicha.', createdAt: ago(40), likes: 31, likedByMe: false, savedByMe: false, reportedByMe: false },
        { id: 'r4b', author: { name: 'Nicole V.', initials: 'NV', level: 'creator', isAdmin: false }, text: '"No vengo a decorar el portafolio, vengo a dejar huella."', createdAt: ago(37), likes: 22, likedByMe: false, savedByMe: false, reportedByMe: false },
        { id: 'r4c', author: { name: 'Juanfer A.', initials: 'JA', level: 'senior', isAdmin: false }, text: '"El zig es cómodo, y la comodidad es mi enemiga."', createdAt: ago(11), likes: 19, likedByMe: false, savedByMe: false, reportedByMe: false },
      ],
    },
    {
      id: 'p5',
      author: { name: 'Valentina G.', initials: 'VG', level: 'creator', isAdmin: false },
      text: 'Llegué por curiosidad. Me quedé porque aquí nadie copia y pega. En el primer evento me tocó hacer el retrato de mi peor fracaso y terminé haciendo el mejor copy de mi vida. Ironías de la vida publicitaria.',
      createdAt: ago(9 * DAY + 5 * HOUR),
      likes: 97,
      likedByMe: false,
      savedByMe: false,
      pinned: false,
      reportedByMe: false,
      replies: [
        { id: 'r5a', author: { name: 'Sara L.', initials: 'SL', level: 'strategist', isAdmin: false }, text: 'Lo del peor fracaso fue brutal. Te felicito por haberlo contado primero.', createdAt: ago(9 * DAY), likes: 8, likedByMe: false, savedByMe: false, reportedByMe: false },
        { id: 'r5b', author: { name: 'Mariana P.', initials: 'MP', level: 'rookie', isAdmin: false }, text: 'Quiero llegar a ese nivel de confianza. Algún día.', createdAt: ago(8 * DAY + 20 * HOUR), likes: 5, likedByMe: false, savedByMe: false, reportedByMe: false },
        { id: 'r5c', author: { name: 'Nicole V.', initials: 'NV', level: 'creator', isAdmin: false }, text: 'El peor fracaso siempre termina siendo el mejor case study. Confirmo.', createdAt: ago(8 * DAY), likes: 11, likedByMe: false, savedByMe: false, reportedByMe: false },
        { id: 'r5d', author: { name: 'Camilo R.', initials: 'CR', level: 'strategist', isAdmin: false }, text: 'Ironía pura. Me encanta.', createdAt: ago(7 * DAY + 12 * HOUR), likes: 3, likedByMe: false, savedByMe: false, reportedByMe: false },
      ],
    },
    {
      id: 'p6',
      author: { name: 'Andrés M.', initials: 'AM', level: 'senior', isAdmin: false },
      text: 'El zig es cómodo. Por eso lo dejé. Tres años haciendo lo mismo que todos me tuvieron a nada de renunciar a la publicidad. El ZAG no me "salvó": me devolvió las ganas.',
      createdAt: ago(7 * DAY),
      likes: 122,
      likedByMe: false,
      savedByMe: false,
      pinned: false,
      reportedByMe: false,
      replies: [
        { id: 'r6a', author: { name: 'Daniel Z.', initials: 'DZ', level: 'creator', isAdmin: false }, text: 'Tres años. Usted sí vino a contar la historia completa, no el resumen.', createdAt: ago(6 * DAY + 20 * HOUR), likes: 14, likedByMe: false, savedByMe: false, reportedByMe: false },
        { id: 'r6b', author: { name: 'Equipo ZAG', initials: 'ZAG', level: 'master', isAdmin: true }, text: 'Gracias por la honestidad, Andrés. Eso también es quiebre.', createdAt: ago(6 * DAY), likes: 20, likedByMe: false, savedByMe: false, reportedByMe: false },
      ],
    },
    {
      id: 'p7',
      author: { name: 'Sara L.', initials: 'SL', level: 'strategist', isAdmin: false },
      text: 'Mi primera tira de fotos tiene mejores ideas que mi portafolio viejo. Punto. Y duele decirlo, pero ese dolor es el motor. Si no te da un poquito de embarazo lo que hiciste, no hiciste nada para ti.',
      createdAt: ago(6 * DAY),
      likes: 88,
      likedByMe: false,
      savedByMe: false,
      pinned: false,
      reportedByMe: false,
      replies: [
        { id: 'r7a', author: { name: 'Valentina G.', initials: 'VG', level: 'creator', isAdmin: false }, text: 'Ese dolor es el motor: lo enmarco.', createdAt: ago(5 * DAY + 20 * HOUR), likes: 6, likedByMe: false, savedByMe: false, reportedByMe: false },
        { id: 'r7b', author: { name: 'Laura E.', initials: 'LE', level: 'rookie', isAdmin: false }, text: 'Ay, me dio susto y ganas al mismo tiempo. Creo que lo voy a estampar en el computador.', createdAt: ago(5 * DAY), likes: 4, likedByMe: false, savedByMe: false, reportedByMe: false },
        { id: 'r7c', author: { name: 'Julián T.', initials: 'JT', level: 'master', isAdmin: false }, text: '"No hiciste nada para ti." Tome. Eso va al board.', createdAt: ago(4 * DAY + 18 * HOUR), likes: 9, likedByMe: false, savedByMe: false, reportedByMe: false },
      ],
    },
    {
      id: 'p8',
      author: { name: 'Julián T.', initials: 'JT', level: 'master', isAdmin: false },
      text: 'Romper lo obvio también es no copiarte a ti mismo. He visto creativos repetir su propia fórmula hasta el hartazgo porque "dio resultado". El Muro me recordó que la fórmula se cansa. La idea, no.',
      createdAt: ago(4 * DAY),
      likes: 104,
      likedByMe: false,
      savedByMe: false,
      pinned: false,
      reportedByMe: false,
      replies: [
        { id: 'r8a', author: { name: 'Nicole V.', initials: 'NV', level: 'creator', isAdmin: false }, text: 'Usted no está equivocado. La fórmula se cansa y el público también.', createdAt: ago(3 * DAY + 22 * HOUR), likes: 12, likedByMe: false, savedByMe: false, reportedByMe: false },
        { id: 'r8b', author: { name: 'Camilo R.', initials: 'CR', level: 'strategist', isAdmin: false }, text: '"La idea, no." Corto y exacto.', createdAt: ago(3 * DAY), likes: 7, likedByMe: false, savedByMe: false, reportedByMe: false },
        { id: 'r8c', author: { name: 'Andrés M.', initials: 'AM', level: 'senior', isAdmin: false }, text: 'Eso explica mi crisis del año pasado. Gracias, parce.', createdAt: ago(2 * DAY + 20 * HOUR), likes: 5, likedByMe: false, savedByMe: false, reportedByMe: false },
      ],
    },
    {
      id: 'p9',
      author: { name: 'Daniel Z.', initials: 'DZ', level: 'creator', isAdmin: false },
      text: 'Cuando me tocó el booth del evento pensé: ¿y si mi frase suena cochina? La escribí igual. La comunidad la aplaudió. El miedo a sonar "mal" es el filtro más caro que le podemos poner a nuestras ideas.',
      createdAt: ago(3 * DAY),
      likes: 76,
      likedByMe: false,
      savedByMe: false,
      pinned: false,
      reportedByMe: false,
      replies: [
        { id: 'r9a', author: { name: 'Sara L.', initials: 'SL', level: 'strategist', isAdmin: false }, text: '"El filtro más caro." Lo llevo anotado.', createdAt: ago(2 * DAY + 16 * HOUR), likes: 11, likedByMe: false, savedByMe: false, reportedByMe: false },
        { id: 'r9b', author: { name: 'Mariana P.', initials: 'MP', level: 'rookie', isAdmin: false }, text: 'Necesitaba leer esto hoy. No borro nada esta semana. Suscrita al reto.', createdAt: ago(2 * DAY), likes: 13, likedByMe: false, savedByMe: false, reportedByMe: false },
      ],
    },
    {
      id: 'p10',
      author: { name: 'Laura E.', initials: 'LE', level: 'rookie', isAdmin: false },
      text: 'No vine a ser igual. Vine a ser rara, con título. Mi mamá cree que la publicidad es "eso del internet". Este muro es la primera vez que siento que hablo con gente que entiende sin explicar.',
      createdAt: ago(2 * DAY),
      likes: 69,
      likedByMe: false,
      savedByMe: false,
      pinned: false,
      reportedByMe: false,
      replies: [
        { id: 'r10a', author: { name: 'Valentina G.', initials: 'VG', level: 'creator', isAdmin: false }, text: '"Rara, con título." Título de la biografía completa.', createdAt: ago(DAY + 20 * HOUR), likes: 16, likedByMe: false, savedByMe: false, reportedByMe: false },
        { id: 'r10b', author: { name: 'Juanfer A.', initials: 'JA', level: 'senior', isAdmin: false }, text: 'Entienden sin explicar. Eso es lo que buscamos aquí, ¿cierto?', createdAt: ago(DAY + 10 * HOUR), likes: 8, likedByMe: false, savedByMe: false, reportedByMe: false },
      ],
    },
    {
      id: 'p11',
      author: { name: 'Juanfer A.', initials: 'JA', level: 'senior', isAdmin: false },
      text: 'Trabajo hace ocho años en agencias y nunca vi un muro como este. Aquí no te juzgan por el fracaso, te juzgan por no intentarlo. Ese cambio de reglas es todo el quiebre que necesitaba.',
      createdAt: ago(DAY + 8 * HOUR),
      likes: 91,
      likedByMe: false,
      savedByMe: false,
      pinned: false,
      reportedByMe: false,
      replies: [
        { id: 'r11a', author: { name: 'Daniel Z.', initials: 'DZ', level: 'creator', isAdmin: false }, text: 'Ocho años en agencias y el quiebre se dio en la EAM. Irónico y bacano.', createdAt: ago(DAY + 3 * HOUR), likes: 9, likedByMe: false, savedByMe: false, reportedByMe: false },
        { id: 'r11b', author: { name: 'Equipo ZAG', initials: 'ZAG', level: 'master', isAdmin: true }, text: 'Gracias por validarlo desde la calle, Juanfer. Así se construye la tribu.', createdAt: ago(DAY), likes: 13, likedByMe: false, savedByMe: false, reportedByMe: false },
        { id: 'r11c', author: { name: 'Nicole V.', initials: 'NV', level: 'creator', isAdmin: false }, text: '"Te juzgan por no intentarlo." Me manda a revisar mis proyectos del año pasado.', createdAt: ago(0, 50), likes: 6, likedByMe: false, savedByMe: false, reportedByMe: false },
      ],
    },
    {
      id: 'p12',
      author: { name: 'Nicole V.', initials: 'NV', level: 'creator', isAdmin: false },
      text: 'Quiero hacer las campañas de lo que viene, no de lo que fue. Este año dejé de hacer "casos de éxito" y empecé a hacer preguntas incómodas en clase. Se nota, y no me importa. Por fin.',
      createdAt: ago(8 * HOUR),
      likes: 54,
      likedByMe: false,
      savedByMe: false,
      pinned: false,
      reportedByMe: false,
      replies: [
        { id: 'r12a', author: { name: 'Andrés M.', initials: 'AM', level: 'senior', isAdmin: false }, text: 'Las preguntas incómodas en clase son el mejor boomerang. Siga.', createdAt: ago(6 * HOUR), likes: 10, likedByMe: false, savedByMe: false, reportedByMe: false },
        { id: 'r12b', author: { name: 'Laura E.', initials: 'LE', level: 'rookie', isAdmin: false }, text: 'El "y no me importa. Por fin." define mi meta del año.', createdAt: ago(5 * HOUR), likes: 7, likedByMe: false, savedByMe: false, reportedByMe: false },
      ],
    },
    {
      id: 'p13',
      author: { name: 'Mariana T.', initials: 'MT', level: 'senior', isAdmin: false, photo: 'assets/img/perfil-mariana.jpg' },
      text: 'Veinte años de oficio me enseñaron que el jurado más difícil no está en la mesa: está en la silla de al lado, y a veces es uno mismo. Aquí aprendí a mostrar el borrador de las ideas antes de pulirlas, y entiendo mejor lo que pasa cuando un trabajo no pasa un pitch: no era el verbo, era el miedo a soltarlo.',
      createdAt: ago(30 * HOUR),
      likes: 143,
      likedByMe: false,
      savedByMe: false,
      pinned: false,
      reportedByMe: false,
      replies: [
        { id: 'r13a', author: { name: 'Camilo R.', initials: 'CR', level: 'strategist', isAdmin: false }, text: 'Mostrar el borrador es mostrarse uno. Qué nivel de historia, Mariana.', createdAt: ago(28 * HOUR), likes: 16, likedByMe: false, savedByMe: false, reportedByMe: false },
        { id: 'r13b', author: { name: 'Equipo ZAG', initials: 'ZAG', level: 'master', isAdmin: true }, text: 'El miedo a soltarlo. De las cosas más ciertas que se han dicho acá.', createdAt: ago(26 * HOUR), likes: 21, likedByMe: false, savedByMe: false, reportedByMe: false },
        { id: 'r13c', author: { name: 'Juanfer A.', initials: 'JA', level: 'senior', isAdmin: false }, text: 'Eso del pitch es exacto: cuando pierdes sabes que no era la pieza, era la puesta en escena del miedo.', createdAt: ago(12 * HOUR), likes: 9, likedByMe: false, savedByMe: false, reportedByMe: false },
      ],
    },
    {
      id: 'p14',
      author: { name: 'Tattiana B.', initials: 'TB', level: 'senior', isAdmin: false, photo: 'assets/img/perfil-tattiana.png' },
      text: 'Dirijo cuentas hace años y siempre creí que mi trabajo era que todo encajara. El ZAG me enseñó lo contrario: el quiebre no es un momento, es una forma de leer la realidad. Hoy mi mejor pitch no fue el más limpio, fue el que dejó ver la fisura y la convirtió en gancho.',
      createdAt: ago(3 * DAY + 4 * HOUR),
      likes: 118,
      likedByMe: false,
      savedByMe: false,
      pinned: false,
      reportedByMe: false,
      replies: [
        { id: 'r14a', author: { name: 'Valentina G.', initials: 'VG', level: 'creator', isAdmin: false }, text: 'La fisura como gancho. Eso es oro, Tattiana.', createdAt: ago(3 * DAY), likes: 14, likedByMe: false, savedByMe: false, reportedByMe: false },
        { id: 'r14b', author: { name: 'Laura E.', initials: 'LE', level: 'rookie', isAdmin: false }, text: 'Anotado en el cuaderno: no todo lo que encaja es correcto.', createdAt: ago(2 * DAY + 12 * HOUR), likes: 8, likedByMe: false, savedByMe: false, reportedByMe: false },
      ],
    },
    {
      id: 'p15',
      author: { name: 'Nicolas C.', initials: 'NC', level: 'senior', isAdmin: false, photo: 'assets/img/perfil-nicolas.png' },
      text: 'Los años me enseñaron que el directo de arte también dirige la mirada de la gente. Por eso rompo las composiciones "correctas": si un layout se ve perfecto pero no mueve nada, es solo decoración. Aquí aprendí que la exigencia no es perfección, es que cada cuadro tenga una intención.',
      createdAt: ago(5 * DAY + 6 * HOUR),
      likes: 109,
      likedByMe: false,
      savedByMe: false,
      pinned: false,
      reportedByMe: false,
      replies: [
        { id: 'r15a', author: { name: 'Andrés M.', initials: 'AM', level: 'senior', isAdmin: false }, text: '"Perfecto pero no mueve nada." Esa frase queda para el board.', createdAt: ago(4 * DAY + 18 * HOUR), likes: 12, likedByMe: false, savedByMe: false, reportedByMe: false },
        { id: 'r15b', author: { name: 'Sara L.', initials: 'SL', level: 'strategist', isAdmin: false }, text: 'Comparto: la composición sin intención es solo ruido bonito.', createdAt: ago(4 * DAY), likes: 7, likedByMe: false, savedByMe: false, reportedByMe: false },
      ],
    },
    {
      id: 'p16',
      author: { name: 'Carlos L.', initials: 'CL', level: 'senior', isAdmin: false, photo: 'assets/img/perfil-carlos.png' },
      text: 'Llevo diez años haciendo fotografía de producto y cada vez me convenzo más de que la verdad también se ilumina. El ZAG me devolvió el amor por el error: aquella toma que iba "mal" terminó siendo la portada. Cuando el plan falla, el ojo se despierta.',
      createdAt: ago(20 * HOUR),
      likes: 127,
      likedByMe: false,
      savedByMe: false,
      pinned: false,
      reportedByMe: false,
      replies: [
        { id: 'r16a', author: { name: 'Nicole V.', initials: 'NV', level: 'creator', isAdmin: false }, text: 'La portada que nació de la toma "mal" es la mejor lección del mes.', createdAt: ago(16 * HOUR), likes: 15, likedByMe: false, savedByMe: false, reportedByMe: false },
        { id: 'r16b', author: { name: 'Camilo R.', initials: 'CR', level: 'strategist', isAdmin: false }, text: '"Cuando el plan falla, el ojo se despierta." Me la llevo para el estudio.', createdAt: ago(12 * HOUR), likes: 9, likedByMe: false, savedByMe: false, reportedByMe: false },
      ],
    },
  ];

  return {
    nivelNames: NIVEL_NAMES,
    nivelOrder: ['rookie', 'strategist', 'creator', 'master', 'senior'],
    maxText: 500,
    maxReply: 300,
    truncateChars: 280,
    onlineNow: 47,
    membersNow: 328,
    ui: UI,
    seedPosts: SEED,
    heroTeam: [
      { name: 'Mariana T.', role: 'Trafficker', photo: 'assets/img/perfil-mariana.jpg' },
      { name: 'Tattiana B.', role: 'Directora de Arte', photo: 'assets/img/perfil-tattiana.png' },
      { name: 'Nicolas C.', role: 'Diseñador', photo: 'assets/img/perfil-nicolas.png' },
      { name: 'Carlos L.', role: 'Publicista y Docente', photo: 'assets/img/perfil-carlos.png' },
    ],
  };
})();