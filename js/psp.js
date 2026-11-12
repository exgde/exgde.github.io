/* ============================================================
   A MÁQUINA — o PSP em 3D com os projetos na tela.

   · A tela é um <canvas> 2D comum (960×544) desenhado a cada quadro:
     captura ou vídeo do projeto, um HUD em mono e linhas de CRT.
   · Esse canvas vira a textura da malha "screen" do modelo.
   · O modelo é endireitado pela normal da tela, então não importa em
     que posição ele foi exportado.

   Modelo: "Sony PSP" por Ilya Ostrovsky (Sketchfab), CC BY 4.0.
   Se o modelo não carregar, a mesma tela aparece plana na página.
   ============================================================ */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const MODEL = 'assets/models/psp.glb';

/* Quanto o PSP gira, em radianos (1 rad ≈ 57°). Aumente para soltar mais. */
const TILT_Y = .75;   // esquerda/direita seguindo o cursor (era .38)
const TILT_X = .36;   // cima/baixo seguindo o cursor (era .2)
const SWAY = .12;     // balanço próprio, mesmo com o cursor parado
const BUS = window.PF_BUS;
const stage = document.getElementById('machine');
const canvas = document.getElementById('pspCanvas');
const loading = document.getElementById('pspLoading');
const keys = document.getElementById('keys');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const pad = (n) => String(n).padStart(2, '0');

/* ------------------------------------------------------------
   A tela
   ------------------------------------------------------------ */
const SW = 960, SH = 544;
const scr = document.createElement('canvas');
scr.width = SW; scr.height = SH;
const g = scr.getContext('2d');

const media = new Map();          // índice → { img?, vid? }, criado só quando o projeto é escolhido
let switchedAt = performance.now();

function mediaFor(i) {
  if (media.has(i)) return media.get(i);
  const p = BUS.projects[i] || {}, m = {};
  if (p.vid) {
    m.vid = document.createElement('video');
    m.vid.muted = true; m.vid.loop = true; m.vid.playsInline = true; m.vid.preload = 'auto';
    m.vid.src = p.vid;
    // o projeto que abre a página não passa pelo BUS.on: sem este play() o vídeo ficava parado no 1º quadro
    if (i === BUS.index) m.vid.play().catch(() => {});
  } else if (p.img) {
    m.img = new Image();
    m.img.src = p.img;
  }
  media.set(i, m);
  return m;
}

function cover(src, w, h) {       // preenche a tela inteira, cortando o excesso
  const k = Math.max(SW / w, SH / h), dw = w * k, dh = h * k;
  g.drawImage(src, (SW - dw) / 2, (SH - dh) / 2, dw, dh);
}

function placeholder(p, i, now) {
  g.strokeStyle = 'rgba(255,255,255,.07)'; g.lineWidth = 1;
  g.beginPath();
  for (let x = 0; x <= SW; x += 48) { g.moveTo(x + .5, 0); g.lineTo(x + .5, SH); }
  for (let y = 0; y <= SH; y += 48) { g.moveTo(0, y + .5); g.lineTo(SW, y + .5); }
  g.stroke();

  g.fillStyle = 'rgba(255,255,255,.1)';
  g.font = '420px VT323, monospace'; g.textAlign = 'right'; g.textBaseline = 'alphabetic';
  g.fillText(pad(i + 1), SW - 40, SH - 70);

  g.fillStyle = '#fff'; g.textAlign = 'left';
  g.font = 'italic 76px "Helvetica Neue", Helvetica, Arial, sans-serif';
  g.fillText(p.title || '', 56, 270, SW - 112);
  g.font = '34px VT323, monospace'; g.fillStyle = 'rgba(255,255,255,.7)';
  const blink = reduce || Math.floor(now / 520) % 2 ? '_' : '';
  g.fillText((p.sub || '') + blink, 58, 322, SW - 116);
}

function hud(p, i, n, hasMedia) {
  const room = (keysX0 ? keysX0 - 28 : SW - 40) - 40;   // o texto de baixo para antes dos botões
  if (hasMedia) {                 // faixa escura para o texto ler por cima da captura
    const fade = g.createLinearGradient(0, SH - 170, 0, SH);
    fade.addColorStop(0, 'rgba(0,0,0,0)'); fade.addColorStop(1, 'rgba(0,0,0,.82)');
    g.fillStyle = fade; g.fillRect(0, SH - 170, SW, 170);
  }
  g.font = '32px VT323, monospace'; g.textBaseline = 'alphabetic';
  g.fillStyle = '#fff'; g.textAlign = 'left';
  g.fillText('▶ PLAY', 40, 54);
  g.textAlign = 'right';
  g.fillText(pad(i + 1) + '/' + pad(n), SW - 40, 54);
  g.textAlign = 'left';
  if (hasMedia) {
    g.font = 'italic 44px "Helvetica Neue", Helvetica, Arial, sans-serif';
    g.fillText(p.title || '', 40, SH - 78, room);
  }
  g.font = '30px VT323, monospace'; g.fillStyle = 'rgba(255,255,255,.75)';
  g.fillText([p.stack, p.year].filter(Boolean).join(' · ').toUpperCase(), 40, SH - 36, room);
}

/* ------------------------------------------------------------
   Botões na tela: ←, → e abrir ficam no canto de baixo à direita.
   São os <button>/<a> de verdade (teclado, leitor de tela, link),
   esticados por cima da tela com matrix3d para seguir o PSP em 3D.
   Em tela pequena (celular) não cabem: ficam no rodapé da página.
   ------------------------------------------------------------ */
const KEYS_PAD_X = 40, KEYS_PAD_Y = 30;   // margem até a borda da tela, em pixels da textura
const KEYS_PX = 84;                       // altura que os botões querem ter na textura...
const KEYS_MIN = 34, KEYS_MAX = 46;       // ...desde que fiquem entre isto na página (px CSS)
const KEYS_TEX_MAX = 120;                 // mais alto que isto na textura cobre a tela: vão para fora
let keysX0 = 0;                           // onde os botões começam na textura (0 = fora da tela)
let keysTexH = 0;                         // altura deles na textura, decidida no resize

function sizeKeys(screenPx) {             // screenPx = largura da tela do PSP na página, parado
  const per = screenPx / SW;              // px da página por px da textura
  const want = Math.min(KEYS_MAX, Math.max(KEYS_MIN, KEYS_PX * per));
  keysTexH = per > 0 && want / per <= KEYS_TEX_MAX ? want / per : 0;
  if (!keysTexH) placeKeys(null);
}

// matrix3d que leva o retângulo w×h do elemento para os 4 cantos q (sup. esq., sup. dir., inf. dir., inf. esq.)
function quadMatrix(w, h, q) {
  const [p0, p1, p2, p3] = q;
  const dx1 = p1.x - p2.x, dx2 = p3.x - p2.x, dx3 = p0.x - p1.x + p2.x - p3.x;
  const dy1 = p1.y - p2.y, dy2 = p3.y - p2.y, dy3 = p0.y - p1.y + p2.y - p3.y;
  const den = dx1 * dy2 - dx2 * dy1;
  const gx = (dx3 * dy2 - dx2 * dy3) / den, gy = (dx1 * dy3 - dx3 * dy1) / den;
  const a = p1.x - p0.x + gx * p1.x, b = p3.x - p0.x + gy * p3.x;
  const d = p1.y - p0.y + gx * p1.y, e = p3.y - p0.y + gy * p3.y;
  const m = [a / w, d / w, 0, gx / w, b / h, e / h, 0, gy / h, 0, 0, 1, 0, p0.x, p0.y, 0, 1];
  return 'matrix3d(' + m.map((v) => +v.toFixed(6)).join(',') + ')';
}

const corners = [{}, {}, {}, {}];
// toPage(x, y, out): ponto da textura (px) → ponto na seção (px CSS). null = botões fora da tela
function placeKeys(toPage) {
  const w = keys.offsetWidth, h = keys.offsetHeight;
  if (!toPage || !keysTexH || !w || !h) {
    if (keys.classList.contains('is-in-screen')) { keys.classList.remove('is-in-screen'); keys.style.transform = ''; }
    keysX0 = 0;
    return;
  }
  const x1 = SW - KEYS_PAD_X, y1 = SH - KEYS_PAD_Y, y0 = y1 - keysTexH, x0 = x1 - keysTexH * w / h;
  toPage(x0, y0, corners[0]); toPage(x1, y0, corners[1]);
  toPage(x1, y1, corners[2]); toPage(x0, y1, corners[3]);
  keys.style.transform = quadMatrix(w, h, corners);
  keys.classList.add('is-in-screen');
  keysX0 = x0;
}

// com o ponteiro nos botões o PSP para de seguir o cursor, senão eles fogem do clique
let hold = false;
keys.addEventListener('pointerenter', () => { hold = true; });
keys.addEventListener('pointerleave', () => { hold = false; });

function crt(now) {
  const dt = now - switchedAt;    // chuvisco rápido na troca de projeto
  if (dt < 260 && !reduce) {
    const a = 1 - dt / 260;
    for (let k = 0; k < 900; k++) {
      const v = Math.random() * 255 | 0;
      g.fillStyle = `rgba(${v},${v},${v},${a * .9})`;
      g.fillRect(Math.random() * SW, Math.random() * SH, 2 + Math.random() * 46, 3);
    }
  }
  g.fillStyle = 'rgba(0,0,0,.24)';
  for (let y = 0; y < SH; y += 4) g.fillRect(0, y, SW, 2);
  if (!reduce) {                  // faixa clara descendo devagar
    g.fillStyle = 'rgba(255,255,255,.045)';
    g.fillRect(0, (now * .06) % (SH + 140) - 140, SW, 140);
  }
  const vig = g.createRadialGradient(SW / 2, SH / 2, SH * .35, SW / 2, SH / 2, SW * .62);
  vig.addColorStop(0, 'rgba(0,0,0,0)'); vig.addColorStop(1, 'rgba(0,0,0,.5)');
  g.fillStyle = vig; g.fillRect(0, 0, SW, SH);
}

function drawScreen(now) {
  const i = BUS.index, n = BUS.projects.length, p = BUS.projects[i] || {};
  g.fillStyle = '#060606'; g.fillRect(0, 0, SW, SH);
  const m = mediaFor(i);
  let has = false;
  if (m.vid && m.vid.readyState >= 2) { cover(m.vid, m.vid.videoWidth, m.vid.videoHeight); has = true; }
  else if (m.img && m.img.complete && m.img.naturalWidth) { cover(m.img, m.img.naturalWidth, m.img.naturalHeight); has = true; }
  if (!has) placeholder(p, i, now);
  hud(p, i, n, has);
  crt(now);
}

let kick = 0;                     // empurrãozinho no PSP a cada troca
BUS.on((i, dir) => {
  switchedAt = performance.now();
  kick = dir * .22;
  media.forEach((m, k) => { if (m.vid) { if (k === i) m.vid.play().catch(() => {}); else m.vid.pause(); } });
  const m = mediaFor(i);
  if (m.vid) m.vid.play().catch(() => {});
});

/* ------------------------------------------------------------
   Ponteiro e arrasto
   ------------------------------------------------------------ */
let px = 0, py = 0, downX = null;
window.addEventListener('pointermove', (e) => {
  px = (e.clientX / innerWidth) * 2 - 1;
  py = (e.clientY / innerHeight) * 2 - 1;
}, { passive: true });
stage.addEventListener('pointerdown', (e) => { downX = e.clientX; });
stage.addEventListener('pointerup', (e) => {
  if (downX === null) return;
  const dx = e.clientX - downX; downX = null;
  if (Math.abs(dx) > 44) { if (dx < 0) BUS.next(); else BUS.prev(); }
});
stage.addEventListener('pointercancel', () => { downX = null; });

/* ------------------------------------------------------------
   Visibilidade: só desenha com a seção na tela
   ------------------------------------------------------------ */
let onScreen = false, running = false, frameFn = null;
function start() { if (!running && onScreen && !document.hidden && frameFn) { running = true; requestAnimationFrame(loop); } }
function loop(now) {
  if (!onScreen || document.hidden) { running = false; return; }
  frameFn(now);
  requestAnimationFrame(loop);
}
// o vídeo do projeto atual toca só com o PSP na tela (e volta a tocar quando a pessoa rola de volta até ele)
function syncVideo() {
  const m = media.get(BUS.index);
  if (!m || !m.vid) return;
  if (onScreen && !document.hidden) m.vid.play().catch(() => {}); else m.vid.pause();
}
new IntersectionObserver((es) => { onScreen = es[0].isIntersecting; start(); syncVideo(); }, { threshold: .02 }).observe(stage);
document.addEventListener('visibilitychange', () => { start(); syncVideo(); });

/* ------------------------------------------------------------
   Reserva: sem WebGL ou sem modelo, a tela vai plana na página
   ------------------------------------------------------------ */
function flat(reason) {
  console.warn('[psp] usando a tela plana:', reason);
  canvas.style.display = 'none';
  loading.classList.add('is-off');
  scr.className = 'machine__flat';
  stage.appendChild(scr);
  // tela plana: a textura vira a própria página, então a conta é só uma escala
  let box = null;
  const toPage = (x, y, out) => { out.x = box.left + x / SW * box.width; out.y = box.top + y / SH * box.height; };
  frameFn = (now) => {
    drawScreen(now);
    const r = scr.getBoundingClientRect(), s = stage.getBoundingClientRect();
    if (!box || r.width !== box.width) sizeKeys(r.width);
    box = { left: r.left - s.left, top: r.top - s.top, width: r.width, height: r.height };
    placeKeys(toPage);
  };
  BUS.modelReady();
  start();
}

/* ------------------------------------------------------------
   A cena
   ------------------------------------------------------------ */
function boot3d() {
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true }); }
  catch (err) { flat(err.message); return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), .04).texture;

  const FOV = 30;
  const camera = new THREE.PerspectiveCamera(FOV, 1, .1, 100);
  const key = new THREE.DirectionalLight(0xffffff, 2.4);
  key.position.set(-2.5, 3, 4);
  // carcaça preta em fundo preto: duas luzes por trás desenham a silhueta
  const rimL = new THREE.DirectionalLight(0xffffff, 5);
  rimL.position.set(-4, 2.5, -3);
  const rimR = new THREE.DirectionalLight(0xffffff, 5);
  rimR.position.set(4, 1.5, -3);
  const glow = new THREE.PointLight(0xffffff, 2.2, 7, 2);     // a própria tela ilumina a carcaça
  glow.position.set(0, .1, 1.1);
  scene.add(key, rimL, rimR, new THREE.HemisphereLight(0xffffff, 0x222222, .7));

  const pivot = new THREE.Group();
  pivot.add(glow);
  scene.add(pivot);

  const tex = new THREE.CanvasTexture(scr);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = renderer.capabilities.getMaxAnisotropy();

  const WIDTH = 4;                 // largura do PSP em unidades da cena
  let height = 1.8;
  let vw = 1, vh = 1;              // tamanho do palco em px CSS

  // a tela como plano: ponto(u, v) = O + u·A + v·B, no espaço da malha (achado no load)
  let screenMesh = null, screenW = 0;
  const uvO = new THREE.Vector3(), uvA = new THREE.Vector3(), uvB = new THREE.Vector3(), tmp = new THREE.Vector3();
  function screenPoint(u, v, out) {
    return out.copy(uvO).addScaledVector(uvA, u).addScaledVector(uvB, v).applyMatrix4(screenMesh.matrixWorld);
  }
  // pixel da textura → px na página (a CanvasTexture sobe com flipY: o topo do canvas é v = 1)
  function toPage(x, y, out) {
    screenPoint(x / SW, 1 - y / SH, tmp).project(camera);
    out.x = (tmp.x + 1) / 2 * vw;
    out.y = (1 - tmp.y) / 2 * vh;
  }

  function resize() {
    const w = stage.clientWidth, h = stage.clientHeight;
    if (!w || !h) return;
    vw = w; vh = h;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // enquadra pelo lado que apertar primeiro: largura (celular) ou altura (desktop)
    const need = Math.max(WIDTH / .84 / camera.aspect, height / .58);
    camera.position.set(0, 0, need / (2 * Math.tan(THREE.MathUtils.degToRad(FOV) / 2)));
    camera.updateProjectionMatrix();
    if (screenW) sizeKeys(screenW * h / need);   // largura da tela do PSP em px, com ele parado
  }
  new ResizeObserver(resize).observe(stage);

  new GLTFLoader().load(MODEL, (gltf) => {
    const model = gltf.scene;
    let screen = null;
    const extras = [];
    model.traverse((o) => {
      if (/ground/i.test(o.name)) extras.push(o);          // o chão que vem no arquivo
      if (o.isMesh && /screen/i.test(o.name)) screen = o;
      if (o.isMesh && o.material && o.material.emissive && !o.material.emissiveMap) o.material.emissive.set(0x000000);
      if (o.isMesh && o.material && 'envMapIntensity' in o.material) o.material.envMapIntensity = 1.6;
    });
    extras.forEach((o) => { if (o.parent) o.parent.remove(o); });

    model.updateMatrixWorld(true);
    if (screen) {
      // gira o modelo até a tela olhar para a câmera (+Z)
      const n = new THREE.Vector3().fromBufferAttribute(screen.geometry.attributes.normal, 0)
        .transformDirection(screen.matrixWorld);
      model.quaternion.premultiply(new THREE.Quaternion().setFromUnitVectors(n, new THREE.Vector3(0, 0, 1)));

      // a tela ocupa um retângulo do atlas de textura: estica esse retângulo para 0..1
      const uv = screen.geometry.attributes.uv;
      let u0 = Infinity, u1 = -Infinity, v0 = Infinity, v1 = -Infinity;
      for (let i = 0; i < uv.count; i++) {
        const u = uv.getX(i), v = uv.getY(i);
        u0 = Math.min(u0, u); u1 = Math.max(u1, u); v0 = Math.min(v0, v); v1 = Math.max(v1, v);
      }
      for (let i = 0; i < uv.count; i++) uv.setXY(i, (uv.getX(i) - u0) / (u1 - u0), (uv.getY(i) - v0) / (v1 - v0));
      uv.needsUpdate = true;
      screen.material = new THREE.MeshBasicMaterial({ map: tex, toneMapped: false });

      // mínimos quadrados de posição = O + u·A + v·B sobre os vértices: serve para pôr os botões na tela
      const pos = screen.geometry.attributes.position, p = new THREE.Vector3();
      const S = [0, 0, 0, 0, 0, 0], R = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];
      for (let i = 0; i < pos.count; i++) {
        const u = uv.getX(i), v = uv.getY(i);
        p.fromBufferAttribute(pos, i);
        S[0]++; S[1] += u; S[2] += v; S[3] += u * u; S[4] += u * v; S[5] += v * v;
        R[0].add(p); R[1].addScaledVector(p, u); R[2].addScaledVector(p, v);
      }
      const inv = new THREE.Matrix3().set(S[0], S[1], S[2], S[1], S[3], S[4], S[2], S[4], S[5]);
      if (inv.determinant() > 1e-9) {
        const e = inv.invert().elements;      // simétrica: linha = coluna
        [uvO, uvA, uvB].forEach((out, k) => {
          out.set(0, 0, 0);
          for (let j = 0; j < 3; j++) out.addScaledVector(R[j], e[j * 3 + k]);
        });
        screenMesh = screen;
      }
    } else {
      console.warn('[psp] não achei a malha da tela no modelo; os projetos não vão aparecer nele.');
    }

    model.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    model.position.sub(box.getCenter(new THREE.Vector3()));
    const k = WIDTH / size.x;
    const holder = new THREE.Group();
    holder.scale.setScalar(k);
    holder.add(model);
    pivot.add(holder);
    height = size.y * k;
    if (screenMesh) {
      pivot.updateMatrixWorld(true);   // o pivô ainda está parado aqui: mede a largura da tela em repouso
      screenW = screenPoint(0, .5, new THREE.Vector3()).distanceTo(screenPoint(1, .5, tmp));
    }
    resize();

    loading.classList.add('is-off');
    let riseFrom = null;           // o PSP sobe na primeira vez que aparece
    let aimY = 0, aimX = 0, rollZ = 0, bob = 0;

    frameFn = (now) => {
      const t = now / 1000;
      drawScreen(now);
      tex.needsUpdate = true;

      if (riseFrom === null) riseFrom = now;
      const q = reduce ? 1 : Math.min(1, (now - riseFrom) / 1500);
      const rise = 1 - Math.pow(1 - q, 4);
      kick *= .9;
      const calm = reduce ? 0 : 1;
      // o cursor inclina até TILT; por cima disso o PSP balança sozinho (SWAY).
      // Com o ponteiro nos botões (hold) a pose congela; só o empurrãozinho da troca continua.
      if (!hold) {
        aimY = (px * TILT_Y + Math.sin(t * .55) * SWAY) * calm;
        aimX = (py * TILT_X + Math.sin(t * .4 + 1.3) * SWAY * .45) * calm - .04;
        rollZ = Math.sin(t * .5) * .012 * calm;
        bob = Math.sin(t * .8) * .035 * calm;
      }
      pivot.rotation.y += (aimY + kick - pivot.rotation.y) * .09;
      pivot.rotation.x += (aimX - pivot.rotation.x) * .09;
      pivot.rotation.z = rollZ;
      pivot.position.y = (rise - 1) * 2.4 + bob;
      renderer.render(scene, camera);
      if (screenMesh) placeKeys(toPage);   // depois do render: as matrizes já estão no quadro atual
    };
    BUS.modelReady();
    start();
  }, undefined, (err) => {
    renderer.dispose();
    flat(err && err.message ? err.message : 'erro ao carregar ' + MODEL);
  });
}

if (document.fonts && document.fonts.load) document.fonts.load('32px VT323').catch(() => {});
boot3d();
