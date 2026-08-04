import sharp from "sharp";

const bak = "public/assets/images/_backup-devin-mockups/bento03.png";
const { data, info } = await sharp(bak)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
const W = info.width;
const C = 4;
const get = (x, y) => {
  const i = (y * W + x) * C;
  return [data[i], data[i + 1], data[i + 2]];
};
const lum = (r, g, b) => 0.299 * r + 0.587 * g + 0.114 * b;
const isTeal = (r, g, b) =>
  g > 140 && g > r + 20 && b > 100 && lum(r, g, b) > 120;

// Collect teal around y 250-320
const teal = [];
for (let y = 240; y < 330; y++) {
  for (let x = 80; x < 400; x++) {
    const [r, g, b] = get(x, y);
    if (isTeal(r, g, b)) teal.push({ x, y, r, g, b });
  }
}
console.log("teal count", teal.length);
if (teal.length) {
  console.log(
    "bbox",
    Math.min(...teal.map((p) => p.x)),
    Math.min(...teal.map((p) => p.y)),
    Math.max(...teal.map((p) => p.x)),
    Math.max(...teal.map((p) => p.y))
  );
}

// Flood fill connected components for teal
const key = (x, y) => y * W + x;
const set = new Set(teal.map((p) => key(p.x, p.y)));
const visited = new Set();
const blobs = [];
for (const p of teal) {
  const k0 = key(p.x, p.y);
  if (visited.has(k0)) continue;
  const q = [p];
  visited.add(k0);
  let minX = p.x,
    minY = p.y,
    maxX = p.x,
    maxY = p.y,
    n = 0;
  while (q.length) {
    const { x, y } = q.pop();
    n++;
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
    for (const [dx, dy] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
      [1, 1],
      [-1, -1],
      [1, -1],
      [-1, 1],
    ]) {
      const nx = x + dx,
        ny = y + dy;
      const nk = key(nx, ny);
      if (visited.has(nk) || !set.has(nk)) continue;
      visited.add(nk);
      q.push({ x: nx, y: ny });
    }
  }
  const w = maxX - minX + 1,
    h = maxY - minY + 1;
  blobs.push({ minX, minY, maxX, maxY, w, h, n, cx: (minX + maxX) / 2, cy: (minY + maxY) / 2 });
}
blobs.sort((a, b) => a.minX - b.minX);
console.log("blobs", blobs.filter((b) => b.n > 20));

// Crops
await sharp(bak)
  .extract({ left: 80, top: 240, width: 420, height: 90 })
  .png()
  .toFile("scripts/_shell-row.png");
await sharp(bak)
  .extract({ left: 100, top: 255, width: 60, height: 50 })
  .resize(240, 200, { kernel: "nearest" })
  .png()
  .toFile("scripts/_molecule-zoom.png");

// Title bright text bbox
const titlePts = [];
for (let y = 85; y < 130; y++) {
  for (let x = 100; x < 400; x++) {
    const [r, g, b] = get(x, y);
    if (lum(r, g, b) > 140) titlePts.push({ x, y });
  }
}
if (titlePts.length) {
  console.log("title bbox", {
    minX: Math.min(...titlePts.map((p) => p.x)),
    minY: Math.min(...titlePts.map((p) => p.y)),
    maxX: Math.max(...titlePts.map((p) => p.x)),
    maxY: Math.max(...titlePts.map((p) => p.y)),
    n: titlePts.length,
  });
}
