// Moteur : rendu three.js + surcouche TikTok (sous-titres mot à mot, badges, fondus).
import * as THREE from 'three';
import { W, H, clamp, roundRect } from './lib.js';

const params = new URLSearchParams(location.search);
const EP = params.get('ep') || 'ep1';

const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setSize(W, H, false); renderer.setPixelRatio(1);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const out = document.createElement('canvas'); out.width = W; out.height = H;
const ctx = out.getContext('2d');
document.body.appendChild(out);

let ep, timeline;

function wordAt(t) {
  for (const s of timeline.shots) {
    for (let i = 0; i < s.words.length; i++) {
      const w = s.words[i], nx = s.words[i + 1];
      const end = nx ? nx.t0 : Math.min(w.t1 + .3, s.t1);
      if (t >= w.t0 && t < end) return { w: w.w, age: t - w.t0 };
    }
  }
  return null;
}

function caption(word, age) {
  const k = age < .09 ? .75 + age / .09 * .33 : age < .16 ? 1.08 - (age - .09) / .07 * .08 : 1;
  ctx.save();
  ctx.translate(W / 2, H * .585); ctx.scale(k, k);
  let size = 62;
  ctx.font = `900 ${size}px Montserrat`;
  while (ctx.measureText(word).width > W * .86) { size -= 4; ctx.font = `900 ${size}px Montserrat`; }
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  ctx.shadowColor = 'rgba(0,0,0,.55)'; ctx.shadowBlur = 10; ctx.shadowOffsetY = 4;
  ctx.lineWidth = 12; ctx.strokeStyle = '#000'; ctx.strokeText(word, 0, 0);
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = '#fff'; ctx.fillText(word, 0, 0);
  ctx.restore();
}

// Badge façon « EMBAUCHÉ ! » : pastille arrondie qui « pop »
export function badge(text, age, o = {}) {
  if (age < 0) return;
  const k = age < .12 ? .4 + age / .12 * .75 : age < .22 ? 1.15 - (age - .12) / .1 * .15 : 1;
  const y = o.y ?? H * .1;
  ctx.save(); ctx.translate(W / 2, y); ctx.scale(k, k); ctx.rotate(o.rot ?? -.03);
  ctx.font = `900 ${o.size || 54}px Montserrat`;
  const tw = ctx.measureText(text).width, pw = tw + 60, ph = (o.size || 54) * 1.45;
  roundRect(ctx, -pw / 2, -ph / 2, pw, ph, ph / 2);
  ctx.fillStyle = o.bg || '#0f3b27'; ctx.fill();
  ctx.lineWidth = 6; ctx.strokeStyle = o.border || '#79e7a0'; ctx.stroke();
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = o.color || '#8ff3b4'; ctx.fillText(text, 0, 3);
  ctx.restore();
}

function vignette() {
  const g = ctx.createRadialGradient(W / 2, H / 2, H * .3, W / 2, H / 2, H * .75);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.42)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}

window.setup = async () => {
  await Promise.all(['900 40px Montserrat', '800 40px Montserrat', '700 40px Caveat'].map(f => document.fonts.load(f)));
  timeline = await (await fetch(`./${EP}/timeline.json?` + Date.now())).json();
  const mod = await import(`./${EP}/scene.js`);
  ep = mod.create(renderer, { badge, ctx });
  return { duration: timeline.duration, shots: timeline.shots.length };
};

window.frame = (t, quality = .9) => {
  // trouver le plan courant
  const shots = timeline.shots;
  let i = shots.findIndex(s => t < s.t1);
  if (i < 0) i = shots.length - 1;
  const s = shots[i];
  const t0 = i === 0 ? 0 : s.t0;
  const t1 = i === shots.length - 1 ? timeline.duration : s.t1;
  const u = t - t0, d = t1 - t0;
  ep.render(s.shot, u, d, clamp(u / d), t);
  ctx.drawImage(renderer.domElement, 0, 0);
  vignette();
  ep.overlay?.(s.shot, u, d, t);
  const w = wordAt(t);
  if (w) caption(w.w, w.age);
  // fondus début / fin
  const fade = Math.max(clamp(1 - t / .6), clamp((t - (timeline.duration - 1.6)) / 1.4));
  if (fade > 0) { ctx.fillStyle = `rgba(0,0,0,${fade})`; ctx.fillRect(0, 0, W, H); }
  return out.toDataURL('image/jpeg', quality);
};
window.ready = true;
