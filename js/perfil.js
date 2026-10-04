/* ============================================================
   PORTAL ZAG — Perfil: cabecera de nivel, pasaporte de sellos,
   retos con evidencias, desbloqueos, mapa y subida de nivel.
   Todo texto que viene del usuario entra con textContent y las
   imágenes subidas se muestran solo como <img src="data:…">.
   ============================================================ */
(function () {
  'use strict';

  var P = window.ZagPerfil;
  var D = window.ZAG_NIVELES;
  var S = window.ZAG_SESSION;
  if (!P || !D || !S) return;

  var $ = function (id) { return document.getElementById(id); };
  var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ROTACIONES = [-9, 6, -12, 8, -5, 11]; /* rotación fija por casilla */
  var AUTO_APROBAR_MS = 6000;

  /* ---------- sesión y modo ---------- */
  var params = new URLSearchParams(window.location.search);
  var requestedDemo = params.get('demo');
  if (!D.existe(requestedDemo)) requestedDemo = null;
  if (requestedDemo) S.write({ name: 'Invitado Demo', level: requestedDemo });

  var realProfile = P.get();
  var session = S.read();
  if (!realProfile && !session) { window.location.replace('registro.html'); return; }

  var isDemo = !!requestedDemo || (!realProfile && !!session);
  var demoLevel = requestedDemo || (session && D.existe(session.level) ? session.level : 'rookie');
  var displayLevel = isDemo ? demoLevel : realProfile.nivel;
  var previewLevel = null; /* nivel previsualizado desde los chips */

  var timers = Object.create(null);
  var lastSelloCount = isDemo ? 0 : P.sellosDe(displayLevel).length;

  /* Sello por cursos extraclase pendiente de aplicar */
  if (!isDemo && typeof P.aplicarSelloCursos === 'function') P.aplicarSelloCursos();

  /* ---------- helpers de DOM ---------- */
  function node(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined && text !== null) n.textContent = text;
    return n;
  }
  function link(href, text, cls) { var a = node('a', cls || '', text); a.href = href; return a; }
  function setText(id, text) { var e = $(id); if (e) e.textContent = text == null ? '' : text; }
  function anunciar(msg) { var l = $('p-live'); if (!l) return; l.textContent = ''; window.setTimeout(function () { l.textContent = msg; }, 60); }
  function nivelVisible() { return previewLevel || displayLevel; }

  /* Sello en CSS/SVG de respaldo: doble círculo, texto curvo y el
     nombre del nivel en display-giga, en la tinta del nivel. */
  function selloFallback(nivel, grande) {
    var meta = D.meta(nivel);
    var svgNS = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '0 0 120 120');
    svg.setAttribute('class', 'sello-fallback' + (grande ? ' sello-fallback--grande' : ''));
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', 'Sello ' + meta.nombre + ' aprobado');
    svg.style.color = meta.tinta;
    var defs = document.createElementNS(svgNS, 'defs');
    var path = document.createElementNS(svgNS, 'path');
    var pid = 'curva-' + nivel + '-' + Math.random().toString(36).slice(2, 7);
    path.setAttribute('id', pid);
    path.setAttribute('d', 'M60,60 m-40,0 a40,40 0 1,1 80,0 a40,40 0 1,1 -80,0');
    defs.appendChild(path); svg.appendChild(defs);
    [['56', '3.2', 'none'], ['50.5', '1', '4 3']].forEach(function (c) {
      var circ = document.createElementNS(svgNS, 'circle');
      circ.setAttribute('cx', '60'); circ.setAttribute('cy', '60'); circ.setAttribute('r', c[0]);
      circ.setAttribute('fill', 'none'); circ.setAttribute('stroke', 'currentColor');
      circ.setAttribute('stroke-width', c[1]);
      if (c[3]) circ.setAttribute('stroke-dasharray', c[3]);
      svg.appendChild(circ);
    });
    var texto = document.createElementNS(svgNS, 'text');
    texto.setAttribute('class', 'sello-fallback__curva');
    texto.setAttribute('fill', 'currentColor');
    var tp = document.createElementNS(svgNS, 'textPath');
    tp.setAttribute('href', '#' + pid);
    tp.setAttribute('startOffset', '0');
    tp.textContent = 'PERFIL ZAG · ' + meta.nombre + ' · APROBADO · ';
    texto.appendChild(tp); svg.appendChild(texto);
    var centro = document.createElementNS(svgNS, 'text');
    centro.setAttribute('x', '60'); centro.setAttribute('y', '70');
    centro.setAttribute('text-anchor', 'middle');
    centro.setAttribute('class', 'sello-fallback__centro');
    centro.setAttribute('fill', 'currentColor');
    centro.textContent = meta.nombre;
    svg.appendChild(centro);
    return svg;
  }

  /* Imagen del sello con respaldo automático. */
  function selloImg(nivel, alt) {
    var img = node('img', 'sello-img');
    img.src = 'assets/img/sellos/sello-' + nivel + '.svg';
    img.alt = alt || ('Sello ' + D.nombre(nivel));
    img.loading = 'lazy';
    img.addEventListener('error', function h() {
      img.removeEventListener('error', h);
      img.replaceWith(selloFallback(nivel));
    });
    return img;
  }

  function nombreReto(nivel, retoId) {
    if (retoId === 'cursos-extraclase') return '3 cursos extraclase';
    var r = D.reto(nivel, retoId);
    return r ? r.nombre : 'Reto';
  }

  /* ============================================================
     A. CABECERA DE NIVEL
     ============================================================ */
  function renderHero() {
    var meta = D.meta(displayLevel);
    var hero = $('perfil-hero');
    hero.className = 'p-hero nivel-' + displayLevel;

    var perfil = isDemo ? { nombre: (session && session.name) || 'Invitado Demo', correo: '', rol: 'estudiante', semestre: 5, foto: '' } : realProfile;

    /* avatar */
    var avatar = $('p-avatar');
    avatar.textContent = '';
    if (perfil.foto && !isDemo) {
      var img = node('img'); img.src = perfil.foto; img.alt = '';
      avatar.appendChild(img);
    } else {
      avatar.textContent = String(perfil.nombre || 'Z').trim().split(/\s+/).slice(0, 2).map(function (w) { return w.charAt(0).toUpperCase(); }).join('');
    }
    $('p-cambiar-foto').hidden = isDemo;

    setText('p-kicker', 'PERFIL ZAG');
    setText('p-nombre', perfil.nombre);
    setText('p-nivel', meta.nombre);
    setText('p-identidad', meta.identidad.toUpperCase());

    var lineas = [];
    lineas.push(D.lineaRol(perfil));
    if (perfil.correo) lineas.push(perfil.correo);
    setText('p-meta-line', lineas.filter(Boolean).join(' · '));
    $('p-links').hidden = isDemo;

    /* progreso */
    var esSenior = displayLevel === 'senior';
    var count = isDemo ? 0 : Math.min(6, P.sellosDe(displayLevel).length);
    $('p-progreso').hidden = esSenior;
    $('p-tope').hidden = !esSenior;
    if (!esSenior) {
      setText('p-progreso-label', count + ' / 6 sellos');
      var sig = D.nivelSiguiente(displayLevel);
      setText('p-progreso-next', sig ? D.nombre(sig) + ' →' : '');
      $('p-barra').setAttribute('aria-valuenow', String(count));
      $('p-barra-fill').style.width = (count / 6 * 100) + '%';
    }

    $('demo-banner').hidden = !isDemo;
    setText('demo-level-label', meta.nombre);
  }

  /* tooltips (i) */
  function setupTooltip(btnId, tipId, textoFn) {
    var btn = $(btnId), tip = $(tipId);
    if (!btn || !tip) return;
    btn.addEventListener('click', function () {
      var abierto = !tip.hidden;
      if (!abierto) tip.textContent = textoFn();
      tip.hidden = abierto;
      btn.setAttribute('aria-expanded', String(!abierto));
    });
    document.addEventListener('click', function (ev) {
      if (tip.hidden) return;
      if (ev.target === btn || ev.target === tip) return;
      tip.hidden = true; btn.setAttribute('aria-expanded', 'false');
    });
  }

  /* ============================================================
     B. PASAPORTE ZAG
     ============================================================ */
  function renderPasaporte(stampNuevo) {
    var grid = $('pasaporte-grid'); grid.textContent = '';
    var meta = D.meta(displayLevel);
    setText('pasaporte-nombre', isDemo ? 'Invitado Demo' : P.nombre());
    setText('pasaporte-nivel', 'Página ' + (D.indice(displayLevel) + 1) + ' de 5 · Sello ' + meta.nombre);

    var seals = isDemo ? [] : P.sellosDe(displayLevel).slice(0, 6);
    var pending = isDemo ? [] : P.evidencias().filter(function (e) { return e.nivel === displayLevel && e.estado === 'pendiente'; });

    for (var i = 0; i < 6; i += 1) {
      var slot = node('div', 'casilla');
      var rot = ROTACIONES[i % ROTACIONES.length];
      if (i < seals.length) {
        /* ganada */
        slot.classList.add('casilla--ganada');
        if (stampNuevo && i === seals.length - 1) slot.classList.add('casilla--estampando');
        var holder = node('div', 'casilla__sello');
        holder.style.transform = 'rotate(' + rot + 'deg)';
        holder.appendChild(selloImg(displayLevel, 'Sello ' + meta.nombre + ' aprobado'));
        slot.appendChild(holder);
        var cap = node('p', 'casilla__cap');
        cap.appendChild(node('span', 'casilla__reto', nombreReto(displayLevel, seals[i].retoId)));
        cap.appendChild(node('span', 'casilla__fecha', D.fechaCorta(seals[i].fecha)));
        slot.appendChild(cap);
        slot.setAttribute('aria-label', 'Sello ' + (i + 1) + ' aprobado: ' + nombreReto(displayLevel, seals[i].retoId));
      } else if (pending.length) {
        /* en revisión */
        var ev = pending.shift();
        slot.classList.add('casilla--revision');
        var hold = node('div', 'casilla__sello casilla__sello--tenue');
        hold.style.transform = 'rotate(' + rot + 'deg)';
        hold.appendChild(selloImg(displayLevel, ''));
        slot.appendChild(hold);
        slot.appendChild(node('p', 'casilla__cap casilla__cap--estado', '⏳ En revisión'));
        slot.setAttribute('aria-label', 'Sello ' + (i + 1) + ' en revisión: ' + nombreReto(displayLevel, ev.retoId));
      } else {
        /* vacía */
        slot.classList.add('casilla--vacia');
        var circ = node('div', 'casilla__vacia');
        circ.appendChild(node('span', 'casilla__num', String(i + 1)));
        slot.appendChild(circ);
        slot.appendChild(node('p', 'casilla__cap casilla__cap--estado', 'Por ganar'));
        slot.setAttribute('aria-label', 'Casilla ' + (i + 1) + ' por ganar');
      }
      grid.appendChild(slot);
    }

    /* páginas anteriores */
    var hostAnt = $('pasaporte-anteriores');
    var row = $('pasaporte-anteriores-row'); row.textContent = '';
    var anteriores = isDemo ? [] : P.historial().filter(function (h) { return D.indice(h.nivel) < D.indice(displayLevel); });
    anteriores.forEach(function (h) {
      var det = node('details', 'mini-pagina');
      var sum = node('summary', 'mini-pagina__sum');
      var im = selloImg(h.nivel, '');
      im.className = 'mini-pagina__img';
      sum.appendChild(im);
      var txt = node('span', 'mini-pagina__txt');
      txt.appendChild(node('strong', null, D.nombre(h.nivel)));
      txt.appendChild(node('span', null, 'completado el ' + D.fechaCorta(h.fecha)));
      sum.appendChild(txt);
      det.appendChild(sum);
      var mini = node('div', 'mini-pagina__sellos');
      var sellosNivel = P.sellosDe(h.nivel).slice(0, 6);
      for (var j = 0; j < 6; j += 1) {
        var m = node('span', 'mini-sello' + (j < sellosNivel.length ? ' mini-sello--lleno' : ''));
        if (j < sellosNivel.length) {
          var mi = selloImg(h.nivel, 'Sello ' + (j + 1) + ' de ' + D.nombre(h.nivel));
          m.appendChild(mi);
        }
        mini.appendChild(m);
      }
      det.appendChild(mini);
      row.appendChild(det);
    });
    hostAnt.hidden = !anteriores.length;
  }

  /* ============================================================
     C. VISTA PREVIA DE NIVELES (chips)
     ============================================================ */
  function renderChips() {
    var host = $('chips-niveles'); host.textContent = '';
    D.NIVELES.forEach(function (id) {
      var i = D.indice(id), actual = D.indice(displayLevel);
      var chip = node('button', 'chip-nivel', null);
      chip.type = 'button';
      var etiqueta = D.nombre(id);
      if (i < actual) { chip.classList.add('chip-nivel--pasado'); etiqueta = '✓ ' + etiqueta; }
      else if (i === actual) chip.classList.add('chip-nivel--actual');
      else chip.classList.add('chip-nivel--futuro');
      if (previewLevel === id) chip.classList.add('chip-nivel--viendo');
      chip.textContent = etiqueta;
      chip.setAttribute('aria-pressed', String(previewLevel === id || (!previewLevel && id === displayLevel)));
      chip.addEventListener('click', function () {
        previewLevel = (id === displayLevel) ? null : id;
        renderZonas();
      });
      host.appendChild(chip);
    });
    var aviso = $('preview-aviso');
    aviso.hidden = !previewLevel;
    if (previewLevel) setText('preview-nivel', D.nombre(previewLevel));
  }
  $('preview-volver').addEventListener('click', function () { previewLevel = null; renderZonas(); });

  /* ============================================================
     D. RETOS
     ============================================================ */
  var retoAbierto = null;

  function estadoReto(nivel, reto) {
    var pendiente = P.pendienteDe(reto.id, nivel);
    var aprobados = P.aprobadosDe(reto.id, nivel);
    var rechazada = P.evidenciasDe(reto.id, nivel).some(function (e) { return e.estado === 'rechazada'; });
    return { pendiente: pendiente, aprobados: aprobados, rechazada: rechazada };
  }

  function renderRetos() {
    var host = $('retos-list'); host.textContent = '';
    var nivel = nivelVisible();
    var readonly = isDemo || !!previewLevel;
    $('retos-readonly').hidden = !readonly;
    setText('retos-level', D.nombre(nivel));
    var sig = D.nivelSiguiente(nivel);
    setText('retos-sub', sig ? D.UI.perfil.retosSub(D.nombre(nivel), D.nombre(sig)) : D.UI.perfil.nivelTope);

    var retos = D.retos(nivel);
    if (!retos.length) {
      host.appendChild(node('p', 'retos-tope', D.UI.perfil.nivelTope));
      return;
    }
    var completado = !isDemo && !previewLevel && P.sellosDe(nivel).length >= 6;
    if (completado) {
      host.appendChild(node('p', 'retos-tope', 'Nivel completo: tus 6 sellos ' + D.nombre(nivel) + ' están estampados.'));
      return;
    }

    retos.forEach(function (reto, index) {
      var est = readonly ? { pendiente: null, aprobados: 0, rechazada: false } : estadoReto(nivel, reto);
      var item = node('div', 'reto');
      var abierto = retoAbierto === reto.id && !est.pendiente;

      /* fila (cabecera del acordeón) */
      var fila = node('button', 'reto__fila');
      fila.type = 'button';
      fila.setAttribute('aria-expanded', String(abierto));
      fila.id = 'reto-fila-' + reto.id;

      var check = node('span', 'reto__check' + (est.aprobados > 0 ? ' reto__check--hecho' : ''), est.aprobados > 0 ? '✓' : '');
      check.setAttribute('aria-hidden', 'true');
      fila.appendChild(check);

      var nombre = node('span', 'reto__nombre', reto.nombre);
      fila.appendChild(nombre);

      var ira = link(reto.href, 'Ir →', 'reto__ir');
      ira.addEventListener('click', function (ev) { ev.stopPropagation(); });
      fila.appendChild(ira);

      var estado = node('span', 'reto__estado');
      if (est.pendiente) estado.textContent = '⏳ En revisión';
      else if (est.aprobados > 0) estado.textContent = '+' + est.aprobados + (est.aprobados === 1 ? ' sello' : ' sellos') + ' aprobados · repetible';
      else estado.textContent = '+1 sello · sube evidencia';
      fila.appendChild(estado);
      item.appendChild(fila);

      /* cuerpo */
      var cuerpo = node('div', 'reto__cuerpo');
      cuerpo.id = 'reto-cuerpo-' + reto.id;
      cuerpo.hidden = !abierto && !est.pendiente;
      fila.setAttribute('aria-controls', cuerpo.id);

      if (est.pendiente) {
        cuerpo.hidden = false;
        cuerpo.appendChild(node('p', 'reto__info', '⏳ Pendiente de aprobación · revisión en máx. 48 horas.'));
        if (est.pendiente.img) {
          var prev = node('img', 'reto__prev-mini');
          prev.src = est.pendiente.img; prev.alt = 'Evidencia enviada';
          cuerpo.appendChild(prev);
        }
        var tools = node('p', 'reto__demo-links');
        var ok = node('button', 'p-link', '(demo) simular aprobación'); ok.type = 'button';
        ok.addEventListener('click', function () { resolverEvidencia(est.pendiente.id, true); });
        var no = node('button', 'p-link', '(demo) rechazar'); no.type = 'button';
        no.addEventListener('click', function () { resolverEvidencia(est.pendiente.id, false); });
        tools.appendChild(ok); tools.appendChild(document.createTextNode(' · ')); tools.appendChild(no);
        cuerpo.appendChild(tools);
        scheduleAutoApproval(est.pendiente);
        item.classList.add('reto--pendiente');
      } else if (!readonly) {
        cuerpo.appendChild(node('p', 'reto__info', D.UI.perfil.evidenciaInfo));
        if (est.rechazada) cuerpo.appendChild(node('p', 'reto__rechazada', 'Evidencia no aprobada: sube una más clara.'));
        cuerpo.appendChild(crearFormularioEvidencia(nivel, reto));
      } else {
        cuerpo.appendChild(node('p', 'reto__info', D.UI.perfil.evidenciaInfo));
        if (reto.pista) cuerpo.appendChild(node('p', 'reto__pista', reto.pista));
      }
      item.appendChild(cuerpo);

      fila.addEventListener('click', function () {
        if (est.pendiente) return; /* la pendiente siempre está abierta */
        retoAbierto = abierto ? null : reto.id;
        renderRetos();
      });

      host.appendChild(item);
    });
  }

  /* Zona punteada de evidencia: arrastrar o elegir, con vista previa. */
  function crearFormularioEvidencia(nivel, reto) {
    var form = node('form', 'evidencia');
    form.noValidate = true;
    var imgData = '';

    var zona = node('label', 'dropzone');
    var input = node('input'); input.type = 'file'; input.accept = 'image/*';
    input.className = 'dropzone__input';
    var texto = node('span', 'dropzone__texto', 'Arrastra una foto aquí o haz clic para elegirla');
    texto.appendChild(node('small', null, 'image/* · máximo 5 MB'));
    zona.appendChild(input); zona.appendChild(texto);
    zona.setAttribute('tabindex', '0');

    function mostrarPreview(data) {
      zona.classList.add('dropzone--con-img');
      texto.textContent = '';
      var im = node('img', 'dropzone__preview'); im.src = data; im.alt = 'Vista previa de la evidencia';
      texto.appendChild(im);
      texto.appendChild(node('span', 'dropzone__cambiar', 'Cambiar'));
      submit.disabled = false;
    }
    function leer(file) {
      err.textContent = '';
      if (!file) return;
      if (!/^image\//.test(file.type)) { err.textContent = 'Elige un archivo de imagen.'; return; }
      if (file.size > P.MAX_PESO) { err.textContent = 'La imagen pesa más de 5 MB.'; return; }
      P.leerArchivo(file).then(function (data) { return P.reducir(data, 800); }).then(function (data) {
        if (!data) throw new Error('imagen');
        imgData = data;
        mostrarPreview(data);
      }).catch(function () { err.textContent = 'No pudimos leer esa imagen.'; });
    }
    input.addEventListener('change', function () { leer(this.files && this.files[0]); });
    zona.addEventListener('keydown', function (ev) { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); input.click(); } });
    ['dragenter', 'dragover'].forEach(function (evName) {
      zona.addEventListener(evName, function (ev) { ev.preventDefault(); zona.classList.add('dropzone--sobre'); });
    });
    ['dragleave', 'drop'].forEach(function (evName) {
      zona.addEventListener(evName, function (ev) { ev.preventDefault(); zona.classList.remove('dropzone--sobre'); });
    });
    zona.addEventListener('drop', function (ev) {
      var file = ev.dataTransfer && ev.dataTransfer.files && ev.dataTransfer.files[0];
      leer(file);
    });

    var notaLabel = node('label', 'evidencia__nota-label', 'Cuéntanos en una línea qué hiciste ');
    notaLabel.appendChild(node('span', 'optional', '(opcional)'));
    var nota = node('input', 'evidencia__nota');
    nota.type = 'text'; nota.maxLength = 140; nota.placeholder = 'Tu reto en una frase…';
    notaLabel.appendChild(nota);

    var err = node('span', 'field-error'); err.setAttribute('aria-live', 'polite');
    var submit = node('button', 'btn btn--negro evidencia__submit', 'Enviar evidencia');
    submit.type = 'submit'; submit.disabled = true;

    form.appendChild(zona); form.appendChild(notaLabel); form.appendChild(err); form.appendChild(submit);
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      if (!imgData) { err.textContent = 'Sube una foto de evidencia primero.'; return; }
      submit.disabled = true; submit.textContent = 'Enviando…';
      var result = P.enviarEvidencia({ nivel: nivel, retoId: reto.id, img: imgData, nota: nota.value.trim() });
      if (!result.ok) {
        err.textContent = result.motivo === 'pendiente' ? 'Ya tienes una evidencia de este reto en revisión.' : 'No se pudo guardar la evidencia. Libera espacio e inténtalo de nuevo.';
        submit.disabled = false; submit.textContent = 'Enviar evidencia';
        return;
      }
      if (result.aviso === 'sin-imagen') anunciar('Se guardó tu evidencia sin la imagen porque el navegador se quedó sin espacio.');
      else anunciar('Evidencia enviada. Quedó en revisión.');
      retoAbierto = null;
      renderZonas();
    });
    return form;
  }

  function resolverEvidencia(id, aprobada) {
    var ev = aprobada ? P.aprobar(id) : P.rechazar(id);
    if (!ev) return;
    if (aprobada) {
      anunciar('Sello aprobado: ' + nombreReto(ev.nivel, ev.retoId));
      P.subirNivelSiCorresponde();
    } else {
      anunciar('Evidencia no aprobada. Puedes subir una nueva.');
    }
  }

  /* Auto-aprobación demo: si nadie revisa en unos segundos, el
     prototipo aprueba solo (además de los botones manuales). */
  function scheduleAutoApproval(evidence) {
    if (!evidence || evidence.estado !== 'pendiente' || timers[evidence.id]) return;
    var elapsed = Date.now() - new Date(evidence.fecha).getTime();
    var wait = Math.max(0, AUTO_APROBAR_MS - (isFinite(elapsed) ? elapsed : 0));
    timers[evidence.id] = window.setTimeout(function () {
      delete timers[evidence.id];
      var actual = P.evidenciaPorId(evidence.id);
      if (actual && actual.estado === 'pendiente') resolverEvidencia(evidence.id, true);
    }, wait);
  }

  /* ============================================================
     E. DESBLOQUEOS + MAPA · F. TARJETA AL SUBIR A
     ============================================================ */
  function renderDesbloqueos() {
    var host = $('unlock-grid'); host.textContent = '';
    var nivel = nivelVisible();
    D.desbloqueos(nivel).forEach(function (u) {
      var card = link(u.href, '', 'unlock-card');
      var icono = node('span', 'unlock-card__icon', u.icono || '✳');
      icono.setAttribute('aria-hidden', 'true');
      card.appendChild(icono);
      card.appendChild(node('h3', null, u.titulo));
      card.appendChild(node('p', null, u.desc));
      card.appendChild(node('span', 'unlock-card__ir', 'Explorar ↗'));
      host.appendChild(card);
    });
  }

  function renderMapa() {
    var host = $('mapa-rows'); host.textContent = '';
    var actual = D.indice(displayLevel);
    D.NIVELES.forEach(function (id, i) {
      var det = node('details', 'mapa-fila' + (i === actual ? ' mapa-fila--actual' : ''));
      var sum = node('summary', 'mapa-fila__sum');
      var marca = i <= actual ? '✓' : '🔒';
      var chip = node('span', 'mapa-fila__nivel mapa-fila__nivel--' + id, marca + ' ' + D.nombre(id));
      sum.appendChild(chip);
      sum.appendChild(node('span', 'mapa-fila__identidad', D.meta(id).identidad));
      det.appendChild(sum);
      var ul = node('ul', 'mapa-fila__items');
      D.desbloqueosDe(id).forEach(function (u) {
        ul.appendChild(node('li', null, (i <= actual ? '✓ ' : '🔒 ') + u.titulo));
      });
      det.appendChild(ul);
      host.appendChild(det);
    });
  }

  function renderNextCard() {
    var panel = $('next-card'); panel.textContent = '';
    var nivel = nivelVisible();
    var next = D.nivelSiguiente(nivel);
    if (!next) {
      panel.classList.add('next-card--tope');
      var left = node('div');
      left.appendChild(node('p', 'kicker', 'NIVEL TOPE'));
      left.appendChild(node('h3', null, D.UI.perfil.nivelTope));
      panel.appendChild(left);
      panel.appendChild(node('div', 'next-card__count', '∞'));
      return;
    }
    panel.classList.remove('next-card--tope');
    var count = (isDemo || previewLevel) ? 0 : Math.min(6, P.sellosDe(displayLevel).length);
    var left = node('div');
    left.appendChild(node('p', 'kicker', 'AL SUBIR A ' + D.nombre(next)));
    left.appendChild(node('h3', null, D.meta(next).identidad));
    left.appendChild(node('p', null, D.meta(next).definicion));
    var ul = node('ul');
    D.resumenDesbloqueos(next).forEach(function (x) { ul.appendChild(node('li', null, x)); });
    left.appendChild(ul);
    panel.appendChild(left);
    var right = node('div', 'next-card__count', String(6 - count));
    right.appendChild(node('small', null, 'SELLOS PARA SUBIR'));
    panel.appendChild(right);
  }

  /* ============================================================
     G. ACTIVIDAD
     ============================================================ */
  function renderActividad() {
    var host = $('actividad-list'); host.textContent = '';
    var items = isDemo ? [] : P.actividad(8);
    if (!items.length) {
      host.appendChild(node('p', 'actividad-vacia', isDemo ? 'La actividad de la vista demo no se guarda.' : 'Todavía no hay movimientos. Sube tu primera evidencia.'));
      return;
    }
    items.forEach(function (item) {
      var row = node('div', 'actividad-item');
      var time = node('time', null, D.fechaCorta(item.fecha));
      if (item.fecha) time.dateTime = item.fecha;
      row.appendChild(time);
      row.appendChild(node('span', null, item.texto));
      host.appendChild(row);
    });
  }

  /* ============================================================
     HERRAMIENTAS DEMO
     ============================================================ */
  function renderDemoTools() {
    var host = $('demo-tools'); host.textContent = '';
    var aside = host.closest('.p-demo-tools');
    if (isDemo) { if (aside) aside.hidden = true; return; }
    if (aside) aside.hidden = false;

    var mas = node('button', 'p-link', '(demo) +1 sello'); mas.type = 'button';
    mas.addEventListener('click', function () {
      if (displayLevel === 'senior') { anunciar('Ya estás en el nivel tope.'); return; }
      P.sumarSello(displayLevel, 'demo-' + Date.now().toString(36), 'demo');
      P.subirNivelSiCorresponde();
    });
    var completar = node('button', 'p-link', '(demo) completar nivel'); completar.type = 'button';
    completar.addEventListener('click', function () {
      if (displayLevel === 'senior') { anunciar('Ya estás en el nivel tope.'); return; }
      var faltan = 6 - P.sellosDe(displayLevel).length;
      for (var i = 0; i < faltan; i += 1) P.sumarSello(displayLevel, 'demo-' + i + '-' + Date.now().toString(36), 'demo');
      P.subirNivelSiCorresponde();
    });
    var reiniciar = node('button', 'p-link', '(demo) reiniciar perfil'); reiniciar.type = 'button';
    reiniciar.addEventListener('click', function () {
      P.reiniciar();
      window.location.assign('registro.html');
    });
    host.appendChild(mas); host.appendChild(completar); host.appendChild(reiniciar);
  }

  /* ============================================================
     LEVEL-UP
     ============================================================ */
  function lanzarConfetti(host) {
    host.textContent = '';
    if (reducedMotion) return;
    for (var i = 0; i < 70; i += 1) {
      var p = node('span', 'confetti__pieza c' + (i % 5 + 1));
      p.style.left = (Math.random() * 100) + '%';
      p.style.animationDelay = (Math.random() * 0.9) + 's';
      p.style.animationDuration = (2.2 + Math.random() * 1.6) + 's';
      p.style.setProperty('--giro', Math.round(Math.random() * 720 - 360) + 'deg');
      host.appendChild(p);
    }
  }

  function showLevelup(evt) {
    var dialog = $('levelup-dialog');
    var meta = D.meta(evt.a);
    dialog.className = 'levelup nivel-' + evt.a;

    var stamp = $('levelup-stamp'); stamp.textContent = '';
    var im = selloImg(evt.a, '');
    if (!reducedMotion) im.classList.add('levelup__stamp-anim');
    stamp.appendChild(im);

    setText('levelup-kicker', '¡SUBISTE DE NIVEL!');
    setText('levelup-title', 'AHORA ERES ' + meta.nombre);
    setText('levelup-identidad', meta.identidad);
    setText('levelup-copy', evt.a === 'senior'
      ? 'Completaste tus 6 sellos ' + D.nombre(evt.de) + '. Nivel tope. Construyes cultura, no la persigues. Esto es lo nuevo que desbloqueaste:'
      : 'Completaste tus 6 sellos ' + D.nombre(evt.de) + '. Esto es lo nuevo que desbloqueaste:');
    var list = $('levelup-list'); list.textContent = '';
    D.resumenDesbloqueos(evt.a).forEach(function (text) { list.appendChild(node('li', null, text)); });

    lanzarConfetti($('levelup-confetti'));
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
    $('levelup-close').focus();
    anunciar('¡Subiste de nivel! Ahora eres ' + meta.nombre + '.');
  }
  function closeLevelup() {
    var d = $('levelup-dialog');
    if (d.open && d.close) d.close(); else d.removeAttribute('open');
  }
  $('levelup-close').addEventListener('click', closeLevelup);
  $('levelup-ver').addEventListener('click', function () {
    closeLevelup();
    var destino = $('desbloqueos');
    if (destino) destino.scrollIntoView(reducedMotion ? {} : { behavior: 'smooth' });
  });
  $('levelup-dialog').addEventListener('click', function (ev) { if (ev.target === this) closeLevelup(); });

  /* ============================================================
     EDITAR PERFIL / CAMBIAR FOTO / CERRAR SESIÓN
     ============================================================ */
  var editFotoData = null; /* null = no tocar; '' = quitar; data = nueva */

  function abrirEditar() {
    if (!realProfile) return;
    var d = $('editar-dialog');
    $('edit-nombre').value = realProfile.nombre || '';
    $('edit-semestre-field').hidden = realProfile.rol === 'egresado';
    $('edit-egreso-field').hidden = realProfile.rol !== 'egresado';
    $('edit-semestre').value = realProfile.semestre || '';
    $('edit-egreso').value = realProfile.egreso || '';
    editFotoData = null;
    var preview = $('edit-avatar-preview'); preview.textContent = '';
    if (realProfile.foto) { var im = node('img'); im.src = realProfile.foto; im.alt = ''; preview.appendChild(im); }
    else preview.textContent = '+';
    $('edit-avatar-label').textContent = realProfile.foto ? 'Cambiar foto · máximo 5 MB' : 'Sube una foto · máximo 5 MB';
    ['edit-nombre-error', 'edit-semestre-error', 'edit-egreso-error', 'edit-foto-error'].forEach(function (id) { setText(id, ''); });
    if (typeof d.showModal === 'function') d.showModal(); else d.setAttribute('open', '');
    $('edit-nombre').focus();
  }
  function cerrarEditar() {
    var d = $('editar-dialog');
    if (d.open && d.close) d.close(); else d.removeAttribute('open');
  }
  $('p-editar').addEventListener('click', abrirEditar);
  $('editar-close').addEventListener('click', cerrarEditar);
  $('editar-cancelar').addEventListener('click', cerrarEditar);
  $('editar-dialog').addEventListener('click', function (ev) { if (ev.target === this) cerrarEditar(); });

  $('edit-foto').addEventListener('change', function () {
    setText('edit-foto-error', '');
    var file = this.files && this.files[0];
    if (!file) return;
    if (!/^image\//.test(file.type)) { setText('edit-foto-error', 'Elige un archivo de imagen.'); this.value = ''; return; }
    if (file.size > P.MAX_PESO) { setText('edit-foto-error', 'La imagen pesa más de 5 MB.'); this.value = ''; return; }
    P.leerArchivo(file).then(function (data) { return P.recortarCuadrado(data, 320); }).then(function (data) {
      if (!data) throw new Error('imagen');
      editFotoData = data;
      var preview = $('edit-avatar-preview'); preview.textContent = '';
      var im = node('img'); im.src = data; im.alt = '';
      preview.appendChild(im);
      $('edit-avatar-label').textContent = file.name;
    }).catch(function () { setText('edit-foto-error', 'No pudimos leer esa imagen.'); });
  });

  $('editar-form').addEventListener('submit', function (ev) {
    ev.preventDefault();
    var nombre = $('edit-nombre').value.trim();
    var ok = true;
    if (nombre.split(/\s+/).filter(Boolean).length < 2) { setText('edit-nombre-error', 'Escribe tu nombre completo (mínimo dos palabras).'); ok = false; } else setText('edit-nombre-error', '');
    var changes = { nombre: nombre };
    if (realProfile.rol === 'egresado') {
      var year = Number($('edit-egreso').value);
      if (!year || year < 1980 || year > new Date().getFullYear() + 4) { setText('edit-egreso-error', 'Escribe un año válido.'); ok = false; }
      else { setText('edit-egreso-error', ''); changes.egreso = year; }
    } else {
      if (!$('edit-semestre').value) { setText('edit-semestre-error', 'Elige tu semestre.'); ok = false; }
      else { setText('edit-semestre-error', ''); changes.semestre = Number($('edit-semestre').value); }
    }
    if (!ok) return;
    if (editFotoData !== null) changes.foto = editFotoData;
    P.actualizar(changes);
    cerrarEditar();
    anunciar('Perfil actualizado.');
  });

  $('p-cambiar-foto').addEventListener('click', function () { $('p-foto-input').click(); });
  $('p-foto-input').addEventListener('change', function () {
    var file = this.files && this.files[0];
    if (!file || !realProfile) return;
    if (!/^image\//.test(file.type) || file.size > P.MAX_PESO) { anunciar('Elige una imagen de máximo 5 MB.'); return; }
    P.leerArchivo(file).then(function (data) { return P.recortarCuadrado(data, 320); }).then(function (data) {
      if (!data) { anunciar('No pudimos leer esa imagen.'); return; }
      P.actualizar({ foto: data });
      anunciar('Foto de perfil actualizada.');
    });
    this.value = '';
  });

  $('p-logout').addEventListener('click', function () {
    S.clear();
    window.location.assign('registro.html');
  });

  /* ============================================================
     RENDER GENERAL Y EVENTOS
     ============================================================ */
  function renderZonas() {
    renderChips(); renderRetos(); renderDesbloqueos(); renderMapa(); renderNextCard();
  }
  function renderAll(stampNuevo) {
    renderHero(); renderPasaporte(stampNuevo); renderZonas(); renderActividad(); renderDemoTools();
  }

  P.onChange(function (event) {
    if (!isDemo) {
      realProfile = P.get();
      displayLevel = realProfile ? realProfile.nivel : displayLevel;
      if (previewLevel && !D.existe(previewLevel)) previewLevel = null;
    }
    var stampNuevo = false;
    if (event && event.tipo === 'sello' && !isDemo) {
      var ahora = P.sellosDe(displayLevel).length;
      stampNuevo = ahora > lastSelloCount;
      lastSelloCount = ahora;
    }
    renderAll(stampNuevo && !reducedMotion);
    if (event && event.tipo === 'levelup' && event.evento) showLevelup(event.evento);
  });

  setupTooltip('p-nivel-info', 'p-nivel-tooltip', function () { return D.meta(displayLevel).definicion; });
  setupTooltip('p-progreso-info', 'p-progreso-tooltip', function () { return D.UI.perfil.progresoTip; });

  /* Carga inicial: por si los 6 sellos se completaron en otra página. */
  var levelupInicial = isDemo ? null : P.subirNivelSiCorresponde();
  renderAll(false);
  if (levelupInicial) showLevelup(levelupInicial);
})();
