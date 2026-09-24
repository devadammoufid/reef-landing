# Reef — Landing Page

Marketing site for **Reef**, the mineral operations platform (mine → transport → flotation → production → port → sales, in real time).

Built with **Astro** (static SSG). Deployed on Vercel.

## Develop

```bash
npm install
npm run dev        # local dev server
npm run build      # static build → dist/
npm run preview    # preview the build
```

## Product screenshots

The homepage and `/plateforme` show real screens from the demo tenant, not mockups.
They live in `public/shots/*.webp` and are rendered through `src/components/Shot.astro`
(browser chrome + shadow). To refresh them after a UI change:

```bash
npx playwright install chromium && node scripts/capture-shots.mjs
```

The script signs into the public demo (one-click access on `/login`), captures each
module at 1440×900 @2x and writes 1920px-wide WebP (~70–85 KB each). Needs `ffmpeg`
with `libwebp` on PATH.

`public/og.png` is the social preview card (1200×630) and is hand-built — regenerate it
if the hero headline or the dashboard changes materially.

## Links

- App: https://reef.moaj.info
- Demo: https://reef.moaj.info/login (one-click demo access)
- Stack: Astro 7, static output, Inter + Space Grotesk

## Note on the canonical domain

`SITE` in `src/layouts/Layout.astro`, `public/sitemap.xml` and the Plausible
`data-domain` all point at `reef-landing-one.vercel.app`. If the site moves to a
custom domain, all three need updating together — otherwise canonicals, `og:image`
and analytics all point at the wrong host.
