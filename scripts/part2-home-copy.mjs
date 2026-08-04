/**
 * Part 2 content overhaul — Hero + Case Study overview blocks on homepage.
 * Layout / DOM structure preserved; text nodes only.
 */
import fs from "fs";

const path = "public/index.html";
let html = fs.readFileSync(path, "utf8");
const before = html;

// --- 1. Hero slogan + subtext ---
const oldTitle =
  '<h1 id="home-hero__title"><span class="o-text-gradient">Elitechnexus</span><br>is a collaborative<br>AI teammate</h1>';
const newTitle =
  '<h1 id="home-hero__title"><span class="o-text-gradient">Elitechnexus</span><br>is your global<br>engineering bridge.</h1>';

if (!html.includes(oldTitle)) {
  console.error("Hero title block not found — aborting title replace");
} else {
  html = html.split(oldTitle).join(newTitle);
  console.log("Hero title updated");
}

const oldSub =
  '<p id="home-hero__subtitle">Built to help ambitious engineering teams achieve more.</p>';
const newSub =
  '<p id="home-hero__subtitle">Connecting world-class international developers from Europe and Asia directly into the US tech market.</p>';

if (!html.includes(oldSub)) {
  console.error("Hero subtitle not found");
} else {
  html = html.split(oldSub).join(newSub);
  console.log("Hero subtitle updated");
}

// --- 2. Case study / core value header ---
const oldHeader =
  "How Nubank refactors millions of lines of code to improve engineering efficiency with Elitechnexus";
const newHeader =
  "How US Enterprises Scale Engineering Output with Elitechnexus Global Talent";

const headerCount = html.split(oldHeader).length - 1;
html = html.split(oldHeader).join(newHeader);
console.log("Case study headers replaced:", headerCount);

// --- Metrics table (8x / 20x) ---
// Exact block from archive structure
const oldMetrics = `<div class="table"> <div> <div>8x</div> <div>engineering time efficiency gain</div> </div> <div> <div>20x</div> <div>cost savings</div> </div> </div>`;
const newMetrics = `<div class="table"> <div> <div>10x</div> <div>Talent Pool Expansion</div> </div> <div> <div>60%</div> <div>Operational Cost Savings</div> </div> </div>`;

const metricsCount = html.split(oldMetrics).length - 1;
if (!metricsCount) {
  // try tighter whitespace variants
  const loose = html.match(
    /<div class="table">\s*<div>\s*<div>8x<\/div>\s*<div>engineering time efficiency gain<\/div>\s*<\/div>\s*<div>\s*<div>20x<\/div>\s*<div>cost savings<\/div>\s*<\/div>\s*<\/div>/
  );
  console.log("loose metrics match?", !!loose);
  if (loose) {
    html = html.replace(
      /<div class="table">\s*<div>\s*<div>8x<\/div>\s*<div>engineering time efficiency gain<\/div>\s*<\/div>\s*<div>\s*<div>20x<\/div>\s*<div>cost savings<\/div>\s*<\/div>\s*<\/div>/g,
      newMetrics
    );
    console.log("Metrics updated via loose match");
  }
} else {
  html = html.split(oldMetrics).join(newMetrics);
  console.log("Metrics tables replaced:", metricsCount);
}

// --- Overview paragraph (first Overview section after case header) ---
const oldOverview = `<h2>Overview</h2> <p>One of Nubank’s most critical, company-wide projects for 2023-2024 was a migration of their core ETL — an 8 year old, multi-million lines of code monolith — to sub-modules. To handle such a large refactor, their only option was a multi-year effort that distributed repetitive refactoring work across over one thousand of their engineers. With Elitechnexus, however, this changed: engineers were able to delegate Elitechnexus to handle their migrations and achieve a 12x efficiency improvement in terms of engineering hours saved, and over 20x cost savings. Among others, Data, Collections, and Risk business units verified and completed their migrations in weeks instead of months or years.</p>`;

const newOverview = `<h2>Overview</h2> <p>For ambitious US companies, finding elite engineering resources locally has become a primary scaling bottleneck. Elitechnexus solves this by vetting and deploying top-tier software engineers from Asia and Europe directly into US operations. We handle the cross-border complexities so you can focus entirely on product velocity.</p>`;

const overviewCount = html.split(oldOverview).length - 1;
if (!overviewCount) {
  // Try curly/straight apostrophe variants
  const alt = oldOverview.replace(/Nubank’s/g, "Nubank's");
  const altCount = html.split(alt).length - 1;
  console.log("overview straight apostrophe count", altCount);
  if (altCount) {
    html = html.split(alt).join(newOverview);
  } else {
    // Regex fallback for Overview first paragraph after header context
    const re =
      /(<h2>Overview<\/h2>\s*<p>)One of Nubank[\s\S]*?months or years\.<\/p>/g;
    const beforeLen = html.length;
    html = html.replace(re, `$1For ambitious US companies, finding elite engineering resources locally has become a primary scaling bottleneck. Elitechnexus solves this by vetting and deploying top-tier software engineers from Asia and Europe directly into US operations. We handle the cross-border complexities so you can focus entirely on product velocity.</p>`);
    console.log("overview regex changed?", html.length !== beforeLen);
  }
} else {
  html = html.split(oldOverview).join(newOverview);
  console.log("Overview paragraphs replaced:", overviewCount);
}

// Meta description — align landing pitch (text only)
html = html.replace(
  /<meta name="description" content="Elitechnexus is an AI coding agent and software engineer that helps developers build better software faster\. Parallel cloud agents for serious engineering teams\.">/g,
  `<meta name="description" content="Elitechnexus is your global engineering bridge — connecting world-class developers from Europe and Asia directly into the US tech market.">`
);
html = html.replace(
  /content="Elitechnexus is an AI coding agent and software engineer that helps developers build better software faster\. Parallel cloud agents for serious engineering teams\."/g,
  `content="Elitechnexus is your global engineering bridge — connecting world-class developers from Europe and Asia directly into the US tech market."`
);
html = html.replace(
  /<title>Elitechnexus \| The AI Software Engineer<\/title>/g,
  `<title>Elitechnexus | Global Engineering Bridge</title>`
);

if (html === before) {
  console.error("No changes applied");
  process.exit(1);
}

fs.writeFileSync(path, html, "utf8");
console.log("Wrote", path);

// Verify
const checks = [
  "is your global",
  "engineering bridge",
  "Connecting world-class international developers",
  "How US Enterprises Scale Engineering Output",
  "10x",
  "Talent Pool Expansion",
  "60%",
  "Operational Cost Savings",
  "primary scaling bottleneck",
];
for (const c of checks) {
  console.log(c, html.includes(c) ? "OK" : "MISSING");
}
console.log("old Nubank header gone?", !html.includes("How Nubank refactors"));
console.log("old hero teammate gone?", !html.includes("collaborative<br>AI teammate"));
