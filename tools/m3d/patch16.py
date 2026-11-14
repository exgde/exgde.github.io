"""Marca d'água discreta nas mídias (galeria, tela cheia, PSP, processo) e ciclo do bloco de
processo: um item em destaque, dois menores à direita, trocando a cada poucos segundos.
uso: python patch16.py <pasta do site> <versão>"""
import io, os, re, sys

SITE, VER = sys.argv[1], sys.argv[2]

CSS_BLOCK = '''/* print e vídeos soltos no espaço: um em destaque, dois menores à direita; js/m3d.js troca os lugares */
.m3d__vids{ position:relative; container-type:size; aspect-ratio:16/11; perspective:1600px }
.m3d__vid{
  position:absolute; margin:0; left:var(--x); top:var(--y); width:var(--w); z-index:1; opacity:.6; cursor:pointer;
  transform:translate(-50%,-50%) var(--tilt);
  transition:left .9s var(--ease), top .9s var(--ease), width .9s var(--ease), transform .9s var(--ease), opacity .6s;
  animation:m3dFloat 9s ease-in-out infinite; will-change:translate;
}
.m3d__vid[data-slot="0"]{ --x:30%; --y:50%; --w:min(56cqw, calc(84cqh * var(--ar))); --tilt:rotateY(16deg) rotateX(3deg) rotate(-2deg); opacity:1; z-index:2; cursor:default }
.m3d__vid[data-slot="1"]{ --x:82%; --y:27%; --w:min(30cqw, calc(38cqh * var(--ar))); --tilt:rotateY(-20deg) rotateX(4deg) rotate(2deg); animation-duration:11s; animation-delay:-4s }
.m3d__vid[data-slot="2"]{ --x:80%; --y:76%; --w:min(34cqw, calc(34cqh * var(--ar))); --tilt:rotateY(-13deg) rotateX(-5deg) rotate(-3deg); animation-duration:13s; animation-delay:-7s }
.m3d__vid:not([data-slot="0"]):hover{ opacity:.9 }
.m3d__media{ display:block }
.m3d__vid img, .m3d__vid video{
  display:block; width:100%; height:auto; background:#000; filter:grayscale(1) contrast(1.15);
  border:1px solid color-mix(in srgb, var(--fg) 22%, transparent); box-shadow:0 1.2rem 2.6rem rgba(0,0,0,.45);
}
/* o desenho tem fundo branco: no tema escuro ele entra invertido (traço claro no preto) */
.m3d__vid--tall video{ filter:grayscale(1) invert(1) contrast(1.1) }
body.is-invert .m3d__vid--tall video{ filter:grayscale(1) contrast(1.1) }
@keyframes m3dFloat{ 50%{ translate:0 -12px } }
@media (prefers-reduced-motion:reduce){ .m3d__vid{ animation:none; transition:none } }

/* marca d'água: discreta, num canto de cada mídia */
.wm{ position:relative }
.wm::after, .lb__wm{
  font-family:var(--mono); font-size:clamp(.5rem,.75vw,.8rem); font-weight:600; letter-spacing:.2em; line-height:1;
  color:#fff; mix-blend-mode:difference; opacity:.38; pointer-events:none; -webkit-user-select:none; user-select:none;
}
.wm::after{ content:'JOAOBYSS'; position:absolute; z-index:1 }
.wm[data-wm="br"]::after{ right:.9em; bottom:.8em }
.wm[data-wm="bl"]::after{ left:.9em; bottom:.8em }
.wm[data-wm="tr"]::after{ right:.9em; top:.8em }
.wm[data-wm="tl"]::after{ left:.9em; top:.8em }
.lb__stage{ position:relative }
.lb__wm{ position:absolute; transform:translate(-100%,-100%); padding:1em 1.1em }
'''

FIG = '''      <figure class="m3d__vid m3d__vid--%s" data-slot="%d" style="--ar:%s">
        <span class="m3d__media wm" data-wm="%s">%s</span>
'''

JS_CYCLE = '''  /* ---- ciclo: um item em destaque, os outros dois menores à direita; troca sozinho ---- */
  var cyc = [].slice.call(sec.querySelectorAll('.m3d__vid')), feat = 0, cycOn = false, cycHover = false, cycT = 0;
  function cycPlace() {
    cyc.forEach(function (el, i) { el.setAttribute('data-slot', (i - feat + cyc.length) % cyc.length); });
  }
  function cycArm() {
    clearInterval(cycT);
    if (reduce) return;
    cycT = setInterval(function () {
      if (!cycOn || cycHover || document.hidden) return;
      feat = (feat + 1) % cyc.length; cycPlace();
    }, 6000);
  }
  if (cyc.length > 1) {
    var box = cyc[0].parentNode;
    box.addEventListener('pointerenter', function () { cycHover = true; });
    box.addEventListener('pointerleave', function () { cycHover = false; });
    cyc.forEach(function (el, i) {
      el.addEventListener('click', function () { if (i !== feat) { feat = i; cycPlace(); cycArm(); } });
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { cycOn = es[0].isIntersecting; }, { threshold: .3 }).observe(box);
    } else cycOn = true;
    cycArm();
  }

'''

LB_JS = '''
  var lbWm = document.querySelector('.lb__wm');          // marca d'água no canto de baixo do desenho aberto
  function wmPlace() {
    if (!lbWm) return;
    lbWm.style.left = (lbImg.offsetLeft + lbImg.offsetWidth) + 'px';
    lbWm.style.top = (lbImg.offsetTop + lbImg.offsetHeight) + 'px';
  }
  lbImg.addEventListener('load', wmPlace);
  window.addEventListener('resize', wmPlace);
'''


def rw(p, f):
    s = io.open(p, encoding='utf-8', newline='').read()
    nl = '\r\n' if '\r\n' in s else '\n'
    s2 = f(s.replace('\r\n', '\n'))
    io.open(p, 'w', encoding='utf-8', newline='').write(s2.replace('\n', nl))


def sub1(s, a, b):
    assert s.count(a) == 1, (s.count(a), a[:70])
    return s.replace(a, b)


def html(s):
    for cls, slot, ar, wm in (('shot', 0, '.946', 'br'), ('tall', 1, '.75', 'tl'), ('wide', 2, '1.778', 'bl')):
        m = re.search(r'      <figure class="m3d__vid m3d__vid--%s">\n        (<(?:img|video)[^\n]*)\n' % cls, s)
        assert m, cls
        s = s[:m.start()] + FIG % (cls, slot, ar, wm, m.group(1)) + s[m.end():]
    s = sub1(s, '<img id="lbImg" alt="" draggable="false" /></div>',
             '<img id="lbImg" alt="" draggable="false" /><span class="lb__wm" aria-hidden="true">JOAOBYSS</span></div>')
    return re.sub(r'\?v=\d{10}', '?v=' + VER, s)


def css(s):
    a = s.index('/* print e vídeos soltos no espaço')
    end = '@media (prefers-reduced-motion:reduce){ .m3d__vid{ animation:none } }\n'
    b = s.index(end, a) + len(end)
    s = s[:a] + CSS_BLOCK + s[b:]
    return sub1(s, "  .m3d__vid--shot{ margin-top:10% }\n", "")


def m3d(s):
    return sub1(s, "    vids.forEach(function (v) { vo.observe(v); });\n  }\n\n",
                "    vids.forEach(function (v) { vo.observe(v); });\n  }\n\n" + JS_CYCLE)


def gallery(s):
    s = sub1(s, "      art.className = 'gallery__art';\n",
             "      art.className = 'gallery__art wm';\n      art.setAttribute('data-wm', ['br', 'tl', 'bl', 'tr'][idx % 4]);\n")
    m = re.search(r"\n  var lbImg = document\.getElementById\('lbImg'\)[^\n]*\n", s)
    assert m
    return s[:m.end()] + LB_JS.lstrip('\n') + s[m.end():]


def psp(s):
    return sub1(s, "  g.drawImage(src, (SW - dw) / 2, (SH - dh) / 2, dw, dh);\n",
                "  g.drawImage(src, (SW - dw) / 2, (SH - dh) / 2, dw, dh);\n"
                "  g.save();                              // marca d'água discreta no canto\n"
                "  g.globalAlpha = .38; g.fillStyle = '#fff'; g.textAlign = 'right'; g.textBaseline = 'bottom';\n"
                "  g.font = '600 ' + Math.round(SH * .042) + 'px ui-monospace, Consolas, monospace';\n"
                "  g.fillText('JOAOBYSS', SW - SH * .05, SH - SH * .045);\n"
                "  g.restore();\n")


os.chdir(SITE)
rw('index.html', html)
rw('css/style.css', css)
rw('js/m3d.js', m3d)
rw('js/gallery.js', gallery)
rw('js/psp.js', psp)
print('ok')
