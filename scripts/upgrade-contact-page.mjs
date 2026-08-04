/**
 * Rebuild Contact page into a professional form + sidebar layout
 * (inspired by reference contact UX; Elitechnexus dark brand).
 */
import fs from "fs";
import path from "path";

const EMAIL = "steven.miller@elitechnexus.com";
const PHONE = "+1 (339) 365-7217";
const PHONE_TEL = "+13393657217";
const CONTACT = "public/contact/index.html";

const CONTACT_CSS = `<style id="elitechnexus-contact-css">
.elite-contact {
  --ec-bg: #0b1424;
  --ec-panel: rgba(16, 28, 48, 0.92);
  --ec-panel-2: rgba(22, 38, 62, 0.95);
  --ec-line: rgba(120, 150, 180, 0.22);
  --ec-text: #e8f0f8;
  --ec-muted: #9bb0c4;
  --ec-accent: #5eead4;
  --ec-accent-2: #38bdf8;
  --ec-input: rgba(8, 16, 30, 0.75);
  --ec-focus: rgba(94, 234, 212, 0.45);
  padding: clamp(5.5rem, 11vw, 8.5rem) 0 clamp(4rem, 8vw, 6.5rem);
  color: var(--ec-text);
  position: relative;
}
.elite-contact::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(ellipse 70% 50% at 15% 10%, rgba(56, 189, 248, 0.12), transparent 55%),
    radial-gradient(ellipse 55% 45% at 90% 20%, rgba(94, 234, 212, 0.08), transparent 50%),
    linear-gradient(180deg, rgba(11, 20, 36, 0.2), transparent 40%);
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
  font-size: clamp(2.2rem, 5vw, 3.5rem);
  line-height: 1.08;
  font-weight: 600;
  color: #f2f6fb;
  margin: 0 0 0.9rem;
  max-width: 16ch;
}
.elite-contact__lead {
  font-size: clamp(1.02rem, 1.5vw, 1.2rem);
  line-height: 1.55;
  color: var(--ec-muted);
  max-width: 54ch;
  margin: 0 0 2.75rem;
}

.elite-contact__layout {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(280px, 0.85fr);
  gap: clamp(1.5rem, 3vw, 2.5rem);
  align-items: start;
}

.elite-contact__form-panel {
  background: var(--ec-panel);
  border: 1px solid var(--ec-line);
  border-radius: 1.15rem;
  padding: clamp(1.4rem, 2.5vw, 2rem);
  backdrop-filter: blur(8px);
}
.elite-contact__form-title {
  margin: 0 0 1.35rem;
  font-size: clamp(1.35rem, 2vw, 1.7rem);
  color: #f5f8fc;
  font-weight: 600;
}

.elite-contact__form {
  display: grid;
  gap: 1rem;
}
.elite-contact__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}
.elite-contact__field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.elite-contact__field--full { grid-column: 1 / -1; }
.elite-contact__label {
  font-size: 0.82rem;
  font-weight: 550;
  color: #c5d4e4;
}
.elite-contact__label span {
  color: var(--ec-accent);
  margin-left: 0.15rem;
}
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
.elite-contact__textarea {
  min-height: 8.5rem;
  resize: vertical;
  line-height: 1.45;
}
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
  margin-top: 0.35rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  border: 0;
  cursor: pointer;
  padding: 0.95rem 1.55rem;
  border-radius: 0.75rem;
  font: inherit;
  font-weight: 650;
  font-size: 0.98rem;
  color: #07131f;
  background: linear-gradient(135deg, #5eead4 0%, #38bdf8 55%, #60a5fa 100%);
  transition: transform 0.18s ease, filter 0.18s ease, box-shadow 0.18s ease;
  box-shadow: 0 8px 28px rgba(56, 189, 248, 0.22);
}
.elite-contact__submit:hover {
  transform: translateY(-1px);
  filter: brightness(1.05);
}
.elite-contact__submit:active { transform: translateY(0); }
.elite-contact__note {
  margin: 0.35rem 0 0;
  font-size: 0.8rem;
  color: #7b92a8;
}

.elite-contact__aside {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}
.elite-contact__touch {
  background: linear-gradient(160deg, #15233a 0%, #0f1a2c 100%);
  border: 1px solid rgba(94, 234, 212, 0.18);
  border-radius: 1.15rem;
  padding: clamp(1.35rem, 2.2vw, 1.75rem);
  position: relative;
  overflow: hidden;
}
.elite-contact__touch::after {
  content: "";
  position: absolute;
  right: -20%;
  top: -30%;
  width: 60%;
  height: 70%;
  background: radial-gradient(circle, rgba(56, 189, 248, 0.16), transparent 65%);
  pointer-events: none;
}
.elite-contact__touch-title {
  margin: 0 0 0.55rem;
  font-size: 1.35rem;
  color: #f5f8fc;
  position: relative;
}
.elite-contact__touch-lead {
  margin: 0 0 1.35rem;
  color: var(--ec-muted);
  line-height: 1.5;
  position: relative;
}
.elite-contact__meta {
  display: flex;
  flex-direction: column;
  gap: 1.05rem;
  position: relative;
}
.elite-contact__meta-item {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.75rem;
  align-items: start;
}
.elite-contact__icon {
  width: 2.35rem;
  height: 2.35rem;
  border-radius: 0.65rem;
  display: grid;
  place-items: center;
  background: rgba(94, 234, 212, 0.12);
  border: 1px solid rgba(94, 234, 212, 0.22);
  color: var(--ec-accent);
  flex-shrink: 0;
}
.elite-contact__icon svg { width: 1.1rem; height: 1.1rem; fill: currentColor; }
.elite-contact__meta-label {
  display: block;
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #7b92a8;
  margin-bottom: 0.2rem;
}
.elite-contact__meta-value {
  color: #e8f0f8;
  text-decoration: none;
  line-height: 1.4;
  word-break: break-word;
}
a.elite-contact__meta-value:hover { color: var(--ec-accent); }

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
.elite-contact__perk-icon svg { width: 1.05rem; height: 1.05rem; fill: currentColor; }
.elite-contact__perk h3 {
  margin: 0 0 0.2rem;
  font-size: 0.98rem;
  color: #f2f6fb;
}
.elite-contact__perk p {
  margin: 0;
  color: var(--ec-muted);
  font-size: 0.9rem;
  line-height: 1.4;
}

@media (max-width: 900px) {
  .elite-contact__layout { grid-template-columns: 1fr; }
  .elite-contact__title { max-width: none; }
}
@media (max-width: 640px) {
  .elite-contact__row { grid-template-columns: 1fr; }
  .elite-contact__submit { width: 100%; }
}
</style>`;

const ICON_MAIL = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6.75A2.75 2.75 0 0 1 5.75 4h12.5A2.75 2.75 0 0 1 21 6.75v10.5A2.75 2.75 0 0 1 18.25 20H5.75A2.75 2.75 0 0 1 3 17.25V6.75Zm2.1.5 6.3 4.4a1 1 0 0 0 1.2 0l6.3-4.4a1.25 1.25 0 0 0-1.15-.75H6.25c-.5 0-.95.3-1.15.75Z"/></svg>`;
const ICON_PIN = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5a7 7 0 0 0-7 7c0 4.6 5.2 10.3 6.4 11.5a.9.9 0 0 0 1.2 0C13.8 19.8 19 14.1 19 9.5a7 7 0 0 0-7-7Zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z"/></svg>`;
const ICON_PHONE = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.2 3.5c.5-.5 1.3-.6 1.9-.2l2.2 1.4c.6.4.8 1.2.5 1.9l-.9 2.1a1.4 1.4 0 0 0 .3 1.5l3.1 3.1c.4.4 1 .5 1.5.3l2.1-.9c.7-.3 1.5-.1 1.9.5l1.4 2.2c.4.6.3 1.4-.2 1.9l-1.5 1.5c-.6.6-1.5.9-2.3.7-3.7-.8-7.1-3.3-9.7-6.8C4.9 10.7 3.5 7.8 3.5 4.7c-.1-.9.3-1.7.9-2.3L7.2 3.5Z"/></svg>`;
const ICON_BOLT = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13 2 4.5 13.2c-.3.4 0 1 .5 1H11l-1 8 9.2-12.2c.3-.4 0-1-.5-1H13V2Z"/></svg>`;
const ICON_SHIELD = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.4 4.8 5.2v5.4c0 5 3.3 9.5 7.2 10.9 3.9-1.4 7.2-5.9 7.2-10.9V5.2L12 2.4Zm0 9.8 4.2-4.2 1.3 1.3L12 15 6.5 9.5l1.3-1.3L12 12.2Z"/></svg>`;
const ICON_BRIEF = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 3.5h6A1.5 1.5 0 0 1 16.5 5v1.5H19A2.5 2.5 0 0 1 21.5 9v8A2.5 2.5 0 0 1 19 19.5H5A2.5 2.5 0 0 1 2.5 17V9A2.5 2.5 0 0 1 5 6.5h2.5V5A1.5 1.5 0 0 1 9 3.5Zm1.5 1.5v1h3V5h-3Z"/></svg>`;

const BODY = `<div id="contact" class="page">
  <section class="elite-contact o-section">
    <div class="o-container">
      <h5 class="elite-contact__caption">Contact</h5>
      <h1 class="elite-contact__title">Let's <span class="o-text-gradient">talk</span></h1>
      <p class="elite-contact__lead">Whether you're hiring global engineering talent or looking for your next US-facing role, send a message — we'll respond with clear next steps.</p>

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
          <div class="elite-contact__touch">
            <h2 class="elite-contact__touch-title">Get in Touch</h2>
            <p class="elite-contact__touch-lead">Have a question or want to discuss a placement? We're here to help.</p>
            <div class="elite-contact__meta">
              <div class="elite-contact__meta-item">
                <div class="elite-contact__icon">${ICON_MAIL}</div>
                <div>
                  <span class="elite-contact__meta-label">Email</span>
                  <a class="elite-contact__meta-value" href="mailto:${EMAIL}">${EMAIL}</a>
                </div>
              </div>
              <div class="elite-contact__meta-item">
                <div class="elite-contact__icon">${ICON_PHONE}</div>
                <div>
                  <span class="elite-contact__meta-label">Phone</span>
                  <a class="elite-contact__meta-value" href="tel:${PHONE_TEL}">${PHONE}</a>
                </div>
              </div>
              <div class="elite-contact__meta-item">
                <div class="elite-contact__icon">${ICON_PIN}</div>
                <div>
                  <span class="elite-contact__meta-label">Headquarters</span>
                  <div class="elite-contact__meta-value">Elitechnexus LLC<br>Philippines</div>
                </div>
              </div>
            </div>
          </div>

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
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
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

function patchContactHtml(filePath) {
  let h = fs.readFileSync(filePath, "utf8");

  // Inject / replace contact CSS before </head>
  if (h.includes('id="elitechnexus-contact-css"')) {
    h = h.replace(
      /<style id="elitechnexus-contact-css">[\s\S]*?<\/style>/,
      CONTACT_CSS
    );
  } else {
    h = h.replace("</head>", CONTACT_CSS + "</head>");
  }

  // Replace contact page block
  const start = h.indexOf('<div id="contact"');
  if (start < 0) throw new Error("contact page root not found");
  const footer = h.indexOf('<div id="site-footer"', start);
  if (footer < 0) throw new Error("footer not found after contact");
  h = h.slice(0, start) + BODY + " " + h.slice(footer);

  // Title/description already ok; ensure meta mentions form
  fs.writeFileSync(filePath, h);
  console.log("updated", filePath);
}

patchContactHtml(CONTACT);

// Keep generator source in sync for contact body (simplified marker)
const gen = "scripts/create-local-nav-pages.mjs";
if (fs.existsSync(gen)) {
  let g = fs.readFileSync(gen, "utf8");
  // Mark that contact is maintained by upgrade-contact-page.mjs
  if (!g.includes("upgrade-contact-page.mjs")) {
    g = g.replace(
      /contact: \{[\s\S]*?\n  \},\n\n  docs:/,
      `contact: {\n\n    title: "Contact | Elitechnexus",\n\n    description:\n\n      "Contact Elitechnexus — Philippines HQ. Email ${EMAIL} or call ${PHONE}.",\n\n    heading: \`Let's <span class="o-text-gradient">talk</span>\`,\n\n    caption: "Contact",\n\n    // Full professional form layout is applied by scripts/upgrade-contact-page.mjs\n\n    body: \`<!-- see scripts/upgrade-contact-page.mjs -->\`,\n\n  },\n\n  docs:`
    );
    fs.writeFileSync(gen, g);
    console.log("noted in", gen);
  }
}

console.log("done");
