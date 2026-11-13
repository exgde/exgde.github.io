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

  /* ---- texto ----
     render() preenche tudo a partir de PF e roda de novo quando o idioma
     muda (js/i18n.js troca os textos dentro de PF e avisa com 'pf:lang'). */
  var I18N = window.PF_I18N || { t: function () { return ''; } };
  var t = I18N.t;
  function text(id, value) { var el = $(id); if (el) el.textContent = value || ''; }
  function clear(id) { var el = $(id); if (el) el.textContent = ''; return el; }

  var about = PF.about || {};
  if (about.photo) {
    var me = $('meImg');
    me.src = about.photo.src;
    // versão para o tema claro (pontos escuros); sem ela, a escura fica nos dois temas
    if (about.photo.light) $('meLight').src = about.photo.light; else $('meLight').remove();
    // o tracking contorna a cabeça, não o retângulo todo da imagem (pontos 0..1)
    me._contour = [];
    for (var a = 0; a < 18; a++) {
      var th = a / 18 * Math.PI * 2;
      me._contour.push([0.5 + Math.cos(th) * 0.4, 0.46 + Math.sin(th) * 0.36]);
    }
  } else {
    $('me').hidden = true;
  }

  /* a galeria de desenhos do "sobre mim" é montada em js/gallery.js */

  var SVGNS = 'http://www.w3.org/2000/svg';
  function icon(name) {
    var svg = document.createElementNS(SVGNS, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24'); svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('class', 'hub__i');
    var d = (window.PF_ICONS || {})[name];
    if (d) { var path = document.createElementNS(SVGNS, 'path'); path.setAttribute('d', d); svg.appendChild(path); }
    return svg;
  }
  if (PF.email) {
    $('mailA').href = 'mailto:' + PF.email;
    text('mailT', PF.email);
    var copyBtn = $('mailCopy'), copyT;
    copyBtn.addEventListener('click', function () {
      var done = function () {
        copyBtn.textContent = t('copied'); copyBtn.classList.add('is-ok');
        clearTimeout(copyT);
        copyT = setTimeout(function () { copyBtn.textContent = t('copy'); copyBtn.classList.remove('is-ok'); }, 1800);
      };
      if (navigator.clipboard) navigator.clipboard.writeText(PF.email).then(done, function () { location.href = 'mailto:' + PF.email; });
      else location.href = 'mailto:' + PF.email;
    });
  } else {
    document.querySelector('.mail').hidden = true;
  }

  function render() {
    document.title = PF.name || 'portfolio';
    text('bootTag', PF.bootTag || '#BOOT');
    text('heroA', (PF.hero || [])[0]);
    text('heroB', (PF.hero || [])[1]);
    text('heroRole', PF.role);
    text('contactA', (PF.contact || [])[0]);
    text('contactB', (PF.contact || [])[1]);

    var art = about.art || {};
    text('artK', art.kicker);
    text('artS', art.sub);
    var artT = clear('artT');
    (art.title || []).forEach(function (w, i) {    // cada pedaço do título entra separado
      var sp = document.createElement('span');
      sp.className = 'art__w'; sp.style.setProperty('--i', i); sp.textContent = w;
      artT.appendChild(sp);
      artT.appendChild(document.createTextNode(' '));
    });
    if (about.photo) $('meImg').alt = about.photo.alt || '';

    text('aboutH', about.heading);
    text('aboutLead', about.lead);
    text('aboutNow', about.now);
    var bio = clear('aboutBio');
    (about.bio || []).forEach(function (line) {
      var p = document.createElement('p'); p.textContent = line; bio.appendChild(p);
    });
    var built = clear('aboutBuilt');
    (about.built || []).forEach(function (line) {
      var li = document.createElement('li'); li.textContent = line; built.appendChild(li);
    });
    var links = clear('aboutLinks');
    (about.links || []).forEach(function (l) {
      var a = document.createElement('a');
      a.textContent = l.label; a.href = l.href; a.target = '_blank'; a.rel = 'noopener';
      links.appendChild(a);
    });

    /* contato: e-mail + links em grupos, com o ícone de cada plataforma */
    text('contactK', PF.contactKicker);
    text('contactNote', PF.contactNote);
    if (copyBtn && !copyBtn.classList.contains('is-ok')) copyBtn.textContent = t('copy');
    renderHubs();
  }

  function renderHubs() {
    var hubs = clear('hubs');
    var n = 0;
    (PF.linkGroups || []).forEach(function (g, gi) {
      var col = document.createElement('div');
      col.className = 'hubs__g';
      var h = document.createElement('p');
      h.className = 'hubs__t'; h.style.setProperty('--i', n);
      h.innerHTML = '<b>0' + (gi + 1) + '</b> ';
      h.appendChild(document.createTextNode(g.title));
      col.appendChild(h);
      (g.links || []).forEach(function (l) {
        var a = document.createElement('a');
        a.className = 'hub'; a.href = l.href; a.target = '_blank'; a.rel = 'noopener';
        a.style.setProperty('--i', ++n);
        a.setAttribute('aria-label', l.label + ' — ' + (l.note || l.handle || ''));
        a.appendChild(icon(l.icon));
        var tx = document.createElement('span'); tx.className = 'hub__tx';
        var nm = document.createElement('b'); nm.textContent = l.label;
        var hd = document.createElement('small'); hd.textContent = l.handle || '';
        tx.appendChild(nm); tx.appendChild(hd);
        if (l.note) { var nt = document.createElement('span'); nt.className = 'hub__n'; nt.textContent = l.note; tx.appendChild(nt); }
        a.appendChild(tx);
        var ar = document.createElement('i'); ar.className = 'hub__ar'; ar.setAttribute('aria-hidden', 'true'); ar.textContent = '↗';
        a.appendChild(ar);
        col.appendChild(a);
      });
      hubs.appendChild(col);
    });
  }
  render();

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
    // sem link o botão fica no lugar, apagado e desativado: se sumisse, ← e → mudariam de posição
    if (p.link) {
      open.href = p.link;
      open.removeAttribute('aria-disabled'); open.removeAttribute('title');
    } else {
      open.removeAttribute('href');               // sem href o link não recebe foco nem clique
      open.setAttribute('aria-disabled', 'true'); open.title = t('noLink');
    }
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

  /* ---- idioma trocado: refaz os textos (o nome pode mudar de largura, então reposiciona) ---- */
  document.addEventListener('pf:lang', function () {
    render();
    paintInfo(BUS.index);
    if (hero.classList.contains('is-dock')) dock();
  });

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
      if (en.isIntersecting && !en.target.classList.contains('is-in')) {
        en.target.classList.add('is-in');
        // retrato: quando a entrada termina, a troca de tema passa a ser rápida
        if (en.target.id === 'about') setTimeout(function () { $('me').classList.add('is-set'); }, 2300);
      }
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
