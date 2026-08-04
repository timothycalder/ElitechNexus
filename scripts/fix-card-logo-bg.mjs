/**
 * Rebuild bento decorative card lines: keep original transparent art + tile,
 * replace only the inner logo mark with cyan EL (no black plates).
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";

const BACKUP = "public/assets/images/_backup-devin-mockups";
const OUT = "public/assets/images";
const LOGO = "public/assets/images/elitechnexus-logo.svg";
const CACHE = 16;

/** Original Devin icon tile fill (slightly lighter than #131a29). */
const TILE = { r: 32, g: 45, b: 69, alpha: 255 };

async function makeElIcon(size) {
  const svg = fs.readFileSync(LOGO);
  return sharp(svg)
    .resize(size, size, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .ensureAlpha()
    .png()
    .toBuffer();
}

/**
 * Erase old logo glyphs inside the tile, keep the rounded plate + line.
 * Then composite transparent EL centered on the tile.
 */
async function rebuildCard(name, cx, cy, tileSize = 48) {
  const src = path.join(BACKUP, name);
  let { data, info } = await sharp(src)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const half = Math.ceil(tileSize / 2) + 2;
  const x0 = Math.max(0, cx - half);
  const y0 = Math.max(0, cy - half);
  const x1 = Math.min(info.width - 1, cx + half);
  const y1 = Math.min(info.height - 1, cy + half);

  // Inside the tile square: replace non-transparent pixels with tile fill
  // (wipes old Devin mark). Soft edge: only touch opaque-ish pixels.
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const i = (y * info.width + x) * 4;
      const a = data[i + 3];
      if (a < 40) continue;

      // Keep a thin outer border ring if it's already near tile color;
      // always clear brighter logo strokes.
      const lum = (data[i] + data[i + 1] + data[i + 2]) / 3;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.max(Math.abs(dx), Math.abs(dy)); // chebyshev ≈ rounded square
      const inside = dist < tileSize / 2 - 1;

      if (inside || lum > 90) {
        data[i] = TILE.r;
        data[i + 1] = TILE.g;
        data[i + 2] = TILE.b;
        data[i + 3] = 255;
      }
    }
  }

  const cleared = await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toBuffer();

  const elSize = Math.round(tileSize * 0.72);
  const icon = await makeElIcon(elSize);

  await sharp(cleared)
    .composite([
      {
        input: icon,
        left: Math.round(cx - elSize / 2),
        top: Math.round(cy - elSize / 2),
      },
    ])
    .png()
    .toFile(path.join(OUT, name));

  const check = await sharp(path.join(OUT, name)).metadata();
  console.log(
    "wrote",
    name,
    `${check.width}x${check.height}`,
    "alpha",
    check.hasAlpha,
    "icon@",
    cx,
    cy
  );
}

// Centers from bright-logo detection on original Devin backups
await rebuildCard("card01.png", 40, 208, 48);
await rebuildCard("card02-line.png", 224, 203, 48);
await rebuildCard("card03-line.png", 39, 208, 48);

function walk(d, a = []) {
  for (const n of fs.readdirSync(d)) {
    if (n === "visual-3d") continue;
    const f = path.join(d, n);
    const s = fs.statSync(f);
    if (s.isDirectory()) walk(f, a);
    else if (n.endsWith(".html")) a.push(f);
  }
  return a;
}

for (const f of walk("public")) {
  let h = fs.readFileSync(f, "utf8");
  const before = h;
  for (const name of ["card01.png", "card02-line.png", "card03-line.png"]) {
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
