/**
 * Replace Shell-tab molecule icon in bento03 with Elitechnexus EL logo.
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";

const OUT = "public/assets/images";
const BACKUP = "public/assets/images/_backup-devin-mockups";
const LOGO = "public/assets/images/elitechnexus-logo.svg";
const CACHE = 26;

async function makeEl(size) {
  return sharp(fs.readFileSync(LOGO))
    .resize(size, size, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .ensureAlpha()
    .png()
    .toBuffer();
}

async function findShellIcon(file) {
  const { data, info } = await sharp(file)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const W = info.width;
  const H = info.height;

  // Search band for tab row
  const y0 = 90,
    y1 = 145,
    x0 = 40,
    x1 = 160;

  // Collect cyan-ish pixels
  const pts = [];
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const i = (y * W + x) * 4;
      if (data[i + 3] < 180) continue;
      const r = data[i],
        g = data[i + 1],
        b = data[i + 2];
      if (g > 140 && g > r + 10 && b > 80 && (r + g + b) / 3 > 90) {
        pts.push({ x, y });
      }
    }
  }
  if (!pts.length) return null;

  // Flood-fill connected components; pick compact roughly-square blob (the icon)
  const key = (x, y) => y * W + x;
  const set = new Set(pts.map((p) => key(p.x, p.y)));
  const visited = new Set();
  const blobs = [];

  for (const p of pts) {
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
    const w = maxX - minX + 1;
    const h = maxY - minY + 1;
    const aspect = w / h;
    blobs.push({
      minX,
      minY,
      maxX,
      maxY,
      w,
      h,
      n,
      aspect,
      cx: Math.round((minX + maxX) / 2),
      cy: Math.round((minY + maxY) / 2),
    });
  }

  // Prefer compact icon: height ~ width, size ~ 20-50px, leftmost
  blobs.sort((a, b) => a.minX - b.minX);
  console.log(
    "blobs",
    blobs.map((b) => ({ ...b, score: null }))
  );

  const icon = blobs.find(
    (b) => b.n > 40 && b.w >= 16 && b.h >= 16 && b.w <= 55 && b.h <= 55 && b.aspect > 0.6 && b.aspect < 1.7
  );
  return icon || null;
}

async function patch(name) {
  const livePath = path.join(OUT, name);
  // Always start from backup so we don't stack edits / hit same-file sharp issue
  const bakPath = path.join(BACKUP, name);
  if (!fs.existsSync(bakPath)) {
    console.log("no backup", name);
    return;
  }

  // Use current live if it already has Elitechnexus title (preferred), else backup
  // Read into buffer first
  let baseBuf;
  if (fs.existsSync(livePath)) {
    baseBuf = await sharp(livePath).png().toBuffer();
  } else {
    baseBuf = await sharp(bakPath).png().toBuffer();
  }

  // Write temp for analysis
  const tmp = path.join("scripts", "_tmp-" + name);
  await sharp(baseBuf).toFile(tmp);

  const icon = await findShellIcon(tmp);
  console.log(name, "shell icon", icon);
  if (!icon) {
    console.log("fallback: try backup for icon coords");
    const bakIcon = await findShellIcon(bakPath);
    console.log("backup icon", bakIcon);
    if (!bakIcon) return;
    return patchWithCoords(name, baseBuf, bakIcon);
  }
  return patchWithCoords(name, baseBuf, icon);
}

async function patchWithCoords(name, baseBuf, icon) {
  const meta = await sharp(baseBuf).metadata();

  // Sample bg from nearby dark pixels (left of icon)
  const sampleX = Math.max(0, icon.minX - 12);
  const sampleY = icon.cy - 4;
  const { data } = await sharp(baseBuf)
    .extract({
      left: sampleX,
      top: Math.max(0, sampleY),
      width: 8,
      height: 8,
    })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  let r = 0,
    g = 0,
    b = 0,
    n = 0;
  for (let i = 0; i < data.length; i += 4) {
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
    n++;
  }
  const bg = [Math.round(r / n), Math.round(g / n), Math.round(b / n)];
  console.log(name, "bg", bg);

  const pad = 5;
  const left = Math.max(0, icon.minX - pad);
  const top = Math.max(0, icon.minY - pad);
  const clearW = icon.w + pad * 2;
  const clearH = icon.h + pad * 2;

  const cover = Buffer.from(`<?xml version="1.0"?>
<svg width="${meta.width}" height="${meta.height}" xmlns="http://www.w3.org/2000/svg">
  <rect x="${left}" y="${top}" width="${clearW}" height="${clearH}"
    rx="4" fill="rgb(${bg[0]},${bg[1]},${bg[2]})"/>
</svg>`);

  const elSize = Math.max(24, Math.min(34, Math.round(Math.max(icon.w, icon.h) * 1.05)));
  const el = await makeEl(elSize);

  const outBuf = await sharp(baseBuf)
    .composite([
      { input: cover, top: 0, left: 0 },
      {
        input: el,
        left: Math.round(icon.cx - elSize / 2),
        top: Math.round(icon.cy - elSize / 2),
      },
    ])
    .png()
    .toBuffer();

  await sharp(outBuf).toFile(path.join(OUT, name));
  console.log("wrote", name, "el@", icon.cx, icon.cy, "size", elSize);
}

await patch("bento03.png");

// Mobile: search lower for Shell row if present
async function findShellIconMobile(file) {
  // reuse same logic but different band — quick scan
  const { data, info } = await sharp(file)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  // Look for compact cyan blob near left in lower half
  const W = info.width;
  let best = null;
  for (const [y0, y1] of [
    [300, 370],
    [250, 330],
    [200, 280],
  ]) {
    const pts = [];
    for (let y = y0; y <= y1; y++) {
      for (let x = 20; x <= 100; x++) {
        const i = (y * W + x) * 4;
        if (data[i + 3] < 180) continue;
        const r = data[i],
          g = data[i + 1],
          b = data[i + 2];
        if (g > 140 && g > r + 10 && b > 80) pts.push({ x, y });
      }
    }
    if (pts.length > 40 && pts.length < 800) {
      let minX = 9999,
        minY = 9999,
        maxX = 0,
        maxY = 0;
      for (const p of pts) {
        minX = Math.min(minX, p.x);
        minY = Math.min(minY, p.y);
        maxX = Math.max(maxX, p.x);
        maxY = Math.max(maxY, p.y);
      }
      const w = maxX - minX + 1,
        h = maxY - minY + 1;
      if (w >= 14 && h >= 14 && w <= 50 && h <= 50) {
        best = {
          minX,
          minY,
          maxX,
          maxY,
          w,
          h,
          cx: Math.round((minX + maxX) / 2),
          cy: Math.round((minY + maxY) / 2),
        };
        break;
      }
    }
  }
  return best;
}

{
  const livePath = path.join(OUT, "bento-mobile03.png");
  if (fs.existsSync(livePath)) {
    const baseBuf = await sharp(livePath).png().toBuffer();
    const tmp = "scripts/_tmp-bento-mobile03.png";
    await sharp(baseBuf).toFile(tmp);
    const icon = await findShellIconMobile(tmp);
    console.log("mobile icon", icon);
    if (icon) await patchWithCoords("bento-mobile03.png", baseBuf, icon);
  }
}

function walk(d, a = []) {
  for (const n of fs.readdirSync(d)) {
    if (n === "visual-3d") continue;
    const f = path.join(d, n);
    if (fs.statSync(f).isDirectory()) walk(f, a);
    else if (n.endsWith(".html")) a.push(f);
  }
  return a;
}

for (const f of walk("public")) {
  let h = fs.readFileSync(f, "utf8");
  const before = h;
  for (const name of ["bento03.png", "bento-mobile03.png"]) {
    h = h.replace(
      new RegExp(`(/assets/images/${name.replace(".", "\\.")})(?:\\?v=\\d+)?`, "g"),
      `$1?v=${CACHE}`
    );
  }
  if (h !== before) {
    fs.writeFileSync(f, h);
    console.log("cache", f);
  }
}

await sharp(path.join(OUT, "bento03.png"))
  .extract({ left: 40, top: 80, width: 420, height: 90 })
  .png()
  .toFile("scripts/_shell-fixed.png");

// cleanup temps
for (const t of ["scripts/_tmp-bento03.png", "scripts/_tmp-bento-mobile03.png"]) {
  try {
    fs.unlinkSync(t);
  } catch {}
}
console.log("done");
