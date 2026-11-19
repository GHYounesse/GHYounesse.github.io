# Younes Ghalloum — Portfolio

Personal portfolio: about, skills, projects, and contact. Built with [Astro](https://astro.build) as a static site, in English and French, with two switchable visual designs.

**Live site:** https://younesghalloum.dev

## Features

- Four design modes, switched by one value in `src/config.ts`:
  - **cinematic**: WebGL shader hero, smooth scrolling, scroll-driven text, glass project cards with cursor spotlight
  - **editorial**: quiet, typographic, ships no animation libraries
  - **brutalist**: thick borders, hard shadows, stickers, bouncy motion, tilted marquee
  - **terminal**: green CRT shell with scanlines, a boot log, a glitching name and `$` prompt headings
- English (`/`) and French (`/fr/`) pages with `hreflang` links
- Light / dark theme (remembers your choice)
- Respects `prefers-reduced-motion`; content stays visible if scripts fail

## Getting started

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # static output in dist/
npm run preview
```

To change the design, edit `DESIGN` in `src/config.ts` and rebuild, or build one-off with `PUBLIC_DESIGN=terminal npm run build`.

## Deployment

Pushes to `main` build the site in GitHub Actions and rsync `dist/` to the VPS (see `.github/workflows/deploy.yml`). Caddy serves it; an example site block is in `deploy/Caddyfile.example`.

## Contact

- GitHub: [GHYounesse](https://github.com/GHYounesse)
- LinkedIn: [younes-ghalloum](https://www.linkedin.com/in/younes-ghalloum-09888a290)
