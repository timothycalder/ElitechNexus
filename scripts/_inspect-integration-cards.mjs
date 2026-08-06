import fs from "fs";

const h = fs.readFileSync("public/index.html", "utf8");
const start = h.indexOf("Ready for jobs");
const end = h.indexOf("home-integration__slides", start);
console.log("start", start, "end", end);

// Count integration cards and bottoms
const section = h.slice(start, end > 0 ? end : start + 50000);
const bottoms = [...section.matchAll(/o-integration-card__bottom">([^<]*)</g)].map((m) => m[1]);
console.log("card labels:", bottoms.filter(Boolean));
console.log("card count", (section.match(/o-integration-card"/g) || []).length);
console.log("columns", (section.match(/home-integration__cards-column/g) || []).length);

// CSS for logo area
const cssIdx = h.search(/o-integration-card__logo|\.o-integration-card/);
console.log("css sample around integration", h.slice(Math.max(0, h.indexOf("home-integration")), Math.max(0, h.indexOf("home-integration")) + 200));
