import fs from "fs";
const h = fs.readFileSync("public/index.html", "utf8");

const ids = ["home-bento__item-01", "home-bento__item-02", "home-bento__item-03"];
for (let n = 0; n < ids.length; n++) {
  const start = h.indexOf(`id="${ids[n]}"`);
  const end = n < 2 ? h.indexOf(`id="${ids[n + 1]}"`) : h.indexOf('id="home-integration"', start);
  const chunk = h.slice(start, end);
  const title = (chunk.match(/home-bento__item-title">([\s\S]*?)<\/h3>/) || [])[1];
  const sub = (chunk.match(/home-bento__item-subtitle">([\s\S]*?)<\/p>/) || [])[1];
  const imgs = [...chunk.matchAll(/src="(\/assets\/images\/[^"]+)"/g)].map((m) => m[1]);
  console.log("\n====", ids[n], "====");
  console.log("TITLE:", (title || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
  console.log("SUB:", (sub || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 200));
  console.log("IMGS:");
  for (const i of imgs) console.log(" ", i);
}
