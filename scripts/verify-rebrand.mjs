import fs from "fs";

const home = fs.readFileSync("public/index.html", "utf8");
const pricing = fs.readFileSync("public/pricing/index.html", "utf8");

const text = home
  .replace(/<script[\s\S]*?<\/script>/gi, " ")
  .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
  .replace(/<[^>]+>/g, " ")
  .replace(/\s+/g, " ");

const idx = text.indexOf("Built by");
console.log("Built by:", text.slice(idx, idx + 80));
console.log("title:", (home.match(/<title>[^<]+<\/title>/) || [])[0]);
console.log("og:title:", (home.match(/og:title" content="[^"]+"/) || [])[0]);
console.log("phone in footer area:", home.includes("+1 (339) 365-7217"));
console.log("mailto count", (home.match(/mailto:stephen\.worthy@gmail\.com/g) || []).length);
console.log("still has Devin?", /Devin|Cognition|devin\.ai|cognition\.ai/i.test(home));
console.log("pricing contact:", (pricing.match(/Contact us at[\s\S]{0,160}/) || [""])[0].replace(/\s+/g, " "));

// Ensure no class/id was corrupted
const badClass = home.match(/class="[^"]*Elitechnexus[^"]*"/);
const badId = home.match(/id="[^"]*Elitechnexus[^"]*"/);
console.log("corrupted class?", badClass);
console.log("corrupted id?", badId);

// sample hero
const h = text.indexOf("Elitechnexus is");
console.log("hero-ish:", text.slice(h, h + 100));
