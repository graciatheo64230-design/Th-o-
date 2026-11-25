// Épisode 9 : « Le chat du cinquième étage »
import * as THREE from 'three';
import { W, H, clamp, ease, lerp, lerpV, v3, mat, mesh, box, rbox, roundRect, makeChar, makeCat } from '../lib.js';
import { createWorld, tex, card, font, room, bed, table, chair, tree, lampPost, car, groundPlane, sunDisc } from '../world.js';

export function create(renderer, ui) {
  const w = createWorld(renderer), S = w.scene;

  // ---------- RUE + IMMEUBLE (x=0) ----------
  const st = new THREE.Group(); S.add(st);
  groundPlane(st, '#8a9a7a');
  const sw = mesh(new THREE.PlaneGeometry(120, 4), mat('#cfc6b8'), st, 0, .02, 2); sw.rotation.x = -Math.PI / 2;
  const rd = mesh(new THREE.PlaneGeometry(120, 6), mat('#4a4e56'), st, 0, .015, 7); rd.rotation.x = -Math.PI / 2;
  const fac = new THREE.MeshStandardMaterial({ map: tex.stripes('#e9dcc6', '#e2d3ba', [4, 8]), roughness: .95 });
  box(10, 19, 6, fac, st, 0, 9.5, -3);
  box(10.4, .4, 6.4, mat('#5a4a44'), st, 0, 19.2, -3);
  for (let f = 0; f < 6; f++) box(10.2, .15, .3, mat('#d0c0a6'), st, 0, f * 3.1 + .2, .1);
  const winOn = mat('#ffd98a', { emissive: '#ffb050', emissiveIntensity: .9 }), winOff = mat('#3a4560');
  const windows = {};
  for (let f = 0; f < 6; f++) for (let c = 0; c < 4; c++) {
    if (f === 0 && c === 1) continue; // porte
    const x = -3.6 + c * 2.4, y = f * 3.1 + 1.7;
    const m = box(1.3, 1.6, .1, (f * 7 + c * 3) % 3 === 0 ? winOn : winOff, st, x, y, .05);
    box(1.6, .14, .5, mat('#f4f1ea'), st, x, y - .88, .25);
    windows[f + '_' + c] = m;
  }
  windows['5_2'].material = winOn; windows['1_3'].material = winOn;
  box(1.4, 2.4, .12, mat('#5a3a6a'), st, -1.2, 1.2, .06);
  const cushion1 = rbox(.7, .1, .35, .04, mat('#c0392b'), st, 1.2, 15.71, .35), cushion2 = rbox(.7, .1, .35, .04, mat('#2e86de'), st, 3.6, 3.31, .35);
  for (const x of [-8, 8]) tree(st, x, 1.4, { kind: 'round', s: 1.1 });
  lampPost(st, 5.5, 4.2);
  const sun = sunDisc(st, -25, 10, -70, '#ffe0a0', 4);
  const truck = new THREE.Group(); st.add(truck); truck.position.set(4, 0, 7);
  const tb = car(truck, 0, 0, '#d0201a', Math.PI / 2); tb.scale.set(1.25, 1.35, 1.6);
  box(5, .15, .4, mat('#c9ced4', { metalness: .6 }), truck, -.5, 2.6, 0);
  const siren = mesh(new THREE.BoxGeometry(.6, .2, .3), mat('#2e6bff', { emissive: '#2e6bff', emissiveIntensity: 2 }), truck, 1.2, 2.35, 0, false);
  // ---------- CAGE D'ESCALIER (x=40) ----------
  const sc = new THREE.Group(); sc.position.set(40, 0, 0); S.add(sc);
  const wallM = new THREE.MeshStandardMaterial({ map: tex.stripes('#e8e0d0', '#ddd2bd', [3, 3]), roughness: .95 });
  for (let i = 0; i < 16; i++) box(2.4, .3 * (i + 1), .55, mat(i % 2 ? '#8a5a36' : '#7a4a2a'), sc, 0, .15 * (i + 1), -i * .55);
  box(.2, 8, 10, wallM, sc, -1.3, 4, -4); box(.2, 8, 10, wallM, sc, 1.3, 4, -4);
  for (let i = 0; i < 16; i += 2) box(.06, .9, .06, mat('#333'), sc, 1.1, .3 * (i + 1) + .45, -i * .55);
  const rail = box(.08, .08, 9, mat('#5a3a24'), sc, 1.1, 3.3, -4.3); rail.rotation.x = Math.atan2(.3, .55);
  box(2.4, 4.8, 2.4, mat('#7a4a2a'), sc, 0, 2.4, -10); // palier
  const aptDoor = box(1.3, 2.4, .12, mat('#2f5f3f'), sc, 0, 6.0, -8.8);
  box(.1, .1, .1, mat('#e0b64a', { metalness: .7 }), sc, .45, 6.0, -8.72);
  const num = card(sc, .4, .25, 200, (g, W2, H2) => { g.fillStyle = '#e0b64a'; g.fillRect(0, 0, W2, H2); g.fillStyle = '#222'; font(g, 900, 70); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('5B', W2 / 2, H2 / 2 + 3); }, 0, 7.5, -8.73, { depth: .01 }); num.set();
  const sl = new THREE.PointLight('#ffe0b0', 10, 12, 1.5); sl.position.set(0, 7.5, -6); sc.add(sl);
  const sl2 = new THREE.PointLight('#ffe0b0', 8, 10, 1.5); sl2.position.set(0, 3, -1); sc.add(sl2);
  // ---------- APPARTEMENT (x=80) ----------
  const apt = room(S, { x: 80, w: 9, d: 8, wall: tex.stripes('#f2e2ce', '#e8d2b8'), window: { x: 1.5, y: 2.5, w: 2.2, h: 1.7 }, lights: [[0, -4]], lightI: 12 });
  const tbl = table(apt, -1.2, -4.6, { w: 1.8, d: 1.2, h: 1.15, color: '#8a5432' });
  chair(apt, -2.4, -4.6, Math.PI / 2, '#a0522d'); chair(apt, 0, -4.6, -Math.PI / 2, '#a0522d');
  const cups = new THREE.Group(); apt.add(cups);
  for (const x of [-1.6, -.8]) { mesh(new THREE.CylinderGeometry(.12, .1, .2, 14), mat('#ffffff'), cups, x, 1.31, -4.6); mesh(new THREE.TorusGeometry(.06, .02, 6, 10), mat('#ffffff'), cups, x + .14, 1.31, -4.6); }
  const fallenChair = chair(apt, 1.6, -3.2, 1.2, '#a0522d'); fallenChair.rotation.z = 1.4; fallenChair.position.y = .45;
  const sill = box(2.4, .12, .6, mat('#f4f1ea'), apt, 1.5, 1.55, -7.7);
  // ---------- HÔPITAL (x=120) ----------
  const hos = room(S, { x: 120, w: 9, d: 8, floor: tex.tiles('#e8eef2', '#d5dde3'), wall: tex.stripes('#eef4f6', '#e2ecef'), window: { x: 2, y: 2.5, w: 2.2, h: 1.6 }, lights: [[0, -4]], lightI: 16, lightColor: '#f0f6ff' });
  bed(hos, -1.5, -4.6, { cover: '#cfe3f0', wood: '#c9ced4' });
  const hblanket = rbox(2.1, .35, 2.4, .1, mat('#cfe3f0'), hos, -1.5, 1.55, -3.6);
  chair(hos, 1.0, -4.0, -Math.PI / 2 - .3, '#7f8c8d');
  mesh(new THREE.SphereGeometry(.25, 12, 10), mat('#ff6b8a'), hos, -3.3, 1.35, -5.8); box(.9, 1.0, .8, mat('#c9ced4'), hos, -3.4, .5, -5.8);

  // ---------- PERSONNAGES ----------
  const cat = makeCat({ color: '#e07a2a' }); w.chars.push(cat); S.add(cat.g);
  const albert = w.add(makeChar({ skin: '#f0c49a', shirt: '#c9b79c', pants: '#4a4a5a', coat: '#7a5a3a', hair: 'cap', hairColor: '#5a4a3a', face: { mustache: '#e6e6e6', wrinkles: true, brow: '#d0d0d0' } }));
  const albertIn = w.add(makeChar({ skin: '#f0c49a', shirt: '#9ab0c8', vest: '#7a5a3a', pants: '#4a4a5a', hair: 'bald', hairColor: '#e6e6e6', face: { mustache: '#e6e6e6', wrinkles: true, brow: '#d0d0d0' } }));
  const lady = w.add(makeChar({ skin: '#f3cba6', shirt: '#3fa39a', pants: '#4a4a5a', hair: 'bun', hairColor: '#d6d6d6', face: { glasses: true, wrinkles: true, blush: true, brow: '#aaa' } }));
  const n1 = w.add(makeChar({ skin: '#e9b48a', shirt: '#8e44ad', pants: '#2c3e50', hair: 'long', hairColor: '#c97a2a', face: { blush: true } }));
  const n2 = w.add(makeChar({ skin: '#8a5536', shirt: '#16a085', pants: '#2c3e50', hair: 'short', hairColor: '#1a1a1a', face: {} }));
  const ff1 = w.add(makeChar({ skin: '#e9b48a', shirt: '#1d2a44', pants: '#1d2a44', hair: 'cap', hairColor: '#d0201a', face: { brow: '#2a1a10' } }));
  const ff2 = w.add(makeChar({ skin: '#a56b46', shirt: '#1d2a44', pants: '#1d2a44', hair: 'cap', hairColor: '#d0201a', face: { brow: '#1a1a1a' } }));

  w.onMood((m) => { apt.userData.setView(m); hos.userData.setView(m); sun.visible = m === 'dawn' || m === 'day'; });
  const P = (c, x, z, ry, y) => w.place(c, x, z, ry, y);
  const catAt = (x, y, z, ry = 0) => { P(cat, x, z, ry, y); cat.sit(); };
  const resetProps = () => { truck.visible = false; cups.visible = false; fallenChair.visible = false; hblanket.visible = false; };
  const WIN5 = v3(1.2, 16.3, .3), WIN1 = v3(3.6, 3.9, .3);
  const wave = (c, t) => { c.armR.rotation.x = -2.8; c.armR.rotation.z = .3 + Math.sin(t * 8) * .35; };

  const shots = {
    building_cat(u, d, p, t) {
      w.mood('dawn'); catAt(1.2, 15.75, .35); cat.wag(t);
      const k = ease(p); w.look(lerpV([3, 2, 14], [2.0, 15.8, 3.2], k), lerpV([1.2, 8, 0], [1.2, 16.1, .3], k));
    },
    oldman_wave(u, d, p, t) {
      w.mood('dawn'); catAt(1.2, 15.75, .35); cat.wag(t, 1.5);
      P(albert, 1.6, 3.6, Math.PI); albert.setFace('smileClosed'); wave(albert, t); albert.head.rotation.x = -.5;
      w.look(v3(3.2, 1.2, 7.2), v3(1.4, 4.5, 1));
    },
    neighbors(u, d, p, t) {
      w.mood('day'); P(n1, -3.4, 2.6, .5); P(n2, -2.4, 2.9, -.6); n1.setFace('laugh'); n2.setFace('smile'); n1.armR.rotation.x = -1.5; n1.armR.rotation.z = .5; n2.head.rotation.y = .4;
      P(albert, 1.6, 3.6, Math.PI); albert.setFace('smileClosed'); wave(albert, t); albert.head.rotation.x = -.5;
      w.shoot(v3(-1.6, 1.8, 3.0), lerp(6.5, 5.5, p), -.3, .1);
    },
    empty_window(u, d, p, t) { w.mood('day'); w.shoot(WIN5, lerp(4, 2.8, ease(p)), .2, -.05); },
    wait(u, d, p, t) {
      w.mood(p < .5 ? 'dawn' : 'day'); P(albert, 1.6, 3.6, Math.PI - .2); albert.setFace(p < .5 ? 'neutral' : 'sad'); albert.head.rotation.x = -.45;
      w.shoot(w.head(albert, -.3), lerp(3.2, 2.6, p), Math.PI - .2 + Math.PI, -.25);
    },
    stairs(u, d, p, t) {
      w.mood('day'); const i = lerp(1, 12, p);
      P(albert, 40, -i * .55, Math.PI, .3 * i); albert.walk(t, 5, .45); albert.setFace('sad'); albert.armR.rotation.x = -.5;
      w.shoot(v3(40, .3 * i + 2.0, -i * .55), 4.2, .35, .35);
    },
    knock(u, d, p, t) {
      w.mood('day'); P(albert, 40.2, -7.6, Math.PI, 4.8); albert.setFace(p < .5 ? 'neutral' : 'sad');
      albert.armR.rotation.x = -1.7 + Math.abs(Math.sin(t * 14)) * .35;
      w.shoot(v3(40.2, 6.6, -8.3), 2.8, .7, .05);
    },
    lady_fallen(u, d, p, t) {
      w.mood('day'); fallenChair.visible = true;
      P(lady, 81.6, -2.6, 0, .28); lady.g.rotation.z = Math.PI / 2; lady.setFace('sad');
      catAt(80.4, 0, -2.2, Math.PI / 2); cat.setFace('meow');
      w.shoot(v3(80.6, .6, -2.6), lerp(5, 4.2, p), .4, .5);
    },
    lady_close(u, d, p, t) { w.mood('day'); P(lady, 81.6, -2.6, 0, .28); lady.g.rotation.z = Math.PI / 2; lady.setFace('cry'); w.shoot(v3(79.15, .7, -2.6), lerp(2.0, 1.7, p), .2, .15); },
    cat_meow(u, d, p, t) { w.mood('day'); catAt(80.4, 0, -2.2, Math.PI / 2 + .6); cat.setFace(Math.sin(t * 9) > -.2 ? 'meow' : 'neutral'); cat.head.rotation.x = -.2 + Math.sin(t * 9) * .1; w.shoot(v3(80.65, .95, -2.0), lerp(1.6, 1.3, p), Math.PI / 2 + .6, .05); },
    firefighters(u, d, p, t) {
      w.mood('day'); truck.visible = true; siren.material.emissiveIntensity = Math.sin(t * 20) > 0 ? 3 : .2; siren.material.emissive.set(Math.sin(t * 10) > 0 ? '#2e6bff' : '#ff3030');
      P(ff1, lerp(2.5, -.6, p), 3.6, -Math.PI / 2 - .4); P(ff2, lerp(3.5, .3, p), 4.3, -Math.PI / 2 - .4); ff1.walk(t, 11, .6); ff2.walk(t + .3, 11, .6); ff1.setFace('angry'); ff2.setFace('angry');
      w.shoot(v3(1, 2, 4), 9, .5, .12);
    },
    hospital(u, d, p, t) {
      w.mood('day'); hblanket.visible = true;
      P(lady, 118.5, -4.4, 0, .98); lady.legL.rotation.x = lady.legR.rotation.x = -1.5; lady.setFace('wonder'); lady.head.rotation.y = .5;
      P(albertIn, 121.0, -4.0, -Math.PI / 2 - .3, -.12); albertIn.legL.rotation.x = albertIn.legR.rotation.x = -1.5; albertIn.setFace('smile');
      w.shoot(v3(119.7, 2.2, -4.2), lerp(5, 4.4, p), .25, .1);
    },
    oldman_smile(u, d, p, t) { w.mood('day'); P(albertIn, 121.0, -4.0, -Math.PI / 2 - .3, -.12); albertIn.legL.rotation.x = albertIn.legR.rotation.x = -1.5; albertIn.setFace('smileClosed'); w.shoot(w.head(albertIn, -.3), lerp(2.3, 2.0, ease(p)), -Math.PI / 2 - .3, .02); },
    cat_memory(u, d, p, t) { w.mood('dawn'); catAt(1.2, 15.75, .35); cat.wag(t); cat.head.rotation.x = .5; w.shoot(v3(1.2, 16.1, .45), lerp(2.2, 1.8, ease(p)), .15, -.1); },
    coffee(u, d, p, t) {
      w.mood('dawn'); cups.visible = true;
      P(lady, 78.4, -4.6, Math.PI / 2, -.12); P(albertIn, 80.0, -4.6, -Math.PI / 2, -.12);
      for (const c of [lady, albertIn]) { c.legL.rotation.x = c.legR.rotation.x = -1.5; c.setFace('laugh'); c.armR.rotation.x = -1.0; c.torso.position.y = 1.5 + Math.abs(Math.sin(t * 8)) * .02; }
      catAt(81.5, 1.61, -7.6, 0); cat.wag(t);
      w.shoot(v3(79.2, 1.9, -4.8), lerp(4.6, 4.0, p), .15, .15);
    },
    two_windows(u, d, p, t) {
      w.mood('sunset'); const k = ease(p);
      catAt(p < .5 ? 1.2 : 3.6, p < .5 ? 15.75 : 3.35, .35); cat.wag(t);
      P(albertIn, 3.6, -.3, 0, 2.9); albertIn.g.visible = p >= .5; albertIn.setFace('smileClosed'); wave(albertIn, t);
      w.look(lerpV([4, 16, 5], [6, 7, 20], k), lerpV([1.2, 16, 0], [1.5, 8.5, 0], k));
    },
  };

  function render(name, u, d, p, t) { w.resetChars(); resetProps(); w.weather(null); (shots[name] || shots.building_cat)(u, d, p, t); w.render(); }
  function overlay(name, u, d, t) {
    if (name === 'building_cat') ui.badge('5ᵉ ÉTAGE', u - .6, { size: 52, y: H * .12 });
    if (name === 'wait') { const p = u / d; ui.badge(p < .5 ? '1 HEURE' : '2 HEURES', p < .5 ? u - .2 : u - d * .5, { size: 50, bg: '#141a33', border: '#ffd36b', color: '#ffd36b', y: H * .12 }); }
    if (name === 'knock') ui.badge('TOC TOC', u - .2, { size: 56, bg: '#3a2c00', border: '#ffd21f', color: '#ffe14d', y: H * .12, rot: -.06 });
    if (name === 'cat_meow') ui.badge('MIAOU !', u - .1, { size: 60, bg: '#3b0f12', border: '#ff7b7b', color: '#ff9b9b', y: H * .12, rot: .05 });
  }
  return { render, overlay };
}
