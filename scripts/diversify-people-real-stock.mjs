/**
 * Diversify Meet Our People female portraits with REAL stock photos
 * (Unsplash/Pexels) — European, mature, Black, varied backgrounds.
 * Jasmine + Olivia → European; overall set = young/older + skin tones + backgrounds.
 * Rule: one unique photo per card. Similar professional attire + standing portrait style.
 */
import fs from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";

const V = 93;
const POOL = "public/assets/images/people/real-diverse";
const PREVIEW = "public/assets/images/people/_preview-diverse";
fs.mkdirSync(POOL, { recursive: true });
fs.mkdirSync(PREVIEW, { recursive: true });

async function faceHash(f) {
  const buf = await sharp(f)
    .resize(72, 72, { fit: "cover", position: "attention" })
    .raw()
    .toBuffer();
  return crypto.createHash("md5").update(buf).digest("hex");
}

async function download(url, dest) {
  if (fs.existsSync(dest) && fs.statSync(dest).size > 40000) {
    console.log("keep", path.basename(dest));
    return dest;
  }
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
    },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 30000) throw new Error(`too small ${buf.length}`);
  fs.writeFileSync(dest, buf);
  const m = await sharp(dest).metadata();
  console.log("dl", path.basename(dest), `${m.width}x${m.height}`);
  return dest;
}

async function peopleJpg(src, dest) {
  await sharp(src)
    .resize(720, 900, { fit: "cover", position: "attention" })
    .jpeg({ quality: 90, mozjpeg: true })
    .toFile(dest);
  console.log("wrote", path.basename(dest), "←", path.basename(src));
}

// Real stock — professional standing/portrait, blazer/business attire where possible
const shots = {
  // European young women (for Jasmine / Olivia)
  eu_young_1:
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=85",
  eu_young_2:
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=900&q=85",
  eu_young_3:
    "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=900&q=85",
  // European / mature professional women
  eu_mature_1:
    "https://images.unsplash.com/photo-1573497019940-1cba2e1743b5?auto=format&fit=crop&w=900&q=85",
  eu_mature_2:
    "https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?auto=format&fit=crop&w=900&q=85",
  // Black professional women
  black_1:
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=900&q=85",
  black_2:
    "https://images.unsplash.com/photo-1589156280159-27698a70f29e?auto=format&fit=crop&w=900&q=85",
  black_3:
    "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=900&q=85",
  // Additional diverse professional women
  mix_1:
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=900&q=85",
  mix_2:
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=85",
  mix_3:
    "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=900",
  mix_4:
    "https://images.pexels.com/photos/3756679/pexels-photo-3756679.jpeg?auto=compress&cs=tinysrgb&w=900",
};

const local = {};
for (const [k, url] of Object.entries(shots)) {
  try {
    local[k] = await download(url, path.join(POOL, k + ".jpg"));
    await sharp(local[k])
      .resize(240, 300, { fit: "cover", position: "attention" })
      .jpeg({ quality: 82 })
      .toFile(path.join(PREVIEW, k + ".jpg"));
  } catch (e) {
    console.warn("skip", k, e.message);
  }
}

// Deduplicate by face hash
const unique = {};
const seen = new Set();
for (const [k, p] of Object.entries(local)) {
  const h = await faceHash(p);
  if (seen.has(h)) {
    console.log("dup source drop", k);
    continue;
  }
  seen.add(h);
  unique[k] = p;
}
console.log("unique pool", Object.keys(unique).join(", "));

function take(key) {
  if (!unique[key]) throw new Error("missing " + key);
  const p = unique[key];
  delete unique[key];
  return p;
}
function takeAny(...prefs) {
  for (const k of prefs) if (unique[k]) return take(k);
  const keys = Object.keys(unique);
  if (!keys.length) throw new Error("pool empty");
  return take(keys[0]);
}

// Assignments — diversity + Jasmine/Olivia European
const assign = {
  // Jasmine Lim — European young
  "p5-jasmine.jpg": () => takeAny("eu_young_1", "eu_young_2", "eu_young_3"),
  // Olivia Hart — different European young
  "p12-olivia.jpg": () => takeAny("eu_young_2", "eu_young_3", "eu_young_1"),
  // Other female cards — mature, Black, varied
  "p1.jpg": () => takeAny("eu_mature_1", "eu_mature_2"), // Ana — mature European
  "p3.jpg": () => takeAny("black_1", "black_2", "black_3"), // Isabella — Black professional
  "p7.jpg": () => takeAny("mix_1", "mix_2", "eu_young_3"), // Andrea
  "p9.jpg": () => takeAny("black_2", "black_3", "black_1"), // Patricia — Black, different
  "p14.jpg": () => takeAny("eu_mature_2", "eu_mature_1", "mix_3"), // Emma — mature
};

for (const [name, getter] of Object.entries(assign)) {
  const src = getter();
  const dest = path.join("public/assets/images/people", name);
  await peopleJpg(src, dest);
  // Keep p5.jpg / p12.jpg in sync for any leftover refs
  if (name === "p5-jasmine.jpg") {
    await peopleJpg(src, "public/assets/images/people/p5.jpg");
  }
  if (name === "p12-olivia.jpg") {
    await peopleJpg(src, "public/assets/images/people/p12.jpg");
  }
}

// Audit uniqueness among all people
const byHash = new Map();
for (let i = 1; i <= 15; i++) {
  const candidates = [
    `public/assets/images/people/p${i}.jpg`,
    i === 5 ? "public/assets/images/people/p5-jasmine.jpg" : null,
    i === 12 ? "public/assets/images/people/p12-olivia.jpg" : null,
  ].filter(Boolean);
  // Prefer named file for 5/12
  const f =
    i === 5
      ? "public/assets/images/people/p5-jasmine.jpg"
      : i === 12
        ? "public/assets/images/people/p12-olivia.jpg"
        : `public/assets/images/people/p${i}.jpg`;
  if (!fs.existsSync(f)) continue;
  const h = await faceHash(f);
  if (!byHash.has(h)) byHash.set(h, []);
  byHash.get(h).push(path.basename(f));
}
const dups = [...byHash.values()].filter((a) => a.length > 1);
if (dups.length) {
  console.error("UNIQUE FAIL", dups);
  process.exitCode = 1;
} else {
  console.log("UNIQUE OK", byHash.size, "people faces");
}

let html = fs.readFileSync("public/index.html", "utf8");
html = html.replace(
  /(\/assets\/images\/people\/p\d+(?:-[a-z]+)?\.jpg)(?:\?v=\d+)?/g,
  `$1?v=${V}`
);
fs.writeFileSync("public/index.html", html);
console.log("done v=" + V);
console.log("previews in", PREVIEW);
