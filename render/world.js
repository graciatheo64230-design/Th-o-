// Boîte à outils « studio » : monde, ambiances, météo, décors et accessoires réutilisables.
import * as THREE from 'three';
import { W, H, rng, clamp, mat, mesh, box, rbox, canvasTex, redraw, roundRect } from './lib.js';

const grad = (stops) => canvasTex(8, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); stops.forEach(([o, c]) => gr.addColorStop(o, c)); g.fillStyle = gr; g.fillRect(0, 0, w, h); });

export const MOODS = {
  night: { sky: [[0, '#060b22'], [.55, '#1b2350'], [1, '#5a4377']], fog: '#1b2350', hemi: ['#6a7bbf', '#2a2030', .8], sun: ['#a8bcff', 1.2], sunDir: [-10, 16, 14], stars: true },
  dawn: { sky: [[0, '#2b2d5e'], [.45, '#b86a8a'], [.8, '#ffb36b'], [1, '#ffe0a0']], fog: '#d98f86', hemi: ['#ffc6a8', '#4a3a50', 1.1], sun: ['#ffb070', 2.2], sunDir: [-14, 5, -12] },
  sunset: { sky: [[0, '#3a2a6a'], [.5, '#c4558a'], [.85, '#ff9a55'], [1, '#ffd08a']], fog: '#c87a7a', hemi: ['#ffb08a', '#3a2840', 1.0], sun: ['#ff9a5a', 2.4], sunDir: [12, 4, -14] },
  day: { sky: [[0, '#3f8fe0'], [.7, '#9fd0ff'], [1, '#e0f2ff']], fog: '#cfe6ff', hemi: ['#dff0ff', '#7a8a6a', 1.5], sun: ['#fff4e0', 2.6], sunDir: [-8, 16, 10] },
  grey: { sky: [[0, '#7d8896'], [1, '#c9ced6']], fog: '#b9bfc8', hemi: ['#d0d6de', '#5a5f66', 1.3], sun: ['#e8ecf2', .9], sunDir: [-6, 16, 8] },
  rain: { sky: [[0, '#2d3440'], [1, '#6b7584']], fog: '#5a6370', hemi: ['#9aa6b8', '#2a2e36', 1.0], sun: ['#c0cad8', .6], sunDir: [-6, 16, 8] },
  dark: { sky: [[0, '#0a0d18'], [1, '#1c2236']], fog: '#10141f', hemi: ['#5a6690', '#1a1a22', .5], sun: ['#8090c0', .4], sunDir: [-6, 16, 8] },
};
for (const m of Object.values(MOODS)) m.tex = grad(m.sky);

export function createWorld(renderer) {
  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(50, W / H, .05, 400);
  const R = rng(11);
  const hemi = new THREE.HemisphereLight(); scene.add(hemi);
  const sun = new THREE.DirectionalLight(); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -14, right: 14, top: 14, bottom: -14, near: 1, far: 80 });
  sun.shadow.bias = -.0005; sun.shadow.normalBias = .02; scene.add(sun, sun.target);
  const flake = canvasTex(64, 64, (g) => { const gr = g.createRadialGradient(32, 32, 0, 32, 32, 30); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); });
  const streak = canvasTex(16, 64, (g) => { const gr = g.createLinearGradient(0, 0, 0, 64); gr.addColorStop(0, 'rgba(200,220,255,0)'); gr.addColorStop(1, 'rgba(200,220,255,.9)'); g.fillStyle = gr; g.fillRect(6, 0, 4, 64); });
  // étoiles (suivent la caméra)
  const sp = []; for (let i = 0; i < 500; i++) { const a = R() * Math.PI * 2, e = .15 + R() * 1.2; sp.push(Math.cos(a) * Math.cos(e) * 150, Math.sin(e) * 150, Math.sin(a) * Math.cos(e) * 150); }
  const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3));
  const stars = new THREE.Points(sg, new THREE.PointsMaterial({ size: 1.2, map: flake, transparent: true, depthWrite: false, fog: false })); scene.add(stars);
  // météo
  const N = 2200, pos = new Float32Array(N * 3), seeds = [];
  for (let i = 0; i < N; i++) seeds.push([R() * 30 - 15, R() * 14, R() * 30 - 15, .5 + R() * .7, R() * 6]);
  const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const snowMat = new THREE.PointsMaterial({ size: .12, map: flake, transparent: true, depthWrite: false });
  const rainMat = new THREE.PointsMaterial({ size: .35, map: streak, transparent: true, depthWrite: false, opacity: .7 });
  const particles = new THREE.Points(pg, snowMat); particles.frustumCulled = false; scene.add(particles);
  const moodHooks = [];
  const world = {
    scene, cam, hemi, sun, R, chars: [], current: 'night',
    onMood(fn) { moodHooks.push(fn); },
    mood(name) {
      const m = MOODS[name]; world.current = name;
      scene.background = m.tex; scene.fog = new THREE.Fog(m.fog, 30, 110);
      hemi.color.set(m.hemi[0]); hemi.groundColor.set(m.hemi[1]); hemi.intensity = m.hemi[2];
      sun.color.set(m.sun[0]); sun.intensity = m.sun[1]; world.sunDir = m.sunDir;
      stars.visible = !!m.stars; moodHooks.forEach(f => f(name, m));
    },
    // météo : 'snow' | 'rain' | null ; zone centrée sur un point (le décor)
    weather(kind, t, center, k = 1) {
      particles.visible = !!kind; if (!kind) return;
      particles.material = kind === 'rain' ? rainMat : snowMat;
      const sp = kind === 'rain' ? 9 : 1;
      for (let i = 0; i < N; i++) {
        const [x, y, z, s, ph] = seeds[i];
        pos[i * 3] = center.x + x + (kind === 'snow' ? Math.sin(t * .8 + ph) * .3 : 0);
        pos[i * 3 + 1] = ((y - t * s * sp * k) % 14 + 14) % 14;
        pos[i * 3 + 2] = center.z + z;
      }
      pg.attributes.position.needsUpdate = true;
    },
    look(p, tgt) {
      cam.position.copy(p); cam.lookAt(tgt);
      stars.position.copy(p);
      const d = world.sunDir || [-10, 16, 14];
      sun.target.position.copy(tgt); sun.position.set(tgt.x + d[0], tgt.y + d[1], tgt.z + d[2]);
    },
    add(c) { world.chars.push(c); scene.add(c.g); return c; },
    place(c, x, z, ry = 0, y = 0) { c.g.visible = true; c.g.position.set(x, y, z); c.g.rotation.y = ry; },
    resetChars() { world.chars.forEach(c => { c.reset(); c.g.visible = false; }); },
    render() { renderer.render(scene, cam); },
  };
  return world;
}

// ---------------- Textures ----------------
export const tex = {
  wood: (c = ['#a8693a', '#9a5f33', '#b07240', '#94592f'], rep = [4, 4]) => canvasTex(512, 512, (g, w) => { for (let i = 0; i < 8; i++) { g.fillStyle = c[i % 4]; g.fillRect(0, i * 64, w, 64); g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(0, i * 64 + 62, w, 2); g.fillRect(((i * 197) % 400) + 50, i * 64, 2, 64); } }, { repeat: rep }),
  stripes: (a = '#f3dcc0', b = '#ecc9a6', rep = [5, 2]) => canvasTex(256, 256, (g, w, h) => { g.fillStyle = a; g.fillRect(0, 0, w, h); g.fillStyle = b; for (let i = 0; i < 8; i += 2) g.fillRect(i * 32, 0, 32, h); }, { repeat: rep }),
  tiles: (a = '#e8e8e8', b = '#cfd6de', rep = [6, 6]) => canvasTex(256, 256, (g, w, h) => { for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { g.fillStyle = (i + j) % 2 ? a : b; g.fillRect(i * 64, j * 64, 64, 64); } }, { repeat: rep }),
  stone: (rep = [3, 3]) => canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#9a9488'; g.fillRect(0, 0, w, h); for (let j = 0; j < 8; j++) for (let i = 0; i < 4; i++) { g.fillStyle = ['#b3ad9f', '#a8a294', '#bdb7a8', '#a39d8f'][(i + j) % 4]; g.fillRect(i * 64 + (j % 2) * 32 + 2, j * 32 + 2, 60, 28); } }, { repeat: rep }),
  plain: (c) => canvasTex(4, 4, (g) => { g.fillStyle = c; g.fillRect(0, 0, 4, 4); }),
};

// Panneau / carte dessiné(e) en canvas, redessinable : renvoie { mesh, set(...args) }
export function card(parent, w, h, px, drawFn, x = 0, y = 0, z = 0, o = {}) {
  const t = canvasTex(px, Math.round(px * h / w), () => {});
  const m = box(w, h, o.depth ?? .03, new THREE.MeshStandardMaterial({ map: t, roughness: o.rough ?? .8, emissive: o.glow ? '#ffffff' : '#000000', emissiveMap: o.glow ? t : null, emissiveIntensity: o.glow ?? 0 }), parent, x, y, z);
  let last = null;
  return { mesh: m, tex: t, set: (...a) => { const k = JSON.stringify(a); if (k !== last) { last = k; redraw(t, (g, W2, H2) => drawFn(g, W2, H2, ...a)); } } };
}
export const font = (g, wgt, size, fam = 'Montserrat') => { g.font = `${wgt} ${size}px ${fam}`; };

// ---------------- Décors ----------------
// Pièce : sol, mur du fond avec fenêtre (vue sur le ciel de l'ambiance), murs latéraux, plafond
export function room(parent, o = {}) {
  const w = o.w ?? 10, d = o.d ?? 8, h = o.h ?? 4.4, gr = new THREE.Group(); gr.position.set(o.x ?? 0, 0, o.z ?? 0); parent.add(gr);
  const fl = mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshStandardMaterial({ map: o.floor ?? tex.wood(), roughness: .7 }), gr, 0, .005, -d / 2); fl.rotation.x = -Math.PI / 2;
  const wm = new THREE.MeshStandardMaterial({ map: o.wall ?? tex.stripes(), roughness: .9 });
  const win = o.window ?? { x: 0, y: 2.3, w: 2.4, h: 1.8 };
  const bz = -d;
  // mur du fond découpé autour de la fenêtre
  const L = -w / 2, Rr = w / 2, wl = win.x - win.w / 2, wr = win.x + win.w / 2, wb = win.y - win.h / 2, wt = win.y + win.h / 2;
  box(wl - L, h, .2, wm, gr, (L + wl) / 2, h / 2, bz);
  box(Rr - wr, h, .2, wm, gr, (wr + Rr) / 2, h / 2, bz);
  box(win.w, wb, .2, wm, gr, win.x, wb / 2, bz);
  box(win.w, h - wt, .2, wm, gr, win.x, (wt + h) / 2, bz);
  // cadre + croisillon
  const fr = mat(o.frame ?? '#f5f1ea');
  box(win.w + .2, .14, .3, fr, gr, win.x, wb, bz + .05); box(win.w + .2, .14, .3, fr, gr, win.x, wt, bz + .05);
  box(.14, win.h, .3, fr, gr, wl, win.y, bz + .05); box(.14, win.h, .3, fr, gr, wr, win.y, bz + .05);
  box(.08, win.h, .12, fr, gr, win.x, win.y, bz); box(win.w, .08, .12, fr, gr, win.x, win.y, bz);
  // vue extérieure
  const view = new THREE.MeshBasicMaterial({ map: MOODS.night.tex, fog: false });
  const vp = mesh(new THREE.PlaneGeometry(win.w * 3, win.h * 3), view, gr, win.x, win.y, bz - 3, false);
  gr.userData.setView = (m) => { view.map = MOODS[m].tex; };
  // arbres/toits silhouettes derrière la fenêtre
  for (let i = 0; i < 4; i++) box(1.2, 1 + i % 3 * .6, .2, new THREE.MeshBasicMaterial({ color: '#1a2030', fog: false }), gr, win.x - 2.5 + i * 1.6, wb - .2, bz - 2.6, false);
  if (o.side !== false) { box(.2, h, d, wm, gr, -w / 2, h / 2, -d / 2); box(.2, h, d, wm, gr, w / 2, h / 2, -d / 2); }
  if (o.ceiling !== false) box(w, .2, d, mat(o.ceilColor ?? '#f6eadb'), gr, 0, h, -d / 2);
  box(w, .5, .1, mat(o.base ?? '#7a4a2a'), gr, 0, .25, bz + .12);
  // lumière d'ambiance
  const lights = [];
  for (const [lx, lz] of (o.lights ?? [[0, -d / 2]])) { const l = new THREE.PointLight(o.lightColor ?? '#ffc280', o.lightI ?? 16, 14, 1.6); l.position.set(lx, h - .5, lz); gr.add(l); lights.push(l); }
  gr.userData.lights = lights;
  gr.userData.setLights = (k) => lights.forEach(l => l.intensity = (o.lightI ?? 16) * k);
  return gr;
}

export function bed(p, x, z, o = {}) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = o.ry ?? 0; p.add(g);
  const wood = mat(o.wood ?? '#7a4a2a');
  box(2.2, .5, 3.6, wood, g, 0, .45, 0); box(2.2, 1.6, .2, wood, g, 0, .8, -1.8);
  box(2.0, .3, 3.3, mat('#f4f1ea'), g, 0, .85, .05);
  rbox(1.3, .25, .6, .1, mat('#ffffff'), g, 0, 1.1, -1.35);
  const cover = rbox(2.1, .18, 2.3, .06, mat(o.cover ?? '#5a7bb0'), g, 0, 1.05, .6);
  g.userData.cover = cover; return g;
}
export function table(p, x, z, o = {}) {
  const g = new THREE.Group(); g.position.set(x, 0, z); p.add(g);
  const w = o.w ?? 2.4, d = o.d ?? 1.4, h = o.h ?? 1.2, m = mat(o.color ?? '#8a5432');
  box(w, .12, d, m, g, 0, h, 0);
  for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) box(.12, h, .12, m, g, a * (w / 2 - .15), h / 2, b * (d / 2 - .15));
  return g;
}
export function chair(p, x, z, ry = 0, color = '#7a4a2a') {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; p.add(g); const m = mat(color);
  box(.9, .1, .9, m, g, 0, .8, 0); box(.9, 1, .1, m, g, 0, 1.3, -.4);
  for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) box(.08, .8, .08, m, g, a * .38, .4, b * .38);
  return g;
}
export function tree(p, x, z, o = {}) {
  const g = new THREE.Group(); g.position.set(x, 0, z); p.add(g); const s = o.s ?? 1; g.scale.setScalar(s);
  box(.35, 2, .35, mat('#5a3a24'), g, 0, 1, 0);
  if (o.kind === 'bare') { for (let i = 0; i < 4; i++) { const b = box(.12, 1.2, .12, mat('#4a3020'), g, 0, 2.2 + i * .25, 0); b.rotation.z = (i % 2 ? 1 : -1) * .7; b.rotation.y = i; b.position.x = (i % 2 ? .3 : -.3); } }
  else if (o.kind === 'round') { mesh(new THREE.SphereGeometry(1.3, 14, 10), mat(o.leaf ?? '#4f8a3e'), g, 0, 3, 0); mesh(new THREE.SphereGeometry(.9, 12, 10), mat(o.leaf ?? '#5c9a48'), g, .6, 3.6, .3); }
  else { for (let i = 0; i < 3; i++) { mesh(new THREE.ConeGeometry(1.4 - i * .35, 1.5, 8), mat(o.leaf ?? '#2f5e46'), g, 0, 2 + i * .9, 0); if (o.snow) mesh(new THREE.ConeGeometry(1.0 - i * .3, .5, 8), mat('#f2f6fb'), g, 0, 2.6 + i * .9, 0); } }
  return g;
}
export function lampPost(p, x, z, on = true) {
  const g = new THREE.Group(); g.position.set(x, 0, z); p.add(g);
  box(.16, 4.4, .16, mat('#22262e', { metalness: .5 }), g, 0, 2.2, 0);
  const bulb = mesh(new THREE.SphereGeometry(.28, 14, 10), mat('#ffe2a0', { emissive: '#ffcc66', emissiveIntensity: 2.5 }), g, 0, 4.5, 0, false);
  const l = new THREE.PointLight('#ffcf80', 10, 12, 1.5); l.position.set(0, 4.2, 0); g.add(l);
  g.userData.set = (k) => { l.intensity = 10 * k; bulb.material.emissiveIntensity = 2.5 * k; };
  return g;
}
export function bench(p, x, z, ry = 0) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; p.add(g); const w = mat('#7a4a2a'), m = mat('#2a2a30');
  box(2.4, .1, .7, w, g, 0, .8, 0); box(2.4, .5, .08, w, g, 0, 1.25, -.32);
  for (const a of [-1, 1]) box(.1, .8, .6, m, g, a, .4, 0);
  return g;
}
// Pont de pierre au-dessus d'une rivière, avec une plaque gravée sur le parapet
export function bridge(p, x, z, o = {}) {
  const g = new THREE.Group(); g.position.set(x, 0, z); p.add(g);
  const st = new THREE.MeshStandardMaterial({ map: tex.stone([2, 1]), roughness: .95 });
  const river = mesh(new THREE.PlaneGeometry(9, 60), mat(o.water ?? '#3d5f86', { roughness: .15, metalness: .3 }), g, 0, -.6, 0); river.rotation.x = -Math.PI / 2;
  box(8, .5, 3, st, g, 0, .25, 0); // tablier
  for (const s of [-1, 1]) box(8, .9, .35, st, g, 0, .95, s * 1.35);
  for (const a of [-1, 1]) box(1, 1.2, 3.2, st, g, a * 4, -.1, 0);
  const plate = card(g, 1.6, .7, 512, o.plate ?? (() => {}), 0, .95, 1.53, { depth: .02, rough: .95 });
  return { g, plate };
}
export function busStop(p, x, z) {
  const g = new THREE.Group(); g.position.set(x, 0, z); p.add(g);
  const m = mat('#2b3a4a', { metalness: .4 }), gl = new THREE.MeshStandardMaterial({ color: '#cfe6ff', transparent: true, opacity: .25, depthWrite: false });
  box(3.2, .1, 1.4, m, g, 0, 3, 0); box(.1, 3, .1, m, g, -1.5, 1.5, -.6); box(.1, 3, .1, m, g, 1.5, 1.5, -.6);
  mesh(new THREE.PlaneGeometry(3, 2.6), gl, g, 0, 1.6, -.62, false);
  box(2.6, .1, .5, mat('#7a4a2a'), g, 0, .8, -.3);
  box(.08, 3.4, .08, m, g, 2.1, 1.7, .4);
  const sign = card(g, .9, .9, 256, (c, w, h) => { c.fillStyle = '#1d6fd8'; c.beginPath(); c.arc(w / 2, h / 2, w / 2 - 4, 0, 7); c.fill(); c.fillStyle = '#fff'; font(c, 900, 120); c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('BUS', w / 2, h / 2 + 6); }, 2.1, 3.4, .45);
  sign.set();
  return g;
}
// Parapluie : couleur, ouvert (k=1) ou fermé (k=0)
export function umbrella(color = '#ffd21f') {
  const g = new THREE.Group();
  const canopy = mesh(new THREE.ConeGeometry(.9, .45, 8, 1, true), new THREE.MeshStandardMaterial({ color, roughness: .5, side: THREE.DoubleSide }), g, 0, 1.6, 0);
  box(.04, 1.6, .04, mat('#333'), g, 0, .8, 0);
  const handle = mesh(new THREE.TorusGeometry(.1, .03, 6, 12, Math.PI), mat('#5a3a24'), g, .1, 0, 0); handle.rotation.z = Math.PI;
  g.userData.canopy = canopy;
  return g;
}
export function car(p, x, z, color = '#c0392b', ry = 0) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; p.add(g);
  rbox(2.0, .8, 4.0, .2, mat(color, { roughness: .4, metalness: .3 }), g, 0, .75, 0);
  rbox(1.8, .7, 2.0, .2, mat('#9ec3e6', { roughness: .1, metalness: .4 }), g, 0, 1.45, -.3);
  for (const [a, b] of [[-1, 1.3], [1, 1.3], [-1, -1.3], [1, -1.3]]) { const w = mesh(new THREE.CylinderGeometry(.38, .38, .3, 16), mat('#1a1a1a'), g, a * 1.0, .38, b); w.rotation.z = Math.PI / 2; }
  for (const a of [-1, 1]) mesh(new THREE.SphereGeometry(.14, 10, 8), mat('#fff6d0', { emissive: '#fff0b0', emissiveIntensity: 2 }), g, a * .65, .85, 2.0, false);
  return g;
}
// Petite maison (façade + toit) pour les plans extérieurs
export function house(p, x, z, o = {}) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = o.ry ?? 0; p.add(g);
  const w = o.w ?? 6, h = o.h ?? 4;
  box(w, h, 5, mat(o.color ?? '#e9d8bf', { roughness: .95 }), g, 0, h / 2, -2.5);
  const roof = box(w + .6, .3, 3.4, mat(o.roof ?? '#8a3a2a'), g, 0, h + .9, -1.2); roof.rotation.x = -.6;
  const roof2 = box(w + .6, .3, 3.4, mat(o.roof ?? '#8a3a2a'), g, 0, h + .9, -3.8); roof2.rotation.x = .6;
  box(1.2, 2.2, .1, mat(o.door ?? '#5a3a6a'), g, w / 4, 1.1, .02);
  const lit = o.lit ?? true;
  for (const a of [-1]) box(1.4, 1.2, .1, mat(lit ? '#ffcf7a' : '#2a3350', { emissive: lit ? '#ffb050' : '#000', emissiveIntensity: lit ? 1.2 : 0 }), g, a * w / 4, 2.2, .02);
  return g;
}
// Ciel de fin : soleil (disque) pour couchers/levers
export function sunDisc(p, x, y, z, color = '#ffe8a0', r = 1.6) {
  return mesh(new THREE.CircleGeometry(r, 32), new THREE.MeshBasicMaterial({ color, fog: false }), p, x, y, z, false);
}
export function groundPlane(p, color, x = 0, z = 0, size = 120) {
  const g = mesh(new THREE.PlaneGeometry(size, size), mat(color, { roughness: 1 }), p, x, 0, z); g.rotation.x = -Math.PI / 2; return g;
}
// Mur « studio » pour les gros plans d'objets (lettre, calendrier...)
export function cardStage(p, x, o = {}) {
  const g = new THREE.Group(); g.position.set(x, 0, 0); p.add(g);
  box(14, 14, .2, new THREE.MeshStandardMaterial({ map: o.wall ?? tex.stripes(), roughness: .9 }), g, 0, 3, -.3);
  const tb = box(10, .2, 7, new THREE.MeshStandardMaterial({ map: o.table ?? tex.wood(), roughness: .6 }), g, 0, 0, 8);
  const l = new THREE.PointLight('#fff0d8', 30, 22, 1.2); l.position.set(0, 4, 5); g.add(l);
  const l2 = new THREE.PointLight('#fff0d8', 24, 18, 1.2); l2.position.set(0, 4, 11); g.add(l2);
  return g;
}
export const sparkTexture = () => canvasTex(64, 64, (g) => { g.fillStyle = '#fff6c8'; g.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, r = i % 2 ? 8 : 30; g.lineTo(32 + Math.cos(a) * r, 32 + Math.sin(a) * r); } g.fill(); });
