/* ============================================================
   GALERIA — os desenhos do "sobre mim", em três fileiras num plano
   em perspectiva (o plano e a inclinação ficam no CSS).

   · Cada fileira anda sozinha (1ª e 3ª para a esquerda, a do meio
     para a direita). O movimento é feito aqui, quadro a quadro, para
     dar para parar, arrastar e arremessar.
   · Mouse em cima de um quadro: só aquela fileira para e o quadro
     vem para a frente. Clique: abre o desenho em tela cheia, colorido.
   · Segurar e arrastar uma fileira move ela; soltar rápido arremessa,
     e a fileira desacelera até voltar ao ritmo e ao sentido normais.
   · No celular: tocar abre, arrastar para o lado move a fileira e
     arrastar para cima/baixo continua rolando a página.

   Os desenhos vêm de PF.art (js/data.js).
   ============================================================ */
(function () {
  'use strict';

  var art = (window.PF || {}).art || {};
  var gallery = document.getElementById('gallery');
  var plane = document.getElementById('galleryPlane');
  if (!gallery || !plane || !(art.rows || []).length) return;

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var SPEED = reduce ? 0 : 30;      // px/s, velocidade normal das fileiras
  var DRAG_K = 1.15;                // a perspectiva encurta o plano: compensa no arrasto
  var MOVE_TOL = 6;                 // até 6 px ainda conta como clique, não arrasto
  var MAX_V = 4000;                 // limite do arremesso, px/s
  var HOVER_MAX_V = 400;            // arremesso forte não é freado só por passar o mouse

  /* ---- montagem ---- */
  var items = [];                   // todos os desenhos, sem repetição (para a tela cheia)
  var rows = [];

  art.rows.forEach(function (row, r) {
    if (!row.length) return;
    var first = items.length;
    row.forEach(function (it) { items.push(it); });

    var track = document.createElement('div');
    track.className = 'gallery__row';
    // repete os desenhos até ter pelo menos 6 e duplica tudo: o loop anda meia trilha sem emenda
    var set = [];
    while (set.length < 6) set = set.concat(row.map(function (it, k) { return first + k; }));
    var all = set.concat(set);
    all.forEach(function (idx, k) {
      var it = items[idx], copy = k >= row.length;
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'gallery__tile';
      b.setAttribute('data-i', idx);
      if (copy) { b.setAttribute('aria-hidden', 'true'); b.tabIndex = -1; }
      else b.setAttribute('aria-label', 'Ver em tela cheia: ' + (it.alt || 'desenho'));
      var img = document.createElement('img');
      img.src = it.img; img.alt = ''; img.loading = 'lazy'; img.decoding = 'async'; img.draggable = false;
      b.appendChild(img);
      track.appendChild(b);
    });
    plane.appendChild(track);

    var dir = r % 2 ? 1 : -1;       // a do meio vai no sentido contrário
    var base = dir * SPEED * (1 - r * 0.12);
    rows.push({
      el: track, tiles: track.children, n: set.length,
      x: 0, v: base, base: base, half: 0,
      mode: 'run',                  // run | hover | drag | coast
      drag: null
    });
  });

  function measure() {              // largura de meia trilha = onde começa a cópia
    rows.forEach(function (R) {
      var a = R.tiles[0], b = R.tiles[R.n];
      R.half = b && a ? b.offsetLeft - a.offsetLeft : 0;
      if (R.half && !R.placed) { R.x = R.base > 0 ? -R.half * 0.5 : -R.half * 0.15; R.placed = true; }
    });
  }
  function wrap(R) {
    if (!R.half) return;
    R.x = ((R.x % R.half) + R.half) % R.half - R.half;   // fica em [-half, 0)
  }
  function paint(R) { R.el.style.transform = 'translate3d(' + R.x.toFixed(2) + 'px,0,0)'; }
  function rowOf(el) {
    for (var i = 0; i < rows.length; i++) if (rows[i].el === el) return rows[i];
    return null;
  }

  /* ---- quadro em destaque ---- */
  var front = null;
  function setFront(tile) {
    if (tile === front) return;
    if (front) {
      front.classList.remove('is-front');
      var old = rowOf(front.parentNode);
      if (old) { old.el.classList.remove('is-hover'); if (old.mode === 'hover') old.mode = 'run'; }
    }
    front = tile;
    if (!tile) return;
    var R = rowOf(tile.parentNode);
    tile.classList.add('is-front');
    R.el.classList.add('is-hover');
    R.mode = 'hover';
  }

  var dragging = null;              // a fileira sendo arrastada, se houver
  var mouse = { x: 0, y: 0, in: false };

  /* as pontas do plano esmaecem (mask-image no CSS, de 0–7% e de 72–92% da largura):
     um quadro ali quase transparente não conta como "debaixo do mouse" */
  var SEEN_FROM = 0.05, SEEN_TO = 0.84;
  function seen(tile, x) {
    var R = rowOf(tile.parentNode), r = tile.getBoundingClientRect();
    if (!R || !r.width) return false;
    var inTile = (x - r.left) / r.width * tile.offsetWidth;          // posição dentro do quadro, sem perspectiva
    var f = (tile.offsetLeft + R.x + inTile) / plane.offsetWidth;    // fração da largura do plano
    return f > SEEN_FROM && f < SEEN_TO;
  }

  function hoverAt(x, y) {          // o quadro debaixo do mouse agora (as fileiras andam sozinhas)
    if (dragging || lb.open) return;
    var el = document.elementFromPoint(x, y);
    var tile = el && el.closest ? el.closest('.gallery__tile') : null;   // vão entre quadros não conta
    if (tile && (!gallery.contains(tile) || !seen(tile, x))) tile = null;
    if (tile) {
      var R = rowOf(tile.parentNode);
      if (R.mode === 'coast' && Math.abs(R.v) > HOVER_MAX_V) return;
    }
    setFront(tile);
  }

  gallery.addEventListener('pointermove', function (e) {
    if (e.pointerType !== 'mouse') return;
    mouse.x = e.clientX; mouse.y = e.clientY; mouse.in = true;
    hoverAt(e.clientX, e.clientY);
  });
  gallery.addEventListener('pointerleave', function (e) {
    if (e.pointerType !== 'mouse') return;
    mouse.in = false;
    if (!dragging) setFront(null);
  });

  /* ---- arrastar e arremessar ---- */
  rows.forEach(function (R) {
    R.el.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      setFront(null);
      dragging = R;
      R.mode = 'drag';
      var hit = e.target.closest('.gallery__tile');
      R.drag = {
        id: e.pointerId, x0: e.clientX, last: e.clientX, moved: false,
        tile: hit && seen(hit, e.clientX) ? hit : null,      // quadro esmaecido na ponta não abre
        samples: [{ t: e.timeStamp, x: e.clientX }]
      };
      try { R.el.setPointerCapture(e.pointerId); } catch (err) { /* sem captura, segue igual */ }
      R.el.classList.add('is-drag');
      if (e.pointerType === 'mouse') e.preventDefault();   // sem seleção de texto
    });

    R.el.addEventListener('pointermove', function (e) {
      var d = R.drag;
      if (!d || e.pointerId !== d.id) return;
      var dx = e.clientX - d.last;
      d.last = e.clientX;
      if (!d.moved && Math.abs(e.clientX - d.x0) > MOVE_TOL) d.moved = true;
      R.x += dx * DRAG_K;
      wrap(R); paint(R);
      d.samples.push({ t: e.timeStamp, x: e.clientX });
      while (d.samples.length > 2 && e.timeStamp - d.samples[0].t > 100) d.samples.shift();
    });

    function end(e, cancelled) {
      var d = R.drag;
      if (!d || e.pointerId !== d.id) return;
      R.drag = null; dragging = null;
      R.el.classList.remove('is-drag');
      try { R.el.releasePointerCapture(e.pointerId); } catch (err) { /* já solto */ }

      if (!d.moved && !cancelled) {               // foi um clique/toque: abre o desenho
        R.mode = 'run';
        if (d.tile) open(+d.tile.getAttribute('data-i'), d.tile);
        return;
      }
      // velocidade de saída: as amostras dos últimos ~100 ms; parou antes de soltar = sem arremesso
      var s = d.samples, a = s[0], b = s[s.length - 1], v = 0;
      if (s.length > 1 && b.t > a.t && e.timeStamp - b.t < 80) v = (b.x - a.x) / (b.t - a.t) * 1000 * DRAG_K;
      R.v = Math.max(-MAX_V, Math.min(MAX_V, v));
      R.mode = 'coast';
      if (e.pointerType === 'mouse') hoverAt(e.clientX, e.clientY);
      start();
    }
    R.el.addEventListener('pointerup', function (e) { end(e, false); });
    R.el.addEventListener('pointercancel', function (e) { end(e, true); });   // o navegador assumiu a rolagem

    // o clique nativo do botão só serve para teclado (Enter/Espaço); mouse e toque abrem no pointerup
    R.el.addEventListener('click', function (e) {
      var tile = e.target.closest('.gallery__tile');
      if (e.detail === 0 && tile) open(+tile.getAttribute('data-i'), tile);
    });
  });
  plane.addEventListener('dragstart', function (e) { e.preventDefault(); });

  /* ---- teclado: Tab chega num quadro, a fileira para e traz ele para a área visível ---- */
  plane.addEventListener('focusin', function (e) {
    var tile = e.target.closest('.gallery__tile');
    if (!tile || !tile.matches(':focus-visible')) return;
    setFront(tile);
    var R = rowOf(tile.parentNode), g = gallery.getBoundingClientRect(), t = tile.getBoundingClientRect();
    var lo = g.left + g.width * 0.12, hi = g.left + g.width * 0.62;
    if (t.left < lo) R.x += (lo - t.left) * DRAG_K;
    else if (t.right > hi) R.x -= (t.right - hi) * DRAG_K;
    wrap(R); paint(R);
  });
  plane.addEventListener('focusout', function (e) {
    if (front && e.target === front) setFront(null);
  });

  /* ---- o laço: só roda com a galeria na tela, a aba visível e a tela cheia fechada ---- */
  var visible = false, running = false, lastT = 0, frame = 0;
  function tick(now) {
    if (!visible || document.hidden || lb.open) { running = false; return; }
    var dt = Math.min(0.05, (now - lastT) / 1000 || 0);
    lastT = now;
    rows.forEach(function (R) {
      if (R.mode === 'drag') return;
      if (R.mode === 'hover') R.v *= Math.exp(-dt / 0.18);
      else if (R.mode === 'coast') {
        R.v = R.base + (R.v - R.base) * Math.exp(-dt / 0.9);
        if (Math.abs(R.v - R.base) < 2) R.mode = 'run';
      } else R.v = R.base + (R.v - R.base) * Math.exp(-dt / 0.5);
      R.x += R.v * dt;
      wrap(R); paint(R);
    });
    // a fileira anda por baixo do mouse parado: confere de vez em quando o que está sob ele
    if (mouse.in && ++frame % 6 === 0) hoverAt(mouse.x, mouse.y);
    requestAnimationFrame(tick);
  }
  function start() {
    if (running || !visible || document.hidden || lb.open) return;
    running = true; lastT = performance.now();
    requestAnimationFrame(tick);
  }
  new IntersectionObserver(function (es) { visible = es[0].isIntersecting; start(); }, { threshold: 0 }).observe(gallery);
  document.addEventListener('visibilitychange', start);
  if (window.ResizeObserver) new ResizeObserver(function () { measure(); rows.forEach(function (R) { wrap(R); paint(R); }); }).observe(gallery);
  window.addEventListener('load', measure);
  measure();
  rows.forEach(paint);

  /* ============================================================
     TELA CHEIA
     ============================================================ */
  var lb = document.getElementById('lb') || { open: false };
  var lbImg = document.getElementById('lbImg'), lbCap = document.getElementById('lbCap'), lbN = document.getElementById('lbN');
  var lbLink = document.getElementById('lbLink');
  var cur = 0, from = null;
  var pad = function (n) { return (n < 10 ? '0' : '') + n; };

  function show(i, dir) {
    cur = (i + items.length) % items.length;
    var it = items[cur];
    lbImg.classList.remove('is-in', 'is-l', 'is-r');
    void lbImg.offsetWidth;                         // reinicia a animação de troca
    lbImg.src = it.img;
    lbImg.alt = it.alt || '';
    lbImg.classList.add(dir < 0 ? 'is-l' : dir > 0 ? 'is-r' : 'is-in');
    lbCap.textContent = it.alt || '';
    lbN.textContent = pad(cur + 1) + ' / ' + pad(items.length);
    [cur + 1, cur - 1].forEach(function (k) { new Image().src = items[(k + items.length) % items.length].img; });
  }
  function open(i, tile) {
    if (!lb.showModal) return;
    from = tile || null;
    setFront(null);
    if (art.link) { lbLink.href = art.link; lbLink.hidden = false; } else lbLink.hidden = true;
    show(i, 0);
    document.documentElement.classList.add('is-lb');
    lb.showModal();
    document.getElementById('lbClose').focus({ preventScroll: true });
  }
  if (lb.showModal) {
    document.getElementById('lbPrev').addEventListener('click', function () { show(cur - 1, -1); });
    document.getElementById('lbNext').addEventListener('click', function () { show(cur + 1, 1); });
    document.getElementById('lbClose').addEventListener('click', function () { lb.close(); });
    lb.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { show(cur - 1, -1); e.preventDefault(); }
      else if (e.key === 'ArrowRight') { show(cur + 1, 1); e.preventDefault(); }
    });
    // clique no fundo (fora da imagem e dos botões) fecha
    lb.addEventListener('click', function (e) {
      if (e.target === lb || e.target.classList.contains('lb__stage')) lb.close();
    });
    // arrastar a imagem para o lado troca de desenho
    var sx = null, sy = 0;
    lbImg.addEventListener('pointerdown', function (e) { sx = e.clientX; sy = e.clientY; });
    lbImg.addEventListener('pointerup', function (e) {
      if (sx === null) return;
      var dx = e.clientX - sx, dy = e.clientY - sy; sx = null;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) show(cur + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
    });
    lbImg.addEventListener('pointercancel', function () { sx = null; });
    lbImg.addEventListener('dragstart', function (e) { e.preventDefault(); });
    lb.addEventListener('close', function () {
      document.documentElement.classList.remove('is-lb');
      if (from) from.focus({ preventScroll: true });   // o foco volta para o quadro de onde saiu
      from = null;
      start();
    });
  }
})();
