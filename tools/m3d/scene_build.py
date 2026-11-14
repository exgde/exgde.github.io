"""Monta a cena no Blender aberto (via MCP): soldado do WW1-Thriller na pose de mira
com a escopeta, com a W1897 presa no socket da mão direita."""
import bpy, json, math
from mathutils import Matrix, Quaternion, Vector

B = r"C:\Users\jbmid\AppData\Local\Temp\claude\862c1e55cdab38e6\8b18033e-9010-4a91-86b3-b64bc450ae61\scratchpad\m3d"
WW1 = r"C:\Users\jbmid\OneDrive\Desktop\Projetos\Projetos Unreal Engine\WW1-THRILLER\SourceArt"
SENT = WW1 + r"\Sentinel\SK_Sentinel.blend"
GUN = WW1 + r"\W1897\out\SK_W1897.blend"
SKIP = {"GloveSource", "REF_Manny_fit", "REF_Manny_Original"}
log = []
U = 1.0          # os .blend do projeto estão em centímetros, como o Unreal

# ---- cena limpa ----
for o in list(bpy.data.objects):
    bpy.data.objects.remove(o, do_unlink=True)
sc = bpy.context.scene
vl = bpy.context.view_layer


def append(path, skip=()):
    with bpy.data.libraries.load(path, link=False) as (src, dst):
        dst.objects = [n for n in src.objects if n not in skip]
    out = []
    for o in dst.objects:
        if o is None or o.type in ('CAMERA', 'LIGHT'):
            if o: bpy.data.objects.remove(o)
            continue
        sc.collection.objects.link(o); out.append(o)
    return out


sent = append(SENT, SKIP)
for o in list(sent):
    if o.type == 'MESH' and o.hide_render:
        sent.remove(o); bpy.data.objects.remove(o, do_unlink=True)
arm = next(o for o in sent if o.type == 'ARMATURE')
arm.name = 'SENT_ARM'
log.append(('sent', [(o.name, o.type) for o in sent], 'arm scale', tuple(arm.scale), 'rot', tuple(arm.rotation_euler)))

# ---- pose vinda do Unreal ----
M = Matrix.Diagonal((1, -1, 1))            # Unreal (mão esquerda) -> Blender: espelha Y


def ue_rot(t):                              # [x y z qx qy qz qw] -> 3x3 no Blender
    return M @ Quaternion((t[6], t[3], t[4], t[5])).to_matrix() @ M


def ue_loc(t):
    return Vector((t[0], -t[1], t[2])) * U


def ue_mat(t):
    return Matrix.Translation(ue_loc(t)) @ ue_rot(t).to_4x4()


def apply_pose(name):
    d = json.load(open(B + '/anim/' + name + '.json'))
    for pb in arm.pose.bones:
        pb.matrix_basis = Matrix.Identity(4)
    vl.update()
    A = arm.matrix_world.to_3x3().normalized()
    Ai = A.inverted()

    def depth(b):
        n = 0
        while b.parent: b = b.parent; n += 1
        return n
    for pb in sorted(arm.pose.bones, key=depth):
        t = d.get(pb.name)
        if not t: continue
        D = ue_rot(t['pose']) @ ue_rot(t['ref']).inverted()          # giro do repouso até a pose, no mundo
        rest = pb.bone.matrix_local.to_3x3().normalized()
        new = (Ai @ D @ A @ rest).to_4x4()
        head = pb.matrix.to_translation()
        if pb.name == 'pelvis':                                       # a bacia também desce/desloca
            dl = ue_loc(t['pose']) - ue_loc(t['ref'])
            head = head + arm.matrix_world.inverted().to_3x3() @ dl
        new.translation = head
        pb.matrix = new
        vl.update()
    return d


d = apply_pose('AS_Aiming_Shotgun')

# ---- escopeta no socket ShotgunS da mão direita ----
gun = append(GUN)
log.append(('gun', [(o.name, o.type, tuple(round(v, 3) for v in o.dimensions)) for o in gun]))
sock = json.load(open(WW1 + r"\Sentinel\manny_mesh_sockets.json"))["ShotgunS"]
p, y, r = [math.radians(v) for v in sock['rot']]
CP, SP, CY, SY, CR, SR = math.cos(p), math.sin(p), math.cos(y), math.sin(y), math.cos(r), math.sin(r)
Rs = Matrix(((CP * CY, SR * SP * CY - CR * SY, -(CR * SP * CY + SR * SY)),
             (CP * SY, SR * SP * SY + CR * CY, CY * SR - CR * SP * SY),
             (SP, -SR * CP, CR * CP)))
S = Matrix.Translation(Vector((sock['loc'][0], -sock['loc'][1], sock['loc'][2])) * U) @ (M @ Rs @ M).to_4x4()
hb = arm.pose.bones['hand_r']
Pw = arm.matrix_world @ hb.matrix
Rw = arm.matrix_world @ hb.bone.matrix_local
# tira a escala do armature dessas duas (só a parte rígida interessa)
def rigid(m):
    l, q, s = m.decompose()
    return Matrix.Translation(l) @ q.to_matrix().to_4x4()
G = rigid(Pw) @ rigid(Rw).inverted() @ ue_mat(d['hand_r']['ref']) @ S
gp = bpy.data.objects.new('GUN_PIV', None); sc.collection.objects.link(gp)
for o in gun:
    if o.parent is None:
        mw = o.matrix_world.copy(); o.parent = gp; o.matrix_world = mw
gp.matrix_world = G
vl.update()

hl = arm.matrix_world @ arm.pose.bones['hand_l'].matrix
log.append(('hand_r', tuple(round(v, 3) for v in Pw.translation), 'hand_l', tuple(round(v, 3) for v in hl.translation),
            'ue hand_r', tuple(round(v, 3) for v in ue_loc(d['hand_r']['pose'])), 'ue hand_l', tuple(round(v, 3) for v in ue_loc(d['hand_l']['pose']))))
result = {'log': log}
