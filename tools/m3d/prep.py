"""Converte os renders em cinza + alfa e monta os arquivos do site.
uso: python prep.py <pasta de saída (assets/m3d)>"""
import os, sys
import numpy as np
from PIL import Image

B = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1]
os.makedirs(OUT, exist_ok=True)


def gray(im, gamma=1.15, lo=2, hi=99.5):
    """RGBA -> RGBA em tons de cinza, com o contraste esticado dentro da silhueta."""
    a = np.asarray(im.convert('RGBA')).astype(float)
    al = a[..., 3] / 255
    L = (a[..., 0] * .299 + a[..., 1] * .587 + a[..., 2] * .114) / 255
    inside = al > .5
    if inside.any():
        p0, p1 = np.percentile(L[inside], [lo, hi])
        L = np.clip((L - p0) / max(p1 - p0, 1e-3), 0, 1) ** gamma
    L = L * .95 + .03
    o = np.dstack([L, L, L, al]) * 255
    return Image.fromarray(o.clip(0, 255).astype('uint8'), 'RGBA')


def trim(im, pad=4):
    box = im.getchannel('A').point(lambda v: 255 if v > 8 else 0).getbbox()
    if not box: return im
    l, t, r, b = box
    return im.crop((max(0, l - pad), max(0, t - pad), min(im.width, r + pad), min(im.height, b + pad)))


def fit_h(im, h):
    return im.resize((max(1, round(im.width * h / im.height)), h), Image.LANCZOS)


def save(im, name, q=78):
    p = os.path.join(OUT, name)
    im.save(p, 'WEBP', quality=q, method=6)
    print(name, im.size, os.path.getsize(p) // 1024, 'KB')


# ---- o giro: 36 quadros numa folha 9 x 4 ----
FW, FH, COLS, N = 300, 545, 9, 36
frames = [Image.open(f'{B}/r/turn_{i:03d}.png').convert('RGBA') for i in range(N)]
# mesma curva para todos os quadros (senão o brilho pisca ao girar)
allpx = np.concatenate([np.asarray(f)[..., :3][np.asarray(f)[..., 3] > 128].reshape(-1, 3)[::37] for f in frames]).astype(float)
Lall = (allpx[:, 0] * .299 + allpx[:, 1] * .587 + allpx[:, 2] * .114) / 255
p0, p1 = np.percentile(Lall, [3, 99.7])
sheet = Image.new('RGBA', (FW * COLS, FH * (N // COLS)), (0, 0, 0, 0))
for i, f in enumerate(frames):
    a = np.asarray(f).astype(float); al = a[..., 3] / 255
    L = (a[..., 0] * .299 + a[..., 1] * .587 + a[..., 2] * .114) / 255
    L = np.clip((L - p0) / (p1 - p0), 0, 1) ** 1.45
    L = L * .95 + .03
    g = Image.fromarray((np.dstack([L, L, L, al]) * 255).clip(0, 255).astype('uint8'), 'RGBA').resize((FW, FH), Image.LANCZOS)
    sheet.paste(g, ((i % COLS) * FW, (i // COLS) * FH))
save(sheet, 'soldier-turn.webp', 74)

# ---- peças paradas ----
def piece(src, h, name, **kw):
    save(fit_h(trim(gray(Image.open(f'{B}/r/{src}_000.png'), **kw)), h), name)

piece('head', 300, 'head.webp')
piece('w1897', 150, 'w1897.webp')
piece('fn1910', 210, 'fn1910.webp')
piece('cutlass', 320, 'cutlass.webp', gamma=1.0)
piece('lighter', 250, 'lighter.webp')

# ---- a turma do Goldspotting, lado a lado numa imagem só ----
crew = [('pirate1', 330), ('player', 205), ('pirate3', 345), ('pirate2', 330)]
ims = [fit_h(trim(gray(Image.open(f'{B}/r/{n}_000.png'))), h) for n, h in crew]
gap = -18; Hc = max(i.height for i in ims)
Wc = sum(i.width for i in ims) + gap * (len(ims) - 1)
c = Image.new('RGBA', (Wc, Hc), (0, 0, 0, 0)); x = 0
for im in ims:
    c.alpha_composite(im, (x, Hc - im.height)); x += im.width + gap
save(c, 'crew.webp')
