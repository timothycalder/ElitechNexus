import fs from "fs";

let h = fs.readFileSync("public/index.html", "utf8");

// Use-case card list items — replace tool jargon with service skills
const reps = [
  ["Language migrations", "AI &amp; ML skills"],
  ["Version upgrades", "Full Stack delivery"],
  ["Codebase restructuring", "Interview coaching"],
  ["Data warehouse migrations", "Data engineering"],
  ["ETL development", "Security practices"],
  ["Data cleaning and preprocessing", "Forward Deployed Eng"],
  ["Ticket resolution", "Mentor review"],
  ["First-draft PR creation for backlog tasks", "Portfolio proof building"],
  ["Building SaaS integrations", "Client project delivery"],
  ["CI/CD autotriage", "Job applications"],
  ["Scraping", "Teaching &amp; labs"],
  ["New repo onboarding", "Skills onboarding"],
  ["Maintaining documentation", "Career documentation"],
  ["Task outsourcing", "Delivery support"],
  ["Application", "Career"],
];

for (const [a, b] of reps) {
  const n = h.split(a).length - 1;
  if (n) {
    h = h.split(a).join(b);
    console.log(a, "→", b, "x" + n);
  }
}

h = h.replace(/hero-steps-1(-mobile)?\.png(?:\?v=\d+)?/g, `hero-steps-1$1.png?v=24`);
fs.writeFileSync("public/index.html", h);
console.log("done");
