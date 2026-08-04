import fs from "fs";
const h = fs.readFileSync("public/index.html", "utf8");
const m = [...h.matchAll(/bento(?:-mobile)?03\.png[^"'\s]*/g)];
console.log(m.map((x) => x[0]));
