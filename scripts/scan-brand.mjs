import fs from "fs";
import path from "path";

const ROOT = "D:/Company Website(ElitechNexus)/public";
const SKIP = new Set(["visual-3d"]);

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (/\.(html|json|xml|webmanifest|txt)$/i.test(name)) out.push(full);
  }
  return out;
}

const files = walk(ROOT);
const patterns = [
  /Devin/g,
  /Cognition/g,
  /devin/gi,
  /cognition/gi,
  /mailto:[^"'>\s]+/gi,
  /tel:[^"'>\s]+/gi,
  /\+1[\d\s().-]{8,}/g,
  /San Francisco|California|United States|USA|New York|SF\b/gi,
  /@cognition\.ai/gi,
  /app\.devin\.ai/gi,
  /cognition\.ai/gi,
];

const hits = new Map();
for (const file of files) {
  const text = fs.readFileSync(file, "utf8");
  for (const re of patterns) {
    const m = text.match(re);
    if (m) {
      const key = path.relative(ROOT, file);
      if (!hits.has(key)) hits.set(key, new Set());
      m.slice(0, 20).forEach((x) => hits.get(key).add(x));
    }
  }
}

for (const [file, set] of hits) {
  console.log("\n==", file);
  console.log([...set].slice(0, 40).join(" | "));
}
console.log("\nfiles with hits", hits.size);
