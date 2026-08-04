import fs from "fs";
import path from "path";

const style = `<style id="elitechnexus-logo-css">
/* Default: fill the original .o-icon box (uses --size) */
.o-icon.elitechnexus-logo-wrap{
  display:inline-flex!important;
  align-items:center!important;
  justify-content:center!important;
  line-height:0!important;
  background:transparent!important;
  width:var(--size, 1em)!important;
  height:var(--size, 1em)!important;
  overflow:visible!important;
}
.o-icon.elitechnexus-logo-wrap .elitechnexus-logo{
  display:block!important;
  width:100%!important;
  height:100%!important;
  object-fit:contain!important;
  background:transparent!important;
}

/* Header — enlarge EL to read at nav-text scale */
#site-header__logo .o-icon.elitechnexus-logo-wrap{
  width:calc(var(--icon-size, 2rem) * 1.85)!important;
  height:calc(var(--icon-size, 2rem) * 1.15)!important;
}
#home-hero__caption .o-icon.elitechnexus-logo-wrap{
  width:1.1em!important;
  height:1.1em!important;
}

/* Workspace tabs (Shell/Browser/Editor/Planner) */
#home-hero__flow-visual-right-nav{
  --size: calc(var(--unit2) * .55);
}
#home-hero__flow-visual-right-nav .o-icon.elitechnexus-logo-wrap{
  width:calc(var(--unit2) * .55)!important;
  height:calc(var(--unit2) * .55)!important;
  max-width:calc(var(--unit2) * .55)!important;
  max-height:calc(var(--unit2) * .55)!important;
}

.home-hero__flow-visual-item-side-inner > .o-icon.elitechnexus-logo-wrap{
  width:calc(var(--unit) * 1.75)!important;
  height:calc(var(--unit) * 1.75)!important;
}

.home-hero__flow-visual-chat-item-image .o-icon.elitechnexus-logo-wrap{
  width:100%!important;
  height:100%!important;
}

#site-menu__logo{
  background-image:url('/assets/images/elitechnexus-logo-transparent.png?v=7')!important;
  background-size:contain!important;
  background-repeat:no-repeat!important;
  background-position:left center!important;
  background-color:transparent!important;
}
</style>`;

function walk(d, a = []) {
  for (const n of fs.readdirSync(d)) {
    if (n === "visual-3d") continue;
    const f = path.join(d, n);
    const s = fs.statSync(f);
    if (s.isDirectory()) walk(f, a);
    else if (n.endsWith(".html")) a.push(f);
  }
  return a;
}

for (const f of walk("public")) {
  let h = fs.readFileSync(f, "utf8");
  if (!h.includes("elitechnexus-logo-css")) continue;
  h = h.replace(/<style id="elitechnexus-logo-css">[\s\S]*?<\/style>/, style);
  fs.writeFileSync(f, h);
}
console.log("logo css updated on all pages");
