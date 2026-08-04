import { chromium } from "playwright";
import path from "path";
import fs from "fs";

const src = path.resolve("public/assets/images/home-hero/hero_layer_0.png");
const backup = path.resolve("public/assets/images/home-hero/hero_layer_0.orig.png");
const out = src;

if (!fs.existsSync(backup)) {
  fs.copyFileSync(src, backup);
  console.log("backed up original -> hero_layer_0.orig.png");
}

const browser = await chromium.launch();
const page = await browser.newPage();

// Load image to get natural size
await page.setContent(`<img id="i" src="file:///${src.replace(/\\/g, "/")}"/>`);
const size = await page.evaluate(() => {
  const i = document.getElementById("i");
  return new Promise((res) => {
    if (i.complete) res({ w: i.naturalWidth, h: i.naturalHeight });
    else i.onload = () => res({ w: i.naturalWidth, h: i.naturalHeight });
  });
});
console.log("size", size);

// Create editing canvas page
const dataUrl = `data:image/png;base64,${fs.readFileSync(src).toString("base64")}`;
await page.setViewportSize({ width: size.w, height: size.h });
await page.setContent(`<!DOCTYPE html>
<html><body style="margin:0;background:#000">
<canvas id="c" width="${size.w}" height="${size.h}"></canvas>
<script>
const img = new Image();
img.onload = () => {
  const c = document.getElementById('c');
  const ctx = c.getContext('2d');
  ctx.drawImage(img, 0, 0);

  // Sample background near the big "Devin" name (right of logo)
  // Layout from visual: logo left, Devin text ~ mid-left
  // We'll cover two regions and redraw text.

  function coverAndWrite(x, y, w, h, text, font, color, align='left') {
    // sample fill color from left of region
    const sample = ctx.getImageData(Math.max(0,x-2), y + Math.floor(h/2), 1, 1).data;
    const fill = \`rgba(\${sample[0]},\${sample[1]},\${sample[2]},255)\`;
    ctx.fillStyle = fill;
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = color;
    ctx.font = font;
    ctx.textBaseline = 'middle';
    ctx.textAlign = align;
    const tx = align === 'left' ? x + 2 : x + w/2;
    ctx.fillText(text, tx, y + h/2);
  }

  // Heuristic regions based on typical Devin hero card proportions.
  // Top muted label "Build more with Devin"
  coverAndWrite(
    Math.floor(size.w * 0.04),
    Math.floor(size.h * 0.04),
    Math.floor(size.w * 0.55),
    Math.floor(size.h * 0.08),
    'Build more with Elitechnexus',
    \`600 \${Math.floor(size.h * 0.035)}px Inter, Segoe UI, Arial, sans-serif\`,
    'rgba(160,185,210,0.85)'
  );

  // Main white "Devin" next to logo — cover name only (not logo)
  // Logo cluster is left; name starts ~ after logo
  coverAndWrite(
    Math.floor(size.w * 0.22),
    Math.floor(size.h * 0.22),
    Math.floor(size.w * 0.55),
    Math.floor(size.h * 0.16),
    'Elitechnexus',
    \`700 \${Math.floor(size.h * 0.11)}px Inter, Segoe UI, Arial, sans-serif\`,
    '#ffffff'
  );

  window.__done = true;
};
img.src = ${JSON.stringify(dataUrl)};
</script>
</body></html>`);

await page.waitForFunction(() => window.__done === true, null, { timeout: 15000 });
await page.locator("#c").screenshot({ path: out, type: "png", omitBackground: false });
await browser.close();
console.log("wrote", out);
