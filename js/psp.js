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
const BUS = window.PF_BUS;
const stage = document.getElementById('machine');
const canvas = document.getElementById('pspCanvas');
const loading = document.getElementById('pspLoading');
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
    g.fillText(p.title || '', 40, SH - 78, SW - 80);
  }
  g.font = '30px VT323, monospace'; g.fillStyle = 'rgba(255,255,255,.75)';
  g.fillText([p.stack, p.year].filter(Boolean).join(' · ').toUpperCase(), 40, SH - 36, SW - 80);
}

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
new IntersectionObserver((es) => { onScreen = es[0].isIntersecting; start(); }, { threshold: .02 }).observe(stage);
document.addEventListener('visibilitychange', start);

/* ------------------------------------------------------------
   Reserva: sem WebGL ou sem modelo, a tela vai plana na página
   ------------------------------------------------------------ */
function flat(reason) {
  console.warn('[psp] usando a tela plana:', reason);
  canvas.style.display = 'none';
  loading.classList.add('is-off');
  scr.className = 'machine__flat';
  stage.appendChild(scr);
  frameFn = drawScreen;
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

  function resize() {
    const w = stage.clientWidth, h = stage.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // enquadra pelo lado que apertar primeiro: largura (celular) ou altura (desktop)
    const need = Math.max(WIDTH / .84 / camera.aspect, height / .58);
    camera.position.set(0, 0, need / (2 * Math.tan(THREE.MathUtils.degToRad(FOV) / 2)));
    camera.updateProjectionMatrix();
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
    resize();

    loading.classList.add('is-off');
    let riseFrom = null;           // o PSP sobe na primeira vez que aparece

    frameFn = (now) => {
      const t = now / 1000;
      drawScreen(now);
      tex.needsUpdate = true;

      if (riseFrom === null) riseFrom = now;
      const q = reduce ? 1 : Math.min(1, (now - riseFrom) / 1500);
      const rise = 1 - Math.pow(1 - q, 4);
      kick *= .9;
      const calm = reduce ? 0 : 1;
      const ry = px * .38 * calm + kick, rx = py * .2 * calm - .04;
      pivot.rotation.y += (ry - pivot.rotation.y) * .07;
      pivot.rotation.x += (rx - pivot.rotation.x) * .07;
      pivot.rotation.z = Math.sin(t * .5) * .012 * calm;
      pivot.position.y = (rise - 1) * 2.4 + Math.sin(t * .8) * .035 * calm;
      renderer.render(scene, camera);
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
