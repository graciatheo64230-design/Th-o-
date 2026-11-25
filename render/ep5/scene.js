// Épisode 5 : « Le parapluie jaune »
import * as THREE from 'three';
import { W, H, clamp, ease, lerp, lerpV, v3, mat, mesh, box, rbox, roundRect, makeChar } from '../lib.js';
import { createWorld, tex, card, font, room, bed, tree, lampPost, busStop, umbrella, house, groundPlane, car } from '../world.js';

export function create(renderer, ui) {
  const w = createWorld(renderer), S = w.scene;

  // ---------- RUE + ABRIBUS (x=0) ----------
  const st = new THREE.Group(); S.add(st);
  groundPlane(st, '#7d8a72');
  const sw = mesh(new THREE.PlaneGeometry(120, 4), mat('#b9b4aa', { roughness: .35, metalness: .1 }), st, 0, .02, 1.5); sw.rotation.x = -Math.PI / 2;
  const rd = mesh(new THREE.PlaneGeometry(120, 6), mat('#3d4149', { roughness: .25, metalness: .2 }), st, 0, .015, 6.5); rd.rotation.x = -Math.PI / 2;
  for (let i = 0; i < 8; i++) house(st, -28 + i * 8, -2.5, { w: 6.5, h: 4 + (i % 3) * .8, color: ['#e9d8bf', '#cfdbe6', '#f0cdb8', '#d8e4c8'][i % 4], roof: ['#7a3a2a', '#3d5a80', '#5a4a6a'][i % 3], lit: i % 2 === 1 });
  const stop = busStop(st, 0, 1.2);
  for (const x of [-6, 7]) lampPost(st, x, 3.3);
  // le parapluie jaune accroché au poteau
  const yel = umbrella('#ffd21f'); yel.position.set(-1.35, .55, 1.75); st.add(yel);
  const fold = (u, closed) => { const c = u.userData.canopy; c.scale.set(closed ? .22 : 1, closed ? 2.4 : 1, closed ? .22 : 1); c.position.y = closed ? 1.15 : 1.6; };
  fold(yel, true);
  const tag = card(st, .42, .3, 300, (g, W2, H2, which) => {
    g.fillStyle = '#fff8e1'; roundRect(g, 2, 2, W2 - 4, H2 - 4, 16); g.fill(); g.strokeStyle = '#c9a227'; g.lineWidth = 6; g.stroke();
    g.fillStyle = '#2b2350'; g.textAlign = 'center'; g.textBaseline = 'middle'; font(g, 700, which === 'paul' ? 40 : 44, 'Caveat');
    const L = which === 'paul' ? ['Pour Monsieur Paul.', 'À notre tour. ♥'] : ['Prends-le.', 'Rends-le quand tu peux.'];
    L.forEach((l, i) => { let z = 44; font(g, 700, z, 'Caveat'); while (g.measureText(l).width > W2 - 30) { z -= 2; font(g, 700, z, 'Caveat'); } g.fillText(l, W2 / 2, H2 / 2 + (i - .5) * 56); });
  }, -1.35, 1.15, 1.86, { depth: .01 });
  // cinquante parapluies
  const fifty = new THREE.Group(); st.add(fifty);
  const cols = ['#ffd21f', '#ffcf00', '#ffe14d', '#f7c600'];
  for (let i = 0; i < 50; i++) {
    const u = umbrella(cols[i % 4]); const row = Math.floor(i / 10), k = i % 10;
    u.position.set(-6 + k * 1.3 + (row % 2) * .6, 0, 2.3 + row * 1.05); u.rotation.set((w.R() - .5) * .25, w.R() * 6, (w.R() - .5) * .25); u.scale.setScalar(.75);
    fifty.add(u);
  }
  // ---------- CHAMBRE DE PAUL (x=40) ----------
  const bd = room(S, { x: 40, w: 9, d: 8, wall: tex.stripes('#e6dccb', '#d8ccb6'), window: { x: 1.6, y: 2.4, w: 2.2, h: 1.6 }, lights: [[-1, -4]], lightI: 7 });
  bed(bd, -1.5, -4.6, { cover: '#8a6a5a' });
  const blanket = rbox(2.1, .35, 2.4, .1, mat('#8a6a5a'), bd, -1.5, 1.55, -3.6);
  box(1, 1, .8, mat('#7a4a2a'), bd, -3.4, .5, -5.7);
  mesh(new THREE.CylinderGeometry(.08, .1, .3, 12), mat('#ffffff'), bd, -3.5, 1.15, -5.6); // verre
  const yelBed = umbrella('#ffd21f'); fold(yelBed, true); yelBed.position.set(-2.9, 0, -5.2); yelBed.rotation.z = .25; bd.add(yelBed);
  // ---------- TERMINUS (x=100) ----------
  const ter = new THREE.Group(); ter.position.set(100, 0, 0); S.add(ter);
  groundPlane(ter, '#6f7d66');
  const tr = mesh(new THREE.PlaneGeometry(60, 5), mat('#3d4149', { roughness: .25, metalness: .2 }), ter, 0, .015, 5); tr.rotation.x = -Math.PI / 2;
  house(ter, 0, 0, { w: 5, h: 3.4, color: '#d9cbb3', roof: '#5a3a2a', lit: true });
  for (const [x, z] of [[-5, -2], [5, -3], [-8, 2], [8, 1]]) tree(ter, x, z, { kind: 'round', leaf: '#3f6a3a' });
  const term = card(ter, 1.2, .5, 400, (g, W2, H2) => { g.fillStyle = '#1d6fd8'; roundRect(g, 2, 2, W2 - 4, H2 - 4, 20); g.fill(); g.fillStyle = '#fff'; font(g, 900, 72); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('TERMINUS', W2 / 2, H2 / 2 + 4); }, 3.4, 2.6, 2.6); term.set();
  box(.08, 2.6, .08, mat('#2b3a4a'), ter, 3.4, 1.3, 2.55);

  // ---------- PERSONNAGES ----------
  const paulStyle = { skin: '#f0c49a', hair: 'bald', hairColor: '#e8e8e8', face: { mustache: '#efefef', wrinkles: true, brow: '#d0d0d0' } };
  const paul = w.add(makeChar({ ...paulStyle, shirt: '#9fb7d8', pants: '#9fb7d8' }));
  const paulCoat = w.add(makeChar({ ...paulStyle, shirt: '#c9b79c', pants: '#4a4a5a', coat: '#5a6b4a', scarf: '#d4a020' }));
  const maya = w.add(makeChar({ skin: '#a56b46', shirt: '#e84f8a', pants: '#3d3a6b', coat: '#3fa9f5', hair: 'ponytail', hairColor: '#1a1a1a', face: { blush: true, brow: '#1a1a1a' } })); maya.g.scale.setScalar(.64);
  const p1 = w.add(makeChar({ skin: '#e9b48a', shirt: '#7f8c8d', pants: '#2c3e50', coat: '#34495e', hair: 'short', hairColor: '#3a2a1a', face: {} }));
  const p2 = w.add(makeChar({ skin: '#8a5536', shirt: '#c0392b', pants: '#2c3e50', hair: 'long', hairColor: '#1e1e1e', face: { blush: true } }));
  const p3 = w.add(makeChar({ skin: '#f3cba6', shirt: '#27ae60', pants: '#4a4a5a', hair: 'cap', hairColor: '#c0392b', face: {} })); p3.g.scale.setScalar(.66);
  const neigh = w.add(makeChar({ skin: '#f3cba6', shirt: '#b0709a', pants: '#4a3a5a', hair: 'bun', hairColor: '#cfcfcf', face: { glasses: true, wrinkles: true, brow: '#aaa' } }));
  const lens = new THREE.Group(); mesh(new THREE.TorusGeometry(.16, .03, 8, 20), mat('#333'), lens, 0, .32, 0); mesh(new THREE.CircleGeometry(.15, 20), new THREE.MeshStandardMaterial({ color: '#cfe8ff', transparent: true, opacity: .4 }), lens, 0, .32, 0); box(.06, .3, .06, mat('#5a3a24'), lens, 0, 0, 0);
  const handU = umbrella('#ffd21f');

  w.onMood((m) => { bd.userData.setView(m); });
  const P = (c, x, z, ry, y) => w.place(c, x, z, ry, y);
  const holdUmb = (c, u = handU, open = true) => { c.armR.rotation.x = -1.6; c.armR.add(u); u.position.set(0, -.95, .1); u.rotation.set(1.6, 0, 0); fold(u, !open); };
  const lie = (c, face) => { P(c, 38.5, -3.45, 0, 1.38); c.g.rotation.x = -Math.PI / 2; c.setFace(face); blanket.visible = true; };
  const resetProps = () => { yel.visible = true; fold(yel, true); tag.set('prends'); fifty.visible = false; handU.removeFromParent(); lens.removeFromParent(); blanket.visible = false; };
  const rainy = (t, k = 1) => { w.mood('rain'); w.weather('rain', t, w.cam.position, k); };

  const shots = {
    title(u, d, p, t) { rainy(t); w.shoot(v3(0, 1.6, 1.2), lerp(11, 9.5, p), .35, .14); },
    umbrella_stop(u, d, p, t) { rainy(t); w.shoot(v3(-1.35, 1.3, 1.8), lerp(3.2, 2.2, ease(p)), .45, .08); },
    tag_close(u, d, p, t) { rainy(t, .6); w.shoot(v3(-1.35, 1.02, 1.86), lerp(1.3, 1.0, ease(p)), .08, .02); },
    people_wait(u, d, p, t) {
      rainy(t); P(p1, .4, .9, -.5); P(p2, 1.3, .8, -.8);
      p1.setFace('wonder'); p2.setFace('wonder'); p1.head.rotation.y = -.3; p2.armL.rotation.x = -.8;
      w.shoot(v3(.2, 2.0, 1.2), lerp(5.4, 4.8, p), -.35, .12);
    },
    umbrella_travel(u, d, p, t) {
      rainy(t); const i = Math.min(2, Math.floor(p * 3)), c = [p1, p2, p3][i], q = (p * 3) % 1;
      P(c, lerp(-5, 5, q), 2.6, Math.PI / 2); c.walk(t, 7, .4); c.setFace('smile'); holdUmb(c);
      w.shoot(v3(c.g.position.x, 2.2, 2.6), 6, .25, .12);
    },
    stop_empty(u, d, p, t) { w.mood('grey'); w.weather('snow', t, w.cam.position); yel.visible = false; w.shoot(v3(-1.35, 1.2, 1.8), lerp(2.4, 3.4, ease(p)), .4, .1); },
    maya_intro(u, d, p, t) {
      w.mood('grey'); w.weather('snow', t, w.cam.position, .5); yel.visible = false;
      P(maya, -1.2, 2.4, .3); maya.setFace(p < .5 ? 'neutral' : 'angry'); maya.armR.rotation.x = -1.5; maya.armR.add(lens); lens.position.set(0, -1.0, .3); lens.rotation.set(1.5, 0, 0);
      w.shoot(w.head(maya, -.2), lerp(2.6, 2.0, ease(p)), .3, .08);
    },
    maya_search(u, d, p, t) {
      w.mood('grey'); w.weather('snow', t, w.cam.position, .5);
      if (p < .55) { P(maya, lerp(-10, -14.5, p / .55), 2.2, -Math.PI / 2); maya.walk(t, 8, .4); maya.setFace('neutral'); w.shoot(v3(maya.g.position.x, 1.4, 2.2), 4.5, -.4, .1); }
      else { P(maya, -16, 1.4, Math.PI / 2 - .3); maya.setFace('wonder'); P(neigh, -14.8, .5, -Math.PI / 2 - .3); neigh.setFace('neutral'); neigh.armL.rotation.x = -1.2; neigh.armL.rotation.z = -.5; w.shoot(v3(-15.4, 1.8, 1.0), 4.4, .9, .1); }
    },
    small_house(u, d, p, t) { rainy(t); w.shoot(v3(100, 2.2, 0), lerp(12, 8.5, ease(p)), .2, .1); },
    paul_bed(u, d, p, t) { w.mood('rain'); bd.userData.setLights(.6); lie(paul, 'sad'); w.shoot(v3(38.5, 1.6, -5.9), lerp(2.6, 2.1, ease(p)), .1, 1.0); },
    umbrella_bed(u, d, p, t) { w.mood('rain'); lie(paul, 'sleep'); w.shoot(v3(37.1, 1.0, -5.2), lerp(1.8, 1.5, ease(p)), -.8, .15); },
    paul_talk(u, d, p, t) {
      w.mood("rain"); bd.userData.setLights(1.4); blanket.visible = true;
      P(paul, 38.5, -4.4, 0, .98); paul.legL.rotation.x = paul.legR.rotation.x = -1.5; paul.setFace(p < .5 ? 'sad' : 'smile'); paul.armL.rotation.x = -.5;
      P(maya, 40.4, -3.2, -Math.PI / 2 - .4); maya.setFace('sad');
      w.shoot(w.head(paul, -.1), lerp(3.4, 2.9, ease(p)), .2, .12);
    },
    rain_next(u, d, p, t) { rainy(t, 1.3); w.shoot(v3(0, 1.0, 4), lerp(3, 2.4, p), -.2, .25); },
    stop_reveal(u, d, p, t) { rainy(t); fifty.visible = true; tag.set('paul'); w.shoot(v3(0, 1.4, 2.5), lerp(4, 7.5, ease(p)), lerp(-.6, .1, ease(p)), lerp(.05, .2, p)); },
    fifty(u, d, p, t) { rainy(t); fifty.visible = true; tag.set('paul'); w.shoot(v3(0, .8, 3), lerp(9, 11, p), .15, .55); },
    final_tag(u, d, p, t) {
      w.mood('grey'); w.weather('rain', t, w.cam.position, .4); fifty.visible = true; tag.set('paul');
      if (p < .45) w.shoot(v3(-1.35, 1.15, 1.86), lerp(1.0, 1.15, p), .08, .02);
      else { P(paulCoat, 1.6, 4.0, Math.PI + .3); paulCoat.setFace('smileClosed'); paulCoat.idle(t, 2); P(maya, 2.6, 4.2, Math.PI - .3); maya.setFace('smile'); holdUmb(maya); w.shoot(v3(2, 2.2, 3.6), lerp(4.2, 5.5, ease((p - .45) / .55)), Math.PI + .3, .15); }
    },
  };

  function render(name, u, d, p, t) { w.resetChars(); resetProps(); w.weather(null); (shots[name] || shots.title)(u, d, p, t); w.render(); }
  function overlay(name, u, d, t) {
    if (name === 'umbrella_travel') ui.badge('10 ANS', u - .2, { size: 54, y: H * .12 });
    if (name === 'stop_empty') ui.badge('DISPARU', u - .3, { size: 52, bg: '#3b0f12', border: '#ff7b7b', color: '#ff9b9b', y: H * .12 });
    if (name === 'fifty') ui.badge('50 PARAPLUIES', u - .1, { size: 50, bg: '#3a2c00', border: '#ffd21f', color: '#ffe14d', y: H * .12 });
    if (name === 'small_house') ui.badge('TERMINUS', u - .3, { size: 48, bg: '#0e2a4a', border: '#6fb4ff', color: '#a8d4ff', y: H * .12 });
  }
  return { render, overlay };
}
