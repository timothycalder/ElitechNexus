import fs from "fs";
import sharp from "sharp";

const assets =
  "C:/Users/AI ML Engineer/.cursor/projects/d-Company-Website-ElitechNexus/assets";
const uploads = [
  "c__Users_AI_ML_Engineer_AppData_Roaming_Cursor_User_workspaceStorage_c9b29b210eb32d9ff858fc7fd2bf7cca_images_maxresdefault-fd1c46ea-a669-4ccb-95c2-d8d7335556d3.png",
  "c__Users_AI_ML_Engineer_AppData_Roaming_Cursor_User_workspaceStorage_c9b29b210eb32d9ff858fc7fd2bf7cca_images_initial-letter-n-u-nu-260nw-2718454701-704a425b-dcdf-424e-92bc-528ad4e0253a.png",
  "c__Users_AI_ML_Engineer_AppData_Roaming_Cursor_User_workspaceStorage_c9b29b210eb32d9ff858fc7fd2bf7cca_images_images-0349e757-3e66-4161-9bec-1d157a4135cb.png",
  "c__Users_AI_ML_Engineer_AppData_Roaming_Cursor_User_workspaceStorage_c9b29b210eb32d9ff858fc7fd2bf7cca_images_image-f2589f31-5aeb-4e67-a995-53b665ee1105.png",
  "c__Users_AI_ML_Engineer_AppData_Roaming_Cursor_User_workspaceStorage_c9b29b210eb32d9ff858fc7fd2bf7cca_images_image-9faf08d7-1407-4abf-91b2-aff5e701c074.png",
  "c__Users_AI_ML_Engineer_AppData_Roaming_Cursor_User_workspaceStorage_c9b29b210eb32d9ff858fc7fd2bf7cca_images_image-a04a3e4e-f65b-4811-8482-5917127293fb.png",
];

for (let i = 0; i < uploads.length; i++) {
  const p = `${assets}/${uploads[i]}`;
  const m = await sharp(p).metadata();
  console.log(`${i + 1}:`, m.width + "x" + m.height, m.format, fs.statSync(p).size);
}

const ramp = "public/assets/images/case-studies/ramp/cover.webp";
const nubank = "public/assets/images/case-studies/nubank/cover.webp";
const cross = "public/assets/images/case-studies/crossmint/cover.webp";
for (const p of [ramp, nubank, cross]) {
  const m = await sharp(p).metadata();
  console.log("site", p.split("/").slice(-2).join("/"), m.width + "x" + m.height);
}

const h = fs.readFileSync("public/customers/ramp/index.html", "utf8");
const imgs = [...h.matchAll(/src="([^"]+\.(?:png|webp|jpg)[^"]*)"/gi)].map((m) => m[1]);
console.log("ramp html imgs:\n" + [...new Set(imgs)].join("\n"));
