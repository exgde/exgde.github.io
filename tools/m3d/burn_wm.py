"""Grava a marca d'água JOAOBYSS dentro das imagens e dos vídeos do site (um canto de cada).
Rodar UMA vez sobre arquivos ainda sem marca.  uso: python burn_wm.py <pasta do site>"""
import glob, os, subprocess, sys
from PIL import Image, ImageDraw, ImageFont, ImageStat

SITE = sys.argv[1]
TEXT, FONT, ALPHA = 'JOAOBYSS', 'C:/Windows/Fonts/consolab.ttf', 105
CORNERS = ['br', 'tl', 'bl', 'tr']


def layer(w, h, corner, color=None, base=None):
    """camada RGBA do tamanho da mídia com o texto no canto; cor escolhida pelo fundo se não vier"""
    size = max(11, round(min(w, h) * .034))
    font = ImageFont.truetype(FONT, size)
    gap = size * .2
    widths = [font.getlength(c) for c in TEXT]
    tw, th = sum(widths) + gap * (len(TEXT) - 1), size
    m = round(min(w, h) * .035)
    x = m if 'l' in corner else w - m - tw
    y = m if 't' in corner else h - m - th
    if color is None:
        box = base.convert('L').crop((int(x), int(y), int(x + tw), int(y + th)))
        color = (255, 255, 255) if ImageStat.Stat(box).mean[0] < 128 else (0, 0, 0)
    im = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    for c, cw in zip(TEXT, widths):
        d.text((x, y), c, font=font, fill=color + (ALPHA,), anchor='lt')
        x += cw + gap
    return im


def image(path, corner, color=None):
    im = Image.open(path).convert('RGBA')
    out = Image.alpha_composite(im, layer(im.width, im.height, corner, color, im))
    if path.endswith('.jpg'):
        out.convert('RGB').save(path, 'JPEG', quality=88, optimize=True)
    else:
        out.save(path, 'WEBP', quality=88, method=6)
    print('img', path, corner)


def video(path, corner, color):
    probe = subprocess.check_output(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries',
                                     'stream=width,height,bit_rate', '-of', 'csv=p=0', path], text=True).strip().split(',')
    w, h, br = int(probe[0]), int(probe[1]), int(probe[2])
    layer(w, h, corner, color).save('_wm.png')
    tmp = path + '.tmp.mp4'
    subprocess.check_call(['ffmpeg', '-v', 'error', '-y', '-i', path, '-i', '_wm.png', '-filter_complex', 'overlay=0:0',
                           '-c:v', 'libx264', '-preset', 'slow', '-b:v', str(br), '-maxrate', str(int(br * 1.5)),
                           '-bufsize', str(br * 2), '-pix_fmt', 'yuv420p', '-c:a', 'copy', '-movflags', '+faststart', tmp])
    os.replace(tmp, path)
    os.remove('_wm.png')
    print('vid', path, corner, os.path.getsize(path) // 1024, 'KB')


os.chdir(SITE)
W, K = (255, 255, 255), (0, 0, 0)
for i, f in enumerate(sorted(glob.glob('assets/art/*.webp'))):
    image(f.replace('\\', '/'), CORNERS[i % 4])
image('assets/m3d/process-pose.webp', 'br')
image('assets/m3d/process-drawing.jpg', 'tl', K)
image('assets/m3d/process-modeling.jpg', 'bl', W)
for f in sorted(glob.glob('assets/projects/*.jpg')):
    image(f.replace('\\', '/'), 'br', W)
video('assets/m3d/process-drawing.mp4', 'tl', K)       # fundo branco (entra invertido no tema escuro)
video('assets/m3d/process-modeling.mp4', 'bl', W)
for f in sorted(glob.glob('assets/projects/*.mp4')):
    video(f.replace('\\', '/'), 'br', W)
