/**
 * 1) Force Contact/Login (and other standalone) pages visible (SPA leaves .page at opacity:0)
 * 2) Hard-navigate Contact/Login clicks so full HTML loads
 * 3) Rebuild Login into a professional portal page
 * 4) Polish Contact (remove Wiki CTA)
 */
import fs from "fs";
import path from "path";

const EMAIL = "steven.miller@elitechnexus.com";
const PHONE = "+1 (339) 365-7217";
const PHONE_TEL = "+13393657217";

const VISIBLE_CSS = `<style id="elitechnexus-standalone-page-css">
/* Standalone pages are not in SPA pageList — force them visible */
#contact.page,
#login.page,
#about.page,
#careers.page,
#blog.page,
#docs.page,
#deepwiki.page{
  opacity: 1 !important;
  visibility: visible !important;
  pointer-events: auto !important;
  display: block !important;
  position: relative !important;
  z-index: 2 !important;
  min-height: 70vh;
}
#viewport-wrapper,
#pages-container{
  min-height: 70vh;
}
</style>`;

const FULLNAV = `<script id="elitechnexus-fullnav-fix">
(function () {
  var FULL = { contact: 1, login: 1, about: 1, careers: 1, blog: 1, docs: 1, deepwiki: 1 };
  function pathOf(href) {
    try {
      var u = new URL(href, window.location.origin);
      if (u.origin !== window.location.origin) return null;
      return u.pathname.replace(/^\\/|\\/$/g, "");
    } catch (e) { return null; }
  }
  document.addEventListener("click", function (e) {
    if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
    var a = e.target && e.target.closest ? e.target.closest("a") : null;
    if (!a) return;
    var href = a.getAttribute("href");
    if (!href || href.indexOf("mailto:") === 0 || href.indexOf("tel:") === 0) return;
    var p = pathOf(a.href);
    if (!p || !FULL[p]) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    window.location.assign(a.href);
  }, true);
})();
</script>`;

const LOGIN_CSS = `<style id="elitechnexus-login-css">
.elite-login{
  --el-text:#e8f0f8;
  --el-muted:#9bb0c4;
  --el-accent:#5eead4;
  --el-accent-2:#38bdf8;
  --el-panel:rgba(16,28,48,.92);
  --el-line:rgba(120,150,180,.22);
  --el-input:rgba(8,16,30,.75);
  --el-focus:rgba(94,234,212,.45);
  padding:clamp(5rem,10vw,7.5rem) 0 clamp(3.5rem,7vw,5.5rem);
  color:var(--el-text);
  position:relative;
}
.elite-login::before{
  content:"";
  position:absolute;inset:0;pointer-events:none;z-index:0;
  background:
    radial-gradient(ellipse 65% 45% at 12% 10%, rgba(56,189,248,.12), transparent 55%),
    radial-gradient(ellipse 50% 40% at 90% 20%, rgba(94,234,212,.08), transparent 50%);
}
.elite-login > .o-container{position:relative;z-index:1;}
.elite-login__caption{
  font-size:clamp(.72rem,1vw,.85rem);
  letter-spacing:.12em;text-transform:uppercase;color:#7b92a8;margin:0 0 .7rem;
}
.elite-login__title{
  font-size:clamp(2.2rem,5vw,3.3rem);line-height:1.08;font-weight:600;color:#f2f6fb;margin:0 0 .85rem;
}
.elite-login__lead{
  font-size:clamp(1.02rem,1.5vw,1.18rem);line-height:1.55;color:var(--el-muted);max-width:48ch;margin:0 0 2.4rem;
}
.elite-login__layout{
  display:grid;
  grid-template-columns:minmax(0,1.1fr) minmax(280px,.9fr);
  gap:clamp(1.4rem,3vw,2.25rem);
  align-items:start;
}
.elite-login__card{
  background:var(--el-panel);
  border:1px solid var(--el-line);
  border-radius:1.15rem;
  padding:clamp(1.4rem,2.5vw,2rem);
  backdrop-filter:blur(8px);
}
.elite-login__card-title{
  margin:0 0 1.25rem;font-size:clamp(1.25rem,2vw,1.55rem);color:#f5f8fc;font-weight:600;
}
.elite-login__form{display:grid;gap:1rem;}
.elite-login__field{display:flex;flex-direction:column;gap:.4rem;}
.elite-login__label{font-size:.82rem;font-weight:550;color:#c5d4e4;}
.elite-login__label span{color:var(--el-accent);margin-left:.15rem;}
.elite-login__input{
  width:100%;box-sizing:border-box;
  border:1px solid rgba(130,160,190,.28);
  background:var(--el-input);color:var(--el-text);
  border-radius:.7rem;padding:.78rem .95rem;font:inherit;font-size:.95rem;outline:none;
  transition:border-color .18s ease, box-shadow .18s ease;
}
.elite-login__input::placeholder{color:#6f8499;}
.elite-login__input:focus{
  border-color:var(--el-accent);box-shadow:0 0 0 3px var(--el-focus);
}
.elite-login__row{
  display:flex;align-items:center;justify-content:space-between;gap:1rem;flex-wrap:wrap;
}
.elite-login__check{
  display:inline-flex;align-items:center;gap:.5rem;color:var(--el-muted);font-size:.88rem;cursor:pointer;
}
.elite-login__check input{accent-color:#38bdf8;}
.elite-login__link{color:var(--el-accent);text-decoration:none;font-size:.88rem;}
.elite-login__link:hover{text-decoration:underline;}
.elite-login__submit{
  margin-top:.25rem;border:0;cursor:pointer;
  display:inline-flex;align-items:center;justify-content:center;
  padding:.95rem 1.55rem;border-radius:.75rem;font:inherit;font-weight:650;font-size:.98rem;
  color:#07131f;
  background:linear-gradient(135deg,#5eead4 0%,#38bdf8 55%,#60a5fa 100%);
  box-shadow:0 8px 28px rgba(56,189,248,.22);
  transition:transform .18s ease, filter .18s ease;
}
.elite-login__submit:hover{transform:translateY(-1px);filter:brightness(1.05);}
.elite-login__note{margin:.4rem 0 0;font-size:.8rem;color:#7b92a8;}
.elite-login__aside{
  background:linear-gradient(160deg,#15233a 0%,#0f1a2c 100%);
  border:1px solid rgba(94,234,212,.18);
  border-radius:1.15rem;
  padding:clamp(1.35rem,2.2vw,1.75rem);
  position:relative;overflow:hidden;
}
.elite-login__aside::after{
  content:"";position:absolute;right:-20%;top:-30%;width:60%;height:70%;
  background:radial-gradient(circle,rgba(56,189,248,.16),transparent 65%);pointer-events:none;
}
.elite-login__aside-title{margin:0 0 .55rem;font-size:1.3rem;color:#f5f8fc;position:relative;}
.elite-login__aside-lead{margin:0 0 1.25rem;color:var(--el-muted);line-height:1.5;position:relative;}
.elite-login__list{list-style:none;margin:0;padding:0;display:grid;gap:.85rem;position:relative;}
.elite-login__list li{
  display:grid;grid-template-columns:auto 1fr;gap:.75rem;align-items:start;
}
.elite-login__bullet{
  width:2.1rem;height:2.1rem;border-radius:.55rem;display:grid;place-items:center;
  background:rgba(94,234,212,.12);border:1px solid rgba(94,234,212,.22);color:var(--el-accent);flex-shrink:0;
  font-size:.75rem;font-weight:700;
}
.elite-login__list h3{margin:0 0 .15rem;font-size:.95rem;color:#f2f6fb;}
.elite-login__list p{margin:0;font-size:.88rem;color:var(--el-muted);line-height:1.4;}
.elite-login__footer-links{margin-top:1.35rem;display:flex;flex-wrap:wrap;gap:.75rem;position:relative;}
.elite-login__footer-links a{
  display:inline-flex;align-items:center;justify-content:center;
  padding:.75rem 1.15rem;border-radius:.7rem;text-decoration:none;font-weight:600;font-size:.9rem;
}
.elite-login__btn-primary{color:#07131f;background:linear-gradient(135deg,#5eead4,#38bdf8);}
.elite-login__btn-ghost{color:#d7e3ef;border:1px solid rgba(215,227,239,.3);}
@media (max-width:900px){
  .elite-login__layout{grid-template-columns:1fr;}
  .elite-login__submit{width:100%;}
}
</style>`;

const LOGIN_BODY = `<div id="login" class="page">
  <section class="elite-login o-section">
    <div class="o-container">
      <h5 class="elite-login__caption">Login</h5>
      <h1 class="elite-login__title">Portal <span class="o-text-gradient">access</span></h1>
      <p class="elite-login__lead">Sign in to the Elitechnexus client and talent portal — or request access and we'll set you up.</p>

      <div class="elite-login__layout">
        <div class="elite-login__card">
          <h2 class="elite-login__card-title">Sign in</h2>
          <form class="elite-login__form" id="elite-login-form" novalidate>
            <label class="elite-login__field">
              <span class="elite-login__label">Email <span>*</span></span>
              <input class="elite-login__input" type="email" name="email" placeholder="you@company.com" required autocomplete="username">
            </label>
            <label class="elite-login__field">
              <span class="elite-login__label">Password <span>*</span></span>
              <input class="elite-login__input" type="password" name="password" placeholder="Enter your password" required autocomplete="current-password">
            </label>
            <div class="elite-login__row">
              <label class="elite-login__check"><input type="checkbox" name="remember"> Remember me</label>
              <a class="elite-login__link" href="mailto:${EMAIL}?subject=Password%20reset%20request">Forgot password?</a>
            </div>
            <button class="elite-login__submit" type="submit">Sign in</button>
            <p class="elite-login__note">Portal access is invite-only. Need an account? Request access and our team will follow up.</p>
          </form>
        </div>

        <aside class="elite-login__aside">
          <h2 class="elite-login__aside-title">What you get</h2>
          <p class="elite-login__aside-lead">One place for clients and talent to move from proof to placement.</p>
          <ul class="elite-login__list">
            <li>
              <div class="elite-login__bullet">01</div>
              <div>
                <h3>Clients</h3>
                <p>Track candidates, interviews, and project teams in one place.</p>
              </div>
            </li>
            <li>
              <div class="elite-login__bullet">02</div>
              <div>
                <h3>Talent</h3>
                <p>See prep status, interviews, and active opportunities.</p>
              </div>
            </li>
            <li>
              <div class="elite-login__bullet">03</div>
              <div>
                <h3>Secure by default</h3>
                <p>Access is provisioned by Elitechnexus — no public self-serve signup.</p>
              </div>
            </li>
          </ul>
          <div class="elite-login__footer-links">
            <a class="elite-login__btn-primary" href="mailto:${EMAIL}?subject=Portal%20access%20request">Request access</a>
            <a class="elite-login__btn-ghost" href="/contact">Contact us</a>
          </div>
        </aside>
      </div>
    </div>
  </section>
  <script>
  (function () {
    var form = document.getElementById("elite-login-form");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var email = (new FormData(form).get("email") || "").toString();
      var subject = encodeURIComponent("Portal sign-in / access — " + email);
      var body = encodeURIComponent(
        "Please help me access the Elitechnexus portal.\\n\\nEmail: " + email + "\\n\\n(Submitted from the Login page.)"
      );
      window.location.href = "mailto:${EMAIL}?subject=" + subject + "&body=" + body;
    });
  })();
  </script>
</div>`;

function walk(d, a = []) {
  for (const n of fs.readdirSync(d)) {
    if (n === "visual-3d" || n === "node_modules") continue;
    const f = path.join(d, n);
    if (fs.statSync(f).isDirectory()) walk(f, a);
    else if (n.endsWith(".html")) a.push(f);
  }
  return a;
}

function injectOrReplace(html, id, block, tag = "style") {
  const re = new RegExp(`<${tag} id="${id}">[\\s\\S]*?<\\/${tag}>`);
  if (re.test(html)) return html.replace(re, block);
  return html.replace("</head>", block + "</head>");
}

function patchLogin(html) {
  let h = html;
  h = injectOrReplace(h, "elitechnexus-login-css", LOGIN_CSS);
  const start = h.indexOf('<div id="login"');
  const footer = h.indexOf('<div id="site-footer"', start);
  if (start < 0 || footer < 0) throw new Error("login bounds missing");
  return h.slice(0, start) + LOGIN_BODY + " " + h.slice(footer);
}

function patchContact(html) {
  // Remove Wiki CTA if still present
  return html
    .replace(/<a class="elite-contact__cta-ghost" href="\/deepwiki">Wiki<\/a>/g, "")
    .replace(
      /<a class="elite-contact__cta-ghost" href="\/deepwiki">[\s\S]*?<\/a>/g,
      ""
    );
}

function stripTargetBlankLogin(html) {
  return html.replace(
    /(<a id="site-header__button-transparent"[^>]*?)(\s+target="_blank")/g,
    "$1"
  );
}

let n = 0;
for (const f of walk("public")) {
  let h = fs.readFileSync(f, "utf8");
  const before = h;

  h = injectOrReplace(h, "elitechnexus-standalone-page-css", VISIBLE_CSS);
  h = injectOrReplace(h, "elitechnexus-fullnav-fix", FULLNAV, "script");
  h = stripTargetBlankLogin(h);

  const norm = f.replace(/\\/g, "/");
  if (norm.endsWith("/login/index.html") || norm.endsWith("\\login\\index.html") || norm.endsWith("public/login/index.html")) {
    h = patchLogin(h);
  }
  if (norm.includes("/contact/") || norm.endsWith("contact/index.html")) {
    h = patchContact(h);
  }

  if (h !== before) {
    fs.writeFileSync(f, h);
    n++;
    console.log("updated", f);
  }
}
console.log("done", n);

// verify
const login = fs.readFileSync("public/login/index.html", "utf8");
const contact = fs.readFileSync("public/contact/index.html", "utf8");
console.log({
  loginForm: login.includes("elite-login-form"),
  loginVisibleCss: login.includes("elitechnexus-standalone-page-css"),
  contactStrip: contact.includes("elite-contact__strip"),
  contactVisibleCss: contact.includes("#contact.page"),
  contactNoWiki: !contact.includes('href="/deepwiki">Wiki'),
  hardNav: login.includes("location.assign"),
});
