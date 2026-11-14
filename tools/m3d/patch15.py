"""Seção 03: print do Blender + os dois vídeos flutuando em perspectiva ao lado do texto; GBJAM 14 = 2026.
uso: python patch15.py <pasta do site> <versão> <print>"""
import io, os, re, sys
from PIL import Image

SITE, VER, SHOT = sys.argv[1], sys.argv[2], sys.argv[3]

HTML_OLD = '''    <div class="m3d__vids">
'''
HTML_NEW = HTML_OLD + '''      <figure class="m3d__vid m3d__vid--shot">
        <img src="assets/m3d/process-pose.webp" alt="" loading="lazy" width="700" height="740" />
        <figcaption data-lab="pose"></figcaption>
      </figure>
'''

CSS_OLD = [
    ".m3d__vids{ display:flex; gap:clamp(.8rem,1.6vw,1.6rem); align-items:flex-end; justify-content:flex-end }\n",
    ".m3d__vid--tall{ flex:0 1 27% }\n.m3d__vid--wide{ flex:0 1 64% }\n",
    "  .m3d__vids{ justify-content:flex-start }\n  .m3d__vid--tall{ flex-basis:30% }\n  .m3d__vid--wide{ flex-basis:70% }\n",
    ".m3d__vid video{\n",
]
CSS_NEW = [
    """/* print e vídeos soltos no espaço, cada um virado para um lado e boiando devagar */
.m3d__vids{
  display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1.05fr); gap:clamp(1rem,2.4vw,2.6rem);
  align-items:center; perspective:1600px;
}
""",
    """.m3d__vid{ transition:transform .5s ease; animation:m3dFloat 9s ease-in-out infinite; will-change:translate }
.m3d__vid img, .m3d__vid video{ box-shadow:0 1.2rem 2.6rem rgba(0,0,0,.45) }
.m3d__vid--shot{ grid-column:1; grid-row:1 / span 2; margin-top:22%; transform:rotateY(18deg) rotateX(3deg) rotate(-2deg) }
.m3d__vid--tall{ grid-column:2; grid-row:1; width:58%; justify-self:end; transform:rotateY(-20deg) rotateX(4deg) rotate(2deg); animation-duration:11s; animation-delay:-4s }
.m3d__vid--wide{ grid-column:2; grid-row:2; width:90%; justify-self:start; transform:rotateY(-13deg) rotateX(-5deg) rotate(-3deg); animation-duration:13s; animation-delay:-7s }
.m3d__vid:hover{ transform:none }
@keyframes m3dFloat{ 50%{ translate:0 -12px } }
@media (prefers-reduced-motion:reduce){ .m3d__vid{ animation:none } }
""",
    "  .m3d__vid--shot{ margin-top:10% }\n",
    ".m3d__vid img, .m3d__vid video{\n",
]


def rw(p, f):
    s = io.open(p, encoding='utf-8', newline='').read()
    nl = '\r\n' if '\r\n' in s else '\n'
    s2 = f(s.replace('\r\n', '\n'))
    io.open(p, 'w', encoding='utf-8', newline='').write(s2.replace('\n', nl))


def sub1(s, a, b):
    assert s.count(a) == 1, (s.count(a), a[:70])
    return s.replace(a, b)


def css(s):
    for a, b in zip(CSS_OLD, CSS_NEW):
        s = sub1(s, a, b)
    return s


def data(s):
    s = sub1(s, "year: 'recente'", "year: '2026'")
    s = sub1(s, "year: 'recent'", "year: '2026'")
    s = sub1(s, "model: 'modelagem' }", "model: 'modelagem', pose: 'pose no Blender' }")
    s = sub1(s, "model: 'modeling' }", "model: 'modeling', pose: 'posing in Blender' }")
    return s


os.chdir(SITE)
Image.open(SHOT).convert('RGB').crop((400, 420, 1100, 1160)).save('assets/m3d/process-pose.webp', 'WEBP', quality=82, method=6)
rw('index.html', lambda s: re.sub(r'\?v=\d{10}', '?v=' + VER, sub1(s, HTML_OLD, HTML_NEW)))
rw('css/style.css', css)
rw('js/data.js', data)
print('ok', os.path.getsize('assets/m3d/process-pose.webp') // 1024, 'KB')
