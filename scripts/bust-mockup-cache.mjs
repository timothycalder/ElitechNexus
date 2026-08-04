import fs from "fs";
import path from "path";

const FILES = [
  "use-cases01.png",
  "use-cases02.png",
  "use-cases03.png",
  "use-cases-mobile01.png",
  "use-cases-mobile02.png",
  "use-cases-mobile03.png",
  "bento01.png",
  "bento02.png",
  "bento03.png",
  "bento-hover03.png",
  "bento-mobile01.png",
  "bento-mobile02.png",
  "bento-mobile03.png",
  "card01.png",
  "card02-line.png",
  "card03-line.png",
  "integration01.png",
  "integration02.png",
  "integration03.png",
  "home-integration-mobile-1.png",
  "home-integration-mobile-2.png",
  "home-integration-mobile-3.png",
  "enterprise-slide01.png",
  "enterprise-slide02.png",
  "enterprise-slide03.png",
  "enterprise-slide-mobile02.png",
  "enterprise-slide-mobile03.png",
];

function walk(d, a = []) {
  for (const n of fs.readdirSync(d)) {
    if (n === "visual-3d") continue;
    const f = path.join(d, n);
    const s = fs.statSync(f);
    if (s.isDirectory()) walk(f, a);
    else if (n.endsWith(".html")) a.push(f);
  }
  return a;
}

let touched = 0;
for (const f of walk("public")) {
  let h = fs.readFileSync(f, "utf8");
  const before = h;
  for (const name of FILES) {
    const re = new RegExp(
      `(/assets/images/${name.replace(".", "\\.")})(?:\\?v=\\d+)?`,
      "g"
    );
    h = h.replace(re, `$1?v=8`);
    // also relative assets/images/...
    const re2 = new RegExp(
      `(assets/images/${name.replace(".", "\\.")})(?:\\?v=\\d+)?`,
      "g"
    );
    h = h.replace(re2, (m, p1) => {
      if (m.startsWith("/")) return m; // already handled
      return `${p1}?v=8`;
    });
  }
  if (h !== before) {
    fs.writeFileSync(f, h);
    touched++;
    console.log("cache-bust", f);
  }
}
console.log("touched", touched);
