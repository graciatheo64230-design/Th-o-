// Épisode 3 : « Le chien de la case vide »
import * as THREE from 'three';
import { W, H, clamp, ease, lerp, lerpV, v3, mat, mesh, box, rbox, roundRect, makeChar, makeDog } from '../lib.js';
import { createWorld, tex, card, font, room, tree, lampPost, house, car, groundPlane, sunDisc } from '../world.js';

export function create(renderer, ui) {
  const w = createWorld(renderer), S = w.scene;

  // ---------- REFUGE, INTÉRIEUR (x=0) ----------
  const ref = room(S, { x: 0, w: 12, d: 10, h: 4.6, floor: tex.tiles('#b9bec4', '#a9aeb5', [8, 8]), wall: tex.stripes('#d9e8dc', '#cfe0d2', [6, 2]), window: { x: 2.5, y: 2.8, w: 2.6, h: 1.6 }, base: '#5a7a62', lights: [[-2, -3], [2, -7]], lightI: 14 });
  const bars = mat('#7d868f', { metalness: .6, roughness: .4 });
  const barGeo = new THREE.CylinderGeometry(.04, .04, 2.6, 8);
  const kennels = {};
  const numTex = (n) => (g, W2, H2) => { g.fillStyle = '#2f5f3f'; roundRect(g, 4, 4, W2 - 8, H2 - 8, 20); g.fill(); g.fillStyle = '#fff'; font(g, 900, 120); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(n), W2 / 2, H2 / 2 + 6); };
  for (const [n, z] of [[7, -2.4], [8, -4.8], [9, -7.2]]) {
    const k = new THREE.Group(); k.position.set(-3.6, 0, z); ref.add(k);
    box(2.6, 2.6, .12, mat('#c9d6cc'), k, 0, 1.3, -1.2); // séparation
    box(2.6, .1, 2.4, mat('#9aa3ab'), k, 0, .05, 0);
    mesh(new THREE.CylinderGeometry(.6, .7, .2, 20), mat(['#c0392b', '#2e86de', '#e0a030'][n - 7]), k, -.5, .1, .3); // coussin
    const gate = new THREE.Group(); gate.position.set(1.3, 0, -1.15); k.add(gate);
    for (let i = 0; i < 10; i++) mesh(barGeo, bars, gate, 0, 1.3, .12 + i * .23);
    box(.08, .08, 2.3, bars, gate, 0, 2.55, 1.15); box(.08, .08, 2.3, bars, gate, 0, .1, 1.15);
    const num = card(k, .5, .5, 256, numTex(n), 1.36, 2.95, 0, { depth: .03 }); num.set(); num.mesh.rotation.y = Math.PI / 2;
    kennels[n] = { k, gate };
  }
  const sign = card(kennels[9].k, .9, .5, 400, (g, W2, H2) => { g.fillStyle = '#fff6e6'; roundRect(g, 4, 4, W2 - 8, H2 - 8, 18); g.fill(); g.lineWidth = 10; g.strokeStyle = '#c0392b'; roundRect(g, 12, 12, W2 - 24, H2 - 24, 14); g.stroke(); g.fillStyle = '#c0392b'; font(g, 900, 72); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('RÉSERVÉ', W2 / 2, H2 / 2 + 4); }, 1.42, 2.3, .1, { depth: .02 });
  sign.set(); sign.mesh.rotation.y = Math.PI / 2;
  // porte d'entrée sur le mur droit, face à la case 9
  const door = new THREE.Group(); door.position.set(5.85, 0, -7.2); ref.add(door);
  box(.2, 3, 1.8, mat('#f2efe8'), door, 0, 1.5, 0);
  const dpanel = box(.12, 2.7, 1.4, mat('#3d6e8c'), door, -.1, 1.35, 0);
  box(.14, .9, .9, mat('#ffe7b0', { emissive: '#ffd98a', emissiveIntensity: .8 }), door, -.12, 2.0, 0);
  box(.5, .1, 2.6, mat('#5a7a62'), ref, 0, 4.0, -1); // poutres
  const poster = card(ref, 1.4, 1.0, 400, (g, W2, H2) => { g.fillStyle = '#ffd36b'; g.fillRect(0, 0, W2, H2); g.fillStyle = '#2f5f3f'; font(g, 900, 52); g.textAlign = 'center'; g.fillText('ADOPTEZ', W2 / 2, 100); g.fillText('UN AMI', W2 / 2, 170); font(g, 800, 34); g.fillText('♥ 4 PATTES ♥', W2 / 2, 240); }, 5.85, 2.6, -3.2, { depth: .02 });
  poster.set(); poster.mesh.rotation.y = -Math.PI / 2;

  // ---------- EXTÉRIEUR (x=100) ----------
  const ext = new THREE.Group(); ext.position.set(100, 0, 0); S.add(ext);
  groundPlane(ext, '#8fae6a');
  const road = mesh(new THREE.PlaneGeometry(120, 6), mat('#4a4e56', { roughness: .9 }), ext, 0, .01, 8); road.rotation.x = -Math.PI / 2;
  box(120, .12, .3, mat('#cfd3d8'), ext, 0, .06, 4.9);
  const bld = house(ext, 0, 0, { w: 10, h: 4.5, color: '#e7dcc4', roof: '#3d6e4a', door: '#3d6e8c' });
  const rsign = card(ext, 5, 1.1, 800, (g, W2, H2) => { g.fillStyle = '#2f5f3f'; roundRect(g, 4, 4, W2 - 8, H2 - 8, 26); g.fill(); g.lineWidth = 8; g.strokeStyle = '#ffd36b'; roundRect(g, 14, 14, W2 - 28, H2 - 28, 20); g.stroke(); g.fillStyle = '#fff6e6'; font(g, 900, 70); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('REFUGE DES 4 PATTES', W2 / 2, H2 / 2 + 4); }, 0, 4.0, .15, { depth: .1 });
  rsign.set();
  for (const [x, z] of [[-8, -1], [8, -2], [-12, 3], [12, 2], [-16, -6], [15, -7]]) tree(ext, x, z, { kind: 'round', s: 1.1 });
  const fence = mat('#f4f1ea'); for (let i = 0; i < 12; i++) box(.12, .9, .12, fence, ext, -11 + i * 1.0, .45, 4); box(12, .1, .08, fence, ext, -5.5, .75, 4);
  const lamp = lampPost(ext, 6, 4.4);
  const sun = sunDisc(ext, 10, 9, -60, '#ffe7a8', 3.5);
  const theCar = car(ext, 0, 8, '#2e86de', Math.PI / 2);
  const keys = new THREE.Group(); mesh(new THREE.TorusGeometry(.08, .025, 8, 16), mat('#e0b64a', { metalness: .8, roughness: .25 }), keys, 0, 0, 0); box(.2, .05, .03, mat('#e0b64a', { metalness: .8, roughness: .25 }), keys, .14, -.02, 0);

  // ---------- PERSONNAGES ----------
  const biscuit = makeDog({ color: '#b89a74', light: '#eadfc8', dark: '#7a6048', collar: '#c0392b' }); w.chars.push(biscuit); S.add(biscuit.g);
  const dog2 = makeDog({ color: '#3a3a3a', light: '#eeeeee', dark: '#222' }); w.chars.push(dog2); S.add(dog2.g); dog2.g.scale.setScalar(.85);
  const dog3 = makeDog({ color: '#e0a060', light: '#fff2dc', dark: '#a86a30' }); w.chars.push(dog3); S.add(dog3.g); dog3.g.scale.setScalar(.75);
  const keeper = w.add(makeChar({ skin: '#c98e62', shirt: '#3d7a4f', pants: '#4a3a2a', hair: 'cap', hairColor: '#2f5f3f', vest: '#2f5f3f', face: { mustache: '#3a2a1a', brow: '#2a1a10' } }));
  const mom = w.add(makeChar({ skin: '#f0c49a', shirt: '#8e5aa8', pants: '#2c3e50', hair: 'long', hairColor: '#3a2414', face: { blush: true } }));
  const kid = w.add(makeChar({ skin: '#f0c49a', shirt: '#ffcc33', pants: '#2c3e50', hair: 'short', hairColor: '#6a3a1a', face: { blush: true } })); kid.g.scale.setScalar(.62);
  const boy = w.add(makeChar({ skin: '#e6b08a', shirt: '#4a90d9', pants: '#3b3f4f', hair: 'messy', hairColor: '#3a2414', face: { blush: true } })); boy.g.scale.setScalar(.6);
  const man = w.add(makeChar({ skin: '#e6b08a', shirt: '#4a90d9', pants: '#3b3f4f', hair: 'messy', hairColor: '#3a2414', coat: '#2f4a6a', face: { brow: '#2a1a10' } }));

  let sepia = false;
  w.onMood((m) => { ref.userData.setView(m); lamp.userData.set(m === 'night' || m === 'rain' ? 1 : 0); sun.visible = m === 'dawn' || m === 'day'; });
  const resetProps = () => { Object.values(kennels).forEach(k => k.gate.rotation.y = 0); sign.mesh.visible = true; ref.userData.setLights(1); theCar.position.set(0, 0, 8); keys.removeFromParent(); sepia = false; };
  const P = (c, x, z, ry, y) => w.place(c, x, z, ry, y);
  const R0 = (x, y, z) => v3(x, y, z), X = (x, y, z) => v3(100 + x, y, z);
  const inKennel = (t, face = 'sad') => { P(biscuit, -3.4, -7.2, Math.PI / 2); biscuit.setFace(face); biscuit.head.rotation.z = Math.sin(t * .8) * .05; };
  const others = (t) => { P(dog2, -3.6, -2.4, Math.PI / 2 - .3); dog2.setFace('happy'); dog2.wag(t); P(dog3, -3.8, -4.8, Math.PI / 2 + .4); dog3.setFace('neutral'); dog3.wag(t, .5); };
  const lieDown = (d) => { d.g.position.y = -.38; d.legs[0].rotation.x = d.legs[1].rotation.x = -1.45; d.legs[2].rotation.x = d.legs[3].rotation.x = 1.45; };
  const kneel = (c) => { c.g.position.y = -.55 * c.g.scale.y; c.legL.rotation.x = c.legR.rotation.x = -1.45; };

  const shots = {
    title(u, d, p, t) {
      w.mood('night'); ref.userData.setLights(.5); others(t); inKennel(t);
      w.look(lerpV([3.5, 2.4, 1.5], [1.5, 2.0, -3.0], ease(p)), R0(-2.6, 1.3, -7.2));
    },
    kennel_sign(u, d, p, t) {
      w.mood('day'); inKennel(t, 'neutral');
      w.look(lerpV([.4, 2.1, -6.4], [-.6, 1.9, -6.9], ease(p)), R0(-2.2, 1.85, -7.2));
    },
    dog_intro(u, d, p, t) {
      w.mood('day'); inKennel(t, 'neutral'); biscuit.wag(t, .3);
      w.look(lerpV([.6, 1.7, -6.2], [.1, 1.6, -6.6], ease(p)), R0(-2.8, 1.4, -7.2));
    },
    dog_watch(u, d, p, t) {
      w.mood('day'); inKennel(t, 'sad');
      w.look(lerpV([-4.7, 2.7, -8.0], [-4.4, 2.6, -7.8], ease(p)), R0(5.8, 1.2, -7.2));
    },
    families(u, d, p, t) {
      w.mood('day'); inKennel(t, 'sad');
      P(mom, -.6, -6.6, -Math.PI / 2 - .3); mom.setFace('neutral'); mom.idle(t);
      P(kid, -1.0, -7.9, -Math.PI / 2 + .2); kid.setFace('wonder'); kid.armR.rotation.x = -lerp(0, 1.6, ease(clamp(p * 2)));
      w.look(lerpV([-1.9, 1.7, -3.4], [-1.8, 1.65, -3.9], ease(p)), R0(-.7, 1.5, -7.4));
    },
    keeper(u, d, p, t) {
      w.mood('day'); inKennel(t, 'sad');
      P(keeper, -.9, -6.3, .6); keeper.setFace(p < .5 ? 'neutral' : 'smile'); keeper.idle(t);
      keeper.armL.rotation.x = -.5; keeper.head.rotation.y = lerp(-.4, .1, ease(p));
      w.look(lerpV([1.9, 2.7, -3.6], [1.6, 2.6, -4.0], ease(p)), R0(-.9, 2.3, -6.3));
    },
    flashback(u, d, p, t) {
      w.mood('grey'); sepia = true;
      P(boy, 101.6, 1.6, -.4); boy.setFace('cry'); boy.armL.rotation.x = boy.armR.rotation.x = -1.0; boy.armR.rotation.z = -.4;
      P(biscuit, 100.4, 1.0, Math.PI / 2 + .3); biscuit.setFace('sad');
      P(keeper, 103.0, .6, -.5); keeper.setFace('sad');
      w.look(lerpV([102.8, 2.0, 6.2], [102.5, 1.9, 5.5], ease(p)), X(1.3, 1.1, 1.4));
    },
    boy_promise(u, d, p, t) {
      w.mood('grey'); sepia = true;
      P(boy, 101.6, 1.6, -.4); boy.setFace('cry'); boy.armL.rotation.x = boy.armR.rotation.x = -1.0; boy.armR.rotation.z = -.4; boy.head.rotation.x = Math.sin(t * 9) * .03;
      P(biscuit, 100.4, 1.0, Math.PI / 2 + .3); biscuit.setFace('sad');
      w.look(lerpV([101.0, 1.55, 3.3], [101.1, 1.52, 3.0], ease(p)), X(1.6, 1.45, 1.6));
    },
    nobody(u, d, p, t) {
      w.mood('day'); inKennel(t, 'sad'); others(t);
      P(keeper, 1.0, -5.4, -Math.PI / 2 - .4); keeper.setFace('sad'); keeper.head.rotation.y = Math.sin(t * 5) * .3;
      P(mom, 3.5, -3.0, .9); P(kid, 4.0, -2.5, .9); kid.walk(t); mom.walk(t);
      w.look(lerpV([4.5, 3.6, 1.6], [4.0, 3.4, 1.0], p), R0(-1, 1.2, -6));
    },
    dog_old(u, d, p, t) {
      w.mood(p < .5 ? 'day' : 'grey'); inKennel(t, 'sad'); lieDown(biscuit);
      biscuit.g.position.x = -3.6 + Math.sin(t * 38) * .008; biscuit.head.rotation.x = .25;
      w.look(lerpV([-1.2, 1.5, -5.4], [-1.5, 1.3, -5.8], ease(p)), R0(-3.2, .6, -7.2));
    },
    rain_sign(u, d, p, t) {
      w.mood('rain'); ref.userData.setLights(.35); w.weather('rain', t, v3(2.5, 0, -16));
      inKennel(t, 'sad'); lieDown(biscuit);
      P(keeper, -1.3, -6.5, -Math.PI / 2); keeper.setFace('sad');
      keeper.armR.rotation.x = -lerp(.3, 1.6, ease(clamp(p * 1.4)));
      w.look(lerpV([-4.3, 2.3, -6.0], [-4.1, 2.2, -6.2], ease(p)), R0(-1.3, 2.2, -6.6));
    },
    dog_bark(u, d, p, t) {
      w.mood('rain'); ref.userData.setLights(.35); w.weather('rain', t, v3(2.5, 0, -16));
      inKennel(t, 'neutral');
      const bark = Math.max(0, Math.sin(t * 11)) * (p < .55 ? 1 : 0);
      biscuit.head.rotation.x = -.35 - bark * .25; biscuit.earL.rotation.z = .25 + bark * .5; biscuit.earR.rotation.z = -.25 - bark * .5;
      P(keeper, -.8, -5.4, -Math.PI / 2 - .6); keeper.setFace('wonder'); keeper.armR.rotation.x = -.6;
      w.look(lerpV([-.8, 1.5, -7.9], [-1.1, 1.45, -7.7], ease(p)), R0(-2.9, 1.5, -7.2));
    },
    car_arrive(u, d, p, t) {
      w.mood('dawn');
      theCar.position.set(lerp(-22, 1.5, ease(clamp(p / .85))), 0, 8);
      w.look(lerpV([108, 2.2, 16], [106.5, 2.0, 15], p), X(0, 1.4, 7));
    },
    young_man(u, d, p, t) {
      w.mood('dawn'); theCar.position.set(1.5, 0, 8);
      P(man, 101.2, 5.9, Math.PI - .3); man.setFace('smile'); man.idle(t);
      man.armR.rotation.x = -1.3; man.armR.add(keys); keys.position.set(0, -1.05, .3); keys.rotation.set(0, Math.sin(t * 8) * .5, Math.sin(t * 6) * .3);
      w.look(lerpV([103.2, 1.4, 1.8], [102.8, 1.5, 2.4], ease(p)), X(1.2, 2.0, 5.9));
    },
    man_says(u, d, p, t) {
      w.mood('day');
      P(man, 2.5, -7.2, -Math.PI / 2); man.setFace(p < .6 ? 'smile' : 'smileClosed'); man.idle(t, 2);
      w.look(lerpV([-.2, 2.6, -6.8], [.1, 2.55, -7.0], ease(p)), R0(2.5, 2.5, -7.2));
    },
    dog_slow(u, d, p, t) {
      w.mood('day'); kennels[9].gate.rotation.y = 1.3; sign.mesh.visible = false;
      P(biscuit, lerp(-3.2, -.2, p), -7.2, Math.PI / 2); biscuit.walk(t, 3.5); biscuit.setFace('neutral'); biscuit.wag(t, .3); biscuit.head.rotation.x = .1;
      P(man, 1.3, -7.2, -Math.PI / 2); kneel(man); man.setFace('smile'); man.armL.rotation.x = man.armR.rotation.x = -1.0;
      w.look(lerpV([.6, 1.7, -3.0], [.5, 1.6, -3.4], p), R0(-.2, 1.0, -7.2));
    },
    dog_head(u, d, p, t) {
      w.mood('day'); kennels[9].gate.rotation.y = 1.3; sign.mesh.visible = false;
      P(biscuit, .15, -7.2, Math.PI / 2); biscuit.setFace('happy'); biscuit.head.rotation.x = .25; biscuit.head.rotation.z = .2; biscuit.wag(t, .2);
      P(man, 1.3, -7.2, -Math.PI / 2); kneel(man); man.setFace('smileClosed'); man.head.rotation.x = .3;
      man.armL.rotation.x = man.armR.rotation.x = -1.3; man.armL.rotation.z = .5; man.armR.rotation.z = -.5;
      w.look(lerpV([-.9, 1.8, -5.0], [-.7, 1.7, -5.4], ease(p)), R0(.7, 1.4, -7.2));
    },
    tail_wag(u, d, p, t) {
      w.mood('dawn'); kennels[9].gate.rotation.y = 1.3; sign.mesh.visible = false; ref.userData.setLights(1.2);
      P(biscuit, .15, -7.2, Math.PI / 2); biscuit.setFace('happy'); biscuit.head.rotation.x = .25; biscuit.wag(t, 1.4);
      P(man, 1.3, -7.2, -Math.PI / 2); kneel(man); man.setFace('smileClosed'); man.head.rotation.x = .3;
      man.armL.rotation.x = man.armR.rotation.x = -1.3; man.armL.rotation.z = .5; man.armR.rotation.z = -.5;
      const k = ease(clamp(p * 1.2));
      w.look(lerpV([-1.0, 1.1, -8.6], [-1.5, 3.6, -1.2], k), lerpV([-.55, 1.0, -7.2], [.3, 1.0, -7.2], k));
    },
  };

  function render(name, u, d, p, t) {
    w.resetChars(); resetProps(); w.weather(null);
    (shots[name] || shots.title)(u, d, p, t);
    w.render();
  }
  function overlay(name, u, d, t) {
    const c = ui.ctx;
    if (sepia) { c.save(); c.globalCompositeOperation = 'color'; c.fillStyle = 'rgba(150,110,60,.75)'; c.fillRect(0, 0, W, H); c.restore(); }
    if (name === 'title') { ui.badge('ÉPISODE 3', u - .1, { size: 46, y: H * .12 }); ui.badge('LE CHIEN DE LA CASE VIDE', u - .4, { size: 36, y: H * .2, bg: '#141a33', border: '#ffd36b', color: '#ffd36b', rot: .02 }); }
    if (name === 'flashback') ui.badge('3 ANS PLUS TÔT', u - .2, { size: 44, bg: '#3a2a14', border: '#ffd08a', color: '#ffd08a', y: H * .12 });
    if (name === 'dog_bark') ui.badge('WOUF !', u - .15, { size: 64, bg: '#3b0f12', border: '#ff7b7b', color: '#ff9b9b', y: H * .14, rot: -.08 });
    if (name === 'kennel_sign') ui.badge('CASE N°9', u - .3, { size: 46, y: H * .12 });
  }
  return { render, overlay };
}
