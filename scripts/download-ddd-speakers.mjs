import fs from "fs";
import path from "path";

const BASE = "https://1105-ddd2024-homepage.lusion.co";
const OUT = "D:/Company Website(ElitechNexus)/public/visual-3d";
const html = fs.readFileSync(path.join(OUT, "index.html"), "utf8");
const js = fs.readFileSync(path.join(OUT, "_astro/hoisted.DFPcBL_D.js"), "utf8");

const refs = new Set();
for (const re of [
  /(?:src|href)="(\.\/assets\/[^"]+)"/g,
  /(?:src|href)="(assets\/[^"]+)"/g,
  /assets\/(?:speakers|images|sponsors|textures|models|videos|meta)\/[A-Za-z0-9_\-./]+/g,
]) {
  let m;
  const src = re.source.includes("src|href") ? html : html + "\n" + js;
  while ((m = re.exec(src))) {
    let p = m[1] || m[0];
    p = p.replace(/^\.\//, "");
    if (!p.startsWith("assets/")) continue;
    refs.add("/" + p);
  }
}

// Known speakers from earlier crawl
const speakers = [
  "adriana_hoppenbrouwer_the_fabricant","alexandra-jugovic","ash_thorp_alt","burton_rast","cathy_hackl","cindy-chastain","david_sheldon_territory","edan_kwan_lusion","eric_jordan_2advanced","ferdi_alici_ouchhh","frederic_marchand_locomotive","hazel-baird","jonathan_kim_rare_volume","kerry_murphy_the_fabricant","mariola-bruszewska","mathieu_ducharme_locomotive","maxim-zhestkov","peter_smart_fantasy","raffaella_camera_epic_games","tony_novak_2advanced",
];
for (const s of speakers) refs.add(`/assets/speakers/${s}.webp`);

console.log("refs", refs.size);
let ok = 0, fail = 0;
for (const urlPath of [...refs]) {
  const local = path.join(OUT, urlPath.slice(1));
  if (fs.existsSync(local) && fs.statSync(local).size > 100) {
    ok++;
    continue;
  }
  try {
    const res = await fetch(BASE + urlPath, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!res.ok) {
      console.warn("FAIL", res.status, urlPath);
      fail++;
      continue;
    }
    fs.mkdirSync(path.dirname(local), { recursive: true });
    fs.writeFileSync(local, Buffer.from(await res.arrayBuffer()));
    console.log("OK", urlPath);
    ok++;
  } catch (e) {
    console.warn("ERR", urlPath, e.message);
    fail++;
  }
}
console.log({ ok, fail });
