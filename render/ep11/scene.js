// Épisode 11 : « Les cheveux blancs »
import * as THREE from 'three';
import { W, H, clamp, ease, lerp, lerpV, v3, mat, mesh, box, rbox, makeChar } from '../lib.js';
import { createWorld } from '../world.js';
import { X, buildSets, poses, sepiaOverlay, ruleBanner } from '../s2.js';

export function create(renderer, ui) {
  const w = createWorld(renderer), S = w.scene, sets = buildSets(w), { P, sit, lie, sitBed } = poses(w);
  const kid = (shirt, hair, hc, skin = '#f0c49a') => { const c = w.add(makeChar({ skin, shirt, pants: '#2c3e50', hair, hairColor: hc, face: { blush: true, brow: '#1a1a1a' } })); c.g.scale.setScalar(.62); return c; };
  const noah = w.add(makeChar({ skin: '#f0c49a', shirt: '#5a7bb0', pants: '#3b3f4f', hair: 'messy', hairColor: '#f4f4f4', face: { blush: true, brow: '#d8d8d8' } })); noah.g.scale.setScalar(.62);
  const k1 = kid('#e74c3c', 'short', '#141414'), k2 = kid('#27ae60', 'ponytail', '#141414', '#a56b46'), k3 = kid('#f1c40f', 'messy', '#141414', '#e9b48a');
  const mom = w.add(makeChar({ skin: '#f3cba6', shirt: '#e8d8f0', pants: '#e8d8f0', hair: 'long', hairColor: '#1a1414', face: { blush: true, brow: '#1a1414' } }));
  const momW = w.add(makeChar({ skin: '#f3cba6', shirt: '#e8d8f0', pants: '#e8d8f0', hair: 'long', hairColor: '#f2f2f2', face: { brow: '#d0d0d0' } }));
  // la perruque
  const wig = new THREE.Group(); const hm = mat('#1a1414', { roughness: .9 });
  rbox(1.06, .3, 1.0, .12, hm, wig, 0, .3, 0); box(1.06, 1.1, .3, hm, wig, 0, -.1, -.36); for (const s of [-1, 1]) box(.14, .9, .5, hm, wig, .5 * s, -.05, -.12);
  wig.scale.setScalar(.62);
  const flowers = new THREE.Group(); sets.bedroom.add(flowers);
  for (let i = 0; i < 9; i++) mesh(new THREE.SphereGeometry(.09, 8, 6), mat(['#ffffff', '#f7c6d9', '#ffe08a'][i % 3]), flowers, -1.9 + (i % 3) * .35, 1.78, -3.6 + Math.floor(i / 3) * .3, false);

  let sepia = false;
  const B = X.bedroom, momHead = v3(B - 1.5, 1.42, -5.95);
  const holdWig = () => { noah.g.add(wig); wig.position.set(0, 1.55, .75); wig.rotation.set(.3, 0, 0); noah.armL.rotation.x = noah.armR.rotation.x = -1.3; };
  const bedside = () => { P(noah, B - .2, -5.5, -Math.PI / 2); };
  const shots = {
    rule(u, d, p, t) { w.mood('dawn'); P(k1, lerp(-6, -2, p), 1.2, Math.PI / 2); P(k2, lerp(-7, -3, p), 1.8, Math.PI / 2); k1.walk(t); k2.walk(t + .5); w.shoot(v3(-3, 1.6, 1.5), lerp(9, 7.5, p), .45, .15); },
    kids(u, d, p, t) {
      w.mood('day'); P(k1, -25, 1.2, .3); P(k2, -23.8, 1.4, -.4); P(k3, -24.4, 2.4, Math.PI - .2);
      for (const c of [k1, k2, k3]) { c.setFace('laugh'); c.torso.position.y = 1.5 + Math.abs(Math.sin(t * 10)) * .03; }
      w.shoot(v3(-24.4, 1.3, 1.6), lerp(4.6, 3.8, p), .2, .2);
    },
    noah_reveal(u, d, p, t) { w.mood('day'); P(noah, -21, 1.6, -.3); noah.setFace('sad'); w.shoot(w.head(noah, -.25), lerp(2.2, 1.7, ease(p)), -.3, .05); },
    noah_walk(u, d, p, t) { w.mood('day'); P(noah, lerp(-14, -19, p), 1.4, -Math.PI / 2); noah.walk(t, 7, .35); noah.setFace('sad'); noah.head.rotation.x = .2; w.shoot(w.head(noah, -.6), 3.6, -Math.PI / 2 + .6, .1); },
    kids_mock(u, d, p, t) {
      w.mood('day'); const C = X.classroom; sit(k1, C - 3, -4.35, Math.PI); sit(k2, C, -4.35, Math.PI); sit(noah, C + 3, -1.75, Math.PI);
      for (const c of [k1, k2]) { c.setFace('laugh'); c.g.rotation.y = Math.PI - 1.1; c.armR.rotation.x = -1.5; c.torso.position.y = 1.5 + Math.abs(Math.sin(t * 12)) * .03; }
      noah.setFace('sad'); noah.head.rotation.x = .3;
      w.shoot(v3(C + .5, 1.4, -3.5), lerp(6.0, 5.4, p), Math.PI + .25, .25);
    },
    noah_alone(u, d, p, t) {
      w.mood('day'); const C = X.classroom; sit(noah, C + 3, -1.75, Math.PI); noah.setFace('sad'); noah.head.rotation.x = .35;
      sit(k1, C - 3, -4.35, Math.PI); sit(k2, C - 3, -1.75, Math.PI); sit(k3, C, -4.35, Math.PI);
      w.shoot(w.head(noah, -.5), lerp(4.2, 3.4, ease(p)), Math.PI + .5, .25);
    },
    mom_bed(u, d, p, t) { w.mood('night'); sets.bedroom.userData.setLights(.6); lie(mom, B, sets.blanket); mom.setFace('sad'); w.shoot(momHead, lerp(3.4, 2.6, ease(p)), .35, .9); },
    bedside(u, d, p, t) { w.mood('night'); sets.bedroom.userData.setLights(.6); lie(mom, B, sets.blanket); mom.setFace('smile'); bedside(); noah.setFace('smile'); noah.armR.rotation.x = -.5; w.shoot(v3(B - 1, 1.5, -5.4), lerp(4.6, 4.2, p), .7, .3); },
    noah_lie(u, d, p, t) { w.mood('night'); sets.bedroom.userData.setLights(.6); bedside(); noah.setFace('smile'); noah.armL.rotation.x = -.6 + Math.sin(t * 6) * .2; w.shoot(w.head(noah, -.3), lerp(1.9, 1.6, ease(p)), -Math.PI / 2, .05); },
    mom_smile(u, d, p, t) { w.mood('night'); sets.bedroom.userData.setLights(.6); lie(mom, B, sets.blanket); mom.setFace('smileClosed'); w.shoot(momHead, lerp(1.7, 1.5, p), 0, 1.25); },
    mirror(u, d, p, t) { w.mood('dawn'); sets.bedroom.userData.setLights(.4); P(noah, B + 2.6, -3.2, .2, .62); noah.legL.rotation.x = noah.legR.rotation.x = -1.5; noah.setFace('sad'); noah.head.rotation.x = .2; w.shoot(w.head(noah, -.25), lerp(1.8, 1.5, ease(p)), .2, .1); },
    nights(u, d, p, t) { w.mood('night'); sets.bedroom.userData.setLights(.5); lie(mom, B, sets.blanket); mom.setFace('smileClosed'); bedside(); noah.setFace('smile'); w.shoot(v3(B - 1, 1.4, -5), 5, lerp(.2, 1.1, p), .35); },
    empty_bed(u, d, p, t) { w.mood('grey'); sets.bedroom.userData.setLights(0); w.weather('snow', t, v3(B + 1.6, 0, -16)); w.shoot(v3(B - 1.5, 1.2, -4.5), lerp(5.5, 4.5, ease(p)), .35, .3); },
    last_time(u, d, p, t) {
      w.mood('grey'); sets.bedroom.userData.setLights(.5); lie(mom, B, sets.blanket); mom.setFace('sleep'); flowers.visible = true; bedside();
      noah.setFace('sad'); noah.armR.rotation.x = -lerp(.4, 1.5, ease(p)); noah.armR.rotation.z = -.3;
      w.shoot(momHead, lerp(2.8, 2.4, ease(p)), .35, .95);
    },
    wig_hands(u, d, p, t) { w.mood('grey'); sets.bedroom.userData.setLights(.5); P(noah, B + .9, -4.0, .5); holdWig(); noah.setFace('wonder'); w.shoot(w.head(noah, -.6), lerp(2.8, 2.3, ease(p)), .5, .08); },
    wig_close(u, d, p, t) { w.mood('grey'); sets.bedroom.userData.setLights(.5); P(noah, B + .9, -4.0, .5); holdWig(); noah.setFace('cry'); w.shoot(w.head(noah, -.9), lerp(1.9, 1.5, ease(p)), .5, .2); },
    mom_white(u, d, p, t) { w.mood('grey'); sets.bedroom.userData.setLights(.5); lie(momW, B, sets.blanket); momW.setFace('sleep'); flowers.visible = true; w.shoot(momHead, lerp(2.0, 1.6, ease(p)), 0, 1.2); },
    memory(u, d, p, t) { w.mood('night'); sepia = true; sitBed(mom, B, sets.blanket); mom.setFace('smile'); bedside(); noah.g.position.z = -4.0; noah.setFace('smile'); w.shoot(w.head(mom, -.4), lerp(3.4, 3.0, p), .45, .1); },
    final(u, d, p, t) { w.mood('night'); sepia = true; sitBed(mom, B, sets.blanket); mom.setFace(p < .6 ? 'smile' : 'smileClosed'); mom.head.rotation.y = .35; w.shoot(w.head(mom, -.1), lerp(2.4, 2.0, ease(p)), .35, .02); },
  };
  function render(name, u, d, p, t) { w.resetChars(); sets.reset(); sepia = false; wig.removeFromParent(); flowers.visible = false; w.weather(null); (shots[name] || shots.rule)(u, d, p, t); w.render(); }
  function overlay(name, u, d, t) {
    if (sepia) sepiaOverlay(ui.ctx, W, H);
    if (name === 'rule') ruleBanner(ui, '1 MENSONGE|= 1 CHEVEU BLANC', u - .3, W, H);
    if (name === 'noah_walk') ui.badge('9 ANS', u - .2, { size: 56, y: H * .12 });
    if (name === 'kids_mock') ui.badge('« LE MENTEUR »', u - .2, { size: 46, bg: '#3b0f12', border: '#ff7b7b', color: '#ff9b9b', y: H * .12 });
    if (name === 'mirror') ui.badge('+1 CHEVEU BLANC', u - .2, { size: 44, y: H * .12 });
    if (name === 'nights') ui.badge('2 ANS', u - .2, { size: 56, bg: '#141a33', border: '#ffd36b', color: '#ffd36b', y: H * .12 });
    if (name === 'wig_close') ui.badge('UNE PERRUQUE', u - .1, { size: 50, bg: '#3b0f12', border: '#ff7b7b', color: '#ff9b9b', y: H * .12 });
  }
  return { render, overlay };
}
