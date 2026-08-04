/**
 * Restore homepage from archive snapshot, then re-apply Elitechnexus branding
 * and Part 2 copy (Hero, Case overview, Problem, Solution) safely.
 */
import fs from "fs";

const COMPANY = "Elitechnexus";
const EMAIL = "steven.miller@elitechnexus.com";
const PHONE_DISPLAY = "+1 (339) 365-7217";
const PHONE_TEL = "+13393657217";
const LOCATION = "Philippines";

const restoredPath = "public/index.html.restored";
const outPath = "public/index.html";

if (!fs.existsSync(restoredPath)) {
  console.error("Missing", restoredPath);
  process.exit(1);
}

let html = fs.readFileSync(restoredPath, "utf8");

// Preserve visual-3d embed from damaged file if present
const damaged = fs.readFileSync(outPath, "utf8");
const visualMatch = damaged.match(
  /<section id="visual-3d-section"[\s\S]*?<\/section>/
);

function rebrandHtml(out) {
  out = out.replace(/mailto:support@cognition\.ai/gi, `mailto:${EMAIL}`);
  out = out.replace(/support@cognition\.ai/gi, EMAIL);

  const toMail = `mailto:${EMAIL}`;
  for (const re of [
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
  ]) {
    out = out.replace(re, toMail);
  }

  out = out.replace(/MultiDevin/g, `Multi${COMPANY}`);
  out = out.replace(/Devins/g, COMPANY);
  out = out.replace(/Devin/g, COMPANY);
  out = out.replace(/Cognition/g, COMPANY);
  out = out.replace(/cognition\.ai/gi, "elitechnexus.com");
  out = out.replace(/devin\.ai/gi, "elitechnexus.com");
  out = out.replace(/\bcognition\b/gi, COMPANY);
  out = out.replace(/\bdevin\b/gi, COMPANY);

  // Built-by caption: logo label text
  out = out.replace(
    /(id="home-hero__caption"[\s\S]*?o-icon">[\s\S]*?<\/div>)\s*Elitechnexus(?!, Philippines)</,
    `$1 Elitechnexus, Philippines<`
  );

  out = out.replace(
    /(id="site-footer__bottom-right"[\s\S]*?<\/a>)\s*<span><\/span>/,
    `$1 <span>${PHONE_DISPLAY}</span>`
  );

  out = out.replace(
    new RegExp(
      `(Contact us at\\s*)(<a href="mailto:${EMAIL.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")}"[^>]*>${EMAIL.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")}</a>)`,
      "g"
    ),
    `$1$2 · ${PHONE_DISPLAY}`
  );

  out = out.replace(
    /(<a[^>]*href="mailto:stephen\.worthy@gmail\.com"[^>]*?)(>Contact us<\/a>)/gi,
    `$1 title="${PHONE_DISPLAY} · ${EMAIL} · ${LOCATION}"$2`
  );

  return out;
}

html = rebrandHtml(html);

// --- Part 2: Hero ---
html = html.replace(
  '<h1 id="home-hero__title"><span class="o-text-gradient">Elitechnexus</span><br>is a collaborative<br>AI teammate</h1>',
  '<h1 id="home-hero__title"><span class="o-text-gradient">Elitechnexus</span><br>is your global<br>engineering bridge.</h1>'
);
html = html.replace(
  '<p id="home-hero__subtitle">Built to help ambitious engineering teams achieve more.</p>',
  '<p id="home-hero__subtitle">Connecting world-class international developers from Europe and Asia directly into the US tech market.</p>'
);

// --- Case study header + metrics + overview ---
html = html.replaceAll(
  "How Nubank refactors millions of lines of code to improve engineering efficiency with Elitechnexus",
  "How US Enterprises Scale Engineering Output with Elitechnexus Global Talent"
);

html = html.replace(
  /<div class="table">\s*<div>\s*<div>8x<\/div>\s*<div>engineering time efficiency gain<\/div>\s*<\/div>\s*<div>\s*<div>20x<\/div>\s*<div>cost savings<\/div>\s*<\/div>\s*<\/div>/g,
  `<div class="table"> <div> <div>10x</div> <div>Talent Pool Expansion</div> </div> <div> <div>60%</div> <div>Operational Cost Savings</div> </div> </div>`
);

html = html.replace(
  /(<h2>Overview<\/h2>\s*<p>)[\s\S]*?(<\/p>\s*<h2>The Problem<\/h2>)/,
  `$1For ambitious US companies, finding elite engineering resources locally has become a primary scaling bottleneck. Elitechnexus solves this by vetting and deploying top-tier software engineers from Asia and Europe directly into US operations. We handle the cross-border complexities so you can focus entirely on product velocity.$2`
);

// --- Problem: replace until Decision h2 ---
{
  const problemStart = html.indexOf("<h2>The Problem</h2>");
  const decisionStart = html.indexOf(
    "<h2>The Decision: an army of Elitechnexus to tackle subtasks in parallel</h2>"
  );
  if (problemStart < 0 || decisionStart < 0 || decisionStart <= problemStart) {
    console.error("Problem/Decision markers missing after rebrand");
    process.exit(1);
  }
  const newProblem = `<h2>The Problem</h2> <p>US-based tech firms face hyper-competitive domestic hiring environments, skyrocketing localized salary demands, and a severe shortage of specialized senior developers. Limiting your search to one geography restricts your company's growth potential.</p> `;
  html = html.slice(0, problemStart) + newProblem + html.slice(decisionStart);
  console.log("Problem replaced safely");
}

// --- Solution: replace h2 + paragraphs until Results highlight ---
{
  const solutionStart = html.indexOf(
    "<h2>The Solution: Custom ETL Migration Elitechnexus</h2>"
  );
  const resultsStart = html.indexOf('<div class="highlight">', solutionStart);
  if (solutionStart < 0 || resultsStart < 0) {
    console.error("Solution/Results markers missing", {
      solutionStart,
      resultsStart,
    });
    process.exit(1);
  }
  const newSolution = `<h2>The Solution: An Army of Elite Global Developers</h2> <p>Elitechnexus acts as your strategic talent partner. We source, technically vet, and onboard international developers who possess deep technical expertise. Clients get dedicated engineering power working seamlessly across overlapping time zones.</p> `;
  html = html.slice(0, solutionStart) + newSolution + html.slice(resultsStart);
  console.log("Solution replaced safely (stopped at Results highlight)");
}

// Meta
html = html.replace(
  /<title>Elitechnexus \| The AI Software Engineer<\/title>/g,
  `<title>Elitechnexus | Global Engineering Bridge</title>`
);
html = html.replace(
  /content="Elitechnexus is an AI coding agent and software engineer that helps developers build better software faster\. Parallel cloud agents for serious engineering teams\."/g,
  `content="Elitechnexus is your global engineering bridge — connecting world-class developers from Europe and Asia directly into the US tech market."`
);

// Re-embed 3D section before footer if we had one
if (visualMatch) {
  if (!html.includes('id="visual-3d-section"')) {
    html = html.replace(
      /<div id="site-footer"/,
      `${visualMatch[0]} <div id="site-footer"`
    );
    console.log("Restored visual-3d section");
  }
} else if (!html.includes('id="visual-3d-section"')) {
  const embed = `<section id="visual-3d-section" class="o-section" aria-label="3D particle visual" style="position:relative;width:100%;height:100vh;min-height:100svh;padding:0;margin:0;background:#000;overflow:hidden;">
<iframe id="visual-3d-frame" src="/visual-3d/" title="3D particle model visual" style="position:absolute;inset:0;width:100%;height:100%;border:0;display:block;background:#000;" allow="fullscreen; autoplay" loading="eager"></iframe>
</section> `;
  html = html.replace(/<div id="site-footer"/, `${embed}<div id="site-footer"`);
  console.log("Inserted visual-3d section");
}

fs.writeFileSync(outPath, html, "utf8");

// Verify integrity
const checks = {
  "home-hero": html.includes('id="home-hero"'),
  "viewport-wrapper": html.includes("viewport-wrapper"),
  "pages-container": html.includes("pages-container"),
  "home-use-cases": html.includes("home-use-cases"),
  "engineering bridge": html.includes("engineering bridge"),
  "Talent Pool Expansion": html.includes("Talent Pool Expansion"),
  "hyper-competitive": html.includes("hyper-competitive"),
  "strategic talent partner": html.includes("strategic talent partner"),
  "Results highlight kept":
    html.includes('<div class="highlight">') && html.includes("Results:"),
  "no collaborative AI teammate": !html.includes("collaborative<br>AI teammate"),
  "visual-3d": html.includes("visual-3d-frame"),
};
const open = (html.match(/<div\b/g) || []).length;
const close = (html.match(/<\/div>/g) || []).length;
console.log("div balance", open, close, "diff", open - close);
console.log("file length", html.length);
for (const [k, v] of Object.entries(checks)) console.log(k, v ? "OK" : "FAIL");
if (Object.values(checks).includes(false) || Math.abs(open - close) > 5) {
  process.exit(1);
}
console.log("RESTORE + PART2 OK");
