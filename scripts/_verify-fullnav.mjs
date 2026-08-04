import http from "http";

const paths = ["/about", "/careers", "/blog", "/contact", "/"];
for (const p of paths) {
  await new Promise((resolve) => {
    http
      .get("http://127.0.0.1:3010" + p, (res) => {
        let d = "";
        res.on("data", (c) => (d += c));
        res.on("end", () => {
          const slug = p.replace(/\//g, "") || "home";
          console.log({
            p,
            status: res.statusCode,
            fullnav: d.includes("elitechnexus-fullnav-fix"),
            pageId: d.includes(`id="${slug}"`) || (slug === "home" && d.includes('id="home"')),
            title: (d.match(/<title>([^<]+)/) || [])[1],
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
