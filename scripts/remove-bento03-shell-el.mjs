/**
 * Restore bento03, then remove ONLY the EL icon left of "Shell" tab.
 * Do not touch title text "Elitechnexus Workspace".
 */
import fs from "fs";
import sharp from "sharp";

const V = 18;

function restore(file) {
  const bak = file.replace(/(\.\w+)$/, ".pre-el$1");
  if (fs.existsSync(bak)) {
    fs.copyFileSync(bak, file);
    console.log("restored", file);
    return true;
  }
  console.log("no backup", file);
  return false;
}

restore("public/assets/images/bento03.png");
restore("public/assets/images/bento-mobile03.png");

async function removeShellTabEl(file, region) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width;
  const H = info.height;

  function isEl(r, g, b, a) {
    // Bright cyan like Shell active + EL mark
    return a > 160 && g > 170 && b > 140 && g > r + 25 && b > r + 15 && r < 160 && g + b > 340;
  }

  const { y0, y1, x0, x1 } = region;
  const pts = [];
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const i = (y * W + x) * 4;
      if (isEl(data[i], data[i + 1], data[i + 2], data[i + 3])) pts.push({ x, y });
    }
  }
  console.log(file.split("/").pop(), "pts", pts.length);

  if (pts.length < 12) return false;

  // Leftmost dense cluster = icon before "Shell" (Shell text is to the right)
  const hist = {};
  for (const p of pts) {
    const k = `${Math.floor(p.x / 4)},${Math.floor(p.y / 4)}`;
    hist[k] = (hist[k] || 0) + 1;
  }
  let best = null,
    bestN = 0,
    bestX = Infinity;
  for (const [k, n] of Object.entries(hist)) {
    if (n < 8) continue;
    const [bx, by] = k.split(",").map(Number);
    const cx = bx * 4;
    // Prefer leftmost cluster in the tab row
    if (n > bestN || (n === bestN && cx < bestX)) {
      bestN = n;
      best = k;
      bestX = cx;
    }
  }
  if (!best) return false;

  const [bx, by] = best.split(",").map(Number);
  const cx = bx * 4 + 2;
  const cy = by * 4 + 2;
  const near = pts.filter((p) => Math.hypot(p.x - cx, p.y - cy) < 20);
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

  // Hard clamp: icon only, don't stretch into Shell letters
  maxX = Math.min(maxX, minX + 36);
  maxY = Math.min(maxY, minY + 28);

  const pad = 2;
  minX = Math.max(0, minX - pad);
  minY = Math.max(0, minY - pad);
  maxX = Math.min(W - 1, maxX + pad);
  maxY = Math.min(H - 1, maxY + pad);
  const bw = maxX - minX + 1;
  const bh = maxY - minY + 1;

  // Reject if this looks like we hit title text (too high / too wide relative)
  if (minY < region.titleFloor) {
    console.log("reject — too high (title area)", { minX, minY, bw, bh });
    return false;
  }

  const sx = Math.max(0, minX - 8);
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
  console.log("removed EL @", { minX, minY, bw, bh });
  return true;
}

// Desktop: tabs row is below title (~y>100). EL sits just left of Shell.
await removeShellTabEl("public/assets/images/bento03.png", {
  y0: 105,
  y1: 155,
  x0: 60,
  x1: 200,
  titleFloor: 100,
});

await removeShellTabEl("public/assets/images/bento-mobile03.png", {
  y0: 90,
  y1: 160,
  x0: 20,
  x1: 180,
  titleFloor: 85,
});

let html = fs.readFileSync("public/index.html", "utf8");
html = html.replace(/bento03\.png(?:\?v=\d+)?/g, `bento03.png?v=${V}`);
html = html.replace(/bento-mobile03\.png(?:\?v=\d+)?/g, `bento-mobile03.png?v=${V}`);
fs.writeFileSync("public/index.html", html);

await sharp("public/assets/images/bento03.png")
  .extract({ left: 20, top: 50, width: 520, height: 110 })
  .png()
  .toFile("public/assets/images/_bento03-after.png");

console.log("done v=", V);
