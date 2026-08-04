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

// Fix Feature 1 on homepage
let home = fs.readFileSync("public/index.html", "utf8");
const f1re =
  /<h3 class="home-bento__item-title">Elitechnexus learns your codebase & <br>picks up tribal knowledge\s*<\/h3>/;
if (f1re.test(home)) {
  home = home.replace(
    f1re,
    `<h3 class="home-bento__item-title">Deep Technical Vetting</h3> <p class="home-bento__item-subtitle">Every developer passes rigorous live coding, architecture design, and algorithmic screening.</p>`
  );
  console.log("Feature 1 fixed");
} else {
  console.error("Feature 1 still not found");
}

fs.writeFileSync("public/index.html", home, "utf8");

// Fix footer inquiries on all pages (whitespace-tolerant)
for (const file of walk("public")) {
  let html = fs.readFileSync(file, "utf8");
  const before = html;

  html = html.replace(
    /<p id="site-footer__top-right-subtitle">Elitechnexus Enterprise provides additional capabilities, security[\s\S]*?and control for your organization\.<\/p>/g,
    `<p id="site-footer__top-right-subtitle">Inquiries: ${EMAIL} | ${PHONE}</p>`
  );

  // In case titles weren't updated on some pages
  html = html.replace(
    /<h3 id="site-footer__top-left-title">Build more with<br><span class="o-text-gradient">Elitechnexus<\/span><\/h3>/g,
    `<h3 id="site-footer__top-left-title">Elitechnexus LLC<br><span class="o-text-gradient">Philippines</span></h3>`
  );
  html = html.replace(
    /<h4 class="site-footer__top-right-title">Need Elitechnexus for your enterprise\?<\/h4>/g,
    `<h4 class="site-footer__top-right-title">Elitechnexus LLC — Headquarters</h4>`
  );
  html = html.replace(
    /<h4 class="site-footer__top-right-title is-enterprise">Get started with Elitechnexus Enterprise<\/h4>/g,
    `<h4 class="site-footer__top-right-title is-enterprise">Based in the Philippines</h4>`
  );
  html = html.replace(
    /<div id="site-footer__bottom-left">\s*<a href="[^"]*"[^>]*>Privacy policy<\/a>\s*<a href="[^"]*"[^>]*>Terms of service<\/a>\s*<\/div>/g,
    `<div id="site-footer__bottom-left"> <a href="mailto:${EMAIL}" target="_blank">${EMAIL}</a> <a href="tel:${PHONE_TEL}">${PHONE}</a> </div>`
  );

  if (html !== before) {
    fs.writeFileSync(file, html, "utf8");
    console.log("footer fixed", file);
  }
}

home = fs.readFileSync("public/index.html", "utf8");
for (const c of [
  "Deep Technical Vetting",
  "Every developer passes rigorous live coding",
  "Seamless Communication",
  "Compliant Global Onboarding",
  "Inquiries: steven.miller@elitechnexus.com | +1 (339) 365-7217",
  "Elitechnexus LLC",
  "Features &",
]) {
  console.log(c, home.includes(c) ? "OK" : "FAIL");
}
