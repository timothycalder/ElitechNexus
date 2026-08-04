import fs from "fs";
import path from "path";

const BASE = "https://1105-ddd2024-homepage.lusion.co";
const OUT = "D:/Company Website(ElitechNexus)/public/visual-3d";
const js = fs.readFileSync(path.join(OUT, "_astro/hoisted.DFPcBL_D.js"), "utf8");

const speakers = [
  "adriana_hoppenbrouwer_the_fabricant",
  "alexandra-jugovic",
  "ash_thorp_alt",
  "burton_rast",
  "cathy_hackl",
  "cindy-chastain",
  "david_sheldon_territory",
  "edan_kwan_lusion",
  "eric_jordan_2advanced",
  "ferdi_alici_ouchhh",
  "frederic_marchand_locomotive",
  "hazel-baird",
  "jonathan_kim_rare_volume",
  "kerry_murphy_the_fabricant",
  "mariola-bruszewska",
  "mathieu_ducharme_locomotive",
  "maxim-zhestkov",
  "peter_smart_fantasy",
  "raffaella_camera_epic_games",
  "tony_novak_2advanced",
];

// Also harvest any .buf paths from JS
const fromJs = [
  ...js.matchAll(/assets\/(?:speakers|models)\/[A-Za-z0-9_\-./]+\.buf/g),
].map((m) => "/" + m[0]);

const paths = new Set([
  ...speakers.map((s) => `/assets/speakers/${s}.buf`),
  ...fromJs,
]);

for (const urlPath of paths) {
  const local = path.join(OUT, urlPath.slice(1));
  if (fs.existsSync(local) && fs.statSync(local).size > 100) {
    console.log("skip", urlPath, fs.statSync(local).size);
    continue;
  }
  const res = await fetch(BASE + urlPath, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!res.ok) {
    console.warn("FAIL", res.status, urlPath);
    continue;
  }
  fs.mkdirSync(path.dirname(local), { recursive: true });
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(local, buf);
  console.log("OK", urlPath, buf.length);
}

// Revert SKIP_ANIMATION so hero models initialize normally
let code = fs.readFileSync(path.join(OUT, "_astro/hoisted.DFPcBL_D.js"), "utf8");
if (code.includes("SKIP_ANIMATION=!0")) {
  code = code.replaceAll("SKIP_ANIMATION=!0", "SKIP_ANIMATION=!1");
  fs.writeFileSync(path.join(OUT, "_astro/hoisted.DFPcBL_D.js"), code);
  console.log("SKIP_ANIMATION restored to false");
}
console.log("done");
