# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Personal portfolio for Younes Ghalloum, served at https://younesghalloum.dev from an Ubuntu VPS behind Caddy. It is an Astro static site (no server runtime) with one visual design (dark-first, WebGL hero) and two languages (EN at `/`, FR at `/fr/`).

## Commands

- `npm run dev`: dev server. `npm run dev:mock` is the same with the contact form pointed at the local mock Formspree service (type `__fail__`, `__slow__` or `__invalid__` in the message to hit the error/pending paths).
- `npm run build`: static build to `dist/`. `npm run preview`: serve it.

**Windows gotcha:** Astro and Vitest misbehave when the shell's cwd has a lowercase drive letter (`c:\...`): the build emits CSS but never links it, and Vitest fails with "Cannot read properties of undefined (reading 'config')". Every npm script therefore goes through `scripts/astro.mjs` / `scripts/tool.mjs`, which normalise the cwd first. Keep new tool invocations behind `scripts/tool.mjs` instead of calling `eslint`, `vitest`, etc. directly.

## Local feedback loop

`npm run verify:fast` (lint, types, unit; seconds) while working, `npm run verify` before pushing. `verify` prints a per-stage summary; the heavy stages (test build, Playwright, Lighthouse) run at below-normal OS priority. Tests that read a build need `npm run build:test` first (it writes `.test-dist/`, pointed at the mock Formspree endpoint via `PUBLIC_FORM_ENDPOINT`).

| Stage | Command | What it covers |
| --- | --- | --- |
| Lint | `npm run lint` | ESLint (TS, Astro, a11y), Stylelint, Prettier (`.ts/.mjs/.json/.yml` only) |
| Types | `npm run typecheck` | `astro check` |
| Unit | `npm test` / `npm run test:watch` | Vitest in `tests/unit`: EN/FR content parity, config/env parsing, shader palette, `ui.ts` behaviour in happy-dom (the cinematic module is stubbed there) |
| HTML | `npm run lint:html` | html-validate on both built pages |
| Integration | `npm run test:integration [-- --workers=2]` | Playwright in `tests/integration` against `.test-dist` and the mock service. Runs with `prefers-reduced-motion` on (headless Chrome paints WebGL/CSS animation on the CPU and lags laptops); `motion.spec.ts` turns motion back on for the animated paths, and `PW_MOTION=1` enables it everywhere. 1 worker by default |
| Performance | `npm run test:perf [-- --budgets]` | gzip/image budgets in `tests/perf` (budgets sit ~25% above measured values), then Lighthouse (`.lighthouserc.cjs`; forced reduced motion, 5 min hard timeout) |
| Security | `npm run test:security` | `npm audit`, secretlint on tracked and uncommitted files, `tests/security` checks on the built HTML/JS, Caddyfile and deploy workflow |

Mock services live in `mocks/`: `formspree-server.mjs` (the contact endpoint) and `static-server.mjs` (serves the test build for Playwright). Tests that post to the mock tag each submission with a unique token and must not clear shared state. Hooks are opt-in: `npm run hooks:install` (pre-commit lint-staged, pre-push `verify:fast`).

Known gaps: the Bricolage font-face CSS carries long unicode-range lists for subsets (latin-ext, vietnamese) that EN/FR never use; no CSP header yet; Lighthouse performance sits just under its 0.8 warning threshold because of ~0.5 s of blocking time from the animation chunk.

## The design

[global.css](src/styles/global.css) holds the structure and tokens; [cinematic.css](src/styles/cinematic.css) is the look (dark-first, WebGL hero, glass cards, grain, big type) and `@import`s its own `@fontsource` files (Bricolage Grotesque variable, JetBrains Mono). Both are imported by [Base.astro](src/layouts/Base.astro). Every rule in `cinematic.css` is scoped to `html[data-design="cinematic"]`, an attribute that is fixed in the Base layout. Those scopes are a leftover from when the site had four switchable designs; they are harmless but redundant. Flattening them changes CSS specificity (the cinematic rules rely on beating `global.css`), so do it only with before/after screenshots.

The other three designs (editorial, brutalist, terminal) and the switch were removed on purpose. The designs' stylesheets and the terminal script are in git history on the `astro-redesign` branch (`git log --all -- src/styles/terminal.css`). The mode switch itself was never committed. If designs ever come back, remember how to ship only one: Astro attaches CSS from the import graph, so a runtime `if` around the imports still ships every stylesheet; instead point a bare import (e.g. `design-styles`) at the chosen file with `vite.resolve.alias` in `astro.config.mjs`, and give each stylesheet its own font `@import`s.

- A rule needed by more than one component goes in `global.css`; look-and-feel goes in `cinematic.css`. A new font is an `@import` at the top of `cinematic.css` and must be added to `ALLOWED_FONT_FAMILIES` in `tests/perf/bundle.perf.test.ts` (and the font test in `tests/integration/smoke.spec.ts`), so stray fonts cannot add weight silently.
- GSAP, Lenis and OGL (~180 kB) live only in [cinematic.ts](src/scripts/cinematic.ts), which [ui.ts](src/scripts/ui.ts) loads with a dynamic `import()` once the page has loaded and the browser is idle. Never import them from `ui.ts` or from components: that would put them back in the entry script (the perf tests fail if so).
- The shader canvas fades in (`.hero-canvas.ready`) because it starts after load; the CSS gradient on `.hero` is what shows first and what stays if WebGL is unavailable.

## Architecture

- **Pages**: [src/pages/index.astro](src/pages/index.astro) and [src/pages/fr/index.astro](src/pages/fr/index.astro) both render [Page.astro](src/components/Page.astro) with a different content object. Components take the content object (`c`) as a prop.
- **Content/i18n**: text lives in [src/content/en.ts](src/content/en.ts) and [fr.ts](src/content/fr.ts), typed by [types.ts](src/content/types.ts). Add a field to the type first so both languages fail to compile until they have it. Language-independent data (skill lists, project links/images/stacks, timeline periods) is in [shared.ts](src/content/shared.ts), and projects and skills are matched to their translated text by `id`. Timeline items are matched to `timelinePeriods` by index.
- **Theme (light/dark)**: an inline script in [Base.astro](src/layouts/Base.astro) sets `data-theme` and the `js` class before first paint (saved choice, else dark: the design is dark-first regardless of the system setting). The toggle is in `ui.ts`. Colours are CSS custom properties; use tokens, not literals.
- **Motion without JS dependence**: the hero intro (`[data-intro]`) and scroll reveals (`[data-reveal]`, toggled by an IntersectionObserver in `ui.ts`) are CSS transitions gated on `html.js` and `prefers-reduced-motion`, so content is never hidden if a script fails. Keep it that way for new animations.
- **Cinematic hero**: [hero-shader.ts](src/scripts/hero-shader.ts) draws a full-screen OGL fragment shader into `.hero-canvas`. It pauses when offscreen or the tab is hidden, renders one still frame under reduced motion, and falls back to the CSS gradient on `.hero` if WebGL is unavailable. Shader palettes (`shader-palette.ts`) are hard-coded per theme, not read from CSS.
- **Projects without a screenshot**: `image` is optional in `projectMeta` ([shared.ts](src/content/shared.ts)); when absent, `Sections.astro` renders a `.mockup-ph` tile (initial + top stack items). To add one, drop the image in `src/assets/`, import it in `shared.ts` and set `image`.
- **Content source**: skills, projects and the timeline mirror the two CVs (PHP/React and Java/Angular). A new skill group needs an id in `skillGroups`, a label in both language files, and an icon in `Sections.astro`; the `languages` group takes its items from the language files.
- **Images**: sources are in `src/assets/` and go through `astro:assets` (`<Image>`), which emits resized WebP. Only `public/logo.png` (favicon) is served as-is. `og.png` is referenced in the Base layout's meta tags but does not exist yet.
- **Contact form**: posts via `fetch` to the Formspree endpoint in `SITE.formEndpoint` ([config.ts](src/config.ts)); status strings come from the per-language `data-*` attributes on the form.

## Deployment

Push to `main` runs [.github/workflows/deploy.yml](.github/workflows/deploy.yml): `npm ci`, build, then `rsync --delete dist/` to `/var/www/younesghalloum.dev/` on the VPS. It needs the repo secrets `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`. The VPS hosts other projects too, so Caddy has one site block per domain; [deploy/Caddyfile.example](deploy/Caddyfile.example) is the block for this site (long-cache for `/_astro/*`, `no-cache` for HTML, www redirect).
