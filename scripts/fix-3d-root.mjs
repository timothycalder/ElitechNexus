import fs from "fs";

/**
 * Ensure the 3D visual is served under the main site only
 * (http://localhost:3010/visual-3d/) — no separate :3011 server.
 */
const indexPath = "D:/Company Website(ElitechNexus)/public/visual-3d/index.html";
let html = fs.readFileSync(indexPath, "utf8");

html = html.replace(/<base href="[^"]*">\s*/g, "");
if (!html.includes('<base href="/visual-3d/">')) {
  html = html.replace("<head>", '<head><base href="/visual-3d/">');
}

html = html
  .replaceAll('href="/_astro/', 'href="./_astro/')
  .replaceAll('src="/_astro/', 'src="./_astro/')
  .replaceAll('href="/assets/', 'href="./assets/')
  .replaceAll('src="/assets/', 'src="./assets/');

fs.writeFileSync(indexPath, html, "utf8");

const homePath = "D:/Company Website(ElitechNexus)/public/index.html";
let home = fs.readFileSync(homePath, "utf8");
home = home.replace(/src="http:\/\/localhost:3011\/[^"]*"/g, 'src="/visual-3d/"');
home = home.replace(/src="\/visual-3d\/\?[^"]*"/g, 'src="/visual-3d/"');
fs.writeFileSync(homePath, home, "utf8");

const shortcut = "D:/Company Website(ElitechNexus)/public/3d.html";
if (fs.existsSync(shortcut)) fs.unlinkSync(shortcut);

console.log("3D is embedded on the main site only: http://localhost:3010/");
console.log("Iframe source: /visual-3d/");
