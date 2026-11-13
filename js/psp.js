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

function makeVid(src, loop) {
  const v = document.createElement('video');
  v.muted = true; v.loop = loop; v.playsInline = true; v.preload = 'auto';
  v.src = src;
  return v;
}

function mediaFor(i) {
  if (media.has(i)) return media.get(i);
  const p = BUS.projects[i] || {}, m = {};
  const clips = (p.vids && p.vids.length) ? p.vids : p.vid ? [p.vid] : [];
  if (p.img) {                    // capa: aparece enquanto o vídeo ainda carrega
    m.img = new Image();
    m.img.src = p.img;
  }
  if (clips.length) {
    m.vid = makeVid(clips[0], clips.length === 1);
    if (clips.length > 1) {
      /* vários clipes: um toca, o próximo já fica carregando no outro <video>.
         Quando um acaba, os dois trocam de papel e a tela dá um chuvisco rápido. */
      m.k = 0;
      m.next = makeVid(clips[1], false);
      const onEnd = (e) => {
        if (e.target !== m.vid) return;
        const old = m.vid;
        m.k = (m.k + 1) % clips.length;
        m.vid = m.next;
        m.vid.currentTime = 0;
        m.vid.play().catch(() => {});
        old.pause();
        old.src = clips[(m.k + 1) % clips.length];
        old.load();
        m.next = old;
        switchedAt = performance.now() - 90;   // chuvisco um pouco mais curto que o da troca de projeto
      };
      m.vid.addEventListener('ended', onEnd);
      m.next.addEventListener('ended', onEnd);
    }
    // o projeto que abre a página não passa pelo BUS.on: sem este play() o vídeo ficava parado no 1º quadro
    if (i === BUS.index) m.vid.play().catch(() => {});
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

/* toques na tela: um anel abre onde o dedo encostou (coordenadas do canvas da tela) */
const taps = [];
function tapRings(now) {
  for (let k = taps.length - 1; k >= 0; k--) {
    const t = Math.max(0, (now - taps[k].at) / 520);   // o quadro pode ter carimbo anterior ao toque
    if (t >= 1) { taps.splice(k, 1); continue; }
    const e = 1 - Math.pow(1 - t, 3);
    g.strokeStyle = `rgba(255,255,255,${(1 - t) * .9})`;
    g.lineWidth = 6 * (1 - t) + 1;
    g.beginPath(); g.arc(taps[k].x, taps[k].y, 14 + e * 110, 0, Math.PI * 2); g.stroke();
    g.fillStyle = `rgba(255,255,255,${(1 - t) * .18})`;
    g.beginPath(); g.arc(taps[k].x, taps[k].y, 10 + e * 40, 0, Math.PI * 2); g.fill();
  }
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
  tapRings(now);
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
let px = 0, py = 0;
/* Perto dos botões (anterior/próximo/abrir) o PSP congela: para de seguir o cursor e
   de balançar, para os botões não fugirem do dedo. NEAR_KEYS = folga em volta deles, em px. */
const NEAR_KEYS = 56;
let nearKeys = false, holdUntil = 0;
window.addEventListener('pointermove', (e) => {
  px = (e.clientX / innerWidth) * 2 - 1;
  py = (e.clientY / innerHeight) * 2 - 1;
  const k = document.querySelector('.keys.is-placed');
  if (k && e.pointerType === 'mouse') {
    const r = k.getBoundingClientRect();
    nearKeys = e.clientX > r.left - NEAR_KEYS && e.clientX < r.right + NEAR_KEYS &&
               e.clientY > r.top - NEAR_KEYS && e.clientY < r.bottom + NEAR_KEYS;
  }
}, { passive: true });
document.documentElement.addEventListener('pointerleave', () => { nearKeys = false; });   // mouse saiu da janela
// toque: encostar num botão segura o PSP parado por um instante
const keysEl = document.querySelector('.keys');
if (keysEl) keysEl.addEventListener('pointerdown', () => { holdUntil = performance.now() + 1600; });

/* Tocar em qualquer parte do PSP (carcaça, botões ou tela) leva ao próximo
   projeto. Arrastar para o lado continua trocando nos dois sentidos.
   pick() e poke() são preenchidos pela cena 3D (ou pela tela plana). */
let pick = () => null;            // (x, y) da página → o que foi tocado, ou null
let poke = () => {};              // reação ao dedo
let release = () => {};           // dedo saiu
let down = null;

function ring(x, y) {             // anel na página, onde o dedo encostou
  const r = stage.getBoundingClientRect(), el = document.createElement('i');
  el.className = 'poke';
  el.style.left = (x - r.left) + 'px'; el.style.top = (y - r.top) + 'px';
  stage.appendChild(el);
  el.addEventListener('animationend', () => el.remove());
  setTimeout(() => el.remove(), 900);
}

stage.addEventListener('pointerdown', (e) => {
  if (e.button > 0) return;
  const hit = pick(e.clientX, e.clientY, e.target);
  down = { x: e.clientX, y: e.clientY, hit };
  if (hit) {
    poke(hit, e);
    if (navigator.vibrate) navigator.vibrate(8);
  }
});
stage.addEventListener('pointerup', (e) => {
  release();
  if (!down) return;
  const dx = e.clientX - down.x, dy = e.clientY - down.y, hit = down.hit;
  down = null;
  if (Math.abs(dx) > 44) { if (dx < 0) BUS.next(); else BUS.prev(); }
  else if (hit && Math.hypot(dx, dy) < 14) BUS.next();
});
stage.addEventListener('pointercancel', () => { release(); down = null; });
/* anterior / próximo / abrir ficam no canto inferior direito da tela do PSP
   (placeKeys, a cada quadro) e só aparecem com o cursor em cima do modelo.
   Em cima dos próprios botões eles continuam acesos (CSS :hover). */
const keys = document.querySelector('.keys');
function overPsp(on) { if (keys) keys.classList.toggle('is-on', on); }
stage.addEventListener('pointerleave', () => { stage.style.cursor = ''; overPsp(false); });

// a mãozinha (e os botões) só aparecem em cima do PSP, não no espaço vazio em volta
let hoverQ = false, hx = 0, hy = 0, ht = null;
stage.addEventListener('pointermove', (e) => {
  if (e.pointerType !== 'mouse') return;
  hx = e.clientX; hy = e.clientY; ht = e.target;
  if (hoverQ) return;
  hoverQ = true;
  requestAnimationFrame(() => {
    hoverQ = false;
    const on = !!pick(hx, hy, ht);
    stage.style.cursor = on ? 'pointer' : '';
    overPsp(on);
  });
});

// posiciona os botões com o canto de baixo-direita deles no ponto (x, y) da página
function keysAt(x, y) {
  if (!keys) return;
  const h = keys.offsetParent ? keys.offsetParent.getBoundingClientRect() : { left: 0, top: 0 };
  keys.style.transform = `translate3d(${(x - h.left).toFixed(1)}px,${(y - h.top).toFixed(1)}px,0) translate(-100%,-100%)`;
  keys.classList.add('is-placed');
}

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
  pick = (x, y, target) => (target === scr ? { x, y } : null);
  poke = (hit, e) => {
    const r = scr.getBoundingClientRect();
    taps.push({ x: (e.clientX - r.left) / r.width * SW, y: (e.clientY - r.top) / r.height * SH, at: performance.now() });
    scr.animate([{ transform: 'translate(-50%,-50%) scale(.97)' }, { transform: 'translate(-50%,-50%)' }],
      { duration: 380, easing: 'cubic-bezier(.16,1,.3,1)' });
  };
  frameFn = (now) => {
    drawScreen(now);
    const r = scr.getBoundingClientRect();
    keysAt(r.right, r.bottom);
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

    /* ---- o dedo ----
       · o ponto tocado afunda: o PSP gira para longe dele e recua, numa mola
       · se foi um botão, o botão afunda de verdade enquanto o dedo está em cima
       · se foi a tela, um anel abre ali dentro, como em tela de toque */
    const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
    const spring = { rx: 0, ry: 0, z: 0, s: 0, vrx: 0, vry: 0, vz: 0, vs: 0 };
    let pressed = null;           // { obj, home, off, cur, target }
    const buttons = [];

    pick = (x, y) => {
      if (!BUS.pspAt) return null;
      const r = canvas.getBoundingClientRect();
      ndc.set(((x - r.left) / r.width) * 2 - 1, -((y - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      return ray.intersectObject(model, true)[0] || null;
    };

    poke = (hit, e) => {
      const local = pivot.worldToLocal(hit.point.clone());     // x: -2..2, y: ~-.9..9
      const f = reduce ? .35 : 1;
      spring.vry += local.x * 1.15 * f;                       // lado tocado vai para trás
      spring.vrx -= local.y * 1.6 * f;
      spring.vz -= 1.9 * f;                                    // e o aparelho todo recua
      spring.vs -= .55 * f;

      const o = hit.object;
      if (o === screen && hit.uv) {
        taps.push({ x: hit.uv.x * SW, y: (1 - hit.uv.y) * SH, at: performance.now() });
      } else {
        ring(e.clientX, e.clientY);
      }
      if (/button/i.test(o.name)) {
        let b = buttons.find((b) => b.obj === o);
        if (!b) { b = { obj: o, home: o.position.clone(), cur: 0, target: 0 }; buttons.push(b); }
        // "para dentro" = para longe da câmera, convertido para o espaço do botão
        o.parent.updateMatrixWorld(true);
        const inv = o.parent.matrixWorld.clone().invert();
        const a = hit.point.clone().applyMatrix4(inv);
        const into = new THREE.Vector3(0, 0, -.045).applyQuaternion(pivot.quaternion);
        b.off = hit.point.clone().add(into).applyMatrix4(inv).sub(a);
        b.target = 1;
        pressed = b;
      }
    };
    release = () => { if (pressed) { pressed.target = 0; pressed = null; } };

    function step() {             // mola amortecida, um passo por quadro
      const K = .16, D = .78;
      for (const k of ['rx', 'ry', 'z', 's']) {
        const v = 'v' + k;
        spring[v] = (spring[v] - spring[k] * K) * D;
        spring[k] += spring[v] * .06;
      }
      for (const b of buttons) {
        b.cur += (b.target - b.cur) * (b.target ? .55 : .25);
        b.obj.position.copy(b.home).addScaledVector(b.off, b.cur);
      }
    }

    const base = { x: 0, y: 0 };  // inclinação do cursor/balanço, sem a mola do dedo
    let mt = 0, lastNow = 0, holdK = 0, lpx = 0, lpy = 0;   // relógio do balanço e cursor "travado"
    frameFn = (now) => {
      const dt = lastNow ? Math.min(.1, (now - lastNow) / 1000) : 0;
      lastNow = now;
      const frozen = nearKeys || now < holdUntil;
      holdK += ((frozen ? 1 : 0) - holdK) * .18;   // congela e descongela suave, sem tranco
      mt += dt * (1 - holdK);                        // o balanço para de andar enquanto congelado
      if (!frozen) { lpx = px; lpy = py; }           // e a inclinação para de seguir o cursor
      const t = mt;
      drawScreen(now);
      tex.needsUpdate = true;

      // entrada suave: espera a capa liberar (BUS.showPsp) e então gira, cresce e assenta
      const q = !BUS.pspAt ? 0 : reduce ? 1 : Math.min(1, (now - BUS.pspAt) / 2200);
      const rise = 1 - Math.pow(1 - q, 4);
      kick *= .9;
      const calm = reduce ? 0 : 1;
      // o cursor inclina até TILT; por cima disso o PSP balança sozinho (SWAY).
      // Congelado, o empurrão da troca de projeto também some (clicar → → → não mexe o PSP).
      const ry = (lpx * TILT_Y + Math.sin(t * .55) * SWAY) * calm + kick * (1 - holdK) - (1 - rise) * .9;
      const rx = (lpy * TILT_X + Math.sin(t * .4 + 1.3) * SWAY * .45) * calm - .04;
      step();
      base.y += (ry - base.y) * .09;
      base.x += (rx - base.x) * .09;
      pivot.rotation.y = base.y + spring.ry;
      pivot.rotation.x = base.x + spring.rx;
      pivot.rotation.z = Math.sin(t * .5) * .012 * calm;
      pivot.position.y = (rise - 1) * .5 + Math.sin(t * .8) * .035 * calm;
      pivot.position.z = spring.z;
      pivot.scale.setScalar((.82 + .18 * rise) * (1 + spring.s));
      renderer.render(scene, camera);
      if (screen && BUS.pspAt) placeKeys();
    };

    /* o canto de baixo-direita da tela, onde quer que o PSP esteja inclinado:
       projeta os cantos da malha da tela e fica com o mais embaixo-à-direita */
    const corners = [];
    if (screen) {
      screen.geometry.computeBoundingBox();
      const bb = screen.geometry.boundingBox;
      for (const x of [bb.min.x, bb.max.x]) for (const y of [bb.min.y, bb.max.y]) for (const z of [bb.min.z, bb.max.z]) corners.push(new THREE.Vector3(x, y, z));
    }
    const pv = new THREE.Vector3();
    function placeKeys() {
      const r = canvas.getBoundingClientRect();
      let bx = 0, by = 0, best = -Infinity;
      for (const c of corners) {
        pv.copy(c).applyMatrix4(screen.matrixWorld).project(camera);
        const x = (pv.x + 1) / 2 * r.width, y = (1 - pv.y) / 2 * r.height;
        if (x + y > best) { best = x + y; bx = x; by = y; }
      }
      keysAt(r.left + bx, r.top + by);
    }
    BUS.modelReady();
    start();
  }, undefined, (err) => {
    renderer.dispose();
    flat(err && err.message ? err.message : 'erro ao carregar ' + MODEL);
  });
}

if (document.fonts && document.fonts.load) document.fonts.load('32px VT323').catch(() => {});
boot3d();
