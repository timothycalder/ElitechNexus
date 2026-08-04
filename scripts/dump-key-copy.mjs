import fs from "fs";

const h = fs.readFileSync("public/index.html", "utf8");

function around(label, start, end) {
  const a = h.indexOf(start);
  const b = end ? h.indexOf(end, a) : a + 400;
  console.log("\n####", label);
  if (a < 0) return console.log("not found");
  console.log(h.slice(a, b > a ? Math.min(b, a + 600) : a + 500).replace(/\s+/g, " "));
}

around("hero caption/title", 'id="home-hero__caption"', 'id="home-hero__logo-lists');
around("hero end", 'id="home-hero__end-copy"', 'id="home-use-cases"');
around("use cases", 'id="home-use-cases__title"', 'id="home-use-cases__slider"');
around("bento head", 'id="home-bento__headline"', 'id="home-bento__wrapper"');
around("integration title", 'id="home-integration__title"', 'id="home-integration__cards');
around("cta", 'id="home-cta__copy"', 'id="home-cta__logo');
around("overview", "<h2>Overview</h2>", "<h2>The Problem</h2>");
around("problem", "<h2>The Problem</h2>", "<h2>The Decision");
around("solution", "<h2>The Solution", "<h2>The Results");
