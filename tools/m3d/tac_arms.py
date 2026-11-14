"""Abaixa os braços do soldado tático (ele vem em pose A/T) para os ombros ficarem naturais no busto."""
import bpy, math
from mathutils import Matrix
vl = bpy.context.view_layer
arm = next(o for o in bpy.data.objects if o.type == 'ARMATURE')
names = [b.name for b in arm.pose.bones]
done = []
for pb in arm.pose.bones:
    n = pb.name.lower()
    if 'upperarm' in n and 'twist' not in n and 'corrective' not in n and '_' in n and n.count('_') == 1:
        head = (arm.matrix_world @ pb.matrix).translation
        tail = (arm.matrix_world @ pb.matrix) @ Matrix.Translation((0, pb.length, 0))
        side = 1 if head.x > 0 else -1
        ang = math.radians(52) * side
        q = Matrix.Rotation(ang, 4, 'Y') @ Matrix.Rotation(math.radians(8), 4, 'X')
        pb.matrix = arm.matrix_world.inverted() @ Matrix.Translation(head) @ q @ Matrix.Translation(-head) @ arm.matrix_world @ pb.matrix
        vl.update()
        done.append((pb.name, round(head.x, 2)))
result = {'done': done, 'arm_bones': [n for n in names if 'arm' in n.lower()][:20]}
