import fs from "fs";
import path from "path";

const BASE = "https://1105-ddd2024-homepage.lusion.co";
const OUT = "D:/Company Website(ElitechNexus)/public/visual-3d/assets/msdf";
fs.mkdirSync(OUT, { recursive: true });

const js = fs.readFileSync(
  "D:/Company Website(ElitechNexus)/public/visual-3d/_astro/hoisted.DFPcBL_D.js",
  "utf8"
);
const names = [
  ...js.matchAll(/msdf\/([A-Za-z0-9_\-.]+)/g),
].map((m) => m[1]);
console.log("from js", [...new Set(names)]);

const candidates = [
  "Barlow-ExtraBold.png",
  "Barlow-ExtraBold.fnt",
  "Barlow-ExtraBold.json",
  "Barlow-ExtraBold-msdf.json",
  "barlow-extrabold.png",
  "barlow-extrabold.fnt",
  "BarlowExtraBold.png",
  "BarlowExtraBold.fnt",
];

for (const f of [...new Set([...names, ...candidates])]) {
  const local = path.join(OUT, f);
  if (fs.existsSync(local) && fs.statSync(local).size > 50) {
    console.log("skip", f);
    continue;
  }
  const res = await fetch(`${BASE}/assets/msdf/${f}`, {
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  if (!res.ok) {
    console.log("FAIL", res.status, f);
    continue;
  }
  fs.writeFileSync(local, Buffer.from(await res.arrayBuffer()));
  console.log("OK", f, fs.statSync(local).size);
}
