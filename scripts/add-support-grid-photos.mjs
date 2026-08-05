/**
 * Add IncomeRemotely service photos to "Support that moves you forward" grid.
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";

const DIR = "public/assets/images/income-routes/support";
fs.mkdirSync(DIR, { recursive: true });

const SERVICES = [
  {
    file: "01.jpg",
    url: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=700&q=82",
    title: "Market &amp; Growth Training",
    blurb:
      "Understand job demand, project demand, income paths, and how to stay stable after you get work.",
  },
  {
    file: "02.jpg",
    url: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=700&q=82",
    title: "Resume Review &amp; Polish",
    blurb:
      "Sharper profile, stronger keywords, clearer achievements, and better first impression for full-time job applications.",
  },
  {
    file: "03.jpg",
    url: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=700&q=82",
    title: "Proposal Writing",
    blurb:
      "Freelancer-style proposals that explain value, reduce risk, and increase replies for paid projects.",
  },
  {
    file: "04.jpg",
    url: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=700&q=82",
    title: "Daily Job &amp; Project Applications",
    blurb:
      "Consistent targeting for full-time jobs, freelance projects, paid tasks, and local opportunities.",
  },
  {
    file: "05.jpg",
    url: "https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=700&q=82",
    title: "Job Interview Support",
    blurb:
      "Mock interviews, answer preparation, confidence building, and live backup when needed for full-time roles.",
  },
  {
    file: "06.jpg",
    url: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=700&q=82",
    title: "Mentor Review System",
    blurb:
      "Senior people review your work, guide decisions, and help you avoid common mistakes.",
  },
  {
    file: "07.jpg",
    url: "https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=700&q=82",
    title: "Routine Task Support",
    blurb:
      "Offload repetitive work so you can focus on learning, client delivery, and interviews.",
  },
  {
    file: "08.jpg",
    url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=700&q=82",
    title: "Tools &amp; Devices",
    blurb:
      "Support with practical tools, setup guidance, and the working environment you need.",
  },
];

const V = 26;

for (const s of SERVICES) {
  const dest = path.join(DIR, s.file);
  if (fs.existsSync(dest) && fs.statSync(dest).size > 2000) {
    console.log("keep", dest);
    continue;
  }
  const res = await fetch(s.url);
  if (!res.ok) throw new Error(`download fail ${s.url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await sharp(buf)
    .resize(720, 480, { fit: "cover", position: "centre" })
    .jpeg({ quality: 86 })
    .toFile(dest);
  console.log("saved", dest);
}

const itemsHtml = SERVICES.map(
  (s) => `      <li class="elite-fields__item">
        <div class="elite-fields__item-media">
          <img src="/assets/images/income-routes/support/${s.file}?v=${V}" alt="" loading="lazy">
        </div>
        <strong>${s.title}</strong>
        <span>${s.blurb}</span>
      </li>`
).join("\n");

const gridHtml = `    <ul class="elite-fields__grid" aria-label="Support services">
${itemsHtml}
    </ul>`;

const extraCss = `
.elite-fields__item{
  border-top:none;
  padding:0;
  border-radius:1rem;
  overflow:hidden;
  background:rgba(255,255,255,.03);
  border:1px solid var(--ef-line);
  display:flex;
  flex-direction:column;
  min-height:100%;
  transition:transform .25s ease, border-color .25s ease, background .25s ease;
}
.elite-fields__item:hover{
  transform:translateY(-3px);
  border-color:rgba(94,234,212,.35);
  background:rgba(255,255,255,.05);
}
.elite-fields__item-media{
  position:relative;
  aspect-ratio:3/2;
  overflow:hidden;
  background:#0b1524;
}
.elite-fields__item-media img{
  width:100%;
  height:100%;
  object-fit:cover;
  display:block;
  transition:transform .45s ease;
}
.elite-fields__item:hover .elite-fields__item-media img{
  transform:scale(1.04);
}
.elite-fields__item strong,
.elite-fields__item span{
  padding-left:1rem;
  padding-right:1rem;
}
.elite-fields__item strong{
  margin-top:.9rem;
  margin-bottom:.35rem;
}
.elite-fields__item span{
  padding-bottom:1.05rem;
}
`;

let html = fs.readFileSync("public/index.html", "utf8");

// Replace grid block
const re =
  /<ul class="elite-fields__grid"[^>]*>[\s\S]*?<\/ul>/;
if (!re.test(html)) {
  console.error("grid not found");
  process.exit(1);
}
html = html.replace(re, gridHtml);

// Patch CSS inside elitechnexus-fields-css
if (!html.includes("elite-fields__item-media")) {
  html = html.replace(
    ".elite-fields__item{\n  border-top:1px solid var(--ef-line);\n  padding:1.05rem 0 .2rem;\n}",
    `.elite-fields__item{border-top:1px solid var(--ef-line);padding:1.05rem 0 .2rem;}${extraCss}`
  );
  // If the above exact match fails, append before closing style
  if (!html.includes("elite-fields__item-media")) {
    html = html.replace(
      "</style><style id=\"elitechnexus-no-video-css\">",
      `${extraCss}</style><style id="elitechnexus-no-video-css">`
    );
  }
}

fs.writeFileSync("public/index.html", html);
console.log("done — support grid now uses IncomeRemotely photos");
