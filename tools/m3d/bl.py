"""Manda um script para o Blender aberto, pela conexão MCP (porta 9876).
uso: python bl.py <arquivo.py> [timeout_s]"""
import json, socket, sys

code = open(sys.argv[1], encoding='utf-8').read()
tmo = float(sys.argv[2]) if len(sys.argv) > 2 else 600
s = socket.create_connection(('127.0.0.1', 9876), timeout=10)
s.settimeout(tmo)
s.sendall(json.dumps({'type': 'execute', 'code': code, 'strict_json': False}).encode() + b'\0')
buf = b''
while True:
    c = s.recv(1 << 16)
    if not c: break
    buf += c
    if buf.endswith(b'\0'): break
s.close()
txt = buf.rstrip(b'\0').decode('utf-8', 'replace')
try:
    d = json.loads(txt)
    for k in ('status', 'message', 'stdout', 'stderr', 'result'):
        if k in d: print('[%s]' % k, d[k] if isinstance(d[k], str) else json.dumps(d[k], ensure_ascii=False)[:4000])
    for k in d:
        if k not in ('status', 'message', 'stdout', 'stderr', 'result'): print('[%s]' % k, str(d[k])[:2000])
except Exception:
    print(txt[:4000])
