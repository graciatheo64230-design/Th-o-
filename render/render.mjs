// Rendu : node render.mjs ep1 [--preview t1,t2,...] [--workers 4]
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const EP = process.argv[2] || 'ep1';
const arg = (k, def) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : def; };
const FPS = 30, WORKERS = +arg('--workers', 4), OUT = arg('--out', path.join(ROOT, 'out'));
fs.mkdirSync(OUT, { recursive: true });

const types = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.woff2': 'font/woff2' };
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!p.startsWith(ROOT) || !fs.existsSync(p)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': types[path.extname(p)] || 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
}).listen(0);
const port = server.address().port;

const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
async function openPage() {
  const page = await browser.newPage({ viewport: { width: 720, height: 1280 } });
  page.on('console', m => { if (m.type() === 'error') console.error('[page]', m.text()); });
  page.on('pageerror', e => console.error('[pageerror]', e.message));
  await page.goto(`http://localhost:${port}/page.html?ep=${EP}`);
  await page.waitForFunction(() => window.ready === true);
  const info = await page.evaluate(() => window.setup());
  return { page, info };
}
const b64 = s => Buffer.from(s.split(',')[1], 'base64');

const preview = arg('--preview');
if (preview) {
  const { page } = await openPage();
  for (const t of preview.split(',').map(Number)) {
    const t0 = Date.now();
    fs.writeFileSync(path.join(OUT, `prev_${t.toFixed(1)}.jpg`), b64(await page.evaluate(t => window.frame(t), t)));
    console.log('t=', t, Date.now() - t0, 'ms');
  }
} else {
  const { info } = await openPage().then(async r => { await r.page.close(); return r; });
  const total = Math.ceil(info.duration * FPS);
  const per = Math.ceil(total / WORKERS);
  console.log('frames', total, 'workers', WORKERS);
  const parts = [];
  await Promise.all(Array.from({ length: WORKERS }, async (_, w) => {
    const { page } = await openPage();
    const a = w * per, b = Math.min(total, a + per);
    const file = path.join(OUT, `${EP}_part${w}.mp4`); parts[w] = file;
    const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', file], { stdio: ['pipe', 'inherit', 'inherit'] });
    for (let f = a; f < b; f++) {
      const buf = b64(await page.evaluate(t => window.frame(t), f / FPS));
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
      if ((f - a) % 150 === 0) console.log(`w${w}: ${f - a}/${b - a}`);
    }
    ff.stdin.end(); await new Promise(r => ff.on('close', r));
  }));
  const list = path.join(OUT, 'list.txt');
  fs.writeFileSync(list, parts.map(p => `file '${p}'`).join('\n'));
  const final = path.join(OUT, `${EP}.mp4`);
  await new Promise(r => spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', list, '-i', path.join(ROOT, EP, 'mix.wav'), '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', final], { stdio: 'inherit' }).on('close', r));
  parts.forEach(p => fs.unlinkSync(p)); fs.unlinkSync(list);
  console.log('OK', final);
}
await browser.close(); server.close();
