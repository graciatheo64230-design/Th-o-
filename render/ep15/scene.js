// Épisode 15 : « Le vœu »
import * as THREE from 'three';
import { W, H, clamp, ease, lerp, lerpV, v3, mat, mesh, box, rbox, makeChar, roundRect } from '../lib.js';
import { createWorld, card, font } from '../world.js';
import { X, buildSets, poses, ruleBanner } from '../s2.js';

export function create(renderer, ui) {
  const w = createWorld(renderer), S = w.scene, sets = buildSets(w), { P, sit, lie, sitBed } = poses(w);
  const ily = { skin: '#c98e62', pants: '#2c3e50', hair: 'messy', hairColor: '#141414', face: { blush: true, brow: '#141414' } };
  const ilyes = w.add(makeChar({ ...ily, shirt: '#c0392b' })); ilyes.g.scale.setScalar(.66);
  const teen = w.add(makeChar({ ...ily, shirt: '#2e5fa8' })); teen.g.scale.setScalar(.92);
  const mom = w.add(makeChar({ skin: '#c98e62', shirt: '#9b59b6', pants: '#4a3a5a', hair: 'long', hairColor: '#141414', face: { blush: true, brow: '#141414' } }));
  const momPj = w.add(makeChar({ skin: '#c98e62', shirt: '#e8d8f0', pants: '#e8d8f0', hair: 'long', hairColor: '#141414', face: { brow: '#141414' } }));
  const doc = w.add(makeChar({ skin: '#f0c49a', shirt: '#9fd3f0', coat: '#f4f6f8', pants: '#3b3f4f', hair: 'short', hairColor: '#9a9a9a', face: { glasses: true, brow: '#777' } }));
  const merch = w.add(makeChar({ skin: '#e9b48a', shirt: '#5a3a7a', coat: '#3a2a5a', pants: '#2a1a3a', hair: 'cap', hairColor: '#3a2a5a', face: { mustache: '#f2f2f2', wrinkles: true, brow: '#e0e0e0' } }));
  // orbe du souvenir + bocal
  const orbM = mat('#ffe07a', { emissive: '#ffcf40', emissiveIntensity: 3 });
  const orb = mesh(new THREE.SphereGeometry(.13, 16, 12), orbM, null, 0, 0, 0, false); S.add(orb);
  const orbLight = new THREE.PointLight('#ffd060', 0, 4, 1.5); orb.add(orbLight);
  const SH = X.shop;
  const jar = new THREE.Group(); jar.position.set(SH + .4, 1.3, -4.6); S.add(jar);
  mesh(new THREE.CylinderGeometry(.28, .28, .6, 18), new THREE.MeshStandardMaterial({ color: '#dfefff', transparent: true, opacity: .3, roughness: .05 }), jar, 0, .3, 0, false);
  mesh(new THREE.CylinderGeometry(.3, .3, .08, 18), mat('#8a5a36'), jar, 0, .62, 0);
  const jarImg = card(jar, .32, .32, 256, (g, W2, H2) => { g.fillStyle = '#ffe9b0'; g.beginPath(); g.arc(128, 128, 124, 0, 7); g.fill(); g.fillStyle = '#c98e62'; roundRect(g, 64, 70, 128, 120, 26); g.fill(); g.fillStyle = '#141414'; g.fillRect(58, 60, 140, 30); g.fillRect(58, 60, 22, 120); g.fillRect(176, 60, 22, 120); g.fillRect(96, 118, 12, 16); g.fillRect(148, 118, 12, 16); g.strokeStyle = '#141414'; g.lineWidth = 6; g.beginPath(); g.arc(128, 150, 18, .2, Math.PI - .2); g.stroke(); }, 0, .3, 0, { depth: .005, glow: 1.2 });
  jarImg.set();
  const book = new THREE.Group(); box(.5, .06, .36, mat('#c0392b'), book, 0, 0, 0); box(.46, .07, .33, mat('#fdfaf2'), book, 0, .01, 0);
  const B = X.bedroom, Hs = X.hospital;
  const ilyesBed = (face) => { sitBed(ilyes, B, sets.blanket); ilyes.setFace(face); };
  const merchStand = () => P(merch, SH + 0, -5.6, 0);

  const shots = {
    title(u, d, p, t) { w.mood('night'); sets.shop.userData.setLights(1.4); merchStand(); merch.setFace('smile'); w.shoot(v3(SH, 2.2, -5.5), lerp(7.5, 6.5, p), .15, .1); },
    rule(u, d, p, t) { w.mood('night'); sets.shop.userData.setLights(1.4); merchStand(); merch.setFace('smile'); w.shoot(v3(SH - .5, 2.3, -6.5), lerp(5.6, 4.8, p), -.25, .08); },
    jars(u, d, p, t) { w.mood('night'); sets.shop.userData.setLights(1.4); w.shoot(v3(SH + lerp(-2, 1, p), 2.3, -7.5), 3.4, 0, .05); },
    mom_sick(u, d, p, t) { w.mood('grey'); lie(momPj, Hs, sets.hblanket); momPj.setFace('sad'); sets.monitor.set(t); P(ilyes, Hs - .2, -5.5, -Math.PI / 2); ilyes.setFace('sad'); w.shoot(v3(Hs - 1, 1.6, -5.3), lerp(4.6, 4, p), .7, .3); },
    doctor(u, d, p, t) { w.mood('grey'); P(doc, Hs + 1.2, -3.4, -.5); doc.setFace('sad'); doc.head.rotation.y = Math.sin(t * 4) * .2; w.shoot(w.head(doc, -.35), lerp(2.6, 2.2, ease(p)), -.4, .05); },
    shop(u, d, p, t) { w.mood('night'); sets.shop.userData.setLights(1.4); merchStand(); merch.setFace('neutral'); P(ilyes, SH + .2, lerp(-.8, -3.4, ease(clamp(p * 1.3))), Math.PI); if (p < .75) ilyes.walk(t, 6, .35); w.shoot(v3(SH, 1.8, -4.2), lerp(6, 5.2, p), .5, .15); },
    ask(u, d, p, t) { w.mood('night'); sets.shop.userData.setLights(1.4); P(ilyes, SH + .2, -3.4, Math.PI); ilyes.setFace('angry'); ilyes.head.rotation.x = -.2; w.shoot(w.head(ilyes, -.3), lerp(2.0, 1.7, ease(p)), Math.PI + .25, .1); },
    merchant(u, d, p, t) { w.mood('night'); sets.shop.userData.setLights(1.4); merchStand(); merch.setFace(p < .5 ? 'neutral' : 'smile'); merch.head.rotation.x = .1; w.shoot(w.head(merch, -.35), lerp(2.6, 2.2, ease(p)), .25, .05); },
    merchant_close(u, d, p, t) { w.mood('night'); sets.shop.userData.setLights(1.4); merchStand(); merch.setFace('sad'); merch.armR.rotation.x = -1.3; w.shoot(w.head(merch, -.35), lerp(2.0, 1.7, ease(p)), .1, .03); },
    take(u, d, p, t) {
      w.mood('night'); sets.shop.userData.setLights(.8); P(ilyes, SH + .2, -3.4, Math.PI); ilyes.setFace('sleep'); merchStand(); merch.setFace('sad');
      orb.visible = true; orbLight.intensity = 6; const h = w.head(ilyes, .1); const k = ease(clamp(p * 1.3));
      orb.position.set(lerp(h.x, SH + .4, k), lerp(h.y, 1.6, k) + Math.sin(k * Math.PI) * .8, lerp(h.z, -4.6, k)); orb.scale.setScalar(.6 + Math.sin(t * 9) * .1);
      w.shoot(v3(SH + .3, 1.9, -4.0), lerp(3.6, 3.2, p), 1.2, .15);
    },
    mom_up(u, d, p, t) { w.mood('dawn'); sitBed(momPj, Hs, sets.hblanket); momPj.setFace('smileClosed'); momPj.armL.rotation.x = momPj.armR.rotation.x = -lerp(0, 2.6, ease(p)); w.shoot(w.head(momPj, -.3), lerp(3.2, 2.6, ease(p)), .3, .05); },
    mom_run(u, d, p, t) { w.mood('dawn'); ilyesBed('neutral'); P(mom, lerp(B + 3.5, B + .4, ease(p)), -3.2, -Math.PI / 2 - .4); mom.walk(t, 10, .6 * (1 - p)); mom.setFace('cry'); mom.armL.rotation.x = mom.armR.rotation.x = -1.4; w.shoot(v3(B + .6, 1.8, -3.8), lerp(6.4, 5.8, p), .1, .15); },
    look(u, d, p, t) { w.mood('dawn'); ilyesBed('neutral'); ilyes.head.rotation.y = -.5; w.shoot(w.head(ilyes, -.3), lerp(2.0, 1.7, ease(p)), -.3, .05); },
    who(u, d, p, t) { w.mood('dawn'); ilyesBed(p < .4 ? 'neutral' : 'wonder'); ilyes.head.rotation.y = -.5; ilyes.head.rotation.z = .12; w.shoot(w.head(ilyes, -.25), lerp(1.7, 1.45, ease(p)), -.45, .03); },
    jar_mom(u, d, p, t) { w.mood('night'); sets.shop.userData.setLights(.6); orb.visible = true; orb.position.set(SH + .4, 1.6, -4.6); orbLight.intensity = 5; w.shoot(v3(SH + .4, 1.6, -4.6), lerp(1.8, 1.2, ease(p)), .1, .1); },
    years(u, d, p, t) { w.mood('sunset'); P(teen, B + 1.6, -6.6, Math.PI); teen.setFace('neutral'); P(mom, B - 1.8, -2.6, 2.4); mom.setFace('sad'); w.shoot(v3(B, 1.8, -4.4), lerp(5.4, 4.8, p), -.5, .15); },
    read(u, d, p, t) {
      w.mood('night'); sets.bedroom.userData.setLights(.6); lie(ilyes, B, sets.blanket); ilyes.setFace('smile');
      sit(mom, B + .1, -5.3, -.35); mom.setFace('smile'); mom.armL.rotation.x = mom.armR.rotation.x = -1.2;
      mom.armR.add(book); book.position.set(-.3, -1.0, .35); book.rotation.set(-.7, 0, 0);
      w.shoot(v3(B - .6, 1.6, -5.4), lerp(4.4, 3.8, p), .2, .3);
    },
    final(u, d, p, t) {
      w.mood('night'); sets.bedroom.userData.setLights(.5); lie(ilyes, B, sets.blanket); ilyes.setFace('smileClosed');
      sit(mom, B + .1, -5.3, -.35); mom.setFace('cry'); mom.armL.rotation.x = -1.2; mom.armR.rotation.x = -1.2; mom.armR.add(book); book.position.set(-.3, -1.0, .35); book.rotation.set(-.7, 0, 0);
      if (p < .5) w.shoot(w.head(mom, -.3), lerp(2.4, 2.1, p), -.25, .05); else w.shoot(v3(B - 1, 1.6, -5), lerp(3.5, 6, ease((p - .5) * 2)), .6, lerp(.2, .45, (p - .5) * 2));
    },
  };
  function render(name, u, d, p, t) { w.resetChars(); sets.reset(); orb.visible = false; orbLight.intensity = 0; book.removeFromParent(); w.weather(null); (shots[name] || shots.title)(u, d, p, t); w.render(); }
  function overlay(name, u, d, t) {
    if (name === 'title') { ui.badge('ÉPISODE 15', u - .1, { size: 46, y: H * .12 }); ui.badge('LE VŒU', u - .4, { size: 50, y: H * .2, bg: '#141a33', border: '#ffd36b', color: '#ffd36b', rot: .02 }); }
    if (name === 'rule') ruleBanner(ui, 'À 12 ANS :|1 SOUVENIR = 1 VŒU', u - .3, W, H);
    if (name === 'shop') ui.badge('12 ANS', u - .2, { size: 56, y: H * .12 });
    if (name === 'jar_mom') ui.badge('SON PLUS BEAU SOUVENIR', u - .2, { size: 38, bg: '#3a2c00', border: '#ffd21f', color: '#ffe14d', y: H * .12 });
    if (name === 'years') ui.badge('DES ANNÉES PLUS TARD', u - .2, { size: 40, bg: '#141a33', border: '#ffd36b', color: '#ffd36b', y: H * .12 });
    if (name === 'final') { const c = ui.ctx, k = clamp((u / d - .85) * 7); if (k > 0) { c.fillStyle = `rgba(0,0,0,${k})`; c.fillRect(0, 0, W, H); } }
  }
  return { render, overlay };
}
