// Épisode 7 : « Le banc numéro quatre »
import * as THREE from 'three';
import { W, H, clamp, ease, lerp, lerpV, v3, mat, mesh, box, rbox, roundRect, makeChar } from '../lib.js';
import { createWorld, tex, card, font, tree, lampPost, bench, groundPlane, sunDisc } from '../world.js';

export function create(renderer, ui) {
  const w = createWorld(renderer), S = w.scene;
  const park = new THREE.Group(); S.add(park);
  groundPlane(park, '#7fb069');
  const path = mesh(new THREE.PlaneGeometry(120, 2.6), mat('#d8c9a8', { roughness: 1 }), park, 0, .02, 1.4); path.rotation.x = -Math.PI / 2;
  const benches = {};
  for (const [n, x] of [[3, -7], [4, 0], [5, 7]]) {
    const b = bench(park, x, -.4); benches[n] = b;
    const num = card(b, .34, .34, 200, (g, W2, H2) => { g.fillStyle = '#2f5f3f'; roundRect(g, 4, 4, W2 - 8, H2 - 8, 30); g.fill(); g.fillStyle = '#fff'; font(g, 900, 130); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(n), W2 / 2, H2 / 2 + 8); }, 1.0, 1.25, -.27, { depth: .02 }); num.set();
  }
  const plaque = card(benches[4], .9, .36, 600, (g, W2, H2, malik) => {
    const gr = g.createLinearGradient(0, 0, W2, H2); gr.addColorStop(0, '#e8c46a'); gr.addColorStop(1, '#b8902f'); g.fillStyle = gr; roundRect(g, 2, 2, W2 - 4, H2 - 4, 18); g.fill();
    g.strokeStyle = '#8a6a1f'; g.lineWidth = 6; roundRect(g, 10, 10, W2 - 20, H2 - 20, 12); g.stroke();
    g.fillStyle = '#3a2a0a'; g.textAlign = 'center'; g.textBaseline = 'middle';
    font(g, 700, 62, 'Caveat'); g.fillText("Ici, on s'aimait.", W2 / 2, 62); font(g, 900, 40); g.fillText('ODETTE ♥ HENRI', W2 / 2, 120);
    if (malik) { font(g, 700, 30, 'Caveat'); g.fillText("Et Malik, qui m'a tenu la main", W2 / 2, 172); g.fillText("quand j'étais seule.", W2 / 2, 202); }
  }, -.1, 1.25, -.27, { depth: .02 });
  const trees = [];
  for (const [x, z, s] of [[-11, -3, 1.3], [-4, -4.5, 1.1], [4, -4.2, 1.2], [11, -3.5, 1.3], [-15, 4, 1], [15, 5, 1.1], [-2, 7, .9], [6, 8, 1]]) trees.push(tree(park, x, z, { kind: 'round', s }));
  const setLeaves = (c) => trees.forEach(t => t.traverse(m => { if (m.isMesh && m.geometry.type === 'SphereGeometry') m.material.color.set(c); }));
  lampPost(park, 3.4, .6);
  const sun = sunDisc(park, -18, 12, -70, '#fff2c0', 3);
  // fleurs
  const flowers = new THREE.Group(); park.add(flowers);
  for (let i = 0; i < 60; i++) mesh(new THREE.SphereGeometry(.08, 6, 5), mat(['#ff7eb6', '#ffd36b', '#ffffff', '#c38bff'][i % 4]), flowers, (w.R() - .5) * 16, .08, -1.5 - w.R() * 3, false);

  const odette = w.add(makeChar({ skin: '#f3cba6', shirt: '#b0709a', pants: '#4a3a5a', coat: '#7a4a8a', hair: 'bun', hairColor: '#ececec', face: { glasses: true, wrinkles: true, blush: true, brow: '#bbb' } }));
  const malik = w.add(makeChar({ skin: '#8a5536', shirt: '#2e86de', sleeve: '#2e86de', pants: '#2c3e50', hair: 'short', hairColor: '#1a1a1a', face: { brow: '#1a1a1a' } })); malik.g.scale.setScalar(.9);
  const youngO = w.add(makeChar({ skin: '#f3cba6', shirt: '#e84f8a', pants: '#e84f8a', hair: 'long', hairColor: '#7a4a2a', face: { blush: true } }));
  const henri = w.add(makeChar({ skin: '#f0c49a', shirt: '#ffffff', vest: '#3d5a80', pants: '#3d3a4a', hair: 'short', hairColor: '#5a3420', face: { brow: '#3a2214' } }));

  let sepia = false;
  w.onMood((m) => { sun.visible = m === 'day' || m === 'sunset'; });
  const P = (c, x, z, ry, y) => w.place(c, x, z, ry, y);
  const sit = (c, x) => { const s = c.g.scale.y; P(c, x, -.25, 0, .86 - s); c.legL.rotation.x = c.legR.rotation.x = -1.5; };
  const resetProps = () => { plaque.mesh.visible = false; sepia = false; setLeaves('#5c9a48'); flowers.visible = false; };
  const B = v3(0, 1.6, -.3);

  const shots = {
    title(u, d, p, t) { w.mood('day'); sit(odette, -.6); odette.setFace('smileClosed'); w.shoot(B, lerp(12, 9.5, ease(p)), .25, .2); },
    odette_bench(u, d, p, t) {
      w.mood('day');
      if (p < .5) { P(odette, lerp(-5, -.6, ease(p * 2)), 1.0, Math.PI / 2); odette.walk(t, 4, .25); odette.setFace('smile'); }
      else { sit(odette, -.6); odette.setFace('smileClosed'); }
      w.shoot(v3(-1, 1.8, 0), lerp(6.5, 5.5, p), .3, .1);
    },
    left_side(u, d, p, t) { w.mood('day'); sit(odette, -.6); odette.setFace('neutral'); odette.head.rotation.y = -.3; w.shoot(v3(lerp(-.6, .6, ease(p)), 1.6, -.2), 3.0, .15, .08); },
    teen_sits(u, d, p, t) {
      w.mood('day'); sit(odette, -.6); odette.setFace('wonder');
      if (p < .55) { P(malik, lerp(6, 1.6, p / .55), 1.2, -Math.PI / 2); malik.walk(t, 10, .55); malik.setFace('neutral'); }
      else { sit(malik, .7); malik.setFace('neutral'); malik.armR.rotation.x = -1.0; }
      w.shoot(v3(.4, 1.6, 0), 5.2, -.25, .1);
    },
    odette_says(u, d, p, t) { w.mood('day'); sit(odette, -.6); sit(malik, .7); odette.setFace('smile'); odette.head.rotation.y = .35; w.shoot(w.head(odette, -.35), lerp(2.4, 2.0, ease(p)), .1, .03); },
    teen_looks(u, d, p, t) { w.mood('day'); sit(odette, -.6); sit(malik, .7); malik.setFace('wonder'); malik.head.rotation.y = Math.sin(p * Math.PI * 2) * .8; w.shoot(w.head(malik, -.35), lerp(2.6, 2.2, p), -.2, .05); },
    teen_asks(u, d, p, t) { w.mood('day'); sit(odette, -.6); sit(malik, .7); malik.setFace('wonder'); malik.head.rotation.y = -.4; w.shoot(w.head(malik, -.35), 1.9, -.35, .03); },
    memory(u, d, p, t) {
      w.mood('sunset'); sepia = true; sit(youngO, -.6); sit(henri, .6);
      youngO.setFace('laugh'); henri.setFace('smileClosed'); youngO.head.rotation.y = .4; henri.head.rotation.y = -.4; henri.armL.rotation.x = -.6; youngO.armR.rotation.x = -.6;
      w.shoot(B, lerp(4.4, 3.6, ease(p)), 0, .08);
    },
    odette_sad(u, d, p, t) { w.mood('day'); sit(odette, -.6); sit(malik, .7); odette.setFace('sad'); odette.head.rotation.x = .2; w.shoot(w.head(odette, -.35), 1.9, .15, 0); },
    teen_silent(u, d, p, t) { w.mood('sunset'); sit(odette, -.6); sit(malik, .7); odette.setFace('sad'); malik.setFace('sad'); malik.head.rotation.x = .2; w.shoot(B, lerp(4.5, 5.5, p), -.1, .12); },
    teen_ground(u, d, p, t) {
      w.mood('day'); sit(odette, -.6); odette.setFace(p < .5 ? 'wonder' : 'smile');
      P(malik, 1.7, .3, -.2, -.55 * .9); malik.legL.rotation.x = malik.legR.rotation.x = -1.5; malik.setFace('smile');
      w.shoot(v3(.6, 1.3, 0), lerp(5, 4.2, p), .3, .12);
    },
    together(u, d, p, t) {
      w.mood(p < .5 ? 'day' : 'sunset'); setLeaves(p < .5 ? '#5c9a48' : '#d9822b');
      sit(odette, -.6); P(malik, 1.7, .3, -.4, -.55 * .9); malik.legL.rotation.x = malik.legR.rotation.x = -1.5;
      odette.setFace('laugh'); malik.setFace('laugh'); odette.torso.position.y = 1.5 + Math.abs(Math.sin(t * 9)) * .02; odette.head.rotation.y = .4;
      w.shoot(v3(.5, 1.5, -.1), 4.6, lerp(-.6, .6, p), .15);
    },
    plaque_wide(u, d, p, t) { w.mood('day'); setLeaves('#f4a6c0'); flowers.visible = true; plaque.mesh.visible = true; plaque.set(false); w.shoot(v3(0, 1.2, -.5), lerp(7, 4.5, ease(p)), .1, .15); },
    plaque_close(u, d, p, t) { w.mood('day'); setLeaves('#f4a6c0'); plaque.mesh.visible = true; plaque.set(false); w.shoot(v3(-.1, 1.13, -.67), lerp(1.9, 1.7, ease(p)), 0, 0); },
    plaque_malik(u, d, p, t) {
      w.mood('day'); setLeaves('#f4a6c0'); flowers.visible = true; plaque.mesh.visible = true; plaque.set(true);
      if (p < .55) w.shoot(v3(-.1, 1.1, -.67), lerp(1.8, 1.65, p), 0, 0);
      else { sit(odette, -.6); sit(malik, .7); odette.setFace('smileClosed'); malik.setFace('smileClosed'); odette.armL.rotation.x = -.5; malik.armR.rotation.x = -.5; odette.head.rotation.z = -.12; w.shoot(B, lerp(3.5, 8, ease((p - .55) / .45)), .1, lerp(.05, .3, (p - .55) / .45)); }
    },
  };

  function render(name, u, d, p, t) { w.resetChars(); resetProps(); w.weather(null); (shots[name] || shots.title)(u, d, p, t); w.render(); }
  function overlay(name, u, d, t) {
    const c = ui.ctx;
    if (sepia) { c.save(); c.globalCompositeOperation = 'color'; c.fillStyle = 'rgba(150,110,60,.75)'; c.fillRect(0, 0, W, H); c.restore(); }
    if (name === 'title') { ui.badge('ÉPISODE 7', u - .1, { size: 46, y: H * .12 }); ui.badge('LE BANC NUMÉRO QUATRE', u - .4, { size: 38, y: H * .2, bg: '#141a33', border: '#ffd36b', color: '#ffd36b', rot: .02 }); }
    if (name === 'odette_bench') ui.badge('12:00', u - .3, { size: 58, bg: '#141a33', border: '#ffd36b', color: '#ffd36b', y: H * .12 });
    if (name === 'memory') ui.badge('IL Y A 60 ANS', u - .1, { size: 46, bg: '#3a2a14', border: '#ffd08a', color: '#ffd08a', y: H * .12 });
    if (name === 'plaque_wide') ui.badge('AU PRINTEMPS', u - .2, { size: 46, bg: '#3b1426', border: '#ff9cc4', color: '#ffc2dc', y: H * .12 });
  }
  return { render, overlay };
}
