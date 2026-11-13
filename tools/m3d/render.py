"""Renderiza um modelo com fundo transparente, parado ou girando.
uso: blender -b -P render.py -- <config.json>

config:
  src      arquivo (.blend/.glb/.fbx)
  out      prefixo de saída (…/nome_ -> nome_000.png)
  yaws     lista de ângulos (graus) em volta do eixo Z; um PNG por ângulo
  size     [largura, altura]
  skip     nomes de objetos a ignorar
  pose     { osso: [rx, ry, rz] } em graus, nos eixos do MUNDO, girando em volta da cabeça do osso
  zmin     fração da altura: apaga tudo abaixo (para ficar só a cabeça)
  action_frame  quadro da animação a usar (modelos com Action)
  pitch    inclinação da câmera em graus (positivo olha de cima)
  fit      margem em volta do modelo (1.0 = justo)
"""
import bpy, sys, os, math, json
from mathutils import Vector, Matrix, Euler

cfg = json.load(open(sys.argv[sys.argv.index('--') + 1], encoding='utf-8'))
src = cfg['src']; ext = os.path.splitext(src)[1].lower()
if ext == '.blend':
    bpy.ops.wm.open_mainfile(filepath=src)
else:
    bpy.ops.wm.read_factory_settings(use_empty=True)
    if ext in ('.glb', '.gltf'):
        bpy.ops.import_scene.gltf(filepath=src)
    else:
        bpy.ops.import_scene.fbx(filepath=src)
sc = bpy.context.scene
vl = bpy.context.view_layer

skip = set(cfg.get('skip', []))
for o in list(bpy.data.objects):
    if o.type in ('CAMERA', 'LIGHT') or o.name in skip or (o.type == 'MESH' and o.hide_render):
        bpy.data.objects.remove(o, do_unlink=True)

if 'action_frame' in cfg:
    sc.frame_set(int(cfg['action_frame']))

# ---- pose (rotações em eixos do mundo, em volta da cabeça do osso) ----
arm = next((o for o in bpy.data.objects if o.type == 'ARMATURE'), None)
if arm and cfg.get('pose'):
    def depth(b):
        d = 0
        while b.parent: b = b.parent; d += 1
        return d
    names = sorted([n for n in cfg['pose'] if n in arm.pose.bones], key=lambda n: depth(arm.pose.bones[n]))
    missing = [n for n in cfg['pose'] if n not in arm.pose.bones]
    if missing: print('### POSE sem osso:', missing)
    for n in names:
        pb = arm.pose.bones[n]
        rx, ry, rz = [math.radians(v) for v in cfg['pose'][n]]
        R = Euler((rx, ry, rz), 'XYZ').to_matrix().to_4x4()
        head = pb.matrix.to_translation()
        pb.matrix = Matrix.Translation(head) @ R @ Matrix.Translation(-head) @ pb.matrix
        vl.update()

meshes = [o for o in bpy.data.objects if o.type == 'MESH']
vl.update()
dg = bpy.context.evaluated_depsgraph_get()

def bounds():
    mn = Vector((1e9,) * 3); mx = Vector((-1e9,) * 3)
    for o in meshes:
        ev = o.evaluated_get(dg); me = ev.to_mesh()
        for v in me.vertices:
            w = ev.matrix_world @ v.co
            mn = Vector(map(min, mn, w)); mx = Vector(map(max, mx, w))
        ev.to_mesh_clear()
    return mn, mx

mn, mx = bounds()

# ---- só a cabeça: apaga os vértices abaixo de zmin ----
if 'zmin' in cfg:
    zc = mn.z + (mx.z - mn.z) * cfg['zmin']
    for o in meshes:
        me = o.data
        inv = o.matrix_world
        import bmesh
        bm = bmesh.new(); bm.from_mesh(me)
        dead = [v for v in bm.verts if (inv @ v.co).z < zc]
        bmesh.ops.delete(bm, geom=dead, context='VERTS')
        bm.to_mesh(me); bm.free(); me.update()
    vl.update(); dg = bpy.context.evaluated_depsgraph_get()
    mn, mx = bounds()

ctr = (mn + mx) / 2
h = mx.z - mn.z
rad = max(math.hypot(mx.x - ctr.x, mx.y - ctr.y), math.hypot(mn.x - ctr.x, mn.y - ctr.y))
print('### BBOX', [round(v, 2) for v in mn], [round(v, 2) for v in mx], 'tris', sum(len(o.data.loop_triangles) or 0 for o in meshes))

# ---- tudo preso a um vazio no centro, que gira ----
piv = bpy.data.objects.new('piv', None); sc.collection.objects.link(piv)
piv.location = (ctr.x, ctr.y, 0)
vl.update()
for o in bpy.data.objects:
    if o is not piv and o.parent is None:
        mw = o.matrix_world.copy(); o.parent = piv; o.matrix_world = mw

W, H = cfg.get('size', [400, 720])
fit = cfg.get('fit', 1.08)
cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); sc.collection.objects.link(cam)
cam.data.type = 'ORTHO'
need_w = 2 * rad * fit; need_h = h * fit
cam.data.ortho_scale = max(need_w, need_h * W / H) if W >= H else max(need_h, need_w * H / W)
pitch = math.radians(cfg.get('pitch', 4))
dist = max(h, rad) * 6
cam.location = Vector((ctr.x, ctr.y - dist * math.cos(pitch), ctr.z + dist * math.sin(pitch)))
cam.rotation_euler = (ctr - cam.location).to_track_quat('-Z', 'Y').to_euler()
cam.data.clip_start = dist * .05; cam.data.clip_end = dist * 3
sc.camera = cam

def light(name, kind, energy, rot, **kw):
    L = bpy.data.objects.new(name, bpy.data.lights.new(name, kind)); sc.collection.objects.link(L)
    L.data.energy = energy; L.rotation_euler = [math.radians(a) for a in rot]
    for k, v in kw.items(): setattr(L.data, k, v)
    return L
k = cfg.get('light', 1.0)
light('key', 'SUN', 4.2 * k, (52, 0, -38))          # de cima, pela esquerda de quem olha
light('fill', 'SUN', .9 * k, (70, 0, 60))
light('rim', 'SUN', 3.0 * k, (-60, 0, 150))         # contraluz, recorta a silhueta
if not sc.world: sc.world = bpy.data.worlds.new('w')
sc.world.use_nodes = True
bg = sc.world.node_tree.nodes.get('Background')
if bg: bg.inputs[0].default_value = (1, 1, 1, 1); bg.inputs[1].default_value = .12 * k

for eng in ('BLENDER_EEVEE_NEXT', 'BLENDER_EEVEE'):
    try: sc.render.engine = eng; break
    except Exception: pass
sc.render.resolution_x = W; sc.render.resolution_y = H; sc.render.resolution_percentage = 100
sc.render.film_transparent = True
sc.render.image_settings.file_format = 'PNG'; sc.render.image_settings.color_mode = 'RGBA'
try: sc.view_settings.view_transform = 'Standard'
except Exception: pass

for i, yaw in enumerate(cfg.get('yaws', [0])):
    piv.rotation_euler = (0, 0, math.radians(yaw))
    sc.render.filepath = f"{cfg['out']}{i:03d}.png"
    bpy.ops.render.render(write_still=True)
print('### DONE', len(cfg.get('yaws', [0])))
