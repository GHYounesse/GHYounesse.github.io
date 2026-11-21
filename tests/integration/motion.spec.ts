import { expect, test } from "@playwright/test";

// The rest of the suite runs with reduced motion (see playwright.config.ts) to stay light. These few tests turn
// motion back on to cover the animated code paths. Keep them short: each one repaints on the CPU in headless Chrome.
test.use({ reducedMotion: "no-preference" });

// Stop the animated page from rendering before the browser context is torn down. Without a GPU the animations keep
// the CPU busy, and closing a busy context can exceed the test timeout.
test.afterEach(async ({ page }) => {
  await page.goto("about:blank");
});

test("the hero intro finishes and every revealed section ends up visible", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".hero h1")).toHaveCSS("opacity", "1");

  await page.locator("#contact").scrollIntoViewIfNeeded();
  await expect(page.locator("#contact")).toHaveCSS("opacity", "1");
});

test("scroll reveals are armed (elements start hidden, then reveal)", async ({ page }) => {
  await page.goto("/");
  // The first timeline entry is far below the fold: hidden until it scrolls into view.
  const entry = page.locator(".timeline-item").first();
  await expect(page.locator("html")).toHaveClass(/\bjs\b/);
  await expect(entry).toHaveCSS("opacity", "0");

  await entry.scrollIntoViewIfNeeded();
  await expect(entry).toHaveCSS("opacity", "1");
});

test("smooth scrolling starts and the hero shader canvas is present", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveClass(/\blenis\b/);
  await expect(page.locator(".hero-canvas")).toHaveCount(1);
});

test("the marquee runs when motion is allowed", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".marquee-track")).toHaveCSS("animation-name", "marquee");
});
