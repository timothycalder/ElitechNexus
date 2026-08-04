/**
 * Rebrand Devin/Cognition site content → Elitechnexus.
 * Only mutates text nodes / attribute string values — no DOM structure,
 * CSS, classes, or IDs are added/removed/renamed.
 */
import fs from "fs";
import path from "path";

const ROOT = "D:/Company Website(ElitechNexus)/public";
const SKIP_DIRS = new Set(["visual-3d", "node_modules"]);

const COMPANY = "Elitechnexus";
const EMAIL = "steven.miller@elitechnexus.com";
const PHONE_DISPLAY = "+1 (339) 365-7217";
const PHONE_TEL = "+13393657217";
const LOCATION = "Philippines";

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (/\.(html|json|xml|webmanifest|txt|md)$/i.test(name)) out.push(full);
  }
  return out;
}

function rebrandHtml(html) {
  let out = html;

  // --- Contact: emails ---
  out = out.replace(/mailto:support@cognition\.ai/gi, `mailto:${EMAIL}`);
  out = out.replace(/support@cognition\.ai/gi, EMAIL);

  // --- Brand / product URLs → company contact (attribute values only) ---
  const toMail = `mailto:${EMAIL}`;
  const urlSubs = [
    /https?:\/\/app\.devin\.ai\/?/gi,
    /https?:\/\/docs\.devin\.ai\/?/gi,
    /https?:\/\/(?:www\.)?cognition\.ai\/get-started[^"'>\s]*/gi,
    /https?:\/\/(?:www\.)?cognition\.ai\/pages\/privacy-policy[^"'>\s]*/gi,
    /https?:\/\/(?:www\.)?cognition\.ai\/pages\/terms-of-service[^"'>\s]*/gi,
    /https?:\/\/(?:www\.)?cognition\.ai\/blog[^"'>\s]*/gi,
    /https?:\/\/cognition\.ai\/blog[^"'>\s]*/gi,
    /https?:\/\/(?:www\.)?cognition\.ai\/?/gi,
    /https?:\/\/jobs\.ashbyhq\.com\/cognition[^"'>\s]*/gi,
    /https?:\/\/www\.linkedin\.com\/company\/cognition-ai-labs\/?/gi,
    /https?:\/\/x\.com\/cognition_labs\/?/gi,
  ];
  for (const re of urlSubs) out = out.replace(re, toMail);

  // --- Location: company line ---
  out = out.replace(/Built by Cognition/g, `Built by ${COMPANY}, ${LOCATION}`);

  // --- Names (longest / plural first) ---
  out = out.replace(/MultiDevin/g, `Multi${COMPANY}`);
  out = out.replace(/Devins/g, COMPANY);
  out = out.replace(/Devin/g, COMPANY);
  out = out.replace(/Cognition/g, COMPANY);

  // Leftover domain/name fragments in text (after URL rewrites)
  out = out.replace(/cognition\.ai/gi, "elitechnexus.com");
  out = out.replace(/devin\.ai/gi, "elitechnexus.com");
  out = out.replace(/\bcognition\b/gi, COMPANY);
  out = out.replace(/\bdevin\b/gi, COMPANY);

  // Ensure Built-by line includes location even if Cognition was already swapped
  out = out.replace(
    new RegExp(`Built by ${COMPANY}(?!, ${LOCATION})`, "g"),
    `Built by ${COMPANY}, ${LOCATION}`
  );

  // --- Phone: fill existing empty footer span (no new elements) ---
  out = out.replace(
    /(id="site-footer__bottom-right"[\s\S]*?<\/a>)\s*<span><\/span>/,
    `$1 <span>${PHONE_DISPLAY}</span>`
  );

  // Pricing / FAQ contact lines: append phone beside existing mailto anchor text pattern
  out = out.replace(
    new RegExp(
      `(Contact us at\\s*)(<a href="mailto:${EMAIL.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      )}"[^>]*>${EMAIL.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}</a>)`,
      "g"
    ),
    `$1$2 · ${PHONE_DISPLAY}`
  );

  // Contact us links: point to phone as well via title (attribute only)
  out = out.replace(
    /(<a[^>]*href="mailto:stephen\.worthy@gmail\.com"[^>]*?)(>Contact us<\/a>)/gi,
    `$1 title="${PHONE_DISPLAY} · ${EMAIL} · ${LOCATION}"$2`
  );

  return out;
}

const files = walk(ROOT);
// Also rebrand root README / package description
const extras = [
  "D:/Company Website(ElitechNexus)/README.md",
  "D:/Company Website(ElitechNexus)/package.json",
];

let changed = 0;
for (const file of [...files, ...extras]) {
  if (!fs.existsSync(file)) continue;
  const before = fs.readFileSync(file, "utf8");
  let after = before;

  if (file.endsWith("package.json")) {
    const pkg = JSON.parse(before);
    pkg.name = "elitechnexus-site";
    pkg.description =
      "Elitechnexus company website (Philippines) — local static site";
    after = JSON.stringify(pkg, null, 2) + "\n";
  } else if (file.endsWith(".md")) {
    after = before
      .replace(/Devin Archive Site Mirror/g, `${COMPANY} Site`)
      .replace(/Devin\/Cognition/g, COMPANY)
      .replace(/Devin/g, COMPANY)
      .replace(/Cognition/g, COMPANY)
      .replace(/archive-devin-ai\.lusion\.co/g, "Elitechnexus")
      .replace(
        /Branding swap to Elitech Nexus is deferred until company content is provided\./g,
        `Branded as ${COMPANY} · based in ${LOCATION}. Contact: ${EMAIL} · ${PHONE_DISPLAY}.`
      );
  } else {
    after = rebrandHtml(before);
  }

  if (after !== before) {
    fs.writeFileSync(file, after, "utf8");
    changed++;
    console.log("updated", path.relative("D:/Company Website(ElitechNexus)", file));
  }
}

console.log("\nfiles changed:", changed);

// Verify leftovers in public (excl visual-3d)
let leftovers = 0;
for (const file of walk(ROOT)) {
  if (!/\.html$/i.test(file)) continue;
  const t = fs.readFileSync(file, "utf8");
  const bad = t.match(/Devin|Cognition|devin\.ai|cognition\.ai|support@cognition/gi) || [];
  if (bad.length) {
    leftovers += bad.length;
    console.log("LEFTOVER", path.relative(ROOT, file), bad.slice(0, 8));
  }
}
console.log("leftover brand hits:", leftovers);

// Sanity: company / contact present
const home = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
console.log("has Elitechnexus", home.includes(COMPANY));
console.log("has Philippines", home.includes(LOCATION));
console.log("has email", home.includes(EMAIL));
console.log("has phone", home.includes(PHONE_DISPLAY));
console.log("Built by line sample:", (home.match(/Built by[^<]{0,60}/) || [])[0]);
