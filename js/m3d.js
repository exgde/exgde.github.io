/* ============================================================
   03 · MODELAGEM 3D

   · À direita, o soldado do WW1-Thriller com a escopeta: 36 quadros renderizados
     no Blender, guardados numa folha só (assets/m3d/soldier-turn.webp, 9 x 4).
     Fica um tempo de frente, dá uma volta sozinho; arrastar gira na mão.
   · À esquerda, a cabeça do soldado tático (assets/m3d/head.webp).
   · Nada aqui é imagem pronta de pontilhado: cada peça é um render em tons
     de cinza e os pontos são desenhados na hora, na cor do texto. Por isso
     o "inverter" funciona sem precisar de uma segunda versão das imagens.

   Os textos ficam em js/data.js (PF.m3d / PF_EN.m3d).
   ============================================================ */
(function () {
  'use strict';

  var sec = document.getElementById('m3d');
  if (!sec) return;
  var PF = window.PF || {};
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- textos ---- */
  function $(id) { return document.getElementById(id); }
  function paintText() {
    var d = PF.m3d || {};
    if ($('m3dK')) $('m3dK').textContent = d.kicker || '';
    var t = $('m3dT');
    if (t) {
      t.textContent = '';
      (d.title || []).forEach(function (w, i) {
        var s = document.createElement('span');
        s.textContent = w; t.appendChild(s);
        if (i < d.title.length - 1) t.appendChild(document.createTextNode(' '));
      });
    }
    if ($('m3dLead')) $('m3dLead').textContent = d.lead || '';
    var ul = $('m3dList');
    if (ul) {
      ul.textContent = '';
      (d.list || []).forEach(function (line) {
        var li = document.createElement('li'); li.textContent = line; ul.appendChild(li);
      });
    }
    if ($('m3dMeta')) $('m3dMeta').textContent = d.meta || '';
    if ($('m3dHint')) $('m3dHint').textContent = d.hint || '';
    var lab = d.labels || {};
    [].forEach.call(sec.querySelectorAll('[data-lab]'), function (el) {
      el.textContent = lab[el.getAttribute('data-lab')] || '';
    });
    var hero = $('m3dHero');
    if (hero) hero.setAttribute('aria-label', d.heroAlt || '');
  }
  paintText();
  document.addEventListener('pf:lang', paintText);

  /* ---- pontilhado ---- */
  var CELL = 4, CELL_SMALL = 3.2;                  // tamanho da célula, em px de CSS (peças menores: pontos menores)
  function inverted() { return document.body.classList.contains('is-invert'); }
  // --fg troca na hora; a cor computada do texto passa por uma transição e ainda viria com o tom antigo
  function ink() { return getComputedStyle(document.body).getPropertyValue('--fg').trim() || (inverted() ? '#000' : '#fff'); }
  function sm(t) { t = t < 0 ? 0 : t > 1 ? 1 : t; return t * t * (3 - 2 * t); }

  var tiny = document.createElement('canvas');
  var tctx = tiny.getContext('2d', { willReadFrequently: true });

  /* Desenha em `cv` a região (sx, sy, sw, sh) de `img` como pontos.
     photo: 0 = só pontos; 1 = o render aparece em cima e vira pontos embaixo. */
  function draw(cv, img, sx, sy, sw, sh, photo, cell) {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var cw = cv.clientWidth, ch = cv.clientHeight;
    if (!cw || !ch) return;
    var W = Math.round(cw * dpr), H = Math.round(ch * dpr);
    if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
    var c = cv.getContext('2d');
    c.clearRect(0, 0, W, H);

    var cols = Math.max(4, Math.round(cw / cell)), rows = Math.max(4, Math.round(ch / cell));
    if (tiny.width !== cols || tiny.height !== rows) { tiny.width = cols; tiny.height = rows; }
    tctx.clearRect(0, 0, cols, rows);
    tctx.drawImage(img, sx, sy, sw, sh, 0, 0, cols, rows);      // cada pixel = a média de uma célula
    var px = tctx.getImageData(0, 0, cols, rows).data;

    if (photo) {
      c.drawImage(img, sx, sy, sw, sh, 0, 0, W, H);
      var g = c.createLinearGradient(0, 0, 0, H);               // das coxas para baixo o render some
      g.addColorStop(0, '#000'); g.addColorStop(.62, '#000'); g.addColorStop(.92, 'rgba(0,0,0,0)');
      c.globalCompositeOperation = 'destination-in';
      c.fillStyle = g; c.fillRect(0, 0, W, H);
      c.globalCompositeOperation = 'source-over';
    }

    var inv = inverted(), cwp = W / cols, chp = H / rows, R = Math.min(cwp, chp) * .56;
    c.fillStyle = ink();
    c.beginPath();
    for (var y = 0; y < rows; y++) {
      var v = (y + .5) / rows;
      var k = photo ? 1 - (1 - sm((v - .62) / .30)) * .88 : 1;   // em cima do render, pontos bem pequenos
      for (var x = 0; x < cols; x++) {
        var i = (y * cols + x) * 4, a = px[i + 3] / 255;
        if (a < .04) continue;
        var L = px[i] / 255;
        var s = Math.pow((inv ? 1 - L : L) * a, .85) * k;
        if (s < .07) continue;
        var cx = (x + .5) * cwp, cy = (y + .5) * chp;
        c.moveTo(cx + R * s, cy);
        c.arc(cx, cy, R * s, 0, 6.2832);
      }
    }
    c.fill();
  }

  /* ---- peças paradas ---- */
  var pieces = [];
  [].forEach.call(sec.querySelectorAll('canvas[data-dots]'), function (cv) {
    pieces.push({ cv: cv, src: cv.getAttribute('data-dots'), img: null });
  });
  function drawPiece(p) { if (p.img) draw(p.cv, p.img, 0, 0, p.img.naturalWidth, p.img.naturalHeight, 0, CELL); }

  /* ---- o soldado girando ---- */
  var FW = 380, FH = 440, COLS = 9, N = 36;
  var hero = $('m3dHero'), sheet = null, frame = 0, visible = false, last = 0, held = false;
  var STEP = 110, HOLD = 4200;                     // ms por quadro; no quadro 0 (de frente) ele para um pouco
  function drawHero() {
    if (!sheet || !hero) return;
    var f = ((Math.round(frame) % N) + N) % N;
    draw(hero, sheet, (f % COLS) * FW, Math.floor(f / COLS) * FH, FW, FH, 1, CELL);
  }
  function tick(now) {
    if (!visible || document.hidden) { running = false; return; }
    if (!held && !reduce && now - last >= (Math.round(frame) % N === 0 ? HOLD : STEP)) { last = now; frame = (frame + 1) % N; drawHero(); }
    requestAnimationFrame(tick);
  }
  var running = false;
  function start() { if (!running && visible && !document.hidden && sheet) { running = true; last = performance.now(); requestAnimationFrame(tick); } }

  if (hero) {
    var x0 = 0, f0 = 0;
    hero.addEventListener('pointerdown', function (e) {
      held = true; x0 = e.clientX; f0 = frame;
      try { hero.setPointerCapture(e.pointerId); } catch (err) { /* sem captura: só perde o arrasto fora do canvas */ }
      hero.classList.add('is-held');
    });
    hero.addEventListener('pointermove', function (e) {
      if (!held) return;
      frame = f0 - (e.clientX - x0) / 9;           // 9 px de arrasto = um quadro (10°)
      drawHero();
    });
    var up = function () { held = false; hero.classList.remove('is-held'); frame = ((Math.round(frame) % N) + N) % N; last = performance.now(); };
    hero.addEventListener('pointerup', up);
    hero.addEventListener('pointercancel', up);
    hero.addEventListener('keydown', function (e) {     // setas também giram
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      frame = (frame + (e.key === 'ArrowRight' ? 1 : -1) + N) % N; last = performance.now() + 1500; drawHero();
      e.preventDefault();
    });
  }

  /* ---- carregar só quando a seção estiver chegando ---- */
  function redrawAll() { pieces.forEach(drawPiece); drawHero(); }
  var loaded = false;
  function load() {
    if (loaded) return; loaded = true;
    pieces.forEach(function (p) {
      var im = new Image();
      im.onload = function () { p.img = im; drawPiece(p); p.cv.classList.add('is-on'); };
      im.src = p.src;
    });
    if (hero) {
      var s = new Image();
      s.onload = function () { sheet = s; drawHero(); hero.classList.add('is-on'); start(); };
      s.src = hero.getAttribute('data-sheet');
    }
  }
  new IntersectionObserver(function (es) { if (es[0].isIntersecting) load(); }, { rootMargin: '700px 0px' }).observe(sec);
  new IntersectionObserver(function (es) { visible = es[0].isIntersecting; start(); }, { threshold: .05 }).observe(sec);
  document.addEventListener('visibilitychange', start);

  /* tema e tamanho mudam os pontos */
  new MutationObserver(redrawAll).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  var rz = null;
  window.addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(redrawAll, 120); }, { passive: true });
})();
