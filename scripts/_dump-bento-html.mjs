import fs from "fs";
const h = fs.readFileSync("public/index.html", "utf8");

for (const id of ["home-bento__item-01", "home-bento__item-02", "home-bento__item-03"]) {
  const start = h.indexOf(`id="${id}"`);
  const end =
    id === "home-bento__item-03"
      ? h.indexOf('id="home-integration"', start)
      : h.indexOf(
          `id="home-bento__item-0${Number(id.slice(-1)) + 1}"`,
          start + 10
        );
  const chunk = h.slice(start, Math.min(end, start + 6000));
  console.log("\n========", id, "len", chunk.length, "========");
  // strip svg noise
  const clean = chunk.replace(/<svg[\s\S]*?<\/svg>/gi, "[SVG]");
  const imgs = [...clean.matchAll(/<(img|source|div)[^>]{0,300}/gi)].map((m) =>
    m[0].replace(/\s+/g, " ").slice(0, 220)
  );
  imgs.forEach((x) => console.log(x));
  console.log("--- urls ---");
  [...clean.matchAll(/(?:src|srcset|data-src|style)=["']([^"']+)["']/gi)].forEach(
    (m) => {
      if (/bento|card|image|png|jpg|webp|knowledge|workspace/i.test(m[1]))
        console.log(m[1].slice(0, 160));
    }
  );
}
