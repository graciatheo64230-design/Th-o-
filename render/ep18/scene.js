// Épisode 18 : « Le coffre qui doublait tout » — version ville moderne
import * as THREE from 'three';
import { W, H, clamp, ease, lerp, lerpV, v3, mat, mesh, box, rbox, makeChar, canvasTex } from '../lib.js';
import { createWorld, sparkTexture } from '../world.js';
import { poses, label } from '../s2.js';
import { VoxelWorld, modernTown, ground, clouds, BS } from '../voxel.js';

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
  const w = createWorld(renderer), S = w.scene, { P, sit } = poses(w); w.fogNear = 60; w.fogFar = 240;
  // ---------- VILLE ----------
  const town = new VoxelWorld(S, 0, 0); const T = modernTown(town, S, { seed: 5, cells: 2 }); town.build();
  ground(S, town.M, 320); clouds(S);
  const homes = T.houses.filter(h => h.kind === 'house'), home = homes[1];
  // ---------- MAISON EN COUPE : cave (bas) + chambre de maman (haut), x=400 ----------
  const OX = 400, iv = new VoxelWorld(S, OX, 0, town.M);
  // cave
  iv.fill(0, 0, 0, 9, 0, 7, 'concrete');
  for (let y = 1; y <= 3; y++) { iv.fill(0, y, 0, 9, y, 0, 'concreteGray'); iv.fill(0, y, 0, 0, y, 7, 'concreteGray'); iv.fill(9, y, 0, 9, y, 7, 'concreteGray'); }
  iv.fill(0, 4, 0, 9, 4, 7, 'concreteDark');
  for (let i = 0; i < 4; i++) iv.set(1 + i, 1 + i, 6 - i, 'concrete');           // escalier
  iv.fill(2, 1, 1, 3, 2, 1, 'panel'); iv.set(8, 1, 1, 'concreteDark'); iv.set(8, 2, 1, 'concreteDark'); // chaudière / étagères
  iv.fill(1, 3, 1, 4, 3, 1, 'spruce');
  // chambre de maman
  iv.fill(0, 4, 0, 9, 4, 7, 'planks');
  for (let y = 5; y <= 7; y++) { iv.fill(0, y, 0, 9, y, 0, 'concrete'); iv.fill(0, y, 0, 0, y, 7, 'concrete'); iv.fill(9, y, 0, 9, y, 7, 'concrete'); }
  iv.fill(3, 6, 0, 4, 6, 0, 'glassModern'); iv.fill(0, 8, 0, 9, 8, 7, 'concreteGray');
  iv.fill(1, 5, 2, 3, 5, 5, 'wool_white'); iv.fill(1, 5, 1, 3, 6, 1, 'claddingDark'); iv.set(1, 5, 6, 'claddingDark');  // lit
  iv.build();
  const chest = makeChest(S, OX + 6.5 * BS, 1.5, 2.5 * BS), mchest = makeChest(S, OX + 6.5 * BS, 7.5, 2.5 * BS);
  const coldL = new THREE.PointLight('#bcd4ff', 4, 14, 1.5); coldL.position.set(OX + 5 * BS, 5.2, 4 * BS); S.add(coldL);
  const warmL = new THREE.PointLight('#ffd6a0', 9, 14, 1.5); warmL.position.set(OX + 5 * BS, 11.2, 4 * BS); S.add(warmL);
  const fillL = new THREE.PointLight('#ffffff', 0, 30, 1.2); fillL.position.set(OX + 5 * BS, 8, 18); S.add(fillL);
  const lk = label('KENZO', { w: 1.8, size: 110, color: '#ffd84a' }), lm = label('MAMAN', { w: 1.8, size: 110, color: '#ff9cc4' }); lk.position.set(OX + 6.5 * BS, 4.4, 2.5 * BS); lm.position.set(OX + 6.5 * BS, 10.4, 2.5 * BS); S.add(lk, lm);
  const beam = mesh(new THREE.CylinderGeometry(.1, .1, 6, 10), mat('#ff3a3a', { emissive: '#ff2020', emissiveIntensity: 4 }), S, OX + 6.5 * BS, 5.3, 2.5 * BS, false);
  // ---------- CUISINE MODERNE, x=470 ----------
  const KX = 470, kv = new VoxelWorld(S, KX, 0, town.M);
  kv.fill(0, 0, 0, 9, 0, 8, 'tile');
  for (let y = 1; y <= 3; y++) { kv.fill(0, y, 0, 9, y, 0, 'concrete'); kv.fill(0, y, 0, 0, y, 8, 'concrete'); kv.fill(9, y, 0, 9, y, 8, 'concrete'); }
  kv.fill(5, 2, 0, 7, 3, 0, 'glassModern'); kv.fill(0, 4, 0, 9, 4, 8, 'concrete');
  kv.fill(1, 1, 1, 4, 1, 1, 'panel'); kv.fill(1, 2, 1, 4, 2, 1, 'concreteGray'); kv.fill(3, 1, 4, 6, 1, 4, 'claddingDark');
  kv.build();
  const tbl = new THREE.Group(); tbl.position.set(KX + 6 * BS, 0, 6.5 * BS); S.add(tbl); box(2.2, .1, 1.3, mat('#f4f1ea'), tbl, 0, 1.45, 0); box(.1, 1.45, .1, mat('#2a2d33'), tbl, 0, .72, 0);
  const plate = mesh(new THREE.CylinderGeometry(.3, .26, .05, 20), mat('#ffffff'), tbl, 0, 1.53, .2);
  const kl = new THREE.PointLight('#fff1dc', 10, 16, 1.4); kl.position.set(KX + 5 * BS, 5, 5 * BS); S.add(kl);
  const spark = new THREE.Sprite(new THREE.SpriteMaterial({ map: sparkTexture(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); S.add(spark);
  const ring = new THREE.Group(); ring.add(mesh(new THREE.TorusGeometry(.09, .025, 10, 24), goldM, null)); mesh(new THREE.CylinderGeometry(.035, .045, .05, 8), goldM, ring, 0, .1, 0); S.add(ring);
  const bag = rbox(.45, .5, .25, .06, mat('#2a2d33'), null);
  // ---------- PERSONNAGES ----------
  const ks = { skin: '#e9b48a', pants: '#3b3f4f', hair: 'messy', hairColor: '#3a2414', face: { blush: true, brow: '#2a1a10' } };
  const kenzo = w.add(makeChar({ ...ks, shirt: '#3fa9f5' })); kenzo.g.scale.setScalar(.7);
  const rich = w.add(makeChar({ ...ks, shirt: '#ffffff', coat: '#111318', scarf: '#d4a017' })); rich.g.scale.setScalar(.7);
  const mom = w.add(makeChar({ skin: '#e9b48a', shirt: '#7a8a9a', pants: '#3b3f4f', hair: 'bun', hairColor: '#3a2414', face: { brow: '#2a1a10' } }));
  const momW = w.add(makeChar({ skin: '#e9b48a', shirt: '#2e7d6a', pants: '#2e7d6a', hair: 'bun', hairColor: '#3a2414', face: { brow: '#2a1a10' } }));
  const n1 = w.add(makeChar({ skin: '#f0c49a', shirt: '#7f8c8d', pants: '#34495e', hair: 'short', hairColor: '#5a3a24', face: {} }));
  const n2 = w.add(makeChar({ skin: '#a56b46', shirt: '#9b59b6', pants: '#34495e', hair: 'long', hairColor: '#141414', face: { blush: true } }));

  const C = chest.position.clone().add(v3(0, .9, 0)), MC = mchest.position.clone().add(v3(0, .9, 0));
  const B = (x, y, z) => iv.pos(x, y, z), BF = (x, z) => { const p = iv.pos(x, 1, z); p.y = 1.5; return p; }, MF = (x, z) => { const p = iv.pos(x, 5, z); p.y = 7.5; return p; };
  const at = (c, p, ry) => { P(c, p.x, p.z, ry, p.y); };
  let grade = 0, cold = 0;
  const glowChest = (c, k, col = '#ffd060') => { c.userData.glow.color.set(col); c.userData.glow.intensity = k * 9; };
  const shots = {
    hook(u, d, p, t) { w.mood('dark'); chest.userData.open(ease(clamp(p * 1.8))); glowChest(chest, clamp(p * 2.5)); fill(chest.userData.inside, [['iron', p < .62 ? 1 : 2]]); w.shoot(C, lerp(3.2, 1.6, ease(p)), .2, lerp(.25, .65, p)); },
    cave(u, d, p, t) { w.mood('dark'); const k = ease(clamp(p * 1.3)); const a = BF(4.2, 3.2), b = BF(1.4, 6.2); at(kenzo, v3(lerp(b.x, a.x, k), lerp(5.4, 1.5, k), lerp(b.z, a.z, k)), Math.PI * .75); kenzo.walk(t, 7, .4 * (1 - k)); kenzo.setFace(p < .7 ? 'neutral' : 'wonder'); glowChest(chest, .3); w.look(v3(OX + 8.5 * BS, 3.0, 5.8 * BS), v3(kenzo.g.position.x, 2.6, kenzo.g.position.z)); },
    one_ingot(u, d, p, t) { w.mood('dark'); chest.userData.open(1); glowChest(chest, .5); fill(chest.userData.inside, [['iron', 1]]); at(kenzo, BF(6.5, 3.6), Math.PI); kenzo.armR.rotation.x = -1.3; kenzo.setFace('neutral'); w.shoot(w.head(kenzo, -.5), 2.6, Math.PI - .5, .25); },
    two_ingots(u, d, p, t) { w.mood('dark'); chest.userData.open(1); glowChest(chest, 1); fill(chest.userData.inside, [['iron', 2]]); w.shoot(C, lerp(1.9, 1.4, ease(p)), -.35, .8); },
    put_all(u, d, p, t) { w.mood('dark'); chest.userData.open(1); glowChest(chest, .8); fill(chest.userData.inside, [['iron', 4], ['gold', 3]]); at(kenzo, BF(6.5, 3.6), Math.PI); kenzo.setFace('laugh'); kenzo.armL.rotation.x = kenzo.armR.rotation.x = -1.3 + Math.sin(t * 10) * .25; w.shoot(w.head(kenzo, -.3), 2.4, Math.PI + .5, .1); },
    items(u, d, p, t) { w.mood('dark'); chest.userData.open(1); glowChest(chest, 1); const i = Math.min(2, Math.floor(p * 3)); fill(chest.userData.inside, [['iron', 6], ['gold', i >= 1 ? 6 : 0], ['emerald', i >= 2 ? 6 : 0]]); w.shoot(C, 1.5, [-.6, .5, 0][i], [.7, .9, 1.2][i]); },
    rich(u, d, p, t) {
      w.mood('day'); town.setNightModern(0); const dp = home.door; at(rich, v3(dp.x + 2.5, 0, dp.z + home.face * 3), home.face > 0 ? 0 : Math.PI); rich.setFace('laugh'); rich.armL.rotation.x = rich.armR.rotation.x = -2.6;
      at(n1, v3(dp.x - 1.5, 0, dp.z + home.face * 6.5), home.face > 0 ? Math.PI - .5 : .5); at(n2, v3(dp.x + 5.5, 0, dp.z + home.face * 6.8), home.face > 0 ? Math.PI + .5 : -.5); n1.setFace('angry'); n2.setFace('wonder');
      const c = rich.g.position; w.shoot(v3(c.x, 1.6, c.z), lerp(4.5, 11, ease(p)), home.face > 0 ? .15 : Math.PI + .15, lerp(.05, .25, p));
    },
    mom_tired(u, d, p, t) { w.mood('grey'); const pp = kv.pos(3, 1, 3); at(mom, v3(pp.x, 1.5, pp.z), 2.5); mom.setFace('sad'); mom.head.rotation.x = .3; mom.armL.rotation.x = mom.armR.rotation.x = -.9; w.shoot(w.head(mom, -.3), lerp(2.6, 2.1, ease(p)), 2.5, .03); },
    mom_work(u, d, p, t) { w.mood('night'); town.setNightModern(1); const z = T.roadZ(0) - 2.6; at(momW, v3(lerp(-14, -6, p), 0, z), Math.PI / 2); momW.walk(t, 5, .3); momW.setFace('sad'); momW.armR.add(bag); bag.position.set(0, -1.0, 0); w.shoot(w.head(momW, -.6), 5, Math.PI / 2 - .7, .1); },
    mom_eat(u, d, p, t) { w.mood('night'); kl.intensity = 5; sit(mom, tbl.position.x, tbl.position.z + 1.0, Math.PI); mom.setFace('sad'); mom.head.rotation.x = .4; w.shoot(v3(tbl.position.x, 1.6, tbl.position.z), lerp(2.8, 2.3, p), Math.PI + .6, .55); },
    look_away(u, d, p, t) { w.mood('dark'); chest.userData.open(1); glowChest(chest, .6); fill(chest.userData.inside, [['gold', 8], ['emerald', 6]]); at(rich, BF(6.2, 4.2), Math.PI + .3); rich.setFace('neutral'); rich.head.rotation.y = lerp(0, -.9, ease(p)); w.shoot(w.head(rich, -.3), 2.0, Math.PI + .3, .05); },
    diamond_in(u, d, p, t) { w.mood('dark'); chest.userData.open(1); glowChest(chest, .5, '#9ff4ff'); fill(chest.userData.inside, [['diamond', 1]]); const g0 = chest.userData.inside.children[0].getWorldPosition(new THREE.Vector3()); spark.visible = true; spark.position.copy(g0).add(v3(0, .25, 0)); spark.scale.setScalar(.12 + .08 * Math.abs(Math.sin(t * 6))); w.shoot(g0, lerp(1.3, .85, ease(p)), .3, .55); },
    two_diamonds(u, d, p, t) { w.mood('dark'); chest.userData.open(1); glowChest(chest, 1, '#9ff4ff'); fill(chest.userData.inside, [['diamond', 2]]); at(rich, BF(6.5, 3.8), Math.PI); rich.setFace('laugh'); rich.armL.rotation.x = rich.armR.rotation.x = -2.6; if (p < .45) w.shoot(C.clone().add(v3(0, -.2, 0)), 1.1, -.3, .7); else w.shoot(w.head(rich, -.3), 2.1, Math.PI + .2, .05); },
    freeze(u, d, p, t) { w.mood('dark'); at(rich, BF(6.5, 3.8), Math.PI); rich.setFace(p < .3 ? 'laugh' : 'wonder'); rich.head.rotation.x = -lerp(0, .55, ease(clamp((p - .25) * 2.5))); cold = clamp((p - .25) * 2) * .5; w.shoot(w.head(rich, -.2), lerp(2.0, 1.7, ease(p)), Math.PI + .3, -.15); },
    mom_chest(u, d, p, t) { w.mood('dawn'); mchest.userData.open(ease(clamp(p * 1.5))); at(mom, MF(6.5, 1.1), 0); mom.setFace('cry'); mom.armL.rotation.x = mom.armR.rotation.x = -1.1; cold = .5; w.shoot(v3(MC.x, 9.0, MC.z - .3), lerp(4.4, 3.8, p), .15, .3); },
    ring(u, d, p, t) { w.mood('dawn'); at(mom, MF(6.5, 1.1), .2); mom.setFace('cry'); mom.armR.rotation.x = -1.5; cold = .6; ring.visible = true; const h = w.head(mom, -.9); ring.position.set(h.x - .1, h.y, h.z + .6); ring.rotation.set(1.2, t * .3, 0); if (p < .55) w.shoot(ring.position, lerp(.8, .6, ease(p)), .3, .15); else w.shoot(w.head(mom, -.4), 2.2, .25, .05); },
    chest_red(u, d, p, t) { w.mood('dark'); chest.userData.open(1); glowChest(chest, 1.3, '#ff2a2a'); fill(chest.userData.inside, [['diamond', 2], ['gold', 6]]); grade = .28 * p; cold = .3; w.shoot(C, lerp(3.0, 1.8, ease(p)), lerp(-.5, .2, p), .35); },
    beam(u, d, p, t) { w.mood('day'); fillL.intensity = 26; chest.userData.open(1); mchest.userData.open(1); glowChest(chest, .8, '#ff2a2a'); fill(chest.userData.inside, [['gold', 6], ['diamond', 2]]); fill(mchest.userData.inside, [['iron', Math.max(0, 5 - Math.floor(p * 7))]]); lk.visible = lm.visible = true; beam.visible = true; beam.scale.y = ease(clamp(p * 1.7)); beam.position.y = lerp(7.5, 4.5, ease(clamp(p * 1.7))); at(mom, MF(3.5, 4.5), .4); mom.setFace('sad'); at(rich, BF(4.5, 4.5), .3); rich.setFace('smile'); w.look(v3(OX + 5 * BS, 6.2, 22), v3(OX + 5 * BS, 5.8, 3)); },
    mom_empty(u, d, p, t) { w.mood('dawn'); mchest.userData.open(1); fill(mchest.userData.inside, []); cold = .6; w.shoot(MC.clone().add(v3(0, -.4, 0)), lerp(2.6, 2.1, ease(p)), 0, .95); },
    final(u, d, p, t) {
      w.mood('dawn'); cold = .4 * (1 - p); at(mom, MF(5.0, 4.8), .2); mom.setFace(p < .35 ? 'cry' : 'smile'); mom.armR.rotation.x = p < .35 ? -2.3 : -.3; mom.head.rotation.y = p > .35 ? .4 : 0;
      if (p > .35) { at(kenzo, MF(7.2, 6.4), -2.4); kenzo.setFace('sad'); }
      w.shoot(w.head(mom, -.3), lerp(2.3, 3.6, ease(p)), .5, .05);
    },
  };
  function render(name, u, d, p, t) {
    w.resetChars(); grade = 0; cold = 0; fillL.intensity = 0; kl.intensity = 10;
    [chest, mchest].forEach(c => { c.userData.open(0); fill(c.userData.inside, []); c.userData.glow.intensity = 0; });
    spark.visible = false; ring.visible = false; beam.visible = false; lk.visible = lm.visible = false; bag.removeFromParent(); town.setNightModern(0);
    w.weather(null); (shots[name] || shots.hook)(u, d, p, t); w.render();
  }
  function overlay(name, u, d, t) {
    const c = ui.ctx;
    if (cold > 0) { c.save(); c.globalCompositeOperation = 'color'; c.fillStyle = `rgba(70,110,170,${cold})`; c.fillRect(0, 0, W, H); c.restore(); }
    if (grade > 0) { c.fillStyle = `rgba(160,0,0,${grade})`; c.fillRect(0, 0, W, H); }
    if (name === 'two_ingots' || name === 'two_diamonds') ui.badge('×2', u - .1, { size: 72, bg: '#3a2c00', border: '#ffd21f', color: '#ffe14d', y: H * .14 });
    if (name === 'rich') ui.badge('1 MOIS PLUS TARD', u - .1, { size: 44, bg: '#141a33', border: '#ffd36b', color: '#ffd36b', y: H * .12 });
    if (name === 'final') { const k = clamp((u / d - .86) * 7); if (k > 0) { c.fillStyle = `rgba(0,0,0,${k})`; c.fillRect(0, 0, W, H); } }
  }
  return { render, overlay };
}
