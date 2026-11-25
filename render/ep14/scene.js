// Épisode 14 : « Ceux qu'on oublie »
import * as THREE from 'three';
import { W, H, clamp, ease, lerp, lerpV, v3, mat, mesh, box, makeChar, roundRect } from '../lib.js';
import { createWorld, card, font } from '../world.js';
import { X, buildSets, poses, ruleBanner, setOpacity } from '../s2.js';

function drawPhoto(g, W2, H2, withBoy) {
  g.fillStyle = '#f4efe4'; g.fillRect(0, 0, W2, H2);
  const x0 = 30, y0 = 30, w = W2 - 60, h = H2 - 110;
  const sky = g.createLinearGradient(0, y0, 0, y0 + h); sky.addColorStop(0, '#9fd0f0'); sky.addColorStop(1, '#e8f4ff'); g.fillStyle = sky; g.fillRect(x0, y0, w, h);
  g.fillStyle = '#4f86b8'; g.fillRect(x0, y0 + h * .62, w, h * .38); g.fillStyle = '#6a9a4a'; g.fillRect(x0, y0 + h * .55, w, h * .08);
  g.fillStyle = '#8a5a36'; g.fillRect(x0, y0 + h * .72, w * .7, 24);
  const fig = (x, s, shirt, hair) => { const by = y0 + h * .72; g.fillStyle = shirt; g.fillRect(x - 34 * s, by - 150 * s, 68 * s, 100 * s); g.fillStyle = '#3b3f4f'; g.fillRect(x - 30 * s, by - 50 * s, 60 * s, 50 * s); g.fillStyle = '#f0c49a'; roundRect(g, x - 36 * s, by - 225 * s, 72 * s, 70 * s, 16 * s); g.fill(); g.fillStyle = hair; g.fillRect(x - 38 * s, by - 230 * s, 76 * s, 18 * s); g.fillStyle = '#222'; g.fillRect(x - 15 * s, by - 200 * s, 7 * s, 9 * s); g.fillRect(x + 8 * s, by - 200 * s, 7 * s, 9 * s); g.fillRect(x - 10 * s, by - 178 * s, 20 * s, 4 * s); };
  fig(x0 + w * .3, 1.1, '#b7a58a', '#e6e6e6');
  g.strokeStyle = '#4a3020'; g.lineWidth = 5; g.beginPath(); g.moveTo(x0 + w * .36, y0 + h * .5); g.lineTo(x0 + w * .8, y0 + h * .18); g.stroke(); g.strokeStyle = 'rgba(255,255,255,.8)'; g.lineWidth = 2; g.beginPath(); g.moveTo(x0 + w * .8, y0 + h * .18); g.lineTo(x0 + w * .82, y0 + h * .75); g.stroke();
  if (withBoy) fig(x0 + w * .55, .7, '#16a085', '#c97a2a');
  g.fillStyle = '#5a4a3a'; font(g, 700, 44, 'Caveat'); g.textAlign = 'center'; g.fillText(withBoy ? 'Papy & Nils — le lac' : 'Papy — le lac', W2 / 2, H2 - 40);
}

export function create(renderer, ui) {
  const w = createWorld(renderer), S = w.scene, sets = buildSets(w), { P, sit } = poses(w);
  const nils = w.add(makeChar({ skin: '#f0c49a', shirt: '#16a085', pants: '#2c3e50', hair: 'short', hairColor: '#c97a2a', face: { blush: true, brow: '#7a3e1e' } })); nils.g.scale.setScalar(.62);
  const papy = w.add(makeChar({ skin: '#f0c49a', shirt: '#b7a58a', vest: '#7a6a5a', pants: '#4a4a5a', hair: 'bald', hairColor: '#e6e6e6', face: { mustache: '#ececec', glasses: true, wrinkles: true, brow: '#d0d0d0' } }));
  const nurse = w.add(makeChar({ skin: '#c98e62', shirt: '#9fd3f0', pants: '#9fd3f0', hair: 'bun', hairColor: '#3a2414', face: { blush: true } }));
  const passer = w.add(makeChar({ skin: '#f3cba6', shirt: '#8e44ad', pants: '#2c3e50', hair: 'long', hairColor: '#7a3e1e', face: {} }));
  const kA = w.add(makeChar({ skin: '#f0c49a', shirt: '#e74c3c', pants: '#2c3e50', hair: 'messy', hairColor: '#3a2414', face: { blush: true } })); kA.g.scale.setScalar(.62);
  const kB = w.add(makeChar({ skin: '#a56b46', shirt: '#f1c40f', pants: '#2c3e50', hair: 'ponytail', hairColor: '#141414', face: { blush: true } })); kB.g.scale.setScalar(.62);
  const photoBig = card(S, 2.4, 1.8, 800, drawPhoto, X.stage, .12, 8); photoBig.mesh.rotation.x = -Math.PI / 2;
  const photoHand = card(null, .5, .38, 400, drawPhoto, 0, 0, 0, { depth: .01 });
  const Hs = X.hospital;
  const papySit = () => { sit(papy, Hs + 1.0, -4.0, -Math.PI / 2 - .3); };
  const nilsBy = () => P(nils, Hs - .5, -4.7, 1.2);
  const holdPhoto = (withBoy = true) => { papy.armL.rotation.x = papy.armR.rotation.x = -1.2; papy.armR.add(photoHand.mesh); photoHand.mesh.position.set(-.35, -1.0, .35); photoHand.mesh.rotation.set(-.6, 0, 0); photoHand.set(withBoy); };
  const fade = (k) => setOpacity(nils, k);

  const shots = {
    title(u, d, p, t) { w.mood('grey'); w.shoot(v3(0, 2, 1), lerp(13, 10.5, p), .2, .18); },
    rule(u, d, p, t) { w.mood('grey'); P(passer, lerp(-3, 1, p), 1.6, Math.PI / 2); passer.walk(t, 5, .3); passer.setFace('sad'); setOpacity(passer, lerp(1, .05, ease(p))); w.shoot(w.head(passer, -.6), 4.2, Math.PI / 2 - .5, .1); },
    nils_walk(u, d, p, t) { w.mood('day'); fade(1); P(nils, lerp(-4, 1, p), 1.6, Math.PI / 2); nils.walk(t, 7, .35); nils.setFace('smile'); w.shoot(w.head(nils, -.5), 3.6, Math.PI / 2 - .55, .1); },
    papy(u, d, p, t) { w.mood('day'); papySit(); papy.setFace('neutral'); papy.head.rotation.y = .3; w.shoot(w.head(papy, -.4), lerp(3.4, 2.8, ease(p)), -Math.PI / 2 - .3, .05); },
    monday(u, d, p, t) { w.mood('day'); fade(1); papySit(); nilsBy(); papy.setFace('smile'); nils.setFace('smile'); papy.armL.rotation.x = -1.0; w.shoot(w.head(papy, -.6), lerp(4.2, 3.8, p), -1.27, .12); },
    wednesday(u, d, p, t) { w.mood('grey'); fade(.85); papySit(); nilsBy(); papy.setFace('neutral'); nils.setFace('smile'); w.shoot(w.head(papy, -.4), lerp(2.6, 2.2, ease(p)), -Math.PI / 2 - .3, .05); },
    friday(u, d, p, t) { w.mood('grey'); fade(.7); papySit(); nilsBy(); papy.setFace('wonder'); papy.head.rotation.y = -.2; nils.setFace('sad'); w.shoot(w.head(papy, -.4), lerp(2.4, 2.0, ease(p)), -Math.PI / 2 - .5, .05); },
    fading(u, d, p, t) { w.mood('grey'); papySit(); nilsBy(); fade(lerp(.65, .45, p)); nils.setFace('sad'); nils.head.rotation.x = .2; w.shoot(w.head(nils, -.35), lerp(2.2, 1.8, ease(p)), 2.2, .05); },
    parents(u, d, p, t) { w.mood('night'); sets.bedroom.userData.setLights(.25); P(nils, X.bedroom + 2.6, -3.2, .3, .3); nils.legL.rotation.x = nils.legR.rotation.x = -1.5; fade(.45); nils.setFace('sad'); w.shoot(v3(X.bedroom + 1.5, 1.6, -4), lerp(5, 4.4, p), .6, .2); },
    friends(u, d, p, t) {
      w.mood('day'); P(kA, -1, 2.2, .6); P(kB, .2, 2.6, -.8); kA.setFace('laugh'); kB.setFace('laugh'); kA.armR.rotation.x = -2.2; kB.torso.position.y = 1.5 + Math.abs(Math.sin(t * 10)) * .03;
      P(nils, lerp(3.5, 1.4, p), 1.4, -Math.PI / 2); nils.walk(t, 5, .3); fade(.4); nils.setFace('sad');
      w.shoot(v3(.8, 1.3, 2), lerp(5, 4.4, p), .3, .15);
    },
    last(u, d, p, t) { w.mood('sunset'); papySit(); nilsBy(); fade(.4); papy.setFace('neutral'); nils.setFace('neutral'); w.shoot(w.head(papy, -.6), lerp(5, 4.4, p), -1.2, .18); },
    photo(u, d, p, t) { w.mood('day'); photoBig.set(true); w.shoot(v3(X.stage, .12, 8), lerp(2.6, 2.1, ease(p)), 0, 1.35); },
    who(u, d, p, t) { w.mood('grey'); papySit(); nilsBy(); fade(.3); holdPhoto(true); papy.setFace(p < .5 ? 'neutral' : 'wonder'); papy.head.rotation.x = .25; w.shoot(w.head(papy, -.5), lerp(2.8, 2.4, ease(p)), -Math.PI / 2 - .3, .1); },
    hands(u, d, p, t) { w.mood('grey'); nilsBy(); fade(lerp(.25, .12, p)); nils.setFace('sad'); nils.head.rotation.x = .45; nils.armL.rotation.x = nils.armR.rotation.x = -1.3; w.shoot(w.head(nils, -.7), lerp(1.9, 1.6, ease(p)), 2.2, .35); },
    whisper(u, d, p, t) { w.mood('grey'); papySit(); nilsBy(); fade(lerp(.12, 0, ease(clamp(p * 1.1)))); nils.setFace('smileClosed'); w.shoot(w.head(nils, -.3), lerp(2.0, 2.4, p), 2.2, .05); },
    nurse(u, d, p, t) { w.mood('dawn'); papySit(); holdPhoto(false); papy.setFace('cry'); papy.head.rotation.x = .3; P(nurse, lerp(Hs + 3.2, Hs + 2.3, p), -2.4, -Math.PI / 2 - .7); nurse.setFace('sad'); nurse.walk(t, 4, .2 * (1 - p)); w.shoot(w.head(papy, -.6), lerp(4.8, 4.2, p), -1.0, .15); },
    papy_cry(u, d, p, t) { w.mood('dawn'); papySit(); holdPhoto(false); papy.setFace('cry'); papy.head.rotation.x = .2 + Math.sin(t * 7) * .03; w.shoot(w.head(papy, -.35), lerp(2.0, 1.7, ease(p)), -Math.PI / 2 - .2, .05); },
    final(u, d, p, t) { w.mood('day'); photoBig.set(false); w.shoot(v3(X.stage + .2, .12, 8), lerp(2.3, 1.5, ease(p)), 0, 1.35); },
  };
  function render(name, u, d, p, t) { w.resetChars(); sets.reset(); fade(1); setOpacity(passer, 1); photoHand.mesh.removeFromParent(); w.weather(null); (shots[name] || shots.title)(u, d, p, t); w.render(); }
  function overlay(name, u, d, t) {
    if (name === 'title') ui.badge("CEUX QU'ON OUBLIE", u - .1, { size: 44, y: H * .14, bg: '#141a33', border: '#ffd36b', color: '#ffd36b' });
    if (name === 'rule') ruleBanner(ui, "QUAND PLUS PERSONNE NE SE|SOUVIENT DE TOI, TU DISPARAIS", u - .3, W, H);
    if (name === 'nils_walk') ui.badge('10 ANS', u - .2, { size: 54, y: H * .12 });
    if (name === 'monday') ui.badge('LUNDI', u - .1, { size: 56, y: H * .12 });
    if (name === 'wednesday') ui.badge('MERCREDI', u - .1, { size: 54, bg: '#141a33', border: '#ffd36b', color: '#ffd36b', y: H * .12 });
    if (name === 'friday') ui.badge('VENDREDI', u - .1, { size: 54, bg: '#3b0f12', border: '#ff7b7b', color: '#ff9b9b', y: H * .12 });
    if (name === 'final') { const c = ui.ctx, k = clamp((u / d - .8) * 5); if (k > 0) { c.fillStyle = `rgba(0,0,0,${k})`; c.fillRect(0, 0, W, H); } }
  }
  return { render, overlay };
}
