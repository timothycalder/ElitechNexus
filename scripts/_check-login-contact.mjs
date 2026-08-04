import fs from "fs";
import http from "http";

for (const p of ["/contact", "/login", "/contact/", "/login/"]) {
  await new Promise((resolve) => {
    http
      .get("http://127.0.0.1:3010" + p, (res) => {
        let d = "";
        res.on("data", (c) => (d += c));
        res.on("end", () => {
          const hasContact = d.includes('id="contact"');
          const hasLogin = d.includes('id="login"');
          const hasStrip = d.includes("elite-contact__strip");
          const hasForm = d.includes("elite-contact-form") || d.includes("elite-login");
          const title = (d.match(/<title>([^<]+)/) || [])[1];
          console.log({
            p,
            status: res.statusCode,
            len: d.length,
            title,
            hasContact,
            hasLogin,
            hasStrip,
            hasForm,
            fullnav: d.includes("elitechnexus-fullnav-fix"),
          });
          resolve();
        });
      })
      .on("error", (e) => {
        console.log(p, e.message);
        resolve();
      });
  });
}

console.log("\n--- local files ---");
for (const f of ["public/contact/index.html", "public/login/index.html"]) {
  const h = fs.readFileSync(f, "utf8");
  const start = h.indexOf('id="pages-container"');
  const end = h.indexOf('id="site-footer"', start);
  console.log("\n", f, "page block len", end - start);
  console.log(h.slice(start, Math.min(start + 600, end)));
}
