"""Bloco de processo: barra de progresso (01 ——— 03) que enche até a próxima troca; é ela que dispara a troca.
uso: python patch18.py <pasta do site> <versão>"""
import io, os, re, sys

SITE, VER = sys.argv[1], sys.argv[2]

HTML_ADD = '''      <div class="m3d__prog" aria-hidden="true"><span id="m3dPN">01</span><i><b></b></i><span>03</span></div>
'''

CSS = '''/* quanto falta para o próximo quadro ganhar o destaque */
.m3d__prog{
  position:absolute; left:2%; bottom:-1.8rem; width:min(44cqw,17rem); z-index:3; display:flex; align-items:center; gap:.8em;
  font-family:var(--mono); font-size:.8rem; letter-spacing:.12em; color:var(--mute);
}
.m3d__prog i{ flex:1; height:2px; overflow:hidden; background:color-mix(in srgb, var(--fg) 22%, transparent) }
.m3d__prog b{ display:block; height:100%; background:var(--fg); transform-origin:left; animation:m3dProg 5s linear infinite paused }
.m3d__prog.is-on b{ animation-play-state:running }
@keyframes m3dProg{ from{ transform:scaleX(0) } to{ transform:scaleX(1) } }
@media (prefers-reduced-motion:reduce){ .m3d__prog{ display:none } }
'''

JS = '''  /* ---- ciclo: um item em destaque, os outros dois menores à direita. A barra de progresso
     (.m3d__prog) enche em 5 s e, a cada volta dela, o destaque passa para o próximo ---- */
  var cyc = [].slice.call(sec.querySelectorAll('.m3d__vid')), feat = 0;
  var prog = sec.querySelector('.m3d__prog'), bar = prog && prog.querySelector('b'), pn = $('m3dPN');
  function cycPlace() {
    cyc.forEach(function (el, i) { el.setAttribute('data-slot', (i - feat + cyc.length) % cyc.length); });
    if (pn) pn.textContent = '0' + (feat + 1);
  }
  if (cyc.length > 1 && bar) {
    cyc.forEach(function (el, i) {
      el.addEventListener('click', function () {
        if (i === feat) return;
        feat = i; cycPlace();
        bar.style.animation = 'none'; void bar.offsetWidth; bar.style.animation = '';   // recomeça a contagem
      });
    });
    bar.addEventListener('animationiteration', function () { feat = (feat + 1) % cyc.length; cycPlace(); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { prog.classList.toggle('is-on', es[0].isIntersecting); }, { threshold: .3 }).observe(cyc[0].parentNode);
    } else prog.classList.add('is-on');
  }

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
    a = '        <figcaption data-lab="model"></figcaption>\n      </figure>\n'
    return re.sub(r'\?v=\d{10}', '?v=' + VER, sub1(s, a, a + HTML_ADD))


def css(s):
    a = "@keyframes m3dFloat{"
    assert s.count(a) == 1
    return s.replace(a, CSS + a)


def m3d(s):
    i = s.index("  /* ---- ciclo:"); end = "    cycArm();\n  }\n\n"
    j = s.index(end, i) + len(end)
    return s[:i] + JS + s[j:]


os.chdir(SITE)
rw('index.html', html)
rw('css/style.css', css)
rw('js/m3d.js', m3d)
print('ok')
