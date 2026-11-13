import sys
from PIL import Image, ImageFilter, ImageDraw
import numpy as np
src, out = sys.argv[1], sys.argv[2]
im = Image.open(src).convert('RGB'); W, H = im.size
a = np.asarray(im).astype(float); r, g, b = a[..., 0], a[..., 1], a[..., 2]
# fundo azul -> matte
fg = 1 - np.clip(((b - r) - 18) / 30, 0, 1)
M = Image.fromarray((fg * 255).astype('uint8')).filter(ImageFilter.MedianFilter(5)).filter(ImageFilter.GaussianBlur(1.2))
m = np.asarray(M).astype(float) / 255
# cinza com curva: pretos fundos, altas luzes abertas
L = np.asarray(im.convert('L')).astype(float) / 255
L = np.clip((L - 0.06) / 0.86, 0, 1) ** 1.08
L = L * 0.94 + 0.03
# grão leve
rng = np.random.default_rng(7)
L = np.clip(L + rng.normal(0, 0.018, L.shape), 0, 1)

yy, xx = np.mgrid[0:H, 0:W]
u, v = (xx + .5) / W, (yy + .5) / H
def sm(t): t = np.clip(t, 0, 1); return t * t * (3 - 2 * t)
# distância elíptica a partir do rosto
d = np.sqrt(((u - 0.5) / 0.50) ** 2 + ((v - 0.50) / 0.44) ** 2)
photoW = 1 - sm((d - 0.72) / 0.38)
photoW *= 1 - sm((v - 0.80) / 0.14)          # o peito vira pontos
dotK = (1 - sm((d - 0.95) / 0.42)) * (1 - sm((v - 0.88) / 0.11))
dotK *= sm(u / 0.06) * sm((1 - u) / 0.06) * sm(v / 0.04)

# halftone em supersample
S = 3; cell = 7
hw, hh = W * S, H * S
dots = Image.new('L', (hw, hh), 0); dr = ImageDraw.Draw(dots)
lum = L * m
for cy in range(0, H, cell):
    for cx in range(0, W, cell):
        sl = (slice(cy, min(cy + cell, H)), slice(cx, min(cx + cell, W)))
        val = lum[sl].mean(); k = dotK[sl].mean() * (1 - photoW[sl].mean() * 0.85)
        s = (val ** 0.85) * k
        if s < 0.08: continue
        rad = cell * 0.58 * s * S
        x, y = (cx + cell / 2) * S, (cy + cell / 2) * S
        dr.ellipse((x - rad, y - rad, x + rad, y + rad), fill=255)
D = np.asarray(dots.resize((W, H), Image.LANCZOS)).astype(float) / 255

pa = m * photoW                 # alfa da foto
col = L * pa + 0.86 * D * (1 - pa)
alpha = np.clip(pa + D * (1 - pa), 0, 1)
rgb = np.where(alpha > 1e-3, col / np.maximum(alpha, 1e-3), 0)
o = np.dstack([rgb, rgb, rgb, alpha]) * 255
img = Image.fromarray(o.clip(0, 255).astype('uint8'), 'RGBA')
img.save(out, quality=88, method=6)
bg = Image.new('RGBA', img.size, (0, 0, 0, 255)); bg.alpha_composite(img); bg.convert('RGB').save(out + '.preview.png')
