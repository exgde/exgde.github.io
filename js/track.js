/* ============================================================
   TRACKING — a camada cinza fina por cima dos recortes.

   Para cada elemento com data-trk: cantoneiras em volta, um rótulo
   TRK_nn com uma "confiança" que oscila e o contorno do recorte
   (calculado em art.js) com nós nos vértices. Mais alguns nós soltos
   vagando pela tela.

   É um único canvas fixo; as posições vêm de getBoundingClientRect,
   então acompanha rolagem e parallax sem saber nada do layout.
   ============================================================ */
(function () {
  'use strict';

  var cv = document.getElementById('trk');
  if (!cv) return;
  var c = cv.getContext('2d');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var COLOR = '#808080';          // cinza médio: lê igual no preto e no branco
  var W = 0, H = 0, dpr = 1;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
  }
  window.addEventListener('resize', resize);
  resize();

  var targets = [].map.call(document.querySelectorAll('[data-trk]'), function (el, i) {
    return { el: el, id: 'TRK_' + (i < 9 ? '0' : '') + (i + 1), conf: '0.950', seed: i * 37.1 };
  });

  var nodes = [];
  for (var k = 0; k < 8; k++) {
    nodes.push({ x: Math.random(), y: Math.random(), ax: 0.03 + Math.random() * 0.05, ay: 0.03 + Math.random() * 0.05, p: Math.random() * 6.28, s: 0.1 + Math.random() * 0.15 });
  }

  function brackets(x, y, w, h) {
    var L = Math.max(6, Math.min(14, w * 0.08));
    c.beginPath();
    c.moveTo(x, y + L); c.lineTo(x, y); c.lineTo(x + L, y);
    c.moveTo(x + w - L, y); c.lineTo(x + w, y); c.lineTo(x + w, y + L);
    c.moveTo(x + w, y + h - L); c.lineTo(x + w, y + h); c.lineTo(x + w - L, y + h);
    c.moveTo(x + L, y + h); c.lineTo(x, y + h); c.lineTo(x, y + h - L);
    c.stroke();
  }

  var frameNo = 0;
  function frame(now) {
    var t = now / 1000;
    frameNo++;
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.clearRect(0, 0, W, H);
    c.strokeStyle = c.fillStyle = COLOR;
    c.lineWidth = 1;
    c.font = '13px VT323, ui-monospace, monospace';
    c.textBaseline = 'alphabetic';

    targets.forEach(function (T) {
      var r = T.el.getBoundingClientRect();
      if (r.width < 12 || r.bottom < 0 || r.top > H || r.right < 0 || r.left > W) return;
      if (frameNo % 24 === 0) T.conf = (0.9 + Math.random() * 0.099).toFixed(3);

      var poly = T.el._contour, x0 = r.left, y0 = r.top, x1 = r.right, y1 = r.bottom, pts = null;
      if (poly) {
        x0 = y0 = Infinity; x1 = y1 = -Infinity;
        pts = poly.map(function (p, i) {
          var j = reduce ? 0 : 0.7;
          var x = r.left + p[0] * r.width + Math.sin(t * 2.1 + T.seed + i * 1.7) * j;
          var y = r.top + p[1] * r.height + Math.cos(t * 1.7 + T.seed + i * 2.3) * j;
          if (x < x0) x0 = x; if (x > x1) x1 = x;
          if (y < y0) y0 = y; if (y > y1) y1 = y;
          return [x, y];
        });
      }
      var m = 6;
      x0 = Math.round(x0 - m) + 0.5; y0 = Math.round(y0 - m) + 0.5;
      var w = Math.round(x1 - x0 + m), h = Math.round(y1 - y0 + m);

      c.globalAlpha = 0.9;
      brackets(x0, y0, w, h);
      c.fillText(T.id + '  ' + T.conf, x0, y0 - 5);

      if (pts) {
        c.globalAlpha = 0.5;
        c.beginPath();
        pts.forEach(function (p, i) { c[i ? 'lineTo' : 'moveTo'](p[0], p[1]); });
        c.closePath(); c.stroke();
        c.globalAlpha = 0.9;
        pts.forEach(function (p, i) { if (i % 3 === 0) c.strokeRect(Math.round(p[0]) - 2.5, Math.round(p[1]) - 2.5, 5, 5); });
      }
    });

    /* nós soltos, ligados dois a dois */
    c.globalAlpha = 0.6;
    var pos = nodes.map(function (n) {
      var d = reduce ? 0 : 1;
      return [(n.x + Math.sin(t * n.s + n.p) * n.ax * d) * W, (n.y + Math.cos(t * n.s * 0.8 + n.p) * n.ay * d) * H];
    });
    pos.forEach(function (p, i) {
      c.beginPath(); c.arc(p[0], p[1], 2.5, 0, 6.2832); c.stroke();
      if (i % 2 === 0 && pos[i + 1]) {
        var q = pos[i + 1], dx = q[0] - p[0], dy = q[1] - p[1];
        if (dx * dx + dy * dy < 0.12 * W * W) { c.beginPath(); c.moveTo(p[0], p[1]); c.lineTo(q[0], q[1]); c.stroke(); }
      }
    });
    c.globalAlpha = 1;

    if (!document.hidden) requestAnimationFrame(frame);
  }
  document.addEventListener('visibilitychange', function () { if (!document.hidden) requestAnimationFrame(frame); });
  requestAnimationFrame(frame);
})();
