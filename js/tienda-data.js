/* ============================================================
   PORTAL ZAG — Tienda ZAG (js/tienda-data.js)
   Catálogo, configuración y textos de la interfaz.

   Todo lo que la tienda necesita saber vive aquí: los dos archivos
   de página (js/tienda.js y js/checkout.js) no deben inventar precios
   ni textos sueltos, siempre leen de window.ZAG_TIENDA.

   La foto real es un .png dentro de assets/img/merch/. Como hoy no
   existe ninguno, cada producto trae además un `placeholder` en SVG
   que el navegador muestra cuando el .png da error. Cuando lleguen
   las fotos, basta con ponerlas en la carpeta: no hay que tocar código.
   ============================================================ */

window.ZAG_TIENDA = (function () {
  'use strict';

  /* ------------------------------------------------------------
     Niveles
     El color de cada nivel se aplica con data-nivel="<id>" para que
     lo resuelva el CSS (ver css/tienda.css). Los textos salen de aquí
     para no repetirlos en el HTML.
     ------------------------------------------------------------ */
  var NIVELES = ['rookie', 'strategist', 'creator', 'master', 'senior'];

  var NIVEL_META = {
    rookie: { nombre: 'ROOKIE', identidad: 'Explorador' },
    strategist: { nombre: 'STRATEGIST', identidad: 'Pensador' },
    creator: { nombre: 'CREATOR', identidad: 'Creador' },
    master: { nombre: 'MASTER', identidad: 'Referente' },
    senior: { nombre: 'SENIOR', identidad: 'Constructor de Cultura' }
  };

  /* ------------------------------------------------------------
     Configuración
     ------------------------------------------------------------ */
  var config = {
    descuentoSenior: 0.15,
    maxPorProducto: 2,
    diasHabilesRecogida: 2,
    lugarRecogida: 'Facultad · Programa de Publicidad Digital y Mercadeo, EAM',
    horarioRecogida: 'Lunes a viernes · 8:00 am – 6:00 pm',
    pago: 'Pagas en la U al recoger (efectivo o Nequi)',
    zonaHoraria: 'America/Bogota',
    diasParaCancelar: 5
  };

  var TALLAS_ROPA = ['S', 'M', 'L', 'XL'];

  /* Guía de tallas en cm. Unisex. */
  var GUIA_TALLAS = {
    titulo: 'Guía de tallas',
    nota: 'Medidas de la prenda, no de la persona. Si estás entre dos tallas, sube.',
    columnas: ['Talla', 'Pecho', 'Largo'],
    filas: [
      { talla: 'S', pecho: '96 cm', largo: '66 cm' },
      { talla: 'M', pecho: '104 cm', largo: '68 cm' },
      { talla: 'L', pecho: '112 cm', largo: '70 cm' },
      { talla: 'XL', pecho: '120 cm', largo: '72 cm' }
    ]
  };

  /* ------------------------------------------------------------
     Catálogo — 18 productos, 3 por nivel salvo Master (5) y Senior (4).
     stock: la mayoría 20 o más; tres con 5 o menos llevan el badge
     "Últimas unidades"; el Termo está agotado a propósito para ver
     el estado AGOTADO; Pines y Chaqueta son "Nuevo".
     ------------------------------------------------------------ */
  var productos = [
    /* ---- ROOKIE ---- */
    {
      id: 'stickers',
      nombre: 'Pack Stickers ZAG',
      precio: 8000,
      nivel: 0,
      categoria: 'accesorios',
      descripcion: 'Los de siempre, pero pegados en la laptop y en la libreta de apuntes que nadie vuelve a abrir.',
      img: 'assets/img/merch/stickers.png',
      placeholder: 'assets/img/merch/ph-stickers.svg',
      stock: 24,
      alt: 'Pack de stickers del ZAG'
    },
    {
      id: 'manilla-rookie',
      nombre: 'Manilla ZAG Rookie',
      precio: 18000,
      nivel: 0,
      categoria: 'accesorios',
      descripcion: 'Tu primera vuelta al aro. Y sí: eso ya cuenta como experiencia.',
      img: 'assets/img/merch/manilla-rookie.png',
      placeholder: 'assets/img/merch/ph-manilla-rookie.svg',
      stock: 5,
      alt: 'Manilla ZAG color crema del nivel Rookie'
    },
    {
      id: 'pines',
      nombre: 'Pines ZAG',
      precio: 12000,
      nivel: 0,
      categoria: 'accesorios',
      descripcion: 'Chicos, pontiagudos y de los que se roban. Piensa mal de alguien y quédatelo conHN Peace.',
      img: 'assets/img/merch/pines.png',
      placeholder: 'assets/img/merch/ph-pines.svg',
      stock: 30,
      badge: 'nuevo',
      alt: 'Pines metalicos del ZAG'
    },

    /* ---- STRATEGIST ---- */
    {
      id: 'manilla-strategist',
      nombre: 'Manilla ZAG Strategist',
      precio: 18000,
      nivel: 1,
      categoria: 'accesorios',
      descripcion: 'Para cuando ya no miras la tendencia: la haces.',
      img: 'assets/img/merch/manilla-strategist.png',
      placeholder: 'assets/img/merch/ph-manilla-strategist.svg',
      stock: 20,
      alt: 'Manilla ZAG celeste del nivel Strategist'
    },
    {
      id: 'llavero',
      nombre: 'Llavero ZAG',
      precio: 18000,
      nivel: 1,
      categoria: 'accesorios',
      descripcion: 'El llavero que no suelta, no se rinde.',
      img: 'assets/img/merch/llavero.png',
      placeholder: 'assets/img/merch/ph-llavero.svg',
      stock: 20,
      alt: 'Llavero del ZAG'
    },
    {
      id: 'cordon',
      nombre: 'Cordón ZAG',
      precio: 22000,
      nivel: 1,
      categoria: 'accesorios',
      descripcion: 'Para el carné de siempre, pero con otro nombre y otras intenciones.',
      img: 'assets/img/merch/cordon.png',
      placeholder: 'assets/img/merch/ph-cordon.svg',
      stock: 22,
      alt: 'Cordón del ZAG para el carné'
    },

    /* ---- CREATOR ---- */
    {
      id: 'manilla-creator',
      nombre: 'Manilla ZAG Creator',
      precio: 18000,
      nivel: 2,
      categoria: 'accesorios',
      descripcion: 'CREATOR: ya no sigues las tendencias, las revisas.',
      img: 'assets/img/merch/manilla-creator.png',
      placeholder: 'assets/img/merch/ph-manilla-creator.svg',
      stock: 20,
      alt: 'Manilla ZAG naranja del nivel Creator'
    },
    {
      id: 'boton',
      nombre: 'Botón ZAG',
      precio: 10000,
      nivel: 2,
      categoria: 'accesorios',
      descripcion: 'Redondo, clásico y atemporal, como las ideas que sí funcionan.',
      img: 'assets/img/merch/boton.png',
      placeholder: 'assets/img/merch/ph-boton.svg',
      stock: 3,
      alt: 'Botón del ZAG'
    },
    {
      id: 'tote-bag',
      nombre: 'Tote Bag ZAG',
      precio: 38000,
      nivel: 2,
      categoria: 'dia-a-dia',
      descripcion: 'Para la maleta, el mercado o la clase a la que llegas tarde.',
      img: 'assets/img/merch/tote-bag.png',
      placeholder: 'assets/img/merch/ph-tote-bag.svg',
      stock: 15,
      alt: 'Tote bag del ZAG'
    },

    /* ---- MASTER ---- */
    {
      id: 'gorra',
      nombre: 'Gorra ZAG',
      precio: 55000,
      nivel: 3,
      categoria: 'ropa',
      descripcion: 'No apto para mentes promedio. Para la maleta, la chaqueta o donde quieras incomodar.',
      img: 'assets/img/merch/gorra.png',
      placeholder: 'assets/img/merch/ph-gorra.svg',
      stock: 12,
      alt: 'Gorra del ZAG'
    },
    {
      id: 'buzo-azul-claro',
      nombre: 'Buzo ZAG Azul Claro',
      precio: 98000,
      nivel: 3,
      categoria: 'ropa',
      descripcion: 'El uniforme de quien ya no necesita presentación.',
      img: 'assets/img/merch/buzo-azul-claro.png',
      placeholder: 'assets/img/merch/ph-buzo-azul-claro.svg',
      tallas: TALLAS_ROPA.slice(),
      stock: 10,
      alt: 'Buzo del ZAG color azul claro'
    },
    {
      id: 'buzo-azul-oscuro',
      nombre: 'Buzo ZAG Azul Oscuro',
      precio: 98000,
      nivel: 3,
      categoria: 'ropa',
      descripcion: 'La versión nocturna de las mismas ideas, con más brillo.',
      img: 'assets/img/merch/buzo-azul.png',
      placeholder: 'assets/img/merch/ph-buzo-azul-oscuro.svg',
      tallas: TALLAS_ROPA.slice(),
      stock: 10,
      alt: 'Buzo del ZAG color azul oscuro'
    },
    {
      id: 'termo',
      nombre: 'Termo ZAG',
      precio: 45000,
      nivel: 3,
      categoria: 'dia-a-dia',
      descripcion: 'Tostado a las 2 de la mañana, mientras esto sigue caliente.',
      img: 'assets/img/merch/termos.png',
      placeholder: 'assets/img/merch/ph-termo.svg',
      stock: 0,
      alt: 'Termo del ZAG'
    },
    {
      id: 'manilla-master',
      nombre: 'Manilla ZAG Master',
      precio: 18000,
      nivel: 3,
      categoria: 'accesorios',
      descripcion: 'Nivel máximo. Igual que el insomnio.',
      img: 'assets/img/merch/manilla-master.png',
      placeholder: 'assets/img/merch/ph-manilla-master.svg',
      stock: 18,
      alt: 'Manilla ZAG azul profunda del nivel Master'
    },

    /* ---- SENIOR ---- */
    {
      id: 'chaqueta',
      nombre: 'Chaqueta ZAG',
      precio: 140000,
      nivel: 4,
      categoria: 'ropa',
      descripcion: 'Estrena tu nivel. Y llega temprano a cada reunión.',
      img: 'assets/img/merch/chaqueta.png',
      placeholder: 'assets/img/merch/ph-chaqueta.svg',
      tallas: TALLAS_ROPA.slice(),
      stock: 8,
      badge: 'nuevo',
      alt: 'Chaqueta negra del ZAG'
    },
    {
      id: 'panoleta',
      nombre: 'Pañoleta ZAG',
      precio: 32000,
      nivel: 4,
      categoria: 'accesorios',
      descripcion: 'Frío, viento, ideas. Sin filtro.',
      img: 'assets/img/merch/panoleta.png',
      placeholder: 'assets/img/merch/ph-panoleta.svg',
      stock: 4,
      alt: 'Pañoleta del ZAG'
    },
    {
      id: 'taza',
      nombre: 'Taza ZAG',
      precio: 35000,
      nivel: 4,
      categoria: 'dia-a-dia',
      descripcion: 'El café que sostiene el silencio antes del primer trago.',
      img: 'assets/img/merch/taza.png',
      placeholder: 'assets/img/merch/ph-taza.svg',
      stock: 25,
      alt: 'Taza del ZAG'
    },
    {
      id: 'manilla-senior',
      nombre: 'Manilla ZAG Senior',
      precio: 18000,
      nivel: 4,
      categoria: 'accesorios',
      descripcion: 'Ya no representas al programa: lo diriges.',
      img: 'assets/img/merch/manilla-senior.png',
      placeholder: 'assets/img/merch/ph-manilla-senior.svg',
      stock: 20,
      alt: 'Manilla ZAG negra del nivel Senior'
    }
  ];

  /* ------------------------------------------------------------
     Categorías de la barra
     ------------------------------------------------------------ */
  var categorias = [
    { id: 'todo', nombre: 'Todo' },
    { id: 'accesorios', nombre: 'Accesorios' },
    { id: 'ropa', nombre: 'Ropa' },
    { id: 'dia-a-dia', nombre: 'Día a día' }
  ];

  /* ------------------------------------------------------------
     Textos de la interfaz
     ------------------------------------------------------------ */
  var ui = {
    anuncio: 'Tu nivel desbloquea tu estilo · Recoges en la Facultad en 2 días hábiles · Pagas en la U',
    anuncioSenior: '✦ Eres SENIOR: 15% de descuento en toda la tienda ✦',

    hero: {
      pill: 'MERCH OFICIAL',
      titulo: 'TIENDA',
      tituloAccento: 'ZAG',
      sub: 'Tu nivel desbloquea tu estilo. Lo que aún no puedes tener, ya lo puedes mirar.',
      sinSesion: 'Activa tu perfil para comprar',
      sinSesionCta: 'Entrar en modo demo',
      sesionCta: 'Ver productos'
    },

    barra: {
      soloMio: 'Solo lo que puedo comprar',
      pedidos: 'Mis pedidos',
      carrito: 'Carrito',
      carritoVacioAria: 'Carrito vacío',
      unidadesEnCarrito: function (n) {
        return n === 1 ? '1 producto en el carrito' : n + ' productos en el carrito';
      }
    },

    banner: {
      cta: 'Comprar ahora',
      etiqueta: 'Producto estrella'
    },

    secciones: {
      desbloqueado: '✓ Desbloqueado',
      faltan: function (n) {
        return '🔒 Te faltan ' + n + (n === 1 ? ' nivel' : ' niveles');
      },
      verSubir: 'Ver cómo subir',
      vacio: 'Nada de esta categoría en este nivel.'
    },

    card: {
      desde: 'Desde',
      agregar: 'Agregar al carrito',
      nuevo: 'Nuevo',
      ultimas: 'Últimas unidades',
      agotado: 'AGOTADO',
      descuento: '−15% Senior',
      sinSesion: 'Inicia sesión para comprar',
      verFicha: 'Ver ficha'
    },

    ficha: {
      seDesbloquea: 'Se desbloquea en',
      guiaTallas: 'Guía de tallas',
      eligeTalla: 'Elige una talla',
      sinTalla: 'Sin talla',
      cantidad: 'Cantidad',
      agregar: 'Agregar al carrito',
      quita: 'Quitar',
      cierre: 'Cerrar ficha del producto',
      muy: function (n) {
        return 'Máx. ' + n + ' por pedido';
      },
      restan: function (n) {
        return n === 1 ? 'Queda 1' : 'Quedan ' + n;
      },
      necesitaSesion: 'Activa tu perfil para comprar',
      desbloqueaEn: '🔒 Se desbloquea en',
      agotado: 'Agotado',
      notaRecogida: 'Recoges en la Facultad en 2 días hábiles',
      notaPago: 'Pagas en la U al recoger',
      notaNiveles: 'Tallas S a XL, unisex'
    },

    carrito: {
      titulo: 'Tu carrito',
      subtotal: 'Subtotal',
      descuento: 'Descuento Senior (−15%)',
      total: 'Total',
      envio: 'Envío: no aplica · recoges en la Facultad',
      checkout: 'Ir al checkout',
      seguir: 'Seguir comprando',
      vacioTitulo: 'Tu carrito está vacío',
      vacioTexto: 'Tu nivel ya desbloqueó cosas buenas.',
      verProductos: 'Ver productos',
      cierre: 'Cerrar carrito',
      sinStock: 'Se agotó',
      sinNivel: 'Tu nivel ya no incluye este producto',
      problemas: 'Resuelve esto para continuar',
      unidades: function (n) {
        return n === 1 ? '1 producto' : n + ' productos';
      }
    },

    pedidos: {
      titulo: 'Mis pedidos',
      kicker: 'MIS PEDIDOS',
      sub: 'Cada pedido se recoge en la Facultad y se paga al llegar.',
      preparacion: 'En preparación',
      listo: 'Listo para recoger',
      entregado: 'Entregado',
      recoge: 'Recoge desde el',
      lugar: 'Lugar',
      horario: 'Horario',
      calendario: 'Agregar a Google Calendar',
      cancelar: 'Cancelar pedido',
      cancelarPregunta: '¿Cancelar este pedido?',
      cancelarSi: 'Sí, cancelar',
      cancelarNo: 'No, dejarlo',
      cancelado: 'Pedido cancelado',
      avanzar: '(demo) avanzar estado',
      vacio: 'Todavía no tienes pedidos.',
      codigo: 'Código'
    },

    acceso: {
      titulo: 'Activa tu perfil para comprar',
      texto: 'La tienda se abre para todos, pero el merch se desbloquea con tu nivel. Entra en modo demo y simula el nivel que quieras.',
      cta: 'Entrar en modo demo',
      cierre: 'Cerrar'
    },

    checkout: {
      titulo: 'Checkout',
      resumen: 'Resumen del pedido',
      verResumen: 'Ver resumen del pedido',
      ocultarResumen: 'Ocultar resumen',
      vacioTitulo: 'Tu carrito está vacío',
      vacioTexto: 'Agrega algo antes de pagar. Así funciona el mundo real.',
      sinSesionTitulo: 'Necesitas una sesión para comprar',
      sinSesionTexto: 'La tienda se puede mirar, pero el pedido va a nombre de alguien.',
      volver: 'Volver a la tienda',
      paso1: 'Tus datos',
      paso2: 'Recogida y pago',
      paso3: 'Confirmación',
      confirmando: 'Confirmando…'
    },

    toasts: {
      agregado: 'Agregado al carrito',
      verCarrito: 'Ver carrito',
      quitado: 'Quitado del carrito',
      pedidoListo: 'Pedido cancelado'
    }
  };

  /* ------------------------------------------------------------
     Helpers de datos (sin DOM)
     ------------------------------------------------------------ */

  function nivelDe(nivel) {
    var i = Number(nivel);
    return NIVELES[i] || NIVELES[0];
  }

  function nivelIndexDe(id) {
    return NIVELES.indexOf(String(id || '').toLowerCase());
  }

  function nivelNombre(nivel) {
    var m = NIVEL_META[nivelDe(nivel)];
    return m ? m.nombre : NIVEL_META.rookie.nombre;
  }

  function nivelIdentidad(nivel) {
    var m = NIVEL_META[nivelDe(nivel)];
    return m ? m.identidad : NIVEL_META.rookie.identidad;
  }

  function buscar(id) {
    for (var i = 0; i < productos.length; i++) {
      if (productos[i].id === id) return productos[i];
    }
    return null;
  }

  function porNivel(nivel) {
    return productos.filter(function (p) {
      return p.nivel === nivelDeNumero(nivel);
    });
  }

  function nivelDeNumero(n) {
    var i = Number(n);
    return i >= 0 && i < NIVELES.length ? i : 0;
  }

  /* Precio con descuento Senior. */
  function precioFinal(producto, esSenior) {
    var base = Number(producto && producto.precio) || 0;
    return esSenior ? Math.round(base * (1 - config.descuentoSenior)) : base;
  }

  /* $18.000 — siempre pesos Colombianes. */
  function formatearPrecio(valor) {
    var n = Math.round(Number(valor) || 0);
    return '$' + n.toLocaleString('es-CO');
  }

  /* Un producto está disponible si el nivel de la sesión llega. */
  function desbloqueado(producto, nivelSesion) {
    if (nivelSesion === null || nivelSesion === undefined) return true;
    return nivelSesion >= Number(producto.nivel);
  }

  function esAgotado(producto, stock) {
    var s = typeof stock === 'number' ? stock : producto.stock;
    return Number(s) <= 0;
  }

  function tieneTallas(producto) {
    return !!(producto && producto.tallas && producto.tallas.length);
  }

  /* Producto estrella del banner: el más caro que la persona puede comprar.
     Sin sesión no hay nivel, así que se muestra la entrada más barata del
     nivel ROOKIE: el primer paso de una tienda, no el techo. */
  function productoEstrella(nivelSesion) {
    var sinSesion = nivelSesion === null || nivelSesion === undefined;
    var candidatos = productos.filter(function (p) {
      if (esAgotado(p)) return false;
      if (sinSesion) return Number(p.nivel) === 0;
      return Number(p.nivel) <= nivelSesion;
    });
    if (!candidatos.length) return productos[0];
    candidatos.sort(function (a, b) {
      return sinSesion ? a.precio - b.precio : b.precio - a.precio;
    });
    return candidatos[0];
  }

  function etiquetaBadge(badge) {
    if (badge === 'nuevo') return ui.card.nuevo;
    if (badge === 'ultimas') return ui.card.ultimas;
    return '';
  }

  return {
    NIVELES: NIVELES,
    NIVEL_META: NIVEL_META,
    config: config,
    productos: productos,
    categorias: categorias,
    tallas: TALLAS_ROPA,
    guiaTallas: GUIA_TALLAS,
    ui: ui,
    nivelDe: nivelDe,
    nivelIndexDe: nivelIndexDe,
    nivelNombre: nivelNombre,
    nivelIdentidad: nivelIdentidad,
    buscar: buscar,
    porNivel: porNivel,
    precioFinal: precioFinal,
    formatearPrecio: formatearPrecio,
    desbloqueado: desbloqueado,
    esAgotado: esAgotado,
    tieneTallas: tieneTallas,
    productoEstrella: productoEstrella,
    etiquetaBadge: etiquetaBadge
  };
})();