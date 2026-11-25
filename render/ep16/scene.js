// Épisode 16 : « La lettre du futur »
import * as THREE from 'three';
import { W, H, clamp, ease, lerp, lerpV, v3, mat, mesh, box, rbox, makeChar } from '../lib.js';
import { createWorld, card, font, room, tex } from '../world.js';
import { X, buildSets, poses, ruleBanner, sepiaOverlay, writeLines } from '../s2.js';

const paper = (g, W2, H2, tint = '#f7efdd') => { g.fillStyle = tint; g.fillRect(0, 0, W2, H2); g.strokeStyle = 'rgba(120,150,200,.3)'; g.lineWidth = 2; for (let y = 140; y < H2; y += 80) { g.beginPath(); g.moveTo(30, y); g.lineTo(W2 - 30, y); g.stroke(); } };

export function create(renderer, ui) {
  const w = createWorld(renderer), S = w.scene, sets = buildSets(w), { P, sit } = poses(w);
  const eStyle = { skin: '#f0c49a', pants: '#2c3e50', hair: 'messy', hairColor: '#5a3420', face: { blush: true, brow: '#3a2214' } };
  const ethan = w.add(makeChar({ ...eStyle, shirt: '#27ae60' })); ethan.g.scale.setScalar(.62);
  const small = w.add(makeChar({ ...eStyle, shirt: '#f1c40f' })); small.g.scale.setScalar(.48);
  const adult = w.add(makeChar({ ...eStyle, shirt: '#ffffff', coat: '#34495e', face: { brow: '#3a2214' } }));
  const dad = w.add(makeChar({ skin: '#f0c49a', shirt: '#7f8c8d', coat: '#5a4a3a', pants: '#3b3f4f', hair: 'short', hairColor: '#5a3420', face: { mustache: '#5a3420', brow: '#3a2214' } }));
  const kA = w.add(makeChar({ skin: '#a56b46', shirt: '#e74c3c', pants: '#2c3e50', hair: 'ponytail', hairColor: '#141414', face: { blush: true } })); kA.g.scale.setScalar(.62);
  const kB = w.add(makeChar({ skin: '#f3cba6', shirt: '#9b59b6', pants: '#2c3e50', hair: 'short', hairColor: '#c97a2a', face: { blush: true } })); kB.g.scale.setScalar(.62);
  const suitcase = rbox(.6, .45, .2, .05, mat('#7a4a2a'), null);
  const phone = box(.12, .35, .1, mat('#222'), null);
  // lettres qui tombent du ciel
  const glowEnv = new THREE.MeshStandardMaterial({ color: '#fff8e6', emissive: '#ffe08a', emissiveIntensity: 1.4 });
  const falling = []; for (let i = 0; i < 8; i++) { const e = box(.5, .02, .34, glowEnv, null); S.add(e); falling.push(e); }
  // cartes (table d'objets)
  const ST = X.stage;
  const flat = (c) => { c.mesh.rotation.x = -Math.PI / 2; return c; };
  const DAD = '#2b2350';
  const letterKid = card(S, 2.4, 1.8, 800, (g, W2, H2) => { paper(g, W2, H2); g.fillStyle = DAD; font(g, 700, 120, 'Caveat'); g.textAlign = 'center'; g.fillText('Pardonne à papa.', W2 / 2, H2 / 2 + 30); font(g, 700, 50, 'Caveat'); g.fillText('— Toi, plus tard', W2 / 2 + 180, H2 - 70); }, ST - 3, 3.2, 0);
  const halves = [card(S, 1.2, 1.8, 400, (g, W2, H2) => { paper(g, W2, H2); g.fillStyle = DAD; font(g, 700, 120, 'Caveat'); g.fillText('Pardon', 20, H2 / 2 + 30); }, 0, 0, 0), card(S, 1.2, 1.8, 400, (g, W2, H2) => { paper(g, W2, H2); g.fillStyle = DAD; font(g, 700, 120, 'Caveat'); g.fillText('à papa.', 10, H2 / 2 + 30); }, 0, 0, 0)];
  halves.forEach(h => h.set());
  const kidAdvice = card(S, 2.0, 1.3, 700, (g, W2, H2) => { paper(g, W2, H2); g.fillStyle = '#1f6a3a'; font(g, 700, 82, 'Caveat'); g.textAlign = 'center'; g.fillText('Travaille bien', W2 / 2, H2 / 2 - 10); g.fillText("à l'école !", W2 / 2, H2 / 2 + 80); }, ST + 3, 3.2, 0); kidAdvice.set();
  letterKid.set();
  const firstL = card(S, 2.6, 3.0, 800, (g, W2, H2, k) => { paper(g, W2, H2); writeLines(g, ['Mon fils,', '', "Pardon d'être parti.", 'Je ne voulais pas', 'que tu me voies malade.', '', '              Papa'], k, 50, 120, 80, 72, DAD); }, ST + 7, 3.2, 0);
  const draft = card(S, 2.4, 2.4, 800, (g, W2, H2, k) => {
    paper(g, W2, H2, '#efe6d0'); g.fillStyle = DAD; font(g, 700, 70, 'Caveat');
    g.fillText('Mon fils, ne m\'en veux', 50, 150); g.fillText('pas...', 50, 230);
    g.strokeStyle = DAD; g.lineWidth = 5; g.beginPath(); g.moveTo(45, 135); g.lineTo(560, 145); g.moveTo(45, 215); g.lineTo(160, 222); g.stroke();
    if (k > .5) { font(g, 700, 130, 'Caveat'); g.textAlign = 'center'; g.fillText('Pardonne à papa.', W2 / 2, 480); }
  }, ST + 11, 3.2, 0);
  // boîte en carton pleine de lettres
  const boxG = new THREE.Group(); boxG.position.set(ST, 0, 14); S.add(boxG);
  const kraft = mat('#c49a62', { roughness: .95 });
  box(3, .1, 2.2, kraft, boxG, 0, .15, 0); box(3, 1.4, .1, kraft, boxG, 0, .8, 1.05); box(3, 1.4, .1, kraft, boxG, 0, .8, -1.05); box(.1, 1.4, 2.2, kraft, boxG, -1.45, .8, 0); box(.1, 1.4, 2.2, kraft, boxG, 1.45, .8, 0);
  const envs = []; for (let i = 0; i < 36; i++) { const e = box(.9, .03, .6, mat(['#f4ead7', '#efe2c8', '#f8f0e0', '#e9f0f8'][i % 4]), boxG, (w.R() - .5) * 2.2, .25 + i * .028, (w.R() - .5) * 1.4); e.rotation.y = (w.R() - .5) * .8; envs.push(e); }
  const stamps = []; envs.forEach((e, i) => { if (i % 3 === 0) { const s = box(.14, .01, .16, mat('#c0392b'), e, .3, .02, -.15); stamps.push(s); } });
  // appartement adulte (chambre réutilisée)
  const B = X.bedroom;
  let sepia = false, fadeEnd = 0;

  const shots = {
    title(u, d, p, t) { w.mood('dawn'); w.shoot(v3(0, 2, 1), lerp(13, 10.5, p), -.2, .18); },
    rule(u, d, p, t) {
      w.mood('day'); P(ethan, -.6, 1.6, .2); P(kA, .8, 1.8, -.3); P(kB, -1.8, 2.0, .4); [ethan, kA, kB].forEach(c => { c.setFace('wonder'); c.head.rotation.x = -.5; });
      falling.forEach((e, i) => { e.visible = true; const ph = (p * 1.2 + i / 8) % 1; e.position.set(-3 + i * .8, 6 - ph * 5, 1 + (i % 3) * .6); e.rotation.set(Math.sin(t * 3 + i) * .6, t + i, Math.cos(t * 2 + i) * .5); });
      w.shoot(v3(-.3, 2.6, 1.8), lerp(7, 6.2, p), .2, .05);
    },
    glow(u, d, p, t) { w.mood('day'); falling[0].visible = true; falling[0].position.set(-.6, 2.0 + Math.sin(t * 2) * .1, 2.2); falling[0].rotation.set(1.3, t * .5, 0); falling[0].scale.setScalar(1.6); w.shoot(v3(-.6, 2.0, 2.2), lerp(2.2, 1.7, ease(p)), .2, .15); },
    kids(u, d, p, t) { w.mood('day'); if (p < .5) { P(kA, .8, 1.8, -.3); P(kB, -.2, 2.0, .3); kA.setFace('laugh'); kB.setFace('smile'); kA.armL.rotation.x = kA.armR.rotation.x = -1.3; w.shoot(v3(.3, 1.2, 1.9), 4, .1, .1); } else w.shoot(v3(ST + 3, 3.2, 0), lerp(4.6, 4.2, p), 0, 0); },
    letter(u, d, p, t) { w.mood('day'); w.shoot(v3(ST - 3, 3.2, 0), lerp(5.6, 5.0, ease(p)), 0, 0); },
    leave(u, d, p, t) {
      w.mood('grey'); sepia = true; P(small, -1.2, 1.4, Math.PI / 2 + .3); small.setFace('cry');
      P(dad, lerp(1.0, 5.0, ease(p)), 1.6, Math.PI / 2 - .2); dad.walk(t, 5, .3); dad.setFace('sad'); dad.armR.rotation.x = -.1; dad.armR.add(suitcase); suitcase.position.set(0, -1.05, 0);
      w.shoot(v3(2, 1.5, 1.5), lerp(6.5, 7.2, p), .25, .12);
    },
    tear(u, d, p, t) {
      w.mood('grey'); P(ethan, -.6, 1.6, .1); ethan.setFace('angry'); ethan.armL.rotation.x = ethan.armR.rotation.x = -1.4; const k = ease(clamp((p - .3) * 2.5)); ethan.armL.rotation.z = -.2 - k * .7; ethan.armR.rotation.z = .2 + k * .7;
      const h = w.head(ethan, -1.0); halves.forEach((hv, i) => { hv.mesh.visible = true; hv.mesh.scale.setScalar(.25); hv.mesh.position.set(h.x + (i ? 1 : -1) * (.16 + k * .6), h.y - k * .4, h.z + .45); hv.mesh.rotation.set(0, 0, (i ? 1 : -1) * k * .8); });
      w.shoot(w.head(ethan, -.6), lerp(2.6, 2.2, ease(p)), .1, .05);
    },
    grow(u, d, p, t) { w.mood('rain'); sets.bedroom.userData.setLights(.5); w.weather('rain', t, v3(B + 1.6, 0, -16)); P(adult, B + 1.4, -6.4, Math.PI - .2); adult.setFace('angry'); w.shoot(v3(B + 1.2, 2.2, -5.5), lerp(5, 4.4, p), .3, .1); },
    phone(u, d, p, t) { w.mood('grey'); sets.bedroom.userData.setLights(.6); P(adult, B + 1.0, -4.0, .3); adult.setFace(p < .5 ? 'neutral' : 'wonder'); adult.armR.rotation.x = -2.6; adult.armR.rotation.z = .5; adult.armR.add(phone); phone.position.set(0, -1.0, .1); w.shoot(w.head(adult, -.3), lerp(2.6, 2.2, ease(p)), .3, .05); },
    box(u, d, p, t) { w.mood('grey'); w.shoot(v3(ST, .9, 14), lerp(5.5, 4.4, ease(p)), .35, .45); },
    letters(u, d, p, t) { w.mood('grey'); w.shoot(v3(ST, .9, 14), lerp(3.6, 3.0, p), .1, 1.2); },
    unsent(u, d, p, t) { w.mood('grey'); w.shoot(v3(ST + .3, 1.2, 14), lerp(1.9, 1.5, ease(p)), .4, 1.0); },
    first(u, d, p, t) { w.mood('grey'); firstL.set(clamp(p * 1.25)); w.shoot(v3(ST + 7, 3.2, 0), lerp(6.0, 5.6, p), 0, 0); },
    draft(u, d, p, t) { w.mood('grey'); const k = ease(p); envs.forEach((e, i) => e.visible = i < 36 - k * 30); w.shoot(v3(ST, .5, 14), lerp(3.2, 2.4, k), .2, 1.15); },
    draft_close(u, d, p, t) { w.mood('grey'); draft.set(.2); w.shoot(v3(ST + 11, 3.5, 0), lerp(5.4, 5.0, p), 0, 0); },
    pardon(u, d, p, t) { w.mood('grey'); draft.set(1); w.shoot(v3(ST + 11, 2.8, 0), lerp(5.6, 5.0, ease(p)), 0, 0); },
    shock(u, d, p, t) { w.mood('grey'); sets.bedroom.userData.setLights(.6); P(adult, B + 1.0, -4.0, .3); adult.setFace('wonder'); adult.armL.rotation.x = adult.armR.rotation.x = -1.2; w.shoot(w.head(adult, -.3), lerp(2.2, 1.6, ease(p)), .3, .03); },
    final(u, d, p, t) {
      w.mood('grey'); draft.set(1);
      if (p < .55) { letterKid.mesh.position.set(ST + 11, 4.75, .02); draft.mesh.position.set(ST + 11, 2.2, 0); w.shoot(v3(ST + 11, 3.4, 0), lerp(6.6, 6.0, p), 0, 0); }
      else { P(adult, B + 1.0, -4.0, .3); adult.setFace('cry'); adult.head.rotation.x = .2; w.shoot(w.head(adult, -.3), lerp(2.2, 1.8, (p - .55) * 2), .3, .03); fadeEnd = clamp((p - .85) * 7); }
    },
  };
  function render(name, u, d, p, t) {
    w.resetChars(); sets.reset(); sepia = false; fadeEnd = 0; falling.forEach(e => { e.visible = false; e.scale.setScalar(1); }); halves.forEach(h => h.mesh.visible = false);
    suitcase.removeFromParent(); phone.removeFromParent(); envs.forEach(e => e.visible = true); letterKid.mesh.position.set(ST - 3, 3.2, 0); draft.mesh.position.set(ST + 11, 3.2, 0);
    w.weather(null); (shots[name] || shots.title)(u, d, p, t); w.render();
  }
  function overlay(name, u, d, t) {
    const c = ui.ctx;
    if (sepia) sepiaOverlay(c, W, H);
    if (fadeEnd > 0) { c.fillStyle = `rgba(0,0,0,${fadeEnd})`; c.fillRect(0, 0, W, H); }
    if (name === 'title') ui.badge('LA LETTRE DU FUTUR', u - .1, { size: 44, y: H * .14, bg: '#141a33', border: '#ffd36b', color: '#ffd36b' });
    if (name === 'rule') ruleBanner(ui, 'À 10 ANS : UNE LETTRE|DE TOI… DU FUTUR', u - .3, W, H);
    if (name === 'leave') ui.badge('5 ANS', u - .2, { size: 54, bg: '#3a2a14', border: '#ffd08a', color: '#ffd08a', y: H * .12 });
    if (name === 'grow') ui.badge('30 ANS', u - .2, { size: 54, y: H * .12 });
    if (name === 'unsent') ui.badge('JAMAIS ENVOYÉES', u - .1, { size: 46, bg: '#3b0f12', border: '#ff7b7b', color: '#ff9b9b', y: H * .12 });
    if (name === 'final' && u / d < .55) ui.badge('LA MÊME ÉCRITURE', u - .3, { size: 44, bg: '#3b0f12', border: '#ff7b7b', color: '#ff9b9b', y: H * .1 });
  }
  return { render, overlay };
}
