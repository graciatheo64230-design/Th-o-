// Ajoute le texte d'accroche du début : node hook.mjs out/ep1.mp4 ["Dans cette ville…"]
// Le texte apparaît en haut de l'écran (fondu + glissement) pendant les 3 premières secondes.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const video = path.resolve(process.argv[2]);
const text = process.argv[3] || 'Dans cette ville…';
const png = path.join(path.dirname(video), '.hook.png');

const font = fs.readFileSync(path.join(ROOT, 'node_modules/@fontsource/montserrat/files/montserrat-latin-900-normal.woff2')).toString('base64');
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 720, height: 200 } });
await page.setContent(`<style>@font-face{font-family:M;src:url(data:font/woff2;base64,${font})}body{margin:0;background:transparent}</style><canvas id=c width=720 height=200></canvas>`);
const b64 = await page.evaluate(async (txt) => {
  await document.fonts.load('900 70px M');
  const c = document.getElementById('c'), g = c.getContext('2d');
  let size = 70; g.font = `900 ${size}px M`;
  while (g.measureText(txt).width > 640) { size -= 3; g.font = `900 ${size}px M`; }
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
  g.shadowColor = 'rgba(0,0,0,.6)'; g.shadowBlur = 14; g.shadowOffsetY = 5;
  g.lineWidth = 14; g.strokeStyle = '#000'; g.strokeText(txt, 360, 100);
  g.shadowColor = 'transparent'; g.fillStyle = '#fff'; g.fillText(txt, 360, 100);
  return c.toDataURL('image/png');
}, text);
fs.writeFileSync(png, Buffer.from(b64.split(',')[1], 'base64'));
await browser.close();

const tmp = video.replace(/\.mp4$/, '.hook.mp4');
const f = "[1]format=rgba,fade=t=in:st=0.15:d=0.35:alpha=1,fade=t=out:st=2.6:d=0.4:alpha=1[h];" +
  "[0][h]overlay=x=0:y='H*0.27-100+max(0,(0.5-t))*60':enable='lt(t,3.05)'[v]";
const r = spawnSync('ffmpeg', ['-v', 'error', '-y', '-i', video, '-loop', '1', '-t', '3.1', '-i', png, '-filter_complex', f, '-map', '[v]', '-map', '0:a', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-c:a', 'copy', '-movflags', '+faststart', tmp], { stdio: 'inherit' });
if (r.status !== 0) process.exit(1);
fs.renameSync(tmp, video); fs.unlinkSync(png);
console.log('accroche ajoutée :', video);
