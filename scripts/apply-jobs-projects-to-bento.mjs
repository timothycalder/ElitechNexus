/**
 * Weave Jobs & Projects content (full-time / freelance / side-income)
 * into the existing Features & Capabilities (home-bento) section.
 */
import fs from "fs";

const file = "public/index.html";
let html = fs.readFileSync(file, "utf8");

const before = html;

html = html.replace(
  /<p id="home-bento__subtitle">[\s\S]*?<\/p>/,
  `<p id="home-bento__subtitle">We help with full-time jobs, not only projects. Elitechnexus supports career employment and flexible income — so whether you need a stable role, freelance delivery, or a side-income path, we build the route around your situation.</p>`
);

html = html.replace(
  /<h3 class="home-bento__item-title">Deep Technical Vetting<\/h3>\s*<p class="home-bento__item-subtitle">[\s\S]*?<\/p>/,
  `<h3 class="home-bento__item-title">Full-time job support</h3> <p class="home-bento__item-subtitle">Resume polish, portfolio proof, job targeting, daily applications, interview preparation, and senior-level coaching — with deep technical vetting so you can compete for stable full-time roles.</p>`
);

html = html.replace(
  /<h3 class="home-bento__item-title">Seamless Communication<\/h3>\s*<p class="home-bento__item-subtitle">[\s\S]*?<\/p>/,
  `<h3 class="home-bento__item-title">Freelance project support</h3> <p class="home-bento__item-subtitle">Proposal writing, client matching, delivery support, task outsourcing, and review systems for paid project work — with communication coaching so delivery never stalls.</p>`
);

html = html.replace(
  /<span class="home-bento__item-label">Collaborate<\/span>\s*<h3 class="home-bento__item-title">Compliant Global Onboarding<\/h3>\s*<p class="home-bento__item-subtitle">[\s\S]*?<\/p>/,
  `<span class="home-bento__item-label">Jobs &amp; projects</span> <h3 class="home-bento__item-title">Side-income route</h3> <p class="home-bento__item-subtitle">Small practical tasks, learning plans, and repeatable routines for engineers and builders who want extra income — without giving up the path to full-time opportunity.</p>`
);

if (html === before) {
  console.error("No changes applied — patterns not found");
  process.exit(1);
}

fs.writeFileSync(file, html);

const chunk = html.slice(html.indexOf('id="home-bento"'), html.indexOf('id="home-integration"'));
const titles = [...chunk.matchAll(/home-bento__item-title">([^<]+)/g)].map((m) => m[1]);
console.log("updated titles:", titles);
console.log("subtitle:", chunk.match(/home-bento__subtitle">([^<]+)/)?.[1]?.slice(0, 100));
