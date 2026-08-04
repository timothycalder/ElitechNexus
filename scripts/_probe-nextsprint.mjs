import fs from "fs";

const jsUrl = "https://nextsprinttech.com/assets/index-OtSLMcXY.js";
const cssUrl = "https://nextsprinttech.com/assets/index-CQ7gZLIY.css";

const js = await (await fetch(jsUrl)).text();
const css = await (await fetch(cssUrl)).text();
fs.writeFileSync("scripts/_nextsprint-bundle.js", js);
fs.writeFileSync("scripts/_nextsprint-bundle.css", css);
console.log({ js: js.length, css: css.length });

// Find contact-related strings
const needles = [
  "Contact",
  "Phone",
  "Email",
  "Address",
  "Get in touch",
  "Send Message",
  "contact-us",
  "Drop us",
  "Let's talk",
  "office",
];
for (const n of needles) {
  let i = 0;
  let c = 0;
  while ((i = js.indexOf(n, i)) >= 0 && c < 3) {
    console.log("\n---", n, "@", i, "---");
    console.log(js.slice(Math.max(0, i - 80), i + 200).replace(/\s+/g, " "));
    i += n.length;
    c++;
  }
}
