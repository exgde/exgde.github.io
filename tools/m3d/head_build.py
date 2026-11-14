"""Cena só com a cabeça do soldado tático (via MCP no Blender aberto)."""
import bpy, bmesh
from mathutils import Vector
TAC = r"E:\Backup PC\Project_DarknessFramework\Project_DarknessFramework 5.8\Saved\TacticalSoldierSwap\blender\SK_TacticalSoldier_maosManny.blend"
ZMIN = -1          # corpo inteiro: o recorte agora é feito na imagem
sc = bpy.context.scene; vl = bpy.context.view_layer
for o in list(bpy.data.objects):
    bpy.data.objects.remove(o, do_unlink=True)
with bpy.data.libraries.load(TAC, link=False) as (src, dst):
    dst.objects = list(src.objects)
for o in dst.objects:
    if o is None: continue
    if o.type in ('CAMERA', 'LIGHT') or (o.type == 'MESH' and o.hide_render):
        bpy.data.objects.remove(o); continue
    sc.collection.objects.link(o)
vl.update()
meshes = [o for o in bpy.data.objects if o.type == 'MESH']
zs = [(o.matrix_world @ v.co).z for o in meshes for v in o.data.vertices]
zc = min(zs) + (max(zs) - min(zs)) * ZMIN
for o in meshes:
    bm = bmesh.new(); bm.from_mesh(o.data)
    dead = [v for v in bm.verts if (o.matrix_world @ v.co).z < zc]
    bmesh.ops.delete(bm, geom=dead, context='VERTS')
    bm.to_mesh(o.data); bm.free(); o.data.update()
vl.update()
result = {'objs': [(o.name, o.type, len(o.data.vertices) if o.type == 'MESH' else 0) for o in bpy.data.objects]}
