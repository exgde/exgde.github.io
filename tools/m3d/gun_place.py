"""Encaixa a escopeta: punho na palma direita, mão esquerda levada até a telha (IK de 2 ossos)."""
import bpy, json, math
from mathutils import Matrix, Vector
P = json.load(open(r"C:\Users\jbmid\AppData\Local\Temp\claude\862c1e55cdab38e6\8b18033e-9010-4a91-86b3-b64bc450ae61\scratchpad\m3d\t\_gun.json"))
vl = bpy.context.view_layer
gp = bpy.data.objects['GUN_PIV']; arm = bpy.data.objects['SENT_ARM']
for o in (gp, arm):
    if o.parent:
        mw = o.matrix_world.copy(); o.parent = None; o.matrix_world = mw
if 'G0' not in gp: gp['G0'] = [list(r) for r in gp.matrix_world]
G0 = Matrix([list(r) for r in gp['G0']])
# volta à pose-base (a do Unreal) e aplica os ajustes: { osso: [rx, ry, rz] } em graus, eixos do mundo
import os
from mathutils import Euler
BASE = "C:/Users/jbmid/AppData/Local/Temp/claude/862c1e55cdab38e6/8b18033e-9010-4a91-86b3-b64bc450ae61/scratchpad/m3d/t/_base.json"
for c in list(arm.pose.bones['lowerarm_l'].constraints):
    arm.pose.bones['lowerarm_l'].constraints.remove(c)
if 'L0' in arm:
    for n, m in zip(('upperarm_l', 'lowerarm_l', 'hand_l'), arm['L0']):
        arm.pose.bones[n].matrix_basis = Matrix([list(r) for r in m])
    del arm['L0']
vl.update()
if not os.path.exists(BASE):
    json.dump({pb.name: [list(r) for r in pb.matrix_basis] for pb in arm.pose.bones}, open(BASE, 'w'))
for n, m in json.load(open(BASE)).items():
    arm.pose.bones[n].matrix_basis = Matrix(m)
vl.update()
def depth(b):
    k = 0
    while b.parent: b = b.parent; k += 1
    return k
def wrot(name, e):
    pb = arm.pose.bones[name]; head = (arm.matrix_world @ pb.matrix).translation
    q = Euler([math.radians(v) for v in e], 'XYZ').to_matrix().to_4x4()
    pb.matrix = arm.matrix_world.inverted() @ Matrix.Translation(head) @ q @ Matrix.Translation(-head) @ arm.matrix_world @ pb.matrix
    vl.update()
tw = P.get('tweak', {})
for n in sorted(tw, key=lambda n: depth(arm.pose.bones[n])):
    wrot(n, tw[n])

def W(n): return (arm.matrix_world @ arm.pose.bones[n].matrix).translation.copy()
palm = W('hand_r') * .45 + W('middle_01_r') * .55
R = (G0 @ Matrix.Rotation(math.radians(-90), 4, 'Z')).to_3x3().normalized()      # orientação do socket (cano para a frente)
# ajustes finos em volta dos eixos do mundo: yaw (Z) e pitch (X)
R = Matrix.Rotation(math.radians(P.get('yaw', 0)), 3, 'Z') @ Matrix.Rotation(math.radians(P.get('pitch', 0)), 3, 'X') @ R
R = R @ Matrix.Rotation(math.radians(P.get('roll', 0)), 3, 'X')                   # rolagem em volta do próprio cano
grip = Vector(P.get('grip', [-3, 0, 1]))
t = palm + Vector(P.get('off', [0, 0, 0])) - R @ grip
gp.matrix_world = Matrix.Translation(t) @ R.to_4x4()
vl.update()

# ---- braço esquerdo até a telha: IK de dois ossos, feito na mão (mantém o cotovelo do lado em que já estava) ----
def turn(name, v_from, v_to):
    pb = arm.pose.bones[name]
    q = v_from.rotation_difference(v_to).to_matrix().to_4x4()
    Ai = arm.matrix_world.inverted()
    head = (arm.matrix_world @ pb.matrix).translation
    Mw = Matrix.Translation(head) @ q @ Matrix.Translation(-head) @ arm.matrix_world @ pb.matrix
    pb.matrix = Ai @ Mw
    vl.update()

if 'L0' not in arm:      # guarda a pose original do braço para poder refazer
    arm['L0'] = [[list(r) for r in arm.pose.bones[n].matrix_basis] for n in ('upperarm_l', 'lowerarm_l', 'hand_l')]
for n, m in zip(('upperarm_l', 'lowerarm_l', 'hand_l'), arm['L0']):
    arm.pose.bones[n].matrix_basis = Matrix([list(r) for r in m])
vl.update()
gb = (R @ Vector((1, 0, 0))).normalized(); gu = (R @ Vector((0, 0, 1))).normalized(); gr = gb.cross(gu).normalized()   # cano, cima, direita do atirador
LG = P.get('lgrip')
if LG:      # mão esquerda por baixo da arma: punho à esquerda e abaixo, palma para cima
    S0 = W('upperarm_l'); reach0 = (W('lowerarm_l') - S0).length + (W('hand_l') - W('lowerarm_l')).length
    gx = LG.get('x', 28)
    while True:
        T = gp.matrix_world @ Vector((gx, 0, LG.get('z', 3.5))) - gr * LG.get('side', 7) - gu * LG.get('down', 1.5)
        if (T - S0).length <= reach0 - .3 or gx <= 6: break
        gx -= 1
else:
    gx = None
    T = gp.matrix_world @ Vector(P.get('pump', [30, 0, 0]))
S, E, Wr = W('upperarm_l'), W('lowerarm_l'), W('hand_l')
la, lb = (E - S).length, (Wr - E).length
d = min((T - S).length, la + lb - .05)
dirv = (T - S).normalized()
x = (la * la - lb * lb + d * d) / (2 * d)
h = math.sqrt(max(la * la - x * x, 0))
hint = (E - S) + Vector(P.get('elbow', [0, 0, 0]))
perp = hint - dirv * hint.dot(dirv)
perp = perp.normalized() if perp.length > 1e-4 else Vector((0, 0, -1))
E2 = S + dirv * x + perp * h
turn('upperarm_l', (E - S).normalized(), (E2 - S).normalized())
E, Wr = W('lowerarm_l'), W('hand_l')
turn('lowerarm_l', (Wr - E).normalized(), (S + dirv * d - E).normalized())
if P.get('hand_l_rot'):
    from mathutils import Euler
    pb = arm.pose.bones['hand_l']; head = (arm.matrix_world @ pb.matrix).translation
    q = Euler([math.radians(v) for v in P['hand_l_rot']], 'XYZ').to_matrix().to_4x4()
    pb.matrix = arm.matrix_world.inverted() @ Matrix.Translation(head) @ q @ Matrix.Translation(-head) @ arm.matrix_world @ pb.matrix
    vl.update()
if LG:
    def rot_about(name, M3):
        pb = arm.pose.bones[name]; head = (arm.matrix_world @ pb.matrix).translation
        pb.matrix = arm.matrix_world.inverted() @ Matrix.Translation(head) @ M3.to_4x4() @ Matrix.Translation(-head) @ arm.matrix_world @ pb.matrix
        vl.update()
    f0 = (W('middle_01_l') - W('hand_l')).normalized()
    t0 = W('thumb_01_l') - W('hand_l'); t0 = (t0 - f0 * t0.dot(f0)).normalized()
    al = math.radians(LG.get('fwd', 15))
    fd = (gr * math.cos(al) + gb * math.sin(al)).normalized(); td = (gb * math.cos(al) - gr * math.sin(al)).normalized()
    M0 = Matrix((f0, t0, f0.cross(t0))).transposed(); M1 = Matrix((fd, td, fd.cross(td))).transposed()
    rot_about('hand_l', M1 @ M0.transposed())
    if LG.get('roll'): rot_about('hand_l', Matrix.Rotation(math.radians(LG['roll']), 3, td))
    # dedos sobem pelo lado direito da arma; o polegar sobe pelo lado esquerdo
    cf = LG.get('curl', [20, 45, 35])
    for fn in ('index', 'middle', 'ring', 'pinky'):
        for k, ang in zip(('01', '02', '03'), cf):
            rot_about('%s_%s_l' % (fn, k), Matrix.Rotation(math.radians(ang), 3, -td))
    ct = LG.get('thumb', [35, 20, 15])
    for k, ang in zip(('01', '02', '03'), ct):
        rot_about('thumb_%s_l' % k, Matrix.Rotation(math.radians(ang), 3, fd))
tgt = T
result = {'palm': [round(v, 1) for v in palm], 'muzzle': [round(v, 1) for v in gp.matrix_world @ Vector((67, 0, 8))],
          'hand_l': [round(v, 1) for v in W('hand_l')], 'tgt': [round(v, 1) for v in tgt], 'reach': round(la + lb, 1), 'dist': round((T - S).length, 1), 'gx': gx}
