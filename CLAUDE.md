# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Personal portfolio for Younes Ghalloum, served at https://younesghalloum.dev from an Ubuntu VPS behind Caddy. It is an Astro static site (no server runtime) with two switchable visual modes and two languages (EN at `/`, FR at `/fr/`).

## Commands

- `npm run dev`: dev server
- `npm run build`: static build to `dist/`
- `npm run preview`: serve `dist/`. On Windows it may bind IPv6 only; use `--host 127.0.0.1`.

There is no linter or test suite.

**Windows gotcha:** run these from a path whose drive letter is uppercase (`C:\...`). From a lowercase `c:\...` cwd, Astro builds the CSS but never injects it into the HTML, so the page renders unstyled. Check with `node -e "console.log(process.cwd())"`. Linux CI is unaffected.

## The design-mode switch

`DESIGN` in [src/config.ts](src/config.ts) is read at build time and takes one of four values. `PUBLIC_DESIGN=<mode> npm run build` overrides it for a one-off build (handy for screenshotting each mode). It sets `data-design` on `<html>` (Base layout), and every mode-specific rule is scoped to `html[data-design="..."]` in that mode's stylesheet in [src/styles/](src/styles/). [global.css](src/styles/global.css) holds the shared structure and the light/dark tokens. All mode stylesheets and fonts are always bundled; only the markup and JS differ.

| Mode | Look | Fonts | Mode-only code |
| --- | --- | --- | --- |
| `cinematic` | dark WebGL hero, glass cards | Bricolage Grotesque | `cinematic.ts`, `hero-shader.ts`, `Marquee`, `<canvas>` |
| `editorial` | quiet, serif headings | Bricolage + Instrument Serif | none |
| `brutalist` | thick borders, hard shadows, bouncy | Archivo Black, Space Grotesk, Space Mono | `Marquee` (styled differently) |
| `terminal` | green CRT, `$` prompts, glitch | IBM Plex Mono, VT323 | `terminal.ts` (boot log) |

Rules to keep the switch working:
- Mode-specific JS must live behind the dynamic imports at the bottom of [src/scripts/ui.ts](src/scripts/ui.ts), keyed on `data-design`. That keeps GSAP, Lenis and OGL (~180 kB) out of the other bundles. Do not import them from shared code.
- Mode-specific markup is conditional in the components on `DESIGN`, not toggled with CSS alone. `Marquee` renders for cinematic and brutalist, so its base CSS is structural only and each mode styles it.
- Content, sections and i18n are identical in all modes. Do not fork content per mode.
- Brutalist tilts use the standalone `rotate`/`translate` CSS properties, not `transform`, because the intro and reveal animations own `transform` (their end state is `transform: none`).
- The cinematic and terminal modes default to the dark theme; the others follow the system (see the inline script in [Base.astro](src/layouts/Base.astro)).

## Architecture

- **Pages**: [src/pages/index.astro](src/pages/index.astro) and [src/pages/fr/index.astro](src/pages/fr/index.astro) both render [Page.astro](src/components/Page.astro) with a different content object. Components take the content object (`c`) as a prop.
- **Content/i18n**: text lives in [src/content/en.ts](src/content/en.ts) and [fr.ts](src/content/fr.ts), typed by [types.ts](src/content/types.ts). Add a field to the type first so both languages fail to compile until they have it. Language-independent data (skill lists, project links/images/stacks, timeline periods) is in [shared.ts](src/content/shared.ts), and projects and skills are matched to their translated text by `id`. Timeline items are matched to `timelinePeriods` by index.
- **Theme (light/dark)**: an inline script in [Base.astro](src/layouts/Base.astro) sets `data-theme` and the `js` class before first paint (saved choice, else dark for cinematic, else system). The toggle is in `ui.ts`. Colours are CSS custom properties; use tokens, not literals.
- **Motion without JS dependence**: the hero intro (`[data-intro]`) and scroll reveals (`[data-reveal]`, toggled by an IntersectionObserver in `ui.ts`) are CSS transitions gated on `html.js` and `prefers-reduced-motion`, so content is never hidden if a script fails. Keep it that way for new animations.
- **Cinematic hero**: [hero-shader.ts](src/scripts/hero-shader.ts) draws a full-screen OGL fragment shader into `.hero-canvas`. It pauses when offscreen or the tab is hidden, renders one still frame under reduced motion, and falls back to the CSS gradient on `.hero` if WebGL is unavailable. Shader palettes are hard-coded per theme in that file, not read from CSS.
- **Projects without a screenshot**: `image` is optional in `projectMeta` ([shared.ts](src/content/shared.ts)); when absent, `Sections.astro` renders a `.mockup-ph` tile (initial + top stack items). To add one, drop the image in `src/assets/`, import it in `shared.ts` and set `image`. Several projects' `href` still point at the GitHub profile (see the TODO in `shared.ts`) until their repo URLs are added.
- **Content source**: skills, projects and the timeline mirror the two CVs (PHP/React and Java/Angular). A new skill group needs an id in `skillGroups`, a label in both language files, and an icon in `Sections.astro`; the `languages` group takes its items from the language files.
- **Images**: sources are in `src/assets/` and go through `astro:assets` (`<Image>`), which emits resized WebP. Only `public/logo.png` (favicon) is served as-is. `og.png` is referenced in the Base layout's meta tags but does not exist yet.
- **Contact form**: posts via `fetch` to the Formspree endpoint in `SITE.formEndpoint` ([config.ts](src/config.ts)); status strings come from the per-language `data-*` attributes on the form.

## Deployment

Push to `main` runs [.github/workflows/deploy.yml](.github/workflows/deploy.yml): `npm ci`, build, then `rsync --delete dist/` to `/var/www/younesghalloum.dev/` on the VPS. It needs the repo secrets `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`. The VPS hosts other projects too, so Caddy has one site block per domain; [deploy/Caddyfile.example](deploy/Caddyfile.example) is the block for this site (long-cache for `/_astro/*`, `no-cache` for HTML, www redirect).
