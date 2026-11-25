// Bibliothèque commune : matériaux, textures canvas, personnages en blocs, visages expressifs.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export const W = 720, H = 1280;

export function rng(seed) {
  return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const ease = x => { x = clamp(x); return x < .5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2; };
export const lerp = (a, b, k) => a + (b - a) * k;
export const v3 = (x, y, z) => new THREE.Vector3(x, y, z);
export const lerpV = (a, b, k) => new THREE.Vector3(lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k));

export const mat = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: .85, metalness: 0, ...o });

export function mesh(geo, material, parent, x = 0, y = 0, z = 0, shadow = true) {
  const m = new THREE.Mesh(geo, material);
  m.position.set(x, y, z);
  m.castShadow = shadow; m.receiveShadow = true;
  if (parent) parent.add(m);
  return m;
}
export const box = (w, h, d, material, parent, x, y, z, shadow) => mesh(new THREE.BoxGeometry(w, h, d), material, parent, x, y, z, shadow);
export const rbox = (w, h, d, r, material, parent, x, y, z) => mesh(new RoundedBoxGeometry(w, h, d, 4, r), material, parent, x, y, z);

export function canvasTex(w, h, draw, opts = {}) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'); draw(g, w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  if (opts.repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...opts.repeat); }
  t.userData.canvas = c; t.userData.draw = draw;
  return t;
}
export function redraw(tex, draw) { const c = tex.userData.canvas, g = c.getContext('2d'); g.clearRect(0, 0, c.width, c.height); draw(g, c.width, c.height); tex.needsUpdate = true; }

export function roundRect(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }

// ---------- Visages ----------
const faceCache = new Map();
export function faceTex(o, expr) {
  const key = JSON.stringify(o) + expr;
  if (faceCache.has(key)) return faceCache.get(key);
  const t = canvasTex(512, 512, (g) => drawFace(g, o, expr));
  faceCache.set(key, t);
  return t;
}
function drawFace(g, o, expr) {
  const S = 2; g.scale(S, S); g.lineCap = 'round'; g.lineJoin = 'round';
  const ex = [92, 164], ey = 112, brow = o.brow || '#3a2214';
  const closed = ['smileClosed', 'laugh', 'sleep'].includes(expr);
  const sad = ['sad', 'cry', 'cold'].includes(expr);
  // joues
  if (o.blush || expr === 'cold' || expr === 'cry' || closed) {
    g.fillStyle = expr === 'cold' ? 'rgba(235,90,90,.45)' : 'rgba(240,110,110,.32)';
    for (const x of [72, 184]) { g.beginPath(); g.ellipse(x, 150, 18, 10, 0, 0, 7); g.fill(); }
  }
  // yeux
  for (const [i, x] of ex.entries()) {
    if (closed) {
      g.strokeStyle = '#1a1210'; g.lineWidth = 7; g.beginPath();
      if (expr === 'sleep') { g.moveTo(x - 15, ey + 4); g.quadraticCurveTo(x, ey + 12, x + 15, ey + 4); }
      else { g.moveTo(x - 15, ey + 6); g.quadraticCurveTo(x, ey - 14, x + 15, ey + 6); }
      g.stroke();
    } else {
      const big = expr === 'wonder' || expr === 'cry' ? 1.18 : 1;
      g.fillStyle = '#141010'; g.beginPath(); g.ellipse(x, ey, 15 * big, 21 * big, 0, 0, 7); g.fill();
      g.fillStyle = '#fff'; g.beginPath(); g.arc(x - 5 * big, ey - 8 * big, 6 * big, 0, 7); g.fill();
      if (expr === 'wonder' || expr === 'cry') { g.beginPath(); g.arc(x + 5, ey + 7, 3.5, 0, 7); g.fill(); }
    }
    // sourcils
    g.strokeStyle = brow; g.lineWidth = 8; g.beginPath();
    const s = i === 0 ? 1 : -1;
    if (sad) { g.moveTo(x - 16 * s, ey - 30); g.lineTo(x + 14 * s, ey - 42); }
    else if (expr === 'wonder') { g.moveTo(x - 15, ey - 44); g.quadraticCurveTo(x, ey - 52, x + 15, ey - 44); }
    else if (expr === 'angry') { g.moveTo(x - 16 * s, ey - 44); g.lineTo(x + 14 * s, ey - 32); }
    else { g.moveTo(x - 15, ey - 36); g.quadraticCurveTo(x, ey - 42, x + 15, ey - 36); }
    g.stroke();
  }
  // lunettes
  if (o.glasses) {
    g.strokeStyle = '#6b3a2a'; g.lineWidth = 5;
    for (const x of ex) { g.beginPath(); g.arc(x, ey + 2, 27, 0, 7); g.stroke(); }
    g.beginPath(); g.moveTo(119, ey); g.lineTo(137, ey); g.stroke();
    g.fillStyle = 'rgba(255,255,255,.18)'; for (const x of ex) { g.beginPath(); g.arc(x, ey + 2, 25, 0, 7); g.fill(); }
  }
  if (o.mustache) { g.fillStyle = o.mustache; g.beginPath(); g.ellipse(112, 158, 22, 9, .2, 0, 7); g.ellipse(144, 158, 22, 9, -.2, 0, 7); g.fill(); }
  if (o.wrinkles) { g.strokeStyle = 'rgba(120,70,50,.35)'; g.lineWidth = 3; for (const x of [56, 200]) { g.beginPath(); g.moveTo(x, ey - 4); g.lineTo(x + (x < 128 ? -8 : 8), ey + 4); g.stroke(); } g.beginPath(); g.moveTo(104, 62); g.lineTo(152, 62); g.stroke(); }
  // larmes
  if (expr === 'cry') {
    g.fillStyle = 'rgba(120,190,255,.85)';
    for (const x of ex) { g.beginPath(); g.moveTo(x - 4, ey + 22); g.quadraticCurveTo(x - 10, ey + 60, x - 2, ey + 74); g.quadraticCurveTo(x + 6, ey + 60, x + 2, ey + 22); g.fill(); }
  }
  // bouche
  g.strokeStyle = '#2a1410'; g.lineWidth = 7; g.fillStyle = '#5a1a1a';
  const my = 172;
  g.beginPath();
  switch (expr) {
    case 'laugh':
      g.moveTo(98, my - 8); g.quadraticCurveTo(128, my + 40, 158, my - 8); g.closePath(); g.fill();
      g.fillStyle = '#e0505a'; g.beginPath(); g.ellipse(128, my + 12, 14, 8, 0, 0, 7); g.fill(); break;
    case 'smile': case 'smileClosed':
      g.moveTo(102, my - 6); g.quadraticCurveTo(128, my + 18, 154, my - 6); g.stroke(); break;
    case 'sad': case 'cry':
      g.moveTo(108, my + 8); g.quadraticCurveTo(128, my - 8, 148, my + 8); g.stroke(); break;
    case 'cold':
      g.moveTo(106, my); for (let i = 0; i < 6; i++) g.lineTo(110 + i * 7, my + (i % 2 ? -4 : 4)); g.stroke(); break;
    case 'wonder':
      g.ellipse(128, my, 9, 12, 0, 0, 7); g.fill(); break;
    case 'sleep':
      g.moveTo(116, my); g.lineTo(140, my); g.stroke(); break;
    default:
      g.moveTo(112, my); g.quadraticCurveTo(128, my + 8, 144, my); g.stroke();
  }
}

// ---------- Croissant ----------
export function croissantGeo() {
  const arc = Math.PI * 1.3, R = .28;
  const geo = new THREE.TorusGeometry(R, .16, 14, 40, arc);
  const p = geo.attributes.position, col = [];
  const c1 = new THREE.Color('#e3a24a'), c2 = new THREE.Color('#9a5a1e'), tmp = new THREE.Color();
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    let a = Math.atan2(y, x); if (a < -0.01) a += Math.PI * 2;
    const s = clamp(a / arc);
    const cx = Math.cos(a) * R, cy = Math.sin(a) * R;
    const ridge = 1 + .1 * Math.cos(s * Math.PI * 10);
    const f = (.25 + .75 * Math.pow(Math.sin(Math.PI * s), .7)) * ridge;
    p.setXYZ(i, cx + (x - cx) * f, cy + (y - cy) * f, z * f * .85);
    tmp.copy(c1).lerp(c2, .5 - .5 * Math.cos(s * Math.PI * 10) + (z < 0 ? .2 : 0));
    col.push(tmp.r, tmp.g, tmp.b);
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  geo.rotateZ(-arc / 2 - Math.PI / 2);
  geo.rotateX(-Math.PI / 2);
  geo.computeVertexNormals();
  return geo;
}
export const croissantMat = () => new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .45, metalness: 0 });

// ---------- Personnage en blocs ----------
export function makeChar(o) {
  const g = new THREE.Group();
  const skin = mat(o.skin || '#f0c49a', { roughness: .6 });
  const shirt = mat(o.shirt || '#ffffff', { roughness: .8 });
  const pants = mat(o.pants || '#2c3a5c');
  const shoes = mat('#2a2222');
  const ch = { g, faceOpts: o.face || {} };
  // jambes
  for (const s of [-1, 1]) {
    const leg = new THREE.Group(); leg.position.set(.25 * s, 1, 0); g.add(leg);
    box(.48, .9, .5, pants, leg, 0, -.45, 0);
    box(.5, .16, .58, shoes, leg, 0, -.92, .04);
    if (s < 0) ch.legL = leg; else ch.legR = leg;
  }
  // torse
  ch.torso = rbox(1.02, 1.04, .54, .06, shirt, g, 0, 1.5, 0);
  if (o.apron) { const a = box(.86, 1.25, .04, mat(o.apron), g, 0, 1.3, .29); box(.4, .22, .02, mat(o.apronPocket || '#ffffff'), a, 0, -.25, .03); box(1.03, .07, .56, mat(o.apron), g, 0, 1.62, 0); }
  if (o.scarf) { rbox(1.1, .22, .66, .08, mat(o.scarf), g, 0, 1.98, 0); box(.24, .5, .08, mat(o.scarf), g, .25, 1.7, .32); }
  if (o.coat) { const cm = mat(o.coat); rbox(1.1, 1.1, .62, .06, cm, g, 0, 1.48, 0); box(1.04, .55, .58, cm, g, 0, .78, 0); box(.06, 1.5, .02, mat('#222'), g, 0, 1.2, .32); o.sleeve = o.sleeve || o.coat; }
  if (o.vest) { box(1.05, 1.0, .1, mat(o.vest), g, 0, 1.5, .24); }
  // bras
  for (const s of [-1, 1]) {
    const arm = new THREE.Group(); arm.position.set(.76 * s, 1.95, 0); g.add(arm);
    rbox(.46, .78, .5, .06, o.sleeve ? mat(o.sleeve) : shirt, arm, 0, -.36, 0);
    rbox(.42, .22, .46, .06, skin, arm, 0, -.86, 0);
    if (s < 0) ch.armL = arm; else ch.armR = arm;
  }
  // tête
  const head = new THREE.Group(); head.position.set(0, 2.02, 0); g.add(head); ch.head = head;
  rbox(1.0, .92, .92, .22, skin, head, 0, .48, 0);
  const faceMat = new THREE.MeshStandardMaterial({ map: faceTex(ch.faceOpts, 'neutral'), transparent: true, roughness: .6, polygonOffset: true, polygonOffsetFactor: -2 });
  const face = new THREE.Mesh(new THREE.PlaneGeometry(.94, .94), faceMat); face.position.set(0, .45, .462); head.add(face);
  ch.setFace = (e) => { faceMat.map = faceTex(ch.faceOpts, e); };
  // cheveux / chapeaux
  const hm = mat(o.hairColor || '#5a3420', { roughness: .9 });
  const hair = o.hair || 'none';
  if (['messy', 'bun', 'short', 'toque'].includes(hair)) {
    rbox(1.06, .3, 1.0, .12, hm, head, 0, .88, -.01);
    box(1.06, .62, .3, hm, head, 0, .62, -.36);
  }
  if (hair === 'messy' || hair === 'toque') {
    const sg = new THREE.SphereGeometry(.13, 10, 8);
    for (let i = 0; i < 7; i++) mesh(sg, hm, head, -.42 + i * .14, .76 + (i % 2) * .03, .4);
    for (let i = 0; i < 6; i++) mesh(sg, hm, head, -.36 + i * .145, 1.02, .1 + (i % 2) * .12);
  }
  if (hair === 'bald') {
    for (const s of [-1, 1]) rbox(.12, .4, .7, .05, hm, head, .5 * s, .55, -.08);
    box(1.04, .4, .2, hm, head, 0, .5, -.4);
  }
  if (hair === 'long' || hair === 'ponytail') {
    rbox(1.06, .3, 1.0, .12, hm, head, 0, .88, -.01);
    box(1.06, hair === 'long' ? 1.1 : .62, .3, hm, head, 0, hair === 'long' ? .38 : .62, -.36);
    if (hair === 'long') for (const s of [-1, 1]) box(.14, .9, .5, hm, head, .5 * s, .45, -.12);
    else mesh(new THREE.SphereGeometry(.2, 12, 10), hm, head, 0, .7, -.6);
    for (let i = 0; i < 5; i++) mesh(new THREE.SphereGeometry(.12, 10, 8), hm, head, -.34 + i * .17, .8, .42);
  }
  if (hair === 'bun') {
    mesh(new THREE.SphereGeometry(.26, 16, 12), hm, head, 0, 1.08, -.22);
    for (let i = 0; i < 5; i++) mesh(new THREE.SphereGeometry(.12, 10, 8), hm, head, -.36 + i * .18, .8, .42);
  }
  if (hair === 'toque') {
    const tw = mat('#fafafa', { roughness: .7 });
    mesh(new THREE.CylinderGeometry(.48, .46, .5, 24), tw, head, 0, 1.18, 0);
    const puff = new THREE.SphereGeometry(.3, 14, 10);
    for (const [x, z] of [[-.25, 0], [.25, 0], [0, .22], [0, -.22], [0, 0]]) mesh(puff, tw, head, x, 1.5, z);
  }
  if (hair === 'beanie') {
    const bm = mat(o.hairColor);
    const b = mesh(new THREE.SphereGeometry(.56, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), bm, head, 0, .78, 0); b.scale.set(1, .8, .95);
    mesh(new THREE.CylinderGeometry(.56, .56, .16, 24), mat('#f4e4ec'), head, 0, .8, 0);
    mesh(new THREE.SphereGeometry(.15, 12, 10), mat('#ffffff'), head, 0, 1.25, 0);
  }
  if (hair === 'cap') {
    rbox(1.06, .3, 1.0, .12, mat(o.hairColor), head, 0, .9, 0);
    box(.9, .05, .45, mat(o.hairColor), head, 0, .78, .62);
  }
  g.traverse(m => { if (m.isMesh) m.castShadow = true; });
  ch.reset = () => {
    for (const k of ['armL', 'armR', 'legL', 'legR', 'head']) ch[k].rotation.set(0, 0, 0);
    ch.g.rotation.set(0, 0, 0); ch.setFace('neutral'); ch.g.visible = true;
  };
  ch.walk = (t, speed = 7, amp = .55) => {
    const s = Math.sin(t * speed) * amp;
    ch.legL.rotation.x = s; ch.legR.rotation.x = -s; ch.armL.rotation.x = -s * .8; ch.armR.rotation.x = s * .8;
  };
  ch.idle = (t, k = 1) => { ch.head.rotation.z = Math.sin(t * 1.3) * .03 * k; ch.torso.position.y = 1.5 + Math.sin(t * 2) * .01 * k; };
  return ch;
}

// ---------- Chien en blocs ----------
const dogFaceCache = new Map();
function dogFace(expr, col) {
  const k = expr + col; if (dogFaceCache.has(k)) return dogFaceCache.get(k);
  const t = canvasTex(256, 256, (g) => {
    g.lineCap = 'round';
    const sad = expr === 'sad', happy = expr === 'happy';
    for (const x of [78, 178]) {
      if (happy) { g.strokeStyle = '#141010'; g.lineWidth = 9; g.beginPath(); g.moveTo(x - 18, 92); g.quadraticCurveTo(x, 70, x + 18, 92); g.stroke(); }
      else { g.fillStyle = '#141010'; g.beginPath(); g.ellipse(x, 88, 20, 24, 0, 0, 7); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(x - 7, 78, 8, 0, 7); g.fill(); g.beginPath(); g.arc(x + 6, 96, 4, 0, 7); g.fill(); }
      g.strokeStyle = '#3a2416'; g.lineWidth = 9; g.beginPath();
      const s = x < 128 ? 1 : -1;
      if (sad) { g.moveTo(x - 20 * s, 54); g.lineTo(x + 16 * s, 42); } else { g.moveTo(x - 18, 50); g.lineTo(x + 18, 50); }
      g.stroke();
    }
  });
  dogFaceCache.set(k, t); return t;
}
export function makeDog(o = {}) {
  const g = new THREE.Group(), fur = mat(o.color || '#c99a62', { roughness: .9 }), light = mat(o.light || '#efdcb8', { roughness: .9 }), dark = mat(o.dark || '#7a5232');
  const d = { g };
  rbox(.8, .7, 1.4, .15, fur, g, 0, .85, 0);
  d.legs = [];
  for (const [x, z] of [[-.25, .45], [.25, .45], [-.25, -.45], [.25, -.45]]) { const l = new THREE.Group(); l.position.set(x, .6, z); g.add(l); rbox(.26, .62, .26, .06, fur, l, 0, -.3, 0); rbox(.28, .14, .32, .05, light, l, 0, -.56, .03); d.legs.push(l); }
  const tail = new THREE.Group(); tail.position.set(0, 1.05, -.68); g.add(tail); rbox(.14, .14, .5, .05, fur, tail, 0, .12, -.2).rotation.x = .7; d.tail = tail;
  const head = new THREE.Group(); head.position.set(0, 1.2, .62); g.add(head); d.head = head;
  rbox(.9, .8, .75, .2, fur, head, 0, .2, .05);
  rbox(.5, .32, .34, .1, light, head, 0, .02, .5);
  mesh(new THREE.SphereGeometry(.12, 12, 10), mat('#1a1414', { roughness: .3 }), head, 0, .14, .68);
  for (const s of [-1, 1]) { const ear = rbox(.2, .55, .3, .08, dark, head, .5 * s, .25, 0); ear.rotation.z = .25 * s; d['ear' + (s < 0 ? 'L' : 'R')] = ear; }
  const fm = new THREE.MeshStandardMaterial({ map: dogFace('neutral', ''), transparent: true, polygonOffset: true, polygonOffsetFactor: -2 });
  const face = new THREE.Mesh(new THREE.PlaneGeometry(.86, .86), fm); face.position.set(0, .3, .43); head.add(face);
  if (o.collar) rbox(.84, .14, .6, .05, mat(o.collar), g, 0, 1.15, .45);
  d.setFace = (e) => { fm.map = dogFace(e, ''); };
  d.reset = () => { d.g.rotation.set(0, 0, 0); d.head.rotation.set(0, 0, 0); d.tail.rotation.set(0, 0, 0); d.legs.forEach(l => l.rotation.set(0, 0, 0)); d.setFace('neutral'); d.g.visible = true; };
  d.wag = (t, k = 1) => { d.tail.rotation.y = Math.sin(t * 14) * .6 * k; };
  d.walk = (t, sp = 8) => d.legs.forEach((l, i) => l.rotation.x = Math.sin(t * sp + (i % 2 ? 0 : Math.PI) + (i > 1 ? Math.PI : 0)) * .45);
  g.traverse(m => { if (m.isMesh) m.castShadow = true; });
  return d;
}
