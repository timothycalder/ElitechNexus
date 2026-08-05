/**
 * Rematch Support grid photos to titles (01–08).
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";

const DIR = "public/assets/images/income-routes/support";
const POOL = "public/assets/images/unique/support-pool";
const V = 51;

fs.mkdirSync(DIR, { recursive: true });
fs.mkdirSync(POOL, { recursive: true });

const CARDS = [
  {
    file: "01.jpg",
    title: "Job Interview Support",
    blurb: "Mock interviews, answer preparation, and live backup for full-time roles.",
    // Interview / hiring conversation
    url: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=900&q=82",
  },
  {
    file: "02.jpg",
    title: "Mentor Review System",
    blurb: "Senior people review your work, guide decisions, and help you avoid mistakes.",
    // Senior mentoring / code review style collaboration
    url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=900&q=82",
  },
  {
    file: "03.jpg",
    title: "Routine Task Support",
    blurb: "Offload repetitive work so you can focus on learning and interviews.",
    // Desk productivity / checklist / admin tasks
    url: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&w=900&q=82",
  },
  {
    file: "04.jpg",
    title: "Tools & Devices",
    blurb: "Practical tools, setup guidance, and the working environment you need.",
    // Laptop + devices on desk (NOT outdoor friends)
    url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=82",
  },
  {
    file: "05.jpg",
    title: "Market & Growth Training",
    blurb: "Job demand, project demand, income paths, and staying stable after you get work.",
    // Training / workshop presentation
    url: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=82",
  },
  {
    file: "06.jpg",
    title: "Resume Review & Polish",
    blurb: "Sharper profile, stronger keywords, and a better first impression.",
    // Resume / documents being reviewed
    url: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=900&q=82",
  },
  {
    file: "07.jpg",
    title: "Proposal Writing",
    blurb: "Proposals that explain value, reduce risk, and increase replies.",
    // Writing / drafting on laptop
    url: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=900&q=82",
  },
  {
    file: "08.jpg",
    title: "Daily Job & Project Applications",
    blurb: "Consistent targeting for full-time jobs, freelance, and paid tasks.",
    // Applying / job search on computer
    url: "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?auto=format&fit=crop&w=900&q=82",
  },
];

async function download(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`fail ${res.status} ${url}`);
  fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
  console.log("dl", path.basename(dest));
}

for (const c of CARDS) {
  const pool = path.join(POOL, c.file);
  const out = path.join(DIR, c.file);
  try {
    await download(c.url, pool);
  } catch (e) {
    console.warn("retry once", c.file, e.message);
    await download(c.url, pool);
  }
  await sharp(pool)
    .resize(720, 480, { fit: "cover", position: "centre" })
    .modulate({ brightness: 0.96, saturation: 1.02 })
    .jpeg({ quality: 88 })
    .toFile(out);
  console.log("wrote", c.file, "←", c.title);
}

const items = CARDS.map(
  (c) => `      <li class="elite-fields__item">
        <div class="elite-fields__item-media">
          <img src="/assets/images/income-routes/support/${c.file}?v=${V}" alt="${c.title}" loading="lazy">
        </div>
        <strong>${c.title}</strong>
        <span>${c.blurb}</span>
      </li>`
).join("\n");

let html = fs.readFileSync("public/index.html", "utf8");
html = html.replace(
  /<ul class="elite-fields__grid"[^>]*>[\s\S]*?<\/ul>/,
  `<ul class="elite-fields__grid" aria-label="Support services">\n${items}\n    </ul>`
);
html = html.replace(
  /income-routes\/support\/(\d+)\.jpg(?:\?v=\d+)?/g,
  `income-routes/support/$1.jpg?v=${V}`
);
fs.writeFileSync("public/index.html", html);
console.log("done v=", V);
