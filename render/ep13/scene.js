// Épisode 13 : « Le compteur »
import * as THREE from 'three';
import { W, H, clamp, ease, lerp, lerpV, v3, mat, mesh, box, makeChar } from '../lib.js';
import { createWorld } from '../world.js';
import { X, buildSets, poses, ruleBanner, label, sepiaOverlay } from '../s2.js';

export function create(renderer, ui) {
  const w = createWorld(renderer), S = w.scene, sets = buildSets(w), { P, sit, lie, floor } = poses(w);
  const tom = w.add(makeChar({ skin: '#f0c49a', shirt: '#2e86de', pants: '#2c3e50', hair: 'messy', hairColor: '#6a3a1a', face: { blush: true, brow: '#4a2a14' } })); tom.g.scale.setScalar(.64);
  const enzo = w.add(makeChar({ skin: '#a56b46', shirt: '#e67e22', pants: '#3b3f4f', hair: 'short', hairColor: '#141414', face: { blush: true, brow: '#141414' } })); enzo.g.scale.setScalar(.64);
  const ppl = [
    w.add(makeChar({ skin: '#f3cba6', shirt: '#8e44ad', pants: '#2c3e50', hair: 'long', hairColor: '#c97a2a', face: {} })),
    w.add(makeChar({ skin: '#e9b48a', shirt: '#7f8c8d', pants: '#34495e', coat: '#34495e', hair: 'short', hairColor: '#3a2a1a', face: { mustache: '#3a2a1a' } })),
    w.add(makeChar({ skin: '#f0c49a', shirt: '#c0392b', pants: '#4a4a5a', hair: 'bald', hairColor: '#dcdcdc', face: { wrinkles: true, brow: '#ccc' } })),
  ];
  const nums = ['12 045', '3 210', '41'];
  const lp = ppl.map((c, i) => { const l = label(nums[i], { w: 1.4, color: '#ffffff' }); S.add(l); return l; });
  const lT = label('', { w: 1.2 }), lE = label('', { w: 1.2 }); S.add(lT, lE);
  const above = (l, c, txt, col) => { const h = w.head(c, .75); l.visible = true; l.position.copy(h); l.userData.set(txt, col); };
  let flash = 0, black = 0, sepia = false;
  const RED = '#ff4b4b', GREEN = '#5dff8f';
  const PK = X.park, Hs = X.hospital;

  const shots = {
    title(u, d, p, t) { w.mood('dawn'); ppl.forEach((c, i) => { P(c, -6 + i * 4, 1.4 + (i % 2) * .8, Math.PI / 2); c.walk(t + i, 5, .3); above(lp[i], c, nums[i]); }); w.shoot(v3(-2, 2.4, 1.6), lerp(11, 9, p), .3, .15); },
    rule(u, d, p, t) { w.mood('day'); ppl.forEach((c, i) => { P(c, lerp(-5, -2, p) + i * 3, 1.4 + (i % 2) * .8, Math.PI / 2); c.walk(t + i, 6, .35); above(lp[i], c, nums[i]); }); w.shoot(v3(-.5, 2.6, 1.8), lerp(8, 7, p), .25, .12); },
    own(u, d, p, t) {
      w.mood('day'); P(tom, 1.5, 1.8, .2); tom.setFace('wonder'); tom.head.rotation.x = -.45; above(lT, tom, '?', '#bbbbbb');
      P(ppl[0], 3.2, 1.0, -.6); above(lp[0], ppl[0], nums[0]);
      w.shoot(w.head(tom, -.3), lerp(3.4, 2.8, ease(p)), .25, .1);
    },
    tom_enzo(u, d, p, t) { w.mood('dawn'); P(tom, -21, 1.6, Math.PI / 2 - .3); P(enzo, -19.4, 1.8, -Math.PI / 2 + .3); tom.setFace('smile'); enzo.setFace('laugh'); enzo.armR.rotation.x = -2.7; enzo.armR.rotation.z = .3 + Math.sin(t * 8) * .3; above(lE, enzo, '1', RED); w.shoot(v3(-20.2, 1.4, 1.7), lerp(4.6, 4, p), 0, .12); },
    one(u, d, p, t) { w.mood('dawn'); P(enzo, -19.4, 1.8, -Math.PI / 2 + .3); enzo.setFace('smile'); above(lE, enzo, '1', RED); const h = w.head(enzo, .4); w.shoot(h, lerp(2.4, 1.7, ease(p)), -Math.PI / 2 + .5, .05); },
    tom_silent(u, d, p, t) { w.mood('dawn'); P(tom, -21, 1.6, Math.PI / 2 - .3); tom.setFace(p < .5 ? 'sad' : 'smile'); w.shoot(w.head(tom, -.3), lerp(2.0, 1.7, ease(p)), Math.PI / 2 - .3, .03); },
    follow(u, d, p, t) {
      w.mood('day'); const x = lerp(-14, -9, p); P(tom, x, 1.4, Math.PI / 2); P(enzo, x + .1, 2.3, Math.PI / 2); tom.walk(t, 7, .35); enzo.walk(t + .4, 7, .35);
      tom.armL.rotation.x = -.6; tom.armL.rotation.z = -.6; tom.setFace('neutral'); enzo.setFace('laugh'); above(lE, enzo, '1', RED);
      w.shoot(v3(x, 1.4, 1.8), 4.4, Math.PI / 2 - .7, .12);
    },
    ladder(u, d, p, t) {
      w.mood('day'); P(enzo, PK + 8.4, .2, Math.PI, p < .45 ? .3 : 0); enzo.armL.rotation.x = enzo.armR.rotation.x = -2.6; enzo.setFace('laugh'); above(lE, enzo, '1', RED);
      P(tom, PK + 7.6, .9, Math.PI - .7); tom.setFace('angry'); tom.armR.rotation.x = -lerp(.4, 1.6, ease(clamp(p * 2))); if (p > .45) enzo.g.position.z = .5;
      w.shoot(v3(PK + 8, 1.6, .5), lerp(4.6, 4.0, p), .55, .15);
    },
    river(u, d, p, t) {
      w.mood('sunset'); P(enzo, PK - 1, lerp(-4.2, -3.4, ease(clamp((p - .4) * 2))), Math.PI); enzo.setFace('smile'); enzo.armL.rotation.x = enzo.armR.rotation.x = -1.2; above(lE, enzo, '1', RED);
      P(tom, PK - .2, -2.6, Math.PI + .4); tom.setFace('angry'); tom.armR.rotation.x = -1.3;
      w.shoot(v3(PK - .6, 1.4, -3.4), lerp(4.4, 3.8, p), Math.PI - .5, .2);
    },
    road(u, d, p, t) {
      w.mood('night'); sets.car.visible = true; sets.car.position.set(lerp(-26, -12, p), 0, 7.5);
      P(enzo, lerp(-1, .3, ease(clamp(p * 1.5))), lerp(2.4, 4.2, ease(clamp(p * 1.5))), 0); enzo.walk(t, 11, .6); enzo.setFace('laugh'); above(lE, enzo, '1', RED);
      P(tom, lerp(-.6, .3, p), lerp(2.0, 4.0, p), 0); tom.walk(t, 11, .6); tom.setFace('angry'); tom.armR.rotation.x = -1.6;
      if (p > .75) { enzo.g.position.z = 3.0; tom.g.position.z = 5.2; enzo.setFace('wonder'); }
      w.shoot(v3(0, 1.4, 4.5), lerp(7, 6, p), .9, .12);
    },
    impact(u, d, p, t) {
      w.mood('night'); sets.car.visible = true; sets.car.position.set(lerp(-12, -1.5, clamp(p * 3)), 0, 6.6);
      P(tom, .3, 6.0, -Math.PI / 2 + .3); tom.setFace('wonder'); P(enzo, 0, 3.0, Math.PI); enzo.setFace('wonder'); above(lE, enzo, '1', RED);
      flash = p > .3 && p < .5 ? 1 - Math.abs(p - .4) * 10 : 0; black = clamp((p - .45) * 4);
      w.shoot(v3(.3, 1.2, 6), 5, .3, .1);
    },
    hospital(u, d, p, t) {
      w.mood('grey'); lie(tom, Hs, sets.hblanket); tom.setFace('sleep'); sets.monitor.set(t);
      P(enzo, Hs - .2, -5.5, -Math.PI / 2); enzo.setFace('cry'); enzo.head.rotation.x = .2;
      w.shoot(v3(Hs - 1, 1.6, -5.2), lerp(4.6, 4, p), .7, .3);
    },
    number(u, d, p, t) { w.mood('grey'); P(enzo, Hs - .2, -5.5, -Math.PI / 2); enzo.setFace('cry'); above(lE, enzo, p < .35 ? '1' : '23 412', p < .35 ? RED : GREEN); sets.monitor.set(t); w.shoot(w.head(enzo, .3), lerp(2.6, 2.1, ease(p)), -Math.PI / 2 + .3, .05); },
    tom_smile(u, d, p, t) { w.mood('grey'); lie(tom, Hs, sets.hblanket); tom.setFace(p < .4 ? 'sleep' : 'smile'); sets.monitor.set(t); w.shoot(v3(Hs - 1.5, 1.45, -5.95 + .3), lerp(1.8, 1.5, p), 0, 1.25); },
    flash(u, d, p, t) { w.mood('dawn'); sepia = true; P(tom, -21, 1.6, Math.PI / 2 - .3); P(enzo, -19.4, 1.8, -Math.PI / 2 + .3); tom.setFace('smile'); enzo.setFace('neutral'); above(lE, enzo, '1', RED); w.shoot(w.head(tom, .3), lerp(3.4, 2.6, ease(p)), Math.PI / 2 - .2, .15); },
    tom_one(u, d, p, t) { w.mood('dawn'); sepia = true; P(tom, -21, 1.6, Math.PI / 2 - .3); tom.setFace('smile'); above(lT, tom, '1', RED); lT.scale.setScalar(.01 + 1.4 * ease(clamp(p * 3))); lT.scale.y *= .5; w.shoot(w.head(tom, .4), lerp(2.2, 1.9, p), Math.PI / 2 - .3, .1); },
    final(u, d, p, t) {
      w.mood('dawn'); sepia = true; P(tom, -21, 1.6, Math.PI / 2 - .3); P(enzo, -19.4, 1.8, -Math.PI / 2 + .3); above(lT, tom, '1', RED); above(lE, enzo, '1', RED);
      enzo.setFace(p < .55 ? 'neutral' : 'sad'); tom.setFace('laugh');
      if (p < .55) w.shoot(w.head(tom, .3), lerp(3.6, 3.2, p), Math.PI / 2 - .65, .1);
      else { lE.visible = false; enzo.head.rotation.x = .15; w.shoot(w.head(enzo, -.2), lerp(2.0, 1.6, ease((p - .55) / .45)), -Math.PI / 2 + .35, .03); }
      black = clamp((p - .85) * 6);
    },
  };
  function render(name, u, d, p, t) {
    w.resetChars(); sets.reset(); [...lp, lT, lE].forEach(l => { l.visible = false; l.scale.set(1.2, .6, 1); }); lp.forEach(l => l.scale.set(1.4, .7, 1));
    flash = 0; black = 0; sepia = false; w.weather(null); (shots[name] || shots.title)(u, d, p, t); w.render();
  }
  function overlay(name, u, d, t) {
    const c = ui.ctx;
    if (sepia) sepiaOverlay(c, W, H);
    if (flash > 0) { c.fillStyle = `rgba(255,255,255,${flash})`; c.fillRect(0, 0, W, H); }
    if (black > 0) { c.fillStyle = `rgba(0,0,0,${black})`; c.fillRect(0, 0, W, H); }
    if (name === 'title') ui.badge('LE COMPTEUR', u - .1, { size: 50, y: H * .14, bg: '#141a33', border: '#ffd36b', color: '#ffd36b' });
    if (name === 'rule') ruleBanner(ui, 'LE CHIFFRE AU-DESSUS DE TA TÊTE|= TES JOURS RESTANTS', u - .3, W, H);
    if (name === 'flash') ui.badge('CE MATIN-LÀ', u - .2, { size: 46, bg: '#3a2a14', border: '#ffd08a', color: '#ffd08a', y: H * .12 });
  }
  return { render, overlay };
}
