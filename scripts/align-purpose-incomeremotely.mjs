/**
 * Align Elitechnexus homepage PURPOSE with IncomeRemotely-style model:
 * full-time jobs + paid projects + side income, proof first.
 * Keep Elitechnexus brand, design, and contact details.
 * Reference: https://incomeremotely.com/
 */
import fs from "fs";

const file = "public/index.html";
let html = fs.readFileSync(file, "utf8");
const before = html;

function rep(from, to, label) {
  if (!html.includes(from)) {
    console.warn("MISS:", label);
    return false;
  }
  html = html.split(from).join(to);
  console.log("OK:", label);
  return true;
}

// --- Meta ---
rep(
  "<title>Elitechnexus | Global Engineering Bridge</title>",
  "<title>Elitechnexus | Full-Time Jobs, Projects &amp; Income Routes</title>",
  "title"
);
html = html.replace(
  /<meta name="description" content="[^"]*">/,
  `<meta name="description" content="Elitechnexus helps you get full-time jobs, paid projects, and side income from what you already have — skills, time, resources, and your network — with proof first.">`
);
html = html.replace(
  /<meta property="og:description" content="[^"]*">/,
  `<meta property="og:description" content="Elitechnexus helps you get full-time jobs, paid projects, and side income from what you already have — with proof first.">`
);
console.log("OK: meta description");

// --- Hero ---
rep(
  '<h1 id="home-hero__title"><span class="o-text-gradient">Elitechnexus</span><br>is your global<br>engineering bridge.</h1>',
  '<h1 id="home-hero__title"><span class="o-text-gradient">Elitechnexus</span><br>for full-time jobs,<br>projects &amp; income.</h1>',
  "hero title"
);
rep(
  '<p id="home-hero__subtitle">Get full-time jobs, paid projects, and career income from what you already have — skills, time, resources, and your network — while US teams hire proven global engineers.</p>',
  '<p id="home-hero__subtitle">Get full-time jobs, paid projects, and side income from what you already have. Elitechnexus does not only help with projects — we prepare you for stable employment, freelance delivery, and practical extra income.</p>',
  "hero subtitle"
);

// --- Problem / Solution (homepage overview blocks) ---
rep(
  "<h2>The Problem</h2> <p>The market feels hard because employers and clients ask for proof before they give opportunity. Domestic hiring is expensive and scarce, while junior talent is told they are not senior enough. Limiting search to one geography — or applying without proof — blocks growth for companies and careers alike.</p>",
  "<h2>The Problem</h2> <p>The market feels hard because employers and clients ask for proof before they give opportunity. Payroll is not enough for many people, random applications rarely create a stable result, and juniors are told they are not senior enough. Without proof, presentation, and a clear route, both full-time jobs and paid projects stay out of reach.</p>",
  "problem"
);
rep(
  "<h2>The Solution: An Army of Elite Global Developers</h2> <p>Elitechnexus is your strategic talent and income partner. We source, technically vet, coach, and onboard international developers — then place them into full-time roles and paid projects across overlapping time zones. Clients get dedicated engineering power; talent gets a clear route from skill to stable income.</p>",
  "<h2>The Solution: Proof first. Opportunity next.</h2> <p>Elitechnexus is your jobs, projects, and income partner. We help you create proof, improve presentation, and target full-time roles and paid projects — then coach, match, and support delivery so you move from skill, time, resources, and network into real income.</p>",
  "solution"
);

// Overview blurb if present
html = html.replace(
  /(<h2>Overview<\/h2>\s*<p>)[^<]+(<\/p>)/,
  `$1Elitechnexus helps people turn skills, unused resources, available time, and people they know into full-time jobs, freelance projects, side income, and partner opportunities — with preparation, proof, and placement support from our Philippines base.$2`
);
console.log("OK: overview (if present)");

// --- Features subtitle (keep cards from prior update) ---
rep(
  '<p id="home-bento__subtitle">We help with full-time jobs, not only projects. Elitechnexus supports career employment and flexible income — so whether you need a stable role, freelance delivery, or a side-income path, we build the route around your situation.</p>',
  '<p id="home-bento__subtitle">This is the core promise: Elitechnexus supports both career employment and flexible income. Some people need a stable full-time role. Others need freelance projects, side income, or partner rewards. We build the route around your situation.</p>',
  "bento subtitle"
);

// --- Use cases → income routes ---
rep(
  "From full-time job prep to paid project delivery, Elitechnexus clears the gap between potential and opportunity — resume and portfolio proof, interview readiness, and real engineering work US teams need.",
  "Three practical paths to start earning: full-time employment support, freelance project matching, and side-income routines. Pick the route that fits your situation — you do not need to be perfect before you start.",
  "usecases subtitle"
);

rep("Code Migration + Refactors", "Full-time job route", "slide1 title");
rep("Data Engineering + Analysis", "Freelance project route", "slide2 title");
rep("Bugs + Backlog Work", "Side-income route", "slide3 title");

// Slide list items — replace common bullets in each slide area carefully via sequential list replacements
const slideReplacements = [
  [
    ["Language migrations", "Resume polish &amp; keywords"],
    ["Version upgrades", "Portfolio proof building"],
    ["Codebase restructuring", "Daily job targeting"],
    ["Frontend bugs and edge cases", "Interview preparation"],
    ["Unit and E2E testing", "Senior coaching &amp; review"],
    ["UI/UX improvements", "Full-time role readiness"],
  ],
  [
    ["Data warehouse migrations", "Proposal writing"],
    ["ETL development", "Client matching"],
    ["Data cleaning and preprocessing", "Delivery support"],
    ["Automated on-call response", "Task outsourcing"],
    ["Ticket resolution", "Review systems"],
    ["CI/CD", "Paid project positioning"],
  ],
  [
    ["Technical debt", "Small practical tasks"],
    ["Performance optimization", "Learning plans"],
    ["Code reviews", "Repeatable routines"],
    ["Documentation", "Student &amp; senior paths"],
    ["Accessibility", "Extra income practice"],
    ["Feature backlog", "Partner-network intros"],
  ],
];

// Apply bullet text replacements globally on homepage (titles unique enough for job-purpose copy)
for (const group of slideReplacements) {
  for (const [from, to] of group) {
    // Only replace inside list item spans to avoid accidental hits
    const a = `<span>${from}</span>`;
    const b = `<span>${to}</span>`;
    if (html.includes(a)) {
      html = html.replace(a, b);
      console.log("bullet:", from, "→", to);
    } else {
      console.warn("bullet MISS:", from);
    }
  }
}

// --- Talent / fields section → income assets purpose ---
rep(
  '<p class="elite-fields__eyebrow">Our talent network</p>',
  '<p class="elite-fields__eyebrow">Income routes</p>',
  "fields eyebrow"
);
rep(
  '<h2 class="elite-fields__title">Engineers across <span class="o-text-gradient">every specialty</span></h2>',
  '<h2 class="elite-fields__title">You may already have <span class="o-text-gradient">income assets</span></h2>',
  "fields title"
);
rep(
  '<p class="elite-fields__lead">Elitechnexus maintains a deep bench of vetted developers spanning product, platform, data, and infrastructure — so US and global teams can hire the right expertise without stretching one person across every problem.</p>',
  '<p class="elite-fields__lead">Income can come from full-time employment, freelance projects, side tasks, and partner opportunities. Elitechnexus helps you choose the route that fits your situation — and package what you already have into proof employers and clients trust.</p>',
  "fields lead"
);

html = html.replace(
  /<aside class="elite-fields__aside">[\s\S]*?<\/aside>/,
  `<aside class="elite-fields__aside">
        <strong>Proof first. Opportunity next.</strong>
        <p>We help you create portfolio proof, strengthen your resume and profile, and present clearly — so you stop applying blindly.</p>
        <p>Then we target full-time jobs and paid projects with coaching, matching, and delivery support.</p>
      </aside>`
);
console.log("OK: fields aside");

html = html.replace(
  /<p class="elite-fields__section-label">How we match talent<\/p>/,
  '<p class="elite-fields__section-label">Four income sources</p>'
);
html = html.replace(
  /aria-label="How Elitechnexus matches talent"/,
  'aria-label="Four income sources"'
);

html = html.replace(
  /<ol class="elite-fields__process"[\s\S]*?<\/ol>/,
  `<ol class="elite-fields__process" aria-label="Four income sources">
      <li>
        <span class="ef-step">01 — Skill</span>
        <strong>From skill → income</strong>
        <span>Coding, design, writing, language, sales, or operations — packaged with proof, proposals, and interview preparation for jobs or contracts.</span>
      </li>
      <li>
        <span class="ef-step">02 — Resource</span>
        <strong>From resource → income</strong>
        <span>Tools, devices, local access, spare workspace, or software knowledge that support job readiness, project delivery, and partner opportunities.</span>
      </li>
      <li>
        <span class="ef-step">03 — Network &amp; time</span>
        <strong>From people &amp; hours → income</strong>
        <span>Introduce clients and hiring needs through partners — and use focused hours each day for applications, tasks, portfolio work, or outreach.</span>
      </li>
    </ol>`
);
console.log("OK: fields process");

html = html.replace(
  /<p class="elite-fields__section-label">Specialties in the network<\/p>/,
  '<p class="elite-fields__section-label">Support that moves you forward</p>'
);

// Specialty cards → IR-like services
const specialtyPairs = [
  [
    "Frontend &amp; Full-stack",
    "Market &amp; growth training",
    "React, Next.js, TypeScript, and modern web product delivery",
    "Understand job demand, project demand, income paths, and how to stay stable after you get work",
  ],
  [
    "Backend &amp; APIs",
    "Resume review &amp; polish",
    "Distributed systems, services, and reliable data platforms",
    "Sharper profile, stronger keywords, clearer achievements, and a better first impression",
  ],
  [
    "Mobile",
    "Proposal writing",
    "iOS, Android, and cross-platform apps built for App Store–ready production quality",
    "Freelancer-style proposals that explain value, reduce risk, and increase replies",
  ],
  [
    "Cloud &amp; DevOps",
    "Daily job &amp; project applications",
    "AWS, Azure, GCP, CI/CD, observability, and scalable infrastructure",
    "Consistent targeting for full-time jobs, freelance projects, and paid tasks",
  ],
  [
    "Data &amp; AI/ML",
    "Interview support",
    "Analytics pipelines, model integration, applied ML, and data platform work",
    "Mock interviews, answer preparation, confidence building, and live backup when needed",
  ],
  [
    "QA &amp; Automation",
    "Mentor review system",
    "Test strategy, coverage systems, and release confidence for fast-moving teams",
    "Senior people review your work, guide decisions, and help you avoid common mistakes",
  ],
  [
    "Security &amp; Compliance",
    "Routine task support",
    "Secure engineering practices for regulated products and enterprise environments",
    "Offload repetitive work so you can focus on learning, client delivery, and interviews",
  ],
  [
    "Product &amp; UX Engineering",
    "Tools &amp; setup guidance",
    "Accessibility, interaction quality, and engineering that respects product craft",
    "Practical tools, environment setup, and the working systems you need to deliver",
  ],
];

for (const [oldT, newT, oldS, newS] of specialtyPairs) {
  rep(
    `<strong>${oldT}</strong>\n        <span>${oldS}</span>`,
    `<strong>${newT}</strong>\n        <span>${newS}</span>`,
    `specialty ${oldT}`
  );
}

html = html.replace(
  /<p class="elite-fields__section-label">Ways to work with us<\/p>/,
  '<p class="elite-fields__section-label">Choose your track</p>'
);

html = html.replace(
  /<ul class="elite-fields__engage"[\s\S]*?<\/ul>/,
  `<ul class="elite-fields__engage" aria-label="Income tracks">
      <li>
        <strong>Full-time job accelerator</strong>
        <span>Resume repair, portfolio proof, interview preparation, daily job targeting, and senior-review support to help you land full-time roles.</span>
      </li>
      <li>
        <strong>Freelance project track</strong>
        <span>Proposal writing, client matching, delivery support, and review systems so paid project work becomes repeatable.</span>
      </li>
      <li>
        <strong>Side income &amp; partners</strong>
        <span>Small tasks, learning plans, and network introductions for students, seniors, and builders who want extra income.</span>
      </li>
    </ul>`
);
console.log("OK: engage tracks");

rep(
  '<p class="elite-fields__note">Whether you need one specialist or a ready squad, we match proven talent to the work — not the other way around. Based in the Philippines, serving teams worldwide. <a href="/contact">Talk to us about your stack</a></p>',
  '<p class="elite-fields__note">Your skills, resources, network, and time are already valuable. Let’s turn them into full-time jobs, paid projects, and income. Based in the Philippines. <a href="/contact">Book a free interview</a></p>',
  "fields note"
);

// --- CTA ---
rep(
  '<h5 id="home-cta__caption">Proof first. Opportunity next.</h5>',
  '<h5 id="home-cta__caption">Proof first. Opportunity next.</h5>',
  "cta caption (kept)"
);
rep(
  '<h2 id="home-cta__title"> Build with <span class="o-text-gradient">Elitechnexus</span> </h2>',
  '<h2 id="home-cta__title"> Start earning with <span class="o-text-gradient">Elitechnexus</span> </h2>',
  "cta title"
);
rep(
  '<a id="home-cta__button" href="/customers"> <span>Hear from our customers</span> </a>',
  '<a id="home-cta__button" href="/contact"> <span>Book a free interview</span> </a>',
  "cta button"
);

// Footer right subtitle sitewide would be separate — update homepage instance
rep(
  "Full-time jobs, paid projects, and global engineering talent — with proof first. Inquiries: steven.miller@elitechnexus.com | +1 (339) 365-7217",
  "Full-time jobs, paid projects, and side income — with proof first. Inquiries: steven.miller@elitechnexus.com | +1 (339) 365-7217",
  "footer subtitle home"
);

if (html === before) {
  console.error("No changes");
  process.exit(1);
}

fs.writeFileSync(file, html);
console.log("\nHomepage purpose aligned with IncomeRemotely model.");
