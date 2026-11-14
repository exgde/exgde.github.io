"""A marca d'água passou a ser gravada nos arquivos (burn_wm.py): sai a camada do site.
O ciclo do processo deixa de pausar com o mouse em cima e troca a cada 5 s.
uso: python patch17.py <pasta do site> <versão>"""
import io, os, re, sys

SITE, VER = sys.argv[1], sys.argv[2]


def rw(p, f):
    s = io.open(p, encoding='utf-8', newline='').read()
    nl = '\r\n' if '\r\n' in s else '\n'
    s2 = f(s.replace('\r\n', '\n'))
    io.open(p, 'w', encoding='utf-8', newline='').write(s2.replace('\n', nl))


def sub1(s, a, b):
    assert s.count(a) == 1, (s.count(a), a[:70])
    return s.replace(a, b)


def cut(s, a, b):
    i = s.index(a); j = s.index(b, i) + len(b)
    return s[:i] + s[j:]


def html(s):
    s, n = re.subn(r'<span class="m3d__media wm" data-wm="\w+">', '<span class="m3d__media">', s)
    assert n == 3
    s = sub1(s, '<span class="lb__wm" aria-hidden="true">JOAOBYSS</span>', '')
    return re.sub(r'\?v=\d{10}', '?v=' + VER, s)


def css(s):
    return cut(s, "\n/* marca d'água: discreta, num canto de cada mídia */", ".lb__wm{ position:absolute; transform:translate(-100%,-100%); padding:1em 1.1em }\n")


def gallery(s):
    s = sub1(s, "      art.className = 'gallery__art wm';\n      art.setAttribute('data-wm', ['br', 'tl', 'bl', 'tr'][idx % 4]);\n",
             "      art.className = 'gallery__art';\n")
    return cut(s, "  var lbWm = document.querySelector('.lb__wm');", "new ResizeObserver(wmPlace).observe(lbImg);\n")


def psp(s):
    return cut(s, "  g.save();                              // marca d'água discreta no canto\n", "  g.restore();\n")


def m3d(s):
    s = sub1(s, "cycOn = false, cycHover = false, cycT = 0;", "cycOn = false, cycT = 0;")
    s = sub1(s, "      if (!cycOn || cycHover || document.hidden) return;\n", "      if (!cycOn || document.hidden) return;\n")
    s = sub1(s, "    }, 6000);\n", "    }, 5000);\n")
    s = sub1(s, "    box.addEventListener('pointerenter', function () { cycHover = true; });\n"
                "    box.addEventListener('pointerleave', function () { cycHover = false; });\n", "")
    return s


os.chdir(SITE)
rw('index.html', html)
rw('css/style.css', css)
rw('js/gallery.js', gallery)
rw('js/psp.js', psp)
rw('js/m3d.js', m3d)
print('ok')
