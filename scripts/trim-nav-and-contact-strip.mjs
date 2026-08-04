/**
 * 1) Nav: remove About us / Careers / Blog / Docs; keep Wiki + Contact + Get started
 * 2) Contact: professional Phone / Email / Address strip (Elitechnexus colors)
 */
import fs from "fs";
import path from "path";

const EMAIL = "steven.miller@elitechnexus.com";
const PHONE = "+1 (339) 365-7217";
const PHONE_TEL = "+13393657217";
const ADDRESS = "Elitechnexus LLC — Philippines";
const ADDRESS_LINE2 = "Headquarters · Global talent bridge";

function walk(d, a = []) {
  for (const n of fs.readdirSync(d)) {
    if (n === "visual-3d" || n === "node_modules") continue;
    const f = path.join(d, n);
    if (fs.statSync(f).isDirectory()) walk(f, a);
    else if (n.endsWith(".html")) a.push(f);
  }
  return a;
}

/** Remove a whole <li>...</li> that contains a given label in nav contexts */
function removeLiWithLabel(html, label) {
  // Match <li> ... label ... </li> non-greedy, including nested tags
  const re = new RegExp(
    `<li[^>]*>\\s*<a[^>]*>[\\s\\S]*?>\\s*${label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*<[\\s\\S]*?<\\/a>\\s*<\\/li>`,
    "gi"
  );
  return html.replace(re, "");
}

function trimNav(html) {
  let h = html;
  for (const label of ["About us", "Careers", "Blog", "Docs"]) {
    h = removeLiWithLabel(h, label);
  }
  // Rename DeepWiki → Wiki in visible labels
  h = h.replace(/>DeepWiki</g, ">Wiki<");
  // Also catch plain text if any
  h = h.replace(/(<span>)DeepWiki(<\/span>)/g, "$1Wiki$2");
  return h;
}

// --- Contact page rebuild ---
const ICON_PHONE = `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M7.2 3.5c.5-.5 1.3-.6 1.9-.2l2.2 1.4c.6.4.8 1.2.5 1.9l-.9 2.1a1.4 1.4 0 0 0 .3 1.5l3.1 3.1c.4.4 1 .5 1.5.3l2.1-.9c.7-.3 1.5-.1 1.9.5l1.4 2.2c.4.6.3 1.4-.2 1.9l-1.5 1.5c-.6.6-1.5.9-2.3.7-3.7-.8-7.1-3.3-9.7-6.8C4.9 10.7 3.5 7.8 3.5 4.7c-.1-.9.3-1.7.9-2.3L7.2 3.5Z"/></svg>`;
const ICON_MAIL = `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M3 6.75A2.75 2.75 0 0 1 5.75 4h12.5A2.75 2.75 0 0 1 21 6.75v10.5A2.75 2.75 0 0 1 18.25 20H5.75A2.75 2.75 0 0 1 3 17.25V6.75Zm2.1.5 6.3 4.4a1 1 0 0 0 1.2 0l6.3-4.4a1.25 1.25 0 0 0-1.15-.75H6.25c-.5 0-.95.3-1.15.75Z"/></svg>`;
const ICON_PIN = `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2.5a7 7 0 0 0-7 7c0 4.6 5.2 10.3 6.4 11.5a.9.9 0 0 0 1.2 0C13.8 19.8 19 14.1 19 9.5a7 7 0 0 0-7-7Zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z"/></svg>`;
const ICON_BOLT = `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M13 2 4.5 13.2c-.3.4 0 1 .5 1H11l-1 8 9.2-12.2c.3-.4 0-1-.5-1H13V2Z"/></svg>`;
const ICON_SHIELD = `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2.4 4.8 5.2v5.4c0 5 3.3 9.5 7.2 10.9 3.9-1.4 7.2-5.9 7.2-10.9V5.2L12 2.4Zm0 9.8 4.2-4.2 1.3 1.3L12 15 6.5 9.5l1.3-1.3L12 12.2Z"/></svg>`;
const ICON_BRIEF = `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M9 3.5h6A1.5 1.5 0 0 1 16.5 5v1.5H19A2.5 2.5 0 0 1 21.5 9v8A2.5 2.5 0 0 1 19 19.5H5A2.5 2.5 0 0 1 2.5 17V9A2.5 2.5 0 0 1 5 6.5h2.5V5A1.5 1.5 0 0 1 9 3.5Zm1.5 1.5v1h3V5h-3Z"/></svg>`;

const CONTACT_CSS = `<style id="elitechnexus-contact-css">
.elite-contact {
  --ec-text: #e8f0f8;
  --ec-muted: #9bb0c4;
  --ec-accent: #5eead4;
  --ec-accent-2: #38bdf8;
  --ec-panel: rgba(16, 28, 48, 0.92);
  --ec-line: rgba(120, 150, 180, 0.22);
  --ec-input: rgba(8, 16, 30, 0.75);
  --ec-focus: rgba(94, 234, 212, 0.45);
  padding: clamp(5rem, 10vw, 7.5rem) 0 clamp(3.5rem, 7vw, 5.5rem);
  color: var(--ec-text);
  position: relative;
}
.elite-contact::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(ellipse 70% 45% at 12% 8%, rgba(56, 189, 248, 0.11), transparent 55%),
    radial-gradient(ellipse 50% 40% at 92% 18%, rgba(94, 234, 212, 0.07), transparent 50%);
  z-index: 0;
}
.elite-contact > .o-container { position: relative; z-index: 1; }

.elite-contact__caption {
  font-size: clamp(0.72rem, 1vw, 0.85rem);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #7b92a8;
  margin: 0 0 0.7rem;
}
.elite-contact__title {
  font-size: clamp(2.2rem, 5vw, 3.4rem);
  line-height: 1.08;
  font-weight: 600;
  color: #f2f6fb;
  margin: 0 0 0.85rem;
}
.elite-contact__lead {
  font-size: clamp(1.02rem, 1.5vw, 1.18rem);
  line-height: 1.55;
  color: var(--ec-muted);
  max-width: 52ch;
  margin: 0 0 2.25rem;
}

/* Contact strip — phone / email / address */
.elite-contact__strip {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px;
  margin: 0 0 2.5rem;
  border-radius: 1.1rem;
  overflow: hidden;
  border: 1px solid rgba(94, 234, 212, 0.2);
  background:
    linear-gradient(135deg, rgba(30, 58, 95, 0.95) 0%, rgba(15, 32, 56, 0.98) 48%, rgba(18, 55, 72, 0.95) 100%);
  box-shadow: 0 18px 50px rgba(0, 12, 28, 0.35);
  position: relative;
}
.elite-contact__strip::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.35;
  background-image:
    linear-gradient(rgba(94, 234, 212, 0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(56, 189, 248, 0.05) 1px, transparent 1px);
  background-size: 28px 28px;
  mask-image: radial-gradient(ellipse 80% 70% at 50% 40%, #000 20%, transparent 75%);
}
.elite-contact__strip-item {
  position: relative;
  z-index: 1;
  padding: clamp(1.35rem, 2.5vw, 1.85rem) clamp(1.1rem, 2vw, 1.5rem);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.45rem;
}
.elite-contact__strip-item + .elite-contact__strip-item {
  border-left: 1px solid rgba(148, 180, 210, 0.18);
}
.elite-contact__strip-icon {
  width: 2.6rem;
  height: 2.6rem;
  border-radius: 0.75rem;
  display: grid;
  place-items: center;
  margin-bottom: 0.35rem;
  color: #07131f;
  background: linear-gradient(135deg, #5eead4, #38bdf8);
  box-shadow: 0 8px 22px rgba(56, 189, 248, 0.28);
}
.elite-contact__strip-icon svg { width: 1.15rem; height: 1.15rem; }
.elite-contact__strip-label {
  font-size: 1.05rem;
  font-weight: 650;
  color: #f5f8fc;
  margin: 0;
}
.elite-contact__strip-hint {
  margin: 0;
  font-size: 0.82rem;
  color: #8aa0b5;
}
.elite-contact__strip-value {
  margin: 0.35rem 0 0;
  color: #e8f0f8;
  text-decoration: none;
  font-weight: 550;
  font-size: 0.98rem;
  line-height: 1.4;
  word-break: break-word;
}
a.elite-contact__strip-value:hover { color: var(--ec-accent); }
.elite-contact__strip-sub {
  margin: 0.15rem 0 0;
  font-size: 0.8rem;
  color: #7b92a8;
}

.elite-contact__layout {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(280px, 0.85fr);
  gap: clamp(1.4rem, 3vw, 2.25rem);
  align-items: start;
}
.elite-contact__form-panel {
  background: var(--ec-panel);
  border: 1px solid var(--ec-line);
  border-radius: 1.15rem;
  padding: clamp(1.35rem, 2.4vw, 1.9rem);
  backdrop-filter: blur(8px);
}
.elite-contact__form-title {
  margin: 0 0 1.25rem;
  font-size: clamp(1.3rem, 2vw, 1.6rem);
  color: #f5f8fc;
  font-weight: 600;
}
.elite-contact__form { display: grid; gap: 1rem; }
.elite-contact__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}
.elite-contact__field { display: flex; flex-direction: column; gap: 0.4rem; }
.elite-contact__field--full { grid-column: 1 / -1; }
.elite-contact__label { font-size: 0.82rem; font-weight: 550; color: #c5d4e4; }
.elite-contact__label span { color: var(--ec-accent); margin-left: 0.15rem; }
.elite-contact__input,
.elite-contact__select,
.elite-contact__textarea {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid rgba(130, 160, 190, 0.28);
  background: var(--ec-input);
  color: var(--ec-text);
  border-radius: 0.7rem;
  padding: 0.78rem 0.95rem;
  font: inherit;
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
}
.elite-contact__textarea { min-height: 8rem; resize: vertical; line-height: 1.45; }
.elite-contact__select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%239bb0c4' d='M1 1l5 5 5-5'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.9rem center;
  padding-right: 2.2rem;
}
.elite-contact__select option { background: #122034; color: #e8f0f8; }
.elite-contact__input::placeholder,
.elite-contact__textarea::placeholder { color: #6f8499; }
.elite-contact__input:focus,
.elite-contact__select:focus,
.elite-contact__textarea:focus {
  border-color: var(--ec-accent);
  box-shadow: 0 0 0 3px var(--ec-focus);
}
.elite-contact__submit {
  margin-top: 0.25rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  cursor: pointer;
  padding: 0.95rem 1.55rem;
  border-radius: 0.75rem;
  font: inherit;
  font-weight: 650;
  font-size: 0.98rem;
  color: #07131f;
  background: linear-gradient(135deg, #5eead4 0%, #38bdf8 55%, #60a5fa 100%);
  transition: transform 0.18s ease, filter 0.18s ease;
  box-shadow: 0 8px 28px rgba(56, 189, 248, 0.22);
}
.elite-contact__submit:hover { transform: translateY(-1px); filter: brightness(1.05); }
.elite-contact__note { margin: 0.35rem 0 0; font-size: 0.8rem; color: #7b92a8; }

.elite-contact__aside { display: flex; flex-direction: column; gap: 1.1rem; }
.elite-contact__perks {
  background: rgba(18, 32, 52, 0.75);
  border: 1px solid var(--ec-line);
  border-radius: 1.15rem;
  padding: 1.2rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1.05rem;
}
.elite-contact__perk {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.8rem;
  align-items: start;
}
.elite-contact__perk-icon {
  width: 2.2rem;
  height: 2.2rem;
  border-radius: 0.6rem;
  display: grid;
  place-items: center;
  background: rgba(56, 189, 248, 0.1);
  color: var(--ec-accent-2);
}
.elite-contact__perk-icon svg { width: 1.05rem; height: 1.05rem; }
.elite-contact__perk h3 { margin: 0 0 0.2rem; font-size: 0.98rem; color: #f2f6fb; }
.elite-contact__perk p { margin: 0; color: var(--ec-muted); font-size: 0.9rem; line-height: 1.4; }

.elite-contact__cta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}
.elite-contact__cta a {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.8rem 1.25rem;
  border-radius: 0.7rem;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.92rem;
}
.elite-contact__cta-primary {
  color: #07131f;
  background: linear-gradient(135deg, #5eead4, #38bdf8);
}
.elite-contact__cta-ghost {
  color: #d7e3ef;
  border: 1px solid rgba(215, 227, 239, 0.3);
  background: transparent;
}

@media (max-width: 900px) {
  .elite-contact__strip { grid-template-columns: 1fr; }
  .elite-contact__strip-item + .elite-contact__strip-item {
    border-left: 0;
    border-top: 1px solid rgba(148, 180, 210, 0.18);
  }
  .elite-contact__layout { grid-template-columns: 1fr; }
}
@media (max-width: 640px) {
  .elite-contact__row { grid-template-columns: 1fr; }
  .elite-contact__submit { width: 100%; }
}
</style>`;

const CONTACT_BODY = `<div id="contact" class="page">
  <section class="elite-contact o-section">
    <div class="o-container">
      <h5 class="elite-contact__caption">Contact</h5>
      <h1 class="elite-contact__title">Let's <span class="o-text-gradient">talk</span></h1>
      <p class="elite-contact__lead">Reach Elitechnexus by phone, email, or message — whether you're hiring global engineering talent or exploring your next role.</p>

      <div class="elite-contact__strip" aria-label="Contact details">
        <div class="elite-contact__strip-item">
          <div class="elite-contact__strip-icon">${ICON_PHONE}</div>
          <h3 class="elite-contact__strip-label">Phone</h3>
          <p class="elite-contact__strip-hint">Contact us over phone</p>
          <a class="elite-contact__strip-value" href="tel:${PHONE_TEL}">${PHONE}</a>
        </div>
        <div class="elite-contact__strip-item">
          <div class="elite-contact__strip-icon">${ICON_MAIL}</div>
          <h3 class="elite-contact__strip-label">Email</h3>
          <p class="elite-contact__strip-hint">Contact us with email</p>
          <a class="elite-contact__strip-value" href="mailto:${EMAIL}">${EMAIL}</a>
        </div>
        <div class="elite-contact__strip-item">
          <div class="elite-contact__strip-icon">${ICON_PIN}</div>
          <h3 class="elite-contact__strip-label">Address</h3>
          <p class="elite-contact__strip-hint">Where we're based</p>
          <div class="elite-contact__strip-value">${ADDRESS}</div>
          <p class="elite-contact__strip-sub">${ADDRESS_LINE2}</p>
        </div>
      </div>

      <div class="elite-contact__layout">
        <div class="elite-contact__form-panel">
          <h2 class="elite-contact__form-title">Send us a message</h2>
          <form class="elite-contact__form" id="elite-contact-form" novalidate>
            <div class="elite-contact__row">
              <label class="elite-contact__field">
                <span class="elite-contact__label">Your Name <span>*</span></span>
                <input class="elite-contact__input" type="text" name="name" placeholder="John Doe" required autocomplete="name">
              </label>
              <label class="elite-contact__field">
                <span class="elite-contact__label">Email Address <span>*</span></span>
                <input class="elite-contact__input" type="email" name="email" placeholder="john@example.com" required autocomplete="email">
              </label>
            </div>
            <div class="elite-contact__row">
              <label class="elite-contact__field">
                <span class="elite-contact__label">Company</span>
                <input class="elite-contact__input" type="text" name="company" placeholder="Your Company" autocomplete="organization">
              </label>
              <label class="elite-contact__field">
                <span class="elite-contact__label">Phone Number</span>
                <input class="elite-contact__input" type="tel" name="phone" placeholder="+1 (555) 000-0000" autocomplete="tel">
              </label>
            </div>
            <div class="elite-contact__row">
              <label class="elite-contact__field">
                <span class="elite-contact__label">I'm interested in <span>*</span></span>
                <select class="elite-contact__select" name="interest" required>
                  <option value="" selected disabled>Select an option</option>
                  <option value="Hiring talent">Hiring talent</option>
                  <option value="Joining as talent">Joining as talent</option>
                  <option value="Enterprise partnership">Enterprise partnership</option>
                  <option value="General inquiry">General inquiry</option>
                </select>
              </label>
              <label class="elite-contact__field">
                <span class="elite-contact__label">Estimated timeline</span>
                <select class="elite-contact__select" name="timeline">
                  <option value="" selected disabled>Select timeline</option>
                  <option value="ASAP">ASAP</option>
                  <option value="1–4 weeks">1–4 weeks</option>
                  <option value="1–3 months">1–3 months</option>
                  <option value="Exploring">Just exploring</option>
                </select>
              </label>
            </div>
            <label class="elite-contact__field elite-contact__field--full">
              <span class="elite-contact__label">Project details <span>*</span></span>
              <textarea class="elite-contact__textarea" name="details" placeholder="Tell us about roles, skills, goals, and timeline..." required></textarea>
            </label>
            <button class="elite-contact__submit" type="submit">Send Message</button>
            <p class="elite-contact__note">Opens your email client to send directly to ${EMAIL}.</p>
          </form>
        </div>

        <aside class="elite-contact__aside">
          <div class="elite-contact__perks">
            <div class="elite-contact__perk">
              <div class="elite-contact__perk-icon">${ICON_BOLT}</div>
              <div>
                <h3>Quick Response</h3>
                <p>We respond within 24 hours on business days.</p>
              </div>
            </div>
            <div class="elite-contact__perk">
              <div class="elite-contact__perk-icon">${ICON_SHIELD}</div>
              <div>
                <h3>Confidential by default</h3>
                <p>Your hiring plans and candidate details stay private.</p>
              </div>
            </div>
            <div class="elite-contact__perk">
              <div class="elite-contact__perk-icon">${ICON_BRIEF}</div>
              <div>
                <h3>Free consultation</h3>
                <p>No-commitment intro call to map fit and next steps.</p>
              </div>
            </div>
          </div>
          <div class="elite-contact__cta">
            <a class="elite-contact__cta-primary" href="mailto:${EMAIL}">Get started</a>
            <a class="elite-contact__cta-ghost" href="/deepwiki">Wiki</a>
          </div>
        </aside>
      </div>
    </div>
  </section>
  <script>
  (function () {
    var form = document.getElementById("elite-contact-form");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var fd = new FormData(form);
      var lines = [
        "Name: " + (fd.get("name") || ""),
        "Email: " + (fd.get("email") || ""),
        "Company: " + (fd.get("company") || ""),
        "Phone: " + (fd.get("phone") || ""),
        "Interest: " + (fd.get("interest") || ""),
        "Timeline: " + (fd.get("timeline") || ""),
        "",
        "Details:",
        fd.get("details") || ""
      ];
      var subject = encodeURIComponent("Elitechnexus inquiry — " + (fd.get("interest") || "Contact"));
      var body = encodeURIComponent(lines.join("\\n"));
      window.location.href = "mailto:${EMAIL}?subject=" + subject + "&body=" + body;
    });
  })();
  </script>
</div>`;

function patchContact(html) {
  let h = html;
  if (h.includes('id="elitechnexus-contact-css"')) {
    h = h.replace(/<style id="elitechnexus-contact-css">[\s\S]*?<\/style>/, CONTACT_CSS);
  } else if (h.includes("</head>")) {
    h = h.replace("</head>", CONTACT_CSS + "</head>");
  }
  const start = h.indexOf('<div id="contact"');
  const footer = h.indexOf('<div id="site-footer"', start);
  if (start < 0 || footer < 0) return h;
  return h.slice(0, start) + CONTACT_BODY + " " + h.slice(footer);
}

// Update fullnav to only force-nav remaining local pages
const FULLNAV = `<script id="elitechnexus-fullnav-fix">
(function () {
  var FULL = { contact: 1, deepwiki: 1, login: 1 };
  function pathOf(href) {
    try {
      var u = new URL(href, window.location.origin);
      if (u.origin !== window.location.origin) return null;
      return u.pathname.replace(/^\\/|\\/$/g, "");
    } catch (e) { return null; }
  }
  document.addEventListener("click", function (e) {
    if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
    var a = e.target && e.target.closest ? e.target.closest("a") : null;
    if (!a) return;
    var href = a.getAttribute("href");
    if (!href || href.indexOf("mailto:") === 0 || href.indexOf("tel:") === 0) return;
    var p = pathOf(a.href);
    if (p && FULL[p]) e.stopImmediatePropagation();
  }, true);
})();
</script>`;

let navCount = 0;
let contactPatched = false;

for (const f of walk("public")) {
  let h = fs.readFileSync(f, "utf8");
  const before = h;

  h = trimNav(h);

  if (h.includes('id="elitechnexus-fullnav-fix"')) {
    h = h.replace(/<script id="elitechnexus-fullnav-fix">[\s\S]*?<\/script>/, FULLNAV);
  }

  if (f.replace(/\\/g, "/").endsWith("public/contact/index.html") || f.replace(/\\/g, "/").endsWith("contact/index.html")) {
    h = patchContact(h);
    contactPatched = true;
  }

  if (h !== before) {
    fs.writeFileSync(f, h);
    navCount++;
    console.log("updated", f);
  }
}

console.log("files updated", navCount, "contactPatched", contactPatched);
