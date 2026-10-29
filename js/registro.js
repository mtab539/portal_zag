/* ============================================================
   PORTAL ZAG — Registro e inicio de sesión (prototipo local)
   Inscripción con correo institucional @eam.edu.co, verificación
   simulada con código demo (sin contraseñas ni servidores) y
   modo demo de presentación. Todo texto de usuario entra con
   textContent; las imágenes subidas se muestran como data:URL.
   ============================================================ */
(function () {
  'use strict';

  var D = window.ZAG_NIVELES;
  var P = window.ZagPerfil;
  var S = window.ZAG_SESSION;
  if (!D || !P || !S) return;

  var $ = function (id) { return document.getElementById(id); };
  var formRegistro = $('registro-form');
  var formLogin = $('login-form');
  var formCodigo = $('codigo-form');
  if (!formRegistro || !formLogin || !formCodigo) return;

  /* Con perfil real creado, el registro no aplica: directo al perfil. */
  if (P.hayPerfil()) { window.location.replace('perfil.html'); return; }

  var status = $('registro-status');
  var pending = null;   /* { correo, registro } */
  var intent = 'registro';
  var avatarData = '';
  var CODE_DEMO = '482913';

  /* ---------- utilidades ---------- */
  function showStatus(text, isError) {
    status.textContent = text;
    status.hidden = false;
    status.classList.toggle('is-error', !!isError);
  }
  function hideStatus() { status.hidden = true; status.textContent = ''; status.classList.remove('is-error'); }
  function setError(inputId, errorId, text) {
    var node = $(errorId);
    if (node) node.textContent = text || '';
    var input = inputId ? $(inputId) : null;
    if (input) {
      if (text) input.setAttribute('aria-invalid', 'true');
      else input.removeAttribute('aria-invalid');
    }
  }
  function clearErrors() {
    document.querySelectorAll('.field-error').forEach(function (n) { n.textContent = ''; });
    document.querySelectorAll('[aria-invalid]').forEach(function (n) { n.removeAttribute('aria-invalid'); });
  }
  function emailValida(value) { return /^[^\s@]+@eam\.edu\.co$/i.test(String(value || '').trim()); }
  function nombreValido(value) { return String(value || '').trim().split(/\s+/).filter(Boolean).length >= 2; }

  /* ---------- sticker: cadena de respaldo png → svg → placeholder ---------- */
  (function sticker() {
    var img = $('registro-sticker-img');
    var placeholder = $('registro-sticker-placeholder');
    if (!img || !placeholder) return;
    img.addEventListener('error', function cae() {
      if (img.dataset.intento === 'svg') {
        img.hidden = true;
        placeholder.hidden = false;
        img.removeEventListener('error', cae);
        return;
      }
      img.dataset.intento = 'svg';
      img.src = 'assets/img/unetealzag.svg';
    });
  })();

  /* ---------- paneles y tabs ---------- */
  var PANELES = ['panel-registro', 'panel-login', 'panel-codigo', 'panel-otro-programa', 'panel-bienvenida'];
  function showPanel(id) {
    PANELES.forEach(function (name) {
      var node = $(name); if (node) node.hidden = name !== id;
    });
    var esTab = id === 'panel-registro' || id === 'panel-login';
    $('tab-registro').setAttribute('aria-selected', id === 'panel-registro' ? 'true' : 'false');
    $('tab-login').setAttribute('aria-selected', id === 'panel-login' ? 'true' : 'false');
    $('tab-registro').classList.toggle('is-active', id === 'panel-registro');
    $('tab-login').classList.toggle('is-active', id === 'panel-login');
    $('tab-registro').tabIndex = id === 'panel-registro' ? 0 : -1;
    $('tab-login').tabIndex = id === 'panel-login' ? 0 : -1;
    hideStatus();
    if (!esTab) {
      var panel = $(id);
      var first = panel && panel.querySelector('input:not([type=radio]):not([type=checkbox]):not([type=file]), select, a, button');
      if (first) window.setTimeout(function () { first.focus(); }, 60);
    }
  }
  $('tab-registro').addEventListener('click', function () { showPanel('panel-registro'); });
  $('tab-login').addEventListener('click', function () { showPanel('panel-login'); });
  /* Flechas entre tabs (patrón tablist) */
  [$('tab-registro'), $('tab-login')].forEach(function (tab, i, tabs) {
    tab.addEventListener('keydown', function (ev) {
      if (ev.key !== 'ArrowRight' && ev.key !== 'ArrowLeft') return;
      ev.preventDefault();
      var next = ev.key === 'ArrowRight' ? tabs[(i + 1) % tabs.length] : tabs[(i + tabs.length - 1) % tabs.length];
      next.focus(); next.click();
    });
  });
  document.querySelectorAll('[data-show-register]').forEach(function (b) {
    b.addEventListener('click', function () { showPanel('panel-registro'); $('reg-nombre').focus(); });
  });

  /* ---------- campos condicionales ---------- */
  function updateRoleFields() {
    var checked = formRegistro.querySelector('input[name="rol"]:checked');
    var student = !checked || checked.value === 'estudiante';
    $('semestre-field').hidden = !student;
    $('egreso-field').hidden = student;
    $('reg-semestre').required = student;
    $('reg-egreso').required = !student;
  }
  formRegistro.querySelectorAll('input[name="rol"]').forEach(function (r) {
    r.addEventListener('change', updateRoleFields);
  });
  updateRoleFields();

  $('reg-programa').addEventListener('change', function () {
    if (this.value === 'otro') showPanel('panel-otro-programa');
  });

  /* ---------- foto de perfil (vista previa circular, 320px JPEG) ---------- */
  $('reg-foto').addEventListener('change', function () {
    setError('reg-foto', 'reg-foto-error', '');
    var file = this.files && this.files[0];
    avatarData = '';
    var preview = $('avatar-preview');
    if (!file) { $('avatar-label').textContent = 'Sube una foto · máximo 5 MB'; preview.textContent = '+'; return; }
    if (!/^image\//.test(file.type)) { setError('reg-foto', 'reg-foto-error', 'Elige un archivo de imagen.'); this.value = ''; return; }
    if (file.size > P.MAX_PESO) { setError('reg-foto', 'reg-foto-error', 'La imagen pesa más de 5 MB.'); this.value = ''; return; }
    P.leerArchivo(file).then(function (data) { return P.recortarCuadrado(data, 320); }).then(function (data) {
      if (!data) throw new Error('imagen');
      avatarData = data;
      $('avatar-label').textContent = file.name;
      preview.textContent = '';
      var img = document.createElement('img');
      img.src = data; img.alt = '';
      preview.appendChild(img);
    }).catch(function () { setError('reg-foto', 'reg-foto-error', 'No pudimos leer esa imagen.'); });
  });

  /* ---------- validación de inscripción ---------- */
  function validarRegistro() {
    clearErrors();
    var errores = [];
    var nombre = $('reg-nombre').value.trim();
    var correo = $('reg-correo').value.trim().toLowerCase();
    var role = formRegistro.querySelector('input[name="rol"]:checked').value;

    if (!nombreValido(nombre)) {
      setError('reg-nombre', 'reg-nombre-error', 'Escribe tu nombre completo (mínimo dos palabras).');
      errores.push('reg-nombre');
    }
    if (!emailValida(correo)) {
      setError('reg-correo', 'reg-correo-error', 'Usa tu correo institucional (@eam.edu.co).');
      errores.push('reg-correo');
    }
    if ($('reg-programa').value !== 'Publicidad Digital y Mercadeo') {
      setError('reg-programa', 'reg-programa-error', 'Elige Publicidad Digital y Mercadeo.');
      errores.push('reg-programa');
    }
    if (role === 'estudiante' && !$('reg-semestre').value) {
      setError('reg-semestre', 'reg-semestre-error', 'Elige tu semestre.');
      errores.push('reg-semestre');
    }
    var year = Number($('reg-egreso').value);
    if (role === 'egresado' && (!year || year < 1980 || year > new Date().getFullYear() + 4)) {
      setError('reg-egreso', 'reg-egreso-error', 'Escribe un año de egreso válido.');
      errores.push('reg-egreso');
    }
    if (!$('reg-consent').checked) {
      setError('reg-consent', 'reg-consent-error', 'Necesitamos tu aceptación para crear el perfil.');
      errores.push('reg-consent');
    }
    if (errores.length) { var first = $(errores[0]); if (first) first.focus(); return false; }
    return true;
  }

  /* ---------- código de verificación demo ---------- */
  var boxes = Array.prototype.slice.call(document.querySelectorAll('.code-box'));

  function codigoCompleto() { return boxes.map(function (b) { return b.value; }).join(''); }

  boxes.forEach(function (box, i) {
    box.addEventListener('input', function () {
      this.value = this.value.replace(/\D/g, '').slice(-1);
      if (this.value && i < boxes.length - 1) boxes[i + 1].focus();
    });
    box.addEventListener('keydown', function (ev) {
      if (ev.key === 'Backspace' && !this.value && i > 0) boxes[i - 1].focus();
    });
    box.addEventListener('paste', function (ev) {
      var texto = (ev.clipboardData || window.clipboardData).getData('text') || '';
      var digitos = texto.replace(/\D/g, '').slice(0, boxes.length);
      if (!digitos) return;
      ev.preventDefault();
      boxes.forEach(function (b, j) { b.value = digitos[j] || ''; });
      boxes[Math.min(digitos.length, boxes.length) - 1].focus();
    });
  });

  function startCode(email, kind, registration) {
    intent = kind;
    pending = { correo: email, registro: registration || null };
    P.generarCodigo(email);
    $('codigo-copy').textContent = 'Te enviamos un código de 6 dígitos a ' + email + '.';
    $('demo-code').textContent = 'Demo: tu código es ' + CODE_DEMO.slice(0, 3) + ' ' + CODE_DEMO.slice(3);
    $('demo-code').hidden = false;
    boxes.forEach(function (b) { b.value = ''; });
    setError(null, 'codigo-error', '');
    showPanel('panel-codigo');
  }

  formRegistro.addEventListener('submit', function (ev) {
    ev.preventDefault(); hideStatus();
    if (!validarRegistro()) return;
    var correo = $('reg-correo').value.trim().toLowerCase();
    if (P.perfilPorCorreo(correo)) {
      setError('reg-correo', 'reg-correo-error', 'Ya existe un perfil con ese correo en este navegador. Entra desde “Ya tengo perfil”.');
      $('reg-correo').focus();
      return;
    }
    var role = formRegistro.querySelector('input[name="rol"]:checked').value;
    startCode(correo, 'registro', {
      nombre: $('reg-nombre').value.trim(),
      correo: correo,
      rol: role,
      semestre: role === 'estudiante' ? $('reg-semestre').value : null,
      egreso: role === 'egresado' ? $('reg-egreso').value : null,
      foto: avatarData,
    });
  });

  formLogin.addEventListener('submit', function (ev) {
    ev.preventDefault(); hideStatus(); clearErrors();
    var correo = $('login-correo').value.trim().toLowerCase();
    if (!emailValida(correo)) {
      setError('login-correo', 'login-correo-error', 'Usa tu correo institucional (@eam.edu.co).');
      $('login-correo').focus();
      return;
    }
    if (!P.perfilPorCorreo(correo)) {
      setError('login-correo', 'login-correo-error', 'No encontramos ese perfil aquí. Inscríbete.');
      $('login-correo').focus();
      return;
    }
    startCode(correo, 'login', null);
  });

  formCodigo.addEventListener('submit', function (ev) {
    ev.preventDefault();
    setError(null, 'codigo-error', '');
    var code = codigoCompleto();
    if (!/^\d{6}$/.test(code)) {
      setError(null, 'codigo-error', 'El código tiene 6 dígitos.');
      var vacio = boxes.filter(function (b) { return !b.value; })[0];
      (vacio || boxes[0]).focus();
      return;
    }
    /* Prototipo: código fijo visible en pantalla. Sin contraseñas
       ni envíos a servidores. */
    if (!pending || !P.comprobarCodigo(pending.correo, code)) {
      setError(null, 'codigo-error', 'El código no coincide. Revísalo.');
      boxes[0].focus();
      return;
    }
    if (intent === 'registro') {
      var creado = P.crear(pending.registro);
      if (!creado.ok) {
        showStatus('No se pudo guardar el perfil en este navegador. Libera espacio e inténtalo de nuevo.', true);
        return;
      }
      pending = null;
      showPanel('panel-bienvenida');
      var titulo = $('bienvenida-title');
      if (titulo) { titulo.setAttribute('tabindex', '-1'); titulo.focus(); }
    } else {
      var profile = P.perfilPorCorreo(pending.correo);
      if (!profile) { showStatus('No encontramos el perfil. Inscríbete para crear uno.', true); showPanel('panel-registro'); return; }
      if (S.sincronizarDesdePerfil) S.sincronizarDesdePerfil({ name: profile.nombre, level: profile.nivel });
      pending = null;
      window.location.assign('perfil.html');
    }
  });

  $('codigo-reenviar').addEventListener('click', function () {
    if (!pending) return;
    P.generarCodigo(pending.correo);
    showStatus('Código reenviado. Demo: tu código es ' + CODE_DEMO.slice(0, 3) + ' ' + CODE_DEMO.slice(3), false);
  });

  /* ---------- modo demo (atajo de presentación) ---------- */
  /* La demo pide (opcional) tu nombre, semestre y foto para que el
     perfil se vea completo; si los dejas vacíos entra como "Invitado Demo".
     Se guardan solo en la demo (zag_demo_*), nunca en un perfil real. */
  var demoSeq = 0;
  function crearCampo(id, etiqueta, control, nota) {
    var wrap = document.createElement('div');
    wrap.className = 'form-field';
    var label = document.createElement('label');
    label.className = 'form-label'; label.htmlFor = id; label.textContent = etiqueta;
    if (nota) {
      var opt = document.createElement('span');
      opt.className = 'optional'; opt.textContent = ' ' + nota;
      label.appendChild(opt);
    }
    control.id = id;
    wrap.appendChild(label); wrap.appendChild(control);
    return wrap;
  }

  function buildDemoLevels(host) {
    demoSeq += 1;
    var uid = 'demo' + demoSeq;
    var previo = P.demoPerfil();
    var fotoDemo = previo && previo.foto ? previo.foto : '';

    var intro = document.createElement('p');
    intro.className = 'demo-intro';
    intro.textContent = 'Ponle tu nombre, semestre y foto a la demo para que se vea completa (opcional). Luego elige el nivel.';
    host.appendChild(intro);

    var campos = document.createElement('div');
    campos.className = 'demo-campos';

    var nombre = document.createElement('input');
    nombre.type = 'text'; nombre.autocomplete = 'name'; nombre.placeholder = 'Invitado Demo';
    nombre.value = previo ? previo.nombre : '';
    campos.appendChild(crearCampo(uid + '-nombre', 'Tu nombre', nombre));

    var semestre = document.createElement('select');
    var base = document.createElement('option'); base.value = ''; base.textContent = 'Elige'; semestre.appendChild(base);
    for (var n = 1; n <= 8; n += 1) {
      var o = document.createElement('option'); o.value = String(n); o.textContent = n + '.º'; semestre.appendChild(o);
    }
    semestre.value = previo && previo.semestre ? String(previo.semestre) : '';
    campos.appendChild(crearCampo(uid + '-semestre', 'Semestre', semestre));
    host.appendChild(campos);

    /* foto: misma vista previa circular que el registro */
    var fotoWrap = document.createElement('div');
    fotoWrap.className = 'form-field';
    var fotoLabel = document.createElement('span');
    fotoLabel.className = 'form-label'; fotoLabel.id = uid + '-foto-label'; fotoLabel.textContent = 'Foto de perfil ';
    var fotoOpt = document.createElement('span'); fotoOpt.className = 'optional'; fotoOpt.textContent = '(opcional)';
    fotoLabel.appendChild(fotoOpt);
    var upload = document.createElement('label');
    upload.className = 'upload-control'; upload.htmlFor = uid + '-foto';
    var avatar = document.createElement('span');
    avatar.className = 'upload-avatar'; avatar.setAttribute('aria-hidden', 'true');
    var avatarTxt = document.createElement('span');
    var inputFoto = document.createElement('input');
    inputFoto.type = 'file'; inputFoto.accept = 'image/*'; inputFoto.id = uid + '-foto';
    inputFoto.setAttribute('aria-labelledby', uid + '-foto-label');
    var err = document.createElement('span');
    err.className = 'field-error'; err.setAttribute('aria-live', 'polite');
    function pintarAvatar(data) {
      avatar.textContent = '';
      if (data) {
        var img = document.createElement('img'); img.src = data; img.alt = '';
        avatar.appendChild(img);
        avatarTxt.textContent = 'Cambiar foto · máximo 5 MB';
      } else {
        avatar.textContent = '+';
        avatarTxt.textContent = 'Sube una foto · máximo 5 MB';
      }
    }
    pintarAvatar(fotoDemo);
    inputFoto.addEventListener('change', function () {
      err.textContent = '';
      var file = this.files && this.files[0];
      if (!file) return;
      if (!/^image\//.test(file.type)) { err.textContent = 'Elige un archivo de imagen.'; this.value = ''; return; }
      if (file.size > P.MAX_PESO) { err.textContent = 'La imagen pesa más de 5 MB.'; this.value = ''; return; }
      P.leerArchivo(file).then(function (data) { return P.recortarCuadrado(data, 320); }).then(function (data) {
        if (!data) throw new Error('imagen');
        fotoDemo = data; pintarAvatar(data);
      }).catch(function () { err.textContent = 'No pudimos leer esa imagen.'; });
    });
    upload.appendChild(avatar); upload.appendChild(avatarTxt); upload.appendChild(inputFoto);
    fotoWrap.appendChild(fotoLabel); fotoWrap.appendChild(upload); fotoWrap.appendChild(err);
    host.appendChild(fotoWrap);

    var entrar = document.createElement('p');
    entrar.className = 'form-label demo-entrar'; entrar.textContent = 'Entrar como';
    host.appendChild(entrar);

    var fila = document.createElement('div');
    fila.className = 'demo-levels__row';
    D.NIVELES.forEach(function (id) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'demo-level-button';
      b.textContent = D.nombre(id);
      b.addEventListener('click', function () {
        var perfil = P.iniciarDemo({
          nivel: id,
          nombre: nombre.value.trim(),
          semestre: semestre.value ? Number(semestre.value) : undefined,
          foto: fotoDemo,
        });
        S.write({ name: perfil ? perfil.nombre : (nombre.value.trim() || 'Invitado Demo'), level: id });
        window.location.assign('perfil.html?demo=' + encodeURIComponent(id));
      });
      fila.appendChild(b);
    });
    host.appendChild(fila);
  }
  [['demo-toggle', 'demo-levels'], ['demo-toggle-login', 'demo-levels-login']].forEach(function (pair) {
    var toggle = $(pair[0]), host = $(pair[1]);
    if (!toggle || !host) return;
    buildDemoLevels(host);
    toggle.addEventListener('click', function () {
      var abierto = !host.hidden;
      host.hidden = abierto;
      toggle.setAttribute('aria-expanded', String(!abierto));
    });
  });
})();
