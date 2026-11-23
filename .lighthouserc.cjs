// Lighthouse CI, run by scripts/perf.mjs against the test build. Uses your installed Chrome.
// Local runs are noisy (and WebGL is software-rendered here), so performance is a warning with a generous floor;
// SEO, best practices and accessibility are strict because they don't depend on the machine.

module.exports = {
  ci: {
    collect: {
      staticDistDir: ".test-dist",
      numberOfRuns: 1,
      settings: {
        preset: "desktop",
        // --force-prefers-reduced-motion is what keeps this from hanging: without a GPU the hero shader, grain
        // overlay and marquee repaint on the CPU forever, so the page never goes idle and Lighthouse waits.
        // With it the page settles (the shader draws one still frame). The score therefore reflects load cost,
        // not animation cost.
        chromeFlags:
          "--no-sandbox --disable-extensions --force-prefers-reduced-motion --use-angle=swiftshader --enable-unsafe-swiftshader",
        // Never wait for more than half a minute for the page to load or paint.
        maxWaitForLoad: 30000,
        maxWaitForFcp: 30000,
      },
    },
    assert: {
      assertions: {
        "categories:performance": ["warn", { minScore: 0.8 }],
        "categories:accessibility": ["warn", { minScore: 0.9 }],
        "categories:best-practices": ["error", { minScore: 0.9 }],
        "categories:seo": ["error", { minScore: 0.9 }],
        "total-byte-weight": ["warn", { maxNumericValue: 1_500_000 }],
        "cumulative-layout-shift": ["warn", { maxNumericValue: 0.1 }],
        "errors-in-console": "error",
      },
    },
    upload: { target: "filesystem", outputDir: ".lighthouseci" },
  },
};
