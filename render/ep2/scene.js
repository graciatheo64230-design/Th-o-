// Épisode 2 : « Le réveil de 6 h 12 »
import * as THREE from 'three';
import { W, H, clamp, ease, lerp, lerpV, v3, mat, mesh, box, rbox, roundRect, makeChar } from '../lib.js';
import { createWorld, tex, card, font, room, bed, table, chair, tree, lampPost, bridge, house, sunDisc, groundPlane } from '../world.js';

const heart = (g, x, y, s, col) => { g.fillStyle = col; g.beginPath(); g.moveTo(x, y + s * .3); g.bezierCurveTo(x, y, x - s * .5, y, x - s * .5, y + s * .3); g.bezierCurveTo(x - s * .5, y + s * .6, x, y + s * .8, x, y + s); g.bezierCurveTo(x, y + s * .8, x + s * .5, y + s * .6, x + s * .5, y + s * .3); g.bezierCurveTo(x + s * .5, y, x, y, x, y + s * .3); g.fill(); };

export function create(renderer, ui) {
  const w = createWorld(renderer), S = w.scene;

  // ---------- CHAMBRE (x=0) ----------
  const bedroom = room(S, { x: 0, w: 9, d: 8, wall: tex.stripes('#dfe7f0', '#cfdbe8'), window: { x: 1.5, y: 2.4, w: 2.4, h: 1.8 }, lights: [[-1, -4]], lightI: 10 });
  const bd = bed(bedroom, -1.5, -4.6, { cover: '#6b7fae' });
  const blanket = rbox(2.1, .35, 2.4, .1, mat('#6b7fae'), bedroom, -1.5, 1.55, -3.6);
  const ns = new THREE.Group(); ns.position.set(-3.4, 0, -5.7); bedroom.add(ns);
  box(1.0, 1.0, .8, mat('#8a5a36'), ns, 0, .5, 0);
  // réveil
  const clock = new THREE.Group(); clock.position.set(.05, 1.0, .05); ns.add(clock);
  const clkBody = new THREE.Group(); clock.add(clkBody);
  rbox(.62, .36, .3, .06, mat('#c0392b', { roughness: .4 }), clkBody, 0, .2, 0);
  const disp = card(clkBody, .5, .2, 256, (g, W2, H2, txt, on) => { g.fillStyle = '#120808'; g.fillRect(0, 0, W2, H2); g.fillStyle = on ? '#ff3b30' : '#5a1a16'; font(g, 900, 78); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, W2 / 2, H2 / 2 + 4); }, 0, .2, .15, { depth: .01, glow: 1.4 });
  for (const s of [-1, 1]) mesh(new THREE.SphereGeometry(.09, 12, 10), mat('#e0b64a', { metalness: .7, roughness: .3 }), clkBody, .2 * s, .42, 0);
  // photo encadrée
  const photo = card(ns, .5, .62, 400, (g, W2, H2) => {
    g.fillStyle = '#6b4a2a'; g.fillRect(0, 0, W2, H2); g.fillStyle = '#e8d6b0'; g.fillRect(24, 24, W2 - 48, H2 - 48);
    const sep = (c) => c; g.fillStyle = '#c9ad7f'; g.fillRect(24, H2 * .62, W2 - 48, H2 * .38 - 24);
    const fig = (x, col, hair, long) => { g.fillStyle = col; g.fillRect(x - 34, 250, 68, 120); g.fillStyle = '#d9b48a'; roundRect(g, x - 38, 160, 76, 72, 18); g.fill(); g.fillStyle = hair; g.fillRect(x - 40, 152, 80, 22); if (long) g.fillRect(x - 40, 160, 14, 70), g.fillRect(x + 26, 160, 14, 70); g.fillStyle = '#3a2a1a'; g.fillRect(x - 16, 190, 8, 10); g.fillRect(x + 8, 190, 8, 10); g.fillRect(x - 10, 212, 20, 4); };
    fig(150, '#7a5a3a', '#4a3020', false); fig(250, '#9a6a6a', '#5a3a2a', true);
    heart(g, 200, 100, 40, 'rgba(160,60,60,.6)');
    g.fillStyle = 'rgba(120,80,30,.18)'; g.fillRect(0, 0, W2, H2);
  }, .35, 1.32, -.1, { depth: .04 }); photo.set(); photo.mesh.rotation.y = -.25;
  // armoire + cadre mural
  box(1.6, 3.2, .8, mat('#7a4a2a'), bedroom, 3.4, 1.6, -7.4);

  // ---------- CUISINE (x=40) ----------
  const kitchen = room(S, { x: 40, w: 9, d: 8, floor: tex.tiles('#eae4d6', '#c9bfae'), wall: tex.stripes('#e6efd9', '#d6e4c4'), window: { x: -1.5, y: 2.4, w: 2.4, h: 1.8 }, lights: [[0, -4]], lightI: 14 });
  table(kitchen, 0, -4.2, { w: 2.6, d: 1.5 });
  chair(kitchen, 0, -5.2, 0, '#c0392b'); chair(kitchen, 1.6, -4.2, -Math.PI / 2, '#c0392b');
  const bowl = mesh(new THREE.CylinderGeometry(.28, .2, .2, 20), mat('#ffffff'), kitchen, 0, 1.36, -4.5);
  box(3.4, 1.3, .9, mat('#f4f1ea'), kitchen, -2.6, .65, -7.4); box(3.4, .1, 1, mat('#7a4a2a'), kitchen, -2.6, 1.35, -7.4);
  box(1, 2.6, .1, mat('#6b4a33'), kitchen, 3.5, 1.3, -7.9);
  const kclock = card(kitchen, .9, .9, 256, (g, W2) => { g.fillStyle = '#fff'; g.beginPath(); g.arc(128, 128, 124, 0, 7); g.fill(); g.lineWidth = 10; g.strokeStyle = '#333'; g.stroke(); g.fillStyle = '#222'; g.save(); g.translate(128, 128); g.rotate(Math.PI); g.fillRect(-5, -10, 10, 90); g.restore(); g.save(); g.translate(128, 128); g.rotate(Math.PI * .4); g.fillRect(-4, -10, 8, 70); g.restore(); }, 1.8, 3.2, -7.85, { depth: .02 }); kclock.set();

  // ---------- EXTÉRIEUR (x=100) ----------
  const ext = new THREE.Group(); ext.position.set(100, 0, 0); S.add(ext);
  const snow = mat('#eef2f8', { roughness: 1 });
  const g1 = mesh(new THREE.PlaneGeometry(120, 60), snow, ext, 0, 0, 20.5); g1.rotation.x = -Math.PI / 2;
  const g2 = mesh(new THREE.PlaneGeometry(120, 60), snow, ext, 0, 0, -48.5); g2.rotation.x = -Math.PI / 2;
  const path = mesh(new THREE.PlaneGeometry(2.2, 14), mat('#d5dbe4', { roughness: 1 }), ext, 0, .01, -2.5); path.rotation.x = -Math.PI / 2;
  const br = bridge(ext, 0, -14, { water: '#4a6f99' }); br.g.rotation.y = Math.PI / 2; br.plate.mesh.visible = false;
  const plate = card(br.g, 1.05, .78, 600, (g, W2, H2, n) => {
    g.fillStyle = '#b9b2a2'; g.fillRect(0, 0, W2, H2);
    g.strokeStyle = '#8f8878'; g.lineWidth = 10; g.strokeRect(12, 12, W2 - 24, H2 - 24);
    g.textAlign = 'center'; g.textBaseline = 'middle';
    const eng = (txt, x, y, sz) => { font(g, 900, sz); g.fillStyle = 'rgba(255,255,255,.55)'; g.fillText(txt, x + 3, y + 3); g.fillStyle = '#3f3a32'; g.fillText(txt, x, y); };
    eng('JEAN', 160, 95, 70); eng('MARIE', 435, 95, 70); heart(g, 300, 66, 52, '#6a3a34');
    eng('12 MARS 1979', 300, 205, 52); eng('6H12', 300, 280, 60);
    if (n >= 3) eng('+ LINA', 300, 375, 66);
  }, 0, .95, 1.16, { depth: .02, rough: .95 });
  plate.mesh.position.set(0, 1.0, -1.165);
  house(ext, -5, 6, { color: '#efe0c4', roof: '#7a3a2a', ry: .3 });
  for (const [x, z, k] of [[-4, -4, 'pine'], [4.5, -3, 'pine'], [-6, -9, 'bare'], [5, -8, 'bare'], [-9, 0, 'pine'], [8, 2, 'pine'], [-7, -22, 'pine'], [6, -24, 'pine'], [0, -30, 'pine'], [-12, -26, 'bare']]) tree(ext, x, z, { kind: k, snow: true, s: 1.2 });
  const lamp = lampPost(ext, 1.8, -8.5);
  const sun = sunDisc(ext, -6, 4, -60, '#ffd98a', 3);

  // ---------- PERSONNAGES ----------
  const old = { skin: '#f0c49a', pants: '#4a4a5a', hair: 'bald', hairColor: '#e4e4e4', face: { mustache: '#ececec', wrinkles: true, brow: '#cfcfcf' } };
  const jean = w.add(makeChar({ ...old, shirt: '#c9b79c' }));
  const jeanCoat = w.add(makeChar({ ...old, shirt: '#c9b79c', coat: '#6b4a33', scarf: '#a83232' }));
  const kid = { skin: '#f3c9a3', pants: '#3b5aa0', hair: 'ponytail', hairColor: '#7a3e1e', face: { blush: true, brow: '#5a2e14' } };
  const lina = w.add(makeChar({ ...kid, shirt: '#f2a03d' })); lina.g.scale.setScalar(.64);
  const linaPj = w.add(makeChar({ ...kid, shirt: '#b7d3f2', pants: '#b7d3f2' })); linaPj.g.scale.setScalar(.64);
  const linaCoat = w.add(makeChar({ ...kid, shirt: '#f2a03d', coat: '#6b4a33', scarf: '#a83232' })); linaCoat.g.scale.setScalar(.68);
  const linaAdult = w.add(makeChar({ skin: '#f3c9a3', shirt: '#f2a03d', pants: '#3b5aa0', hair: 'long', hairColor: '#7a3e1e', face: { blush: true, brow: '#5a2e14' } }));
  const linaAdultCoat = w.add(makeChar({ skin: '#f3c9a3', shirt: '#f2a03d', pants: '#3b5aa0', hair: 'long', hairColor: '#7a3e1e', coat: '#6b4a33', scarf: '#a83232', face: { blush: true, brow: '#5a2e14' } }));
  const heldClock = clock; // le réveil peut passer dans les mains

  // ---------- AMBIANCES ----------
  w.onMood((m) => { bedroom.userData.setView(m); kitchen.userData.setView(m); const night = m === 'night' || m === 'dark'; lamp.userData.set(night || m === 'dawn' ? 1 : 0); sun.visible = m === 'dawn' || m === 'sunset'; });

  const ring = (t, on) => { clkBody.rotation.z = on ? Math.sin(t * 60) * .08 : 0; clkBody.position.y = on ? Math.abs(Math.sin(t * 60)) * .02 : 0; disp.set('06:12', true); };
  const resetProps = () => { blanket.visible = false; ns.add(clock); clock.position.set(.05, 1.0, .05); clock.rotation.set(0, 0, 0); clock.scale.setScalar(1); clkBody.rotation.set(0, 0, 0); disp.set('06:12', true); plate.set(2); bedroom.userData.setLights(1); kitchen.userData.setLights(1); };
  const lie = (c, face) => { w.place(c, -1.5, -3.45, 0, 1.38); c.g.rotation.x = -Math.PI / 2; c.setFace(face); blanket.visible = true; };
  const B = (x, y, z) => v3(x, y, z), E = (x, y, z) => v3(100 + x, y, z), K = (x, y, z) => v3(40 + x, y, z);
  const P = (c, x, z, ry, y) => w.place(c, x, z, ry, y);

  const shots = {
    title(u, d, p, t) {
      w.mood('dark'); bedroom.userData.setLights(.15); w.weather(null);
      w.look(lerpV([-2.6, 1.6, -4.1], [-2.9, 1.45, -4.6], ease(p)), B(-3.35, 1.25, -5.65));
    },
    alarm_ring(u, d, p, t) {
      w.mood('dawn'); bedroom.userData.setLights(.3); ring(t, true);
      lie(jean, p < .5 ? 'sleep' : 'smile');
      jean.armL.rotation.x = p > .5 ? -lerp(0, 1.4, ease((p - .5) * 3)) : 0;
      w.look(lerpV([-1.9, 2.2, -3.7], [-2.3, 2.0, -4.1], ease(p)), B(-2.7, 1.25, -5.6));
    },
    alarm_zoom(u, d, p, t) {
      w.mood('dawn'); bedroom.userData.setLights(.3); ring(t, p < .5 || p > .6);
      w.look(lerpV([-3.35, 1.32, -4.3], [-3.35, 1.3, -4.85], ease(p)), B(-3.35, 1.22, -5.65));
    },
    kitchen(u, d, p, t) {
      w.mood('dawn');
      P(lina, 40, -5.05, 0, .2); lina.legL.rotation.x = lina.legR.rotation.x = -1.5; lina.setFace('neutral');
      lina.armR.rotation.x = -1.2 + Math.sin(t * 6) * .15; lina.head.rotation.z = Math.sin(t * 1.5) * .1; lina.head.rotation.x = -.15;
      P(jeanCoat, 42.7, -6.2, -.5); jeanCoat.setFace('smile'); jeanCoat.idle(t);
      w.look(lerpV([42.4, 2.6, -.9], [42.0, 2.4, -1.3], p), K(.3, 1.6, -4.6));
    },
    lina_talk(u, d, p, t) {
      w.mood('dawn');
      P(lina, 40, -5.05, 0, .2); lina.legL.rotation.x = lina.legR.rotation.x = -1.5; lina.setFace(p < .5 ? 'smile' : 'laugh');
      lina.armL.rotation.x = -1.6 + Math.sin(t * 8) * .3; lina.armL.rotation.z = -.4; lina.head.rotation.z = Math.sin(t * 7) * .06;
      w.look(lerpV([40.1, 1.75, -3.4], [40.05, 1.7, -3.7], ease(p)), K(0, 1.62, -5.05));
    },
    jean_coat(u, d, p, t) {
      w.mood('dawn');
      P(jeanCoat, 41.6, -5.6, -.35); jeanCoat.setFace('laugh'); jeanCoat.head.rotation.x = -.12 + Math.sin(t * 12) * .04;
      jeanCoat.armR.rotation.x = -1.0 + Math.sin(t * 4) * .4; jeanCoat.armR.rotation.z = .5; jeanCoat.armL.rotation.x = -.6;
      w.look(lerpV([40.5, 2.8, -1.8], [40.8, 2.7, -2.4], ease(p)), K(1.6, 2.4, -5.6));
    },
    jean_walk(u, d, p, t) {
      w.mood('dawn'); w.weather('snow', t, E(0, 0, -6));
      P(jeanCoat, 100.2, lerp(2, -6, p), Math.PI); jeanCoat.walk(t, 6, .4); jeanCoat.setFace('smile');
      const z = jeanCoat.g.position.z;
      w.look(v3(101.9, 2.0, z - 3.6), v3(100.2, 2.0, z));
    },
    jean_alone(u, d, p, t) {
      w.mood('grey'); w.weather('snow', t, E(0, 0, -12), 1.6);
      P(jeanCoat, 100, lerp(-11, -15, p), Math.PI, .5); jeanCoat.walk(t, 5, .35);
      w.look(lerpV([108, 7, -2], [107, 8, -4], p), E(0, 1, -14));
    },
    bed_still(u, d, p, t) {
      w.mood('grey'); bedroom.userData.setLights(0);
      lie(jean, 'sleep');
      w.look(lerpV([-.4, 3.9, -3.4], [-.9, 3.3, -4.2], ease(p)), B(-1.5, 1.5, -5.9));
    },
    alarm_empty(u, d, p, t) {
      w.mood('grey'); bedroom.userData.setLights(0); ring(t, true);
      w.look(lerpV([1.8, 2.6, -.8], [0, 2.0, -2.8], ease(p)), B(-2.5, 1.2, -5.4));
    },
    lina_cry(u, d, p, t) {
      w.mood('grey'); bedroom.userData.setLights(0); ring(t, false); disp.set('06:12', Math.floor(t * 2) % 2 === 0);
      P(linaPj, -1.0, -3.4, .4, .62); linaPj.legL.rotation.x = linaPj.legR.rotation.x = -1.5; linaPj.setFace('cry');
      linaPj.armL.rotation.x = linaPj.armR.rotation.x = -1.2; linaPj.armL.rotation.z = -.35; linaPj.armR.rotation.z = .35; linaPj.head.rotation.x = .25;
      linaPj.g.add(clock); clock.position.set(0, 1.35, .8); clock.scale.setScalar(1.4); clock.rotation.set(-.3, 0, 0);
      w.look(lerpV([-.2, 1.95, -1.4], [-.4, 1.85, -1.9], ease(p)), B(-.95, 1.75, -3.3));
    },
    lina_coat(u, d, p, t) {
      w.mood('grey'); bedroom.userData.setLights(0);
      P(linaCoat, .8, -5.2, -.2); linaCoat.setFace('sad');
      linaCoat.armR.rotation.x = -lerp(.3, 1.0, Math.abs(Math.sin(t * 2))); linaCoat.armL.rotation.x = -.4; linaCoat.head.rotation.x = .15;
      w.look(lerpV([1.8, 1.9, -2.6], [1.5, 1.8, -3.1], ease(p)), B(.7, 1.7, -5.2));
    },
    lina_walk(u, d, p, t) {
      w.mood('dawn'); w.weather('snow', t, E(0, 0, -6));
      P(linaCoat, 99.8, lerp(1, -5, p), Math.PI); linaCoat.walk(t, 7, .4); linaCoat.setFace('sad');
      const z = linaCoat.g.position.z;
      w.look(v3(97.4, 1.2, z - 2.6), v3(99.8, 1.5, z));
    },
    stone_names(u, d, p, t) {
      w.mood('dawn'); w.weather('snow', t, E(0, 0, -12), .4);
      w.look(lerpV([101.0, 1.25, -14.15], [100.55, 1.2, -14.05], ease(p)), E(-1.17, .85, -14));
    },
    stone_date(u, d, p, t) {
      w.mood('dawn'); w.weather('snow', t, E(0, 0, -12), .4);
      w.look(lerpV([100.1, .95, -13.85], [99.8, .9, -13.95], ease(p)), E(-1.17, .88, -14));
    },
    photo(u, d, p, t) {
      w.mood('grey'); bedroom.userData.setLights(.4);
      w.look(lerpV([-2.6, 1.6, -4.7], [-2.75, 1.5, -5.05], ease(p)), B(-3.05, 1.32, -5.8));
    },
    jean_bridge(u, d, p, t) {
      w.mood('dawn'); w.weather('snow', t, E(0, 0, -12), .5);
      P(jeanCoat, 99.55, -14.1, -Math.PI / 2, .5); jeanCoat.setFace('smileClosed');
      jeanCoat.armR.rotation.x = -.9; jeanCoat.idle(t, 2); jeanCoat.head.rotation.x = .15;
      w.look(lerpV([96.6, 2.5, -11.6], [97.0, 2.4, -12.2], ease(p)), E(-.45, 2.2, -14.1));
    },
    lina_adult(u, d, p, t) {
      w.mood('dawn'); bedroom.userData.setLights(.35); ring(t, p > .4);
      P(linaAdult, -1.5, -4.4, 0, .98); linaAdult.legL.rotation.x = linaAdult.legR.rotation.x = -1.5; blanket.visible = true;
      linaAdult.setFace(p < .4 ? 'sleep' : 'neutral'); linaAdult.armL.rotation.x = -.3; linaAdult.head.rotation.z = .08;
      w.look(lerpV([.8, 2.8, -.8], [.3, 2.7, -1.4], ease(p)), B(-1.5, 2.6, -4.4));
    },
    alarm_adult(u, d, p, t) {
      w.mood('dawn'); bedroom.userData.setLights(.35); ring(t, p < .7);
      P(linaAdult, -1.5, -4.4, -.6, .98); linaAdult.legL.rotation.x = linaAdult.legR.rotation.x = -1.5; blanket.visible = true;
      linaAdult.setFace('smile'); linaAdult.armL.rotation.x = -lerp(.3, 1.5, ease(clamp(p * 1.5))); linaAdult.armL.rotation.z = -.3;
      w.look(lerpV([-2.4, 1.9, -3.6], [-2.7, 1.75, -4.1], ease(p)), B(-3.2, 1.3, -5.6));
    },
    stone_three(u, d, p, t) {
      w.mood('dawn'); w.weather('snow', t, E(0, 0, -12), .3); plate.set(3);
      P(linaAdultCoat, 99.7, -15.3, -Math.PI / 2 - .3, .5); linaAdultCoat.setFace('smileClosed'); linaAdultCoat.idle(t, 2);
      const k = ease(clamp((p - .35) / .65));
      w.look(lerpV([100.9, 1.2, -14.05], [106.5, 6.5, -5], k), lerpV([98.83, 1.05, -14], [99.5, 1.5, -15], k));
    },
  };

  function render(name, u, d, p, t) {
    w.resetChars(); resetProps(); w.weather(null);
    (shots[name] || shots.title)(u, d, p, t);
    w.render();
  }
  function overlay(name, u, d, t) {
    if (name === 'title') { ui.badge('ÉPISODE 2', u - .1, { size: 46, y: H * .12 }); ui.badge('LE RÉVEIL DE 6 H 12', u - .4, { size: 40, y: H * .2, bg: '#141a33', border: '#ffd36b', color: '#ffd36b', rot: .02 }); }
    if (name === 'alarm_ring') ui.badge('DRING !', u - .3, { size: 56, bg: '#3b0f12', border: '#ff7b7b', color: '#ff9b9b', y: H * .12 });
    if (name === 'alarm_empty') ui.badge('06:12', u - .3, { size: 60, bg: '#3b0f12', border: '#ff7b7b', color: '#ff9b9b', y: H * .12 });
    if (name === 'lina_adult') ui.badge('20 ANS PLUS TARD', u - .2, { size: 42, bg: '#141a33', border: '#ffd36b', color: '#ffd36b', y: H * .12 });
    if (name === 'jean_alone') ui.badge('40 ANS', u - 9, {});
  }
  return { render, overlay };
}
