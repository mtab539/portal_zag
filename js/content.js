/* ============================================================
   PORTAL ZAG — Contenido
   Toda la data de las secciones vive aquí (separación
   contenido / presentación). En una fase 2, este objeto se
   reemplaza por llamadas a una API sin tocar el HTML.
   ============================================================ */

window.ZAG_CONTENT = {
  urls: {
    proximamente: 'proximamente.html',
    fogatas: 'fogatas.html',
  },

  nav: [
    { label: 'Inicio', href: 'index.html' },
    {
      label: 'Comunidad',
      children: [
        {
          label: 'Muro de quiebre',
          desc: 'Testimonios de quienes rompieron lo obvio',
          icon: 'wall',
          iconSrc: 'assets/img/icons/rayo-muro.svg',
          href: 'muro.html',
        },
        {
          label: 'Blog de Fracasos',
          desc: 'Errores que no se repiten: los éxitos se cocinan',
          icon: 'fail',
          iconSrc: 'assets/img/icons/blog-errores.svg',
          href: 'casos.html',
        },
        {
          label: 'Proyectos fuera del ZIG',
          desc: 'Ideas que nacieron fuera y terminaron haciendo ZAG',
          icon: 'rocket',
          iconSrc: 'assets/img/icons/cohete-proyectos.svg',
          href: 'proyectos.html',
        },
        {
          label: 'Podcast ZAG',
          desc: 'Conversaciones que rompen lo obvio, en tus oídos',
          icon: 'talk',
          iconSrc: 'assets/img/icons/microfono-podcast.svg',
          href: 'proximamente.html',
        },
        {
          label: 'Conoce los perfiles',
          desc: 'De Rookie a Senior: así se sube en la comunidad',
          icon: 'compass',
          iconSrc: 'assets/img/icons/perfiles.svg',
          href: 'index.html#perfiles',
        },
      ],
    },
    {
      label: 'Eventos',
      children: [
        {
          label: 'Fogatas',
          desc: 'Encuentros informales: chocolate, risas y conversación real',
          icon: 'fire',
          iconSrc: 'assets/img/icons/fogata.svg',
          href: 'fogatas.html',
        },
        {
          label: 'Seminario',
          desc: 'Somos ZAG · 12 y 13 de noviembre',
          icon: 'talk',
          iconSrc: 'assets/img/icons/personas-seminario.svg',
          href: 'seminario.html',
        },
      ],
    },
    {
      label: 'Aprende más',
      children: [
        {
          label: 'Mentorías',
          desc: 'Tu ruta para subir de nivel, con alguien que ya la recorrió',
          icon: 'compass',
          iconSrc: 'assets/img/icons/brujula-mentorias.svg',
          href: 'mentorias.html',
        },
        {
          label: 'Cursos extraclase',
          desc: 'Lo que el pensum no te cuenta. Aprende haciendo ZAG',
          icon: 'learn',
          iconSrc: 'assets/img/icons/libro-cursos.svg',
          href: 'cursos.html',
        },
      ],
    },
    { label: 'ZAG Room', href: 'zag-room.html' },
    { label: 'Tienda', href: 'tienda.html' },
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
      /* perfil-links.js lo cambia a perfil.html cuando ya hay perfil */
      href: 'registro.html',
    },
    ctaSecondary: {
      label: 'Únete a la tribu →',
      href: 'registro.html',
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
    title: 'Lo que ya pasó en la EAM',
    titleAccent: 'la EAM',
    sub: 'Activaciones de la campaña de expectativa «El fin del Zig» y la inducción de nuestros nuevos Zaggistas 2026-II.',
    items: [
      {
        img: 'assets/img/evento/equipo.jpg',
        alt: 'El equipo organizador del evento ZAG',
        tag: 'Tribu Zaggista',
        caption: 'Este es el equipo detrás de la ejecución que rompió la línea recta en Expo U.',
      },
      {
        img: 'assets/img/evento/creadores.jpg',
        alt: 'Las mentes del ZAG: Tattiana Bernal y Mariana Tabares',
        tag: 'Las mentes del ZAG',
        caption: 'El fin del zig fue ideado y dirigido por Tattiana Bernal y Mariana Tabares (Matti); y junto a su equipo hicieron de Expo U, un espacio ZAG.',
      },
      {
        img: 'assets/img/evento/bernardo.jpg',
        alt: 'Bernardo, director de mercadeo, dando la bienvenida ZAG',
        tag: '¡Bienvenida al ZAG!',
        caption: 'Bernardo, el director de mercadeo recibió a nuevos zaggistas para empezar el semestre fuera de la caja.',
      },
      {
        img: 'assets/img/evento/induccion.jpg',
        alt: 'Primer contacto ZAG en la inducción',
        tag: 'Primer contacto ZAG',
        caption: 'Este fue el primer paso para pertenecer a una comunidad que se atreve a pensar diferente.',
      },
      {
        img: 'assets/img/evento/induccion2.jpg',
        alt: 'Cultura en movimiento durante la inducción ZAG',
        tag: 'Cultura en movimiento',
        caption: 'Los nuevos estudiantes de la EAM pasaron de ser espectadores a convertirse en miembros de la comunidad ZAG.',
      },
      {
        img: 'assets/img/evento/camiseta.jpg',
        alt: 'Ctrl ZAG: la camiseta oficial del ZAG',
        tag: 'Ctrl ZAG',
        caption: 'Una muestra real de cómo el ZAG se sostiene en la capacidad de crear mundos nuevos frente a quienes están listos para el reto.',
      },
      {
        img: 'assets/img/evento/rectora.jpg',
        alt: 'La rectora acompañando la comunidad ZAG',
        tag: 'Somos ZAG',
        caption: 'Más allá de compromisos administrativos, la rectora está presente para validar el esfuerzo de quienes no se conforman con lo básico.',
      },
      {
        img: 'assets/img/evento/videojuego.jpg',
        alt: 'Talento Zaggista programando un videojuego interactivo',
        tag: 'Talento Zaggista',
        caption: 'Mientras otros leen la teoría, el talento zaggista está programando realidades interactivas que atraen a los demás.',
      },
    ],
  },

  muro: {
    kicker: 'COMUNIDAD',
    title: 'El Muro de Quiebre',
    titleAccent: 'Quiebre',
    sub: '',
    note: 'Testimonios de ejemplo — los reales llegan con cada evento',
    link: {
      label: 'Ver el muro completo →',
      href: 'muro.html',
    },
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
    sellosLine: 'Cada nivel se sube completando 6 sellos.',
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
    titleAccent: 'ZAG',
    items: [
      { title: 'Comunidad', img: 'assets/img/comunidad.jpg', desc: 'Todo el universo Zaggista en un solo lugar para explorar testimonios reales, fracasos estratégicos, proyectos innovadores, episodios del podcast y el sistema de perfiles que define a nuestra cultura.', link: '#muro' },
      { title: 'Eventos', desc: 'Espacios diseñados para vivir la cultura fuera del aula alternando entre encuentros alrededor de una fogata y seminarios especializados diseñados para fortalecer el pensamiento Zaggista.', tips: ['fogata'], link: 'fogatas.html' },
      { title: 'Aprende más', desc: 'Superar la teoría básica requiere cruzar la visión técnica de cursos extracurriculares con la guía de líderes dispuestos a impulsar nuevos talentos.', link: 'cursos.html' },
      { title: 'ZAG Room', desc: 'El territorio físico de la Sociedad ZAG destinado a la co-creación, las mentorías avanzadas y el encuentro exclusivo de las mentes que lideran la comunidad.', tips: ['zagroom', 'sociedadzag'], link: 'zag-room.html' },
      { title: 'Tienda ZAG', desc: 'El merchandising oficial ofrece prendas y accesorios oficiales que se habilitan a medida que el talento asciende dentro de la comunidad ZAG.', link: 'tienda.html' },
    ],
  },

  unirme: {
    kicker: 'ÚNETE',
    title: 'Únete al ZAG',
    sub: 'Si eres de Publicidad Digital y Mercadeo y tienes correo institucional, ya puedes ser ZAG.',
    image: 'assets/img/unetealzag.svg',
    cards: [
      {
        title: 'Ya soy ZAG',
        desc: 'Entra con tu correo institucional y sigue tu camino de sellos, retos y niveles.',
        img: 'assets/img/cajazag.jpg',
        cta: { label: 'Ver mi perfil', href: 'perfil.html' },
      },
      {
        title: 'Quiero ser parte',
        desc: 'Inscríbete con tu correo EAM: empiezas en ROOKIE y subes de nivel con 6 sellos.',
        img: 'assets/img/camiseta-zag.jpg',
        cta: { label: 'Inscribirme', href: 'registro.html' },
      },
    ],
  },

  close: {
    kicker: '30 AÑOS ROMPIENDO LO OBVIO',
    text: 'ZAG no es solo un concepto creativo: es un sistema diseñado para permanecer en la mente y en la experiencia de quienes lo viven.',
    cta: { label: 'Únete al ZAG', href: 'registro.html' },
  },

  footer: {
    institutional: 'Publicidad Digital y Mercadeo · EAM Institución Universitaria',
    legal: 'Portal ZAG — campaña de los 30 años del programa de Publicidad Digital y Mercadeo. Este es un sitio de demostración; las pantallas del portal se conectan progresivamente.',
    logoEam: {
      src: 'assets/logos/logoeam.svg',
      alt: 'EAM Institución Universitaria',
      href: 'https://eam.edu.co/',
    },
    contacto: {
      titulo: 'Contacto & Sede',
      direccion: 'Avenida Bolívar # 3-11, Armenia, Quindío, Colombia',
      telefono: 'PBX: +57 (606) 745 1101',
      telefonoHref: 'tel:+576067451101',
      correo: 'eam@eam.edu.co',
      horario: 'Lunes a Viernes: 7:30 AM – 7:00 PM',
    },
    social: [
      { label: '@eamdelquindio', icon: 'instagram', href: 'https://www.instagram.com/eamdelquindio/' },
      { label: '@eamdelquindio', icon: 'tiktok', href: 'https://www.tiktok.com/@eamdelquindio?lang=es' },
      { label: 'www.eam.edu.co', icon: 'web', href: 'https://eam.edu.co/' },
    ],
  },

  /* Glosario — definiciones textuales (corrección H2). */
  glossary: {
    zag: 'Según la teoría de Marty Neumeier, el ZIG es el camino fácil y predecible; el ZAG es romper ese patrón y construir algo propio e incomparable.',
    sello: 'Se estampa cuando un encargado aprueba la evidencia de tu reto. 6 sellos del nivel actual = subes de nivel.',
    murodequiebre: 'El mural vivo de la comunidad — cada participante deja una palabra que responde a «¿qué le dirías al mundo si nadie te juzgara?».',
    sociedadzag: 'La red de estudiantes y egresados de Publicidad Digital y Mercadeo con perfil activo en el portal ZAG.',
    zagroom: 'El territorio físico de la Sociedad ZAG — espacio de estudio, creación y mentorías (acceso desde Creator en adelante).',
    zaggista: 'Quien ya forma parte activa de la comunidad — dejó de ser asistente y ahora construye cultura ZAG.',
    fogata: 'Encuentro informal (chocolate, malvaviscos, conversación real) abierto a todos los niveles.',
    booth: 'La cabina del evento de lanzamiento que convirtió a la tribu en campaña por un día — un reto absurdo, 3 fotos y la primera pieza publicitaria de muchos.',
  },
};


/* Iconos del menú (SVG inline, heredan el color del enlace). */
window.ZAG_CONTENT.navIcons = {
  'blog-errores': { vb: '0 0 24 30', inner: '<path d="M20.6,10.32h-5.34c-.6,0-1.04-.17-1.33-.49-.35-.4-.3-.87-.29-.92V3.52c0-.2.12-.38.3-.46.19-.08.4-.04.54.1l6.47,6.3c.15.14.19.36.11.55-.08.19-.26.31-.46.31ZM14.63,4.71v4.27c0,.06,0,.14.06.2.09.09.3.15.57.15h4.11l-4.74-4.61Z"/><path d="M16.06,26.98H5.72c-1.56,0-2.83-1.27-2.83-2.83V5.85c0-1.56,1.27-2.83,2.83-2.83h6.38c.13,0,.26.05.35.15s.15.22.15.35c0,0-.02,5.67,0,7.55,0,.06,0,.17.02.2,0,0,.12.12.7.12h7.28c.28,0,.5.22.5.5v7.28c0,.28-.22.5-.5.5s-.5-.22-.5-.5v-6.78h-6.78c-1.51,0-1.71-.7-1.72-1.31-.02-1.55,0-5.64,0-7.07h-5.88c-1.01,0-1.83.82-1.83,1.83v18.31c0,1.01.82,1.83,1.83,1.83h10.34c.28,0,.5.22.5.5s-.22.5-.5.5Z"/><g><path d="M16.25,25.14c-.12,0-.23-.04-.32-.13-.18-.18-.18-.47,0-.64l3.77-3.77c.18-.18.47-.18.64,0s.18.47,0,.64l-3.77,3.77c-.09.09-.2.13-.32.13Z"/><path d="M20.02,25.14c-.12,0-.23-.04-.32-.13l-3.77-3.77c-.18-.18-.18-.47,0-.64s.47-.18.64,0l3.77,3.77c.18.18.18.47,0,.64-.09.09-.2.13-.32.13Z"/></g>' },
  'brujula-mentorias': { vb: '0 0 100 125', inner: '<path d="M50,18.5c-11.26,0-22.54,4.29-31.13,12.88-17.17,17.17-17.17,45.08,0,62.25,17.17,17.17,45.08,17.17,62.25,0,17.17-17.17,17.17-45.08,0-62.25-8.58-8.58-19.86-12.88-31.13-12.88ZM50,22.5c10.23,0,20.46,3.9,28.28,11.72,15.64,15.64,15.64,40.92,0,56.56-15.64,15.64-40.92,15.64-56.56,0-15.64-15.64-15.64-40.92,0-56.56,7.82-7.82,18.05-11.72,28.28-11.72h0ZM73.16,38.72c-.21.01-.48.1-.78.25l-28.28,14.12c-1.21.6-2.9,2.29-3.5,3.5l-14.13,28.28c-.04.07-.06.15-.09.22-.45,1.07.11,1.49,1.25.91l28.31-14.12c1.2-.61,2.83-2.27,3.44-3.47l14.13-28.28c.3-.6.33-1.03.12-1.25-.1-.11-.26-.17-.47-.16h0ZM50,57.5c2.74,0,5,2.26,5,5s-2.26,5-5,5-5-2.26-5-5,2.26-5,5-5Z"/>' },
  'cohete-proyectos': { vb: '0 0 110 135', inner: '<path d="M88.34,16.52c-18.66-.17-37.86,7.08-51.03,22.47-.05.05-.15.16-.2.22-.11.1-.15.05-.32.01l-.65-.16c-1.65-.39-4.04-1-5.74-1.39-3.98-.88-8.23.74-10.57,4.13-.73,1.05-10.14,15.85-13.46,20.99-.61.99.07,2.41,1.3,2.42.7.02,14.76.43,16.77.49.21.04.3-.16.15.42-.99,4.32-1.62,8.54-2,12.42-.13.55.05,1.2.4,1.61.82.6,14.09,14.25,18.41,18.41.99.96.84,1.07,1.89,1.27,4.31-.33,8.83-1.09,13.16-2.07.33-.08.21,0,.24.12l.49,16.85c.03,1.25,1.56,2.02,2.6,1.18,5.42-3.48,19.59-12.54,20.8-13.35,3.39-2.35,5.02-6.59,4.13-10.57-.46-1.95-1.1-4.48-1.55-6.37-.03-.16-.09-.21.01-.32.19-.19.64-.54.95-.82,4.56-4,8.74-9.09,11.87-14.1,11.1-17.98,11.74-38.61,7.91-51.74-.37-.34-.65-.5-1.07-.57-4.53-1-8.36-1.44-14.41-1.54h-.09ZM88.52,19.58c3.86.05,9.83.41,12.98,1.46,2.52,14.09,2.62,29.08-7.8,47.16-7.87,13.63-21.86,22.92-36.53,26.13-.61.09-.74-.63-1.07-1.07-.2-.33-.41-.66-.62-.99-6.76-10.61-16.52-20.11-27.18-26.47-.16-.1-.25-.23-.26-.4.52-2.38,1.3-4.83,2.13-7.23,7.94-24.91,34.52-39.24,58.21-38.6h.13ZM74.21,30.05c-17.91.04-24.71,23.85-9.46,33.37,9.28,6.12,23.02,1.38,26.53-9.18,4.37-11.48-4.72-24.42-16.97-24.19h-.1ZM74.37,33.16c14.65.06,20.45,19.36,8.11,27.44-7.65,5.32-19.19,1.47-22.19-7.34-3.72-9.43,3.93-20.35,14.02-20.1h.06ZM28.31,40.56c1.7.02,5.33,1.19,6.66,1.43-4.29,6.08-7.49,13.3-9.42,20.43-.09.33-.07.14-.33.18-4.02-.13-10.6-.3-14.72-.43-.2.26,7.62-11.9,10.6-16.56,1.82-3.18,3.65-4.97,7.15-5.05h.06ZM27.31,68.83c8,4.89,15.19,11.37,21.03,18.7,1.87,2.44,3.76,4.85,5.23,7.53-.29.19-.93.21-1.32.31-2.68.51-5.51.91-8.17,1.18-.33.04-.15,0-.27-.06-.45-.45-.81-.81-1.46-1.46-4.72-4.7-12.31-12.27-16.55-16.5.3-3.11.79-6.39,1.47-9.74l.05.03ZM20.39,85.97c-8.45,1.86-14.42,9.12-15.76,17.61-1.3,6.74-.32,12.85-.27,13.14.11.65.71,1.25,1.41,1.34,12.16,1.77,27.07-1.74,30.57-15.53.6-1.59-1.43-2.93-2.59-1.64-1.31,3.15-2.46,6.64-5.17,8.98-6.27,5.77-17.23,5.61-21.18,5.17-.61-7.18.18-16.11,5.62-21.64,2.24-2.22,5.16-3.51,8.13-4.44,1.52-.67.97-3.02-.7-2.98h-.05ZM80.4,87.43c1.11,4.6,3.09,9.23-1.67,12.61-4.66,3-11.96,7.67-16.23,10.41-1.27.81-2.12,1.36-2.26,1.45-.04.16-.03-.67-.08-2.12-.04-3.46-.37-9.26-.31-12.89,7.3-2.03,14.31-5.01,20.55-9.47h0Z"/>' },
  'fogata': { vb: '0 0 64 80', inner: '<path d="M32,45.33c6.93,0,14.52-4.09,15.81-13.27.12-.91.19-1.82.19-2.73,0-8.88-6.11-16.71-15.57-19.93-.43-.15-.91-.06-1.27.23-.36.29-.54.74-.48,1.2.41,4.1-.04,8.24-1.33,12.15-.43-3.64-1.83-8.28-6.01-10.67-.41-.24-.92-.24-1.33,0-.41.24-.66.68-.65,1.16,0,3.09-1.27,5.47-2.67,8-1.57,2.39-2.49,5.15-2.67,8,0,.92.06,1.84.19,2.75,1.28,9.03,8.87,13.12,15.8,13.12ZM21,22.67c1.24-2.07,2.14-4.32,2.67-6.67,3.85,4.15,2.99,11.77,2.97,11.87-.08.73.45,1.39,1.18,1.47.45.05.89-.13,1.18-.48,4.17-5.21,4.55-12.55,4.43-16.16,7.32,3.16,11.91,9.52,11.91,16.64,0,.79-.06,1.59-.16,2.37-1.07,7.57-7.39,10.96-13.17,10.96s-12.11-3.39-13.17-10.95c-.1-.79-.16-1.59-.16-2.39.2-2.38,1.01-4.68,2.33-6.67ZM50.48,61.64l-5.33-2.03,5.33-2.03h0c2.38-.93,3.57-3.61,2.67-6-.7-1.81-2.43-3-4.36-3.01-.56,0-1.12.1-1.65.29l-15.13,5.8-15.19-5.8c-.53-.19-1.09-.29-1.65-.29-1.93,0-3.65,1.2-4.35,3-.92,2.4.27,5.09,2.67,6.01l5.33,2.03-5.33,2.03c-2.41.92-3.62,3.62-2.7,6.02.69,1.81,2.43,3.01,4.38,3,.57,0,1.13-.1,1.65-.31l15.19-5.75,15.19,5.75c2.4.92,5.1-.27,6.03-2.67h0c.93-2.41-.27-5.11-2.68-6.03-.02,0-.04-.01-.06-.02ZM13.33,54.05c-.21-.49-.21-1.03,0-1.52.27-.79,1.02-1.33,1.85-1.33.25,0,.49.04.72.12l12.33,4.68-5.57,2.19-8.13-3.09c-.53-.16-.96-.54-1.2-1.04ZM15.87,67.88c-1.03.31-2.13-.21-2.53-1.21-.4-1.03.11-2.19,1.15-2.59,0,0,0,0,0,0l16.72-6.35,1.33-.48h0l15.64-5.93c.23-.08.47-.12.72-.12,1.1,0,1.98.9,1.97,2,0,.3-.07.59-.2.85-.22.48-.62.86-1.12,1.04l-8.61,3.27h0l-.96.36-24.11,9.16ZM50.67,66.67c-.42,1-1.55,1.5-2.57,1.15l-12.36-4.68,5.08-1.8.59-.23,8.13,3.09c.97.4,1.46,1.47,1.13,2.47Z"/>' },
  'libro-cursos': { vb: '0 0 110 135', inner: '<path d="M95.62,45.12h-6.25v-6.25c0-.78-.58-1.44-1.36-1.55-19.66-2.61-29.77,4.31-33.02,7.19-3.25-2.86-13.36-9.8-33.02-7.19-.78.11-1.36.77-1.36,1.55v6.25h-6.25c-.86,0-1.56.7-1.56,1.56v50c0,.86.7,1.56,1.56,1.56h81.25c.86,0,1.56-.7,1.56-1.56v-50c0-.86-.7-1.56-1.56-1.56h0ZM56.56,47.33c1.89-1.8,10.92-9.17,29.69-7.06v46.86c-16.06-1.72-25.44,3.05-29.69,6.14v-45.94ZM23.75,40.25c18.84-2.11,27.84,5.31,29.69,7.08v45.94c-4.23-3.11-13.58-7.89-29.69-6.16v-46.86ZM15.94,48.25h4.69v40.62c0,.45.19.88.53,1.17s.78.44,1.23.38c14.83-1.98,23.8,1.89,28.17,4.7H15.94v-46.88ZM94.06,95.12h-34.61c4.38-2.81,13.34-6.67,28.16-4.7.45.06.89-.08,1.23-.38s.53-.72.53-1.17v-40.62h4.69v46.88Z"/>' },
  'microfono-podcast': { vb: '0 0 110 97', inner: '<path fill-rule="evenodd" d="M55.02,11.01c-7.21,0-13.08,5.93-13.08,13.17v23.65c0,7.25,5.87,13.17,13.08,13.17s13.06-5.93,13.06-13.17v-23.65c0-7.25-5.85-13.17-13.06-13.17ZM55.02,14.13c5.5,0,9.94,4.49,9.94,10.06v23.65c0,5.57-4.44,10.03-9.94,10.03s-9.96-4.46-9.96-10.03v-23.65c0-5.57,4.46-10.06,9.96-10.06Z"/><path fill-rule="evenodd" d="M37.22,47.86c-.86,0-1.55.71-1.55,1.57,0,10.73,8.68,19.49,19.36,19.49s19.33-8.76,19.33-19.49c0-.86-.69-1.56-1.55-1.57-.41,0-.82.16-1.11.46-.3.29-.46.7-.46,1.11,0,9.06-7.25,16.35-16.22,16.35s-16.24-7.3-16.24-16.35c0-.42-.16-.82-.46-1.11s-.7-.46-1.11-.46h.01Z"/><path fill-rule="evenodd" d="M53.46,67.35v18.09h3.11v-18.09s-3.11,0-3.11,0Z"/><path fill-rule="evenodd" d="M47.36,83.87c-.41,0-.82.16-1.11.46-.29.29-.46.7-.46,1.11,0,.86.71,1.55,1.57,1.55h15.3c.86,0,1.56-.69,1.57-1.55,0-.41-.16-.82-.46-1.11-.29-.3-.7-.46-1.11-.46h-15.3Z"/>' },
  'perfiles': { vb: '0 0 110 135', inner: '<path d="M60.76,25.44l12.36,19.08c.24.37.52.67.85.91.32.23.7.41,1.13.52l21.95,5.85c1.16.3,2.17.87,2.98,1.64.81.77,1.43,1.75,1.79,2.88.37,1.13.45,2.28.24,3.38-.21,1.11-.69,2.15-1.44,3.08l-14.32,17.65c-.28.34-.48.7-.6,1.08l-.02.06c-.11.36-.15.75-.13,1.18l1.22,22.69c.06,1.19-.16,2.32-.64,3.33l-.06.11c-.48.96-1.2,1.81-2.13,2.49-.96.7-2.03,1.13-3.15,1.27-1.11.14-2.26,0-3.37-.42l-3.12-1.2c-.1-.03-.2-.07-.29-.11l-17.79-6.86c-.4-.16-.81-.23-1.22-.23s-.81.08-1.21.23l-17.79,6.86c-.09.05-.19.09-.29.11l-3.12,1.2c-1.11.43-2.26.57-3.37.42-1.12-.14-2.19-.57-3.15-1.27-.96-.7-1.71-1.59-2.19-2.6-.48-1.01-.7-2.14-.64-3.33l1.22-22.69c.02-.45-.03-.86-.15-1.23-.12-.38-.32-.74-.6-1.08l-14.32-17.65c-.75-.93-1.23-1.97-1.44-3.08-.2-1.1-.13-2.24.24-3.38.37-1.14.98-2.11,1.79-2.88.82-.77,1.82-1.34,2.97-1.64l21.96-5.85c.43-.12.81-.29,1.13-.52.32-.23.61-.54.85-.91l12.36-19.08c.65-1,1.49-1.78,2.48-2.32.99-.54,2.11-.83,3.29-.83s2.3.29,3.29.83c.98.54,1.83,1.32,2.48,2.32h-.02ZM33.47,108.13v-8.35c0-4.41,1.35-8.53,3.66-11.96,2.37-3.53,5.77-6.33,9.75-7.96.62-.25,1.29-.12,1.77.27.89.73,1.89,1.31,2.97,1.7,1.04.37,2.18.58,3.37.58s2.34-.2,3.37-.58c1.08-.39,2.09-.97,2.97-1.7.55-.45,1.29-.52,1.88-.22,3.93,1.64,7.29,4.42,9.64,7.92,2.31,3.43,3.66,7.55,3.66,11.96v8.35l2.15.83c.56.21,1.12.29,1.66.21.54-.07,1.06-.29,1.55-.64.46-.33.81-.74,1.04-1.2l.03-.08c.23-.49.34-1.05.31-1.65l-1.22-22.69c-.05-.84.05-1.64.29-2.39l.03-.1c.25-.79.66-1.52,1.22-2.2l14.32-17.65c.38-.46.62-.98.72-1.51.1-.54.06-1.1-.13-1.68-.18-.57-.48-1.05-.88-1.43-.39-.37-.89-.64-1.46-.8l-21.96-5.85c-.85-.23-1.61-.58-2.28-1.07-.66-.48-1.24-1.1-1.72-1.84l-12.35-19.08c-.33-.5-.74-.9-1.22-1.16-.46-.25-1.02-.39-1.62-.39s-1.16.14-1.62.39c-.47.26-.89.65-1.22,1.16l-12.35,19.08c-.48.74-1.05,1.36-1.72,1.84-.66.48-1.43.84-2.28,1.07l-21.96,5.85c-.58.16-1.08.43-1.47.8-.39.37-.7.86-.88,1.43-.19.57-.23,1.14-.12,1.68.1.53.34,1.04.72,1.51l14.32,17.65c.55.68.96,1.42,1.22,2.2.25.79.36,1.62.32,2.49l-1.22,22.69c-.03.6.08,1.16.31,1.65.23.49.6.93,1.08,1.27.49.36,1.02.57,1.55.64.54.07,1.1,0,1.66-.21l2.15-.83h.02ZM73.02,106.78v-7c0-3.7-1.13-7.16-3.06-10.02-1.81-2.69-4.32-4.87-7.27-6.28-.96.66-2.02,1.22-3.14,1.62-1.43.52-2.97.8-4.55.8s-3.12-.28-4.55-.8c-1.13-.41-2.18-.96-3.14-1.62-2.95,1.4-5.46,3.59-7.28,6.28-1.93,2.86-3.06,6.32-3.06,10.02v7l15.55-5.99c.83-.32,1.66-.48,2.47-.48s1.64.16,2.47.48l15.55,5.99h.01ZM54.99,50.66c3.71,0,7.08,1.51,9.51,3.94s3.94,5.8,3.94,9.51-1.51,7.08-3.94,9.51-5.8,3.94-9.51,3.94-7.08-1.51-9.51-3.94-3.94-5.8-3.94-9.51,1.51-7.08,3.94-9.51,5.8-3.94,9.51-3.94ZM62.03,57.08c-1.8-1.8-4.29-2.91-7.04-2.91s-5.24,1.12-7.04,2.91-2.91,4.29-2.91,7.04,1.12,5.24,2.91,7.04,4.29,2.91,7.04,2.91,5.24-1.12,7.04-2.91,2.91-4.29,2.91-7.04-1.12-5.24-2.91-7.04Z"/>' },
  'personas-seminario': { vb: '0 0 100 76', inner: '<path d="M34.87,60.97c-1.04,2.2-1.57,4.56-1.57,7.01,0,.58.47,1.05,1.05,1.05s1.05-.47,1.05-1.05c0-2.13.46-4.19,1.37-6.12,1.06-2.3,2.74-4.3,4.86-5.79,1.08-.78,2.27-1.37,3.52-1.81,1.45.78,3.09,1.26,4.85,1.26s3.39-.48,4.85-1.26c1.25.44,2.44,1.04,3.53,1.82,2.11,1.5,3.79,3.5,4.85,5.8.91,1.92,1.37,3.98,1.37,6.11,0,.58.47,1.05,1.05,1.05s1.05-.47,1.05-1.05c0-2.45-.53-4.81-1.57-7-1.21-2.62-3.13-4.92-5.54-6.62-.85-.61-1.76-1.1-2.7-1.53,2.11-1.9,3.47-4.62,3.47-7.68,0-5.71-4.65-10.36-10.36-10.36s-10.36,4.65-10.36,10.36c0,3.06,1.35,5.78,3.47,7.68-.94.43-1.85.92-2.7,1.52-2.42,1.7-4.33,3.99-5.54,6.61ZM41.74,45.16c0-4.55,3.7-8.26,8.26-8.26s8.26,3.71,8.26,8.26-3.7,8.26-8.26,8.26c-4.55-.01-8.26-3.71-8.26-8.26Z"/><path d="M11.05,61.6c.58,0,1.05-.47,1.05-1.05,0-2.14.46-4.2,1.38-6.12,1.06-2.29,2.73-4.3,4.85-5.79,1.09-.78,2.28-1.37,3.52-1.81,1.45.78,3.09,1.26,4.85,1.26s3.39-.48,4.85-1.26c.92.32,1.82.73,2.69,1.26.29.17.55.36.84.57,1.58,1.11,2.9,2.48,3.92,4.1.2.32.54.49.89.49.19,0,.39-.05.56-.16.49-.31.64-.96.33-1.45-1.17-1.85-2.68-3.43-4.5-4.7-.31-.22-.62-.44-.95-.64-.55-.34-1.12-.64-1.7-.91,2.1-1.9,3.44-4.61,3.44-7.66,0-5.71-4.65-10.36-10.36-10.36s-10.37,4.63-10.37,10.35c0,3.06,1.35,5.78,3.47,7.68-.94.43-1.85.92-2.7,1.52-2.41,1.71-4.33,4-5.54,6.62-1.04,2.2-1.57,4.56-1.57,7.01,0,.58.47,1.05,1.05,1.05ZM18.45,37.72c0-4.55,3.7-8.26,8.26-8.26s8.26,3.7,8.26,8.26-3.7,8.26-8.26,8.26-8.26-3.71-8.26-8.26Z"/><path d="M64.66,46.27c-.32.2-.63.41-.97.66-1.77,1.25-3.31,2.86-4.47,4.67-.31.49-.17,1.14.32,1.45.17.11.37.17.57.17.35,0,.68-.17.89-.48,1.01-1.58,2.36-2.99,3.96-4.12.26-.18.51-.37.8-.54.86-.53,1.77-.94,2.69-1.26,1.45.78,3.09,1.26,4.85,1.26s3.4-.48,4.85-1.26c1.25.44,2.44,1.04,3.53,1.82,2.11,1.5,3.79,3.5,4.85,5.8.91,1.92,1.37,3.98,1.37,6.12,0,.58.47,1.05,1.05,1.05s1.05-.47,1.05-1.05c0-2.45-.53-4.81-1.57-7.01-1.21-2.62-3.13-4.92-5.54-6.62-.85-.61-1.76-1.1-2.7-1.53,2.11-1.9,3.47-4.62,3.47-7.68,0-5.71-4.65-10.36-10.36-10.36s-10.36,4.65-10.36,10.36c0,3.04,1.34,5.75,3.43,7.65-.59.26-1.15.57-1.71.9ZM65.03,37.72c0-4.55,3.7-8.26,8.26-8.26s8.26,3.7,8.26,8.26-3.7,8.26-8.26,8.26-8.26-3.71-8.26-8.26Z"/><path d="M38.71,30.44c.29,0,.57-.12.78-.34.61-.67,1.32-1.29,2.13-1.85,1.08-.78,2.28-1.37,3.53-1.82,1.45.78,3.09,1.26,4.85,1.26s3.39-.48,4.84-1.26c1.25.44,2.44,1.04,3.53,1.82.78.55,1.51,1.17,2.15,1.86.21.22.49.33.77.33.26,0,.52-.09.72-.29.42-.4.44-1.06.05-1.49-.75-.79-1.58-1.51-2.47-2.13-.85-.61-1.76-1.1-2.7-1.53,2.11-1.9,3.47-4.62,3.47-7.68,0-5.71-4.65-10.36-10.36-10.36s-10.36,4.65-10.36,10.36c0,3.06,1.35,5.78,3.46,7.68-.94.43-1.86.92-2.7,1.52-.92.65-1.75,1.37-2.47,2.15-.39.43-.36,1.09.07,1.49.21.19.46.28.71.28ZM41.74,17.32c0-4.55,3.7-8.26,8.26-8.26s8.26,3.7,8.26,8.26-3.7,8.26-8.26,8.26-8.26-3.7-8.26-8.26Z"/>' },
  'rayo-muro': { vb: '0 0 110 108', inner: '<path fill-rule="evenodd" d="M43.81,59.13h-15.91c-.54,0-1.04-.27-1.34-.7-.3-.45-.37-1-.18-1.5L42.71,13.78c.24-.64.84-1.05,1.52-1.05h28.31c.52,0,1,.24,1.31.66.3.41.4.96.25,1.45l-10.52,34.65h18.53c.62,0,1.18.35,1.46.89.27.54.22,1.21-.15,1.71l-36.66,49.54c-.42.56-1.15.8-1.82.57-.67-.22-1.12-.85-1.12-1.55v-41.52h0ZM47.06,57.5v38.21l31.81-42.97h-17.5c-.51,0-1-.24-1.3-.66-.31-.41-.4-.96-.25-1.45l10.52-34.65h-24.99l-15.09,39.89h15.18c.9,0,1.62.73,1.62,1.63h0Z"/>' }
};
