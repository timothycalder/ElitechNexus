/**
 * Remove EL icon left of Shell in bento03 / mobile (Side-income card).
 * Leave title text alone. Do not replace with another logo.
 */
import fs from "fs";
import sharp from "sharp";

const V = 19;

async function removeShellEl(file, approx) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width;

  function isBrightCyan(r, g, b, a) {
    return a > 180 && g > 190 && b > 160 && g > r + 40 && r < 120;
  }

  const pts = [];
  for (let y = approx.y0; y <= approx.y1; y++) {
    for (let x = approx.x0; x <= approx.x1; x++) {
      const i = (y * W + x) * 4;
      if (isBrightCyan(data[i], data[i + 1], data[i + 2], data[i + 3])) pts.push({ x, y });
    }
  }
  if (pts.length < 10) {
    console.log("few pts", file, pts.length);
    return false;
  }

  // Leftmost cyan cluster = EL (Shell letters are to the right)
  const hist = {};
  for (const p of pts) {
    const k = `${Math.floor(p.x / 3)},${Math.floor(p.y / 3)}`;
    hist[k] = (hist[k] || 0) + 1;
  }
  let best = null,
    bestScore = -1;
  for (const [k, n] of Object.entries(hist)) {
    if (n < 5) continue;
    const [bx] = k.split(",").map(Number);
    // Prefer left + dense
    const score = n * 10 - bx;
    if (score > bestScore) {
      bestScore = score;
      best = k;
    }
  }
  const [bx, by] = best.split(",").map(Number);
  const cx = bx * 3 + 1;
  const cy = by * 3 + 1;
  const near = pts.filter((p) => Math.hypot(p.x - cx, p.y - cy) < 18);
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  for (const p of near) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }
  // Don't extend into Shell word
  maxX = Math.min(maxX, minX + 34);

  const pad = 3;
  minX = Math.max(0, minX - pad);
  minY = Math.max(0, minY - pad);
  maxX = Math.min(W - 1, maxX + pad);
  maxY = Math.min(info.height - 1, maxY + pad);
  const bw = maxX - minX + 1;
  const bh = maxY - minY + 1;

  const sx = Math.max(0, minX - 10);
  const sy = Math.floor((minY + maxY) / 2);
  const si = (sy * W + sx) * 4;
  const bg = { r: data[si], g: data[si + 1], b: data[si + 2], alpha: 255 };

  const cover = await sharp({
    create: { width: bw, height: bh, channels: 4, background: bg },
  })
    .png()
    .toBuffer();

  const tmp = file + ".tmp.png";
  await sharp(file)
    .composite([{ input: cover, left: minX, top: minY }])
    .png()
    .toFile(tmp);
  fs.copyFileSync(tmp, file);
  fs.unlinkSync(tmp);
  console.log("removed", file.split(/[/\\]/).pop(), { minX, minY, bw, bh });
  return true;
}

// Ensure clean restore first (title must stay intact)
const bak = "public/assets/images/bento03.pre-el.png";
if (fs.existsSync(bak)) fs.copyFileSync(bak, "public/assets/images/bento03.png");
const bakM = "public/assets/images/bento-mobile03.pre-el.png";
if (fs.existsSync(bakM)) fs.copyFileSync(bakM, "public/assets/images/bento-mobile03.png");

await removeShellEl("public/assets/images/bento03.png", {
  y0: 265,
  y1: 315,
  x0: 90,
  x1: 180,
});

// Mobile: find bright cyan band
{
  const f = "public/assets/images/bento-mobile03.png";
  const { data, info } = await sharp(f).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width;
  const H = info.height;
  const pts = [];
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < Math.floor(W * 0.5); x++) {
      const i = (y * W + x) * 4;
      const r = data[i],
        g = data[i + 1],
        b = data[i + 2],
        a = data[i + 3];
      if (a > 180 && g > 190 && b > 160 && g > r + 40 && r < 120) pts.push({ x, y });
    }
  }
  if (pts.length) {
    const minY = Math.min(...pts.map((p) => p.y));
    const maxY = Math.max(...pts.map((p) => p.y));
    await removeShellEl(f, {
      y0: Math.max(0, minY - 5),
      y1: Math.min(H - 1, maxY + 5),
      x0: 40,
      x1: 160,
    });
  } else console.log("mobile: no bright cyan");
}

let html = fs.readFileSync("public/index.html", "utf8");
html = html.replace(/bento03\.png(?:\?v=\d+)?/g, `bento03.png?v=${V}`);
html = html.replace(/bento-mobile03\.png(?:\?v=\d+)?/g, `bento-mobile03.png?v=${V}`);
fs.writeFileSync("public/index.html", html);

await sharp("public/assets/images/bento03.png")
  .extract({ left: 90, top: 255, width: 320, height: 70 })
  .png()
  .toFile("public/assets/images/_bento03-shell-after.png");
await sharp("public/assets/images/bento03.png")
  .extract({ left: 20, top: 50, width: 480, height: 50 })
  .png()
  .toFile("public/assets/images/_bento03-title-after.png");

console.log("done v=", V);
