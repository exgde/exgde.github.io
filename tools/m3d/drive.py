"""Monta as configurações e chama o Blender. uso: python drive.py <job> [<job> ...]"""
import json, os, subprocess, sys

B = os.path.dirname(os.path.abspath(__file__)).replace('\\', '/')
BL = r"C:\Program Files\Blender Foundation\Blender 5.2\blender.exe"
WW1 = r"C:\Users\jbmid\OneDrive\Desktop\Projetos\Projetos Unreal Engine\WW1-THRILLER\SourceArt"
GOLD = r"E:\Projetos Unity\gbc-pirate-old-gold\Assets\Art"
TAC = r"E:\Backup PC\Project_DarknessFramework\Project_DarknessFramework 5.8\Saved\TacticalSoldierSwap\blender\SK_TacticalSoldier_maosManny.blend"

SENT = WW1 + r"\Sentinel\SK_Sentinel.blend"
SENT_SKIP = ["GloveSource", "REF_Manny_fit", "REF_Manny_Original"]

# pose de referência: em pé, pernas afastadas, braços soltos e um pouco abertos, cotovelos levemente dobrados
POSE = json.load(open(B + '/pose.json', encoding='utf-8')) if os.path.exists(B + '/pose.json') else {}

JOBS = {
    'rest': dict(src=SENT, out='t/rest_', yaws=[0, 90], size=[360, 640], skip=SENT_SKIP),
    'pose': dict(src=SENT, out='t/pose_', yaws=[0, 90, 35], size=[360, 640], skip=SENT_SKIP, pose=POSE),
    'turn': dict(src=SENT, out='r/turn_', yaws=[i * 10 for i in range(36)], size=[440, 800], skip=SENT_SKIP, pose=POSE, fit=1.06),
    'head': dict(src=TAC, out='r/head_', yaws=[-28], size=[520, 520], zmin=.845, pitch=2, fit=1.1),
    'player': dict(src=GOLD + r"\Character\Player.glb", out='r/player_', yaws=[205, 155, 25], size=[360, 520], skip=['Icosphere'], action_frame=1),
    'pirate1': dict(src=GOLD + r"\Enemies\Pirate1\Pirate1.fbx", out='r/pirate1_', yaws=[-20], size=[420, 520]),
    'pirate2': dict(src=GOLD + r"\Enemies\Pirate2\Pirate2.fbx", out='r/pirate2_', yaws=[15], size=[420, 520]),
    'pirate3': dict(src=GOLD + r"\Enemies\Pirate3\Pirate3.fbx", out='r/pirate3_', yaws=[-12], size=[420, 520]),
    'w1897': dict(src=WW1 + r"\W1897\out\SK_W1897.blend", out='r/w1897_', yaws=[90], size=[760, 300], pitch=8, fit=1.12),
    'fn1910': dict(src=WW1 + r"\FN1910\out\SK_FN1910.blend", out='r/fn1910_', yaws=[90], size=[460, 380], pitch=6, fit=1.12, skip=['FN1910_HIGH']),
    'musket': dict(src=GOLD + r"\Weapons\musket.fbx", out='r/musket_', yaws=[0], size=[700, 300], pitch=10, fit=1.12),
    'cutlass': dict(src=GOLD + r"\Weapons\cutlass.fbx", out='r/cutlass_', yaws=[70], size=[260, 620], pitch=4, fit=1.1),
    'lighter': dict(src=WW1 + r"\Lighter\out\SM_Lighter.blend", out='r/lighter_', yaws=[-25], size=[300, 520], pitch=6, fit=1.1),
}

os.makedirs(B + '/t', exist_ok=True); os.makedirs(B + '/r', exist_ok=True)
for name in sys.argv[1:]:
    cfg = dict(JOBS[name]); cfg['out'] = B + '/' + cfg['out']
    p = B + '/t/_' + name + '.json'
    json.dump(cfg, open(p, 'w', encoding='utf-8'))
    r = subprocess.run([BL, '-b', '-P', B + '/render.py', '--', p], capture_output=True, text=True, errors='replace')
    lines = [l for l in (r.stdout + r.stderr).splitlines() if l.startswith('###') or 'Error' in l or 'Traceback' in l]
    print(name, '|', ' | '.join(lines)[:400])
