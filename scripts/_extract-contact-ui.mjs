import fs from "fs";

const p =
  "C:/Users/AI ML Engineer/.cursor/projects/d-Company-Website-ElitechNexus/agent-tools/e48bad90-5295-4c05-8274-d525ca505f55.txt";
const js = fs.readFileSync(p, "utf8");
const i = js.indexOf('className:"contact-page"');
console.log(js.slice(i, i + 4500));
console.log("\n\n==== CSS contact ====");
// try find contact-page in same file if any css embedded - unlikely
const j = js.indexOf("contact-hero");
console.log("contact-hero refs", [...js.matchAll(/contact-[a-z-]+/g)].map(m=>m[0]).filter((v,i,a)=>a.indexOf(v)===i).slice(0,40));
