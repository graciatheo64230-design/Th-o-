// Kit « blocs » : textures pixelisées 16x16, monde en blocs instanciés, maisons, arbres, village.
import * as THREE from 'three';
import { rng } from './lib.js';

export const BS = 1.5; // taille d'un bloc (un personnage adulte ≈ 2 blocs)

// ---------- Textures pixel ----------
const R = rng(1234);
function tex16(draw, n = 16) {
  const c = document.createElement('canvas'); c.width = c.height = n;
  const g = c.getContext('2d'); draw(g, n);
  const t = new THREE.CanvasTexture(c); t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestMipmapLinearFilter; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}
const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const px = (g, x, y, rgb, k = 1) => { g.fillStyle = `rgb(${Math.min(255, rgb[0] * k) | 0},${Math.min(255, rgb[1] * k) | 0},${Math.min(255, rgb[2] * k) | 0})`; g.fillRect(x, y, 1, 1); };
const noise = (g, n, base, amp = .18) => { const c = hex(base); for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) px(g, x, y, c, 1 - amp / 2 + R() * amp); };

const T = {
  grassTop: () => tex16((g, n) => noise(g, n, '#5f9e3a', .3)),
  grassSide: () => tex16((g, n) => { noise(g, n, '#8a5f3c', .3); const gr = hex('#5f9e3a'); for (let x = 0; x < n; x++) { const h = 3 + (R() * 3 | 0); for (let y = 0; y < h; y++) px(g, x, y, gr, .85 + R() * .3); } }),
  dirt: () => tex16((g, n) => noise(g, n, '#8a5f3c', .32)),
  path: () => tex16((g, n) => noise(g, n, '#b08a55', .25)),
  stone: () => tex16((g, n) => noise(g, n, '#8c8c8c', .22)),
  cobble: () => tex16((g, n) => { noise(g, n, '#7a7a7a', .15); const d = hex('#4a4a4a'), l = hex('#a8a8a8'); for (let i = 0; i < 9; i++) { const x0 = R() * 14 | 0, y0 = R() * 14 | 0, w = 3 + (R() * 3 | 0), h = 2 + (R() * 3 | 0); for (let y = y0; y < Math.min(n, y0 + h); y++) for (let x = x0; x < Math.min(n, x0 + w); x++) px(g, x, y, (x === x0 || y === y0) ? d : l, .9 + R() * .2); } }),
  planks: (base = '#b58a54') => tex16((g, n) => { const c = hex(base); for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) { const row = y >> 2; let k = .9 + R() * .15; if (y % 4 === 3) k = .62; if ((x + row * 5) % 16 === 0 && y % 4 !== 3) k = .7; px(g, x, y, c, k); } }),
  logSide: (base = '#6b4a2b') => tex16((g, n) => { const c = hex(base); for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) px(g, x, y, c, (x % 4 === 0 ? .7 : .95) + R() * .12); }),
  logTop: () => tex16((g, n) => { const a = hex('#b58a54'), b = hex('#6b4a2b'); for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) { const r = Math.max(Math.abs(x - 7.5), Math.abs(y - 7.5)); px(g, x, y, r > 6.5 ? b : a, (Math.round(r) % 2 ? .85 : 1) + R() * .08); } }),
  leaves: (base = '#3f7d2a') => tex16((g, n) => { const c = hex(base); for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) { if (R() < .12) continue; px(g, x, y, c, .7 + R() * .5); } }),
  glass: () => tex16((g, n) => { g.fillStyle = 'rgba(190,225,255,.25)'; g.fillRect(0, 0, n, n); g.fillStyle = 'rgba(255,255,255,.9)'; g.fillRect(0, 0, n, 1); g.fillRect(0, 0, 1, n); g.fillRect(n - 1, 0, 1, n); g.fillRect(0, n - 1, n, 1); g.fillStyle = 'rgba(255,255,255,.6)'; for (let i = 3; i < 7; i++) g.fillRect(i, 10 - i, 1, 1); }),
  windowLit: () => tex16((g, n) => { noise(g, n, '#ffcf6a', .2); g.fillStyle = '#5a3a1a'; g.fillRect(0, 0, n, 1); g.fillRect(0, 0, 1, n); g.fillRect(n - 1, 0, 1, n); g.fillRect(0, n - 1, n, 1); g.fillRect(7, 0, 2, n); g.fillRect(0, 7, n, 2); }),
  bricks: () => tex16((g, n) => { const c = hex('#9c4a3a'), m = hex('#c8bcae'); for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) { const row = y >> 2, off = row % 2 ? 4 : 0; px(g, x, y, (y % 4 === 3 || (x + off) % 8 === 0) ? m : c, .9 + R() * .15); } }),
  roof: (base = '#5a3a24') => tex16((g, n) => { const c = hex(base); for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) px(g, x, y, c, (y % 4 === 3 ? .65 : .92) + R() * .12); }),
  door: () => tex16((g, n) => { const c = hex('#7a5230'); for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) px(g, x, y, c, (x % 5 === 0 ? .65 : .95) + R() * .1); g.fillStyle = '#3a2a1a'; g.fillRect(3, 3, 4, 4); g.fillRect(9, 3, 4, 4); g.fillStyle = '#c9c9c9'; g.fillRect(12, 9, 2, 2); }),
  glow: () => tex16((g, n) => { noise(g, n, '#ffd76a', .35); }),
  water: () => tex16((g, n) => { noise(g, n, '#3a6fc4', .18); }),
  sand: () => tex16((g, n) => noise(g, n, '#dcc98e', .18)),
  wheat: () => tex16((g, n) => { g.clearRect(0, 0, n, n); const c = hex('#d9b84a'); for (let x = 1; x < n; x += 3) for (let y = 4 + (x % 3); y < n; y++) px(g, x, y, c, .8 + R() * .3); }),
  farmland: () => tex16((g, n) => { noise(g, n, '#5a3a22', .25); for (let y = 0; y < n; y += 4) { g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(0, y, n, 1); } }),
  hay: () => tex16((g, n) => { noise(g, n, '#d1a93a', .25); g.fillStyle = '#8a6a1a'; g.fillRect(0, 5, n, 1); g.fillRect(0, 10, n, 1); }),
  wool: (base) => tex16((g, n) => noise(g, n, base, .12)),
  flower: (col) => tex16((g, n) => { g.clearRect(0, 0, n, n); const s = hex('#3f7d2a'); for (let y = 8; y < n; y++) px(g, 7, y, s); px(g, 6, 11, s); px(g, 8, 12, s); const c = hex(col); for (const [x, y] of [[7, 5], [6, 6], [8, 6], [7, 7], [7, 6]]) px(g, x, y, c, x === 7 && y === 6 ? .7 : 1); }),
  concrete: (base = '#e8e6e1') => tex16((g, n) => noise(g, n, base, .06)),
  panel: (base = '#3b3f45') => tex16((g, n) => { noise(g, n, base, .08); g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(0, 15, n, 1); g.fillRect(15, 0, 1, n); }),
  cladding: (base = '#a0703f') => tex16((g, n) => { const c = hex(base); for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) px(g, x, y, c, (x % 4 === 3 ? .7 : .95) + R() * .1); }),
  asphalt: () => tex16((g, n) => noise(g, n, '#3d3f44', .16)),
  sidewalk: () => tex16((g, n) => { noise(g, n, '#c9c9c4', .08); g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(0, 0, n, 1); g.fillRect(0, 0, 1, n); g.fillRect(8, 0, 1, n); g.fillRect(0, 8, n, 1); }),
  glassModern: () => tex16((g, n) => { const gr = g.createLinearGradient(0, 0, n, n); gr.addColorStop(0, 'rgba(150,200,235,.55)'); gr.addColorStop(.5, 'rgba(90,140,190,.45)'); gr.addColorStop(1, 'rgba(160,210,240,.55)'); g.fillStyle = gr; g.fillRect(0, 0, n, n); g.fillStyle = 'rgba(40,44,50,1)'; g.fillRect(0, 0, n, 1); g.fillRect(0, n - 1, n, 1); g.fillRect(0, 0, 1, n); g.fillStyle = 'rgba(255,255,255,.5)'; for (let i = 2; i < 9; i++) g.fillRect(i, 11 - i, 1, 1); }),
  glassLit: () => tex16((g, n) => { const gr = g.createLinearGradient(0, 0, 0, n); gr.addColorStop(0, '#ffe3a6'); gr.addColorStop(1, '#ffc46a'); g.fillStyle = gr; g.fillRect(0, 0, n, n); g.fillStyle = '#2a2c30'; g.fillRect(0, 0, n, 1); g.fillRect(0, n - 1, n, 1); g.fillRect(0, 0, 1, n); g.fillStyle = 'rgba(120,80,40,.35)'; g.fillRect(3, 9, 5, 7); g.fillRect(10, 6, 4, 10); }),
  gravel: () => tex16((g, n) => noise(g, n, '#8d8c88', .3)),
  hedge: () => tex16((g, n) => noise(g, n, '#3c7a33', .35)),
  garage: () => tex16((g, n) => { noise(g, n, '#6e737a', .06); g.fillStyle = 'rgba(0,0,0,.3)'; for (let y = 3; y < n; y += 4) g.fillRect(0, y, n, 1); }),
  pool: () => tex16((g, n) => { noise(g, n, '#3fb6e0', .12); g.fillStyle = 'rgba(255,255,255,.5)'; g.fillRect(2, 4, 4, 1); g.fillRect(9, 11, 5, 1); }),
  tile: () => tex16((g, n) => { noise(g, n, '#f2f2ef', .05); g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(0, 0, n, 1); g.fillRect(0, 0, 1, n); }),
  tallGrass: () => tex16((g, n) => { g.clearRect(0, 0, n, n); const c = hex('#5f9e3a'); for (let x = 1; x < n; x += 2) { const h = 6 + (R() * 8 | 0); for (let y = n - h; y < n; y++) px(g, x, y, c, .75 + R() * .4); } }),
};

// ---------- Matériaux ----------
export function makeMaterials() {
  const m = (t, o = {}) => new THREE.MeshStandardMaterial({ map: t, roughness: .95, metalness: 0, ...o });
  const grassSide = T.grassSide(), dirt = T.dirt(), grassTop = T.grassTop();
  const logS = T.logSide(), logT = T.logTop(), birchS = T.logSide('#d8d2c4');
  const M = {
    grass: [m(grassSide), m(grassSide), m(grassTop), m(dirt), m(grassSide), m(grassSide)],
    dirt: m(dirt), path: m(T.path()), stone: m(T.stone()), cobble: m(T.cobble()),
    planks: m(T.planks()), spruce: m(T.planks('#7a5536')), darkoak: m(T.planks('#4a3220')), birchPlanks: m(T.planks('#d8c48a')),
    log: [m(logS), m(logS), m(logT), m(logT), m(logS), m(logS)], birch: [m(birchS), m(birchS), m(logT), m(logT), m(birchS), m(birchS)],
    leaves: m(T.leaves(), { alphaTest: .5, side: THREE.DoubleSide }), birchLeaves: m(T.leaves('#6a9a3a'), { alphaTest: .5, side: THREE.DoubleSide }),
    glass: m(T.glass(), { transparent: true, depthWrite: false, roughness: .1 }),
    windowLit: m(T.windowLit(), { emissive: '#ffb050', emissiveMap: null, emissiveIntensity: 0 }),
    bricks: m(T.bricks()), roof: m(T.roof()), roofRed: m(T.roof('#8a3328')), roofBlue: m(T.roof('#34507a')), roofGreen: m(T.roof('#3f6a3a')),
    door: m(T.door()), glow: m(T.glow(), { emissive: '#ffcf60', emissiveIntensity: 1.6 }),
    water: m(T.water(), { transparent: true, opacity: .82, roughness: .15 }), sand: m(T.sand()),
    farmland: m(T.farmland()), hay: m(T.hay()), wheat: m(T.wheat(), { alphaTest: .5, side: THREE.DoubleSide }),
    wool: {}, flowers: ['#e83a3a', '#f5d63a', '#ffffff', '#7a5af0', '#ff8ad0'].map(c => m(T.flower(c), { alphaTest: .5, side: THREE.DoubleSide })),
    tallGrass: m(T.tallGrass(), { alphaTest: .5, side: THREE.DoubleSide }),
    concrete: m(T.concrete(), { roughness: .8 }), concreteGray: m(T.concrete('#b9bcbf'), { roughness: .8 }), concreteDark: m(T.concrete('#6b6e73')),
    panel: m(T.panel(), { roughness: .6, metalness: .2 }), cladding: m(T.cladding()), claddingDark: m(T.cladding('#5a3d26')),
    asphalt: m(T.asphalt()), sidewalk: m(T.sidewalk()), gravel: m(T.gravel()), hedge: m(T.hedge()), garage: m(T.garage(), { metalness: .3, roughness: .5 }),
    glassModern: m(T.glassModern(), { transparent: true, depthWrite: false, roughness: .05, metalness: .3 }),
    glassLit: m(T.glassLit(), { emissive: '#ffb860', emissiveIntensity: 0 }),
    pool: m(T.pool(), { roughness: .1, emissive: '#1a6a8a', emissiveIntensity: .2 }), tile: m(T.tile(), { roughness: .5 }),
  };
  M.windowLit.emissiveMap = M.windowLit.map; M.glassLit.emissiveMap = M.glassLit.map;
  for (const [k, c] of Object.entries({ white: '#e9ecec', red: '#a12722', yellow: '#f9c627', blue: '#35399d', green: '#546d1b', orange: '#f07613', pink: '#ed8dac' })) M.wool[k] = m(T.wool(c));
  return M;
}

// ---------- Monde en blocs ----------
export class VoxelWorld {
  constructor(parent, ox = 0, oz = 0, mats) { this.parent = parent; this.ox = ox; this.oz = oz; this.M = mats || makeMaterials(); this.cells = new Map(); this.slabs = new Map(); this.cross = new Map(); this.group = new THREE.Group(); parent.add(this.group); this.lights = []; }
  key(x, y, z) { return x + ',' + y + ',' + z; }
  set(x, y, z, t) { if (t) this.cells.set(this.key(x, y, z), t); else this.cells.delete(this.key(x, y, z)); }
  get(x, y, z) { return this.cells.get(this.key(x, y, z)); }
  fill(x0, y0, z0, x1, y1, z1, t) { for (let x = Math.min(x0, x1); x <= Math.max(x0, x1); x++) for (let y = Math.min(y0, y1); y <= Math.max(y0, y1); y++) for (let z = Math.min(z0, z1); z <= Math.max(z0, z1); z++) this.set(x, y, z, t); }
  slab(x, y, z, t, top = false) { this.slabs.set(this.key(x, y, z) + (top ? 't' : 'b'), [x, y, z, t, top]); }
  plant(x, y, z, t) { this.cross.set(this.key(x, y, z), [x, y, z, t]); }
  pos(x, y, z) { return new THREE.Vector3(this.ox + (x + .5) * BS, (y + .5) * BS, this.oz + (z + .5) * BS); }
  build() {
    const byType = new Map();
    const solid = (t) => t && !['glass', 'glassModern', 'leaves', 'birchLeaves', 'water'].includes(t);
    for (const [k, t] of this.cells) {
      const [x, y, z] = k.split(',').map(Number);
      // n'instancie pas les blocs totalement entourés
      if (solid(t) && solid(this.get(x + 1, y, z)) && solid(this.get(x - 1, y, z)) && solid(this.get(x, y + 1, z)) && solid(this.get(x, y - 1, z)) && solid(this.get(x, y, z + 1)) && solid(this.get(x, y, z - 1))) continue;
      if (!byType.has(t)) byType.set(t, []); byType.get(t).push([x, y, z]);
    }
    const geo = new THREE.BoxGeometry(BS, BS, BS), m4 = new THREE.Matrix4();
    for (const [t, list] of byType) {
      const mat = this.M[t] || this.M.wool[t.replace('wool_', '')] || this.M.stone;
      const im = new THREE.InstancedMesh(geo, mat, list.length);
      list.forEach(([x, y, z], i) => { m4.makeTranslation(this.ox + (x + .5) * BS, (y + .5) * BS, this.oz + (z + .5) * BS); im.setMatrixAt(i, m4); });
      im.castShadow = !['glass', 'glassModern', 'water'].includes(t); im.receiveShadow = true; this.group.add(im);
    }
    // dalles (demi-blocs)
    const sg = new THREE.BoxGeometry(BS, BS / 2, BS), sb = new Map();
    for (const [, v] of this.slabs) { if (!sb.has(v[3])) sb.set(v[3], []); sb.get(v[3]).push(v); }
    for (const [t, list] of sb) {
      const im = new THREE.InstancedMesh(sg, this.M[t] || this.M.stone, list.length);
      list.forEach(([x, y, z, , top], i) => { m4.makeTranslation(this.ox + (x + .5) * BS, (y + (top ? .75 : .25)) * BS, this.oz + (z + .5) * BS); im.setMatrixAt(i, m4); });
      im.castShadow = true; im.receiveShadow = true; this.group.add(im);
    }
    // plantes en croix
    const pg = new THREE.PlaneGeometry(BS * .9, BS * .9), pb = new Map(), q = new THREE.Quaternion(), s = new THREE.Vector3(1, 1, 1);
    for (const [, v] of this.cross) { if (!pb.has(v[3])) pb.set(v[3], []); pb.get(v[3]).push(v); }
    for (const [t, list] of pb) {
      const mat = t.startsWith('flower') ? this.M.flowers[+t.slice(6) % this.M.flowers.length] : this.M[t];
      const im = new THREE.InstancedMesh(pg, mat, list.length * 2);
      list.forEach(([x, y, z], i) => { for (let j = 0; j < 2; j++) { q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 4 + j * Math.PI / 2); m4.compose(new THREE.Vector3(this.ox + (x + .5) * BS, (y + .45) * BS, this.oz + (z + .5) * BS), q, s); im.setMatrixAt(i * 2 + j, m4); } });
      this.group.add(im);
    }
    return this;
  }
  // nuit (fenêtres allumées, lampes) : k entre 0 et 1
  setNight(k) { this.M.windowLit.emissiveIntensity = 1.6 * k; this.M.glassLit.emissiveIntensity = .25 + 1.4 * k; this.M.glow.emissiveIntensity = .4 + 1.6 * k; this.lights.forEach(l => l.intensity = l.userData.base * k); }
}

// ---------- Constructions ----------
const pick = (r, a) => a[Math.floor(r() * a.length) % a.length];

// Maison : x,z = coin, w×d au sol, porte au milieu de la façade (côté z+ si face = 1, z- si -1)
export function house(vw, x, z, o = {}) {
  const r = o.r || Math.random, w = o.w ?? 5, d = o.d ?? 5, h = o.h ?? 3, face = o.face ?? 1;
  const wall = o.wall ?? pick(r, ['planks', 'planks', 'birchPlanks', 'spruce', 'bricks']), corner = o.corner ?? (wall === 'bricks' ? 'stone' : 'log'), roof = o.roof ?? pick(r, ['roof', 'roofRed', 'roofBlue', 'spruce', 'darkoak']);
  const x1 = x + w - 1, z1 = z + d - 1;
  vw.fill(x, 0, z, x1, 0, z1, 'cobble');           // soubassement
  for (let y = 1; y <= h; y++) {
    for (let i = x; i <= x1; i++) for (let k = z; k <= z1; k++) {
      const edgeX = i === x || i === x1, edgeZ = k === z || k === z1;
      if (!edgeX && !edgeZ) { vw.set(i, y, k, null); continue; }
      const isCorner = edgeX && edgeZ;
      vw.set(i, y, k, isCorner ? corner : wall);
    }
  }
  vw.fill(x + 1, 0, z + 1, x1 - 1, 0, z1 - 1, o.floor ?? 'spruce');
  // porte (façade z1 si face = 1, sinon z)
  const dx = x + Math.floor(w / 2), dz = face === 1 ? z1 : z;
  // fenêtres
  const winY = 2, lit = o.lit ?? (r() > .35), winT = lit ? 'windowLit' : 'glass';
  for (let i = x + 1; i < x1; i += 2) { for (const kk of [z, z1]) if (!(kk === dz && Math.abs(i - dx) < 1)) vw.set(i, winY, kk, winT); }
  for (let k = z + 1; k < z1; k += 2) { vw.set(x, winY, k, winT); vw.set(x1, winY, k, winT); }
  vw.set(dx, 1, dz, 'door'); vw.set(dx, 2, dz, 'door'); vw.slab(dx, 0, dz + (face === 1 ? 1 : -1), 'cobble');
  // toit à deux pans (faîte parallèle à x), avec débord
  const top = h + 1;
  let layers = 0;
  for (let L = 0; ; L++) {
    const za = z - 1 + L, zb = z1 + 1 - L; if (za > zb) break; layers = L + 1;
    for (let i = x - 1; i <= x1 + 1; i++) { vw.set(i, top + L, za, roof); vw.set(i, top + L, zb, roof); }
    for (let k = za + 1; k <= zb - 1; k++) { vw.set(x, top + L, k, wall); vw.set(x1, top + L, k, wall); }
    if (za === zb || za + 1 === zb) for (let i = x - 1; i <= x1 + 1; i++) vw.slab(i, top + L + 1, za, roof);
  }
  // cheminée
  if (o.chimney ?? r() > .5) vw.fill(x1 - 1, top, z + 1, x1 - 1, top + layers + 1, z + 1, 'bricks');
  // lanterne près de la porte
  vw.set(dx + 1, 3, dz + (face === 1 ? 1 : -1), 'glow');
  const doorPos = vw.pos(dx, 0, dz + (face === 1 ? 1 : -1)); doorPos.y = 0;
  return { x, z, w, d, door: doorPos, center: vw.pos(x + w / 2 - .5, 0, z + d / 2 - .5) };
}
export function tree(vw, x, z, o = {}) {
  const r = o.r || Math.random, birch = o.birch ?? r() > .7, h = o.h ?? (4 + (r() * 2 | 0));
  const log = birch ? 'birch' : 'log', lv = birch ? 'birchLeaves' : 'leaves';
  for (let y = 0; y < h; y++) vw.set(x, y, z, log);
  for (let y = h - 3; y <= h; y++) { const rad = y >= h - 1 ? 1 : 2; for (let i = -rad; i <= rad; i++) for (let k = -rad; k <= rad; k++) { if (Math.abs(i) === rad && Math.abs(k) === rad && r() > .4) continue; if (i === 0 && k === 0 && y < h) continue; if (!vw.get(x + i, y, z + k)) vw.set(x + i, y, z + k, lv); } }
}
export function lampPost(vw, x, z, scene) {
  vw.set(x, 0, z, 'darkoak'); vw.set(x, 1, z, 'darkoak'); vw.set(x, 2, z, 'glow');
  const p = vw.pos(x, 2, z); const l = new THREE.PointLight('#ffcf80', 0, 14, 1.4); l.position.copy(p); l.position.y += .3; l.userData.base = 14; vw.group.add(l); vw.lights.push(l);
}
export function well(vw, x, z) {
  for (let i = -1; i <= 1; i++) for (let k = -1; k <= 1; k++) { if (i === 0 && k === 0) vw.set(x, -1, z, 'water'); else vw.set(x + i, 0, z + k, 'cobble'); }
  for (const [i, k] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { vw.set(x + i, 1, z + k, 'darkoak'); vw.set(x + i, 2, z + k, 'darkoak'); }
  for (let i = -1; i <= 1; i++) for (let k = -1; k <= 1; k++) vw.slab(x + i, 3, z + k, 'roofRed');
}
export function field(vw, x, z, w, d) {
  for (let i = 0; i < w; i++) for (let k = 0; k < d; k++) { if (k === Math.floor(d / 2)) vw.set(x + i, -1, z + k, 'water'); else { vw.set(x + i, -1, z + k, 'farmland'); vw.plant(x + i, 0, z + k, 'wheat'); } }
  for (let i = -1; i <= w; i++) { vw.slab(i + x, 0, z - 1, 'spruce'); vw.slab(i + x, 0, z + d, 'spruce'); }
}

// Village : grande rue est-ouest + rue nord-sud, maisons des deux côtés, champs, puits, arbres, lampadaires.
export function village(vw, o = {}) {
  const r = rng(o.seed ?? 7), N = o.half ?? 28, houses = [];
  // chemins
  for (let i = -N; i <= N; i++) { for (const k of [0, 1, 2]) vw.set(i, -1, k, 'path'); }
  for (let k = -N; k <= N; k++) { if (k >= 0 && k <= 2) continue; for (const i of [-1, 0, 1]) vw.set(i, -1, k, 'path'); }
  // maisons le long de la grande rue
  for (let side of [-1, 1]) {
    for (let i = -N + 2; i < N - 6; i += 8) {
      if (Math.abs(i) < 6) continue;
      const w = 5 + (r() * 3 | 0), d = 5 + (r() * 2 | 0);
      const z = side < 0 ? -2 - d : 4;
      houses.push(house(vw, i, z, { r, w, d, h: 3 + (r() > .7 ? 1 : 0), face: side < 0 ? 1 : -1 }));
    }
    for (let k = -N + 2; k < N - 6; k += 9) {
      if (k > -8 && k < 8) continue;
      const w = 5 + (r() * 2 | 0), d = 5 + (r() * 2 | 0);
      const x = side < 0 ? -3 - w : 3;
      houses.push(house(vw, x, k, { r, w, d, h: 3, face: k < 0 ? 1 : -1 }));
    }
  }
  well(vw, 4, -4);
  field(vw, -N + 2, N - 12, 9, 7); field(vw, N - 12, -N + 2, 9, 7);
  for (let i = 0; i < (o.trees ?? 40); i++) { const x = (r() * 2 - 1) * (N + 8) | 0, z = (r() * 2 - 1) * (N + 8) | 0; if (Math.abs(z - 1) < 4 || Math.abs(x) < 3) continue; let ok = true; for (const h of houses) if (x >= h.x - 2 && x <= h.x + h.w + 1 && z >= h.z - 2 && z <= h.z + h.d + 1) ok = false; if (ok && !vw.get(x, 0, z) && !vw.get(x, -1, z)) tree(vw, x, z, { r }); }
  for (const i of [-20, -10, 10, 20]) lampPost(vw, i, 3);
  for (const k of [-14, 14]) lampPost(vw, 2, k);
  // herbes et fleurs
  for (let i = 0; i < 260; i++) { const x = (r() * 2 - 1) * (N + 6) | 0, z = (r() * 2 - 1) * (N + 6) | 0; if (!vw.get(x, -1, z) && !vw.get(x, 0, z)) vw.plant(x, 0, z, r() > .7 ? 'flower' + (r() * 5 | 0) : 'tallGrass'); }
  return { houses };
}
// Sol : grande plaque d'herbe (texture qui se répète) + bord en blocs
export function ground(parent, M, size = 200, cx = 0, cz = 0) {
  const t = M.grass[2].map.clone(); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(size / BS, size / BS); t.needsUpdate = true;
  const g = new THREE.Mesh(new THREE.PlaneGeometry(size, size), new THREE.MeshStandardMaterial({ map: t, roughness: 1 }));
  g.rotation.x = -Math.PI / 2; g.position.set(cx, -.03, cz); g.receiveShadow = true; parent.add(g); return g;
}
// Nuages en blocs
export function clouds(parent, cx = 0, cz = 0) {
  const r = rng(99), m = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 1, transparent: true, opacity: .92, fog: false });
  const geo = new THREE.BoxGeometry(1, 1, 1), n = 40, im = new THREE.InstancedMesh(geo, m, n), m4 = new THREE.Matrix4();
  for (let i = 0; i < n; i++) { m4.compose(new THREE.Vector3(cx + (r() - .5) * 260, 55 + r() * 10, cz + (r() - .5) * 260), new THREE.Quaternion(), new THREE.Vector3(10 + r() * 22, 3, 8 + r() * 16)); im.setMatrixAt(i, m4); }
  parent.add(im); return im;
}

// ================= VILLE MODERNE =================
// Maison contemporaine : rez-de-chaussée béton + grandes baies, étage en porte-à-faux (bardage), toit plat.
export function modernHouse(vw, x, z, o = {}) {
  const r = o.r || Math.random, w = o.w ?? 8, d = o.d ?? 7, face = o.face ?? 1;
  const x1 = x + w - 1, z1 = z + d - 1, fz = face === 1 ? z1 : z, bz = face === 1 ? z : z1, out = face === 1 ? 1 : -1;
  const lit = r() > .3, gl = () => (lit && r() > .35 ? 'glassLit' : 'glassModern');
  const upper = o.upper ?? pick(r, ['cladding', 'claddingDark', 'panel', 'concrete']);
  // rez-de-chaussée (2 blocs de haut)
  for (let y = 0; y <= 1; y++) for (let i = x; i <= x1; i++) for (let k = z; k <= z1; k++) {
    const ex = i === x || i === x1, ez = k === z || k === z1; if (!ex && !ez) continue;
    let t = 'concrete';
    if (k === fz && i > x + 1 && i < x1 - 2) t = gl();                 // baie vitrée façade
    if ((i === x || i === x1) && k > z && k < z1 && y === 1 && k % 2 === 0) t = gl();
    if (k === fz && i === x1 - 1) t = 'glassModern';                   // porte vitrée
    vw.set(i, y, k, t);
  }
  // garage accolé
  if (o.garage ?? r() > .4) { const gx = x1 + 1; vw.fill(gx, 0, z + 1, gx + 2, 1, z1, 'concreteGray'); vw.fill(gx, 0, fz, gx + 2, 1, fz, 'garage'); vw.fill(gx, 0, z + 2, gx + 2, 1, z1 - 1, null); vw.fill(gx, 2, z + 1, gx + 2, 2, z1, 'concreteDark'); }
  // dalle + étage en porte-à-faux (décalé vers la façade)
  const ux0 = x - 1 + (r() * 2 | 0), ux1 = ux0 + w - 2, uz0 = z + (face === 1 ? 1 : -1), uz1 = uz0 + d - 1;
  vw.fill(x, 2, z, x1, 2, z1, 'concreteGray');
  for (let y = 3; y <= 4; y++) for (let i = ux0; i <= ux1; i++) for (let k = uz0; k <= uz1; k++) {
    const ex = i === ux0 || i === ux1, ez = k === uz0 || k === uz1; if (!ex && !ez) continue;
    const front = k === (face === 1 ? uz1 : uz0);
    vw.set(i, y, k, front && i > ux0 && i < ux1 && y === 4 - (i % 2) * 0 ? gl() : (front && i > ux0 && i < ux1 ? gl() : upper));
  }
  vw.fill(ux0, 5, uz0, ux1, 5, uz1, 'concreteGray');                    // toit plat
  for (let i = ux0; i <= ux1; i++) for (let k = uz0; k <= uz1; k++) if (i === ux0 || i === ux1 || k === uz0 || k === uz1) vw.slab(i, 6, k, 'concrete');
  // terrasse, haie, allée
  for (let i = x - 1; i <= x1 + 3; i++) vw.set(i, -1, fz + out, 'tile');
  for (let k = fz + 2 * out; Math.abs(k - fz) <= 4; k += out) vw.set(x1 - 1, -1, k, 'tile');
  for (let i = x - 2; i <= x1 + 4; i++) if (i !== x1 - 1) vw.slab(i, 0, fz + 5 * out, 'hedge');
  // piscine à l'arrière
  if (o.pool ?? r() > .5) { for (let i = x + 1; i <= x + 4; i++) for (let k = 0; k < 3; k++) vw.set(i, -1, bz - out * (2 + k), 'pool'); for (let i = x; i <= x + 5; i++) { vw.set(i, -1, bz - out, 'tile'); vw.set(i, -1, bz - out * 5, 'tile'); } }
  const doorPos = vw.pos(x1 - 1, 0, fz + out); doorPos.y = 0;
  return { x, z, w, d, door: doorPos, center: vw.pos(x + w / 2 - .5, 0, z + d / 2 - .5), front: fz, face };
}
// Immeuble : 5 étages, fenêtres en bandeaux, balcons vitrés
export function apartment(vw, x, z, o = {}) {
  const r = o.r || Math.random, w = o.w ?? 8, d = o.d ?? 8, floors = o.floors ?? 5, face = o.face ?? 1;
  const x1 = x + w - 1, z1 = z + d - 1, fz = face === 1 ? z1 : z, out = face === 1 ? 1 : -1;
  const base = o.mat ?? pick(r, ['concrete', 'concreteGray', 'bricks']);
  const H = floors * 2;
  for (let y = 0; y < H; y++) for (let i = x; i <= x1; i++) for (let k = z; k <= z1; k++) {
    const ex = i === x || i === x1, ez = k === z || k === z1; if (!ex && !ez) continue;
    const cornerCol = ex && ez; const winRow = y % 2 === 1;
    let t = base; if (!cornerCol && winRow) t = r() > .45 ? 'glassLit' : 'glassModern';
    if (y === 0 && k === fz && i >= x + 3 && i <= x + 4) t = 'glassModern';
    vw.set(i, y, k, t);
  }
  vw.fill(x, H, z, x1, H, z1, 'gravel'); for (let i = x; i <= x1; i++) for (const k of [z, z1]) vw.slab(i, H + 1, k, base); for (let k = z; k <= z1; k++) for (const i of [x, x1]) vw.slab(i, H + 1, k, base);
  for (let f = 1; f < floors; f++) for (let i = x + 1; i <= x1 - 1; i += 3) { vw.slab(i, f * 2, fz + out, 'concreteGray'); vw.slab(i + 1, f * 2, fz + out, 'concreteGray'); vw.set(i, f * 2 + 1, fz + out, 'glassModern'); vw.set(i + 1, f * 2 + 1, fz + out, 'glassModern'); }
  for (let i = x - 1; i <= x1 + 1; i++) vw.set(i, -1, fz + out, 'tile');
  return { x, z, w, d, center: vw.pos(x + w / 2 - .5, 0, z + d / 2 - .5) };
}
// Commerce : grande vitrine + auvent coloré
export function shop(vw, x, z, o = {}) {
  const r = o.r || Math.random, w = o.w ?? 7, d = o.d ?? 6, face = o.face ?? 1, col = o.color ?? pick(r, ['wool_red', 'wool_yellow', 'wool_blue', 'wool_green', 'wool_orange']);
  const x1 = x + w - 1, z1 = z + d - 1, fz = face === 1 ? z1 : z, out = face === 1 ? 1 : -1;
  for (let y = 0; y <= 2; y++) for (let i = x; i <= x1; i++) for (let k = z; k <= z1; k++) { const ex = i === x || i === x1, ez = k === z || k === z1; if (!ex && !ez) continue; vw.set(i, y, k, k === fz && i > x && i < x1 && y < 2 ? 'glassLit' : 'concrete'); }
  vw.fill(x, 3, z, x1, 3, z1, 'concreteGray');
  for (let i = x; i <= x1; i++) vw.slab(i, 2, fz + out, col, true);
  for (let i = x; i <= x1; i++) vw.set(i, -1, fz + out, 'tile');
  return { x, z, w, d, center: vw.pos(x + w / 2 - .5, 0, z + d / 2 - .5) };
}
// Ville : grille de rues (asphalte + trottoirs), îlots de maisons, immeubles au centre, parc, voitures.
export function modernTown(vw, scene, o = {}) {
  const r = rng(o.seed ?? 11), cells = o.cells ?? 2, P = 18, houses = [], lamps = [];
  const lo = -cells * P, hi = cells * P;
  // rues
  for (let a = lo; a <= hi; a += P) for (let b = lo; b <= hi + 3; b++) for (let j = 0; j < 3; j++) { vw.set(b, -1, a + j, 'asphalt'); vw.set(a + j, -1, b, 'asphalt'); }
  // trottoirs (bordure)
  for (let a = lo; a <= hi; a += P) for (let b = lo; b <= hi + 3; b++) for (const j of [-1, 3]) { if (!vw.get(b, -1, a + j)) vw.slab(b, -1, a + j, 'sidewalk', true); if (!vw.get(a + j, -1, b)) vw.slab(a + j, -1, b, 'sidewalk', true); }
  // îlots
  for (let cx = lo; cx < hi; cx += P) for (let cz = lo; cz < hi; cz += P) {
    const x0 = cx + 5, z0 = cz + 5, central = Math.abs(cx + P / 2) < P && Math.abs(cz + P / 2) < P;
    const kind = central ? (r() > .4 ? 'apt' : 'park') : (r() > .82 ? 'shop' : 'house');
    if (kind === 'park') { for (let i = 0; i < 6; i++) tree(vw, x0 + (r() * 10 | 0), z0 + (r() * 10 | 0), { r, birch: false }); for (let i = 0; i < 40; i++) vw.plant(x0 + (r() * 12 | 0), 0, z0 + (r() * 12 | 0), r() > .5 ? 'flower' + (r() * 5 | 0) : 'tallGrass'); continue; }
    if (kind === 'apt') { houses.push({ kind, ...apartment(vw, x0 + 1, z0 + 1, { r, face: r() > .5 ? 1 : -1, floors: 4 + (r() * 3 | 0) }) }); continue; }
    if (kind === 'shop') { houses.push({ kind, ...shop(vw, x0, z0 + 4, { r, face: 1 }) }); continue; }
    // deux maisons par îlot, tournées vers les rues
    houses.push({ kind, ...modernHouse(vw, x0 - 2, z0 - 2, { r, face: -1, w: 7, d: 5 }) });
    houses.push({ kind, ...modernHouse(vw, x0 - 2, z0 + 6, { r, face: 1, w: 7, d: 5 }) });
    if (r() > .5) tree(vw, x0 + 9, z0 + 4, { r, h: 5 });
  }
  // marquage au sol + lampadaires + voitures (maillage simple)
  const lineM = new THREE.MeshStandardMaterial({ color: '#f2f2f2', roughness: .6 }), lg = new THREE.PlaneGeometry(BS * 1.2, .16);
  const poleM = new THREE.MeshStandardMaterial({ color: '#2a2d33', metalness: .6, roughness: .4 }), headM = new THREE.MeshStandardMaterial({ color: '#f5f5f0', emissive: '#fff3d0', emissiveIntensity: 0 });
  for (let a = lo; a <= hi; a += P) for (let b = lo; b <= hi; b += 2) {
    const z = vw.oz + (a + 1.5) * BS, x = vw.ox + (b + .5) * BS;
    const l1 = new THREE.Mesh(lg, lineM); l1.rotation.x = -Math.PI / 2; l1.position.set(x, .02, z); vw.group.add(l1);
    const l2 = new THREE.Mesh(lg, lineM); l2.rotation.x = -Math.PI / 2; l2.rotation.z = Math.PI / 2; l2.position.set(vw.ox + (a + 1.5) * BS, .02, vw.oz + (b + .5) * BS); vw.group.add(l2);
    if ((b - lo) % 8 === 4) {
      const lx = x, lz = vw.oz + (a - .6) * BS;
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(.07, .09, 5.4, 8), poleM); pole.position.set(lx, 2.7, lz); pole.castShadow = true; vw.group.add(pole);
      const arm = new THREE.Mesh(new THREE.BoxGeometry(.12, .12, 1.4), poleM); arm.position.set(lx, 5.35, lz + .7); vw.group.add(arm);
      const head = new THREE.Mesh(new THREE.BoxGeometry(.5, .14, .8), headM); head.position.set(lx, 5.25, lz + 1.3); vw.group.add(head);
      if (lamps.length < 10) { const pl = new THREE.PointLight('#ffe8c0', 0, 16, 1.4); pl.position.set(lx, 5.0, lz + 1.3); pl.userData.base = 18; vw.group.add(pl); vw.lights.push(pl); lamps.push(pl); }
    }
  }
  vw.lampHeads = headM;
  const carCols = ['#c0392b', '#2e86de', '#f1f2f6', '#2d3436', '#f39c12', '#16a085', '#8e44ad'];
  const cars = [];
  for (let i = 0; i < (o.cars ?? 14); i++) {
    const g = new THREE.Group(); const c = carCols[i % carCols.length];
    const body = new THREE.Mesh(new THREE.BoxGeometry(2.0, .75, 4.2), new THREE.MeshStandardMaterial({ color: c, metalness: .5, roughness: .3 })); body.position.y = .65; g.add(body);
    const cab = new THREE.Mesh(new THREE.BoxGeometry(1.8, .7, 2.2), new THREE.MeshStandardMaterial({ color: '#1c2a38', metalness: .6, roughness: .1 })); cab.position.set(0, 1.35, -.2); g.add(cab);
    for (const [a, b] of [[-1, 1.35], [1, 1.35], [-1, -1.35], [1, -1.35]]) { const wh = new THREE.Mesh(new THREE.CylinderGeometry(.38, .38, .3, 14), new THREE.MeshStandardMaterial({ color: '#141414' })); wh.rotation.z = Math.PI / 2; wh.position.set(a * 1.0, .38, b); g.add(wh); }
    g.traverse(m => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
    const along = r() > .5, a = lo + P * (Math.floor(r() * (2 * cells)) + (along ? 0 : 0)), b = lo + 3 + r() * (hi - lo - 6);
    if (along) { g.position.set(vw.ox + (b + .5) * BS, 0, vw.oz + (a + (r() > .5 ? .6 : 2.4)) * BS); g.rotation.y = Math.PI / 2; } else { g.position.set(vw.ox + (a + (r() > .5 ? .6 : 2.4)) * BS, 0, vw.oz + (b + .5) * BS); }
    vw.group.add(g); cars.push(g);
  }
  vw.setNightModern = (k) => { vw.setNight(k); headM.emissiveIntensity = 2.5 * k; };
  return { houses, cars, roadZ: (a) => vw.oz + (a + 1.5) * BS, P, lo, hi };
}
