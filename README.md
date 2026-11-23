# Younes Ghalloum — Portfolio

Personal portfolio: about, skills, projects, and contact. Built with [Astro](https://astro.build) as a static site, in English and French.

**Live site:** https://younesghalloum.dev

## Features

- Dark-first design with a WebGL shader hero, smooth scrolling, scroll-driven text, a stack marquee and glass project cards with a cursor spotlight
- English (`/`) and French (`/fr/`) pages with `hreflang` links
- Light / dark theme (remembers your choice)
- Respects `prefers-reduced-motion`; content stays visible if scripts fail
- The animation code is loaded after the page is idle, so it doesn't block first paint

## Getting started

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # static output in dist/
npm run preview
```

### Checks

```bash
npm run verify:fast     # lint + type check + unit tests (seconds)
npm run verify          # + test build, HTML validation, Playwright, Lighthouse, security
npm run dev:mock        # dev server with a local mock of the contact-form endpoint
```

## Deployment

Pushes to `main` build the site in GitHub Actions and rsync `dist/` to the VPS (see `.github/workflows/deploy.yml`). Caddy serves it; an example site block is in `deploy/Caddyfile.example`.

## Contact

- Email: simplelogin-newsletter.festivity961@simplelogin.com
- GitHub: [GHYounesse](https://github.com/GHYounesse)
- LinkedIn: [younes-ghalloum](https://www.linkedin.com/in/younes-ghalloum-09888a290)
