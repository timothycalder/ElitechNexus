import fs from "fs";
import path from "path";

const BASE = "https://1105-ddd2024-homepage.lusion.co";
const OUT = "D:/Company Website(ElitechNexus)/public/visual-3d";

const files = [
  // already have models/textures/videos — fetch remaining referenced images
  "/assets/meta/favicon-16x16.png",
  "/assets/meta/favicon-32x32.png",
  "/assets/meta/safari-pinned-tab.svg",
  "/assets/meta/site.webmanifest",
  "/assets/meta/social_sharing.jpg",
  "/assets/sponsors/politecnico-scuola-vert-eng.png",
  "/assets/sponsors/logo-simple_black.png",
  "/assets/sponsors/confimi-industria.png",
  "/assets/sponsors/rive_logo.png",
  "/assets/sponsors/edan-kwan-lusion.png",
  "/assets/sponsors/nexi.png",
  "/assets/sponsors/kos.png",
  "/assets/sponsors/david-sheldon-territory.png",
  "/assets/sponsors/diana.png",
  "/assets/sponsors/sketchin.png",
  "/assets/sponsors/chateaux.png",
  "/assets/sponsors/combustion.png",
  "/assets/sponsors/positive.png",
  "/assets/sponsors/district.png",
  "/assets/sponsors/all-tech.png",
  "/assets/sponsors/bbang.png",
  "/assets/sponsors/beazy.png",
  "/assets/sponsors/exe.png",
  "/assets/sponsors/logo_ideology_b.png",
  "/assets/sponsors/jekyll-hyde.png",
  "/assets/sponsors/nerdo.png",
  "/assets/sponsors/caffe-design.png",
  "/assets/sponsors/design-wanted.png",
  "/assets/sponsors/muzli.png",
  "/assets/sponsors/prompt-magazine.png",
  "/assets/sponsors/startupbusiness.png",
  "/assets/sponsors/stash.png",
  "/assets/sponsors/talentgardenl_logo.png",
  "/assets/sponsors/touch_logo.png",
  "/assets/sponsors/visual-atelier-8.png",
];

async function download(urlPath) {
  const local = path.join(OUT, urlPath.replace(/^\//, ""));
  if (fs.existsSync(local) && fs.statSync(local).size > 0) {
    console.log("skip", urlPath);
    return;
  }
  fs.mkdirSync(path.dirname(local), { recursive: true });
  const res = await fetch(BASE + urlPath, {
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  if (!res.ok) {
    console.warn("FAIL", urlPath, res.status);
    return;
  }
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(local, buf);
  console.log("OK", urlPath, buf.length);
}

for (const f of files) await download(f);
console.log("asset download complete");
