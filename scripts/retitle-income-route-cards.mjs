/**
 * Retitle Ready-for-jobs masonry cards so labels match photo content
 * and follow IncomeRemotely naming (From skill → income, etc.).
 */
import fs from "fs";

const V = 36;

// Order matches public/assets/images/income-routes/01.jpg … 18.jpg
const FINAL = [
  { n: "01", top: "Income route", label: "From skill → income" }, // Python / coding skill
  { n: "02", top: "Income route", label: "From resource → income" }, // shared devices & tools
  { n: "03", top: "Income route", label: "From network → income" }, // colleagues collaborating
  { n: "04", top: "Income route", label: "From time → income" }, // focused solo work session
  { n: "05", top: "Jobs & projects", label: "Full-time job support" }, // interview conversation
  { n: "06", top: "Jobs & projects", label: "Freelance project support" }, // getting paid / client payment
  { n: "07", top: "Jobs & projects", label: "Side-income route" }, // monthly goals planner
  { n: "08", top: "Jobs & projects", label: "Partner income" }, // handshake / partnership
  { n: "09", top: "Free support", label: "Resume review & polish" }, // writing notes + laptop
  { n: "10", top: "Free support", label: "Tools & devices" }, // professional workspace setup
  { n: "11", top: "Grow together", label: "Community support" }, // coworking group
  { n: "12", top: "Free support", label: "Portfolio proof" }, // UI / project planning board
  { n: "13", top: "Free support", label: "Job interview support" }, // one-on-one coaching meeting
  { n: "14", top: "Free support", label: "Daily job & project applications" }, // sticky-note planning wall
  { n: "15", top: "Grow together", label: "Skill training" }, // coding with headphones
  { n: "16", top: "Grow together", label: "Interview practice" }, // discussion / coaching gesture
  { n: "17", top: "Grow together", label: "Digital delivery" }, // website / product on laptop
  { n: "18", top: "Grow together", label: "Tools & setup" }, // dual-screen developer desk
];

let html = fs.readFileSync("public/index.html", "utf8");

const gridStart = html.indexOf('id="home-integration__cards-desktop"');
const gridEnd = html.indexOf('id="home-integration__slides"');
if (gridStart < 0 || gridEnd < 0) {
  console.error("cards grid not found");
  process.exit(1);
}

let grid = html.slice(gridStart, gridEnd);
const cardRe =
  /<div class="o-integration-card">\s*<div class="o-integration-card__wrapper">\s*<span class="o-integration-card__top">[\s\S]*?<\/span>\s*<span class="o-integration-card__logo">[\s\S]*?<\/span>\s*<span class="o-integration-card__bottom">[\s\S]*?<\/span>\s*<\/div>\s*<\/div>/g;

let idx = 0;
const before = (grid.match(/class="o-integration-card"/g) || []).length;
grid = grid.replace(cardRe, () => {
  const c = FINAL[idx % FINAL.length];
  idx++;
  return `<div class="o-integration-card"> <div class="o-integration-card__wrapper"> <span class="o-integration-card__top">${c.top}</span> <span class="o-integration-card__logo"><img class="elite-route-photo" src="/assets/images/income-routes/${c.n}.jpg?v=${V}" alt="${c.label}" loading="lazy"></span> <span class="o-integration-card__bottom">${c.label}</span> </div> </div>`;
});

console.log(`cards found ${before}, replaced ${idx}`);
html = html.slice(0, gridStart) + grid + html.slice(gridEnd);

html = html.replace(
  /\/assets\/images\/income-routes\/(\d+)\.jpg(?:\?v=\d+)?/g,
  `/assets/images/income-routes/$1.jpg?v=${V}`
);

fs.writeFileSync("public/index.html", html);
fs.writeFileSync(
  "scripts/income-routes-titles.json",
  JSON.stringify(FINAL, null, 2)
);

for (const c of FINAL) console.log(`  ${c.n}: [${c.top}] ${c.label}`);
console.log("done v=", V);
