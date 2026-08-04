/**
 * Replace /login with a standalone Sign up / Log in page (no SPA/WebGL).
 * Fixes blank white screen caused by:
 * 1) history.replaceState("#/register") + <base href="/"> → /#/register
 * 2) SPA hiding .page / leaving preloader up for unknown routes
 */
import fs from "fs";

const EMAIL = "steven.miller@elitechnexus.com";
const PHONE = "+1 (339) 365-7217";

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Sign up | Elitechnexus</title>
<meta name="description" content="Sign up or log in to the Elitechnexus portal — global engineering talent and US teams.">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<style>
  @import url("https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@600;700&display=swap");

  :root {
    --bg0: #0a1320;
    --bg1: #122036;
    --card: #f7fafc;
    --ink: #0f1a2c;
    --muted: #5b6b7c;
    --line: #d5dee8;
    --accent: #0d9488;
    --accent-2: #0284c7;
    --teal: #5eead4;
  }

  * { box-sizing: border-box; }
  html, body {
    margin: 0;
    min-height: 100%;
    font-family: "DM Sans", system-ui, sans-serif;
    color: var(--ink);
    background:
      radial-gradient(ellipse 70% 55% at 12% 8%, rgba(45,212,191,.2), transparent 55%),
      radial-gradient(ellipse 55% 45% at 92% 0%, rgba(56,189,248,.16), transparent 50%),
      linear-gradient(165deg, var(--bg0), var(--bg1) 55%, #08101a);
  }
  a { color: inherit; }

  .top {
    position: fixed;
    inset: 0 0 auto 0;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.25rem;
    backdrop-filter: blur(10px);
    background: rgba(8,16,30,.35);
    border-bottom: 1px solid rgba(255,255,255,.06);
  }
  .top__brand {
    display: inline-flex;
    align-items: center;
    gap: .65rem;
    text-decoration: none;
    color: #e8f0f8;
    font-family: Syne, sans-serif;
    font-weight: 700;
    font-size: 1.05rem;
  }
  .top__brand img { width: 2.1rem; height: 2.1rem; }
  .top__links {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  .top__links a {
    text-decoration: none;
    color: #c5d4e4;
    font-size: .92rem;
    font-weight: 600;
  }
  .top__links a:hover { color: var(--teal); }

  .auth {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 5.5rem 1.15rem 2.5rem;
  }
  .shell { width: min(100%, 28.5rem); }

  .brand {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: .75rem;
    margin-bottom: 1.25rem;
    text-align: center;
  }
  .brand img {
    width: 3.35rem;
    height: 3.35rem;
    filter: drop-shadow(0 8px 20px rgba(56,189,248,.28));
  }
  .brand span {
    color: #e8f0f8;
    font-family: Syne, sans-serif;
    font-weight: 700;
    letter-spacing: .02em;
  }

  .card {
    background: var(--card);
    border-radius: 1.35rem;
    padding: clamp(1.45rem, 4vw, 2rem) clamp(1.2rem, 3.5vw, 1.75rem) 1.45rem;
    box-shadow: 0 24px 60px rgba(0,0,0,.38), 0 0 0 1px rgba(255,255,255,.06);
  }

  .tabs {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: .35rem;
    padding: .3rem;
    background: #e8eef4;
    border-radius: 999px;
    margin-bottom: 1.3rem;
  }
  .tab {
    border: 0;
    background: transparent;
    color: var(--muted);
    font: inherit;
    font-weight: 650;
    font-size: .92rem;
    padding: .7rem .85rem;
    border-radius: 999px;
    cursor: pointer;
  }
  .tab.is-active {
    background: #fff;
    color: var(--ink);
    box-shadow: 0 2px 8px rgba(15,26,44,.08);
  }

  h1 {
    margin: 0 0 .35rem;
    text-align: center;
    font-family: Syne, sans-serif;
    font-size: clamp(1.55rem, 4vw, 1.85rem);
    line-height: 1.15;
  }
  .sub {
    margin: 0 0 1.3rem;
    text-align: center;
    color: var(--muted);
    font-size: .95rem;
    line-height: 1.45;
  }

  form { display: grid; gap: .85rem; }
  label { display: grid; gap: .35rem; }
  .label {
    font-size: .78rem;
    font-weight: 700;
    color: #334155;
    letter-spacing: .02em;
  }
  input[type="email"],
  input[type="text"],
  input[type="password"] {
    width: 100%;
    border: 1.5px solid var(--line);
    background: #fff;
    color: var(--ink);
    border-radius: .85rem;
    padding: .95rem 1rem;
    font: inherit;
    font-size: .98rem;
    outline: none;
  }
  input:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(13,148,136,.18);
  }
  input::placeholder { color: #94a3b8; }

  .row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: .75rem;
    flex-wrap: wrap;
  }
  .check {
    display: inline-flex;
    align-items: center;
    gap: .45rem;
    font-size: .85rem;
    color: var(--muted);
    cursor: pointer;
  }
  .check input { accent-color: var(--accent); }
  .link {
    color: var(--accent-2);
    text-decoration: none;
    font-size: .85rem;
    font-weight: 650;
  }
  .link:hover { text-decoration: underline; }

  .submit {
    margin-top: .25rem;
    width: 100%;
    border: 0;
    cursor: pointer;
    border-radius: 999px;
    padding: 1rem 1.25rem;
    font: inherit;
    font-size: 1rem;
    font-weight: 750;
    color: #f5fafc;
    background: linear-gradient(135deg, #0f1a2c, #16324f);
    box-shadow: 0 10px 24px rgba(15,26,44,.22);
  }
  .submit:hover { filter: brightness(1.06); }

  .divider {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    gap: .75rem;
    margin: 1.1rem 0;
    color: #94a3b8;
    font-size: .75rem;
    font-weight: 700;
    letter-spacing: .08em;
  }
  .divider::before,
  .divider::after {
    content: "";
    height: 1px;
    background: var(--line);
  }

  .alt { display: grid; gap: .65rem; }
  .alt a {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: .55rem;
    width: 100%;
    border: 1.5px solid var(--line);
    background: #fff;
    color: var(--ink);
    border-radius: 999px;
    padding: .9rem 1rem;
    font-size: .95rem;
    font-weight: 650;
    text-decoration: none;
  }
  .alt a:hover {
    background: #f1f5f9;
    border-color: #cbd5e1;
  }

  .legal {
    margin: 1.1rem 0 0;
    text-align: center;
    font-size: .75rem;
    line-height: 1.45;
    color: #7b8a9a;
  }
  .legal a {
    color: var(--accent-2);
    font-weight: 650;
    text-decoration: none;
  }
  .legal a:hover { text-decoration: underline; }

  .switch {
    margin: 1.15rem 0 0;
    text-align: center;
    color: #c5d4e4;
    font-size: .92rem;
  }
  .switch button {
    border: 0;
    background: none;
    color: var(--teal);
    font: inherit;
    font-weight: 750;
    cursor: pointer;
    padding: 0;
  }
  .switch button:hover { text-decoration: underline; }

  [hidden] { display: none !important; }

  .toast {
    position: fixed;
    left: 50%;
    bottom: 1.25rem;
    transform: translateX(-50%);
    background: #122036;
    color: #e8f0f8;
    border: 1px solid rgba(94,234,212,.3);
    border-radius: .85rem;
    padding: .85rem 1.1rem;
    font-size: .9rem;
    max-width: min(92vw, 26rem);
    text-align: center;
    box-shadow: 0 12px 30px rgba(0,0,0,.35);
    z-index: 20;
  }
</style>
</head>
<body>
  <header class="top">
    <a class="top__brand" href="/">
      <img src="/assets/images/elitechnexus-logo.svg?v=14" alt="">
      Elitechnexus
    </a>
    <div class="top__links">
      <a href="/contact">Contact</a>
      <a href="/">Home</a>
    </div>
  </header>

  <main class="auth">
    <div class="shell">
      <div class="brand">
        <img src="/assets/images/elitechnexus-logo.svg?v=14" alt="Elitechnexus">
        <span>Elitechnexus</span>
      </div>

      <div class="card">
        <div class="tabs" role="tablist">
          <button type="button" class="tab is-active" data-mode="signup" role="tab" aria-selected="true">Sign up</button>
          <button type="button" class="tab" data-mode="login" role="tab" aria-selected="false">Log in</button>
        </div>

        <div data-panel="signup">
          <h1>Join Elitechnexus</h1>
          <p class="sub">Create your portal account to connect with global engineering talent and US teams.</p>
          <form id="signup-form" novalidate>
            <label>
              <span class="label">Email</span>
              <input type="email" name="email" placeholder="Email" required autocomplete="email">
            </label>
            <label>
              <span class="label">Username</span>
              <input type="text" name="username" placeholder="Username" required autocomplete="username" minlength="3">
            </label>
            <label>
              <span class="label">Password</span>
              <input type="password" name="password" placeholder="Password" required autocomplete="new-password" minlength="8">
            </label>
            <button class="submit" type="submit">Sign up with email</button>
          </form>
        </div>

        <div data-panel="login" hidden>
          <h1>Welcome back</h1>
          <p class="sub">Log in to your Elitechnexus client or talent portal.</p>
          <form id="login-form" novalidate>
            <label>
              <span class="label">Email</span>
              <input type="email" name="email" placeholder="Email" required autocomplete="username">
            </label>
            <label>
              <span class="label">Password</span>
              <input type="password" name="password" placeholder="Password" required autocomplete="current-password">
            </label>
            <div class="row">
              <label class="check"><input type="checkbox" name="remember"> Remember me</label>
              <a class="link" href="mailto:${EMAIL}?subject=Password%20reset%20request">Forgot password?</a>
            </div>
            <button class="submit" type="submit">Continue</button>
          </form>
        </div>

        <div class="divider">OR</div>
        <div class="alt">
          <a href="mailto:${EMAIL}?subject=Portal%20access%20request">Continue with email request</a>
          <a href="/contact">Contact Elitechnexus</a>
        </div>
        <p class="legal">
          By continuing, you agree to work with Elitechnexus LLC (Philippines).
          Questions? <a href="mailto:${EMAIL}">${EMAIL}</a> · <a href="tel:+13393657217">${PHONE}</a>
        </p>
      </div>

      <p class="switch">
        <span data-switch-signup>Already have an account? <button type="button" data-goto="login">Log in</button></span>
        <span data-switch-login hidden>New here? <button type="button" data-goto="signup">Sign up</button></span>
      </p>
    </div>
  </main>

  <script>
  (function () {
    var EMAIL = ${JSON.stringify(EMAIL)};
    var root = document.querySelector(".auth");

    function setMode(mode) {
      var signup = mode === "signup";
      document.querySelectorAll(".tab").forEach(function (tab) {
        var on = tab.getAttribute("data-mode") === mode;
        tab.classList.toggle("is-active", on);
        tab.setAttribute("aria-selected", on ? "true" : "false");
      });
      document.querySelectorAll("[data-panel]").forEach(function (panel) {
        panel.hidden = panel.getAttribute("data-panel") !== mode;
      });
      var swSign = document.querySelector("[data-switch-signup]");
      var swLog = document.querySelector("[data-switch-login]");
      if (swSign) swSign.hidden = !signup;
      if (swLog) swLog.hidden = signup;
      // IMPORTANT: use absolute path so <base> cannot rewrite to /#/register
      try {
        history.replaceState(null, "", "/login" + (signup ? "#register" : "#login"));
      } catch (e) {}
    }

    document.querySelectorAll(".tab").forEach(function (tab) {
      tab.addEventListener("click", function () {
        setMode(tab.getAttribute("data-mode") || "signup");
      });
    });
    document.querySelectorAll("[data-goto]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        setMode(btn.getAttribute("data-goto") || "signup");
      });
    });

    var hash = (location.hash || "").toLowerCase();
    setMode(hash.indexOf("login") >= 0 ? "login" : "signup");

    function toast(msg) {
      var el = document.createElement("div");
      el.className = "toast";
      el.textContent = msg;
      document.body.appendChild(el);
      setTimeout(function () { el.remove(); }, 4200);
    }

    function bind(kind, form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        if (!form.checkValidity()) { form.reportValidity(); return; }
        var fd = new FormData(form);
        var email = String(fd.get("email") || "");
        var username = String(fd.get("username") || "");
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
        toast("Opening your email app to finish " + (kind === "signup" ? "sign up" : "log in") + "…");
      });
    }

    bind("signup", document.getElementById("signup-form"));
    bind("login", document.getElementById("login-form"));
  })();
  </script>
</body>
</html>
`;

// Fix the join newline in written file: template has \\n → \n in output JS which is correct
fs.writeFileSync("public/login/index.html", html);
console.log("standalone login written", {
  bytes: html.length,
  hasJoin: html.includes("Join Elitechnexus"),
  noSpa: !html.includes("hoisted"),
  absPath: html.includes('"/login"'),
});
