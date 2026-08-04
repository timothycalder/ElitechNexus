import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const BASE = "https://1105-ddd2024-homepage.lusion.co";
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "public", "visual-3d");

const FILES = [
  "/_astro/hoisted.DFPcBL_D.js",
  "/_astro/about.CpfVU-iZ.css",
  "/assets/models/PARTICLE_LD.buf",
  "/assets/models/TERRAIN.buf",
  "/assets/models/web.buf",
  "/assets/models/POINTS.buf",
  "/assets/models/POINTS_LD.buf",
  "/assets/models/SOLID.buf",
  "/assets/models/SOLID_LD.buf",
  "/assets/models/SPLINES.buf",
  "/assets/models/SPLINES_LD.buf",
  "/assets/models/TETS.buf",
  "/assets/models/TETS_LD.buf",
  "/assets/textures/LDR_RGB1_0.png",
  "/assets/textures/lens_dirt.jpg",
  "/assets/textures/smaa-area.png",
  "/assets/textures/smaa-search.png",
  "/assets/textures/terrain/bake.webp",
  "/assets/images/textImage/main.webp",
  "/assets/meta/favicon.ico",
  "/assets/meta/apple-touch-icon.png",
];

async function download(urlPath) {
  const url = `${BASE}${urlPath}`;
  const local = path.join(OUT, urlPath.replace(/^\//, "").replace(/\//g, path.sep));
  await fs.mkdir(path.dirname(local), { recursive: true });
  process.stdout.write(`GET ${urlPath}\n`);
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; Visual3DMirror/1.0)" },
  });
  if (!res.ok) throw new Error(`${urlPath} -> HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await fs.writeFile(local, buf);
  return buf;
}

function rewriteHtml(html) {
  return html
    .replaceAll("https://1105-ddd2024-homepage.lusion.co/", "./")
    .replaceAll('href="/_astro/', 'href="./_astro/')
    .replaceAll('src="/_astro/', 'src="./_astro/')
    .replaceAll('href="/assets/', 'href="./assets/')
    .replaceAll('src="/assets/', 'src="./assets/')
    .replaceAll('href="/"', 'href="./"')
    .replaceAll("<head>", `<head>
    <base href="/visual-3d/">
    <style>
      /* Keep focus on the 3D canvas when embedded */
      html, body { margin: 0; background: #000; overflow: hidden !important; }
      #ui.is-hidden, #ui[style*="opacity: 0"] { pointer-events: none !important; }
      #site-footer, #cookies-overlay, .page-transition { display: none !important; }
    </style>`);
}

async function main() {
  await fs.rm(OUT, { recursive: true, force: true });
  await fs.mkdir(OUT, { recursive: true });

  // Homepage HTML
  process.stdout.write("GET /\n");
  const htmlRes = await fetch(`${BASE}/`, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; Visual3DMirror/1.0)" },
  });
  if (!htmlRes.ok) throw new Error(`HTML HTTP ${htmlRes.status}`);
  let html = await htmlRes.text();
  html = rewriteHtml(html);
  await fs.writeFile(path.join(OUT, "index.html"), html, "utf8");

  // Core assets
  for (const f of FILES) {
    await download(f);
  }

  // Optional video (used by hero) — download if available
  for (const v of ["/assets/videos/home_hero.mp4", "/assets/videos/videoTrailer.mp4"]) {
    try {
      await download(v);
    } catch (err) {
      console.warn(`skip ${v}: ${err.message}`);
    }
  }

  // Rewrite absolute /_astro and /assets inside JS to work under /visual-3d/
  const jsPath = path.join(OUT, "_astro", "hoisted.DFPcBL_D.js");
  let js = await fs.readFile(jsPath, "utf8");
  // Keep relative MODEL_PATH ("assets/...") — with <base href="/visual-3d/"> it resolves correctly
  // Force HIDE_UI default true for this embed package
  js = js.replace("HIDE_UI=!1", "HIDE_UI=!0");
  await fs.writeFile(jsPath, js, "utf8");

  console.log("\nvisual-3d mirror ready at public/visual-3d/");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
