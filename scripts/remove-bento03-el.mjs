/**
 * Remove misplaced Elitechnexus EL logo from bento03 / bento-mobile03
 * (Side-income card). Cover with chrome background — do NOT put a logo back.
 */
import fs from "fs";
import sharp from "sharp";

const V = 17;

async function removeElMarks(file, opts) {
  if (!fs.existsSync(file)) {
    console.log("skip missing", file);
    return false;
  }

  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width;
  const H = info.height;

  function isElCyan(r, g, b, a) {
    if (a < 150) return false;
    // Bright cyan/teal of EL mark (and Shell active text — be careful)
    return g > 160 && b > 120 && g > r + 15 && b > r + 5 && g + b > 300 && r < 180;
  }

  const y0 = opts.y0 ?? Math.floor(H * 0.05);
  const y1 = opts.y1 ?? Math.floor(H * 0.28);
  const x0 = opts.x0 ?? 0;
  const x1 = opts.x1 ?? Math.floor(W * 0.45);

  const pts = [];
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const i = (y * W + x) * 4;
      if (isElCyan(data[i], data[i + 1], data[i + 2], data[i + 3])) pts.push({ x, y });
    }
  }

  // Cluster
  const hist = {};
  for (const p of pts) {
    const k = `${Math.floor(p.x / 5)},${Math.floor(p.y / 5)}`;
    hist[k] = (hist[k] || 0) + 1;
  }
  const clusters = Object.entries(hist)
    .filter(([, n]) => n >= (opts.minPts || 18))
    .map(([k, n]) => {
      const [bx, by] = k.split(",").map(Number);
      return { cx: bx * 5 + 2, cy: by * 5 + 2, n };
    })
    .sort((a, b) => b.n - a.n);

  if (!clusters.length) {
    console.log("no EL clusters", file);
    return false;
  }

  // Keep only compact icon-like clusters (not long Shell text runs)
  const icons = [];
  for (const c of clusters.slice(0, 8)) {
    const near = pts.filter((p) => Math.hypot(p.x - c.cx, p.y - c.cy) < 22);
    if (near.length < 18) continue;
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
    const bw = maxX - minX + 1;
    const bh = maxY - minY + 1;
    // EL icon: roughly square-ish / small. Shell word is wide.
    if (bw > 55 || bh > 40 || bw * bh > 2200) continue;
    if (bh < 10 || bw < 12) continue;
    icons.push({ minX, minY, maxX, maxY, bw, bh, n: near.length });
  }

  // Deduplicate overlapping
  const kept = [];
  for (const ic of icons.sort((a, b) => a.minX - b.minX)) {
    if (kept.some((k) => Math.abs(k.minX - ic.minX) < 20 && Math.abs(k.minY - ic.minY) < 20)) continue;
    kept.push(ic);
  }

  if (!kept.length) {
    console.log("no icon-sized clusters", file, "raw clusters", clusters.slice(0, 3));
    return false;
  }

  const composites = [];
  for (const ic of kept) {
    const pad = 3;
    const left = Math.max(0, ic.minX - pad);
    const top = Math.max(0, ic.minY - pad);
    const right = Math.min(W - 1, ic.maxX + pad);
    const bottom = Math.min(H - 1, ic.maxY + pad);
    const bw = right - left + 1;
    const bh = bottom - top + 1;

    // Sample background left of icon
    const sx = Math.max(0, left - 6);
    const sy = Math.floor((top + bottom) / 2);
    const si = (sy * W + sx) * 4;
    const bg = { r: data[si], g: data[si + 1], b: data[si + 2], alpha: 255 };

    const cover = await sharp({
      create: { width: bw, height: bh, channels: 4, background: bg },
    })
      .png()
      .toBuffer();
    composites.push({ input: cover, left, top });
    console.log("cover", file.split("/").pop(), { left, top, bw, bh, n: ic.n });
  }

  const tmp = file + ".tmp.png";
  await sharp(file).composite(composites).png().toFile(tmp);
  fs.copyFileSync(tmp, file);
  fs.unlinkSync(tmp);
  return true;
}

await removeElMarks("public/assets/images/bento03.png", {
  y0: 70,
  y1: 160,
  x0: 40,
  x1: 280,
  minPts: 16,
});

await removeElMarks("public/assets/images/bento-mobile03.png", {
  y0: 40,
  y1: 140,
  x0: 10,
  x1: 200,
  minPts: 12,
});

// Also check title row for any EL between Elitechnexus and Workspace
await removeElMarks("public/assets/images/bento03.png", {
  y0: 40,
  y1: 100,
  x0: 80,
  x1: 450,
  minPts: 20,
});

let html = fs.readFileSync("public/index.html", "utf8");
html = html.replace(/bento03\.png(?:\?v=\d+)?/g, `bento03.png?v=${V}`);
html = html.replace(/bento-mobile03\.png(?:\?v=\d+)?/g, `bento-mobile03.png?v=${V}`);
fs.writeFileSync("public/index.html", html);

// Preview
await sharp("public/assets/images/bento03.png")
  .extract({ left: 20, top: 50, width: 520, height: 100 })
  .png()
  .toFile("public/assets/images/_bento03-after.png");

console.log("done v=", V);
