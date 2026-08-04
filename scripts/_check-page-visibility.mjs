import fs from "fs";

const css = fs.readFileSync("public/_astro/_caseStudy_.C5ufd_-D.css", "utf8");
for (const key of [".page{", ".page ", "#pages-container", "opacity:0", "visibility:hidden"]) {
  let i = 0, n = 0;
  while ((i = css.indexOf(key, i)) !== -1 && n < 4) {
    if (key.startsWith(".page") || key.includes("pages-container") || i > 100000) {
      console.log("\n", key, "@", i);
      console.log(css.slice(i, i + 220));
    }
    i += key.length;
    n++;
  }
}

// fullnav on contact
const c = fs.readFileSync("public/contact/index.html", "utf8");
const f = c.indexOf("elitechnexus-fullnav-fix");
console.log("\n--- fullnav ---");
console.log(c.slice(f, f + 700));

const loginBtn = fs.readFileSync("public/index.html", "utf8");
const lb = loginBtn.indexOf("site-header__button-transparent");
console.log("\n--- login link ---");
console.log(loginBtn.slice(lb, lb + 200));
const cb = loginBtn.indexOf("site-header__button-contact");
console.log("\n--- contact link ---");
console.log(loginBtn.slice(cb, cb + 180));
