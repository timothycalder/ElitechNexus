/**
 * Rebuild /login as a Linktree-style Sign up / Log in auth screen
 * (inspired by https://linktr.ee/universal-login#/register)
 * Branded for Elitechnexus — not a Linktree clone of colors/copy.
 */
import fs from "fs";

const EMAIL = "steven.miller@elitechnexus.com";

const LOGIN_CSS = `<style id="elitechnexus-login-css">
/* Linktree-style centered auth — Elitechnexus brand */
#login.page{
  opacity: 1 !important;
  visibility: visible !important;
  min-height: 100vh;
}
#login ~ #site-footer,
#login + #site-footer{
  display: none !important;
}
body:has(#login.page) #site-footer{
  display: none !important;
}
body:has(#login.page) #scroll-indicator{
  display: none !important;
}
.elite-auth{
  --ea-bg0:#0b1524;
  --ea-bg1:#122036;
  --ea-card:#f7fafc;
  --ea-ink:#0f1a2c;
  --ea-muted:#5b6b7c;
  --ea-line:#d5dee8;
  --ea-input:#ffffff;
  --ea-accent:#0d9488;
  --ea-accent-2:#0284c7;
  --ea-btn:#0f1a2c;
  --ea-btn-text:#f5fafc;
  min-height: calc(100vh - 5rem);
  padding: clamp(5.5rem, 12vw, 7.5rem) 1.25rem 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  color: var(--ea-ink);
  background:
    radial-gradient(ellipse 70% 55% at 15% 10%, rgba(45,212,191,.18), transparent 55%),
    radial-gradient(ellipse 60% 50% at 90% 0%, rgba(56,189,248,.14), transparent 50%),
    linear-gradient(165deg, var(--ea-bg0) 0%, var(--ea-bg1) 55%, #0a1320 100%);
}
.elite-auth__shell{
  width: min(100%, 28.5rem);
  position: relative;
  z-index: 1;
}
.elite-auth__brand{
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: .85rem;
  margin-bottom: 1.35rem;
  text-align: center;
}
.elite-auth__logo{
  width: 3.25rem;
  height: 3.25rem;
  border-radius: .9rem;
  object-fit: contain;
  filter: drop-shadow(0 8px 20px rgba(56,189,248,.25));
}
.elite-auth__brand-name{
  margin: 0;
  font-size: 1.05rem;
  font-weight: 650;
  letter-spacing: .02em;
  color: #e8f0f8;
}
.elite-auth__card{
  background: var(--ea-card);
  border-radius: 1.35rem;
  padding: clamp(1.5rem, 4vw, 2rem) clamp(1.25rem, 3.5vw, 1.75rem) 1.5rem;
  box-shadow:
    0 24px 60px rgba(0,0,0,.35),
    0 0 0 1px rgba(255,255,255,.06);
}
.elite-auth__tabs{
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: .35rem;
  padding: .3rem;
  background: #e8eef4;
  border-radius: 999px;
  margin-bottom: 1.35rem;
}
.elite-auth__tab{
  border: 0;
  background: transparent;
  color: var(--ea-muted);
  font: inherit;
  font-weight: 600;
  font-size: .92rem;
  padding: .7rem .85rem;
  border-radius: 999px;
  cursor: pointer;
  transition: background .18s ease, color .18s ease, box-shadow .18s ease;
}
.elite-auth__tab.is-active{
  background: #fff;
  color: var(--ea-ink);
  box-shadow: 0 2px 8px rgba(15,26,44,.08);
}
.elite-auth__title{
  margin: 0 0 .35rem;
  font-size: clamp(1.55rem, 4vw, 1.85rem);
  line-height: 1.15;
  font-weight: 700;
  color: var(--ea-ink);
  text-align: center;
}
.elite-auth__subtitle{
  margin: 0 0 1.35rem;
  text-align: center;
  color: var(--ea-muted);
  font-size: .95rem;
  line-height: 1.45;
}
.elite-auth__form{
  display: grid;
  gap: .85rem;
}
.elite-auth__field{ display: grid; gap: .35rem; }
.elite-auth__label{
  font-size: .78rem;
  font-weight: 650;
  color: #334155;
  letter-spacing: .02em;
}
.elite-auth__input{
  width: 100%;
  box-sizing: border-box;
  border: 1.5px solid var(--ea-line);
  background: var(--ea-input);
  color: var(--ea-ink);
  border-radius: .85rem;
  padding: .95rem 1rem;
  font: inherit;
  font-size: .98rem;
  outline: none;
  transition: border-color .15s ease, box-shadow .15s ease;
}
.elite-auth__input::placeholder{ color: #94a3b8; }
.elite-auth__input:focus{
  border-color: var(--ea-accent);
  box-shadow: 0 0 0 3px rgba(13,148,136,.18);
}
.elite-auth__row{
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: .75rem;
  flex-wrap: wrap;
  margin-top: -.15rem;
}
.elite-auth__check{
  display: inline-flex;
  align-items: center;
  gap: .45rem;
  font-size: .85rem;
  color: var(--ea-muted);
  cursor: pointer;
}
.elite-auth__check input{ accent-color: var(--ea-accent); }
.elite-auth__link{
  color: var(--ea-accent-2);
  text-decoration: none;
  font-size: .85rem;
  font-weight: 600;
}
.elite-auth__link:hover{ text-decoration: underline; }
.elite-auth__submit{
  margin-top: .35rem;
  width: 100%;
  border: 0;
  cursor: pointer;
  border-radius: 999px;
  padding: 1rem 1.25rem;
  font: inherit;
  font-size: 1rem;
  font-weight: 700;
  color: var(--ea-btn-text);
  background: linear-gradient(135deg, #0f1a2c 0%, #16324f 100%);
  box-shadow: 0 10px 24px rgba(15,26,44,.22);
  transition: transform .15s ease, filter .15s ease;
}
.elite-auth__submit:hover{
  transform: translateY(-1px);
  filter: brightness(1.06);
}
.elite-auth__divider{
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: .75rem;
  margin: 1.1rem 0;
  color: #94a3b8;
  font-size: .78rem;
  font-weight: 650;
  letter-spacing: .08em;
  text-transform: uppercase;
}
.elite-auth__divider::before,
.elite-auth__divider::after{
  content: "";
  height: 1px;
  background: var(--ea-line);
}
.elite-auth__alt{
  display: grid;
  gap: .65rem;
}
.elite-auth__alt-btn{
  display: flex;
  align-items: center;
  justify-content: center;
  gap: .55rem;
  width: 100%;
  box-sizing: border-box;
  border: 1.5px solid var(--ea-line);
  background: #fff;
  color: var(--ea-ink);
  border-radius: 999px;
  padding: .9rem 1rem;
  font: inherit;
  font-size: .95rem;
  font-weight: 650;
  text-decoration: none;
  cursor: pointer;
  transition: background .15s ease, border-color .15s ease;
}
.elite-auth__alt-btn:hover{
  background: #f1f5f9;
  border-color: #cbd5e1;
}
.elite-auth__alt-btn svg{
  width: 1.15rem;
  height: 1.15rem;
  flex-shrink: 0;
}
.elite-auth__legal{
  margin: 1.1rem 0 0;
  text-align: center;
  font-size: .75rem;
  line-height: 1.45;
  color: #7b8a9a;
}
.elite-auth__legal a{
  color: var(--ea-accent-2);
  text-decoration: none;
  font-weight: 600;
}
.elite-auth__legal a:hover{ text-decoration: underline; }
.elite-auth__switch{
  margin: 1.15rem 0 0;
  text-align: center;
  color: #c5d4e4;
  font-size: .92rem;
}
.elite-auth__switch button{
  border: 0;
  background: none;
  color: #5eead4;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
  padding: 0;
}
.elite-auth__switch button:hover{ text-decoration: underline; }
.elite-auth__panel[hidden]{ display: none !important; }
@media (max-width: 480px){
  .elite-auth{ padding-top: 5rem; }
  .elite-auth__card{ border-radius: 1.1rem; }
}
</style>`;

const LOGIN_BODY = `<div id="login" class="page">
  <section class="elite-auth" aria-label="Sign up or log in">
    <div class="elite-auth__shell">
      <div class="elite-auth__brand">
        <img class="elite-auth__logo" src="/assets/images/elitechnexus-logo.svg?v=14" alt="Elitechnexus">
        <p class="elite-auth__brand-name">Elitechnexus</p>
      </div>

      <div class="elite-auth__card">
        <div class="elite-auth__tabs" role="tablist" aria-label="Account">
          <button type="button" class="elite-auth__tab is-active" data-mode="signup" role="tab" aria-selected="true">Sign up</button>
          <button type="button" class="elite-auth__tab" data-mode="login" role="tab" aria-selected="false">Log in</button>
        </div>

        <div class="elite-auth__panel" data-panel="signup">
          <h1 class="elite-auth__title">Join Elitechnexus</h1>
          <p class="elite-auth__subtitle">Create your portal account to connect with global engineering talent and US teams.</p>
          <form class="elite-auth__form" id="elite-signup-form" novalidate>
            <label class="elite-auth__field">
              <span class="elite-auth__label">Email</span>
              <input class="elite-auth__input" type="email" name="email" placeholder="Email" required autocomplete="email">
            </label>
            <label class="elite-auth__field">
              <span class="elite-auth__label">Username</span>
              <input class="elite-auth__input" type="text" name="username" placeholder="Username" required autocomplete="username" minlength="3">
            </label>
            <label class="elite-auth__field">
              <span class="elite-auth__label">Password</span>
              <input class="elite-auth__input" type="password" name="password" placeholder="Password" required autocomplete="new-password" minlength="8">
            </label>
            <button class="elite-auth__submit" type="submit">Sign up with email</button>
          </form>
        </div>

        <div class="elite-auth__panel" data-panel="login" hidden>
          <h1 class="elite-auth__title">Welcome back</h1>
          <p class="elite-auth__subtitle">Log in to your Elitechnexus client or talent portal.</p>
          <form class="elite-auth__form" id="elite-login-form" novalidate>
            <label class="elite-auth__field">
              <span class="elite-auth__label">Email</span>
              <input class="elite-auth__input" type="email" name="email" placeholder="Email" required autocomplete="username">
            </label>
            <label class="elite-auth__field">
              <span class="elite-auth__label">Password</span>
              <input class="elite-auth__input" type="password" name="password" placeholder="Password" required autocomplete="current-password">
            </label>
            <div class="elite-auth__row">
              <label class="elite-auth__check"><input type="checkbox" name="remember"> Remember me</label>
              <a class="elite-auth__link" href="mailto:${EMAIL}?subject=Password%20reset%20request">Forgot password?</a>
            </div>
            <button class="elite-auth__submit" type="submit">Continue</button>
          </form>
        </div>

        <div class="elite-auth__divider">OR</div>
        <div class="elite-auth__alt">
          <a class="elite-auth__alt-btn" href="mailto:${EMAIL}?subject=Portal%20access%20request">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 6.75A2.75 2.75 0 0 1 6.75 4h10.5A2.75 2.75 0 0 1 20 6.75v10.5A2.75 2.75 0 0 1 17.25 20H6.75A2.75 2.75 0 0 1 4 17.25V6.75Zm2.2.55 5.45 3.85a.9.9 0 0 0 1.05 0L18.15 7.3a1.1 1.1 0 0 0-1-1.05H7.2c-.45 0-.85.35-.99.8Z"/></svg>
            Continue with email request
          </a>
          <a class="elite-auth__alt-btn" href="/contact">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2.5a7 7 0 0 0-7 7c0 4.6 5.2 10.3 6.4 11.5a.9.9 0 0 0 1.2 0C13.8 19.8 19 14.1 19 9.5a7 7 0 0 0-7-7Zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z"/></svg>
            Contact Elitechnexus
          </a>
        </div>
        <p class="elite-auth__legal">
          By continuing, you agree to work with Elitechnexus LLC (Philippines).
          Questions? <a href="mailto:${EMAIL}">${EMAIL}</a>
        </p>
      </div>

      <p class="elite-auth__switch">
        <span data-switch-signup>Already have an account? <button type="button" data-goto="login">Log in</button></span>
        <span data-switch-login hidden>New here? <button type="button" data-goto="signup">Sign up</button></span>
      </p>
    </div>
  </section>
  <script>
  (function () {
    var EMAIL = ${JSON.stringify(EMAIL)};
    var root = document.querySelector(".elite-auth");
    if (!root) return;

    function setMode(mode) {
      var signup = mode === "signup";
      root.querySelectorAll(".elite-auth__tab").forEach(function (tab) {
        var on = tab.getAttribute("data-mode") === mode;
        tab.classList.toggle("is-active", on);
        tab.setAttribute("aria-selected", on ? "true" : "false");
      });
      root.querySelectorAll("[data-panel]").forEach(function (panel) {
        panel.hidden = panel.getAttribute("data-panel") !== mode;
      });
      var swSign = root.querySelector("[data-switch-signup]");
      var swLog = root.querySelector("[data-switch-login]");
      if (swSign) swSign.hidden = !signup;
      if (swLog) swLog.hidden = signup;
      try {
        history.replaceState(null, "", signup ? "#/register" : "#/login");
      } catch (e) {}
    }

    root.querySelectorAll(".elite-auth__tab").forEach(function (tab) {
      tab.addEventListener("click", function () {
        setMode(tab.getAttribute("data-mode") || "signup");
      });
    });
    root.querySelectorAll("[data-goto]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        setMode(btn.getAttribute("data-goto") || "signup");
      });
    });

    // Default to Sign up (Linktree register style); honor #/login hash
    var hash = (location.hash || "").toLowerCase();
    setMode(hash.indexOf("login") >= 0 ? "login" : "signup");

    function mailSubmit(kind, form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        if (!form.checkValidity()) { form.reportValidity(); return; }
        var fd = new FormData(form);
        var email = (fd.get("email") || "").toString();
        var username = (fd.get("username") || "").toString();
        var subject = encodeURIComponent(
          kind === "signup"
            ? "Portal sign up — " + (username || email)
            : "Portal log in — " + email
        );
        var lines = kind === "signup"
          ? ["Please create my Elitechnexus portal account.", "", "Email: " + email, "Username: " + username, "", "(Submitted from /login Sign up)"]
          : ["Please help me log in to the Elitechnexus portal.", "", "Email: " + email, "", "(Submitted from /login Log in)"];
        var body = encodeURIComponent(lines.join("\\n"));
        window.location.href = "mailto:" + EMAIL + "?subject=" + subject + "&body=" + body;
      });
    }
    var signupForm = document.getElementById("elite-signup-form");
    var loginForm = document.getElementById("elite-login-form");
    if (signupForm) mailSubmit("signup", signupForm);
    if (loginForm) mailSubmit("login", loginForm);
  })();
  </script>
</div>`;

const file = "public/login/index.html";
let html = fs.readFileSync(file, "utf8");

// Replace CSS
const cssRe = /<style id="elitechnexus-login-css">[\s\S]*?<\/style>/;
if (cssRe.test(html)) html = html.replace(cssRe, LOGIN_CSS);
else html = html.replace("</head>", LOGIN_CSS + "</head>");

// Title / meta for signup feel
html = html.replace(/<title>[^<]*<\/title>/, "<title>Sign up | Elitechnexus</title>");
html = html.replace(
  /<meta name="description" content="[^"]*">/,
  `<meta name="description" content="Sign up or log in to the Elitechnexus portal — global engineering talent and US teams.">`
);

// Replace login page body
const start = html.indexOf('<div id="login"');
const footer = html.indexOf('<div id="site-footer"', start);
if (start < 0 || footer < 0) {
  console.error("bounds missing", { start, footer });
  process.exit(1);
}
html = html.slice(0, start) + LOGIN_BODY + " " + html.slice(footer);

fs.writeFileSync(file, html);
console.log("login rebuilt", {
  signup: html.includes("Join Elitechnexus"),
  tabs: html.includes('data-mode="signup"'),
  hashRegister: html.includes("#/register"),
  css: html.includes("elite-auth__card"),
});
