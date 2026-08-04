import fs from "fs";
const h = fs.readFileSync("public/index.html", "utf8");
const sec = h.indexOf('id="elite-fields"');
const use = h.indexOf('id="home-use-cases"');
const hero = h.indexOf('id="home-hero"');
console.log({ sec, use, hero, order: hero < sec && sec < use });
console.log(h.slice(sec - 80, sec + 200).replace(/\s+/g, " "));
