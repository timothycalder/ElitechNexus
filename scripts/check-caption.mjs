import fs from "fs";
const h = fs.readFileSync("public/index.html", "utf8");
const m = h.match(/id="home-hero__caption">([\s\S]*?)<h1/);
if (!m) {
  console.log("not found");
  process.exit(1);
}
let c = m[1].replace(/<svg[\s\S]*?<\/svg>/gi, "[SVG]");
console.log(c);
console.log("---");
console.log("has broken //span?", c.includes("<//span>") || h.includes("Built by<//"));
console.log("has Philippines after logo?", /Elitechnexus, Philippines/.test(m[1]));
