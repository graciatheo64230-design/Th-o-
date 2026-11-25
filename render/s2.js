// Saison 2 « Dans cette ville… » : décors communs + aides de mise en scène.
import * as THREE from 'three';
import { mat, mesh, box, rbox, roundRect, canvasTex, v3 } from './lib.js';
import { tex, card, font, room, bed, table, chair, tree, lampPost, house, groundPlane, sunDisc, cardStage, car } from './world.js';

export const X = { street: 0, bedroom: 40, hospital: 80, kitchen: 120, classroom: 160, park: 240, shop: 280, stage: 320 };

export function buildSets(w) {
  const S = w.scene, sets = {};
  // ---------- RUE + ÉCOLE ----------
  const st = new THREE.Group(); S.add(st); sets.street = st;
  groundPlane(st, '#8f9f7a');
  const sw = mesh(new THREE.PlaneGeometry(140, 4), mat('#cfc6b8'), st, 0, .02, 1.5); sw.rotation.x = -Math.PI / 2;
  const rd = mesh(new THREE.PlaneGeometry(140, 6), mat('#44484f'), st, 0, .015, 6.5); rd.rotation.x = -Math.PI / 2;
  for (let i = 0; i < 12; i++) mesh(new THREE.PlaneGeometry(1.4, .15), mat('#e8e8e8'), st, -40 + i * 7, .02, 6.5).rotation.x = -Math.PI / 2;
  for (let i = 0; i < 8; i++) if (i !== 2) house(st, -20 + i * 7.5, -3, { w: 6, h: 4 + (i % 3) * .8, color: ['#e9d8bf', '#cfdbe6', '#f0cdb8', '#d8e4c8'][i % 4], roof: ['#7a3a2a', '#3d5a80', '#5a4a6a'][i % 3], lit: i % 2 === 1 });
  const school = house(st, -24, -4, { w: 12, h: 5.5, color: '#f2e3c2', roof: '#b0412e', door: '#2f5f3f' });
  const ssign = card(st, 4, .9, 700, (g, W2, H2) => { g.fillStyle = '#2f5f3f'; roundRect(g, 4, 4, W2 - 8, H2 - 8, 24); g.fill(); g.fillStyle = '#fff6e6'; font(g, 900, 90); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('ÉCOLE', W2 / 2, H2 / 2 + 6); }, -24, 4.6, -3.9, { depth: .1 }); ssign.set();
  for (const x of [-12, 9, 22]) tree(st, x, 1.6, { kind: 'round', s: .95 });
  sets.lamps = [lampPost(st, -4, 3.4), lampPost(st, 12, 3.4)];
  sets.sun = sunDisc(st, -30, 8, -80, '#ffe0a0', 5);
  sets.car = car(st, 0, 7.5, '#c0392b', Math.PI / 2); sets.car.visible = false;

  // ---------- CHAMBRE ----------
  sets.bedroom = room(S, { x: X.bedroom, w: 9, d: 8, wall: tex.stripes('#e6e0f0', '#d8d0e8'), window: { x: 1.6, y: 2.5, w: 2.2, h: 1.7 }, lights: [[-1, -4]], lightI: 10 });
  bed(sets.bedroom, -1.5, -4.6, { cover: '#7a6aa8' });
  sets.blanket = rbox(2.1, .35, 2.4, .1, mat('#7a6aa8'), sets.bedroom, -1.5, 1.55, -3.6);
  box(1, 1, .8, mat('#7a4a2a'), sets.bedroom, -3.4, .5, -5.7);
  mesh(new THREE.CylinderGeometry(.08, .1, .3, 12), mat('#ffffff'), sets.bedroom, -3.5, 1.15, -5.6);
  box(1.6, 3.2, .8, mat('#7a4a2a'), sets.bedroom, 3.4, 1.6, -7.4);
  sets.smallBed = (() => { const g = new THREE.Group(); g.position.set(X.bedroom + 2.6, 0, -3.2); S.add(g); box(1.4, .5, 2.4, mat('#5a7bb0'), g, 0, .45, 0); rbox(1.3, .2, 2.2, .06, mat('#9fc0e6'), g, 0, .8, .05); return g; })();

  // ---------- HÔPITAL ----------
  sets.hospital = room(S, { x: X.hospital, w: 9, d: 8, floor: tex.tiles('#e8eef2', '#d5dde3'), wall: tex.stripes('#eef4f6', '#e2ecef'), window: { x: 2, y: 2.5, w: 2.2, h: 1.6 }, lights: [[0, -4]], lightI: 15, lightColor: '#f0f6ff' });
  bed(sets.hospital, -1.5, -4.6, { cover: '#cfe3f0', wood: '#c9ced4' });
  sets.hblanket = rbox(2.1, .35, 2.4, .1, mat('#cfe3f0'), sets.hospital, -1.5, 1.55, -3.6);
  chair(sets.hospital, 1.0, -4.0, -Math.PI / 2 - .3, '#7f8c8d');
  box(.8, 1.2, .5, mat('#c9ced4'), sets.hospital, -3.4, 1.6, -6.4);
  sets.monitor = card(sets.hospital, .7, .45, 300, (g, W2, H2, t) => { g.fillStyle = '#0b1a14'; g.fillRect(0, 0, W2, H2); g.strokeStyle = '#38f28a'; g.lineWidth = 6; g.beginPath(); for (let x = 0; x < W2; x += 4) { const ph = (x / W2 * 3 + (t || 0)) % 1; const y = ph > .45 && ph < .5 ? H2 * .15 : ph > .5 && ph < .55 ? H2 * .8 : H2 * .55; x ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); }, -3.4, 2.4, -6.1, { depth: .02, glow: 1 });

  // ---------- CUISINE ----------
  sets.kitchen = room(S, { x: X.kitchen, w: 9, d: 8, floor: tex.tiles('#eae4d6', '#c9bfae'), wall: tex.stripes('#f6ead2', '#ecdcbc'), window: { x: -1.5, y: 2.4, w: 2.4, h: 1.8 }, lights: [[0, -4]], lightI: 13 });
  table(sets.kitchen, 0, -4.2, { w: 2.6, d: 1.5 });
  chair(sets.kitchen, -1.6, -4.2, Math.PI / 2, '#c0392b'); chair(sets.kitchen, 1.6, -4.2, -Math.PI / 2, '#c0392b');
  box(3.4, 1.3, .9, mat('#f4f1ea'), sets.kitchen, 2.2, .65, -7.4); box(3.4, .1, 1, mat('#7a4a2a'), sets.kitchen, 2.2, 1.35, -7.4);
  box(.9, .3, .6, mat('#3a3f4a', { metalness: .5 }), sets.kitchen, 1.6, 1.55, -7.4);

  // ---------- CLASSE ----------
  sets.classroom = room(S, { x: X.classroom, w: 12, d: 10, h: 4.6, wall: tex.stripes('#f6ecd0', '#efe0b8', [6, 2]), window: { x: 3.4, y: 2.6, w: 2.8, h: 2.0 }, lights: [[-2, -4], [2, -6]], lightI: 12 });
  box(12, 4.6, .2, new THREE.MeshStandardMaterial({ map: tex.stripes('#f6ecd0', '#efe0b8', [6, 2]), roughness: .9 }), sets.classroom, 0, 2.3, .1);
  sets.board = card(sets.classroom, 4.6, 2.2, 900, (g, W2, H2, txt) => { g.fillStyle = '#7a4a2a'; g.fillRect(0, 0, W2, H2); g.fillStyle = '#244d3a'; g.fillRect(16, 16, W2 - 32, H2 - 32); g.fillStyle = 'rgba(255,255,255,.88)'; font(g, 700, 78, 'Caveat'); g.textAlign = 'center'; g.textBaseline = 'middle'; (txt || '').split('|').forEach((l, i, a) => g.fillText(l, W2 / 2, H2 / 2 + (i - (a.length - 1) / 2) * 90)); }, -2.0, 2.5, -9.85, { depth: .05 });
  sets.board.set('Dictée|Lundi');
  sets.desks = [[-3, -5.2], [0, -5.2], [3, -5.2], [-3, -2.6], [0, -2.6], [3, -2.6]];
  for (const [x, z] of sets.desks) { table(sets.classroom, x, z, { w: 1.6, d: 1.0, h: 1.1, color: '#c98f55' }); chair(sets.classroom, x, z + .9, Math.PI, '#3d7ac4'); }

  // ---------- PARC + RIVIÈRE ----------
  const pk = new THREE.Group(); pk.position.set(X.park, 0, 0); S.add(pk); sets.park = pk;
  const g1 = mesh(new THREE.PlaneGeometry(80, 40), mat('#7fb069', { roughness: 1 }), pk, 0, 0, 14); g1.rotation.x = -Math.PI / 2;
  const g2 = mesh(new THREE.PlaneGeometry(80, 40), mat('#7fb069', { roughness: 1 }), pk, 0, 0, -31); g2.rotation.x = -Math.PI / 2;
  const river = mesh(new THREE.PlaneGeometry(80, 6), mat('#3d6f9a', { roughness: .1, metalness: .3 }), pk, 0, -.5, -8); river.rotation.x = -Math.PI / 2;
  for (const s of [-1, 1]) box(80, .6, .3, mat('#9a9488'), pk, 0, -.2, -8 + s * 3.1);
  for (let i = 0; i < 30; i++) box(.08, 1, .08, mat('#333'), pk, -15 + i, .5, -4.6);
  box(30, .08, .08, mat('#333'), pk, 0, 1.0, -4.6);
  const pth = mesh(new THREE.PlaneGeometry(80, 2.4), mat('#d8c9a8', { roughness: 1 }), pk, 0, .02, -2.5); pth.rotation.x = -Math.PI / 2;
  for (const [x, z] of [[-10, 2], [-3, 3.5], [6, 2.5], [12, 4], [-14, -16], [8, -15]]) tree(pk, x, z, { kind: 'round', s: 1.1 });
  const wallB = box(4, 4, .4, mat('#c9a27a'), pk, 9, 2, -1); // mur + échelle
  const ladder = new THREE.Group(); ladder.position.set(8.4, 0, -.6); ladder.rotation.x = -.2; pk.add(ladder);
  for (const s of [-1, 1]) box(.08, 3.6, .08, mat('#8a5a36'), ladder, s * .3, 1.8, 0);
  for (let i = 0; i < 9; i++) box(.6, .06, .06, mat('#8a5a36'), ladder, 0, .3 + i * .38, 0);
  sets.ladder = ladder;

  // ---------- BOUTIQUE DU MARCHAND ----------
  sets.shop = room(S, { x: X.shop, w: 9, d: 8, floor: tex.wood(['#4a2e1c', '#3f2718', '#55341f', '#3a2416']), wall: tex.stripes('#3a2a4a', '#33243f'), window: { x: 2, y: 2.6, w: 1.6, h: 1.4 }, lights: [[0, -4]], lightI: 5, lightColor: '#b48cff', base: '#2a1a30' });
  sets.jars = [];
  for (const [k, y] of [1.4, 2.3, 3.2].entries()) {
    box(6, .1, .6, mat('#5a3a24'), sets.shop, -.5, y, -7.6);
    for (let i = 0; i < 8; i++) {
      const col = ['#ffd36b', '#8fe3ff', '#ff9cc4', '#b4ff9c', '#c9a6ff'][(i + k * 3) % 5];
      const jar = mesh(new THREE.CylinderGeometry(.2, .2, .45, 14), new THREE.MeshStandardMaterial({ color: '#dfefff', transparent: true, opacity: .35, roughness: .05 }), sets.shop, -3.2 + i * .75, y + .28, -7.55, false);
      mesh(new THREE.SphereGeometry(.1, 10, 8), mat(col, { emissive: col, emissiveIntensity: 2.2 }), sets.shop, -3.2 + i * .75, y + .26, -7.55, false);
      sets.jars.push(jar);
    }
  }
  box(3, 1.2, 1, mat('#4a2e1c'), sets.shop, 0, .6, -4.6);
  box(3.1, .1, 1.1, mat('#6a4a2a'), sets.shop, 0, 1.25, -4.6);

  // ---------- TABLE D'OBJETS ----------
  sets.stage = cardStage(S, X.stage, { table: tex.wood(['#b98a5a', '#a87a4c', '#c09060', '#a27448']) });

  w.onMood((m) => {
    for (const k of ['bedroom', 'hospital', 'kitchen', 'classroom', 'shop']) sets[k].userData.setView(m);
    const night = m === 'night' || m === 'dark' || m === 'rain';
    sets.lamps.forEach(l => l.userData.set(night ? 1 : 0)); sets.sun.visible = m === 'day' || m === 'dawn' || m === 'sunset';
  });
  sets.reset = () => {
    for (const k of ['bedroom', 'hospital', 'kitchen', 'classroom', 'shop']) sets[k].userData.setLights(1);
    sets.blanket.visible = false; sets.hblanket.visible = false; sets.car.visible = false; sets.board.set('Dictée|Lundi');
  };
  return sets;
}

// ---------- Aides de pose ----------
export function poses(w) {
  const P = (c, x, z, ry = 0, y = 0) => w.place(c, x, z, ry, y);
  return {
    P,
    // assis sur une chaise (assise à .8)
    sit: (c, x, z, ry = 0) => { const s = c.g.scale.y; P(c, x, z, ry, .86 - s); c.legL.rotation.x = c.legR.rotation.x = -1.5; },
    // assis par terre
    floor: (c, x, z, ry = 0) => { const s = c.g.scale.y; P(c, x, z, ry, -.55 * s); c.legL.rotation.x = c.legR.rotation.x = -1.5; },
    // allongé dans le lit d'une pièce (lit à x-1.5 ; tête sur l'oreiller)
    lie: (c, roomX, blanket) => { const s = c.g.scale.y; P(c, roomX - 1.5, -5.95 + 2.5 * s, 0, 1.38); c.g.rotation.x = -Math.PI / 2; if (blanket) blanket.visible = true; },
    // assis dans le lit
    sitBed: (c, roomX, blanket) => { const s = c.g.scale.y; P(c, roomX - 1.5, -4.9, 0, 1.15 - s); c.legL.rotation.x = c.legR.rotation.x = -1.5; if (blanket) blanket.visible = true; },
    wave: (c, t) => { c.armR.rotation.x = -2.8; c.armR.rotation.z = .3 + Math.sin(t * 8) * .35; },
  };
}

// Transparence d'un personnage (1 = opaque)
export function setOpacity(c, k) {
  c.g.traverse(m => { if (m.isMesh) { const ms = Array.isArray(m.material) ? m.material : [m.material]; ms.forEach(mt => { mt.transparent = true; mt.opacity = k; mt.depthWrite = k > .95; }); m.castShadow = k > .5; } });
}

// Étiquette flottante (chiffre au-dessus d'une tête, etc.)
export function label(text, o = {}) {
  const t = canvasTex(512, 256, () => {});
  const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false, depthTest: false }));
  spr.renderOrder = 10; spr.scale.set(o.w ?? 1.2, (o.w ?? 1.2) / 2, 1);
  let last = null;
  spr.userData.set = (txt, col = o.color ?? '#ffffff') => {
    const key = txt + col; if (key === last) return; last = key;
    const c = t.userData.canvas, g = c.getContext('2d'); g.clearRect(0, 0, 512, 256);
    g.font = `900 ${o.size ?? 150}px Montserrat`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
    g.lineWidth = 22; g.strokeStyle = 'rgba(0,0,0,.85)'; g.strokeText(txt, 256, 132); g.fillStyle = col; g.fillText(txt, 256, 132);
    t.needsUpdate = true;
  };
  spr.userData.set(text);
  return spr;
}

export const writeLines = (g, lines, k, x0, y0, dy, size = 70, col = '#2b2350') => { g.fillStyle = col; font(g, 700, size, 'Caveat'); let n = Math.floor(k * lines.join('').length); lines.forEach((l, i) => { g.fillText(l.slice(0, Math.max(0, n)), x0, y0 + i * dy); n -= l.length; }); };
export const sepiaOverlay = (ctx, W, H) => { ctx.save(); ctx.globalCompositeOperation = 'color'; ctx.fillStyle = 'rgba(150,110,60,.75)'; ctx.fillRect(0, 0, W, H); ctx.restore(); };
// Bandeau de la règle, en haut de l'écran (style panneau)
export function ruleBanner(ui, text, age, W, H) {
  if (age < 0) return;
  const c = ui.ctx, k = Math.min(1, age / .25);
  c.save(); c.globalAlpha = k; c.translate(W / 2, H * .14 - (1 - k) * 30);
  const lines = text.split('|'); let fs = 38; c.font = `900 ${fs}px Montserrat`;
  while (Math.max(...lines.map(l => c.measureText(l).width)) > W - 120) { fs -= 2; c.font = `900 ${fs}px Montserrat`; }
  const wMax = Math.max(...lines.map(l => c.measureText(l).width)) + 60, hh = lines.length * fs * 1.25 + 40;
  roundRect(c, -wMax / 2, -hh / 2, wMax, hh, 22); c.fillStyle = 'rgba(20,16,30,.88)'; c.fill(); c.lineWidth = 5; c.strokeStyle = '#ffd36b'; c.stroke();
  c.fillStyle = '#ffd36b'; c.textAlign = 'center'; c.textBaseline = 'middle';
  lines.forEach((l, i) => c.fillText(l, 0, (i - (lines.length - 1) / 2) * fs * 1.25 + 2));
  c.restore();
}
