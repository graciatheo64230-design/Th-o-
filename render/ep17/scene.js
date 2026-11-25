// Épisode 17 : « Le coffre qui doublait tout »
import * as THREE from 'three';
import { W, H, clamp, ease, lerp, lerpV, v3, mat, mesh, box, rbox, makeChar, canvasTex } from '../lib.js';
import { createWorld, tex, room, table, chair, house, groundPlane, tree, lampPost, sunDisc, sparkTexture } from '../world.js';
import { poses, label } from '../s2.js';

const planks = () => canvasTex(256, 256, (g) => { for (let i = 0; i < 4; i++) { g.fillStyle = ['#a8743f', '#9a6a38', '#b07a44', '#94642f'][i]; g.fillRect(0, i * 64, 256, 64); g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(0, i * 64 + 61, 256, 3); } g.strokeStyle = '#5a3a1a'; g.lineWidth = 10; g.strokeRect(5, 5, 246, 246); });

function makeChest(parent, x, y, z, ry = 0) {
  const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; parent.add(g);
  const wood = new THREE.MeshStandardMaterial({ map: planks(), roughness: .8 });
  box(1.1, .65, .85, wood, g, 0, .325, 0);
  const lid = new THREE.Group(); lid.position.set(0, .65, -.425); g.add(lid);
  box(1.12, .28, .87, wood, lid, 0, .14, .435);
  box(.16, .22, .06, mat('#c9ced4', { metalness: .8, roughness: .3 }), lid, 0, .02, .88);
  const glow = new THREE.PointLight('#ffd060', 0, 5, 1.6); glow.position.set(0, .9, 0); g.add(glow);
  const inside = new THREE.Group(); inside.position.set(0, .66, 0); g.add(inside);
  g.userData = { lid, glow, inside, open: (k) => { lid.rotation.x = -k * 1.9; } };
  return g;
}
const ingotM = mat('#d6dbe0', { metalness: .85, roughness: .3 }), goldM = mat('#f1c40f', { metalness: .9, roughness: .25, emissive: '#6a4a00', emissiveIntensity: .3 });
const emerM = mat('#2ecc71', { metalness: .2, roughness: .1, emissive: '#0a5a2a', emissiveIntensity: .6 }), diaM = mat('#6ff0ff', { metalness: .3, roughness: .05, emissive: '#2aa8c0', emissiveIntensity: .9 });
const ingotGeo = new THREE.BoxGeometry(.34, .12, .18), gemGeo = new THREE.OctahedronGeometry(.12);
function fill(inside, list) {
  while (inside.children.length) inside.remove(inside.children[0]);
  list.forEach(([kind, n]) => { for (let i = 0; i < n; i++) { const m = kind === 'iron' || kind === 'gold' ? new THREE.Mesh(ingotGeo, kind === 'iron' ? ingotM : goldM) : new THREE.Mesh(gemGeo, kind === 'emerald' ? emerM : diaM); const k = inside.children.length; m.position.set(-.3 + (k % 4) * .2, .07 + Math.floor(k / 8) * .1, -.15 + (Math.floor(k / 4) % 2) * .3); m.rotation.y = k * .7; inside.add(m); } });
}

export function create(renderer, ui) {
  const w = createWorld(renderer), S = w.scene, { P, sit } = poses(w);
  // ---------- CAVE (x=0) ----------
  const cave = room(S, { x: 0, w: 7, d: 7, h: 3.6, floor: tex.stone([4, 4]), wall: tex.stone([3, 2]), window: { x: 2.4, y: 3.0, w: .8, h: .5 }, lights: [[0, -3.5]], lightI: 4, lightColor: '#ff9a40', base: '#5a5a5a', ceilColor: '#4a3a2a' });
  const chest = makeChest(cave, 0, 0, -4.8);
  const ladder = new THREE.Group(); ladder.position.set(-2.2, 0, -2.0); cave.add(ladder);
  for (const s of [-1, 1]) box(.08, 3.6, .08, mat('#8a5a36'), ladder, s * .3, 1.8, 0); for (let i = 0; i < 9; i++) box(.6, .06, .06, mat('#8a5a36'), ladder, 0, .3 + i * .38, 0);
  const torches = [[-2.8, 2.2, -6.8], [2.8, 2.2, -6.8]].map(([x, y, z]) => { box(.08, .5, .08, mat('#6a4a2a'), cave, x, y, z); mesh(new THREE.SphereGeometry(.09, 8, 6), mat('#ffb040', { emissive: '#ff9020', emissiveIntensity: 3 }), cave, x, y + .3, z, false); const l = new THREE.PointLight('#ff9a40', 6, 7, 1.6); l.position.set(x, y + .4, z + .3); cave.add(l); return l; });
  const spark = new THREE.Sprite(new THREE.SpriteMaterial({ map: sparkTexture(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); S.add(spark);
  // ---------- CHAMBRE DE LA MÈRE (x=40) ----------
  const mroom = room(S, { x: 40, w: 8, d: 7, wall: tex.stripes('#e9dcc6', '#e0cfb4'), window: { x: 1.8, y: 2.4, w: 2, h: 1.5 }, lights: [[0, -3.5]], lightI: 8 });
  const mchest = makeChest(mroom, -1.8, 0, -5.6);
  box(2.0, .5, 3.2, mat('#7a4a2a'), mroom, 2.0, .25, -4.8); box(1.9, .3, 3.0, mat('#cfc0a8'), mroom, 2.0, .65, -4.8);
  const ring = new THREE.Group(); ring.add(mesh(new THREE.TorusGeometry(.09, .025, 10, 24), goldM, null)); const socket = mesh(new THREE.CylinderGeometry(.035, .045, .05, 8), goldM, ring, 0, .1, 0); const ringDia = mesh(new THREE.OctahedronGeometry(.05), diaM, ring, 0, .15, 0); S.add(ring);
  // ---------- CUISINE (x=80) ----------
  const kit = room(S, { x: 80, w: 8, d: 7, floor: tex.wood(['#8a6a4a', '#7a5a3a', '#94704c', '#80603e']), wall: tex.stripes('#e8dcc6', '#ddd0b6'), window: { x: -1.5, y: 2.4, w: 2, h: 1.5 }, lights: [[0, -3.5]], lightI: 9 });
  table(kit, 0, -4.0, { w: 2.2, d: 1.3 }); chair(kit, 0, -3.1, Math.PI, '#8a5432');
  mesh(new THREE.CylinderGeometry(.32, .28, .05, 20), mat('#f4f1ea'), kit, 0, 1.28, -3.7);
  const pick = new THREE.Group(); box(.06, 1.0, .06, mat('#6a4a2a'), pick, 0, 0, 0); const ph = box(.7, .1, .1, mat('#9aa3ab', { metalness: .6 }), pick, 0, .5, 0); ph.rotation.z = .15;
  // ---------- VILLAGE (x=120) ----------
  const vil = new THREE.Group(); vil.position.set(120, 0, 0); S.add(vil);
  groundPlane(vil, '#7fb069');
  const pth = mesh(new THREE.PlaneGeometry(60, 3), mat('#c9b48a'), vil, 0, .02, 1.5); pth.rotation.x = -Math.PI / 2;
  for (let i = 0; i < 4; i++) house(vil, -12 + i * 8, -3.5, { w: 6, h: 3.6, color: ['#c9a27a', '#d9c4a0', '#b8956a', '#e0cba5'][i], roof: '#6a4a2a', lit: false });
  const pile = new THREE.Group(); vil.add(pile);
  for (let i = 0; i < 40; i++) { const m = mesh(new THREE.BoxGeometry(.5, .5, .5), i % 3 ? goldM : (i % 2 ? emerM : ingotM), pile, (w.R() - .5) * 2.6, .25 + Math.floor(i / 12) * .5, (w.R() - .5) * 1.6); m.rotation.y = w.R(); }
  sunDisc(vil, -20, 9, -70, '#fff2c0', 4);
  // ---------- VUE EN COUPE (x=200) ----------
  const cut = new THREE.Group(); cut.position.set(200, 0, 0); S.add(cut);
  box(9, .2, 4, mat('#7a5a3a'), cut, 0, -.1, -2); box(9, 4, .2, mat('#c9b48a'), cut, 0, 2, -4); box(.3, 4, 4, mat('#a8906a'), cut, 0, 2, -2);
  const c1 = makeChest(cut, -2.2, 0, -2.6), c2 = makeChest(cut, 2.2, 0, -2.6);
  const beam = mesh(new THREE.CylinderGeometry(.09, .09, 4.4, 10), mat('#ff4040', { emissive: '#ff2020', emissiveIntensity: 4 }), cut, 0, .95, -2.6, false); beam.rotation.z = Math.PI / 2;
  const cl = new THREE.PointLight('#fff0d8', 9, 14, 1.3);
  const lk = label('KENZO', { w: 1.6, size: 110, color: '#ffd84a' }), lm = label('MAMAN', { w: 1.6, size: 110, color: '#ff9cc4' }); lk.position.set(198.1, 2.0, -2.6); lm.position.set(201.9, 2.0, -2.6); S.add(lk, lm); cut.userData.labels = [lk, lm]; cl.position.set(0, 3.5, 1.5); cut.add(cl);

  // ---------- PERSONNAGES ----------
  const ks = { skin: '#e9b48a', pants: '#3b3f4f', hair: 'messy', hairColor: '#3a2414', face: { blush: true, brow: '#2a1a10' } };
  const kenzo = w.add(makeChar({ ...ks, shirt: '#3fa9f5' })); kenzo.g.scale.setScalar(.7);
  const kenzoRich = w.add(makeChar({ ...ks, shirt: '#ffffff', vest: '#d4a017', coat: '#7a1a3a' })); kenzoRich.g.scale.setScalar(.7);
  const mom = w.add(makeChar({ skin: '#e9b48a', shirt: '#8e6a4a', pants: '#4a3a3a', apron: '#e8dcc6', hair: 'bun', hairColor: '#3a2414', face: { brow: '#2a1a10' } }));
  const v1 = w.add(makeChar({ skin: '#f0c49a', shirt: '#7f8c8d', pants: '#34495e', hair: 'cap', hairColor: '#5a3a24', face: {} }));
  const v2 = w.add(makeChar({ skin: '#a56b46', shirt: '#9b59b6', pants: '#34495e', hair: 'long', hairColor: '#141414', face: {} }));

  let red = 0;
  const C = v3(0, .9, -4.8);
  const goldGlow = (k) => { chest.userData.glow.intensity = k * 8; spark.visible = k > 0; spark.position.set(0, 1.4, -4.6); spark.scale.setScalar(.4 + k * .4); };
  const shots = {
    hook(u, d, p, t) { w.mood('night'); chest.userData.open(ease(clamp(p * 1.5))); goldGlow(clamp(p * 2)); fill(chest.userData.inside, [['iron', p < .6 ? 1 : 2]]); w.shoot(C, lerp(3.6, 1.6, ease(p)), .1, lerp(.3, .7, p)); },
    cave(u, d, p, t) { w.mood('night'); P(kenzo, -2.2, -1.6, Math.PI, lerp(2.4, 0, ease(clamp(p * 1.4)))); kenzo.armL.rotation.x = kenzo.armR.rotation.x = p < .7 ? -2.6 : -.3; kenzo.setFace(p < .7 ? 'neutral' : 'wonder'); if (p > .7) kenzo.g.rotation.y = Math.PI - .6; w.look(v3(1.4, 1.7, -4.4), lerpV([-2.2, 1.4, -1.8], [-.2, .8, -4.8], ease(clamp((p - .55) * 2.2)))); },
    one_ingot(u, d, p, t) { w.mood('night'); chest.userData.open(1); fill(chest.userData.inside, [['iron', 1]]); goldGlow(.3); w.shoot(C, 2.2, .35, .75); },
    two_ingots(u, d, p, t) { w.mood('dawn'); chest.userData.open(1); fill(chest.userData.inside, [['iron', 2]]); goldGlow(.8); w.shoot(C, lerp(2.0, 1.5, ease(p)), .35, .75); },
    put_all(u, d, p, t) { w.mood('night'); chest.userData.open(1); goldGlow(.5); P(kenzo, .2, -3.6, Math.PI); kenzo.setFace('laugh'); kenzo.armL.rotation.x = kenzo.armR.rotation.x = -1.3 + Math.sin(t * 10) * .25; fill(chest.userData.inside, [['iron', 4], ['gold', 3]]); w.shoot(w.head(kenzo, -.3), 2.2, Math.PI - .4, .2); },
    items(u, d, p, t) { w.mood('night'); chest.userData.open(1); goldGlow(.9); const i = Math.min(2, Math.floor(p * 3)); fill(chest.userData.inside, [['iron', 6], ['gold', i >= 1 ? 6 : 0], ['emerald', i >= 2 ? 6 : 0]]); w.shoot(C, 1.5 - i * .1, .2 + i * .3, .8); },
    rich(u, d, p, t) { w.mood('day'); P(kenzoRich, 120, .2, .2, 1.5); kenzoRich.setFace('laugh'); kenzoRich.armL.rotation.x = kenzoRich.armR.rotation.x = -2.7; P(v1, 121.8, 2.2, -.8); P(v2, 118.2, 2.4, .7); v1.setFace('angry'); v2.setFace('wonder'); w.shoot(v3(120, 2.0, .5), lerp(5, 8, ease(p)), .2, .15); },
    mom_tired(u, d, p, t) { w.mood('sunset'); P(mom, 80.6, -5.6, .3); mom.setFace('sad'); mom.head.rotation.x = .25; mom.torso.rotation.x = .1; w.shoot(w.head(mom, -.3), lerp(2.6, 2.1, ease(p)), .3, .02); },
    mom_work(u, d, p, t) { w.mood('night'); P(mom, 120 + lerp(-1, 4, p), 1.5, Math.PI / 2); mom.walk(t, 5, .3); mom.setFace('sad'); mom.armR.rotation.x = -.4; mom.armR.add(pick); pick.position.set(0, -.9, .2); pick.rotation.set(.3, 0, 0); w.shoot(w.head(mom, -.6), 4, Math.PI / 2 - .6, .1); },
    mom_eat(u, d, p, t) { w.mood('night'); sit(mom, 80, -3.1, Math.PI); mom.setFace('sad'); mom.head.rotation.x = .35; w.shoot(v3(80, 1.4, -3.6), lerp(2.6, 2.2, p), Math.PI + .5, .6); },
    look_away(u, d, p, t) { w.mood('night'); P(kenzoRich, .4, -3.4, Math.PI + .3); kenzoRich.setFace('neutral'); kenzoRich.head.rotation.y = lerp(0, -.8, ease(p)); chest.userData.open(1); fill(chest.userData.inside, [['gold', 8], ['emerald', 6]]); goldGlow(.6); w.shoot(w.head(kenzoRich, -.3), 2.0, .3 - Math.PI + Math.PI * 2, .05); },
    diamond_in(u, d, p, t) { w.mood('night'); chest.userData.open(1); goldGlow(.4); fill(chest.userData.inside, [['diamond', 1]]); spark.visible = true; spark.position.set(-.3, .85, -4.95); spark.scale.setScalar(.2 + .15 * Math.abs(Math.sin(t * 6))); w.shoot(v3(-.3, .75, -4.95), lerp(1.2, .8, ease(p)), .2, .5); },
    two_diamonds(u, d, p, t) { w.mood('dawn'); chest.userData.open(1); goldGlow(1); fill(chest.userData.inside, [['diamond', 2]]); P(kenzoRich, .3, -3.6, Math.PI); kenzoRich.setFace('laugh'); kenzoRich.armL.rotation.x = kenzoRich.armR.rotation.x = -2.6; if (p < .5) w.shoot(v3(-.2, .75, -4.95), 1.0, .2, .6); else w.shoot(w.head(kenzoRich, -.3), 2.0, .3, .05); },
    freeze(u, d, p, t) { w.mood('dawn'); P(kenzoRich, .3, -3.6, .3); kenzoRich.setFace(p < .35 ? 'laugh' : 'wonder'); kenzoRich.head.rotation.y = lerp(0, .7, ease(clamp((p - .3) * 2))); w.shoot(w.head(kenzoRich, -.3), lerp(2.0, 1.6, ease(p)), .3, .05); },
    mom_chest(u, d, p, t) { w.mood('dawn'); mchest.userData.open(ease(clamp(p * 1.5))); fill(mchest.userData.inside, []); P(mom, 38.2, -4.4, Math.PI); mom.setFace('cry'); mom.armL.rotation.x = mom.armR.rotation.x = -1.3; w.shoot(v3(38.2, 1.6, -5.0), lerp(2.6, 2.2, p), Math.PI - .9, .2); },
    ring(u, d, p, t) { w.mood('dawn'); P(mom, 38.2, -4.4, Math.PI - .4); mom.setFace('cry'); ring.visible = true; ringDia.visible = false; ring.position.set(38.0, 1.9, -5.0); ring.rotation.set(.3, t * .4, 0); w.shoot(v3(38.0, 1.95, -5.0), lerp(.9, .6, ease(p)), Math.PI - .4, .1); },
    chest_red(u, d, p, t) { w.mood('dark'); chest.userData.open(1); fill(chest.userData.inside, [['diamond', 2], ['gold', 6]]); chest.userData.glow.color.set('#ff3030'); chest.userData.glow.intensity = 10; red = .25 * p; w.shoot(C, lerp(3.2, 2.0, ease(p)), .1, .4); },
    beam(u, d, p, t) { w.mood('day'); c1.userData.open(1); c2.userData.open(1); fill(c1.userData.inside, [['gold', 6], ['diamond', 2]]); fill(c2.userData.inside, [['iron', Math.max(0, 6 - Math.floor(p * 8))]]); cut.userData.labels.forEach(l => l.visible = true); beam.visible = true; beam.scale.y = ease(clamp(p * 1.6)); beam.position.x = lerp(2.2, 0, ease(clamp(p * 1.6))); w.shoot(v3(200, 1.0, -2.5), lerp(11.5, 10.5, p), 0, .35); },
    mom_empty(u, d, p, t) { w.mood('day'); c2.userData.open(1); fill(c2.userData.inside, []); w.shoot(v3(202.2, .7, -2.6), lerp(2.2, 1.7, ease(p)), 0, .55); },
    final(u, d, p, t) {
      w.mood('sunset'); P(mom, 80.2, -4.9, 0); mom.setFace(p < .4 ? 'cry' : 'smile'); mom.armR.rotation.x = p < .4 ? -2.2 : -.2; P(kenzo, 81.4, -3.4, -Math.PI / 2 - .6); kenzo.setFace('sad');
      w.shoot(w.head(mom, -.3), lerp(2.4, 3.6, ease(p)), .35, .05);
    },
  };
  function render(name, u, d, p, t) {
    w.resetChars(); red = 0; [chest, mchest, c1, c2].forEach(c => { c.userData.open(0); fill(c.userData.inside, []); c.userData.glow.intensity = 0; c.userData.glow.color.set('#ffd060'); });
    spark.visible = false; cut.userData.labels.forEach(l => l.visible = false); ring.visible = false; ringDia.visible = true; beam.visible = false; pick.removeFromParent();
    w.weather(null); (shots[name] || shots.hook)(u, d, p, t); w.render();
  }
  function overlay(name, u, d, t) {
    const c = ui.ctx;
    if (red > 0) { c.fillStyle = `rgba(160,0,0,${red})`; c.fillRect(0, 0, W, H); }
    if (name === 'two_ingots' || name === 'two_diamonds') ui.badge('×2', u - .15, { size: 70, bg: '#3a2c00', border: '#ffd21f', color: '#ffe14d', y: H * .14 });
    if (name === 'rich') ui.badge('1 MOIS PLUS TARD', u - .1, { size: 44, bg: '#141a33', border: '#ffd36b', color: '#ffd36b', y: H * .12 });
    if (name === 'final') { const k = clamp((u / d - .85) * 7); if (k > 0) { c.fillStyle = `rgba(0,0,0,${k})`; c.fillRect(0, 0, W, H); } }
  }
  return { render, overlay };
}
