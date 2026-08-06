/**
 * Inject Jotform AI chatbot embed before </body> on all public pages.
 */
import fs from "fs";
import path from "path";

const ROOT = "public";
const MARKER = "elitechnexus-jotform-chatbot";
const SNIPPET = `
<!-- ${MARKER} -->
<script src="https://cdn.jotfor.ms/agent/embedjs/019fd78f69c0700086044c64fa3a2536ec27/embed.js" defer></script>
`;

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    if (name === "visual-3d" || name === "node_modules" || name === "_astro") continue;
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (name.endsWith(".html")) out.push(full);
  }
  return out;
}

let updated = 0;
let skipped = 0;

for (const file of walk(ROOT)) {
  let html = fs.readFileSync(file, "utf8");
  if (html.includes(MARKER) || html.includes("019fd78f69c0700086044c64fa3a2536ec27")) {
    skipped++;
    continue;
  }
  if (!/<\/body>/i.test(html)) {
    console.log("no body:", file);
    continue;
  }
  html = html.replace(/<\/body>/i, SNIPPET + "</body>");
  fs.writeFileSync(file, html);
  updated++;
  console.log("added", path.relative(ROOT, file).replace(/\\/g, "/"));
}

console.log("updated", updated, "skipped", skipped);
