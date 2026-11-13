/* ============================================================
   BASE — preenche o texto a partir de data.js, cuida do boot, do
   botão inverter, do ponteiro e da navegação entre projetos.

   js/psp.js (módulo) conversa com este arquivo por window.PF_BUS.
   ============================================================ */
(function () {
  'use strict';

  var PF = window.PF || {};
  var projects = PF.projects || [];
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (id) { return document.getElementById(id); };
  var pad = function (n) { return (n < 10 ? '0' : '') + n; };

  /* ---- barramento compartilhado com o PSP ---- */
  var BUS = window.PF_BUS = {
    projects: projects,
    index: 0,
    modelDone: false,
    _subs: [],
    on: function (fn) { this._subs.push(fn); },
    set: function (i, dir) {
      var n = projects.length;
      if (!n) return;
      this.index = ((i % n) + n) % n;
      var self = this;
      this._subs.forEach(function (fn) { fn(self.index, dir || 0); });
    },
    next: function () { this.set(this.index + 1, 1); },
    prev: function () { this.set(this.index - 1, -1); },
    pspAt: 0,                       // quando o PSP deve entrar (psp.js lê)
    showPsp: function () { this.pspAt = performance.now(); }
  };

  /* ---- texto ---- */
  function text(id, value) { var el = $(id); if (el) el.textContent = value || ''; }

  document.title = PF.name || 'portfolio';
  text('bootTag', PF.bootTag || '#BOOT');
  text('heroA', (PF.hero || [])[0]);
  text('heroB', (PF.hero || [])[1]);
  text('heroRole', PF.role);
  text('contactA', (PF.contact || [])[0]);
  text('contactB', (PF.contact || [])[1]);

  var about = PF.about || {};
  text('aboutH', about.heading);
  (about.bio || []).forEach(function (line) {
    var p = document.createElement('p'); p.textContent = line; $('aboutBio').appendChild(p);
  });
  (about.stack || []).forEach(function (item) {
    var li = document.createElement('li'); li.textContent = item; $('aboutStack').appendChild(li);
  });
  (PF.links || []).forEach(function (l) {
    var a = document.createElement('a');
    a.textContent = l.label; a.href = l.href;
    if (!/^mailto:/.test(l.href)) { a.target = '_blank'; a.rel = 'noopener'; }
    $('links').appendChild(a);
  });

  /* ---- descrição do projeto, ao lado do PSP ---- */
  var info = $('info'), introDone = false, swapT = 0;
  function fillInfo(i) {
    var p = projects[i] || {};
    text('railIdx', pad(i + 1));
    text('railTot', '/' + pad(projects.length));
    text('railTitle', p.title);
    text('infoSub', p.sub);
    text('infoHow', p.how);
    text('infoWhy', p.why);
    $('infoHow').parentNode.hidden = !p.how;
    $('infoWhy').parentNode.hidden = !p.why;
    text('railMeta', [p.stack, p.year].filter(Boolean).join(' · '));
    var open = $('railOpen');
    if (p.link) { open.href = p.link; open.hidden = false; } else { open.hidden = true; }
  }
  function paintInfo(i) {
    if (!introDone || reduce) { fillInfo(i); return; }
    info.classList.add('is-swap');                  // some, troca o texto, volta
    clearTimeout(swapT);
    swapT = setTimeout(function () { fillInfo(i); info.classList.remove('is-swap'); }, 220);
  }
  BUS.on(paintInfo);
  fillInfo(0);

  $('prevBtn').addEventListener('click', function () { BUS.prev(); });
  $('nextBtn').addEventListener('click', function () { BUS.next(); });

  /* setas do teclado só valem enquanto a máquina está na tela */
  var workOn = false;
  document.addEventListener('keydown', function (e) {
    if (!workOn || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === 'ArrowRight') { BUS.next(); e.preventDefault(); }
    else if (e.key === 'ArrowLeft') { BUS.prev(); e.preventDefault(); }
  });

  /* ---- entrada da capa ----
     1. o nome e o disquete surgem no centro
     2. deslizam para a esquerda (retrato: para o topo)
     3. o PSP aparece          4. a descrição entra ao lado dele */
  var hero = $('hero'), brand = $('brand');
  var portrait = window.matchMedia('(max-aspect-ratio: 4/5)');

  function dock() {                                  // para onde o nome vai e em que tamanho
    var W = hero.clientWidth, H = hero.clientHeight;
    var bw = brand.offsetWidth, bh = brand.offsetHeight;
    var g = parseFloat(getComputedStyle(hero).paddingLeft) || 16;
    var s, x, y;
    if (portrait.matches) {
      s = Math.min(0.62, (W - 2 * g) / bw);
      x = 0;
      y = g + bh * s / 2 - H / 2;
    } else {
      s = Math.min(0.6, (W * 0.25 - g * 1.4) / bw);  // cabe na coluna da esquerda (25%)
      x = g + bw * s / 2 - W / 2;
      y = 0;
    }
    brand.style.setProperty('--bx', x.toFixed(1) + 'px');
    brand.style.setProperty('--by', y.toFixed(1) + 'px');
    brand.style.setProperty('--bs', s.toFixed(3));
  }
  window.addEventListener('resize', function () { if (hero.classList.contains('is-dock')) dock(); });

  function intro() {
    var steps = [
      [0,    function () { hero.classList.add('is-name'); }],
      [1700, function () { hero.classList.add('is-dock'); dock(); }],
      [2500, function () { hero.classList.add('is-psp'); if (BUS.showPsp) BUS.showPsp(); }],
      [3300, function () { hero.classList.add('is-info'); introDone = true; }]
    ];
    steps.forEach(function (st) {
      if (reduce) st[1](); else setTimeout(st[1], st[0]);
    });
  }

  /* ---- seções: entrada e "qual está na tela" ---- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) en.target.classList.add('is-in');
      if (en.target.id === 'hero') workOn = en.intersectionRatio > 0.5;
    });
  }, { threshold: [0.15, 0.5] });
  [].forEach.call(document.querySelectorAll('.sec'), function (s) { io.observe(s); });

  /* ---- inverter ---- */
  var invertBtn = $('invertToggle');
  function setInvert(on) {
    document.body.classList.toggle('is-invert', on);
    invertBtn.setAttribute('aria-pressed', String(on));
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = on ? '#ffffff' : '#000000';
    try { localStorage.setItem('pf-invert', on ? '1' : '0'); } catch (e) { /* sem storage, sem problema */ }
  }
  invertBtn.addEventListener('click', function () {
    setInvert(!document.body.classList.contains('is-invert'));
  });
  try { if (localStorage.getItem('pf-invert') === '1') setInvert(true); } catch (e) { /* idem */ }

  /* ---- ponteiro: os recortes deslizam um pouco ---- */
  if (!reduce) {
    var root = document.documentElement, queued = false, mx = 0, my = 0;
    window.addEventListener('pointermove', function (e) {
      mx = (e.clientX / window.innerWidth) * 2 - 1;
      my = (e.clientY / window.innerHeight) * 2 - 1;
      if (queued) return;
      queued = true;
      requestAnimationFrame(function () {
        queued = false;
        root.style.setProperty('--mx', mx.toFixed(3));
        root.style.setProperty('--my', my.toFixed(3));
      });
    }, { passive: true });
  }

  /* ---- boot: sobe até 70 sozinho, fecha em 100 quando o PSP carrega
          (ou depois de 7 s, para nunca prender ninguém na tela) ---- */
  var boot = $('boot'), fill = $('bootFill'), pct = $('bootPct');
  var shown = 0, target = 70, finished = false;
  BUS.modelReady = function () { BUS.modelDone = true; target = 100; };
  setTimeout(function () { target = 100; }, 7000);

  function finish() {
    finished = true;
    document.body.classList.remove('is-booting');
    boot.classList.add('is-done');
    hero.classList.add('is-in');
    intro();
  }
  var last = performance.now();
  function tick(now) {
    if (finished) return;
    var dt = Math.min(now - last, 400); last = now;      // por tempo, não por quadro
    shown = reduce ? target : Math.min(target, shown + dt * 0.085);
    var v = Math.round(shown);
    pct.textContent = (v < 10 ? '00' : v < 100 ? '0' : '') + v;
    fill.style.width = v + '%';
    if (v >= 100) { setTimeout(finish, 220); return; }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
