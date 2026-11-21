import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { bytes, filesOf, gzipBytes, gzipFile, readHtml, resolveAsset } from "../helpers/dist";

// Budgets are in kilobytes (gzip for text), set ~20-30% above what was measured, so a real regression such as a
// heavy new dependency or an unoptimised image fails the build while normal edits don't.
// Measured on 2026-11-21: html 6.0, css 19.0, entry js 1.6, cinematic chunk 62.4, largest image 52,
// images per page 332.
const KB = 1024;
const BUDGET = {
  htmlGzip: 8 * KB,
  // Includes the @font-face declarations of the two font families, whose long unicode-range lists dominate.
  cssGzip: 24 * KB,
  entryJsGzip: 3 * KB, // JS that every visitor downloads straight away
  cinematicChunkGzip: 80 * KB, // GSAP + Lenis + OGL, loaded after the page is idle
  singleImage: 80 * KB,
  imagesPerPage: 450 * KB, // every optimised image referenced by the page, all sizes of the srcset included
};

const attrs = (html: string, re: RegExp) => [...html.matchAll(re)].map((m) => m[1]);

function entryScripts(html: string) {
  return [
    ...attrs(html, /<script[^>]+type="module"[^>]+src="([^"]+)"/g),
    ...attrs(html, /<link[^>]+rel="modulepreload"[^>]+href="([^"]+)"/g),
  ];
}

const html = readHtml();

describe("build size", () => {
  it("keeps the HTML small", () => {
    expect(gzipBytes(html)).toBeLessThanOrEqual(BUDGET.htmlGzip);
  });

  it("keeps the stylesheet within budget", () => {
    const hrefs = attrs(html, /<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/g);
    const total = hrefs.reduce((sum, href) => sum + gzipFile(resolveAsset(href)), 0);
    const inline = attrs(html, /<style[^>]*>([\s\S]*?)<\/style>/g).reduce((sum, css) => sum + gzipBytes(css), 0);
    expect(total + inline).toBeLessThanOrEqual(BUDGET.cssGzip);
  });

  it("downloads only a tiny script up front", () => {
    const scripts = entryScripts(html);
    expect(scripts.length).toBeGreaterThan(0);
    const total = scripts.reduce((sum, src) => sum + gzipFile(resolveAsset(src)), 0);
    expect(total).toBeLessThanOrEqual(BUDGET.entryJsGzip);
  });

  it("serves optimised images within budget", () => {
    const urls = new Set([
      ...attrs(html, /<img[^>]+src="([^"]+)"/g),
      ...attrs(html, /srcset="([^"]+)"/g).flatMap((set) => set.split(",").map((part) => part.trim().split(/\s+/)[0])),
    ]);
    const local = [...urls].filter((url) => url.startsWith("/"));
    expect(local.length).toBeGreaterThan(0);

    let total = 0;
    for (const url of local) {
      const size = bytes(resolveAsset(url));
      expect(size, url).toBeLessThanOrEqual(BUDGET.singleImage);
      total += size;
    }
    expect(total).toBeLessThanOrEqual(BUDGET.imagesPerPage);
  });
});

describe("JavaScript loading", () => {
  const SIGNATURES = [/ScrollTrigger/, /lenis/i, /gsap/i, /precision highp float/];

  // What a visitor downloads straight away must be free of the heavy libraries; they arrive in a lazy chunk once
  // the page is idle (see afterLoadWhenIdle in src/scripts/ui.ts).
  it("keeps GSAP, Lenis and the shader out of the entry script", () => {
    for (const src of entryScripts(html)) {
      const file = resolveAsset(src);
      const code = readFileSync(file, "utf8");
      for (const signature of SIGNATURES) expect(code, `${file} matches ${signature}`).not.toMatch(signature);
    }
  });

  it("puts GSAP/Lenis/OGL in one lazy chunk within budget", () => {
    const chunk = filesOf(".js").find((file) => /cinematic\.[\w-]+\.js$/.test(file));
    expect(chunk, "cinematic chunk").toBeDefined();
    expect(gzipFile(chunk!)).toBeLessThanOrEqual(BUDGET.cinematicChunkGzip);
  });
});

describe("styles and fonts", () => {
  // The only families the design uses. A new font must be added here on purpose, so a stray import (or a leftover
  // package) cannot quietly add weight to every visit.
  const ALLOWED_FONT_FAMILIES = ["bricolage-grotesque", "jetbrains-mono"];

  it("ships only the fonts the design uses", () => {
    const fonts = filesOf(".woff2").concat(filesOf(".woff"));
    expect(fonts.length).toBeGreaterThan(0);
    for (const file of fonts) {
      const name = path.basename(file);
      expect(
        ALLOWED_FONT_FAMILIES.some((family) => name.startsWith(family)),
        `${name} is not one of ${ALLOWED_FONT_FAMILIES.join(", ")}`,
      ).toBe(true);
    }
  });

  it("includes the marquee structure rules", () => {
    const css = attrs(html, /<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/g)
      .map((href) => readFileSync(resolveAsset(href), "utf8"))
      .join("\n");
    expect(css).toMatch(/\.marquee-track\{[^}]*animation:[^}]*marquee/);
  });
});
