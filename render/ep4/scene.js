// Épisode 4 : « L'étoile de Théo »
import * as THREE from 'three';
import { W, H, clamp, ease, lerp, lerpV, v3, mat, mesh, box, rbox, roundRect, makeChar } from '../lib.js';
import { createWorld, tex, card, font, room, table, chair, tree, house, lampPost, cardStage, groundPlane, sunDisc } from '../world.js';

function starPath(g, cx, cy, r, k = 1) {
  const pts = []; for (let i = 0; i <= 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .45 : r; pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); }
  const n = Math.max(1, Math.floor(k * 10)); g.beginPath(); g.moveTo(...pts[0]);
  for (let i = 1; i <= n; i++) g.lineTo(...pts[i]);
  if (k < 1) { const f = k * 10 - n, a = pts[n], b = pts[Math.min(10, n + 1)]; g.lineTo(a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f); }
}
function drawCopy(g, W2, H2, o) {
  g.fillStyle = '#fbfaf6'; g.fillRect(0, 0, W2, H2);
  g.strokeStyle = 'rgba(90,140,210,.35)'; g.lineWidth = 3; for (let y = 230; y < H2 - 40; y += 56) { g.beginPath(); g.moveTo(30, y); g.lineTo(W2 - 30, y); g.stroke(); }
  g.strokeStyle = 'rgba(220,80,80,.5)'; g.beginPath(); g.moveTo(90, 0); g.lineTo(90, H2); g.stroke();
  g.fillStyle = '#2b2b4a'; font(g, 700, 46, 'Caveat'); g.fillText(o.name || 'Théo', 110, 70); g.fillText('Contrôle de maths', 110, 130);
  g.fillStyle = 'rgba(40,40,70,.55)'; for (let i = 0; i < 9; i++) g.fillRect(110, 248 + i * 56, 200 + ((i * 97) % 220), 8);
  if (o.grade) { g.save(); g.translate(W2 - 140, 110); g.rotate(-.12); g.strokeStyle = '#d0302a'; g.lineWidth = 7; g.beginPath(); g.ellipse(0, 0, 110, 62, 0, 0, 7); g.stroke(); g.fillStyle = '#d0302a'; font(g, 700, 76, 'Caveat'); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(o.grade, 0, 4); g.restore(); }
  if (o.star != null) { starPath(g, o.grade ? W2 - 330 : W2 - 140, 115, o.grade ? 50 : 75, o.star); g.lineWidth = 9; g.strokeStyle = '#e0a800'; g.lineJoin = 'round'; g.stroke(); if (o.star >= 1) { g.fillStyle = 'rgba(255,210,40,.5)'; g.fill(); } }
}

export function create(renderer, ui) {
  const w = createWorld(renderer), S = w.scene;

  // ---------- CLASSE (x=0) ----------
  const cls = room(S, { x: 0, w: 12, d: 10, h: 4.6, wall: tex.stripes('#f6ecd0', '#efe0b8', [6, 2]), window: { x: 3.4, y: 2.6, w: 2.8, h: 2.0 }, lights: [[-2, -4], [2, -6]], lightI: 12 });
  const board = card(cls, 4.6, 2.2, 900, (g, W2, H2, txt) => { g.fillStyle = '#7a4a2a'; g.fillRect(0, 0, W2, H2); g.fillStyle = '#244d3a'; g.fillRect(16, 16, W2 - 32, H2 - 32); g.fillStyle = 'rgba(255,255,255,.88)'; font(g, 700, 78, 'Caveat'); g.textAlign = 'center'; g.textBaseline = 'middle'; txt.split('|').forEach((l, i, a) => g.fillText(l, W2 / 2, H2 / 2 + (i - (a.length - 1) / 2) * 90)); }, -2.0, 2.5, -9.85, { depth: .05 });
  const desks = [];
  for (const [x, z] of [[-3, -5.2], [0, -5.2], [3, -5.2], [-3, -2.6], [0, -2.6], [3, -2.6]]) { table(cls, x, z, { w: 1.6, d: 1.0, h: 1.1, color: '#c98f55' }); chair(cls, x, z + .9, Math.PI, '#3d7ac4'); desks.push([x, z]); }
  table(cls, -2.0, -8.2, { w: 2.4, d: 1.2, h: 1.25, color: '#8a5432' });
  const paperM = new THREE.MeshStandardMaterial({ color: '#fbfaf6', roughness: .9 });
  const stack = box(.6, .12, .8, paperM, null);
  const handPaper = box(.5, .02, .7, paperM, null);
  box(12, 4.6, .2, new THREE.MeshStandardMaterial({ map: tex.stripes('#f6ecd0', '#efe0b8', [6, 2]), roughness: .9 }), cls, 0, 2.3, 0.1);
  const clsDoor = box(1.4, 2.8, .1, mat('#8a5432'), cls, 5.9, 1.4, -2.0); clsDoor.rotation.y = Math.PI / 2;

  // ---------- RUE (x=100) ----------
  const st = new THREE.Group(); st.position.set(100, 0, 0); S.add(st);
  groundPlane(st, '#9fbf7a');
  const sw = mesh(new THREE.PlaneGeometry(120, 3), mat('#cfc6b8'), st, 0, .02, 0); sw.rotation.x = -Math.PI / 2;
  const rd = mesh(new THREE.PlaneGeometry(120, 6), mat('#4a4e56'), st, 0, .015, 4.5); rd.rotation.x = -Math.PI / 2;
  for (let i = 0; i < 6; i++) house(st, -20 + i * 8, -3, { w: 6, h: 4 + (i % 3), color: ['#e9d8bf', '#d9e4ee', '#f2d0c0', '#dfe9d0'][i % 4], roof: ['#8a3a2a', '#3d5a80', '#7a3a2a'][i % 3], lit: i % 2 === 0 });
  for (let i = 0; i < 6; i++) tree(st, -18 + i * 8, 1.6, { kind: 'round', s: .8 });
  const sun = sunDisc(st, 20, 5, -70, '#ffd08a', 4);

  // ---------- TABLE DES OBJETS (x=200) ----------
  const stage = cardStage(S, 200, { table: tex.wood(['#b98a5a', '#a87a4c', '#c09060', '#a27448']) });
  const flat = (c) => { c.mesh.rotation.x = -Math.PI / 2; return c; };
  const copyA = flat(card(stage, 2.1, 2.97, 600, drawCopy, -2.4, .12, 8.4)); copyA.set({ name: 'Léa', grade: '14/20' }); copyA.mesh.rotation.z = .15;
  const copyB = flat(card(stage, 2.1, 2.97, 600, drawCopy, 0, .13, 8.0)); copyB.set({ name: 'Hugo', grade: '16/20' }); copyB.mesh.rotation.z = -.08;
  const copyT = flat(card(stage, 2.1, 2.97, 600, drawCopy, 2.4, .14, 8.3)); copyT.mesh.rotation.z = .06;
  // boîte en carton
  const boxG = new THREE.Group(); boxG.position.set(200, 0, 14); S.add(boxG);
  const kraft = mat('#c49a62', { roughness: .95 });
  box(3, .1, 2.2, kraft, boxG, 0, .15, 0); box(3, 1.4, .1, kraft, boxG, 0, .8, 1.05); box(3, 1.4, .1, kraft, boxG, 0, .8, -1.05); box(.1, 1.4, 2.2, kraft, boxG, -1.45, .8, 0); box(.1, 1.4, 2.2, kraft, boxG, 1.45, .8, 0);
  const lid1 = box(3, .06, 1.1, kraft, boxG, 0, 1.5, .55), lid2 = box(3, .06, 1.1, kraft, boxG, 0, 1.5, -.55);
  const label = card(boxG, 1.6, .7, 500, (g, W2, H2) => { g.fillStyle = '#fffdf6'; g.fillRect(0, 0, W2, H2); g.fillStyle = '#2b2350'; font(g, 700, 110, 'Caveat'); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('Pour Théo', W2 / 2, H2 / 2 + 6); starPath(g, W2 - 60, 50, 30, 1); g.fillStyle = '#e0a800'; g.fill(); }, 0, .85, 1.11, { depth: .01 }); label.set();
  const inside = [];
  for (let i = 0; i < 6; i++) { const c = flat(card(boxG, 2.1, 1.6, 400, drawCopy, (i % 3 - 1) * .08, .25 + i * .05, (i % 2) * .06)); c.set({ grade: ['17/20', '18/20', '19/20', '18/20', '19/20', '17/20'][i], star: 1 }); c.mesh.rotation.z = (i - 3) * .05; inside.push(c); }
  // trois copies pour 17 / 18 / 19
  const reveal = [17, 18, 19].map((n, i) => { const c = card(S, 2.1, 2.97, 600, drawCopy, 196.2 + i * 2.6, 3.0, .0); c.set({ grade: n + '/20', star: 1 }); return c; });
  // le mot de Madame Lune
  const NOTE = ['Théo,', '', 'Tu étais le meilleur.', 'Mais si les autres', "l'avaient su, ils t'auraient", 'fait encore plus de mal.', '', "L'étoile, ça voulait dire :", 'je te vois.', '', '         Madame Lune'];
  const note = card(S, 3.2, 4.3, 800, (g, W2, H2, k) => {
    g.fillStyle = '#f7efdd'; g.fillRect(0, 0, W2, H2);
    g.strokeStyle = 'rgba(120,150,200,.35)'; g.lineWidth = 2; for (let y = 150; y < H2; y += 88) { g.beginPath(); g.moveTo(40, y); g.lineTo(W2 - 40, y); g.stroke(); }
    g.fillStyle = '#2b2350'; font(g, 700, 70, 'Caveat');
    let chars = Math.floor(k * NOTE.join('').length);
    NOTE.forEach((l, i) => { g.fillText(l.slice(0, Math.max(0, chars)), 60, 140 + i * 88); chars -= l.length; });
    if (k >= .99) { starPath(g, W2 - 120, H2 - 170, 60, 1); g.lineWidth = 8; g.strokeStyle = '#e0a800'; g.stroke(); g.fillStyle = 'rgba(255,210,40,.5)'; g.fill(); }
  }, 204.5, 3.2, 0);

  // ---------- PERSONNAGES ----------
  const lune = w.add(makeChar({ skin: '#f3cba6', shirt: '#5a7bd0', sleeve: '#5a7bd0', pants: '#3a3a4a', hair: 'bun', hairColor: '#5a3a22', face: { glasses: true, blush: true, brow: '#4a2a18' } }));
  const kidStyle = (shirt, hair, hc) => ({ skin: '#f0c49a', shirt, pants: '#2c3e50', hair, hairColor: hc, face: { blush: true } });
  const theo = w.add(makeChar({ skin: '#e9b48a', shirt: '#8a96a3', pants: '#3b3f4f', hair: 'messy', hairColor: '#2a1a10', face: { blush: true, brow: '#2a1a10' } })); theo.g.scale.setScalar(.64);
  const kidA = w.add(makeChar(kidStyle('#27ae60', 'short', '#c97a2a'))); kidA.g.scale.setScalar(.64);
  const kidB = w.add(makeChar({ ...kidStyle('#f1c40f', 'ponytail', '#1e1e1e'), skin: '#9a6a46' })); kidB.g.scale.setScalar(.64);
  const kidC = w.add(makeChar(kidStyle('#e67e22', 'long', '#7a3e1e'))); kidC.g.scale.setScalar(.64);
  const adult = w.add(makeChar({ skin: '#e9b48a', shirt: '#ffffff', vest: '#8a96a3', pants: '#3b3f4f', hair: 'messy', hairColor: '#2a1a10', face: { brow: '#2a1a10' } }));
  const lonely = w.add(makeChar(kidStyle('#9b59b6', 'short', '#5a3420'))); lonely.g.scale.setScalar(.6);

  w.onMood((m) => { cls.userData.setView(m); sun.visible = m === 'sunset'; });
  const P = (c, x, z, ry, y) => w.place(c, x, z, ry, y);
  const sit = (c, x, z) => { P(c, x, z + .85, Math.PI, .25); c.legL.rotation.x = c.legR.rotation.x = -1.5; };
  const C = (x, y, z) => v3(x, y, z), T = (x, y, z) => v3(200 + x, y, z);
  const resetProps = () => { board.set('Contrôle de maths|Lundi 12 mai'); handPaper.removeFromParent(); copyT.set({ star: 1 }); note.set(1); lid1.rotation.x = 0; lid2.rotation.x = 0; lid1.position.y = lid2.position.y = 1.5; reveal.forEach(r => r.mesh.visible = true); };
  const students = () => { sit(kidA, -3, -5.2); sit(kidB, 3, -5.2); sit(kidC, 0, -2.6); sit(theo, 3, -2.6); };

  const shots = {
    title(u, d, p, t) {
      w.mood('day'); board.set("L'étoile|de Théo");
      w.look(lerpV([4.5, 3.4, -.4], [3.6, 3.1, -1.4], ease(p)), C(-1.5, 2.0, -8));
    },
    teacher_hand(u, d, p, t) {
      w.mood('day'); students();
      P(lune, lerp(-1.6, 1.6, ease(p)), -3.9, Math.PI / 2); lune.walk(t, 6, .3); lune.setFace('neutral');
      lune.armR.rotation.x = -1.3; lune.armR.add(handPaper); handPaper.position.set(0, -1.0, .3); handPaper.rotation.set(0, 0, 0);
      w.look(lerpV([-4.6, 3.6, -9.2], [-4.0, 3.4, -8.8], p), C(0.5, 1.4, -3.6));
    },
    grades(u, d, p, t) {
      w.mood('day'); copyT.set({});
      w.look(lerpV([197.6, 4.6, 10.6], [202.4, 4.4, 10.6], ease(p)), lerpV([197.6, 0, 8.2], [202.4, 0, 8.2], ease(p)));
    },
    star_copy(u, d, p, t) {
      w.mood('day'); copyT.set({ star: 1 });
      w.look(lerpV([202.6, 3.4, 9.4], [202.95, 2.6, 8.6], ease(p)), T(2.95, .1, 7.6));
    },
    kids_laugh(u, d, p, t) {
      w.mood('day'); students();
      for (const [i, c] of [kidA, kidC].entries()) { c.setFace('laugh'); c.torso.position.y = 1.5 + Math.abs(Math.sin(t * 13 + i)) * .04; c.armR.rotation.x = -1.5; c.armR.rotation.z = -.4; c.g.rotation.y = Math.PI - .7; }
      theo.setFace('sad'); theo.head.rotation.x = .25;
      w.look(lerpV([.3, 3.2, -6.8], [.5, 3.0, -6.3], ease(p)), C(.6, 1.3, -2.0));
    },
    theo_home(u, d, p, t) {
      w.mood('sunset');
      P(theo, lerp(96, 103, p), .3, Math.PI / 2); theo.walk(t, 7, .35); theo.setFace('sad'); theo.head.rotation.x = .2;
      theo.armL.rotation.x = theo.armR.rotation.x = -.9; theo.armL.rotation.z = -.5; theo.armR.rotation.z = .5;
      theo.armR.add(handPaper); handPaper.position.set(-.3, -.8, .35); handPaper.rotation.set(Math.PI / 2, 0, 0);
      const x = theo.g.position.x;
      w.look(v3(x + 2.6, 1.6, 3.6), v3(x, 1.3, .3));
    },
    teacher_leaves(u, d, p, t) {
      w.mood('sunset');
      P(lune, 4.6, -2.6, -1.2); lune.setFace('smile'); lune.idle(t, 2);
      lune.armL.rotation.x = -lerp(0, 2.6, ease(clamp(p * 2))); lune.armL.rotation.z = -.3 + Math.sin(t * 8) * .2;
      w.look(lerpV([1.2, 2.7, -1.6], [1.8, 2.6, -1.9], ease(p)), C(4.6, 2.4, -2.6));
    },
    box_label(u, d, p, t) {
      w.mood('day');
      w.look(lerpV([201.6, 2.2, 19.2], [200.4, 1.4, 17.4], ease(p)), T(0, .8, 14.9));
    },
    copies(u, d, p, t) {
      w.mood('day'); lid1.position.y = lid2.position.y = -5;
      w.look(lerpV([200.0, 6.0, 15.0], [200.0, 4.4, 14.6], ease(p)), T(0, .4, 14));
    },
    grades_reveal(u, d, p, t) {
      w.mood('day');
      reveal.forEach((r, i) => { r.mesh.visible = p > i * .3; r.mesh.position.y = 3 + (p > i * .3 ? 0 : 1); });
      const i = Math.min(2, Math.floor(p / .3));
      w.look(lerpV([196.2 + i * 2.6, 3.0, 4.6], [196.2 + i * 2.6, 3.0, 4.0], ease((p % .3) / .3)), T(-3.8 + i * 2.6, 3, 0));
    },
    note(u, d, p, t) {
      w.mood('day'); note.set(clamp(p * .35));
      w.look(lerpV([204.4, 4.05, 5.2], [204.4, 4.0, 4.6], ease(p)), T(4.4, 4.0, 0));
    },
    theo_read(u, d, p, t) {
      w.mood('day'); sit(theo, 3, -2.6); theo.setFace('cry'); theo.head.rotation.x = .2;
      theo.armL.rotation.x = theo.armR.rotation.x = -1.3; theo.armR.add(handPaper); handPaper.position.set(-.4, -1.0, .3); handPaper.rotation.set(-.8, 0, 0);
      w.look(lerpV([3.6, 1.8, -3.6], [3.4, 1.75, -3.3], ease(p)), C(3, 1.5, -1.75));
    },
    star_meaning(u, d, p, t) {
      w.mood('day'); note.set(1);
      w.look(lerpV([204.5, 2.6, 5.4], [204.6, 2.4, 4.6], ease(p)), T(4.6, 2.35, 0));
    },
    adult_theo(u, d, p, t) {
      w.mood('day'); board.set('Bonjour à tous !|Je suis M. Théo');
      P(adult, -.6, -8.6, .15); adult.setFace('smileClosed'); adult.idle(t); adult.armR.rotation.x = -lerp(.4, 2.4, ease(clamp(p * 1.5))); adult.armR.rotation.z = .2;
      sit(kidA, -3, -5.2); sit(kidB, 3, -5.2); sit(kidC, 0, -2.6); kidA.setFace('smile'); kidB.setFace('smile'); kidC.setFace('smile');
      w.look(lerpV([1.6, 2.8, -3.2], [1.0, 2.7, -4.2], ease(p)), C(-.9, 2.3, -8.6));
    },
    child_alone(u, d, p, t) {
      w.mood('day'); board.set('Bonjour à tous !|Je suis M. Théo');
      sit(lonely, 3, -2.6); lonely.setFace('sad'); lonely.head.rotation.x = .3; lonely.armL.rotation.x = lonely.armR.rotation.x = -1.1;
      sit(kidA, -3, -5.2); sit(kidB, -3, -2.6); kidA.setFace('laugh'); kidB.setFace('laugh'); kidA.g.rotation.y = Math.PI - 1.2;
      w.look(lerpV([4.3, 1.9, -4.6], [4.0, 1.8, -4.2], ease(p)), C(3, 1.3, -1.8));
    },
    draws_star(u, d, p, t) {
      w.mood('day'); copyT.set({ name: 'Inès', star: clamp(p * 1.3) });
      w.look(lerpV([202.95, 3.1, 8.9], [202.95, 2.4, 8.3], ease(p)), T(2.95, .1, 7.6));
    },
  };

  function render(name, u, d, p, t) {
    w.resetChars(); resetProps(); w.weather(null);
    (shots[name] || shots.title)(u, d, p, t);
    w.render();
  }
  function overlay(name, u, d, t) {
    if (name === 'title') { ui.badge('ÉPISODE 4', u - .1, { size: 46, y: H * .12 }); ui.badge("L'ÉTOILE DE THÉO", u - .4, { size: 42, y: H * .2, bg: '#141a33', border: '#ffd36b', color: '#ffd36b', rot: .02 }); }
    if (name === 'teacher_leaves') ui.badge("FIN DE L'ANNÉE", u - .2, { size: 44, bg: '#141a33', border: '#ffd36b', color: '#ffd36b', y: H * .12 });
    if (name === 'adult_theo') ui.badge("AUJOURD'HUI", u - .2, { size: 48, y: H * .12 });
    if (name === 'grades_reveal') { const i = Math.min(2, Math.floor((u / d) / .3)); ui.badge(['17', '18', '19'][i] + ' / 20', u - i * d * .3, { size: 60, bg: '#3b0f12', border: '#ff7b7b', color: '#ff9b9b', y: H * .14 }); }
  }
  return { render, overlay };
}
