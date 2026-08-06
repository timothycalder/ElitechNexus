/**
 * Add 5 real Unsplash portraits of European / US-based professionals
 * to Meet Our People (keeps existing Asian portraits).
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";

const POOL = "public/assets/images/people";
const V = 81;
fs.mkdirSync(POOL, { recursive: true });

async function download(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`fail ${res.status} ${url}`);
  fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
  console.log("dl", path.basename(dest), (fs.statSync(dest).size / 1024).toFixed(0) + "kb");
}

async function portrait(src, dest) {
  await sharp(src)
    .resize(720, 900, { fit: "cover", position: "attention" })
    .jpeg({ quality: 90 })
    .toFile(dest);
  console.log("portrait", path.basename(dest));
}

/** Real Unsplash photos — European / US professional look (not AI) */
const usPeople = [
  {
    file: "p11.jpg",
    url: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=900&q=85",
    quote:
      "Working with US clients from day one felt structured: clear briefs, mentor review, and delivery standards that matched Silicon Valley expectations — not guesswork.",
    name: "Jordan Blake",
    role: "Solutions Architect · US Clients",
  },
  {
    file: "p12.jpg",
    url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=900&q=85",
    quote:
      "I needed a US-ready portfolio and interview pace. Elitechnexus tightened my stories, ran mock rounds on US timezone, and I landed a remote product engineering seat.",
    name: "Olivia Hart",
    role: "Product Engineer · US Remote",
  },
  {
    file: "p13.jpg",
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=900&q=85",
    quote:
      "The mentoring loop mirrors how US teams actually hire — proof in PRs, calm system design answers, and follow-ups that show ownership. That changed my offer rate.",
    name: "Nathan Brooks",
    role: "Staff Engineer · Mentoring",
  },
  {
    file: "p14.jpg",
    url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=900&q=85",
    quote:
      "Side projects became billable US contract work with proposal help and delivery reviews. I kept my full-time search running without dropping client trust.",
    name: "Emma Collins",
    role: "Frontend Engineer · US Contracts",
  },
  {
    file: "p15.jpg",
    url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=900&q=85",
    quote:
      "From resume rewrite to US interview cadence, every step was practical. I stopped sounding generic and started sounding like someone who ships for American teams.",
    name: "Daniel Hayes",
    role: "Full Stack Engineer · Placed US",
  },
];

for (const p of usPeople) {
  const raw = path.join(POOL, "raw-" + p.file);
  await download(p.url, raw);
  await portrait(raw, path.join(POOL, p.file));
}

function cardHtml(p, i) {
  return `
    <article class="elite-people__card" data-idx="${i}">
      <div class="elite-people__card-copy">
        <div class="elite-people__quote-mark" aria-hidden="true">“</div>
        <p class="elite-people__quote">${p.quote}</p>
        <div class="elite-people__person">
          <strong>${p.name}</strong>
          <span>${p.role}</span>
        </div>
      </div>
      <div class="elite-people__card-photo">
        <img src="/assets/images/people/${p.file}?v=${V}" alt="${p.name}" width="360" height="450" loading="lazy">
      </div>
    </article>`;
}

let html = fs.readFileSync("public/index.html", "utf8");

const trackOpen = html.indexOf('id="elite-people-track"');
if (trackOpen < 0) throw new Error("track missing");
const trackStart = html.indexOf(">", trackOpen) + 1;
const trackEnd = html.indexOf("</div>", html.indexOf("elite-people__card", trackStart));
// Find closing of track: after last card, before progress
const progressIdx = html.indexOf('class="elite-people__progress"', trackStart);
if (progressIdx < 0) throw new Error("progress missing");
// Walk back to the track's closing </div>
let closeTrack = html.lastIndexOf("</div>", progressIdx);
// That might be card photo wrapper — find the track close more reliably
const afterCardsMarker = html.indexOf(
  `    </div>\n    <div class="elite-people__progress"`,
  trackStart
);
if (afterCardsMarker < 0) {
  // fallback pattern
  const m = html.indexOf('elite-people__progress', trackStart);
  closeTrack = html.lastIndexOf("</div>", m);
} else {
  closeTrack = afterCardsMarker;
}

const existingCards = html.slice(trackStart, closeTrack);
const startIdx = (existingCards.match(/data-idx="/g) || []).length;

const newCards = usPeople.map((p, i) => cardHtml(p, startIdx + i)).join("\n");

html =
  html.slice(0, closeTrack) +
  "\n" +
  newCards +
  "\n" +
  html.slice(closeTrack);

// Bump cache on existing people imgs in this section
html = html.replace(
  /(\/assets\/images\/people\/p\d+\.jpg)\?v=\d+/g,
  `$1?v=${V}`
);

// Update intro to mention PH + US
html = html.replace(
  /Engineers and mentors across our Philippines network turn skills into stable roles and trusted delivery\. Here’s what some of them say\./,
  "Engineers and mentors across our Philippines HQ and US network turn skills into stable roles and trusted delivery. Here’s what some of them say."
);

fs.writeFileSync("public/index.html", html);
console.log(`added ${usPeople.length} US/European portraits (idx ${startIdx}+)`);
