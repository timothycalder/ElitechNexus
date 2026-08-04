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
    else if (/\.html$/i.test(name)) out.push(full);
  }
  return out;
}

const files = walk(ROOT);

function extractVisibleSnippets(html, re, label) {
  const results = [];
  let m;
  const r = new RegExp(re.source, re.flags.includes("g") ? re.flags : re.flags + "g");
  while ((m = r.exec(html))) {
    const start = Math.max(0, m.index - 40);
    const end = Math.min(html.length, m.index + m[0].length + 60);
    let snip = html.slice(start, end).replace(/\s+/g, " ");
    results.push(snip);
  }
  return results;
}

const checks = [
  [/San Francisco/gi, "SF"],
  [/California/gi, "CA"],
  [/United States/gi, "US"],
  [/\bUSA\b/g, "USA"],
  [/mailto:[^"'>\s]+/gi, "mailto"],
  [/tel:[^"'>\s]+/gi, "tel"],
  [/support@cognition\.ai/gi, "support"],
  [/Get started with Devin|Built by Cognition|Cognition Labs/gi, "phrases"],
  [/Devins/g, "Devins"],
  [/og:title|twitter:title|<title>/gi, "meta"],
];

for (const file of files) {
  const html = fs.readFileSync(file, "utf8");
  const rel = path.relative(ROOT, file);
  let printed = false;
  for (const [re, label] of checks) {
    const snips = extractVisibleSnippets(html, re, label);
    if (!snips.length) continue;
    if (!printed) {
      console.log("\n##", rel);
      printed = true;
    }
    console.log(" ", label, snips.length);
    snips.slice(0, 3).forEach((s) => console.log("   -", s));
  }
}

// Count Devin / Cognition occurrences
for (const file of files) {
  const html = fs.readFileSync(file, "utf8");
  const rel = path.relative(ROOT, file);
  const d = (html.match(/Devin/g) || []).length;
  const c = (html.match(/Cognition/g) || []).length;
  const dl = (html.match(/devin/gi) || []).length;
  const cl = (html.match(/cognition/gi) || []).length;
  console.log(`${rel}: Devin=${d} Cognition=${c} devin*=${dl} cognition*=${cl}`);
}
