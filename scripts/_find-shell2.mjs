import sharp from "sharp";

const bak = "public/assets/images/_backup-devin-mockups/bento03.png";
const { data, info } = await sharp(bak)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
const W = info.width;
const H = info.height;
const C = 4;
const get = (x, y) => {
  const i = (y * W + x) * C;
  return [data[i], data[i + 1], data[i + 2], data[i + 3]];
};
const lum = (r, g, b) => 0.299 * r + 0.587 * g + 0.114 * b;

// Find ALL non-dark pixels in left-upper region
const pts = [];
for (let y = 70; y < 280; y++) {
  for (let x = 60; x < 450; x++) {
    const [r, g, b, a] = get(x, y);
    if (a < 100) continue;
    const L = lum(r, g, b);
    if (L < 55) continue;
    pts.push({ x, y, r, g, b, L: L | 0 });
  }
}
console.log("non-dark pts", pts.length);

// Cluster by y
const byY = {};
for (const p of pts) {
  const k = (p.y / 4) | 0;
  (byY[k] = byY[k] || []).push(p);
}
for (const k of Object.keys(byY)
  .map(Number)
  .sort((a, b) => a - b)) {
  const arr = byY[k];
  const xs = arr.map((p) => p.x);
  const avgL = (arr.reduce((s, p) => s + p.L, 0) / arr.length) | 0;
  const sample = arr[Math.floor(arr.length / 2)];
  console.log(
    "y~",
    k * 4,
    "n",
    arr.length,
    "x",
    Math.min(...xs),
    "-",
    Math.max(...xs),
    "avgL",
    avgL,
    "sample",
    sample.r,
    sample.g,
    sample.b
  );
}

// Zoom band1 with contrast boost for visual
await sharp(bak)
  .extract({ left: 70, top: 115, width: 350, height: 60 })
  .linear(2.5, -40)
  .png()
  .toFile("scripts/_bak-band1-boost.png");

await sharp(bak)
  .extract({ left: 90, top: 95, width: 80, height: 50 })
  .resize(320, 200, { kernel: "nearest" })
  .png()
  .toFile("scripts/_icon-nearest.png");

// Check if Shell exists as text by looking for teal-ish at higher threshold elsewhere in image
let maxG = 0,
  maxAt = null;
for (let y = 0; y < H; y++) {
  for (let x = 0; x < Math.min(600, W); x++) {
    const [r, g, b] = get(x, y);
    if (g - r > maxG && g > 80) {
      maxG = g - r;
      maxAt = { x, y, r, g, b };
    }
  }
}
console.log("max g-r in left half", maxG, maxAt);

// Full image downscale for overview
await sharp(bak).resize(644, 314).png().toFile("scripts/_bak-full.png");
await sharp("public/assets/images/bento03.png")
  .resize(644, 314)
  .png()
  .toFile("scripts/_cur-full.png");
