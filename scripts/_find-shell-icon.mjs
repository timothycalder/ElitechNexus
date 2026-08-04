import sharp from "sharp";
import fs from "fs";

const bak = "public/assets/images/_backup-devin-mockups/bento03.png";
const cur = "public/assets/images/bento03.png";

async function analyze(label, src) {
  const { data, info } = await sharp(src)
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

  console.log("\n===", label, info.width, "x", info.height, "===");

  // Color map
  for (let y = 80; y <= 220; y += 8) {
    let row = "y" + String(y).padStart(3) + ": ";
    for (let x = 80; x <= 320; x += 12) {
      const [r, g, b] = get(x, y);
      const L = lum(r, g, b);
      let t = ".";
      if (L < 35) t = "_";
      else if (g > r + 35 && g > b + 5) t = "G"; // green accent
      else if (g > r + 15 && b > r + 10 && g > 100) t = "T"; // teal/cyan
      else if (L > 160) t = "W";
      else if (L > 90) t = "g";
      else t = "d";
      row += t;
    }
    console.log(row);
  }

  // Strict green-dominant pixels (molecule / Shell accent)
  const greens = [];
  for (let y = 100; y < 250; y++) {
    for (let x = 80; x < 350; x++) {
      const [r, g, b] = get(x, y);
      if (g > 120 && g > r + 30 && g >= b - 15 && lum(r, g, b) > 100) {
        greens.push({ x, y, r, g, b });
      }
    }
  }
  console.log("green-dominant count", greens.length);
  if (greens.length) {
    const xs = greens.map((p) => p.x);
    const ys = greens.map((p) => p.y);
    console.log(
      "green bbox",
      Math.min(...xs),
      Math.min(...ys),
      Math.max(...xs),
      Math.max(...ys)
    );
    // sample every N
    for (let i = 0; i < greens.length; i += Math.max(1, (greens.length / 8) | 0)) {
      console.log(" sample", greens[i]);
    }
  }

  // Bright color buckets in lower half of header
  const colors = new Map();
  for (let y = 140; y < 220; y++) {
    for (let x = 90; x < 280; x++) {
      const [r, g, b] = get(x, y);
      if (lum(r, g, b) < 80) continue;
      const key = `${(r / 8) | 0},${(g / 8) | 0},${(b / 8) | 0}`;
      colors.set(key, (colors.get(key) || 0) + 1);
    }
  }
  console.log("bright buckets y140-220:");
  [...colors.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .forEach(([k, n]) => console.log(" ", k, n));
}

await analyze("BACKUP", bak);
await analyze("CURRENT", cur);

// Save diagnostic crops from backup at several y bands
for (const [name, top] of [
  ["band0", 60],
  ["band1", 120],
  ["band2", 160],
  ["band3", 200],
]) {
  await sharp(bak)
    .extract({ left: 70, top, width: 400, height: 50 })
    .png()
    .toFile(`scripts/_bak-${name}.png`);
}

// Also full left strip of backup
await sharp(bak)
  .extract({ left: 0, top: 0, width: 600, height: 350 })
  .png()
  .toFile("scripts/_bak-strip.png");

await sharp(cur)
  .extract({ left: 0, top: 0, width: 600, height: 350 })
  .png()
  .toFile("scripts/_cur-strip.png");

console.log("\nwrote diagnostic crops");
