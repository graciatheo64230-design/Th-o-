// Épisode 1 : « Le dernier croissant »
import * as THREE from 'three';
import { W, H, rng, clamp, ease, lerp, lerpV, v3, mat, mesh, box, rbox, canvasTex, redraw, roundRect, makeChar, croissantGeo, croissantMat } from '../lib.js';

export function create(renderer, ui) {
  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(50, W / H, .05, 300);
  const R = rng(7);

  // ---------- Ciel ----------
  const skyNight = canvasTex(8, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#060b22'); gr.addColorStop(.55, '#1b2350'); gr.addColorStop(1, '#5a4377'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  const skyMorning = canvasTex(8, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#9fb0c4'); gr.addColorStop(1, '#e6e9ee'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });

  // ---------- Lumières ----------
  const hemi = new THREE.HemisphereLight('#6a7bbf', '#2a2030', .8); scene.add(hemi);
  const moon = new THREE.DirectionalLight('#a8bcff', 1.3);
  moon.position.set(-10, 16, 14); moon.target.position.set(0, 0, 0);
  moon.castShadow = true; moon.shadow.mapSize.set(2048, 2048);
  Object.assign(moon.shadow.camera, { left: -16, right: 16, top: 16, bottom: -16, near: 1, far: 60 });
  moon.shadow.bias = -.0005; moon.shadow.normalBias = .02;
  scene.add(moon, moon.target);
  const inLights = [];
  const warm = (x, y, z, i, dist = 14) => { const l = new THREE.PointLight('#ffb466', i, dist, 1.6); l.position.set(x, y, z); scene.add(l); inLights.push([l, i]); return l; };
  warm(-1.5, 3.8, -1.2, 22); warm(-2.2, 3.9, -4, 18); warm(1.8, 3.9, -4, 18); warm(-1.2, 2.6, 2.4, 6, 6);
  const lampL = []; // réverbères
  // ---------- Matériaux ----------
  const snowMat = mat('#e9eef7', { roughness: 1 });
  const glassMat = new THREE.MeshStandardMaterial({ color: '#cfe3ff', transparent: true, opacity: .12, roughness: .05, metalness: .2, depthWrite: false });
  const woodTex = canvasTex(512, 512, (g, w, h) => { for (let i = 0; i < 8; i++) { g.fillStyle = ['#a8693a', '#9a5f33', '#b07240', '#94592f'][i % 4]; g.fillRect(0, i * 64, w, 64); g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(0, i * 64 + 62, w, 2); g.fillRect(((i * 197) % 400) + 50, i * 64, 2, 64); } }, { repeat: [4, 4] });
  const wallTex = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#f3dcc0'; g.fillRect(0, 0, w, h); g.fillStyle = '#ecc9a6'; for (let i = 0; i < 8; i += 2) g.fillRect(i * 32, 0, 32, h); }, { repeat: [5, 2] });
  const facadeMat = mat('#efe2c8', { roughness: .95 });
  const greenMat = mat('#1f5a43', { roughness: .7 });

  // ===================== RUE =====================
  const street = new THREE.Group(); scene.add(street);
  const ground = mesh(new THREE.PlaneGeometry(80, 60), snowMat, street, 0, 0, 10); ground.rotation.x = -Math.PI / 2;
  const road = mesh(new THREE.PlaneGeometry(80, 6), mat('#a9b3c4', { roughness: 1 }), street, 0, .01, 7); road.rotation.x = -Math.PI / 2;
  box(80, .12, .3, mat('#c9ced8'), street, 0, .06, 4);
  // façade de la boulangerie (avec ouvertures réelles)
  const F = new THREE.Group(); street.add(F);
  const fd = .4;
  box(1.2, 4.2, fd, greenMat, F, -4.4, 2.1, 0);   // gauche
  box(.8, 4.2, fd, greenMat, F, 1.2, 2.1, 0);     // entre vitrine et porte
  box(2.0, 4.2, fd, greenMat, F, 4.0, 2.1, 0);    // droite
  box(4.6, .8, fd, greenMat, F, -1.5, .4, 0);     // sous la vitrine
  box(1.4, 1.4, fd, greenMat, F, 2.3, 3.5, 0);    // au-dessus de la porte
  box(4.6, .8, fd, greenMat, F, -1.5, 3.8, 0);    // au-dessus de la vitrine
  box(10, 4, fd, facadeMat, F, 0, 6.2, 0);        // étage
  box(10.6, .3, .9, mat('#2c2a33'), F, 0, 8.3, .1); // corniche
  box(1, 1.6, 1, mat('#8a4a3a'), F, 3, 9, -1);    // cheminée
  box(10.4, .2, .5, mat('#d9c9a8'), F, 0, 4.25, .1);
  const glass = mesh(new THREE.PlaneGeometry(4.6, 2.6), glassMat, F, -1.5, 2.1, .02, false);
  box(4.7, .08, .1, mat('#d8b35a', { metalness: .6, roughness: .3 }), F, -1.5, .82, .22);
  // fenêtres de l'étage
  const winOn = mat('#ffcf7a', { emissive: '#ffb050', emissiveIntensity: 1.4 });
  const winOff = mat('#2a3350');
  const upWins = [];
  for (const [x, on] of [[-2.6, true], [2.6, false]]) {
    const w = box(1.6, 1.9, .1, on ? winOn : winOff, F, x, 6.1, .2); upWins.push([w, on]);
    box(1.8, .15, .3, mat('#ffffff'), F, x, 5.1, .3);
    box(.1, 1.9, .14, mat('#f5f5f5'), F, x, 6.1, .26);
  }
  // auvent rayé
  const stripeTex = canvasTex(256, 64, (g, w, h) => { for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? '#f7efe0' : '#c0392b'; g.fillRect(i * 32, 0, 32, h); } });
  const awn = box(5.2, .08, 1.5, new THREE.MeshStandardMaterial({ map: stripeTex, roughness: .9 }), F, -1.5, 4.0, .85); awn.rotation.x = .38;
  const scallop = canvasTex(256, 64, (g, w, h) => { for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? '#f7efe0' : '#c0392b'; g.beginPath(); g.moveTo(i * 32, 0); g.lineTo(i * 32 + 32, 0); g.lineTo(i * 32 + 32, 30); g.arc(i * 32 + 16, 30, 16, 0, Math.PI); g.fill(); } });
  const sc = mesh(new THREE.PlaneGeometry(5.2, .4), new THREE.MeshStandardMaterial({ map: scallop, transparent: true, side: THREE.DoubleSide }), F, -1.5, 3.55, 1.55);
  // enseigne
  const signTex = canvasTex(1024, 220, (g, w, h) => {
    g.fillStyle = '#163f2f'; roundRect(g, 4, 4, w - 8, h - 8, 26); g.fill();
    g.lineWidth = 10; g.strokeStyle = '#d9b45a'; roundRect(g, 14, 14, w - 28, h - 28, 20); g.stroke();
    g.fillStyle = '#f6e7c1'; g.font = '900 96px Montserrat'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('BOULANGERIE ROSE', w / 2, h / 2 - 12);
    g.fillStyle = '#d9b45a'; g.font = '800 34px Montserrat'; g.fillText('— DEPUIS 1974 —', w / 2, h / 2 + 62);
  });
  box(7.4, 1.6, .2, new THREE.MeshStandardMaterial({ map: signTex, roughness: .6, emissive: '#ffffff', emissiveMap: signTex, emissiveIntensity: .25 }), F, 0, 4.95, .32);
  // porte
  const door = new THREE.Group(); door.position.set(1.6, 0, .05); F.add(door);
  const doorPanel = box(1.4, 2.8, .14, mat('#6b3b22'), door, .7, 1.4, 0);
  const doorWin = box(1.0, 1.2, .16, mat('#ffcf7a', { emissive: '#ffb050', emissiveIntensity: 1.2 }), door, .7, 1.95, 0);
  box(.1, .3, .1, mat('#d8b35a', { metalness: .7, roughness: .3 }), door, 1.25, 1.3, .12);
  // pancarte OUVERT / FERMÉ
  const plateTex = canvasTex(256, 128, () => {});
  const drawPlate = (txt, col) => redraw(plateTex, (g, w, h) => { g.fillStyle = '#fff6e6'; roundRect(g, 4, 4, w - 8, h - 8, 18); g.fill(); g.lineWidth = 8; g.strokeStyle = col; roundRect(g, 10, 10, w - 20, h - 20, 14); g.stroke(); g.fillStyle = col; g.font = '900 54px Montserrat'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, w / 2, h / 2 + 3); });
  drawPlate('OUVERT', '#1f8a4c');
  box(.8, .4, .03, new THREE.MeshStandardMaterial({ map: plateTex, roughness: .6 }), door, .7, 2.0, .11);
  // enveloppe sur la porte
  const envTex = canvasTex(512, 340, (g, w, h) => {
    g.fillStyle = '#f4ead7'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#d8c7a6'; g.lineWidth = 4; g.beginPath(); g.moveTo(0, 0); g.lineTo(w / 2, h * .55); g.lineTo(w, 0); g.stroke();
    g.fillStyle = '#3a2a5a'; g.font = '700 58px Caveat'; g.textAlign = 'center'; g.fillText('Pour le garçon', w / 2, h * .72); g.fillText('du soir.', w / 2, h * .9);
    g.fillStyle = 'rgba(255,255,255,.7)'; g.fillRect(w / 2 - 50, -6, 100, 34);
  });
  const envelope = box(.7, .46, .02, new THREE.MeshStandardMaterial({ map: envTex, roughness: .8 }), door, .7, 1.25, .1);
  // bâtiments voisins
  const nb = (x, w, h, col) => {
    const b = box(w, h, 3, mat(col, { roughness: .95 }), street, x, h / 2, -1.2);
    for (let yy = 1.6; yy < h - 1; yy += 2.2) for (let xx = -w / 2 + 1; xx < w / 2 - .5; xx += 1.8) {
      const on = R() > .45; box(1, 1.3, .1, on ? winOn : winOff, b, xx, yy - h / 2, 1.52);
    }
    box(w + .3, .3, 3.4, mat('#2c2a33'), b, 0, h / 2, 0);
  };
  nb(-10, 9.6, 11, '#3f5d86'); nb(10, 9.6, 9.5, '#5d7466'); nb(-20, 10, 13, '#7a5a6e'); nb(20, 10, 12, '#806048');
  // réverbères
  for (const x of [-6.2, 6.4]) {
    box(.16, 4.6, .16, mat('#22262e', { metalness: .5 }), street, x, 2.3, 3.4);
    mesh(new THREE.SphereGeometry(.3, 16, 12), mat('#ffe2a0', { emissive: '#ffcc66', emissiveIntensity: 2.5 }), street, x, 4.7, 3.4, false);
    const l = new THREE.PointLight('#ffcf80', 10, 12, 1.5); l.position.set(x, 4.4, 3.4); street.add(l); lampL.push(l);
  }
  // guirlande lumineuse
  const bulbs = [];
  for (let i = 0; i < 22; i++) { const x = -5 + i * 10 / 21, y = 4.6 - Math.sin(i / 21 * Math.PI) * .5; bulbs.push(mesh(new THREE.SphereGeometry(.06, 8, 6), mat(['#ff6b6b', '#ffd36b', '#6bd3ff', '#9dff8a'][i % 4], { emissive: ['#ff6b6b', '#ffd36b', '#6bd3ff', '#9dff8a'][i % 4], emissiveIntensity: 2 }), street, x, y, 1.75, false)); }
  // neige qui tombe
  const N = 1800, snowPos = new Float32Array(N * 3), seeds = [];
  for (let i = 0; i < N; i++) seeds.push([R() * 34 - 17, R() * 12, R() * 24 + .4, .5 + R() * .7, R() * 6]);
  const snowGeo = new THREE.BufferGeometry(); snowGeo.setAttribute('position', new THREE.BufferAttribute(snowPos, 3));
  const flake = canvasTex(64, 64, (g) => { const gr = g.createRadialGradient(32, 32, 0, 32, 32, 30); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); });
  const snow = new THREE.Points(snowGeo, new THREE.PointsMaterial({ size: .12, map: flake, transparent: true, depthWrite: false, color: '#ffffff' }));
  scene.add(snow);
  const updSnow = (t, speed = 1) => { for (let i = 0; i < N; i++) { const [x, y, z, s, ph] = seeds[i]; snowPos[i * 3] = x + Math.sin(t * .8 + ph) * .3; snowPos[i * 3 + 1] = ((y - t * s * speed) % 12 + 12) % 12; snowPos[i * 3 + 2] = z; } snowGeo.attributes.position.needsUpdate = true; };
  // étoiles
  const sp = []; for (let i = 0; i < 400; i++) sp.push(R() * 160 - 80, 12 + R() * 50, -40 - R() * 20);
  const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3));
  const stars = new THREE.Points(sg, new THREE.PointsMaterial({ size: .35, map: flake, transparent: true, depthWrite: false })); scene.add(stars);

  // ===================== INTÉRIEUR =====================
  const inside = new THREE.Group(); scene.add(inside);
  const floor = mesh(new THREE.PlaneGeometry(10, 7.4), new THREE.MeshStandardMaterial({ map: woodTex, roughness: .7 }), inside, 0, .005, -3.6); floor.rotation.x = -Math.PI / 2;
  const wallM = new THREE.MeshStandardMaterial({ map: wallTex, roughness: .9 });
  box(10, 4.6, .2, wallM, inside, 0, 2.3, -7.2);
  box(.2, 4.6, 7.4, wallM, inside, -5, 2.3, -3.6); box(.2, 4.6, 7.4, wallM, inside, 5, 2.3, -3.6);
  box(10, .2, 7.4, mat('#f6eadb'), inside, 0, 4.4, -3.6);
  box(10, 1.1, .1, mat('#7a4a2a'), inside, 0, .55, -7.05);
  // étagères + pains
  const bread = mat('#c98a3e', { roughness: .55 }), breadD = mat('#a8692b', { roughness: .55 });
  const capsule = new THREE.CapsuleGeometry(.11, .9, 6, 10);
  for (const [k, y] of [1.6, 2.5, 3.4].entries()) {
    box(7, .1, .7, mat('#8a5432'), inside, -1, y, -6.75);
    for (let i = 0; i < 9; i++) {
      const x = -4.2 + i * .78;
      if ((i + k) % 3 === 0) { const b = mesh(new THREE.SphereGeometry(.32, 16, 12), i % 2 ? bread : breadD, inside, x, y + .22, -6.7); b.scale.set(1, .62, 1); }
      else for (let j = 0; j < 3; j++) { const b = mesh(capsule, j % 2 ? bread : breadD, inside, x - .2 + j * .2, y + .38, -6.85); b.rotation.z = .12; }
    }
  }
  // horloge murale
  const clockTex = canvasTex(256, 256, () => {});
  const drawClock = (hh, mm) => redraw(clockTex, (g, w, h) => {
    g.fillStyle = '#5a3420'; g.beginPath(); g.arc(128, 128, 126, 0, 7); g.fill();
    g.fillStyle = '#fbf6ec'; g.beginPath(); g.arc(128, 128, 110, 0, 7); g.fill();
    g.fillStyle = '#222'; for (let i = 0; i < 12; i++) { g.save(); g.translate(128, 128); g.rotate(i * Math.PI / 6); g.fillRect(-4, -100, 8, 22); g.restore(); }
    const hand = (a, l, wd) => { g.save(); g.translate(128, 128); g.rotate(a); g.fillStyle = '#1a1a1a'; g.fillRect(-wd / 2, -l, wd, l + 10); g.restore(); };
    hand((hh % 12 + mm / 60) * Math.PI / 6, 62, 12); hand(mm * Math.PI / 30, 92, 8);
    g.fillStyle = '#c0392b'; g.beginPath(); g.arc(128, 128, 10, 0, 7); g.fill();
  });
  drawClock(7, 0);
  const clockM = mesh(new THREE.CylinderGeometry(.6, .6, .08, 32), [mat('#5a3420'), new THREE.MeshStandardMaterial({ map: clockTex }), mat('#5a3420')], inside, 3.3, 3.2, -7.05); clockM.rotation.x = Math.PI / 2;
  clockM.material[1].map.center.set(.5, .5); clockM.material[1].map.rotation = 0;
  // comptoir
  box(6, 1.3, 1.0, mat('#8a5432'), inside, -.5, .65, -3.6);
  box(6.2, .1, 1.15, mat('#f1ece4', { roughness: .3 }), inside, -.5, 1.35, -3.6);
  box(.6, .45, .5, mat('#3a3f4a', { metalness: .4 }), inside, 2.0, 1.62, -3.7);
  for (let i = 0; i < 4; i++) { const b = mesh(new THREE.SphereGeometry(.22, 14, 10), bread, inside, -2.8 + i * .5, 1.5, -3.75); b.scale.set(1, .6, 1); }
  // tabouret
  const stool = new THREE.Group(); stool.position.set(-.3, 0, -2.5); inside.add(stool);
  mesh(new THREE.CylinderGeometry(.35, .35, .12, 20), mat('#c0392b'), stool, 0, 1.0, 0);
  box(.1, 1, .1, mat('#333'), stool, 0, .5, 0);
  // lampes suspendues
  for (const [x, z] of [[-1.5, -1.1], [-2.2, -4], [1.8, -4]]) {
    box(.03, .5, .03, mat('#222'), inside, x, 4.1, z, false);
    const sh = mesh(new THREE.ConeGeometry(.35, .3, 20, 1, true), mat('#1f5a43', { side: THREE.DoubleSide }), inside, x, 3.75, z, false);
    mesh(new THREE.SphereGeometry(.12, 12, 8), mat('#fff1c8', { emissive: '#ffd58a', emissiveIntensity: 3 }), inside, x, 3.62, z, false);
  }
  // présentoir de vitrine + cloche
  const stand = new THREE.Group(); stand.position.set(-1.5, 0, -1.0); inside.add(stand);
  rbox(.95, 1.1, .95, .05, mat('#f4efe6'), stand, 0, .55, 0);
  mesh(new THREE.CylinderGeometry(.5, .52, .06, 32), mat('#ffffff', { roughness: .3 }), stand, 0, 1.13, 0);
  const croissant = mesh(croissantGeo(), croissantMat(), stand, 0, 1.24, 0); croissant.scale.setScalar(.9);
  const dome = new THREE.Group(); stand.add(dome);
  mesh(new THREE.SphereGeometry(.5, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#e8f4ff', transparent: true, opacity: .2, roughness: .05, metalness: .3, depthWrite: false }), dome, 0, 1.14, 0, false);
  mesh(new THREE.SphereGeometry(.07, 12, 8), mat('#d8b35a', { metalness: .7, roughness: .3 }), dome, 0, 1.68, 0);
  // croissant tenu en main
  const handCroissant = mesh(croissantGeo(), croissantMat()); handCroissant.scale.setScalar(.85);
  // étincelles
  const sparkTex = canvasTex(64, 64, (g) => { g.fillStyle = '#fff6c8'; g.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, r = i % 2 ? 8 : 30; g.lineTo(32 + Math.cos(a) * r, 32 + Math.sin(a) * r); } g.fill(); });
  const sparks = [];
  for (let i = 0; i < 6; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: sparkTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); s.scale.setScalar(.15); stand.add(s); sparks.push(s); }
  const updSparks = (t, on) => sparks.forEach((s, i) => { s.visible = on; const a = i / 6 * Math.PI * 2 + t * .6; s.position.set(Math.cos(a) * .45, 1.35 + Math.sin(t * 2 + i) * .15, Math.sin(a) * .45); s.scale.setScalar(.06 + .12 * Math.abs(Math.sin(t * 3 + i * 1.7))); });

  // ===================== DÉCORS « CARTES » (calendrier, clé, lettre) =====================
  const cards = new THREE.Group(); cards.position.set(200, 0, 0); scene.add(cards);
  const cardLight = new THREE.PointLight('#fff0d8', 0, 20, 1.2); cardLight.position.set(200, 4, 5); scene.add(cardLight);
  box(12, 12, .2, new THREE.MeshStandardMaterial({ map: wallTex, roughness: .9 }), cards, 0, 3, -.3);
  // calendrier
  const calTex = canvasTex(600, 760, () => {});
  const drawCal = (month, crosses) => redraw(calTex, (g, w, h) => {
    g.fillStyle = '#fbf7ef'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#b3261e'; g.fillRect(0, 0, w, 150);
    g.fillStyle = '#fff'; g.font = '900 78px Montserrat'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(month, w / 2, 80);
    for (let i = 0; i < 35; i++) {
      const x = 30 + (i % 7) * 78, y = 190 + Math.floor(i / 7) * 108;
      g.fillStyle = '#e8e0d2'; roundRect(g, x, y, 68, 90, 10); g.fill();
      if (i < 31) { g.fillStyle = '#555'; g.font = '800 26px Montserrat'; g.fillText(String(i + 1), x + 34, y + 26); }
      if (i < crosses) { g.strokeStyle = '#c0392b'; g.lineWidth = 9; g.beginPath(); g.moveTo(x + 12, y + 20); g.lineTo(x + 56, y + 78); g.moveTo(x + 56, y + 20); g.lineTo(x + 12, y + 78); g.stroke(); }
    }
  });
  const cal = box(3.0, 3.8, .05, new THREE.MeshStandardMaterial({ map: calTex, roughness: .8 }), cards, 0, 3, -.15);
  // table + clé + enveloppe ouverte
  const table = new THREE.Group(); table.position.set(0, 0, 8); cards.add(table);
  const tbl = box(8, .2, 6, new THREE.MeshStandardMaterial({ map: woodTex, roughness: .6 }), table, 0, 0, 0);
  const openEnv = box(2.2, .02, 1.5, new THREE.MeshStandardMaterial({ map: envTex, roughness: .8 }), table, -.6, .12, .2); openEnv.rotation.y = .15;
  const key = new THREE.Group(); table.add(key);
  const gold = mat('#e0b64a', { metalness: .85, roughness: .25 });
  const ring = mesh(new THREE.TorusGeometry(.32, .08, 12, 28), gold, key, -.6, 0, 0);
  box(1.1, .1, .1, gold, key, .3, 0, 0); box(.1, .3, .1, gold, key, .65, -.15, 0); box(.1, .22, .1, gold, key, .45, -.11, 0);
  // lettre manuscrite
  const letterTex = canvasTex(800, 1100, () => {});
  const LINES = ['Mon petit,', '', 'Il y a cinquante ans,', "quelqu'un a gardé", 'un croissant pour moi.', '', "Maintenant,", "c'est ton tour.", '', '                Rose'];
  const drawLetter = (k) => redraw(letterTex, (g, w, h) => {
    g.fillStyle = '#f7efdd'; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(120,150,200,.35)'; g.lineWidth = 2; for (let y = 170; y < h; y += 78) { g.beginPath(); g.moveTo(40, y); g.lineTo(w - 40, y); g.stroke(); }
    g.fillStyle = '#2b2350'; g.font = '700 70px Caveat';
    let chars = Math.floor(k * LINES.join('').length);
    LINES.forEach((l, i) => { const s = l.slice(0, Math.max(0, chars)); chars -= l.length; g.fillText(s, 70, 160 + i * 78); });
  });
  const letter = box(3.2, 4.4, .03, new THREE.MeshStandardMaterial({ map: letterTex, roughness: .9 }), cards, 8, 3, -.1);

  // ===================== PERSONNAGES =====================
  const rose = makeChar({ skin: '#f3cba6', shirt: '#e98aa6', sleeve: '#e98aa6', pants: '#5b4a6e', apron: '#fff7ee', apronPocket: '#f2b6c8', hair: 'bun', hairColor: '#ecebe8', face: { glasses: true, blush: true, brow: '#9a9a9a' } });
  const boy = makeChar({ skin: '#eab38a', shirt: '#8fb5d9', pants: '#4b4f63', hair: 'messy', hairColor: '#5a3420', face: { blush: true } });
  boy.g.scale.setScalar(.72);
  const adult = makeChar({ skin: '#eab38a', shirt: '#ffffff', pants: '#3b3f4f', apron: '#2f6f55', apronPocket: '#ffffff', hair: 'toque', hairColor: '#5a3420', face: { brow: '#3a2214' } });
  const client1 = makeChar({ skin: '#8a5536', shirt: '#d35400', sleeve: '#d35400', pants: '#2c3e50', hair: 'cap', hairColor: '#3b3b3b', face: {} });
  const client2 = makeChar({ skin: '#f0c090', shirt: '#27ae60', pants: '#34495e', hair: 'short', hairColor: '#1e1e1e', face: {} });
  const girl = makeChar({ skin: '#a56b46', shirt: '#e84f8a', pants: '#3d3a6b', hair: 'beanie', hairColor: '#ff7eb6', scarf: '#ffd166', face: { blush: true } });
  girl.g.scale.setScalar(.66);
  const cast = [rose, boy, adult, client1, client2, girl];
  cast.forEach(c => scene.add(c.g));
  const tear = mesh(new THREE.SphereGeometry(.05, 10, 8), new THREE.MeshStandardMaterial({ color: '#9fd2ff', transparent: true, opacity: .85, roughness: .05 }), boy.head, .32, .3, .48, false);

  // ===================== AMBIANCES =====================
  function mood(m) {
    const night = m !== 'morning';
    scene.background = night ? skyNight : skyMorning;
    scene.fog = night ? new THREE.Fog('#1b2350', 25, 70) : new THREE.Fog('#dfe3ea', 20, 60);
    hemi.color.set(night ? '#6a7bbf' : '#e2e8f0'); hemi.groundColor.set(night ? '#2a2030' : '#8a8f99'); hemi.intensity = night ? .8 : 1.6;
    moon.color.set(night ? '#a8bcff' : '#fff1e0'); moon.intensity = night ? 1.2 : 1.4;
    const lit = night && m !== 'dark';
    inLights.forEach(([l, i]) => l.intensity = lit ? i : 0);
    lampL.forEach(l => l.intensity = night ? 10 : 0);
    doorWin.material.emissiveIntensity = lit ? 1.2 : 0; doorWin.material.color.set(lit ? '#ffcf7a' : '#4a5260');
    stars.visible = night; bulbs.forEach(b => b.material.emissiveIntensity = night ? 2 : 0);
    upWins[0][0].material = night ? winOn : winOff;
    cardLight.intensity = 0;
  }

  function reset() {
    cast.forEach(c => { c.reset(); c.g.visible = false; });
    tear.visible = false;
    door.rotation.y = 0; envelope.visible = false; drawPlateState('OUVERT');
    croissant.visible = true; dome.position.y = 0; handCroissant.removeFromParent();
    updSparks(0, false);
    stool.visible = true;
    mood('night');
  }
  let plateState = '';
  function drawPlateState(s) { if (s !== plateState) { plateState = s; drawPlate(s, s === 'FERMÉ' ? '#c0392b' : '#1f8a4c'); } }
  let calState = '';
  function setCal(m, n) { const k = m + n; if (k !== calState) { calState = k; drawCal(m, n); } }
  let letterK = -1;
  function setLetter(k) { k = Math.round(k * 60) / 60; if (k !== letterK) { letterK = k; drawLetter(k); } }
  const look = (pos, tgt) => { cam.position.copy(pos); cam.lookAt(tgt); };
  const place = (c, x, z, ry = 0, y = 0) => { c.g.visible = true; c.g.position.set(x, y, z); c.g.rotation.y = ry; };
  const hold = (c) => { c.armR.add(handCroissant); handCroissant.position.set(0, -1.02, .28); handCroissant.rotation.set(Math.PI / 2, 0, 0); };

  // ===================== PLANS =====================
  const shots = {
    street_wide(u, d, p, t) {
      place(rose, -1.6, -2.0, 0); rose.idle(t); rose.setFace('smile'); rose.armR.rotation.x = -.6;
      look(lerpV([0, 2.6, 19.5], [-.2, 2.5, 14.5], ease(p)), v3(-.2, 3.4, 0));
    },
    rose_place(u, d, p, t) {
      place(rose, -1.5, -1.95, 0); rose.setFace('smile'); rose.idle(t);
      const k = ease(clamp(p * 1.6));
      rose.armR.rotation.x = -1.2 + k * .25; rose.armL.rotation.x = -1.2 + k * .25;
      croissant.visible = p > .62; dome.position.y = lerp(.9, 0, ease(clamp((p - .6) / .35)));
      if (p <= .62) hold(rose);
      rose.armL.rotation.x = p > .62 ? lerp(-1.0, -.2, ease((p - .62) / .38)) : rose.armL.rotation.x;
      look(lerpV([.9, 2.3, -.35], [.5, 2.1, -.45], ease(p)), v3(-1.5, 1.7, -1.6));
    },
    croissant_dome(u, d, p, t) {
      place(rose, -1.6, -2.4, 0); rose.setFace('smileClosed');
      updSparks(t, true);
      const a = lerp(.5, -.3, p);
      look(v3(-1.5 + Math.sin(a) * 1.1, 1.55, -1.0 + Math.cos(a) * 1.1), v3(-1.5, 1.28, -1.0));
    },
    interior_wide(u, d, p, t) {
      place(rose, .4, -4.4, 0); rose.setFace('neutral'); rose.idle(t);
      rose.armR.rotation.x = -.9 + Math.sin(t * 5) * .15; rose.armR.rotation.z = Math.sin(t * 5) * .2;
      updSparks(t, true);
      look(lerpV([4.3, 3.4, -.6], [3.8, 3.1, -1.0], p), v3(-1, 1.6, -3.6));
    },
    clients_laugh(u, d, p, t) {
      place(client1, -1.6, -2.55, Math.PI + .25); place(client2, .1, -2.6, Math.PI - .2);
      place(rose, 1.7, -4.4, -.3); rose.setFace('smile');
      for (const [i, c] of [client1, client2].entries()) {
        c.setFace(p > .25 ? 'laugh' : 'smile');
        c.head.rotation.x = -.08 + Math.sin(t * 14 + i) * .05 * (p > .25); c.torso.position.y = 1.5 + Math.abs(Math.sin(t * 14 + i)) * .03;
        c.armR.rotation.x = -.5; c.armR.rotation.z = .3 * (i ? -1 : 1);
      }
      client1.armL.rotation.x = -1.3 + Math.sin(t * 10) * .1;
      look(lerpV([-.7, 3.2, -6.9], [-.7, 3.0, -6.5], p), v3(-.7, 2.4, -2.6));
    },
    rose_smile(u, d, p, t) {
      place(rose, .4, -4.4, 0); rose.setFace(p < .35 ? 'neutral' : 'smileClosed'); rose.idle(t, 2);
      rose.head.rotation.y = lerp(-.25, .05, ease(p));
      look(lerpV([.6, 2.75, -1.8], [.5, 2.62, -2.4], ease(p)), v3(.4, 2.5, -4.4));
    },
    boy_street(u, d, p, t) {
      const k = clamp(p / .75);
      place(boy, lerp(-9, -1.5, ease(k)), 1.3, k < 1 ? Math.PI / 2 : lerp(Math.PI / 2, Math.PI, ease(clamp((p - .75) / .2))));
      if (k < 1) boy.walk(t, 9, .5); boy.setFace('sad');
      place(rose, .2, -4.4, 0); rose.idle(t);
      const bx = boy.g.position.x;
      look(v3(bx - 1.5, 2.0, 7.5), v3(bx + .5, 1.4, 0.5));
    },
    boy_shiver(u, d, p, t) {
      place(boy, -1.5, 1.3, Math.PI - .55); boy.setFace('cold');
      boy.g.rotation.z = Math.sin(t * 40) * .012; boy.g.position.x = -1.5 + Math.sin(t * 50) * .012;
      boy.armL.rotation.set(-1.0, 0, -.9); boy.armR.rotation.set(-1.0, 0, .9);
      boy.head.rotation.x = .1;
      look(lerpV([-.1, 1.75, 3.6], [-.5, 1.7, 3.0], ease(p)), v3(-1.45, 1.55, 1.2));
    },
    boy_window(u, d, p, t) {
      place(boy, -1.5, .55, Math.PI); boy.setFace('wonder');
      boy.armL.rotation.x = -2.2; boy.armR.rotation.x = -2.2; boy.armL.rotation.z = -.25; boy.armR.rotation.z = .25;
      updSparks(t, true);
      look(lerpV([-1.25, 1.38, -2.3], [-1.35, 1.45, -1.85], ease(p)), v3(-1.5, 1.55, .5));
    },
    door_give(u, d, p, t) {
      door.rotation.y = -lerp(0, 1.6, ease(clamp(p / .3)));
      place(rose, 2.3, .9, 0); rose.setFace('smile');
      place(boy, 2.35, 2.45, Math.PI); boy.setFace(p > .7 ? 'wonder' : 'sad');
      rose.armR.rotation.x = -lerp(0, 1.4, ease(clamp((p - .25) / .3)));
      if (p < .72) hold(rose); else hold(boy);
      boy.armR.rotation.x = -lerp(0, 1.3, ease(clamp((p - .5) / .25)));
      look(lerpV([7.2, 2.1, 2.2], [6.2, 2.0, 1.9], p), v3(2.3, 1.7, 1.6));
    },
    rose_warm(u, d, p, t) {
      door.rotation.y = -1.6;
      place(rose, 2.3, .9, 0); rose.setFace('smileClosed'); rose.idle(t, 2); rose.head.rotation.z = .12;
      rose.armR.rotation.x = -.5;
      look(lerpV([2.25, 2.0, 3.6], [2.3, 2.3, 3.0], ease(p)), v3(2.3, 2.55, .9));
    },
    calendar(u, d, p, t) {
      mood('night'); cardLight.intensity = 30;
      const n = Math.floor(lerp(4, 31, clamp(p / .95)));
      setCal('DÉCEMBRE', n);
      look(lerpV([200, 3, 6.5], [200, 3.05, 5.0], ease(p)), v3(200, 3, 0));
    },
    both_eating(u, d, p, t) {
      stool.visible = true;
      place(boy, -.3, -2.5, Math.PI, .32); boy.setFace(Math.sin(t * 3) > 0 ? 'smileClosed' : 'smile');
      boy.legL.rotation.x = -1.4; boy.legR.rotation.x = -1.4;
      hold(boy); boy.armR.rotation.x = -1.6 + Math.abs(Math.sin(t * 2.5)) * .4;
      handCroissant.scale.setScalar(.85 * lerp(1, .5, p));
      place(rose, -.1, -4.4, 0); rose.setFace('smileClosed'); rose.idle(t, 2); rose.armL.rotation.x = -.7; rose.armR.rotation.x = -.7;
      look(lerpV([3.2, 2.6, -1.2], [2.6, 2.4, -1.5], p), v3(-.3, 1.8, -3.4));
    },
    closed_morning(u, d, p, t) {
      mood('morning'); drawPlateState('FERMÉ');
      croissant.visible = false;
      place(boy, lerp(-4, 1.0, ease(clamp(p / .6))), 1.6, p < .6 ? Math.PI / 2 : Math.PI);
      if (p < .6) boy.walk(t, 8, .45); boy.setFace(p < .6 ? 'smile' : 'sad');
      look(lerpV([1.5, 2.6, 13], [1.2, 2.3, 8.5], ease(p)), v3(.5, 2.4, 0));
    },
    empty_counter(u, d, p, t) {
      mood('dark'); croissant.visible = false;
      hemi.intensity = 1.3; moon.intensity = 1.6;
      look(lerpV([-.6, 2.1, -.3], [-1.0, 1.8, -.4], ease(p)), v3(-1.5, 1.3, -1.0));
    },
    letter_door(u, d, p, t) {
      mood('morning'); drawPlateState('FERMÉ'); envelope.visible = true; croissant.visible = false;
      place(boy, 2.0, 1.7, Math.PI + .4); boy.setFace('sad');
      boy.armR.rotation.x = -lerp(.2, 1.9, ease(clamp((p - .35) / .5)));
      look(lerpV([3.6, 1.9, 2.6], [2.9, 1.6, 1.6], ease(p)), v3(2.3, 1.3, .2));
    },
    key_closeup(u, d, p, t) {
      mood('morning'); cardLight.intensity = 30;
      key.position.set(0, .3 + ease(clamp(p / .5)) * .9, .4); key.rotation.set(-.6, t * 1.2, .2);
      look(lerpV([200, 3.4, 12.2], [200, 2.8, 11.2], ease(p)), v3(200, .8, 8.2));
    },
    letter_text(u, d, p, t) {
      mood('morning'); cardLight.intensity = 34;
      setLetter(clamp(p * 1.25));
      look(lerpV([208.2, 3.3, 5.2], [208, 3.1, 4.4], ease(p)), v3(208, 3, 0));
    },
    boy_cry(u, d, p, t) {
      mood('morning'); drawPlateState('FERMÉ'); croissant.visible = false;
      place(boy, 2.0, 1.9, -.25); boy.setFace('cry'); boy.head.rotation.x = .12;
      boy.armL.rotation.x = -1.1; boy.armR.rotation.x = -1.1; boy.armL.rotation.z = -.3; boy.armR.rotation.z = .3;
      tear.visible = true; tear.position.set(.3, lerp(.32, -.05, (u * .7) % 1), .47);
      look(lerpV([1.95, 1.85, 4.2], [1.85, 1.75, 3.5], ease(p)), v3(1.75, 1.75, 1.9));
    },
    adult_close(u, d, p, t) {
      door.rotation.y = -lerp(1.4, 0, ease(clamp(p / .45)));
      drawPlateState(p > .55 ? 'FERMÉ' : 'OUVERT');
      place(adult, 2.3, -.9, 0); adult.setFace('smile'); adult.idle(t);
      adult.armR.rotation.x = -lerp(.2, 1.0, ease(clamp((p - .4) / .3)));
      look(lerpV([3.6, 2.3, 7.5], [3.0, 2.2, 5.0], ease(p)), v3(2.3, 2.2, 0));
    },
    adult_dome(u, d, p, t) {
      place(adult, -1.5, -1.95, 0); adult.setFace('smileClosed'); adult.idle(t);
      croissant.visible = p > .5; dome.position.y = lerp(.9, 0, ease(clamp((p - .5) / .4)));
      if (p <= .5) hold(adult);
      adult.armR.rotation.x = -1.0; adult.armL.rotation.x = -1.0;
      updSparks(t, p > .6);
      look(lerpV([.9, 2.6, -.35], [.4, 2.3, -.4], ease(p)), v3(-1.5, 1.9, -1.6));
    },
    final_window(u, d, p, t) {
      place(girl, -1.4, .6, Math.PI); girl.setFace('wonder');
      girl.armL.rotation.x = -2.1; girl.armR.rotation.x = -2.1;
      place(adult, -1.4, -2.3, 0); adult.setFace('smileClosed'); adult.idle(t);
      updSparks(t, true);
      look(lerpV([-1.0, 1.6, 3.2], [-.5, 7.5, 16], ease(clamp(p * 1.1))), lerpV([-1.4, 1.4, 0], [-.8, 2.8, 0], ease(p)));
    },
  };

  function render(name, u, d, p, t) {
    reset();
    (shots[name] || shots.street_wide)(u, d, p, t);
    updSnow(t, name === 'closed_morning' || name === 'letter_door' || name === 'boy_cry' ? .4 : 1);
    renderer.render(scene, cam);
  }

  function overlay(name, u, d, t) {
    if (name === 'street_wide') ui.badge('19:00', u - .5, { size: 60, bg: '#141a33', border: '#ffd36b', color: '#ffd36b', y: H * .12 });
    if (name === 'croissant_dome') ui.badge('LE DERNIER', u - .1, { size: 52, y: H * .13 });
    if (name === 'closed_morning') ui.badge('FERMÉ', u - .4, { size: 58, bg: '#3b0f12', border: '#ff7b7b', color: '#ff9b9b', y: H * .12 });
    if (name === 'adult_close') ui.badge('20 ANS PLUS TARD', u - .2, { size: 44, bg: '#141a33', border: '#ffd36b', color: '#ffd36b', y: H * .12 });
    if (name === 'rose_warm') ui.badge('« Il t\'attendait. »', u - .2, { size: 44, bg: '#3b1426', border: '#ff9cc4', color: '#ffc2dc', y: H * .12 });
  }

  return { render, overlay };
}
