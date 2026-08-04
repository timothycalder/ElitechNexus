/**
 * Rebuild bento03 from backup:
 * 1) Title: Devin's Workspace → Elitechnexus Workspace
 * 2) Shell-tab molecule (left of Shell, ~y275) → Elitechnexus EL logo
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";

const OUT = "public/assets/images";
const BACKUP = "public/assets/images/_backup-devin-mockups";
const LOGO = "public/assets/images/elitechnexus-logo.svg";
const CACHE = 28;

function walkHtml(dir, acc = []) {
  for (const n of fs.readdirSync(dir)) {
    if (n === "visual-3d" || n === "node_modules") continue;
    const f = path.join(dir, n);
    const s = fs.statSync(f);
    if (s.isDirectory()) walkHtml(f, acc);
    else if (n.endsWith(".html")) acc.push(f);
  }
  return acc;
}

function sampleBg(data, W, C, x0, y0, x1, y1) {
  let r = 0,
    g = 0,
    b = 0,
    n = 0;
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const i = (y * W + x) * C;
      // skip bright pixels
      const L = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      if (L > 80) continue;
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
      n++;
    }
  }
  if (!n) return { r: 45, g: 59, b: 92, alpha: 255 };
  return {
    r: Math.round(r / n),
    g: Math.round(g / n),
    b: Math.round(b / n),
    alpha: 255,
  };
}

async function paintRect(buf, meta, left, top, width, height, color) {
  const patch = await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: color,
    },
  })
    .png()
    .toBuffer();
  return sharp(buf)
    .composite([{ input: patch, left, top }])
    .png()
    .toBuffer();
}

async function makeEl(w, h) {
  return sharp(fs.readFileSync(LOGO))
    .resize(w, h, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .ensureAlpha()
    .png()
    .toBuffer();
}

async function titleOverlay(text, w, h, fontSize, fill) {
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  <text x="0" y="${Math.round(fontSize * 0.85)}"
    font-family="Segoe UI, Helvetica Neue, Arial, sans-serif"
    font-size="${fontSize}" font-weight="500"
    fill="${fill}">${text}</text>
</svg>`;
  return sharp(Buffer.from(svg)).png().toBuffer();
}

async function rebuildDesktop() {
  const bak = path.join(BACKUP, "bento03.png");
  let buf = await sharp(bak).ensureAlpha().png().toBuffer();
  const meta = await sharp(buf).metadata();
  const { data, info } = await sharp(buf)
    .raw()
    .toBuffer({ resolveWithObject: true });
  const W = info.width;
  const C = info.channels;

  // --- 1) Title ---
  // Devin's Workspace ~ x118-399, y92-125
  const titleBg = sampleBg(data, W, C, 100, 80, 160, 90);
  console.log("title bg", titleBg);
  buf = await paintRect(buf, meta, 110, 88, 310, 42, titleBg);

  // Sample original title color from backup bright pixels
  let tr = 0,
    tg = 0,
    tb = 0,
    tn = 0;
  for (let y = 95; y <= 120; y++) {
    for (let x = 120; x <= 250; x++) {
      const i = (y * W + x) * C;
      const L = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      if (L < 150) continue;
      tr += data[i];
      tg += data[i + 1];
      tb += data[i + 2];
      tn++;
    }
  }
  const fill =
    tn > 0
      ? `rgb(${Math.round(tr / tn)},${Math.round(tg / tn)},${Math.round(tb / tn)})`
      : "rgb(186,215,245)";
  console.log("title fill", fill, "n", tn);

  const title = await titleOverlay("Elitechnexus Workspace", 300, 36, 26, fill);
  buf = await sharp(buf)
    .composite([{ input: title, left: 118, top: 94 }])
    .png()
    .toBuffer();

  // --- 2) Shell molecule → EL ---
  // Icon bbox ~ x114-143, y274-307 (leave Shell text at x>=165)
  const iconLeft = 108;
  const iconTop = 268;
  const iconW = 50;
  const iconH = 44;
  const iconBg = sampleBg(data, W, C, 90, 260, 110, 270);
  console.log("icon bg", iconBg);
  buf = await paintRect(buf, meta, iconLeft, iconTop, iconW, iconH, iconBg);

  const el = await makeEl(36, 28);
  // Center EL in icon box
  const elLeft = iconLeft + Math.round((iconW - 36) / 2);
  const elTop = iconTop + Math.round((iconH - 28) / 2);
  buf = await sharp(buf)
    .composite([{ input: el, left: elLeft, top: elTop }])
    .png()
    .toBuffer();

  await sharp(buf).toFile(path.join(OUT, "bento03.png"));
  await sharp(buf)
    .extract({ left: 80, top: 70, width: 420, height: 80 })
    .png()
    .toFile("scripts/_verify-title.png");
  await sharp(buf)
    .extract({ left: 80, top: 240, width: 420, height: 90 })
    .png()
    .toFile("scripts/_verify-shell.png");
  console.log("wrote bento03.png");
}

async function rebuildMobile() {
  const bak = path.join(BACKUP, "bento-mobile03.png");
  if (!fs.existsSync(bak)) {
    console.log("no mobile backup");
    return;
  }
  const { data, info } = await sharp(bak)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const W = info.width;
  const C = info.channels;
  const lum = (r, g, b) => 0.299 * r + 0.587 * g + 0.114 * b;
  const isTeal = (r, g, b) =>
    g > 140 && g > r + 20 && b > 100 && lum(r, g, b) > 120;

  // Find teal cluster (Shell row)
  let minX = W,
    minY = info.height,
    maxX = 0,
    maxY = 0,
    n = 0;
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < Math.min(W, 350); x++) {
      const i = (y * W + x) * C;
      if (!isTeal(data[i], data[i + 1], data[i + 2])) continue;
      n++;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }
  console.log("mobile teal", { n, minX, minY, maxX, maxY });
  if (n < 50) {
    console.log("skip mobile shell icon");
    // still fix title if present
  }

  let buf = await sharp(bak).ensureAlpha().png().toBuffer();

  // Title bright text
  const titlePts = [];
  for (let y = 40; y < 120; y++) {
    for (let x = 40; x < Math.min(W - 20, 350); x++) {
      const i = (y * W + x) * C;
      if (lum(data[i], data[i + 1], data[i + 2]) > 140) titlePts.push({ x, y });
    }
  }
  if (titlePts.length > 100) {
    const tMinX = Math.min(...titlePts.map((p) => p.x));
    const tMinY = Math.min(...titlePts.map((p) => p.y));
    const tMaxX = Math.max(...titlePts.map((p) => p.x));
    const tMaxY = Math.max(...titlePts.map((p) => p.y));
    console.log("mobile title", { tMinX, tMinY, tMaxX, tMaxY });
    const titleBg = sampleBg(
      data,
      W,
      C,
      Math.max(0, tMinX - 10),
      Math.max(0, tMinY - 20),
      tMinX + 20,
      tMinY - 2
    );
    const tw = tMaxX - tMinX + 24;
    const th = tMaxY - tMinY + 16;
    buf = await paintRect(
      buf,
      info,
      Math.max(0, tMinX - 8),
      Math.max(0, tMinY - 6),
      tw,
      th,
      titleBg
    );
    let tr = 0,
      tg = 0,
      tb = 0,
      tn = 0;
    for (const p of titlePts) {
      const i = (p.y * W + p.x) * C;
      tr += data[i];
      tg += data[i + 1];
      tb += data[i + 2];
      tn++;
    }
    const fill = `rgb(${Math.round(tr / tn)},${Math.round(tg / tn)},${Math.round(tb / tn)})`;
    const fontSize = Math.max(14, tMaxY - tMinY + 2);
    const title = await titleOverlay(
      "Elitechnexus Workspace",
      Math.min(tw + 40, W - tMinX),
      th,
      fontSize,
      fill
    );
    buf = await sharp(buf)
      .composite([
        {
          input: title,
          left: Math.max(0, tMinX - 4),
          top: Math.max(0, tMinY - 2),
        },
      ])
      .png()
      .toBuffer();
  }

  if (n >= 50) {
    // Leftmost teal blob ≈ molecule (before Shell letters)
    // Re-find leftmost compact blob
    const teal = [];
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= Math.min(maxX, minX + 80); x++) {
        const i = (y * W + x) * C;
        if (isTeal(data[i], data[i + 1], data[i + 2])) teal.push({ x, y });
      }
    }
    if (teal.length) {
      const ix0 = Math.min(...teal.map((p) => p.x)) - 4;
      const iy0 = Math.min(...teal.map((p) => p.y)) - 4;
      const ix1 = Math.min(
        Math.max(...teal.map((p) => p.x)) + 4,
        // stop before Shell text: look for gap
        minX + 45
      );
      const iy1 = Math.max(...teal.map((p) => p.y)) + 4;
      // Better: only left cluster before gap
      // Find gap in x histogram
      const hist = new Array(W).fill(0);
      for (const p of teal) hist[p.x]++;
      let iconMaxX = minX;
      let gapStart = null;
      for (let x = minX; x < minX + 80; x++) {
        if (hist[x] === 0) {
          if (gapStart == null) gapStart = x;
          if (x - gapStart >= 4 && iconMaxX > minX + 8) {
            iconMaxX = gapStart - 1;
            break;
          }
        } else {
          gapStart = null;
          iconMaxX = x;
        }
      }
      const iconLeft = Math.max(0, minX - 4);
      const iconTop = Math.max(0, iy0);
      const iconW = Math.max(20, iconMaxX - iconLeft + 6);
      const iconH = iy1 - iconTop + 2;
      console.log("mobile icon box", { iconLeft, iconTop, iconW, iconH });
      const iconBg = sampleBg(
        data,
        W,
        C,
        Math.max(0, iconLeft - 15),
        Math.max(0, iconTop - 10),
        iconLeft,
        iconTop
      );
      buf = await paintRect(buf, info, iconLeft, iconTop, iconW, iconH, iconBg);
      const elW = Math.min(32, iconW - 4);
      const elH = Math.min(24, iconH - 4);
      const el = await makeEl(elW, elH);
      buf = await sharp(buf)
        .composite([
          {
            input: el,
            left: iconLeft + Math.round((iconW - elW) / 2),
            top: iconTop + Math.round((iconH - elH) / 2),
          },
        ])
        .png()
        .toBuffer();
    }
  }

  await sharp(buf).toFile(path.join(OUT, "bento-mobile03.png"));
  console.log("wrote bento-mobile03.png");
}

await rebuildDesktop();
await rebuildMobile();

// bump cache
for (const f of walkHtml("public")) {
  let h = fs.readFileSync(f, "utf8");
  const next = h
    .replace(
      /(\/assets\/images\/bento03\.png)(?:\?v=\d+)?/g,
      `$1?v=${CACHE}`
    )
    .replace(
      /(\/assets\/images\/bento-mobile03\.png)(?:\?v=\d+)?/g,
      `$1?v=${CACHE}`
    );
  if (next !== h) {
    fs.writeFileSync(f, next);
    console.log("cache bust", f);
  }
}
