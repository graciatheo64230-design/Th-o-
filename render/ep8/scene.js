// Épisode 8 : « Le dessin sur le frigo »
import * as THREE from 'three';
import { W, H, clamp, ease, lerp, lerpV, v3, mat, mesh, box, rbox, roundRect, makeChar, canvasTex } from '../lib.js';
import { createWorld, tex, card, font, room, table, chair, sparkTexture } from '../world.js';

function starPath(g, cx, cy, r, k = 1) {
  const pts = []; for (let i = 0; i <= 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .45 : r; pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); }
  const n = Math.max(1, Math.floor(k * 10)); g.beginPath(); g.moveTo(...pts[0]); for (let i = 1; i <= n; i++) g.lineTo(...pts[i]);
  if (k < 1) { const f = k * 10 - n, a = pts[n], b = pts[Math.min(10, n + 1)]; g.lineTo(a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f); }
}
// dessin d'enfant : o = { people: 3|2, k: progression du tracé, star: progression de l'étoile, dad: trait plus fin }
function drawing(g, W2, H2, o) {
  g.fillStyle = '#fdfcf7'; g.fillRect(0, 0, W2, H2);
  const k = o.k ?? 1, step = (a, b) => clamp((k - a) / (b - a));
  g.lineCap = 'round'; g.lineJoin = 'round'; g.lineWidth = o.dad ? 7 : 10;
  // herbe
  if (step(0, .1) > 0) { g.strokeStyle = '#3caa3c'; g.beginPath(); g.moveTo(20, H2 - 70); g.lineTo(20 + (W2 - 40) * step(0, .1), H2 - 70); g.stroke(); }
  // maison
  const hx = W2 * .52, hy = H2 - 70, hw = 230, hh = 190;
  if (step(.1, .35) > 0) {
    const q = step(.1, .35); g.strokeStyle = '#d9472b'; g.beginPath(); g.moveTo(hx, hy); g.lineTo(hx, hy - hh * Math.min(1, q * 3)); if (q > .33) g.lineTo(hx + hw * Math.min(1, (q - .33) * 3), hy - hh); if (q > .66) g.lineTo(hx + hw, hy - hh + hh * Math.min(1, (q - .66) * 3)); g.stroke();
    if (q > .9) { g.strokeStyle = '#8a3a2a'; g.beginPath(); g.moveTo(hx - 20, hy - hh); g.lineTo(hx + hw / 2, hy - hh - 110); g.lineTo(hx + hw + 20, hy - hh); g.stroke(); g.strokeStyle = '#6a4a2a'; g.strokeRect(hx + hw / 2 - 30, hy - 100, 60, 100); g.strokeStyle = '#2e86de'; g.strokeRect(hx + 30, hy - hh + 40, 55, 50); }
  }
  // soleil
  if (step(.35, .5) > 0) { const q = step(.35, .5); g.strokeStyle = '#f0b400'; g.beginPath(); g.arc(120, 120, 55, 0, Math.PI * 2 * q); g.stroke(); if (q >= 1) for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; g.beginPath(); g.moveTo(120 + Math.cos(a) * 75, 120 + Math.sin(a) * 75); g.lineTo(120 + Math.cos(a) * 105, 120 + Math.sin(a) * 105); g.stroke(); } }
  // personnages
  const ppl = o.people === 3 ? [['#2e5fa8', 'papa', 1], ['#e84f8a', 'maman', .95], ['#f39c12', 'moi', .7]] : [['#2e5fa8', 'papa', 1], ['#f39c12', 'Léa', .7]];
  ppl.forEach(([c, name, s], i) => {
    const q = step(.5 + i * .15, .65 + i * .15); if (q <= 0) return;
    const x = 90 + i * 110, base = H2 - 75, hgt = 200 * s;
    g.strokeStyle = c; g.beginPath(); g.arc(x, base - hgt, 26 * s, 0, Math.PI * 2 * Math.min(1, q * 2)); g.stroke();
    if (q > .5) { g.beginPath(); g.moveTo(x, base - hgt + 26 * s); g.lineTo(x, base - 50 * s); g.moveTo(x - 40 * s, base - hgt + 70 * s); g.lineTo(x + 40 * s, base - hgt + 70 * s); g.moveTo(x, base - 50 * s); g.lineTo(x - 26 * s, base); g.moveTo(x, base - 50 * s); g.lineTo(x + 26 * s, base); g.stroke(); }
    if (q >= 1) { g.fillStyle = c; font(g, 700, 34, 'Caveat'); g.textAlign = 'center'; g.fillText(name, x, base - hgt - 40 * s); }
  });
  // l'étoile
  if (o.star != null && o.star > 0) {
    starPath(g, W2 - 150, 130, 95, o.star); g.lineWidth = 11; g.strokeStyle = '#e0a800'; g.stroke();
    if (o.star >= 1) { g.fillStyle = 'rgba(255,215,50,.55)'; g.fill(); g.strokeStyle = 'rgba(240,180,0,.6)'; g.lineWidth = 5; for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; g.beginPath(); g.moveTo(W2 - 150 + Math.cos(a) * 115, 130 + Math.sin(a) * 115); g.lineTo(W2 - 150 + Math.cos(a) * 140, 130 + Math.sin(a) * 140); g.stroke(); } g.fillStyle = '#b07a00'; font(g, 700, 34, 'Caveat'); g.textAlign = 'center'; g.fillText('maman', W2 - 150, 265); }
  }
}

export function create(renderer, ui) {
  const w = createWorld(renderer), S = w.scene;

  // ---------- MAISON DE LÉA (x=0) ----------
  const rm = room(S, { x: 0, w: 10, d: 8, wall: tex.stripes('#f4e6d6', '#ecd5bf'), window: { x: -2.2, y: 2.5, w: 2.4, h: 1.8 }, lights: [[-1, -3.5], [2.5, -5]], lightI: 12 });
  const rug = mesh(new THREE.CircleGeometry(2.2, 32), mat('#c0566a', { roughness: 1 }), rm, -1.2, .02, -3.6); rug.rotation.x = -Math.PI / 2;
  table(rm, -1.2, -3.6, { w: 2.0, d: 1.2, h: .6, color: '#b98a5a' });
  const sheet = card(rm, 1.0, .72, 700, drawing, -1.2, .67, -3.55, { depth: .005 }); sheet.mesh.rotation.x = -Math.PI / 2;
  for (const [x, c] of [[-.55, '#e84f8a'], [-.45, '#2e86de'], [-.35, '#f0b400']]) { const cr = box(.04, .04, .35, mat(c), rm, x, .68, -3.2); cr.rotation.y = .3; }
  // frigo
  const fr = new THREE.Group(); fr.position.set(3.4, 0, -6.9); rm.add(fr);
  rbox(1.5, 3.3, 1.1, .08, mat('#f4f6f8', { roughness: .3 }), fr, 0, 1.65, 0);
  box(1.5, .03, 1.12, mat('#c9ced4'), fr, 0, 2.2, 0); box(.06, .6, .1, mat('#9aa3ab', { metalness: .6 }), fr, .6, 2.7, .58); box(.06, 1.0, .1, mat('#9aa3ab', { metalness: .6 }), fr, .6, 1.4, .58);
  const onFridge = card(fr, .9, .65, 700, drawing, -.12, 2.55, .57, { depth: .005 });
  for (const [x, y, c] of [[-.5, 2.85, '#e74c3c'], [.28, 2.85, '#2ecc71'], [-.5, 1.6, '#f1c40f'], [.2, 1.8, '#3498db']]) mesh(new THREE.SphereGeometry(.05, 10, 8), mat(c), fr, x, y, .6);
  const oldDrawings = [card(fr, .6, .45, 400, drawing, -.25, 1.75, .565, { depth: .004 }), card(fr, .55, .4, 400, drawing, .2, 1.3, .565, { depth: .004 })];
  oldDrawings[0].set({ people: 3 }); oldDrawings[1].set({ people: 3 }); oldDrawings[1].mesh.rotation.z = .1;
  // grosse étoile dans la fenêtre
  const bigStar = new THREE.Sprite(new THREE.SpriteMaterial({ map: sparkTexture(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
  bigStar.scale.setScalar(1.2); bigStar.position.set(-1.9, 3.0, -10.2); rm.add(bigStar);
  // ---------- MAISON DE LÉA ADULTE (x=40) ----------
  const rm2 = room(S, { x: 40, w: 10, d: 8, wall: tex.stripes('#e3eef0', '#d3e3e6'), window: { x: -2.2, y: 2.5, w: 2.4, h: 1.8 }, lights: [[0, -4]], lightI: 14 });
  const fr2 = new THREE.Group(); fr2.position.set(1.0, 0, -6.9); rm2.add(fr2);
  rbox(1.5, 3.3, 1.1, .08, mat('#2f3a44', { roughness: .3, metalness: .3 }), fr2, 0, 1.65, 0);
  const onFridge2 = card(fr2, .9, .65, 700, drawing, -.1, 2.4, .57, { depth: .005 });
  box(3.6, 1.3, .9, mat('#f4f1ea'), rm2, -2.6, .65, -7.3); box(3.6, .1, 1, mat('#7a4a2a'), rm2, -2.6, 1.35, -7.3);

  // ---------- PERSONNAGES ----------
  const lea = w.add(makeChar({ skin: '#f3cba6', shirt: '#f39c12', pants: '#3d3a6b', hair: 'long', hairColor: '#3a2414', face: { blush: true, brow: '#3a2414' } })); lea.g.scale.setScalar(.6);
  const dad = w.add(makeChar({ skin: '#f3cba6', shirt: '#2e5fa8', pants: '#3b3f4f', hair: 'short', hairColor: '#3a2414', face: { brow: '#2a1a10' } }));
  const leaA = w.add(makeChar({ skin: '#f3cba6', shirt: '#f39c12', pants: '#3d3a6b', hair: 'long', hairColor: '#3a2414', face: { blush: true, brow: '#3a2414' } }));

  w.onMood((m) => { rm.userData.setView(m); rm2.userData.setView(m); bigStar.visible = m === 'night'; });
  const P = (c, x, z, ry, y) => w.place(c, x, z, ry, y);
  const floorSit = (c, x, z, ry) => { P(c, x, z, ry, -.55 * c.g.scale.y); c.legL.rotation.x = c.legR.rotation.x = -1.5; };
  const leaDraw = (t, face) => { floorSit(lea, -1.2, -2.55, Math.PI); lea.setFace(face); lea.armR.rotation.x = -1.2 + Math.sin(t * 8) * .1; lea.armR.rotation.z = Math.sin(t * 5) * .15; lea.head.rotation.x = .35; };
  const resetProps = () => { sheet.set({ people: 3 }); onFridge.set({ people: 3 }); onFridge.mesh.visible = true; onFridge2.set({ people: 2, star: 1, dad: true }); rm.userData.setLights(1); };
  const SH = v3(-1.2, .67, -3.55), FR = v3(3.28, 2.55, -6.3);

  const shots = {
    lea_draw(u, d, p, t) { w.mood('sunset'); leaDraw(t, 'smile'); sheet.set({ people: 3, k: lerp(.3, 1, p) }); w.shoot(w.head(lea, -.3), lerp(2.6, 2.1, ease(p)), Math.PI - .5, .15); },
    drawing3(u, d, p, t) { w.mood('sunset'); sheet.set({ people: 3 }); w.shoot(SH, lerp(1.35, 1.15, ease(p)), 0, 1.4); },
    fridge_stick(u, d, p, t) {
      w.mood('sunset'); onFridge.mesh.visible = p > .4; onFridge.set({ people: 3 });
      P(dad, 3.0, -5.4, p > .55 ? .5 : Math.PI - .2); dad.setFace(p > .4 ? 'smileClosed' : 'smile'); dad.armR.rotation.x = p > .55 ? -.3 : -lerp(.3, 1.9, ease(clamp(p * 2.2)));
      floorSit(lea, 1.6, -4.4, Math.PI * .75); lea.setFace('laugh');
      w.shoot(v3(2.6, 2.0, -5.6), lerp(4.6, 4.0, p), .5, .12);
    },
    drawing2(u, d, p, t) { w.mood('rain'); rm.userData.setLights(.5); onFridge.set({ people: 2 }); w.shoot(FR, lerp(1.6, 1.25, ease(p)), 0, 0); },
    lea_cry(u, d, p, t) {
      w.mood('night'); rm.userData.setLights(.6); leaDraw(t, 'cry'); lea.armR.rotation.x = -1.0; sheet.set({ people: 2, k: .45 });
      P(dad, 2.2, -6.0, -.6); dad.setFace('sad');
      w.shoot(v3(-.3, 1.4, -2.6), lerp(5.2, 4.4, p), .9, .2);
    },
    lea_says(u, d, p, t) { w.mood('night'); rm.userData.setLights(.6); leaDraw(t, 'cry'); lea.head.rotation.x = 0; lea.head.rotation.y = .3; w.shoot(w.head(lea, -.35), lerp(1.8, 1.5, ease(p)), Math.PI + .1, 0); },
    dad_sit(u, d, p, t) {
      w.mood('night'); rm.userData.setLights(.7); leaDraw(t, 'sad'); lea.armR.rotation.x = -.6;
      if (p < .5) { P(dad, lerp(1.2, .2, p * 2), -2.4, -Math.PI / 2 - .3); dad.walk(t, 5, .3); dad.setFace('sad'); }
      else { floorSit(dad, -.1, -2.45, Math.PI - .5); dad.setFace('neutral'); dad.armR.rotation.x = -lerp(0, 1.2, (p - .5) * 2); }
      w.shoot(v3(-.6, 1.2, -2.6), 4.4, Math.PI - .4, .2);
    },
    dad_draw(u, d, p, t) {
      w.mood('night'); rm.userData.setLights(.8); floorSit(lea, -1.6, -2.6, Math.PI + .3); lea.setFace('wonder');
      floorSit(dad, -.6, -2.55, Math.PI - .2); dad.setFace('smile'); dad.armR.rotation.x = -1.3 + Math.sin(t * 9) * .08; dad.armR.rotation.z = Math.sin(t * 4) * .15; dad.head.rotation.x = .3;
      sheet.set({ people: 2, k: clamp(p * .3), dad: true });
      w.shoot(v3(-1.0, 1.3, -3.0), 3.2, Math.PI - .2, .5);
    },
    drawing_dad(u, d, p, t) { w.mood('night'); rm.userData.setLights(.8); sheet.set({ people: 2, k: lerp(.3, 1, p), dad: true }); w.shoot(SH, 1.2, 0, 1.4); },
    star_draw(u, d, p, t) { w.mood('night'); rm.userData.setLights(.8); sheet.set({ people: 2, dad: true, star: clamp(p * 1.3) }); w.shoot(v3(-.95, .67, -3.75), lerp(1.0, .85, ease(p)), 0, 1.35); },
    dad_hug(u, d, p, t) {
      w.mood('night'); rm.userData.setLights(.5);
      floorSit(dad, -1.8, -4.8, Math.PI); floorSit(lea, -1.2, -4.9, Math.PI); dad.armL.rotation.x = -1.2; dad.armL.rotation.z = -.8; lea.head.rotation.z = .15; dad.head.rotation.z = -.1;
      dad.setFace('smileClosed'); lea.setFace('smileClosed'); dad.head.rotation.x = -.25; lea.head.rotation.x = -.25;
      w.shoot(v3(-1.6, 2.2, -6.6), lerp(5.6, 5.0, ease(p)), lerp(.55, .4, p), .18);
    },
    fridge_final(u, d, p, t) { w.mood('day'); onFridge.set({ people: 2, star: 1, dad: true }); w.shoot(FR, lerp(4.5, 1.5, ease(p)), lerp(.4, 0, p), lerp(.2, 0, p)); },
    adult_lea(u, d, p, t) {
      w.mood('day'); onFridge2.set({ people: 2, star: 1, dad: true }); onFridge2.mesh.visible = p > .45;
      P(leaA, 40.4, -5.4, p > .55 ? .4 : Math.PI - .3); leaA.setFace(p > .45 ? 'smileClosed' : 'smile'); leaA.armR.rotation.x = p > .55 ? -.3 : -lerp(.3, 1.9, ease(clamp(p * 2.2))); leaA.idle(t);
      if (p < .7) w.shoot(v3(40.6, 2.2, -5.8), lerp(4.6, 3.8, p), .55, .1);
      else w.shoot(v3(40.9, 2.4, -6.33), lerp(1.4, 1.2, (p - .7) / .3), 0, 0);
    },
  };

  function render(name, u, d, p, t) { w.resetChars(); resetProps(); w.weather(null); (shots[name] || shots.lea_draw)(u, d, p, t); w.render(); }
  function overlay(name, u, d, t) {
    if (name === 'fridge_stick') ui.badge('« LE PLUS BEAU DE TOUS »', u - .8, { size: 34, bg: '#3b1426', border: '#ff9cc4', color: '#ffc2dc', y: H * .12 });
    if (name === 'adult_lea') ui.badge('20 ANS PLUS TARD', u - .2, { size: 42, bg: '#141a33', border: '#ffd36b', color: '#ffd36b', y: H * .12 });
  }
  return { render, overlay };
}
