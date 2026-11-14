"""Grava a pose (espaço do componente) e a pose de referência de cada osso das animações de escopeta.
Roda dentro do UnrealEditor-Cmd. Saída: anim/<nome>.json"""
import unreal, os, json

OUT = r"C:\Users\jbmid\AppData\Local\Temp\claude\862c1e55cdab38e6\8b18033e-9010-4a91-86b3-b64bc450ae61\scratchpad\m3d\anim"
os.makedirs(OUT, exist_ok=True)
ASSETS = [
    "/Game/_DARKNESS/Animations/Shotgun/AS_Aiming_Shotgun",
    "/Game/_DARKNESS/Animations/Shotgun/AS_Shotgun_Relaxed",
]
X = unreal.AnimPoseExtensions
W = unreal.AnimPoseSpaces.WORLD


def tf(t):
    l, q = t.translation, t.rotation
    return [l.x, l.y, l.z, q.x, q.y, q.z, q.w]


for path in ASSETS:
    a = unreal.load_asset(path)
    if not a:
        unreal.log_error("M3D sem asset " + path); continue
    try:
        opt = unreal.AnimPoseEvaluationOptions()
        pose = X.get_anim_pose_at_frame(a, 0, opt)
        names = [str(n) for n in X.get_bone_names(pose)]
        d = {}
        for n in names:
            d[n] = {'pose': tf(X.get_bone_pose(pose, n, W)), 'ref': tf(X.get_ref_bone_pose(pose, n, W))}
        json.dump(d, open(os.path.join(OUT, a.get_name() + ".json"), 'w'))
        unreal.log("M3D ok %s bones=%d" % (a.get_name(), len(names)))
    except Exception as e:
        unreal.log_error("M3D falhou %s: %s" % (path, e))
