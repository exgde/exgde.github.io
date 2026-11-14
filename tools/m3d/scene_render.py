"""Renderiza o que estiver na cena do Blender aberto (via MCP). Ajuste CFG antes de mandar."""
import bpy, math, json
from mathutils import Vector

CFG = json.load(open(r"C:\Users\jbmid\AppData\Local\Temp\claude\862c1e55cdab38e6\8b18033e-9010-4a91-86b3-b64bc450ae61\scratchpad\m3d\t\_render.json"))
sc = bpy.context.scene; vl = bpy.context.view_layer
for n in ('piv', 'cam', 'key', 'fill', 'rim'):
    o = bpy.data.objects.get(n)
    if o:
        for c in list(o.children):
            mw = c.matrix_world.copy(); c.parent = None; c.matrix_world = mw
        bpy.data.objects.remove(o, do_unlink=True)
vl.update()
meshes = [o for o in bpy.data.objects if o.type == 'MESH' and not o.hide_render]
dg = bpy.context.evaluated_depsgraph_get()
mn = Vector((1e9,) * 3); mx = Vector((-1e9,) * 3)
for o in meshes:
    ev = o.evaluated_get(dg); me = ev.to_mesh()
    for v in me.vertices:
        w = ev.matrix_world @ v.co
        mn = Vector(map(min, mn, w)); mx = Vector(map(max, mx, w))
    ev.to_mesh_clear()
ctr = (mn + mx) / 2; h = mx.z - mn.z
if 'center' in CFG: ctr.x, ctr.y = CFG['center']
rad = CFG.get('rad') or max(math.hypot(mx.x - ctr.x, mx.y - ctr.y), math.hypot(mn.x - ctr.x, mn.y - ctr.y),
                           math.hypot(mx.x - ctr.x, mn.y - ctr.y), math.hypot(mn.x - ctr.x, mx.y - ctr.y))

piv = bpy.data.objects.new('piv', None); sc.collection.objects.link(piv)
piv.location = (ctr.x, ctr.y, 0); vl.update()
for o in bpy.data.objects:
    if o is not piv and o.parent is None:
        mw = o.matrix_world.copy(); o.parent = piv; o.matrix_world = mw

W, H = CFG.get('size', [440, 800]); fit = CFG.get('fit', 1.06)
cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); sc.collection.objects.link(cam)
cam.data.type = 'ORTHO'
need_w = 2 * rad * fit; need_h = h * fit
cam.data.ortho_scale = max(need_w, need_h * W / H) if W >= H else max(need_h, need_w * H / W)
pitch = math.radians(CFG.get('pitch', 4)); dist = max(h, rad) * 6
cam.location = Vector((ctr.x, ctr.y - dist * math.cos(pitch), ctr.z + dist * math.sin(pitch)))
cam.rotation_euler = (ctr - cam.location).to_track_quat('-Z', 'Y').to_euler()
cam.data.clip_start = dist * .05; cam.data.clip_end = dist * 3
sc.camera = cam


def light(name, energy, rot):
    L = bpy.data.objects.new(name, bpy.data.lights.new(name, 'SUN')); sc.collection.objects.link(L)
    L.data.energy = energy; L.rotation_euler = [math.radians(a) for a in rot]
k = CFG.get('light', 1.0)
light('key', 4.2 * k, (52, 0, -38)); light('fill', .9 * k, (70, 0, 60)); light('rim', 3.0 * k, (-60, 0, 150))
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
for i, yaw in enumerate(CFG.get('yaws', [0])):
    piv.rotation_euler = (0, 0, math.radians(yaw))
    sc.render.filepath = f"{CFG['out']}{i:03d}.png"
    bpy.ops.render.render(write_still=True)
piv.rotation_euler = (0, 0, 0)
result = {'bbox': [list(round(v, 3) for v in mn), list(round(v, 3) for v in mx)], 'ctr': list(round(v, 3) for v in ctr), 'rad': round(rad, 3), 'n': len(CFG.get('yaws', [0]))}
