import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const homePath = path.join(root, "public", "index.html");
const visualPath = path.join(root, "public", "visual-3d", "index.html");

const embed = `<section id="visual-3d-section" class="o-section" aria-label="3D particle visual" style="position:relative;width:100%;height:100vh;min-height:100svh;padding:0;margin:0;background:#000;overflow:hidden;">
<iframe id="visual-3d-frame" src="/visual-3d/" title="3D particle model visual" style="position:absolute;inset:0;width:100%;height:100%;border:0;display:block;background:#000;" allow="fullscreen; autoplay" loading="eager"></iframe>
</section>`;

let home = await fs.readFile(homePath, "utf8");
if (home.includes('id="visual-3d-section"')) {
  console.log("Embed already present");
} else {
  const marker = '<div id="scroll-indicator">';
  if (!home.includes(marker)) throw new Error("scroll-indicator marker missing");
  home = home.replace(marker, embed + marker);
  await fs.writeFile(homePath, home, "utf8");
  console.log("Inserted visual-3d section into Devin homepage");
}

let visual = await fs.readFile(visualPath, "utf8");
const newStyle = `<style>
      html, body { margin: 0; background: #000; width: 100%; height: 100%; overflow: hidden !important; }
      #canvas { position: fixed !important; inset: 0 !important; width: 100% !important; height: 100% !important; z-index: 0 !important; }
      #ui { opacity: 0 !important; visibility: hidden !important; pointer-events: none !important; }
      #preloader { z-index: 10; }
      #site-footer, #cookies-overlay, #tickets-overlay, #site-header, #site-menu, .page-transition { display: none !important; }
    </style>`;

if (visual.includes("Keep focus on the 3D canvas")) {
  visual = visual.replace(/<style>\s*\/\* Keep focus on the 3D canvas[\s\S]*?<\/style>/, newStyle);
} else if (!visual.includes("#canvas { position: fixed")) {
  visual = visual.replace("<base href=\"/visual-3d/\">", `<base href="/visual-3d/">\n    ${newStyle}`);
}
await fs.writeFile(visualPath, visual, "utf8");
console.log("Updated visual-3d chrome-hiding styles");
