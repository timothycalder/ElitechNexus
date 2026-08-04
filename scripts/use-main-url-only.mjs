import fs from "fs";
import path from "path";

const root = "D:/Company Website(ElitechNexus)";
const homePath = path.join(root, "public/index.html");
const visualIndex = path.join(root, "public/visual-3d/index.html");
const jsPath = path.join(root, "public/visual-3d/_astro/hoisted.DFPcBL_D.js");
const pkgPath = path.join(root, "package.json");
const readmePath = path.join(root, "README.md");
const serverPath = path.join(root, "scripts/server.mjs");
const threeDHtml = path.join(root, "public/3d.html");

// 1) Homepage iframe -> same-origin /visual-3d/
let home = fs.readFileSync(homePath, "utf8");
home = home.replace(
  /src="http:\/\/localhost:3011\/[^"]*"/g,
  'src="/visual-3d/"'
);
home = home.replace(
  /src="\/visual-3d\/\?HIDE_UI=1"/g,
  'src="/visual-3d/"'
);
if (!home.includes('id="visual-3d-frame"') || !home.includes('src="/visual-3d/"')) {
  console.error("Failed to point homepage iframe at /visual-3d/");
  process.exit(1);
}
fs.writeFileSync(homePath, home, "utf8");
console.log("Homepage iframe -> /visual-3d/");

// 2) visual-3d index: stable base for subpath serving
let vhtml = fs.readFileSync(visualIndex, "utf8");
vhtml = vhtml.replace(/<base href="[^"]*">/, '<base href="/visual-3d/">');
if (!vhtml.includes('<base href="/visual-3d/">')) {
  vhtml = vhtml.replace("<head>", '<head><base href="/visual-3d/">');
}
fs.writeFileSync(visualIndex, vhtml, "utf8");
console.log("visual-3d base href set");

// 3) Prefix absolute /assets and /_astro fetches in engine JS (ignore base)
let js = fs.readFileSync(jsPath, "utf8");
const beforeAssets = (js.match(/["']\/assets\//g) || []).length;
const beforeAstro = (js.match(/["']\/_astro\//g) || []).length;
js = js.replace(/(["'])\/assets\//g, "$1/visual-3d/assets/");
js = js.replace(/(["'])\/_astro\//g, "$1/visual-3d/_astro/");
// Avoid double-prefix if re-run
js = js.replace(/\/visual-3d\/visual-3d\//g, "/visual-3d/");
fs.writeFileSync(jsPath, js, "utf8");
console.log(`JS absolute path rewrite: /assets ${beforeAssets}, /_astro ${beforeAstro}`);

// Also fix absolute /assets in visual-3d HTML attributes
vhtml = fs.readFileSync(visualIndex, "utf8");
vhtml = vhtml.replace(/(=["'])\/assets\//g, "$1/visual-3d/assets/");
vhtml = vhtml.replace(/\/visual-3d\/visual-3d\//g, "/visual-3d/");
fs.writeFileSync(visualIndex, vhtml, "utf8");

// 4) Remove standalone 3d.html shortcut to :3011
if (fs.existsSync(threeDHtml)) {
  fs.unlinkSync(threeDHtml);
  console.log("Removed public/3d.html");
}

// 5) package.json: drop separate 3d server scripts
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
delete pkg.scripts["dev:3d"];
delete pkg.scripts["start:3d"];
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n", "utf8");
console.log("Removed npm scripts:dev:3d, start:3d");

// 6) Main server: no /3d shortcut, no extra 3d URL logs
let server = fs.readFileSync(serverPath, "utf8");
server = server.replace(
  /\s*if \(urlPath === "\/3d" \|\| urlPath\.startsWith\("\/3d\?"\)\) \{\n[\s\S]*?return;\n\s*\}\n/,
  "\n"
);
server = server.replace(
  /console\.log\(`Devin:[\s\S]*?console\.log\(`Shortcut:[\s\S]*?\);\n/,
  `console.log(\`Open http://localhost:\${PORT}/\`);\n`
);
fs.writeFileSync(serverPath, server, "utf8");
console.log("Main server: single URL only");

// 7) README: only main URL
let readme = fs.readFileSync(readmePath, "utf8");
readme = readme.replace(
  /## 3D visual \(from DDD\)[\s\S]*?(?=## Notes)/,
  `## 3D visual (from DDD)

Particle 3D scene from [Digital Design Days 2024](https://1105-ddd2024-homepage.lusion.co/) is embedded on the homepage (same URL — no separate port).

Re-download 3D assets:

\`\`\`bash
npm run mirror:3d
node scripts/embed-visual-3d.mjs
\`\`\`

`
);
fs.writeFileSync(readmePath, readme, "utf8");
console.log("README updated");

console.log("Done. Use only: npm run dev → http://localhost:3010/");
