/**
 * Reframe home-hero flow section from AI-tool benefits → people, skills, jobs & coaching.
 */
import fs from "fs";

const path = "public/index.html";
let h = fs.readFileSync(path, "utf8");
const before = h;

// --- 1) Chapter copy under the chat/capabilities visual ---
const oldChapters = `<div class="home-hero__flow-copy-item"> <h3 class="home-hero__chapter-title">Built to <span class="o-text-gradient">collaborate</span> with you</h3> <p class="home-hero__chapter-subtitle">Elitechnexus responds to natural language requests in real time, shares its plans, and learns from feedback.</p> </div> <div class="home-hero__flow-copy-item"> <h3 class="home-hero__chapter-title">Elitechnexus is equipped with its own <span class="o-text-gradient">shell</span></h3> <p class="home-hero__chapter-subtitle">Elitechnexus can test its own code, fixing errors until it succeeds.</p> </div> <div class="home-hero__flow-copy-item"> <h3 class="home-hero__chapter-title">Its own code <span class="o-text-gradient">editor</span> </h3> <p class="home-hero__chapter-subtitle">Elitechnexus can independently explore new codebases and contribute code across multiple files.</p> </div> <div class="home-hero__flow-copy-item"> <h3 class="home-hero__chapter-title">And its own <span class="o-text-gradient">browser</span></h3> <p class="home-hero__chapter-subtitle">Elitechnexus can search the web for documentation, test web applications it builds, and access tools like Notion and Jira.</p> </div>`;

const newChapters = `<div class="home-hero__flow-copy-item"> <h3 class="home-hero__chapter-title">Built around <span class="o-text-gradient">skilled people</span></h3> <p class="home-hero__chapter-subtitle">Elitechnexus connects clients with professional developers across AI, ML, Full Stack, Data, Security, and Forward Deployed Engineering — plus instructors who teach and coach.</p> </div> <div class="home-hero__flow-copy-item"> <h3 class="home-hero__chapter-title">Support that gets you <span class="o-text-gradient">hired</span></h3> <p class="home-hero__chapter-subtitle">Resume review, daily applications, mock interviews, and live interview backup for full-time roles — not blind applying.</p> </div> <div class="home-hero__flow-copy-item"> <h3 class="home-hero__chapter-title">Mentors who <span class="o-text-gradient">review</span> your work</h3> <p class="home-hero__chapter-subtitle">Senior people guide decisions, review delivery, and help you avoid common mistakes on jobs and paid projects.</p> </div> <div class="home-hero__flow-copy-item"> <h3 class="home-hero__chapter-title">Training that grows <span class="o-text-gradient">income</span></h3> <p class="home-hero__chapter-subtitle">Market demand, proposal writing, freelance matching, side-income routines, and the tools you need to stay stable after you get work.</p> </div>`;

if (!h.includes(oldChapters)) {
  console.error("chapter block not found");
} else {
  h = h.split(oldChapters).join(newChapters);
  console.log("chapters updated");
}

// --- 2) Left chat mockup ---
const chatReplacements = [
  [
    '<div id="home-hero__flow-visual-left-header">Set up Next.js repo</div>',
    '<div id="home-hero__flow-visual-left-header">Prep for interview</div>',
  ],
  [
    "Can you start by setting up the Next.js repo, building the project, and running an example?",
    "I need help landing a Full Stack role — resume polish, mock interviews, and a mentor who can review my portfolio.",
  ],
  [
    "Absolutely!  I'll get started on that right away and keep you updated on my progress.",
    "Absolutely. We'll sharpen your profile, run interview practice, and pair you with a senior mentor on your target stack.",
  ],
  ["Cloned repo from GitHub.", "Resume keywords and achievements rewritten."],
  [
    "Identified and read setup instructions for running example apps.",
    "Mock interview scheduled with a Full Stack mentor.",
  ],
  [
    "I've verified that an example app is now running successfully. Let me know if you need further assistance!",
    "Your portfolio proof is ready for applications — and we'll stay with you through interviews.",
  ],
  [
    "Elitechnexus is setting up the Next.js repo",
    "Elitechnexus is matching you with a Full Stack mentor",
  ],
  [
    "Elitechnexus is running an example app according to the setup instructions",
    "Elitechnexus is preparing your interview plan and daily applications",
  ],
  [
    '<div id="home-hero__flow-visual-right-header">Elitechnexus Capabilities</div>',
    '<div id="home-hero__flow-visual-right-header">Elitechnexus Services</div>',
  ],
];

for (const [a, b] of chatReplacements) {
  if (!h.includes(a)) console.warn("missing:", a.slice(0, 60));
  else {
    h = h.split(a).join(b);
    console.log("ok:", b.slice(0, 50));
  }
}

// --- 3) Main hero chat overlays (pull-request style → opportunity style) ---
const overlayReplacements = [
  [
    "I have created a pull request for the changes requested.",
    "Your mentor reviewed the portfolio and interview plan.",
  ],
  [
    "Please let me know if there's anything else you need!",
    "Ready when you are — jobs, projects, or coaching.",
  ],
  [
    "Give Elitechnexus a task to work on...",
    "Tell Elitechnexus what you need help with...",
  ],
];

for (const [a, b] of overlayReplacements) {
  const n = h.split(a).length - 1;
  if (!n) console.warn("overlay missing:", a.slice(0, 50));
  else {
    h = h.split(a).join(b);
    console.log("overlay x" + n + ":", b.slice(0, 40));
  }
}

// --- 4) Thumbnail labels: engineering fields, not tool ops ---
const thumbs = [
  ["Code Migration", "AI &amp; ML"],
  ["Data Science", "Full Stack"],
  ["Issue Triage", "Data &amp; Security"],
  ["CI/CD", "Forward Deployed"],
  ["Repository Setup", "Interview Coach"],
  [">Text Here", ">Teaching &amp; Mentors"],
];
// thumbnails may be in SVG text — try plain replacements carefully
for (const [a, b] of thumbs) {
  // Only replace inside thumbnail area to avoid breaking case studies
  const thStart = h.indexOf('id="home-hero__thumbnails"');
  const thEnd = h.indexOf('id="home-proof"', thStart);
  if (thStart < 0) continue;
  const end = thEnd > 0 ? thEnd : thStart + 8000;
  let chunk = h.slice(thStart, end);
  if (chunk.includes(a)) {
    chunk = chunk.split(a).join(b);
    h = h.slice(0, thStart) + chunk + h.slice(end);
    console.log("thumb:", a, "→", b);
  } else console.warn("thumb missing:", a);
}

// --- 5) Support grid titles (align with requested wording) ---
const support = [
  [
    "<strong>Market &amp; growth training</strong>",
    "<strong>Market &amp; Growth Training</strong>",
  ],
  [
    "Understand job demand, project demand, income paths, and how to stay stable after you get work",
    "Understand job demand, project demand, income paths, and how to stay stable after you get work.",
  ],
  [
    "<strong>Resume review &amp; polish</strong>",
    "<strong>Resume Review &amp; Polish</strong>",
  ],
  [
    "Sharper profile, stronger keywords, clearer achievements, and a better first impression",
    "Sharper profile, stronger keywords, clearer achievements, and better first impression for full-time job applications.",
  ],
  ["<strong>Proposal writing</strong>", "<strong>Proposal Writing</strong>"],
  [
    "Freelancer-style proposals that explain value, reduce risk, and increase replies",
    "Freelancer-style proposals that explain value, reduce risk, and increase replies for paid projects.",
  ],
  [
    "<strong>Daily job &amp; project applications</strong>",
    "<strong>Daily Job &amp; Project Applications</strong>",
  ],
  [
    "Consistent targeting for full-time jobs, freelance projects, and paid tasks",
    "Consistent targeting for full-time jobs, freelance projects, paid tasks, and local opportunities.",
  ],
  ["<strong>Interview support</strong>", "<strong>Job Interview Support</strong>"],
  [
    "Mock interviews, answer preparation, confidence building, and live backup when needed",
    "Mock interviews, answer preparation, confidence building, and live backup when needed for full-time roles.",
  ],
  [
    "<strong>Mentor review system</strong>",
    "<strong>Mentor Review System</strong>",
  ],
  [
    "<strong>Routine task support</strong>",
    "<strong>Routine Task Support</strong>",
  ],
  [
    "<strong>Tools &amp; setup guidance</strong>",
    "<strong>Tools &amp; Devices</strong>",
  ],
  [
    "Practical tools, environment setup, and the working systems you need to deliver",
    "Support with practical tools, setup guidance, and the working environment you need.",
  ],
];

for (const [a, b] of support) {
  if (!h.includes(a)) console.warn("support missing:", a.slice(0, 50));
  else {
    h = h.split(a).join(b);
    console.log("support:", b.slice(0, 40));
  }
}

// --- 6) Nav tab labels in the capabilities panel (HTML only) ---
// Keep Shell/Browser/Editor/Planner structure for layout, but rename to service lanes
const navBlock = h.match(
  /<div id="home-hero__flow-visual-right-nav">[\s\S]*?<\/div>\s*<\/div>\s*<div id="home-hero__flow-visual-right-content"/
);
if (navBlock) {
  let nav = navBlock[0];
  // Replace the four visible labels (text nodes after logo wraps)
  // Structure: <div>Logo</div><div>Shell</div> etc inside each tab
  const labels = [
    [">Shell</div>", ">Skills</div>"],
    [">Browser</div>", ">Jobs</div>"],
    [">Editor</div>", ">Coach</div>"],
    [">Planner</div>", ">Mentor</div>"],
  ];
  for (const [a, b] of labels) {
    if (nav.includes(a)) {
      nav = nav.replace(a, b);
      console.log("nav label", a, "→", b);
    }
  }
  h = h.replace(navBlock[0], nav);
} else console.warn("nav block not found");

if (h === before) {
  console.error("NO CHANGES");
  process.exit(1);
}

fs.writeFileSync(path, h);
console.log("wrote", path);

const checks = [
  "Built around",
  "skilled people",
  "Prep for interview",
  "Elitechnexus Services",
  "Job Interview Support",
  "Tools &amp; Devices",
  "Forward Deployed Engineering",
];
for (const c of checks) console.log(c, h.includes(c) ? "OK" : "MISSING");
console.log("old collaborate gone?", !h.includes("Built to <span class=\"o-text-gradient\">collaborate</span>"));
