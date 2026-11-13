/* ============================================================
   SETA "TEM MAIS PRA BAIXO" — embaixo da capa.

   Feita de pontos redondos, como os recortes (js/art.js): o tamanho de
   cada ponto segue o brilho da forma. Parada, uma onda desce pela seta.
   Ao rolar a página ela se desfaz: cada ponto se solta, se espalha e
   encolhe até sumir, em momentos um pouco diferentes. O efeito segue a
   posição da rolagem, então voltar para o topo remonta a seta.
   ============================================================ */
(function () {
  'use strict';

  var cue = document.querySelector('.cue');
  var cv = cue && cue.querySelector('canvas');
  if (!cv) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- a forma: haste + ponta, numa grade de COLS × ROWS pontos ---- */
  var COLS = 13, ROWS = 19, STEP = 6;         // STEP: px entre pontos
  var PAD = 34;                                // folga para os pontos se espalharem
  var W = COLS * STEP + PAD * 2, H = ROWS * STEP + PAD * 2;

  function segDist(px, py, ax, ay, bx, by) {   // distância do ponto ao segmento
    var dx = bx - ax, dy = by - ay;
    var t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)));
    return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
  }
  function smooth(t) { t = t < 0 ? 0 : t > 1 ? 1 : t; return t * t * (3 - 2 * t); }

  var cx = (COLS - 1) / 2, tipY = ROWS - 1.6;
  var SEGS = [
    [cx, 0, cx, tipY],                           // haste
    [cx, tipY, cx - 4.9, tipY - 5.1],            // ponta, lado esquerdo
    [cx, tipY, cx + 4.9, tipY - 5.1]             // ponta, lado direito
  ];

  var dots = [];
  for (var j = 0; j < ROWS; j++) {
    for (var i = 0; i < COLS; i++) {
      var d = Infinity;
      SEGS.forEach(function (s) { d = Math.min(d, segDist(i, j, s[0], s[1], s[2], s[3])); });
      var v = smooth(1 - d / 1.75);              // traço grosso: ~3 pontos de largura
      if (v < 0.08) continue;
      v *= 0.45 + 0.55 * smooth(j / (ROWS * 0.7));        // a haste nasce apagada e acende em direção à ponta
      if (v < 0.06) continue;
      var a = Math.random() * Math.PI * 2;
      dots.push({
        x: PAD + (i + 0.5) * STEP, y: PAD + (j + 0.5) * STEP, j: j, v: v,
        // para onde se espalha ao desfazer, e quando começa (a ponta por último)
        dx: Math.cos(a), dy: Math.sin(a) * 0.8 - 0.35,
        far: 10 + Math.random() * 24,
        at: Math.random() * 0.45 + (1 - j / ROWS) * 0.15
      });
    }
  }

  /* ---- desenho ---- */
  var g = cv.getContext('2d'), dpr = 1;
  function size() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    cv.style.width = W + 'px'; cv.style.height = H + 'px';
    cue.style.width = W + 'px'; cue.style.height = H + 'px';
    cue.style.marginLeft = (-W / 2) + 'px';
    cue.style.bottom = 'calc(var(--gutter) - ' + (PAD - 6) + 'px)';   // a folga não empurra a seta para cima
  }

  function gone() {                              // 0 = inteira · 1 = desfeita (pela rolagem)
    var p = window.scrollY / (window.innerHeight * 0.22);
    return p < 0 ? 0 : p > 1 ? 1 : p;
  }

  function draw(now) {
    var p = gone(), t = now / 1000;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, W, H);
    g.fillStyle = getComputedStyle(cue).color;
    for (var k = 0; k < dots.length; k++) {
      var o = dots[k];
      var q = smooth((p - o.at) / 0.4);                   // quanto este ponto já se desfez
      if (q >= 1) continue;
      var wave = reduce ? 1 : 0.72 + 0.28 * Math.sin(o.j * 0.55 - t * 3.4);   // onda descendo
      var r = STEP * 0.56 * Math.sqrt(o.v) * wave * Math.pow(1 - q, 1.4);
      if (r < 0.25) continue;
      var e = 1 - Math.pow(1 - q, 2);
      g.beginPath();
      g.arc(o.x + o.dx * o.far * e, o.y + o.dy * o.far * e, r, 0, Math.PI * 2);
      g.fill();
    }
    cue.classList.toggle('is-gone', p >= 1);
    return p;
  }

  /* ---- laço: roda enquanto a seta existe e a aba está visível ---- */
  var running = false;
  function tick(now) {
    var p = draw(now);
    if (p >= 1 || document.hidden || reduce) { running = false; return; }
    requestAnimationFrame(tick);
  }
  function wake() {
    if (running) return;
    if (reduce || gone() >= 1 || document.hidden) { draw(performance.now()); return; }
    running = true;
    requestAnimationFrame(tick);
  }

  size();
  wake();
  window.addEventListener('scroll', wake, { passive: true });
  window.addEventListener('resize', function () { size(); draw(performance.now()); });
  document.addEventListener('visibilitychange', wake);
  // "inverter" troca a cor: com o laço parado (seta desfeita ou movimento reduzido), redesenha
  var inv = document.getElementById('invertToggle');
  if (inv) inv.addEventListener('click', function () { setTimeout(function () { draw(performance.now()); }, 400); });
})();
