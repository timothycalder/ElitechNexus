/**
 * Fix weak support matches: interview, routine tasks, proposal writing.
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";

const DIR = "public/assets/images/income-routes/support";
const POOL = "public/assets/images/unique/support-pool";
const V = 52;

const FIXES = [
  {
    file: "01.jpg",
    title: "Job Interview Support",
    local: "public/assets/images/services/interview.png",
    url: null,
  },
  {
    file: "02.jpg",
    title: "Mentor Review System",
    local: "public/assets/images/services/mentor.png",
    url: null,
  },
  {
    file: "03.jpg",
    title: "Routine Task Support",
    local: null,
    // Desk analytics / repetitive computer work
    url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=82",
  },
  {
    file: "05.jpg",
    title: "Market & Growth Training",
    local: null,
    // Training workshop / sticky-note planning session
    url: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=82",
  },
  {
    file: "07.jpg",
    title: "Proposal Writing",
    local: null,
    // Contracts / proposal documents on desk
    url: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=900&q=82",
  },
  {
    file: "08.jpg",
    title: "Daily Job & Project Applications",
    local: null,
    // Online learning / applying on laptop
    url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=82",
  },
];

async function download(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`fail ${res.status}`);
  fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
  console.log("dl", path.basename(dest));
}

for (const c of FIXES) {
  const pool = path.join(POOL, c.file);
  const out = path.join(DIR, c.file);
  if (c.local && fs.existsSync(c.local)) {
    await sharp(c.local)
      .resize(720, 480, { fit: "cover", position: "centre" })
      .jpeg({ quality: 88 })
      .toFile(out);
    console.log("local", c.file, c.title);
  } else {
    await download(c.url, pool);
    await sharp(pool)
      .resize(720, 480, { fit: "cover", position: "centre" })
      .modulate({ brightness: 0.96, saturation: 1.02 })
      .jpeg({ quality: 88 })
      .toFile(out);
    console.log("fixed", c.file, c.title);
  }
}

let html = fs.readFileSync("public/index.html", "utf8");
html = html.replace(
  /income-routes\/support\/(\d+)\.jpg(?:\?v=\d+)?/g,
  `income-routes/support/$1.jpg?v=${V}`
);
fs.writeFileSync("public/index.html", html);
console.log("done v=", V);
