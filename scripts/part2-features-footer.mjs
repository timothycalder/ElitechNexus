/**
 * Part 2 §4–5: Features grid (home bento) + Footer contact mapping.
 * Prefer text/attribute updates; add subtitle on bento item 01 only if missing
 * so it matches the existing 02/03 card pattern.
 */
import fs from "fs";
import path from "path";

const EMAIL = "steven.miller@elitechnexus.com";
const PHONE = "+1 (339) 365-7217";
const PHONE_TEL = "+13393657217";

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    if (name === "visual-3d") continue;
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (name.endsWith(".html")) out.push(full);
  }
  return out;
}

function updateFeatures(html) {
  if (!html.includes('id="home-bento"')) return html;

  // Section headline
  html = html.replace(
    /<h2 id="home-bento__title">Learn & work<br><span class="o-text-gradient">together<\/span><\/h2>/,
    `<h2 id="home-bento__title">Features &amp;<br><span class="o-text-gradient">Capabilities</span></h2>`
  );
  html = html.replace(
    /<p id="home-bento__subtitle">Elitechnexus is built for collaboration and can learn to fit into your unique workflow\.<\/p>/,
    `<p id="home-bento__subtitle">What US teams get when they scale engineering with Elitechnexus global talent.</p>`
  );

  // Feature 1 — title only today; add matching subtitle element used by sibling cards
  const old1 =
    '<h3 class="home-bento__item-title">Elitechnexus learns your codebase & <br>picks up tribal knowledge </h3>';
  const new1 =
    `<h3 class="home-bento__item-title">Deep Technical Vetting</h3> <p class="home-bento__item-subtitle">Every developer passes rigorous live coding, architecture design, and algorithmic screening.</p>`;
  if (html.includes(old1)) {
    html = html.replace(old1, new1);
    console.log("Feature 1 updated");
  } else {
    console.warn("Feature 1 title not found");
  }

  // Feature 2
  const old2 =
    `<h3 class="home-bento__item-title">Code on the go</h3> <p class="home-bento__item-subtitle">Write code using natural language <br>instructions with Elitechnexus on mobile.</p>`;
  const new2 =
    `<h3 class="home-bento__item-title">Seamless Communication</h3> <p class="home-bento__item-subtitle">Advanced English proficiency and training in US corporate culture guarantee friction-free collaboration.</p>`;
  if (html.includes(old2)) {
    html = html.replace(old2, new2);
    console.log("Feature 2 updated");
  } else {
    console.warn("Feature 2 block not found");
  }

  // Feature 3
  const old3 =
    `<h3 class="home-bento__item-title">Use Elitechnexus's editor, shell <br>and browser</h3> <p class="home-bento__item-subtitle">Take over and run commands, edit code, <br>or use the browser for Elitechnexus at any time.</p>`;
  const new3 =
    `<h3 class="home-bento__item-title">Compliant Global Onboarding</h3> <p class="home-bento__item-subtitle">We manage international legal frameworks, payroll, and compliance directly out of our headquarters in the Philippines.</p>`;
  if (html.includes(old3)) {
    html = html.replace(old3, new3);
    console.log("Feature 3 updated");
  } else {
    console.warn("Feature 3 block not found");
  }

  // Small workspace chrome label in hero visual
  html = html.replace(
    />Elitechnexus's Workspace</g,
    ">Elitechnexus Capabilities<"
  );

  return html;
}

function updateFooter(html) {
  if (!html.includes('id="site-footer"')) return html;

  // Company name + HQ in footer brand title
  html = html.replace(
    /<h3 id="site-footer__top-left-title">Build more with<br><span class="o-text-gradient">Elitechnexus<\/span><\/h3>/g,
    `<h3 id="site-footer__top-left-title">Elitechnexus LLC<br><span class="o-text-gradient">Philippines</span></h3>`
  );

  // Right column copy → inquiries
  html = html.replace(
    /<h4 class="site-footer__top-right-title">Need Elitechnexus for your enterprise\?<\/h4>/g,
    `<h4 class="site-footer__top-right-title">Elitechnexus LLC — Headquarters</h4>`
  );
  html = html.replace(
    /<h4 class="site-footer__top-right-title is-enterprise">Get started with Elitechnexus Enterprise<\/h4>/g,
    `<h4 class="site-footer__top-right-title is-enterprise">Based in the Philippines</h4>`
  );
  html = html.replace(
    /<p id="site-footer__top-right-subtitle">Elitechnexus Enterprise provides additional capabilities, security and control for your organization\.<\/p>/g,
    `<p id="site-footer__top-right-subtitle">Inquiries: ${EMAIL} | ${PHONE}</p>`
  );

  // Bottom-left legal links → inquiry links (same anchors, new labels/hrefs)
  html = html.replace(
    /<div id="site-footer__bottom-left">\s*<a href="[^"]*" target="_blank">Privacy policy<\/a>\s*<a href="[^"]*" target="_blank">Terms of service<\/a>\s*<\/div>/g,
    `<div id="site-footer__bottom-left"> <a href="mailto:${EMAIL}" target="_blank">${EMAIL}</a> <a href="tel:${PHONE_TEL}">${PHONE}</a> </div>`
  );

  // Ensure phone span in bottom-right still present; if missing, leave as-is
  if (!html.includes(PHONE) && html.includes('id="site-footer__bottom-right"')) {
    html = html.replace(
      /(id="site-footer__bottom-right"[\s\S]*?<\/a>)\s*<span><\/span>/,
      `$1 <span>${PHONE}</span>`
    );
  }

  return html;
}

let changed = 0;
for (const file of walk("public")) {
  const before = fs.readFileSync(file, "utf8");
  let html = before;
  if (file.replace(/\\/g, "/").endsWith("public/index.html") || file.endsWith("public\\index.html")) {
    html = updateFeatures(html);
  }
  html = updateFooter(html);
  if (html !== before) {
    fs.writeFileSync(file, html, "utf8");
    changed++;
    console.log("updated", file);
  }
}
console.log("files changed", changed);

// Verify homepage
const home = fs.readFileSync("public/index.html", "utf8");
const checks = [
  "Deep Technical Vetting",
  "Every developer passes rigorous live coding",
  "Seamless Communication",
  "Advanced English proficiency",
  "Compliant Global Onboarding",
  "headquarters in the Philippines",
  "Elitechnexus LLC",
  "Inquiries: steven.miller@elitechnexus.com",
  "+1 (339) 365-7217",
  "Features &",
];
for (const c of checks) console.log(c, home.includes(c) ? "OK" : "FAIL");
console.log(
  "div balance",
  (home.match(/<div\b/g) || []).length,
  (home.match(/<\/div>/g) || []).length
);
