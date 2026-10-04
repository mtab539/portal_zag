/* ============================================================
   PORTAL ZAG — Tienda ZAG (js/tienda-carrito.js)
   Estado compartido del carrito y de los pedidos.

   Lo usan las dos páginas (tienda.html y checkout.html) para que el
   carrito sobreviva a la navegación: todo vive en localStorage y aquí
   se leen y escriben con try/catch, porque un prototipo no puede
   romperse porque el navegador bloquee el almacenamiento.

   Claves:
     zag_carrito        [{ id, talla, cantidad }]
     zag_pedidos        [{ codigo, fecha, items, subtotal, descuento,
                           total, fechaRecogida, estado, datos }]
     zag_tienda_stock   { <id>: ajusteDeStock }  (los descuentos del demo)

   El nivel se lee siempre de la sesión (zag_session), nunca de aquí:
   si la persona cambia de nivel, el carrito se revalida solo.
   ============================================================ */

window.ZAG_TIENDA_CARRITO = (function () {
  'use strict';

  var D = window.ZAG_TIENDA;

  var LS_CARRITO = 'zag_carrito';
  var LS_PEDIDOS = 'zag_pedidos';
  var LS_STOCK = 'zag_tienda_stock';

  var ESTADOS = ['preparacion', 'listo', 'entregado'];
  var ESTADO_TEXTO = {
    preparacion: 'En preparación',
    listo: 'Listo para recoger',
    entregado: 'Entregado'
  };

  /* ---------- almacenamiento tolerante ---------- */

  function leer(clave, porDefecto) {
    try {
      var raw = window.localStorage.getItem(clave);
      if (!raw) return porDefecto;
      var v = JSON.parse(raw);
      return v === null || v === undefined ? porDefecto : v;
    } catch (e) {
      return porDefecto;
    }
  }

  function guardar(clave, valor) {
    try {
      window.localStorage.setItem(clave, JSON.stringify(valor));
      return true;
    } catch (e) {
      return false;
    }
  }

  function borrar(clave) {
    try {
      window.localStorage.removeItem(clave);
    } catch (e) { /* sin almacenamiento: la demo sigue en memoria */ }
  }

  /* ---------- sesión ---------- */

  function sesion() {
    try {
      if (window.ZAG_SESSION && typeof window.ZAG_SESSION.read === 'function') {
        return window.ZAG_SESSION.read() || null;
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  /* El nivel como índice 0..4, o null si no hay sesión.
     El portal guarda la sesión como { name, level: 'senior' }, con el
     nivel como texto; la tienda también acepta { nivel: 4 } por si
     alguien la escribe a mano. */
  function nivelSesion() {
    var s = sesion();
    if (!s) return null;
    var i = D.nivelIndexDe(s.level);
    if (i !== -1) return i;
    var n = Number(s.nivel);
    if (!isNaN(n) && n >= 0 && n < D.NIVELES.length) return n;
    return null;
  }

  function esSenior() {
    return nivelSesion() === 4;
  }

  function tieneSesion() {
    return nivelSesion() !== null;
  }

  function nombreSesion() {
    var s = sesion();
    if (!s) return '';
    return String(s.name || s.nombre || '');
  }

  function correoSesion() {
    var s = sesion();
    if (!s) return '';
    return String(s.correo || s.email || '');
  }

  /* ---------- stock ---------- */

  /* Stock efectivo = stock del catálogo + lo ya descontado por pedidos. */
  function stock(producto) {
    var base = producto ? Number(producto.stock) || 0 : 0;
    var ajustes = leer(LS_STOCK, {});
    if (!ajustes || typeof ajustes !== 'object') return base;
    var aj = Number(ajustes[producto ? producto.id : '']);
    return isNaN(aj) ? base : base + aj;
  }

  function descontarStock(id, unidades) {
    var ajustes = leer(LS_STOCK, {});
    if (!ajustes || typeof ajustes !== 'object') ajustes = {};
    ajustes[id] = (Number(ajustes[id]) || 0) - Number(unidades || 0);
    guardar(LS_STOCK, ajustes);
  }

  /* ---------- carrito ---------- */

  function carrito() {
    var raw = leer(LS_CARRITO, []);
    if (!Array.isArray(raw)) return [];
    return raw
      .filter(function (it) {
        return it && D.buscar(it.id) && Number(it.cantidad) > 0;
      })
      .map(function (it) {
        var p = D.buscar(it.id);
        var talla = it.talla ? String(it.talla) : '';
        if (talla && !D.tieneTallas(p)) talla = '';
        if (talla && p.tallas.indexOf(talla) === -1) talla = '';
        return { id: p.id, talla: talla, cantidad: Math.max(1, Math.floor(Number(it.cantidad) || 1)) };
      });
  }

  function guardarCarrito(items) {
    guardar(LS_CARRITO, items);
    emitir();
  }

  /* Unidades de un producto en el carrito, sumando todas sus tallas:
     el tope de 2 es por producto, no por talla. */
  function unidadesDe(id) {
    return carrito().reduce(function (n, it) {
      return n + (it.id === id ? it.cantidad : 0);
    }, 0);
  }

  function enCarrito(id, talla) {
    return carrito().some(function (it) {
      return it.id === id && it.talla === (talla || '');
    });
  }

  function cantidadDe(id, talla) {
    var it = carrito().filter(function (x) {
      return x.id === id && x.talla === (talla || '');
    })[0];
    return it ? it.cantidad : 0;
  }

  /* Agrega respetando el tope por producto y el stock.
     -> { ok:boolean, motivo:string, unidades:number } */
  function agregar(id, talla, cantidad) {
    var p = D.buscar(id);
    if (!p) return { ok: false, motivo: 'no-existe', unidades: 0 };

    var n = nivelSesion();
    if (n === null) return { ok: false, motivo: 'sin-sesion', unidades: 0 };
    if (!D.desbloqueado(p, n)) return { ok: false, motivo: 'nivel', unidades: 0 };
    if (D.esAgotado(p, stock(p))) return { ok: false, motivo: 'agotado', unidades: 0 };
    if (D.tieneTallas(p) && !talla) return { ok: false, motivo: 'talla', unidades: 0 };

    var pedir = Math.max(1, Math.floor(Number(cantidad) || 1));
    var yaHay = unidadesDe(id);
    var disponible = Math.min(D.config.maxPorProducto - yaHay, stock(p) - yaHay);
    if (disponible <= 0) {
      return { ok: false, motivo: yaHay >= stock(p) ? 'agotado' : 'tope', unidades: yaHay };
    }

    var items = carrito();
    var destino = null;
    for (var i = 0; i < items.length; i++) {
      if (items[i].id === id && items[i].talla === (talla || '')) { destino = items[i]; break; }
    }
    if (destino) {
      destino.cantidad = Math.min(destino.cantidad + pedir, yaHay + disponible);
    } else {
      items.push({ id: id, talla: talla || '', cantidad: Math.min(pedir, disponible) });
    }
    guardarCarrito(items);
    return { ok: true, motivo: '', unidades: unidadesDe(id) };
  }

  function cambiar(id, talla, cantidad) {
    var items = carrito();
    var n = cantidad;
    for (var i = 0; i < items.length; i++) {
      if (items[i].id === id && items[i].talla === (talla || '')) { items[i].cantidad = n; break; }
    }
    guardarCarrito(items);
  }

  function quitar(id, talla) {
    guardarCarrito(carrito().filter(function (it) {
      return !(it.id === id && it.talla === (talla || ''));
    }));
  }

  function vaciar() {
    guardarCarrito([]);
  }

  /* ---------- items resueltos y problemas ---------- */

  /* Cada item del carrito, ya cruzado con el catálogo, el precio final
     (con descuento Senior) y los dos problemas posibles: que el nivel
     actual ya no lo permita, o que se haya agotado. */
  function itemsResueltos() {
    var n = nivelSesion();
    var senior = esSenior();
    return carrito().map(function (it) {
      var p = D.buscar(it.id);
      var st = stock(p);
      var unit = p ? D.precioFinal(p, senior) : 0;
      var subtotal = unit * it.cantidad;
      var problemas = [];
      if (n === null) problemas.push('sin-sesion');
      else if (p && !D.desbloqueado(p, n)) problemas.push('nivel');
      if (p && st <= 0) problemas.push('agotado');
      else if (p && it.cantidad > st) problemas.push('stock');
      return {
        id: it.id,
        talla: it.talla,
        cantidad: it.cantidad,
        producto: p,
        unitario: unit,
        subtotal: subtotal,
        stock: st,
        problemas: problemas,
        ok: problemas.length === 0
      };
    });
  }

  function resumen() {
    var resueltos = itemsResueltos();
    var subtotal = 0;
    var unidades = 0;
    var problemas = 0;
    resueltos.forEach(function (r) {
      subtotal += r.subtotal;
      unidades += r.cantidad;
      if (!r.ok) problemas++;
    });
    var senior = esSenior();
    var descuento = senior ? Math.round(subtotal * D.config.descuentoSenior) : 0;
    return {
      items: resueltos,
      unidades: unidades,
      subtotal: subtotal,
      descuento: descuento,
      total: subtotal - descuento,
      senior: senior,
      problemas: problemas,
      vacio: resueltos.length === 0,
      listo: resueltos.length > 0 && problemas === 0
    };
  }

  /* ---------- fechas ---------- */

  /* Hoy en la zona horaria del portal, como 'YYYY-MM-DD'. */
  function hoyISO() {
    try {
      return new Date().toLocaleDateString('en-CA', { timeZone: D.config.zonaHoraria });
    } catch (e) {
      var d = new Date();
      return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    }
  }

  /* Suma n días hábiles (lunes a viernes) a una fecha 'YYYY-MM-DD'. */
  function sumarHabiles(iso, n) {
    var partes = String(iso).split('-');
    var d = new Date(Date.UTC(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2])));
    var quedan = Number(n) || 0;
    while (quedan > 0) {
      d.setUTCDate(d.getUTCDate() + 1);
      var dia = d.getUTCDay(); // 0 domingo, 6 sábado
      if (dia !== 0 && dia !== 6) quedan--;
    }
    return d.toISOString().slice(0, 10);
  }

  /* Fecha de recogida: hoy + 2 días hábiles. */
  function fechaRecogida() {
    return sumarHabiles(hoyISO(), D.config.diasHabilesRecogida);
  }

  /* "lun 5 de oct" */
  function fechaCorta(iso) {
    var p = String(iso).split('-');
    var d = new Date(Date.UTC(Number(p[0]), Number(p[1]) - 1, Number(p[2])));
    var dia = d.toLocaleDateString('es-CO', { weekday: 'short', timeZone: 'UTC' }).replace('.', '');
    var mes = d.toLocaleDateString('es-CO', { month: 'short', timeZone: 'UTC' }).replace('.', '');
    return dia + ' ' + d.getUTCDate() + ' de ' + mes;
  }

  /* "lunes 5 de octubre de 2026" */
  function fechaLarga(iso) {
    var p = String(iso).split('-');
    var d = new Date(Date.UTC(Number(p[0]), Number(p[1]) - 1, Number(p[2])));
    return d.toLocaleDateString('es-CO', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC'
    });
  }

  /* "20261005" para el enlace de Google Calendar. */
  function compacto(iso) {
    return String(iso).replace(/-/g, '');
  }

  /* ---------- código de pedido ---------- */

  /* ZG-XXXX: cuatro letras y números del hash de la fecha y el contenido.
     Se evitan 0/O y 1/I/I para que se pueda dictar por teléfono. */
  var ALFABETO = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

  function hash(texto) {
    var h = 2166136261;
    for (var i = 0; i < texto.length; i++) {
      h ^= texto.charCodeAt(i);
      h = (h * 16777619) >>> 0;
    }
    return h >>> 0;
  }

  function codigoPedido(semilla) {
    var n = hash(String(semilla || ''));
    var out = '';
    for (var i = 0; i < 4; i++) {
      out += ALFABETO[n % ALFABETO.length];
      n = Math.floor(n / ALFABETO.length);
    }
    return 'ZG-' + out;
  }

  /* ---------- pedidos ---------- */

  function pedidos() {
    var raw = leer(LS_PEDIDOS, []);
    return Array.isArray(raw) ? raw.filter(function (p) { return p && p.codigo; }) : [];
  }

  /* El pedido recién creado, para la pantalla de confirmación. */
  function ultimoPedido() {
    return pedidos()[0] || null;
  }

  function guardarPedidos(lista) {
    guardar(LS_PEDIDOS, lista);
    emitir();
  }

  /* Crea el pedido, descuenta stock y vacía el carrito.
     -> { ok, pedido } | { ok:false, motivo } */
  function crearPedido(datos) {
    var r = resumen();
    if (r.vacio) return { ok: false, motivo: 'vacio' };
    if (!tieneSesion()) return { ok: false, motivo: 'sin-sesion' };
    if (r.problemas) return { ok: false, motivo: 'problemas' };

    var items = r.items.map(function (x) {
      return {
        id: x.id,
        nombre: x.producto.nombre,
        talla: x.talla,
        cantidad: x.cantidad,
        unitario: x.unitario,
        subtotal: x.subtotal
      };
    });

    var ahora = new Date().toISOString();
    var recogida = fechaRecogida();
    var codigo = codigoPedido(ahora + '|' + JSON.stringify(items) + '|' + datos.nombre);
    var lista = pedidos();
    while (lista.some(function (p) { return p.codigo === codigo; })) {
      codigo = codigoPedido(codigo + ahora);
    }

    var pedido = {
      codigo: codigo,
      fecha: ahora,
      items: items,
      subtotal: r.subtotal,
      descuento: r.descuento,
      total: r.total,
      fechaRecogida: recogida,
      estado: 'preparacion',
      datos: {
        nombre: String(datos.nombre || ''),
        correo: String(datos.correo || ''),
        celular: String(datos.celular || ''),
        programa: String(datos.programa || ''),
        nota: String(datos.nota || '')
      }
    };

    items.forEach(function (it) {
      descontarStock(it.id, it.cantidad);
    });

    lista.unshift(pedido);
    guardarPedidos(lista);
    vaciar();
    return { ok: true, pedido: pedido };
  }

  function cancelarPedido(codigo) {
    var lista = pedidos().map(function (p) {
      if (p.codigo !== codigo) return p;
      /* Cancelar devuelve el stock al catálogo. */
      (p.items || []).forEach(function (it) { descontarStock(it.id, -it.cantidad); });
      var copia = {};
      for (var k in p) if (Object.prototype.hasOwnProperty.call(p, k)) copia[k] = p[k];
      copia.estado = 'cancelado';
      return copia;
    });
    guardarPedidos(lista);
  }

  function avanzarPedido(codigo) {
    var lista = pedidos().map(function (p) {
      if (p.codigo !== codigo) return p;
      var i = ESTADOS.indexOf(p.estado);
      var copia = {};
      for (var k in p) if (Object.prototype.hasOwnProperty.call(p, k)) copia[k] = p[k];
      copia.estado = ESTADOS[Math.min(ESTADOS.length - 1, i + 1)];
      return copia;
    });
    guardarPedidos(lista);
  }

  /* Un pedido de ejemplo para que "Mis pedidos" se vea en la demo.
     Solo si no hay ningún pedido guardado. */
  function sembrarPedidoDemo() {
    if (pedidos().length) return null;
    var senior = false;
    var base = [
      { id: 'manilla-rookie', talla: '', cantidad: 1 },
      { id: 'stickers', talla: '', cantidad: 2 }
    ];
    var items = base.map(function (b) {
      var p = D.buscar(b.id);
      var unit = D.precioFinal(p, senior);
      return {
        id: p.id,
        nombre: p.nombre,
        talla: '',
        cantidad: b.cantidad,
        unitario: unit,
        subtotal: unit * b.cantidad
      };
    });
    var subtotal = items.reduce(function (n, it) { return n + it.subtotal; }, 0);
    var ahora = new Date().toISOString();
    var pedido = {
      codigo: codigoPedido(ahora + '|demo|' + JSON.stringify(items)),
      fecha: ahora,
      items: items,
      subtotal: subtotal,
      descuento: 0,
      total: subtotal,
      fechaRecogida: fechaRecogida(),
      estado: 'preparacion',
      datos: {
        nombre: nombreSesion() || 'Estudiante ZAG',
        correo: correoSesion() || 'nombre@eam.edu.co',
        celular: '3001234567',
        programa: 'Publicidad Digital y Mercadeo · 8° semestre',
        nota: ''
      }
    };
    guardarPedidos([pedido]);
    return pedido;
  }

  /* ---------- Google Calendar ---------- */

  /* Evento de todo el día en la fecha de recogida (fin exclusivo). */
  function urlCalendario(pedido) {
    var inicio = compacto(pedido.fechaRecogida);
    var fin = sumarHabilesISO(pedido.fechaRecogida, 1);
    var detalle = 'Total a pagar al recoger: ' + D.formatearPrecio(pedido.total) +
      '. Pagas en la U, en efectivo o por Nequi. Recogemos ' +
      D.config.horarioRecogida + '.';
    if (window.ZAG_RESERVA && window.ZAG_RESERVA.buildGoogleCalendarUrl) {
      return window.ZAG_RESERVA.buildGoogleCalendarUrl({
        text: 'Recoger pedido ZAG ' + pedido.codigo,
        dates: inicio + '/' + compacto(fin),
        details: detalle,
        location: D.config.lugarRecogida,
        ctz: D.config.zonaHoraria
      });
    }
    return '';
  }

  function sumarHabilesISO(iso, n) {
    var partes = String(iso).split('-');
    var d = new Date(Date.UTC(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2])));
    d.setUTCDate(d.getUTCDate() + (Number(n) || 0));
    return d.toISOString().slice(0, 10);
  }

  /* ---------- demo ---------- */

  function reiniciarDemo() {
    borrar(LS_CARRITO);
    borrar(LS_PEDIDOS);
    borrar(LS_STOCK);
    emitir();
  }

  function claves() {
    return { carrito: LS_CARRITO, pedidos: LS_PEDIDOS, stock: LS_STOCK };
  }

  /* ---------- avisos a las dos páginas ---------- */

  var oyentes = [];

  function suscribir(fn) {
    if (typeof fn === 'function' && oyentes.indexOf(fn) === -1) oyentes.push(fn);
    return function () {
      var i = oyentes.indexOf(fn);
      if (i > -1) oyentes.splice(i, 1);
    };
  }

  function emitir() {
    for (var i = 0; i < oyentes.length; i++) {
      try { oyentes[i](); } catch (e) { /* un oyente roto no rompe el carrito */ }
    }
  }

  return {
    ESTADOS: ESTADOS,
    ESTADO_TEXTO: ESTADO_TEXTO,
    LS: claves,

    nivelSesion: nivelSesion,
    esSenior: esSenior,
    tieneSesion: tieneSesion,
    nombreSesion: nombreSesion,
    correoSesion: correoSesion,

    stock: stock,
    carrito: carrito,
    unidadesDe: unidadesDe,
    enCarrito: enCarrito,
    cantidadDe: cantidadDe,
    agregar: agregar,
    cambiar: cambiar,
    quitar: quitar,
    vaciar: vaciar,

    itemsResueltos: itemsResueltos,
    resumen: resumen,

    hoyISO: hoyISO,
    sumarHabiles: sumarHabiles,
    fechaRecogida: fechaRecogida,
    fechaCorta: fechaCorta,
    fechaLarga: fechaLarga,
    codigoPedido: codigoPedido,

    pedidos: pedidos,
    ultimoPedido: ultimoPedido,
    crearPedido: crearPedido,
    cancelarPedido: cancelarPedido,
    avanzarPedido: avanzarPedido,
    sembrarPedidoDemo: sembrarPedidoDemo,
    urlCalendario: urlCalendario,

    reiniciarDemo: reiniciarDemo,
    suscribir: suscribir,
    emitir: emitir
  };
})();