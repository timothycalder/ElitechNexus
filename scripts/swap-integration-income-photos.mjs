/**
 * Replace AWS/Datadog-style SVG tool logos in home-integration masonry
 * with IncomeRemotely income-routes photos. Keep card DOM + animation.
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";

const OUT = "public/assets/images/income-routes";
fs.mkdirSync(OUT, { recursive: true });

// Photos from IncomeRemotely-style gallery. Labels match ACTUAL photo content.
const SOURCES = [
  { url: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=760&q=82", label: "From skill → income", top: "Income route" },
  { url: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=760&q=82", label: "From resource → income", top: "Income route" },
  { url: "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=760&q=82", label: "From network → income", top: "Income route" },
  { url: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=760&q=82", label: "From time → income", top: "Income route" },
  { url: "https://images.unsplash.com/photo-1573497491208-6b1acb260507?auto=format&fit=crop&w=900&q=82", label: "Full-time job support", top: "Jobs & projects" },
  { url: "https://images.unsplash.com/photo-1556745757-8d76bdb6984b?auto=format&fit=crop&w=900&q=82", label: "Freelance project support", top: "Jobs & projects" },
  { url: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=900&q=82", label: "Side-income route", top: "Jobs & projects" },
  { url: "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=900&q=82", label: "Partner income", top: "Jobs & projects" },
  { url: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=700&q=82", label: "Resume review & polish", top: "Free support" },
  { url: "https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=700&q=82", label: "Tools & devices", top: "Free support" },
  { url: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=700&q=82", label: "Community support", top: "Grow together" },
  { url: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=760&q=82", label: "Portfolio proof", top: "Free support" },
  { url: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=700&q=82", label: "Job interview support", top: "Free support" },
  { url: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=700&q=82", label: "Daily job & project applications", top: "Free support" },
  { url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=700&q=82", label: "Skill training", top: "Grow together" },
  { url: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=700&q=82", label: "Interview practice", top: "Grow together" },
  { url: "https://images.unsplash.com/photo-1487014679447-9f8336841d58?auto=format&fit=crop&w=700&q=82", label: "Digital delivery", top: "Grow together" },
  { url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=700&q=82", label: "Tools & setup", top: "Grow together" },
];

async function download(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`fail ${res.status} ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await sharp(buf)
    .resize(640, 800, { fit: "cover", position: "centre" })
    .jpeg({ quality: 86 })
    .toFile(dest);
  console.log("saved", dest);
}

for (let i = 0; i < SOURCES.length; i++) {
  const dest = path.join(OUT, `${String(i + 1).padStart(2, "0")}.jpg`);
  if (!fs.existsSync(dest) || fs.statSync(dest).size < 1000) {
    await download(SOURCES[i].url, dest);
  } else console.log("keep", dest);
}

const V = 36;
const CSS = `<style id="elitechnexus-income-routes-cards-css">
/* Keep padding-bottom aspect cards; fill with photos.
   Do NOT set height:0 — with global border-box it collapses tiles to thin strips. */
#home-integration__cards-desktop .o-integration-card,
#home-integration .o-integration-card{
  position:relative !important;
  height:auto !important;
  min-height:0 !important;
  padding-bottom:160% !important;
  box-sizing:content-box !important;
}
#home-integration__cards-desktop .o-integration-card__wrapper,
#home-integration .o-integration-card__wrapper{
  position:absolute !important;
  inset:0 !important;
  overflow:hidden !important;
  border-radius:10px !important;
}
#home-integration__cards-desktop .o-integration-card__logo,
#home-integration .o-integration-card__logo{
  display:block !important;
  width:100% !important;
  height:100% !important;
  position:absolute !important;
  inset:0 !important;
  transform:none !important;
  z-index:0 !important;
  margin:0 !important;
}
#home-integration__cards-desktop .o-integration-card__logo img,
#home-integration__cards-desktop .o-integration-card__logo .elite-route-photo,
#home-integration .o-integration-card__logo img,
#home-integration .o-integration-card__logo .elite-route-photo{
  width:100% !important;
  height:100% !important;
  object-fit:cover !important;
  object-position:center !important;
  display:block !important;
}
#home-integration__cards-desktop .o-integration-card__logo .o-icon,
#home-integration__cards-desktop .o-integration-card__logo svg,
#home-integration .o-integration-card__logo .o-icon,
#home-integration .o-integration-card__logo svg{
  display:none !important;
}
#home-integration__cards-desktop .o-integration-card__top,
#home-integration__cards-desktop .o-integration-card__bottom,
#home-integration .o-integration-card__top,
#home-integration .o-integration-card__bottom{
  position:absolute !important;
  left:0.7rem; right:0.7rem;
  z-index:2 !important;
  color:#fff !important;
  text-shadow:0 1px 10px rgba(0,0,0,.55);
  pointer-events:none;
}
#home-integration__cards-desktop .o-integration-card__top,
#home-integration .o-integration-card__top{ top:0.65rem; opacity:0.9; font-size:0.78rem; }
#home-integration__cards-desktop .o-integration-card__bottom,
#home-integration .o-integration-card__bottom{ bottom:0.65rem; font-weight:650; font-size:0.92rem; }
#home-integration__cards-desktop .o-integration-card__wrapper::after,
#home-integration .o-integration-card__wrapper::after{
  content:"";
  position:absolute; inset:0; z-index:1;
  background:linear-gradient(180deg, rgba(7,16,28,.2) 0%, rgba(7,16,28,.08) 40%, rgba(7,16,28,.78) 100%);
  pointer-events:none;
}
</style>`;

let html = fs.readFileSync("public/index.html", "utf8");

// Inject / replace CSS
if (html.includes("elitechnexus-income-routes-cards-css")) {
  html = html.replace(
    /<style id="elitechnexus-income-routes-cards-css">[\s\S]*?<\/style>/,
    CSS
  );
} else {
  html = html.replace("</head>", CSS + "\n</head>");
}

// Replace each card's logo SVG with photo — only in main cards grid (before slides)
const gridStart = html.indexOf('id="home-integration__cards-desktop"');
const gridEnd = html.indexOf('id="home-integration__slides"');
if (gridStart < 0 || gridEnd < 0) {
  console.error("cards grid not found", { gridStart, gridEnd });
  process.exit(1);
}

let grid = html.slice(gridStart, gridEnd);
const cardRe =
  /<div class="o-integration-card">\s*<div class="o-integration-card__wrapper">\s*<span class="o-integration-card__top">[\s\S]*?<\/span>\s*<span class="o-integration-card__logo">[\s\S]*?<\/span>\s*<span class="o-integration-card__bottom">[\s\S]*?<\/span>\s*<\/div>\s*<\/div>/g;

let idx = 0;
const beforeCount = (grid.match(/o-integration-card"/g) || []).length;
grid = grid.replace(cardRe, () => {
  const s = SOURCES[idx % SOURCES.length];
  const n = String((idx % SOURCES.length) + 1).padStart(2, "0");
  idx++;
  return `<div class="o-integration-card"> <div class="o-integration-card__wrapper"> <span class="o-integration-card__top">${s.top}</span> <span class="o-integration-card__logo"><img class="elite-route-photo" src="/assets/images/income-routes/${n}.jpg?v=${V}" alt="${s.label}" loading="lazy"></span> <span class="o-integration-card__bottom">${s.label}</span> </div> </div>`;
});

console.log("cards before", beforeCount, "replaced", idx);
if (idx === 0) {
  // Fallback: replace logo blocks one-by-one
  console.log("fallback replace logos");
  grid = grid.replace(
    /<span class="o-integration-card__logo">[\s\S]*?<\/span>\s*<span class="o-integration-card__bottom">[^<]*<\/span>/g,
    () => {
      const s = SOURCES[idx % SOURCES.length];
      const n = String((idx % SOURCES.length) + 1).padStart(2, "0");
      idx++;
      return `<span class="o-integration-card__logo"><img class="elite-route-photo" src="/assets/images/income-routes/${n}.jpg?v=${V}" alt="${s.label}" loading="lazy"></span> <span class="o-integration-card__bottom">${s.label}</span>`;
    }
  );
  grid = grid.replace(/Build together with/g, "Income route");
  console.log("fallback replaced", idx);
}
html = html.slice(0, gridStart) + grid + html.slice(gridEnd);

// Title tweak to match purpose (keep structure)
html = html.replace(
  /Ready for jobs<br><span class="o-text-gradient">and paid projects<\/span>/,
  `Ready for jobs<br><span class="o-text-gradient">projects &amp; income</span>`
);

fs.writeFileSync("public/index.html", html);
console.log("done");
