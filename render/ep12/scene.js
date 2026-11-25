// Épisode 12 : « Le prix des mots »
import * as THREE from 'three';
import { W, H, clamp, ease, lerp, lerpV, v3, mat, mesh, box, rbox, makeChar } from '../lib.js';
import { createWorld, bench } from '../world.js';
import { X, buildSets, poses, ruleBanner, label } from '../s2.js';

export function create(renderer, ui) {
  const w = createWorld(renderer), S = w.scene, sets = buildSets(w), { P, sit, floor } = poses(w);
  const samiStyle = { skin: '#c98e62', shirt: '#8e6a4a', pants: '#4a4a5a', hair: 'messy', hairColor: '#141414', face: { blush: true, brow: '#141414' } };
  const sami = w.add(makeChar(samiStyle)); sami.g.scale.setScalar(.62);
  const teen = w.add(makeChar({ ...samiStyle, shirt: '#3d5a80' })); teen.g.scale.setScalar(.92);
  const mom = w.add(makeChar({ skin: '#c98e62', shirt: '#d35400', pants: '#4a3a3a', apron: '#f4efe6', hair: 'bun', hairColor: '#141414', face: { blush: true, brow: '#141414' } }));
  const rich = w.add(makeChar({ skin: '#f3cba6', shirt: '#ffffff', vest: '#1a1a2a', pants: '#1a1a2a', hair: 'cap', hairColor: '#111', face: { mustache: '#3a2a1a', brow: '#2a1a10' } }));
  const richW = w.add(makeChar({ skin: '#f0c49a', shirt: '#8e44ad', pants: '#8e44ad', hair: 'bun', hairColor: '#f1c40f', face: { blush: true } }));
  const kA = w.add(makeChar({ skin: '#f0c49a', shirt: '#e74c3c', pants: '#2c3e50', hair: 'short', hairColor: '#7a3e1e', face: { blush: true } })); kA.g.scale.setScalar(.62);
  const kB = w.add(makeChar({ skin: '#e9b48a', shirt: '#27ae60', pants: '#2c3e50', hair: 'ponytail', hairColor: '#3a2414', face: { blush: true } })); kB.g.scale.setScalar(.62);
  bench(sets.street, 4, -.4);
  // pièces qui s'envolent
  const coinGeo = new THREE.CylinderGeometry(.09, .09, .025, 16), gold = mat('#f1c40f', { metalness: .8, roughness: .25, emissive: '#7a5a00', emissiveIntensity: .3 });
  const flying = []; for (let i = 0; i < 14; i++) { const c = mesh(coinGeo, gold, null); S.add(c); flying.push(c); }
  const tags = [0, 1, 2].map(() => { const l = label('-1 €', { w: .9, color: '#ffd36b', size: 120 }); S.add(l); return l; });
  const emit = (c, t, on) => { const h = w.head(c, -.2); flying.forEach((m, i) => { const ph = (t * .9 + i / 14) % 1; m.visible = on; m.position.set(h.x + Math.sin(i * 2.3) * ph * 1.2, h.y + ph * 1.4, h.z + .5 + Math.cos(i * 1.7) * ph * .8); m.rotation.set(t * 4 + i, i, t * 3); }); tags.forEach((l, i) => { const ph = (t * .6 + i / 3) % 1; l.visible = on; l.position.set(h.x + (i - 1) * .6, h.y + .6 + ph * 1.2, h.z + .4); l.material.opacity = 1 - ph; }); };
  // boîte en fer
  const tin = new THREE.Group(); S.add(tin);
  const metal = mat('#8a949e', { metalness: .7, roughness: .35 });
  box(.9, .06, .6, metal, tin, 0, .03, 0); box(.9, .4, .05, metal, tin, 0, .2, .28); box(.9, .4, .05, metal, tin, 0, .2, -.28); box(.05, .4, .6, metal, tin, .43, .2, 0); box(.05, .4, .6, metal, tin, -.43, .2, 0);
  const coins = []; for (let i = 0; i < 90; i++) { const c = mesh(coinGeo, gold, tin, -.33 + (i % 8) * .095, .07 + Math.floor(i / 40) * .03 + (i % 3) * .01, -.2 + (Math.floor(i / 8) % 5) * .1); c.rotation.set((i % 5) * .2, i, 0); coins.push(c); }
  const fillTin = (k) => coins.forEach((c, i) => { c.visible = i < k * coins.length; c.position.y = .07 + (i / coins.length) * .45 * k + (i % 3) * .01; });
  const sponge = box(.3, .15, .2, mat('#f1c40f'), null), bag = rbox(.5, .5, .35, .08, mat('#e8d8b0'), null);

  const K = X.kitchen;
  const momStand = (ry = Math.PI) => P(mom, K + 2.2, -6.6, ry);
  const holdHands = () => { P(mom, K - .2, -2.6, .6 - Math.PI / 2 + Math.PI); P(teen, K + .7, -3.8, -Math.PI + .6 + Math.PI); };
  const shots = {
    title(u, d, p, t) { w.mood('dawn'); w.shoot(v3(0, 2, 1), lerp(14, 11, p), .3, .18); },
    rule(u, d, p, t) { w.mood('day'); P(rich, 1.2, 1.4, .3); rich.setFace('laugh'); rich.head.rotation.x = Math.sin(t * 14) * .05; emit(rich, t, true); w.shoot(w.head(rich, -.4), lerp(5, 4.2, p), .4, .1); },
    rich(u, d, p, t) {
      w.mood('day'); P(rich, 1.0, 1.4, .7); P(richW, 2.2, 1.6, -.7); rich.setFace('laugh'); richW.setFace(Math.sin(t * 7) > 0 ? 'laugh' : 'smile'); emit(rich, t, true);
      rich.armR.rotation.x = -1 + Math.sin(t * 6) * .3; richW.armL.rotation.x = -.8 + Math.sin(t * 5) * .3;
      w.shoot(v3(1.6, 2.2, 1.5), lerp(5, 4.4, p), 0, .1);
    },
    poor(u, d, p, t) { w.mood('grey'); sit(mom, 3.4, -.15, 0); mom.setFace('neutral'); sit(sami, 4.6, -.15, 0); sami.setFace('neutral'); w.shoot(v3(4, 1.6, 0), lerp(4.6, 4.0, p), .1, .1); },
    sami(u, d, p, t) { w.mood('grey'); sit(sami, 4.6, -.15, 0); sami.setFace('neutral'); w.shoot(w.head(sami, -.3), lerp(2.0, 1.6, ease(p)), .15, .05); },
    whisper(u, d, p, t) {
      w.mood('day'); P(kA, -1.0, 1.6, .7); P(kB, -.3, 2.0, -1.2); kA.setFace('smile'); kB.setFace('wonder'); kA.armR.rotation.x = -1.4; kA.armR.rotation.z = -.4; kB.head.rotation.y = .6;
      P(sami, 1.8, 1.2, -1.2); sami.setFace('sad');
      w.shoot(v3(.4, 1.2, 1.5), lerp(4.6, 4.0, p), .5, .12);
    },
    coin_box(u, d, p, t) {
      w.mood('night'); sets.bedroom.userData.setLights(.5); tin.position.set(X.bedroom + 2.6, 0, -1.6); fillTin(.15);
      floor(sami, X.bedroom + 2.6, -.4, Math.PI); sami.armR.rotation.x = -lerp(.8, 1.5, Math.abs(Math.sin(t * 3))); sami.setFace('smile');
      w.shoot(v3(X.bedroom + 2.6, .4, -1.6), lerp(2.2, 1.8, ease(p)), .9, .55);
    },
    sami_mom(u, d, p, t) { w.mood('sunset'); momStand(Math.PI); mom.armR.rotation.x = -1.0 + Math.sin(t * 4) * .2; mom.armL.rotation.x = -1.0; P(sami, K - 2.6, -1.6, 2.33); sami.setFace('smile'); w.shoot(w.head(sami, -.3), lerp(2.6, 2.2, p), 2.33 + .3, .1); },
    work(u, d, p, t) {
      w.mood('day'); const i = Math.min(2, Math.floor(p * 3));
      P(teen, lerp(-4, 2, (p * 3) % 1), 1.8, Math.PI / 2); teen.setFace('neutral');
      if (i === 0) { teen.walk(t, 7, .3); teen.armR.add(bag); bag.position.set(0, -1.0, 0); teen.armR.rotation.x = -.2; }
      if (i === 1) { sets.car.visible = true; sets.car.position.set(0, 0, 4.2); teen.g.position.set(-.6, 0, 2.7); teen.g.rotation.y = Math.PI; teen.armR.rotation.x = -1.6; teen.armR.rotation.z = Math.sin(t * 8) * .5; teen.armR.add(sponge); sponge.position.set(0, -1.0, .1); }
      if (i === 2) { teen.walk(t, 6, .3); teen.torso.rotation.x = .3; teen.head.rotation.x = .3; teen.armR.rotation.x = -.9; }
      w.shoot(v3(teen.g.position.x, 1.6, 2), 5, Math.PI / 2 - .5, .12);
    },
    box_full(u, d, p, t) { w.mood('day'); tin.position.set(X.stage, .12, 8); fillTin(1); w.shoot(v3(X.stage, .4, 8), lerp(2.4, 1.8, ease(p)), .3, .7); },
    run(u, d, p, t) {
      w.mood('day'); P(mom, K - .2, -2.6, Math.PI / 2); mom.setFace('wonder');
      if (p < .55) { P(teen, lerp(K + 4, K + .7, p / .55), -2.6, -Math.PI / 2); teen.walk(t, 11, .6); teen.setFace('smile'); }
      else { P(teen, K + .7, -2.6, -Math.PI / 2); teen.setFace('smile'); teen.armL.rotation.x = -1.1; mom.armR.rotation.x = -1.1; }
      w.shoot(v3(K + .3, 1.8, -2.6), 5, .2, .12);
    },
    say(u, d, p, t) { w.mood('day'); P(mom, K - .6, -2.6, Math.PI / 2); P(teen, K + .9, -2.6, -Math.PI / 2); teen.setFace(p < .4 ? 'neutral' : 'smileClosed'); teen.armL.rotation.x = -1.1; w.shoot(w.head(teen, -.3), lerp(2.4, 2.0, ease(p)), -Math.PI / 2 + .55, .05); },
    mom_look(u, d, p, t) { w.mood('day'); P(mom, K - .6, -2.6, Math.PI / 2); P(teen, K + .9, -2.6, -Math.PI / 2); mom.setFace('neutral'); mom.armR.rotation.x = -1.1; w.shoot(w.head(mom, -.3), lerp(2.4, 2.0, ease(p)), Math.PI / 2 - .55, .05); },
    deaf(u, d, p, t) { w.mood('grey'); P(mom, K - .6, -2.6, Math.PI / 2); mom.setFace('sad'); w.shoot(w.head(mom, -.3), lerp(2.0, 1.5, ease(p)), Math.PI / 2 - .35, .03); },
    mom_close(u, d, p, t) { w.mood('grey'); P(mom, K - .6, -2.6, Math.PI / 2); mom.setFace('sad'); mom.head.rotation.x = .15; w.shoot(w.head(mom, -.3), 1.7, Math.PI / 2 - .4, -.05); },
    sign(u, d, p, t) {
      w.mood("sunset"); P(mom, K - .2, -2.6, Math.PI / 2 + .25); P(teen, K + 1.1, -3.3, -Math.PI / 2 - .4); mom.setFace("smile"); teen.setFace("wonder");
      mom.armL.rotation.x = -1.6 + Math.sin(t * 5) * .4; mom.armR.rotation.x = -1.6 + Math.cos(t * 5) * .4; mom.armL.rotation.z = Math.sin(t * 3) * .4; mom.armR.rotation.z = -Math.sin(t * 3.5) * .4;
      w.shoot(w.head(mom, -.5), lerp(4.6, 4.0, p), 1.25, .12);
    },
    final(u, d, p, t) {
      w.mood('sunset'); P(mom, K + .05, -2.6, Math.PI / 2); P(teen, K + .7, -2.6, -Math.PI / 2);
      for (const c of [mom, teen]) { c.setFace(p < .3 ? 'smile' : 'smileClosed'); c.armL.rotation.x = c.armR.rotation.x = -1.4; c.armL.rotation.z = .5; c.armR.rotation.z = -.5; }
      if (p < .3) { mom.armL.rotation.x = -1.6 + Math.sin(t * 5) * .4; mom.armR.rotation.x = -1.6 + Math.cos(t * 5) * .4; }
      w.shoot(v3(K + .4, 2.3, -2.6), lerp(3.2, 5.5, ease(p)), lerp(.1, .5, p), lerp(.05, .25, p));
    },
  };
  function render(name, u, d, p, t) {
    w.resetChars(); sets.reset(); emit(rich, 0, false); tin.position.set(0, -50, 0); sponge.removeFromParent(); bag.removeFromParent();
    w.weather(null); (shots[name] || shots.title)(u, d, p, t); w.render();
  }
  function overlay(name, u, d, t) {
    if (name === 'title') { ui.badge('LE PRIX DES MOTS', u - .1, { size: 46, y: H * .14, bg: '#141a33', border: '#ffd36b', color: '#ffd36b' }); }
    if (name === 'rule') ruleBanner(ui, '1 MOT = 1 €', u - .3, W, H);
    if (name === 'sami') ui.badge('8 ANS', u - .2, { size: 56, y: H * .12 });
    if (name === 'whisper') ui.badge('« IL EST MUET ? »', u - .2, { size: 42, bg: '#3b0f12', border: '#ff7b7b', color: '#ff9b9b', y: H * .12 });
    if (name === 'work') ui.badge('6 ANS', u - .2, { size: 56, bg: '#141a33', border: '#ffd36b', color: '#ffd36b', y: H * .12 });
    if (name === 'box_full') ui.badge('14 ANS', u - .2, { size: 56, y: H * .12 });
    if (name === 'say') ui.badge('-3 €', u - d * .45, { size: 64, bg: '#3a2c00', border: '#ffd21f', color: '#ffe14d', y: H * .12 });
    if (name === 'deaf') ui.badge('SOURDE', u - .3, { size: 58, bg: '#3b0f12', border: '#ff7b7b', color: '#ff9b9b', y: H * .12 });
  }
  return { render, overlay };
}
