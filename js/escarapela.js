/* =========================================================
   Escarapela ZAG — carné colgante con física (vanilla JS)
   Port del componente "Lanyard Badge" (React) a JS sin dependencias.
   Uso: ZAGEscarapela.mount(elemento, { front: Node, back: Node, ... })
   ========================================================= */
(function () {
  'use strict';

  /* ---------- física ---------- */
  function integrate(pts, dt, gravity, damping) {
    for (var i = 0; i < pts.length; i++) {
      var p = pts[i];
      if (!p.w) continue;
      var vx = (p.x - p.px) * damping;
      var vy = (p.y - p.py) * damping;
      p.px = p.x; p.py = p.y;
      p.x += vx;
      p.y += vy + gravity * dt * dt;
    }
  }

  function solve(pts, links, iterations) {
    for (var k = 0; k < iterations; k++) {
      for (var n = 0; n < links.length; n++) {
        var a = pts[links[n][0]], b = pts[links[n][1]], rest = links[n][2];
        var ws = a.w + b.w;
        if (!ws) continue;
        var dx = b.x - a.x, dy = b.y - a.y;
        var d = Math.hypot(dx, dy) || 1e-6;
        var f = (d - rest) / (d * ws);
        a.x += dx * f * a.w; a.y += dy * f * a.w;
        b.x -= dx * f * b.w; b.y -= dy * f * b.w;
      }
    }
  }

  function spinStep(s, target, dt, drive) {
    s.v += (-(s.a - target) * 18 - s.v * 3.2 + drive) * dt;
    s.a += s.v * dt;
  }

  function swingAngle(top, bottom) {
    return Math.atan2(bottom.x - top.x, bottom.y - top.y);
  }

  /* ---------- tokens ---------- */
  function token(name, fallback) {
    var v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return v || fallback;
  }

  function drawZigzag(ctx, x, w, len) {
    var amp = w * 0.22, step = w * 0.32, mid = w * 0.5;
    ctx.beginPath();
    ctx.moveTo(x, mid);
    var up = true;
    for (var i = step; i <= len; i += step) {
      ctx.lineTo(x + i, mid + (up ? -amp : amp));
      up = !up;
    }
    ctx.stroke();
  }

  function makeStrap(length, width, dpr, o) {
    var c = document.createElement('canvas');
    c.width = Math.max(1, Math.round(width * dpr));
    c.height = Math.max(1, Math.round(length * dpr));
    var ctx = c.getContext('2d');
    ctx.setTransform(0, dpr, -dpr, 0, c.width, 0);
    ctx.fillStyle = o.color;
    ctx.fillRect(0, 0, length, width);
    ctx.strokeStyle = ctx.fillStyle = o.ink;

    if (!o.plain) {
      ctx.save();
      ctx.beginPath(); ctx.rect(0, 0, length, width); ctx.clip();
      ctx.textBaseline = 'middle';
      var textFont = 'italic 600 ' + Math.round(width * 0.42) + 'px ' + o.bodyFont;
      var labelFont = '400 ' + Math.round(width * 0.5) + 'px ' + o.displayFont;
      ctx.font = textFont; var textW = ctx.measureText(o.text).width;
      ctx.font = labelFont; var labelW = ctx.measureText(o.label).width;
      var gap = width * 0.6, x = width * 0.4;
      ctx.lineWidth = Math.max(1.2, width * 0.07);
      ctx.lineJoin = 'miter';
      while (x < length) {
        ctx.globalAlpha = 0.9;
        drawZigzag(ctx, x, width, width * 1.9);
        x += width * 1.9 + gap;
        ctx.globalAlpha = 1;
        ctx.font = textFont;
        ctx.fillText(o.text, x, width * 0.52);
        x += textW + gap;
        if (o.label) {
          ctx.font = labelFont;
          ctx.fillText('·  ' + o.label + '  ·', x, width * 0.55);
          x += labelW + ctx.measureText('·    ·').width + gap;
        }
      }
      ctx.restore();
    }
    ctx.globalAlpha = 0.35; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 1.5); ctx.lineTo(length, 1.5);
    ctx.moveTo(0, width - 1.5); ctx.lineTo(length, width - 1.5);
    ctx.stroke();
    return c;
  }

  function el(tag, cls) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    return n;
  }

  /* ---------- componente ---------- */
  function mount(root, opts) {
    opts = opts || {};
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    root.classList.add('escarapela');
    root.textContent = '';

    var canvas = el('canvas', 'escarapela__canvas');
    canvas.setAttribute('aria-hidden', 'true');
    var card = el('div', 'escarapela__card');
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', opts.ariaLabel || 'Escarapela ZAG. Arrástrala para moverla; presiona para darle la vuelta.');
    card.setAttribute('aria-pressed', 'false');
    var clip = el('div', 'escarapela__clip');
    clip.setAttribute('aria-hidden', 'true');
    var inner = el('div', 'escarapela__inner');
    var faceF = el('div', 'escarapela__face escarapela__face--front');
    var faceB = el('div', 'escarapela__face escarapela__face--back');
    if (opts.front) faceF.appendChild(opts.front);
    if (opts.back) faceB.appendChild(opts.back);
    [faceF, faceB].forEach(function (f) {
      f.appendChild(el('div', 'escarapela__slot'));
      f.appendChild(el('div', 'escarapela__shade'));
    });
    inner.appendChild(faceF); inner.appendChild(faceB);
    card.appendChild(clip); card.appendChild(inner);
    root.appendChild(canvas); root.appendChild(card);

    var ctx = canvas.getContext('2d');
    var cw, ch, ringR, clipH, sw, lowLen, arm;
    var N = 14, STEP = 1 / 120, GRAVITY = 2400, ITER = 18;
    var pts = [], links = [], left = [], right = [], low = [];
    var iB = 0, iT = 0, iC = 0, strandRest = 1, dpr = 1, W = 1, H = 1;
    var strapTex = null, plainTex = null;
    var spin = { a: 0, v: 0 }, spinTarget = 0;

    function sizeCard() {
      var max = opts.cardWidth || 240;
      cw = Math.round(Math.min(max, root.clientWidth * 0.58));
      ch = Math.round(cw * 1.5);
      ringR = Math.max(7, Math.round(cw * 0.036));
      clipH = Math.round(cw * 0.1);
      sw = Math.max(14, Math.round(cw * 0.1));
      lowLen = sw * 2.2;
      arm = ringR * 2 + clipH + ch * 0.55;
      card.style.width = cw + 'px';
      card.style.height = (ch + ringR + clipH) + 'px';
      card.style.setProperty('--s', (cw / 240).toFixed(4));
      inner.style.top = (ringR + clipH * 0.6) + 'px';
      inner.style.height = ch + 'px';
      clip.style.width = (cw * 0.075) + 'px';
      clip.style.height = (clipH + cw * 0.05) + 'px';
    }

    function add(x, y, w) { pts.push({ x: x, y: y, px: x, py: y, w: w }); return pts.length - 1; }
    function strand(from, to, n, slack) {
      var a = pts[from], b = pts[to];
      var rest = (Math.hypot(b.x - a.x, b.y - a.y) * slack) / n;
      var ids = [from];
      for (var i = 1; i < n; i++) ids.push(add(a.x + ((b.x - a.x) * i) / n, a.y + ((b.y - a.y) * i) / n, 1));
      ids.push(to);
      for (var j = 0; j < n; j++) links.push([ids[j], ids[j + 1], rest]);
      return { ids: ids, rest: rest };
    }

    function build(enter) {
      sizeCard();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = Math.max(1, root.clientWidth);
      H = Math.max(1, root.clientHeight);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      pts = []; links = [];
      var cx = W / 2;
      var spread = Math.min(W * 0.16, cw * 0.55);
      var top = -sw * 2;
      var bY = Math.max(H * 0.16, Math.min(H * 0.42, H - (lowLen + ringR * 2 + clipH + ch) - 28));
      var aL = add(cx - spread, top, 0);
      iB = add(cx, bY, 1.4);
      var l = strand(aL, iB, N, 1.03);
      var aR = add(cx + spread, top, 0);
      var r = strand(aR, iB, N, 1.03);
      iT = add(cx, bY + lowLen, 0.8);
      var lo = strand(iB, iT, 3, 1);
      iC = add(cx, bY + lowLen + arm, 0.25);
      links.push([iT, iC, arm]);
      left = l.ids; right = r.ids; low = lo.ids; strandRest = l.rest;

      var o = {
        color: opts.strapColor || token('--color-cta', 'orange'),
        ink: opts.inkColor || token('--color-white', 'white'),
        text: opts.strapText || 'somos zag',
        label: opts.strapLabel || 'COMUNIDAD ZAGGISTA',
        displayFont: token('--font-display-giga', 'Impact, sans-serif'),
        bodyFont: token('--font-body', 'sans-serif')
      };
      strapTex = makeStrap(strandRest * N + 4, sw, dpr, o);
      o.plain = true;
      plainTex = makeStrap(lowLen + 4, sw * 0.8, dpr, o);

      if (reduced || !enter) {
        for (var i = 0; i < 900; i++) { integrate(pts, STEP, GRAVITY, 0.98); solve(pts, links, ITER); }
      } else {
        pts[iC].x += cw * 0.55;
        pts[iC].px = pts[iC].x - 2;
        spin.v = 5;
      }
    }

    function ribbon(ids, tex, rest, light) {
      var Wt = tex.width;
      for (var i = 0; i < ids.length - 1; i++) {
        var a = pts[ids[i]], b = pts[ids[i + 1]];
        var dx = (b.x - a.x) * dpr, dy = (b.y - a.y) * dpr;
        var len = Math.hypot(dx, dy) || 1e-6;
        var tx = dx / len, ty = dy / len;
        var nx = ty, ny = -tx;
        var v0 = i * rest * dpr, dv = rest * dpr, k = len / dv;
        ctx.setTransform(nx, ny, tx * k, ty * k, a.x * dpr - (nx * Wt) / 2 - tx * k * v0, a.y * dpr - (ny * Wt) / 2 - ty * k * v0);
        var src = Math.min(dv + 1.5, tex.height - v0);
        if (src > 0) ctx.drawImage(tex, 0, v0, Wt, src, 0, v0, Wt, src);
        var shade = 0.22 * (1 - Math.max(0, nx * light));
        ctx.fillStyle = 'rgba(0,0,0,' + shade.toFixed(3) + ')';
        ctx.fillRect(0, v0, Wt, dv + 1);
      }
    }

    function metal(x0, y0, x1, y1) {
      var g = ctx.createLinearGradient(x0, y0, x1, y1);
      g.addColorStop(0, 'rgb(244,239,228)');
      g.addColorStop(0.45, 'rgb(185,176,160)');
      g.addColorStop(0.55, 'rgb(143,135,120)');
      g.addColorStop(1, 'rgb(236,230,218)');
      return g;
    }

    function rrect(x, y, w, h, r) {
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(x, y, w, h, r);
      else ctx.rect(x, y, w, h);
    }

    function draw() {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (!strapTex || !plainTex) return;
      ribbon(left, strapTex, strandRest, -1);
      ribbon(right, strapTex, strandRest, 1);
      ribbon(low, plainTex, lowLen / 3, 0);

      var B = pts[iB], T = pts[iT];
      var ang = Math.atan2(T.x - B.x, T.y - B.y);
      var u = sw / 20;
      ctx.setTransform(dpr, 0, 0, dpr, B.x * dpr, B.y * dpr);
      ctx.rotate(-ang);
      ctx.shadowColor = 'rgba(0,0,0,0.3)'; ctx.shadowBlur = 6 * dpr; ctx.shadowOffsetY = 2 * dpr;
      ctx.fillStyle = metal(-16 * u, 0, 16 * u, 0);
      rrect(-15 * u, -14 * u, 30 * u, 17 * u, 3 * u); ctx.fill();
      rrect(-11 * u, 1 * u, 22 * u, 15 * u, [2 * u, 2 * u, 6 * u, 6 * u]); ctx.fill();
      ctx.shadowColor = 'transparent';
      ctx.fillStyle = 'rgba(40,36,30,0.55)';
      ctx.fillRect(-10 * u, -9 * u, 20 * u, 2.2 * u);
      ctx.fillRect(-5 * u, 6 * u, 10 * u, 3 * u);
      ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 0.8 * u;
      ctx.beginPath(); ctx.moveTo(-13 * u, -12.5 * u); ctx.lineTo(13 * u, -12.5 * u); ctx.stroke();

      ctx.setTransform(dpr, 0, 0, dpr, T.x * dpr, (T.y + ringR * 0.8) * dpr);
      ctx.lineWidth = Math.max(2.5, ringR * 0.38);
      ctx.strokeStyle = metal(-ringR, -ringR, ringR, ringR);
      ctx.beginPath(); ctx.arc(0, 0, ringR, 0, Math.PI * 2); ctx.stroke();
    }

    function place() {
      var T = pts[iT], C = pts[iC];
      var swing = swingAngle(T, C);
      card.style.transform = 'translate3d(' + (T.x - cw / 2).toFixed(2) + 'px,' + (T.y + ringR).toFixed(2) + 'px,0) rotate(' + (-swing).toFixed(4) + 'rad)';
      inner.style.transform = 'perspective(1100px) rotateY(' + spin.a.toFixed(4) + 'rad)';
      var edge = 1 - Math.abs(Math.cos(spin.a));
      inner.style.setProperty('--esc-dim', (edge * 0.5).toFixed(3));
      inner.style.setProperty('--esc-shine', (50 + Math.sin(spin.a) * 70 + swing * 90).toFixed(1) + '%');
    }

    /* ---------- interacción ---------- */
    var drag = null;
    function local(e) { var r = root.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
    function flip() {
      spinTarget = spinTarget === 0 ? Math.PI : 0;
      card.setAttribute('aria-pressed', String(spinTarget !== 0));
      if (reduced) { spin.a = spinTarget; spin.v = 0; place(); }
      else wake();
    }
    card.addEventListener('pointerdown', function (e) {
      if (e.button > 0) return;
      var p = local(e), T = pts[iT];
      drag = { id: e.pointerId, ox: T.x - p[0], oy: T.y - p[1], tx: T.x, ty: T.y, sx: p[0], sy: p[1], moved: false };
      pts[iT].w = 0;
      card.setPointerCapture(e.pointerId);
      card.classList.add('is-grabbing');
      wake();
    });
    card.addEventListener('pointermove', function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      var p = local(e);
      drag.tx = p[0] + drag.ox; drag.ty = p[1] + drag.oy;
      if (Math.hypot(p[0] - drag.sx, p[1] - drag.sy) > 5) drag.moved = true;
    });
    function up(e) {
      if (!drag || e.pointerId !== drag.id) return;
      if (!drag.moved) flip();
      drag = null;
      pts[iT].w = 0.8;
      card.classList.remove('is-grabbing');
      if (reduced) {
        for (var i = 0; i < 900; i++) { integrate(pts, STEP, GRAVITY, 0.98); solve(pts, links, ITER); }
        draw(); place();
      }
    }
    card.addEventListener('pointerup', up);
    card.addEventListener('pointercancel', up);
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); }
    });

    /* ---------- bucle ---------- */
    var raf = 0, acc = 0, last = 0, t = 0, visible = false, entered = false;
    function tick(now) {
      acc += Math.min(0.05, (now - last) / 1000);
      last = now;
      var steps = 0;
      while (acc >= STEP && steps < 8) {
        acc -= STEP; steps++; t += STEP;
        if (drag) {
          var T = pts[iT];
          T.px = T.x; T.py = T.y;
          T.x += (drag.tx - T.x) * 0.35;
          T.y += (drag.ty - T.y) * 0.35;
        }
        var C = pts[iC];
        if (!reduced && !drag) C.x += (22 * Math.sin(t * 0.7) + 12 * Math.sin(t * 1.9)) * STEP * STEP;
        integrate(pts, STEP, GRAVITY, 0.992);
        solve(pts, links, ITER);
        var vx = (C.x - C.px) / STEP;
        spinStep(spin, spinTarget, STEP, vx * 0.03 + (reduced ? 0 : 0.6 * Math.sin(t * 0.5)));
      }
      draw(); place();
      raf = (visible && !reduced) || drag ? requestAnimationFrame(tick) : 0;
    }
    function wake() {
      if (raf) return;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    }

    function start() {
      build(false);
      draw(); place();
      var io = new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        if (visible && !entered) { entered = true; build(true); }
        if (visible && !reduced) wake();
      }, { threshold: 0.25 });
      io.observe(root);
      var ro = new ResizeObserver(function () {
        if (Math.abs(root.clientWidth - W) < 1 && Math.abs(root.clientHeight - H) < 1) return;
        build(false); draw(); place();
      });
      ro.observe(root);
    }

    if (document.fonts && document.fonts.ready) document.fonts.ready.then(start);
    else start();

    return { flip: flip };
  }

  /* ---------- caras ZAG ---------- */
  function zagFaces(info) {
    info = info || {};
    var front = el('div', 'esc-front');
    front.appendChild(el('div', 'esc-front__pattern'));
    var eb = el('p', 'esc-front__eyebrow'); eb.textContent = 'Portal ZAG · EAM · 30 años';
    var logo = el('p', 'esc-front__logo');
    logo.appendChild(document.createTextNode('ZA'));
    var g = el('span'); g.textContent = 'G'; logo.appendChild(g);
    var sub = el('p', 'esc-front__sub'); sub.textContent = 'Comunidad zaggista';
    var NS = 'http://www.w3.org/2000/svg';
    var zig = document.createElementNS(NS, 'svg');
    zig.setAttribute('class', 'esc-front__zig'); zig.setAttribute('viewBox', '0 0 200 18');
    zig.setAttribute('preserveAspectRatio', 'none'); zig.setAttribute('aria-hidden', 'true');
    var path = document.createElementNS(NS, 'path');
    path.setAttribute('d', 'M0 15 L20 3 L40 15 L60 3 L80 15 L100 3 L120 15 L140 3 L160 15 L180 3 L200 15');
    path.setAttribute('fill', 'none'); path.setAttribute('stroke', 'currentColor'); path.setAttribute('stroke-width', '3');
    zig.appendChild(path);
    front.appendChild(eb); front.appendChild(logo); front.appendChild(sub); front.appendChild(zig);

    var back = el('div', 'esc-back');
    var lab = el('p', 'esc-back__label'); lab.textContent = info.nombre ? 'Zaggista' : 'Este espacio es tuyo';
    var name = el('p', 'esc-back__name'); name.textContent = info.nombre || 'Tu nombre aquí';
    var lvl = el('span', 'esc-back__level'); lvl.textContent = info.nivelNombre || 'Muy pronto: Rookie';
    if (info.nivelBg) back.style.setProperty('--esc-level-bg', info.nivelBg);
    if (info.nivelFg) back.style.setProperty('--esc-level-fg', info.nivelFg);
    var band = el('div', 'esc-back__band');
    var st = el('strong');
    st.appendChild(document.createTextNode('SOMOS '));
    var z = el('span'); z.textContent = 'ZAG'; st.appendChild(z);
    var sm = el('small'); sm.textContent = 'Publicidad Digital y Mercadeo';
    band.appendChild(st); band.appendChild(sm);
    back.appendChild(lab); back.appendChild(name); back.appendChild(lvl); back.appendChild(band);
    return { front: front, back: back };
  }

  window.ZAGEscarapela = { mount: mount, zagFaces: zagFaces, _physics: { integrate: integrate, solve: solve, spinStep: spinStep, swingAngle: swingAngle } };
})();
