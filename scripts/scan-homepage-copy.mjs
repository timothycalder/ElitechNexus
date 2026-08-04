import fs from "fs";

const h = fs.readFileSync("public/index.html", "utf8");

const needles = [
  "global engineering bridge",
  "Deep Technical Vetting",
  "Seamless Communication",
  "Compliant Global",
  "home-hero",
  "home-bento",
  "home-use-cases",
  "home-problem",
  "home-solution",
  "home-cta",
  "An Army",
  "Overview",
  "The Problem",
  "The Decision",
  "Elitechnexus can work",
  "tirelessly",
];

for (const n of needles) {
  const i = h.indexOf(n);
  if (i < 0) {
    console.log("MISSING", n);
    continue;
  }
  console.log("\n====", n, "====");
  console.log(h.slice(Math.max(0, i - 80), i + 220).replace(/\s+/g, " "));
}

// Find section ids
const ids = [...h.matchAll(/id="(home-[^"]+)"/g)].map((m) => m[1]);
console.log("\nsection ids", [...new Set(ids)]);
