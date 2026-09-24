/* ============================================================
   PORTAL ZAG — Contenido
   Toda la data de las secciones vive aquí (separación
   contenido / presentación). En una fase 2, este objeto se
   reemplaza por llamadas a una API sin tocar el HTML.
   ============================================================ */

window.ZAG_CONTENT = {
  urls: {
    proximamente: 'proximamente.html',
  },

  nav: [
    { label: 'Inicio', href: 'index.html' },
    { label: 'Únete', href: '#unirme' },
    { label: 'Perfil', href: 'proximamente.html' },
    { label: 'Comunidad', href: '#muro' },
    { label: 'Eventos', href: '#eventos' },
    { label: 'ZAG Room', href: 'proximamente.html' },
    { label: 'Tienda', href: 'proximamente.html' },
  ],

  hero: {
    eyebrow: 'PUBLICIDAD DIGITAL Y MERCADEO · EAM · 30 AÑOS',
    title: [
      { text: '¿SÓLO PORQUE ZIG?' },
      { text: 'ÚNETE AL ZAG.', zag: true },
    ],
    sub: 'Hace 30 años el programa de Publicidad de la EAM eligió el camino opuesto al de todos. No fue un error. Fue una decisión.',
    ctaPrimary: {
      label: 'Ver mi perfil ZAG',
      href: 'proximamente.html',
    },
    ctaSecondary: {
      label: '¿No tienes tira? Únete a la tribu →',
      href: '#unirme',
    },
  },

  marquee: {
    text: '¿SÓLO PORQUE ZIG? ÚNETE AL ZAG',
    repeat: 3,
  },

  contexto: {
    answerTipTerm: 'zag',
    statementLines: [
      { text: 'Cuando todos hacen zig' },
      { text: 'La EAM hace ZAG', accent: 'ZAG' },
    ],
    quote: 'En una época en la que proliferan los productos de imitación y asistimos a una saturación de la oferta, mantener el nivel de competencia ya no es una estrategia de éxito... Cuando todos hacen zig, hacer zag. En un mundo de extrema competencia, se exige algo más que ser diferente: la diferenciación radical.',
    quoteAuthor: 'Marty Neumeier',
    close: 'Cada generación de estudiantes y egresados ha sumado un «zag» más. Los 30 años no son solo un número — son la prueba viviente del concepto.',
  },

  carrusel: {
    kicker: 'Ya es una cultura',
    title: 'Lo que ya pasó en el campus',
    titleAccent: 'en el campus',
    sub: 'Activaciones de la campaña de expectativa «El fin del Zig». En fotos.',
    items: [
      {
        img: 'assets/img/evento-fase-incomodidad.webp',
        alt: 'Fotografía de la activación de la Fase Incomodidad en el campus del ZAG',
        tag: 'Fase Incomodidad',
        caption: 'Hicimos ruido a propósito. Antes de explicarte, te molestamos.',
      },
      {
        img: 'assets/img/evento-museo-del-zig.webp',
        alt: 'Fotografía de la vitrina del Museo del Zig durante el evento',
        tag: 'Museo del Zig',
        caption: 'Publicidad genérica, en vitrina. Quien no tenía nada que decir, quedó expuesto.',
      },
      {
        img: 'assets/img/evento-fase-quiebre.webp',
        alt: 'Fotografía de la instalación de la Fase Quiebre en el campus',
        tag: 'Fase Quiebre',
        caption: 'El final de lo obvio. Un ataúd, un QR y cero ceremonia.',
      },
      {
        img: 'assets/img/evento-fase-transicion.webp',
        alt: 'Fotografía del recorrido de la Fase Transición con el zigzag del ZAG',
        tag: 'Fase Transición',
        caption: 'La línea recta se quebró. Todos siguieron el camino fácil… ¿Solo porque zig?',
      },
    ],
  },

  muro: {
    kicker: 'COMUNIDAD',
    title: 'El Muro de Quiebre',
    titleAccent: 'Quiebre',
    sub: '',
    note: 'Testimonios de ejemplo — los reales llegan con cada evento',
    quotes: [
      { author: 'Mariana P.', text: 'Dejé de pedir permiso para tener ideas raras.' },
      { author: 'Camilo R.', text: 'Si mi campaña no incomoda a alguien, la vuelvo a hacer.' },
      { author: 'Valentina G.', text: 'Llegué por curiosidad. Me quedé porque aquí nadie copia y pega.' },
      { author: 'Andrés M.', text: 'El zig es cómodo. Por eso lo dejé.' },
      { author: 'Sara L.', text: 'Treinta años después seguimos sin seguir a nadie.' },
      { author: 'Julián T.', text: 'Mi primera tira de fotos tiene mejores ideas que mi portafolio viejo.' },
      { author: 'Daniel Z.', text: 'Romper lo obvio también es no copiarte a ti mismo.' },
      { author: 'Laura E.', text: 'No vine a ser igual. Vine a ser rara, con título.' },
    ],
  },

  niveles: {
    kicker: 'PROGRESIÓN',
    title: 'Conoce los perfiles ZAG',
    sub: 'De Rookie a Senior, así se sube en la comunidad.',
    sellosLine: 'Cada nivel se sube completando 6 sellos \u2014 sin atajos y sin esperar al próximo evento.',
    cta: 'Ver beneficios y retos →',
    levels: [
      {
        id: 'rookie',
        name: 'ROOKIE',
        identity: 'Explorador',
        color: 'rookie',
        benefit: 'Fogata Zaggista (abierta a todos), podcast base y eventos abiertos.',
      },
      {
        id: 'strategist',
        name: 'STRATEGIST',
        identity: 'Pensador',
        color: 'strategist',
        benefit: 'Suma mentorías grupales con egresados y cursos extraclase.',
      },
      {
        id: 'creator',
        name: 'CREATOR',
        identity: 'Creador',
        color: 'creator',
        benefit: 'Dinámicas con marcas aliadas y acceso inicial al ZAG Room.',
      },
      {
        id: 'master',
        name: 'MASTER',
        identity: 'Referente',
        color: 'master',
        benefit: 'Participación en el podcast y uso pleno del ZAG Room.',
      },
      {
        id: 'senior',
        name: 'SENIOR',
        identity: 'Constructor de Cultura',
        color: 'senior',
        benefit: 'Mentorías personalizadas, liderar espacios y acceso permanente al ZAG Room.',
      },
    ],
  },

  acordeon: {
    kicker: 'LA SOCIEDAD ZAG',
    title: 'Descubre todo lo que el ZAG tiene para ti',
    items: [
      { title: 'Comunidad', img: 'assets/img/comunidad.jpg', desc: 'El Muro de Quiebre y el blog de fracasos: testimonios reales de la tribu y casos que no funcionaron, contados sin filtro.', link: '#muro' },
      { title: 'Eventos', desc: 'Fogatas, mentorías y activaciones ZAG — presenciales y digitales, para que nunca te quedes por fuera.', tips: ['fogata'], link: 'proximamente.html' },
      { title: 'Aprende más', desc: 'Cursos Extraclase de growth hacking, branding experimental, IA aplicada y UX/UI. No califican: son cultura.', link: 'proximamente.html' },
      { title: 'ZAG Room', desc: 'El territorio físico de la Sociedad ZAG: espacio de creación, mentorías y encuentro para niveles altos.', tips: ['zagroom', 'sociedadzag'], link: 'proximamente.html' },
      { title: 'Tienda ZAG', desc: 'Merchandising oficial que se desbloquea según tu nivel. Tu nivel desbloquea tu estilo.', link: 'proximamente.html' },
    ],
  },

  unirme: {
    kicker: 'ÚNETE',
    title: 'Únete al ZAG',
    sub: 'Recuerda: el portal no te pide que vuelvas a contar quién eres. Tu tira de fotos del Booth ya lo hizo por ti.',
    cards: [
      {
        title: 'Ya salí del Booth con mi tira',
        desc: 'Escanea el QR del reverso de tu tira de fotos y activa tu perfil. Cero formularios desde cero.',
        tips: ['booth'],
        cta: { label: 'Ver mi perfil ZAG', href: 'proximamente.html' },
      },
      {
        title: 'No tengo tira todavía',
        desc: 'Erróneos o no, llevamos ZAG contigo: llega a una Fogata, a una activación abierta, o escribe al programa. La tribu no discrimina por carrera.',
        cta: { label: 'Quiero unirme', href: 'proximamente.html' },
      },
    ],
  },

  close: {
    kicker: '30 AÑOS ROMPIENDO LO OBVIO',
    text: 'ZAG no es solo un concepto creativo: es un sistema diseñado para permanecer en la mente y en la experiencia de quienes lo viven.',
    cta: { label: 'Únete al ZAG', href: '#unirme' },
  },

  footer: {
    institutional: 'Publicidad Digital y Mercadeo · EAM Institución Universitaria',
    legal: 'Portal ZAG — campaña de los 30 años del programa de Publicidad Digital y Mercadeo. Este es un sitio de demostración; las pantallas del portal se conectan progresivamente.',
    social: [
      { label: 'Instagram', href: '#' },
      { label: 'TikTok', href: '#' },
      { label: 'Web ZAG', href: 'index.html' },
    ],
  },

  /* Glosario — definiciones textuales (corrección H2). */
  glossary: {
    zag: 'Según la teoría de Marty Neumeier, el ZIG es el camino fácil y predecible; el ZAG es romper ese patrón y construir algo propio e incomparable.',
    sello: 'Se gana al completar un reto validado en una estación o actividad ZAG. 6 sellos = subes de nivel.',
    murodequiebre: 'El mural vivo de la comunidad — cada participante deja su tira de fotos y una palabra que responde a «¿qué le dirías al mundo si nadie te juzgara?».',
    sociedadzag: 'El ecosistema que se activa después del evento principal — la red de estudiantes, egresados y docentes ya conectados.',
    zagroom: 'El territorio físico de la Sociedad ZAG — espacio de estudio, creación y mentorías (acceso desde Creator en adelante).',
    zaggista: 'Quien ya forma parte activa de la comunidad — dejó de ser asistente y ahora construye cultura ZAG.',
    fogata: 'Encuentro informal (chocolate, malvaviscos, conversación real) abierto a todos los niveles.',
    booth: 'La cabina del evento que te convierte en campaña — reaccionas a un reto absurdo, te toman 3 fotos, sales con tu primera pieza publicitaria real.',
  },
};