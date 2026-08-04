import fs from "fs";

const path = "public/index.html";
let html = fs.readFileSync(path, "utf8");

const problemStart = html.indexOf("<h2>The Problem</h2>");
const decisionStart = html.indexOf(
  "<h2>The Decision: an army of Elitechnexus to tackle subtasks in parallel</h2>"
);
const solutionStart = html.indexOf(
  "<h2>The Solution: Custom ETL Migration Elitechnexus</h2>"
);

if (problemStart < 0 || decisionStart < 0 || solutionStart < 0) {
  console.error("markers missing", { problemStart, decisionStart, solutionStart });
  process.exit(1);
}

// Find end of Solution section: next h2 after solution, or Results-like heading
const afterSolution = html.slice(solutionStart + 1);
const nextH2Rel = afterSolution.search(/<h2[\s>]/);
if (nextH2Rel < 0) {
  console.error("no h2 after solution");
  process.exit(1);
}
const solutionEnd = solutionStart + 1 + nextH2Rel;
console.log("next h2 after solution:", html.slice(solutionEnd, solutionEnd + 80));

const newProblem = `<h2>The Problem</h2> <p>US-based tech firms face hyper-competitive domestic hiring environments, skyrocketing localized salary demands, and a severe shortage of specialized senior developers. Limiting your search to one geography restricts your company's growth potential.</p> `;

const newSolution = `<h2>The Solution: An Army of Elite Global Developers</h2> <p>Elitechnexus acts as your strategic talent partner. We source, technically vet, and onboard international developers who possess deep technical expertise. Clients get dedicated engineering power working seamlessly across overlapping time zones.</p> `;

// Replace Problem block (through start of Decision) — keep Decision heading intact for now
const oldProblemBlock = html.slice(problemStart, decisionStart);
html = html.slice(0, problemStart) + newProblem + html.slice(decisionStart);

// Re-find solution after problem edit (offsets may shift)
const solutionStart2 = html.indexOf(
  "<h2>The Solution: Custom ETL Migration Elitechnexus</h2>"
);
const afterSolution2 = html.slice(solutionStart2 + 1);
const nextH2Rel2 = afterSolution2.search(/<h2[\s>]/);
const solutionEnd2 = solutionStart2 + 1 + nextH2Rel2;
const oldSolutionBlock = html.slice(solutionStart2, solutionEnd2);
html = html.slice(0, solutionStart2) + newSolution + html.slice(solutionEnd2);

fs.writeFileSync(path, html, "utf8");
console.log("Problem chars replaced:", oldProblemBlock.length, "->", newProblem.length);
console.log("Solution chars replaced:", oldSolutionBlock.length, "->", newSolution.length);

// Verify
const vp = html.indexOf('id="viewport-wrapper"');
const early = html.slice(0, vp).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
const p = early.indexOf("The Problem");
const s = early.indexOf("The Solution");
console.log(early.slice(p, p + 450));
console.log("---");
console.log(early.slice(s, s + 450));
console.log("old Nubank problem gone?", !early.includes("Nubank was born"));
console.log("old solution fine-tuning gone?", !early.includes("fine-tuning"));
