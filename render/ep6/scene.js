// Épisode 6 : « La boîte aux lettres du ciel »
import * as THREE from 'three';
import { W, H, clamp, ease, lerp, lerpV, v3, mat, mesh, box, rbox, roundRect, makeChar } from '../lib.js';
import { createWorld, tex, card, font, room, table, chair, tree, house, groundPlane, cardStage, sunDisc } from '../world.js';

const writeLines = (g, lines, k, x0, y0, dy, size = 70) => { g.fillStyle = '#2b2350'; font(g, 700, size, 'Caveat'); let n = Math.floor(k * lines.join('').length); lines.forEach((l, i) => { g.fillText(l.slice(0, Math.max(0, n)), x0, y0 + i * dy); n -= l.length; }); };

export function create(renderer, ui) {
  const w = createWorld(renderer), S = w.scene;

  // ---------- RUE (x=0) ----------
  const st = new THREE.Group(); S.add(st);
  groundPlane(st, '#a3a86a');
  const sw = mesh(new THREE.PlaneGeometry(120, 3), mat('#cfc6b8'), st, 0, .02, 0); sw.rotation.x = -Math.PI / 2;
  const rd = mesh(new THREE.PlaneGeometry(120, 6), mat('#4a4e56'), st, 0, .015, 4.5); rd.rotation.x = -Math.PI / 2;
  for (let i = 0; i < 7; i++) house(st, -40 + i * 7.5, -3, { w: 6, h: 4 + (i % 3) * .7, color: ['#e9d8bf', '#d9e4ee', '#f2d0c0', '#dfe9d0'][i % 4], roof: ['#8a3a2a', '#3d5a80', '#7a3a2a'][i % 3], lit: i % 2 === 0 });
  for (let i = 0; i < 5; i++) tree(st, -36 + i * 8, 1.6, { kind: 'round', leaf: ['#d9822b', '#c4561f', '#e0a83a'][i % 3], s: .9 });
  tree(st, 10, -4, { kind: 'round', leaf: '#c4561f', s: 1.2 });
  const sun = sunDisc(st, -20, 5, -70, '#ffcf8a', 4);
  // la vieille boîte aux lettres
  const mb = new THREE.Group(); mb.position.set(6, 0, 1.0); st.add(mb);
  const paint = mat('#2f6f8a', { roughness: .6, metalness: .3 }), rust = mat('#8a5a3a', { roughness: 1 });
  box(.16, 1.3, .16, mat('#2a3a44', { metalness: .5 }), mb, 0, .65, 0);
  rbox(.9, 1.0, .65, .1, paint, mb, 0, 1.75, 0);
  mesh(new THREE.CylinderGeometry(.45, .45, .65, 20, 1, false, 0, Math.PI), paint, mb, 0, 2.25, 0).rotation.set(Math.PI / 2, 0, Math.PI / 2);
  box(.55, .06, .05, mat('#111'), mb, 0, 2.02, .33);
  for (const [x, y] of [[-.3, 1.4], [.32, 2.2], [.25, 1.3]]) box(.14, .1, .02, rust, mb, x, y, .335);
  const lbl = card(mb, .6, .2, 300, (g, W2, H2) => { g.fillStyle = '#e9e2cf'; g.fillRect(0, 0, W2, H2); g.fillStyle = '#2f3a44'; font(g, 900, 60); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('LETTRES', W2 / 2, H2 / 2 + 3); }, 0, 1.78, .33, { depth: .01 }); lbl.set();
  const mdoor = new THREE.Group(); mdoor.position.set(0, 1.3, .34); mb.add(mdoor);
  box(.7, .42, .04, paint, mdoor, 0, .21, 0); box(.12, .05, .06, mat('#c9a227', { metalness: .7 }), mdoor, 0, .32, .04);
  const env = box(.4, .02, .26, mat('#f4ead7'), null); // enveloppe en main / dans la fente
  const inEnv = box(.4, .26, .02, mat('#f4ead7'), mb, 0, 1.42, .1);
  // ---------- CHAMBRE DE NATHAN (x=40) ----------
  const rm = room(S, { x: 40, w: 9, d: 8, wall: tex.stripes('#dfe9f2', '#cbdbe9'), window: { x: -1.5, y: 2.5, w: 2.2, h: 1.6 }, lights: [[0, -4]], lightI: 12 });
  table(rm, -1.5, -6.2, { w: 2.4, d: 1.2, h: 1.15, color: '#b98a5a' });
  chair(rm, -1.5, -5.2, Math.PI, '#e67e22');
  const sheet = box(.6, .01, .8, mat('#fbfaf6'), rm, -1.5, 1.22, -6.1);
  const lampD = mesh(new THREE.ConeGeometry(.25, .3, 16, 1, true), mat('#2e86de', { side: THREE.DoubleSide }), rm, -2.4, 1.9, -6.4);
  box(.05, .7, .05, mat('#333'), rm, -2.4, 1.5, -6.4);
  const dframe = box(1.6, 3, .2, mat('#f2efe8'), rm, 3.3, 1.5, -7.9);
  // ---------- TABLE DES LETTRES (x=200) ----------
  const stage = cardStage(S, 200, { table: tex.wood(['#b98a5a', '#a87a4c', '#c09060', '#a27448']) });
  const flat = (c) => { c.mesh.rotation.x = -Math.PI / 2; return c; };
  const envCard = flat(card(stage, 3.0, 2.0, 700, (g, W2, H2) => {
    g.fillStyle = '#f4ead7'; g.fillRect(0, 0, W2, H2); g.strokeStyle = '#d8c7a6'; g.lineWidth = 5; g.beginPath(); g.moveTo(0, 0); g.lineTo(W2 / 2, H2 * .5); g.lineTo(W2, 0); g.stroke();
    g.fillStyle = '#2b2350'; font(g, 700, 92, 'Caveat'); g.textAlign = 'center'; g.fillText('Maman,', W2 / 2, H2 * .72); g.fillText('au ciel ☁', W2 / 2, H2 * .9);
    g.fillStyle = '#ff9db5'; g.fillRect(W2 - 140, 30, 100, 120); g.fillStyle = '#fff'; font(g, 700, 60, 'Caveat'); g.fillText('♥', W2 - 90, 110);
  }, 0, .12, 8)); envCard.set();
  const reply = card(S, 3.2, 3.6, 800, (g, W2, H2, k) => {
    g.fillStyle = '#fbf3e4'; g.fillRect(0, 0, W2, H2); g.strokeStyle = 'rgba(200,120,150,.35)'; g.lineWidth = 2; for (let y = 160; y < H2; y += 90) { g.beginPath(); g.moveTo(40, y); g.lineTo(W2 - 40, y); g.stroke(); }
    writeLines(g, ['Mon grand,', '', 'Je suis fière de toi.', 'Prends soin de papa.', '', '        Maman ♥'], k, 60, 150, 90, 76);
  }, 205, 3.2, 0);
  const pile = new THREE.Group(); pile.position.set(200, 0, 8); S.add(pile);
  for (let i = 0; i < 40; i++) { const e = box(1.0, .03, .66, mat(['#f4ead7', '#efe2c8', '#f8f0e0', '#fde9ef'][i % 4]), pile, (w.R() - .5) * 2.2, .13 + i * .035, (w.R() - .5) * 1.6); e.rotation.y = (w.R() - .5) * 1.2; }

  // ---------- PERSONNAGES ----------
  const nStyle = { skin: '#f0c49a', pants: '#3b3f4f', hair: 'messy', hairColor: '#8a4a1a', face: { blush: true, brow: '#5a2e14' } };
  const nathan = w.add(makeChar({ ...nStyle, shirt: '#e67e22' })); nathan.g.scale.setScalar(.62);
  const teen = w.add(makeChar({ ...nStyle, shirt: '#e67e22', coat: '#3d5a80' })); teen.g.scale.setScalar(.92);
  const adult = w.add(makeChar({ ...nStyle, shirt: '#ffffff', coat: '#2e5fa8', face: { brow: '#5a2e14' } }));
  const dad = w.add(makeChar({ skin: '#f0c49a', shirt: '#5a6b7a', pants: '#3b3f4f', hair: 'short', hairColor: '#6a3a1a', face: { brow: '#4a2a14' } }));
  const marcel = w.add(makeChar({ skin: '#e9b48a', shirt: '#2e5fa8', pants: '#2c3e50', hair: 'cap', hairColor: '#2e5fa8', face: { mustache: '#dcdcdc', wrinkles: true, brow: '#cfcfcf', glasses: true } }));
  const bag = () => { const b = new THREE.Group(); rbox(.6, .55, .3, .06, mat('#7a4a2a'), b, 0, 0, 0); box(.62, .12, .32, mat('#5a3420'), b, 0, .22, 0); return b; };
  const bagM = bag(), bagA = bag();
  marcel.g.add(bagM); bagM.position.set(.62, 1.05, .1); adult.g.add(bagA); bagA.position.set(.62, 1.05, .1);

  w.onMood((m) => { rm.userData.setView(m); sun.visible = m === 'sunset' || m === 'dawn'; });
  const P = (c, x, z, ry, y) => w.place(c, x, z, ry, y);
  const hold = (c) => { c.armR.add(env); env.position.set(0, -1.0, .3); env.rotation.set(0, 0, 0); };
  const resetProps = () => { pile.visible = true; envCard.mesh.visible = true; env.removeFromParent(); mdoor.rotation.x = 0; inEnv.visible = false; reply.set(1); pile.children.forEach(c => c.visible = true); };
  const MB = v3(6, 1.8, 1.0);

  const shots = {
    title(u, d, p, t) { w.mood('sunset'); w.shoot(v3(3, 1.6, 1), lerp(12, 10, p), -.35, .12); },
    mailbox(u, d, p, t) { w.mood('sunset'); w.shoot(MB, lerp(4.2, 2.6, ease(p)), -.4, .08); },
    nathan_intro(u, d, p, t) {
      w.mood('sunset'); P(nathan, lerp(2.4, 4.4, ease(p)), 1.9, Math.PI / 2); if (p < .9) nathan.walk(t, 7, .4); nathan.setFace('smile'); hold(nathan);
      w.shoot(w.head(nathan, -.3), 2.6, Math.PI / 2 - .6, .05);
    },
    slide_letter(u, d, p, t) {
      w.mood('sunset');
      mb.add(env); env.rotation.set(Math.PI / 2, 0, 0); env.position.set(0, 2.02, lerp(.75, .3, ease(clamp(p * 1.4)))); env.visible = p < .75;
      w.shoot(v3(6, 1.95, 1.33), lerp(1.4, 1.1, p), .3, .05);
    },
    envelope_close(u, d, p, t) { w.mood('day'); pile.visible = false; w.shoot(v3(200, .1, 8), lerp(3.6, 3.0, ease(p)), .05, 1.25); },
    writing(u, d, p, t) {
      w.mood('night'); rm.userData.setLights(.8);
      P(nathan, 38.5, -5.35, Math.PI, .25); nathan.legL.rotation.x = nathan.legR.rotation.x = -1.5; nathan.setFace('sad'); nathan.head.rotation.x = .25;
      nathan.armR.rotation.x = -1.1 + Math.sin(t * 9) * .08; nathan.armR.rotation.z = Math.sin(t * 5) * .1;
      P(dad, 43.3, -7.3, -.4); dad.setFace('sad'); dad.head.rotation.x = .2;
      w.shoot(w.head(nathan, -.3), lerp(2.6, 2.2, p), 2.3, .15);
    },
    open_box(u, d, p, t) {
      w.mood('sunset'); mdoor.rotation.x = lerp(0, 1.4, ease(clamp(p * 2))); inEnv.visible = true;
      P(nathan, 5.25, 1.95, 2.3); nathan.armR.rotation.x = -1.5; nathan.setFace(p < .5 ? 'neutral' : 'wonder');
      w.shoot(v3(5.7, 1.4, 1.6), 2.8, .65, .12);
    },
    reply_card(u, d, p, t) { w.mood('day'); reply.set(clamp(p * 1.2)); w.shoot(v3(205, 3.4, 0), lerp(5.6, 5.0, ease(p)), 0, 0); },
    letters_pile(u, d, p, t) { w.mood('day'); envCard.mesh.visible = false; const n = Math.floor(lerp(6, 40, p)); pile.children.forEach((c, i) => c.visible = i < n); w.shoot(v3(200, .6, 8), lerp(5, 6, p), .3 + p * .3, .7); },
    teen_wait(u, d, p, t) { w.mood('sunset'); P(teen, 5.3, 2.1, .3); teen.setFace('neutral'); teen.idle(t); w.shoot(w.head(teen, -.4), lerp(4, 3.3, ease(p)), .5, .05); },
    postman_arrive(u, d, p, t) {
      w.mood('sunset'); P(teen, 5.3, 2.1, -Math.PI / 2); teen.setFace('wonder');
      P(marcel, lerp(13, 8.0, p), 2.4, -Math.PI / 2); marcel.walk(t, 6, .35); marcel.setFace('neutral');
      P(teen, 5.6, 2.3, Math.PI / 2); teen.setFace('wonder');
      w.shoot(v3(7, 1.8, 2.3), 7, .5, .1);
    },
    marcel_close(u, d, p, t) { w.mood('sunset'); P(marcel, 7.4, 2.4, -Math.PI / 2); marcel.setFace('neutral'); hold(marcel); marcel.armR.rotation.x = -1.2; w.shoot(w.head(marcel, -.3), lerp(2.6, 2.1, ease(p)), -Math.PI / 2 + .4, .05); },
    marcel_sad(u, d, p, t) { w.mood('sunset'); P(marcel, 7.4, 2.4, -Math.PI / 2); marcel.setFace('sad'); marcel.head.rotation.x = lerp(0, .4, ease(p)); hold(marcel); marcel.armR.rotation.x = -.7; w.shoot(w.head(marcel, -.2), 2.3, -Math.PI / 2 + .35, -.05); },
    marcel_cry(u, d, p, t) { w.mood('sunset'); P(marcel, 7.4, 2.4, -Math.PI / 2); marcel.setFace('cry'); marcel.head.rotation.x = .2; w.shoot(w.head(marcel, -.15), lerp(1.9, 1.6, ease(p)), -Math.PI / 2 + .2, 0); },
    hug(u, d, p, t) {
      w.mood('sunset'); P(marcel, 7.3, 2.4, -Math.PI / 2); P(teen, 6.5, 2.4, Math.PI / 2);
      for (const c of [marcel, teen]) { c.setFace('smileClosed'); c.armL.rotation.x = c.armR.rotation.x = -1.5; c.armL.rotation.z = .6; c.armR.rotation.z = -.6; c.head.rotation.z = .1; }
      w.shoot(v3(6.9, 2.2, 2.4), lerp(4.0, 3.4, ease(p)), .25, .12);
    },
    nathan_postman(u, d, p, t) { w.mood('day'); P(adult, 3.4, 2.2, .3); adult.setFace('smile'); adult.idle(t); w.shoot(w.head(adult, -.5), lerp(4, 3.2, ease(p)), .5, .05); },
    final_mailbox(u, d, p, t) {
      w.mood('sunset'); P(adult, 5.0, 1.6, Math.PI / 2 - .3); adult.setFace('smileClosed'); adult.armR.rotation.x = -1.5;
      w.shoot(MB, lerp(3, 9, ease(p)), lerp(-.3, -.6, p), lerp(.05, .25, p));
    },
  };

  function render(name, u, d, p, t) { w.resetChars(); resetProps(); w.weather(null); (shots[name] || shots.title)(u, d, p, t); w.render(); }
  function overlay(name, u, d, t) {
    if (name === 'nathan_intro') ui.badge('8 ANS', u - .1, { size: 54, y: H * .12 });
    if (name === 'letters_pile') ui.badge('DES ANNÉES', u - .1, { size: 50, bg: '#141a33', border: '#ffd36b', color: '#ffd36b', y: H * .12 });
    if (name === 'teen_wait') ui.badge('18 ANS', u - .2, { size: 54, y: H * .12 });
    if (name === 'nathan_postman') ui.badge("AUJOURD'HUI", u - .2, { size: 48, y: H * .12 });
  }
  return { render, overlay };
}
