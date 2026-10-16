// Exporta la animación a MP4 (1920x1080, 30 fps, 20 s) cuadro por cuadro.
// Requisitos: Node 18+, ffmpeg en el PATH y Playwright (npm install).
// Uso: node render.cjs [salida.mp4]        Variables: FPS=60, FRAMES=1,90,300 (solo capturas PNG), VOZ=locucion.mp3
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const W = 1920, H = 1080;
const FPS = Number(process.env.FPS || 30);
const out = path.resolve(process.argv[2] || path.join(__dirname, 'del-dato-a-la-decision.mp4'));
const body = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><script>window.__RENDER = true;</script></head><body>${body}</body></html>`;

(async () => {
  const proxy = process.env.HTTPS_PROXY || process.env.https_proxy;
  const browser = await chromium.launch(proxy ? { proxy: { server: proxy } } : {});
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: 'load' });
  await page.waitForFunction(() => window.__ready === true);
  const fonts = await page.evaluate(() => [['Sora', 600], ['Manrope', 500], ['JetBrains Mono', 500]].map(([f, w]) => f + ': ' + (document.fonts.check(`${w} 16px "${f}"`) ? 'ok' : 'respaldo del sistema')));
  console.log('Fuentes ->', fonts.join(', '));
  const duration = await page.evaluate(() => window.__duration);

  if (process.env.FRAMES) {
    for (const f of process.env.FRAMES.split(',').map(Number)) {
      await page.evaluate(t => window.__seek(t), f / FPS);
      const file = path.join(path.dirname(out), `frame-${String(f).padStart(4, '0')}.png`);
      await page.screenshot({ path: file });
      console.log('Captura', file);
    }
    await browser.close();
    return;
  }

  // Audio opcional: VOZ=archivo (por defecto voz.mp3/voz.wav junto a este script si existen). Se recorta o completa con silencio a la duración exacta.
  const voz = process.env.VOZ ? path.resolve(process.env.VOZ) : ['voz.mp3', 'voz.wav', 'voz.m4a'].map(f => path.join(__dirname, f)).find(f => fs.existsSync(f));
  if (voz && !fs.existsSync(voz)) throw new Error('No existe el archivo de voz: ' + voz);
  if (voz) console.log('Voz ->', voz);
  const audioArgs = voz ? ['-i', voz, '-map', '0:v', '-map', '1:a', '-af', 'apad', '-c:a', 'aac', '-b:a', '192k', '-t', String(duration)] : [];
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png', '-i', '-', ...audioArgs,
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'medium', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const total = Math.round(duration * FPS);
  for (let i = 0; i < total; i++) {
    await page.evaluate(t => window.__seek(t), i / FPS);
    const buf = await page.screenshot({ type: 'png' });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (i % FPS === 0) process.stdout.write(`\r${(i / FPS).toFixed(0).padStart(2)} / ${duration} s`);
  }
  ff.stdin.end();
  const code = await new Promise(r => ff.on('close', r));
  await browser.close();
  if (code !== 0) { console.error('\nffmpeg terminó con código', code); process.exit(code); }
  console.log(`\nListo: ${out}`);
})().catch(e => { console.error(e); process.exit(1); });
