# Elitechnexus Site

Local static site for Elitechnexus (Philippines).

## Run

```bash
npm install
npm run dev
```

Open [http://localhost:3010](http://localhost:3010).

The server binds to `0.0.0.0:3010`, so other devices on your LAN can use `http://<your-ip>:3010`.

## Pages included

- `/` Home
- `/enterprise`
- `/pricing`
- `/customers`
- Case studies: `/customers/nubank`, `/bilt`, `/gumroad`, `/ramp`, `/linktree`, `/crossmint`

## 3D visual (from DDD)

Particle 3D scene from [Digital Design Days 2024](https://1105-ddd2024-homepage.lusion.co/) is embedded on the homepage (same URL — no separate port).

Re-download 3D assets:

```bash
npm run mirror:3d
node scripts/embed-visual-3d.mjs
```

## Notes

- Branded as Elitechnexus · based in Philippines. Contact: steven.miller@elitechnexus.com · +1 (339) 365-7217.
- Display fonts load from Adobe Typekit (`use.typekit.net`) — needs network for full typography.
- Some embeds (e.g. Vimeo) may still load from external hosts.
- Layout based on the archived Lusion Devin marketing design; content rebranded to Elitechnexus.
