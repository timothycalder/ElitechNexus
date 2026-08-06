import fs from "fs";
const h = fs.readFileSync("public/index.html", "utf8");

for (const id of ["home-bento__item-01", "home-bento__item-02", "home-bento__item-03"]) {
  const i = h.indexOf(`id="${id}"`);
  const chunk = h.slice(i, i + 5000);
  const title = (chunk.match(/home-bento__item-title">([\s\S]*?)<\/h3>/) || [])[1];
  const imgs = [...chunk.matchAll(/src="([^"]+)"/g)].map((m) => m[1]);
  console.log("\n" + id);
  console.log("title:", (title || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
  console.log("imgs:", imgs.filter((s) => /\.(png|jpe?g|webp|svg)/i.test(s)).slice(0, 12));
}

// hero layers
const hi = h.indexOf("home-hero__main-visual");
console.log("\nHERO imgs:", [...h.slice(hi, hi + 8000).matchAll(/src="([^"]+)"/g)].map((m) => m[1]).slice(0, 20));

// any dual/collage references
for (const k of ["image-main", "image-secondary", "bento01", "bento02", "bento03", "two", "collage"]) {
  console.log(k, h.includes(k), (h.match(new RegExp(k, "g")) || []).length);
}
