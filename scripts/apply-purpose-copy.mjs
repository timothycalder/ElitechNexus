/**
 * Inject IncomeRemotely-inspired MAIN PURPOSE into Elitechnexus copy.
 * - Keep Elitechnexus brand, layout, and contact as-is
 * - Do NOT import IncomeRemotely name, logo, emails, phones, or socials
 */
import fs from "fs";
import path from "path";

const REPLACEMENTS = [
  // Meta
  [
    "Elitechnexus is your global engineering bridge — connecting world-class developers from Europe and Asia directly into the US tech market.",
    "Elitechnexus helps people and companies turn skills into full-time jobs, paid projects, and lasting income — connecting global talent into the US tech market with proof, preparation, and placement.",
  ],

  // Hero
  [
    "Connecting world-class international developers from Europe and Asia directly into the US tech market.",
    "Get full-time jobs, paid projects, and career income from what you already have — skills, time, resources, and your network — while US teams hire proven global engineers.",
  ],

  // Hero end (parallel section)
  [
    "Elitechnexus can work<br><span class=\"o-text-gradient\">tirelessly and in parallel</span>",
    "Jobs, projects, and income<br><span class=\"o-text-gradient\">built on real proof</span>",
  ],
  [
    "Teams of Elitechnexus working in parallel can handle tasks ranging from code refactors to frontend bugs and Slack requests.",
    "We help you prepare for full-time roles, win freelance projects, grow side income, and earn through partnerships — not by applying blindly, but by building proof employers and clients trust.",
  ],

  // Use cases intro
  [
    "From implementing new features to fixing thousands of lint errors, Elitechnexus can clear your backlog, modernize your codebase, and help you build more.",
    "From full-time job prep to paid project delivery, Elitechnexus clears the gap between potential and opportunity — resume and portfolio proof, interview readiness, and real engineering work US teams need.",
  ],

  // Bento features head
  [
    "What US teams get when they scale engineering with Elitechnexus global talent.",
    "What changes when proof comes first: stronger candidates for full-time jobs, clearer project delivery, and income routes that fit your situation.",
  ],

  // Bento cards — keep titles, deepen purpose in subtitles
  [
    "Every developer passes rigorous live coding, architecture design, and algorithmic screening.",
    "Every developer builds proof first — live coding, architecture design, and algorithmic screening — so employers see evidence before they give a chance.",
  ],
  [
    "Advanced English proficiency and training in US corporate culture guarantee friction-free collaboration.",
    "Advanced English, US workplace culture training, and interview coaching so communication never blocks a full-time offer or a paid project.",
  ],
  [
    "We manage international legal frameworks, payroll, and compliance directly out of our headquarters in the Philippines.",
    "From our Philippines headquarters we handle compliant onboarding, payroll, and cross-border frameworks so full-time placement and project work stay simple for both sides.",
  ],

  // Integration title
  [
    "Able to work<br><span class=\"o-text-gradient\">with hundreds of tools</span>",
    "Ready for jobs<br><span class=\"o-text-gradient\">and paid projects</span>",
  ],

  // CTA
  [
    "Industry leaders choose to",
    "Proof first. Opportunity next.",
  ],

  // Case study / overlay narrative
  [
    "For ambitious US companies, finding elite engineering resources locally has become a primary scaling bottleneck. Elitechnexus solves this by vetting and deploying top-tier software engineers from Asia and Europe directly into US operations. We handle the cross-border complexities so you can focus entirely on product velocity.",
    "US companies need proven engineers. Global talent needs a real path into full-time jobs and paid projects. Elitechnexus connects both sides: we vet, coach, and deploy top engineers from Asia and Europe into US operations — with proof, preparation, and compliant onboarding — so product velocity is not limited by one geography.",
  ],
  [
    "US-based tech firms face hyper-competitive domestic hiring environments, skyrocketing localized salary demands, and a severe shortage of specialized senior developers. Limiting your search to one geography restricts your company's growth potential.",
    "The market feels hard because employers and clients ask for proof before they give opportunity. Domestic hiring is expensive and scarce, while junior talent is told they are not senior enough. Limiting search to one geography — or applying without proof — blocks growth for companies and careers alike.",
  ],
  [
    "Elitechnexus acts as your strategic talent partner. We source, technically vet, and onboard international developers who possess deep technical expertise. Clients get dedicated engineering power working seamlessly across overlapping time zones.",
    "Elitechnexus is your strategic talent and income partner. We source, technically vet, coach, and onboard international developers — then place them into full-time roles and paid projects across overlapping time zones. Clients get dedicated engineering power; talent gets a clear route from skill to stable income.",
  ],
];

// Use-case slide blurbs if present (Devin-era backlog language)
const EXTRA = [
  [
    "How US Enterprises Scale Engineering Output with Elitechnexus Global Talent",
    "How Elitechnexus Turns Global Talent into Full-Time Jobs, Paid Projects, and Engineering Output",
  ],
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

const all = [...REPLACEMENTS, ...EXTRA];
let files = 0;
let hits = 0;

for (const f of walk("public")) {
  let h = fs.readFileSync(f, "utf8");
  const before = h;
  for (const [from, to] of all) {
    if (h.includes(from)) {
      h = h.split(from).join(to);
      hits++;
    }
  }
  if (h !== before) {
    fs.writeFileSync(f, h);
    files++;
    console.log("updated", f);
  }
}

// Guard: never introduce IR brand/contact
const banned = [
  "IncomeRemotely",
  "incomeremotely",
  "deepengineer123",
  "charljustineompoc",
  "careers@incomeremotely",
  "412-748-1658",
];
let leak = false;
for (const f of walk("public")) {
  const h = fs.readFileSync(f, "utf8");
  for (const b of banned) {
    if (h.toLowerCase().includes(b.toLowerCase())) {
      console.error("LEAK", b, "in", f);
      leak = true;
    }
  }
}

console.log({ files, hits, leak });
if (leak) process.exit(1);
