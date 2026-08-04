import fs from "fs";

const htmlPath = "D:/Company Website(ElitechNexus)/public/visual-3d/index.html";
let html = fs.readFileSync(htmlPath, "utf8");

const style = `<style id="real-model-boot">
      @font-face { font-family: "neue-haas-grotesk-display"; src: local("Arial"); font-weight: 400; font-style: normal; }
      @font-face { font-family: "neue-haas-grotesk-display"; src: local("Arial"); font-weight: 500; font-style: normal; }
      @font-face { font-family: "neue-haas-grotesk-display"; src: local("Arial Black"), local("Arial"); font-weight: 700; font-style: normal; }
      @font-face { font-family: "neue-haas-grotesk-display"; src: local("Arial"); font-weight: 700; font-style: italic; }
      @font-face { font-family: "neue-haas-grotesk-text"; src: local("Arial"); font-weight: 400; font-style: normal; }
      @font-face { font-family: "neue-haas-grotesk-text"; src: local("Arial"); font-weight: 400; font-style: italic; }
      @font-face { font-family: "neue-haas-grotesk-text"; src: local("Arial"); font-weight: 700; font-style: normal; }
      html, body { margin: 0; background: #000; }
      #canvas { position: fixed !important; inset: 0 !important; width: 100% !important; height: 100% !important; z-index: 0 !important; display: block !important; }
      #cookies-overlay, #tickets-overlay { display: none !important; }
    </style>`;

if (html.includes('id="real-model-boot"')) {
  html = html.replace(/<style id="real-model-boot">[\s\S]*?<\/style>/, style);
} else {
  html = html.replace("<head>", `<head>${style}`);
}

html = html.replace(/<base href="\/visual-3d\/">\s*/g, "");
if (!html.includes('<base href="./">')) {
  html = html.replace("<head>", '<head><base href="./">');
}

fs.writeFileSync(htmlPath, html, "utf8");
console.log("HTML CSS fixed for real model scroll experience");

// iframe should not force HIDE_UI
const homePath = "D:/Company Website(ElitechNexus)/public/index.html";
let home = fs.readFileSync(homePath, "utf8");
home = home.replace(
  'src="http://localhost:3011/?HIDE_UI=1"',
  'src="http://localhost:3011/"'
);
fs.writeFileSync(homePath, home, "utf8");
console.log("homepage iframe updated");
