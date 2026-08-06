import sharp from "sharp";
import fs from "fs";
import path from "path";

const user =
  "C:/Users/AI ML Engineer/.cursor/projects/d-Company-Website-ElitechNexus/assets/c__Users_AI_ML_Engineer_AppData_Roaming_Cursor_User_workspaceStorage_c9b29b210eb32d9ff858fc7fd2bf7cca_images_image-22394433-7eed-4d35-b210-a99db6631624.png";

async function sig(p) {
  const { data } = await sharp(p)
    .resize(32, 32, { fit: "fill" })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return data;
}
function dist(a, b) {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += Math.abs(a[i] - b[i]);
  return s;
}
function walk(d, acc = []) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) {
      if (["career-prep", "pixabay", "candidates", "final-pick", "cursors"].includes(e.name))
        continue;
      walk(p, acc);
    } else if (/\.(png|jpe?g|webp)$/i.test(e.name) && fs.statSync(p).size > 40000) {
      acc.push(p);
    }
  }
  return acc;
}

const t = await sig(user);
const files = walk("public/assets/images");
console.log("scanning", files.length);
const tops = [];
for (const p of files) {
  try {
    tops.push({ d: dist(t, await sig(p)), p });
  } catch {}
}
tops.sort((a, b) => a.d - b.d);
tops.slice(0, 15).forEach((x) => console.log(x.d, x.p));
