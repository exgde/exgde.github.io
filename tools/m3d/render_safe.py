"""Renderiza a cena aberta no Blender (via MCP) SEM mexer nela: a câmera e as luzes são temporárias
e giram em volta do modelo (dá no mesmo que girar o modelo); no fim tudo é apagado e as
configurações de render voltam ao que eram.
config (t/_render.json): out, yaws, size, fit, pitch, center ('pelvis' | [x, y]), light"""
import bpy, math, json
from mathutils import Vector

CFG = json.load(open("C:/Users/jbmid/AppData/Local/Temp/claude/862c1e55cdab38e6/8b18033e-9010-4a91-86b3-b64bc450ae61/scratchpad/m3d/t/_render.json"))
sc = bpy.context.scene; vl = bpy.context.view_layer
r = sc.render
keep = dict(engine=r.engine, rx=r.resolution_x, ry=r.resolution_y, rp=r.resolution_percentage, ft=r.film_transparent,
            fp=r.filepath, ff=r.image_settings.file_format, cm=r.image_settings.color_mode, cam=sc.camera, world=sc.world,
            vt=sc.view_settings.view_transform)
tmp = []
try:
    meshes = [o for o in sc.objects if o.type == 'MESH' and not o.hide_render and o.visible_get()]
    dg = bpy.context.evaluated_depsgraph_get()
    pts = []
    for o in meshes:
        ev = o.evaluated_get(dg); me = ev.to_mesh()
        step = max(1, len(me.vertices) // 20000)
        pts += [ev.matrix_world @ v.co for v in me.vertices[::step]]
        ev.to_mesh_clear()
    mn = Vector([min(p[i] for p in pts) for i in range(3)]); mx = Vector([max(p[i] for p in pts) for i in range(3)])
    ctr = (mn + mx) / 2; h = mx.z - mn.z
    c = CFG.get('center')
    if c == 'pelvis':
        arm = next(o for o in sc.objects if o.type == 'ARMATURE')
        pv = (arm.matrix_world @ arm.pose.bones['pelvis'].matrix).translation; ctr.x, ctr.y = pv.x, pv.y
    elif c: ctr.x, ctr.y = c
    rad = max(math.hypot(p.x - ctr.x, p.y - ctr.y) for p in pts)

    def new(name, data):
        o = bpy.data.objects.new(name, data); sc.collection.objects.link(o); tmp.append(o); return o
    piv = new('_tmp_piv', None); piv.location = (ctr.x, ctr.y, 0)
    W, H = CFG.get('size', [800, 800]); fit = CFG.get('fit', 1.06)
    cam = new('_tmp_cam', bpy.data.cameras.new('_tmp_cam')); cam.data.type = 'ORTHO'
    need_w = 2 * rad * fit; need_h = h * fit
    cam.data.ortho_scale = max(need_w, need_h * W / H) if W >= H else max(need_h, need_w * H / W)
    pitch = math.radians(CFG.get('pitch', 4)); dist = max(h, rad) * 6
    cam.location = Vector((ctr.x, ctr.y - dist * math.cos(pitch), ctr.z + dist * math.sin(pitch)))
    cam.rotation_euler = (ctr - cam.location).to_track_quat('-Z', 'Y').to_euler()
    cam.data.clip_start = dist * .05; cam.data.clip_end = dist * 3
    k = CFG.get('light', 1.0)
    for name, e, rot in (('key', 4.2, (52, 0, -38)), ('fill', .9, (70, 0, 60)), ('rim', 3.0, (-60, 0, 150))):
        L = new('_tmp_' + name, bpy.data.lights.new('_tmp_' + name, 'SUN')); L.data.energy = e * k
        L.rotation_euler = [math.radians(a) for a in rot]
    vl.update()
    for o in tmp[1:]:
        mw = o.matrix_world.copy(); o.parent = piv; o.matrix_world = mw
    w = bpy.data.worlds.new('_tmp_world'); w.use_nodes = True
    bg = w.node_tree.nodes.get('Background')
    if bg: bg.inputs[0].default_value = (1, 1, 1, 1); bg.inputs[1].default_value = .12 * k
    sc.world = w; sc.camera = cam
    for eng in ('BLENDER_EEVEE_NEXT', 'BLENDER_EEVEE'):
        try: r.engine = eng; break
        except Exception: pass
    r.resolution_x = W; r.resolution_y = H; r.resolution_percentage = 100; r.film_transparent = True
    r.image_settings.file_format = 'PNG'; r.image_settings.color_mode = 'RGBA'
    try: sc.view_settings.view_transform = 'Standard'
    except Exception: pass
    for i, yaw in enumerate(CFG.get('yaws', [0])):
        piv.rotation_euler = (0, 0, -math.radians(yaw))        # câmera para um lado = modelo para o outro
        r.filepath = f"{CFG['out']}{i:03d}.png"
        bpy.ops.render.render(write_still=True)
    result = {'bbox': [[round(v, 1) for v in mn], [round(v, 1) for v in mx]], 'ctr': [round(v, 1) for v in ctr], 'rad': round(rad, 1), 'n': len(CFG.get('yaws', [0]))}
finally:
    r.engine = keep['engine']; r.resolution_x = keep['rx']; r.resolution_y = keep['ry']; r.resolution_percentage = keep['rp']
    r.film_transparent = keep['ft']; r.filepath = keep['fp']
    r.image_settings.file_format = keep['ff']; r.image_settings.color_mode = keep['cm']
    sc.camera = keep['cam']; sc.world = keep['world']; sc.view_settings.view_transform = keep['vt']
    for o in tmp:
        d = o.data; bpy.data.objects.remove(o, do_unlink=True)
        if isinstance(d, bpy.types.Camera): bpy.data.cameras.remove(d)
        elif isinstance(d, bpy.types.Light): bpy.data.lights.remove(d)
    for w in [w for w in bpy.data.worlds if w.name.startswith('_tmp_world')]: bpy.data.worlds.remove(w)
